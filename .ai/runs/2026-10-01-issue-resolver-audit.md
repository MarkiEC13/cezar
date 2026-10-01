# Issue audit — 2026-10-01

## Goal
Resolve the five most actionable uncovered bug reports through worker-owned PRs.

## Scope and ranking
Audited 121 open issues and 98 open PRs on open-mercato/cezar. Prioritize broken interaction and lost input, then common-path retention. High priority security #913 and stuck continuation #798 already have PRs #1003 and #860; do not duplicate. New follow-ups #1192/#1193 depend on pending upstream PRs; defer them. This is an actionable-work ranking, not a claim that #1204 has greater severity than covered issues.

1. #902: Pi token fragmentation loses structured question cards and lifecycle markers.
2. #903: same fragmentation makes transcript unreadable; combined worker/PR with #902.
3. #926: screenshot attachment submission fails while queued.
4. #874: bookmark autostart chooses unavailable runner and strands task.
5. #1204: common no-subagent sessions retain unbounded context boundaries.

## Implementation Plan
Four disjoint workers: Pi runner/tests; queued attachment endpoint/tests; bookmark autostart web/tests; event-history retention/tests. Each verifies root cause on current main, checks claims and covering PRs, uses om-auto-create-pr, owns fix/tests/PR/review and reports evidence. Parent only orchestrates and validates reports. Keep fixes in separate PRs; do not combine or merge them. One final review child reviews parent audit branch plus every worker PR SHA and evidence.

## Non-goals
No base merges, no duplicate fixes for covered issues, no unrelated features, no invented budget. No fallback to another model without reporting requested model unavailability.

## Risks
Codex discovery unavailable; request exact gpt-5.6-luna. Historical issues may already be fixed without closure; workers must prove defect. Child scopes must remain disjoint. Shared full validation can be resource intensive.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Independent fixes

- [ ] 1.1 Resolve Pi marker and transcript bugs #902 and #903
- [ ] 1.2 Resolve queued screenshot bug #926
- [ ] 1.3 Resolve bookmark unavailable runner bug #874
- [ ] 1.4 Bound no-subagent context history #1204

### Phase 2: Verification

- [ ] 2.1 Validate worker reports and PR evidence
- [ ] 2.2 Obtain final independent review verdict
