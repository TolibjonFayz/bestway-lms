<script setup>
import { computed } from 'vue'
import BwIcon from './BwIcon.vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0 && v <= 100,
  },
  size: { type: Number, default: 132 },
  strokeWidth: { type: Number, default: 12 },
  /* Small line under the percentage, e.g. "Unit 5". */
  caption: { type: String, default: '' },
  /* At 100% the mockup swaps the number for a tick. */
  checkWhenComplete: { type: Boolean, default: false },
  label: { type: String, default: '' },
})

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
const complete = computed(() => clamped.value === 100)

/* Matches the mockup's 132/12→r58 and 100/10→r43 pairs. */
const radius = computed(() => props.size / 2 - props.strokeWidth / 2 - 2)
const circumference = computed(() => +(2 * Math.PI * radius.value).toFixed(1))
const offset = computed(() =>
  +(circumference.value * (1 - clamped.value / 100)).toFixed(1),
)
const center = computed(() => props.size / 2)
const valueFont = computed(() => Math.round(props.size / 4.4))
const unitFont = computed(() => Math.round(props.size / 8.25))
</script>

<template>
  <div
    class="bw-ring"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="progressbar"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label || caption || undefined"
  >
    <svg class="bw-ring__svg" :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="var(--line-2)"
        :stroke-width="strokeWidth"
      />
      <circle
        class="bw-ring__bar"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="var(--green)"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
    </svg>

    <div class="bw-ring__center">
      <BwIcon
        v-if="complete && checkWhenComplete"
        name="check"
        :size="Math.round(size * 0.34)"
        :stroke-width="2.5"
        class="bw-ring__check"
      />
      <template v-else>
        <div class="bw-ring__value bw-nums" :style="{ fontSize: `${valueFont}px` }">
          {{ clamped }}<span class="bw-ring__unit" :style="{ fontSize: `${unitFont}px` }">%</span>
        </div>
        <div v-if="caption" class="bw-ring__caption">{{ caption }}</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bw-ring {
  position: relative;
  flex: none;
}

.bw-ring__svg {
  transform: rotate(-90deg);
}

.bw-ring__bar {
  transition: stroke-dashoffset 0.4s ease;
}

.bw-ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bw-ring__value {
  font-weight: 800;
  color: var(--ink);
  line-height: 1;
}

.bw-ring__unit {
  color: var(--gray-2);
}

.bw-ring__caption {
  font-size: 11px;
  color: var(--gray-2);
  font-weight: 600;
  margin-top: 3px;
}

.bw-ring__check {
  color: var(--green);
}
</style>
