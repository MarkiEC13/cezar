# Bound event-history context retention

Goal: bound turn-boundary retention in `deriveRunContextEvents` for sessions without
sub-agent roots, while preserving active roots, newest children, latest plan, and the
existing settled-root carry-over behavior.

Scope: `packages/cezar/src/runs/event-history.ts`,
`packages/cezar/src/runs/event-history.test.ts`.

Non-goals: changing the HTTP contract, server behavior, web consumers, or root/child
episode selection semantics.

## Implementation Plan

### Phase 1: Fix and regression coverage

- [ ] 1.1 Add an independent bounded boundary window and regression tests for long no-root and mixed-root histories
- [ ] 1.2 Run focused history tests and inspect the diff

### Phase 2: Validation and review

- [ ] 2.1 Run the configured validation gate
- [ ] 2.2 Obtain the authoritative PR review and address findings

## Risks

The boundary window may discard older turn markers, but context episode items and the
latest plan remain independently retained. Existing root-driven pruning and carry-over
tests guard the intentional fan-out behavior.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Fix and regression coverage

- [ ] 1.1 Add an independent bounded boundary window and regression tests for long no-root and mixed-root histories
- [ ] 1.2 Run focused history tests and inspect the diff

### Phase 2: Validation and review

- [ ] 2.1 Run the configured validation gate
- [ ] 2.2 Obtain the authoritative PR review and address findings
