<script setup>
import { computed, ref, watch } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  submissionId: { type: Number, required: true },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const score = ref('')
const comment = ref('')

/* A new submission resets the form instead of carrying the previous
   student's half-typed score into the next card. */
watch(
  () => props.submissionId,
  () => {
    score.value = ''
    comment.value = ''
  },
)

const scoreValue = computed(() => Number(score.value))
const isValid = computed(
  () => score.value !== '' && Number.isInteger(scoreValue.value) && scoreValue.value >= 0 && scoreValue.value <= 100,
)

function submit() {
  if (!isValid.value || props.saving) return
  emit('submit', { score: scoreValue.value, comment: comment.value.trim() || undefined })
}
</script>

<template>
  <form class="rgform" @submit.prevent="submit">
    <div class="rgform__row">
      <div class="rgform__field rgform__field--score">
        <label class="rgform__label" :for="`rg-score-${submissionId}`">{{ uz.review.scoreLabel }}</label>
        <input
          :id="`rg-score-${submissionId}`"
          v-model="score"
          type="number"
          min="0"
          max="100"
          :placeholder="uz.review.scorePlaceholder"
          class="rgform__input"
          :disabled="saving"
        />
      </div>
      <div class="rgform__field rgform__field--comment">
        <label class="rgform__label" :for="`rg-comment-${submissionId}`">{{ uz.review.commentLabel }}</label>
        <textarea
          :id="`rg-comment-${submissionId}`"
          v-model="comment"
          rows="1"
          :placeholder="uz.review.commentPlaceholder"
          class="rgform__textarea"
          :disabled="saving"
        />
      </div>
    </div>

    <button type="submit" class="rgform__save" :disabled="!isValid || saving">
      {{ saving ? uz.review.saving : uz.review.saveNext }}
      <BwIcon v-if="!saving" name="arrow-right" :size="17" />
    </button>
  </form>
</template>

<style scoped>
.rgform__row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.rgform__label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-3);
  margin-bottom: 7px;
}

.rgform__field--score {
  flex: none;
}

.rgform__field--comment {
  flex: 1;
  min-width: 220px;
}

.rgform__input,
.rgform__textarea {
  font-family: inherit;
  color: var(--ink);
  border: 1.5px solid var(--line);
  border-radius: 10px;
  outline: none;
}

.rgform__input {
  width: 110px;
  height: 46px;
  padding: 0 12px;
  font-weight: 700;
  font-size: 16px;
}

.rgform__textarea {
  width: 100%;
  min-height: 46px;
  padding: 11px 12px;
  font-size: 14.5px;
  resize: vertical;
}

.rgform__input:focus,
.rgform__textarea:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.rgform__input:disabled,
.rgform__textarea:disabled {
  background: var(--line-2);
  color: var(--gray-2);
  cursor: not-allowed;
}

.rgform__save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  height: 50px;
  padding: 0 24px;
  border-radius: 12px;
  border: none;
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-btn);
  cursor: pointer;
  margin-top: 18px;
}

.rgform__save:hover:not(:disabled) {
  background: var(--green-dark);
}

.rgform__save:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.rgform__save:disabled {
  background: var(--line);
  color: var(--gray-2);
  box-shadow: none;
  cursor: not-allowed;
}

@media (max-width: 639px) {
  .rgform__save {
    width: 100%;
  }
}
</style>
