import { onScopeDispose, ref } from 'vue'

/* Reactive media query. Used where hiding one of two variants with CSS is not
   enough — mounting both would duplicate a dialog and its scroll container in
   the accessibility tree. */
export function useMediaQuery(query) {
  const list = window.matchMedia(query)
  const matches = ref(list.matches)
  const update = (event) => {
    matches.value = event.matches
  }

  list.addEventListener('change', update)
  onScopeDispose(() => list.removeEventListener('change', update))

  return matches
}

/** The breakpoint the student shell switches layouts at. */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}
