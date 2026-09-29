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

- [x] 1.1 Use the shared normalized turn text for DONE detection in both turn-end handlers and ASK parsing/compaction classification. — 7e293b63
- [x] 1.2 Add regression tests for trailing PR/ISSUE/TITLE markers and marker false positives. — 7e293b63

### Phase 2: Verification and handoff

- [x] 2.1 Prove the regression fails on the base, then passes with the fix. — 7e293b63
- [x] 2.2 Run the configured validation gate, review the PR, and record remaining environment limits. — 54009cc5

Gate update: `npm run typecheck` passed; full `npm test` passed 8401/8403 with the two known environment-only failures in `agent-profile-wiring.test.ts` and `system-prompt.test.ts` (same failures reproduced by the parent on fresh base).

Review: local `om-auto-review-pr` workflow found no blocker/major findings. Formal GitHub self-approval is unavailable; Independent review completed; see final verification below.

## Risks

DONE closes a session and ASK creates a user-facing card, so widening either must be a strict superset of the existing end-anchored behavior. Only complete trailing marker lines are stripped; marker-like prose or references followed by later commentary must remain non-matches.

## Final verification

Independent review task `690e9ba5` approved `54009cc586250cec69a2b5673dfe3ff6800d8a39` with no actionable findings.

Regression red before fix; marker/ASK suite 36/36 and reviewer marker/run suite 144/144 passed. Typecheck, unit 36/36, build/check-pack, package 17/17 passed; CI passed. Full local suite 8401/8403 hit inherited environment failures; parent confirmed both affected suites pass 45/45 with CEZ_API_URL and CEZ_BIN unset and TMPDIR=/tmp.

GitHub author self-approval is unavailable. QA sign-off remains a merge gate; ready status does not waive it.

## Progress

PR: #1154

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Marker detection

- [x] 1.1 Use the shared normalized turn text for DONE detection in both turn-end handlers and ASK parsing/compaction classification. — 7e293b63
- [x] 1.2 Add regression tests for trailing PR/ISSUE/TITLE markers and marker false positives. — 7e293b63

### Phase 2: Verification and handoff

- [x] 2.1 Prove the regression fails on the base, then passes with the fix. — 7e293b63
- [x] 2.2 Run the configured validation gate, review the PR, and record remaining environment limits. — c3606071
