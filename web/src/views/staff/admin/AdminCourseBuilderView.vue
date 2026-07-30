<script setup>
import { onMounted, ref } from 'vue'
import StaffShell from '@/layouts/StaffShell.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import AdminAddCourseModal from './AdminAddCourseModal.vue'
import AdminAddUnitModal from './AdminAddUnitModal.vue'
import AdminCourseList from './AdminCourseList.vue'
import AdminUnitEditor from './AdminUnitEditor.vue'
import AdminUnitList from './AdminUnitList.vue'
import { fetchAdminCourses, fetchAdminUnitDetail, fetchAdminUnits, reorderAdminUnits } from '@/api/admin'
import uz from '@/locales/uz'

const courses = ref([])
const loading = ref(false)
const error = ref(null)
const selectedCourseId = ref(null)

const units = ref([])
const selectedUnitId = ref(null)

const unitDetail = ref(null)
const unitLoading = ref(false)

const showAddCourse = ref(false)
const showAddUnit = ref(false)

async function loadCourses() {
  loading.value = true
  error.value = null
  try {
    const page = await fetchAdminCourses({ limit: 50 })
    courses.value = page.items
    if (courses.value.length && !selectedCourseId.value) {
      await selectCourse(courses.value[0].id)
    }
  } catch (cause) {
    error.value = cause
  } finally {
    loading.value = false
  }
}

async function selectCourse(id) {
  selectedCourseId.value = id
  selectedUnitId.value = null
  unitDetail.value = null
  const page = await fetchAdminUnits(id, { limit: 50 })
  units.value = page.items
  if (units.value.length) await selectUnit(units.value[0].id)
}

async function selectUnit(id) {
  selectedUnitId.value = id
  unitLoading.value = true
  try {
    unitDetail.value = await fetchAdminUnitDetail(id)
  } finally {
    unitLoading.value = false
  }
}

async function reorderUnits(orderedIds) {
  units.value = orderedIds.map((id) => units.value.find((unit) => unit.id === id))
  await reorderAdminUnits(selectedCourseId.value, orderedIds)
}

async function onCourseCreated(course) {
  showAddCourse.value = false
  await loadCourses()
  await selectCourse(course.id)
}

async function onUnitCreated(unit) {
  showAddUnit.value = false
  const page = await fetchAdminUnits(selectedCourseId.value, { limit: 50 })
  units.value = page.items
  await selectUnit(unit.id)
}

async function reloadUnit() {
  if (selectedUnitId.value) await selectUnit(selectedUnitId.value)
}

onMounted(loadCourses)
</script>

<template>
  <StaffShell role="admin">
    <div class="acb">
      <BwSkeleton v-if="loading" variant="block" height="640px" radius="18px" />

      <LessonsStateCard
        v-else-if="error"
        variant="error"
        icon="alert-triangle"
        :title="uz.courseBuilder.errorTitle"
        :text="uz.courseBuilder.errorText"
        @retry="loadCourses"
      />

      <LessonsStateCard
        v-else-if="!courses.length"
        icon="books"
        :title="uz.courseBuilder.emptyCoursesTitle"
        :text="uz.courseBuilder.emptyCoursesText"
      />

      <div v-else class="acb__panel">
        <AdminCourseList
          :courses="courses"
          :selected-id="selectedCourseId"
          @select="selectCourse"
          @add="showAddCourse = true"
        />

        <AdminUnitList
          :units="units"
          :selected-id="selectedUnitId"
          @select="selectUnit"
          @add="showAddUnit = true"
          @reorder="reorderUnits"
        />

        <BwSkeleton v-if="unitLoading" variant="block" height="500px" radius="0" class="acb__unit-skeleton" />
        <AdminUnitEditor v-else-if="unitDetail" :unit="unitDetail" @changed="reloadUnit" />
        <div v-else class="acb__empty-unit">
          <p v-if="units.length === 0">{{ uz.courseBuilder.emptyUnitsText }}</p>
          <p v-else>{{ uz.courseBuilder.selectUnitPrompt }}</p>
        </div>
      </div>
    </div>

    <AdminAddCourseModal v-if="showAddCourse" @close="showAddCourse = false" @created="onCourseCreated" />
    <AdminAddUnitModal
      v-if="showAddUnit && selectedCourseId"
      :course-id="selectedCourseId"
      @close="showAddUnit = false"
      @created="onUnitCreated"
    />
  </StaffShell>
</template>

<style scoped>
.acb {
  height: calc(100dvh - 56px);
  min-height: 520px;
}

.acb__panel {
  height: 100%;
  background: var(--bg);
  border-radius: 18px;
  border: 1px solid var(--line-2);
  display: flex;
  overflow: hidden;
}

.acb__unit-skeleton {
  flex: 1;
  margin: 22px 26px;
}

.acb__empty-unit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-2);
  font-size: 14px;
  font-weight: 600;
  padding: 40px;
  text-align: center;
}

@media (max-width: 1023px) {
  .acb__panel {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
}
</style>
