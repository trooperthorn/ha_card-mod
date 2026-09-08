import { patch_object, patch_element } from "../helpers/patch_function";
import { apply_card_mod } from "../helpers/apply_card_mod";
import { await_element } from "../helpers/selecttree";
import { ModdedElement } from "../helpers/apply_card_mod";

// Rows are styled individually; the row element is values[1] of the _renderEntity template.
@patch_element("hui-entities-card")
class HuiEntitiesCardPatch extends ModdedElement {
  _renderEntity(_orig, config, ...rest) {
    const retval = _orig?.(config, ...rest);
    if (config?.type === "custom:mod-card") return retval;

    if (!retval?.values) return retval;
    const row = retval.values[1];
    if (!(row instanceof Element)) return retval;
    const rowEl = row as ModdedElement;

    const cls = config?.type
      ? `type-${config.type.replace?.(":", "-")}`
      : "type-entity";
    const apply = async () => {
      await await_element(row);
      patch_object(row, ModdedElement);
      apply_card_mod(rowEl, "row", config?.card_mod, { config }, true, cls);
      row.addEventListener("ll-rebuild", apply);
    };

    Promise.all([this.updateComplete]).then(() => apply());

    return retval;
  }
}

// Conditional rows create their inner row dynamically.
@patch_element("hui-conditional-row")
class HuiConditionalRowPatch extends ModdedElement {
  _element;

  setConfig(_orig, config, ...args) {
    _orig?.(config, ...args);
    const row = this._element;
    if (!row) return;
    if (!config?.row || config?.row?.type === "custom:mod-card") return;

    const cls = config?.row?.type
      ? `type-${config.row.type.replace?.(":", "-")}`
      : "type-entity";
    const apply = async () => {
      await await_element(row);
      patch_object(row, ModdedElement);
      apply_card_mod(
        row,
        "row",
        config.row.card_mod,
        { config: config.row },
        true,
        cls,
      );
      row.addEventListener("ll-rebuild", apply);
    };

    Promise.all([this.updateComplete]).then(() => apply());
  }
}
