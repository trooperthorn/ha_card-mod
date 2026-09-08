# Changelog

Versions are CalVer (`YYYY.MM.DD.N`). The fork starts from upstream card-mod v4.2.1 (2026-02-08).

## 2026.09.08.1

### Fixed

- Theme keys ending in `-yaml` are parsed with js-yaml (YAML 1.1 schema, mapping root required, line-marked error in the console and an empty result on failure). The previous loader depended on `developer-tools-router` and a detached `partial-panel-resolver`, neither of which works since Home Assistant 2026.8; with any `card-mod-*-yaml` key in the active theme every element stayed unstyled (upstream #606, #608).
- Styles from a card's own `card_mod:` block are applied even when the theme lookup fails or times out; one warning is logged.
- More-info dialogs are styled again through `ha-adaptive-dialog`; `ha-adaptive-popover` dialogs are styled; the non-existent `ha-md-dialog` and `ha-wa-dialog` selectors are gone.
- The developer tools patch targets `ha-panel-tools` with theme type `tools`; `card-mod-developer-tools` and `card-mod-developer-tools-yaml` remain valid as aliases.
- The `ha-drawer` patch is enabled.
- `stripHtmlAndFunctions` returns `undefined` for a circular reference and keeps shared references.
- The `cm_update` listener is registered on connect and removed once a node stays detached, closing a listener leak for discarded `card-mod` elements.

### Changed

- Merged upstream branch `2026.4.0-fixes`: dialog styling on `updated`, cached dialog params per tag, `notification-manager` patch.
- Ported upstream PR #610: elements with no config and no theme key are skipped; icon elements do nothing until a style uses `--card-mod-icon*`. The theme index follows the `tools` alias and lets `card-mod-<type>-debug` keys through.
- `get_theme` coalesces concurrent lookups per element, waits for the next animation frame before reading computed style, and follows a `card-mod-theme` key to another theme.
- The entities-card patch checks that the rendered row is an Element; glance entity styles match frontend 20260826.6.
- Toolchain: rollup 3 with `@rollup/plugin-typescript`, node-resolve, commonjs, json and `@rollup/plugin-terser`; no Babel; TypeScript 5.6 strict (`noImplicitAny` off); eslint 8 with prettier; vitest 5 with jsdom. Output is `dist/card-mod.js` (committed); the root `card-mod.js` is removed and `hacs.json` names the file. `hacs.json` floor is 2026.8.0.
- Bundle size: upstream 4.2.1 `card-mod.js` was 99,373 bytes (ES5 via Babel). This release's `dist/card-mod.js` is 95,304 bytes as an ES2020 module including js-yaml.
- Release and security baseline: `.release.json`, CalVer scripts, validate, security, release and prepare-release workflows with SHA-pinned actions, weekly schedules, dependabot, CODEOWNERS, pull request template, SECURITY.md. The upstream stale workflow is removed.
- Tests: 33 vitest cases (dialog params, yaml2json, theme aliases and indirection, theme index, icon usage, hook contract against the pinned frontend tag).
- Docs: README rewritten; the styling reference moved to `docs/usage.md`; `docs/` added.
