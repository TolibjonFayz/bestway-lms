<script setup>
import { ref, watch } from 'vue'
import ReviewGradeForm from './ReviewGradeForm.vue'
import ReviewQuestionCard from './ReviewQuestionCard.vue'
import ReviewSpeakingPlayer from './ReviewSpeakingPlayer.vue'
import uz from '@/locales/uz'

const props = defineProps({
  submission: { type: Object, required: true },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['grade'])

const reviewingGraded = ref(false)
watch(() => props.submission.id, () => (reviewingGraded.value = false))

const resultTone = (score) => {
  if (score === null) return 'needsWorkResult'
  if (score >= 85) return 'greatResult'
  if (score >= 60) return 'goodResult'
  return 'needsWorkResult'
}
</script>

<template>
  <div class="rdetail">
    <div class="rdetail__head">
      <div>
        <div class="rdetail__eyebrow">{{ submission.unitTitle }} · {{ uz.itemTypes[submission.itemType] }}</div>
        <div class="rdetail__name">{{ submission.studentName }}</div>
      </div>
      <span
        class="rdetail__status"
        :class="submission.status === 'graded' ? 'is-graded' : 'is-pending'"
      >{{ submission.status === 'graded' ? uz.review.graded : uz.review.pending }}</span>
    </div>

    <template v-if="submission.status === 'graded' && !reviewingGraded">
      <div class="rdetail__result">
        <div class="rdetail__score bw-nums">{{ submission.score }}%</div>
        <div class="rdetail__result-body">
          <div class="rdetail__result-title">{{ uz.review[resultTone(submission.score)] }}</div>
          <div v-if="submission.teacherComment" class="rdetail__result-comment">
            {{ uz.review.savedComment.replace('{comment}', submission.teacherComment) }}
          </div>
        </div>
      </div>
      <button
        v-if="submission.itemType === 'test'"
        type="button"
        class="rdetail__reagain"
        @click="reviewingGraded = true"
      >
        {{ uz.review.reviewAgain }}
      </button>
    </template>

    <template v-else>
      <ReviewSpeakingPlayer
        v-if="submission.itemType === 'speaking'"
        :prompt="submission.speakingPrompt"
      />
      <template v-else>
        <ReviewQuestionCard
          v-for="(question, index) in submission.questions"
          :key="question.id"
          :question="question"
          :index="index"
        />
      </template>

      <ReviewGradeForm
        v-if="submission.status !== 'graded'"
        :submission-id="submission.id"
        :saving="saving"
        @submit="(payload) => emit('grade', payload)"
      />
    </template>
  </div>
</template>

<style scoped>
.rdetail {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 26px 30px;
  background: var(--bg);
}

.rdetail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.rdetail__eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
}

.rdetail__name {
  font-size: 21px;
  font-weight: 800;
  color: var(--ink);
  margin-top: 2px;
}

.rdetail__status {
  font-weight: 700;
  font-size: 13px;
  padding: 6px 13px;
  border-radius: 99px;
  flex: none;
}

.rdetail__status.is-pending {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.rdetail__status.is-graded {
  color: var(--green-dark);
  background: var(--green-mid);
}

.rdetail__result {
  background: var(--green-pale);
  border: 1px solid var(--green-soft);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.rdetail__score {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--green);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
  flex: none;
}

.rdetail__result-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.rdetail__result-comment {
  font-size: 13.5px;
  color: var(--green-darker);
  margin-top: 5px;
  line-height: 1.5;
}

.rdetail__reagain {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  height: 48px;
  padding: 0 22px;
  border-radius: 12px;
  background: var(--white);
  color: var(--green-dark);
  border: 1.5px solid var(--green);
  cursor: pointer;
  margin-top: 18px;
}

.rdetail__reagain:hover {
  background: var(--green-pale);
}

.rdetail__reagain:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (max-width: 1023px) {
  .rdetail {
    padding: 16px;
  }

  /* The mobile top bar already shows the unit and student name. */
  .rdetail__head {
    display: none;
  }
}
</style>
