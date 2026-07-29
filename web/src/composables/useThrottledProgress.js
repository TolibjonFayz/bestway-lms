import { onScopeDispose, ref } from 'vue'

/** At most one progress call per this many milliseconds while playing. */
export const PROGRESS_INTERVAL_MS = 10_000

/* Reports watched percentage without flooding the API: the first call goes
   straight out, then further ticks are collapsed into a single trailing call
   once the window elapses. flush() bypasses the window — pause and unmount
   must land immediately, otherwise closing the tab loses the last stretch. */
export function useThrottledProgress(send, intervalMs = PROGRESS_INTERVAL_MS) {
  const lastSentValue = ref(null)
  const inFlight = ref(false)

  let lastSentAt = 0
  let pendingValue = null
  let timer = null

  async function dispatch(value) {
    if (value === null || value === lastSentValue.value) return
    lastSentAt = Date.now()
    lastSentValue.value = value
    inFlight.value = true
    try {
      await send(value)
    } finally {
      inFlight.value = false
    }
  }

  function report(value) {
    pendingValue = value
    if (timer) return

    const waited = Date.now() - lastSentAt
    if (waited >= intervalMs) {
      const next = pendingValue
      pendingValue = null
      void dispatch(next)
      return
    }

    timer = setTimeout(() => {
      timer = null
      const next = pendingValue
      pendingValue = null
      void dispatch(next)
    }, intervalMs - waited)
  }

  /** Send whatever is pending right now — used on pause and on unmount. */
  async function flush(value = null) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    const next = value ?? pendingValue
    pendingValue = null
    await dispatch(next)
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    pendingValue = null
  }

  onScopeDispose(cancel)

  return { report, flush, cancel, lastSentValue, inFlight }
}
