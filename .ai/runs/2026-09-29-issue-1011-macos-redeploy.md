# Fail macOS redeploy on failed launchctl restart

Goal: make macOS + ngrok redeploy fail when either launchd agent cannot be restarted, and detect a successful kickstart that leaves the cockpit process unchanged.

Scope: `packages/cezar/src/server-install/platforms/macosx-ngrok.ts` and its focused tests. Do not alter Linux/shared redeploy behavior or add a new configuration requirement.

## Implementation Plan

### Phase 1: Regression and fix

- [x] 1.1 Add deterministic macOS redeploy tests for non-zero kickstart and unchanged cockpit process. — ff72fe99
- [x] 1.2 Throw `StepAborted` on failed kickstart and verify launchd process replacement when identity data is available. — ff72fe99

### Phase 2: Validation and handoff

- [x] 2.1 Run targeted tests, configured validation gate, and review the final diff. — pending
- [ ] 2.2 Open and finalize the issue PR with evidence and review status.

## Risks

`launchctl print` output is platform-specific and may be unavailable in degraded environments; identity comparison will be best-effort, while the kickstart exit status remains a hard failure gate.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Regression and fix

- [x] 1.1 Add deterministic macOS redeploy tests for non-zero kickstart and unchanged cockpit process. — ff72fe99
- [x] 1.2 Throw `StepAborted` on failed kickstart and verify launchd process replacement when identity data is available. — ff72fe99

### Phase 2: Validation and handoff

- [x] 2.1 Run targeted tests, configured validation gate, and review the final diff. — pending
- [ ] 2.2 Open and finalize the issue PR with evidence and review status.
