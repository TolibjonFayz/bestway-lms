<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  item: { type: Object, required: true },
})

defineEmits(['open'])

const expanded = ref(false)
</script>

<template>
  <div
    class="vcard"
    role="button"
    tabindex="0"
    @click="$emit('open', item)"
    @keydown.enter.prevent="$emit('open', item)"
  >
    <span class="vcard__wave" />
    <div class="vcard__inner">
      <div class="vcard__head">
        <span class="vcard__tile"><BwIcon name="star" :size="21" /></span>
        <div class="vcard__text">
          <div class="vcard__title">{{ uz.itemTypes.vocabulary }}</div>
          <div class="vcard__meta">
            {{ uz.lessons.wordCount.replace('{n}', item.vocabulary?.wordCount ?? 0) }}
          </div>
        </div>
        <button
          class="vcard__toggle"
          :class="{ 'is-open': expanded }"
          type="button"
          :aria-expanded="expanded"
          :aria-label="expanded ? uz.lessons.collapse : uz.lessons.expand"
          @click.stop="expanded = !expanded"
        >
          <BwIcon name="chevron-down" :size="16" :stroke-width="2.2" />
        </button>
      </div>

      <div class="vcard__progress">
        <div class="vcard__track">
          <div class="vcard__fill" :style="{ width: `${item.percent}%` }" />
        </div>
        <span class="vcard__percent bw-nums">{{ item.percent }}%</span>
      </div>

      <div v-if="expanded" class="vcard__list">
        <div
          v-for="(word, index) in item.vocabulary?.preview ?? []"
          :key="word.wordEn"
          class="vcard__row"
          :class="{ 'is-last': index === (item.vocabulary?.preview?.length ?? 0) - 1 }"
        >
          <span class="vcard__en">{{ word.wordEn }}</span>
          <span class="vcard__uz">{{ word.wordUz }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vcard {
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  background: var(--green-pale);
}

.vcard:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.vcard__wave {
  display: none;
}

.vcard__inner {
  position: relative;
  padding: 15px;
}

.vcard__head {
  display: flex;
  align-items: center;
  gap: 11px;
}

.vcard__tile {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--white);
  color: var(--amber);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.vcard__text {
  flex: 1;
  min-width: 0;
}

.vcard__title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
}

.vcard__meta {
  font-size: 12px;
  color: var(--gray);
}

.vcard__toggle {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: none;
  background: var(--white);
  color: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
  transition: transform 0.15s;
}

.vcard__toggle.is-open {
  transform: rotate(180deg);
}

.vcard__toggle:hover {
  background: var(--green-mid);
  color: var(--green-darker);
}

.vcard__toggle:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}

.vcard__progress {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
}

.vcard__track {
  flex: 1;
  height: 8px;
  background: var(--white);
  border-radius: 99px;
  overflow: hidden;
}

.vcard__fill {
  height: 100%;
  background: var(--green);
  border-radius: 99px;
}

.vcard__percent {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--green);
}

.vcard__list {
  margin-top: 14px;
  background: var(--white);
  border-radius: 13px;
  padding: 6px;
  box-shadow: var(--sh-vocab-list);
}

.vcard__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 10px;
  border-bottom: 1px solid var(--line-2);
}

.vcard__row.is-last {
  border-bottom: none;
}

.vcard__en {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.vcard__uz {
  font-size: 14px;
  color: var(--gray);
}

@media (min-width: 1024px) {
  .vcard {
    border-radius: 18px;
    background: linear-gradient(180deg, var(--green-pale), var(--white));
  }

  .vcard__wave {
    display: block;
    position: absolute;
    width: 120px;
    height: 60px;
    background: var(--green-soft);
    opacity: 0.55;
    clip-path: polygon(0 100%, 25% 30%, 45% 70%, 60% 10%, 80% 60%, 100% 20%, 100% 100%);
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }

  .vcard__inner {
    padding: 18px;
  }

  .vcard__head {
    gap: 12px;
  }

  .vcard__tile {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    box-shadow: var(--sh-vocab-tile);
  }

  .vcard__title {
    font-size: 15.5px;
  }

  .vcard__meta {
    font-size: 13px;
    font-weight: 500;
    margin-top: 2px;
  }
}
</style>
