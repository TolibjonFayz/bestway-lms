<script setup>
/* The rounded square behind an icon. Sizes and radii come straight off the
   mockups: 34/10 in toasts, 44/12 in list rows, 46/13 in stat cards,
   60/15 in the lesson card. */
defineProps({
  size: { type: Number, default: 44 },
  radius: { type: Number, default: 12 },
  tone: {
    type: String,
    default: 'green',
    validator: (v) =>
      ['green', 'green-mid', 'orange', 'amber', 'muted', 'warn', 'danger', 'info'].includes(v),
  },
})
</script>

<template>
  <div
    class="bw-tile"
    :class="`bw-tile--${tone}`"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: `${radius}px` }"
  >
    <slot />
  </div>
</template>

<style scoped>
.bw-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.bw-tile--green {
  background: var(--green-pale);
  color: var(--green);
}

.bw-tile--green-mid {
  background: var(--green-mid);
  color: var(--green);
}

.bw-tile--orange {
  background: var(--orange-pale);
  color: var(--orange);
}

.bw-tile--amber {
  background: var(--amber-soft);
  color: var(--amber);
}

.bw-tile--muted {
  background: var(--line-2);
  color: var(--gray);
}

.bw-tile--warn {
  background: var(--orange-soft);
  color: var(--orange-ink);
}

.bw-tile--danger {
  background: var(--danger-soft);
  color: var(--danger);
}

.bw-tile--info {
  background: var(--line-2);
  color: var(--ink-4);
}
</style>
