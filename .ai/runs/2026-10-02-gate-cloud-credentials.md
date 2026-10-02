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
- [ ] 2.2 Run the full configured validation gate, review the diff, and open the issue PR. — baseline failures documented; review follow-up pending

## Risks

The main risk is accidentally changing Claude or `claude-cli` toggle behavior; tests pin both identities and both cloud families. The change is limited to environment construction.

## Validation notes

With task metadata unset and `TMPDIR=/tmp`, the focused regression passes 36/36. Against the original prefix-based gate, the new test fails on the actual AWS assertion: `AWS_SECRET_ACCESS_KEY` is forwarded to codex after its allowlist is given `CLAUDE_`; Vertex assertions are included in the same negative control. The full current-branch suite is 8,585 passed / 3 failed. Exact failures: `packages/web/src/routes/repo-git/repo-git.test.tsx > the repo view Changes segment > a clean tree renders the honest empty state`, `packages/cezar/src/workflows/agent-profile-wiring.test.ts > RunManager agent-profile resolution > adds NOTHING for the default account — the zero-config env is untouched`, and `packages/cezar/src/workflows/system-prompt.test.ts > the global follow-up gate (dry run) > without CEZ_FOLLOWUPS the agent is never told about the inbox`. The same focused baseline run on `origin/main` passes repo-git and reproduces the latter two failures; none touches the changed files.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Explicit identity gate

- [x] 1.1 Replace prefix-shape cloud gating with an explicit Claude backend identity check. — 09406b82
- [x] 1.2 Add regression coverage for Claude, `claude-cli`, and non-Claude backends. — 09406b82

### Phase 2: Verification and delivery

- [x] 2.1 Run targeted tests and prove the regression fails against the pre-fix implementation. — 09406b82
- [ ] 2.2 Run the full configured validation gate, review the diff, and open the issue PR. — baseline failures documented; review follow-up pending
