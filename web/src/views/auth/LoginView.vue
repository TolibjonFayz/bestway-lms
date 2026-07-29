<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwInput from '@/components/base/BwInput.vue'
import BwPhoneInput from '@/components/base/BwPhoneInput.vue'
import AuthLayout from './AuthLayout.vue'
import { isNetworkError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { usePhoneFormat } from '@/composables/usePhoneFormat'
import uz from '@/locales/uz'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const phoneFormat = usePhoneFormat()

const phone = ref('')
const password = ref('')
const submitting = ref(false)
const errorText = ref('')

const roleTitle = computed(() =>
  auth.intendedRole === 'staff' ? uz.auth.staff : uz.auth.student,
)
const canSubmit = computed(
  () => phoneFormat.isComplete(phone.value) && password.value.length >= 6,
)

/* Editing after a rejection clears the error so the fields stop looking wrong
   while the user is fixing them. */
function onEdit() {
  if (errorText.value) errorText.value = ''
}

async function submit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  errorText.value = ''
  try {
    const user = await auth.login(phone.value, password.value)
    /* A student who has never confirmed their level goes through onboarding
       first; everyone else lands on their role's home. */
    const next = user.role === 'student' && !user.level ? '/onboarding' : auth.homeRoute
    await router.push(next)
  } catch (error) {
    if (isNetworkError(error)) {
      toast.error(uz.toast.connectionTitle, { description: uz.toast.connectionText })
    } else if (error?.response?.status === 401) {
      errorText.value = uz.auth.invalidCredentials
    } else {
      toast.error(uz.toast.connectionTitle, { description: uz.toast.connectionText })
    }
  } finally {
    /* Always — a stuck spinner is worse than a visible failure. */
    submitting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <form class="login" novalidate @submit.prevent="submit">
      <BrandMark :size="40" wordmark :wordmark-size="16" class="login__brand" />

      <h1 class="login__title">{{ roleTitle }}</h1>
      <p class="login__subtitle">{{ uz.auth.loginSubtitle }}</p>

      <div class="login__phone">
        <BwPhoneInput
          v-model="phone"
          size="lg"
          format="parens"
          flag
          :label="uz.form.phone"
          :placeholder="uz.auth.phonePlaceholder"
          :invalid="Boolean(errorText)"
          autocomplete="username"
          @update:model-value="onEdit"
        />
      </div>

      <div class="login__password">
        <BwInput
          v-model="password"
          size="lg"
          type="password"
          :label="uz.form.password"
          :placeholder="uz.auth.passwordPlaceholder"
          :error="errorText"
          autocomplete="current-password"
          @update:model-value="onEdit"
        />
        <div v-if="!errorText" class="login__forgot">
          <RouterLink to="/login">{{ uz.auth.forgotPassword }}</RouterLink>
        </div>
      </div>

      <BwButton
        class="login__cta"
        type="submit"
        size="lg"
        block
        :disabled="!canSubmit"
        :loading="submitting"
      >
        {{ submitting ? uz.actions.loading : uz.auth.submit }}
        <template #trailing><BwIcon name="arrow-right" :size="19" /></template>
      </BwButton>

      <div class="login__back">
        <RouterLink to="/login/role">
          <BwIcon name="chevron-left" :size="16" :stroke-width="2" />{{ uz.actions.back }}
        </RouterLink>
      </div>
    </form>
  </AuthLayout>
</template>

<style scoped>
.login {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 30px 26px 28px;
}

.login__brand {
  gap: 10px;
}

.login__title {
  margin: 30px 0 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.login__subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--gray);
  line-height: 1.5;
}

.login__phone {
  margin-top: 28px;
}

.login__password {
  margin-top: 18px;
}

.login__forgot {
  text-align: right;
  margin-top: 11px;
}

.login__forgot a {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--green);
}

.login :deep(.login__cta) {
  margin-top: 24px;
}

.login__back {
  text-align: center;
  margin-top: auto;
  padding-top: 22px;
}

.login__back a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--gray);
}

.login__back a:hover {
  color: var(--ink);
}
</style>
