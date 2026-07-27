<script setup>
/* A single component sample with the tiny monospace state caption under it. */
defineProps({
  caption: { type: String, required: true },
})
</script>

<template>
  <div class="ds-specimen">
    <slot />
    <span class="ds-specimen__caption">{{ caption }}</span>
  </div>
</template>

<style scoped>
.ds-specimen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}

.ds-specimen__caption {
  font: 700 10px/1 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}
</style>
