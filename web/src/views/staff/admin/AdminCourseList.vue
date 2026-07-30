<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  courses: { type: Array, required: true },
  selectedId: { type: Number, default: null },
})

defineEmits(['select', 'add'])
</script>

<template>
  <div class="acourses">
    <div class="acourses__head">
      <h4 class="acourses__title">{{ uz.courseBuilder.coursesTitle }}</h4>
      <button
        type="button"
        class="acourses__add"
        :aria-label="uz.courseBuilder.addCourse"
        @click="$emit('add')"
      >
        <BwIcon name="plus" :size="14" :stroke-width="2.4" />
      </button>
    </div>

    <button
      v-for="course in courses"
      :key="course.id"
      type="button"
      class="acourses__pill"
      :class="{ 'is-active': course.id === selectedId }"
      @click="$emit('select', course.id)"
    >
      {{ course.name }}
    </button>
  </div>
</template>

<style scoped>
.acourses {
  width: 230px;
  flex: none;
  background: var(--white);
  border-right: 1px solid var(--line-2);
  padding: 18px 14px;
}

.acourses__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.acourses__title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 800;
  color: var(--ink);
}

.acourses__add {
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

.acourses__add:hover {
  background: var(--green-mid);
}

.acourses__add:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.acourses__pill {
  display: block;
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
  cursor: pointer;
  margin-bottom: 6px;
}

.acourses__pill:hover {
  background: var(--bg);
}

.acourses__pill:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.acourses__pill.is-active {
  border-color: var(--green);
  background: var(--green-pale);
  color: var(--green-darker);
  font-weight: 700;
}
</style>
