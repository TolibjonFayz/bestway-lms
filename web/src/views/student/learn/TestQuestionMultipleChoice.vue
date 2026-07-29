<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue'])

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function pick(optionId) {
  emit('update:modelValue', optionId)
}
</script>

<template>
  <div class="tqm">
    <div class="tqm__label">{{ uz.test.pickOne }}</div>
    <div class="tqm__prompt">{{ question.prompt }}</div>
    <div class="tqm__options">
      <button
        v-for="(option, index) in question.options"
        :key="option.id"
        type="button"
        class="tqm__option"
        :class="{ 'is-selected': modelValue === option.id }"
        @click="pick(option.id)"
      >
        <span class="tqm__badge" :class="{ 'is-selected': modelValue === option.id }">
          {{ LETTERS[index] ?? index + 1 }}
        </span>
        <span class="tqm__text">{{ option.text }}</span>
        <BwIcon
          v-if="modelValue === option.id"
          name="check"
          :size="18"
          :stroke-width="3"
          class="tqm__check"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.tqm__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.tqm__prompt {
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.5;
  margin-bottom: 16px;
}

.tqm__options {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.tqm__option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  padding: 13px 14px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 14.5px;
  font-weight: 600;
  border: 1.5px solid var(--line);
  background: var(--white);
  color: var(--ink);
  transition: border-color 0.15s, background 0.15s;
}

.tqm__option:hover {
  border-color: var(--green-soft);
}

.tqm__option:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tqm__option.is-selected {
  border-color: var(--green);
  background: var(--green-pale);
  color: var(--green-darker);
}

.tqm__badge {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  flex: none;
  background: var(--line-2);
  color: var(--ink-3);
}

.tqm__badge.is-selected {
  background: var(--green);
  color: var(--white);
}

.tqm__text {
  flex: 1;
}

.tqm__check {
  color: var(--green);
  flex: none;
}

@media (min-width: 1024px) {
  .tqm__prompt {
    font-size: 19px;
    margin-bottom: 18px;
  }

  .tqm__option {
    padding: 15px 18px;
    border-radius: 14px;
    font-size: 15.5px;
    gap: 14px;
  }

  .tqm__badge {
    width: 30px;
    height: 30px;
  }
}
</style>
