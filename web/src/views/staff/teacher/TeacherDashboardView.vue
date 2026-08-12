<script setup>
import { onMounted, ref } from 'vue'
import StaffShell from '@/layouts/StaffShell.vue'
import BwNotificationBell from '@/components/base/BwNotificationBell.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import TeacherExtraLessons from './TeacherExtraLessons.vue'
import TeacherPendingTable from './TeacherPendingTable.vue'
import TeacherScheduleTimeline from './TeacherScheduleTimeline.vue'
import TeacherStatCards from './TeacherStatCards.vue'
import { fetchTeacherDashboard } from '@/api/teacher'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const dashboard = ref(null)
const loading = ref(false)
const error = ref(null)
const { longDate } = useUzbekDate()

async function load() {
  loading.value = true
  error.value = null
  try {
    dashboard.value = await fetchTeacherDashboard()
  } catch (cause) {
    error.value = cause
    dashboard.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <StaffShell role="teacher">
    <div class="tdash">
      <BwSkeleton v-if="loading" variant="block" height="600px" radius="18px" />

      <LessonsStateCard
        v-else-if="error"
        variant="error"
        icon="alert-triangle"
        :title="uz.teacherDashboard.errorTitle"
        :text="uz.teacherDashboard.errorText"
        @retry="load"
      />

      <template v-else-if="dashboard">
        <div class="tdash__head">
          <div>
            <h3 class="tdash__greeting">
              {{ uz.teacherDashboard.greeting.replace('{name}', dashboard.teacher.firstName) }}
            </h3>
            <p class="tdash__date">{{ longDate(dashboard.today) }}</p>
          </div>
          <BwNotificationBell dot />
        </div>

        <TeacherStatCards :stats="dashboard.stats" />

        <div class="tdash__row">
          <TeacherScheduleTimeline :schedule="dashboard.schedule" />
          <TeacherPendingTable
            :pending-count="dashboard.stats.pendingCount"
            :items="dashboard.pendingSubmissions"
          />
        </div>

        <TeacherExtraLessons class="tdash__extra" />
      </template>
    </div>
  </StaffShell>
</template>

<style scoped>
.tdash__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.tdash__greeting {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.tdash__date {
  margin: 5px 0 0;
  font-size: 14px;
  color: var(--gray);
  font-weight: 500;
}

.tdash__row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.tdash__extra {
  margin-top: 20px;
}

@media (min-width: 1280px) {
  .tdash__greeting {
    font-size: 25px;
  }
}
</style>
