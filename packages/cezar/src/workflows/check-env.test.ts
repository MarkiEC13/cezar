import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
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

/**
 * The run context a check step gets (spec 2026-10-06-agentic-e2e-checks Phase 2): what it is
 * verifying, where, which attempt this is, and a cache shared across the project's worktrees.
 */
describe('run context for check steps', () => {
  let repoRoot: string;
  let store: RunStore;
  let manager: RunManager;
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(async () => {
    repoRoot = mkdtempSync(join(tmpdir(), 'cez-check-context-'));
    for (const key of ['CEZ_DRY_RUN', 'CEZ_RUN_ID', 'CEZ_GITHUB_NUMBER']) savedEnv[key] = process.env[key];
    process.env.CEZ_DRY_RUN = '1';
    // What a cezar started inside another cezar task inherits: it must never leak through.
    process.env.CEZ_RUN_ID = 'outer-task';
    process.env.CEZ_GITHUB_NUMBER = '999';
    await run('git', ['init', '-q', '-b', 'main'], { cwd: repoRoot });
    writeFileSync(join(repoRoot, 'a.txt'), 'one\n');
    await run('git', ['add', '-A'], { cwd: repoRoot });
    await run('git', [...GIT_ID, 'commit', '-q', '-m', 'base'], { cwd: repoRoot });
    store = RunStore.open(join(repoRoot, '.ai/cezar'));
    manager = new RunManager(store, repoRoot, { projectId: PROJECT });
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

  const contextOf = (runId: string, stepId: string, cwd: string) =>
    (manager as unknown as {
      checkStepEnv(runId: string, state: { cwd: string }, stepId: string): Promise<NodeJS.ProcessEnv>;
    }).checkStepEnv(runId, { cwd }, stepId);

  it('sets every run variable on a worktree run, and nothing GitHub- or PR-only', async () => {
    const record = manager.startRun(
      {
        name: 'implement-and-check',
        source: 'file',
        steps: [
          { id: 'implement', name: 'Implement', prompt: '{{task}}' },
          { id: 'verify', name: 'Verify', command: 'env | grep "^CEZ_" | sort > "$CEZ_WORKTREE/../check-env.txt"' },
        ],
      },
      { task: 'mock:done go' },
    );
    const terminal = new Set(['done', 'review', 'failed', 'cancelled']);
    const deadline = Date.now() + 25_000;
    while (!terminal.has(store.getRun(record.id)?.status ?? '')) {
      if (Date.now() > deadline) throw new Error('run did not finish in time');
      await new Promise((r) => setTimeout(r, 100));
    }
    const finished = store.getRun(record.id)!;
    expect(['done', 'review']).toContain(finished.status);
    const seen = Object.fromEntries(
      readFileSync(join(finished.worktreePath!, '..', 'check-env.txt'), 'utf8')
        .trim()
        .split('\n')
        .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
    );
    expect(seen).toMatchObject({
      CEZ_RUN_ID: record.id,
      CEZ_PROJECT_ID: PROJECT,
      CEZ_WORKTREE: finished.worktreePath,
      CEZ_BRANCH: finished.branch,
      CEZ_BASE: finished.baseBranch,
      CEZ_STEP_ID: 'verify',
      CEZ_ATTEMPT: '1',
    });
    expect(seen.CEZ_SHARED_CACHE_DIR).toBe(join(process.env.CEZ_HOME!, 'cache', PROJECT));
    // Absent, not empty — including the stale values this process inherited.
    for (const name of ['CEZ_GITHUB_REPO', 'CEZ_GITHUB_NUMBER', 'CEZ_GITHUB_EVENT', 'CEZ_PR_HEAD_SHA', 'CEZ_PR_HEAD_REF', 'CEZ_PR_BASE_REF']) {
      expect(seen).not.toHaveProperty(name);
    }
  }, 40_000);

  it('adds the GitHub provenance of an automation run', async () => {
    const record = store.createRun({ title: 't', workflow: 'w', task: 'x', steps: [{ id: 'verify', name: 'Verify', kind: 'check' }] });
    store.updateRun(record.id, {
      automation: {
        automationId: 'a1',
        automationRevision: 1,
        receiptId: 'r1',
        event: 'pull_request.opened',
        githubUrl: 'https://github.com/acme/shop/pull/42',
      },
    });
    const env = await contextOf(record.id, 'verify', repoRoot);
    expect(env).toMatchObject({ CEZ_GITHUB_REPO: 'acme/shop', CEZ_GITHUB_NUMBER: '42', CEZ_GITHUB_EVENT: 'pull_request.opened' });
    expect(env).not.toHaveProperty('CEZ_BRANCH');
  });

  it('counts the attempt from the step\'s own iterations', async () => {
    const record = store.createRun({ title: 't', workflow: 'w', task: 'x', steps: [{ id: 'verify', name: 'Verify', kind: 'check' }] });
    store.updateStep(record.id, 'verify', { iterations: 3 });
    expect((await contextOf(record.id, 'verify', repoRoot)).CEZ_ATTEMPT).toBe('3');
  });

  it('shares one 0700 cache directory per project, and a different one per project', async () => {
    const record = store.createRun({ title: 't', workflow: 'w', task: 'x', steps: [{ id: 'verify', name: 'Verify', kind: 'check' }] });
    const first = (await contextOf(record.id, 'verify', repoRoot)).CEZ_SHARED_CACHE_DIR!;
    const second = (await contextOf(record.id, 'verify', repoRoot)).CEZ_SHARED_CACHE_DIR!;
    expect(second).toBe(first);
    expect(statSync(first).mode & 0o777).toBe(0o700);
    const other = new RunManager(store, repoRoot, { projectId: 'another-project' });
    try {
      const theirs = await (other as unknown as {
        checkStepEnv(runId: string, state: { cwd: string }, stepId: string): Promise<NodeJS.ProcessEnv>;
      }).checkStepEnv(record.id, { cwd: repoRoot }, 'verify');
      expect(theirs.CEZ_SHARED_CACHE_DIR).not.toBe(first);
    } finally {
      other.dispose();
    }
  });
});
