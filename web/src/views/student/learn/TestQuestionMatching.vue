<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

/* modelValue is { [leftOptionId]: rightText }. The right column is served
   pre-shuffled and without ids (see tests.service.ts) so position alone
   cannot reveal a pairing — matching one to the other is the whole point of
   the question, so the client must not be able to shortcut it. */
const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue'])

/* Mirrors modelValue locally rather than reading props.modelValue on every
   click. update:modelValue is async — the prop does not reflect an emit
   until Vue's next flush — so building the next pairing by spreading
   props.modelValue drops any pair made moments earlier in the same burst of
   clicks. The parent's :key="question.id" remounts this component on every
   question change, so seeding from props.modelValue once at setup is enough. */
const pairs = ref({ ...props.modelValue })

/** The left term currently waiting for a right-hand pick, or null. */
const armedLeftId = ref(null)

function isMatched(leftId) {
  return pairs.value[leftId] !== undefined
}

function isRightUsed(text) {
  return Object.values(pairs.value).includes(text)
}

function leftIndexForRight(text) {
  const entry = Object.entries(pairs.value).find(([, value]) => value === text)
  if (!entry) return -1
  return props.question.left.findIndex((item) => item.id === Number(entry[0]))
}

function clickLeft(left) {
  if (isMatched(left.id)) {
    const next = { ...pairs.value }
    delete next[left.id]
    pairs.value = next
    emit('update:modelValue', next)
    armedLeftId.value = null
    return
  }
  armedLeftId.value = armedLeftId.value === left.id ? null : left.id
}

function clickRight(text) {
  if (armedLeftId.value === null || isRightUsed(text)) return
  const next = { ...pairs.value, [armedLeftId.value]: text }
  pairs.value = next
  emit('update:modelValue', next)
  armedLeftId.value = null
}
</script>

<template>
  <div class="tqma">
    <div class="tqma__label">{{ uz.test.matchPair }}</div>
    <div class="tqma__prompt">{{ question.prompt }}</div>
    <div class="tqma__cols">
      <div class="tqma__col">
        <button
          v-for="(item, index) in question.left"
          :key="item.id"
          type="button"
          class="tqma__pill"
          :class="{ 'is-matched': isMatched(item.id), 'is-armed': armedLeftId === item.id }"
          @click="clickLeft(item)"
        >
          <span class="tqma__num" :class="{ 'is-matched': isMatched(item.id) }">{{ index + 1 }}</span>
          <span class="tqma__text">{{ item.text }}</span>
          <BwIcon v-if="isMatched(item.id)" name="check" :size="13" :stroke-width="3" class="tqma__check" />
        </button>
      </div>
      <div class="tqma__col">
        <button
          v-for="(text, index) in question.right"
          :key="index"
          type="button"
          class="tqma__pill tqma__pill--right"
          :class="{ 'is-matched': isRightUsed(text) }"
          @click="clickRight(text)"
        >
          <span v-if="isRightUsed(text)" class="tqma__num is-matched">
            {{ leftIndexForRight(text) + 1 }}
          </span>
          <span class="tqma__text">{{ text }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tqma__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.tqma__prompt {
  font-size: 16.5px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.5;
  margin-bottom: 14px;
}

.tqma__cols {
  display: flex;
  gap: 14px;
}

.tqma__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.tqma__pill {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  padding: 11px 14px;
  border-radius: 11px;
  cursor: pointer;
  background: var(--white);
  border: 1.5px dashed var(--gray-3);
  color: var(--ink-3);
  font-weight: 700;
  font-size: 14px;
  transition: border-color 0.15s, background 0.15s;
}

.tqma__pill--right {
  font-weight: 600;
}

.tqma__pill:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.tqma__pill.is-armed {
  border: 1.5px solid var(--green);
  border-style: solid;
  background: var(--white);
  box-shadow: var(--ring-green);
  color: var(--green-darker);
}

.tqma__pill.is-matched {
  border: 1.5px solid var(--green);
  background: var(--green-pale);
  color: var(--ink);
}

.tqma__pill--right.is-matched {
  color: var(--green-darker);
  font-weight: 600;
}

.tqma__num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  background: var(--line-2);
  color: var(--ink-3);
}

.tqma__num.is-matched {
  background: var(--green);
  color: var(--white);
}

.tqma__text {
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
}

.tqma__check {
  color: var(--green);
  flex: none;
}

@media (min-width: 1024px) {
  .tqma__prompt {
    font-size: 19px;
  }

  .tqma__cols {
    gap: 18px;
  }

  .tqma__pill {
    font-size: 14.5px;
  }
}
</style>
