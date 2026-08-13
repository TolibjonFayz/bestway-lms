<script setup>
import { ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { fetchAdminGroups, setGroupZoomUrl } from '@/api/admin'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const toast = useToast()

const groups = ref([])
const loading = ref(true)
/** Group id being edited, with its draft value. */
const editing = ref(null)
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    groups.value = await fetchAdminGroups()
  } catch {
    groups.value = []
  } finally {
    loading.value = false
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
        <BwButton size="sm" variant="secondary" @click="startEdit(group)">
          {{ group.zoomJoinUrl ? uz.zoom.edit : uz.zoom.add }}
        </BwButton>
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
</style>
