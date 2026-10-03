/**
 * The picks on an unanswered multi-question ask card (#1247), held outside the card.
 *
 * The card is a thread row, and a row does not live as long as its question: a virtualized
 * thread unmounts every row that scrolls out of view, crossing the virtualization threshold
 * replaces the rows container, and leaving the task unmounts the whole thread. Component state
 * died with each of those, so a four-question card came back with its earlier picks silently
 * gone and Send disabled for a reason nobody could see.
 *
 * In memory for the life of the tab, keyed by run and ask: a remount within the SPA is the
 * failure, and a reload re-renders the card fresh, which is honest. An entry is dropped when
 * its ask resolves, so the map holds only questions still waiting for an answer.
 */

export type AskSelections = Record<number, string[]>

const store = new Map<string, AskSelections>()

const keyOf = (runId: string, askId: string) => `${runId}\u0000${askId}`

export function readAskSelections(runId: string, askId: string): AskSelections {
  return store.get(keyOf(runId, askId)) ?? {}
}

export function writeAskSelections(runId: string, askId: string, selections: AskSelections): void {
  store.set(keyOf(runId, askId), selections)
}

export function forgetAskSelections(runId: string, askId: string): void {
  store.delete(keyOf(runId, askId))
}

/** Test isolation. */
export function resetAskSelections(): void {
  store.clear()
}
