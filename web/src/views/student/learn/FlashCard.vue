<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import { useSpeech } from '@/composables/useSpeech'
import uz from '@/locales/uz'

const props = defineProps({
  word: { type: Object, required: true },
  flipped: { type: Boolean, default: false },
})

const emit = defineEmits(['flip'])

const { speak, supported } = useSpeech()

function pronounce(event) {
  /* The speaker sits inside the card, which flips on click. */
  event.stopPropagation()
  speak(props.word.wordEn)
}

function onKey(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  emit('flip')
}
</script>

<template>
  <div
    class="fcard"
    role="button"
    tabindex="0"
    :aria-pressed="flipped"
    @click="$emit('flip')"
    @keydown="onKey"
  >
    <template v-if="!flipped">
      <div class="fcard__word">{{ word.wordEn }}</div>
      <div v-if="word.transcription" class="fcard__ipa">/{{ word.transcription }}/</div>
      <button
        v-if="supported"
        class="fcard__speak"
        type="button"
        :aria-label="uz.vocab.pronounce"
        @click="pronounce"
      >
        <BwIcon name="speaker" :size="20" :stroke-width="2" />
      </button>
      <p v-if="word.exampleEn" class="fcard__example">{{ word.exampleEn }}</p>
      <span class="fcard__hint">{{ uz.vocab.flipToTranslation }}</span>
    </template>

    <template v-else>
      <div class="fcard__source">{{ word.wordEn }}</div>
      <div class="fcard__translation">{{ word.wordUz }}</div>
      <p v-if="word.exampleEn" class="fcard__example">{{ word.exampleEn }}</p>
      <span class="fcard__hint">{{ uz.vocab.flipBack }}</span>
    </template>
  </div>
</template>

<style scoped>
.fcard {
  flex: 1;
  margin-top: 22px;
  background: linear-gradient(160deg, var(--green-pale), var(--white));
  border: 1.5px solid var(--green-mid);
  border-radius: 22px;
  padding: 28px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  font-family: inherit;
  min-height: 280px;
}

.fcard:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.fcard__word {
  font-size: 34px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.fcard__ipa {
  font-size: 16px;
  color: var(--gray);
  font-weight: 500;
  margin-top: 8px;
}

.fcard__speak {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--green);
  color: var(--white);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  cursor: pointer;
  box-shadow: var(--sh-speak);
}

.fcard__speak:hover {
  background: var(--green-dark);
}

.fcard__speak:focus-visible {
  outline: 2px solid var(--green-dark);
  outline-offset: 3px;
}

.fcard__source {
  font-size: 15px;
  color: var(--gray-2);
  font-weight: 600;
}

.fcard__translation {
  font-size: 36px;
  font-weight: 800;
  color: var(--green-dark);
  letter-spacing: -0.01em;
  margin-top: 6px;
}

.fcard__example {
  margin: 20px 0 0;
  font-size: 15px;
  color: var(--ink-3);
  line-height: 1.55;
  max-width: 280px;
}

.fcard__hint {
  font-size: 12.5px;
  color: var(--gray-2);
  font-weight: 600;
  margin-top: 16px;
}
</style>
