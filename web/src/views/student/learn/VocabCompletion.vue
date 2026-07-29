<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  /** Cards in this run. */
  total: { type: Number, required: true },
  /** How many the student got right this run. */
  correct: { type: Number, required: true },
  /** Lifetime mastered, shown as the set-level figure. */
  mastered: { type: Number, default: 0 },
  setTotal: { type: Number, default: 0 },
  /** Coins granted by this session — 0 when they were already banked. */
  coins: { type: Number, default: 0 },
})

defineEmits(['continue'])
</script>

<template>
  <div class="vdone">
    <div class="vdone__art">
      <span class="vdone__sparkle" aria-hidden="true">✨</span>
      <BwIcon name="check-circle" :size="40" :stroke-width="1.9" />
    </div>

    <h2 class="vdone__title">{{ uz.vocab.doneTitle }}</h2>
    <p class="vdone__text">
      {{ uz.vocab.doneText.replace('{total}', total).replace('{correct}', correct) }}
    </p>

    <p class="vdone__mastery">
      {{ uz.vocab.masteryLine.replace('{mastered}', mastered).replace('{total}', setTotal) }}
    </p>

    <div v-if="coins > 0" class="vdone__coins">
      <span class="vdone__coin-mark">₮</span>
      {{ uz.vocab.coinsEarned.replace('{n}', coins) }}
    </div>

    <button class="vdone__cta" type="button" @click="$emit('continue')">
      {{ uz.actions.continue }}
      <BwIcon name="arrow-right" :size="17" :stroke-width="1.9" />
    </button>
  </div>
</template>

<style scoped>
.vdone {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 20px;
  box-shadow: var(--sh-sm);
  padding: 32px 24px;
  text-align: center;
}

.vdone__art {
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--green-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--green);
}

.vdone__sparkle {
  position: absolute;
  top: -6px;
  right: -2px;
  font-size: 22px;
}

.vdone__title {
  margin: 18px 0 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
}

.vdone__text {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--gray);
  font-weight: 500;
}

.vdone__mastery {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--gray-2);
  font-weight: 600;
}

.vdone__coins {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  background: var(--orange-pale);
  color: var(--orange-ink);
  font-weight: 800;
  font-size: 15px;
  padding: 9px 18px;
  border-radius: 99px;
}

.vdone__coin-mark {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--orange);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.vdone__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-weight: 700;
  font-size: 15.5px;
  height: 52px;
  border-radius: 12px;
  border: none;
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-continue-sm);
  cursor: pointer;
  margin-top: 22px;
  transition: background 0.15s;
}

.vdone__cta:hover {
  background: var(--green-dark);
}

.vdone__cta:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (min-width: 1024px) {
  .vdone {
    border-radius: 24px;
    padding: 36px 28px;
  }
}
</style>
