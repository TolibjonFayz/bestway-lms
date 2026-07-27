<script setup>
/* The white surface every card pattern sits on. `stat`, `lesson` and `list`
   are the three product variants from design system section 05; `section` is
   the larger documentation panel the design page itself uses. */
defineProps({
  variant: {
    type: String,
    default: 'plain',
    validator: (v) => ['plain', 'stat', 'lesson', 'list', 'section'].includes(v),
  },
  as: { type: String, default: 'div' },
})
</script>

<template>
  <component :is="as" class="bw-card" :class="`bw-card--${variant}`">
    <slot />
  </component>
</template>

<style scoped>
.bw-card {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
}

.bw-card--plain,
.bw-card--stat {
  padding: 20px;
}

.bw-card--lesson {
  padding: 20px;
  display: flex;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
}

/* Rows bring their own padding and dividers. */
.bw-card--list {
  overflow: hidden;
}

.bw-card--section {
  border-radius: 24px;
  padding: 34px;
}

@media (max-width: 520px) {
  .bw-card--section {
    padding: 22px 18px;
  }
}
</style>
