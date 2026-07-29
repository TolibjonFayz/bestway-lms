<script setup>
import { computed } from 'vue'
import { useUzbekDate } from '@/composables/useUzbekDate'
import uz from '@/locales/uz'

const props = defineProps({
  item: { type: Object, required: true },
})

const { shortDate } = useUzbekDate()

/* Same read as the test result screen and PASS_THRESHOLD on the server:
   under 60 reads as a fail, 60–84 as passing-but-shaky, 85+ as strong. */
const scoreTone = computed(() => {
  if (props.item.score >= 85) return 'good'
  if (props.item.score >= 60) return 'ok'
  return 'bad'
})
</script>

<template>
  <div class="mitem">
    <div class="mitem__date">{{ shortDate(item.date) }}</div>
    <div class="mitem__body">
      <div class="mitem__title">{{ item.title }}</div>
      <span class="mitem__badge">{{ uz.itemTypes[item.itemType] }}</span>
      <div v-if="item.teacherComment" class="mitem__comment">
        "{{ item.teacherComment }}"
        <template v-if="item.graderName">{{ uz.marks.commentBy.replace('{name}', item.graderName) }}</template>
      </div>
    </div>
    <span class="mitem__score" :class="`mitem__score--${scoreTone}`">{{ item.score }}%</span>
  </div>
</template>

<style scoped>
.mitem {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 14px;
  border: 1px solid var(--line-2);
  border-radius: 14px;
  background: var(--white);
}

.mitem__date {
  width: 44px;
  flex: none;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gray-2);
}

.mitem__body {
  flex: 1;
  min-width: 0;
}

.mitem__title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}

.mitem__badge {
  display: inline-flex;
  font-weight: 600;
  font-size: 11px;
  color: var(--ink-3);
  background: var(--line-2);
  padding: 2px 8px;
  border-radius: 99px;
  margin-top: 5px;
}

.mitem__comment {
  font-size: 12px;
  color: var(--gray-2);
  margin-top: 6px;
  font-style: italic;
  line-height: 1.4;
}

.mitem__score {
  flex: none;
  font-weight: 800;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 99px;
}

.mitem__score--good {
  color: var(--green-dark);
  background: var(--green-mid);
}

.mitem__score--ok {
  color: var(--orange-ink);
  background: var(--orange-soft);
}

.mitem__score--bad {
  color: var(--danger);
  background: var(--danger-soft);
}

@media (min-width: 1024px) {
  .mitem {
    gap: 14px;
    padding: 13px 14px;
  }

  .mitem__date {
    width: 52px;
    font-size: 12.5px;
  }

  .mitem__title {
    font-size: 14.5px;
  }

  .mitem__badge {
    font-size: 11.5px;
  }

  .mitem__score {
    font-size: 14px;
    padding: 6px 13px;
  }
}
</style>
