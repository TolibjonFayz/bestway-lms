<script setup>
import { computed, ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwProgressBar from '@/components/base/BwProgressBar.vue'
import TestQuestionFillBlank from '@/views/student/learn/TestQuestionFillBlank.vue'
import TestQuestionMatching from '@/views/student/learn/TestQuestionMatching.vue'
import TestQuestionMultipleChoice from '@/views/student/learn/TestQuestionMultipleChoice.vue'
import { checkPracticeMistake } from '@/api/practice'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const props = defineProps({
  mistakes: { type: Array, required: true },
})

const emit = defineEmits(['finish'])

const toast = useToast()

const index = ref(0)
const answer = ref(null)
const result = ref(null)
const checking = ref(false)

const current = computed(() => props.mistakes[index.value] ?? null)
const percent = computed(() =>
  props.mistakes.length ? Math.round((index.value / props.mistakes.length) * 100) : 0,
)

/* Each question type carries its answer in a different shape, so the blank
   value has to match what its component expects. */
function blankAnswer(type) {
  if (type === 'matching') return {}
  if (type === 'fill_blank') return ''
  return null
}

const answered = computed(() => {
  if (result.value) return true
  const value = answer.value
  if (value === null || value === '') return false
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
})

async function check() {
  if (!current.value || checking.value || !answered.value) return
  checking.value = true
  try {
    result.value = await checkPracticeMistake({
      questionId: current.value.question.id,
      answer: answer.value,
    })
  } catch (error) {
    toast.error(uz.practice.errorTitle, {
      description: error?.response?.data?.message ?? uz.practice.errorText,
    })
  } finally {
    checking.value = false
  }
}

function next() {
  result.value = null
  if (index.value + 1 >= props.mistakes.length) {
    emit('finish')
    return
  }
  index.value += 1
  answer.value = blankAnswer(props.mistakes[index.value]?.question.type)
}

answer.value = blankAnswer(props.mistakes[0]?.question.type)
</script>

<template>
  <div class="pmist">
    <div class="pmist__top">
      <span class="pmist__count bw-nums">
        {{ uz.practice.progress.replace('{current}', index + 1).replace('{total}', mistakes.length) }}
      </span>
      <button type="button" class="pmist__exit" @click="$emit('finish')">
        {{ uz.practice.exit }}
      </button>
    </div>

    <BwProgressBar :value="percent" class="pmist__bar" />

    <div v-if="current" class="pmist__card">
      <p v-if="current.unitTitle" class="pmist__unit">{{ current.unitTitle }}</p>

      <TestQuestionMatching
        v-if="current.question.type === 'matching'"
        :question="current.question"
        :model-value="answer ?? {}"
        @update:model-value="answer = $event"
      />
      <TestQuestionFillBlank
        v-else-if="current.question.type === 'fill_blank'"
        :question="current.question"
        :model-value="answer ?? ''"
        @update:model-value="answer = $event"
      />
      <TestQuestionMultipleChoice
        v-else
        :question="current.question"
        :model-value="answer"
        @update:model-value="answer = $event"
      />

      <div v-if="result" class="pmist__result" :class="result.correct ? 'is-right' : 'is-wrong'">
        <span class="pmist__result-head">
          <BwIcon :name="result.correct ? 'check-circle' : 'x-circle'" :size="17" />
          {{ result.correct ? uz.practice.correct : uz.practice.wrong }}
        </span>
        <span v-if="!result.correct && result.correctAnswerText" class="pmist__result-answer">
          {{ uz.practice.correctAnswerIs.replace('{answer}', result.correctAnswerText) }}
        </span>
        <span v-if="result.explanation" class="pmist__result-note">{{ result.explanation }}</span>
      </div>
    </div>

    <div class="pmist__actions">
      <BwButton v-if="!result" :disabled="!answered" :loading="checking" @click="check">
        {{ uz.practice.check }}
      </BwButton>
      <BwButton v-else @click="next">{{ uz.practice.next }}</BwButton>
    </div>
  </div>
</template>

<style scoped>
.pmist {
  max-width: 620px;
  margin: 0 auto;
}

.pmist__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pmist__count {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--gray);
}

.pmist__exit {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray);
  cursor: pointer;
  padding: 4px 6px;
}

.pmist__exit:hover {
  color: var(--danger);
}

.pmist__exit:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
  border-radius: 6px;
}

.pmist__bar {
  margin-bottom: 14px;
}

.pmist__card {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 18px 20px;
  margin-bottom: 16px;
}

.pmist__unit {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--gray-2);
  font-weight: 600;
}

.pmist__result {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pmist__result.is-right {
  background: var(--green-pale);
}

.pmist__result.is-wrong {
  background: color-mix(in srgb, var(--danger) 8%, transparent);
}

.pmist__result-head {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 700;
}

.pmist__result.is-right .pmist__result-head {
  color: var(--green-darker);
}

.pmist__result.is-wrong .pmist__result-head {
  color: var(--danger);
}

.pmist__result-answer {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}

.pmist__result-note {
  font-size: 12.5px;
  color: var(--gray);
  line-height: 1.5;
}

.pmist__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
