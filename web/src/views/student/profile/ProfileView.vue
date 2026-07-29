<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import StudentShell from '@/layouts/StudentShell.vue'
import BwAvatar from '@/components/base/BwAvatar.vue'
import BwIcon from '@/components/base/BwIcon.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '../lessons/LessonsStateCard.vue'
import AchievementBadge from './AchievementBadge.vue'
import PasswordChangeDialog from './PasswordChangeDialog.vue'
import { fetchAchievements, fetchProfile, updateNotifications } from '@/api/profile'
import { errorMessage } from '@/api/http'
import { useUzbekDate } from '@/composables/useUzbekDate'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const { memberSince } = useUzbekDate()

const profile = ref(null)
const achievements = ref([])
const loading = ref(false)
const error = ref(null)
const notifBusy = ref(false)
const passwordDialogOpen = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    const [profileData, achievementsData] = await Promise.all([
      fetchProfile(),
      fetchAchievements(1, 20),
    ])
    profile.value = profileData
    achievements.value = achievementsData.items
  } catch (cause) {
    error.value = cause
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function toggleNotifications() {
  if (!profile.value || notifBusy.value) return
  const next = !profile.value.notificationsEnabled
  profile.value.notificationsEnabled = next
  notifBusy.value = true
  try {
    await updateNotifications(next)
  } catch (cause) {
    profile.value.notificationsEnabled = !next
    toast.error(uz.marks.errorTitle, { description: errorMessage(cause, uz.marks.errorText) })
  } finally {
    notifBusy.value = false
  }
}

function unavailable() {
  toast.info(uz.profile.avatarUnavailableTitle, { description: uz.profile.avatarUnavailableText })
}

function onPasswordChanged() {
  passwordDialogOpen.value = false
  toast.success(uz.profile.passwordChanged, { description: uz.profile.passwordChangedText })
}

async function logout() {
  await auth.logout()
  router.push('/login/role')
}

const levelLabel = (level) => (level ? uz.levels[level.toLowerCase()] ?? level : null)
</script>

<template>
  <StudentShell>
    <div class="pview">
      <div class="pview__head">
        <h1 class="pview__title">{{ uz.profile.title }}</h1>
      </div>

      <BwSkeleton v-if="loading" variant="block" height="480px" radius="20px" />

      <LessonsStateCard
        v-else-if="error"
        variant="error"
        icon="alert-triangle"
        :title="uz.profile.errorTitle"
        :text="uz.profile.errorText"
        @retry="load"
      />

      <div v-else-if="profile" class="pview__card">
        <div class="pview__header">
          <div class="pview__avatar-wrap">
            <BwAvatar :name="profile.fullName" :src="profile.avatarUrl" :size="96" tone="green" />
            <button
              class="pview__avatar-edit"
              type="button"
              :aria-label="uz.profile.editAvatar"
              @click="unavailable"
            >
              <BwIcon name="edit" :size="15" :stroke-width="2" />
            </button>
          </div>
          <div class="pview__identity">
            <div class="pview__name">{{ profile.fullName }}</div>
            <div class="pview__chips">
              <span v-if="levelLabel(profile.level)" class="pview__chip pview__chip--level">
                {{ levelLabel(profile.level) }}
              </span>
              <span v-if="profile.groupName" class="pview__chip pview__chip--group">
                {{ profile.groupName }}
              </span>
            </div>
            <div class="pview__since">
              {{ uz.profile.memberSince.replace('{date}', memberSince(profile.memberSince)) }}
            </div>
          </div>
        </div>

        <div class="pview__body">
          <div class="pview__achievements">
            <div class="pview__section-label">{{ uz.profile.achievements }}</div>
            <div class="pview__badges">
              <AchievementBadge v-for="item in achievements" :key="item.id" :achievement="item" />
            </div>
          </div>

          <div class="pview__settings">
            <div class="pview__section-label">{{ uz.profile.settings }}</div>
            <div class="pview__rows">
              <button class="prow" type="button" @click="unavailable">
                <BwIcon name="user-circle" :size="19" :stroke-width="1.75" class="prow__icon" />
                <span class="prow__label">{{ uz.profile.personalInfo }}</span>
                <BwIcon name="chevron-right" :size="16" :stroke-width="2" class="prow__chevron" />
              </button>

              <button class="prow" type="button" @click="passwordDialogOpen = true">
                <BwIcon name="lock" :size="19" :stroke-width="1.75" class="prow__icon" />
                <span class="prow__label">{{ uz.profile.changePassword }}</span>
                <BwIcon name="chevron-right" :size="16" :stroke-width="2" class="prow__chevron" />
              </button>

              <div class="prow prow--static">
                <BwIcon name="bell" :size="19" :stroke-width="1.75" class="prow__icon" />
                <span class="prow__label">{{ uz.profile.notifications }}</span>
                <button
                  class="ntoggle"
                  type="button"
                  role="switch"
                  :aria-checked="profile.notificationsEnabled"
                  :aria-label="uz.profile.notifications"
                  :disabled="notifBusy"
                  @click="toggleNotifications"
                >
                  <span
                    class="ntoggle__track"
                    :class="{ 'is-on': profile.notificationsEnabled }"
                  >
                    <span class="ntoggle__thumb" />
                  </span>
                </button>
              </div>

              <button class="prow" type="button" @click="unavailable">
                <BwIcon name="globe" :size="19" :stroke-width="1.75" class="prow__icon" />
                <span class="prow__label">{{ uz.profile.language }}</span>
                <span class="prow__value">{{ uz.profile.languageValue }}</span>
                <BwIcon name="chevron-right" :size="16" :stroke-width="2" class="prow__chevron" />
              </button>

              <button class="prow" type="button" @click="unavailable">
                <BwIcon name="help-circle" :size="19" :stroke-width="1.75" class="prow__icon" />
                <span class="prow__label">{{ uz.profile.help }}</span>
                <BwIcon name="chevron-right" :size="16" :stroke-width="2" class="prow__chevron" />
              </button>

              <button class="prow prow--danger" type="button" @click="logout">
                <BwIcon name="log-out" :size="19" :stroke-width="1.75" class="prow__icon" />
                <span class="prow__label">{{ uz.profile.logout }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PasswordChangeDialog
      :open="passwordDialogOpen"
      @close="passwordDialogOpen = false"
      @changed="onPasswordChanged"
    />
  </StudentShell>
</template>

<style scoped>
.pview__head {
  margin-bottom: 16px;
}

.pview__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
}

.pview__card {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--sh-md);
  padding: 20px;
}

