import { patch_element } from "../helpers/patch_function";
import { apply_card_mod } from "../helpers/apply_card_mod";
import { ModdedElement } from "../helpers/apply_card_mod";

@patch_element("ha-assist-chip")
class HaAssistChipPatch extends ModdedElement {
  config;

  async firstUpdated(_orig, ...args) {
    await _orig?.(...args);

    await apply_card_mod(
      this,
      "assist-chip",
      this.config?.card_mod,
      { config: this.config },
      true,
      "type-assist-chip",
    );
  }
}
