<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

/* The "Unit elementlari" rail: jump between the items of the unit being
   studied. Renders whatever the unit actually has — a maths unit shows two. */
defineProps({
  items: { type: Array, required: true },
  activeItemId: { type: Number, default: null },
})

defineEmits(['select'])

const ICONS = {
  video: 'play',
  vocabulary: 'star',
  test: 'pencil',
  speaking: 'mic',
}

function meta(item) {
  if (item.type === 'video') return null
  return `${item.percent}%`
}
</script>

<template>
  <nav class="rail">
    <div class="rail__label">{{ uz.video.unitItems }}</div>
    <div class="rail__list">
      <button
        v-for="item in items"
        :key="item.id"
        class="rail__item"
        :class="{ 'is-active': item.id === activeItemId }"
        type="button"
        :aria-current="item.id === activeItemId ? 'true' : undefined"
        @click="$emit('select', item)"
      >
        <span class="rail__tile" :class="item.id === activeItemId ? 'rail__tile--active' : `rail__tile--${item.type}`">
          <BwIcon :name="ICONS[item.type] ?? 'play'" :size="17" />
        </span>
        <span class="rail__body">
          <span class="rail__title">{{ uz.itemTypes[item.type] ?? item.title }}</span>
          <span v-if="item.id === activeItemId" class="rail__sub rail__sub--active">
            {{ uz.video.watchingNow }}
          </span>
          <span v-else-if="meta(item)" class="rail__sub">{{ meta(item) }}</span>
        </span>
        <BwIcon
          v-if="item.percent >= 100 && item.id !== activeItemId"
          name="check"
          :size="16"
          :stroke-width="3"
          class="rail__done"
        />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.rail__label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 12px;
}

.rail__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rail__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 12px;
  background: var(--white);
  border: 1px solid var(--line-2);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition: border-color 0.15s, background 0.15s;
}

.rail__item:hover {
  border-color: var(--green-soft);
}

.rail__item:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.rail__item.is-active {
  background: var(--green-pale);
  border: 1.5px solid var(--green);
}

.rail__tile {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.rail__tile--active {
  background: var(--green);
  color: var(--white);
}

.rail__tile--video {
  background: var(--green-mid);
  color: var(--green);
}

.rail__tile--vocabulary {
  background: var(--amber-soft);
  color: var(--amber);
}

.rail__tile--test,
.rail__tile--speaking {
  background: var(--line-2);
  color: var(--gray);
}

.rail__body {
  flex: 1;
  min-width: 0;
}

.rail__title {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}

.rail__sub {
  display: block;
  font-size: 11.5px;
  color: var(--gray);
  font-weight: 600;
}

.rail__sub--active {
  color: var(--green-darker);
}

.rail__done {
  color: var(--green);
  flex: none;
}

@media (min-width: 1024px) {
  .rail__list {
    gap: 9px;
  }

  .rail__item {
    gap: 12px;
    padding: 13px 14px;
    border-radius: 14px;
  }

  .rail__tile {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .rail__title {
    font-size: 14px;
  }

  .rail__sub {
    font-size: 12px;
  }
}
</style>
