# Backlog

Open items, in priority order. Upstream issue numbers refer to thomasloven/lovelace-card-mod; no issues or pull requests are opened there.

## Live verification on 2026.9.1

Everything in release 2026.09.08.1 was verified against frontend source at tag 20260826.6 and against unit tests in jsdom. It has not yet been loaded into a running Home Assistant 2026.9.1 instance. To close this item: install the release on the household instance, select a theme that defines at least one `card-mod-*-yaml` key, and confirm that cards, rows, the more-info dialog, the drawer and the tools panel are styled, and that no `CARD-MOD:` warning appears in the console.

## Live inventory of themes and dashboards

The work plan's Phase 0 inventory has not been run: which themes on the instance define `card-mod-*` keys (any `-yaml` key is the trigger for #606), which dashboards use `card_mod:` beyond the one known windrose use in `dashboards/shared/weather_station.yaml`, the exact resource URL in `lovelace/resources`, and whether `extra_module_url` duplicates it. Record the result as `docs/live-usage-2026-09.md`. The inventory decides whether the developer-tools alias and the strategy-section patch matter for this household.

## Upstream #613: no effect on cards newly added in a sections view

Unconfirmed. What the frontend source shows: `hui-section._createCardElement` still calls `hui-card.load()` and so the `_loadElement` hook; `_setElementVisibility` removes and re-appends the element, which drives `disconnectedCallback` and `connectedCallback`; in the editor preview `hui-card` rebuilds its element on every config change, so card-mod attaches to an element the editor discards. Reproduce in the `test/` harness: sections view, add a card through the editor with a `card_mod:` block, save, reload, and compare with a YAML-authored card. If the preview path is the cause, the fix is to re-apply on `_loadElement` rather than on first attach.

## Upstream #614: refresh loop on 2026.9.0

Watch item, not a card-mod bug as far as the source shows. card-mod's only reload call is `ll-custom-actions.ts` and it is reachable only through `card_mod.action: clear_cache`. The linked core issue #181149 is a remote UI disconnect bug with reports from Nabu Casa, NGINX and Cloudflare users. Re-check when core #181149 closes.

## Strategy-section `card_mod`

The `hui-section._createCards` patch is present and the hook exists at tag 20260826.6, but its effect (injecting `card_mod` into strategy-generated cards by type) has not been observed on 2026.9. Verify live once a strategy section is in use; if it does not fire, `_createCards` is private and may be called before the patch lands, in which case the injection has to move to `_createCardElement`.

## Browser-level test in CI

The upstream `test/` docker-compose harness (configuration, dashboards and themes for a test instance) is kept but not run. Wiring it to a Playwright job that loads `dist/card-mod.js` against a pinned Home Assistant container would turn the hook-contract check into a behaviour check.

## Frontend compatibility matrix

Run `test/hook-contract.test.ts` against the current stable tag and the next beta tag on the weekly schedule, and publish the result per release.

## Bundle size budget

`dist/card-mod.js` is 95,304 bytes. Add a CI check that fails above 110 KB so a dependency bump cannot double the bundle unnoticed.

## Accepted scanner finding: `ha-top-app-bar-fixed`

`check_stale.py` flags the `ha-top-app-bar-fixed` patch in `src/patch/ha-panel-config.ts` under the 2026.6 frontend component post. At tag 20260826.6 the element still exists (`src/components/ha-top-app-bar-fixed.ts`) and `ha-panel-tools` renders it (`ha-panel-tools.ts:65`), so the patch stays. Re-check when the element is removed from the frontend; the `top-app-bar-fixed` theme type would then go with it.
