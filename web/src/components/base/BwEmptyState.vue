<script setup>
import BwButton from './BwButton.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
})

defineEmits(['action'])
</script>

<template>
  <div class="bw-empty">
    <div class="bw-empty__inner">
      <slot name="illustration">
        <div class="bw-empty__art">
          <span class="bw-empty__art-tag">illustration</span>
        </div>
      </slot>

      <h3 class="bw-empty__title">{{ title }}</h3>
      <p v-if="description" class="bw-empty__text">{{ description }}</p>

      <slot name="action">
        <BwButton v-if="actionLabel" class="bw-empty__action" @click="$emit('action')">
          {{ actionLabel }}
        </BwButton>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.bw-empty {
  border: 1px dashed var(--line);
  border-radius: 18px;
  background: var(--tint-slate);
  padding: 44px 24px;
}

.bw-empty__inner {
  text-align: center;
  max-width: 420px;
  margin: 0 auto;
}

.bw-empty__art {
  width: 160px;
  height: 120px;
  margin: 0 auto;
  border-radius: 16px;
  background: repeating-linear-gradient(
    45deg,
    var(--line-3),
    var(--line-3) 9px,
    var(--bg) 9px,
    var(--bg) 18px
  );
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bw-empty__art-tag {
  font: 600 11px var(--font-mono);
  color: var(--gray-2);
  background: var(--white);
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid var(--line);
}

.bw-empty__title {
  margin: 22px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}

.bw-empty__text {
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--gray);
  text-wrap: pretty;
}

.bw-empty :deep(.bw-empty__action) {
  margin-top: 22px;
}
</style>
