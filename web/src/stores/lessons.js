import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as lessonsApi from '@/api/lessons'

export const useLessonsStore = defineStore('lessons', () => {
  const courses = ref([])
  const coursesLoading = ref(false)
  const coursesError = ref(null)

  const units = ref([])
  const unitsCourseId = ref(null)
  const unitsLoading = ref(false)
  const unitsError = ref(null)

  const unit = ref(null)
  const unitLoading = ref(false)
  const unitError = ref(null)

  const coursesEmpty = computed(
    () => !coursesLoading.value && !coursesError.value && courses.value.length === 0,
  )

  async function loadCourses() {
    coursesLoading.value = true
    coursesError.value = null
    try {
      courses.value = (await lessonsApi.fetchCourses()).items
    } catch (cause) {
      coursesError.value = cause
      courses.value = []
    } finally {
      coursesLoading.value = false
    }
  }

  async function loadUnits(courseId) {
    unitsLoading.value = true
    unitsError.value = null
    unitsCourseId.value = courseId
    try {
      units.value = (await lessonsApi.fetchCourseUnits(courseId)).items
    } catch (cause) {
      unitsError.value = cause
      units.value = []
    } finally {
      unitsLoading.value = false
    }
  }

  async function loadUnit(unitId) {
    unitLoading.value = true
    unitError.value = null
    /* Clearing first stops the previous unit flashing behind the new one. */
    unit.value = null
    try {
      unit.value = await lessonsApi.fetchUnit(unitId)
    } catch (cause) {
      unitError.value = cause
    } finally {
      unitLoading.value = false
    }
  }

  function closeUnit() {
    unit.value = null
    unitError.value = null
    unitLoading.value = false
  }

  const courseById = computed(
    () => (id) => courses.value.find((course) => course.id === Number(id)) ?? null,
  )

  return {
    courses,
    coursesLoading,
    coursesError,
    coursesEmpty,
    units,
    unitsCourseId,
    unitsLoading,
    unitsError,
    unit,
    unitLoading,
    unitError,
    courseById,
    loadCourses,
    loadUnits,
    loadUnit,
    closeUnit,
  }
})
