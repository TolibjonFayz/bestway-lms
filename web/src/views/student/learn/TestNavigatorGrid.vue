<script setup>
import uz from '@/locales/uz'

const props = defineProps({
  questions: { type: Array, required: true },
  answeredIds: { type: Set, required: true },
  currentQuestionId: { type: Number, default: null },
})

defineEmits(['select'])

function stateOf(question) {
  if (question.id === props.currentQuestionId) return 'current'
  if (props.answeredIds.has(question.id)) return 'answered'
  return 'unanswered'
}
</script>

<template>
  <div class="tnav">
    <div class="tnav__label">{{ uz.test.navigatorTitle }}</div>
    <div class="tnav__grid">
      <button
        v-for="(question, index) in questions"
        :key="question.id"
        type="button"
        class="tnav__cell"
        :class="`tnav__cell--${stateOf(question)}`"
        :aria-current="question.id === currentQuestionId ? 'true' : undefined"
        @click="$emit('select', question.id)"
      >
        {{ index + 1 }}
      </button>
    </div>
    <div class="tnav__legend">
      <span class="tnav__legend-row">
        <span class="tnav__swatch tnav__swatch--answered" />{{ uz.test.legendAnswered }}
      </span>
      <span class="tnav__legend-row">
        <span class="tnav__swatch tnav__swatch--current" />{{ uz.test.legendCurrent }}
      </span>
      <span class="tnav__legend-row">
        <span class="tnav__swatch tnav__swatch--unanswered" />{{ uz.test.legendUnanswered }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.tnav {
  display: none;
}

.tnav__label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 12px;
}

.tnav__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 9px;
}

.tnav__cell {
  aspect-ratio: 1;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
}

.tnav__cell:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tnav__cell--answered {
  background: var(--green);
  color: var(--white);
}

.tnav__cell--current {
  background: var(--white);
  border: 2.5px solid var(--green);
  color: var(--green);
}

.tnav__cell--unanswered {
  background: var(--line-2);
  border: 1px solid var(--line);
  color: var(--gray-2);
}

.tnav__legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.tnav__legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gray);
}

.tnav__swatch {
  width: 14px;
  height: 14px;
  border-radius: 5px;
  flex: none;
}

.tnav__swatch--answered {
  background: var(--green);
}

.tnav__swatch--current {
  background: var(--white);
  border: 2px solid var(--green);
}

.tnav__swatch--unanswered {
  background: var(--line-2);
  border: 1px solid var(--line);
}

@media (min-width: 1024px) {
  .tnav {
    display: block;
  }
}
</style>
