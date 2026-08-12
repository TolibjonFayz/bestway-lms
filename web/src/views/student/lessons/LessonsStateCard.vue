<script setup>
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

/* The design has no empty or error card for these screens, so both are built
   from the design system's dashed empty pattern. */
defineProps({
  variant: {
    type: String,
    default: 'empty',
    validator: (v) => ['empty', 'error'].includes(v),
  },
  icon: { type: String, default: 'books' },
  title: { type: String, required: true },
  text: { type: String, default: '' },
  retrying: { type: Boolean, default: false },
  /* Optional call to action for an empty state — a dead end is worse than a
     way out, so screens that know where the student should go next say so. */
  actionLabel: { type: String, default: '' },
})

defineEmits(['retry', 'action'])
</script>

<template>
  <div class="lstate" :role="variant === 'error' ? 'alert' : undefined">
    <div class="lstate__art" :class="`lstate__art--${variant}`">
      <BwIcon :name="icon" :size="34" :stroke-width="1.75" />
    </div>
    <h3 class="lstate__title">{{ title }}</h3>
    <p v-if="text" class="lstate__text">{{ text }}</p>
    <BwButton
      v-if="variant === 'error'"
      class="lstate__retry"
      size="lg"
      :loading="retrying"
      @click="$emit('retry')"
    >
      {{ retrying ? uz.actions.loading : uz.actions.retry }}
    </BwButton>
    <BwButton
      v-else-if="actionLabel"
      class="lstate__retry"
      size="lg"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </BwButton>
  </div>
</template>

<style scoped>
.lstate {
  border: 1px dashed var(--line);
  border-radius: 20px;
  background: var(--tint-slate);
  padding: 40px 24px;
  text-align: center;
}

.lstate__art {
  width: 120px;
  height: 88px;
  margin: 0 auto;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lstate__art--empty {
  background: repeating-linear-gradient(
    45deg,
    var(--line-3),
    var(--line-3) 9px,
    var(--bg) 9px,
    var(--bg) 18px
  );
  border: 1px solid var(--line);
  color: var(--gray-3);
}

.lstate__art--error {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: var(--warn-bg);
  border: 1px solid var(--warn-line);
  color: var(--orange-ink);
}

.lstate__title {
  margin: 18px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.lstate__text {
  margin: 7px auto 0;
  font-size: 14px;
  color: var(--gray);
  max-width: 360px;
  line-height: 1.55;
}

.lstate :deep(.lstate__retry) {
  margin-top: 20px;
}
</style>
