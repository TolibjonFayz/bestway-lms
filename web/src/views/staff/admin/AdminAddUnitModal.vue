<script setup>
import { ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwInput from '@/components/base/BwInput.vue'
import { createAdminUnit } from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  courseId: { type: Number, required: true },
})

const emit = defineEmits(['close', 'created'])

const title = ref('')
const saving = ref(false)
const error = ref('')

async function submit() {
  if (!title.value.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const unit = await createAdminUnit(props.courseId, { title: title.value.trim() })
    emit('created', unit)
  } catch (cause) {
    error.value = cause?.response?.data?.message ?? uz.courseBuilder.errorText
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="amodal-overlay" @click.self="$emit('close')">
    <div class="amodal" role="dialog" aria-modal="true" :aria-label="uz.courseBuilder.addUnitTitle">
      <div class="amodal__head">
        <h3 class="amodal__title">{{ uz.courseBuilder.addUnitTitle }}</h3>
        <button type="button" class="amodal__close" :aria-label="uz.actions.close" @click="$emit('close')">
          <BwIcon name="x" :size="15" :stroke-width="2" />
        </button>
      </div>

      <form class="amodal__form" @submit.prevent="submit">
        <BwInput
          v-model="title"
          :label="uz.courseBuilder.unitTitleLabel"
          placeholder="Unit 4.1 — Reported Speech"
          required
        />
        <p v-if="error" class="amodal__error">{{ error }}</p>

        <div class="amodal__actions">
          <BwButton type="button" variant="secondary" @click="$emit('close')">{{ uz.actions.cancel }}</BwButton>
          <BwButton type="submit" :loading="saving" :disabled="!title.trim()">{{ uz.courseBuilder.addUnit }}</BwButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.amodal-overlay {
  position: fixed;
  inset: 0;
  background: var(--layer-ink-42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}

.amodal {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-lg);
  padding: 28px;
  max-width: 400px;
  width: 100%;
}

.amodal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.amodal__title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--ink);
}

.amodal__close {
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

.amodal__close:hover {
  background: var(--line);
}

.amodal__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.amodal__error {
  margin: 0;
  font-size: 13px;
  color: var(--danger);
  font-weight: 600;
}

.amodal__actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.amodal__actions :deep(.bw-btn) {
  flex: 1;
}
</style>
