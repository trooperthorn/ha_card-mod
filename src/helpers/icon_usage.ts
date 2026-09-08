// One boolean, set when a processed style mentions --card-mod-icon, so icon patches can skip getComputedStyle.
const ICON_VAR = "--card-mod-icon";

let in_use = false;

export const icon_vars_in_use = () => in_use;

const enable = () => {
  if (in_use) return;
  in_use = true;
  document.dispatchEvent(new Event("cm_icons_enabled"));
};

export const note_styles = (styles: unknown) => {
  if (in_use || styles === undefined || styles === null) return;
  try {
    if (JSON.stringify(styles)?.includes(ICON_VAR)) enable();
  } catch (e) {
    enable();
  }
};

export const note_theme_keys = (keys: Iterable<string>) => {
  if (in_use) return;
  for (const key of keys) {
    if (key.startsWith("card-mod-icon")) return enable();
  }
};
