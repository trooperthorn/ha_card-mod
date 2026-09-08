import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_card_mod } from "../helpers/apply_card_mod";
import { selectTree } from "../helpers/selecttree";

// Theme-only styling.
// hui-root may have been used before the patch was applied
const apply = () => {
  selectTree(
    document,
    "home-assistant$home-assistant-main$partial-panel-resolver ha-panel-lovelace$hui-root",
    false,
  ).then((root) => root?.firstUpdated());
};

@patch_element("hui-root", apply)
class HuiRootPatch extends ModdedElement {
  firstUpdated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(this, "root");
  }
}
