# Design

## What card-mod is

card-mod is a single ES module loaded by the Home Assistant frontend, either as a dashboard resource or through `frontend: extra_module_url`. It defines one custom element, `<card-mod>`, which renders a `<style>` tag, and it patches a fixed list of frontend elements so that a `<card-mod>` element is inserted into each of them with the right type. Everything else (templates, DOM navigation, class handling, theme lookup) serves that one mechanism.

## The patch mechanism

`src/helpers/patch_function.ts` exports `patch_element(tag, afterwards?)`, a class decorator. It waits for `customElements.whenDefined(tag)`, then copies every method of the decorated class onto the prototype of the frontend element. Each copied method receives the original as its first argument (`_orig`) and calls it itself, so the patch wraps rather than replaces. Prototype descriptors are copied directly, which is why `tsconfig.json` keeps `experimentalDecorators: true` and `useDefineForClassFields: false`: with define semantics the fields would land on instances instead of the prototype and the copy would miss them.

The patch state lives on `window.cardMod_patch_state`, keyed by element tag, with the card-mod version that applied it. A second card-mod loaded from another URL sees the entry, skips the patch, and writes a warning to the Home Assistant system log; that is how a duplicate install is surfaced.

Every patch depends on a private method or a template shape of the frontend. The list, with the frontend file it hooks and what card-mod reads:

| Patch | Frontend hook (tag 20260826.6) |
| --- | --- |
| `hui-card.ts` | `hui-card._loadElement` (private) |
| `hui-badge.ts`, `hui-heading-badge.ts` | `hui-badge._updateElement` |
| `hui-entities-card.ts` | `_renderEntity` template, row at `values[1]` |
| `hui-glance-card.ts` | `div.entity` with `.config` set on it |
| `hui-section.ts` | `hui-grid-section.firstUpdated`, `hui-section._createCards` |
| `hui-card-element-editor.ts` | `hui-element-editor._handleUIConfigChanged`, `getConfigElement`; `ha-button[slot=secondaryAction]` in `hui-dialog-edit-card` |
| `ha-more-info-dialog.ts` | `ha-adaptive-dialog` inside the dialog's shadow root |
| `ha-dialog.ts` | any dialog opened through `show-dialog`, styled on `updated`; `ha-dialog`, `ha-adaptive-dialog`, `ha-toast`, `ha-adaptive-popover`, `ha-drawer` |
| `ha-panel-tools.ts` | `ha-panel-tools` (the developer tools under Settings) |
| `ha-panel-config.ts`, `ha-sidebar.ts`, `ha-drawer.ts`, `hui-view.ts`, `hui-root.ts`, `ha-card.ts`, `ha-assist-chip.ts`, `hui-picture-elements-card.ts`, `ha-icon.ts` | `updated` or `firstUpdated` |

`test/hook-contract.test.ts` fetches those files from the pinned tag and asserts the hooks are still there. A frontend release that renames one fails CI, which is the only early warning this design can offer.

## Fast path

`apply_card_mod` is called for every card, badge, row, icon and dialog on screen. Most of them have no `card_mod:` block, and most themes declare no `card-mod-*` key, so for most elements the answer is known before any work is done. `src/helpers/theme_index.ts` collects the `card-mod-*` keys of every theme in `hass.themes.themes` (every theme, because the active theme can differ per view and per card) and refreshes on `cm_update`. `apply_card_mod` returns before creating a `<card-mod>` element when the element has no own config, carries no `<card-mod>` from an earlier config, and the index has no `card-mod-<type>`, `-yaml` or `-debug` key for its type or an alias of it. Until `hass` is reachable the index reports "may style" so nothing is skipped by mistake.

The icon patches used to call `getComputedStyle` on every icon at every update, five times on a retry ladder, to read three CSS variables that most installs never set. `src/helpers/icon_usage.ts` flips a single flag the first time a processed style or a theme key mentions `--card-mod-icon`, dispatches `cm_icons_enabled`, and the icons that were skipped bind then. The flag never flips back; a style can appear at runtime but there is no safe signal that none is left.

## Theme lookup

`get_theme(root)` reads `--card-mod-theme` from the computed style of the styled element (themes set that variable through the `card-mod-theme` theme key), finds that theme in `hass.themes.themes`, follows a `card-mod-theme` key inside it to another theme if one is named, and returns the styles for the element's type: `card-mod-<type>-yaml` parsed as YAML, else `card-mod-<type>` as the `.` style. Concurrent calls for the same `<card-mod>` share one promise, and the computed-style read waits for the next animation frame so a burst of elements does not force a layout each.

The `tools` type has an alias table (`src/helpers/theme_keys.ts`): `card-mod-developer-tools` and `card-mod-developer-tools-yaml` are read when no `card-mod-tools` key exists. The alias is checked by the fast path too, so a theme that only has the old keys still reaches the panel.

## Theme YAML loading, and why the surrogate was removed

A `-yaml` theme key holds a YAML document as a string (themes are flat string maps). Upstream card-mod parsed it by borrowing the frontend's own YAML editor: it built a detached `partial-panel-resolver`, gave it a fake `hass.panels` array, called its private `_updateRoutes`, loaded the config panel's `developer-tools` route, waited for `developer-tools-router`, loaded its `event` route, and then created an `ha-yaml-editor` to parse the string. That chain was always fragile and became wrong twice in 2026.8: the developer tools moved under `ha-panel-config` as `ha-panel-tools` (route `tools`), so `whenDefined("developer-tools-router")` never resolves, and `partial-panel-resolver` now throws when `panels` is not the object it expects. Because `_process_styles` awaited that promise, every element whose theme declared any `-yaml` key stayed unstyled forever, including its own `card_mod:` styles.

The replacement is `js-yaml` bundled into card-mod: `load(yaml, { schema: YAML11_SCHEMA })`, the same schema family the frontend editor uses, so `yes`/`no`/`on`/`off` booleans behave the same. The root must be a mapping; anything else, and any parse error, is logged as a collapsed console group with the offending line marked and yields `{}` so the element falls back to its own styles. Nothing in card-mod touches the router any more, and the theme lookup is wrapped so a failure (including the 30 second `themesReady` timeout) degrades to "no theme styles" with one warning instead of blocking.

## Dialogs

Home Assistant reuses one dialog element per tag. The dialog patch listens to `show-dialog` in the capture phase, records the tag, caches a sanitised copy of `dialogParams` (functions, DOM nodes and cycles removed by `stripHtmlAndFunctions`) and patches the tag's prototype once. Styling happens in `updated` rather than `showDialog` so a dialog that re-renders after opening is restyled with the cached params. Notifications go through `hass-notification` and the `notification-manager` element.

## Lifecycle of a `<card-mod>` element

`connectedCallback` registers the document `cm_update` listener (dispatched when themes change or the panel changes) and either re-processes styles that changed while detached or refreshes. `disconnectedCallback` disconnects the observer, cancels child lookups, unbinds templates, and after a microtask, if the node is still detached, removes the listener and marks the node for re-processing on reconnect. The microtask matters because a DOM move disconnects and reconnects synchronously; removing the listener immediately would drop updates for a node that is still in use.

## Compatibility surface for other cards

`customElements.get("card-mod").applyToElement(el, type, config, variables, shadow, cls)` is the public entry point for custom cards. It still accepts the card-mod 3.3 signature (`el, type, styles, variables, _, shadow`) and logs one deprecation notice per page load when it sees it. The old signature stays because several published cards still call it and the cost of keeping the shim is one function.
