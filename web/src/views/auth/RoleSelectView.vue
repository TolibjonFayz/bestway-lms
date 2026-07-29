<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import AuthLayout from './AuthLayout.vue'
import RoleCard from './RoleCard.vue'
import { useAuthStore } from '@/stores/auth'
import uz from '@/locales/uz'

const router = useRouter()
const auth = useAuthStore()

const role = ref(auth.intendedRole)

function submit() {
  auth.setIntendedRole(role.value)
  router.push('/login')
}
</script>

<template>
  <AuthLayout>
    <div class="role">
      <div class="role__logo">
        <BrandMark :size="56" shadow="0 12px 30px rgba(22, 163, 74, 0.3)" />
      </div>

      <div class="role__head">
        <h1 class="role__title">{{ uz.auth.roleTitle }}</h1>
        <p class="role__subtitle">{{ uz.auth.roleSubtitle }}</p>
      </div>

      <div class="role__cards" role="radiogroup" :aria-label="uz.auth.roleTitle">
        <RoleCard
          icon="book-open"
          :title="uz.auth.student"
          :hint="uz.auth.studentHint"
          :selected="role === 'student'"
          @select="role = 'student'"
        />
        <RoleCard
          icon="id-card"
          :title="uz.auth.staff"
          :hint="uz.auth.staffHint"
          :selected="role === 'staff'"
          @select="role = 'staff'"
        />
      </div>

      <BwButton class="role__cta" size="lg" block @click="submit">
        {{ uz.actions.continue }}
        <template #trailing><BwIcon name="arrow-right" :size="19" /></template>
      </BwButton>
    </div>
  </AuthLayout>
</template>

<style scoped>
.role {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 34px 26px 30px;
}

.role__logo {
  display: flex;
  justify-content: center;
}

.role__head {
  text-align: center;
  margin-top: 34px;
}

.role__title {
  margin: 0;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.role__subtitle {
  margin: 9px 0 0;
  font-size: 15px;
  color: var(--gray);
  line-height: 1.5;
}

.role__cards {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 30px;
}

.role :deep(.role__cta) {
  margin-top: auto;
}
</style>
