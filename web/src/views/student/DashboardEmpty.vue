<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  firstName: { type: String, default: '' },
})

defineEmits(['browse'])

const title = uz.dashboard.emptyTitle.replace('{name}', props.firstName)
</script>

<template>
  <div class="empty">
    <section class="empty__hero">
      <div class="empty__art">
        <span class="empty__leaf empty__leaf--1" />
        <span class="empty__leaf empty__leaf--2" />
        <BwIcon
          name="graduation-cap"
          :size="58"
          :stroke-width="1.5"
          class="empty__art-icon"
        />
      </div>
      <h2 class="empty__title">{{ title }}</h2>
      <p class="empty__text">{{ uz.dashboard.emptyText }}</p>
      <button class="empty__cta" type="button" @click="$emit('browse')">
        {{ uz.actions.viewLessons }}
        <BwIcon name="arrow-right" :size="19" :stroke-width="1.9" />
      </button>
    </section>

    <div class="empty__stats">
      <div class="empty__stat">
        <span class="empty__tile"><BwIcon name="coins" :size="24" /></span>
        <div class="empty__value">0</div>
        <div class="empty__label">{{ uz.gamification.coins }}</div>
      </div>
      <div class="empty__stat">
        <span class="empty__tile"><BwIcon name="star-outline" :size="24" /></span>
        <div class="empty__value">0</div>
        <div class="empty__label">{{ uz.gamification.points }}</div>
      </div>
      <div class="empty__stat">
        <span class="empty__tile"><BwIcon name="trophy" :size="24" /></span>
        <div class="empty__value">—</div>
        <div class="empty__label">{{ uz.dashboard.rank }}</div>
      </div>
      <div class="empty__hw">
        <span class="empty__hw-tile"><BwIcon name="pencil" :size="22" /></span>
        <div class="empty__hw-text">{{ uz.dashboard.homeworkNone }}</div>
      </div>
    </div>

    <div class="empty__continue">
      <div class="empty__continue-art">
        <BwIcon name="books" :size="34" />
      </div>
      <h3 class="empty__continue-title">{{ uz.dashboard.emptyContinueTitle }}</h3>
      <p class="empty__continue-text">{{ uz.dashboard.emptyContinueText }}</p>
    </div>
  </div>
</template>

<style scoped>
.empty__hero {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 22px;
  box-shadow: var(--sh-sm);
  padding: 40px 22px;
  margin-top: 16px;
  text-align: center;
}

.empty__art {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--green-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.empty__leaf {
  position: absolute;
  width: 80px;
  height: 80px;
  top: 30px;
}

.empty__leaf--1 {
  border-radius: 0 100% 30% 100%;
  background: var(--layer-green-14);
  left: 24px;
}

.empty__leaf--2 {
  border-radius: 100% 0 100% 30%;
  background: rgba(34, 197, 94, 0.14);
  right: 24px;
}

.empty__art-icon {
  position: relative;
  color: var(--green);
}

.empty__title {
  margin: 26px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.empty__text {
  margin: 10px auto 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--gray);
  max-width: 440px;
  text-wrap: pretty;
}

.empty__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  height: 54px;
  padding: 0 26px;
  border-radius: 13px;
  border: none;
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-green);
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.15s;
}

.empty__cta:hover {
  background: var(--green-dark);
}

.empty__cta:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

/* ── Zeroed stats ──────────────────────────────────────────────────── */

.empty__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.empty__stat {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  box-shadow: var(--sh-sm);
  padding: 16px;
  opacity: 0.75;
}

.empty__tile {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: var(--bg);
  color: var(--gray-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty__value {
  font-size: 26px;
  font-weight: 800;
  color: var(--gray-3);
  margin-top: 12px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.empty__label {
  font-size: 13px;
  color: var(--gray-2);
  font-weight: 500;
  margin-top: 5px;
}

.empty__hw {
  background: var(--white);
  border: 1px dashed var(--line);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty__hw-tile {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--green-pale);
  color: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty__hw-text {
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 600;
  margin-top: 10px;
  line-height: 1.35;
}

/* ── Empty "Davom etamiz" ──────────────────────────────────────────── */

.empty__continue {
  border: 1px dashed var(--line);
  border-radius: 20px;
  background: var(--tint-slate);
  padding: 32px 20px;
  margin-top: 18px;
  text-align: center;
}

.empty__continue-art {
  width: 120px;
  height: 88px;
  margin: 0 auto;
  border-radius: 14px;
  background: repeating-linear-gradient(
    45deg,
    var(--line-3),
    var(--line-3) 9px,
    var(--bg) 9px,
    var(--bg) 18px
  );
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-3);
}

.empty__continue-title {
  margin: 18px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.empty__continue-text {
  margin: 7px auto 0;
  font-size: 14px;
  color: var(--gray);
  max-width: 360px;
  line-height: 1.55;
}

@media (min-width: 1024px) {
  .empty__hero {
    padding: 52px 32px;
    margin-top: 22px;
  }

  .empty__title {
    font-size: 24px;
  }

  .empty__text {
    font-size: 15.5px;
  }

  .empty__stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 20px;
  }

  .empty__stat,
  .empty__hw {
    border-radius: 18px;
    padding: 20px;
  }

  .empty__value {
    font-size: 32px;
    margin-top: 15px;
  }

  .empty__label {
    font-size: 14px;
  }

  .empty__continue {
    padding: 40px 24px;
    margin-top: 22px;
  }
}
</style>
