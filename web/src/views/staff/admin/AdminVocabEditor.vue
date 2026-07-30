<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { createAdminVocabWord, deleteAdminVocabWord } from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  itemId: { type: Number, required: true },
  words: { type: Array, required: true },
})

const emit = defineEmits(['changed', 'import'])

const adding = ref(false)
const newEn = ref('')
const newUz = ref('')
const saving = ref(false)

function startAdd() {
  adding.value = true
  newEn.value = ''
  newUz.value = ''
}

async function saveRow() {
  if (!newEn.value.trim() || !newUz.value.trim() || saving.value) return
  saving.value = true
  try {
    await createAdminVocabWord(props.itemId, { wordEn: newEn.value.trim(), wordUz: newUz.value.trim() })
    adding.value = false
    emit('changed')
  } finally {
    saving.value = false
  }
}

async function removeWord(id) {
  await deleteAdminVocabWord(id)
  emit('changed')
}
</script>

<template>
  <div>
    <div class="aveditor__label">{{ uz.courseBuilder.vocabEditorTitle }}</div>
    <div class="aveditor">
      <div class="aveditor__head">
        <span>{{ uz.courseBuilder.colEnglish }}</span>
        <span>{{ uz.courseBuilder.colUzbek }}</span>
        <span />
      </div>

      <div v-for="word in words" :key="word.id" class="aveditor__row">
        <span class="aveditor__en">{{ word.wordEn }}</span>
        <span class="aveditor__uz">{{ word.wordUz }}</span>
        <button
          type="button"
          class="aveditor__delete"
          :aria-label="uz.courseBuilder.delete"
          @click="removeWord(word.id)"
        >
          <BwIcon name="x" :size="12" :stroke-width="2.4" />
        </button>
      </div>

      <div v-if="adding" class="aveditor__row aveditor__row--new">
        <input v-model="newEn" class="aveditor__input" :placeholder="uz.courseBuilder.colEnglish" @keyup.enter="saveRow" />
        <input v-model="newUz" class="aveditor__input" :placeholder="uz.courseBuilder.colUzbek" @keyup.enter="saveRow" />
        <button type="button" class="aveditor__confirm" :disabled="saving" @click="saveRow">
          <BwIcon name="check" :size="13" :stroke-width="2.6" />
        </button>
      </div>

      <div class="aveditor__actions">
        <button type="button" class="aveditor__action aveditor__action--add" @click="startAdd">
          <BwIcon name="plus" :size="14" :stroke-width="2.4" />{{ uz.courseBuilder.addRow }}
        </button>
        <button type="button" class="aveditor__action aveditor__action--csv" @click="$emit('import')">
          <BwIcon name="download" :size="14" />{{ uz.courseBuilder.csvImport }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aveditor__label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 10px;
}

.aveditor {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 22px;
}

.aveditor__head {
  display: grid;
  grid-template-columns: 1fr 1fr 32px;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-2);
}

.aveditor__row {
  display: grid;
  grid-template-columns: 1fr 1fr 32px;
  gap: 8px;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid var(--line-2);
}

.aveditor__row:last-of-type {
  border-bottom: none;
}

.aveditor__en {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.aveditor__uz {
  font-size: 14px;
  color: var(--gray);
}

.aveditor__delete {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: none;
  background: var(--danger-soft);
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.aveditor__delete:hover {
  background: var(--danger-line);
}

.aveditor__input {
  height: 32px;
  padding: 0 9px;
  border: 1.5px solid var(--line);
  border-radius: 7px;
  font-family: inherit;
  font-size: 13.5px;
  color: var(--ink);
  outline: none;
}

.aveditor__input:focus {
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.aveditor__confirm {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: none;
  background: var(--green-mid);
  color: var(--green-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.aveditor__actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.aveditor__action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  border: none;
  padding: 8px 14px;
  border-radius: 9px;
  cursor: pointer;
}

.aveditor__action--add {
  color: var(--green-dark);
  background: var(--green-pale);
}

.aveditor__action--add:hover {
  background: var(--green-mid);
}

.aveditor__action--csv {
  color: var(--ink-3);
  background: var(--line-2);
}

.aveditor__action--csv:hover {
  background: var(--line);
}
</style>
