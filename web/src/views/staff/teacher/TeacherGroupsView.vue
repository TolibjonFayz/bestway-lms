<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StaffShell from '@/layouts/StaffShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import TeacherGroupCard from './TeacherGroupCard.vue'
import TeacherGroupRoster from './TeacherGroupRoster.vue'
import { fetchTeacherGroup, fetchTeacherGroups } from '@/api/teacher'
import uz from '@/locales/uz'

/* The open group lives in the query string so a reload — or a link the teacher
   sends themselves — lands back on the same roster. */
const route = useRoute()
const router = useRouter()

const groups = ref([])
const detail = ref(null)
const loading = ref(true)
const detailLoading = ref(false)
const failed = ref(false)

const openId = computed(() => {
  const raw = Number(route.query.group)
  return Number.isInteger(raw) && raw > 0 ? raw : null
})

async function loadGroups() {
  loading.value = true
  failed.value = false
  try {
    groups.value = await fetchTeacherGroups()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

async function loadDetail(groupId) {
  detailLoading.value = true
  failed.value = false
  try {
    detail.value = await fetchTeacherGroup(groupId)
  } catch {
    failed.value = true
    detail.value = null
  } finally {
    detailLoading.value = false
  }
}

function open(groupId) {
  router.push({ path: '/staff/groups', query: { group: groupId } })
}

function back() {
  router.push('/staff/groups')
}

function openRegister(groupId) {
  router.push({ path: '/staff/attendance', query: { group: groupId } })
}

watch(
  openId,
  (id) => {
    if (id) loadDetail(id)
    else detail.value = null
  },
  { immediate: true },
)

loadGroups()

function retry() {
  if (openId.value) loadDetail(openId.value)
  else loadGroups()
}
</script>

<template>
  <StaffShell>
    <div class="tgroups">
      <div class="tgroups__head">
        <button v-if="openId" type="button" class="tgroups__back" @click="back">
          <BwIcon name="chevron-left" :size="16" />{{ uz.teacherGroups.back }}
        </button>
        <h1 class="tgroups__title">
          {{ openId && detail ? detail.group.name : uz.teacherGroups.title }}
        </h1>
        <p v-if="openId && detail" class="tgroups__subtitle">
          {{ detail.group.branch }} ·
          {{ uz.teacherGroups.studentCount.replace('{n}', detail.group.studentCount) }}
        </p>
      </div>

      <BwSkeleton
        v-if="loading || detailLoading"
        variant="block"
        height="220px"
        radius="18px"
      />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.teacherGroups.errorTitle"
        :text="uz.teacherGroups.errorText"
        @retry="retry"
      />

      <template v-else-if="openId && detail">
        <LessonsStateCard
          v-if="!detail.students.length"
          icon="users"
          :title="uz.teacherGroups.emptyStudentsTitle"
          :text="uz.teacherGroups.emptyStudentsText"
        />
        <TeacherGroupRoster v-else :students="detail.students" />
      </template>

      <template v-else>
        <LessonsStateCard
          v-if="!groups.length"
          icon="users"
          :title="uz.teacherGroups.emptyTitle"
          :text="uz.teacherGroups.emptyText"
        />
        <div v-else class="tgroups__grid">
          <TeacherGroupCard
            v-for="group in groups"
            :key="group.id"
            :group="group"
            @open="open"
            @register="openRegister"
          />
        </div>
      </template>
    </div>
  </StaffShell>
</template>

<style scoped>
.tgroups__head {
  margin-bottom: 18px;
}

.tgroups__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray);
  cursor: pointer;
  padding: 4px 6px 4px 0;
  margin-bottom: 6px;
}

.tgroups__back:hover {
  color: var(--green);
}

.tgroups__back:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
  border-radius: 6px;
}

.tgroups__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.tgroups__subtitle {
  margin: 5px 0 0;
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 500;
}

.tgroups__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
</style>
