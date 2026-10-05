import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildChildEnv } from '../core/agent-env.ts';
import { RunStore } from '../runs/store.ts';
import { CheckEnv } from '../workspace/check-env.ts';
import { RunManager } from './run.ts';
import type { WorkflowDef } from './types.ts';

const run = promisify(execFile);
const GIT_ID = ['-c', 'user.name=test', '-c', 'user.email=test@local'];
const PROJECT = 'check-env-project';

/**
 * Project check credentials reach CHECK steps only (spec 2026-10-06-agentic-e2e-checks Phase 1).
 *
 * The old advice — export the e2e model key before starting cezar — put the key in
 * `process.env`, where `buildChildEnv`'s prefix matching handed `ANTHROPIC_API_KEY` to every
 * Claude Code session and silently switched it to API billing. These tests pin the replacement:
 * the check sees the value, no agent env can, and a failing check's output is scrubbed before it
 * becomes the next agent prompt.
 */
describe('project check credentials in check steps', () => {
  let repoRoot: string;
  let store: RunStore;
  let manager: RunManager;
  let checkEnv: CheckEnv;
  let stdinLog: string;
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(async () => {
    repoRoot = mkdtempSync(join(tmpdir(), 'cez-check-env-'));
    for (const key of ['CEZ_DRY_RUN', 'CEZ_MOCK_STDIN_FILE']) savedEnv[key] = process.env[key];
    process.env.CEZ_DRY_RUN = '1';
    stdinLog = join(repoRoot, '.mock-stdin.ndjson');
    process.env.CEZ_MOCK_STDIN_FILE = stdinLog;
    await run('git', ['init', '-q', '-b', 'main'], { cwd: repoRoot });
    writeFileSync(join(repoRoot, 'a.txt'), 'one\n');
    await run('git', ['add', '-A'], { cwd: repoRoot });
    await run('git', [...GIT_ID, 'commit', '-q', '-m', 'base'], { cwd: repoRoot });
    store = RunStore.open(join(repoRoot, '.ai/cezar'));
    checkEnv = new CheckEnv();
    manager = new RunManager(store, repoRoot, { projectId: PROJECT, checkEnv });
  });

  afterEach(() => {
    manager.dispose();
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    store.flush();
    rmSync(repoRoot, { recursive: true, force: true });
  });

  const settle = async (id: string): Promise<void> => {
    const terminal = new Set(['done', 'review', 'failed', 'cancelled']);
    const deadline = Date.now() + 25_000;
    while (!terminal.has(store.getRun(id)?.status ?? '')) {
      if (Date.now() > deadline) throw new Error('run did not finish in time');
      await new Promise((r) => setTimeout(r, 100));
    }
  };

  const checkOutputs = (id: string): string[] =>
    readFileSync(join(repoRoot, '.ai/cezar/runs', `${id}.ndjson`), 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as { type: string; text?: string })
      .filter((event) => event.type === 'check-output')
      .map((event) => event.text ?? '');

  const checkOnly = (command: string): WorkflowDef => ({
    name: 'implement-and-check',
    source: 'file',
    steps: [
      { id: 'implement', name: 'Implement', prompt: '{{task}}' },
      { id: 'verify', name: 'Verify', command },
    ],
  });

  it('hands a stored value to the check step', async () => {
    await checkEnv.set(PROJECT, repoRoot, 'E2E_FLAG', 'on');
    const record = manager.startRun(checkOnly('echo "flag=$E2E_FLAG"'), { task: 'mock:done go', worktree: false });
    await settle(record.id);

    expect(store.getRun(record.id)?.status).toBe('done');
    expect(checkOutputs(record.id)).toEqual(['flag=on']);
  }, 30_000);

  it('never puts a check credential where an agent env can see it', async () => {
    const key = 'sk-ant-api03-checkonlycheckonlycheckonly';
    await checkEnv.set(PROJECT, repoRoot, 'ANTHROPIC_API_KEY', key);
    await checkEnv.set(PROJECT, repoRoot, 'FOO', 'check-only-value');
    const record = manager.startRun(checkOnly('test "$FOO" = check-only-value'), {
      task: 'mock:done go',
      worktree: false,
    });
    await settle(record.id);

    // The check got both; the run passed only because `FOO` was there.
    expect(store.getRun(record.id)?.status).toBe('done');
    // The regression pin: nothing reached `process.env`, so no backend's prefix curation
    // (claude: ANTHROPIC_*, codex: OPENAI_*, opencode/pi: the multi-provider list) can pass it on.
    expect(process.env.ANTHROPIC_API_KEY).not.toBe(key);
    expect(process.env.FOO).toBeUndefined();
    for (const backend of ['claude', 'codex', 'opencode'] as const) {
      const env = buildChildEnv({ backend });
      expect(env.ANTHROPIC_API_KEY).not.toBe(key);
      expect(env.FOO).toBeUndefined();
    }
  }, 30_000);

  it('scrubs a failing check\'s output before it becomes the next agent prompt', async () => {
    const credential = 'e2e-credential-value-0123456789';
    const token = 'sk-ant-api03-leakedleakedleakedleaked';
    await checkEnv.set(PROJECT, repoRoot, 'E2E_GATEWAY_KEY', credential);
    const workflow: WorkflowDef = {
      name: 'implement-and-check',
      source: 'file',
      steps: [
        { id: 'implement', name: 'Implement', prompt: '{{task}}' },
        {
          id: 'verify',
          name: 'Verify',
          command: `echo "auth failed with $E2E_GATEWAY_KEY and ${token}"; exit 1`,
          onFail: { retry: 'implement', max: 1 },
        },
      ],
    };
    const record = manager.startRun(workflow, { task: 'mock:done fix it', worktree: false });
    await settle(record.id);

    const prompts = readFileSync(stdinLog, 'utf8')
      .trim()
      .split('\n')
      .map((line) => (JSON.parse(line) as { userText: string }).userText);
    const retried = prompts.find((text) => text.includes('A verification command failed'));
    expect(retried).toBeDefined();
    expect(retried).toContain('[REDACTED]');
    expect(retried).not.toContain(credential);
    expect(retried).not.toContain(token);
  }, 40_000);

  it('without a check-env file the check runs with the server env, unchanged', async () => {
    process.env.CEZ_CHECK_ENV_GUARD_PROBE = 'server-value';
    try {
      const record = manager.startRun(checkOnly('echo "$CEZ_CHECK_ENV_GUARD_PROBE"'), {
        task: 'mock:done go',
        worktree: false,
      });
      await settle(record.id);
      expect(store.getRun(record.id)?.status).toBe('done');
      expect(checkOutputs(record.id)).toEqual(['server-value']);
    } finally {
      delete process.env.CEZ_CHECK_ENV_GUARD_PROBE;
    }
  }, 30_000);
});
