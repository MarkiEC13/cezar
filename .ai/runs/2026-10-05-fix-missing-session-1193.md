# Execution plan — recover missing continuation sessions (issue #1193)

## Goal

When Continue cannot reopen a previously recorded Claude, Codex, or OpenCode session because the provider says that session is gone, retry once with bounded portable context and preserve the original reports, inbox messages, and attachments exactly once. Other provider errors and cancellation remain terminal.

## Scope

- `packages/cezar/src/core/agent-runner.ts`
- `packages/cezar/src/core/opencode-server-runner.ts`
- `packages/cezar/src/workflows/run.ts`
- continuation and backend regression tests

## Implementation plan

### Phase 1: Missing-session classification and fallback

- [x] 1.1 Classify only explicit missing-session responses per backend — `7074d62e`
- [x] 1.2 Retry a missing resumed session once with portable context and preserve cancellation/error behavior — `7074d62e`
- [x] 1.3 Resume OpenCode through `GET /session/:id` and keep normal new-session behavior — `7074d62e`

### Phase 2: Regression evidence

- [x] 2.1 Add classifier regression tests for Claude, Codex and OpenCode — `7074d62e`
- [ ] 2.2 Add real Continue lifecycle coverage for fallback context, reports/inbox, attachments, cancellation, and nonmissing errors.
- [ ] 2.3 Run the full validation gate and manual QA where configured.

## Status

Implementation is under independent review. The fallback attachment forwarding correction is pending on this PR.

## Outcome

The classifier and runner fallback are implemented; merge remains blocked until lifecycle regression evidence and the configured validation/QA gates are complete.

PR: #1281
