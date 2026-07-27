<script setup>
import BwButton from '@/components/base/BwButton.vue'
import BwToast from '@/components/base/BwToast.vue'
import DsSection from '../DsSection.vue'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'
import ds from '../dsCopy'

const toast = useToast()

const SAMPLES = [
  ['success', uz.toast.submittedTitle, uz.toast.submittedText],
  ['warning', uz.toast.deadlineTitle, uz.toast.deadlineText],
  ['error', uz.toast.connectionTitle, uz.toast.connectionText],
  ['info', uz.toast.newLessonTitle, uz.toast.newLessonText],
]

/* Fires the real queue so useToast() and BwToastHost are exercised too. */
function fireAll() {
  SAMPLES.forEach(([variant, title, description], index) => {
    setTimeout(() => toast[variant](title, { description }), index * 220)
  })
}
</script>

<template>
  <DsSection number="10" :title="ds.toasts" gloss="Toasts & alerts" :note="ds.toastsNote">
    <div class="ds-toasts">
      <BwToast
        v-for="[variant, title, description] in SAMPLES"
        :key="variant"
        :variant="variant"
        :title="title"
        :description="description"
      />
    </div>

    <BwButton variant="secondary" class="ds-toasts__trigger" @click="fireAll">
      {{ ds.toastTrigger }}
    </BwButton>
  </DsSection>
</template>

<style scoped>
.ds-toasts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
}

.ds-toasts__trigger {
  margin-top: 22px;
}
</style>
