<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  prompt: { type: String, default: '' },
})

/* No audio file is stored for a speaking submission yet (Submission.answers
   is empty for this item type) — this is a static waveform placeholder, not
   a real player, matching what the design shows. */
const BAR_HEIGHTS = [14, 22, 10, 30, 18, 26, 12, 20, 34, 16, 24, 14, 28, 11, 19, 8, 8, 8]
const playing = ref(false)
</script>

<template>
  <div class="rspeak">
    <p v-if="prompt" class="rspeak__prompt">{{ uz.review.speakingQuestion }} "{{ prompt }}"</p>
    <div class="rspeak__row">
      <button
        type="button"
        class="rspeak__play"
        :aria-label="playing ? uz.video.pause : uz.video.play"
        @click="playing = !playing"
      >
        <BwIcon :name="playing ? 'pause' : 'play'" :size="19" />
      </button>
      <div class="rspeak__wave">
        <span
          v-for="(height, index) in BAR_HEIGHTS"
          :key="index"
          class="rspeak__bar"
          :class="{ 'is-loud': height >= 20 }"
          :style="{ height: `${height}px` }"
        />
      </div>
      <span class="rspeak__duration bw-nums">01:24</span>
    </div>
  </div>
</template>

<style scoped>
.rspeak {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
}

.rspeak__prompt {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-2);
}

.rspeak__row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.rspeak__play {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--green);
  color: var(--white);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.rspeak__play:hover {
  background: var(--green-dark);
}

.rspeak__play:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.rspeak__wave {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  height: 36px;
}

.rspeak__bar {
  width: 3px;
  background: var(--green-soft);
  border-radius: 2px;
}

.rspeak__bar.is-loud {
  background: var(--green);
}

.rspeak__duration {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray);
  flex: none;
}
</style>
