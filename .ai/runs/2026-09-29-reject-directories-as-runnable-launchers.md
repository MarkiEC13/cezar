# Reject directories as runnable launchers

Goal: Fix #1066 so `resolveOnPath` only resolves executable regular files, while preserving executable symlinks, platform-specific `.com`/`.exe` probing, and Windows shell exclusions.

Scope: `packages/cezar/src/server/open-in-app.ts`, its focused tests, and the shared executable-file helper in `packages/cezar/src/core/claude-bin.ts` plus helper tests.

Non-goals: No changes to API contracts, launcher behavior outside these probes, tracker integrations, or unrelated cleanup.

## Implementation Plan

### Phase 1: Regression and shared guard

- [ ] 1.1 Add a hermetic regression test covering PATH directories, real executable files, symlinks, and Windows suffix behavior.
- [ ] 1.2 Reuse the existing regular-file executable helper from Claude resolution in `resolveOnPath`.

### Phase 2: Validation and delivery

- [ ] 2.1 Run the focused regression red before the fix and green after it, then run the configured validation gate.
- [ ] 2.2 Commit, push, open and finalize the issue PR with review evidence.

Risks: Filesystem probes must continue to follow executable symlinks and must not broaden the set of directly spawned Windows suffixes. The configured package dependency tree will be installed locally with `npm ci` if needed.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Regression and shared guard

- [ ] 1.1 Add a hermetic regression test covering PATH directories, real executable files, symlinks, and Windows suffix behavior.
- [ ] 1.2 Reuse the existing regular-file executable helper from Claude resolution in `resolveOnPath`.

### Phase 2: Validation and delivery

- [ ] 2.1 Run the focused regression red before the fix and green after it, then run the configured validation gate.
- [ ] 2.2 Commit, push, open and finalize the issue PR with review evidence.
