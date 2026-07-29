<script setup>
import { computed } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  unit: { type: Object, required: true },
  level: { type: String, default: '' },
})

defineEmits(['continue'])

/* Course label on the thumbnail: "IELTS · B1". The unit's own item list drives
   the chips, so a maths unit simply has no vocabulary chip — never assume the
   four types exist. */
const badge = computed(() => {
  const subject = props.unit.subject === 'ielts' ? 'IELTS' : props.unit.courseName
  return props.level ? `${subject} · ${props.level}` : subject
})

function chipTone(percent) {
  if (percent >= 100) return 'done'
  if (percent > 0) return 'partial'
  return 'todo'
}

function chipLabel(item) {
  const name = uz.itemTypes[item.type] ?? item.title
  return item.percent >= 100 ? name : `${name} · ${item.percent}%`
}
</script>

<template>
  <div class="cont">
    <div class="cont__top">
      <div class="cont__thumb">
        <span class="cont__thumb-blob" />
        <span class="cont__play">
          <BwIcon name="play" class="cont__play-icon" />
        </span>
        <span class="cont__thumb-badge">{{ badge }}</span>
      </div>

      <div class="cont__body">
        <div class="cont__badge">{{ badge }}</div>
        <div class="cont__title">{{ unit.title }}</div>

        <div class="cont__progress">
          <div class="cont__track">
            <div class="cont__fill" :style="{ width: `${unit.percent}%` }" />
          </div>
          <span class="cont__percent bw-nums">{{ unit.percent }}%</span>
        </div>

        <div class="cont__chips">
          <span
            v-for="item in unit.items"
            :key="item.id"
            class="cont__chip"
            :class="`cont__chip--${chipTone(item.percent)}`"
          >
            {{ chipLabel(item) }}
            <BwIcon
              v-if="item.percent >= 100"
              name="check"
              :size="12"
              :stroke-width="3"
            />
          </span>
        </div>
      </div>
    </div>

    <button class="cont__cta" type="button" @click="$emit('continue')">
      {{ uz.actions.continue }}
      <BwIcon name="arrow-right" :size="17" :stroke-width="1.9" />
    </button>
  </div>
</template>

<style scoped>
.cont {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 14px;
}

.cont__top {
  display: flex;
  gap: 13px;
  align-items: center;
}

.cont__thumb {
  position: relative;
  width: 88px;
  height: 70px;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--green-mid), var(--green-soft));
  flex: none;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cont__thumb-blob {
  display: none;
}

.cont__play {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--white);
  box-shadow: var(--sh-thumb-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
}

.cont__play-icon {
  width: 18px;
  height: 18px;
}

/* The thumbnail's own label only appears once there is room for it. */
.cont__thumb-badge {
  display: none;
}

.cont__body {
  flex: 1;
  min-width: 0;
}

.cont__badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--green-darker);
  background: var(--green-mid);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
}

.cont__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 6px;
  line-height: 1.25;
}

.cont__progress {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 13px;
}

.cont__track {
  flex: 1;
  height: 8px;
  background: var(--line-2);
  border-radius: 99px;
  overflow: hidden;
}

.cont__fill {
  height: 100%;
  background: var(--green);
  border-radius: 99px;
}

.cont__percent {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--green);
}

.cont__chips {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.cont__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  font-size: 11.5px;
  padding: 5px 9px;
  border-radius: 99px;
}

.cont__chip--done {
  color: var(--green-dark);
  background: var(--green-mid);
}

.cont__chip--partial {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.cont__chip--todo {
  color: var(--gray);
  background: var(--line-2);
}

.cont__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  height: 48px;
  border-radius: 11px;
  border: none;
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-continue-sm);
  cursor: pointer;
  margin-top: 14px;
  transition: background 0.15s;
}

.cont__cta:hover {
  background: var(--green-dark);
}

.cont__cta:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (min-width: 1024px) {
  .cont {
    border-radius: 20px;
    padding: 18px;
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .cont__top {
    display: contents;
  }

  .cont__thumb {
    width: 180px;
    height: 118px;
    border-radius: 15px;
  }

  .cont__thumb-blob {
    display: block;
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 0 100% 30% 100%;
    background: var(--layer-green-16);
    left: -30px;
    top: -20px;
  }

  .cont__play {
    width: 52px;
    height: 52px;
    box-shadow: var(--sh-thumb);
  }

  .cont__play-icon {
    width: 24px;
    height: 24px;
  }

  .cont__thumb-badge {
    display: block;
    position: absolute;
    bottom: 9px;
    left: 9px;
    font-size: 11px;
    font-weight: 700;
    color: var(--green-darker);
    background: var(--layer-w-85);
    padding: 3px 8px;
    border-radius: 7px;
  }

  .cont__body {
    min-width: 240px;
  }

  /* Desktop moves the label onto the thumbnail. */
  .cont__badge {
    display: none;
  }

  .cont__title {
    font-size: 19px;
    letter-spacing: -0.01em;
    margin-top: 0;
  }

  .cont__progress {
    gap: 10px;
    margin-top: 11px;
  }

  .cont__track {
    height: 9px;
  }

  .cont__percent {
    font-size: 13px;
  }

  .cont__chips {
    gap: 9px;
    margin-top: 14px;
  }

  .cont__chip {
    gap: 6px;
    font-size: 12.5px;
    padding: 6px 11px;
  }

  .cont__cta {
    width: auto;
    height: 50px;
    padding: 0 22px;
    border-radius: 12px;
    margin-top: 0;
    flex: none;
    box-shadow: var(--sh-continue);
  }
}
</style>
