import { onScopeDispose, ref } from 'vue'

/* A shared ticking clock. The join button has to unlock on its own while the
   student is sitting on the page, so time has to be reactive rather than read
   once at render. */
export function useNow(intervalMs = 15_000) {
  const now = ref(new Date())
  const timer = setInterval(() => {
    now.value = new Date()
  }, intervalMs)

  onScopeDispose(() => clearInterval(timer))

  return now
}
