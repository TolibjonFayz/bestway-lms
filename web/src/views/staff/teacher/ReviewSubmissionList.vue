<script setup>
import BwAvatar from '@/components/base/BwAvatar.vue'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

defineProps({
  items: { type: Array, required: true },
  selectedId: { type: Number, default: null },
})

defineEmits(['select'])

const { time } = useUzbekDate()
</script>

<template>
  <div class="rlist">
    <div class="rlist__head">
      <h4 class="rlist__title">{{ uz.review.listTitle }}</h4>
      <p class="rlist__count">{{ uz.review.newCount.replace('{n}', items.length) }}</p>
    </div>

    <div class="rlist__scroll bw-scroll">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="rlist__row"
        :class="{ 'is-active': item.id === selectedId }"
        @click="$emit('select', item.id)"
      >
        <BwAvatar :name="item.studentName" :size="38" :font-size="13" />
        <span class="rlist__body">
          <span class="rlist__name">{{ item.studentName }}</span>
          <span class="rlist__meta">{{ item.unitTitle }} · {{ uz.itemTypes[item.itemType] }}</span>
        </span>
        <span v-if="item.status === 'graded'" class="rlist__chip rlist__chip--graded">
          ✓ {{ item.score }}%
        </span>
        <span v-else class="rlist__chip rlist__chip--pending">{{ time(item.submittedAt) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.rlist {
  width: 340px;
  flex: none;
  background: var(--white);
  border-right: 1px solid var(--line-2);
  display: flex;
  flex-direction: column;
}

.rlist__head {
  padding: 20px 18px 12px;
}

.rlist__title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--ink);
}

.rlist__count {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--gray-2);
}

.rlist__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 10px;
}

.rlist__row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px;
  border-radius: 13px;
  border: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  margin-bottom: 4px;
}

.rlist__row:hover {
  background: var(--bg);
}

.rlist__row.is-active {
  background: var(--green-pale);
  box-shadow: inset 0 0 0 1.5px var(--green);
}

.rlist__row:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--green);
}

.rlist__body {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.rlist__name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rlist__meta {
  display: block;
  font-size: 12px;
  color: var(--gray-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rlist__chip {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 99px;
  flex: none;
}

.rlist__chip--pending {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.rlist__chip--graded {
  color: var(--green-dark);
  background: var(--green-mid);
}

@media (max-width: 1023px) {
  .rlist {
    width: 100%;
    border-right: none;
  }
}
</style>
