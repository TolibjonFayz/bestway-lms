<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  type: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'submit', 'reset'].includes(v),
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  /* Fills its container — the auth screens' full-width CTAs. */
  block: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

/* A pending action must be impossible to fire twice. */
const inert = computed(() => props.disabled || props.loading)

function onClick(event) {
  if (inert.value) return
  emit('click', event)
}
</script>

<template>
  <button
    class="bw-btn"
    :class="[
      `bw-btn--${variant}`,
      `bw-btn--${size}`,
      { 'is-loading': loading, 'bw-btn--block': block },
    ]"
    :type="type"
    :disabled="inert"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="bw-btn__spinner" />
    <slot v-else name="leading" />
    <slot />
    <slot v-if="!loading" name="trailing" />
  </button>
</template>

<style scoped>
.bw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 700;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s,
    transform 0.1s,
    box-shadow 0.15s;
}

.bw-btn.is-loading {
  gap: 9px;
  cursor: progress;
}

.bw-btn:disabled:not(.is-loading) {
  cursor: not-allowed;
}

.bw-btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.bw-btn--danger:focus-visible {
  box-shadow: var(--ring-danger);
}

/* ── Sizes ─────────────────────────────────────────────────────────── */

.bw-btn--sm {
  font-size: 13px;
  height: 40px;
  padding: 0 16px;
  border-radius: 9px;
}

.bw-btn--md {
  font-size: 15px;
  height: 48px;
  padding: 0 22px;
  border-radius: 10px;
}

.bw-btn--lg {
  font-size: 16px;
  height: 56px;
  padding: 0 28px;
  border-radius: 12px;
}

.bw-btn--block {
  width: 100%;
}

/* Ghost sits 2px tighter than the bordered variants at every size. */
.bw-btn--ghost.bw-btn--sm {
  padding: 0 14px;
}
.bw-btn--ghost.bw-btn--md {
  padding: 0 20px;
}
.bw-btn--ghost.bw-btn--lg {
  padding: 0 26px;
}

/* `data-force` pins a state so /kitchen-sink can show hover and active side by
   side without duplicating these declarations. Nothing in the app sets it. */

/* ── Primary ───────────────────────────────────────────────────────── */

.bw-btn--primary {
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-btn);
}

.bw-btn--primary.bw-btn--lg {
  box-shadow: var(--sh-green);
}

.bw-btn--primary:hover:not(:disabled),
.bw-btn--primary[data-force='hover'] {
  background: var(--green-dark);
  box-shadow: var(--sh-btn-hover);
}

.bw-btn--primary.bw-btn--lg:hover:not(:disabled),
.bw-btn--primary.bw-btn--lg[data-force='hover'] {
  box-shadow: var(--sh-btn-lg-hover);
}

.bw-btn--primary:active:not(:disabled),
.bw-btn--primary[data-force='active'] {
  background: var(--green-darker);
  transform: translateY(1px);
  box-shadow: none;
}

.bw-btn--primary.bw-btn--lg:active:not(:disabled),
.bw-btn--primary.bw-btn--lg[data-force='active'] {
  transform: translateY(2px);
  box-shadow: var(--sh-btn-lg-active);
}

/* ── Secondary ─────────────────────────────────────────────────────── */

.bw-btn--secondary {
  background: var(--white);
  color: var(--green-dark);
  border-color: var(--green);
}

.bw-btn--secondary:hover:not(:disabled),
.bw-btn--secondary[data-force='hover'] {
  background: var(--green-pale);
  color: var(--green-darker);
  border-color: var(--green-dark);
}

.bw-btn--secondary:active:not(:disabled),
.bw-btn--secondary[data-force='active'] {
  background: var(--green-mid);
  color: var(--green-darker);
  border-color: var(--green-darker);
  transform: translateY(1px);
}

/* ── Ghost ─────────────────────────────────────────────────────────── */

.bw-btn--ghost {
  background: transparent;
  color: var(--green-dark);
}

.bw-btn--ghost:hover:not(:disabled),
.bw-btn--ghost[data-force='hover'] {
  background: var(--green-pale);
  color: var(--green-darker);
}

.bw-btn--ghost:active:not(:disabled),
.bw-btn--ghost[data-force='active'] {
  background: var(--green-mid);
  color: var(--green-darker);
  transform: translateY(1px);
}

/* ── Danger ────────────────────────────────────────────────────────── */

.bw-btn--danger {
  background: var(--danger);
  color: var(--white);
  box-shadow: var(--sh-btn-danger);
}

.bw-btn--danger:hover:not(:disabled),
.bw-btn--danger[data-force='hover'] {
  background: var(--danger-dark);
  box-shadow: none;
}

.bw-btn--danger:active:not(:disabled),
.bw-btn--danger[data-force='active'] {
  background: var(--danger-darker);
  transform: translateY(1px);
  box-shadow: none;
}

/* ── Disabled ──────────────────────────────────────────────────────── */

.bw-btn--primary:disabled:not(.is-loading),
.bw-btn--danger:disabled:not(.is-loading) {
  background: var(--line);
  color: var(--gray-2);
  box-shadow: none;
}

.bw-btn--secondary:disabled:not(.is-loading) {
  background: var(--white);
  color: var(--gray-3);
  border-color: var(--line);
}

.bw-btn--ghost:disabled:not(.is-loading) {
  background: transparent;
  color: var(--gray-3);
}

/* ── Loading spinner ───────────────────────────────────────────────── */

.bw-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--overlay-white);
  border-top-color: var(--white);
  border-radius: 50%;
  display: inline-block;
  animation: bw-spin 0.7s linear infinite;
  flex: none;
}

.bw-btn--secondary .bw-btn__spinner,
.bw-btn--ghost .bw-btn__spinner {
  border-color: var(--green-soft);
  border-top-color: var(--green);
}
</style>
