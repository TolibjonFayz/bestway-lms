<script setup>
import { computed, ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwInput from '@/components/base/BwInput.vue'
import { createAdminTeacher, updateAdminTeacher } from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  groups: { type: Array, required: true },
  /** Null when adding, the teacher row when editing. */
  teacher: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])

const editing = computed(() => props.teacher !== null)

const fullName = ref(props.teacher?.fullName ?? '')
const phone = ref(props.teacher?.phone ?? '')
const password = ref('')
const selectedGroups = ref(new Set(props.teacher?.groups.map((group) => group.id) ?? []))
const saving = ref(false)
const error = ref('')

function toggleGroup(groupId) {
  const next = new Set(selectedGroups.value)
  if (next.has(groupId)) next.delete(groupId)
  else next.add(groupId)
  selectedGroups.value = next
}

/* On edit an empty password means "leave it alone", so it is only required
   when creating the account. */
const isValid = computed(() => {
  if (fullName.value.trim().length < 3) return false
  if (!/^\d{9}$/.test(phone.value)) return false
  if (!editing.value && password.value.length < 8) return false
  if (editing.value && password.value && password.value.length < 8) return false
  return true
})

async function submit() {
  if (!isValid.value || saving.value) return
  saving.value = true
  error.value = ''

  const payload = {
    fullName: fullName.value.trim(),
    phone: phone.value,
    groupIds: [...selectedGroups.value],
  }
  if (password.value) payload.password = password.value

  try {
    if (editing.value) await updateAdminTeacher(props.teacher.id, payload)
    else await createAdminTeacher(payload)
    emit('saved')
  } catch (cause) {
    error.value = cause?.response?.data?.message ?? uz.adminTeachers.saveError
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="atmodal-overlay" @click.self="$emit('close')">
    <div
      class="atmodal"
      role="dialog"
      aria-modal="true"
      :aria-label="editing ? uz.adminTeachers.modal.editTitle : uz.adminTeachers.modal.addTitle"
    >
      <div class="atmodal__head">
        <h3 class="atmodal__title">
          {{ editing ? uz.adminTeachers.modal.editTitle : uz.adminTeachers.modal.addTitle }}
        </h3>
        <button
          type="button"
          class="atmodal__close"
          :aria-label="uz.actions.close"
          @click="$emit('close')"
        >
          <BwIcon name="x" :size="15" :stroke-width="2" />
        </button>
      </div>

      <form class="atmodal__form" @submit.prevent="submit">
        <BwInput
          v-model="fullName"
          :label="uz.adminTeachers.modal.fullName"
          :placeholder="uz.adminTeachers.modal.fullNamePlaceholder"
          required
        />

        <div class="atmodal__field">
          <label class="atmodal__label">{{ uz.adminTeachers.modal.phone }}</label>
          <div class="atmodal__phone">
            <span class="atmodal__phone-prefix">+998</span>
            <input
              v-model="phone"
              class="atmodal__phone-input"
              type="tel"
              inputmode="numeric"
              maxlength="9"
              placeholder="90 123 45 67"
            />
          </div>
        </div>

        <BwInput
          v-model="password"
          type="password"
          :label="editing ? uz.adminTeachers.modal.passwordNew : uz.adminTeachers.modal.password"
          :helper="editing ? uz.adminTeachers.modal.passwordEditHint : uz.adminTeachers.modal.passwordHint"
        />

        <div class="atmodal__field">
          <label class="atmodal__label">{{ uz.adminTeachers.modal.groups }}</label>
          <span class="atmodal__hint">{{ uz.adminTeachers.modal.groupsHint }}</span>
          <div class="atmodal__groups">
            <button
              v-for="group in groups"
              :key="group.id"
              type="button"
              class="atmodal__group"
              :class="{ 'is-on': selectedGroups.has(group.id) }"
              @click="toggleGroup(group.id)"
            >
              {{ group.name }}
            </button>
          </div>
        </div>

        <p v-if="error" class="atmodal__error">{{ error }}</p>

        <div class="atmodal__actions">
          <BwButton type="button" variant="secondary" @click="$emit('close')">
            {{ uz.adminTeachers.modal.cancel }}
          </BwButton>
          <BwButton type="submit" :loading="saving" :disabled="!isValid">
            {{ uz.adminTeachers.modal.save }}
          </BwButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.atmodal-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: var(--layer-ink-86);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.atmodal {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-lg);
}

.atmodal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 12px;
}

.atmodal__title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.atmodal__close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 9px;
  background: var(--bg);
  color: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.atmodal__close:hover {
  background: var(--line-2);
  color: var(--ink);
}

.atmodal__close:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.atmodal__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 20px 20px;
}

.atmodal__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.atmodal__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}

.atmodal__hint {
  font-size: 11.5px;
  color: var(--gray-2);
}

.atmodal__phone {
  display: flex;
  align-items: center;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  background: var(--white);
}

.atmodal__phone:focus-within {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.atmodal__phone-prefix {
  padding: 0 11px;
  font-size: 14px;
  font-weight: 700;
  color: var(--gray);
  border-right: 1px solid var(--line);
  height: 100%;
  display: flex;
  align-items: center;
}

.atmodal__phone-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  padding: 0 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
}

.atmodal__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 2px;
}

.atmodal__group {
  height: 32px;
  padding: 0 13px;
  border-radius: 99px;
  border: 1px solid var(--line);
  background: var(--white);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gray);
  cursor: pointer;
}

.atmodal__group.is-on {
  border-color: var(--green);
  background: var(--green-pale);
  color: var(--green-darker);
}

.atmodal__group:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.atmodal__error {
  margin: 0;
  font-size: 12.5px;
  color: var(--danger);
  font-weight: 500;
}

.atmodal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 2px;
}
</style>
