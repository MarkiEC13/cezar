# Execution plan — recognize OpenCode 2.x auth rows (issue #1270)

## Goal

Recognize verified OpenCode 2.x stored-credential rows and successful empty lists while preserving legacy summary parsing, ANSI handling, and conservative unknown/error behavior.

## Scope

- `packages/cezar/src/core/provider-auth.ts`
- `packages/cezar/src/core/provider-auth.test.ts`
- This execution plan

## Non-goals

- Other backend authentication behavior
- Service-port setup or live credential access
- Changes to OpenCode runner execution

## Implementation Plan

### Phase 1: Parser regression and fix

- [ ] 1.1 Add service fixtures for verified OpenCode 2.x non-empty and empty stored-credential rows, proving the pre-fix regression.
- [ ] 1.2 Extend the OpenCode parser minimally to recognize the 2.x row format without weakening legacy malformed-output guards.
- [ ] 1.3 Run targeted tests, full validation, review the diff, and publish the completed PR.

## Risks

The new output format must remain bounded to its verified shape; broad fallback parsing could turn malformed successful output into a false disconnected/connected result.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Parser regression and fix

- [ ] 1.1 Add service fixtures for verified OpenCode 2.x non-empty and empty stored-credential rows, proving the pre-fix regression.
- [ ] 1.2 Extend the OpenCode parser minimally to recognize the 2.x row format without weakening legacy malformed-output guards.
- [ ] 1.3 Run targeted tests, full validation, review the diff, and publish the completed PR.
