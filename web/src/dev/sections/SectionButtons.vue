<script setup>
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import DsSpecimen from '../DsSpecimen.vue'
import uz from '@/locales/uz'
import ds from '../dsCopy'

const VARIANTS = [
  { name: 'primary', title: 'Primary', note: ds.primaryNote, label: uz.actions.start, tint: 'green' },
  { name: 'secondary', title: 'Secondary', note: ds.secondaryNote, label: uz.actions.details, tint: 'green' },
  { name: 'ghost', title: 'Ghost', note: ds.ghostNote, label: uz.actions.cancel, tint: 'green' },
  { name: 'danger', title: 'Danger', note: ds.dangerNote, label: uz.actions.delete, tint: 'danger' },
]

/* `force` drives BwButton's data-force hook so hover and active render
   statically, exactly as the mockup draws them. */
const STATES = [
  { caption: 'Default', force: null },
  { caption: 'Hover', force: 'hover' },
  { caption: 'Active', force: 'active' },
  { caption: 'Disabled', force: null, disabled: true },
  { caption: 'Loading', force: null, loading: true },
]

const SIZES = [
  { size: 'sm', caption: 'sm · 40' },
  { size: 'md', caption: 'md · 48' },
  { size: 'lg', caption: 'lg · 56' },
]
</script>

<template>
  <DsSection number="03" :title="ds.buttons" gloss="Buttons" :head-space="22">
    <template #note>
      {{ ds.buttonsNoteLead }}
      <span class="ds-buttons__token">--green</span>
      {{ ds.buttonsNoteTail }}
    </template>

    <div class="ds-buttons">
      <div
        v-for="variant in VARIANTS"
        :key="variant.name"
        class="ds-buttons__panel"
        :class="`ds-buttons__panel--${variant.tint}`"
      >
        <div class="ds-buttons__panel-title">
          {{ variant.title }}
          <span class="ds-buttons__panel-note">· {{ variant.note }}</span>
        </div>
        <div class="ds-buttons__row">
          <DsSpecimen v-for="state in STATES" :key="state.caption" :caption="state.caption">
            <BwButton
              :variant="variant.name"
              :data-force="state.force || undefined"
              :disabled="state.disabled"
              :loading="state.loading"
            >
              {{ state.loading ? uz.actions.loading : variant.label }}
            </BwButton>
          </DsSpecimen>
        </div>
      </div>
    </div>

    <div class="ds-buttons__foot">
      <div>
        <DsLabel>{{ ds.sizes }}</DsLabel>
        <div class="ds-buttons__sizes">
          <DsSpecimen v-for="item in SIZES" :key="item.size" :caption="item.caption">
            <BwButton :size="item.size">{{ uz.actions.start }}</BwButton>
          </DsSpecimen>
        </div>
      </div>
      <div>
        <DsLabel>{{ ds.live }}</DsLabel>
        <BwButton size="lg">
          {{ uz.actions.continue }}
          <template #trailing><BwIcon name="arrow-right" :size="20" /></template>
        </BwButton>
      </div>
    </div>
  </DsSection>
</template>

<style scoped>
.ds-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.ds-buttons__panel {
  border: 1px solid var(--line-2);
  border-radius: 16px;
  padding: 20px;
}

.ds-buttons__panel--green {
  background: var(--tint-green);
}

.ds-buttons__panel--danger {
  background: var(--tint-danger);
}

.ds-buttons__panel-title {
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
  margin-bottom: 18px;
}

.ds-buttons__panel-note {
  color: var(--gray-2);
  font-weight: 500;
  font-size: 13px;
}

.ds-buttons__row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 22px;
  align-items: flex-start;
}

.ds-buttons__token {
  color: var(--green);
  font-weight: 600;
}

.ds-buttons__foot {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: flex-end;
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px solid var(--line-2);
}

.ds-buttons__sizes {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}
</style>
