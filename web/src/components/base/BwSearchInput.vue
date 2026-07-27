<script setup>
import { computed, useId } from 'vue'
import BwIcon from './BwIcon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  helper: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue', 'search'])

const uid = useId()
const inputId = computed(() => `bw-search-${uid}`)
const helperId = computed(() => `bw-search-msg-${uid}`)
</script>

<template>
  <div class="bw-field" :class="{ 'is-disabled': disabled }">
    <label v-if="label" class="bw-field__label" :for="inputId">{{ label }}</label>

    <div class="bw-field__control">
      <span class="bw-search__icon">
        <BwIcon name="search" :size="19" />
      </span>
      <input
        :id="inputId"
        class="bw-search"
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :name="name"
        :aria-describedby="helper ? helperId : undefined"
        @input="emit('update:modelValue', $event.target.value)"
        @keyup.enter="emit('search', modelValue)"
      />
    </div>

    <div v-if="helper" :id="helperId" class="bw-field__helper">{{ helper }}</div>
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

.bw-search__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--gray-2);
  display: flex;
}

.bw-search {
  width: 100%;
  height: 48px;
  padding: 0 14px 0 42px;
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

.bw-search::placeholder {
  color: var(--gray-2);
}

.bw-search:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.bw-search:disabled {
  color: var(--gray-2);
  background: var(--line-2);
  cursor: not-allowed;
}

/* The browser's own clear affordance clashes with the bespoke field. */
.bw-search::-webkit-search-decoration,
.bw-search::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.bw-field__helper {
  font-size: 12px;
  color: var(--gray-2);
  margin-top: 7px;
}
</style>
