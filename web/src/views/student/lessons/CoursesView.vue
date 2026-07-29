<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import StudentShell from '@/layouts/StudentShell.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import CourseCard from './CourseCard.vue'
import CourseTabs from './CourseTabs.vue'
import LessonsStateCard from './LessonsStateCard.vue'
import { useLessonsStore } from '@/stores/lessons'
import uz from '@/locales/uz'

const lessons = useLessonsStore()
const activeId = ref(null)

const activeCourse = computed(
  () => lessons.courses.find((course) => course.id === activeId.value) ?? null,
)

/* Keep the tab pointed at a real course once the list arrives. */
watch(
  () => lessons.courses,
  (courses) => {
    if (courses.length && !courses.some((c) => c.id === activeId.value)) {
      activeId.value = courses[0].id
    }
  },
  { immediate: true },
)

onMounted(() => lessons.loadCourses())
</script>

<template>
  <StudentShell>
    <h1 class="courses__title">{{ uz.lessons.title }}</h1>

    <template v-if="lessons.coursesLoading">
      <BwSkeleton height="44px" width="260px" radius="12px" />
      <BwSkeleton
        class="courses__skeleton-card"
        variant="block"
        height="var(--courses-card-h)"
        radius="18px"
      />
    </template>

    <LessonsStateCard
      v-else-if="lessons.coursesError"
      variant="error"
      icon="alert-triangle"
      :title="uz.lessons.errorTitle"
      :text="uz.lessons.errorText"
      :retrying="lessons.coursesLoading"
      @retry="lessons.loadCourses()"
    />

    <LessonsStateCard
      v-else-if="lessons.coursesEmpty"
      :title="uz.lessons.emptyCoursesTitle"
      :text="uz.lessons.emptyCoursesText"
    />

    <template v-else>
      <CourseTabs
        :courses="lessons.courses"
        :active-id="activeId"
        @select="activeId = $event"
      />
      <CourseCard v-if="activeCourse" class="courses__card" :course="activeCourse" />
    </template>
  </StudentShell>
</template>

<style scoped>
.courses__title {
  margin: 6px 0 16px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.courses__card,
.courses__skeleton-card {
  margin-top: 16px;
}

.courses__skeleton-card {
  --courses-card-h: 236px;
}

@media (min-width: 1024px) {
  .courses__title {
    margin: 0 0 20px;
    font-size: 26px;
  }

  .courses__card,
  .courses__skeleton-card {
    margin-top: 22px;
  }

  .courses__skeleton-card {
    --courses-card-h: 144px;
  }
}
</style>
