<script setup>
import { updateAdminQuestion } from '@/api/admin'
import uz from '@/locales/uz'

const props = defineProps({
  questions: { type: Array, required: true },
})

const emit = defineEmits(['changed'])

async function setCorrect(question, optionId) {
  if (!question.editable) return
  await updateAdminQuestion(question.id, {
    prompt: question.prompt,
    options: question.options.map((option) => ({ text: option.text, isCorrect: option.id === optionId })),
  })
  emit('changed')
}
</script>

<template>
  <div>
    <div class="aqeditor__label">{{ uz.courseBuilder.testEditorTitle }}</div>
    <div class="aqeditor">
      <template v-for="(question, index) in questions" :key="question.id">
        <div v-if="index > 0" class="aqeditor__divider" />

        <div class="aqeditor__prompt">
          {{ question.prompt }}
          <span v-if="!question.editable" class="aqeditor__readonly">{{ uz.courseBuilder.readOnlyQuestion }}</span>
        </div>

        <div class="aqeditor__options">
          <button
            v-for="option in question.options"
            :key="option.id"
            type="button"
            class="aqeditor__option"
            :class="{ 'is-correct': question.editable && option.isCorrect, 'is-editable': question.editable }"
            :disabled="!question.editable"
            @click="setCorrect(question, option.id)"
          >
            <span class="aqeditor__dot" />
            {{ option.text }}
            <span v-if="question.editable && option.isCorrect" class="aqeditor__chip">{{ uz.courseBuilder.correct }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.aqeditor__label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 10px;
}

.aqeditor {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 16px;
  padding: 16px;
}

.aqeditor__divider {
  height: 1px;
  background: var(--line-2);
  margin: 12px 0;
}

.aqeditor__prompt {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 10px;
}

.aqeditor__readonly {
  font-weight: 600;
  font-size: 11px;
  color: var(--gray-2);
  margin-left: 8px;
  text-transform: none;
}

.aqeditor__options {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.aqeditor__option {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: inherit;
  font-size: 13.5px;
  color: var(--ink-3);
  background: transparent;
  border: none;
  padding: 0;
  text-align: left;
  cursor: default;
}

.aqeditor__option.is-editable {
  cursor: pointer;
}

.aqeditor__option.is-correct {
  color: var(--green-darker);
  font-weight: 700;
}

.aqeditor__dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--gray-3);
  flex: none;
}

.aqeditor__option.is-correct .aqeditor__dot {
  border: 5px solid var(--green);
}

.aqeditor__chip {
  font-weight: 600;
  color: var(--green);
  font-size: 11.5px;
  background: var(--green-mid);
  padding: 2px 7px;
  border-radius: 99px;
  margin-left: 2px;
}
</style>
