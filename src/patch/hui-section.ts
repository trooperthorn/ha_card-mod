import { patch_element } from "../helpers/patch_function";
import { apply_card_mod } from "../helpers/apply_card_mod";
import { ModdedElement } from "../helpers/apply_card_mod";

// hui-section sets this._config before the first update.
@patch_element("hui-grid-section")
class HuiGridSectionPatch extends ModdedElement {
  _config;
  firstUpdated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(
      this,
      "grid-section",
      this._config.card_mod,
      { config: this._config },
      true,
      "type-grid-section",
    );
  }
}

// Strategy sections may declare card_mod per card type; it is merged into each generated card config.
@patch_element("hui-section")
class HuiSectionPatch extends ModdedElement {
  async _createCards(_orig, ...args) {
    const strategyConfig = (this as LovelaceSection).config?.strategy;
    const dynamicConfig: LovelaceSectionConfig = { ...args[0] };
    if (strategyConfig?.card_mod && Array.isArray(dynamicConfig.cards)) {
      const cards = dynamicConfig.cards;
      cards.forEach((card, idx) => {
        if (card.type && card.type in strategyConfig.card_mod) {
          strategyConfig.card_mod.debug &&
            console.log(
              "CardMod Debug: adding card-mod to card",
              card,
              "with",
              strategyConfig.card_mod[card.type],
            );
          cards[idx] = {
            ...card,
            card_mod: strategyConfig.card_mod[card.type],
          };
        }
      });
    }
    _orig?.(dynamicConfig);
  }
}

interface LovelaceSection extends Node {
  config?: LovelaceSectionConfig;
}

interface LovelaceCardConfig {
  type?: string;
  card_mod?: { [key: string]: any };
}

interface LovelaceSectionConfig {
  strategy?: { [key: string]: any };
  type?: string;
  cards?: LovelaceCardConfig[];
  card_mod?: { [key: string]: any };
}
