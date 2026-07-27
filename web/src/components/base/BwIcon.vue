<script setup>
import { computed } from 'vue'
import { ICONS } from './icons'

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => value in ICONS,
  },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: null },
  /* Decorative by default; pass a label to expose the icon to screen readers. */
  label: { type: String, default: '' },
})

const icon = computed(() => ICONS[props.name])
const stroked = computed(() => icon.value.stroke !== false)
const strokeWidth = computed(
  () => props.strokeWidth ?? icon.value.strokeWidth ?? 1.75,
)
</script>

<template>
  <svg
    class="bw-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="icon.fill ? 'currentColor' : 'none'"
    :stroke="stroked ? 'currentColor' : undefined"
    :stroke-width="stroked ? strokeWidth : undefined"
    :stroke-linecap="stroked && icon.linecap !== null ? 'round' : undefined"
    :stroke-linejoin="stroked ? 'round' : undefined"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    v-html="icon.d"
  />
</template>

<style scoped>
.bw-icon {
  flex: none;
}
</style>
