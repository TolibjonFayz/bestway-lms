<script setup>
import { useRouter } from 'vue-router'
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { ADMIN_NAV_ITEMS, TEACHER_NAV_ITEMS } from './staffNav'
import { useAuthStore } from '@/stores/auth'
import uz from '@/locales/uz'

const props = defineProps({
  role: { type: String, required: true, validator: (v) => ['teacher', 'admin'].includes(v) },
})

const auth = useAuthStore()
const router = useRouter()
const items = props.role === 'admin' ? ADMIN_NAV_ITEMS : TEACHER_NAV_ITEMS

async function signOut() {
  await auth.logout()
  router.push('/login/role')
}
</script>

<template>
  <div class="staff-shell">
    <aside class="staff-shell__sidebar" :class="`staff-shell__sidebar--${role}`">
      <div class="staff-shell__brand">
        <div class="staff-shell__logo">
          <span class="staff-shell__logo-letter">B</span>
          <span v-if="role === 'teacher'" class="staff-shell__logo-dot" />
        </div>
        <div class="staff-shell__wordmark">Best Way</div>
      </div>

      <nav class="staff-shell__nav">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          class="staff-shell__link"
          :to="item.to"
        >
          <BwIcon :name="item.icon" :size="role === 'teacher' ? 19 : 18" /><span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div v-if="auth.user" class="staff-shell__user">
        <BwAvatar :name="auth.user.fullName" :size="36" />
        <span class="staff-shell__user-body">
          <span class="staff-shell__user-name">{{ auth.user.fullName }}</span>
          <span class="staff-shell__user-role">{{ uz.roles[role] }}</span>
        </span>
        <button
          type="button"
          class="staff-shell__logout"
          :aria-label="uz.actions.logout"
          @click="signOut"
        >
          <BwIcon name="log-out" :size="17" />
        </button>
      </div>
    </aside>

    <main class="staff-shell__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.staff-shell {
  min-height: 100dvh;
  background: var(--bg);
  display: flex;
}

.staff-shell__sidebar {
  flex: none;
  background: var(--ink);
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: 24px 16px;
}

.staff-shell__sidebar--teacher {
  width: 250px;
  padding: 24px 16px;
}

.staff-shell__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 4px;
}

.staff-shell__logo {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.staff-shell__sidebar--teacher .staff-shell__logo {
  width: 38px;
  height: 38px;
  border-radius: 11px;
}

.staff-shell__logo-letter {
  color: var(--white);
  font-weight: 800;
  font-size: 18px;
  line-height: 1;
}

.staff-shell__sidebar--teacher .staff-shell__logo-letter {
  font-size: 20px;
}

.staff-shell__logo-dot {
  position: absolute;
  right: -4px;
  top: -4px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--orange);
  border: 2.5px solid var(--ink);
}

.staff-shell__wordmark {
  font-weight: 800;
  font-size: 14.5px;
  color: var(--white);
}

.staff-shell__sidebar--teacher .staff-shell__wordmark {
  font-size: 15.5px;
}

.staff-shell__nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 26px;
}

.staff-shell__link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  color: var(--gray-2);
  transition:
    background 0.15s,
    color 0.15s;
}

.staff-shell__sidebar--teacher .staff-shell__link {
  gap: 12px;
  padding: 11px 13px;
  border-radius: 11px;
  font-size: 14.5px;
}

.staff-shell__link:hover {
  background: var(--layer-w-06);
  color: var(--white);
}

.staff-shell__link:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 2px;
}

.staff-shell__link.router-link-active {
  font-weight: 700;
  color: var(--white);
  background: var(--green);
  box-shadow: var(--sh-nav-active);
}

.staff-shell__user {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border-radius: 13px;
  background: var(--layer-w-05);
}

.staff-shell__user-body {
  flex: 1;
  min-width: 0;
  line-height: 1.2;
}

.staff-shell__user-name {
  display: block;
  font-weight: 700;
  font-size: 13.5px;
  color: var(--white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.staff-shell__user-role {
  display: block;
  font-size: 11px;
  color: var(--gray-2);
}

.staff-shell__logout {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--gray-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.staff-shell__logout:hover {
  background: var(--layer-w-06);
  color: var(--white);
}

.staff-shell__logout:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 1px;
}

.staff-shell__main {
  flex: 1;
  min-width: 0;
  padding: 28px 32px;
}

@media (max-width: 1023px) {
  .staff-shell {
    flex-direction: column;
  }

  .staff-shell__sidebar,
  .staff-shell__sidebar--teacher {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 14px 16px;
    gap: 16px;
  }

  .staff-shell__nav {
    flex-direction: row;
    margin-top: 0;
    flex: 1;
    overflow-x: auto;
  }

  .staff-shell__link span {
    display: none;
  }

  .staff-shell__link {
    flex: none;
  }

  .staff-shell__user {
    margin-top: 0;
    flex: none;
  }

  .staff-shell__user-body {
    display: none;
  }

  .staff-shell__main {
    padding: 20px 16px 28px;
  }
}
</style>
