# Fix issue-804 test races

Goal: make the auto-resume fixture teardown wait for all started work and make the GitHub template
stacking assertion wait for the causally settled second insertion, without changing production code
or weakening the queue and blank-line assertions.

Scope: `packages/cezar/src/workflows/auto-resume.test.ts`,
`packages/web/src/routes/github/github.test.tsx`, and this run plan only.

Non-goals: shared production lifecycle APIs, sibling issue-701 suites, arbitrary sleeps, broad timeout
increases, and changes to queue semantics or template composition.

## Implementation plan

### Phase 1: reproduce and fix fixture teardown

- [x] 1.1 Re-run the scoped auto-resume suite and identify active work that survives the test body. — baseline passed once; teardown race confirmed by issue evidence
- [x] 1.2 Await terminal lifecycle state before disposing and removing the temporary repository.

### Phase 2: synchronize template assertion

- [x] 2.1 Re-run the GitHub suite and trace the second-selection settlement boundary. — baseline reproduced 130/131
- [x] 2.2 Assert the settled value after the second selection with causal synchronization.

### Phase 3: validate and review

- [ ] 3.1 Run scoped tests, the configured validation gate, and review the final diff.
- [ ] 3.2 Open and review the PR, then report exact evidence to the parent task.

## Risks

- Teardown must not cancel or alter the run behavior being tested; it only waits after assertions.
- Template synchronization must preserve exact two-newline stacking semantics.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append — <commit sha> when a step lands.

### Phase 1: reproduce and fix fixture teardown

- [ ] 1.1 Re-run the scoped auto-resume suite and identify active work that survives the test body.
- [ ] 1.2 Await terminal lifecycle state before disposing and removing the temporary repository.

### Phase 2: synchronize template assertion

- [ ] 2.1 Re-run the GitHub suite and trace the second-selection settlement boundary.
- [ ] 2.2 Assert the settled value after the second selection with causal synchronization.

### Phase 3: validate and review

- [ ] 3.1 Run scoped tests, the configured validation gate, and review the final diff.
- [ ] 3.2 Open and review the PR, then report exact evidence to the parent task.
