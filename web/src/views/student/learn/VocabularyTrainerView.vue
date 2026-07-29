<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StudentShell from '@/layouts/StudentShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '../lessons/LessonsStateCard.vue'
import FlashCard from './FlashCard.vue'
import VocabCompletion from './VocabCompletion.vue'
import VocabWordList from './VocabWordList.vue'
import { answerVocabWord, fetchVocabWords } from '@/api/learning'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const unitId = computed(() => Number(route.params.unitId))
const courseId = computed(() => Number(route.params.courseId))

const set = ref(null)
const loading = ref(false)
const error = ref(null)
const answering = ref(false)

/** Cards for this run, in order. */
const queue = ref([])
const index = ref(0)
const flipped = ref(false)
const finished = ref(false)
const coinsThisSession = ref(0)
const correctThisSession = ref(0)

const current = computed(() => queue.value[index.value] ?? null)
const total = computed(() => queue.value.length)
const position = computed(() => Math.min(index.value + 1, total.value))
const progressPercent = computed(() =>
  total.value ? Math.round((index.value / total.value) * 100) : 0,
)

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchVocabWords(unitId.value)
    set.value = data
    /* A run drills the words that are not yet mastered; when everything is
       already learnt the whole list is revised instead of showing nothing. */
    const pending = data.words.filter((word) => word.state !== 'mastered')
    queue.value = pending.length ? pending : data.words
    index.value = 0
    flipped.value = false
    finished.value = false
    coinsThisSession.value = 0
    correctThisSession.value = 0
  } catch (cause) {
    error.value = cause
    set.value = null
  } finally {
    loading.value = false
  }
}

async function answer(correct) {
  if (!current.value || answering.value) return
  answering.value = true
  try {
    const result = await answerVocabWord(current.value.id, correct)
    coinsThisSession.value += result.coinsAwarded
    if (correct) correctThisSession.value += 1

    /* Keep the word list in step without a second round trip. */
    const word = set.value?.words.find((w) => w.id === result.vocabWordId)
    if (word) {
      word.level = result.level
      word.state = result.state
    }
    if (set.value) {
      set.value.mastered = result.mastered
      set.value.percent = result.percent
    }

    flipped.value = false
    if (index.value + 1 >= total.value) finished.value = true
    else index.value += 1
  } catch {
    toast.error(uz.vocab.errorTitle, { description: uz.vocab.errorText })
  } finally {
    answering.value = false
  }
}

function leave() {
  router.push(`/lessons/${courseId.value}/units/${unitId.value}`)
}

/* A 404 here means the unit has no vocabulary at all — a maths unit, say —
   which is an empty state, not a failure. */
const isMissing = computed(() => error.value?.response?.status === 404)

watch(unitId, load, { immediate: true })
</script>

<template>
  <StudentShell>
    <div class="vtrainer">
      <div class="vtrainer__pane">
        <div class="vtrainer__head">
          <button
            class="vtrainer__close"
            type="button"
            :aria-label="uz.vocab.close"
            @click="leave"
          >
            <BwIcon name="x" :size="17" :stroke-width="2" />
          </button>
          <span v-if="!finished && total" class="vtrainer__position">
            {{ uz.vocab.position.replace('{current}', position).replace('{total}', total) }}
          </span>
          <span class="vtrainer__spacer" />
        </div>

        <div v-if="!finished && total" class="vtrainer__track">
          <div class="vtrainer__fill" :style="{ width: `${progressPercent}%` }" />
        </div>

        <BwSkeleton
          v-if="loading"
          variant="block"
          height="280px"
          radius="22px"
          class="vtrainer__sk"
        />

        <LessonsStateCard
          v-else-if="isMissing"
          icon="star"
          :title="uz.vocab.emptyTitle"
          :text="uz.vocab.emptyText"
        />

        <LessonsStateCard
          v-else-if="error"
          variant="error"
          icon="alert-triangle"
          :title="uz.vocab.errorTitle"
          :text="uz.vocab.errorText"
          :retrying="loading"
          @retry="load"
        />

        <VocabCompletion
          v-else-if="finished && set"
          :total="total"
          :correct="correctThisSession"
          :mastered="set.mastered"
          :set-total="set.total"
          :coins="coinsThisSession"
          @continue="leave"
        />

        <template v-else-if="current">
          <FlashCard
            :word="current"
            :flipped="flipped"
            @flip="flipped = !flipped"
          />

          <div class="vtrainer__actions">
            <button
              class="vtrainer__btn vtrainer__btn--unknown"
              type="button"
              :disabled="answering"
              @click="answer(false)"
            >
              <BwIcon name="x" :size="18" :stroke-width="2" />{{ uz.vocab.dontKnow }}
            </button>
            <button
              class="vtrainer__btn vtrainer__btn--known"
              type="button"
              :disabled="answering"
              @click="answer(true)"
            >
              <BwIcon name="check" :size="18" :stroke-width="3" />{{ uz.vocab.know }}
            </button>
          </div>
        </template>
      </div>

      <div v-if="set && !loading" class="vtrainer__aside">
        <VocabWordList :words="set.words" />
      </div>
    </div>
  </StudentShell>
</template>

<style scoped>
.vtrainer {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.vtrainer__pane {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.vtrainer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.vtrainer__close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.vtrainer__close:hover {
  background: var(--bg);
}

.vtrainer__close:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.vtrainer__position {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink-3);
}

.vtrainer__spacer {
  width: 36px;
}

.vtrainer__track {
  height: 7px;
  background: var(--line-2);
  border-radius: 99px;
  overflow: hidden;
  margin-top: 12px;
}

.vtrainer__fill {
  height: 100%;
  background: var(--green);
  border-radius: 99px;
  transition: width 0.2s ease;
}

.vtrainer__sk {
  margin-top: 22px;
}

.vtrainer__actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.vtrainer__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  height: 52px;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.vtrainer__btn:disabled {
  opacity: 0.6;
  cursor: progress;
}

.vtrainer__btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.vtrainer__btn--unknown {
  background: var(--line-2);
  color: var(--ink-4);
}

.vtrainer__btn--unknown:hover:not(:disabled) {
  background: var(--line);
}

.vtrainer__btn--known {
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-continue-sm);
}

.vtrainer__btn--known:hover:not(:disabled) {
  background: var(--green-dark);
}

.vtrainer__aside {
  width: 100%;
}

@media (min-width: 1024px) {
  .vtrainer {
    gap: 28px;
    flex-wrap: nowrap;
  }

  .vtrainer__pane {
    max-width: 420px;
    min-height: 600px;
  }

  .vtrainer__aside {
    flex: 1;
    min-width: 320px;
    max-width: 460px;
  }
}
</style>
