import { describe, expect, it } from 'vitest';
import { isMissingSessionError } from './agent-runner.ts';

describe('isMissingSessionError', () => {
  it.each([
    ['claude', 'No conversation found with session ID abc'],
    ['codex', 'no rollout found for thread id abc'],
    ['opencode', 'GET /session/abc → 404 not found'],
  ] as const)('recognizes a missing %s session', (backend, message) => {
    expect(isMissingSessionError(message, backend)).toBe(true);
  });

  it.each([
    ['claude', 'authentication failed'],
    ['codex', 'network request failed'],
    ['opencode', 'GET /session/abc → 500 server error'],
  ] as const)('does not classify a %s operational failure as missing', (backend, message) => {
    expect(isMissingSessionError(message, backend)).toBe(false);
  });
});
