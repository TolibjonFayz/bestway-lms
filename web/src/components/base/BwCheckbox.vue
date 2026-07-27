<script setup>
import { computed } from 'vue'
import BwIcon from './BwIcon.vue'

const props = defineProps({
  modelValue: { type: [Boolean, Array], default: false },
  /* Set when several boxes share one array model. */
  value: { type: [String, Number], default: undefined },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue'])

const checked = computed(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.includes(props.value)
    : Boolean(props.modelValue),
)

function onChange(event) {
  if (!Array.isArray(props.modelValue)) {
    emit('update:modelValue', event.target.checked)
    return
  }
  const next = new Set(props.modelValue)
  event.target.checked ? next.add(props.value) : next.delete(props.value)
  emit('update:modelValue', [...next])
}
</script>

<template>
  <label class="bw-check" :class="{ 'is-checked': checked, 'is-disabled': disabled }">
    <input
      class="bw-check__input"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      :name="name"
      :value="value"
      @change="onChange"
    />
    <span class="bw-check__box">
      <BwIcon v-if="checked" name="check" :size="14" :stroke-width="3" />
    </span>
    <span class="bw-check__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<style scoped>
.bw-check {
  display: flex;
  align-items: center;
  gap: 11px;
  cursor: pointer;
}

.bw-check.is-disabled {
  cursor: not-allowed;
}

.bw-check__input {
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

.bw-check__box {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--white);
  border: 1.5px solid var(--gray-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--white);
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}

.bw-check.is-checked .bw-check__box {
  background: var(--green);
  border-color: var(--green);
}

/* `data-force="focus"` pins the ring so /kitchen-sink can show it statically. */
.bw-check__input:focus-visible ~ .bw-check__box,
.bw-check[data-force='focus'] .bw-check__box {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.bw-check.is-disabled .bw-check__box {
  background: var(--line-2);
  border-color: var(--line);
}

.bw-check.is-disabled.is-checked .bw-check__box {
  background: var(--gray-3);
  border-color: var(--gray-3);
}

.bw-check__label {
  font-size: 14.5px;
  color: var(--ink-3);
  font-weight: 500;
}

.bw-check.is-checked .bw-check__label {
  color: var(--ink);
}

.bw-check.is-disabled .bw-check__label {
  color: var(--gray-2);
}
</style>
