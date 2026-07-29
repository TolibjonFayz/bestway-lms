<script setup>
import { computed } from 'vue'
import uz from '@/locales/uz'

/* days: [{ date: "2026-02-05", status: 'kelgan'|'kelmagan'|'kechikkan'|'sababli'|null }],
   one entry per calendar day of the viewed month, in order. */
const props = defineProps({
  days: { type: Array, required: true },
})

const WEEKDAY_LABELS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

const STATUS_COLOR = {
  kelgan: 'var(--green)',
  kelmagan: 'var(--danger)',
  kechikkan: 'var(--amber)',
  sababli: 'var(--sky-ink)',
}

const LEGEND = [
  { status: 'kelgan', label: uz.marks.present },
  { status: 'kelmagan', label: uz.marks.absent },
  { status: 'kechikkan', label: uz.marks.late },
  { status: 'sababli', label: uz.marks.excused },
  { status: null, label: uz.marks.noLesson },
]

/* Leading blanks so day 1 lands in its real weekday column — the design's
   static grid always starts at Monday, but a real month rarely does. */
const cells = computed(() => {
  if (!props.days.length) return []
  const firstWeekday = new Date(`${props.days[0].date}T00:00:00Z`).getUTCDay()
  const leading = (firstWeekday + 6) % 7
  return [...Array.from({ length: leading }, () => null), ...props.days]
})

function colorFor(day) {
  if (day === null) return 'transparent'
  return day.status ? STATUS_COLOR[day.status] : 'var(--line-2)'
}
</script>

<template>
  <div class="acal">
    <div class="acal__weekdays">
      <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
    </div>
    <div class="acal__grid">
      <span
        v-for="(day, index) in cells"
        :key="index"
        class="acal__cell"
        :style="{ background: colorFor(day) }"
      />
    </div>
    <div class="acal__legend">
      <span v-for="entry in LEGEND" :key="entry.label" class="acal__legend-row">
        <span class="acal__swatch" :style="{ background: STATUS_COLOR[entry.status] ?? 'var(--line-2)' }" />
        {{ entry.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.acal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 8px;
}

.acal__weekdays span {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-2);
}

.acal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.acal__cell {
  aspect-ratio: 1;
  border-radius: 7px;
}

.acal__legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.acal__legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gray);
}

.acal__swatch {
  width: 14px;
  height: 14px;
  border-radius: 5px;
  flex: none;
}

@media (min-width: 1024px) {
  .acal__weekdays,
  .acal__grid {
    gap: 6px;
  }

  .acal__cell {
    border-radius: 8px;
  }
}
</style>
