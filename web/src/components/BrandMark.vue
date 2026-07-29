<script setup>
import { computed } from 'vue'
import uz from '@/locales/uz'

/* Proportions read off the mockups rather than derived — the notch dot and
   corner radius do not scale linearly with the tile. */
const SPECS = {
  40: { radius: 12, font: 21, dot: 13, dotBorder: 3 },
  44: { radius: 13, font: 24, dot: 15, dotBorder: 3 },
  56: { radius: 17, font: 30, dot: 18, dotBorder: 3.5 },
}

const props = defineProps({
  size: {
    type: Number,
    default: 44,
    validator: (v) => [40, 44, 56].includes(v),
  },
  /* The dot's ring punches through to whatever sits behind the mark. */
  ring: { type: String, default: 'var(--white)' },
  shadow: { type: String, default: '' },
  wordmark: { type: Boolean, default: false },
  tagline: { type: Boolean, default: false },
  wordmarkSize: { type: Number, default: 18 },
})

const spec = computed(() => SPECS[props.size])
</script>

<template>
  <div class="brand">
    <div
      class="brand__tile"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${spec.radius}px`,
        boxShadow: shadow || undefined,
      }"
    >
      <span class="brand__letter" :style="{ fontSize: `${spec.font}px` }">B</span>
      <span
        class="brand__dot"
        :style="{
          width: `${spec.dot}px`,
          height: `${spec.dot}px`,
          border: `${spec.dotBorder}px solid ${ring}`,
        }"
      />
    </div>

    <div v-if="wordmark" class="brand__text">
      <div class="brand__name" :style="{ fontSize: `${wordmarkSize}px` }">
        {{ uz.brand.name }}
      </div>
      <div v-if="tagline" class="brand__tagline">{{ uz.brand.tagline }}</div>
    </div>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.brand__tile {
  position: relative;
  background: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.brand__letter {
  color: var(--white);
  font-weight: 800;
  line-height: 1;
}

.brand__dot {
  position: absolute;
  right: -4px;
  top: -4px;
  border-radius: 50%;
  background: var(--orange);
}

.brand__text {
  line-height: 1.1;
}

.brand__name {
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.brand__tagline {
  font-weight: 600;
  font-size: 9.5px;
  color: var(--green);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
</style>
