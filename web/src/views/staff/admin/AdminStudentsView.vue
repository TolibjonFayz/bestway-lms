<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import StaffShell from '@/layouts/StaffShell.vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import AdminAddStudentModal from './AdminAddStudentModal.vue'
import AdminStudentFilters from './AdminStudentFilters.vue'
import AdminStudentsTable from './AdminStudentsTable.vue'
import {
  bulkSetAdminStudentStatus,
  fetchAdminGroups,
  fetchAdminStudents,
  setAdminStudentStatus,
} from '@/api/admin'
import uz from '@/locales/uz'

const LIMIT = 20

const students = ref([])
const total = ref(0)
const page = ref(1)
const groups = ref([])

const search = ref('')
const groupId = ref('')
const level = ref('')
const status = ref('all')

const selected = ref([])
const loading = ref(false)
const error = ref(null)
const showAddModal = ref(false)

const hasFilters = computed(() => Boolean(search.value || groupId.value || level.value || status.value !== 'all'))

async function loadStudents() {
  loading.value = true
  error.value = null
  try {
    const result = await fetchAdminStudents({
      page: page.value,
      limit: LIMIT,
      search: search.value || undefined,
      groupId: groupId.value || undefined,
      level: level.value || undefined,
      status: status.value,
    })
    students.value = result.items
    total.value = result.total
    selected.value = []
  } catch (cause) {
    error.value = cause
  } finally {
    loading.value = false
  }
}

async function loadGroups() {
  groups.value = await fetchAdminGroups()
}

let searchTimer = null
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadStudents()
  }, 350)
})
onBeforeUnmount(() => clearTimeout(searchTimer))

watch([groupId, level, status], () => {
  page.value = 1
  loadStudents()
})

function goToPage(next) {
  page.value = next
  loadStudents()
}

function clearFilters() {
  search.value = ''
  groupId.value = ''
  level.value = ''
  status.value = 'all'
}

async function toggleStatus(student) {
  await setAdminStudentStatus(student.id, !student.active)
  student.active = !student.active
}

async function bulkSetStatus(active) {
  await bulkSetAdminStudentStatus(selected.value, active)
  await loadStudents()
}

async function onStudentCreated() {
  showAddModal.value = false
  page.value = 1
  await loadStudents()
}

onMounted(() => {
  loadGroups()
  loadStudents()
})
</script>

<template>
  <StaffShell role="admin">
    <div class="asview">
      <div class="asview__head">
        <h3 class="asview__title">
          {{ uz.adminStudents.title }} <span class="asview__count">({{ total }})</span>
        </h3>
        <BwButton @click="showAddModal = true">
          <template #leading><BwIcon name="plus" :size="17" :stroke-width="2.2" /></template>
          {{ uz.adminStudents.addStudent }}
        </BwButton>
      </div>

      <AdminStudentFilters
        v-model:search="search"
        v-model:groupId="groupId"
        v-model:level="level"
        v-model:status="status"
        :groups="groups"
      />

      <div v-if="selected.length" class="asview__bulk">
        <span class="asview__bulk-count">{{ uz.adminStudents.selectedCount.replace('{n}', selected.length) }}</span>
        <div class="asview__bulk-actions">
          <button type="button" class="asview__bulk-btn" @click="bulkSetStatus(true)">
            {{ uz.adminStudents.bulkActivate }}
          </button>
          <button type="button" class="asview__bulk-btn asview__bulk-btn--danger" @click="bulkSetStatus(false)">
            {{ uz.adminStudents.bulkDeactivate }}
          </button>
        </div>
      </div>

      <BwSkeleton v-if="loading" variant="block" height="440px" radius="16px" />

      <LessonsStateCard
        v-else-if="error"
        variant="error"
        icon="alert-triangle"
        :title="uz.adminStudents.errorTitle"
        :text="uz.adminStudents.errorText"
        @retry="loadStudents"
      />

      <div v-else-if="!students.length" class="asview__empty">
        <div class="asview__empty-art">
          <BwIcon name="search" :size="34" :stroke-width="1.6" />
        </div>
        <h3 class="asview__empty-title">{{ uz.adminStudents.emptyTitle }}</h3>
        <p class="asview__empty-text">{{ uz.adminStudents.emptyText }}</p>
        <BwButton v-if="hasFilters" variant="secondary" @click="clearFilters">
          {{ uz.adminStudents.clearFilters }}
        </BwButton>
      </div>

      <AdminStudentsTable
        v-else
        v-model:selected="selected"
        :students="students"
        :page="page"
        :limit="LIMIT"
        :total="total"
        @toggle-status="toggleStatus"
        @page-change="goToPage"
      />
    </div>

    <AdminAddStudentModal v-if="showAddModal" :groups="groups" @close="showAddModal = false" @created="onStudentCreated" />
  </StaffShell>
</template>

<style scoped>
.asview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.asview__title {
  margin: 0;
  font-size: 23px;
  font-weight: 800;
  color: var(--ink);
}

.asview__count {
  font-weight: 600;
  font-size: 15px;
  color: var(--gray-2);
}

.asview__bulk {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--green-pale);
  border: 1px solid var(--green-soft);
  border-radius: 11px;
  padding: 10px 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.asview__bulk-count {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--green-darker);
}

.asview__bulk-actions {
  display: flex;
  gap: 8px;
}

.asview__bulk-btn {
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  color: var(--green-darker);
  background: var(--white);
  border: 1px solid var(--green-soft);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.asview__bulk-btn--danger {
  color: var(--danger);
  border-color: var(--danger-line);
}

.asview__empty {
  flex: 1;
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-sm);
  padding: 44px 28px;
  text-align: center;
}

.asview__empty-art {
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 20px;
  background: var(--bg);
  border: 1px dashed var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-3);
}

.asview__empty-title {
  margin: 18px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.asview__empty-text {
  margin: 8px auto 0;
  font-size: 14px;
  color: var(--gray);
  max-width: 320px;
  line-height: 1.55;
}

.asview__empty :deep(.bw-btn) {
  margin-top: 18px;
}
</style>
