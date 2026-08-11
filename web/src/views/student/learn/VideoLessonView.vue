<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StudentShell from '@/layouts/StudentShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '../lessons/LessonsStateCard.vue'
import KonspektPanel from './KonspektPanel.vue'
import UnitItemRail from './UnitItemRail.vue'
import VideoPlayer from './VideoPlayer.vue'
import { reportVideoProgress } from '@/api/learning'
import { resolveVideoSource } from '@/composables/useVideoSource'
import { useThrottledProgress } from '@/composables/useThrottledProgress'
import { useLessonsStore } from '@/stores/lessons'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

/** "Darsni yakunlash" unlocks here; the server enforces the same number. */
const COMPLETION_THRESHOLD = 90

const route = useRoute()
const router = useRouter()
const lessons = useLessonsStore()
const toast = useToast()

const courseId = computed(() => Number(route.params.courseId))
const unitId = computed(() => Number(route.params.unitId))

const unit = computed(() => lessons.unit)
const videoItem = computed(
  () => unit.value?.items.find((item) => item.type === 'video') ?? null,
)
const source = computed(() =>
  videoItem.value?.video ? resolveVideoSource(videoItem.value.video) : null,
)

const watched = ref(0)
const finishing = ref(false)
const completed = ref(false)

const canFinish = computed(
  () => watched.value >= COMPLETION_THRESHOLD || completed.value,
)
const statusLine = computed(() =>
  canFinish.value
    ? uz.video.watchedEnabled.replace('{percent}', watched.value)
    : uz.video.watchedOf
        .replace('{percent}', watched.value)
        .replace('{required}', COMPLETION_THRESHOLD),
)

/* Progress goes out at most once per ten seconds while playing, and
   immediately on pause or when leaving the page. */
const progress = useThrottledProgress(async (percent) => {
  if (!videoItem.value) return
  const result = await reportVideoProgress(videoItem.value.id, percent)
  watched.value = Math.max(watched.value, result.percent)
})

function onTick(percent) {
  watched.value = Math.max(watched.value, percent)
  progress.report(percent)
}

function onPause(percent) {
  watched.value = Math.max(watched.value, percent)
  void progress.flush(percent)
}

async function finish() {
  if (!videoItem.value || finishing.value) return
  finishing.value = true
  try {
    /* Cancel any queued tick so it cannot land after the completion call and
       overwrite the finished state. */
    progress.cancel()
    const result = await reportVideoProgress(
      videoItem.value.id,
      watched.value,
      true,
    )
    completed.value = result.completed
    watched.value = result.percent
    if (result.coinsAwarded > 0) {
      toast.success(uz.video.completed, {
        description: uz.vocab.coinsEarned.replace('{n}', result.coinsAwarded),
      })
    }
    await lessons.loadUnit(unitId.value)
  } catch (error) {
    toast.error(uz.video.errorTitle, {
      description: error?.response?.data?.message ?? uz.video.errorText,
    })
  } finally {
    finishing.value = false
  }
}

function openItem(item) {
  if (item.type === 'vocabulary') {
    router.push(`/lessons/${courseId.value}/units/${unitId.value}/vocabulary`)
    return
  }
  if (item.type === 'test') {
    router.push(`/lessons/${courseId.value}/units/${unitId.value}/test`)
    return
  }
  if (item.type !== 'video') {
    router.push(`/lessons/${courseId.value}/units/${unitId.value}`)
  }
}

watch(
  unitId,
  (id) => {
    watched.value = 0
    completed.value = false
    if (id) lessons.loadUnit(id)
  },
  { immediate: true },
)

/* Seed the bar from stored progress so it does not start at 0 on a revisit. */
watch(videoItem, (item) => {
  if (item) {
    watched.value = item.percent
    completed.value = item.percent === 100
  }
})

onBeforeUnmount(() => {
  void progress.flush()
})
</script>

