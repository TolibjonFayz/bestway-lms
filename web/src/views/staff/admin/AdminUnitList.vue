<script setup>
import { ref } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  units: { type: Array, required: true },
  selectedId: { type: Number, default: null },
})

const emit = defineEmits(['select', 'add', 'reorder'])

const dragIndex = ref(null)

function onDrop(units, index) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const next = [...units]
  const [moved] = next.splice(dragIndex.value, 1)
  next.splice(index, 0, moved)
  dragIndex.value = null
  emit('reorder', next.map((unit) => unit.id))
}
</script>

<template>
  <div class="aunits">
    <div class="aunits__head">
      <h4 class="aunits__title">{{ uz.courseBuilder.unitsTitle }}</h4>
      <button
        type="button"
        class="aunits__add"
        :aria-label="uz.courseBuilder.addUnit"
        @click="$emit('add')"
      >
        <BwIcon name="plus" :size="14" :stroke-width="2.4" />
      </button>
    </div>

    <button
      v-for="(unit, index) in units"
      :key="unit.id"
      type="button"
      class="aunits__pill"
      :class="{ 'is-active': unit.id === selectedId, 'is-dragging': dragIndex === index }"
      draggable="true"
      @click="$emit('select', unit.id)"
      @dragstart="dragIndex = index"
      @dragover.prevent
      @drop="onDrop(units, index)"
    >
      <BwIcon name="grip" :size="15" class="aunits__grip" />
      <span class="aunits__label">{{ unit.title }}</span>
    </button>

    <p v-if="units.length > 1" class="aunits__hint">{{ uz.courseBuilder.reorderHint }}</p>
  </div>
</template>

<style scoped>
.aunits {
  width: 270px;
  flex: none;
  background: var(--white);
  border-right: 1px solid var(--line-2);
  padding: 18px 14px;
}

.aunits__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.aunits__title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 800;
  color: var(--ink);
}

.aunits__add {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--green-pale);
  color: var(--green);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.aunits__add:hover {
  background: var(--green-mid);
}

.aunits__add:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.aunits__pill {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: transparent;
  color: var(--ink-3);
  font-family: inherit;
  font-weight: 600;
  font-size: 13.5px;
  cursor: grab;
  margin-bottom: 6px;
}

.aunits__pill:hover {
  background: var(--bg);
}

.aunits__pill:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.aunits__pill.is-active {
  border-color: var(--green);
  background: var(--green-pale);
  color: var(--green-darker);
  font-weight: 700;
}

.aunits__pill.is-dragging {
  opacity: 0.5;
}

.aunits__grip {
  color: var(--gray-2);
  flex: none;
}

.aunits__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aunits__hint {
  font-size: 11.5px;
  color: var(--gray-2);
  margin: 12px 4px 0;
  line-height: 1.4;
}
</style>
