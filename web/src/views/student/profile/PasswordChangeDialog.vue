<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwInput from '@/components/base/BwInput.vue'
import { changePassword } from '@/api/profile'
import { errorMessage } from '@/api/http'
import uz from '@/locales/uz'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'changed'])

const currentPassword = ref('')
const newPassword = ref('')
const submitting = ref(false)
const error = ref('')

function reset() {
  currentPassword.value = ''
  newPassword.value = ''
  error.value = ''
  submitting.value = false
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) reset()
  },
)

async function submit() {
  if (submitting.value) return
  error.value = ''
  if (newPassword.value.length < 6) {
    error.value = uz.profile.newPasswordHint
    return
  }
  submitting.value = true
  try {
    await changePassword(currentPassword.value, newPassword.value)
    emit('changed')
  } catch (cause) {
    error.value = errorMessage(cause, uz.profile.passwordErrorTitle)
  } finally {
    submitting.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
)
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="open" class="pdlg" role="dialog" aria-modal="true" :aria-label="uz.profile.passwordDialogTitle">
    <div class="pdlg__card">
      <div class="pdlg__head">
        <h3 class="pdlg__title">{{ uz.profile.passwordDialogTitle }}</h3>
        <button class="pdlg__close" type="button" :aria-label="uz.actions.close" @click="$emit('close')">
          <BwIcon name="x" :size="17" :stroke-width="2" />
        </button>
      </div>

      <form class="pdlg__form" @submit.prevent="submit">
        <BwInput
          v-model="currentPassword"
          type="password"
          :label="uz.profile.currentPassword"
          autocomplete="current-password"
          required
        />
        <BwInput
          v-model="newPassword"
          type="password"
          :label="uz.profile.newPassword"
          :helper="!error ? uz.profile.newPasswordHint : ''"
          :error="error"
          autocomplete="new-password"
          required
        />

        <BwButton type="submit" block :loading="submitting">
          {{ uz.profile.savePassword }}
        </BwButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.pdlg {
  position: fixed;
  inset: 0;
  background: var(--layer-ink-42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 60;
}

.pdlg__card {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-lg);
  padding: 24px;
  max-width: 380px;
  width: 100%;
}

.pdlg__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.pdlg__title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.pdlg__close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.pdlg__close:hover {
  background: var(--bg);
}

.pdlg__close:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.pdlg__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
