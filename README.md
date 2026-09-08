# card-mod

card-mod adds CSS to almost any element of a Home Assistant dashboard. Styles come from a `card_mod:` block in a card, badge, row or element config, or from theme keys such as `card-mod-card` that style every element of a type at once. Styles may contain Jinja templates rendered by Home Assistant, and the `mod-card` wrapper styles cards that have no `ha-card` of their own.

This is a maintained fork of [thomasloven/lovelace-card-mod](https://github.com/thomasloven/lovelace-card-mod) by Thomas Lovén, taken at v4.2.1 and repaired for Home Assistant 2026.8 and later; several of the fixes are borrowed from [UIX](https://github.com/Lint-Free-Technology/uix), the successor project by card-mod's last maintainer (see `docs/THIRD_PARTY.md`).

## Requirements

Home Assistant 2026.8.0 or later. The frontend tag this release was verified against is 20260826.6 (Home Assistant 2026.9.1). Live behaviour on a running 2026.9.1 instance has not yet been verified by the fork; see `docs/backlog.md`.

## Installing

Add this repository to HACS as a custom repository of category **Dashboard** (plugin):

[![Open your Home Assistant instance and add this repository to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=trooperthorn&repository=ha_card-mod&category=plugin)

HACS installs `card-mod.js` and registers the resource `/hacsfiles/ha_card-mod/card-mod.js` on dashboards with a managed resource list. The file is also attached to every GitHub release and committed at `dist/card-mod.js`, so a manual install can copy it to `www/` and add a `module` resource pointing at it.

### Theme support needs `extra_module_url`

Dashboard resources load after the sidebar, dialogs, config panel and tools panel have already rendered, so theme keys for those elements only apply when card-mod is loaded as a frontend module. Add this to `configuration.yaml` and restart Home Assistant:

```yaml
frontend:
  extra_module_url:
    - /hacsfiles/ha_card-mod/card-mod.js
```

Keep the dashboard resource as well; HACS needs it to track updates. card-mod detects when it is loaded twice from the same URL and does nothing the second time. Loading it from two different URLs (for example the upstream `lovelace-card-mod` path and this one) is reported to the system log; remove the old one.

## Switching from upstream card-mod

1. In HACS, remove the `lovelace-card-mod` download, then add this repository and download it.
2. Replace `/hacsfiles/lovelace-card-mod/card-mod.js` with `/hacsfiles/ha_card-mod/card-mod.js` in `extra_module_url` and restart.
3. Clear the browser cache on each device, or use the `card_mod.action: clear_cache` action described in `docs/usage.md`.

No dashboard or theme edits are needed. Every `card_mod:` block and every `card-mod-*` theme key from 4.2.1 keeps its meaning; the two developer-tools keys are read as aliases (below).

## What changed versus 4.2.1

- Theme keys ending in `-yaml` are parsed with js-yaml instead of the frontend's YAML editor. The old loader built a detached `partial-panel-resolver` and waited for a `developer-tools-router` element that no longer exists since 2026.8, which left every element unstyled once the active theme defined any `card-mod-*-yaml` key (upstream issues #606 and #608).
- A failed theme lookup no longer blocks the styles in a card's own `card_mod:` block.
- The more-info dialog is styled again (`ha-adaptive-dialog`), as are dialogs built on `ha-adaptive-popover`, notifications, and the drawer.
- The developer tools panel is `ha-panel-tools` under Settings since 2026.8. Its theme type is now `tools` (`card-mod-tools`, `card-mod-tools-yaml`); the old `card-mod-developer-tools` and `card-mod-developer-tools-yaml` keys still work as aliases of the same type.
- A theme may name another theme in `card-mod-theme`; card-mod reads its keys from that theme.
- Elements that no config and no theme can style are skipped entirely, and icon elements do no work until some style uses `--card-mod-icon`, `--card-mod-icon-color` or `--card-mod-icon-dim`. Theme lookups are coalesced per element and read computed styles once per animation frame. This is upstream PR #610 plus UIX's icon hygiene.
- Dialog styling happens on `updated` with cached params per dialog tag (upstream branch `2026.4.0-fixes`).
- The bundle is built by rollup 3 without Babel and shipped as an ES module at `dist/card-mod.js`; the root `card-mod.js` is gone and `hacs.json` names the file.
- Versions are CalVer (`YYYY.MM.DD.N`), tagged with a `v` prefix, cut automatically from `main`.

## Documentation

- `docs/usage.md`: the styling reference (cards, rows, badges, elements, templates, DOM navigation, `mod-card`, conditional rows and elements).
- `README-application.md`: which frontend elements card-mod attaches to and how.
- `README-themes.md`: theme keys.
- `README-developers.md`: `applyToElement` for custom card authors.
- `docs/operations.md`: theme keys including the `tools` alias, resource switch, troubleshooting.
- `docs/design.md`, `docs/decisions.md`, `docs/security.md`, `docs/quality-scale.md`, `docs/backlog.md`, `docs/THIRD_PARTY.md`.

## Development

```
npm ci
npm run lint
npm test
npm run build
```

`npm test` includes `test/hook-contract.test.ts`, which fetches the pinned frontend tag and checks that every patched private method and selector still exists; set `CARD_MOD_OFFLINE=1` to skip it. `npm run build` writes `dist/card-mod.js`, which is committed; CI fails when the committed file drifts from a fresh build.

## Licence

MIT. Copyright 2019 Thomas Lovén; portions copyright 2025 Darryn Capes-Davis. See `LICENSE.txt` and `docs/THIRD_PARTY.md`.
