<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StudentShell from '@/layouts/StudentShell.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from './LessonsStateCard.vue'
import UnitDetail from './UnitDetail.vue'
import UnitTimelineRow from './UnitTimelineRow.vue'
import { useIsDesktop } from '@/composables/useMediaQuery'
import { useLessonsStore } from '@/stores/lessons'
import uz from '@/locales/uz'

/* Only one unit view is ever mounted: mounting both and hiding one with CSS
   would put two dialogs and two scroll regions in the accessibility tree. */
const isDesktop = useIsDesktop()
const route = useRoute()
const router = useRouter()
const lessons = useLessonsStore()

const courseId = computed(() => Number(route.params.courseId))
const unitId = computed(() =>
  route.params.unitId ? Number(route.params.unitId) : null,
)
const course = computed(() => lessons.courseById(courseId.value))

const completedLabel = computed(() =>
  uz.lessons.unitsCompleted
    .replace('{done}', lessons.units.filter((u) => u.status === 'completed').length)
    .replace('{total}', lessons.units.length),
)
const completedShort = computed(() =>
  uz.lessons.unitsCompletedShort
    .replace('{done}', lessons.units.filter((u) => u.status === 'completed').length)
    .replace('{total}', lessons.units.length),
)

function openUnit(unit) {
  router.push(`/lessons/${courseId.value}/units/${unit.id}`)
}

function openItem(item) {
  const base = `/lessons/${courseId.value}/units/${unitId.value}`
  if (item.type === 'video') router.push(`${base}/video`)
  else if (item.type === 'vocabulary') router.push(`${base}/vocabulary`)
  else if (item.type === 'test') router.push(`${base}/test`)
}

function closeUnit() {
  router.push(`/lessons/${courseId.value}`)
}

onMounted(async () => {
  if (!lessons.courses.length) await lessons.loadCourses()
  await lessons.loadUnits(courseId.value)
})

/* The unit id lives in the URL, so back and forward drive the drawer. */
watch(
  unitId,
  (id) => {
    if (id) lessons.loadUnit(id)
    else lessons.closeUnit()
  },
  { immediate: true },
)

watch(courseId, (id) => lessons.loadUnits(id))
</script>

<template>
  <StudentShell>
    <!-- Phone: the unit takes over the whole screen. -->
    <div v-if="unitId && !isDesktop" class="roadmap__mobile-detail">
      <UnitDetail
        :unit="lessons.unit"
        :loading="lessons.unitLoading"
        :error="lessons.unitError"
        dismiss-icon="chevron-left"
        :dismiss-label="uz.actions.back"
        @dismiss="closeUnit"
        @retry="lessons.loadUnit(unitId)"
        @open-item="openItem"
        @continue="closeUnit"
      />
    </div>

    <div class="roadmap" :class="{ 'is-hidden-mobile': unitId }">
      <div class="roadmap__head">
        <RouterLink class="roadmap__back" to="/lessons" :aria-label="uz.actions.back">
          <BwIcon name="chevron-left" :size="18" :stroke-width="2" />
        </RouterLink>
        <h1 class="roadmap__title">{{ course?.name ?? '' }}</h1>
        <span class="roadmap__count roadmap__count--wide">{{ completedLabel }}</span>
        <span class="roadmap__count roadmap__count--narrow">{{ completedShort }}</span>
      </div>

      <template v-if="lessons.unitsLoading">
        <BwSkeleton
          v-for="n in 4"
          :key="n"
          class="roadmap__sk"
          variant="block"
          height="118px"
          radius="18px"
        />
      </template>

      <LessonsStateCard
        v-else-if="lessons.unitsError"
        variant="error"
        icon="alert-triangle"
        :title="uz.lessons.errorTitle"
        :text="uz.lessons.errorText"
        :retrying="lessons.unitsLoading"
        @retry="lessons.loadUnits(courseId)"
      />

      <LessonsStateCard
        v-else-if="!lessons.units.length"
        :title="uz.lessons.emptyUnitsTitle"
        :text="uz.lessons.emptyUnitsText"
      />

      <div v-else class="roadmap__list">
        <UnitTimelineRow
          v-for="(unit, index) in lessons.units"
          :key="unit.id"
          :unit="unit"
          :is-last="index === lessons.units.length - 1"
          @open="openUnit"
        />
      </div>
    </div>

    <!-- Desktop: the unit slides over the list. -->
    <Teleport to="body">
      <div v-if="unitId && isDesktop" class="roadmap__drawer-layer">
        <button
          class="roadmap__scrim"
          type="button"
          :aria-label="uz.actions.close"
          @click="closeUnit"
        />
        <aside class="roadmap__drawer" role="dialog" aria-modal="true">
          <UnitDetail
            :unit="lessons.unit"
            :loading="lessons.unitLoading"
            :error="lessons.unitError"
            dismiss-icon="x"
            :dismiss-label="uz.actions.close"
            @dismiss="closeUnit"
            @retry="lessons.loadUnit(unitId)"
            @open-item="openItem"
            @continue="closeUnit"
          />
        </aside>
      </div>
    </Teleport>
  </StudentShell>
</template>

<style scoped>
.roadmap__mobile-detail {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: var(--white);
}

.roadmap.is-hidden-mobile {
  display: none;
}

.roadmap__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.roadmap__back {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.roadmap__back:hover {
  background: var(--bg);
  color: var(--ink);
}

.roadmap__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.roadmap__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray);
  flex: none;
}

.roadmap__count--wide {
  display: none;
}

.roadmap__sk {
  margin-bottom: 12px;
}

.roadmap__drawer-layer {
  display: none;
}

@media (min-width: 1024px) {
  .roadmap__mobile-detail {
    display: none;
  }

  .roadmap.is-hidden-mobile {
    display: block;
  }

  .roadmap__head {
    margin-bottom: 24px;
  }

  .roadmap__back {
    display: none;
  }

  .roadmap__title {
    font-size: 22px;
    letter-spacing: -0.02em;
  }

  .roadmap__count {
    font-size: 13.5px;
  }

  .roadmap__count--wide {
    display: inline;
  }

  .roadmap__count--narrow {
    display: none;
  }

  .roadmap__list {
    max-width: 680px;
  }

  .roadmap__drawer-layer {
    display: block;
  }

  .roadmap__scrim {
    position: fixed;
    inset: 0;
    background: var(--layer-ink-42);
    border: none;
    padding: 0;
    cursor: pointer;
    z-index: 50;
  }

  .roadmap__drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 480px;
    max-width: 100vw;
    background: var(--white);
    box-shadow: var(--sh-drawer);
    display: flex;
    flex-direction: column;
    z-index: 51;
  }
}
</style>
