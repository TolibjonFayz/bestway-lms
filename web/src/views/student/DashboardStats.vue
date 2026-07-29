<script setup>
import { computed } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { formatCount } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const props = defineProps({
  stats: { type: Object, required: true },
})

/* Ring geometry differs between the phone (r19/stroke5) and desktop
   (r26/stroke6) cards; both draw the same percentage. */
const RADIUS = { sm: 19, lg: 26 }

const percent = computed(() => props.stats.homework?.percent ?? 0)
const dash = (radius) => (2 * Math.PI * radius).toFixed(1)
const offset = (radius) =>
  ((2 * Math.PI * radius) * (1 - percent.value / 100)).toFixed(1)
</script>

<template>
  <div class="stats">
    <div class="stats__card">
      <div class="stats__row">
        <span class="stats__tile stats__tile--orange">
          <BwIcon name="coins" class="stats__icon" />
        </span>
        <div class="stats__figures">
          <div class="stats__value bw-nums">{{ formatCount(stats.coins) }}</div>
          <div class="stats__label">{{ uz.gamification.coins }}</div>
        </div>
      </div>
    </div>

    <div class="stats__card">
      <div class="stats__row">
        <span class="stats__tile stats__tile--amber">
          <BwIcon name="star" class="stats__icon" />
        </span>
        <div class="stats__figures">
          <div class="stats__value bw-nums">{{ formatCount(stats.points) }}</div>
          <div class="stats__label">{{ uz.gamification.points }}</div>
        </div>
      </div>
    </div>

    <div class="stats__card">
      <div class="stats__row">
        <span class="stats__tile stats__tile--green">
          <BwIcon name="trophy" class="stats__icon" />
        </span>
        <div class="stats__figures">
          <div class="stats__value bw-nums">
            <template v-if="stats.rank">
              {{ stats.rank }}<span class="stats__suffix">{{ uz.dashboard.rankSuffix }}</span>
            </template>
            <template v-else>—</template>
          </div>
          <div class="stats__label stats__label--wide">{{ uz.dashboard.rank }}</div>
          <div class="stats__label stats__label--narrow">{{ uz.dashboard.rankShort }}</div>
        </div>
      </div>
    </div>

    <div class="stats__hw">
      <div class="stats__hw-head">
        <div class="stats__hw-title">{{ uz.dashboard.homework }}</div>
        <button
          class="stats__hw-btn"
          type="button"
          :aria-label="uz.dashboard.goToHomework"
        >
          <BwIcon name="arrow-up-right" :size="18" :stroke-width="2" />
        </button>
      </div>
      <div class="stats__hw-body">
        <div class="stats__ring">
          <svg class="stats__ring-svg stats__ring-svg--sm" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="19" fill="none" stroke="var(--layer-w-28)" stroke-width="5" />
            <circle
              cx="24" cy="24" r="19" fill="none" stroke="var(--white)" stroke-width="5"
              stroke-linecap="round" :stroke-dasharray="dash(RADIUS.sm)" :stroke-dashoffset="offset(RADIUS.sm)"
            />
          </svg>
          <svg class="stats__ring-svg stats__ring-svg--lg" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--layer-w-28)" stroke-width="6" />
            <circle
              cx="32" cy="32" r="26" fill="none" stroke="var(--white)" stroke-width="6"
              stroke-linecap="round" :stroke-dasharray="dash(RADIUS.lg)" :stroke-dashoffset="offset(RADIUS.lg)"
            />
          </svg>
          <span class="stats__ring-value bw-nums">{{ percent }}%</span>
        </div>
        <div class="stats__hw-text">
          <div class="stats__hw-unit">{{ stats.homework?.unitTitle ?? '—' }}</div>
          <div class="stats__hw-done">
            {{ uz.dashboard.homeworkDone.replace('{percent}', percent) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.stats__card {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  box-shadow: var(--sh-sm);
  padding: 16px;
}

.stats__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats__tile {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.stats__icon {
  width: 20px;
  height: 20px;
}

.stats__tile--orange {
  background: var(--orange-pale);
  color: var(--orange);
}
.stats__tile--amber {
  background: var(--amber-soft);
  color: var(--amber);
}
.stats__tile--green {
  background: var(--green-mid);
  color: var(--green);
}

.stats__value {
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1;
}

.stats__suffix {
  font-size: 13px;
  color: var(--gray-2);
  font-weight: 700;
}

.stats__label {
  font-size: 12px;
  color: var(--gray);
  font-weight: 500;
  margin-top: 3px;
}

.stats__label--wide {
  display: none;
}

/* ── Homework card ─────────────────────────────────────────────────── */

.stats__hw {
  position: relative;
  background: var(--green);
  border-radius: 16px;
  box-shadow: var(--sh-hw-sm);
  padding: 16px;
  color: var(--white);
  overflow: hidden;
}

.stats__hw-head {
  display: none;
}

.stats__hw-body {
  display: flex;
  align-items: center;
  gap: 11px;
}

.stats__ring {
  position: relative;
  width: 48px;
  height: 48px;
  flex: none;
}

.stats__ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.stats__ring-svg--lg {
  display: none;
}

.stats__ring-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.stats__hw-text {
  min-width: 0;
}

.stats__hw-unit {
  font-size: 13.5px;
  font-weight: 800;
}

.stats__hw-done {
  font-size: 11px;
  color: var(--green-mid);
  margin-top: 2px;
  font-weight: 500;
}

@media (min-width: 1024px) {
  .stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 20px;
  }

  .stats__card {
    border-radius: 18px;
    padding: 20px;
  }

  /* Desktop stacks the tile above the number instead of beside it. */
  .stats__row {
    display: block;
  }

  .stats__tile {
    width: 46px;
    height: 46px;
    border-radius: 13px;
  }

  .stats__icon {
    width: 24px;
    height: 24px;
  }

  .stats__value {
    font-size: 32px;
    letter-spacing: -0.02em;
    margin-top: 15px;
  }

  .stats__suffix {
    font-size: 17px;
  }

  .stats__label {
    font-size: 14px;
    margin-top: 5px;
  }

  .stats__label--wide {
    display: block;
  }

  .stats__label--narrow {
    display: none;
  }

  .stats__hw {
    border-radius: 18px;
    box-shadow: var(--sh-green);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .stats__hw-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .stats__hw-title {
    font-size: 16px;
    font-weight: 800;
  }

  .stats__hw-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: none;
    background: var(--layer-w-20);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex: none;
    transition: background 0.15s;
  }

  .stats__hw-btn:hover {
    background: var(--layer-w-32);
  }

  .stats__hw-btn:focus-visible {
    outline: 2px solid var(--white);
    outline-offset: 2px;
  }

  .stats__hw-body {
    gap: 14px;
  }

  .stats__ring {
    width: 64px;
    height: 64px;
  }

  .stats__ring-svg--sm {
    display: none;
  }

  .stats__ring-svg--lg {
    display: block;
  }

  .stats__ring-value {
    font-size: 16px;
  }

  .stats__hw-unit {
    font-size: 14px;
    color: var(--green-mid);
    font-weight: 600;
  }

  .stats__hw-done {
    font-size: 13px;
    color: var(--green-soft);
    margin-top: 3px;
    font-weight: 600;
  }
}
</style>
