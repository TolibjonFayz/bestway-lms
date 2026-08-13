<script setup>
import { computed } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { useNow } from '@/composables/useNow'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'
import { openExternal } from '@/utils/openExternal'

const props = defineProps({
  lesson: { type: Object, required: true },
})

const now = useNow()
const { longDate, time, dateAndTime } = useUzbekDate()

const opensAt = computed(() => new Date(props.lesson.joinOpensAt))
const startsAt = computed(() => new Date(props.lesson.startsAt))
const closesAt = computed(() => new Date(props.lesson.joinClosesAt))

const hasLink = computed(() => Boolean(props.lesson.zoomJoinUrl))

/* The real check: the button is live from ten minutes before the start until
   the slot ends, recomputed as the clock ticks — and only if there is
   somewhere to go. */
const inWindow = computed(
  () => now.value >= opensAt.value && now.value < closesAt.value,
)
const canJoin = computed(() => inWindow.value && hasLink.value)
const hasStarted = computed(() => now.value >= startsAt.value)

const caption = computed(() => {
  if (!hasLink.value) return uz.zoom.noLink
  if (!inWindow.value) {
    return uz.dashboard.joinOpensAt.replace('{time}', time(opensAt.value))
  }
  return hasStarted.value ? uz.dashboard.joinOpenNow : uz.dashboard.joinOpenSoon
})

function join() {
  if (!canJoin.value) return
  openExternal(props.lesson.zoomJoinUrl)
}
</script>

<template>
  <section class="next">
    <span class="next__blob next__blob--1" />
    <span class="next__blob next__blob--2" />

    <div class="next__body">
      <span class="next__tag">{{ uz.dashboard.nextLesson }}</span>
      <h2 class="next__title">{{ lesson.title }}</h2>

      <div class="next__meta">
        <span class="next__meta-item next__meta-item--wide">
          <BwIcon name="calendar" :size="16" :stroke-width="1.9" />
          {{ dateAndTime(lesson.startsAt) }}
        </span>
        <span class="next__meta-item next__meta-item--split">
          <BwIcon name="calendar" :size="17" :stroke-width="1.9" />
          {{ longDate(lesson.startsAt) }}
        </span>
        <span class="next__meta-item next__meta-item--split">
          <BwIcon name="clock" :size="17" :stroke-width="1.9" />
          {{ time(lesson.startsAt) }}
        </span>
        <span v-if="lesson.teacherName" class="next__meta-item">
          <BwIcon name="user-outline" :size="17" :stroke-width="1.9" />
          {{ lesson.teacherName }}
        </span>
      </div>
    </div>

    <div class="next__action">
      <button
        class="next__join"
        type="button"
        :disabled="!canJoin"
        @click="join"
      >
        <BwIcon :name="canJoin ? 'video' : 'lock'" :size="19" :stroke-width="1.9" />
        {{ uz.dashboard.join }}
      </button>
      <span class="next__caption" :class="{ 'is-open': canJoin }">{{ caption }}</span>
    </div>
  </section>
</template>

<style scoped>
.next {
  background: var(--ink);
  border-radius: 20px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.next__blob {
  position: absolute;
  border-radius: 50%;
}

.next__blob--1 {
  width: 150px;
  height: 150px;
  background: var(--layer-green-22);
  top: -70px;
  right: -30px;
}

.next__blob--2 {
  display: none;
}

.next__body {
  position: relative;
}

.next__tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--green-300);
  background: var(--layer-green-16);
  padding: 5px 10px;
  border-radius: 99px;
}

.next__title {
  margin: 12px 0 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--white);
}

.next__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 11px;
}

.next__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--gray-3);
}

.next__meta-item :deep(.bw-icon) {
  color: var(--green-300);
}

/* The phone card merges date and time onto one line; desktop splits them. */
.next__meta-item--split {
  display: none;
}

.next__action {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
}

.next__join {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-join-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.next__join:hover:not(:disabled) {
  background: var(--green-dark);
}

.next__join:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 2px;
}

.next__join:disabled {
  background: var(--layer-w-10);
  color: var(--gray);
  box-shadow: none;
  cursor: not-allowed;
}

.next__caption {
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--gray);
}

.next__caption.is-open {
  color: var(--green-300);
}

@media (min-width: 1024px) {
  .next {
    border-radius: 22px;
    padding: 24px;
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .next__blob--1 {
    width: 200px;
    height: 200px;
    top: -80px;
    right: 60px;
  }

  .next__blob--2 {
    display: block;
    width: 150px;
    height: 150px;
    background: var(--layer-orange-14);
    bottom: -70px;
    right: -30px;
  }

  .next__body {
    flex: 1;
    min-width: 260px;
  }

  .next__tag {
    font-size: 11.5px;
    letter-spacing: 0.08em;
    padding: 5px 11px;
  }

  .next__title {
    margin-top: 13px;
    font-size: 22px;
    letter-spacing: -0.01em;
  }

  .next__meta {
    flex-direction: row;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .next__meta-item {
    gap: 7px;
    font-size: 14px;
  }

  .next__meta-item--wide {
    display: none;
  }

  .next__meta-item--split {
    display: inline-flex;
  }

  .next__action {
    min-width: 220px;
    margin-top: 0;
  }

  .next__join {
    height: 54px;
    padding: 0 26px;
    border-radius: 13px;
    font-size: 16px;
    box-shadow: var(--sh-join);
  }
}
</style>
