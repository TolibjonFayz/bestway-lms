<script setup>
import { computed } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  course: { type: Object, required: true },
})

/* Ring geometry: r40/stroke9 on desktop, r26/stroke7 on the phone. */
const dash = (r) => (2 * Math.PI * r).toFixed(1)
const offset = (r) =>
  (2 * Math.PI * r * (1 - props.course.percent / 100)).toFixed(1)

const unitsLabel = computed(() =>
  uz.lessons.unitsProgress
    .replace('{total}', props.course.unitCount)
    .replace('{done}', props.course.completedUnits),
)
</script>

<template>
  <RouterLink class="ccard" :to="`/lessons/${course.id}`">
    <div class="ccard__cover">
      <span class="ccard__cover-blob" />
      <BwIcon name="books" class="ccard__cover-icon" :stroke-width="1.6" />
    </div>

    <div class="ccard__body">
      <div class="ccard__name">{{ course.name }}</div>
      <div v-if="course.teacherName" class="ccard__teacher">
        <BwIcon name="user-outline" :size="16" />{{ course.teacherName }}
      </div>
      <div class="ccard__units">{{ unitsLabel }}</div>
    </div>

    <div class="ccard__ring">
      <svg class="ccard__ring-svg ccard__ring-svg--sm" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--line-2)" stroke-width="7" />
        <circle
          cx="32" cy="32" r="26" fill="none" stroke="var(--green)" stroke-width="7"
          stroke-linecap="round" :stroke-dasharray="dash(26)" :stroke-dashoffset="offset(26)"
        />
      </svg>
      <svg class="ccard__ring-svg ccard__ring-svg--lg" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="40" fill="none" stroke="var(--line-2)" stroke-width="9" />
        <circle
          cx="48" cy="48" r="40" fill="none" stroke="var(--green)" stroke-width="9"
          stroke-linecap="round" :stroke-dasharray="dash(40)" :stroke-dashoffset="offset(40)"
        />
      </svg>
      <span class="ccard__ring-value bw-nums">{{ course.percent }}%</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.ccard {
  display: block;
  background: var(--tint-green);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  padding: 16px;
  color: inherit;
}

.ccard:hover {
  color: inherit;
}

.ccard:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.ccard__cover {
  width: 100%;
  height: 100px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--green-mid), var(--green-soft));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green-darker);
  position: relative;
  overflow: hidden;
}

.ccard__cover-blob {
  display: none;
}

.ccard__cover-icon {
  position: relative;
  width: 32px;
  height: 32px;
}

.ccard__body {
  min-width: 0;
}

.ccard__name {
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.ccard__teacher {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gray);
  font-weight: 500;
  margin-top: 5px;
}

.ccard__teacher :deep(.bw-icon) {
  display: none;
}

.ccard__units {
  font-size: 12.5px;
  color: var(--gray-2);
  font-weight: 500;
  margin-top: 3px;
}

.ccard__ring {
  position: relative;
  width: 64px;
  height: 64px;
  flex: none;
}

.ccard__ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ccard__ring-svg--lg {
  display: none;
}

.ccard__ring-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

/* Phone: cover on top, then a row of text and ring. */
.ccard__body,
.ccard__ring {
  display: inline-block;
  vertical-align: middle;
}

@media (max-width: 1023px) {
  .ccard__body {
    width: calc(100% - 78px);
    margin-top: 14px;
  }

  .ccard__ring {
    margin-top: 14px;
    margin-left: 14px;
  }
}

@media (min-width: 1024px) {
  .ccard {
    border-radius: 20px;
    padding: 24px;
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: wrap;
  }

  .ccard__cover {
    width: 132px;
    height: 96px;
    border-radius: 16px;
    flex: none;
  }

  .ccard__cover-blob {
    display: block;
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 0 100% 30% 100%;
    background: var(--layer-green-16);
    left: -24px;
    top: -16px;
  }

  .ccard__cover-icon {
    width: 34px;
    height: 34px;
  }

  .ccard__body {
    flex: 1;
    min-width: 220px;
    display: block;
    width: auto;
    margin-top: 0;
  }

  .ccard__name {
    font-size: 20px;
    letter-spacing: -0.01em;
  }

  .ccard__teacher {
    font-size: 14px;
    margin-top: 8px;
  }

  .ccard__teacher :deep(.bw-icon) {
    display: block;
  }

  .ccard__units {
    font-size: 14px;
    color: var(--gray);
    margin-top: 6px;
  }

  .ccard__ring {
    width: 96px;
    height: 96px;
    margin: 0;
  }

  .ccard__ring-svg--sm {
    display: none;
  }

  .ccard__ring-svg--lg {
    display: block;
  }

  .ccard__ring-value {
    font-size: 20px;
  }
}
</style>
