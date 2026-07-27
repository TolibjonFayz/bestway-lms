<script setup>
import BwToast from './BwToast.vue'
import { useToast } from '@/composables/useToast'

/* The design system documents the toast itself but not where it lives; the
   stack sits top-right on desktop and full-width at the top on phones. */
const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="bw-toast-host" aria-live="polite">
      <TransitionGroup name="bw-toast">
        <BwToast
          v-for="toast in toasts"
          :key="toast.id"
          class="bw-toast-host__item"
          :variant="toast.variant"
          :title="toast.title"
          :description="toast.description"
          @dismiss="dismiss(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.bw-toast-host {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(380px, calc(100vw - 40px));
  pointer-events: none;
}

.bw-toast-host__item {
  pointer-events: auto;
  box-shadow: var(--sh-md);
}

.bw-toast-enter-active,
.bw-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.bw-toast-enter-from,
.bw-toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

/* The stack closes the gap behind a dismissed toast instead of jumping. */
.bw-toast-move {
  transition: transform 0.2s ease;
}

@media (max-width: 520px) {
  .bw-toast-host {
    top: 12px;
    right: 12px;
    left: 12px;
    width: auto;
  }

  .bw-toast-enter-from,
  .bw-toast-leave-to {
    transform: translateY(-12px);
  }
}
</style>
