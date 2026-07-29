<script setup>
defineProps({
  courses: { type: Array, required: true },
  activeId: { type: Number, default: null },
})

defineEmits(['select'])
</script>

<template>
  <div class="ctabs bw-scroll" role="tablist">
    <button
      v-for="course in courses"
      :key="course.id"
      class="ctabs__tab"
      :class="{ 'is-active': course.id === activeId }"
      type="button"
      role="tab"
      :aria-selected="course.id === activeId"
      @click="$emit('select', course.id)"
    >
      {{ course.name }}
    </button>
  </div>
</template>

<style scoped>
.ctabs {
  display: flex;
  gap: 4px;
  background: var(--line-2);
  border-radius: 12px;
  padding: 4px;
  overflow-x: auto;
}

.ctabs__tab {
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  height: 36px;
  padding: 0 15px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex: none;
  background: transparent;
  color: var(--gray);
  transition:
    background 0.15s,
    color 0.15s;
}

.ctabs__tab.is-active {
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-tab-active);
}

.ctabs__tab:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}

@media (min-width: 1024px) {
  .ctabs {
    display: inline-flex;
    padding: 5px;
    border-radius: 13px;
    overflow-x: visible;
  }

  .ctabs__tab {
    font-size: 14.5px;
    height: 40px;
    padding: 0 20px;
    border-radius: 9px;
  }
}
</style>
