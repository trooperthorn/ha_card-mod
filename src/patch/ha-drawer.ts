import { ModdedElement, apply_card_mod } from "../helpers/apply_card_mod";
import { patch_element } from "../helpers/patch_function";

// Theme-only styling.
@patch_element("ha-drawer")
class HaDrawerPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(this, "drawer", undefined, {}, true);
  }
}
