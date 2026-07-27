<script setup>
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwAvatarGroup from '@/components/base/BwAvatarGroup.vue'
import BwNotificationBell from '@/components/base/BwNotificationBell.vue'
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import DsSpecimen from '../DsSpecimen.vue'
import ds from '../dsCopy'

const FALLBACKS = [
  { name: 'Jasur Rahimov', size: 56, tone: 'green' },
  { name: 'Malika Yoʻldosheva', size: 44, tone: 'orange' },
  { name: 'Sardor Karimov', size: 32, tone: 'ink' },
]

const GROUP = [
  { name: 'Jasur Rahimov', tone: 'green' },
  { name: 'Malika Yoʻldosheva', tone: 'orange' },
  { name: 'Sardor Karimov', tone: 'ink-2' },
  { name: 'Aziz Axtamov', tone: 'green' },
  { name: 'Nodira Tosheva', tone: 'orange' },
  { name: 'Bekzod Aliyev', tone: 'ink' },
]
</script>

<template>
  <DsSection
    number="08"
    :title="ds.avatars"
    gloss="Avatar & notification"
    :note="ds.avatarsNote"
  >
    <div class="ds-avatars">
      <div>
        <DsLabel :space="16">{{ ds.fallback }}</DsLabel>
        <div class="ds-avatars__row">
          <DsSpecimen
            v-for="person in FALLBACKS"
            :key="person.name"
            :caption="String(person.size)"
          >
            <BwAvatar :name="person.name" :size="person.size" :tone="person.tone" />
          </DsSpecimen>
        </div>
      </div>

      <div>
        <DsLabel :space="16">{{ ds.imageAndGroup }}</DsLabel>
        <div class="ds-avatars__row ds-avatars__row--wide">
          <!-- No src, no name: the component falls back to the user glyph. -->
          <DsSpecimen :caption="ds.image">
            <BwAvatar :size="56" tone="placeholder" />
          </DsSpecimen>
          <DsSpecimen :caption="ds.groupName">
            <BwAvatarGroup :items="GROUP" :max="3" />
          </DsSpecimen>
        </div>
      </div>

      <div>
        <DsLabel :space="16">{{ ds.bell }}</DsLabel>
        <div class="ds-avatars__row ds-avatars__row--bells">
          <DsSpecimen :caption="ds.dot">
            <BwNotificationBell dot />
          </DsSpecimen>
          <DsSpecimen :caption="ds.count">
            <BwNotificationBell :count="3" />
          </DsSpecimen>
        </div>
      </div>
    </div>
  </DsSection>
</template>

<style scoped>
.ds-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  align-items: flex-start;
}

.ds-avatars__row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.ds-avatars__row--wide {
  gap: 20px;
  align-items: center;
}

.ds-avatars__row--bells {
  gap: 18px;
  align-items: center;
}
</style>
