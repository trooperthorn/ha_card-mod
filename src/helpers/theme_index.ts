import { note_theme_keys } from "./icon_usage";
import { theme_key_names } from "./theme_keys";

// Set of card-mod-* keys declared by any theme; null until hass is reachable, which means "may style".
let themeKeys: Set<string> | null = null;

const collect = (themes: object): Set<string> => {
  const keys = new Set<string>();
  for (const theme of Object.values(themes ?? {})) {
    for (const key of Object.keys(theme ?? {})) {
      if (key.startsWith("card-mod-")) keys.add(key);
    }
  }
  return keys;
};

const themes_from_dom = () => {
  const el: any =
    document.querySelector("home-assistant") ??
    document.querySelector("hc-main");
  return el?.hass?.themes?.themes;
};

export const refresh_theme_index = () => {
  const themes = themes_from_dom();
  themeKeys = themes ? collect(themes) : null;
  if (themeKeys) note_theme_keys(themeKeys);
};

document.addEventListener("cm_update", refresh_theme_index);

export const theme_may_style = (type: string): boolean => {
  if (themeKeys === null) refresh_theme_index();
  if (themeKeys === null) return true;
  for (const name of theme_key_names(type)) {
    if (
      themeKeys.has(`card-mod-${name}`) ||
      themeKeys.has(`card-mod-${name}-yaml`) ||
      themeKeys.has(`card-mod-${name}-debug`)
    )
      return true;
  }
  return false;
};
