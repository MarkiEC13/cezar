# Fix issue #997: preserve DONE and ASK before trailing task references

## Goal

Ensure `CEZ:DONE` and valid `CEZ:ASK` markers retain their turn-end meaning when an agent appends `CEZ:PR=`, `CEZ:ISSUE=`, or `CEZ:TITLE=` lines.

## Scope

- `packages/cezar/src/workflows/run.ts`: route both turn-end handlers and shared ASK resolution through the existing trailing-reference helper.
- `packages/cezar/src/workflows/run.test.ts`: unit and end-to-end regression coverage for DONE/ASK, both handler paths, and false-positive boundaries.

## Non-goals

- No changes to task-reference parsing, tracker/UI surfaces, runner protocols, or marker precedence beyond detection of trailing reference lines.
- No web, store, Pi, or automation changes.

## Implementation Plan

### Phase 1: Marker detection

- [x] 1.1 Use the shared normalized turn text for DONE detection in both turn-end handlers and ASK parsing/compaction classification. — implementation pending commit
- [x] 1.2 Add regression tests for trailing PR/ISSUE/TITLE markers and marker false positives. — implementation pending commit

### Phase 2: Verification and handoff

- [ ] 2.1 Prove the regression fails on the base, then passes with the fix.
- [ ] 2.2 Run the configured validation gate, review the PR, and record remaining environment limits.

## Risks

DONE closes a session and ASK creates a user-facing card, so widening either must be a strict superset of the existing end-anchored behavior. Only complete trailing marker lines are stripped; marker-like prose or references followed by later commentary must remain non-matches.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Marker detection

- [ ] 1.1 Use the shared normalized turn text for DONE detection in both turn-end handlers and ASK parsing/compaction classification.
- [ ] 1.2 Add regression tests for trailing PR/ISSUE/TITLE markers and marker false positives.

### Phase 2: Verification and handoff

- [ ] 2.1 Prove the regression fails on the base, then passes with the fix.
- [ ] 2.2 Run the configured validation gate, review the PR, and record remaining environment limits.
