import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_card_mod } from "../helpers/apply_card_mod";

// Theme-only styling; prepended because the router replaces the last child.
@patch_element("ha-panel-config")
class HaConfigPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(this, "config", { prepend: true });
  }
}

@patch_element("ha-panel-custom")
class HaPanelCustomPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(this, "panel-custom", { prepend: true });
  }
}

// The config panel background comes from this element.
@patch_element("ha-top-app-bar-fixed")
class HaTopAppBarFixedPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(this, "top-app-bar-fixed");
  }
}
