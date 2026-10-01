# Fix queued screenshot attachments (#926)

## Goal

Make a screenshot pasted into the task-thread composer while a run is queued survive the send, render from the queued-message record, and reach the agent when the run dequeues.

## Scope

- Trace and fix the task-thread attachment submission and queued-message/dequeue path.
- Add focused web and server/workflow regression coverage.

## Non-goals

- Bookmark/new-task attachment flows.
- Pi streaming or event-history retention.
- Changes to the attachment library beyond what queued delivery requires.

## Implementation Plan

### Phase 1: Reproduce and isolate

- [ ] 1.1 Trace the browser request, queued record, attachment file, and dequeue input.
- [ ] 1.2 Add a regression test that fails on the current queued screenshot path.

### Phase 2: Correct and verify

- [ ] 2.1 Implement the minimal fix while preserving text-only queued messages.
- [ ] 2.2 Run focused tests and the configured validation gate.
- [ ] 2.3 Complete review/autofix and publish the ready PR.

## Risks

The queued path spans React composer state, the HTTP message endpoint, durable run records, and synchronous dequeue hydration; the fix must not duplicate or lose attachments during that handoff.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Reproduce and isolate

- [ ] 1.1 Trace the browser request, queued record, attachment file, and dequeue input.
- [ ] 1.2 Add a regression test that fails on the current queued screenshot path.

### Phase 2: Correct and verify

- [ ] 2.1 Implement the minimal fix while preserving text-only queued messages.
- [ ] 2.2 Run focused tests and the configured validation gate.
- [ ] 2.3 Complete review/autofix and publish the ready PR.
