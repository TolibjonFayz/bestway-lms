<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  unit: { type: Object, required: true },
  isLast: { type: Boolean, default: false },
})

defineEmits(['open'])

const tipVisible = ref(false)

/* The node shows a tick when finished, the unit's own number while it is the
   current one, and a padlock when it is not open yet. */
function chipLabel(item) {
  const name = uz.itemTypes[item.type] ?? item.title
  if (props.unit.locked) return name
  if (item.type === 'test') return `${name} ${item.percent}%`
  return `${name} ${item.percent}%`
}

function chipTone(item) {
  if (props.unit.locked) return 'locked'
  if (item.percent >= 100) return 'done'
  if (item.percent > 0) return 'partial'
  return 'todo'
}
</script>

<template>
  <div class="urow">
    <div class="urow__rail">
      <div class="urow__node" :class="`urow__node--${unit.status}`">
        <BwIcon v-if="unit.status === 'completed'" name="check" :stroke-width="3" class="urow__node-icon" />
        <BwIcon v-else-if="unit.locked" name="lock-unit" :stroke-width="1.9" class="urow__node-icon urow__node-icon--lock" />
        <template v-else>{{ unit.code.replace(/^Unit\s*/i, '') }}</template>
      </div>
      <div v-if="!isLast" class="urow__line" :class="{ 'is-done': unit.status === 'completed' }" />
    </div>

    <div class="urow__body" :class="{ 'is-last': isLast }">
      <!-- Locked units are inert: not a button, not focusable, not clickable. -->
      <div
        v-if="unit.locked"
        class="urow__wrap"
        @mouseenter="tipVisible = true"
        @mouseleave="tipVisible = false"
      >
        <div class="urow__card urow__card--locked" :title="uz.lessons.lockedHint">
          <div class="urow__head">
            <div class="urow__head-text">
              <div class="urow__code">{{ unit.code }}</div>
              <div class="urow__name">{{ unit.title }}</div>
            </div>
            <BwIcon name="lock-unit" :size="20" :stroke-width="1.9" class="urow__head-lock" />
          </div>
          <div class="urow__chips">
            <span
              v-for="item in unit.items"
              :key="item.id"
              class="urow__chip urow__chip--locked"
            >
              {{ uz.itemTypes[item.type] ?? item.title }}
            </span>
          </div>
          <div class="urow__locked-hint">{{ uz.lessons.lockedHint }}</div>
        </div>
        <div v-if="tipVisible" class="urow__tip" role="tooltip">
          {{ uz.lessons.lockedHint }}
          <span class="urow__tip-arrow" />
        </div>
      </div>

      <button
        v-else
        class="urow__card"
        :class="{ 'urow__card--current': unit.status === 'current' }"
        type="button"
        @click="$emit('open', unit)"
      >
        <div class="urow__head">
          <div class="urow__head-text">
            <div class="urow__code" :class="{ 'is-current': unit.status === 'current' }">
              {{ unit.code }}<template v-if="unit.status === 'current'"> · {{ uz.lessons.current }}</template>
            </div>
            <div class="urow__name">{{ unit.title }}</div>
          </div>
          <div class="urow__score">
            <div class="urow__percent bw-nums">{{ unit.percent }}%</div>
            <div class="urow__done" :class="{ 'is-current': unit.status === 'current' }">
              {{ uz.lessons.done }}
            </div>
          </div>
        </div>
        <div class="urow__chips">
          <span
            v-for="item in unit.items"
            :key="item.id"
            class="urow__chip"
            :class="`urow__chip--${chipTone(item)}`"
          >
            {{ chipLabel(item) }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.urow {
  display: flex;
  gap: 16px;
}

.urow__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 36px;
  flex: none;
}

.urow__node {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  font-weight: 800;
  font-size: 11px;
  position: relative;
}

.urow__node-icon {
  width: 16px;
  height: 16px;
}

.urow__node-icon--lock {
  width: 15px;
  height: 15px;
}

.urow__node--completed {
  background: var(--green);
  color: var(--white);
}

.urow__node--current,
.urow__node--available {
  background: var(--green-pale);
  color: var(--green);
  border: 2px solid var(--green);
}

