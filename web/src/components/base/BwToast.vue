<script setup>
import { computed } from 'vue'
import BwIcon from './BwIcon.vue'
import BwIconTile from './BwIconTile.vue'
import uz from '@/locales/uz'

const TONES = {
  success: { icon: 'check-circle', tile: 'green-mid' },
  warning: { icon: 'alert-triangle', tile: 'warn' },
  error: { icon: 'x-circle', tile: 'danger' },
  info: { icon: 'info', tile: 'info' },
}

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'warning', 'error', 'info'].includes(v),
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dismissible: { type: Boolean, default: true },
})

defineEmits(['dismiss'])

const tone = computed(() => TONES[props.variant])
/* Errors interrupt; everything else waits its turn in the queue. */
const live = computed(() => (props.variant === 'error' ? 'assertive' : 'polite'))
</script>

<template>
  <div
    class="bw-toast"
    :class="`bw-toast--${variant}`"
    role="status"
    :aria-live="live"
  >
    <BwIconTile :size="34" :radius="10" :tone="tone.tile">
      <BwIcon :name="tone.icon" :size="19" :stroke-width="2" />
    </BwIconTile>

    <div class="bw-toast__body">
      <div class="bw-toast__title">{{ title }}</div>
      <div v-if="description" class="bw-toast__text">{{ description }}</div>
    </div>

    <button
      v-if="dismissible"
      class="bw-toast__close"
      type="button"
      :aria-label="uz.actions.close"
      @click="$emit('dismiss')"
    >
      <BwIcon name="x" :size="15" :stroke-width="2" />
    </button>
  </div>
</template>

<style scoped>
.bw-toast {
  display: flex;
  gap: 13px;
  padding: 15px 16px;
  border-radius: 14px;
  border: 1px solid transparent;
}

.bw-toast--success {
  background: var(--green-pale);
  border-color: var(--green-soft);
}

.bw-toast--warning {
  background: var(--warn-bg);
  border-color: var(--warn-line);
}

.bw-toast--error {
  background: var(--danger-bg);
  border-color: var(--danger-line);
}

.bw-toast--info {
  background: var(--bg);
  border-color: var(--line);
}

.bw-toast__body {
  flex: 1;
  min-width: 0;
}

.bw-toast__title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
}

.bw-toast__text {
  font-size: 13px;
  color: var(--ink-4);
  margin-top: 2px;
  line-height: 1.45;
}

.bw-toast__close {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--gray-2);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.bw-toast__close:hover {
  background: var(--overlay-ink);
  color: var(--ink);
}

.bw-toast__close:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}
</style>
