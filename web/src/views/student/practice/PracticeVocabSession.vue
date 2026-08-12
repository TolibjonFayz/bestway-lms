<script setup>
import { computed, ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwProgressBar from '@/components/base/BwProgressBar.vue'
import FlashCard from '@/views/student/learn/FlashCard.vue'
import { answerPracticeWord } from '@/api/practice'
import uz from '@/locales/uz'

const props = defineProps({
  words: { type: Array, required: true },
})

const emit = defineEmits(['finish'])

const index = ref(0)
const flipped = ref(false)
const saving = ref(false)

const current = computed(() => props.words[index.value] ?? null)
const percent = computed(() =>
  props.words.length ? Math.round((index.value / props.words.length) * 100) : 0,
)

/* The answer is fire-and-forget on purpose: mastery is not something the
   student is waiting to see, and blocking the next card on a round trip makes
   a twenty-word session feel like treacle. A failure just means that word
   comes back next session. */
async function answer(correct) {
  if (!current.value || saving.value) return
  saving.value = true
  const word = current.value
  try {
    await answerPracticeWord({ vocabWordId: word.id, correct })
  } catch {
    /* Swallowed deliberately — see above. */
  } finally {
    saving.value = false
    flipped.value = false
    if (index.value + 1 >= props.words.length) emit('finish')
    else index.value += 1
  }
}
</script>

<template>
  <div class="pvocab">
    <div class="pvocab__top">
      <span class="pvocab__count bw-nums">
        {{ uz.practice.progress.replace('{current}', index + 1).replace('{total}', words.length) }}
      </span>
      <button type="button" class="pvocab__exit" @click="$emit('finish')">
        {{ uz.practice.exit }}
      </button>
    </div>

    <BwProgressBar :value="percent" class="pvocab__bar" />

    <p v-if="current?.unitTitle" class="pvocab__unit">{{ current.unitTitle }}</p>

    <FlashCard
      v-if="current"
      :word="current"
      :flipped="flipped"
      class="pvocab__card"
      @flip="flipped = !flipped"
    />

    <div class="pvocab__actions">
      <BwButton variant="secondary" :disabled="saving" @click="answer(false)">
        {{ uz.practice.dontKnow }}
      </BwButton>
      <BwButton :disabled="saving" @click="answer(true)">
        {{ uz.practice.know }}
      </BwButton>
    </div>
  </div>
</template>

<style scoped>
.pvocab {
  max-width: 520px;
  margin: 0 auto;
}

.pvocab__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pvocab__count {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--gray);
}

.pvocab__exit {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray);
  cursor: pointer;
  padding: 4px 6px;
}

.pvocab__exit:hover {
  color: var(--danger);
}

.pvocab__exit:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
  border-radius: 6px;
}

.pvocab__bar {
  margin-bottom: 14px;
}

.pvocab__unit {
  margin: 0 0 10px;
  text-align: center;
  font-size: 12.5px;
  color: var(--gray-2);
  font-weight: 600;
}

.pvocab__card {
  margin-bottom: 18px;
}

.pvocab__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
