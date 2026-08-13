<script setup>
import { ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import {
  createGroupZoomMeeting,
  fetchAdminGroups,
  fetchZoomStatus,
  setGroupZoomUrl,
  updateGroupSchedule,
} from '@/api/admin'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const WEEKDAYS = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba']

const toast = useToast()

const groups = ref([])
const loading = ref(true)
/** Group id being edited, with its draft value. */
const editing = ref(null)
const saving = ref(false)
/* Hidden entirely rather than shown-disabled: a button that always fails is
   worse than no button, and most groups won't have Zoom credentials set up. */
const zoomConfigured = ref(false)
/** Group id whose meeting is being auto-created. */
const autoCreating = ref(null)

async function load() {
  loading.value = true
  try {
    const [groupList, status] = await Promise.all([fetchAdminGroups(), fetchZoomStatus()])
    groups.value = groupList
    zoomConfigured.value = status.configured
  } catch {
    groups.value = []
  } finally {
    loading.value = false
  }
}

async function autoCreate(group) {
  if (autoCreating.value) return
  autoCreating.value = group.id
  try {
    const updated = await createGroupZoomMeeting(group.id)
    const index = groups.value.findIndex((g) => g.id === group.id)
    if (index !== -1) groups.value[index] = { ...groups.value[index], ...updated }
    toast.success(uz.zoom.autoCreated)
  } catch (error) {
    toast.error(uz.zoom.autoCreateError, {
      description: error?.response?.data?.message ?? uz.adminSettings.errorText,
    })
  } finally {
    autoCreating.value = null
  }
}

function startEdit(group) {
  editing.value = { id: group.id, url: group.zoomJoinUrl ?? '' }
}

async function save() {
  if (!editing.value || saving.value) return
  saving.value = true
  const { id, url } = editing.value
  try {
    const updated = await setGroupZoomUrl(id, url.trim())
    const index = groups.value.findIndex((g) => g.id === id)
    if (index !== -1) groups.value[index] = { ...groups.value[index], ...updated }
    editing.value = null
    toast.success(url.trim() ? uz.zoom.linkSaved : uz.zoom.linkCleared)
  } catch (error) {
    toast.error(uz.zoom.linkError, {
      description: error?.response?.data?.message ?? uz.adminSettings.errorText,
    })
  } finally {
    saving.value = false
  }
}

/* Clearing is the same call with an empty string — the DTO's regex allows it
   precisely so removing a link needs no separate endpoint. */
function clear() {
  if (!editing.value) return
  editing.value.url = ''
  save()
}

/** Group id + a working copy of its slots, edited separately from the Zoom
    link so the two forms don't fight over save/cancel state. */
const scheduleEditing = ref(null)
const savingSchedule = ref(false)

function startEditSchedule(group) {
  scheduleEditing.value = {
    id: group.id,
    slots: (group.schedule ?? []).map((slot) => ({ ...slot })),
  }
}

function addSlot() {
  if (!scheduleEditing.value) return
  scheduleEditing.value.slots.push({ day: 'dushanba', start: '09:00', end: '10:00' })
}

function removeSlot(index) {
  if (!scheduleEditing.value) return
  scheduleEditing.value.slots.splice(index, 1)
}

async function saveSchedule() {
  if (!scheduleEditing.value || savingSchedule.value) return
  savingSchedule.value = true
  const { id, slots } = scheduleEditing.value
  try {
    const updated = await updateGroupSchedule(id, slots)
    const index = groups.value.findIndex((g) => g.id === id)
    if (index !== -1) groups.value[index] = { ...groups.value[index], ...updated }
    scheduleEditing.value = null
    toast.success(uz.groupSchedule.saved)
  } catch (error) {
    toast.error(uz.groupSchedule.error, {
      description: error?.response?.data?.message ?? uz.adminSettings.errorText,
    })
  } finally {
    savingSchedule.value = false
  }
}

load()
</script>

<template>
  <section class="gzoom">
    <h3 class="gzoom__title">{{ uz.zoom.groupsTitle }}</h3>
    <p class="gzoom__text">{{ uz.zoom.groupsText }}</p>
    <p class="gzoom__note">
      <BwIcon name="alert-circle" :size="14" />{{ uz.zoom.linkFreeNote }}
    </p>

    <p v-if="loading" class="gzoom__loading">…</p>

    <div v-for="group in groups" v-else :key="group.id" class="gzoom__row">
      <div class="gzoom__head">
        <span class="gzoom__name">{{ group.name }}</span>
        <span class="gzoom__branch">{{ group.branch }}</span>
        <span
          class="gzoom__status"
          :class="group.zoomJoinUrl ? 'is-set' : 'is-missing'"
        >
          {{ group.zoomJoinUrl ? uz.zoom.linkSet : uz.zoom.linkMissing }}
        </span>
      </div>

      <div v-if="editing?.id === group.id" class="gzoom__edit">
        <input
          v-model="editing.url"
          class="gzoom__input"
          type="url"
          :placeholder="uz.zoom.linkPlaceholder"
          maxlength="500"
        />
        <span class="gzoom__hint">{{ uz.zoom.linkHint }}</span>
        <div class="gzoom__actions">
          <BwButton size="sm" variant="ghost" @click="editing = null">
            {{ uz.zoom.cancel }}
          </BwButton>
          <BwButton
            v-if="group.zoomJoinUrl"
            size="sm"
            variant="danger"
            :disabled="saving"
            @click="clear"
          >
            {{ uz.zoom.clear }}
          </BwButton>
          <BwButton size="sm" :loading="saving" @click="save">{{ uz.zoom.save }}</BwButton>
        </div>
      </div>

      <div v-else class="gzoom__view">
        <span v-if="group.zoomJoinUrl" class="gzoom__url">{{ group.zoomJoinUrl }}</span>
        <span v-else-if="zoomConfigured" class="gzoom__spacer" />

        <BwButton
          v-if="zoomConfigured && !group.zoomJoinUrl"
          size="sm"
          :loading="autoCreating === group.id"
          @click="autoCreate(group)"
        >
          <BwIcon name="video" :size="14" />{{ uz.zoom.autoCreate }}
        </BwButton>
        <span v-if="zoomConfigured && !group.zoomJoinUrl" class="gzoom__or">
          {{ uz.zoom.orManual }}
        </span>
        <BwButton size="sm" variant="secondary" @click="startEdit(group)">
          {{ group.zoomJoinUrl ? uz.zoom.edit : uz.zoom.add }}
        </BwButton>
      </div>

      <div class="gzoom__schedule">
        <div class="gzoom__schedule-head">
          <span class="gzoom__schedule-title">{{ uz.groupSchedule.title }}</span>
          <BwButton
            v-if="scheduleEditing?.id !== group.id"
            size="sm"
            variant="secondary"
            @click="startEditSchedule(group)"
          >
            {{ uz.groupSchedule.edit }}
          </BwButton>
        </div>

        <div v-if="scheduleEditing?.id === group.id" class="gzoom__slots">
          <div v-for="(slot, index) in scheduleEditing.slots" :key="index" class="gzoom__slot-row">
            <select v-model="slot.day" class="gzoom__select">
              <option v-for="day in WEEKDAYS" :key="day" :value="day">
                {{ uz.groupSchedule.days[day] }}
              </option>
            </select>
            <input v-model="slot.start" type="time" class="gzoom__time" />
            <span class="gzoom__slot-sep">–</span>
            <input v-model="slot.end" type="time" class="gzoom__time" />
            <button
              type="button"
              class="gzoom__slot-remove"
              :aria-label="uz.groupSchedule.remove"
              @click="removeSlot(index)"
            >
              <BwIcon name="x" :size="14" />
            </button>
          </div>

          <button type="button" class="gzoom__add-slot" @click="addSlot">
            <BwIcon name="plus" :size="14" />{{ uz.groupSchedule.addSlot }}
          </button>

          <div class="gzoom__actions">
            <BwButton size="sm" variant="ghost" @click="scheduleEditing = null">
              {{ uz.groupSchedule.cancel }}
            </BwButton>
            <BwButton size="sm" :loading="savingSchedule" @click="saveSchedule">
              {{ uz.groupSchedule.save }}
            </BwButton>
          </div>
        </div>

        <div v-else class="gzoom__chips">
          <span v-if="!group.schedule?.length" class="gzoom__chips-empty">
            {{ uz.groupSchedule.empty }}
          </span>
          <span v-for="(slot, index) in group.schedule" :key="index" class="gzoom__chip">
            {{ uz.groupSchedule.days[slot.day] }} {{ slot.start }}–{{ slot.end }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gzoom {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-sm);
  padding: 20px;
}

.gzoom__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.gzoom__text {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: var(--gray);
}

.gzoom__note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 11px 0 4px;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--warn-bg);
  border: 1px solid var(--warn-line);
  font-size: 12px;
  color: var(--orange-ink);
}

