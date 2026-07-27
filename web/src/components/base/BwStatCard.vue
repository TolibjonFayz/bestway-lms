<script setup>
import { computed } from 'vue'
import BwCard from './BwCard.vue'
import BwIcon from './BwIcon.vue'
import BwIconTile from './BwIconTile.vue'

const props = defineProps({
  icon: { type: String, required: true },
  tone: {
    type: String,
    default: 'green-mid',
    validator: (v) => ['green-mid', 'orange', 'amber', 'muted'].includes(v),
  },
  value: { type: [String, Number], required: true },
  /* "%" hugs the number; a word like "kun" gets a space and its own weight. */
  unit: { type: String, default: '' },
  label: { type: String, required: true },
  /* Small green chip in the top-right, e.g. "+120". */
  delta: { type: String, default: '' },
})

const symbolUnit = computed(() => props.unit === '%')
</script>

<template>
  <BwCard variant="stat" class="bw-stat">
    <div class="bw-stat__top">
      <BwIconTile :size="46" :radius="13" :tone="tone">
        <BwIcon :name="icon" :size="24" />
      </BwIconTile>
      <span v-if="delta" class="bw-stat__delta">{{ delta }}</span>
    </div>

    <div class="bw-stat__value bw-nums">
      {{ value }}<span
        v-if="unit"
        class="bw-stat__unit"
        :class="symbolUnit ? 'bw-stat__unit--symbol' : 'bw-stat__unit--word'"
      >{{ symbolUnit ? unit : ` ${unit}` }}</span>
    </div>
    <div class="bw-stat__label">{{ label }}</div>
  </BwCard>
</template>

<style scoped>
.bw-stat__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.bw-stat__delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
  font-size: 12px;
  color: var(--green-dark);
  background: var(--green-mid);
  padding: 4px 8px;
  border-radius: 99px;
}

.bw-stat__value {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-top: 16px;
  line-height: 1;
}

.bw-stat__unit {
  color: var(--gray-2);
  white-space: pre;
}

.bw-stat__unit--symbol {
  font-size: 20px;
}

.bw-stat__unit--word {
  font-size: 16px;
  font-weight: 600;
}

.bw-stat__label {
  font-size: 14px;
  color: var(--gray);
  font-weight: 500;
  margin-top: 4px;
}
</style>
