<script setup>
import BwIcon from '@/components/base/BwIcon.vue'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <div class="stories bw-scroll">
    <button
      v-for="item in items"
      :key="item.id"
      class="stories__item"
      type="button"
    >
      <span
        class="stories__ring"
        :class="[`stories__ring--${item.tone}`, { 'is-unread': item.unread }]"
      >
        <BwIcon :name="item.icon" :size="28" />
      </span>
      <span class="stories__label" :class="{ 'is-muted': !item.unread }">
        {{ item.title }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.stories {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 2px 0 12px;
}

.stories__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  flex: none;
  width: 70px;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  cursor: pointer;
}

.stories__item:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 3px;
  border-radius: 12px;
}

.stories__ring {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Read stories lose the green ring and keep a flat grey outline. */
  box-shadow: 0 0 0 2px var(--line);
}

.stories__ring.is-unread {
  box-shadow:
    0 0 0 2.5px var(--green),
    0 0 0 5px var(--bg);
}

.stories__ring--green {
  background: var(--green-mid);
  color: var(--green-dark);
}

.stories__ring--orange {
  background: var(--orange-soft);
  color: var(--orange-ink);
}

.stories__ring--sky {
  background: var(--sky-pale);
  color: var(--sky-ink);
}

.stories__ring--muted {
  background: var(--line-2);
  color: var(--gray);
}

.stories__label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ink-3);
  text-align: center;
  line-height: 1.2;
}

.stories__label.is-muted {
  color: var(--gray-2);
}

@media (min-width: 1024px) {
  .stories {
    gap: 18px;
    padding: 22px 2px 12px;
    margin-top: 6px;
  }

  .stories__item {
    width: 78px;
    gap: 9px;
  }

  .stories__ring {
    width: 70px;
    height: 70px;
  }

  .stories__label {
    font-size: 11.5px;
    line-height: 1.25;
  }
}
</style>
