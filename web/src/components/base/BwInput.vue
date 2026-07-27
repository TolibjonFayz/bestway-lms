<script setup>
import { computed, ref, useId } from 'vue'
import BwIcon from './BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'password', 'email', 'tel', 'number'].includes(v),
  },
  placeholder: { type: String, default: '' },
  helper: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  autocomplete: { type: String, default: undefined },
  inputmode: { type: String, default: undefined },
  name: { type: String, default: undefined },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const uid = useId()
const inputId = computed(() => `bw-input-${uid}`)
const messageId = computed(() => `bw-input-msg-${uid}`)

const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const resolvedType = computed(() =>
  isPassword.value && revealed.value ? 'text' : props.type,
)
const hasMessage = computed(() => Boolean(props.error || props.helper))
</script>

<template>
  <div class="bw-field" :class="{ 'is-disabled': disabled }">
    <label v-if="label" class="bw-field__label" :for="inputId">{{ label }}</label>

    <div class="bw-field__control">
      <input
        :id="inputId"
        class="bw-input"
        :class="{ 'bw-input--error': error, 'bw-input--password': isPassword }"
        :type="resolvedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :name="name"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="hasMessage ? messageId : undefined"
        @input="emit('update:modelValue', $event.target.value)"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <button
        v-if="isPassword"
        class="bw-field__reveal"
        type="button"
        :aria-label="revealed ? uz.form.hidePassword : uz.form.showPassword"
        :aria-pressed="revealed"
        :disabled="disabled"
        @click="revealed = !revealed"
      >
        <BwIcon :name="revealed ? 'eye-off' : 'eye'" :size="20" />
      </button>
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

.bw-input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  font-family: inherit;
  font-weight: 500;
  font-size: 15px;
  color: var(--ink);
  background: var(--white);
  border: 1.5px solid var(--line);
  border-radius: 10px;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.bw-input::placeholder {
  color: var(--gray-2);
}

.bw-input--password {
  padding: 0 48px 0 14px;
  letter-spacing: 0.02em;
}

.bw-input:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.bw-input--error {
  border-color: var(--danger);
  box-shadow: var(--ring-danger);
}

.bw-input:disabled {
  color: var(--gray-2);
  background: var(--line-2);
  cursor: not-allowed;
}

.bw-field__reveal {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray);
}

.bw-field__reveal:hover:not(:disabled) {
  background: var(--line-2);
  color: var(--ink);
}

.bw-field__reveal:disabled {
  cursor: not-allowed;
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
