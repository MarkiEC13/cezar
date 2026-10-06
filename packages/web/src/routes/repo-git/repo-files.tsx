import { ArrowLeftIcon, ChevronRightIcon, FileIcon, FolderIcon, FolderTreeIcon, ImageIcon, TriangleAlertIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ApiError } from '@/api/client'
import { useRepoTree } from '@/api/queries'
import { CenteredState } from '@/components/centered-state'
import { cn } from '@/lib/utils'

import { FilePreview } from '../task-git/file-preview'
import { buildPathTree, type PathTreeDir } from '../task-git/file-tree'
import { isImagePath } from '../task-git/worktree-files'

/**
 * `/git/files` — the project repository's own file browser (spec
 * `.ai/specs/2026-10-05-repo-file-browser.md`, #1279): the tree on the left from one
 * `GET /repo/tree`, the file on the right through the same `FilePreview` the run Files tab uses.
 *
 * The one structural difference from `/tasks/:id/files` is where the tree's shape comes from. A
 * worktree has no cheap whole-tree answer, so that tab fetches one listing per opened folder; a git
 * repository does, so this one takes the whole index in a single response. Expanding a folder then
 * costs nothing, and the Phase 2 filter is a pass over an array the browser already holds.
 *
 * Folders start CLOSED (a repository root fans out fast), except along the path to the selected
 * file, so `/git/files/packages/web/src/x.tsx` opens with its ancestors already expanded.
 */
export type RepoFileLeaf = { kind: 'file'; name: string; path: string }

export function RepoFilesSection({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (path: string | null) => void
}) {
  const tree = useRepoTree()

  // A 409 is the server's answer ("not a git repository"), not an outage.
  const refused = tree.isError && tree.error instanceof ApiError && tree.error.status === 409
  const paths = tree.data?.paths ?? []
  const root = useMemo(
    () => buildPathTree(paths, (path, name): RepoFileLeaf => ({ kind: 'file', name, path })),
    [paths],
  )

  if (tree.isPending) {
    return (
      <section data-slot="repo-files" className="flex min-h-0 flex-1 flex-col">
        <p data-slot="repo-files-loading" className="px-4 py-6 text-center text-xs text-soft-foreground md:px-6">
          Loading files…
        </p>
      </section>
    )
  }
  if (tree.isError) {
    return (
      <section data-slot="repo-files" className="flex min-h-0 flex-1 flex-col">
        <CenteredState
          icon={refused ? <FolderTreeIcon /> : <TriangleAlertIcon />}
          tone={refused ? 'neutral' : 'danger'}
          heading="h2"
          title={refused ? 'No files to browse' : 'Could not load the files'}
          subtitle={tree.error.message}
        />
      </section>
    )
  }
  if (paths.length === 0) {
    return (
      <section data-slot="repo-files" className="flex min-h-0 flex-1 flex-col">
        <CenteredState
          icon={<FolderTreeIcon />}
          tone="neutral"
          heading="h2"
          title="No files yet"
          subtitle="Nothing is tracked in this repository. Files show up here once git knows about them."
        />
      </section>
    )
  }

  return (
    <section data-slot="repo-files" className="flex min-h-0 flex-1 flex-col">
      {tree.data.truncated ? (
        <p
          data-slot="repo-files-truncated"
          role="status"
          className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground md:px-6"
        >
          Showing the first {paths.length.toLocaleString()} files; this repository has more. The
          tree and the filter cover only what is loaded.
        </p>
      ) : null}

      {/* Unlike the Changes views, the tree is NOT hidden below `md`: it is the only way to pick a
          file. The two panes swap instead — the tree IS the view until something is selected, and
          a back control returns to it. */}
      <div className="flex min-h-0 flex-1 flex-col items-stretch gap-5 px-4 py-4 [--diff-sticky-top:7rem] md:flex-row md:items-start md:px-6">
        <aside
          data-slot="repo-files-tree-pane"
          className={cn(
            'w-full shrink-0 md:sticky md:top-[var(--diff-sticky-top)] md:block md:max-h-[calc(100dvh_-_var(--diff-sticky-top)_-_1rem)] md:w-60 md:overflow-y-auto md:overscroll-contain lg:w-72',
            selected !== null && 'hidden',
          )}
        >
          <RepoFileTree root={root} selected={selected} onSelect={onSelect} />
        </aside>

        <div className={cn('min-w-0 flex-1', selected === null && 'hidden md:block')}>
          {selected !== null ? (
            <button
              type="button"
              data-slot="repo-files-back"
              onClick={() => onSelect(null)}
              className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground md:hidden"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
              Back to the file tree
            </button>
          ) : null}
          <FilePreview source={{ kind: 'repo' }} path={selected} />
        </div>
      </div>
    </section>
  )
}

