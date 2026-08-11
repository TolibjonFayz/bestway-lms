<script setup>
import { computed } from 'vue'
import uz from '@/locales/uz'

/* points: [{ weekStart, label, submissionCount }] — eight Monday-anchored
   buckets, oldest first. Drawn as bars rather than the student chart's line,
   because these are counts per week, not a value trending over time. */
const props = defineProps({
  points: { type: Array, required: true },
})

const VIEW_W = 560
const VIEW_H = 160
const PAD_X = 16
const BASE_Y = 132
const TOP_Y = 16

const peak = computed(() =>
  Math.max(1, ...props.points.map((point) => point.submissionCount)),
)

const bars = computed(() => {
  const count = props.points.length
  if (!count) return []
  const slot = (VIEW_W - PAD_X * 2) / count
  const width = Math.min(38, slot * 0.6)

  return props.points.map((point, index) => {
    const height = (point.submissionCount / peak.value) * (BASE_Y - TOP_Y)
    return {
      ...point,
      x: PAD_X + slot * index + (slot - width) / 2,
      y: BASE_Y - height,
      width,
      height,
      /* The last bucket is the week still in progress, so it reads as
         provisional rather than as a real drop. */
      isCurrent: index === count - 1,
      labelX: PAD_X + slot * index + slot / 2,
    }
  })
})

const hasData = computed(() => props.points.some((point) => point.submissionCount > 0))
</script>

<template>
  <div class="achart">
    <div class="achart__head">
      <h3 class="achart__title">{{ uz.adminHome.activityTitle }}</h3>
      <span class="achart__subtitle">{{ uz.adminHome.activitySubtitle }}</span>
    </div>

    <p v-if="!hasData" class="achart__empty">{{ uz.adminHome.activityEmpty }}</p>

    <svg
      v-else
      class="achart__svg"
      :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
      role="img"
      :aria-label="uz.adminHome.activityTitle"
    >
      <line
        :x1="PAD_X"
        :y1="BASE_Y"
        :x2="VIEW_W - PAD_X"
        :y2="BASE_Y"
        class="achart__axis"
      />
      <g v-for="bar in bars" :key="bar.weekStart">
        <rect
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          rx="5"
          class="achart__bar"
          :class="{ 'is-current': bar.isCurrent }"
        />
        <text
          v-if="bar.submissionCount"
          :x="bar.labelX"
          :y="bar.y - 5"
          class="achart__value"
        >
          {{ bar.submissionCount }}
        </text>
        <text :x="bar.labelX" :y="BASE_Y + 17" class="achart__label">{{ bar.label }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.achart {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 18px 20px 12px;
}

.achart__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.achart__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.achart__subtitle {
  font-size: 12px;
  color: var(--gray-2);
  font-weight: 500;
}

.achart__svg {
  width: 100%;
  height: auto;
  display: block;
}

.achart__axis {
  stroke: var(--line);
  stroke-width: 1;
}

.achart__bar {
  fill: var(--green);
}

.achart__bar.is-current {
  fill: var(--green-soft);
}

.achart__value {
  fill: var(--ink);
  font-size: 11px;
  font-weight: 700;
  text-anchor: middle;
}

.achart__label {
  fill: var(--gray-2);
  font-size: 10.5px;
  font-weight: 600;
  text-anchor: middle;
}

.achart__empty {
  margin: 24px 0 30px;
  text-align: center;
  font-size: 13.5px;
  color: var(--gray-2);
  font-weight: 500;
}
</style>
