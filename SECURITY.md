# Security Policy

## Reporting a vulnerability

Do not open a public issue containing exploit details or private network
information. Use GitHub's private vulnerability-reporting feature for this
repository. If private reporting is unavailable, open a minimal issue asking
the maintainer to establish a private channel; omit technical details.

Include the affected version or commit, prerequisites, impact, a minimal
reproduction, and suggested remediation. Remove entity ids, hostnames, and
any other private installation details from reports and logs.

## Response targets

These are project targets, not an SLA: acknowledge critical and high reports
in three business days, establish severity and containment in seven, and
publish a coordinated fix as soon as it is safely validated. Lower-severity
issues are prioritized by exploitability and impact.

## Supported version

Only the latest published release and the default branch receive security
fixes. Upstream card-mod 4.2.1 and earlier are not maintained here.

## Security boundaries

card-mod is a Home Assistant frontend module that patches private methods
and prototypes of the frontend's own custom elements (cards, badges,
dialogs, panels, icons) to inject `<card-mod>` style elements. It runs in
the browser with the same access to the WebSocket API as the dashboard
itself and has no server-side component. There is no sandbox: any CSS a
dashboard author or theme author writes is applied verbatim, and Jinja
templates in styles are rendered by the Home Assistant core `render_template`
command under the viewing user's permissions. Theme YAML is parsed with
js-yaml using the YAML 1.1 schema and never evaluated. The one action it
exposes, `card_mod.action: clear_cache`, reloads the page.

Because card-mod depends on frontend internals, every Home Assistant
release is a compatibility risk rather than a security risk: a renamed
private method silently disables a patch. The `test/hook-contract.test.ts`
suite checks the pinned frontend tag on every CI run so such drift fails
CI before it reaches a dashboard.
