# Issue resolver audit — 2026-10-03

## Goal
Resolve five relevant uncovered bugs through independent child-owned PRs, with root-cause evidence, tests, and final independent review.

## Scope
Audited all 137 open issues and 97 open PRs via GitHub. Excluded reports referenced by open PRs and active claims. Ranked uncovered issues by lifecycle correctness, broken user actions, CI reliability, then accessibility. Selection is highest actionable priority among uncovered bugs, not a claim that cosmetic issues outrank already-owned defects.

| Issue | Impact | Child scope |
| --- | --- | --- |
| #689 | Inactivity can falsely report successful completion | workflow idle settlement and dedicated new regression tests; no server edits |
| #1232 | Settings accepts but discards idle timeout | workspace config write closure and dedicated route tests |
| #926 | Queued task screenshot messages fail | attachment/message handling; start after #1232 to prevent server overlap |
| #1148 | Late test writes can fail CI after teardown | workflow test cleanup helper and existing test teardowns; no production lifecycle edits or new #689 tests |
| #958 | Mobile disclosure target is too small | step-rail component and its tests |

## Non-goals
No merging to main, no duplicate implementations of covered issues, no broad feature work. The parent orchestrates only; children create and own PRs. Parent plan stays local to avoid an extra umbrella PR competing with the five requested fix PRs.

## Implementation Plan
Phase 1: audit and dispatch four independent fixes, then the queued attachment fix when the settings task settles.
Phase 2: inspect every child diff and reproduce reported checks; request corrections where needed.
Phase 3: dispatch exactly one final review task against the orchestration branch, explicitly including all child PR heads. Merge no unreviewed work. Separate PRs remain the deliverables; no aggregation merge is necessary.

## Risks
Some reports may already be fixed without issue references; children must reproduce before changing code. Full gate failures must remain visible. Dispatch API localhost was unreachable; verified the same tree at http://172.17.0.1:4321. Live model catalog includes gpt-5.6-luna. Maximum eight children; planned five implementations plus one final review.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Audit and fixes

- [x] 1.1 Audit open issues and select five uncovered bugs
- [ ] 1.2 Dispatch five child-owned fix PRs

### Phase 2: Verification

- [ ] 2.1 Validate child reports, diffs, and tests

### Phase 3: Final review

- [ ] 3.1 Dispatch one independent final review and resolve its findings
- [ ] 3.2 Report verified PR outcomes
