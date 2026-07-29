<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import { TAB_BAR_ITEMS } from './studentNav'
</script>

<template>
  <nav class="tabbar">
    <RouterLink
      v-for="item in TAB_BAR_ITEMS"
      :key="item.to"
      class="tabbar__item"
      :to="item.to"
    >
      <BwIcon :name="item.icon" :size="23" />
      <span class="tabbar__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar {
  background: var(--white);
  border-top: 1px solid var(--line-2);
  padding: 9px 8px 14px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  /* Clears the home indicator on phones that report a safe area. */
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
}

.tabbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  /* Touch target stays at 44px even though the glyph is smaller. */
  min-height: 44px;
  justify-content: center;
  color: var(--gray-2);
}

.tabbar__item:hover {
  color: var(--gray-2);
}

.tabbar__item:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: -2px;
  border-radius: 10px;
}

.tabbar__label {
  font-size: 10.5px;
  font-weight: 600;
}

.tabbar__item.router-link-active,
.tabbar__item.router-link-active:hover {
  color: var(--green);
}

.tabbar__item.router-link-active .tabbar__label {
  font-weight: 700;
}
</style>
