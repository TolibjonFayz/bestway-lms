<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import LevelChip from './LevelChip.vue'
import OnboardingSteps from './OnboardingSteps.vue'
import { useAuthStore } from '@/stores/auth'
import uz from '@/locales/uz'

const router = useRouter()
const auth = useAuthStore()

const level = ref(auth.user?.level ?? 'B1')

const firstName = computed(() => auth.user?.fullName?.split(' ')[0] ?? '')
const welcome = computed(() => uz.onboarding.welcome.replace('{name}', firstName.value))
const steps = [
  uz.onboarding.stepLevel,
  uz.onboarding.stepGoal,
  uz.onboarding.stepStart,
]

/* Persisting the choice needs a users endpoint that stage 1 did not build, so
   for now confirming simply moves the student on to their dashboard. */
function submit() {
  router.push(auth.homeRoute)
}
</script>

<template>
  <div class="onboarding">
    <div class="onboarding__card">
      <aside class="onboarding__aside">
        <span class="onboarding__blob onboarding__blob--1" />
        <span class="onboarding__blob onboarding__blob--2" />
        <span class="onboarding__leaf onboarding__leaf--1" />
        <span class="onboarding__leaf onboarding__leaf--2" />

        <BrandMark
          class="onboarding__brand"
          :size="44"
          ring="var(--green-pale)"
          shadow="var(--sh-logo)"
          wordmark
          tagline
        />

        <div class="onboarding__pitch">
          <div class="onboarding__tagline">{{ uz.onboarding.tagline }}</div>
          <p class="onboarding__tagline-sub">{{ uz.onboarding.taglineSub }}</p>
        </div>
      </aside>

      <div class="onboarding__main">
        <h1 class="onboarding__title">{{ welcome }}</h1>
        <p class="onboarding__subtitle">{{ uz.onboarding.subtitle }}</p>

        <OnboardingSteps class="onboarding__steps" :steps="steps" :current="1" />

        <div class="onboarding__label">{{ uz.onboarding.levelLabel }}</div>
        <div
          class="onboarding__levels"
          role="radiogroup"
          :aria-label="uz.onboarding.levelLabel"
        >
          <LevelChip
            v-for="option in uz.onboarding.levels"
            :key="option.code"
            :name="option.name"
            :code="option.code"
            :selected="level === option.code"
            @select="level = option.code"
          />
        </div>

        <BwButton class="onboarding__cta" size="lg" block @click="submit">
          {{ uz.actions.continue }}
          <template #trailing><BwIcon name="arrow-right" :size="19" /></template>
        </BwButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  min-height: 100dvh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.onboarding__card {
  width: 100%;
  max-width: 960px;
  min-height: 600px;
  background: var(--white);
  border-radius: 26px;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.14),
    0 0 0 1px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  display: flex;
}

.onboarding__aside {
  width: 45%;
  background: var(--green-pale);
  position: relative;
  overflow: hidden;
  padding: 44px;
  display: flex;
  flex-direction: column;
}

.onboarding__blob,
.onboarding__leaf {
  position: absolute;
}

.onboarding__blob--1 {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: var(--green-mid);
  top: -70px;
  right: -60px;
}

.onboarding__blob--2 {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: var(--green-soft);
  opacity: 0.55;
  bottom: 60px;
  left: -40px;
}

.onboarding__leaf--1 {
  width: 140px;
  height: 140px;
  background: var(--green-light);
  opacity: 0.16;
  border-radius: 0 100% 30% 100%;
  transform: rotate(-8deg);
  left: 96px;
  bottom: 130px;
}

.onboarding__leaf--2 {
  width: 140px;
  height: 140px;
  background: var(--green);
  opacity: 0.13;
  border-radius: 100% 0 100% 30%;
  transform: rotate(8deg);
  left: 172px;
  bottom: 130px;
}

.onboarding__brand {
  position: relative;
  z-index: 1;
}

.onboarding__pitch {
  position: relative;
  z-index: 1;
  margin-top: auto;
}

.onboarding__tagline {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.12;
  color: var(--ink);
  text-wrap: balance;
}

.onboarding__tagline-sub {
  margin: 14px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--green-darker);
  line-height: 1.55;
  max-width: 280px;
}

.onboarding__main {
  flex: 1;
  padding: 44px;
  display: flex;
  flex-direction: column;
}

.onboarding__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.onboarding__subtitle {
  margin: 9px 0 0;
  font-size: 15px;
  color: var(--gray);
  line-height: 1.5;
}

.onboarding__steps {
  margin-top: 30px;
}

.onboarding__label {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin: 28px 0 12px;
}

.onboarding__levels {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.onboarding__card :deep(.onboarding__cta) {
  margin-top: auto;
}

/* The design note says the left panel is hidden on mobile. */
@media (max-width: 860px) {
  .onboarding {
    padding: 0;
  }

  .onboarding__card {
    min-height: 100dvh;
    border-radius: 0;
    box-shadow: none;
  }

  .onboarding__aside {
    display: none;
  }

  .onboarding__main {
    padding: 32px 24px 28px;
  }

  .onboarding__title {
    font-size: 24px;
  }
}
</style>
