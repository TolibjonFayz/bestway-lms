<script setup>
import { ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwInput from '@/components/base/BwInput.vue'
import BwSelect from '@/components/base/BwSelect.vue'
import { createAdminStudent } from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  groups: { type: Array, required: true },
})

const emit = defineEmits(['close', 'created'])

const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const groupId = ref(props.groups[0]?.id ?? '')
const level = ref('A1')
const saving = ref(false)
const error = ref('')

const levelOptions = ['A1', 'A2', 'B1', 'B2']

const isValid = () =>
  firstName.value.trim() && lastName.value.trim() && /^\d{9}$/.test(phone.value) && groupId.value

async function submit() {
  if (!isValid() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await createAdminStudent({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      phone: phone.value,
      groupId: Number(groupId.value),
      level: level.value,
    })
    emit('created')
  } catch (cause) {
    error.value = cause?.response?.data?.message ?? uz.adminStudents.errorText
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="asmodal-overlay" @click.self="$emit('close')">
    <div class="asmodal" role="dialog" aria-modal="true" :aria-label="uz.adminStudents.modalTitle">
      <div class="asmodal__head">
        <h3 class="asmodal__title">{{ uz.adminStudents.modalTitle }}</h3>
        <button type="button" class="asmodal__close" :aria-label="uz.actions.close" @click="$emit('close')">
          <BwIcon name="x" :size="15" :stroke-width="2" />
        </button>
      </div>

      <form class="asmodal__form" @submit.prevent="submit">
        <div class="asmodal__row">
          <BwInput v-model="firstName" :label="uz.adminStudents.firstName" :placeholder="uz.adminStudents.firstNamePlaceholder" required />
          <BwInput v-model="lastName" :label="uz.adminStudents.lastName" :placeholder="uz.adminStudents.lastNamePlaceholder" required />
        </div>

        <div class="asmodal__phone-field">
          <label class="asmodal__label">{{ uz.adminStudents.phoneLabel }}</label>
          <div class="asmodal__phone">
            <span class="asmodal__phone-prefix">+998</span>
            <input
              v-model="phone"
              class="asmodal__phone-input"
              type="tel"
              inputmode="numeric"
              maxlength="9"
              placeholder="90 123 45 67"
            />
          </div>
        </div>

        <div class="asmodal__row">
          <BwSelect
            v-model="groupId"
            :label="uz.adminStudents.group"
            :options="groups.map((g) => ({ value: g.id, label: g.name }))"
          />
          <BwSelect v-model="level" :label="uz.adminStudents.level" :options="levelOptions" />
        </div>

        <p v-if="error" class="asmodal__error">{{ error }}</p>

        <div class="asmodal__actions">
          <BwButton type="button" variant="secondary" @click="$emit('close')">{{ uz.adminStudents.cancel }}</BwButton>
          <BwButton type="submit" :loading="saving" :disabled="!isValid()">{{ uz.adminStudents.add }}</BwButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.asmodal-overlay {
  position: fixed;
  inset: 0;
  background: var(--layer-ink-42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}

.asmodal {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-lg);
  padding: 28px;
  max-width: 440px;
  width: 100%;
}

.asmodal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.asmodal__title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--ink);
}

.asmodal__close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: none;
  background: var(--line-2);
  color: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.asmodal__close:hover {
  background: var(--line);
}

.asmodal__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asmodal__row {
  display: flex;
  gap: 10px;
}

.asmodal__row > * {
  flex: 1;
  min-width: 0;
}

.asmodal__label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-3);
  margin-bottom: 6px;
}

.asmodal__phone {
  display: flex;
  align-items: center;
  height: 48px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.asmodal__phone:focus-within {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.asmodal__phone-prefix {
  padding: 0 12px;
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 14.5px;
  color: var(--ink);
  background: var(--bg);
  border-right: 1.5px solid var(--line);
  flex: none;
}

.asmodal__phone-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  height: 100%;
  padding: 0 12px;
  font-family: inherit;
  font-size: 14.5px;
  color: var(--ink);
}

.asmodal__error {
  margin: 0;
  font-size: 13px;
  color: var(--danger);
  font-weight: 600;
}

.asmodal__actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.asmodal__actions :deep(.bw-btn) {
  flex: 1;
}
</style>
