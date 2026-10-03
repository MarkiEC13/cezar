# Stop late test-store writes

Goal: prevent workflow test teardown from allowing asynchronous `RunStore` saves to write into removed fixture directories, without changing production workflow or server code.

Scope: test-only helper and existing workflow-suite teardown blocks listed by issue #1148. Add a regression that proves a post-teardown schedule is suppressed, then migrate affected tests to the helper.

Non-goals: changes to `packages/cezar/src/workflows/run.ts`, `server.ts`, `RunStore` production behavior, or idle-outcome coverage owned by #689.

## Implementation Plan

### Phase 1: Reproduce and establish cleanup seam

- [ ] 1.1 Confirm the late-write race and add a meaningful test-only regression.
- [ ] 1.2 Add a shared test cleanup helper that flushes and blocks late schedules.

### Phase 2: Migrate workflow suites and verify

- [ ] 2.1 Replace existing workflow teardown cleanup with the shared helper in issue #1148 suites.
- [ ] 2.2 Run targeted and full validation, inspect scope, and record evidence.

## Risks

- The helper must remain test-only and must not alter production `RunStore` semantics.
- Teardown ordering must suppress saves scheduled after a synchronous flush and before fixture deletion.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Reproduce and establish cleanup seam

- [ ] 1.1 Confirm the late-write race and add a meaningful test-only regression.
- [ ] 1.2 Add a shared test cleanup helper that flushes and blocks late schedules.

### Phase 2: Migrate workflow suites and verify

- [ ] 2.1 Replace existing workflow teardown cleanup with the shared helper in issue #1148 suites.
- [ ] 2.2 Run targeted and full validation, inspect scope, and record evidence.
