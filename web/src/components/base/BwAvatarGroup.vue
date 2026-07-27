<script setup>
import { computed } from 'vue'
import BwAvatar from './BwAvatar.vue'

const props = defineProps({
  /* [{ name, src?, tone? }] */
  items: { type: Array, default: () => [] },
  max: { type: Number, default: 3 },
  size: { type: Number, default: 40 },
})

const shown = computed(() => props.items.slice(0, props.max))
const overflow = computed(() => Math.max(0, props.items.length - props.max))
</script>

<template>
  <div class="bw-avatar-group">
    <BwAvatar
      v-for="person in shown"
      :key="person.name"
      class="bw-avatar-group__item"
      :name="person.name"
      :src="person.src"
      :tone="person.tone || 'green'"
      :size="size"
      ringed
    />
    <BwAvatar
      v-if="overflow"
      class="bw-avatar-group__item"
      :text="`+${overflow}`"
      :size="size"
      :font-size="13"
      tone="muted"
      ringed
    />
  </div>
</template>

<style scoped>
.bw-avatar-group {
  display: flex;
}

.bw-avatar-group__item + .bw-avatar-group__item {
  margin-left: -12px;
}
</style>
