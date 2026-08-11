<script setup>
import BwAvatar from '@/components/base/BwAvatar.vue'
import uz from '@/locales/uz'

defineProps({
  students: { type: Array, required: true },
})

/* Same thresholds the student's marks list uses, so a score means the same
   thing to the teacher as it does to the student. */
function scoreClass(score) {
  if (score === null) return ''
  if (score >= 85) return 'is-good'
  if (score >= 60) return 'is-mid'
  return 'is-low'
}
</script>

<template>
  <div class="troster">
    <div class="troster__head">
      <span>{{ uz.teacherGroups.colStudent }}</span>
      <span>{{ uz.teacherGroups.colLevel }}</span>
      <span>{{ uz.teacherGroups.colScore }}</span>
      <span>{{ uz.teacherGroups.colAttendance }}</span>
    </div>

    <div v-for="student in students" :key="student.id" class="troster__row">
      <div class="troster__student">
        <BwAvatar :name="student.fullName" :size="32" :font-size="11.5" />
        <span class="troster__name">{{ student.fullName }}</span>
      </div>
      <span class="troster__level">{{ student.level ?? uz.teacherGroups.noData }}</span>
      <span class="troster__score bw-nums" :class="scoreClass(student.averageScore)">
        {{ student.averageScore === null ? uz.teacherGroups.noData : `${student.averageScore}%` }}
      </span>
      <span class="troster__attendance bw-nums">
        {{
          student.attendancePercent === null
            ? uz.teacherGroups.noData
            : `${student.attendancePercent}%`
        }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.troster {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  overflow: hidden;
}

.troster__head,
.troster__row {
  display: grid;
  grid-template-columns: minmax(0, 2.4fr) 1fr 1fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.troster__head {
  height: 40px;
  background: var(--bg);
  border-bottom: 1px solid var(--line-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.troster__row {
  min-height: 56px;
  border-bottom: 1px solid var(--line-2);
}

.troster__row:last-child {
  border-bottom: none;
}

.troster__student {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.troster__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.troster__level {
  font-size: 13px;
  color: var(--gray);
  font-weight: 500;
}

.troster__score,
.troster__attendance {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.troster__score.is-good {
  color: var(--green);
}

.troster__score.is-mid {
  color: var(--amber);
}

.troster__score.is-low {
  color: var(--danger);
}

@media (max-width: 767px) {
  .troster__head {
    display: none;
  }

  .troster__row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'student score'
      'level attendance';
    padding: 12px 16px;
    row-gap: 4px;
  }

  .troster__student {
    grid-area: student;
  }

  .troster__level {
    grid-area: level;
    font-size: 12px;
  }

  .troster__score {
    grid-area: score;
    text-align: right;
  }

  .troster__attendance {
    grid-area: attendance;
    text-align: right;
    font-size: 12.5px;
    color: var(--gray);
  }
}
</style>
