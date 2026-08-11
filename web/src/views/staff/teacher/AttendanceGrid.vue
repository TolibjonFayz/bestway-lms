<script setup>
import { computed } from 'vue'
import uz from '@/locales/uz'

/* Same colour language as the student's own calendar in
   MarksAttendanceCalendar.vue — a teacher and a student looking at the same
   day should see the same colour. */
const STATUS_COLOR = {
  kelgan: 'var(--green)',
  kelmagan: 'var(--danger)',
  kechikkan: 'var(--amber)',
  sababli: 'var(--sky-ink)',
}

const WEEKDAY_SHORT = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']

const props = defineProps({
  days: { type: Array, required: true },
  students: { type: Array, required: true },
  /** Cells currently being saved, as "studentId:date". */
  pending: { type: Object, required: true },
})

defineEmits(['pick', 'markDay'])

/* Only days the group actually meets get a column — a 31-column grid where
   two thirds are struck through is harder to read than a 13-column one. */
const columns = computed(() => props.days.filter((day) => day.hasLesson))

function cellStyle(student, day) {
  const status = student.marks[day.date]
  if (status) return { background: STATUS_COLOR[status] }
  return { background: day.isFuture ? 'var(--line-2)' : 'transparent' }
}

function cellLabel(student, day) {
  const status = student.marks[day.date]
  const statusText = status ? uz.attendanceRegister.statuses[status] : '—'
  return `${student.fullName}, ${day.dayOfMonth}-kun: ${statusText}`
}
</script>

<template>
  <div class="agrid">
    <div class="agrid__scroll">
      <table class="agrid__table">
        <thead>
          <tr>
            <th class="agrid__corner">{{ uz.attendanceRegister.colStudent }}</th>
            <th v-for="day in columns" :key="day.date" class="agrid__day">
              <span class="agrid__day-num bw-nums">{{ day.dayOfMonth }}</span>
              <span class="agrid__day-name">{{ WEEKDAY_SHORT[day.weekday] }}</span>
              <button
                v-if="!day.isFuture"
                type="button"
                class="agrid__mark-all"
                :title="uz.attendanceRegister.markAllHint"
                :aria-label="`${day.dayOfMonth}-kun: ${uz.attendanceRegister.markAllPresent}`"
                @click="$emit('markDay', day.date)"
              >
                ✓
              </button>
            </th>
            <th class="agrid__percent-head">{{ uz.attendanceRegister.colPercent }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="student in students" :key="student.id">
            <th class="agrid__student">{{ student.fullName }}</th>
            <td v-for="day in columns" :key="day.date" class="agrid__cell-wrap">
              <button
                type="button"
                class="agrid__cell"
                :class="{ 'is-saving': pending[`${student.id}:${day.date}`] }"
                :style="cellStyle(student, day)"
                :disabled="day.isFuture"
                :aria-label="cellLabel(student, day)"
                :title="day.isFuture ? uz.attendanceRegister.futureDay : cellLabel(student, day)"
                @click="$emit('pick', { student, day, event: $event })"
              />
            </td>
            <td class="agrid__percent bw-nums">
              {{
                student.attendancePercent === null
                  ? '—'
                  : `${student.attendancePercent}%`
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="agrid__legend">
      <span v-for="(label, status) in uz.attendanceRegister.statuses" :key="status" class="agrid__legend-item">
        <i class="agrid__swatch" :style="{ background: STATUS_COLOR[status] }" />{{ label }}
      </span>
      <span class="agrid__legend-item">
        <i class="agrid__swatch agrid__swatch--none" />{{ uz.marks.noLesson }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.agrid {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  overflow: hidden;
}

.agrid__scroll {
  overflow-x: auto;
}

.agrid__table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.agrid__corner,
.agrid__student {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--white);
  text-align: left;
  padding: 0 14px;
  min-width: 168px;
  max-width: 168px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-right: 1px solid var(--line-2);
}

.agrid__corner {
  background: var(--bg);
  height: 52px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.agrid__student {
  height: 44px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
}

.agrid__day {
  background: var(--bg);
  height: 52px;
  min-width: 42px;
  padding: 4px 0;
  vertical-align: middle;
}

.agrid__day-num {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
}

.agrid__day-name {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--gray-2);
}

.agrid__mark-all {
  margin-top: 2px;
  width: 18px;
  height: 16px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--gray-2);
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}

.agrid__mark-all:hover {
  background: var(--green-mid);
  color: var(--green-darker);
}

.agrid__mark-all:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.agrid__cell-wrap {
  padding: 0;
  text-align: center;
  border-bottom: 1px solid var(--line-2);
}

.agrid__cell {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1px solid var(--line);
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s, opacity 0.15s;
}

.agrid__cell:hover:not(:disabled) {
  transform: scale(1.12);
}

.agrid__cell:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.agrid__cell:disabled {
  cursor: not-allowed;
  border-style: dashed;
}

.agrid__cell.is-saving {
  opacity: 0.45;
}

.agrid__percent-head {
  background: var(--bg);
  min-width: 76px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.agrid__percent {
  text-align: center;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
  border-bottom: 1px solid var(--line-2);
  border-left: 1px solid var(--line-2);
}

.agrid__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 16px;
  border-top: 1px solid var(--line-2);
  background: var(--bg);
}

.agrid__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray);
  font-weight: 500;
}

.agrid__swatch {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.agrid__swatch--none {
  background: transparent;
  border: 1px solid var(--line);
}
</style>
