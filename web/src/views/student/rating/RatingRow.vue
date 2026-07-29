<script setup>
import BwAvatar from '@/components/base/BwAvatar.vue'
import { formatCount } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const props = defineProps({
  row: { type: Object, required: true },
  pinned: { type: Boolean, default: false },
})

const TONE_CYCLE = ['ink', 'ink-2', 'gray', 'orange', 'gray-2']

function toneFor(rank) {
  if (rank === 1) return 'green'
  if (rank === 2) return 'gray-2'
  if (rank === 3) return 'orange'
  return TONE_CYCLE[rank % TONE_CYCLE.length]
}
</script>

<template>
  <div class="rrow" :class="{ 'rrow--pinned': pinned }">
    <span class="rrow__rank">{{ row.rank }}</span>
    <BwAvatar
      :name="row.fullName"
      :size="pinned ? 38 : 36"
      :tone="pinned ? 'green' : toneFor(row.rank)"
    />
    <span class="rrow__name">
      <span class="rrow__name-full">{{ row.fullName }}</span>
      <span v-if="pinned" class="rrow__name-short">{{ uz.rating.you }}</span>
      <span v-if="pinned" class="rrow__you-badge">{{ uz.rating.you }}</span>
    </span>
    <span v-if="row.level" class="rrow__level" :class="{ 'rrow__level--pinned': pinned }">
      {{ row.level }}
    </span>
    <span class="rrow__points" :class="{ 'rrow__points--pinned': pinned }">
      {{ formatCount(row.points) }}
    </span>
  </div>
</template>

<style scoped>
.rrow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 12px;
}

.rrow__rank {
  width: 20px;
  flex: none;
  font-weight: 800;
  font-size: 13px;
  color: var(--gray-2);
  text-align: center;
}

.rrow__name {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rrow__name-short {
  display: none;
}

.rrow--pinned .rrow__name-full {
  display: none;
}

.rrow--pinned .rrow__name-short {
  display: inline;
  font-weight: 800;
}

.rrow__you-badge {
  display: none;
}

.rrow__level {
  display: none;
}

.rrow__points {
  font-weight: 800;
  font-size: 13px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.rrow--pinned {
  background: var(--green-pale);
  border: 1.5px solid var(--green);
}

.rrow--pinned .rrow__rank {
  color: var(--green-darker);
}

.rrow--pinned .rrow__points {
  color: var(--green-darker);
}

@media (min-width: 1024px) {
  .rrow {
    gap: 14px;
    padding: 11px 16px;
  }

  .rrow__rank {
    width: 26px;
    font-size: 14px;
  }

  .rrow__name {
    font-size: 14.5px;
  }

  .rrow--pinned .rrow__name-full {
    display: inline;
  }

  .rrow--pinned .rrow__name-short {
    display: none;
  }

  .rrow--pinned .rrow__you-badge {
    display: inline-flex;
    align-items: center;
    font-weight: 700;
    font-size: 11.5px;
    color: var(--green-dark);
    background: var(--green-mid);
    padding: 2px 8px;
    border-radius: 99px;
    margin-left: 6px;
  }

  .rrow__level {
    display: inline-flex;
    font-size: 12px;
    font-weight: 700;
    color: var(--green-dark);
    background: var(--green-mid);
    padding: 3px 9px;
    border-radius: 8px;
    flex: none;
  }

  .rrow__level--pinned {
    background: var(--white);
    border: 1px solid var(--green-soft);
  }

  .rrow__points {
    font-size: 14.5px;
  }

  .rrow--pinned .rrow__points {
    font-size: 15px;
  }
}
</style>
