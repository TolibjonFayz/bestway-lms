<script setup>
import { computed, ref, watch } from 'vue'
import BwIcon from './BwIcon.vue'

/* Font sizes read off the mockup rather than derived, so 32/40/44/56 land
   exactly where the design system puts them. */
const FONT_FOR_SIZE = { 32: 12, 40: 14, 44: 16, 56: 20 }

const props = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: '' },
  /* Literal content that replaces the initials, e.g. the group's "+3". */
  text: { type: String, default: '' },
  size: { type: Number, default: 44 },
  /* Overrides the size-derived label font, used by the group counter. */
  fontSize: { type: Number, default: 0 },
  tone: {
    type: String,
    default: 'green',
    validator: (v) =>
      ['green', 'orange', 'ink', 'ink-2', 'gray', 'gray-2', 'muted', 'placeholder'].includes(v),
  },
  /* Adds the white ring the stacked group uses. */
  ringed: { type: Boolean, default: false },
})

const failed = ref(false)
watch(() => props.src, () => (failed.value = false))

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase('uz'))
    .join(''),
)

const fontSize = computed(
  () => props.fontSize || FONT_FOR_SIZE[props.size] || Math.round(props.size * 0.36),
)
const showImage = computed(() => Boolean(props.src) && !failed.value)
</script>

<template>
  <span
    class="bw-avatar"
    :class="[`bw-avatar--${tone}`, { 'bw-avatar--ringed': ringed }]"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${fontSize}px` }"
    :title="name || undefined"
  >
    <img
      v-if="showImage"
      class="bw-avatar__img"
      :src="src"
      :alt="name"
      @error="failed = true"
    />
    <template v-else-if="text">{{ text }}</template>
    <template v-else-if="initials">{{ initials }}</template>
    <BwIcon v-else name="user" :size="Math.round(size * 0.71)" />
  </span>
</template>

<style scoped>
.bw-avatar {
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  overflow: hidden;
  flex: none;
  user-select: none;
}

.bw-avatar--ringed {
  border: 2.5px solid var(--white);
}

.bw-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bw-avatar--green {
  background: var(--green);
  color: var(--white);
}

.bw-avatar--orange {
  background: var(--orange);
  color: var(--white);
}

.bw-avatar--ink {
  background: var(--ink);
  color: var(--white);
}

.bw-avatar--ink-2 {
  background: var(--ink-2);
  color: var(--white);
}

.bw-avatar--gray {
  background: var(--gray);
  color: var(--white);
}

.bw-avatar--gray-2 {
  background: var(--gray-2);
  color: var(--white);
}

.bw-avatar--muted {
  background: var(--line-2);
  color: var(--gray);
}

/* No photo and no name yet — the hatched slot from the mockup, with the
   glyph sitting on the bottom edge like a cropped portrait. */
.bw-avatar--placeholder {
  background: repeating-linear-gradient(
    45deg,
    var(--line),
    var(--line) 6px,
    var(--line-2) 6px,
    var(--line-2) 12px
  );
  border: 1px solid var(--line);
  color: var(--gray-2);
  align-items: flex-end;
}
</style>
