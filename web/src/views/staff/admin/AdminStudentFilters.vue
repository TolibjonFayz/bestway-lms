<script setup>
import BwSearchInput from '@/components/base/BwSearchInput.vue'
import BwSelect from '@/components/base/BwSelect.vue'
import uz from '@/locales/uz'

const props = defineProps({
  search: { type: String, required: true },
  groupId: { type: [String, Number], required: true },
  level: { type: String, required: true },
  status: { type: String, required: true },
  groups: { type: Array, required: true },
})

const emit = defineEmits(['update:search', 'update:groupId', 'update:level', 'update:status'])

const levelOptions = [
  { value: '', label: uz.adminStudents.filterLevelAll },
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
]

const statusOptions = [
  { value: 'all', label: uz.adminStudents.filterStatusAll },
  { value: 'active', label: uz.adminStudents.filterStatusActive },
  { value: 'inactive', label: uz.adminStudents.filterStatusInactive },
]
</script>

<template>
  <div class="afilters">
    <BwSearchInput
      class="afilters__search"
      :model-value="search"
      :placeholder="uz.adminStudents.searchPlaceholder"
      @update:model-value="$emit('update:search', $event)"
    />
    <select
      class="afilters__select"
      :value="groupId"
      @change="$emit('update:groupId', $event.target.value)"
    >
      <option value="">{{ uz.adminStudents.filterGroupAll }}</option>
      <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
    </select>
    <BwSelect
      class="afilters__field"
      :model-value="level"
      :options="levelOptions"
      @update:model-value="$emit('update:level', $event)"
    />
    <BwSelect
      class="afilters__field"
      :model-value="status"
      :options="statusOptions"
      @update:model-value="$emit('update:status', $event)"
    />
  </div>
</template>

<style scoped>
.afilters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.afilters__search {
  flex: 1;
  min-width: 220px;
}

.afilters__field {
  width: 170px;
}

.afilters__select {
  height: 48px;
  padding: 0 14px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  font-family: inherit;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--ink-3);
  background: var(--white);
  cursor: pointer;
  width: 170px;
}

.afilters__select:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: var(--ring-green);
}
</style>
