<script setup>
import { computed, ref, watch } from 'vue'
import StudentShell from '@/layouts/StudentShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '../lessons/LessonsStateCard.vue'
import MarksAttendanceCalendar from './MarksAttendanceCalendar.vue'
import MarksChart from './MarksChart.vue'
import MarksGradedItem from './MarksGradedItem.vue'
import { fetchMarks } from '@/api/marks'
import { currentMonthKey, monthLabel, shiftMonth, weekKey, weekRangeLabel } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const CURRENT_MONTH = currentMonthKey()

const month = ref(CURRENT_MONTH)
const marks = ref(null)
const loading = ref(false)
const error = ref(null)

const isCurrentMonth = computed(() => month.value === CURRENT_MONTH)

async function load() {
  loading.value = true
  error.value = null
  try {
    marks.value = await fetchMarks(month.value)
  } catch (cause) {
    error.value = cause
    marks.value = null
  } finally {
    loading.value = false
  }
}

function goPrevMonth() {
  month.value = shiftMonth(month.value, -1)
}
function goNextMonth() {
  if (isCurrentMonth.value) return
  month.value = shiftMonth(month.value, 1)
}

watch(month, load, { immediate: true })

const isEmpty = computed(() => marks.value && marks.value.items.total === 0)

const groupedItems = computed(() => {
  if (!marks.value) return []
  const groups = new Map()
  for (const item of marks.value.items.items) {
    const key = weekKey(item.date)
    if (!groups.has(key)) groups.set(key, { key, label: weekRangeLabel(item.date), items: [] })
    groups.get(key).items.push(item)
  }
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key))
})

const trendSign = computed(() => {
  const value = marks.value?.trendPercent
  if (value === null || value === undefined) return ''
  return value > 0 ? '+' : ''
})
</script>

<template>
  <StudentShell>
    <div class="mview">
      <div class="mview__head">
        <h1 class="mview__title">{{ uz.marks.title }}</h1>
        <div class="mview__month">
          <button
            class="mview__month-btn"
            type="button"
            :aria-label="uz.marks.prevMonth"
            @click="goPrevMonth"
          >
            <BwIcon name="chevron-left" :size="16" :stroke-width="2" />
          </button>
          <span class="mview__month-label">{{ monthLabel(month) }}</span>
          <button
            class="mview__month-btn"
            type="button"
            :disabled="isCurrentMonth"
            :aria-label="uz.marks.nextMonth"
            @click="goNextMonth"
          >
            <BwIcon name="chevron-right" :size="16" :stroke-width="2" />
          </button>
        </div>
      </div>

      <BwSkeleton v-if="loading" variant="block" height="440px" radius="20px" />

      <LessonsStateCard
        v-else-if="error"
        variant="error"
        icon="alert-triangle"
        :title="uz.marks.errorTitle"
        :text="uz.marks.errorText"
        @retry="load"
      />

      <div v-else-if="marks" class="mview__card">
        <div class="mview__body">
          <div class="mview__main">
            <template v-if="!isEmpty">
              <div class="mview__summary">
                <div class="mview__average">
                  <div class="mview__average-label">{{ uz.marks.average }}</div>
                  <div class="mview__average-value bw-nums">{{ marks.average }}%</div>
                </div>
                <span
                  v-if="marks.trendPercent !== null"
                  class="mview__trend"
                  :class="marks.trendPercent >= 0 ? 'is-up' : 'is-down'"
                >
                  <BwIcon
                    :name="marks.trendPercent >= 0 ? 'trending-up' : 'trending-down'"
                    :size="14"
                    :stroke-width="2.2"
                  />
                  {{ uz.marks.trendLabel.replace('{sign}', trendSign).replace('{n}', marks.trendPercent) }}
                </span>
              </div>

              <MarksChart :points="marks.chart" />

              <div v-for="group in groupedItems" :key="group.key" class="mview__week">
                <div class="mview__week-label">{{ group.label }}</div>
                <div class="mview__items">
                  <MarksGradedItem v-for="item in group.items" :key="item.id" :item="item" />
                </div>
              </div>
            </template>

            <LessonsStateCard
              v-else
              icon="bar-chart"
              :title="uz.marks.emptyTitle"
              :text="uz.marks.emptyText"
            />
          </div>

          <div class="mview__aside">
            <div class="mview__aside-label">
              {{ uz.marks.attendanceTitle }} · {{ monthLabel(month) }}
            </div>
            <MarksAttendanceCalendar :days="marks.attendance" />
          </div>
        </div>
      </div>
    </div>
  </StudentShell>
</template>

<style scoped>
.mview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.mview__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
}

.mview__month {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mview__month-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mview__month-btn:hover:not(:disabled) {
  background: var(--bg);
}

.mview__month-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mview__month-btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.mview__month-label {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
  min-width: 110px;
  text-align: center;
}

.mview__card {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-md);
  padding: 20px;
}

.mview__body {
  display: flex;
  flex-direction: column;
}

.mview__main {
  width: 100%;
}

.mview__summary {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.mview__average {
  background: var(--green-pale);
  border-radius: 14px;
  padding: 12px 16px;
}

.mview__average-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--green-darker);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mview__average-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  margin-top: 2px;
}

.mview__trend {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-size: 12.5px;
  padding: 6px 11px;
  border-radius: 99px;
}

.mview__trend.is-up {
  color: var(--green-dark);
  background: var(--green-mid);
}

.mview__trend.is-down {
  color: var(--danger);
  background: var(--danger-soft);
}

.mview__week {
  margin-top: 22px;
}

.mview__week-label {
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 9px;
}

.mview__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mview__aside {
  width: 100%;
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid var(--line-2);
}

.mview__aside-label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 12px;
}

@media (min-width: 1024px) {
  .mview__card {
    border-radius: 24px;
    padding: 32px;
  }

  .mview__title {
    font-size: 26px;
  }

  .mview__month-label {
    font-size: 16px;
  }

  .mview__average-value {
    font-size: 32px;
  }

  .mview__trend {
    font-size: 13.5px;
    padding: 8px 14px;
  }

  .mview__body {
    flex-direction: row;
    gap: 24px;
  }

  .mview__main {
    flex: 2;
    min-width: 0;
  }

  .mview__aside {
    flex: 1;
    min-width: 300px;
    width: auto;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    border-left: 1px solid var(--line-2);
    padding-left: 24px;
  }
}
</style>
