<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: undefined },
  value: { type: [String, Number, Boolean], required: true },
  label: { type: String, default: '' },
  /* Radios only behave as a group when they share a name. */
  name: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const checked = computed(() => props.modelValue === props.value)
</script>

<template>
  <label class="bw-radio" :class="{ 'is-checked': checked, 'is-disabled': disabled }">
    <input
      class="bw-radio__input"
      type="radio"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      @change="emit('update:modelValue', value)"
    />
    <span class="bw-radio__mark"><span class="bw-radio__dot" /></span>
    <span class="bw-radio__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<style scoped>
.bw-radio {
  display: flex;
  align-items: center;
  gap: 11px;
  cursor: pointer;
}

.bw-radio.is-disabled {
  cursor: not-allowed;
}

.bw-radio__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.bw-radio__mark {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--white);
  border: 1.5px solid var(--gray-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition:
    border-color 0.15s,
    border-width 0.15s,
    box-shadow 0.15s;
}

.bw-radio.is-checked .bw-radio__mark {
  border: 2px solid var(--green);
}

.bw-radio__input:focus-visible ~ .bw-radio__mark {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.bw-radio.is-disabled .bw-radio__mark {
  background: var(--line-2);
  border-color: var(--line);
}

.bw-radio__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green);
  transform: scale(0);
  transition: transform 0.15s;
}

.bw-radio.is-checked .bw-radio__dot {
  transform: scale(1);
}

.bw-radio.is-disabled .bw-radio__dot {
  background: var(--gray-3);
}

.bw-radio__label {
  font-size: 14.5px;
  color: var(--ink-3);
  font-weight: 500;
}

.bw-radio.is-checked .bw-radio__label {
  color: var(--ink);
  font-weight: 600;
}

.bw-radio.is-disabled .bw-radio__label {
  color: var(--gray-2);
}
</style>
