<script setup>
import { computed } from 'vue'
import BwIcon from './BwIcon.vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0 && v <= 100,
  },
  label: { type: String, default: '' },
  showValue: { type: Boolean, default: true },
  /* md is the standalone bar, sm the one embedded in a lesson card. */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['md', 'sm'].includes(v),
  },
})

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
const complete = computed(() => clamped.value === 100)
</script>

<template>
  <div class="bw-progress" :class="`bw-progress--${size}`">
    <div v-if="label || showValue" class="bw-progress__head">
      <span class="bw-progress__label">{{ label }}</span>
      <span v-if="showValue" class="bw-progress__value bw-nums">
        <BwIcon v-if="complete" name="check" :size="13" :stroke-width="3" />{{ clamped }}%
      </span>
    </div>
    <div
      class="bw-progress__track"
      role="progressbar"
      :aria-valuenow="clamped"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label || undefined"
    >
      <div class="bw-progress__fill" :style="{ width: `${clamped}%` }" />
    </div>
  </div>
</template>

<style scoped>
.bw-progress__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bw-progress--md .bw-progress__head {
  margin-bottom: 8px;
}

.bw-progress--sm .bw-progress__head {
  margin-bottom: 7px;
}

.bw-progress__label {
  font-weight: 600;
}

.bw-progress--md .bw-progress__label {
  font-size: 13px;
  color: var(--ink-3);
}

.bw-progress--sm .bw-progress__label {
  font-size: 12px;
  color: var(--gray);
}

.bw-progress__value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  color: var(--green);
}

.bw-progress--md .bw-progress__value {
  font-size: 13px;
}

.bw-progress--sm .bw-progress__value {
  font-size: 12px;
}

.bw-progress__track {
  background: var(--line-2);
  border-radius: 99px;
  overflow: hidden;
}

.bw-progress--md .bw-progress__track {
  height: 10px;
}

.bw-progress--sm .bw-progress__track {
  height: 8px;
}

.bw-progress__fill {
  height: 100%;
  background: var(--green);
  border-radius: 99px;
  transition: width 0.3s ease;
}
</style>
