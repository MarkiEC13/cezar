# Issue #870 — constrain long model-picker descriptions

## Goal
Prevent CLI-provided model descriptions from clipping or widening the model picker at narrow viewports while preserving readable labels, row hit areas, and Radix keyboard navigation across all PickerPill consumers.

## Scope
- `packages/web/src/components/picker-pill.tsx`
- focused `packages/web/src/components/picker-pill.test.tsx`
- browser QA notes/screenshots if available

## Non-goals
- No changes to dropdown primitives, model discovery, picker callers, or global typography.
- No behavior changes to filtering, selection, disabled/status rows, or keyboard interaction.

## Implementation Plan

### Phase 1: reproduce and regression coverage

- [x] 1.1 Inspect current picker structure and establish the clipping cause. — ed09b343
- [x] 1.2 Add a focused regression assertion for constrained/wrapping descriptions. — ed09b343

### Phase 2: minimal responsive fix

- [x] 2.1 Apply the smallest utility-class change to the description layout and commit it. — ed09b343
- [ ] 2.2 Run focused tests and browser verification at 390px and desktop sizes.

### Phase 3: validation and handoff

- [ ] 3.1 Run configured validation gate and review the resulting diff.
- [ ] 3.2 Run authoritative PR review/autofix and publish evidence.

## Risks
The shared `PickerPill` renders runner, model, workflow, skill, variant, and branch menus; changing only description layout must not alter row focus or selection semantics.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: reproduce and regression coverage

- [ ] 1.1 Inspect current picker structure and establish the clipping cause.
- [ ] 1.2 Add a focused regression assertion for constrained/wrapping descriptions.

### Phase 2: minimal responsive fix

- [ ] 2.1 Apply the smallest utility-class change to the description layout and commit it.
- [ ] 2.2 Run focused tests and browser verification at 390px and desktop sizes.

### Phase 3: validation and handoff

- [ ] 3.1 Run configured validation gate and review the resulting diff.
- [ ] 3.2 Run authoritative PR review/autofix and publish evidence.
