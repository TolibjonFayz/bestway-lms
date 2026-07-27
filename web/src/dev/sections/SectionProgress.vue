<script setup>
import BwProgressBar from '@/components/base/BwProgressBar.vue'
import BwProgressRing from '@/components/base/BwProgressRing.vue'
import BwStepIndicator from '@/components/base/BwStepIndicator.vue'
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import uz from '@/locales/uz'
import ds from '../dsCopy'

const BARS = [
  [uz.progress.started, 25],
  [uz.progress.inProgress, 60],
  [uz.progress.done, 100],
]
</script>

<template>
  <DsSection
    number="06"
    :title="ds.progressSection"
    gloss="Progress"
    :note="ds.progressNote"
  >
    <div class="ds-progress">
      <div>
        <DsLabel :space="18">{{ ds.linearBar }}</DsLabel>
        <div class="ds-progress__bars">
          <BwProgressBar
            v-for="[label, value] in BARS"
            :key="label"
            :label="label"
            :value="value"
          />
        </div>
      </div>

      <div>
        <DsLabel :space="18">{{ ds.circularRing }}</DsLabel>
        <div class="ds-progress__rings">
          <BwProgressRing :value="68" :caption="ds.sample.unitCaption" />
          <BwProgressRing
            :value="100"
            :size="100"
            :stroke-width="10"
            check-when-complete
            :label="uz.progress.done"
          />
        </div>
      </div>

      <div>
        <DsLabel :space="18">{{ ds.stepIndicator }}</DsLabel>
        <BwStepIndicator
          class="ds-progress__steps"
          :total="5"
          :current="3"
          :label="uz.progress.title"
        />
        <BwStepIndicator
          variant="segments"
          :total="5"
          :current="3"
          :label="uz.progress.segmented"
        />
      </div>
    </div>
  </DsSection>
</template>

<style scoped>
.ds-progress {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
  align-items: start;
}

.ds-progress__bars {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ds-progress__rings {
  display: flex;
  gap: 28px;
  align-items: center;
  flex-wrap: wrap;
}

.ds-progress__steps {
  margin-bottom: 22px;
}
</style>
