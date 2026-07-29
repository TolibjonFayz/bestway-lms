<script setup>
import { onBeforeUnmount, watch } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'confirm'])

/* The trigger button, not the dialog, holds focus right after opening — a
   keydown handler scoped to the dialog markup would never see Escape until
   the student tabs into it first. A window listener while open catches it
   regardless of where focus is. */
function onKeydown(event) {
  if (event.key === 'Escape') emit('cancel')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="open" class="texit" role="dialog" aria-modal="true" :aria-label="uz.test.exitTitle">
    <div class="texit__card">
      <div class="texit__icon">
        <BwIcon name="alert-triangle" :size="24" :stroke-width="1.9" />
      </div>
      <h3 class="texit__title">{{ uz.test.exitTitle }}</h3>
      <p class="texit__text">{{ uz.test.exitText }}</p>
      <div class="texit__actions">
        <button class="texit__btn texit__btn--cancel" type="button" @click="$emit('cancel')">
          {{ uz.actions.cancel }}
        </button>
        <button class="texit__btn texit__btn--confirm" type="button" @click="$emit('confirm')">
          {{ uz.test.exitConfirm }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.texit {
  position: fixed;
  inset: 0;
  background: var(--layer-ink-42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 60;
}

.texit__card {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-lg);
  padding: 28px;
  max-width: 360px;
  width: 100%;
  text-align: center;
}

.texit__icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--danger-soft);
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
}

.texit__title {
  margin: 16px 0 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--ink);
}

.texit__text {
  margin: 8px 0 0;
  font-size: 14.5px;
  color: var(--gray);
  line-height: 1.5;
}

.texit__actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.texit__btn {
  flex: 1;
  font-family: inherit;
  font-weight: 700;
  font-size: 14.5px;
  height: 46px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
}

.texit__btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.texit__btn--cancel {
  background: var(--line-2);
  color: var(--ink-3);
}

.texit__btn--cancel:hover {
  background: var(--line);
}

.texit__btn--confirm {
  background: var(--danger);
  color: var(--white);
}

.texit__btn--confirm:hover {
  background: var(--danger-dark);
}

.texit__btn--confirm:focus-visible {
  box-shadow: var(--ring-danger);
}
</style>
