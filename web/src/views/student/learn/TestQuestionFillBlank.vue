<script setup>
import { computed } from 'vue'
import uz from '@/locales/uz'

const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

/* The seeded prompt carries its own gap marker ("She has _____ her goal
   already.") — split around it so the input sits inline with the sentence,
   matching the design exactly rather than showing the input on its own line. */
const parts = computed(() => {
  const marker = '_____'
  const index = props.question.prompt.indexOf(marker)
  if (index === -1) return [props.question.prompt, '']
  return [
    props.question.prompt.slice(0, index),
    props.question.prompt.slice(index + marker.length),
  ]
})
</script>

<template>
  <div class="tqf">
    <div class="tqf__label">{{ uz.test.fillBlank }}</div>
    <div class="tqf__prompt">
      {{ parts[0] }}
      <input
        class="tqf__input"
        type="text"
        :value="modelValue"
        :placeholder="uz.test.answerPlaceholder"
        autocomplete="off"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      {{ parts[1] }}
    </div>
    <div v-if="question.options?.length" class="tqf__bank">
      <span class="tqf__bank-label">{{ uz.test.wordBank }}</span>
      <span v-for="option in question.options" :key="option.id" class="tqf__chip">
        {{ option.text }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.tqf__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.tqf__prompt {
  font-size: 16.5px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.7;
}

.tqf__input {
  width: 140px;
  height: 36px;
  border: 1.5px solid var(--line);
  border-radius: 9px;
  padding: 0 10px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  color: var(--ink);
  outline: none;
  text-align: center;
  margin: 0 2px;
}

.tqf__input:focus-visible {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.tqf__bank {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

.tqf__bank-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
}

.tqf__chip {
  font-weight: 600;
  font-size: 13px;
  color: var(--ink-3);
  background: var(--line-2);
  padding: 5px 11px;
  border-radius: 99px;
}

@media (min-width: 1024px) {
  .tqf__prompt {
    font-size: 19px;
  }

  .tqf__input {
    width: 150px;
    height: 38px;
    font-size: 16px;
  }
}
</style>
