<script setup>
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

defineProps({
  /* Unread marker on the bell; the notifications feature itself is later. */
  hasUnread: { type: Boolean, default: false },
})

const auth = useAuthStore()
const { longDate } = useUzbekDate()
const greeting = uz.dashboard.greeting.replace(
  '{name}',
  auth.user?.fullName?.split(' ')[0] ?? '',
)
</script>

<template>
  <header class="topbar">
    <div class="topbar__who">
      <BwAvatar v-if="auth.user" :name="auth.user.fullName" :size="42" />
      <div class="topbar__text">
        <div class="topbar__greeting">{{ greeting }}</div>
        <div class="topbar__date">{{ longDate(new Date()) }}</div>
      </div>
    </div>

    <button class="topbar__bell" type="button" :aria-label="uz.a11y.notifications">
      <BwIcon name="bell" :size="20" />
      <span v-if="hasUnread" class="topbar__dot" />
    </button>
  </header>
</template>

<style scoped>
.topbar {
  background: var(--white);
  border-bottom: 1px solid var(--line-2);
  padding: 12px 18px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topbar__who {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.topbar__text {
  line-height: 1.2;
  min-width: 0;
}

.topbar__greeting {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar__date {
  font-size: 12px;
  color: var(--gray);
  font-weight: 500;
}

.topbar__bell {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.topbar__bell:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.topbar__dot {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--orange);
  border: 2px solid var(--white);
}
</style>
