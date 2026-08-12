<script setup>
import { ref } from 'vue'
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwButton from '@/components/base/BwButton.vue'
import { answerTeacherExtraLesson, fetchTeacherExtraLessons } from '@/api/practice'
import { useToast } from '@/composables/useToast'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const STATUS_CLASS = {
  yuborildi: 'is-sent',
  korib_chiqilmoqda: 'is-review',
  tasdiqlandi: 'is-approved',
  rad_etildi: 'is-rejected',
}

const OPEN = ['yuborildi', 'korib_chiqilmoqda']

const toast = useToast()
const { shortDate } = useUzbekDate()

const requests = ref([])
const loading = ref(true)
/** Request id currently being answered, with its draft note. */
const answering = ref(null)
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    requests.value = await fetchTeacherExtraLessons()
  } catch {
    requests.value = []
  } finally {
    loading.value = false
  }
}

async function answer(request, status) {
  if (saving.value) return
  saving.value = true
  try {
    const updated = await answerTeacherExtraLesson(request.id, {
      status,
      ...(answering.value?.note?.trim() ? { teacherNote: answering.value.note.trim() } : {}),
    })
    const index = requests.value.findIndex((row) => row.id === request.id)
    if (index !== -1) requests.value[index] = updated
    answering.value = null
    toast.success(uz.teacherExtraLessons.answered)
  } catch (error) {
    toast.error(uz.adminTeachers.saveError, {
      description: error?.response?.data?.message ?? uz.extraLesson.errorText,
    })
  } finally {
    saving.value = false
  }
}

load()

defineExpose({ reload: load })
</script>

<template>
  <div class="txl">
    <h3 class="txl__title">{{ uz.teacherExtraLessons.title }}</h3>

    <p v-if="loading" class="txl__loading">…</p>

    <div v-else-if="!requests.length" class="txl__empty">
      <p class="txl__empty-title">{{ uz.teacherExtraLessons.empty }}</p>
      <p class="txl__empty-text">{{ uz.teacherExtraLessons.emptyText }}</p>
    </div>

    <article v-for="request in requests" v-else :key="request.id" class="txl__row">
      <div class="txl__head">
        <BwAvatar :name="request.studentName" :size="30" :font-size="11" />
        <div class="txl__who">
          <span class="txl__name">{{ request.studentName }}</span>
          <span class="txl__meta">
            {{ request.groupName ?? '' }} · {{ shortDate(request.createdAt) }}
          </span>
        </div>
        <span class="txl__status" :class="STATUS_CLASS[request.status]">
          {{ uz.extraLesson.statuses[request.status] }}
        </span>
      </div>

      <p class="txl__topic">{{ request.topic }}</p>
      <p v-if="request.unitTitle || request.preferredTime" class="txl__detail">
        <span v-if="request.unitTitle">{{ request.unitTitle }}</span>
        <span v-if="request.unitTitle && request.preferredTime"> · </span>
        <span v-if="request.preferredTime">{{ request.preferredTime }}</span>
      </p>

      <p v-if="request.teacherNote" class="txl__note">{{ request.teacherNote }}</p>

      <template v-if="OPEN.includes(request.status)">
        <div v-if="answering?.id === request.id" class="txl__answer">
          <input
            v-model="answering.note"
            class="txl__input"
            :placeholder="uz.teacherExtraLessons.notePlaceholder"
            maxlength="1000"
          />
          <div class="txl__answer-actions">
            <BwButton size="sm" variant="ghost" @click="answering = null">
              {{ uz.teacherExtraLessons.cancel }}
            </BwButton>
            <BwButton
              size="sm"
              variant="danger"
              :disabled="saving"
              @click="answer(request, 'rad_etildi')"
            >
              {{ uz.teacherExtraLessons.reject }}
            </BwButton>
            <BwButton size="sm" :disabled="saving" @click="answer(request, 'tasdiqlandi')">
              {{ uz.teacherExtraLessons.approve }}
            </BwButton>
          </div>
        </div>

        <div v-else class="txl__actions">
          <BwButton size="sm" variant="secondary" @click="answering = { id: request.id, note: '' }">
            {{ uz.teacherExtraLessons.approve }} / {{ uz.teacherExtraLessons.reject }}
          </BwButton>
        </div>
      </template>
    </article>
  </div>
</template>

<style scoped>
.txl {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 18px 20px;
}

.txl__title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.txl__loading {
  margin: 12px 0;
  color: var(--gray-2);
  text-align: center;
}

.txl__empty {
  padding: 10px 0 14px;
  text-align: center;
}

.txl__empty-title {
  margin: 0 0 3px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.txl__empty-text {
  margin: 0;
  font-size: 12.5px;
  color: var(--gray-2);
}

.txl__row {
  padding: 13px 0;
  border-top: 1px solid var(--line-2);
}

.txl__row:first-of-type {
  border-top: none;
}

.txl__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.txl__who {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.txl__name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
}

.txl__meta {
  font-size: 11.5px;
  color: var(--gray-2);
}

.txl__status {
  font-size: 11px;
  font-weight: 700;
  border-radius: 99px;
  padding: 3px 9px;
  flex-shrink: 0;
}

.txl__status.is-sent {
  background: var(--line-2);
  color: var(--gray);
}

.txl__status.is-review {
  background: color-mix(in srgb, var(--amber) 18%, transparent);
  color: var(--amber);
}

.txl__status.is-approved {
  background: var(--green-mid);
  color: var(--green-darker);
}

.txl__status.is-rejected {
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--danger);
}

.txl__topic {
  margin: 0 0 4px;
  font-size: 13.5px;
  color: var(--ink);
  line-height: 1.5;
}

.txl__detail {
  margin: 0;
  font-size: 12px;
  color: var(--gray);
}

.txl__note {
  margin: 9px 0 0;
  padding: 8px 11px;
  border-radius: 10px;
  background: var(--green-pale);
  font-size: 12.5px;
  color: var(--ink);
}

.txl__actions,
.txl__answer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 9px;
}

.txl__answer {
  margin-top: 9px;
}

.txl__input {
  width: 100%;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0 12px;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  outline: none;
}

.txl__input:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}
</style>
