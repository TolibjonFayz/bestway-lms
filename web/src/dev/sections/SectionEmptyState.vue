<script setup>
import BwEmptyState from '@/components/base/BwEmptyState.vue'
import DsSection from '../DsSection.vue'
import uz from '@/locales/uz'
import ds from '../dsCopy'
</script>

<template>
  <DsSection number="09" :title="ds.emptyState" gloss="Empty state" :head-space="8">
    <BwEmptyState
      :title="uz.empty.noHomeworkTitle"
      :description="uz.empty.noHomeworkText"
      :action-label="uz.actions.viewLessons"
    />
  </DsSection>
</template>
