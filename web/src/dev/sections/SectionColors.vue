<script setup>
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import ds from '../dsCopy'

const GROUPS = [
  {
    title: ds.groupGreen,
    tint: 'green',
    swatches: [
      ['--green', '#16a34a', 'Asosiy amal, faol nav'],
      ['--green-dark', '#15803d', 'Hover holati'],
      ['--green-darker', '#166534', 'Bosilgan / toʻq matn'],
      ['--green-light', '#22c55e', 'Urgʻu — oq matnsiz'],
      ['--green-soft', '#bbf7d0', 'Progress trek, chegara'],
      ['--green-mid', '#dcfce7', 'Chip fon (Yakunlangan)'],
      ['--green-pale', '#f0fdf4', 'Tusli yuza fon'],
    ],
  },
  {
    title: ds.groupAccent,
    tint: 'orange',
    swatches: [
      ['--orange', '#ea8c3c', 'Tangalar, streak'],
      ['--amber', '#f5b301', 'Yulduz, ball (score)'],
    ],
  },
  {
    title: ds.groupInk,
    tint: 'slate',
    swatches: [
      ['--ink', '#0f172a', 'Sarlavha, toʻq panel'],
      ['--ink-2', '#1e293b', 'Ikkilamchi toʻq'],
      ['--gray', '#64748b', 'Ikkilamchi matn'],
      ['--gray-2', '#94a3b8', 'Placeholder, belgi'],
      ['--bg', '#f8fafc', 'Sahifa foni'],
      ['--line', '#e2e8f0', 'Chegaralar'],
      ['--line-2', '#f1f5f9', 'Ajratgich, trek'],
      ['--white', '#ffffff', 'Karta yuzasi'],
    ],
  },
  {
    title: ds.groupSemantic,
    tint: 'danger',
    swatches: [['--danger', '#ef4444', 'Xatolik, oʻchirish']],
  },
]

const RADII = [
  ['--r-sm 10', '10px'],
  ['--r-md 16', '16px'],
  ['--r-lg 22', '22px'],
  ['--r-xl 28', '28px'],
]

const SHADOWS = [
  ['--sh-sm', 'var(--sh-sm)', 'var(--white)'],
  ['--sh-md', 'var(--sh-md)', 'var(--white)'],
  ['--sh-lg', 'var(--sh-lg)', 'var(--white)'],
  ['--sh-green', 'var(--sh-green)', 'var(--green)'],
]
</script>

<template>
  <DsSection
    number="01"
    :title="ds.colors"
    gloss="Colors"
    :note="ds.colorsNote"
    :head-space="26"
  >
    <div class="ds-colors">
      <template v-for="group in GROUPS" :key="group.title">
        <DsLabel full :space="0" class="ds-colors__group">{{ group.title }}</DsLabel>
        <div
          v-for="[token, hex, use] in group.swatches"
          :key="token"
          class="ds-swatch"
          :class="`ds-swatch--${group.tint}`"
        >
          <div class="ds-swatch__chip" :style="{ background: `var(${token})` }" />
          <div class="ds-swatch__body">
            <div class="ds-swatch__token">{{ token }}</div>
            <div class="ds-swatch__hex">{{ hex }}</div>
            <div class="ds-swatch__use">{{ use }}</div>
          </div>
        </div>
      </template>
    </div>

    <div class="ds-shapes">
      <DsLabel full :space="2">{{ ds.groupRadius }}</DsLabel>
      <div v-for="[name, radius] in RADII" :key="name" class="ds-shape">
        <div class="ds-shape__box" :style="{ borderRadius: radius }" />
        <span class="ds-shape__name">{{ name }}</span>
      </div>
      <div v-for="[name, shadow, bg] in SHADOWS" :key="name" class="ds-shape">
        <div class="ds-shape__box ds-shape__box--shadow" :style="{ boxShadow: shadow, background: bg }" />
        <span class="ds-shape__name">{{ name }}</span>
      </div>
    </div>
  </DsSection>
</template>

<style scoped>
.ds-colors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
  gap: 12px;
}

.ds-colors__group {
  margin-top: 2px;
}

.ds-colors__group:not(:first-child) {
  margin-top: 14px;
}

.ds-swatch {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--line-2);
  border-radius: 14px;
}

.ds-swatch--green {
  background: var(--tint-green);
}
.ds-swatch--orange {
  background: var(--tint-orange);
}
.ds-swatch--slate {
  background: var(--tint-slate);
}
.ds-swatch--danger {
  background: var(--tint-danger);
}

.ds-swatch__chip {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  box-shadow: var(--sh-inset);
  flex: none;
}

.ds-swatch__body {
  min-width: 0;
}

.ds-swatch__token {
  font: 600 13px/1 var(--font-mono);
  color: var(--ink);
}

.ds-swatch__hex {
  font: 500 12px/1 var(--font-mono);
  color: var(--gray);
  margin-top: 5px;
}

.ds-swatch__use {
  font-size: 11.5px;
  color: var(--gray-2);
  margin-top: 6px;
  line-height: 1.35;
}

.ds-shapes {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--line-2);
}

.ds-shape {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg);
  border-radius: 10px;
}

.ds-shape__box {
  width: 38px;
  height: 38px;
  background: var(--white);
  border: 1.5px solid var(--line);
}

.ds-shape__box--shadow {
  border: none;
  border-radius: 12px;
}

.ds-shape__name {
  font: 500 12px var(--font-mono);
  color: var(--gray);
}
</style>
