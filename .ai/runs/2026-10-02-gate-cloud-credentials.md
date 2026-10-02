# Gate cloud credential unlock on backend identity

Closes #850

## Goal

Prevent a non-Claude backend from receiving Bedrock or Vertex credentials merely because its environment allowlist contains a `CLAUDE_` prefix, while preserving Claude and `claude-cli` cloud toggles.

## Scope

- `packages/cezar/src/core/agent-env.ts`
- `packages/cezar/src/core/agent-env.test.ts`

Non-goals: changing which ordinary environment variables each backend receives, changing the Claude cloud toggle semantics, or changing the full-environment escape hatch.

## Implementation Plan

### Phase 1: Explicit identity gate

- [x] 1.1 Replace prefix-shape cloud gating with an explicit Claude backend identity check. — 09406b82
- [x] 1.2 Add regression coverage for Claude, `claude-cli`, and non-Claude backends. — 09406b82

### Phase 2: Verification and delivery

- [x] 2.1 Run targeted tests and prove the regression fails against the pre-fix implementation. — 09406b82
- [ ] 2.2 Run the full configured validation gate, review the diff, and open the issue PR.

## Risks

The main risk is accidentally changing Claude or `claude-cli` toggle behavior; tests pin both identities and both cloud families. The change is limited to environment construction.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Explicit identity gate

- [x] 1.1 Replace prefix-shape cloud gating with an explicit Claude backend identity check. — 09406b82
- [x] 1.2 Add regression coverage for Claude, `claude-cli`, and non-Claude backends. — 09406b82

### Phase 2: Verification and delivery

- [x] 2.1 Run targeted tests and prove the regression fails against the pre-fix implementation. — 09406b82
- [ ] 2.2 Run the full configured validation gate, review the diff, and open the issue PR. — baseline failures documented
