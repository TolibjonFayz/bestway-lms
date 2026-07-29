<script setup>
import BwAvatar from '@/components/base/BwAvatar.vue'
import { formatCount } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

/** Exactly the top 1–3 rows, in rank order. */
defineProps({
  rows: { type: Array, required: true },
})
</script>

<template>
  <div class="podium">
    <div v-if="rows[1]" class="podium__col">
      <BwAvatar :name="rows[1].fullName" :size="64" tone="gray-2" />
      <div class="podium__info">
        <div class="podium__name">{{ rows[1].fullName }}</div>
        <div class="podium__points podium__points--muted">{{ formatCount(rows[1].points) }}</div>
      </div>
      <div class="podium__bar podium__bar--second">2</div>
    </div>

    <div v-if="rows[0]" class="podium__col podium__col--first">
      <span class="podium__crown" aria-hidden="true">👑</span>
      <BwAvatar :name="rows[0].fullName" :size="78" tone="green" />
      <div class="podium__info">
        <div class="podium__name podium__name--first">{{ rows[0].fullName }}</div>
        <div class="podium__points podium__points--first">{{ formatCount(rows[0].points) }}</div>
      </div>
      <div class="podium__bar podium__bar--first">1</div>
    </div>

    <div v-if="rows[2]" class="podium__col">
      <BwAvatar :name="rows[2].fullName" :size="64" tone="orange" />
      <div class="podium__info">
        <div class="podium__name">{{ rows[2].fullName }}</div>
        <div class="podium__points podium__points--muted">{{ formatCount(rows[2].points) }}</div>
      </div>
      <div class="podium__bar podium__bar--third">3</div>
    </div>
  </div>
</template>

<style scoped>
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  padding: 8px 0;
}

.podium__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.podium__crown {
  font-size: 18px;
}

.podium__info {
  text-align: center;
}

.podium__name {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink);
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium__name--first {
  font-size: 12.5px;
  font-weight: 800;
}

.podium__points {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 2px;
}

.podium__points--muted {
  color: var(--gray);
}

.podium__points--first {
  font-size: 12.5px;
  color: var(--green);
}

.podium__bar {
  display: none;
}

@media (min-width: 1024px) {
  .podium {
    gap: 20px;
  }

  .podium__crown {
    font-size: 26px;
  }

  .podium__info {
    margin-top: 4px;
  }

  .podium__name {
    font-size: 14px;
    max-width: 140px;
  }

  .podium__name--first {
    font-size: 15px;
  }

  .podium__points {
    font-size: 15px;
    font-weight: 800;
  }

  .podium__points--first {
    font-size: 17px;
  }

  .podium__bar {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 110px;
    height: 76px;
    border-radius: 14px 14px 0 0;
    padding-top: 10px;
    font-size: 22px;
    font-weight: 800;
    margin-top: 10px;
  }

  .podium__bar--first {
    width: 120px;
    height: 100px;
    background: var(--green-pale);
    color: var(--green);
    font-size: 26px;
  }

  .podium__bar--second {
    background: var(--line-2);
    color: var(--gray-2);
  }

  .podium__bar--third {
    height: 58px;
    background: var(--orange-pale);
    color: var(--orange);
  }
}
</style>
