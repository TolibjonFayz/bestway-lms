<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  bullets: { type: Array, required: true },
})

const open = ref(false)
</script>

<template>
  <section class="konspekt">
    <button
      class="konspekt__toggle"
      type="button"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="konspekt__label">
        <BwIcon name="notebook" :size="19" :stroke-width="1.75" class="konspekt__icon" />
        {{ uz.video.konspekt }}
      </span>
      <BwIcon
        name="chevron-down"
        :size="17"
        :stroke-width="2.2"
        class="konspekt__chevron"
        :class="{ 'is-open': open }"
      />
    </button>

    <div v-if="open" class="konspekt__body">
      <!-- Bullets are plain text by design: teacher notes never render markup. -->
      <div v-for="line in bullets" :key="line" class="konspekt__line">
        <span class="konspekt__dot" />{{ line }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.konspekt {
  margin-top: 22px;
  border: 1px solid var(--line-2);
  border-radius: 16px;
  overflow: hidden;
}

.konspekt__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: var(--tint-green);
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.konspekt__toggle:hover {
  background: var(--bg);
}

.konspekt__toggle:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.konspekt__label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
  color: var(--ink);
}

.konspekt__icon {
  color: var(--green);
}

.konspekt__chevron {
  color: var(--gray);
  transition: transform 0.15s;
}

.konspekt__chevron.is-open {
  transform: rotate(180deg);
}

.konspekt__body {
  padding: 6px 18px 18px;
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--ink-3);
}

.konspekt__line {
  display: flex;
  gap: 9px;
  margin-top: 8px;
}

.konspekt__line:first-child {
  margin-top: 6px;
}

.konspekt__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  margin-top: 9px;
  flex: none;
}
</style>
