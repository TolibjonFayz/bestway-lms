<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  stats: { type: Object, required: true },
})
</script>

<template>
  <div class="tstats">
    <div class="tstats__card">
      <div class="tstats__icon tstats__icon--orange">
        <BwIcon name="clipboard" :size="20" />
      </div>
      <div class="tstats__value bw-nums">{{ stats.pendingCount }}</div>
      <div class="tstats__label">{{ uz.teacherDashboard.statPending }}</div>
    </div>

    <div class="tstats__card">
      <div class="tstats__icon tstats__icon--green">
        <BwIcon name="calendar" :size="20" />
      </div>
      <div class="tstats__value bw-nums">{{ stats.todayLessonsCount }}</div>
      <div class="tstats__label">{{ uz.teacherDashboard.statToday }}</div>
    </div>

    <div class="tstats__card">
      <div class="tstats__icon tstats__icon--green">
        <BwIcon name="user-outline" :size="20" />
      </div>
      <div class="tstats__value bw-nums">{{ stats.studentCount }}</div>
      <div class="tstats__label">{{ uz.teacherDashboard.statStudents }}</div>
    </div>

    <div class="tstats__card">
      <div class="tstats__icon tstats__icon--green">
        <BwIcon name="check-circle" :size="20" />
      </div>
      <div class="tstats__value bw-nums">{{ stats.avgAttendance }}<span class="tstats__unit">%</span></div>
      <div class="tstats__label">{{ uz.teacherDashboard.statAttendance }}</div>
    </div>
  </div>
</template>

<style scoped>
.tstats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.tstats__card {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  box-shadow: var(--sh-sm);
  padding: 17px;
}

.tstats__icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tstats__icon--orange {
  background: var(--orange-pale);
  color: var(--orange);
}

.tstats__icon--green {
  background: var(--green-mid);
  color: var(--green);
}

.tstats__value {
  font-size: 26px;
  font-weight: 800;
  color: var(--ink);
  margin-top: 12px;
}

.tstats__unit {
  font-size: 15px;
  color: var(--gray-2);
}

.tstats__label {
  font-size: 13px;
  color: var(--gray);
  font-weight: 500;
  margin-top: 3px;
}

@media (min-width: 640px) {
  .tstats {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
