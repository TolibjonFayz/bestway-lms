<script setup>
import { computed, ref, watch } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import { parseVideoSource, youtubeThumbnail } from '@/composables/useVideoSource'
import { updateAdminLessonItem } from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(['changed'])

const url = ref(props.item.videoUrl ?? '')
const duration = ref(props.item.videoDurationSeconds ?? 0)
const saving = ref(false)
const savedFlash = ref(false)
const serverError = ref('')

/* Switching to another unit reuses this component. */
watch(
  () => props.item,
  (item) => {
    url.value = item.videoUrl ?? ''
    duration.value = item.videoDurationSeconds ?? 0
    serverError.value = ''
  },
)

const parsed = computed(() => parseVideoSource(url.value))
const isEmpty = computed(() => url.value.trim() === '')

/* Only complain once there is something to complain about — an empty field is
   a normal state for a unit still being built, not an error. */
const invalid = computed(() => !isEmpty.value && parsed.value === null)

const previewSrc = computed(() =>
  parsed.value?.kind === 'youtube' ? youtubeThumbnail(parsed.value.id) : null,
)

/* A file URL is a valid source with no thumbnail to show, which is not the
   same thing as having no source at all — say which one it is. */
const placeholderText = computed(() =>
  parsed.value?.kind === 'file'
    ? uz.courseBuilder.videoFileSource
    : uz.courseBuilder.videoNoSource,
)

const dirty = computed(
  () =>
    url.value.trim() !== (props.item.videoUrl ?? '').trim() ||
    Number(duration.value) !== (props.item.videoDurationSeconds ?? 0),
)

async function save() {
  if (invalid.value || saving.value || !dirty.value) return
  saving.value = true
  serverError.value = ''
  try {
    await updateAdminLessonItem(props.item.id, {
      title: props.item.title,
      videoUrl: url.value.trim(),
      videoDurationSeconds: Number(duration.value) || 0,
    })
    savedFlash.value = true
    setTimeout(() => (savedFlash.value = false), 1500)
    emit('changed')
  } catch (error) {
    serverError.value = error?.response?.data?.message ?? uz.courseBuilder.videoSaveError
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="avideo__label">{{ uz.courseBuilder.videoEditorTitle }}</div>
    <div class="avideo">
      <div class="avideo__grid">
        <div class="avideo__preview">
          <img v-if="previewSrc" :src="previewSrc" :alt="uz.courseBuilder.videoPreviewAlt" />
          <div v-else class="avideo__preview-empty">
            <BwIcon name="video" :size="22" />
            <span>{{ placeholderText }}</span>
          </div>
        </div>

        <div class="avideo__fields">
          <label class="avideo__field">
            <span class="avideo__field-label">{{ uz.courseBuilder.videoUrlLabel }}</span>
            <input
              v-model="url"
              class="avideo__input"
              :class="{ 'is-invalid': invalid }"
              type="url"
              inputmode="url"
              :placeholder="uz.courseBuilder.videoUrlPlaceholder"
              @keyup.enter="save"
            />
          </label>

          <label class="avideo__field avideo__field--short">
            <span class="avideo__field-label">{{ uz.courseBuilder.videoDurationLabel }}</span>
            <input
              v-model="duration"
              class="avideo__input"
              type="number"
              min="0"
              @keyup.enter="save"
            />
          </label>
        </div>
      </div>

      <p v-if="invalid" class="avideo__error">{{ uz.courseBuilder.videoUrlInvalid }}</p>
      <p v-else-if="serverError" class="avideo__error">{{ serverError }}</p>
      <p v-else class="avideo__hint">{{ uz.courseBuilder.videoUnlistedHint }}</p>

      <button
        type="button"
        class="avideo__save"
        :disabled="invalid || saving || !dirty"
        @click="save"
      >
        {{ savedFlash ? uz.courseBuilder.saved : uz.courseBuilder.save }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.avideo__label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin: 18px 0 10px;
}

.avideo {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  padding: 16px;
}

.avideo__grid {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.avideo__preview {
  width: 160px;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  background: var(--line-2);
  flex-shrink: 0;
}

.avideo__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avideo__preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--gray-2);
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  padding: 0 8px;
}

.avideo__fields {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avideo__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.avideo__field--short {
  max-width: 180px;
}

.avideo__field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray);
}

.avideo__input {
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--white);
  font-family: inherit;
  font-size: 13.5px;
  color: var(--ink);
  width: 100%;
}

.avideo__input:focus-visible {
  outline: none;
  border-color: var(--green);
  box-shadow: var(--ring-green);
}

.avideo__input.is-invalid {
  border-color: var(--danger);
}

.avideo__hint {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--gray);
}

.avideo__error {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--danger);
  font-weight: 600;
}

.avideo__save {
  margin-top: 12px;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  height: 36px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  background: var(--green);
  color: var(--white);
  cursor: pointer;
}

.avideo__save:disabled {
  background: var(--line);
  color: var(--gray-2);
  cursor: not-allowed;
}

.avideo__save:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}
</style>
