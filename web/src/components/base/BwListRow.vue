<script setup>
import BwIcon from './BwIcon.vue'
import BwIconTile from './BwIconTile.vue'

defineProps({
  icon: { type: String, required: true },
  tone: {
    type: String,
    default: 'green',
    validator: (v) => ['green', 'orange', 'muted'].includes(v),
  },
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  /* Adds the trailing chevron the mockup gives to actionable rows. */
  chevron: { type: Boolean, default: false },
})
</script>

<template>
  <div class="bw-row">
    <BwIconTile :size="44" :radius="12" :tone="tone">
      <BwIcon :name="icon" :size="22" />
    </BwIconTile>

    <div class="bw-row__body">
      <div class="bw-row__title">{{ title }}</div>
      <div v-if="meta" class="bw-row__meta">{{ meta }}</div>
    </div>

    <span v-if="$slots.trailing" class="bw-row__trailing">
      <slot name="trailing" />
    </span>

    <span v-if="chevron" class="bw-row__chevron">
      <BwIcon name="chevron-right" :size="20" />
    </span>
  </div>
</template>

<style scoped>
.bw-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line-2);
}

.bw-row:last-child {
  border-bottom: none;
}

.bw-row__body {
  flex: 1;
  min-width: 0;
}

.bw-row__title {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--ink);
}

.bw-row__meta {
  font-size: 13px;
  color: var(--gray-2);
  margin-top: 2px;
}

.bw-row__trailing {
  display: flex;
  align-items: center;
  flex: none;
}

.bw-row__chevron {
  color: var(--gray-3);
  display: flex;
}

/* The mockup only covers desktop. On a phone the title needs the whole line,
   so the status chip drops below it, aligned with the text column. */
@media (max-width: 420px) {
  .bw-row {
    flex-wrap: wrap;
    row-gap: 12px;
  }

  .bw-row__body {
    flex: 1 1 calc(100% - 58px);
  }

  .bw-row__trailing {
    margin-left: 58px;
  }
}
</style>
