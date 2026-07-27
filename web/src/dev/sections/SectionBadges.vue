<script setup>
import BwBadge from '@/components/base/BwBadge.vue'
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import uz from '@/locales/uz'
import ds from '../dsCopy'

const STATUSES = [
  ['done', uz.status.done],
  ['progress', uz.status.inProgress],
  ['todo', uz.status.notStarted],
  ['new', uz.status.new],
]

const LEVELS = [
  ['level', 'A1'],
  ['level', 'A2'],
  ['level-current', `B1 · ${uz.levels.current}`],
  ['level-active', 'B2'],
  ['level-solid', 'IELTS'],
]
</script>

<template>
  <DsSection number="07" :title="ds.badges" gloss="Badges & chips" :note="ds.badgesNote">
    <DsLabel>{{ ds.statusGroup }}</DsLabel>
    <div class="ds-badges__row ds-badges__row--gap12">
      <BwBadge v-for="[variant, label] in STATUSES" :key="label" :variant="variant">
        {{ label }}
      </BwBadge>
    </div>

    <DsLabel>{{ ds.levelGroup }}</DsLabel>
    <div class="ds-badges__row">
      <BwBadge v-for="[variant, label] in LEVELS" :key="label" :variant="variant">
        {{ label }}
      </BwBadge>
    </div>
  </DsSection>
</template>

<style scoped>
.ds-badges__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.ds-badges__row--gap12 {
  gap: 12px;
  margin-bottom: 26px;
}
</style>
