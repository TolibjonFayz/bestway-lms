<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StudentShell from '@/layouts/StudentShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '../lessons/LessonsStateCard.vue'
import TestExitDialog from './TestExitDialog.vue'
import TestNavigatorGrid from './TestNavigatorGrid.vue'
import TestQuestionFillBlank from './TestQuestionFillBlank.vue'
import TestQuestionMatching from './TestQuestionMatching.vue'
import TestQuestionMultipleChoice from './TestQuestionMultipleChoice.vue'
import TestResultView from './TestResultView.vue'
import {
  fetchTestState,
  retakeTest,
  saveTestAnswers,
  submitTest,
} from '@/api/tests'
import { errorMessage } from '@/api/http'
import { useLessonsStore } from '@/stores/lessons'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const QUESTION_COMPONENTS = {
  multiple_choice: TestQuestionMultipleChoice,
  fill_blank: TestQuestionFillBlank,
  matching: TestQuestionMatching,
}

const route = useRoute()
const router = useRouter()
const lessons = useLessonsStore()
const toast = useToast()

const courseId = computed(() => Number(route.params.courseId))
const unitId = computed(() => Number(route.params.unitId))
const unit = computed(() => lessons.unit)
const testItem = computed(
  () => unit.value?.items.find((item) => item.type === 'test') ?? null,
)

/** 'loading' | 'error' | 'empty' | 'taking' | 'result'. */
const mode = ref('loading')
const loadError = ref(null)
const attempt = ref(null)
const result = ref(null)
const answers = ref({})
const currentIndex = ref(0)
const remainingSeconds = ref(null)
const exitOpen = ref(false)
const submitting = ref(false)

const totalQuestions = computed(() => attempt.value?.questions.length ?? 0)
const currentQuestion = computed(() => attempt.value?.questions[currentIndex.value] ?? null)
const isLast = computed(() => currentIndex.value === totalQuestions.value - 1)
const questionComponent = computed(
  () => QUESTION_COMPONENTS[currentQuestion.value?.type] ?? TestQuestionMultipleChoice,
)
const currentAnswer = computed(() => {
  const question = currentQuestion.value
  if (!question) return null
  const value = answers.value[question.id]
  if (value !== undefined) return value
  return question.type === 'matching' ? {} : question.type === 'fill_blank' ? '' : null
})
const questionLabel = computed(() =>
  uz.test.questionLabel
    .replace('{current}', Math.min(currentIndex.value + 1, totalQuestions.value))
    .replace('{total}', totalQuestions.value),
)

function isAnswered(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

const answeredIds = computed(() => {
  const ids = new Set()
  for (const [key, value] of Object.entries(answers.value)) {
    if (isAnswered(value)) ids.add(Number(key))
  }
  return ids
})

function clock(totalSeconds) {
  const safe = Math.max(0, totalSeconds ?? 0)
  const minutes = Math.floor(safe / 60)
  const seconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

let timerHandle = null
function stopTimer() {
  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }
}
function startTimer() {
  stopTimer()
  if (attempt.value?.timeLimitSeconds == null) return
  timerHandle = setInterval(() => {
    if (remainingSeconds.value === null) return
    remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
    if (remainingSeconds.value === 0) {
      stopTimer()
      void doSubmit(true)
    }
  }, 1000)
}

let saveTimer = null
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    void persistAnswers()
  }, 600)
}
function cancelPendingSave() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
}
function flushPendingSave() {
  if (!saveTimer) return
  clearTimeout(saveTimer)
  saveTimer = null
  void persistAnswers()
}
async function persistAnswers() {
  if (!attempt.value) return
  try {
    await saveTestAnswers(attempt.value.lessonItemId, answers.value)
  } catch {
    /* Best-effort: the next edit reschedules a save, and submit() always
       sends the full current answers regardless of whether this landed. */
  }
}

function updateAnswer(value) {
  const question = currentQuestion.value
  if (!question) return
  answers.value = { ...answers.value, [question.id]: value }
  scheduleSave()
}

function applyAttempt(data) {
  attempt.value = data
  answers.value = { ...data.answers }
  currentIndex.value = 0
  remainingSeconds.value = data.remainingSeconds
  mode.value = 'taking'
  startTimer()
  if (data.timeLimitSeconds != null && data.remainingSeconds === 0) {
    void doSubmit(true)
  }
}

function applyResult(data) {
  result.value = data
  mode.value = 'result'
}

async function load(lessonItemId) {
  mode.value = 'loading'
  loadError.value = null
  stopTimer()
  try {
    const state = await fetchTestState(lessonItemId)
    if (state.mode === 'taking') applyAttempt(state.attempt)
    else if (state.mode === 'result') applyResult(state.result)
    else mode.value = 'pending'
  } catch (cause) {
    loadError.value = cause
    mode.value = 'error'
  }
}

