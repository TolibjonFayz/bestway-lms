<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import StaffShell from '@/layouts/StaffShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import { fetchTeacherGroups, fetchTeacherTasks } from '@/api/teacher'
import uz from '@/locales/uz'

const TYPE_ICON = { test: 'clipboard-check', speaking: 'mic' }

const router = useRouter()

const tasks = ref([])
const groups = ref([])
const groupId = ref('')
const loading = ref(true)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const [rows, groupList] = await Promise.all([
      fetchTeacherTasks(groupId.value ? { groupId: Number(groupId.value) } : {}),
      groups.value.length ? Promise.resolve(groups.value) : fetchTeacherGroups(),
    ])
    tasks.value = rows
    groups.value = groupList
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

/* The grading queue is the natural next step from a row with pending work. */
function openReview() {
  router.push('/staff/review')
}

watch(groupId, load)

load()
</script>

<template>
  <StaffShell>
    <div class="ttasks">
      <div class="ttasks__head">
        <div>
          <h1 class="ttasks__title">{{ uz.teacherTasks.title }}</h1>
          <p class="ttasks__subtitle">{{ uz.teacherTasks.subtitle }}</p>
        </div>
        <select v-if="groups.length > 1" v-model="groupId" class="ttasks__select">
          <option value="">{{ uz.teacherTasks.allGroups }}</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
      </div>

      <BwSkeleton v-if="loading" variant="block" height="240px" radius="18px" />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.teacherTasks.errorTitle"
        :text="uz.teacherTasks.errorText"
        @retry="load"
      />

      <LessonsStateCard
        v-else-if="!tasks.length"
        icon="clipboard-check"
        :title="uz.teacherTasks.emptyTitle"
        :text="uz.teacherTasks.emptyText"
      />

      <div v-else class="ttasks__table">
        <div class="ttasks__row ttasks__row--head">
          <span>{{ uz.teacherTasks.colTask }}</span>
          <span>{{ uz.teacherTasks.colSubmitted }}</span>
          <span>{{ uz.teacherTasks.colPending }}</span>
          <span>{{ uz.teacherTasks.colNotStarted }}</span>
          <span>{{ uz.teacherTasks.colAverage }}</span>
          <span />
        </div>

        <div v-for="task in tasks" :key="task.lessonItemId" class="ttasks__row">
          <div class="ttasks__task">
            <span class="ttasks__icon"><BwIcon :name="TYPE_ICON[task.type]" :size="15" /></span>
            <span class="ttasks__task-body">
              <span class="ttasks__task-title">{{ task.title }}</span>
              <span class="ttasks__task-unit">{{ task.unitTitle }} · {{ task.courseName }}</span>
            </span>
          </div>

          <!-- display:contents on desktop so these stay real grid cells; on
               mobile the wrapper becomes a labelled flex strip. -->
          <div class="ttasks__nums">
            <span class="ttasks__num bw-nums" :data-label="uz.teacherTasks.colSubmitted">
              {{ task.submittedCount }}
            </span>
            <span
              class="ttasks__num bw-nums"
              :class="{ 'is-pending': task.pendingCount > 0 }"
              :data-label="uz.teacherTasks.colPending"
            >
              {{ task.pendingCount }}
            </span>
            <span
              class="ttasks__num ttasks__num--muted bw-nums"
              :data-label="uz.teacherTasks.colNotStarted"
            >
              {{ task.notStartedCount }}
            </span>
            <span class="ttasks__num bw-nums" :data-label="uz.teacherTasks.colAverage">
              {{ task.averageScore === null ? uz.teacherTasks.noData : `${task.averageScore}%` }}
            </span>
          </div>

          <button
            v-if="task.pendingCount > 0"
            type="button"
            class="ttasks__review"
            @click="openReview"
          >
            {{ uz.teacherTasks.review }}
          </button>
          <span v-else />
        </div>
      </div>
    </div>
  </StaffShell>
</template>

<style scoped>
.ttasks__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.ttasks__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.ttasks__subtitle {
  margin: 5px 0 0;
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 500;
}

.ttasks__select {
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

.ttasks__select:focus-visible {
  outline: none;
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.ttasks__table {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  overflow: hidden;
}

.ttasks__row {
  display: grid;
  grid-template-columns: minmax(0, 2.6fr) 0.8fr 1fr 0.9fr 0.8fr 92px;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  min-height: 60px;
  border-bottom: 1px solid var(--line-2);
}

.ttasks__row:last-child {
  border-bottom: none;
}

.ttasks__row--head {
  min-height: 40px;
  background: var(--bg);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.ttasks__task {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.ttasks__icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--green-pale);
  color: var(--green-darker);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ttasks__task-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.ttasks__task-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ttasks__task-unit {
  font-size: 11.5px;
  color: var(--gray-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ttasks__nums {
  display: contents;
}

.ttasks__num {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.ttasks__num.is-pending {
  color: var(--amber);
}

.ttasks__num--muted {
  color: var(--gray-2);
  font-weight: 600;
}

.ttasks__review {
  height: 30px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--white);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
}

.ttasks__review:hover {
  border-color: var(--green);
  color: var(--green);
}

.ttasks__review:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (max-width: 900px) {
  .ttasks__row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'task review'
      'nums nums';
    padding: 13px 16px;
    row-gap: 9px;
  }

  .ttasks__row--head {
    display: none;
  }

  .ttasks__task {
    grid-area: task;
  }

  .ttasks__review {
    grid-area: review;
  }

  /* The four counts become one wrapping strip, each labelled since the
     column headers are hidden here. */
  .ttasks__nums {
    grid-area: nums;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
  }

  .ttasks__num {
    font-size: 12.5px;
    display: inline-flex;
    gap: 4px;
  }

  .ttasks__num::before {
    content: attr(data-label) ':';
    color: var(--gray-2);
    font-weight: 600;
  }
}
</style>
