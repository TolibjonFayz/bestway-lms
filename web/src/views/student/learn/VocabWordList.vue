<script setup>
import uz from '@/locales/uz'

/* The dot colour is the mastery band the API already resolved: new / learning
   / mastered. The client never recomputes it from the raw level. */
defineProps({
  words: { type: Array, required: true },
})
</script>

<template>
  <section class="wlist">
    <div class="wlist__head">
      <h2 class="wlist__title">{{ uz.vocab.wordListTitle }}</h2>
      <span class="wlist__count">
        {{ uz.vocab.wordCount.replace('{n}', words.length) }}
      </span>
    </div>

    <div class="wlist__legend">
      <span class="wlist__key">
        <span class="wlist__dot wlist__dot--new" />{{ uz.vocab.stateNew }}
      </span>
      <span class="wlist__key">
        <span class="wlist__dot wlist__dot--learning" />{{ uz.vocab.stateLearning }}
      </span>
      <span class="wlist__key">
        <span class="wlist__dot wlist__dot--mastered" />{{ uz.vocab.stateMastered }}
      </span>
    </div>

    <div class="wlist__rows bw-scroll">
      <div v-for="word in words" :key="word.id" class="wlist__row">
        <span class="wlist__dot" :class="`wlist__dot--${word.state}`" />
        <span class="wlist__en">{{ word.wordEn }}</span>
        <span class="wlist__uz">{{ word.wordUz }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wlist {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 20px;
  box-shadow: var(--sh-sm);
  padding: 18px;
}

.wlist__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.wlist__title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.wlist__count {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gray);
}

.wlist__legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.wlist__key {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--gray);
}

.wlist__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.wlist__dot--new {
  background: var(--gray-2);
}

.wlist__dot--learning {
  background: var(--orange);
}

.wlist__dot--mastered {
  background: var(--green);
}

.wlist__rows {
  max-height: 400px;
  overflow-y: auto;
}

.wlist__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 6px;
  border-bottom: 1px solid var(--line-2);
}

.wlist__row:last-child {
  border-bottom: none;
}

.wlist__en {
  flex: 1;
  min-width: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
}

.wlist__uz {
  font-size: 14px;
  color: var(--gray);
  text-align: right;
}

@media (min-width: 1024px) {
  .wlist {
    border-radius: 24px;
    padding: 22px;
  }

  .wlist__title {
    font-size: 18px;
  }
}
</style>
