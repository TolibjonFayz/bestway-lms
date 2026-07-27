<script setup>
import DsSection from '../DsSection.vue'
import ds from '../dsCopy'

const SCALE = [
  ['bw-display', ds.sample.displaySample, 'display', '48px · 800 · 1.05', 'Sahifa qahramoni, katta sonlar'],
  ['bw-h1', ds.sample.h1Sample, 'h1', '32px · 800 · 1.15', 'Ekran sarlavhasi'],
  ['bw-h2', ds.sample.unitTitle, 'h2', '24px · 700 · 1.25', 'Boʻlim sarlavhasi'],
  ['bw-h3', ds.sample.h3Sample, 'h3', '20px · 700 · 1.3', 'Karta sarlavhasi'],
  ['bw-body-lg', ds.sample.bodyLgSample, 'body-lg', '18px · 500 · 1.6', 'Yetakchi matn'],
  ['bw-body', ds.sample.bodySample, 'body', '16px · 400 · 1.6', 'Asosiy matn'],
  ['bw-caption', ds.sample.captionSample, 'caption', '13px · 500 · 1.4', 'Yordamchi yozuv'],
]

const WEIGHTS = [
  [400, 'Regular 400'],
  [500, 'Medium 500'],
  [600, 'SemiBold 600'],
  [700, 'Bold 700'],
  [800, 'ExtraBold 800'],
]
</script>

<template>
  <DsSection
    number="02"
    :title="ds.typography"
    gloss="Type scale"
    :note="ds.typographyNote"
    :head-space="20"
  >
    <div class="ds-type">
      <div v-for="[cls, sample, name, spec, use] in SCALE" :key="name" class="ds-type__row">
        <div class="ds-type__sample" :class="cls">{{ sample }}</div>
        <div class="ds-type__meta">
          <span class="ds-type__name">{{ name }}</span>
          <span class="ds-type__spec">{{ spec }}</span>
          <span class="ds-type__use">{{ use }}</span>
        </div>
      </div>
    </div>

    <div class="ds-weights">
      <span class="ds-weights__title">{{ ds.weights }}</span>
      <span
        v-for="[weight, name] in WEIGHTS"
        :key="weight"
        class="ds-weights__item"
        :style="{ fontWeight: weight }"
        >{{ name }}</span
      >
      <span class="ds-weights__item ds-weights__nums bw-nums"
        >0123456789 <span class="ds-weights__tag">tabular-nums</span></span
      >
    </div>
  </DsSection>
</template>

<style scoped>
.ds-type {
  display: flex;
  flex-direction: column;
}

.ds-type__row {
  display: flex;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
  padding: 18px 0;
  border-top: 1px solid var(--line-2);
}

.ds-type__row:last-child {
  border-bottom: 1px solid var(--line-2);
}

.ds-type__sample {
  flex: 1;
  min-width: 260px;
}

.ds-type__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
}

.ds-type__name {
  font: 700 13px/1 var(--font-mono);
  color: var(--green);
}

.ds-type__spec {
  font: 500 12.5px/1.4 var(--font-mono);
  color: var(--gray);
}

.ds-type__use {
  font-size: 12px;
  color: var(--gray-2);
}

.ds-weights {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  align-items: baseline;
}

.ds-weights__title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
}

.ds-weights__item {
  font-size: 17px;
  color: var(--ink);
}

.ds-weights__nums {
  font-weight: 800;
}

.ds-weights__tag {
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-2);
}
</style>
