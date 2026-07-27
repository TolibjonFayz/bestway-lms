<script setup>
import { computed } from 'vue'
import BwIcon from './BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  count: { type: Number, default: 0 },
  /* Unread-but-uncounted marker, used when the exact number is unknown. */
  dot: { type: Boolean, default: false },
})

defineEmits(['click'])

const showCount = computed(() => props.count > 0)
const display = computed(() => (props.count > 99 ? '99+' : String(props.count)))
const ariaLabel = computed(() =>
  showCount.value
    ? uz.a11y.notificationsWithCount.replace('{n}', props.count)
    : uz.a11y.notifications,
)
</script>

<template>
  <button class="bw-bell" type="button" :aria-label="ariaLabel" @click="$emit('click', $event)">
    <BwIcon name="bell" :size="22" />
    <span v-if="showCount" class="bw-bell__count bw-nums">{{ display }}</span>
    <span v-else-if="dot" class="bw-bell__dot" />
  </button>
</template>

<style scoped>
.bw-bell {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.bw-bell:hover {
  background: var(--bg);
}

.bw-bell:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.bw-bell__dot {
  position: absolute;
  top: 9px;
  right: 11px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--orange);
  border: 2px solid var(--white);
}

.bw-bell__count {
  position: absolute;
  top: 5px;
  right: 5px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 99px;
  background: var(--danger);
  color: var(--white);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--white);
}
</style>
