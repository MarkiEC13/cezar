# Persist idle timeout settings

Issue: #1232
Goal: Make PUT /api/v1/workspace/config persist resources.idleTimeoutMinutes, including null as the supported disabled value, and cover the route-level regression.

## Scope

- `packages/cezar/src/server/server.ts`: add the missing resources merge assignment.
- `packages/cezar/src/server/workspace-api.test.ts`: add a dedicated route regression test covering persistence, response, reload, and live semaphore refresh.
- No schema, UI, workflow, attachment, or unrelated configuration changes.

## Implementation Plan

### Phase 1: Reproduce and plan

- [x] 1.1 Confirm issue, duplicate/claim state, and root cause from the route closure and issue repro.
- [x] 1.2 Create this execution plan from a clean origin/main fork.

### Phase 2: Fix and regression coverage

- [ ] 2.1 Add the idle-timeout merge assignment and dedicated route regression test.
- [ ] 2.2 Run targeted validation and prove the regression fails without the fix.

### Phase 3: Gate and review

- [ ] 3.1 Run the configured full validation gate and resolve failures.
- [ ] 3.2 Complete authoritative PR review, summarize evidence, and mark the PR ready.

## Risks

The change is limited to one field in the existing atomic workspace-config merge closure. The test must preserve the semantic distinction between `undefined` (not supplied) and `null` (disable timeout).

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append — <commit sha> when a step lands. Do not rename step titles.

### Phase 1: Reproduce and plan

- [x] 1.1 Confirm issue, duplicate/claim state, and root cause from the route closure and issue repro.
- [x] 1.2 Create this execution plan from a clean origin/main fork.

### Phase 2: Fix and regression coverage

- [ ] 2.1 Add the idle-timeout merge assignment and dedicated route regression test.
- [ ] 2.2 Run targeted validation and prove the regression fails without the fix.

### Phase 3: Gate and review

- [ ] 3.1 Run the configured full validation gate and resolve failures.
- [ ] 3.2 Complete authoritative PR review, summarize evidence, and mark the PR ready.
