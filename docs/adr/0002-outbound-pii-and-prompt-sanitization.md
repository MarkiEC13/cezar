# First-Turn Task Ingestion Sanitization & Outbound PII Guard

**Status: Proposed — not implemented.** Nothing below exists in cezar yet; this ADR records the
design agreed for #1156 so the implementation has a target. Tracking issue: #1156.

## Context

Cezar implements inbound secret redaction (#427) via `packages/cezar/src/core/secret-redaction.ts` and `packages/cezar/src/runs/stream-redaction.ts`. This protects the web cockpit and persisted transcripts from storing credentials dumped by agent tool execution (`printenv`, etc.).

However, when composing tasks or attaching context briefs, users and integrations risk injecting raw credentials or customer PII into the initial prompt handed to vendor runners (`claude`, `codex`, `cursor`, `opencode`).

### Explicit Seam & Scope Boundaries
To remain architecturally honest:
- **In-Scope (First-Turn Ingestion Seam):** Sanitization covers text composed by Cezar and handed to a runner on turn 1: task descriptions, continuation context, attached prompt briefs, and system-prompt augmentations (`--append-system-prompt` or prepended prompt blocks).
- **Out-of-Scope (Sub-process Tool Calls):** This hook does **not** act as an egress proxy or inspect subsequent vendor CLI tool executions (e.g. if an agent runs `cat .env` on turn 2+ inside the spawned vendor process). Those require vendor-specific hooks or an external egress proxy.

## Decision

1. **Validation & Warning Gate over Silent Destructive Redaction:**
   - Blindly replacing email addresses or identifiers with `[REDACTED]` in task prompts causes severe semantic degradation (e.g. `git log --author=alice@corp.com` becomes `git log --author=[REDACTED]`).
   - Therefore, the first-turn outbound guard functions primarily as a **Validation / Rejection Gate**:
     - If a well-known credential token is detected in the composed task prompt, the runner rejects dispatch with an actionable error (`Task contains raw credentials; please remove before dispatch`). "Well-known" means the `TOKEN_PATTERNS` list in `packages/cezar/src/core/secret-redaction.ts` — the gate reuses that list rather than keeping its own, so inbound scrubbing and outbound rejection cannot drift apart.
     - In the web cockpit composer, warnings are displayed before queuing the run.
2. **Flag Semantics & Blast Radius:**
   - **Secrets Guard:** Tied to `CEZ_REDACT_SECRETS` (opt-out, default active; `CEZ_REDACT_SECRETS=0` disables). Today that flag only governs scrubbing of on-disk state (the NDJSON transcript and `runs.json`); reusing it for a dispatch gate widens what it means, so the implementation must update its entry in `docs/reference.md` and `.env.example` in the same change. Because rejecting dispatch changes the default path, the gate needs an escape hatch other than disabling all on-disk redaction — a task that legitimately quotes a token shape (a redaction test fixture, for example) must still be dispatchable.
   - **PII Guard:** Strictly **opt-in** via `CEZ_REDACT_PII=1` (default **disabled**). Because email patterns collide with git author identities, `Co-Authored-By:` trailers, CODEOWNERS, and package manifests, PII scanning must remain off by default until backed by an established false-positive test corpus. `CEZ_REDACT_PII` is a new env var and lands in `.env.example` and `docs/reference.md` together with its implementation.
3. **Attestation Separation:**
   - Report honesty and `[EXECUTED]` vs `[REASONED]` verification are orthogonal to sanitization and are tracked in a separate proposal (#1155).

## Consequences

- Accidental credential pasting into task orders is caught deterministically before invoking vendor CLIs.
- Prompt intent is preserved: task orders are not silently corrupted into unactionable requests.
- Low false-positive risk on default installations — the default gate matches only the prefixed credential shapes above, not free text — but not zero: a prompt quoting a realistic `sk-…` or `ghp_…` string is rejected. PII protection is opt-in for enterprise deployments handling sensitive customer datasets.
