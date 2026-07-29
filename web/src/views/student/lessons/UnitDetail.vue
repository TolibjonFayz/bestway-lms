<script setup>
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from './LessonsStateCard.vue'
import UnitItemCard from './UnitItemCard.vue'
import VocabularyItemCard from './VocabularyItemCard.vue'
import uz from '@/locales/uz'

/* The body of the unit view. Its wrapper decides whether it is a drawer on
   desktop or a full-screen page on a phone; nothing here knows which. */
defineProps({
  unit: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  /* The phone shows a back arrow, the drawer a close cross. */
  dismissIcon: { type: String, default: 'x' },
  dismissLabel: { type: String, required: true },
})

defineEmits(['dismiss', 'retry', 'continue', 'open-item'])
</script>

<template>
  <div class="udetail">
    <div class="udetail__scroll bw-scroll">
      <div class="udetail__head">
        <button
          class="udetail__icon-btn"
          type="button"
          :aria-label="dismissLabel"
          @click="$emit('dismiss')"
        >
          <BwIcon :name="dismissIcon" :size="18" :stroke-width="2" />
        </button>

        <div class="udetail__titles">
          <div class="udetail__code">{{ unit?.code ?? '' }}</div>
          <div class="udetail__name">{{ unit?.title ?? '' }}</div>
        </div>

        <button class="udetail__icon-btn udetail__icon-btn--save" type="button" :aria-label="uz.lessons.save">
          <BwIcon name="bookmark" :size="18" :stroke-width="1.9" />
        </button>
      </div>

      <template v-if="loading">
        <BwSkeleton class="udetail__sk" height="42px" radius="10px" />
        <BwSkeleton class="udetail__sk" variant="block" height="118px" radius="16px" />
        <BwSkeleton class="udetail__sk" variant="block" height="90px" radius="16px" />
        <BwSkeleton class="udetail__sk" variant="block" height="118px" radius="16px" />
      </template>

      <LessonsStateCard
        v-else-if="error"
        class="udetail__sk"
        variant="error"
        icon="alert-triangle"
        :title="uz.lessons.errorTitle"
        :text="uz.lessons.errorText"
        @retry="$emit('retry')"
      />

      <template v-else-if="unit">
        <div class="udetail__progress">
          <div class="udetail__progress-head">
            <span class="udetail__progress-label">{{ uz.lessons.overallProgress }}</span>
            <span class="udetail__progress-value bw-nums">{{ unit.percent }}%</span>
          </div>
          <div class="udetail__track">
            <div class="udetail__fill" :style="{ width: `${unit.percent}%` }" />
          </div>
        </div>

        <!-- Whatever this unit actually has: a maths unit renders two cards. -->
        <template v-for="item in unit.items" :key="item.id">
          <VocabularyItemCard
            v-if="item.type === 'vocabulary'"
            class="udetail__item"
            :item="item"
            @open="$emit('open-item', $event)"
          />
          <UnitItemCard
            v-else
            class="udetail__item"
            :item="item"
            @open="$emit('open-item', $event)"
          />
        </template>
      </template>
    </div>

    <div v-if="unit && !loading" class="udetail__foot">
      <button class="udetail__cta" type="button" @click="$emit('continue')">
        {{ uz.actions.continue }}
        <BwIcon name="arrow-right" :size="18" :stroke-width="1.75" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.udetail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--white);
}

.udetail__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 0;
}

.udetail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.udetail__icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.udetail__icon-btn:hover {
  background: var(--bg);
}

.udetail__icon-btn--save {
  color: var(--green);
}

.udetail__icon-btn--save:hover {
  background: var(--green-pale);
}

.udetail__icon-btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.udetail__titles {
  flex: 1;
  min-width: 0;
}

.udetail__code {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--gray-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.udetail__name {
  font-size: 16.5px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.udetail__sk {
  margin-top: 16px;
}

.udetail__progress {
  margin-top: 16px;
}

.udetail__progress-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
}

.udetail__progress-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-3);
}

.udetail__progress-value {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--green);
}

.udetail__track {
  height: 8px;
  background: var(--line-2);
  border-radius: 99px;
  overflow: hidden;
}

.udetail__fill {
  height: 100%;
  background: var(--green);
  border-radius: 99px;
}

.udetail__item {
  margin-top: 12px;
}

.udetail__item:last-child {
  margin-bottom: 14px;
}

.udetail__foot {
  padding: 12px 18px 22px;
  border-top: 1px solid var(--line-2);
  background: var(--white);
  flex: none;
}

.udetail__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-weight: 700;
  font-size: 15.5px;
  height: 52px;
  border-radius: 12px;
  border: none;
  background: var(--green);
  color: var(--white);
  box-shadow: var(--sh-continue-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.udetail__cta:hover {
  background: var(--green-dark);
}

.udetail__cta:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

@media (min-width: 1024px) {
  .udetail__scroll {
    padding: 26px 26px 0;
  }

  .udetail__titles {
    text-align: center;
  }

  .udetail__code {
    font-size: 12px;
  }

  .udetail__name {
    font-size: 17px;
  }

  .udetail__progress {
    margin-top: 20px;
  }

  .udetail__progress-head {
    margin-bottom: 8px;
  }

  .udetail__progress-label,
  .udetail__progress-value {
    font-size: 13px;
  }

  .udetail__track {
    height: 9px;
  }

  .udetail__item {
    margin-top: 16px;
  }

  .udetail__item:first-of-type {
    margin-top: 20px;
  }

  .udetail__item:last-child {
    margin-bottom: 20px;
  }

  .udetail__foot {
    padding: 16px 26px 22px;
  }

  .udetail__cta {
    font-size: 16px;
    height: 54px;
    border-radius: 13px;
    gap: 9px;
    box-shadow: var(--sh-hw-sm);
  }
}
</style>
