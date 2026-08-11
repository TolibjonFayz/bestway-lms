<script setup>
import { computed, ref, watch } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import AdminQuestionEditor from './AdminQuestionEditor.vue'
import AdminVideoEditor from './AdminVideoEditor.vue'
import AdminVocabCsvModal from './AdminVocabCsvModal.vue'
import AdminVocabEditor from './AdminVocabEditor.vue'
import { allowedTypesFor, ITEM_TYPE_META } from './lessonItemTypes'
import {
  createAdminLessonItem,
  deleteAdminLessonItem,
  fetchAdminQuestions,
  fetchAdminVocabWords,
  reorderAdminLessonItems,
  updateAdminLessonItem,
} from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  unit: { type: Object, required: true },
})

const emit = defineEmits(['changed'])

const localItems = ref([...props.unit.items])
watch(() => props.unit, (unit) => (localItems.value = [...unit.items]))

const availableTypes = computed(() => allowedTypesFor(props.unit.subject))

const dragIndex = ref(null)
const savingOrder = ref(false)
const savedFlash = ref(false)

function onDrop(index) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const next = [...localItems.value]
  const [moved] = next.splice(dragIndex.value, 1)
  next.splice(index, 0, moved)
  dragIndex.value = null
  localItems.value = next
}

async function saveOrder() {
  savingOrder.value = true
  try {
    await reorderAdminLessonItems(props.unit.id, localItems.value.map((item) => item.id))
    savedFlash.value = true
    setTimeout(() => (savedFlash.value = false), 1500)
  } finally {
    savingOrder.value = false
  }
}

async function addItem(type) {
  await createAdminLessonItem(props.unit.id, { type, title: ITEM_TYPE_META[type].label })
  emit('changed')
}

const editingId = ref(null)
const editingTitle = ref('')

function startEdit(item) {
  editingId.value = item.id
  editingTitle.value = item.title
}

async function saveEdit() {
  if (!editingTitle.value.trim()) return
  await updateAdminLessonItem(editingId.value, { title: editingTitle.value.trim() })
  editingId.value = null
  emit('changed')
}

/* Two clicks instead of a native confirm() — matches the app's own modal
   styling and, unlike window.confirm, cannot get silently auto-dismissed. */
const confirmingDeleteId = ref(null)
let confirmTimer = null

function requestDelete(item) {
  if (confirmingDeleteId.value !== item.id) {
    confirmingDeleteId.value = item.id
    clearTimeout(confirmTimer)
    confirmTimer = setTimeout(() => (confirmingDeleteId.value = null), 3000)
    return
  }
  clearTimeout(confirmTimer)
  confirmingDeleteId.value = null
  removeItem(item)
}

async function removeItem(item) {
  await deleteAdminLessonItem(item.id)
  emit('changed')
}

function metaFor(item) {
  if (item.type === 'video') return item.videoDurationSeconds ? `${Math.round(item.videoDurationSeconds / 60)}:${String(item.videoDurationSeconds % 60).padStart(2, '0')}` : ''
  if (item.type === 'vocabulary') return uz.courseBuilder.vocabWordCount.replace('{n}', item.vocabWordCount ?? 0)
  if (item.type === 'test') return uz.courseBuilder.testQuestionCount.replace('{n}', item.testQuestionCount ?? 0)
  return ''
}

const videoItem = computed(() => localItems.value.find((item) => item.type === 'video'))
const vocabItem = computed(() => localItems.value.find((item) => item.type === 'vocabulary'))
const testItem = computed(() => localItems.value.find((item) => item.type === 'test'))

const vocabWords = ref([])
const questions = ref([])
const showCsvModal = ref(false)

async function loadVocab() {
  if (!vocabItem.value) return
  const page = await fetchAdminVocabWords(vocabItem.value.id, { limit: 100 })
  vocabWords.value = page.items
}

async function loadQuestions() {
  if (!testItem.value) return
  const page = await fetchAdminQuestions(testItem.value.id, { limit: 50 })
  questions.value = page.items
}

watch(vocabItem, loadVocab, { immediate: true })
watch(testItem, loadQuestions, { immediate: true })
</script>

