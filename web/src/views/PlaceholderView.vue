<script setup>
import BwButton from '@/components/base/BwButton.vue'
import { useAuthStore } from '@/stores/auth'
import uz from '@/locales/uz'
import { useRouter } from 'vue-router'

/* Stand-in for the role homes until stages 3, 7 and 8 build them. It carries a
   sign-out control so the auth flow can actually be exercised end to end. */
defineProps({
  title: { type: String, required: true },
})

const auth = useAuthStore()
const router = useRouter()

async function signOut() {
  await auth.logout()
  router.push('/login/role')
}
</script>

<template>
  <div class="placeholder">
    <h1 class="bw-h1">{{ title }}</h1>
    <p v-if="auth.user" class="placeholder__who bw-caption">
      {{ auth.user.fullName }} · {{ auth.user.role }}
    </p>
    <BwButton class="placeholder__out" variant="secondary" @click="signOut">
      {{ uz.actions.logout }}
    </BwButton>
  </div>
</template>

<style scoped>
.placeholder {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: var(--bg);
}

.placeholder__who {
  margin: 0;
}

.placeholder__out {
  margin-top: 12px;
}
</style>
