<script setup>
import BwBadge from '@/components/base/BwBadge.vue'
import BwCard from '@/components/base/BwCard.vue'
import BwLessonCard from '@/components/base/BwLessonCard.vue'
import BwListRow from '@/components/base/BwListRow.vue'
import BwStatCard from '@/components/base/BwStatCard.vue'
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import uz from '@/locales/uz'
import ds from '../dsCopy'

const STATS = [
  { icon: 'coins', tone: 'orange', value: '1,240', label: uz.gamification.coins, delta: '+120' },
  { icon: 'star', tone: 'amber', value: '2,860', label: uz.gamification.points },
  { icon: 'check-circle', tone: 'green-mid', value: '92', unit: '%', label: uz.gamification.attendance },
  { icon: 'flame', tone: 'orange', value: '7', unit: uz.gamification.days, label: uz.gamification.streak },
]
</script>

<template>
  <DsSection number="05" :title="ds.cards" gloss="Cards" :note="ds.cardsNote">
    <DsLabel>{{ ds.statCard }}</DsLabel>
    <div class="ds-cards__stats">
      <BwStatCard
        v-for="stat in STATS"
        :key="stat.label"
        :icon="stat.icon"
        :tone="stat.tone"
        :value="stat.value"
        :unit="stat.unit"
        :label="stat.label"
        :delta="stat.delta"
      />
    </div>

    <DsLabel>{{ ds.lessonCard }}</DsLabel>
    <BwLessonCard
      class="ds-cards__lesson"
      :title="ds.sample.unitTitle"
      :meta="ds.sample.unitMeta"
      status="progress"
      :status-label="uz.status.inProgress"
      level="B1"
      :progress="60"
    />

    <DsLabel>{{ ds.listCard }}</DsLabel>
    <BwCard variant="list">
      <BwListRow
        icon="play"
        tone="green"
        :title="ds.sample.videoLesson"
        :meta="ds.sample.videoMeta"
      >
        <template #trailing>
          <BwBadge variant="done" size="sm">{{ uz.status.done }}</BwBadge>
        </template>
      </BwListRow>

      <BwListRow
        icon="book-open"
        tone="orange"
        :title="ds.sample.vocabulary"
        :meta="ds.sample.vocabularyMeta"
      >
        <template #trailing>
          <BwBadge variant="progress" size="sm">{{ uz.status.inProgress }}</BwBadge>
        </template>
      </BwListRow>

      <BwListRow
        icon="pencil"
        tone="muted"
        :title="ds.sample.testHomework"
        :meta="ds.sample.testMeta"
        chevron
      >
        <template #trailing>
          <BwBadge variant="todo" size="sm" :dot="false">
            {{ uz.status.notStarted }}
          </BwBadge>
        </template>
      </BwListRow>
    </BwCard>
  </DsSection>
</template>

<style scoped>
.ds-cards__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.ds-cards__lesson {
  margin-bottom: 28px;
}
</style>
