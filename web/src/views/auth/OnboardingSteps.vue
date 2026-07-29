<script setup>
/* The onboarding stepper carries a caption under each circle and paints the
   current step solid, which the design system's BwStepIndicator does not —
   it is a different component in design/02-auth.html, not a restyle of that
   one. */
defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, default: 1 },
})
</script>

<template>
  <ol class="steps" :aria-label="steps.join(' · ')">
    <template v-for="(label, index) in steps" :key="label">
      <li
        v-if="index > 0"
        class="steps__link"
        :class="{ 'is-done': index + 1 <= current }"
        aria-hidden="true"
      />
      <li
        class="steps__item"
        :class="{ 'is-current': index + 1 === current }"
        :aria-current="index + 1 === current ? 'step' : undefined"
      >
        <span class="steps__circle">{{ index + 1 }}</span>
        <span class="steps__label">{{ label }}</span>
      </li>
    </template>
  </ol>
</template>

<style scoped>
.steps {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: none;
}

.steps__circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--line-2);
  color: var(--gray-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.steps__item.is-current .steps__circle {
  background: var(--green);
  color: var(--white);
  box-shadow: var(--ring-green);
}

.steps__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-2);
}

.steps__item.is-current .steps__label {
  font-weight: 700;
  color: var(--green-dark);
}

/* The bottom margin lifts the rule to the circles' centre line, clear of the
   captions underneath. */
.steps__link {
  flex: 1;
  height: 3px;
  background: var(--line);
  border-radius: 2px;
  margin: 0 8px 20px;
}

.steps__link.is-done {
  background: var(--green);
}
</style>
