<script setup>
import { computed, ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  result: { type: Object, required: true },
})

defineEmits(['retake', 'next'])

const RADIUS = 80
const CIRCUMFERENCE = +(2 * Math.PI * RADIUS).toFixed(1)

const clampedScore = computed(() => Math.min(100, Math.max(0, props.result.score)))
const ringOffset = computed(() => +(CIRCUMFERENCE * (1 - clampedScore.value / 100)).toFixed(1))
const ringColor = computed(() => (props.result.passed ? 'var(--green)' : 'var(--danger)'))

const openIds = ref(new Set())
function toggle(id) {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}
</script>

<template>
  <div class="tresult">
    <div class="tresult__summary">
      <div class="tresult__ring-wrap">
        <svg class="tresult__ring-svg" viewBox="0 0 190 190">
          <circle cx="95" cy="95" r="80" fill="none" stroke="var(--line-2)" stroke-width="14" />
          <circle
            cx="95"
            cy="95"
            r="80"
            fill="none"
            :stroke="ringColor"
            stroke-width="14"
            stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="ringOffset"
            transform="rotate(-90 95 95)"
            class="tresult__ring-bar"
          />
        </svg>
        <div class="tresult__ring-center">
          <div class="tresult__fraction bw-nums">{{ result.correctCount }}/{{ result.totalQuestions }}</div>
          <div class="tresult__percent bw-nums" :style="{ color: ringColor }">{{ result.score }}%</div>
        </div>
      </div>

      <div class="tresult__chips">
        <span v-if="result.pointsContributed > 0" class="tresult__chip tresult__chip--ball">
          <BwIcon name="star" :size="15" />
          {{ uz.test.resultBallChip.replace('{n}', result.pointsContributed) }}
        </span>
        <span v-if="result.coinsAwarded > 0" class="tresult__chip tresult__chip--coin">
          <span class="tresult__coin-mark">₮</span>
          {{ uz.test.resultCoinChip.replace('{n}', result.coinsAwarded) }}
        </span>
      </div>
    </div>

    <div class="tresult__review">
      <div class="tresult__review-label">{{ uz.test.resultReviewTitle }}</div>
      <div class="tresult__review-list">
        <div v-for="q in result.questions" :key="q.id" class="tresult__row-wrap">
          <div v-if="q.correct" class="tresult__row is-correct">
            <span class="tresult__row-icon tresult__row-icon--correct">
              <BwIcon name="check" :size="13" :stroke-width="3" />
            </span>
            <span class="tresult__row-text">
              {{ uz.test.questionNumber.replace('{n}', q.orderIndex) }}
            </span>
          </div>

          <button v-else type="button" class="tresult__row tresult__row--toggle is-wrong" @click="toggle(q.id)">
            <span class="tresult__row-icon tresult__row-icon--wrong">
              <BwIcon name="x" :size="13" :stroke-width="3" />
            </span>
            <span class="tresult__row-text">
              {{ uz.test.questionNumber.replace('{n}', q.orderIndex) }}
            </span>
            <BwIcon
              name="chevron-down"
              :size="16"
              :stroke-width="2.2"
              class="tresult__chevron"
              :class="{ 'is-open': openIds.has(q.id) }"
            />
          </button>
          <div v-if="!q.correct && openIds.has(q.id)" class="tresult__explain">
            <strong>{{ uz.test.resultCorrectAnswer }}</strong>
            {{ q.explanation || q.correctAnswerText }}
          </div>
        </div>
      </div>
    </div>

    <div class="tresult__actions">
      <button class="tresult__btn tresult__btn--retake" type="button" @click="$emit('retake')">
        {{ uz.lessons.retakeTest }}
      </button>
      <button class="tresult__btn tresult__btn--next" type="button" @click="$emit('next')">
        {{ uz.test.resultNext }}
        <BwIcon name="arrow-right" :size="17" :stroke-width="1.9" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.tresult {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-md);
  padding: 24px 20px;
}

.tresult__summary {
  text-align: center;
}

.tresult__ring-wrap {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.tresult__ring-svg {
  width: 100%;
  height: 100%;
}

.tresult__ring-bar {
  transition: stroke-dashoffset 0.5s ease;
}

.tresult__ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tresult__fraction {
  font-size: 28px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1;
}

.tresult__percent {
  font-size: 13px;
  font-weight: 700;
  margin-top: 3px;
}

.tresult__chips {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 18px;
  flex-wrap: wrap;
}

.tresult__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 13px;
  color: var(--orange-ink);
  padding: 7px 13px;
  border-radius: 99px;
}

.tresult__chip--ball {
  background: var(--amber-soft);
}

.tresult__chip--coin {
  background: var(--orange-pale);
}

.tresult__coin-mark {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--orange);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.tresult__review {
  margin-top: 26px;
}

.tresult__review-label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 12px;
}

.tresult__review-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.tresult__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 13px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  border: none;
}

.tresult__row--toggle {
  cursor: pointer;
}

.tresult__row.is-correct {
  background: var(--green-pale);
}

.tresult__row--toggle.is-wrong {
  background: var(--danger-bg);
}

.tresult__row-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--white);
}

.tresult__row-icon--correct {
  background: var(--green);
}

.tresult__row-icon--wrong {
  background: var(--danger);
}

.tresult__row-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.tresult__chevron {
  color: var(--gray);
  flex: none;
  transition: transform 0.15s;
}

.tresult__chevron.is-open {
  transform: rotate(180deg);
}

.tresult__explain {
  padding: 0 14px 14px 52px;
  font-size: 13.5px;
  color: var(--danger-darker);
  line-height: 1.55;
  background: var(--danger-bg);
  margin-top: -9px;
  border-radius: 0 0 13px 13px;
}

.tresult__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.tresult__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  height: 50px;
  border-radius: 12px;
  cursor: pointer;
  border: none;
}

.tresult__btn--retake {
  background: var(--white);
  color: var(--green-dark);
  border: 1.5px solid var(--green);
}

.tresult__btn--retake:hover {
  background: var(--green-pale);
}

.tresult__btn--next {
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-btn);
}

.tresult__btn--next:hover {
  background: var(--green-dark);
}

.tresult__btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (min-width: 1024px) {
  .tresult {
    padding: 32px;
    display: flex;
    gap: 32px;
    align-items: flex-start;
  }

  .tresult__summary {
    flex: none;
    width: 260px;
  }

  .tresult__ring-wrap {
    width: 190px;
    height: 190px;
  }

  .tresult__fraction {
    font-size: 40px;
  }

  .tresult__percent {
    font-size: 15px;
    margin-top: 4px;
  }

  .tresult__review {
    flex: 1;
    min-width: 0;
    margin-top: 0;
  }

  .tresult__actions {
    flex-direction: row;
    margin-top: 24px;
  }
}
</style>
