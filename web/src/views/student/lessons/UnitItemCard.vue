<script setup>
import { computed } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  item: { type: Object, required: true },
})

defineEmits(['open'])

function clock(totalSeconds) {
  const minutes = Math.floor((totalSeconds ?? 0) / 60)
  const seconds = String((totalSeconds ?? 0) % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const test = computed(() => props.item.test)
/* Once a test has been marked the badge shows the score; before that it says
   the attempt has not started. */
const testScored = computed(() => test.value?.score !== null && test.value?.score !== undefined)
</script>

<template>
  <!-- Video -->
  <div
    v-if="item.type === 'video'"
    class="icard icard--row icard--clickable"
    role="button"
    tabindex="0"
    @click="$emit('open', item)"
    @keydown.enter.prevent="$emit('open', item)"
    @keydown.space.prevent="$emit('open', item)"
  >
    <div class="icard__thumb">
      <span class="icard__play"><BwIcon name="play" class="icard__play-icon" /></span>
      <span class="icard__duration">{{ clock(item.video?.durationSeconds) }}</span>
    </div>
    <div class="icard__body">
      <div class="icard__title">{{ uz.lessons.videoLesson }}</div>
      <span
        class="icard__badge"
        :class="item.video?.watched ? 'icard__badge--done' : 'icard__badge--muted'"
      >
        <BwIcon v-if="item.video?.watched" name="check" :size="12" :stroke-width="3" />
        {{ item.video?.watched ? uz.lessons.watched : uz.lessons.notWatched }}
      </span>
    </div>
  </div>

  <!-- Test -->
  <div v-else-if="item.type === 'test'" class="icard">
    <div class="icard__head">
      <span class="icard__tile icard__tile--muted"><BwIcon name="pencil" :size="19" /></span>
      <div class="icard__body">
        <div class="icard__title">{{ uz.itemTypes.test }}</div>
        <div class="icard__meta">
          {{ uz.lessons.questionCount.replace('{n}', test?.questionCount ?? 0) }}
        </div>
      </div>
      <span
        class="icard__score"
        :class="testScored ? 'icard__score--partial' : 'icard__score--none'"
      >
        {{ testScored ? `${test.score}%` : uz.lessons.notStarted }}
      </span>
    </div>
    <button class="icard__ghost" type="button" @click="$emit('open', item)">
      {{ testScored ? uz.lessons.retakeTest : uz.lessons.startTest }}
    </button>
  </div>

  <!-- Speaking -->
  <div v-else-if="item.type === 'speaking'" class="icard icard--row">
    <span class="icard__tile icard__tile--green"><BwIcon name="mic" :size="19" /></span>
    <div class="icard__body">
      <div class="icard__title">{{ uz.itemTypes.speaking }}</div>
      <div class="icard__meta icard__meta--wide">{{ uz.lessons.speakingHint }}</div>
    </div>
    <button class="icard__solid" type="button" @click="$emit('open', item)">
      {{ uz.lessons.recordAnswer }}
    </button>
  </div>
</template>

<style scoped>
.icard {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  padding: 14px;
}

.icard--clickable {
  cursor: pointer;
}

.icard--clickable:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.icard--row {
  display: flex;
  align-items: center;
  gap: 11px;
}

.icard__head {
  display: flex;
  align-items: center;
  gap: 11px;
}

.icard__thumb {
  position: relative;
  width: 80px;
  height: 58px;
  border-radius: 10px;
  background: var(--ink);
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icard__play {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--layer-w-94);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}

.icard__play-icon {
  width: 13px;
  height: 13px;
}

.icard__duration {
  position: absolute;
  bottom: 4px;
  right: 5px;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--white);
  background: var(--layer-black-55);
  padding: 1px 5px;
  border-radius: 4px;
}

.icard__tile {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.icard__tile--muted {
  background: var(--line-2);
  color: var(--gray);
}

.icard__tile--green {
  background: var(--green-pale);
  color: var(--green);
}

.icard__body {
  flex: 1;
  min-width: 0;
}

.icard__title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
}

.icard__meta {
  font-size: 12px;
  color: var(--gray);
}

/* The speaking hint only fits once the drawer is at its full width. */
.icard__meta--wide {
  display: none;
}

.icard__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 10.5px;
  padding: 3px 8px;
  border-radius: 99px;
  margin-top: 5px;
}

.icard__badge--done {
  color: var(--green-dark);
  background: var(--green-mid);
}

.icard__badge--muted {
  color: var(--gray);
  background: var(--line-2);
  font-weight: 600;
  font-size: 11px;
}

.icard__score {
  font-weight: 800;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 99px;
  flex: none;
}

.icard__score--partial {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.icard__score--none {
  color: var(--gray-2);
  background: var(--line-2);
  font-weight: 700;
  font-size: 12.5px;
}

.icard__ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: inherit;
  font-weight: 700;
  font-size: 13.5px;
  height: 40px;
  border-radius: 10px;
  background: var(--white);
  color: var(--green-dark);
  border: 1.5px solid var(--green);
  cursor: pointer;
  margin-top: 12px;
}

.icard__ghost:hover {
  background: var(--green-pale);
}

.icard__solid {
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  height: 38px;
  padding: 0 13px;
  border-radius: 9px;
  background: var(--green);
  color: var(--white);
  border: none;
  flex: none;
  cursor: pointer;
}

.icard__solid:hover {
  background: var(--green-dark);
}

.icard__ghost:focus-visible,
.icard__solid:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (min-width: 1024px) {
  .icard {
    border-radius: 18px;
    padding: 16px;
    box-shadow: var(--sh-sm);
  }

  .icard--row,
  .icard__head {
    gap: 14px;
  }

  .icard__thumb {
    width: 96px;
    height: 70px;
    border-radius: 12px;
  }

  .icard__play {
    width: 34px;
    height: 34px;
  }

  .icard__play-icon {
    width: 15px;
    height: 15px;
  }

  .icard__duration {
    bottom: 5px;
    right: 6px;
    font-size: 10.5px;
    padding: 2px 6px;
    border-radius: 5px;
  }

  .icard__tile {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .icard__title {
    font-size: 15.5px;
  }

  .icard__meta {
    font-size: 13px;
    font-weight: 500;
    margin-top: 2px;
  }

  .icard__meta--wide {
    display: block;
  }

  .icard__badge {
    font-size: 11.5px;
    padding: 4px 9px;
    gap: 5px;
    margin-top: 6px;
  }

  .icard__score {
    font-size: 14px;
    padding: 6px 12px;
  }

  .icard__ghost {
    font-size: 14.5px;
    height: 44px;
    border-radius: 11px;
    gap: 7px;
    margin-top: 14px;
  }

  .icard__solid {
    font-size: 13.5px;
    height: 42px;
    padding: 0 16px;
    border-radius: 11px;
    gap: 7px;
  }
}
</style>
