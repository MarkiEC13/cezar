# Allow longer prompt templates

## Goal

Allow reusable prompt templates to hold long skills such as unslop while retaining a bounded,
consistent limit across the API and cockpit.

## Scope

- Raise the prompt-template text limit from 2,000 to 20,000 characters in the contract-facing
  server validator and browser editor/normalizer.
- Add regression coverage for a valid long template and an oversized template rejection.
- Document the selected 20,000-character bound at the shared validation points.

## Non-goals

- Change generic run prompt limits, provider authentication, or prompt-template list/label limits.
- Add configuration for this bound.

## Implementation Plan

### Phase 1: Trace and define the bound

- [x] 1.1 Align the contract, server validator, and browser normalization/editor at 20,000 characters. — 1b89e450
- [x] 1.2 Add server and browser regression tests for accepted long input and oversized rejection. — 1b89e450

### Phase 2: Verify and publish

- [ ] 2.1 Run targeted tests, the full validation gate, and review the final diff.

## Risks

The prompt-template value is persisted in ui-state.json, so increasing the bounded field size
increases the maximum preference payload but remains capped and affects no existing valid data.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Trace and define the bound

- [ ] 1.1 Align the contract, server validator, and browser normalization/editor at 20,000 characters.
- [ ] 1.2 Add server and browser regression tests for accepted long input and oversized rejection.

### Phase 2: Verify and publish

- [ ] 2.1 Run targeted tests, the full validation gate, and review the final diff.
