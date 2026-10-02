# Quiesce late Codex teardown events

Issue: #1105

## Goal

Prevent Codex session events emitted after cezar teardown from writing to a removed run store or escaping a floating follow-up promise, while preserving synchronous event-delivery failures during a live session.

## Scope

- `packages/cezar/src/core/codex-app-server-runner.ts`: close the event-delivery gate at teardown and skip late v1 events, including the floating follow-up failure path.
- `packages/cezar/src/core/codex-app-server-runner.test.ts`: deterministic regression coverage for a rejected follow-up after teardown and the live callback-error boundary.

Non-goals: `run.ts`, `mock-claude.mjs`, CI reporter changes, broad RunStore error handling, or changes to the sibling #1221 work.

## Implementation Plan

### Phase 1: Reproduce and fix

- [x] 1.1 Add a deterministic regression proving teardown does not deliver late Codex events into a removed store. — f2baa15d
- [x] 1.2 Gate Codex event delivery at teardown without swallowing live callback failures. — f2baa15d

### Phase 2: Verify and ship

- [x] 2.1 Run targeted and full configured validation, inspect the final diff, and open the PR for #1105. — 64ef54fc

## Risks

Suppressing post-teardown lifecycle events is intentional: the owning run is already cancelling and its storage may be gone. The gate must not apply while a session is live, so active-store corruption remains a thrown error.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append — `<commit sha>` when a step lands.

### Phase 1: Reproduce and fix

- [x] 1.1 Add a deterministic regression proving teardown does not deliver late Codex events into a removed store. — f2baa15d
- [x] 1.2 Gate Codex event delivery at teardown without swallowing live callback failures. — f2baa15d

### Phase 2: Verify and ship

- [x] 2.1 Run targeted and full configured validation, inspect the final diff, and open the PR for #1105. — 64ef54fc