/* The halo marks where the student is; it never appears on other rows. */
.urow__node--current::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid var(--green);
  animation: bw-pulse 1.8s ease-out infinite;
}

.urow__node--locked {
  background: var(--line-2);
  color: var(--gray-2);
}

.urow__line {
  width: 3px;
  flex: 1;
  background: var(--line);
  margin-top: 2px;
  border-radius: 2px;
}

.urow__line.is-done {
  background: var(--green);
}

.urow__body {
  flex: 1;
  min-width: 0;
  padding-bottom: 18px;
}

.urow__body.is-last {
  padding-bottom: 0;
}

.urow__wrap {
  position: relative;
}

.urow__card {
  display: block;
  width: 100%;
  text-align: left;
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 14px 16px;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.urow__card:hover {
  border-color: var(--green-soft);
  box-shadow: var(--sh-unit-hover);
}

.urow__card:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.urow__card--current {
  background: var(--green-pale);
  border: 2px solid var(--green);
  box-shadow: var(--sh-unit-current);
}

.urow__card--locked {
  background: var(--bg);
  border: 1px solid var(--line-2);
  box-shadow: none;
  opacity: 0.6;
  cursor: not-allowed;
}

.urow__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.urow__head-text {
  min-width: 0;
}

.urow__code {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.urow__code.is-current {
  color: var(--green-dark);
}

.urow__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 2px;
}

.urow__card--locked .urow__name {
  color: var(--gray);
}

.urow__head-lock {
  color: var(--gray-3);
  flex: none;
}

.urow__score {
  text-align: right;
  flex: none;
}

.urow__percent {
  font-size: 18px;
  font-weight: 800;
  color: var(--green);
  line-height: 1;
}

.urow__done {
  font-size: 11px;
  color: var(--gray-2);
  font-weight: 600;
  margin-top: 3px;
}

.urow__done.is-current {
  color: var(--green-darker);
}

.urow__chips {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.urow__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  font-size: 11.5px;
  padding: 5px 9px;
  border-radius: 99px;
}

.urow__chip--done {
  color: var(--green-dark);
  background: var(--green-mid);
}

.urow__chip--partial {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.urow__chip--todo,
.urow__chip--locked {
  color: var(--gray-2);
  background: var(--line-2);
}

/* On a phone the hover tooltip cannot fire, so the reason is written in. */
.urow__locked-hint {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-2);
  margin-top: 10px;
}

.urow__tip {
  display: none;
}

@media (min-width: 1024px) {
  .urow {
    gap: 20px;
  }

  .urow__rail {
    width: 44px;
  }

  .urow__node {
    width: 44px;
    height: 44px;
    font-size: 15px;
  }

  .urow__node-icon {
    width: 20px;
    height: 20px;
  }

  .urow__node-icon--lock {
    width: 18px;
    height: 18px;
  }

  .urow__node--completed {
    box-shadow: var(--sh-node);
  }

  .urow__node--current,
  .urow__node--available {
    border-width: 2.5px;
  }

  .urow__body {
    padding-bottom: 26px;
  }

  .urow__card {
    padding: 18px 20px;
  }

  .urow__code {
    font-size: 12.5px;
  }

  .urow__name {
    font-size: 17.5px;
    margin-top: 3px;
  }

  .urow__percent {
    font-size: 22px;
  }

  .urow__done {
    font-size: 11.5px;
  }

  .urow__chips {
    gap: 8px;
    margin-top: 14px;
  }

  .urow__chip {
    font-size: 12px;
    padding: 5px 10px;
  }

  /* Desktop has the hover tooltip the design draws, so drop the inline line. */
  .urow__locked-hint {
    display: none;
  }

  .urow__tip {
    display: block;
    position: absolute;
    left: 20px;
    top: -42px;
    background: var(--ink);
    color: var(--white);
    font-size: 12.5px;
    font-weight: 600;
    padding: 8px 13px;
    border-radius: 9px;
    white-space: nowrap;
    box-shadow: var(--sh-tooltip);
    z-index: 2;
  }

  .urow__tip-arrow {
    position: absolute;
    left: 22px;
    top: 100%;
    width: 9px;
    height: 9px;
    background: var(--ink);
    transform: rotate(45deg);
    margin-top: -5px;
  }
}
</style>
