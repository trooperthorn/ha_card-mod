import { hass } from "./hass";
import { yaml2json } from "./yaml2json";
import type { CardMod } from "../card-mod";
import type { CardModStyle } from "./apply_card_mod";
import { themesReady } from "../theme-watcher";
import { nextAnimationFrame } from "./raf";
import { theme_key_names } from "./theme_keys";

export { THEME_TYPE_ALIASES, theme_key_names } from "./theme_keys";

function cssValueIsTrue(v: string): boolean {
  if (!v) return false;
  const t = v.trim().toLowerCase();
  return t === "true" || t === "1" || t === "yes" || t === "on";
}

// One theme lookup per card-mod element at a time; concurrent callers share the promise.
const _themeInFlight = new WeakMap<CardMod, Promise<CardModStyle>>();

export function theme_styles_for_type(
  theme: Record<string, any> | undefined,
  type: string,
): CardModStyle {
  if (!theme) return {};
  const names = theme_key_names(type);
  for (const name of names) {
    const key = `card-mod-${name}-yaml`;
    if (theme[key]) return yaml2json(key, theme[key]);
  }
  for (const name of names) {
    const key = `card-mod-${name}`;
    if (theme[key]) return { ".": theme[key] };
  }
  return {};
}

// A theme may name another theme in its card-mod-theme key; the keys are read from that theme.
export function resolve_theme_name(
  themes: Record<string, any>,
  theme: string,
): string {
  const target = themes[theme]?.["card-mod-theme"];
  if (typeof target === "string" && target.trim() && themes[target.trim()]) {
    return target.trim();
  }
  return theme;
}

export async function get_theme(root: CardMod): Promise<CardModStyle> {
  if (!root.type) return {};

  const pending = _themeInFlight.get(root);
  if (pending) return pending;

  const promise = (async (): Promise<CardModStyle> => {
    try {
      await themesReady();
      await nextAnimationFrame();

      const el = root.parentElement ? root.parentElement : root;
      const cs = window.getComputedStyle(el);
      const theme = cs.getPropertyValue("--card-mod-theme").trim();

      let debug = false;

      const typeDebug = cs.getPropertyValue(`--card-mod-${root.type}-debug`);
      if (cssValueIsTrue(typeDebug)) debug = true;

      for (const cls of root.classes) {
        const debugVar = cs.getPropertyValue(
          `--card-mod-${root.type}-${cls}-debug`,
        );
        if (cssValueIsTrue(debugVar)) {
          debug = true;
          break;
        }
      }

      root.debug ||= !!debug;

      root.debug && console.log("CardMod Debug: Theme:", theme);

      const hs = await hass();
      if (!hs) return {};
      const themes = hs?.themes?.themes ?? {};
      if (!themes[theme]) return {};

      const effective = resolve_theme_name(themes, theme);
      root.debug &&
        effective !== theme &&
        console.log("CardMod Debug: card-mod-theme resolves to:", effective);

      return theme_styles_for_type(themes[effective], root.type);
    } finally {
      _themeInFlight.delete(root);
    }
  })();

  _themeInFlight.set(root, promise);
  return promise;
}
