<script setup>
import BwSkeleton from '@/components/base/BwSkeleton.vue'

/* Placeholders for each block of the loaded dashboard. The heights are the
   measured heights of the real sections at each breakpoint, so swapping the
   skeleton for real content does not move the page — CLAUDE.md's "no layout
   shift" rule. They travel as custom properties because BwSkeleton writes its
   size inline, which would beat any class declared here. */
</script>

<template>
  <div class="dsk" aria-busy="true">
    <div class="dsk__stories">
      <div v-for="n in 6" :key="n" class="dsk__story">
        <BwSkeleton variant="circle" height="var(--dsk-story)" />
        <BwSkeleton width="80%" height="var(--dsk-story-label)" radius="6px" />
      </div>
    </div>

    <BwSkeleton
      variant="block"
      class="dsk__next"
      :radius="'var(--dsk-next-r)'"
      height="var(--dsk-next-h)"
    />

    <div class="dsk__stats">
      <BwSkeleton
        v-for="n in 4"
        :key="n"
        variant="block"
        radius="var(--dsk-card-r)"
        height="var(--dsk-stat-h)"
      />
    </div>

    <div class="dsk__section-head">
      <BwSkeleton width="120px" height="17px" />
      <BwSkeleton width="60px" height="13px" />
    </div>

    <BwSkeleton
      variant="block"
      class="dsk__cont"
      radius="var(--dsk-card-r)"
      height="var(--dsk-cont-h)"
    />

    <BwSkeleton
      variant="block"
      class="dsk__week"
      radius="var(--dsk-card-r)"
      height="var(--dsk-week-h)"
    />
  </div>
</template>

<style scoped>
.dsk {
  --dsk-story: 62px;
  --dsk-story-label: 25px;
  --dsk-next-h: 241px;
  --dsk-next-r: 20px;
  --dsk-card-r: 16px;
  --dsk-stat-h: 74px;
  --dsk-cont-h: 236px;
  --dsk-week-h: 133px;
}

.dsk__stories {
  display: flex;
  gap: 14px;
  padding: 2px 0 12px;
  overflow: hidden;
}

.dsk__story {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  flex: none;
  width: 70px;
}

.dsk__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.dsk__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 12px;
}

.dsk__week {
  margin-top: 16px;
}

@media (min-width: 1024px) {
  .dsk {
    --dsk-story: 70px;
    --dsk-story-label: 29px;
    --dsk-next-h: 144px;
    --dsk-next-r: 22px;
    --dsk-card-r: 18px;
    --dsk-stat-h: 161px;
    --dsk-cont-h: 156px;
    --dsk-week-h: 160px;
  }

  .dsk__stories {
    gap: 18px;
    padding: 22px 2px 12px;
    margin-top: 6px;
  }

  .dsk__story {
    width: 78px;
    gap: 9px;
  }

  .dsk__next {
    margin-top: 14px;
  }

  .dsk__stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 20px;
  }

  .dsk__section-head {
    margin: 26px 0 14px;
  }

  .dsk__week {
    margin-top: 20px;
  }
}
</style>
