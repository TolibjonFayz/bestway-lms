<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import uz from '@/locales/uz'

const STATUS_COLOR = {
  kelgan: 'var(--green)',
  kelmagan: 'var(--danger)',
  kechikkan: 'var(--amber)',
  sababli: 'var(--sky-ink)',
}

defineProps({
  /** Viewport coordinates of the cell that opened the menu. */
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  current: { type: String, default: null },
})

const emit = defineEmits(['choose', 'close'])

const menuEl = ref(null)

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

/* A click anywhere else closes it. Registered on the next frame so the click
   that opened the menu does not immediately close it again. */
function onDocumentClick(event) {
  if (!menuEl.value?.contains(event.target)) emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  requestAnimationFrame(() => document.addEventListener('click', onDocumentClick))
  menuEl.value?.querySelector('button')?.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div
    ref="menuEl"
    class="asmenu"
    role="menu"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <button
      v-for="(label, status) in uz.attendanceRegister.statuses"
      :key="status"
      type="button"
      role="menuitem"
      class="asmenu__item"
      :class="{ 'is-current': current === status }"
      @click="$emit('choose', status)"
    >
      <i class="asmenu__swatch" :style="{ background: STATUS_COLOR[status] }" />{{ label }}
    </button>

    <button
      v-if="current"
      type="button"
      role="menuitem"
      class="asmenu__item asmenu__item--clear"
      @click="$emit('choose', null)"
    >
      {{ uz.attendanceRegister.clear }}
    </button>
  </div>
</template>

<style scoped>
.asmenu {
  position: fixed;
  z-index: 60;
  min-width: 158px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--sh-lg);
  padding: 5px;
}

.asmenu__item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
}

.asmenu__item:hover {
  background: var(--bg);
}

.asmenu__item:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.asmenu__item.is-current {
  background: var(--green-pale);
}

.asmenu__item--clear {
  color: var(--gray);
  border-top: 1px solid var(--line-2);
  border-radius: 0 0 8px 8px;
  margin-top: 3px;
  padding-top: 3px;
}

.asmenu__swatch {
  width: 13px;
  height: 13px;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>
