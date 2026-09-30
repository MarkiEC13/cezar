# Fix header Continue runner/model selection (#887)

## Goal

Make desktop and mobile Session-header Continue use the visible composer runner/model selection.

## Scope

`packages/web/src/routes/task-thread/task-thread.tsx`, `run-header.tsx`, `follow-up-engine.tsx`, and focused tests. No server/API changes; no changes to markdown or new-task routes.

## Implementation Plan

### Phase 1: Shared Session continuation

- [x] 1.1 Route both header Continue controls through the Session composer continuation action. — a40719ca
- [x] 1.2 Add regression coverage for desktop and mobile controls and preserve standalone behavior. — a40719ca

### Phase 2: Verification and handoff

- [ ] 2.1 Run focused tests and the configured validation gate.
- [ ] 2.2 Create and review a separate issue PR.

## Risks

The local dependency tree currently resolves stale/incompatible workspace artifacts; validation may be blocked independently of this change.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append — `<commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Shared Session continuation

- [ ] 1.1 Route both header Continue controls through the Session composer continuation action.
- [ ] 1.2 Add regression coverage for desktop and mobile controls and preserve standalone behavior.

### Phase 2: Verification and handoff

- [ ] 2.1 Run focused tests and the configured validation gate.
- [ ] 2.2 Create and review a separate issue PR.
