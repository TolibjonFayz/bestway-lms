<script setup>
import { computed, onMounted } from 'vue'
import StudentShell from '@/layouts/StudentShell.vue'
import AnnouncementStrip from './AnnouncementStrip.vue'
import ContinueCard from './ContinueCard.vue'
import DashboardEmpty from './DashboardEmpty.vue'
import DashboardError from './DashboardError.vue'
import DashboardSkeleton from './DashboardSkeleton.vue'
import DashboardStats from './DashboardStats.vue'
import NextLessonCard from './NextLessonCard.vue'
import WeeklyActivity from './WeeklyActivity.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import uz from '@/locales/uz'

const dashboard = useDashboardStore()
const auth = useAuthStore()

const data = computed(() => dashboard.data)
const hasUnread = computed(() =>
  Boolean(data.value?.announcements?.some((item) => item.unread)),
)

onMounted(() => dashboard.load())
</script>

<template>
  <StudentShell :has-unread="hasUnread">
    <DashboardSkeleton v-if="dashboard.isFirstLoad" />

    <DashboardError
      v-else-if="dashboard.error"
      :retrying="dashboard.loading"
      @retry="dashboard.load()"
    />

    <DashboardEmpty
      v-else-if="dashboard.isEmpty"
      :first-name="data.student.firstName"
      @browse="$router.push('/lessons')"
    />

    <template v-else-if="data">
      <AnnouncementStrip
        v-if="data.announcements.length"
        :items="data.announcements"
      />

      <NextLessonCard v-if="data.nextLesson" :lesson="data.nextLesson" />

      <DashboardStats :stats="data.stats" />

      <template v-if="data.currentUnit">
        <div class="dash__section-head">
          <h2 class="dash__section-title">{{ uz.dashboard.continueTitle }}</h2>
          <RouterLink class="dash__see-all" to="/lessons">
            {{ uz.dashboard.seeAll }}
          </RouterLink>
        </div>
        <ContinueCard
          :unit="data.currentUnit"
          :level="auth.user?.level ?? ''"
          @continue="$router.push('/lessons')"
        />
      </template>

      <WeeklyActivity :weekly="data.weekly" />
    </template>
  </StudentShell>
</template>

<style scoped>
.dash__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 12px;
}

.dash__section-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.dash__see-all {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--green);
}

@media (min-width: 1024px) {
  .dash__section-head {
    margin: 26px 0 14px;
  }

  .dash__section-title {
    font-size: 19px;
    letter-spacing: -0.01em;
  }

  .dash__see-all {
    font-size: 13.5px;
  }
}
</style>
