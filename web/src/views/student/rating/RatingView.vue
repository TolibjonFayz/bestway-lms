<script setup>
import { computed, ref, watch } from 'vue'
import StudentShell from '@/layouts/StudentShell.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '../lessons/LessonsStateCard.vue'
import RatingPodium from './RatingPodium.vue'
import RatingRow from './RatingRow.vue'
import { fetchRating } from '@/api/rating'
import uz from '@/locales/uz'

/* Matches the design's own visual density (podium + ranks 4–8, then a "···"
   truncation hint) rather than a generic list-page size — and, at this
   centre's pool sizes, reliably puts the viewer's own rank past page one, so
   the pinned row's "still correct off-page" behaviour is actually visible
   rather than coincidentally always fitting on screen. */
const PAGE_SIZE = 8

const SCOPES = [
  { value: 'group', label: uz.rating.scopeGroup },
  { value: 'branch', label: uz.rating.scopeBranch },
  { value: 'all', label: uz.rating.scopeAll },
]
const PERIODS = [
  { value: 'week', label: uz.rating.periodWeek },
  { value: 'month', label: uz.rating.periodMonth },
  { value: 'all', label: uz.rating.periodAll },
]

const scope = ref('group')
const period = ref('week')
const rating = ref(null)
const loading = ref(false)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    rating.value = await fetchRating(scope.value, period.value, 1, PAGE_SIZE)
  } catch (cause) {
    error.value = cause
    rating.value = null
  } finally {
    loading.value = false
  }
}

watch([scope, period], load, { immediate: true })

const podium = computed(() => rating.value?.items.items.slice(0, 3) ?? [])
const rest = computed(() => rating.value?.items.items.slice(3) ?? [])
const hasMoreBeyondPage = computed(
  () => (rating.value?.items.total ?? 0) > (rating.value?.items.items.length ?? 0),
)
const isEmpty = computed(() => rating.value && rating.value.items.total === 0)
</script>

<template>
  <StudentShell>
    <div class="rview">
      <div class="rview__head">
        <h1 class="rview__title">{{ uz.rating.title }}</h1>
      </div>

      <BwSkeleton v-if="loading" variant="block" height="420px" radius="20px" />

      <LessonsStateCard
        v-else-if="error"
        variant="error"
        icon="alert-triangle"
        :title="uz.rating.errorTitle"
        :text="uz.rating.errorText"
        @retry="load"
      />

      <div v-else-if="rating" class="rview__card">
        <div class="rview__tabs">
          <div class="rview__pillgroup bw-scroll">
            <button
              v-for="option in SCOPES"
              :key="option.value"
              type="button"
              class="rview__pill"
              :class="{ 'is-active': scope === option.value }"
              @click="scope = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <div class="rview__pillgroup bw-scroll">
            <button
              v-for="option in PERIODS"
              :key="option.value"
              type="button"
              class="rview__pill"
              :class="{ 'is-active': period === option.value }"
              @click="period = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <LessonsStateCard
          v-if="isEmpty"
          icon="trophy"
          :title="uz.rating.emptyTitle"
          :text="uz.rating.emptyText"
        />

        <template v-else>
          <RatingPodium :rows="podium" />

          <div class="rview__list">
            <RatingRow v-for="row in rest" :key="row.studentId" :row="row" />
            <div v-if="hasMoreBeyondPage" class="rview__ellipsis">···</div>
          </div>

          <div v-if="rating.me" class="rview__pinned">
            <RatingRow :row="rating.me" pinned />
          </div>
          <div v-else class="rview__unranked">
            <div class="rview__unranked-title">{{ uz.rating.unrankedTitle }}</div>
            <div class="rview__unranked-text">{{ uz.rating.unrankedText }}</div>
          </div>
        </template>
      </div>
    </div>
  </StudentShell>
</template>

<style scoped>
.rview__head {
  margin-bottom: 16px;
}

.rview__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
}

.rview__card {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.rview__tabs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 4px;
}

.rview__pillgroup {
  display: flex;
  gap: 4px;
  background: var(--line-2);
  border-radius: 11px;
  padding: 4px;
  overflow-x: auto;
}

.rview__pill {
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  height: 34px;
  padding: 0 13px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex: none;
  background: transparent;
  color: var(--gray);
  transition: background 0.15s, color 0.15s;
}

.rview__pill.is-active {
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-btn);
}

.rview__pill:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.rview__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.rview__ellipsis {
  text-align: center;
  padding: 6px 0;
  color: var(--gray-3);
  font-weight: 800;
  letter-spacing: 0.2em;
}

.rview__pinned {
  margin-top: 8px;
  position: sticky;
  bottom: 0;
}

.rview__unranked {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--bg);
  border: 1px dashed var(--line);
  text-align: center;
}

.rview__unranked-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}

.rview__unranked-text {
  font-size: 12.5px;
  color: var(--gray);
  margin-top: 4px;
}

@media (min-width: 1024px) {
  .rview__card {
    border-radius: 24px;
    padding: 32px;
  }

  .rview__title {
    font-size: 26px;
  }

  .rview__tabs {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .rview__pillgroup {
    padding: 5px;
    border-radius: 13px;
    gap: 4px;
  }

  .rview__pill {
    font-size: 13.5px;
    height: 38px;
    padding: 0 16px;
    border-radius: 9px;
  }

  .rview__list {
    margin-top: 22px;
    gap: 7px;
  }
}
</style>
