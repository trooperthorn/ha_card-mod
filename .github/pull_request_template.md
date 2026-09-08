## Change

Describe the behavior and security impact. Name the frontend files and hooks the change depends on.

## Verification

- [ ] `npm run lint`, `npm test`, and `npm run build` pass
- [ ] `npm run build` produces no drift in committed `dist/`
- [ ] The hook-contract test passed online against the pinned frontend tag
- [ ] No secret, credential, token, or private installation detail was committed
- [ ] New theme keys or template variables are documented in `docs/operations.md`

## Risk and rollback

State affected trust boundaries and a rollback method (the previous release asset can be re-pinned in HACS).
