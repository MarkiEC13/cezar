# Expose terminal nginx installer failures

Goal: Fix issue #1001 so an nginx configuration parse failure is shown with its diagnostic output and cannot enter a futile retry loop, while ordinary verification failures retain retry/skip behavior.

Scope: `packages/cezar/src/server-install/steps.ts`, the Ubuntu VPS SSL wiring in `packages/cezar/src/server-install/platforms/ubuntu-vps.ts`, and installer unit tests.

Non-goals: nginx/vhost generation changes, system installation, production nginx changes, or changes outside the installer.

## Implementation Plan

### Phase 1: Diagnose and fix

- [ ] 1.1 Add a terminal verification-diagnostic seam to `sudoStep` and use it for nginx parse failures in the SSL step.
- [ ] 1.2 Add regression tests for diagnostic output/terminal behavior and preserve transient retry behavior.

### Phase 2: Verify and ship

- [ ] 2.1 Run targeted and full validation, inspect the diff, commit and push the fix.
- [ ] 2.2 Run the authoritative PR review and address any findings.

## Risks

- The nginx probe must only classify a failed configuration test as terminal; certbot/DNS/rate-limit failures remain retryable and skippable.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Diagnose and fix

- [ ] 1.1 Add a terminal verification-diagnostic seam to `sudoStep` and use it for nginx parse failures in the SSL step.
- [ ] 1.2 Add regression tests for diagnostic output/terminal behavior and preserve transient retry behavior.

### Phase 2: Verify and ship

- [ ] 2.1 Run targeted and full validation, inspect the diff, commit and push.
- [ ] 2.2 Run the authoritative PR review and address any findings.
