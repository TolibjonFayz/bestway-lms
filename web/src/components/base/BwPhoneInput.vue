<script setup>
import { computed, nextTick, ref, useId } from 'vue'
import BwIcon from './BwIcon.vue'
import { usePhoneFormat } from '@/composables/usePhoneFormat'

const props = defineProps({
  /* The raw national digits, e.g. "901234567" — never the mask. */
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  helper: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  /* "spaced" is the design system mockup, "parens" the (90) 123-45-67 form. */
  format: {
    type: String,
    default: 'spaced',
    validator: (v) => ['spaced', 'parens'].includes(v),
  },
  /* The mockup shows the bare +998 prefix; the flag is opt-in. */
  flag: { type: Boolean, default: false },
  name: { type: String, default: undefined },
  autocomplete: { type: String, default: 'tel-national' },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const phone = usePhoneFormat()
const uid = useId()
const inputId = computed(() => `bw-phone-${uid}`)
const messageId = computed(() => `bw-phone-msg-${uid}`)

const inputEl = ref(null)
const focused = ref(false)

const display = computed(() => phone.format(props.modelValue, props.format))
const placeholder = computed(() =>
  phone.format('901234567', props.format),
)
const hasMessage = computed(() => Boolean(props.error || props.helper))

async function onInput(event) {
  const el = event.target
  const typed = el.value
  const caretDigits = phone.digitsBeforeCaret(typed, el.selectionStart ?? typed.length)
  const digits = phone.onlyDigits(typed)

  emit('update:modelValue', digits)

  /* Vue will not re-render when the digits are unchanged (e.g. the user typed
     a letter), so restore the masked text and caret by hand. */
  await nextTick()
  const masked = phone.format(digits, props.format)
  el.value = masked
  const caret = phone.caretAfterDigits(masked, caretDigits)
  el.setSelectionRange(caret, caret)
}

function onFocus(event) {
  focused.value = true
  emit('focus', event)
}

function onBlur(event) {
  focused.value = false
  emit('blur', event)
}
</script>

<template>
  <div class="bw-field" :class="{ 'is-disabled': disabled }">
    <label v-if="label" class="bw-field__label" :for="inputId">{{ label }}</label>

    <div
      class="bw-phone"
      :class="{
        'is-focused': focused,
        'is-error': Boolean(error),
        'is-disabled': disabled,
      }"
    >
      <span class="bw-phone__prefix">
        <!-- Drawn rather than an emoji: Windows has no regional-indicator
             flag glyphs, so 🇺🇿 renders as the letters "UZ". -->
        <svg
          v-if="flag"
          class="bw-phone__flag"
          viewBox="0 0 24 16"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="0" y="0" width="24" height="5" fill="#0099b5" />
          <rect x="0" y="5" width="24" height="0.7" fill="#ce1126" />
          <rect x="0" y="5.7" width="24" height="4.6" fill="#ffffff" />
          <rect x="0" y="10.3" width="24" height="0.7" fill="#ce1126" />
          <rect x="0" y="11" width="24" height="5" fill="#1eb53a" />
        </svg>
        +998
      </span>
      <input
        :id="inputId"
        ref="inputEl"
        class="bw-phone__input"
        type="tel"
        inputmode="tel"
        :value="display"
        :placeholder="placeholder"
        :disabled="disabled"
        :name="name"
        :autocomplete="autocomplete"
        :maxlength="placeholder.length"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="hasMessage ? messageId : undefined"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
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

.bw-phone {
  display: flex;
  align-items: center;
  height: 48px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: var(--white);
  overflow: hidden;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.bw-phone.is-focused {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.bw-phone.is-error {
  border-color: var(--danger);
  box-shadow: var(--ring-danger);
}

.bw-phone.is-disabled {
  background: var(--line-2);
}

.bw-phone__prefix {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 100%;
  padding: 0 14px;
  background: var(--bg);
  border-right: 1.5px solid var(--line);
  font-weight: 700;
  font-size: 15px;
  color: var(--ink);
  letter-spacing: 0.02em;
  flex: none;
}

.bw-phone__flag {
  width: 21px;
  height: 14px;
  border-radius: 2px;
  box-shadow: var(--sh-inset-strong);
  flex: none;
}

.bw-phone__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  height: 100%;
  padding: 0 14px;
  font-family: inherit;
  font-weight: 500;
  font-size: 15px;
  color: var(--ink);
  background: transparent;
  letter-spacing: 0.04em;
}

.bw-phone__input::placeholder {
  color: var(--gray-2);
}

.bw-phone__input:disabled {
  color: var(--gray-2);
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
