<script setup>
import BwBadge from './BwBadge.vue'
import BwButton from './BwButton.vue'
import BwCard from './BwCard.vue'
import BwIcon from './BwIcon.vue'
import BwIconTile from './BwIconTile.vue'
import BwProgressBar from './BwProgressBar.vue'
import uz from '@/locales/uz'

defineProps({
  icon: { type: String, default: 'book-open' },
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  status: {
    type: String,
    default: 'progress',
    validator: (v) => ['done', 'progress', 'todo', 'new'].includes(v),
  },
  statusLabel: { type: String, default: '' },
  level: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  actionLabel: { type: String, default: '' },
})

defineEmits(['action'])
</script>

<template>
  <BwCard variant="lesson" class="bw-lesson">
    <BwIconTile :size="60" :radius="15" tone="green">
      <BwIcon :name="icon" :size="30" />
    </BwIconTile>

    <div class="bw-lesson__body">
      <div class="bw-lesson__tags">
        <BwBadge :variant="status" size="xs">{{ statusLabel }}</BwBadge>
        <BwBadge v-if="level" variant="level-active" size="sm">{{ level }}</BwBadge>
      </div>
      <div class="bw-lesson__title">{{ title }}</div>
      <div v-if="meta" class="bw-lesson__meta">{{ meta }}</div>
      <div class="bw-lesson__progress">
        <BwProgressBar :value="progress" :label="uz.progress.title" size="sm" />
      </div>
    </div>

    <BwButton class="bw-lesson__action" @click="$emit('action')">
      {{ actionLabel || uz.actions.continue }}
      <template #trailing><BwIcon name="arrow-right" :size="18" /></template>
    </BwButton>
  </BwCard>
</template>

<style scoped>
.bw-lesson__body {
  flex: 1;
  min-width: 220px;
}

.bw-lesson__tags {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.bw-lesson__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.bw-lesson__meta {
  font-size: 13px;
  color: var(--gray);
  margin-top: 3px;
}

.bw-lesson__progress {
  margin-top: 14px;
}

/* The mockup's standalone md button pads to 22px; inside the card it sits
   at 20px, so reach past the button's own scope to reset it. */
.bw-lesson :deep(.bw-lesson__action) {
  flex: none;
  padding: 0 20px;
}
</style>
