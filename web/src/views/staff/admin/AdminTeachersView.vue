<script setup>
import { ref } from 'vue'
import StaffShell from '@/layouts/StaffShell.vue'
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSearchInput from '@/components/base/BwSearchInput.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import AdminTeacherModal from './AdminTeacherModal.vue'
import { fetchAdminGroups, fetchAdminTeachers, setAdminTeacherStatus } from '@/api/admin'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const toast = useToast()

const teachers = ref([])
const groups = ref([])
const search = ref('')
const loading = ref(true)
const failed = ref(false)
const modal = ref(null)
/** Teacher ids whose status toggle is mid-flight. */
const busy = ref(new Set())

let searchTimer = null

async function load() {
  loading.value = true
  failed.value = false
  try {
    const [list, groupList] = await Promise.all([
      fetchAdminTeachers({ search: search.value.trim() || undefined, limit: 50 }),
      groups.value.length ? Promise.resolve(groups.value) : fetchAdminGroups(),
    ])
    teachers.value = list.items
    groups.value = groupList
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

/* Debounced so typing a name does not fire a request per keystroke. */
function onSearch(value) {
  search.value = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 300)
}

async function toggleStatus(teacher) {
  if (busy.value.has(teacher.id)) return
  busy.value = new Set(busy.value).add(teacher.id)
  try {
    const updated = await setAdminTeacherStatus(teacher.id, !teacher.active)
    const index = teachers.value.findIndex((row) => row.id === teacher.id)
    if (index !== -1) teachers.value[index] = updated
    toast.success(uz.adminTeachers.saved)
  } catch (error) {
    toast.error(uz.adminTeachers.saveError, {
      description: error?.response?.data?.message ?? uz.adminTeachers.errorText,
    })
  } finally {
    const next = new Set(busy.value)
    next.delete(teacher.id)
    busy.value = next
  }
}

function onSaved() {
  modal.value = null
  toast.success(uz.adminTeachers.saved)
  load()
}

load()
</script>

<template>
  <StaffShell>
    <div class="ateachers">
      <div class="ateachers__head">
        <h1 class="ateachers__title">{{ uz.adminTeachers.title }}</h1>
        <BwButton @click="modal = { teacher: null }">
          <BwIcon name="plus" :size="15" />{{ uz.adminTeachers.add }}
        </BwButton>
      </div>

      <BwSearchInput
        :model-value="search"
        :placeholder="uz.adminTeachers.search"
        class="ateachers__search"
        @update:model-value="onSearch"
      />

      <BwSkeleton v-if="loading" variant="block" height="240px" radius="18px" />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.adminTeachers.errorTitle"
        :text="uz.adminTeachers.errorText"
        @retry="load"
      />

      <LessonsStateCard
        v-else-if="!teachers.length"
        icon="id-card"
        :title="uz.adminTeachers.emptyTitle"
        :text="uz.adminTeachers.emptyText"
      />

      <div v-else class="ateachers__table">
        <div class="ateachers__row ateachers__row--head">
          <span>{{ uz.adminTeachers.colTeacher }}</span>
          <span>{{ uz.adminTeachers.colPhone }}</span>
          <span>{{ uz.adminTeachers.colGroups }}</span>
          <span>{{ uz.adminTeachers.colStudents }}</span>
          <span>{{ uz.adminTeachers.colStatus }}</span>
          <span />
        </div>

        <div
          v-for="teacher in teachers"
          :key="teacher.id"
          class="ateachers__row"
          :class="{ 'is-inactive': !teacher.active }"
        >
          <div class="ateachers__person">
            <BwAvatar :name="teacher.fullName" :size="32" :font-size="11.5" />
            <span class="ateachers__name">{{ teacher.fullName }}</span>
          </div>

          <span class="ateachers__phone bw-nums">+998 {{ teacher.phone }}</span>

          <span class="ateachers__groups">
            <template v-if="teacher.groups.length">
              <span v-for="group in teacher.groups" :key="group.id" class="ateachers__chip">
                {{ group.name }}
              </span>
            </template>
            <span v-else class="ateachers__muted">{{ uz.adminTeachers.noGroups }}</span>
          </span>

          <span class="ateachers__count bw-nums">{{ teacher.studentCount }}</span>

          <button
            type="button"
            class="ateachers__status"
            :class="teacher.active ? 'is-active' : 'is-off'"
            :disabled="busy.has(teacher.id)"
            @click="toggleStatus(teacher)"
          >
            {{ teacher.active ? uz.adminTeachers.active : uz.adminTeachers.inactive }}
          </button>

          <button
            type="button"
            class="ateachers__edit"
            :aria-label="uz.adminTeachers.edit"
            @click="modal = { teacher }"
          >
            <BwIcon name="edit" :size="15" />
          </button>
        </div>
      </div>

      <AdminTeacherModal
        v-if="modal"
        :groups="groups"
        :teacher="modal.teacher"
        @close="modal = null"
        @saved="onSaved"
      />
    </div>
  </StaffShell>
</template>

<style scoped>
.ateachers__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.ateachers__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.ateachers__search {
  max-width: 340px;
  margin-bottom: 14px;
}

.ateachers__table {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  overflow: hidden;
}

.ateachers__row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 1.2fr minmax(0, 1.6fr) 0.7fr 0.9fr 44px;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  min-height: 58px;
  border-bottom: 1px solid var(--line-2);
}

.ateachers__row:last-child {
  border-bottom: none;
}

.ateachers__row--head {
  min-height: 40px;
  background: var(--bg);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.ateachers__row.is-inactive .ateachers__name,
.ateachers__row.is-inactive .ateachers__phone {
  color: var(--gray-2);
}

.ateachers__person {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ateachers__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ateachers__phone {
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 500;
}

.ateachers__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.ateachers__chip {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--green-darker);
  background: var(--green-mid);
  border-radius: 99px;
  padding: 3px 9px;
}

.ateachers__muted {
  font-size: 12.5px;
  color: var(--gray-2);
}

.ateachers__count {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.ateachers__status {
  height: 28px;
  padding: 0 12px;
  border-radius: 99px;
  border: 1px solid transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  justify-self: start;
}

.ateachers__status.is-active {
  background: var(--green-mid);
  color: var(--green-darker);
}

.ateachers__status.is-off {
  background: var(--line-2);
  color: var(--gray);
}

.ateachers__status:disabled {
  opacity: 0.5;
  cursor: progress;
}

.ateachers__status:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.ateachers__edit {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ateachers__edit:hover {
  background: var(--bg);
  color: var(--green);
}

.ateachers__edit:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (max-width: 900px) {
  .ateachers__row {
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-areas:
      'person status edit'
      'groups groups groups';
    padding: 12px 16px;
    row-gap: 8px;
  }

  .ateachers__row--head,
  .ateachers__phone,
  .ateachers__count {
    display: none;
  }

  .ateachers__person {
    grid-area: person;
  }

  .ateachers__groups {
    grid-area: groups;
  }

  .ateachers__status {
    grid-area: status;
  }

  .ateachers__edit {
    grid-area: edit;
  }
}
</style>
