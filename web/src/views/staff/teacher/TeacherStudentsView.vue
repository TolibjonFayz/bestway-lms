<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import StaffShell from '@/layouts/StaffShell.vue'
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwSearchInput from '@/components/base/BwSearchInput.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import { fetchTeacherGroups, fetchTeacherStudents } from '@/api/teacher'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const router = useRouter()
const { shortDate } = useUzbekDate()

const students = ref([])
const groups = ref([])
const groupId = ref('')
const search = ref('')
const loading = ref(true)
const failed = ref(false)

let searchTimer = null

async function load() {
  loading.value = true
  failed.value = false
  try {
    const [page, groupList] = await Promise.all([
      fetchTeacherStudents({
        limit: 50,
        ...(groupId.value ? { groupId: Number(groupId.value) } : {}),
        ...(search.value.trim() ? { search: search.value.trim() } : {}),
      }),
      groups.value.length ? Promise.resolve(groups.value) : fetchTeacherGroups(),
    ])
    students.value = page.items
    groups.value = groupList
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

/* Debounced so typing a name does not fire a request per keystroke. */
function onSearch(value) {
  search.value = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 300)
}

function openGroup(student) {
  if (!student.groupId) return
  router.push({ path: '/staff/groups', query: { group: student.groupId } })
}

/* Same thresholds the student's own marks list uses. */
function scoreClass(score) {
  if (score === null) return ''
  if (score >= 85) return 'is-good'
  if (score >= 60) return 'is-mid'
  return 'is-low'
}

watch(groupId, load)

load()
</script>

<template>
  <StaffShell>
    <div class="tstud">
      <div class="tstud__head">
        <div>
          <h1 class="tstud__title">{{ uz.teacherStudents.title }}</h1>
          <p class="tstud__subtitle">{{ uz.teacherStudents.subtitle }}</p>
        </div>
        <select v-if="groups.length > 1" v-model="groupId" class="tstud__select">
          <option value="">{{ uz.teacherStudents.allGroups }}</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
      </div>

      <BwSearchInput
        :model-value="search"
        :placeholder="uz.teacherStudents.search"
        class="tstud__search"
        @update:model-value="onSearch"
      />

      <BwSkeleton v-if="loading" variant="block" height="240px" radius="18px" />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.teacherStudents.errorTitle"
        :text="uz.teacherStudents.errorText"
        @retry="load"
      />

      <LessonsStateCard
        v-else-if="!students.length"
        icon="user-circle"
        :title="uz.teacherStudents.emptyTitle"
        :text="uz.teacherStudents.emptyText"
      />

      <div v-else class="tstud__table">
        <div class="tstud__row tstud__row--head">
          <span>{{ uz.teacherStudents.colStudent }}</span>
          <span>{{ uz.teacherStudents.colGroup }}</span>
          <span>{{ uz.teacherStudents.colScore }}</span>
          <span>{{ uz.teacherStudents.colAttendance }}</span>
          <span>{{ uz.teacherStudents.colActivity }}</span>
        </div>

        <button
          v-for="student in students"
          :key="student.id"
          type="button"
          class="tstud__row tstud__row--item"
          @click="openGroup(student)"
        >
          <div class="tstud__person">
            <BwAvatar :name="student.fullName" :size="32" :font-size="11.5" />
            <span class="tstud__person-body">
              <span class="tstud__name">{{ student.fullName }}</span>
              <span v-if="student.pendingCount" class="tstud__pending">
                {{ uz.teacherStudents.pendingBadge.replace('{n}', student.pendingCount) }}
              </span>
            </span>
          </div>

          <span class="tstud__group">{{ student.groupName ?? uz.teacherStudents.noData }}</span>

          <span class="tstud__score bw-nums" :class="scoreClass(student.averageScore)">
            {{
              student.averageScore === null
                ? uz.teacherStudents.noData
                : `${student.averageScore}%`
            }}
          </span>

          <span class="tstud__attendance bw-nums">
            {{
              student.attendancePercent === null
                ? uz.teacherStudents.noData
                : `${student.attendancePercent}%`
            }}
          </span>

          <span class="tstud__activity">
            {{
              student.lastActivityAt
                ? shortDate(student.lastActivityAt)
                : uz.teacherStudents.never
            }}
          </span>
        </button>
      </div>
    </div>
  </StaffShell>
</template>

<style scoped>
.tstud__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.tstud__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.tstud__subtitle {
  margin: 5px 0 0;
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 500;
}

.tstud__select {
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

.tstud__select:focus-visible {
  outline: none;
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.tstud__search {
  max-width: 340px;
  margin-bottom: 14px;
}

.tstud__table {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  overflow: hidden;
}

.tstud__row {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) 0.9fr 1fr 1fr 1.1fr;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  min-height: 58px;
  border-bottom: 1px solid var(--line-2);
  text-align: left;
}

.tstud__row--item {
  width: 100%;
  border-left: none;
  border-right: none;
  border-top: none;
  background: var(--white);
  font-family: inherit;
  cursor: pointer;
}

.tstud__row--item:hover {
  background: var(--green-pale);
}

.tstud__row--item:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tstud__row:last-child {
  border-bottom: none;
}

.tstud__row--head {
  min-height: 40px;
  background: var(--bg);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.tstud__person {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.tstud__person-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.tstud__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tstud__pending {
  font-size: 11px;
  font-weight: 700;
  color: var(--amber);
}

.tstud__group {
  font-size: 13px;
  color: var(--gray);
  font-weight: 600;
}

.tstud__score,
.tstud__attendance {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.tstud__score.is-good {
  color: var(--green);
}

.tstud__score.is-mid {
  color: var(--amber);
}

.tstud__score.is-low {
  color: var(--danger);
}

.tstud__activity {
  font-size: 12.5px;
  color: var(--gray);
}

@media (max-width: 900px) {
  .tstud__row {
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-areas:
      'person score attendance'
      'group group activity';
    padding: 12px 16px;
    row-gap: 6px;
  }

  .tstud__row--head {
    display: none;
  }

  .tstud__person {
    grid-area: person;
  }

  .tstud__group {
    grid-area: group;
    font-size: 12px;
  }

  .tstud__score {
    grid-area: score;
    text-align: right;
  }

  .tstud__attendance {
    grid-area: attendance;
    text-align: right;
    font-size: 12.5px;
    color: var(--gray);
  }

  .tstud__activity {
    grid-area: activity;
    text-align: right;
    font-size: 11.5px;
  }
}
</style>
