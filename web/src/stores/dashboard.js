import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchDashboard } from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /* Only the very first load shows the skeleton; a retry or refresh keeps the
     current screen on-screen so nothing jumps. */
  const isFirstLoad = computed(() => loading.value && !data.value)
  const isEmpty = computed(() => Boolean(data.value?.isNew))

  async function load() {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchDashboard()
    } catch (cause) {
      error.value = cause
      /* Drop stale data so the error state is not drawn over a half-real page. */
      data.value = null
    } finally {
      loading.value = false
    }
  }

  function reset() {
    data.value = null
    error.value = null
    loading.value = false
  }

  return { data, loading, error, isFirstLoad, isEmpty, load, reset }
})
