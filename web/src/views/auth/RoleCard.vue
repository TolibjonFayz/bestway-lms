<script setup>
import BwIcon from '@/components/base/BwIcon.vue'

defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  hint: { type: String, required: true },
  selected: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <button
    class="role-card"
    :class="{ 'is-selected': selected }"
    type="button"
    role="radio"
    :aria-checked="selected"
    @click="$emit('select')"
  >
    <span class="role-card__icon">
      <BwIcon :name="icon" :size="26" />
    </span>
    <span class="role-card__body">
      <span class="role-card__title">{{ title }}</span>
      <span class="role-card__hint">{{ hint }}</span>
    </span>
    <span class="role-card__radio">
      <span v-if="selected" class="role-card__dot" />
    </span>
  </button>
</template>

<style scoped>
.role-card {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  text-align: left;
  padding: 17px 18px;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  border: 2px solid var(--line);
  background: var(--white);
  transition:
    border-color 0.15s,
    background 0.15s;
}

.role-card.is-selected {
  border-color: var(--green);
  background: var(--green-pale);
}

.role-card:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.role-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--green-pale);
  color: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

/* The tile needs to stay legible once the card itself turns pale green. */
.role-card.is-selected .role-card__icon {
  background: var(--green-mid);
}

.role-card__body {
  flex: 1;
  min-width: 0;
}

.role-card__title {
  display: block;
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
}

.role-card__hint {
  display: block;
  font-size: 13.5px;
  color: var(--gray);
  margin-top: 2px;
}

.role-card__radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border: 2px solid var(--gray-3);
}

.role-card.is-selected .role-card__radio {
  border-color: var(--green);
}

.role-card__dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--green);
}
</style>
