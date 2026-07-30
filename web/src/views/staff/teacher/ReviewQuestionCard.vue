<script setup>
import { computed } from 'vue'
import uz from '@/locales/uz'

const props = defineProps({
  question: { type: Object, required: true },
  index: { type: Number, required: true },
})

const isOpen = computed(() => props.question.correct === null)
</script>

<template>
  <div class="rqcard" :class="{ 'is-open': isOpen }">
    <div class="rqcard__head">
      <span class="rqcard__num">
        {{ uz.review[isOpen ? 'questionLabelOpen' : 'questionLabel'].replace('{n}', index + 1) }}
      </span>
      <span
        v-if="isOpen"
        class="rqcard__chip rqcard__chip--manual"
      >{{ uz.review.manualNeeded }}</span>
      <span
        v-else
        class="rqcard__chip"
        :class="question.correct ? 'rqcard__chip--correct' : 'rqcard__chip--wrong'"
      >{{ question.correct ? uz.review.autoCorrect : uz.review.autoWrong }}</span>
    </div>

    <p v-if="isOpen" class="rqcard__prompt">{{ question.prompt }}</p>
    <div v-if="isOpen" class="rqcard__answer-block">{{ question.studentAnswerText }}</div>

    <p v-else class="rqcard__line">
      {{ question.prompt }} — javob:
      <strong v-if="question.correct">{{ question.studentAnswerText }}</strong>
      <template v-else>
        <s class="rqcard__wrong-text">{{ question.studentAnswerText }}</s>
        → {{ uz.review.correctPrefix }} <strong>{{ question.correctAnswerText }}</strong>
      </template>
    </p>
  </div>
</template>

<style scoped>
.rqcard {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.rqcard.is-open {
  border: 1.5px solid var(--orange-soft);
}

.rqcard__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 9px;
}

.rqcard__num {
  font-weight: 700;
  font-size: 13px;
  color: var(--gray-2);
}

.rqcard__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 99px;
}

.rqcard__chip--correct {
  color: var(--green-dark);
  background: var(--green-mid);
}

.rqcard__chip--wrong {
  color: var(--danger-darker);
  background: var(--danger-soft);
}

.rqcard__chip--manual {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.rqcard__line,
.rqcard__prompt {
  margin: 0;
  font-size: 14.5px;
  color: var(--ink);
  font-weight: 600;
  line-height: 1.5;
}

.rqcard__wrong-text {
  color: var(--gray-2);
  font-weight: 500;
}

.rqcard__answer-block {
  font-size: 14.5px;
  color: var(--ink-3);
  line-height: 1.6;
  background: var(--bg);
  border-radius: 10px;
  padding: 12px;
  margin-top: 8px;
}
</style>