.gzoom__loading {
  margin: 14px 0;
  text-align: center;
  color: var(--gray-2);
}

.gzoom__row {
  padding: 13px 0;
  border-top: 1px solid var(--line-2);
}

.gzoom__head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 7px;
}

.gzoom__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.gzoom__branch {
  font-size: 12px;
  color: var(--gray-2);
  flex: 1;
}

.gzoom__status {
  font-size: 11px;
  font-weight: 700;
  border-radius: 99px;
  padding: 3px 9px;
}

.gzoom__status.is-set {
  background: var(--green-mid);
  color: var(--green-darker);
}

.gzoom__status.is-missing {
  background: var(--line-2);
  color: var(--gray);
}

.gzoom__view {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.gzoom__spacer {
  flex: 1;
}

.gzoom__or {
  font-size: 11.5px;
  color: var(--gray-2);
}

.gzoom__url {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--gray);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
}

.gzoom__edit {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gzoom__input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0 12px;
  font-family: inherit;
  font-size: 13.5px;
  color: var(--ink);
  outline: none;
}

.gzoom__input:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.gzoom__hint {
  font-size: 11.5px;
  color: var(--gray-2);
}

.gzoom__actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 2px;
}

.gzoom__schedule {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--line-2);
}

.gzoom__schedule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
  margin-bottom: 8px;
}

.gzoom__schedule-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-2);
}

.gzoom__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.gzoom__chips-empty {
  font-size: 12px;
  color: var(--gray-2);
}

.gzoom__chip {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--green-darker);
  background: var(--green-mid);
  border-radius: 99px;
  padding: 4px 10px;
}

.gzoom__slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gzoom__slot-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.gzoom__select,
.gzoom__time {
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 0 9px;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  outline: none;
  background: var(--white);
}

.gzoom__select:focus,
.gzoom__time:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.gzoom__select {
  flex: 1;
  min-width: 0;
}

.gzoom__time {
  width: 100px;
}

.gzoom__slot-sep {
  color: var(--gray-2);
}

.gzoom__slot-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: none;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--gray);
  cursor: pointer;
}

.gzoom__slot-remove:hover {
  background: var(--line-2);
  color: var(--danger);
}

.gzoom__add-slot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  border: 1px dashed var(--line);
  border-radius: 9px;
  padding: 7px 11px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gray);
  background: transparent;
  cursor: pointer;
}

.gzoom__add-slot:hover {
  border-color: var(--green);
  color: var(--green-dark);
}
</style>
