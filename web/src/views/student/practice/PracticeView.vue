<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StudentShell from '@/layouts/StudentShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import PracticeMistakeSession from './PracticeMistakeSession.vue'
import PracticeVocabSession from './PracticeVocabSession.vue'
import {
  fetchPracticeMistakes,
  fetchPracticeSummary,
  fetchPracticeVocab,
} from '@/api/practice'
import uz from '@/locales/uz'

const router = useRouter()

const summary = ref(null)
const loading = ref(true)
const failed = ref(false)
const starting = ref(null)
/** null on the menu, otherwise { kind, items } for the running session. */
const session = ref(null)
const finished = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    summary.value = await fetchPracticeSummary()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

async function start(kind) {
  if (starting.value) return
  starting.value = kind
  finished.value = false
  try {
    const items = kind === 'vocab' ? await fetchPracticeVocab() : await fetchPracticeMistakes()
    if (items.length) session.value = { kind, items }
  } catch {
    failed.value = true
  } finally {
    starting.value = null
  }
}

/* Ending a session refreshes the counts, since drilling words moves some of
   them past mastery and out of the due list. */
function finish() {
  session.value = null
  finished.value = true
  load()
}

load()
</script>

<template>
  <StudentShell>
    <div class="practice">
      <template v-if="!session">
        <h1 class="practice__title">{{ uz.practice.title }}</h1>
        <p class="practice__subtitle">{{ uz.practice.subtitle }}</p>

        <div v-if="finished" class="practice__done">
          <BwIcon name="check-circle" :size="18" />
          <span>
            <strong>{{ uz.practice.finishTitle }}</strong> — {{ uz.practice.finishText }}
          </span>
        </div>

        <BwSkeleton v-if="loading" variant="block" height="200px" radius="18px" />

        <LessonsStateCard
          v-else-if="failed"
          variant="error"
          icon="alert-triangle"
          :title="uz.practice.errorTitle"
          :text="uz.practice.errorText"
          @retry="load"
        />

        <LessonsStateCard
          v-else-if="summary && !summary.wordsDue && !summary.mistakeCount"
          icon="target"
          :title="uz.practice.emptyTitle"
          :text="uz.practice.emptyText"
          :action-label="uz.practice.emptyAction"
          @action="router.push('/lessons')"
        />

        <div v-else-if="summary" class="practice__cards">
          <button
            v-if="summary.wordsDue"
            type="button"
            class="practice__card"
            :disabled="starting === 'vocab'"
            @click="start('vocab')"
          >
            <span class="practice__card-icon is-vocab"><BwIcon name="star" :size="19" /></span>
            <span class="practice__card-body">
              <span class="practice__card-title">{{ uz.practice.vocabTitle }}</span>
              <span class="practice__card-text">{{ uz.practice.vocabText }}</span>
              <span class="practice__card-count">
                {{ uz.practice.vocabCount.replace('{n}', summary.wordsDue) }}
              </span>
            </span>
            <BwIcon name="chevron-right" :size="17" class="practice__card-chevron" />
          </button>

          <button
            v-if="summary.mistakeCount"
            type="button"
            class="practice__card"
            :disabled="starting === 'mistakes'"
            @click="start('mistakes')"
          >
            <span class="practice__card-icon is-mistakes"><BwIcon name="target" :size="19" /></span>
            <span class="practice__card-body">
              <span class="practice__card-title">{{ uz.practice.mistakesTitle }}</span>
              <span class="practice__card-text">{{ uz.practice.mistakesText }}</span>
              <span class="practice__card-count">
                {{ uz.practice.mistakesCount.replace('{n}', summary.mistakeCount) }}
              </span>
            </span>
            <BwIcon name="chevron-right" :size="17" class="practice__card-chevron" />
          </button>
        </div>
      </template>

      <PracticeVocabSession
        v-else-if="session.kind === 'vocab'"
        :words="session.items"
        @finish="finish"
      />
      <PracticeMistakeSession v-else :mistakes="session.items" @finish="finish" />
    </div>
  </StudentShell>
</template>

<style scoped>
.practice__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.practice__subtitle {
  margin: 5px 0 18px;
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 500;
}

.practice__done {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 15px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: var(--green-pale);
  color: var(--green-darker);
  font-size: 13.5px;
}

.practice__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.practice__card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 17px 18px;
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.practice__card:hover:not(:disabled) {
  border-color: var(--green-soft);
}

.practice__card:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.practice__card:disabled {
  opacity: 0.6;
  cursor: progress;
}

.practice__card-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.practice__card-icon.is-vocab {
  background: color-mix(in srgb, var(--amber) 18%, transparent);
  color: var(--amber);
}

.practice__card-icon.is-mistakes {
  background: var(--green-pale);
  color: var(--green-darker);
}

.practice__card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.practice__card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.practice__card-text {
  font-size: 12.5px;
  color: var(--gray);
}

.practice__card-count {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--green-darker);
}

.practice__card-chevron {
  color: var(--gray-2);
  flex-shrink: 0;
}
</style>
