<script setup>
import BwCard from '@/components/base/BwCard.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import ds from '../dsCopy'
</script>

<template>
  <DsSection
    number="11"
    :title="ds.skeletons"
    gloss="Loading skeletons"
    :note="ds.skeletonsNote"
  >
    <DsLabel>{{ ds.skeletonStat }}</DsLabel>
    <div class="ds-skeletons__stats">
      <BwCard v-for="n in 4" :key="n" variant="stat">
        <BwSkeleton variant="circle" height="46px" radius="13px" />
        <BwSkeleton width="70%" height="34px" radius="10px" class="ds-skeletons__value" />
        <BwSkeleton width="45%" class="ds-skeletons__label" />
      </BwCard>
    </div>

    <DsLabel>{{ ds.skeletonList }}</DsLabel>
    <BwCard variant="list">
      <div v-for="n in 3" :key="n" class="ds-skeletons__row">
        <BwSkeleton variant="circle" height="44px" radius="12px" />
        <div class="ds-skeletons__row-body">
          <BwSkeleton width="42%" height="15px" />
          <BwSkeleton width="24%" height="12px" />
        </div>
        <BwSkeleton width="96px" height="26px" />
      </div>
    </BwCard>
  </DsSection>
</template>

<style scoped>
.ds-skeletons__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.ds-skeletons__value {
  margin-top: 16px;
}

.ds-skeletons__label {
  margin-top: 10px;
}

.ds-skeletons__row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line-2);
}

.ds-skeletons__row:last-child {
  border-bottom: none;
}

.ds-skeletons__row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
