# Execution plan: shooting star on the `/new` hero

Goal: Add a subtle shooting-star streak to the `/new` composer hero that repeats on an approximately 10-second CSS cycle while remaining fully decorative and motion-safe.

Scope: `packages/web/src/routes/new-task.tsx`, the reusable decorative component in `packages/web/src/components/centered-state.tsx`, its unit tests, and the motion section of `packages/web/src/styles/index.css`.

Non-goals:

- Change composer controls, task submission, or persisted data.
- Add a JavaScript particle system or animation dependency.
- Extend the shooting star to review panels or generic centered empty states.
- Change public APIs, CLI behavior, or compatibility surfaces.

Implementation Plan:

### Phase 1: Decorative component

1.1 Add a separately mounted, aria-hidden and pointer-transparent shooting-star sibling for the `/new` hero, with a theme-token trail and a `--cycle: 10s` style contract.

1.2 Add CSS motion rules and keyframes that animate the streak only under `prefers-reduced-motion: no-preference`; keep the reduced-motion rendering static.

### Phase 2: Coverage and verification

2.1 Mount the effect only on the normal `/new` composer hero and add unit assertions for placement contract, accessibility, theme-token styling, and cadence.

2.2 Run the targeted web unit/design checks and the complete configured validation gate, then review the final diff for scope and accessibility regressions.

Risks: This is an isolated visual-only change, but CSS stacking and reduced-motion behavior must not obscure the composer or make existing backdrop tests brittle.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Decorative component

- [ ] 1.1 Add a separately mounted, aria-hidden and pointer-transparent shooting-star sibling for the `/new` hero, with a theme-token trail and a `--cycle: 10s` style contract.
- [ ] 1.2 Add CSS motion rules and keyframes that animate the streak only under `prefers-reduced-motion: no-preference`; keep the reduced-motion rendering static.

### Phase 2: Coverage and verification

- [ ] 2.1 Mount the effect only on the normal `/new` composer hero and add unit assertions for placement contract, accessibility, theme-token styling, and cadence.
- [ ] 2.2 Run the targeted web unit/design checks and the complete configured validation gate, then review the final diff for scope and accessibility regressions.
