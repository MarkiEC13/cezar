# Align live attachment hints and grants

## Goal

Ensure the first named attachment delivered to a live session is both advertised and reachable through the session's fixed filesystem grants, without making an inaccessible attachment library fail a run.

## Scope

- `packages/cezar/src/workflows/run.ts`
- `packages/cezar/src/workflows/pasted-attachments.test.ts`

## Implementation Plan

### Phase 1: Reproduce and fix the grant invariant

- [x] 1.1 Add a regression covering the first named live follow-up's advertised library and fixed `--add-dir` grant — dad8f65a
- [x] 1.2 Prepare the library directory at both initial and continuation session construction sites; keep hints best-effort — dad8f65a

### Phase 2: Validate and review

- [x] 2.1 Run targeted attachment tests and prove the regression fails without the fix — 075cb38b
- [ ] 2.2 Run the configured validation gate, review the PR, and finalize the issue-specific PR — targeted gate green; full `npm test` has unrelated failures; PR review remains

## Risks

An attachment library directory may be read-only or otherwise inaccessible. Directory preparation and granting must remain best-effort, and ordinary run attachments must continue working from their per-run folder.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Reproduce and fix the grant invariant

- [x] 1.1 Add a regression covering the first named live follow-up's advertised library and fixed `--add-dir` grant — dad8f65a
- [x] 1.2 Prepare the library directory at both initial and continuation session construction sites; keep hints best-effort — dad8f65a

### Phase 2: Validate and review

- [x] 2.1 Run targeted attachment tests and prove the regression fails without the fix — 075cb38b
- [ ] 2.2 Run the configured validation gate, review the PR, and finalize the issue-specific PR — targeted gate green; full `npm test` has unrelated failures; PR review remains
