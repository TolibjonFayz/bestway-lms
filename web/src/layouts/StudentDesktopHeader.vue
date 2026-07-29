<script setup>
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

defineProps({
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
  <div class="dhead">
    <div>
      <h1 class="dhead__greeting">{{ greeting }}</h1>
      <p class="dhead__date">{{ longDate(new Date()) }}</p>
    </div>

    <div class="dhead__actions">
      <button class="dhead__icon-btn" type="button" :aria-label="uz.a11y.notifications">
        <BwIcon name="bell" :size="21" />
        <span v-if="hasUnread" class="dhead__dot" />
      </button>
      <button
        class="dhead__icon-btn"
        type="button"
        :aria-label="uz.dashboard.messages"
      >
        <BwIcon name="message-square" :size="21" />
      </button>

      <RouterLink v-if="auth.user" class="dhead__pill" to="/profile">
        <BwAvatar :name="auth.user.fullName" :size="38" />
        <span class="dhead__pill-text">
          <span class="dhead__pill-name">{{ auth.user.fullName }}</span>
          <span class="dhead__pill-level">
            {{ uz.levels[auth.user.level?.toLowerCase()] }}
          </span>
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.dhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.dhead__greeting {
  margin: 0;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.dhead__date {
  margin: 5px 0 0;
  font-size: 14.5px;
  color: var(--gray);
  font-weight: 500;
}

.dhead__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dhead__icon-btn {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.dhead__icon-btn:hover {
  background: var(--bg);
}

.dhead__icon-btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.dhead__dot {
  position: absolute;
  top: 9px;
  right: 11px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--orange);
  border: 2px solid var(--white);
}

.dhead__pill {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 6px 14px 6px 6px;
  border-radius: 99px;
  background: var(--white);
  border: 1px solid var(--line);
}

.dhead__pill-text {
  line-height: 1.2;
}

.dhead__pill-name {
  display: block;
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
}

.dhead__pill-level {
  display: block;
  font-size: 11.5px;
  color: var(--gray);
}
</style>
