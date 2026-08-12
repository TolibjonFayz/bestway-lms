<script setup>
import { onMounted } from 'vue'
import BwToastHost from '@/components/base/BwToastHost.vue'
import { fetchCenterSettings } from '@/api/admin'
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

/* initTheme() has already painted the cached choice, so the first frame is
   never unstyled; this catches up with the centre's current theme for anyone
   who has not visited settings — without it the admin's choice only ever
   applied to the admin's own browser. Silent on failure: a theme is not worth
   an error toast, and the cached one is still perfectly usable. */
onMounted(async () => {
  try {
    const { theme } = await fetchCenterSettings()
    setTheme(theme, { animate: false })
  } catch {
    /* Offline or the endpoint is down — keep what we painted. */
  }
})
</script>

<template>
  <RouterView />
  <BwToastHost />
</template>
