# Decisions

Dated, newest last. Each entry states what was decided and why, so the reasoning does not have to live in code comments.

## 2026-09-08: fork at v4.2.1 rather than adopt UIX

Upstream's last maintainer stated in issue #606 that no further card-mod release will be made and that the work continues in UIX. UIX adds an integration, a coordinator layer and a new key namespace; the household needs the existing `card_mod:` blocks and `card-mod-*` theme keys to keep working unchanged. The fork therefore stays a single HACS plugin resource and borrows only the fixes UIX made to code that card-mod already had. Every borrowed piece is listed in `THIRD_PARTY.md` with both copyright lines in `LICENSE.txt`.

## 2026-09-08: parse theme YAML with js-yaml

The frontend-surrogate loader is dead since 2026.8 and was never a supported interface (see `design.md`). js-yaml with the YAML 1.1 schema matches the editor's boolean handling, costs nothing at runtime until a `-yaml` key is met, and removes the only code in card-mod that touched the router. The bundle grew by less than the Babel removal saved.

## 2026-09-08: theme type `tools` with a `developer-tools` alias

The element is `ha-panel-tools` and the frontend calls the route `tools`; naming the type after the element keeps the rule "type equals the element name without its prefix" that every other patch follows. Existing themes use `card-mod-developer-tools`, so those keys are read as aliases rather than breaking them. Aliases are resolved in one table (`src/helpers/theme_keys.ts`) so the fast path and the lookup cannot disagree.

## 2026-09-08: keep the `hui-section._createCards` patch

The work plan listed the patch as dead. Frontend 20260826.6 still has `private _createCards(config)` at `hui-section.ts:402`, called from `:248` with the section config, and the patch's argument shape still matches. It stays, and the hook-contract test now covers it.

## 2026-09-08: no root `card-mod.js`

`hacs.json` names `card-mod.js` and HACS serves it from the release asset or, for a tree install, from `dist/` by filename. The dashboard resource path `/hacsfiles/ha_card-mod/card-mod.js` does not depend on where the file sits in the repository. Two copies of a 95 KB bundle would drift; the committed copy is `dist/card-mod.js` only, and CI fails when it drifts from a fresh build.

## 2026-09-08: TypeScript strict with `noImplicitAny` off

Strict null checks caught real cases (a possibly-undefined child `card-mod`, a possibly-null `shadowRoot`), and each fix is a type annotation or a guard, not a behaviour change. `noImplicitAny` stays off because the patch methods take whatever the frontend passes, and annotating those as `any` everywhere would only add noise.

## 2026-09-08: vitest 5 and @rollup/plugin-terser 1.0.0 instead of the vitest 2 baseline

The security workflow runs `npm audit --audit-level=moderate`. vitest 2 pulls vite and esbuild versions with open moderate and high advisories, and `@rollup/plugin-terser` 0.4 pulls `serialize-javascript` with a high one. The tests run unchanged on vitest 5 and the bundle is byte-identical with plugin-terser 1.0.0, so the audit passes clean rather than carrying exceptions.

## 2026-09-08: the hook-contract test fetches GitHub in CI

Pinning the frontend source in the repository would mean committing a copy of the frontend; fetching nine files from the pinned tag over HTTPS costs about a second and the test skips itself when offline (or when `CARD_MOD_OFFLINE=1`). The tag is a constant in the test so a bump is one line and shows in the diff.

## 2026-09-08: upstream `stale.yml` removed, issue templates kept

Auto-closing issues on a fork with one maintainer hides information. The bug report and feature request templates still describe useful fields and stay.
