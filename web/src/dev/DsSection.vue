<script setup>
import { useSlots } from 'vue'
import BwCard from '@/components/base/BwCard.vue'

/* Numbered panel that mirrors a section of design/01-design-system.html. */
const props = defineProps({
  number: { type: String, required: true },
  title: { type: String, required: true },
  gloss: { type: String, default: '' },
  note: { type: String, default: '' },
  /* The mockup varies the gap under each section head. */
  headSpace: { type: Number, default: 24 },
})

const slots = useSlots()
const hasNote = () => Boolean(props.note || slots.note)
</script>

<template>
  <BwCard variant="section" as="section">
    <div class="ds-section__head" :style="{ marginBottom: `${headSpace}px` }">
      <div class="ds-section__title-row">
        <span class="ds-section__num">{{ number }}</span>
        <h2 class="ds-section__title">{{ title }}</h2>
        <span v-if="gloss" class="ds-section__gloss">{{ gloss }}</span>
      </div>
      <p v-if="hasNote()" class="ds-section__note">
        <slot name="note">{{ note }}</slot>
      </p>
    </div>
    <slot />
  </BwCard>
</template>

<style scoped>
.ds-section__title-row {
  display: flex;
  align-items: center;
  gap: 13px;
  flex-wrap: wrap;
}

.ds-section__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 28px;
  padding: 0 9px;
  font-weight: 800;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--green-dark);
  background: var(--green-mid);
  border-radius: 9px;
}

.ds-section__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.ds-section__gloss {
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-2);
}

.ds-section__note {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--gray);
}
</style>
