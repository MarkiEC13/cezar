import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AgentBackend, AgentRunSpec, AgentSession, AgentEvent } from '../core/agent-runner.ts';
import { RunStore } from '../runs/store.ts';
import { RunManager } from './run.ts';

const runnerState = vi.hoisted(() => ({ calls: [] as AgentRunSpec[], backend: '' as string }));
vi.mock('../core/runner-factory.ts', () => ({
  createRunner: () => ({
    startSession(spec: AgentRunSpec, _onEvent?: (event: AgentEvent) => void): AgentSession {
      runnerState.calls.push(spec);
      const missing = spec.resume === true;
      return {
        result: missing
          ? Promise.reject(new Error(
              runnerState.backend === 'opencode'
                ? 'GET /session/old-session → 404 not found'
                : runnerState.backend === 'codex'
                  ? 'no rollout found for thread old-session'
                  : 'No conversation found with session ID old-session',
            ))
          : Promise.resolve({ text: 'fresh session completed', sessionId: 'fresh-session' }),
        open: true,
        sendMessage: () => false,
        end: () => undefined,
        interrupt: () => undefined,
      };
    },
  }),
}));

describe('missing-session Continue fallback lifecycle', () => {
  const oldEnv = { CEZ_DRY_RUN: process.env.CEZ_DRY_RUN, CEZ_DISABLE_REPO_LOCK: process.env.CEZ_DISABLE_REPO_LOCK };
  const backends = ['claude', 'codex', 'opencode'] as const;

  afterEach(() => {
    if (oldEnv.CEZ_DRY_RUN === undefined) delete process.env.CEZ_DRY_RUN;
    else process.env.CEZ_DRY_RUN = oldEnv.CEZ_DRY_RUN;
    if (oldEnv.CEZ_DISABLE_REPO_LOCK === undefined) delete process.env.CEZ_DISABLE_REPO_LOCK;
    else process.env.CEZ_DISABLE_REPO_LOCK = oldEnv.CEZ_DISABLE_REPO_LOCK;
  });

  it.each(backends)('retries %s once with portable context and settles the run', async (backend) => {
    process.env.CEZ_DRY_RUN = '1';
    process.env.CEZ_DISABLE_REPO_LOCK = '1';
    runnerState.backend = backend;
    runnerState.calls = [];
    const repoRoot = mkdtempSync(join(tmpdir(), `cez-missing-${backend}-`));
    const store = RunStore.open(join(repoRoot, '.ai/cezar'));
    const manager = new RunManager(store, repoRoot);
    try {
      const record = store.createRun({
        title: 'recover',
        workflow: 'quick-task',
        task: 'recover the task',
        runner: backend,
        steps: [{ id: 'task', name: 'Task', kind: 'agent', backend }],
      });
      store.updateRun(record.id, { status: 'done', finishedAt: new Date().toISOString() });
      store.updateStep(record.id, 'task', { status: 'done', sessionId: 'old-session', backend });
      const attachmentPath = join(repoRoot, 'notes.txt');
      writeFileSync(attachmentPath, 'attachment');
      store.addStep(record.id, { id: 'continue-1', name: 'Continue', kind: 'agent' });

      const internals = manager as unknown as { runContinuation: (...args: unknown[]) => Promise<void> };
      await internals.runContinuation(
        record.id,
        'continue-1',
        'old-session',
        backend,
        'recover the task',
        [],
        [],
        [{ name: 'notes.txt', url: '/api/v1/runs/notes.txt', path: attachmentPath }],
      );

      expect(runnerState.calls).toHaveLength(2);
      expect(runnerState.calls[0]?.resume).toBe(true);
      expect(runnerState.calls[1]?.resume).toBe(false);
      expect(runnerState.calls[1]?.userPrompt).toContain('recover the task');
      expect(runnerState.calls[1]?.userPrompt).toContain(attachmentPath);
      expect(store.getRun(record.id)?.status).toBe('done');
      expect(store.getRun(record.id)?.steps.find((step) => step.id === 'continue-1')?.status).toBe('done');
    } finally {
      manager.dispose();
      store.flush();
      rmSync(repoRoot, { recursive: true, force: true });
    }
  }, 30_000);
});
