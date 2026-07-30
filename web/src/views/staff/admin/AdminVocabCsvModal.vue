<script setup>
import { ref } from 'vue'
import BwButton from '@/components/base/BwButton.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { importAdminVocabCsv } from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  itemId: { type: Number, required: true },
})

const emit = defineEmits(['close', 'imported'])

const csv = ref('')
const importing = ref(false)
const result = ref(null)
const error = ref(null)

async function runImport() {
  if (!csv.value.trim() || importing.value) return
  importing.value = true
  error.value = null
  try {
    result.value = await importAdminVocabCsv(props.itemId, csv.value)
    emit('imported')
  } catch (cause) {
    error.value = cause
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="acsv-overlay" @click.self="$emit('close')">
    <div class="acsv" role="dialog" aria-modal="true" :aria-label="uz.courseBuilder.csvImportTitle">
      <div class="acsv__head">
        <h3 class="acsv__title">{{ uz.courseBuilder.csvImportTitle }}</h3>
        <button type="button" class="acsv__close" :aria-label="uz.actions.close" @click="$emit('close')">
          <BwIcon name="x" :size="15" :stroke-width="2" />
        </button>
      </div>

      <p class="acsv__hint">{{ uz.courseBuilder.csvHint }}</p>
      <textarea
        v-model="csv"
        class="acsv__textarea"
        rows="8"
        :placeholder="uz.courseBuilder.csvPlaceholder"
        :disabled="importing"
      />

      <p v-if="result" class="acsv__result">
        {{ uz.courseBuilder.csvImported.replace('{created}', result.created).replace('{skipped}', result.skipped) }}
      </p>
      <p v-if="error" class="acsv__error">{{ uz.courseBuilder.errorText }}</p>

      <div class="acsv__actions">
        <BwButton variant="secondary" @click="$emit('close')">{{ uz.actions.cancel }}</BwButton>
        <BwButton :loading="importing" :disabled="!csv.trim()" @click="runImport">
          {{ uz.courseBuilder.csvImportAction }}
        </BwButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acsv-overlay {
  position: fixed;
  inset: 0;
  background: var(--layer-ink-42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}

.acsv {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-lg);
  padding: 28px;
  max-width: 520px;
  width: 100%;
}

.acsv__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.acsv__title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--ink);
}

.acsv__close {
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

.acsv__close:hover {
  background: var(--line);
}

.acsv__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--gray);
  line-height: 1.5;
}

.acsv__textarea {
  width: 100%;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink);
  resize: vertical;
  outline: none;
}

.acsv__textarea:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.acsv__result {
  margin: 12px 0 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--green-dark);
}

.acsv__error {
  margin: 12px 0 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--danger);
}

.acsv__actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.acsv__actions :deep(.bw-btn) {
  flex: 1;
}
</style>