<template>
  <div class="aunit-editor">
    <div class="aunit-editor__head">
      <h3 class="aunit-editor__title">{{ unit.title }}</h3>
      <button type="button" class="aunit-editor__save" :disabled="savingOrder" @click="saveOrder">
        {{ savedFlash ? uz.courseBuilder.saved : uz.courseBuilder.save }}
      </button>
    </div>

    <div class="aunit-editor__picker">
      <span class="aunit-editor__picker-label">{{ uz.courseBuilder.addItem }}</span>
      <button
        v-for="type in availableTypes"
        :key="type"
        type="button"
        class="aunit-editor__type-btn"
        @click="addItem(type)"
      >
        <BwIcon :name="ITEM_TYPE_META[type].icon" :size="13" />{{ ITEM_TYPE_META[type].label }}
      </button>
    </div>

    <div class="aunit-editor__items">
      <div
        v-for="(item, index) in localItems"
        :key="item.id"
        class="aunit-editor__card"
        draggable="true"
        :class="{ 'is-dragging': dragIndex === index }"
        @dragstart="dragIndex = index"
        @dragover.prevent
        @drop="onDrop(index)"
      >
        <BwIcon name="grip" :size="16" class="aunit-editor__grip" />
        <div class="aunit-editor__icon" :class="`aunit-editor__icon--${item.type}`">
          <BwIcon :name="ITEM_TYPE_META[item.type].icon" :size="16" />
        </div>

        <input
          v-if="editingId === item.id"
          v-model="editingTitle"
          class="aunit-editor__rename"
          @keyup.enter="saveEdit"
          @blur="saveEdit"
        />
        <span v-else class="aunit-editor__name">
          {{ item.title }}<template v-if="metaFor(item)"> — {{ metaFor(item) }}</template>
        </span>

        <button type="button" class="aunit-editor__btn" :aria-label="uz.courseBuilder.edit" @click="startEdit(item)">
          <BwIcon name="edit" :size="14" />
        </button>
        <button
          type="button"
          class="aunit-editor__btn aunit-editor__btn--danger"
          :class="{ 'is-confirming': confirmingDeleteId === item.id }"
          :aria-label="confirmingDeleteId === item.id ? uz.courseBuilder.delete + '?' : uz.courseBuilder.delete"
          @click="requestDelete(item)"
        >
          <BwIcon name="trash" :size="14" />
          <span v-if="confirmingDeleteId === item.id" class="aunit-editor__confirm-label">?</span>
        </button>
      </div>
    </div>

    <AdminVideoEditor
      v-if="videoItem"
      :key="videoItem.id"
      :item="videoItem"
      @changed="emit('changed')"
    />

    <AdminVocabEditor
      v-if="vocabItem"
      :item-id="vocabItem.id"
      :words="vocabWords"
      @changed="() => { loadVocab(); emit('changed') }"
      @import="showCsvModal = true"
    />

    <AdminQuestionEditor
      v-if="testItem && questions.length"
      :questions="questions"
      @changed="loadQuestions"
    />

    <AdminVocabCsvModal
      v-if="showCsvModal && vocabItem"
      :item-id="vocabItem.id"
      @close="showCsvModal = false"
      @imported="() => { loadVocab(); emit('changed') }"
    />
  </div>
</template>

<style scoped>
.aunit-editor {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: var(--bg);
  padding: 22px 26px;
}

.aunit-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.aunit-editor__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
}

.aunit-editor__save {
  font-family: inherit;
  font-weight: 700;
  font-size: 13.5px;
  color: var(--green-dark);
  background: var(--green-pale);
  border: none;
  padding: 8px 14px;
  border-radius: 9px;
  cursor: pointer;
  flex: none;
}

.aunit-editor__save:hover:not(:disabled) {
  background: var(--green-mid);
}

.aunit-editor__save:disabled {
  opacity: 0.6;
  cursor: default;
}

.aunit-editor__picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  align-items: center;
}

.aunit-editor__picker-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
  margin-right: 2px;
}

.aunit-editor__type-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  color: var(--ink);
  background: var(--white);
  border: 1.5px solid var(--line);
  padding: 6px 12px;
  border-radius: 99px;
  cursor: pointer;
}

.aunit-editor__type-btn:hover {
  border-color: var(--green);
  color: var(--green-dark);
}

.aunit-editor__items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 26px;
}

.aunit-editor__card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 14px;
  padding: 13px 14px;
  cursor: grab;
}

.aunit-editor__card.is-dragging {
  opacity: 0.5;
}

.aunit-editor__grip {
  color: var(--gray-3);
  flex: none;
}

.aunit-editor__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  background: var(--line-2);
  color: var(--gray);
}

.aunit-editor__icon--video {
  background: var(--ink);
  color: var(--white);
}

.aunit-editor__icon--vocabulary {
  background: var(--amber-soft);
  color: var(--amber);
}

.aunit-editor__name {
  flex: 1;
  min-width: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aunit-editor__rename {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 1.5px solid var(--green);
  border-radius: 8px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
  outline: none;
}

.aunit-editor__btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: none;
  background: var(--line-2);
  color: var(--ink-4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.aunit-editor__btn:hover {
  background: var(--line);
}

.aunit-editor__btn--danger {
  background: var(--danger-soft);
  color: var(--danger);
}

.aunit-editor__btn--danger:hover {
  background: var(--danger-line);
}

.aunit-editor__btn--danger.is-confirming {
  width: auto;
  padding: 0 10px;
  gap: 5px;
  background: var(--danger);
  color: var(--white);
}

.aunit-editor__confirm-label {
  font-weight: 800;
  font-size: 13px;
}
</style>
