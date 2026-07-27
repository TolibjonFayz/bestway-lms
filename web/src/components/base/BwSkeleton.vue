<script setup>
import { computed } from 'vue'

/* The design system has no loading pattern of its own, so this is built from
   its surface tokens: the --line-2 track with a --white sheen sweeping across.
   Screens are expected to compose these into the shape of the real layout. */
const props = defineProps({
  variant: {
    type: String,
    default: 'line',
    validator: (v) => ['line', 'block', 'circle'].includes(v),
  },
  width: { type: String, default: '100%' },
  height: { type: String, default: '' },
  radius: { type: String, default: '' },
  /* Renders a paragraph of stacked lines, the last one short. */
  lines: { type: Number, default: 1 },
})

const DEFAULT_HEIGHT = { line: '14px', block: '80px', circle: '44px' }
const DEFAULT_RADIUS = { line: '99px', block: '18px', circle: '50%' }

const height = computed(() => props.height || DEFAULT_HEIGHT[props.variant])
const radius = computed(() => props.radius || DEFAULT_RADIUS[props.variant])
const boxWidth = computed(() =>
  props.variant === 'circle' ? height.value : props.width,
)
</script>

<template>
  <div
    v-if="lines > 1"
    class="bw-skeleton-group"
    role="presentation"
    aria-hidden="true"
  >
    <span
      v-for="line in lines"
      :key="line"
      class="bw-skeleton"
      :style="{
        width: line === lines ? '60%' : boxWidth,
        height,
        borderRadius: radius,
      }"
    />
  </div>
  <span
    v-else
    class="bw-skeleton"
    role="presentation"
    aria-hidden="true"
    :style="{ width: boxWidth, height, borderRadius: radius }"
  />
</template>

<style scoped>
.bw-skeleton {
  display: block;
  flex: none;
  background:
    linear-gradient(
      90deg,
      var(--line-2) 0%,
      var(--white) 40%,
      var(--line-2) 80%
    )
    0 0 / 200% 100%;
  animation: bw-shimmer 1.4s linear infinite;
}

.bw-skeleton-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
</style>
