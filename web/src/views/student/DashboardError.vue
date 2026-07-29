<script setup>
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

/* The design has no error state, so this is built from the design system's
   empty pattern: dashed surface, illustration slot, title, copy, one action. */
defineProps({
  retrying: { type: Boolean, default: false },
})

defineEmits(['retry'])
</script>

<template>
  <div class="derr" role="alert">
    <div class="derr__art">
      <BwIcon name="alert-triangle" :size="34" :stroke-width="1.75" />
    </div>
    <h2 class="derr__title">{{ uz.dashboard.errorTitle }}</h2>
    <p class="derr__text">{{ uz.dashboard.errorText }}</p>
    <BwButton
      class="derr__retry"
      size="lg"
      :loading="retrying"
      @click="$emit('retry')"
    >
      {{ retrying ? uz.actions.loading : uz.actions.retry }}
    </BwButton>
  </div>
</template>

<style scoped>
.derr {
  border: 1px dashed var(--line);
  border-radius: 20px;
  background: var(--tint-slate);
  padding: 40px 24px;
  margin-top: 16px;
  text-align: center;
}

.derr__art {
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 22px;
  background: var(--warn-bg);
  border: 1px solid var(--warn-line);
  color: var(--orange-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.derr__title {
  margin: 20px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}

.derr__text {
  margin: 8px auto 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--gray);
  max-width: 420px;
  text-wrap: pretty;
}

.derr :deep(.derr__retry) {
  margin-top: 22px;
}

@media (min-width: 1024px) {
  .derr {
    padding: 52px 32px;
    margin-top: 22px;
  }
}
</style>
