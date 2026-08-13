<script setup>
import { computed, ref } from 'vue'
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwCheckbox from '@/components/base/BwCheckbox.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  students: { type: Array, required: true },
  selected: { type: Array, required: true },
  page: { type: Number, required: true },
  limit: { type: Number, required: true },
  total: { type: Number, required: true },
  /** Student ids whose status toggle is mid-flight. */
  busy: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:selected', 'toggle-status', 'page-change'])

const allSelected = computed(
  () => props.students.length > 0 && props.students.every((s) => props.selected.includes(s.id)),
)

function toggleAll() {
  emit('update:selected', allSelected.value ? [] : props.students.map((s) => s.id))
}

function toggleOne(id) {
  const next = props.selected.includes(id)
    ? props.selected.filter((sid) => sid !== id)
    : [...props.selected, id]
  emit('update:selected', next)
}

const openMenuId = ref(null)

function levelTone(level) {
  return level === 'A1' || level === 'A2' ? 'warm' : 'cool'
}

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
const rangeFrom = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.limit + 1))
const rangeTo = computed(() => Math.min(props.page * props.limit, props.total))
</script>

<template>
  <div class="astable">
    <div class="astable__row astable__row--head">
      <span />
      <span>{{ uz.adminStudents.colName }}</span>
      <span>{{ uz.adminStudents.colPhone }}</span>
      <span>{{ uz.adminStudents.colGroup }}</span>
      <span>{{ uz.adminStudents.colLevel }}</span>
      <span>{{ uz.adminStudents.colAverage }}</span>
      <span>{{ uz.adminStudents.colAttendance }}</span>
      <span>{{ uz.adminStudents.colStatus }}</span>
      <span>
        <BwCheckbox :model-value="allSelected" @update:model-value="toggleAll" />
      </span>
    </div>

    <div
      v-for="student in students"
      :key="student.id"
      class="astable__row"
      :class="{ 'is-selected': selected.includes(student.id) }"
    >
      <BwCheckbox :model-value="selected.includes(student.id)" @update:model-value="toggleOne(student.id)" />
      <div class="astable__name-cell">
        <BwAvatar :name="student.fullName" :size="32" :font-size="11.5" />
        <span class="astable__name">{{ student.fullName }}</span>
      </div>
      <span class="astable__phone">+998 {{ student.phone }}</span>
      <span class="astable__group">{{ student.groupName ?? '—' }}</span>
      <span v-if="student.level" class="astable__level" :class="`astable__level--${levelTone(student.level)}`">
        {{ student.level }}
      </span>
      <span v-else class="astable__dash">—</span>
      <span class="astable__pct">{{ student.averageScore !== null ? `${student.averageScore}%` : '—' }}</span>
      <span class="astable__pct">{{ student.attendancePercent !== null ? `${student.attendancePercent}%` : '—' }}</span>
      <span class="astable__status" :class="student.active ? 'is-active' : 'is-inactive'">
        {{ student.active ? uz.adminStudents.statusActive : uz.adminStudents.statusInactive }}
      </span>

      <div class="astable__menu-wrap">
        <button
          type="button"
          class="astable__menu-btn"
          :aria-label="uz.adminStudents.actions"
          @click="openMenuId = openMenuId === student.id ? null : student.id"
        >
          <BwIcon name="more-horizontal" :size="16" />
        </button>
        <div v-if="openMenuId === student.id" class="astable__menu" @click.self="openMenuId = null">
          <button
            type="button"
            class="astable__menu-item"
            :disabled="busy.includes(student.id)"
            @click="() => { emit('toggle-status', student); openMenuId = null }"
          >
            {{ student.active ? uz.adminStudents.deactivate : uz.adminStudents.activate }}
          </button>
        </div>
      </div>
    </div>

    <div class="astable__footer">
      <span class="astable__range">
        {{ uz.adminStudents.pageInfo.replace('{from}', rangeFrom).replace('{to}', rangeTo).replace('{total}', total) }}
      </span>
      <div class="astable__pager">
        <button
          type="button"
          class="astable__page-btn"
          :disabled="page <= 1"
          :aria-label="uz.review.back"
          @click="$emit('page-change', page - 1)"
        >
          <BwIcon name="chevron-left" :size="15" :stroke-width="2" />
        </button>
        <button
          v-for="p in totalPages"
          v-show="Math.abs(p - page) <= 2 || p === 1 || p === totalPages"
          :key="p"
          type="button"
          class="astable__page-btn"
          :class="{ 'is-active': p === page }"
          @click="$emit('page-change', p)"
        >
          {{ p }}
        </button>
        <button
          type="button"
          class="astable__page-btn"
          :disabled="page >= totalPages"
          :aria-label="uz.actions.next"
          @click="$emit('page-change', page + 1)"
        >
          <BwIcon name="chevron-right" :size="15" :stroke-width="2" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.astable {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  overflow: hidden;
}

.astable__row {
  display: grid;
  grid-template-columns: 30px 1.8fr 1.3fr 0.8fr 0.7fr 0.7fr 0.7fr 0.9fr 36px;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line-2);
  position: relative;
}

.astable__row:last-of-type {
  border-bottom: none;
}

.astable__row--head {
  background: var(--bg);
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
}

.astable__row--head > span:first-child,
.astable__row--head > span:last-child {
  display: flex;
  justify-content: center;
}

.astable__row.is-selected {
  background: var(--green-pale);
}

.astable__name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.astable__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.astable__phone,
.astable__group {
  font-size: 13px;
  color: var(--gray);
}

.astable__group {
  color: var(--ink-3);
  font-weight: 600;
}

.astable__level {
  font-weight: 700;
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 8px;
  display: inline-block;
  width: fit-content;
}

.astable__level--cool {
  color: var(--green-dark);
  background: var(--green-mid);
}

.astable__level--warm {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.astable__dash {
  color: var(--gray-3);
}

.astable__pct {
  font-weight: 700;
  font-size: 13.5px;
  color: var(--ink);
}

.astable__status {
  display: inline-flex;
  font-weight: 700;
  font-size: 11.5px;
  padding: 4px 10px;
  border-radius: 99px;
  width: fit-content;
}

.astable__status.is-active {
  color: var(--green-dark);
  background: var(--green-mid);
}

.astable__status.is-inactive {
  color: var(--gray);
  background: var(--line-2);
}

.astable__menu-wrap {
  position: relative;
  display: flex;
  justify-content: center;
}

.astable__menu-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.astable__menu-btn:hover {
  background: var(--line-2);
}

.astable__menu {
  position: absolute;
  top: 32px;
  right: 0;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: var(--sh-md);
  z-index: 10;
  min-width: 160px;
  overflow: hidden;
}

.astable__menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-3);
  cursor: pointer;
}

.astable__menu-item:disabled {
  color: var(--gray-2);
  cursor: not-allowed;
}

.astable__menu-item:hover {
  background: var(--bg);
}

.astable__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
}

.astable__range {
  font-size: 13px;
  color: var(--gray);
  font-weight: 600;
}

.astable__pager {
  display: flex;
  gap: 6px;
}

.astable__page-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.astable__page-btn:hover:not(:disabled) {
  background: var(--bg);
}

.astable__page-btn:disabled {
  color: var(--gray-3);
  cursor: not-allowed;
}

.astable__page-btn.is-active {
  border: none;
  background: var(--green);
  color: var(--white);
}
</style>
