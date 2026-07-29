<script setup>
import BwIcon from '@/components/base/BwIcon.vue'

defineProps({
  name: { type: String, required: true },
  code: { type: String, required: true },
  selected: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <button
    class="level-chip"
    :class="{ 'is-selected': selected }"
    type="button"
    role="radio"
    :aria-checked="selected"
    @click="$emit('select')"
  >
    <span class="level-chip__label">
      {{ name }} <span class="level-chip__code">({{ code }})</span>
    </span>
    <BwIcon v-if="selected" name="check" :size="20" :stroke-width="2.5" />
  </button>
</template>

<style scoped>
.level-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 54px;
  padding: 0 18px;
  border-radius: 14px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15.5px;
  cursor: pointer;
  border: 2px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s;
}

.level-chip.is-selected {
  border-color: var(--green);
  background: var(--green-pale);
  color: var(--green-dark);
}

.level-chip:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.level-chip__label {
  flex: 1;
  text-align: left;
}

.level-chip__code {
  color: var(--gray-2);
  font-weight: 600;
}

.level-chip :deep(.bw-icon) {
  color: var(--green);
}
</style>
