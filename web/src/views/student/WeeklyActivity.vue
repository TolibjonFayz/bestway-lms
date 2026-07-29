<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

defineProps({
  weekly: { type: Object, required: true },
})
</script>

<template>
  <section class="week">
    <div class="week__head">
      <div class="week__title-row">
        <span class="week__flame"><BwIcon name="flame" :size="20" /></span>
        <h3 class="week__title">{{ uz.dashboard.weekly }}</h3>
      </div>
      <span class="week__count week__count--wide">
        {{ uz.dashboard.weeklyCount.replace('{active}', weekly.activeDays) }}
      </span>
      <span class="week__count week__count--narrow">
        {{ uz.dashboard.weeklyCountShort.replace('{active}', weekly.activeDays) }}
      </span>
    </div>

    <div class="week__days">
      <div v-for="day in weekly.days" :key="day.date" class="week__day">
        <span class="week__label" :class="{ 'is-today': day.isToday }">
          {{ day.label }}
        </span>
        <div
          class="week__cell"
          :class="{
            'is-active': day.active && !day.isToday,
            'is-today': day.isToday,
            'is-future': day.isFuture,
          }"
        >
          <template v-if="day.isToday">{{ uz.dashboard.today }}</template>
          <BwIcon v-else-if="day.active" name="check" :size="16" :stroke-width="3" />
          <BwIcon
            v-else-if="!day.isFuture"
            name="circle"
            :size="16"
            :stroke-width="2"
            class="week__miss"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.week {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  box-shadow: var(--sh-sm);
  padding: 18px;
  margin-top: 16px;
}

.week__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.week__title-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.week__flame {
  display: none;
  color: var(--orange);
}

.week__title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
}

.week__count {
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
  background: var(--green-mid);
  padding: 4px 10px;
  border-radius: 99px;
}

.week__count--wide {
  display: none;
}

.week__days {
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.week__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  flex: 1;
}

.week__label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--gray-2);
}

.week__label.is-today {
  font-weight: 700;
  color: var(--green);
}

.week__cell {
  width: 100%;
  aspect-ratio: 1;
  max-width: 38px;
  border-radius: 11px;
  background: var(--line-2);
  color: var(--gray-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.week__cell.is-active {
  background: var(--green);
  color: var(--white);
}

.week__cell.is-today {
  background: var(--green-pale);
  color: var(--green);
  border: 2.5px solid var(--green);
  font-weight: 800;
  font-size: 9px;
}

/* A missed day that has already passed shows a hollow marker; a day still to
   come stays blank on the phone. */
.week__cell.is-future .week__miss {
  display: none;
}

@media (min-width: 1024px) {
  .week {
    border-radius: 20px;
    padding: 22px;
    margin-top: 20px;
  }

  .week__head {
    margin-bottom: 18px;
  }

  .week__flame {
    display: flex;
  }

  .week__title {
    font-size: 17px;
  }

  .week__count {
    font-size: 13px;
    padding: 5px 12px;
  }

  .week__count--wide {
    display: inline;
  }

  .week__count--narrow {
    display: none;
  }

  .week__days {
    gap: 8px;
  }

  .week__day {
    gap: 9px;
  }

  .week__label {
    font-size: 12px;
  }

  .week__cell {
    max-width: none;
    width: 46px;
    height: 46px;
    aspect-ratio: auto;
    border-radius: 14px;
    flex: none;
  }

  .week__cell.is-active {
    box-shadow: var(--sh-day);
  }

  .week__cell.is-today {
    font-size: 14px;
  }

  .week__cell.is-future .week__miss {
    display: block;
  }
}
</style>
