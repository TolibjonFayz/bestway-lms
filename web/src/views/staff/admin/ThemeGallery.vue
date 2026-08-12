<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  themes: { type: Array, required: true },
  current: { type: String, required: true },
})

defineEmits(['pick', 'random'])
</script>

<template>
  <section class="tgal">
    <div class="tgal__head">
      <div>
        <h3 class="tgal__title">{{ uz.adminSettings.themeTitle }}</h3>
        <p class="tgal__text">{{ uz.adminSettings.themeText }}</p>
      </div>
      <button type="button" class="tgal__random" @click="$emit('random')">
        <BwIcon name="star" :size="15" />{{ uz.adminSettings.themeRandom }}
      </button>
    </div>

    <p class="tgal__hint">{{ uz.adminSettings.themePreviewNote }}</p>

    <div class="tgal__grid">
      <button
        v-for="theme in themes"
        :key="theme.id"
        type="button"
        class="tgal__card"
        :class="{ 'is-current': theme.id === current }"
        :aria-pressed="theme.id === current"
        @click="$emit('pick', theme.id)"
      >
        <!-- A miniature of the theme painted from its own swatch, so the card
             shows the palette even while a different theme is active. -->
        <span class="tgal__preview" :style="{ background: theme.swatch.bg }">
          <span class="tgal__preview-bar" :style="{ background: theme.swatch.accent }" />
          <span class="tgal__preview-card" :style="{ background: theme.swatch.surface }">
            <span class="tgal__preview-line" :style="{ background: theme.swatch.ink }" />
            <span
              class="tgal__preview-line tgal__preview-line--short"
              :style="{ background: theme.swatch.accent }"
            />
          </span>
        </span>

        <span class="tgal__body">
          <span class="tgal__name">
            {{ theme.name }}
            <span v-if="theme.dark" class="tgal__tag">{{ uz.adminSettings.themeDark }}</span>
          </span>
          <span class="tgal__desc">{{ theme.description }}</span>
        </span>

        <span v-if="theme.id === current" class="tgal__check">
          <BwIcon name="check-circle" :size="17" />
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.tgal {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-sm);
  padding: 20px;
}

.tgal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.tgal__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.tgal__text {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: var(--gray);
}

.tgal__random {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 13px;
  border-radius: 99px;
  border: 1px solid var(--line);
  background: var(--white);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
}

.tgal__random:hover {
  border-color: var(--green);
  color: var(--green);
}

.tgal__random:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tgal__hint {
  margin: 12px 0 10px;
  font-size: 11.5px;
  color: var(--gray-2);
}

.tgal__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.tgal__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1.5px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 0.15s, transform 0.15s;
}

.tgal__card:hover {
  transform: translateY(-2px);
  border-color: var(--green-soft);
}

.tgal__card:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tgal__card.is-current {
  border-color: var(--green);
  box-shadow: var(--sh-green);
}

.tgal__preview {
  height: 78px;
  border-radius: 10px;
  padding: 9px;
  display: flex;
  gap: 7px;
  box-shadow: var(--sh-inset);
  overflow: hidden;
}

.tgal__preview-bar {
  width: 18px;
  border-radius: 5px;
  flex: none;
}

.tgal__preview-card {
  flex: 1;
  border-radius: 7px;
  padding: 9px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--sh-inset);
}

.tgal__preview-line {
  height: 6px;
  border-radius: 99px;
  opacity: 0.85;
}

.tgal__preview-line--short {
  width: 55%;
  opacity: 1;
}

.tgal__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 2px 2px;
}

.tgal__name {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}

.tgal__tag {
  font-size: 10px;
  font-weight: 700;
  color: var(--gray);
  background: var(--line-2);
  border-radius: 99px;
  padding: 2px 7px;
}

.tgal__desc {
  font-size: 11.5px;
  color: var(--gray);
  line-height: 1.4;
}

.tgal__check {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--green);
  background: var(--white);
  border-radius: 50%;
  line-height: 0;
}
</style>
