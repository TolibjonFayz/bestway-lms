<script setup>
import { computed } from 'vue'
import BwIcon from './BwIcon.vue'

const props = defineProps({
  total: { type: Number, default: 5 },
  /* 1-based index of the step the user is on. */
  current: { type: Number, default: 1 },
  variant: {
    type: String,
    default: 'circles',
    validator: (v) => ['circles', 'segments'].includes(v),
  },
  label: { type: String, default: '' },
})

const steps = computed(() =>
  Array.from({ length: props.total }, (_, i) => {
    const step = i + 1
    if (step < props.current) return { step, state: 'done' }
    if (step === props.current) return { step, state: 'current' }
    return { step, state: 'todo' }
  }),
)

/* Connector `index` joins steps index+1 and index+2, and only turns green once
   the step on its right is finished. */
function connectorDone(index) {
  return index + 2 < props.current
}
</script>

<template>
  <div class="bw-steps" :class="`bw-steps--${variant}`">
    <template v-if="variant === 'circles'">
      <ol class="bw-steps__track" :aria-label="label || undefined">
        <template v-for="(item, index) in steps" :key="item.step">
          <li
            class="bw-steps__step"
            :class="`is-${item.state}`"
            :aria-current="item.state === 'current' ? 'step' : undefined"
          >
            <BwIcon
              v-if="item.state === 'done'"
              name="check"
              :size="16"
              :stroke-width="3"
            />
            <template v-else>{{ item.step }}</template>
          </li>
          <li
            v-if="index < steps.length - 1"
            class="bw-steps__link"
            :class="{ 'is-done': connectorDone(index) }"
            aria-hidden="true"
          />
        </template>
      </ol>
    </template>

    <template v-else>
      <div v-if="label" class="bw-steps__head">
        <span class="bw-steps__label">{{ label }}</span>
        <span class="bw-steps__count bw-nums">{{ current }} / {{ total }}</span>
      </div>
      <div
        class="bw-steps__segments"
        role="progressbar"
        :aria-valuenow="current"
        aria-valuemin="0"
        :aria-valuemax="total"
        :aria-label="label || undefined"
      >
        <div
          v-for="item in steps"
          :key="item.step"
          class="bw-steps__segment"
          :class="{ 'is-filled': item.step <= current }"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.bw-steps__track {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bw-steps__step {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex: none;
}

.bw-steps__step.is-done {
  background: var(--green);
  color: var(--white);
}

.bw-steps__step.is-current {
  background: var(--white);
  color: var(--green);
  border: 2.5px solid var(--green);
  box-shadow: var(--ring-green);
}

.bw-steps__step.is-todo {
  background: var(--line-2);
  color: var(--gray-2);
}

.bw-steps__link {
  flex: 1;
  height: 3px;
  background: var(--line);
  border-radius: 2px;
}

.bw-steps__link.is-done {
  background: var(--green);
}

/* ── Segmented ─────────────────────────────────────────────────────── */

.bw-steps__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
}

.bw-steps__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-3);
}

.bw-steps__count {
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
}

.bw-steps__segments {
  display: flex;
  gap: 6px;
}

.bw-steps__segment {
  flex: 1;
  height: 8px;
  border-radius: 99px;
  background: var(--line);
  transition: background 0.2s;
}

.bw-steps__segment.is-filled {
  background: var(--green);
}
</style>
