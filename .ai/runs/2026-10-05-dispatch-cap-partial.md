# Execution plan — dispatch cap partial reports

Goal: A dispatched autonomous child that exhausts cezar's existing 40 auto-continue cap must settle as an unfinished/non-success run and report `partial` to its parent, while a child that emits `CEZ:DONE` remains `done`.

Scope: `packages/cezar/src/runs/store.ts`, `packages/cezar/src/dispatch/engine.ts`, `packages/cezar/src/workflows/run.ts`, and focused dispatch/autonomous tests.

Non-goals: Implementing the unmerged `retry_limit` feature from PR #1186, changing missing-session continuation (#1193), or altering ordinary interactive/autonomous completion.

## Implementation plan

### Phase 1: Durable cap settlement

- [ ] 1.1 Persist the auto-continue-cap cause, clear it on a human continuation, and settle capped runs as failed/non-success.
- [ ] 1.2 Synthesize a partial dispatch report with the cap note and preserve ordinary completion.

### Phase 2: Regression coverage

- [ ] 2.1 Add isolated tests for cap report mapping and live cap settlement.
- [ ] 2.2 Run targeted tests and the configured validation gate.

## Risks

The marker must survive waiting and restart, but must not leak into a later human Continue. Existing `RunRecord` parsing is additive and optional for old state.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append — <commit sha> when a step lands. Do not rename step titles.

### Phase 1: Durable cap settlement

- [ ] 1.1 Persist the auto-continue-cap cause, clear it on a human continuation, and settle capped runs as failed/non-success.
- [ ] 1.2 Synthesize a partial dispatch report with the cap note and preserve ordinary completion.

### Phase 2: Regression coverage

- [ ] 2.1 Add isolated tests for cap report mapping and live cap settlement.
- [ ] 2.2 Run targeted tests and the configured validation gate.