function retry() {
  if (testItem.value) load(testItem.value.id)
}

function goBack() {
  if (currentIndex.value > 0) currentIndex.value -= 1
}
function goNext() {
  if (isLast.value) {
    void doSubmit(false)
    return
  }
  currentIndex.value += 1
}
function selectQuestion(questionId) {
  const index = attempt.value?.questions.findIndex((q) => q.id === questionId) ?? -1
  if (index !== -1) currentIndex.value = index
}
function navClass(question) {
  if (question.id === currentQuestion.value?.id) return 'is-current'
  if (answeredIds.value.has(question.id)) return 'is-answered'
  return 'is-unanswered'
}

async function doSubmit(auto) {
  if (!attempt.value || submitting.value) return
  submitting.value = true
  stopTimer()
  cancelPendingSave()
  try {
    const res = await submitTest(attempt.value.lessonItemId, answers.value)
    applyResult(res)
    await lessons.loadUnit(unitId.value)
    if (auto) {
      toast.info(uz.test.timeUpTitle, { description: uz.test.timeUpText })
    } else if (res.coinsAwarded > 0) {
      toast.success(uz.video.completed, {
        description: uz.vocab.coinsEarned.replace('{n}', res.coinsAwarded),
      })
    }
  } catch (cause) {
    toast.error(uz.test.submitErrorTitle, {
      description: errorMessage(cause, uz.test.submitErrorText),
    })
  } finally {
    submitting.value = false
  }
}

async function retake() {
  if (!testItem.value || submitting.value) return
  try {
    const data = await retakeTest(testItem.value.id)
    applyAttempt(data)
  } catch (cause) {
    toast.error(uz.test.loadErrorTitle, {
      description: errorMessage(cause, uz.test.loadErrorText),
    })
  }
}

function goToUnit() {
  router.push(`/lessons/${courseId.value}/units/${unitId.value}`)
}

function openExit() {
  exitOpen.value = true
}
function cancelExit() {
  exitOpen.value = false
}
function confirmExit() {
  exitOpen.value = false
  flushPendingSave()
  goToUnit()
}

/* Tracks which test item's attempt/result is currently loaded. lessons.loadUnit()
   nulls out lessons.unit while it refetches (see stores/lessons.js), so
   testItem.value?.id passes through undefined on every reload — including the
   one doSubmit() triggers right after a successful submit. Comparing against
   watch's own "previous value" would see undefined -> 3 as a fresh change and
   reload, clobbering the just-submitted result with the zeroed-out "revisit"
   view. This plain variable survives that blip: it only updates when a load
   actually happens, so the id settling back to what it already was is a no-op. */
let loadedItemId = null

watch(unitId, (id) => {
  attempt.value = null
  result.value = null
  mode.value = 'loading'
  loadedItemId = null
  if (id) lessons.loadUnit(id)
}, { immediate: true })

watch(() => testItem.value?.id, (id) => {
  if (id) {
    if (id !== loadedItemId) {
      loadedItemId = id
      load(id)
    }
  } else if (!lessons.unitLoading && unit.value) {
    mode.value = 'empty'
  }
})

onBeforeUnmount(() => {
  stopTimer()
  flushPendingSave()
})
</script>

