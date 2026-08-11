<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StaffShell from '@/layouts/StaffShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import AttendanceGrid from './AttendanceGrid.vue'
import AttendanceStatusMenu from './AttendanceStatusMenu.vue'
import {
  clearAttendanceCell,
  fetchAttendanceRegister,
  fetchTeacherGroups,
  markAttendanceCell,
  markAttendanceDay,
} from '@/api/teacher'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

const route = useRoute()
const router = useRouter()
const toast = useToast()

const groups = ref([])
const register = ref(null)
const month = ref(null)
const loading = ref(true)
const failed = ref(false)
/** "studentId:date" → true while that cell's write is in flight. */
const pending = ref({})
const menu = ref(null)

/* Falls back to the first own group when the query names one this teacher does
   not teach — a stale link should open their own register, not an error the
   select box contradicts. */
const groupId = computed(() => {
  const requested = Number(route.query.group)
  if (groups.value.some((group) => group.id === requested)) return requested
  return groups.value[0]?.id ?? null
})

const monthLabel = computed(() => {
  if (!register.value) return ''
  const [year, monthNumber] = register.value.month.split('-').map(Number)
  return `${MONTH_NAMES[monthNumber - 1]} ${year}`
})

function shiftMonth(delta) {
  const source = month.value ?? register.value?.month
  if (!source) return
  const [year, monthNumber] = source.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  month.value = `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`
}

function selectGroup(event) {
  month.value = null
  router.push({ path: '/staff/attendance', query: { group: event.target.value } })
}

async function loadGroups() {
  try {
    groups.value = await fetchTeacherGroups()
  } catch {
    failed.value = true
  } finally {
    if (!groups.value.length) loading.value = false
  }
}

async function loadRegister() {
  if (!groupId.value) return
  loading.value = true
  failed.value = false
  try {
    register.value = await fetchAttendanceRegister({
      groupId: groupId.value,
      ...(month.value ? { month: month.value } : {}),
    })
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function openMenu({ student, day, event }) {
  const rect = event.currentTarget.getBoundingClientRect()
  menu.value = {
    studentId: student.id,
    date: day.date,
    current: student.marks[day.date] ?? null,
    /* Pulled inside the viewport so a cell near the right or bottom edge does
       not open its menu off-screen, and never past the top-left corner. */
    x: Math.max(8, Math.min(rect.left, window.innerWidth - 176)),
    y: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 210)),
  }
}

/* Optimistic: the cell repaints immediately and only rolls back if the write
   fails, because a register is filled one click after another and waiting for
   a round trip between each would make it feel broken. */
async function choose(status) {
  const target = menu.value
  menu.value = null
  if (!target) return

  const student = register.value.students.find((row) => row.id === target.studentId)
  if (!student) return

  const key = `${target.studentId}:${target.date}`
  const previous = student.marks[target.date] ?? null
  if (previous === status) return

  applyMark(student, target.date, status)
  pending.value = { ...pending.value, [key]: true }

  try {
    if (status === null) {
      await clearAttendanceCell({
        groupId: groupId.value,
        studentId: target.studentId,
        date: target.date,
      })
    } else {
      await markAttendanceCell({
        groupId: groupId.value,
        studentId: target.studentId,
        date: target.date,
        status,
      })
    }
  } catch (error) {
    applyMark(student, target.date, previous)
    toast.error(uz.attendanceRegister.saveError, {
      description: error?.response?.data?.message ?? uz.teacherGroups.errorText,
    })
  } finally {
    const next = { ...pending.value }
    delete next[key]
    pending.value = next
  }
}

async function markWholeDay(date) {
  const snapshot = register.value.students.map((student) => ({
    id: student.id,
    previous: student.marks[date] ?? null,
  }))

  for (const student of register.value.students) {
    applyMark(student, date, 'kelgan')
  }

  try {
    await markAttendanceDay({ groupId: groupId.value, date, status: 'kelgan' })
  } catch (error) {
    for (const entry of snapshot) {
      const student = register.value.students.find((row) => row.id === entry.id)
      if (student) applyMark(student, date, entry.previous)
    }
    toast.error(uz.attendanceRegister.saveError, {
      description: error?.response?.data?.message ?? uz.teacherGroups.errorText,
    })
  }
}

/** Writes a mark and recomputes that student's percentage from what is shown,
    so the row stays consistent without refetching the whole month. */
function applyMark(student, date, status) {
  const marks = { ...student.marks }
  if (status === null) delete marks[date]
  else marks[date] = status

  const values = Object.values(marks)
  const attended = values.filter((value) => value === 'kelgan' || value === 'kechikkan').length
  student.marks = marks
  student.attendancePercent = values.length
    ? Math.round((attended / values.length) * 100)
    : null
}

watch([groupId, month], loadRegister)

loadGroups().then(loadRegister)
</script>

<template>
  <StaffShell>
    <div class="areg">
      <div class="areg__head">
        <h1 class="areg__title">{{ uz.attendanceRegister.title }}</h1>

        <div v-if="groups.length" class="areg__controls">
          <label class="areg__group">
            <span class="areg__group-label">{{ uz.attendanceRegister.groupLabel }}</span>
            <select class="areg__select" :value="groupId" @change="selectGroup">
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }} · {{ group.branch }}
              </option>
            </select>
          </label>

          <div class="areg__month">
            <button
              type="button"
              class="areg__month-btn"
              :aria-label="uz.attendanceRegister.monthPrev"
              @click="shiftMonth(-1)"
            >
              <BwIcon name="chevron-left" :size="16" />
            </button>
            <span class="areg__month-label">{{ monthLabel }}</span>
            <button
              type="button"
              class="areg__month-btn"
              :aria-label="uz.attendanceRegister.monthNext"
              @click="shiftMonth(1)"
            >
              <BwIcon name="chevron-right" :size="16" />
            </button>
          </div>
        </div>
      </div>

      <BwSkeleton v-if="loading" variant="block" height="280px" radius="18px" />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.attendanceRegister.errorTitle"
        :text="uz.attendanceRegister.errorText"
        @retry="loadRegister"
      />

      <LessonsStateCard
        v-else-if="!groups.length"
        icon="users"
        :title="uz.attendanceRegister.noGroupsTitle"
        :text="uz.attendanceRegister.noGroupsText"
      />

      <LessonsStateCard
        v-else-if="register && !register.students.length"
        icon="users"
        :title="uz.attendanceRegister.emptyTitle"
        :text="uz.attendanceRegister.emptyText"
      />

      <AttendanceGrid
        v-else-if="register"
        :days="register.days"
        :students="register.students"
        :pending="pending"
        @pick="openMenu"
        @mark-day="markWholeDay"
      />

      <AttendanceStatusMenu
        v-if="menu"
        :x="menu.x"
        :y="menu.y"
        :current="menu.current"
        @choose="choose"
        @close="menu = null"
      />
    </div>
  </StaffShell>
</template>

<style scoped>
.areg__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.areg__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.areg__controls {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

.areg__group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.areg__group-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.areg__select {
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--white);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}

.areg__select:focus-visible {
  outline: none;
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.areg__month {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 36px;
}

.areg__month-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.areg__month-btn:hover {
  border-color: var(--green);
  color: var(--green);
}

.areg__month-btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.areg__month-label {
  min-width: 118px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}
</style>
