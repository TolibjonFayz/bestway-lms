<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { fetchZoomStartUrl } from '@/api/teacher'
import { useNow } from '@/composables/useNow'
import { useToast } from '@/composables/useToast'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'
import { openExternal } from '@/utils/openExternal'

defineProps({
  schedule: { type: Array, required: true },
})

const now = useNow()
const { time } = useUzbekDate()
const toast = useToast()

/* The host button appears from ten minutes before the slot until it ends —
   the same window the students get, so nobody arrives to an empty room. */
const JOIN_GRACE_MS = 10 * 60 * 1000

/** groupId of the row currently minting its start link. */
const starting = ref(null)

function canHost(entry) {
  if (!entry.zoomJoinUrl) return false
  const startsAt = new Date(entry.startsAt).getTime()
  const endsAt = new Date(entry.endsAt).getTime()
  return now.value >= startsAt - JOIN_GRACE_MS && now.value < endsAt
}

/* Opened synchronously inside the click handler — a tab opened after the
   await below would be blocked by most browsers' popup guard, so the tab is
   opened immediately and pointed at the real URL once it's back. Passing
   'noopener' here would defeat the point: Chrome returns null from
   window.open whenever 'noopener' is set, which would throw away the very
   handle we need to redirect the tab later. 'about:blank' (not '') avoids a
   separate footgun — an empty URL resolves as a relative reference against
   the current document and reloads this app in the new tab instead of
   staying blank. Reverse-tabnabbing protection is applied by hand instead,
   by clearing the new tab's own opener reference. */
async function host(entry) {
  if (!canHost(entry) || starting.value) return
  starting.value = entry.groupId
  const tab = window.open('about:blank', '_blank')
  if (tab) tab.opener = null
  try {
    const { url } = await fetchZoomStartUrl(entry.groupId)
    if (tab) tab.location.href = url
    else openExternal(url)
  } catch (error) {
    tab?.close()
    toast.error(uz.zoom.startError, {
      description: error?.response?.data?.message ?? uz.adminSettings.errorText,
    })
  } finally {
    starting.value = null
  }
}
</script>

<template>
  <div class="tsched">
    <h4 class="tsched__title">{{ uz.teacherDashboard.scheduleTitle }}</h4>

    <p v-if="!schedule.length" class="tsched__empty">{{ uz.teacherDashboard.scheduleEmpty }}</p>

    <div v-for="(entry, index) in schedule" :key="entry.groupId + entry.startsAt" class="tsched__row">
      <div class="tsched__rail">
        <span class="tsched__dot" :class="`tsched__dot--${entry.status}`" />
        <span v-if="index < schedule.length - 1" class="tsched__line" />
      </div>
      <div class="tsched__body" :class="{ 'is-done': entry.status === 'done' }">
        <div class="tsched__time" :class="`tsched__time--${entry.status}`">
          {{ time(entry.startsAt) }} – {{ time(entry.endsAt) }}
        </div>
        <div class="tsched__name" :class="`tsched__name--${entry.status}`">
          {{ entry.groupName }}<template v-if="entry.courseName"> · {{ entry.courseName }}</template>
        </div>

        <button
          v-if="canHost(entry)"
          type="button"
          class="tsched__host"
          :disabled="starting === entry.groupId"
          @click="host(entry)"
        >
          <BwIcon name="video" :size="15" />
          {{ starting === entry.groupId ? uz.zoom.starting : uz.zoom.joinHost }}
        </button>
        <span
          v-else-if="!entry.zoomJoinUrl && entry.status !== 'done'"
          class="tsched__nolink"
        >
          {{ uz.zoom.noLinkTeacher }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tsched__host {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  height: 30px;
  padding: 0 12px;
  border-radius: 9px;
  border: none;
  background: var(--green);
  color: var(--white);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--sh-btn);
}

.tsched__host:hover {
  background: var(--green-dark);
}

.tsched__host:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tsched__nolink {
  display: block;
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--gray-2);
}

.tsched {
  flex: 1;
  min-width: 320px;
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 20px;
}

.tsched__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
}

.tsched__empty {
  margin: 0;
  font-size: 13.5px;
  color: var(--gray);
}

.tsched__row {
  display: flex;
  gap: 16px;
}

.tsched__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex: none;
}

.tsched__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex: none;
}

.tsched__dot--done {
  background: var(--green);
}

.tsched__dot--current {
  background: var(--white);
  border: 3px solid var(--green);
}

.tsched__dot--upcoming {
  background: var(--line-2);
  border: 2px solid var(--line);
}

.tsched__line {
  width: 2.5px;
  flex: 1;
  background: var(--line);
  margin-top: 2px;
}

.tsched__body {
  flex: 1;
  padding-bottom: 20px;
}

.tsched__body.is-done {
  opacity: 0.6;
}

.tsched__row:last-child .tsched__body {
  padding-bottom: 0;
}

.tsched__time {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--gray-2);
}

.tsched__time--current {
  color: var(--green-dark);
}

.tsched__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 2px;
}

.tsched__name--upcoming {
  color: var(--gray);
}
</style>
