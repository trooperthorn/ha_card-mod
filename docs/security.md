# Security

## Trust boundaries

card-mod runs in the browser as part of the Home Assistant frontend, with the permissions of the logged-in user and nothing more. It has no server-side component and makes two kinds of WebSocket calls: `render_template` subscriptions for styles that contain Jinja, and one `system_log.write` service call when it detects a duplicate install. Both go through the frontend's existing authenticated connection.

The inputs it acts on are all authored by people who can already edit the instance: dashboard configuration (`card_mod:` blocks), themes (`card-mod-*` keys), and dialog parameters passed by the frontend itself. There is no sandbox for the CSS: whatever a dashboard or theme author writes is injected verbatim into a `<style>` element in the target's shadow root, which is exactly the feature.

## Controls

- Theme YAML is parsed by js-yaml with the YAML 1.1 schema. That schema has no custom tags, so a theme cannot instantiate objects or run code through YAML. The root must be a mapping; anything else is rejected.
- Dialog params exposed to templates pass through `stripHtmlAndFunctions`, which removes functions, DOM nodes and circular references before they are serialised into the template variables sent to the core.
- Templates are rendered by Home Assistant core under the user's own permissions; card-mod only forwards the string and the variables. A template that errors renders as an empty style.
- The `card_mod.action: clear_cache` action reloads the page and asks the service worker to drop its caches; it does not call any service.
- The patch mechanism only wraps methods on prototypes that the frontend defined; it never evaluates strings as code.
- Dependencies are pinned in `package-lock.json`; `npm audit --audit-level=moderate` runs on every push and weekly, and CodeQL (javascript-typescript) runs alongside it. Every GitHub Action is pinned to a commit SHA with the release recorded in a comment.
- `dist/card-mod.js` is committed and CI rebuilds it and fails on drift, so the shipped bundle is reproducible from the tagged source.

## What is not covered

- A frontend release can rename a private method and silently disable a patch. That is a compatibility failure, not a privilege gain, and the hook-contract test exists to catch it before users do.
- card-mod cannot prevent a theme author from writing CSS that hides controls or misleads the viewer; the theme is trusted content.
- The 30 second `themesReady` timeout and the theme lookup are wrapped so their failure never blocks styling, but a broken theme still produces a warning per page load rather than an error surfaced in the UI.

Report vulnerabilities as described in `SECURITY.md` at the repository root.
