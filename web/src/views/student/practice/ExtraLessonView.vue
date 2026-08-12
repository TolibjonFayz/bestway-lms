<script setup>
import { computed, ref } from 'vue'
import StudentShell from '@/layouts/StudentShell.vue'
import BwButton from '@/components/base/BwButton.vue'
import BwInput from '@/components/base/BwInput.vue'
import BwSelect from '@/components/base/BwSelect.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import { createExtraLesson, fetchExtraLessons } from '@/api/practice'
import { fetchCourses, fetchCourseUnits } from '@/api/lessons'
import { useToast } from '@/composables/useToast'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const STATUS_CLASS = {
  yuborildi: 'is-sent',
  korib_chiqilmoqda: 'is-review',
  tasdiqlandi: 'is-approved',
  rad_etildi: 'is-rejected',
}

const toast = useToast()
const { shortDate } = useUzbekDate()

const requests = ref([])
const unitOptions = ref([{ value: '', label: uz.extraLesson.unitNone }])
const topic = ref('')
const unitId = ref('')
const preferredTime = ref('')
const loading = ref(true)
const failed = ref(false)
const saving = ref(false)

const canSubmit = computed(() => topic.value.trim().length >= 5 && !saving.value)

async function load() {
  loading.value = true
  failed.value = false
  try {
    requests.value = await fetchExtraLessons()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

/* The unit picker is a convenience, so a failure to build it must not stop the
   student from describing their problem in words. */
async function loadUnits() {
  try {
    /* Both endpoints are paginated, so the list lives under .items. */
    const courses = (await fetchCourses()).items
    const perCourse = await Promise.all(
      courses.map((course) =>
        fetchCourseUnits(course.id)
          .then((page) => page.items)
          .catch(() => []),
      ),
    )
    unitOptions.value = [
      { value: '', label: uz.extraLesson.unitNone },
      ...perCourse.flat().map((unit) => ({ value: unit.id, label: unit.title })),
    ]
  } catch {
    /* Leaves just the "no unit" option. */
  }
}

async function submit() {
  if (!canSubmit.value) return
  saving.value = true
  try {
    await createExtraLesson({
      topic: topic.value.trim(),
      ...(unitId.value ? { unitId: Number(unitId.value) } : {}),
      ...(preferredTime.value.trim() ? { preferredTime: preferredTime.value.trim() } : {}),
    })
    topic.value = ''
    unitId.value = ''
    preferredTime.value = ''
    toast.success(uz.extraLesson.sent)
    load()
  } catch (error) {
    toast.error(uz.extraLesson.saveError, {
      description: error?.response?.data?.message ?? uz.extraLesson.errorText,
    })
  } finally {
    saving.value = false
  }
}

load()
loadUnits()
</script>

<template>
  <StudentShell>
    <div class="xlesson">
      <h1 class="xlesson__title">{{ uz.extraLesson.title }}</h1>
      <p class="xlesson__subtitle">{{ uz.extraLesson.subtitle }}</p>

      <form class="xlesson__form" @submit.prevent="submit">
        <h3 class="xlesson__form-title">{{ uz.extraLesson.formTitle }}</h3>

        <label class="xlesson__field">
          <span class="xlesson__label">{{ uz.extraLesson.topic }}</span>
          <textarea
            v-model="topic"
            class="xlesson__textarea"
            rows="3"
            :placeholder="uz.extraLesson.topicPlaceholder"
            maxlength="500"
          />
        </label>

        <div class="xlesson__row">
          <BwSelect v-model="unitId" :label="uz.extraLesson.unit" :options="unitOptions" />
          <BwInput
            v-model="preferredTime"
            :label="uz.extraLesson.preferredTime"
            :placeholder="uz.extraLesson.preferredTimePlaceholder"
          />
        </div>

        <div class="xlesson__actions">
          <BwButton type="submit" :loading="saving" :disabled="!canSubmit">
            {{ uz.extraLesson.submit }}
          </BwButton>
        </div>
      </form>

      <h3 class="xlesson__history-title">{{ uz.extraLesson.historyTitle }}</h3>

      <BwSkeleton v-if="loading" variant="block" height="160px" radius="18px" />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.extraLesson.errorTitle"
        :text="uz.extraLesson.errorText"
        @retry="load"
      />

      <LessonsStateCard
        v-else-if="!requests.length"
        icon="calendar-plus"
        :title="uz.extraLesson.noRequests"
        :text="uz.extraLesson.noRequestsText"
      />

      <div v-else class="xlesson__list">
        <article v-for="request in requests" :key="request.id" class="xlesson__item">
          <div class="xlesson__item-head">
            <span class="xlesson__status" :class="STATUS_CLASS[request.status]">
              {{ uz.extraLesson.statuses[request.status] }}
            </span>
            <span class="xlesson__date">{{ shortDate(request.createdAt) }}</span>
          </div>

          <p class="xlesson__topic">{{ request.topic }}</p>

          <p v-if="request.unitTitle || request.preferredTime" class="xlesson__meta">
            <span v-if="request.unitTitle">{{ request.unitTitle }}</span>
            <span v-if="request.unitTitle && request.preferredTime"> · </span>
            <span v-if="request.preferredTime">{{ request.preferredTime }}</span>
          </p>

          <div v-if="request.teacherNote" class="xlesson__note">
            <span class="xlesson__note-label">{{ uz.extraLesson.teacherNote }}</span>
            <span class="xlesson__note-text">{{ request.teacherNote }}</span>
          </div>
        </article>
      </div>
    </div>
  </StudentShell>
</template>

<style scoped>
.xlesson__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.xlesson__subtitle {
  margin: 5px 0 18px;
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 500;
}

.xlesson__form {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.xlesson__form-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.xlesson__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.xlesson__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}

.xlesson__textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 11px 13px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  resize: vertical;
  outline: none;
}

.xlesson__textarea:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.xlesson__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.xlesson__actions {
  display: flex;
  justify-content: flex-end;
}

.xlesson__history-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.xlesson__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xlesson__item {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  box-shadow: var(--sh-sm);
  padding: 15px 17px;
}

.xlesson__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.xlesson__status {
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 99px;
  padding: 4px 11px;
}

.xlesson__status.is-sent {
  background: var(--line-2);
  color: var(--gray);
}

.xlesson__status.is-review {
  background: color-mix(in srgb, var(--amber) 18%, transparent);
  color: var(--amber);
}

.xlesson__status.is-approved {
  background: var(--green-mid);
  color: var(--green-darker);
}

.xlesson__status.is-rejected {
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--danger);
}

.xlesson__date {
  font-size: 12px;
  color: var(--gray-2);
  font-weight: 500;
}

.xlesson__topic {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.5;
}

.xlesson__meta {
  margin: 0;
  font-size: 12.5px;
  color: var(--gray);
}

.xlesson__note {
  margin-top: 11px;
  padding: 10px 12px;
  border-radius: 11px;
  background: var(--green-pale);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.xlesson__note-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--green-darker);
}

.xlesson__note-text {
  font-size: 13.5px;
  color: var(--ink);
  line-height: 1.5;
}

@media (max-width: 640px) {
  .xlesson__row {
    grid-template-columns: 1fr;
  }
}
</style>
