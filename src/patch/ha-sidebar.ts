import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_card_mod } from "../helpers/apply_card_mod";
import { selectTree } from "../helpers/selecttree";

// Theme-only styling.
// ha-sidebar may have been used before the patch was applied
const apply = () => {
  selectTree(
    document,
    "home-assistant$home-assistant-main$ha-sidebar",
    false,
  ).then((root) => root?.firstUpdated());
};

@patch_element("ha-sidebar", apply)
class SidebarPatch extends ModdedElement {
  firstUpdated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(this, "sidebar");
  }
}
