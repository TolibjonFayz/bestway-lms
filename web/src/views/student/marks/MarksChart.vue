<script setup>
import { computed } from 'vue'
import uz from '@/locales/uz'

/* points: [{ weekIndex, isCurrent, average }], already trimmed server-side to
   the weeks that have actually started — a chart never shows a future week. */
const props = defineProps({
  points: { type: Array, required: true },
})

/* Points are spaced as if there were always 5 possible weeks (4 gaps), so an
   early-month chart with only one or two points sits at the left rather than
   stretching to fill the width — matching a progress-so-far reading. */
const SLOTS = 4
const X0 = 20
const X1 = 540
const Y_TOP = 20
const Y_BASE = 140

function xFor(index) {
  return X0 + index * ((X1 - X0) / SLOTS)
}
function yFor(average) {
  const clamped = Math.min(100, Math.max(0, average))
  return Y_BASE - (clamped / 100) * (Y_BASE - Y_TOP)
}

const coords = computed(() => props.points.map((p, i) => ({ x: xFor(i), y: yFor(p.average) })))
const linePath = computed(() =>
  coords.value.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' '),
)
const areaPath = computed(() => {
  if (!coords.value.length) return ''
  const last = coords.value[coords.value.length - 1]
  const first = coords.value[0]
  return `${linePath.value} L${last.x},${Y_BASE} L${first.x},${Y_BASE} Z`
})

function labelFor(point) {
  return point.isCurrent ? uz.marks.current : uz.marks.week.replace('{n}', point.weekIndex)
}
</script>

<template>
  <div class="mchart">
    <svg class="mchart__svg" viewBox="0 0 560 170" preserveAspectRatio="none">
      <line x1="20" y1="20" x2="540" y2="20" class="mchart__grid" />
      <line x1="20" y1="60" x2="540" y2="60" class="mchart__grid" />
      <line x1="20" y1="100" x2="540" y2="100" class="mchart__grid" />
      <line x1="20" y1="140" x2="540" y2="140" class="mchart__grid mchart__grid--base" />
      <path v-if="areaPath" :d="areaPath" class="mchart__area" />
      <path v-if="linePath" :d="linePath" class="mchart__line" />
      <circle
        v-for="(c, index) in coords"
        :key="index"
        :cx="c.x"
        :cy="c.y"
        :r="index === coords.length - 1 ? 6 : 5"
        class="mchart__dot"
        :class="{ 'mchart__dot--last': index === coords.length - 1 }"
      />
    </svg>
    <div class="mchart__labels">
      <span
        v-for="(point, index) in points"
        :key="index"
        class="mchart__label"
        :class="{ 'mchart__label--current': point.isCurrent }"
      >
        {{ labelFor(point) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.mchart__svg {
  width: 100%;
  height: 110px;
  overflow: visible;
  display: block;
}

.mchart__grid {
  display: none;
}

.mchart__area {
  fill: var(--green);
  opacity: 0.1;
}

.mchart__line {
  fill: none;
  stroke: var(--green);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mchart__dot {
  display: none;
}

.mchart__labels {
  display: none;
}

@media (min-width: 1024px) {
  .mchart__svg {
    height: 180px;
  }

  .mchart__grid {
    display: block;
    stroke: var(--line-2);
    stroke-width: 1;
  }

  .mchart__grid--base {
    stroke: var(--line);
    stroke-width: 1.5;
  }

  .mchart__line {
    stroke-width: 3;
  }

  .mchart__dot {
    display: block;
    fill: var(--white);
    stroke: var(--green);
    stroke-width: 2.5;
  }

  .mchart__dot--last {
    fill: var(--green);
    stroke: var(--white);
  }

  .mchart__labels {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;
    margin-top: 2px;
  }

  .mchart__label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--gray-2);
  }

  .mchart__label--current {
    font-weight: 700;
    color: var(--green);
  }
}
</style>