<template>
  <StudentShell>
    <div class="tview">
      <BwSkeleton
        v-if="lessons.unitLoading || mode === 'loading'"
        variant="block"
        height="480px"
        radius="20px"
      />

      <LessonsStateCard
        v-else-if="lessons.unitError"
        variant="error"
        icon="alert-triangle"
        :title="uz.test.loadErrorTitle"
        :text="uz.test.loadErrorText"
        @retry="lessons.loadUnit(unitId)"
      />

      <LessonsStateCard
        v-else-if="mode === 'error'"
        variant="error"
        icon="alert-triangle"
        :title="uz.test.loadErrorTitle"
        :text="uz.test.loadErrorText"
        @retry="retry"
      />

      <LessonsStateCard
        v-else-if="mode === 'empty'"
        icon="pencil"
        :title="uz.test.emptyTitle"
        :text="uz.test.emptyText"
      />

      <LessonsStateCard
        v-else-if="mode === 'pending'"
        icon="clock"
        :title="uz.test.pendingTitle"
        :text="uz.test.pendingText"
      />

      <TestResultView
        v-else-if="mode === 'result' && result"
        :result="result"
        @retake="retake"
        @next="goToUnit"
      />

      <div v-else-if="mode === 'taking' && attempt" class="tview__card">
        <div class="tview__head">
          <div>
            <div class="tview__code">{{ unit?.code }}</div>
            <div class="tview__count">{{ questionLabel }}</div>
          </div>
          <div class="tview__head-right">
            <span v-if="attempt.timeLimitSeconds != null" class="tview__timer">
              <BwIcon name="clock" :size="15" :stroke-width="1.9" />{{ clock(remainingSeconds) }}
            </span>
            <button class="tview__exit" type="button" @click="openExit">
              {{ uz.test.exit }}
            </button>
          </div>
        </div>

        <div class="tview__body">
          <div class="tview__main">
            <component
              :is="questionComponent"
              :key="currentQuestion.id"
              :question="currentQuestion"
              :model-value="currentAnswer"
              @update:model-value="updateAnswer"
            />

            <div class="tview__nav-mobile bw-scroll">
              <button
                v-for="(question, index) in attempt.questions"
                :key="question.id"
                type="button"
                class="tview__chip"
                :class="`tview__chip--${navClass(question)}`"
                @click="selectQuestion(question.id)"
              >
                {{ index + 1 }}
              </button>
            </div>

            <div class="tview__footer">
              <button
                class="tview__btn tview__btn--back"
                type="button"
                :disabled="currentIndex === 0"
                @click="goBack"
              >
                <BwIcon name="chevron-left" :size="17" :stroke-width="2" />{{ uz.actions.back }}
              </button>
              <button
                class="tview__btn tview__btn--next"
                type="button"
                :disabled="submitting"
                @click="goNext"
              >
                {{ isLast ? uz.test.submit : uz.actions.next }}
                <BwIcon v-if="!isLast" name="chevron-right" :size="17" :stroke-width="2" />
              </button>
            </div>
            <div class="tview__hint">{{ uz.test.submitHint }}</div>
          </div>

          <TestNavigatorGrid
            class="tview__nav-desktop"
            :questions="attempt.questions"
            :answered-ids="answeredIds"
            :current-question-id="currentQuestion?.id ?? null"
            @select="selectQuestion"
          />
        </div>

        <TestExitDialog :open="exitOpen" @cancel="cancelExit" @confirm="confirmExit" />
      </div>
    </div>
  </StudentShell>
</template>

<style scoped>
.tview__card {
  position: relative;
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-md);
  padding: 18px;
}

.tview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line-2);
}

.tview__code {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tview__count {
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
  margin-top: 2px;
}

.tview__head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tview__timer {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-size: 13px;
  color: var(--orange-ink);
  background: var(--orange-soft);
  padding: 5px 10px;
  border-radius: 99px;
}

.tview__exit {
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  color: var(--gray);
  background: none;
  border: none;
  cursor: pointer;
}

.tview__exit:hover {
  color: var(--ink);
}

.tview__body {
  display: flex;
  gap: 26px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.tview__main {
  flex: 2;
  min-width: 0;
  width: 100%;
}

.tview__nav-mobile {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-top: 18px;
  padding-bottom: 4px;
}

.tview__chip {
  min-width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 800;
  font-size: 13px;
  flex: none;
  cursor: pointer;
  border: 1px solid transparent;
}

.tview__chip--answered {
  background: var(--green);
  color: var(--white);
}

.tview__chip--current {
  background: var(--white);
  border: 2px solid var(--green);
  color: var(--green);
}

.tview__chip--unanswered {
  background: var(--line-2);
  border: 1px solid var(--line);
  color: var(--gray-2);
}

.tview__nav-desktop {
  flex: 1;
  min-width: 220px;
}

.tview__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--line-2);
}

.tview__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14.5px;
  height: 48px;
  border-radius: 11px;
  cursor: pointer;
  border: none;
  flex: 1;
}

.tview__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.tview__btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tview__btn--back {
  background: var(--line-2);
  color: var(--green-dark);
}

.tview__btn--back:hover:not(:disabled) {
  background: var(--line);
}

.tview__btn--next {
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-btn);
}

.tview__btn--next:hover:not(:disabled) {
  background: var(--green-dark);
}

.tview__hint {
  display: none;
}

@media (min-width: 1024px) {
  .tview__card {
    border-radius: 24px;
    padding: 28px;
  }

  .tview__head {
    padding-bottom: 18px;
  }

  .tview__code {
    font-size: 12px;
  }

  .tview__count {
    font-size: 17px;
  }

  .tview__head-right {
    gap: 18px;
  }

  .tview__timer {
    gap: 7px;
    font-size: 15px;
    padding: 8px 14px;
  }

  .tview__exit {
    font-size: 14.5px;
  }

  .tview__body {
    margin-top: 22px;
  }

  .tview__nav-mobile {
    display: none;
  }

  .tview__footer {
    margin-top: 28px;
    padding-top: 22px;
    justify-content: space-between;
  }

  .tview__btn {
    flex: none;
    padding: 0 22px;
  }

  .tview__hint {
    display: block;
    text-align: right;
    margin-top: 8px;
    font-size: 12px;
    color: var(--gray-2);
    font-weight: 600;
  }
}
</style>
