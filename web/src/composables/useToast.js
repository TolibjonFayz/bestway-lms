import { readonly, ref } from 'vue'

/* One queue for the whole app — BwToastHost renders it once in App.vue. */
const toasts = ref([])
const timers = new Map()
let nextId = 0

const DEFAULT_DURATION = 5000

function dismiss(id) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function push(variant, title, options = {}) {
  const id = (nextId += 1)
  const { description = '', duration = DEFAULT_DURATION } = options

  toasts.value = [...toasts.value, { id, variant, title, description }]

  /* duration: 0 keeps the toast up until the user or the caller closes it. */
  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    )
  }
  return id
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    dismiss,
    clear: () => toasts.value.forEach((toast) => dismiss(toast.id)),
    success: (title, options) => push('success', title, options),
    warning: (title, options) => push('warning', title, options),
    error: (title, options) => push('error', title, options),
    info: (title, options) => push('info', title, options),
  }
}
