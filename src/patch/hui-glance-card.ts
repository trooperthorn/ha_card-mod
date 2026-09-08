import { ModdedElement, apply_card_mod } from "../helpers/apply_card_mod";
import { patch_element, patch_object } from "../helpers/patch_function";

// Each glance entity gets its own shadow root so it can be styled like an entities row.
// Copied from frontend 20260826.6 src/panels/lovelace/cards/hui-glance-card.ts (.entity div, .name, state-badge rules).
const ENTITY_STYLES = `
div {
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.name {
  min-height: var(--ha-line-height-normal);
}
state-badge {
  margin: 8px 0;
}
`;

@patch_element("hui-glance-card")
class HuiGlanceCardPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);

    for (const el of this.shadowRoot!.querySelectorAll("ha-card div.entity")) {
      patch_object(el, ModdedElement);

      const root = el.shadowRoot ?? el.attachShadow({ mode: "open" });
      while (el.firstChild) root.append(el.firstChild);

      const styleTag =
        el.querySelector("style[card-mod]") ?? document.createElement("style");
      styleTag.setAttribute("card-mod", "");
      styleTag.innerHTML = ENTITY_STYLES;
      root.append(styleTag);

      const config = el["config"] ?? el["entityConfig"];
      apply_card_mod(el as any, "glance", config?.card_mod, { config });
    }
  }
}
