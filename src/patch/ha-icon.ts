import { ModdedElement } from "../helpers/apply_card_mod";
import { patch_element } from "../helpers/patch_function";
import { CardMod } from "../card-mod";
import { icon_vars_in_use } from "../helpers/icon_usage";

// Icons honour --card-mod-icon, --card-mod-icon-color and --card-mod-icon-dim; work is skipped until a style uses them.
const skipped: Set<any> = new Set();

document.addEventListener("cm_icons_enabled", () => {
  const pending = [...skipped];
  skipped.clear();
  for (const el of pending) {
    if (!el.isConnected) continue;
    el.cm_retries = 0;
    bindCardMod(el);
  }
});

const maybeBind = (el) => {
  if (!icon_vars_in_use()) {
    skipped.add(el);
    return;
  }
  el.cm_retries = 0;
  bindCardMod(el);
};

const updateIcon = (el) => {
  if (!el.isConnected) return;
  const styles = window.getComputedStyle(el);

  const icon = styles.getPropertyValue("--card-mod-icon");
  if (icon) el.icon = icon.trim();

  const color = styles.getPropertyValue("--card-mod-icon-color");
  if (color) el.style.color = color;

  const filter = styles.getPropertyValue("--card-mod-icon-dim");
  if (filter === "none") el.style.filter = "none";
};

const bindCardMod = async (el) => {
  if (!el.isConnected) return;
  if (el._bindCardModPending) return;
  el._bindCardModPending = true;
  try {
    updateIcon(el);
    el._boundCardMod = el._boundCardMod ?? new Set();
    const newCardMods = await findParentCardMod(el);

    for (const cm of newCardMods) {
      if (el._boundCardMod.has(cm)) continue;

      cm.addEventListener("card-mod-update", async () => {
        if (el._updateIconPending) return;
        el._updateIconPending = true;
        try {
          await cm.updateComplete;
          updateIcon(el);
        } finally {
          el._updateIconPending = false;
        }
      });
      el._boundCardMod.add(cm);
    }
  } finally {
    el._bindCardModPending = false;
  }

  if (el.isConnected && el.cm_retries < 5) {
    el.cm_retries++;
    window.setTimeout(() => bindCardMod(el), 250 * el.cm_retries);
  }
};

@patch_element("ha-state-icon")
class HaStateIconPatch extends ModdedElement {
  cm_retries = 0;
  updated(_orig, ...args) {
    _orig?.(...args);
    maybeBind(this);
  }
}

@patch_element("ha-icon")
class HaIconPatch extends ModdedElement {
  cm_retries = 0;
  updated(_orig, ...args) {
    _orig?.(...args);
    maybeBind(this);
  }
}

@patch_element("ha-svg-icon")
class HaSvgIconPatch extends ModdedElement {
  cm_retries = 0;
  updated(_orig, ...args) {
    _orig?.(...args);
    if ((this.parentNode as any)?.host?.localName === "ha-icon") return;
    maybeBind(this);
  }
}

function joinSet(dst: Set<any>, src: Set<any>) {
  for (const s of src) dst.add(s);
}

async function findParentCardMod(node: any, step = 0): Promise<Set<CardMod>> {
  const cardMods: Set<CardMod> = new Set();
  if (step == 10) return cardMods;
  if (!node) return cardMods;

  if (node.updateComplete) await node.updateComplete;

  if (node._cardMod) {
    for (const cm of node._cardMod) {
      if (cm.styles) cardMods.add(cm);
    }
  }

  if (node.parentElement)
    joinSet(cardMods, await findParentCardMod(node.parentElement, step + 1));
  else if (node.parentNode)
    joinSet(cardMods, await findParentCardMod(node.parentNode, step + 1));
  if ((node as any).host)
    joinSet(cardMods, await findParentCardMod((node as any).host, step + 1));
  return cardMods;
}
