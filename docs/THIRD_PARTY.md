# Third-party code

card-mod is a fork of [thomasloven/lovelace-card-mod](https://github.com/thomasloven/lovelace-card-mod) at v4.2.1, MIT, copyright 2019 Thomas Lovén. Everything not listed below is that code or this fork's own work under the same licence.

## UIX

[Lint-Free-Technology/uix](https://github.com/Lint-Free-Technology/uix) is the successor project by card-mod's last maintainer. It is MIT licensed with copyright 2019 Thomas Lovén and 2025 Darryn Capes-Davis; both lines are in `LICENSE.txt`. The following pieces were copied or adapted from it. UIX renames `card-mod` to `uix` throughout; the adapted copies keep card-mod's names.

| File in this repository | Source in UIX | Commit | What was taken |
| --- | --- | --- | --- |
| `src/helpers/yaml2json.ts` | `src/helpers/yaml2json.ts` | b0148580237b6568616d7a8390b0048bb87bcce1 | js-yaml loader with YAML 1.1 schema, mapping-root check, line-marked console group on error, empty object on failure. Adapted: synchronous, `CARD-MOD` prefix. |
| `src/helpers/themes.ts` | `src/helpers/themes.ts` | b0148580237b6568616d7a8390b0048bb87bcce1 | Per-root in-flight `WeakMap` coalescing of `get_theme`, `nextAnimationFrame` before `getComputedStyle`, `card-mod-theme` key indirection. Adapted: no `uix-*` keys, alias table for the `tools` type. |
| `src/helpers/raf.ts` | `src/helpers/raf.ts` | master, 2026-09-08 | `nextAnimationFrame`. |
| `src/patch/ha-dialog.ts` | `src/patch/ha-dialog.ts` | b0148580237b6568616d7a8390b0048bb87bcce1 | `ha-adaptive-popover` in the selector list. The rest of the file is the upstream `2026.4.0-fixes` branch. |
| `src/patch/ha-more-info-dialog.ts` | `src/patch/ha-more-info-dialog.ts` | b0148580237b6568616d7a8390b0048bb87bcce1 | `ha-adaptive-dialog` queried first, `ha-dialog` as fallback. |
| `src/patch/ha-icon.ts` | `src/patch/ha-icon.ts` | b0148580237b6568616d7a8390b0048bb87bcce1 | `isConnected` guards, per-element `_bindPending` and `_updateIconPending` coalescing. The skip-until-used logic is from upstream PR #610. |
| `src/card-mod.ts` | `src/uix.ts` | f9db963 (dev branch) | `cm_update` listener registered in `connectedCallback` and removed in `disconnectedCallback` after a microtask, so DOM moves keep their listener and detached nodes stop leaking. |

Not taken from UIX: the Forge, Broker and coordinator layers, the `custom_components/uix` integration, macros, the `uix-*` key namespace, entity-specific icon variables, and the `after-show` dialog path. card-mod remains a single HACS plugin resource.

## Upstream pull requests

| File | Source | What was taken |
| --- | --- | --- |
| `src/helpers/theme_index.ts`, `src/helpers/icon_usage.ts`, the fast path in `src/helpers/apply_card_mod.ts`, `maybeBind` in `src/patch/ha-icon.ts` | thomasloven/lovelace-card-mod PR #610 | Skip elements no theme or config can style; skip icon work until a style uses `--card-mod-icon`. Adapted: the index follows the `developer-tools` alias and treats `card-mod-<type>-debug` as a reason not to skip. |
| `src/helpers/patch_function.ts`, `src/patch/ha-dialog.ts` | thomasloven/lovelace-card-mod branch `2026.4.0-fixes` (v4.2.1-202604 prerelease) | Dialog patching on `updated`, cached dialog params per tag, `notification-manager` patch. |

## Home Assistant frontend

`src/patch/hui-glance-card.ts` carries a copy of three CSS rules from `src/panels/lovelace/cards/hui-glance-card.ts` at frontend tag 20260826.6 (Apache 2.0, Home Assistant contributors), so that entities moved into their own shadow root keep the stock layout.

## Runtime dependencies

`lit` (BSD-3-Clause), `js-yaml` (MIT), `@watchable/unpromise` (MIT), `tslib` (0BSD). See `package-lock.json` for exact versions.
