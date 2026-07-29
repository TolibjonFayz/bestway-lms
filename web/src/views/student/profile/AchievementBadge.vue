<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  achievement: { type: Object, required: true },
})

const TONE_BG = { orange: 'var(--orange-pale)', green: 'var(--green-pale)', amber: 'var(--amber-soft)' }
const TONE_TILE = { orange: 'var(--orange)', green: 'var(--green)', amber: 'var(--amber)' }

const bg = props.achievement.earned ? TONE_BG[props.achievement.tone] : 'var(--bg)'
const tile = props.achievement.earned ? TONE_TILE[props.achievement.tone] : 'var(--line)'
const icon = props.achievement.earned ? props.achievement.icon : 'lock-unit'
</script>

<template>
  <div class="abadge" :class="{ 'is-locked': !achievement.earned }" :style="{ background: bg }">
    <div class="abadge__tile" :style="{ background: tile }">
      <BwIcon :name="icon" :size="22" :stroke-width="1.85" />
    </div>
    <div class="abadge__title" :class="{ 'abadge__title--locked': !achievement.earned }">
      {{ uz.profile.achievement[achievement.id] }}
    </div>
  </div>
</template>

<style scoped>
.abadge {
  border: 1px solid var(--line-2);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
}

.abadge.is-locked {
  opacity: 0.75;
}

.abadge__tile {
  width: 38px;
  height: 38px;
  margin: 0 auto;
  border-radius: 11px;
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
}

.is-locked .abadge__tile {
  color: var(--gray-2);
}

.abadge__title {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 8px;
  line-height: 1.25;
}

.abadge__title--locked {
  color: var(--gray);
}

@media (min-width: 1024px) {
  .abadge {
    border-radius: 16px;
    padding: 16px;
  }

  .abadge__tile {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  .abadge__title {
    font-size: 13px;
    margin-top: 10px;
  }
}
</style>
