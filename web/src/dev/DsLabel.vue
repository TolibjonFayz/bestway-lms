<script setup>
/* The small uppercase group heading used throughout the design system page. */
defineProps({
  space: { type: Number, default: 14 },
  full: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="ds-label"
    :class="{ 'ds-label--full': full }"
    :style="{ marginBottom: `${space}px` }"
  >
    <slot />
  </div>
</template>

<style scoped>
.ds-label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
}

/* Forces its own row in both the grid and the flex layouts it appears in. */
.ds-label--full {
  grid-column: 1 / -1;
  width: 100%;
}
</style>
