<script setup>
import { computed } from 'vue'
import BwIcon from './BwIcon.vue'

const LEVEL = ['level', 'level-active', 'level-current', 'level-solid']

const props = defineProps({
  variant: {
    type: String,
    default: 'todo',
    validator: (v) =>
      [
        'done',
        'progress',
        'todo',
        'new',
        'level',
        'level-active',
        'level-current',
        'level-solid',
      ].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['md', 'sm', 'xs'].includes(v),
  },
  label: { type: String, default: '' },
  /* The compact list-row form of "Boshlanmagan" drops its status dot. */
  dot: { type: Boolean, default: true },
})

const isLevel = computed(() => LEVEL.includes(props.variant))
const hasCheck = computed(() => props.variant === 'done')
const hasDot = computed(
  () =>
    props.dot && ['progress', 'todo', 'level-current'].includes(props.variant),
)
const checkSize = computed(() => (props.size === 'md' ? 14 : 13))
</script>

<template>
  <span
    class="bw-badge"
    :class="[
      `bw-badge--${variant}`,
      `bw-badge--${size}`,
      { 'bw-badge--is-level': isLevel },
    ]"
  >
    <BwIcon v-if="hasCheck" name="check" :size="checkSize" :stroke-width="3" />
    <span v-else-if="hasDot" class="bw-badge__dot" />
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped>
.bw-badge {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  border-radius: 99px;
  border: 1px solid transparent;
  white-space: nowrap;
}

/* ── Status sizes ──────────────────────────────────────────────────── */

.bw-badge--md {
  font-size: 13px;
  padding: 7px 14px;
  gap: 6px;
}

.bw-badge--sm {
  font-size: 12px;
  padding: 5px 11px;
  gap: 5px;
}

.bw-badge--xs {
  font-size: 12px;
  padding: 4px 10px;
  gap: 5px;
}

/* ── Status tones ──────────────────────────────────────────────────── */

.bw-badge--done {
  color: var(--green-dark);
  background: var(--green-mid);
}

.bw-badge--progress {
  color: var(--orange-ink);
  background: var(--orange-soft);
  gap: 7px;
}

.bw-badge--todo {
  color: var(--gray);
  background: var(--line-2);
  gap: 7px;
}

.bw-badge--new {
  color: var(--green);
  background: var(--green-pale);
  border-color: var(--green-soft);
}

.bw-badge--new.bw-badge--md {
  padding: 6px 13px;
  gap: 5px;
}

.bw-badge--progress.bw-badge--sm,
.bw-badge--progress.bw-badge--xs,
.bw-badge--todo.bw-badge--sm,
.bw-badge--todo.bw-badge--xs {
  gap: 5px;
}

.bw-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}

.bw-badge--sm .bw-badge__dot,
.bw-badge--xs .bw-badge__dot {
  width: 6px;
  height: 6px;
}

.bw-badge--progress .bw-badge__dot {
  background: var(--orange);
}

.bw-badge--todo .bw-badge__dot {
  background: var(--gray-2);
}

/* ── Level chips ───────────────────────────────────────────────────── */

.bw-badge--is-level {
  border-radius: 9px;
}

.bw-badge--is-level.bw-badge--md {
  font-size: 13px;
  padding: 5px 12px;
  gap: 6px;
}

.bw-badge--is-level.bw-badge--sm,
.bw-badge--is-level.bw-badge--xs {
  font-size: 11.5px;
  padding: 3px 8px;
  border-radius: 7px;
  gap: 5px;
}

.bw-badge--level {
  color: var(--gray);
  background: var(--white);
  border: 1.5px solid var(--line);
}

.bw-badge--level-active {
  color: var(--green-dark);
  background: var(--white);
  border: 1.5px solid var(--green-soft);
}

.bw-badge--level-current {
  color: var(--green-dark);
  background: var(--green-mid);
}

.bw-badge--level-current .bw-badge__dot {
  width: 6px;
  height: 6px;
  background: var(--green);
}

.bw-badge--level-solid {
  color: var(--white);
  background: var(--green);
}
</style>
