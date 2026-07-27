<script setup>
import SectionAvatars from './sections/SectionAvatars.vue'
import SectionBadges from './sections/SectionBadges.vue'
import SectionButtons from './sections/SectionButtons.vue'
import SectionCards from './sections/SectionCards.vue'
import SectionColors from './sections/SectionColors.vue'
import SectionEmptyState from './sections/SectionEmptyState.vue'
import SectionForms from './sections/SectionForms.vue'
import SectionProgress from './sections/SectionProgress.vue'
import SectionSkeletons from './sections/SectionSkeletons.vue'
import SectionToasts from './sections/SectionToasts.vue'
import SectionTypography from './sections/SectionTypography.vue'
import uz from '@/locales/uz'
import ds from './dsCopy'

/* Dev-only fidelity harness for design/01-design-system.html. It is not part
   of the product; the router drops it from production builds. */
</script>

<template>
  <div class="ks">
    <header class="ks__header">
      <div class="ks__header-inner">
        <div class="ks__brand">
          <div class="ks__logo">
            <span class="ks__logo-letter">B</span>
            <span class="ks__logo-dot" />
          </div>
          <div class="ks__brand-text">
            <div class="ks__brand-name">{{ uz.brand.name }}</div>
            <div class="ks__brand-tagline">{{ uz.brand.tagline }}</div>
          </div>
        </div>
        <span class="ks__version">
          <span class="ks__version-dot" />{{ ds.version }}
        </span>
      </div>
    </header>

    <div class="ks__hero">
      <div class="ks__eyebrow">{{ ds.eyebrow }}</div>
      <h1 class="ks__title">{{ ds.title }}</h1>
      <p class="ks__lead">{{ ds.lead }}</p>
    </div>

    <main class="ks__main">
      <SectionColors />
      <SectionTypography />
      <SectionButtons />
      <SectionForms />
      <SectionCards />
      <SectionProgress />
      <SectionBadges />
      <SectionAvatars />
      <SectionEmptyState />
      <SectionToasts />
      <SectionSkeletons />

      <footer class="ks__footer">{{ ds.footer }}</footer>
    </main>
  </div>
</template>

<style scoped>
.ks {
  min-height: 100vh;
  background: var(--bg);
}

.ks__header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--surface-blur);
  backdrop-filter: saturate(1.4) blur(8px);
  border-bottom: 1px solid var(--line);
}

.ks__header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.ks__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ks__logo {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--sh-logo);
  flex: none;
}

.ks__logo-letter {
  color: var(--white);
  font-weight: 800;
  font-size: 24px;
  line-height: 1;
}

.ks__logo-dot {
  position: absolute;
  right: -4px;
  top: -4px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--orange);
  border: 3px solid var(--white);
}

.ks__brand-text {
  line-height: 1.1;
}

.ks__brand-name {
  font-weight: 800;
  font-size: 19px;
  color: var(--ink);
  letter-spacing: -0.02em;
}

.ks__brand-tagline {
  font-weight: 600;
  font-size: 10.5px;
  color: var(--green);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.ks__version {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  font-size: 12.5px;
  color: var(--green-dark);
  background: var(--green-mid);
  padding: 6px 12px;
  border-radius: 99px;
}

.ks__version-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
}

.ks__hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 52px 24px 8px;
}

.ks__eyebrow {
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 14px;
}

.ks__title {
  margin: 0;
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
  color: var(--ink);
  max-width: 760px;
  text-wrap: balance;
}

.ks__lead {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--gray);
  max-width: 620px;
  text-wrap: pretty;
}

.ks__main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 96px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.ks__footer {
  text-align: center;
  padding: 8px 0 0;
  color: var(--gray-2);
  font-size: 13px;
}

@media (max-width: 520px) {
  .ks__hero {
    padding: 36px 18px 8px;
  }

  .ks__title {
    font-size: 32px;
  }

  .ks__lead {
    font-size: 16px;
  }

  .ks__main {
    padding: 28px 18px 72px;
    gap: 20px;
  }

  .ks__header-inner {
    padding: 12px 18px;
  }
}
</style>