<template>
  <StudentShell>
    <div class="vlesson">
      <div class="vlesson__main">
        <BwSkeleton
          v-if="lessons.unitLoading"
          variant="block"
          height="var(--vlesson-sk)"
          radius="16px"
          class="vlesson__sk"
        />

        <LessonsStateCard
          v-else-if="lessons.unitError"
          variant="error"
          icon="alert-triangle"
          :title="uz.video.errorTitle"
          :text="uz.video.errorText"
          @retry="lessons.loadUnit(unitId)"
        />

        <template v-else-if="videoItem">
          <VideoPlayer
            v-if="source"
            :source="source"
            @tick="onTick"
            @pause="onPause"
            @ended="onPause"
          />
          <LessonsStateCard
            v-else
            icon="video"
            :title="uz.video.sourceUnavailableTitle"
            :text="uz.video.sourceUnavailableText"
          />

          <div class="vlesson__meta">
            <div class="vlesson__code">{{ unit?.code }}</div>
            <h1 class="vlesson__title">{{ videoItem.title }}</h1>
            <div v-if="unit?.courseName" class="vlesson__teacher">
              <BwIcon name="user-outline" :size="16" />{{ unit.courseName }}
            </div>
          </div>

          <div class="vlesson__actions">
            <button
              class="vlesson__finish"
              type="button"
              :disabled="!canFinish || finishing || completed"
              @click="finish"
            >
              <BwIcon
                v-if="canFinish"
                name="check"
                :size="17"
                :stroke-width="3"
              />
              {{ completed ? uz.video.completed : uz.video.finish }}
            </button>
            <span class="vlesson__status" :class="{ 'is-ready': canFinish }">
              {{ statusLine }}
            </span>
          </div>

          <KonspektPanel
            v-if="videoItem.video?.konspekt?.length"
            :bullets="videoItem.video.konspekt"
          />
        </template>
      </div>

      <div class="vlesson__rail">
        <UnitItemRail
          v-if="unit"
          :items="unit.items"
          :active-item-id="videoItem?.id ?? null"
          @select="openItem"
        />
      </div>
    </div>
  </StudentShell>
</template>

<style scoped>
.vlesson {
  --vlesson-sk: 210px;
  display: flex;
  gap: 26px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.vlesson__main {
  flex: 2;
  min-width: 0;
  width: 100%;
}

.vlesson__meta {
  margin-top: 16px;
}

.vlesson__code {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.vlesson__title {
  margin: 3px 0 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--ink);
}

.vlesson__teacher {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 7px;
  color: var(--gray);
  font-size: 13px;
  font-weight: 500;
}

.vlesson__actions {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 16px;
}

.vlesson__finish {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-continue);
  cursor: pointer;
  transition: background 0.15s;
}

.vlesson__finish:hover:not(:disabled) {
  background: var(--green-dark);
}

.vlesson__finish:disabled {
  background: var(--line);
  color: var(--gray-2);
  box-shadow: none;
  cursor: not-allowed;
}

.vlesson__finish:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.vlesson__status {
  text-align: center;
  font-size: 12px;
  color: var(--gray-2);
  font-weight: 600;
}

.vlesson__status.is-ready {
  color: var(--green);
}

.vlesson__rail {
  flex: 1;
  min-width: 0;
  width: 100%;
  margin-top: 18px;
}

@media (min-width: 1024px) {
  .vlesson {
    --vlesson-sk: 380px;
    flex-wrap: nowrap;
  }

  .vlesson__main {
    min-width: 520px;
  }

  .vlesson__meta {
    margin-top: 18px;
  }

  .vlesson__title {
    font-size: 22px;
    letter-spacing: -0.01em;
  }

  .vlesson__code {
    font-size: 12px;
  }

  .vlesson__teacher {
    gap: 7px;
    margin-top: 8px;
    font-size: 14px;
  }

  .vlesson__actions {
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 20px;
  }

  .vlesson__finish {
    width: auto;
    padding: 0 22px;
  }

  .vlesson__status {
    text-align: left;
    align-self: center;
  }

  .vlesson__rail {
    flex: 1;
    min-width: 260px;
    max-width: 320px;
    margin-top: 0;
  }
}
</style>