.pview__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line-2);
}

.pview__avatar-wrap {
  position: relative;
  flex: none;
}

.pview__avatar-edit {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--white);
  border: 2.5px solid var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pview__avatar-edit:hover {
  background: var(--ink-2);
}

.pview__avatar-edit:focus-visible {
  outline: none;
  box-shadow: var(--ring-green);
}

.pview__identity {
  margin-top: 12px;
}

.pview__name {
  font-size: 19px;
  font-weight: 800;
  color: var(--ink);
}

.pview__chips {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
  flex-wrap: wrap;
}

.pview__chip {
  font-weight: 700;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 99px;
}

.pview__chip--level {
  color: var(--green-dark);
  background: var(--green-mid);
}

.pview__chip--group {
  color: var(--ink-3);
  background: var(--line-2);
}

.pview__since {
  font-size: 12px;
  color: var(--gray-2);
  font-weight: 500;
  margin-top: 8px;
}

.pview__body {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 22px;
}

.pview__section-label {
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 12px;
}

.pview__badges {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.pview__rows {
  border: 1px solid var(--line-2);
  border-radius: 16px;
  overflow: hidden;
}

.prow {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 15px;
  background: var(--white);
  border: none;
  border-bottom: 1px solid var(--line-2);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.pview__rows > *:last-child {
  border-bottom: none;
}

.prow:hover {
  background: var(--bg);
}

.prow:focus-visible {
  outline: none;
  box-shadow: inset var(--ring-green);
}

.prow--static {
  cursor: default;
}

.prow--static:hover {
  background: var(--white);
}

.prow__icon {
  color: var(--gray);
  flex: none;
}

.prow__label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.prow__value {
  font-size: 13px;
  color: var(--gray-2);
  font-weight: 600;
}

.prow__chevron {
  color: var(--gray-3);
  flex: none;
}

.prow--danger:hover {
  background: var(--danger-bg);
}

.prow--danger .prow__icon {
  color: var(--danger);
}

.prow--danger .prow__label {
  color: var(--danger);
  font-weight: 700;
}

.ntoggle {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  flex: none;
}

.ntoggle:disabled {
  cursor: progress;
}

.ntoggle__track {
  display: block;
  width: 44px;
  height: 26px;
  border-radius: 99px;
  background: var(--line);
  position: relative;
  transition: background 0.15s;
}

.ntoggle__track.is-on {
  background: var(--green);
}

.ntoggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--white);
  box-shadow: var(--sh-sm);
  transition: left 0.15s;
}

.ntoggle__track.is-on .ntoggle__thumb {
  left: 21px;
}

@media (min-width: 1024px) {
  .pview__card {
    border-radius: 24px;
    padding: 32px;
  }

  .pview__title {
    font-size: 26px;
  }

  .pview__header {
    flex-direction: row;
    text-align: left;
    align-items: center;
    gap: 22px;
    padding-bottom: 26px;
  }

  .pview__identity {
    margin-top: 0;
    flex: 1;
  }

  .pview__chips {
    justify-content: flex-start;
  }

  .pview__body {
    flex-direction: row;
    gap: 28px;
    margin-top: 26px;
  }

  .pview__achievements {
    flex: 1;
    min-width: 400px;
  }

  .pview__settings {
    flex: 1;
    min-width: 320px;
  }

  .pview__badges {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