/** The ancestors of `path` — `a/b/c.ts` → `['a', 'a/b']` — so a deep link opens expanded. */
export function ancestorsOf(path: string | null): Set<string> {
  const open = new Set<string>()
  if (path === null) return open
  const segments = path.split('/')
  // The last segment is the file itself; compaction means a row's `path` is its DEEPEST segment,
  // so every prefix is recorded and the tree matches on whichever one it actually renders.
  for (let i = 1; i < segments.length; i += 1) open.add(segments.slice(0, i).join('/'))
  return open
}

function RepoFileTree({
  root,
  selected,
  onSelect,
}: {
  root: PathTreeDir<RepoFileLeaf>
  selected: string | null
  onSelect: (path: string) => void
}) {
  const expanded = useMemo(() => ancestorsOf(selected), [selected])
  return (
    <nav data-slot="repo-files-tree" aria-label="Repository files" className="min-w-0 text-[13px]">
      <ul className="flex flex-col gap-px">
        <DirChildren dir={root} depth={0} expanded={expanded} selected={selected} onSelect={onSelect} />
      </ul>
    </nav>
  )
}

function DirChildren({
  dir,
  depth,
  expanded,
  selected,
  onSelect,
}: {
  dir: PathTreeDir<RepoFileLeaf>
  depth: number
  expanded: Set<string>
  selected: string | null
  onSelect: (path: string) => void
}) {
  // Dirs first, then files — both already sorted by the builder.
  return (
    <>
      {dir.dirs.map((child) => (
        <DirNode
          key={child.path}
          dir={child}
          depth={depth}
          expanded={expanded}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
      {dir.files.map((file) => (
        <FileNode
          key={file.path}
          file={file}
          depth={depth}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

function DirNode({
  dir,
  depth,
  expanded,
  selected,
  onSelect,
}: {
  dir: PathTreeDir<RepoFileLeaf>
  depth: number
  expanded: Set<string>
  selected: string | null
  onSelect: (path: string) => void
}) {
  // `expanded` seeds the initial state only: once a user has opened or closed a folder, their
  // choice outlives the next selection within it.
  const [open, setOpen] = useState(() => expanded.has(dir.path))
  return (
    <li>
      <button
        type="button"
        data-slot="repo-files-dir"
        data-path={dir.path}
        data-state={open ? 'open' : 'closed'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center gap-1.5 rounded-sm px-1.5 py-1 text-left text-muted-foreground hover:bg-muted hover:text-foreground"
        style={{ paddingLeft: `${6 + depth * 14}px` }}
      >
        <ChevronRightIcon
          aria-hidden="true"
          className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-90')}
        />
        <FolderIcon aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="min-w-0 truncate font-medium">{dir.name}</span>
      </button>
      {open ? (
        <ul className="flex flex-col gap-px">
          <DirChildren dir={dir} depth={depth + 1} expanded={expanded} selected={selected} onSelect={onSelect} />
        </ul>
      ) : null}
    </li>
  )
}

function FileNode({
  file,
  depth,
  selected,
  onSelect,
}: {
  file: RepoFileLeaf
  depth: number
  selected: string | null
  onSelect: (path: string) => void
}) {
  const active = selected === file.path
  const Icon = isImagePath(file.path) ? ImageIcon : FileIcon
  return (
    <li>
      <button
        type="button"
        data-slot="repo-files-file"
        data-path={file.path}
        aria-current={active ? 'true' : undefined}
        onClick={() => onSelect(file.path)}
        className={cn(
          'flex w-full min-w-0 items-center gap-1.5 rounded-sm px-1.5 py-1 text-left hover:bg-muted',
          active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
        style={{ paddingLeft: `${24 + depth * 14}px` }}
      >
        <Icon aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="min-w-0 truncate">{file.name}</span>
      </button>
    </li>
  )
}
