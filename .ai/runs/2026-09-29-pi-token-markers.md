# Pi token marker and v1 block repair

Goal: keep Pi's token-sized RPC deltas live in v2 while emitting complete v1 assistant blocks so CEZ control markers are assembled and prose is not rendered one line per token.

Scope: `packages/cezar/src/core/pi-runner.ts`, the Pi runner's focused regression tests, and Pi protocol fixtures/helper code only. `workflows/run.ts` and `packages/web` are non-goals.

Implementation plan:

1. Reproduce the Pi RPC shapes from issues #902/#903, including split `CEZ:ASK`, `CEZ:DONE`, and `CEZ:MONITORING` markers and tool events between prose deltas.
2. Harden the Pi seam's v1 coalescing boundary if reproduction exposes a remaining ordering or duplicate-snapshot defect, preserving v2 delta streaming.
3. Run focused tests, prove the regression tests fail against the pre-fix implementation, then run the configured validation gate.

Risks: Pi's RPC message snapshots can be cumulative while text deltas are incremental; a fix must not emit the cumulative snapshot twice or suppress a partial turn at EOF.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append — <commit sha> when a step lands.

### Phase 1: Reproduce and repair

- [x] 1.1 Add regression coverage for marker assembly and interleaved tool events
- [x] 1.2 Implement the minimal Pi seam fix
- [ ] 1.3 Validate focused and full gates
