# Fix final interactive idle settlement

Goal: prevent an unanswered `CEZ:ASK` on the final interactive step from being settled as a successful run when the idle timer closes its session.

Scope: `packages/cezar/src/workflows/run.ts` idle/ask settlement and a dedicated regression test/helper in the workflow tests.

Non-goals: no LLM classifier, new status, environment variable, server change, existing teardown changes, step-rail changes, or attachment changes.

## Implementation Plan

### Phase 1: Reproduce and guard the lifecycle

- [x] 1.1 Reproduce the final interactive ask timeout path and document the root cause in the test. — red proof: unfixed test timed out waiting for failed settlement
- [x] 1.2 Add a focused regression test proving an unanswered final ask settles as failed. — ce07eeaf

### Phase 2: Minimal fix and verification

- [x] 2.1 Persist the ask park marker for final interactive asks and preserve ordinary waiting/finish behavior. — ce07eeaf
- [x] 2.2 Run targeted and full validation, review the diff, and publish the PR. — CI green; local npm test has 10 unrelated fixture/environment failures

## Risks

The marker is shared with recovery and continuation settlement; tests must preserve ordinary final interactive waiting and explicit Finish semantics.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append — <commit sha> when a step lands. Do not rename step titles.

### Phase 1: Reproduce and guard the lifecycle

- [ ] 1.1 Reproduce the final interactive ask timeout path and document the root cause in the test.
- [ ] 1.2 Add a focused regression test proving an unanswered final ask settles as failed.

### Phase 2: Minimal fix and verification

- [ ] 2.1 Persist the ask park marker for final interactive asks and preserve ordinary waiting/finish behavior.
- [ ] 2.2 Run targeted and full validation, review the diff, and publish the PR.
