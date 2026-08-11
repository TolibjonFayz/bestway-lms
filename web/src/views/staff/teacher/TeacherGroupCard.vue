<script setup>
import { computed } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  group: { type: Object, required: true },
})

defineEmits(['open', 'register'])

/* "dushanba 17:00" per slot — the shape the group model stores. */
const scheduleLine = computed(() => {
  const slots = props.group.schedule ?? []
  if (!slots.length) return uz.teacherGroups.noSchedule
  return slots.map((slot) => `${slot.day} ${slot.start}`).join(' · ')
})

const attendanceLabel = computed(() =>
  props.group.attendancePercent === null
    ? uz.teacherGroups.noData
    : `${props.group.attendancePercent}%`,
)
</script>

<template>
  <div class="tgcard">
    <button type="button" class="tgcard__main" @click="$emit('open', group.id)">
      <div class="tgcard__head">
        <span class="tgcard__name">{{ group.name }}</span>
        <span v-if="group.level" class="tgcard__level">{{ group.level }}</span>
      </div>

      <div class="tgcard__meta">
        <span class="tgcard__meta-item">
          <BwIcon name="users" :size="14" />
          {{ uz.teacherGroups.studentCount.replace('{n}', group.studentCount) }}
        </span>
        <span class="tgcard__meta-item">
          <BwIcon name="home" :size="14" />{{ group.branch }}
        </span>
      </div>

      <div class="tgcard__schedule">
        <BwIcon name="calendar" :size="14" />{{ scheduleLine }}
      </div>
    </button>

    <div class="tgcard__foot">
      <div class="tgcard__attendance">
        <span class="tgcard__attendance-label">{{ uz.teacherGroups.attendance }}</span>
        <span class="tgcard__attendance-value bw-nums">{{ attendanceLabel }}</span>
      </div>
      <button type="button" class="tgcard__register" @click="$emit('register', group.id)">
        {{ uz.teacherGroups.openRegister }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tgcard {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tgcard__main {
  border: none;
  background: transparent;
  text-align: left;
  padding: 18px 20px 14px;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

.tgcard__main:hover {
  background: var(--green-pale);
}

.tgcard__main:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tgcard__head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 9px;
}

.tgcard__name {
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.tgcard__level {
  font-size: 11px;
  font-weight: 700;
  color: var(--green-darker);
  background: var(--green-mid);
  border-radius: 99px;
  padding: 3px 9px;
}

.tgcard__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 7px;
}

.tgcard__meta-item,
.tgcard__schedule {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--gray);
  font-weight: 500;
}

.tgcard__schedule {
  font-size: 12.5px;
}

.tgcard__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid var(--line-2);
  background: var(--bg);
}

.tgcard__attendance {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.tgcard__attendance-label {
  font-size: 12px;
  color: var(--gray);
  font-weight: 600;
}

.tgcard__attendance-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--green);
}

.tgcard__register {
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  height: 32px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink);
  cursor: pointer;
}

.tgcard__register:hover {
  border-color: var(--green);
  color: var(--green);
}

.tgcard__register:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}
</style>
