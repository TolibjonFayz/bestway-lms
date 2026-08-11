<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import StaffShell from '@/layouts/StaffShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import AdminActivityChart from './AdminActivityChart.vue'
import { fetchAdminOverview } from '@/api/admin'
import uz from '@/locales/uz'

const KIND_ICON = {
  lowAttendance: 'calendar',
  inactiveStudent: 'user-circle',
  emptyUnit: 'books',
}

const overview = ref(null)
const loading = ref(true)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    overview.value = await fetchAdminOverview()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function statCards(stats) {
  return [
    { key: 'students', label: uz.adminHome.statStudents, value: stats.studentCount, icon: 'user-circle' },
    { key: 'groups', label: uz.adminHome.statGroups, value: stats.activeGroupCount, icon: 'users' },
    { key: 'teachers', label: uz.adminHome.statTeachers, value: stats.teacherCount, icon: 'id-card' },
    {
      key: 'attendance',
      label: uz.adminHome.statAttendance,
      value: stats.avgAttendance === null ? uz.adminHome.noData : `${stats.avgAttendance}%`,
      icon: 'calendar',
    },
    {
      key: 'score',
      label: uz.adminHome.statScore,
      value: stats.avgScore === null ? uz.adminHome.noData : `${stats.avgScore}%`,
      icon: 'bar-chart',
    },
    { key: 'ungraded', label: uz.adminHome.statUngraded, value: stats.ungradedCount, icon: 'clipboard-check' },
  ]
}

load()
</script>

<template>
  <StaffShell>
    <div class="ahome">
      <h1 class="ahome__title">{{ uz.adminHome.title }}</h1>

      <BwSkeleton v-if="loading" variant="block" height="300px" radius="18px" />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.adminHome.errorTitle"
        :text="uz.adminHome.errorText"
        @retry="load"
      />

      <template v-else-if="overview">
        <div class="ahome__stats">
          <div v-for="card in statCards(overview.stats)" :key="card.key" class="ahome__stat">
            <span class="ahome__stat-icon"><BwIcon :name="card.icon" :size="17" /></span>
            <span class="ahome__stat-value bw-nums">{{ card.value }}</span>
            <span class="ahome__stat-label">{{ card.label }}</span>
          </div>
        </div>

        <div class="ahome__row">
          <AdminActivityChart :points="overview.activity" class="ahome__chart" />

          <div class="ahome__attention">
            <h3 class="ahome__attention-title">{{ uz.adminHome.attentionTitle }}</h3>

            <div v-if="!overview.attention.length" class="ahome__attention-empty">
              <p class="ahome__attention-empty-title">{{ uz.adminHome.attentionEmpty }}</p>
              <p class="ahome__attention-empty-text">{{ uz.adminHome.attentionEmptyText }}</p>
            </div>

            <RouterLink
              v-for="(item, index) in overview.attention"
              :key="`${item.kind}-${index}`"
              :to="item.href"
              class="ahome__attention-row"
            >
              <span class="ahome__attention-icon" :class="`is-${item.kind}`">
                <BwIcon :name="KIND_ICON[item.kind]" :size="15" />
              </span>
              <span class="ahome__attention-body">
                <span class="ahome__attention-name">{{ item.title }}</span>
                <span class="ahome__attention-detail">{{ item.detail }}</span>
              </span>
              <BwIcon name="chevron-right" :size="15" class="ahome__attention-chevron" />
            </RouterLink>
          </div>
        </div>
      </template>
    </div>
  </StaffShell>
</template>

<style scoped>
.ahome__title {
  margin: 0 0 18px;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.ahome__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.ahome__stat {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  box-shadow: var(--sh-sm);
  padding: 15px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ahome__stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--green-pale);
  color: var(--green-darker);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.ahome__stat-value {
  font-size: 23px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.1;
}

.ahome__stat-label {
  font-size: 12.5px;
  color: var(--gray);
  font-weight: 600;
}

.ahome__row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.ahome__chart {
  flex: 1.7;
  min-width: 320px;
}

.ahome__attention {
  flex: 1;
  min-width: 280px;
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 18px 20px;
}

.ahome__attention-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.ahome__attention-empty {
  padding: 14px 0 18px;
  text-align: center;
}

.ahome__attention-empty-title {
  margin: 0 0 3px;
  font-size: 14px;
  font-weight: 700;
  color: var(--green-darker);
}

.ahome__attention-empty-text {
  margin: 0;
  font-size: 12.5px;
  color: var(--gray-2);
}

.ahome__attention-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 0;
  border-top: 1px solid var(--line-2);
  text-decoration: none;
}

.ahome__attention-row:first-of-type {
  border-top: none;
}

.ahome__attention-row:hover .ahome__attention-name {
  color: var(--green);
}

.ahome__attention-row:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
  border-radius: 8px;
}

.ahome__attention-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ahome__attention-icon.is-lowAttendance {
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--danger);
}

.ahome__attention-icon.is-inactiveStudent {
  background: color-mix(in srgb, var(--amber) 18%, transparent);
  color: var(--amber);
}

.ahome__attention-icon.is-emptyUnit {
  background: var(--line-2);
  color: var(--gray);
}

.ahome__attention-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.ahome__attention-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ahome__attention-detail {
  font-size: 12px;
  color: var(--gray);
}

.ahome__attention-chevron {
  color: var(--gray-2);
  flex-shrink: 0;
}
</style>
