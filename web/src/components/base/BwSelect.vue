<script setup>
import { computed, useId } from 'vue'
import BwIcon from './BwIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  /* Either plain strings or { value, label, disabled } objects. */
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  helper: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue', 'change'])

const uid = useId()
const selectId = computed(() => `bw-select-${uid}`)
const messageId = computed(() => `bw-select-msg-${uid}`)

const items = computed(() =>
  props.options.map((option) =>
    typeof option === 'object' && option !== null
      ? { value: option.value, label: option.label, disabled: option.disabled }
      : { value: option, label: String(option), disabled: false },
  ),
)
const hasMessage = computed(() => Boolean(props.error || props.helper))

function onChange(event) {
  emit('update:modelValue', event.target.value)
  emit('change', event.target.value)
}
</script>

<template>
  <div class="bw-field" :class="{ 'is-disabled': disabled }">
    <label v-if="label" class="bw-field__label" :for="selectId">{{ label }}</label>

    <div class="bw-field__control">
      <select
        :id="selectId"
        class="bw-select"
        :class="{ 'bw-select--error': error, 'bw-select--empty': !modelValue }"
        :value="modelValue"
        :disabled="disabled"
        :name="name"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="hasMessage ? messageId : undefined"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          :disabled="item.disabled"
        >
          {{ item.label }}
        </option>
      </select>
      <span class="bw-select__chevron">
        <BwIcon name="chevron-down" :size="20" />
      </span>
    </div>

    <div v-if="error" :id="messageId" class="bw-field__error" role="alert">
      <BwIcon name="alert-circle" :size="15" />{{ error }}
    </div>
    <div v-else-if="helper" :id="messageId" class="bw-field__helper">
      {{ helper }}
    </div>
  </div>
</template>

<style scoped>
.bw-field__label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: var(--ink-3);
  margin-bottom: 8px;
}

.bw-field.is-disabled .bw-field__label {
  color: var(--gray-2);
}

.bw-field__control {
  position: relative;
}

.bw-select {
  width: 100%;
  height: 48px;
  padding: 0 42px 0 14px;
  font-family: inherit;
  font-weight: 500;
  font-size: 15px;
  color: var(--ink);
  background: var(--white);
  border: 1.5px solid var(--line);
  border-radius: 10px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.bw-select--empty {
  color: var(--gray-2);
}

.bw-select:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.bw-select--error {
  border-color: var(--danger);
  box-shadow: var(--ring-danger);
}

.bw-select:disabled {
  color: var(--gray-2);
  background: var(--line-2);
  cursor: not-allowed;
}

.bw-select__chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--gray);
  display: flex;
}

.bw-select:disabled ~ .bw-select__chevron {
  color: var(--gray-3);
}

.bw-field__error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: var(--danger);
  font-size: 12.5px;
  font-weight: 500;
}

.bw-field__helper {
  font-size: 12px;
  color: var(--gray-2);
  margin-top: 7px;
}
</style>
