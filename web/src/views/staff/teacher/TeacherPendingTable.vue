<script setup>
import { useRouter } from 'vue-router'
import BwAvatar from '@/components/base/BwAvatar.vue'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const props = defineProps({
  pendingCount: { type: Number, required: true },
  items: { type: Array, required: true },
})

const router = useRouter()
const { time } = useUzbekDate()

function openReview(submissionId) {
  router.push({ path: '/staff/review', query: { submission: submissionId } })
}
</script>

<template>
  <div class="tpending">
    <div class="tpending__head">
      <h4 class="tpending__title">{{ uz.teacherDashboard.pendingTitle }}</h4>
      <RouterLink to="/staff/review" class="tpending__all">
        {{ uz.teacherDashboard.pendingAll.replace('{n}', pendingCount) }}
      </RouterLink>
    </div>

    <div v-if="!items.length" class="tpending__empty">
      <p class="tpending__empty-title">{{ uz.teacherDashboard.pendingEmptyTitle }}</p>
      <p class="tpending__empty-text">{{ uz.teacherDashboard.pendingEmptyText }}</p>
    </div>

    <div v-else class="tpending__rows">
      <div v-for="item in items" :key="item.id" class="tpending__row">
        <BwAvatar :name="item.studentName" :size="34" :font-size="12" />
        <div class="tpending__body">
          <div class="tpending__name">{{ item.studentName }}</div>
          <div class="tpending__meta">
            {{ item.unitTitle }} · {{ uz.itemTypes[item.itemType] }} · {{ time(item.submittedAt) }}
          </div>
        </div>
        <button type="button" class="tpending__view" @click="openReview(item.id)">
          {{ uz.teacherDashboard.view }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tpending {
  flex: 1.6;
  min-width: 320px;
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 20px;
}

.tpending__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.tpending__title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
}

.tpending__all {
  font-size: 13px;
  font-weight: 700;
}

.tpending__empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.tpending__empty-text {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--gray);
}

.tpending__rows {
  display: flex;
  flex-direction: column;
}

.tpending__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line-2);
}

.tpending__row:last-child {
  border-bottom: none;
}

.tpending__body {
  flex: 1;
  min-width: 0;
}

.tpending__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tpending__meta {
  font-size: 12px;
  color: var(--gray-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tpending__view {
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  color: var(--green-dark);
  background: var(--green-pale);
  border: none;
  padding: 7px 13px;
  border-radius: 9px;
  cursor: pointer;
  flex: none;
}

.tpending__view:hover {
  background: var(--green-mid);
}

.tpending__view:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}
</style>
