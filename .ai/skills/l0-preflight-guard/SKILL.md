---
name: l0-preflight-guard
description: Pre-flight check ensuring no secrets leak, PII is sanitized, and git diff scope remains bounded before task completion.
---

# L0 Pre-flight Guard

Execute this verification step before committing changes or completing any task in Cezar:

## 1. Secrets & PII Check
Scan the content of modified files (`git diff --staged`, plus untracked files from `git status`) for:
- API keys and tokens matching any shape in `TOKEN_PATTERNS` (`packages/cezar/src/core/secret-redaction.ts`) — the canonical list cezar's own redaction uses: GitHub (`gh[pousr]_…`, `github_pat_…`), Anthropic/OpenAI (`sk-ant-…`, `sk-…`, including hyphenated keys), AWS (`AKIA…`, `ASIA…`), Google (`AIza…`, `ya29.…`), Slack (`xox[baprs]-…`), GitLab (`glpat-…`)
- Hardcoded tokens in configuration or test fixtures (obviously fake token-shaped strings in redaction tests, such as `secret-redaction.test.ts`, are expected and fine)
- Customer PII (unmasked emails, phone numbers, real personal records)

## 2. Scope Bounding
Verify that `git diff --stat` does not introduce unintended modifications to unrelated root configuration files or dependencies.
