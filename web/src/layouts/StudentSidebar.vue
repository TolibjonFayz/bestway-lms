<script setup>
import BrandMark from '@/components/BrandMark.vue'
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { SIDEBAR_ITEMS } from './studentNav'
import { useAuthStore } from '@/stores/auth'
import uz from '@/locales/uz'

const auth = useAuthStore()
</script>

<template>
  <aside class="sidebar">
    <BrandMark
      class="sidebar__brand"
      :size="44"
      ring="var(--ink)"
      wordmark
      tagline
      :wordmark-size="17"
    />

    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in SIDEBAR_ITEMS"
        :key="item.to"
        class="sidebar__link"
        :to="item.to"
      >
        <BwIcon :name="item.icon" :size="21" />{{ item.label }}
      </RouterLink>
    </nav>

    <RouterLink v-if="auth.user" class="sidebar__user" to="/profile">
      <BwAvatar :name="auth.user.fullName" :size="40" />
      <span class="sidebar__user-body">
        <span class="sidebar__user-name">{{ auth.user.fullName }}</span>
        <span class="sidebar__user-level">{{ uz.levels[auth.user.level?.toLowerCase()] }}</span>
      </span>
      <BwIcon name="chevron-right" :size="18" class="sidebar__user-chevron" />
    </RouterLink>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  flex: none;
  background: var(--sidebar-bg);
  padding: 26px 18px;
  display: flex;
  flex-direction: column;
}

/* The mark sits slightly inset so its optical edge lines up with the nav. */
.sidebar__brand {
  padding: 0 8px 4px;
  gap: 11px;
}

.sidebar__brand :deep(.brand__name) {
  color: var(--sidebar-text);
}

.sidebar__brand :deep(.brand__tagline) {
  color: var(--green-300);
  font-size: 9px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 30px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 12px 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  color: var(--sidebar-muted);
  transition:
    background 0.15s,
    color 0.15s;
}

.sidebar__link:hover {
  background: var(--layer-w-06);
  color: var(--sidebar-text);
}

.sidebar__link:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 2px;
}

.sidebar__link.router-link-active {
  font-weight: 700;
  color: var(--sidebar-text);
  background: var(--green);
  box-shadow: var(--sh-nav-active);
}

.sidebar__user {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px;
  border-radius: 14px;
  background: var(--layer-w-05);
}

.sidebar__user-body {
  flex: 1;
  min-width: 0;
  line-height: 1.25;
}

.sidebar__user-name {
  display: block;
  font-weight: 700;
  font-size: 14px;
  color: var(--sidebar-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-level {
  display: block;
  font-size: 12px;
  color: var(--sidebar-muted);
}

.sidebar__user-chevron {
  color: var(--gray);
}
</style>
