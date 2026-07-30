<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import ReviewSubmissionDetail from './ReviewSubmissionDetail.vue'
import ReviewSubmissionList from './ReviewSubmissionList.vue'
import { fetchTeacherSubmission, fetchTeacherSubmissions, gradeTeacherSubmission } from '@/api/teacher'
import uz from '@/locales/uz'

const route = useRoute()
const router = useRouter()

const items = ref([])
const listLoading = ref(false)
const listError = ref(null)

const detail = ref(null)
const detailLoading = ref(false)
const detailError = ref(null)
const saving = ref(false)

const selectedId = computed(() => (route.query.submission ? Number(route.query.submission) : null))

async function loadList() {
  listLoading.value = true
  listError.value = null
  try {
    /* The queue of work still to grade — not the full graded history, which
       would bury today's submissions under two months of old ones. Items
       graded during this visit stay visible (updated in place below) so the
       list mirrors what the design shows: a mix of pending and just-graded. */
    const page = await fetchTeacherSubmissions({ status: 'pending', limit: 50 })
    items.value = page.items
    /* Desktop wants something in the detail pane by default; a phone starts
       on the list and only opens a card the reviewer actually taps. */
    if (!selectedId.value && items.value.length && window.innerWidth >= 1024) {
      selectSubmission(items.value[0].id)
    }
  } catch (cause) {
    listError.value = cause
  } finally {
    listLoading.value = false
  }
}

async function loadDetail(id) {
  detailLoading.value = true
  detailError.value = null
  try {
    detail.value = await fetchTeacherSubmission(id)
  } catch (cause) {
    detailError.value = cause
    detail.value = null
  } finally {
    detailLoading.value = false
  }
}

function selectSubmission(id) {
  router.replace({ query: { ...route.query, submission: id } })
}

function backToList() {
  const query = { ...route.query }
  delete query.submission
  router.replace({ query })
}

watch(
  selectedId,
  (id) => {
    if (id) loadDetail(id)
    else detail.value = null
  },
  { immediate: true },
)

onMounted(loadList)

async function handleGrade(payload) {
  if (!selectedId.value) return
  saving.value = true
  try {
    const result = await gradeTeacherSubmission(selectedId.value, payload)
    /* Reflect the new score/status in the list row without a full refetch. */
    const row = items.value.find((item) => item.id === selectedId.value)
    if (row) {
      row.status = 'graded'
      row.score = result.submission.score
    }
    if (result.nextPendingId) {
      selectSubmission(result.nextPendingId)
    } else {
      detail.value = result.submission
    }
  } catch (cause) {
    detailError.value = cause
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="review">
    <div class="review__topbar">
      <button type="button" class="review__back" :aria-label="uz.review.back" @click="router.push('/staff')">
        <BwIcon name="chevron-left" :size="18" :stroke-width="2" />
      </button>
      <h1 class="review__title">{{ uz.review.title }}</h1>
    </div>

    <BwSkeleton v-if="listLoading" variant="block" height="600px" radius="18px" class="review__skeleton" />

    <LessonsStateCard
      v-else-if="listError"
      variant="error"
      icon="alert-triangle"
      :title="uz.review.errorTitle"
      :text="uz.review.errorText"
      class="review__skeleton"
      @retry="loadList"
    />

    <LessonsStateCard
      v-else-if="!items.length"
      icon="file-check"
      :title="uz.review.listEmptyTitle"
      :text="uz.review.listEmptyText"
      class="review__skeleton"
    />

    <div v-else class="review__split">
      <ReviewSubmissionList
        :items="items"
        :selected-id="selectedId"
        class="review__list"
        :class="{ 'is-hidden-mobile': Boolean(selectedId) }"
        @select="selectSubmission"
      />

      <div class="review__detail-pane" :class="{ 'is-hidden-mobile': !selectedId }">
        <div v-if="selectedId" class="review__mobile-header">
          <button type="button" class="review__mobile-back" :aria-label="uz.review.back" @click="backToList">
            <BwIcon name="chevron-left" :size="16" :stroke-width="2" />
          </button>
          <div v-if="detail" class="review__mobile-heading">
            <div class="review__mobile-eyebrow">{{ detail.unitTitle }} · {{ uz.itemTypes[detail.itemType] }}</div>
            <div class="review__mobile-name">{{ detail.studentName }}</div>
          </div>
        </div>

        <BwSkeleton v-if="detailLoading" variant="block" height="400px" radius="16px" class="review__detail-skeleton" />

        <LessonsStateCard
          v-else-if="detailError"
          variant="error"
          icon="alert-triangle"
          :title="uz.review.gradeErrorTitle"
          :text="uz.review.gradeErrorText"
          class="review__detail-skeleton"
          @retry="() => loadDetail(selectedId)"
        />

        <ReviewSubmissionDetail
          v-else-if="detail"
          :submission="detail"
          :saving="saving"
          @grade="handleGrade"
        />

        <div v-else class="review__prompt">{{ uz.review.selectPrompt }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review {
  min-height: 100dvh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.review__topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--white);
  border-bottom: 1px solid var(--line-2);
  flex: none;
}

.review__back {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-3);
  flex: none;
}

.review__back:hover {
  background: var(--bg);
}

.review__back:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.review__title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.review__skeleton {
  margin: 20px;
}

.review__split {
  flex: 1;
  min-height: 0;
  display: flex;
}

.review__detail-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.review__mobile-header {
  display: none;
}

.review__detail-skeleton {
  margin: 16px;
}

.review__prompt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-2);
  font-size: 14.5px;
  font-weight: 600;
  padding: 40px;
  text-align: center;
}

@media (max-width: 1023px) {
  .review__topbar {
    display: none;
  }

  .review__split {
    display: block;
  }

  .review__list.is-hidden-mobile,
  .review__detail-pane.is-hidden-mobile {
    display: none;
  }

  .review__detail-pane {
    display: flex;
  }

  .review__mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 16px 12px;
    border-bottom: 1px solid var(--line-2);
    background: var(--white);
    flex: none;
  }

  .review__mobile-back {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink-3);
    flex: none;
  }

  .review__mobile-back:focus-visible {
    outline: none;
    box-shadow: var(--ring-green);
  }

  .review__mobile-eyebrow {
    font-size: 11px;
    font-weight: 700;
    color: var(--gray-2);
    text-transform: uppercase;
  }

  .review__mobile-name {
    font-size: 15.5px;
    font-weight: 800;
    color: var(--ink);
  }
}

@media (min-width: 1024px) {
  .review__split {
    height: 100%;
  }

  .review__list,
  .review__detail-pane {
    overflow-y: auto;
  }
}
</style>
