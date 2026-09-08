# Operations

## Resources

| Where | Value |
| --- | --- |
| HACS custom repository | `trooperthorn/ha_card-mod`, category Dashboard (plugin) |
| Dashboard resource (HACS-managed) | `/hacsfiles/ha_card-mod/card-mod.js`, type `module` |
| `configuration.yaml` | `frontend: extra_module_url: [/hacsfiles/ha_card-mod/card-mod.js]` |
| Release asset | `card-mod.js` on every `vYYYY.MM.DD.N` release, identical to `dist/card-mod.js` at that tag |

`extra_module_url` is what makes theme keys apply to the sidebar, drawer, dialogs, config panel and tools panel; without it card-mod loads after those elements rendered. A restart of Home Assistant is required after changing `extra_module_url`; a browser cache clear is required on each device after any card-mod update loaded that way.

### Switching from `lovelace-card-mod`

1. HACS: remove the upstream download, add this repository as a custom repository, download it. HACS replaces the dashboard resource itself on managed dashboards; on YAML-mode dashboards edit the `resources:` list by hand.
2. `configuration.yaml`: change the `extra_module_url` entry to the new path. Restart.
3. Each device: clear the frontend cache (Settings, Companion app, or the `card_mod.action: clear_cache` action from `usage.md`).
4. Check the system log for a "duplicate patch" warning from `card-mod.<version>`; it means two different card-mod URLs are still loaded.

Dashboards and themes need no edits.

## Theme keys

Themes are flat maps of strings. A key `card-mod-<type>` holds CSS applied to the element's own shadow root (the `.` style); `card-mod-<type>-yaml` holds a YAML document whose keys are DOM paths, exactly like a `card_mod: style:` block. The `-yaml` key wins when both exist. `card-mod-theme: <name>` sets which theme card-mod reads (and may name another theme). `card-mod-<type>-debug: true` and `card-mod-<type>-<class>-debug: true` turn on console debugging for that type.

| Type | Element | Notes |
| --- | --- | --- |
| `card` | every card (`ha-card` or `hui-card`) | |
| `badge` | `hui-badge` | |
| `heading-badge` | `hui-heading-badge` | |
| `assist-chip` | `ha-assist-chip` | |
| `row` | entities card rows, conditional rows | class `type-<row type>` |
| `glance` | each glance entity | |
| `element` | picture-elements elements | |
| `grid-section` | `hui-grid-section` | |
| `view` | `hui-view` | |
| `root` | `hui-root` | header and tabs |
| `sidebar` | `ha-sidebar` | module load only |
| `drawer` | `ha-drawer` | module load only |
| `more-info` | the more-info dialog's `ha-adaptive-dialog` | |
| `dialog` | any other dialog: `ha-dialog`, `ha-adaptive-dialog`, `ha-adaptive-popover`, `ha-toast`, `ha-drawer` | class `type-<dialog tag without ha->` |
| `config` | `ha-panel-config` | module load only |
| `top-app-bar-fixed` | `ha-top-app-bar-fixed` | the config panel background |
| `panel-custom` | `ha-panel-custom` | |
| `tools` | `ha-panel-tools` (developer tools under Settings) | module load only; `card-mod-developer-tools` and `card-mod-developer-tools-yaml` are read as aliases when no `tools` key exists |
| `icon` | `ha-icon`, `ha-state-icon`, `ha-svg-icon` | not a key; set `--card-mod-icon`, `--card-mod-icon-color`, `--card-mod-icon-dim` from any style |

`*-child` types (`card-child`, `row-child`, and so on) are created for elements reached through a DOM path in a style and are not meant to be set from themes.

## Troubleshooting

**Nothing is styled at all.** Open the browser console and look for `CARD-MOD <version> IS INSTALLED`. If it is missing the resource is not loaded; check the resource list and the network tab for a 404 on `card-mod.js`. If it is printed twice with different versions, two copies are loaded; remove one.

**Styles from `card_mod:` work but theme keys do not.** Theme keys for panels, dialogs, sidebar and drawer need `extra_module_url`. For cards, check that the theme is selected for the user or the view, and that `card-mod-theme` is set in the theme (it must be, for `--card-mod-theme` to exist).

**A `-yaml` key does nothing.** Look for a collapsed console group `CARD-MOD: Error loading theme key card-mod-<type>-yaml`; it shows the parse error with the failing line marked. The root of the document must be a mapping. On failure that key contributes nothing and the element keeps its own `card_mod:` styles.

**`CARD-MOD: theme styles unavailable` warning.** The theme lookup threw or `themesReady` timed out after 30 seconds (themes not loaded, or `hass` unreachable). Elements keep their own styles. It is printed once per page load.

**A style stopped working after a Home Assistant update.** Run `npm test` in a checkout; `test/hook-contract.test.ts` names the frontend file whose hook disappeared. Until a fix is released, pin the previous Home Assistant version or accept the missing style.

**Debugging one element.** Add `debug: true` inside the element's `card_mod:` block, or set `card-mod-<type>-debug: true` in the theme, and read the `CardMod Debug:` lines in the console. They print the element, the merged styles and, for templates, the rendered result.

**Icon variables ignored.** Icons start doing work the first time any style mentions `--card-mod-icon`. If the only such style is added later at runtime, the icons already on screen bind at that moment; if an icon still shows the stock glyph, force a re-render (navigate away and back).

## Releasing

A merge to `main` runs the validate workflow; `prepare-release.yml` then opens an automated CalVer bump PR that auto-merges when green, and `release.yml` tags `v<version>`, rebuilds `dist/card-mod.js`, refuses to publish if the rebuild differs from the committed file, and attaches the asset. `python scripts/build_release_artifacts.py --validate-only` prints the version that would be released.
