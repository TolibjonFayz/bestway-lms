<script setup>
import { computed, ref } from 'vue'
import StaffShell from '@/layouts/StaffShell.vue'
import BwButton from '@/components/base/BwButton.vue'
import BwInput from '@/components/base/BwInput.vue'
import BwSkeleton from '@/components/base/BwSkeleton.vue'
import LessonsStateCard from '@/views/student/lessons/LessonsStateCard.vue'
import ThemeGallery from './ThemeGallery.vue'
import { fetchCenterSettings, updateCenterSettings } from '@/api/admin'
import { useTheme } from '@/composables/useTheme'
import { useToast } from '@/composables/useToast'
import uz from '@/locales/uz'

const toast = useToast()
const { theme, themes, setTheme, randomTheme } = useTheme()

const settings = ref(null)
const centerName = ref('')
const phone = ref('')
const address = ref('')
const coinsVocab = ref(25)
const coinsTest = ref(30)
const loading = ref(true)
const failed = ref(false)
const saving = ref(false)

const dirty = computed(() => {
  if (!settings.value) return false
  return (
    centerName.value.trim() !== settings.value.centerName ||
    phone.value.trim() !== (settings.value.phone ?? '') ||
    address.value.trim() !== (settings.value.address ?? '') ||
    Number(coinsVocab.value) !== settings.value.coinsPerVocabulary ||
    Number(coinsTest.value) !== settings.value.coinsPerTest
  )
})

async function load() {
  loading.value = true
  failed.value = false
  try {
    const data = await fetchCenterSettings()
    settings.value = data
    centerName.value = data.centerName
    phone.value = data.phone ?? ''
    address.value = data.address ?? ''
    coinsVocab.value = data.coinsPerVocabulary
    coinsTest.value = data.coinsPerTest
    /* The saved theme wins over whatever this browser last had locally. */
    setTheme(data.theme, { animate: false })
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

/* Applied straight away so the admin judges the theme on the real interface,
   then persisted — a preview you have to save first tells you nothing. */
async function pickTheme(id) {
  const previous = theme.value
  setTheme(id)
  try {
    await updateCenterSettings({ theme: id })
    if (settings.value) settings.value.theme = id
  } catch (error) {
    setTheme(previous)
    toast.error(uz.adminSettings.saveError, {
      description: error?.response?.data?.message ?? uz.adminSettings.errorText,
    })
  }
}

async function save() {
  if (saving.value || !dirty.value) return
  saving.value = true
  try {
    settings.value = await updateCenterSettings({
      centerName: centerName.value.trim(),
      phone: phone.value.trim(),
      address: address.value.trim(),
      coinsPerVocabulary: Number(coinsVocab.value),
      coinsPerTest: Number(coinsTest.value),
    })
    toast.success(uz.adminSettings.saved)
  } catch (error) {
    toast.error(uz.adminSettings.saveError, {
      description: error?.response?.data?.message ?? uz.adminSettings.errorText,
    })
  } finally {
    saving.value = false
  }
}

load()
</script>

<template>
  <StaffShell>
    <div class="aset">
      <h1 class="aset__title">{{ uz.adminSettings.title }}</h1>
      <p class="aset__subtitle">{{ uz.adminSettings.subtitle }}</p>

      <BwSkeleton v-if="loading" variant="block" height="320px" radius="18px" />

      <LessonsStateCard
        v-else-if="failed"
        variant="error"
        icon="alert-triangle"
        :title="uz.adminSettings.errorTitle"
        :text="uz.adminSettings.errorText"
        @retry="load"
      />

      <template v-else>
        <ThemeGallery
          :themes="themes"
          :current="theme"
          class="aset__block"
          @pick="pickTheme"
          @random="randomTheme"
        />

        <section class="aset__block aset__panel">
          <h3 class="aset__panel-title">{{ uz.adminSettings.centerTitle }}</h3>
          <div class="aset__grid">
            <BwInput v-model="centerName" :label="uz.adminSettings.centerName" />
            <BwInput
              v-model="phone"
              :label="uz.adminSettings.phone"
              :placeholder="uz.adminSettings.phonePlaceholder"
            />
          </div>
          <BwInput
            v-model="address"
            :label="uz.adminSettings.address"
            :placeholder="uz.adminSettings.addressPlaceholder"
          />
        </section>

        <section class="aset__block aset__panel">
          <h3 class="aset__panel-title">{{ uz.adminSettings.coinsTitle }}</h3>
          <p class="aset__panel-text">{{ uz.adminSettings.coinsText }}</p>
          <div class="aset__grid">
            <BwInput
              v-model="coinsVocab"
              type="number"
              :label="uz.adminSettings.coinsVocab"
            />
            <BwInput v-model="coinsTest" type="number" :label="uz.adminSettings.coinsTest" />
          </div>
        </section>

        <div class="aset__actions">
          <BwButton :loading="saving" :disabled="!dirty" @click="save">
            {{ uz.adminSettings.save }}
          </BwButton>
        </div>

        <section class="aset__block aset__system">
          <h3 class="aset__panel-title">{{ uz.adminSettings.systemTitle }}</h3>
          <dl class="aset__facts">
            <div class="aset__fact">
              <dt>{{ uz.adminSettings.systemVersion }}</dt>
              <dd class="bw-nums">0.1.0</dd>
            </div>
            <div class="aset__fact">
              <dt>{{ uz.adminSettings.systemThemes }}</dt>
              <dd class="bw-nums">{{ themes.length }}</dd>
            </div>
            <div class="aset__fact">
              <dt>{{ uz.adminSettings.systemRoles }}</dt>
              <dd>{{ uz.adminSettings.systemRolesValue }}</dd>
            </div>
          </dl>
        </section>
      </template>
    </div>
  </StaffShell>
</template>

<style scoped>
.aset__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.aset__subtitle {
  margin: 5px 0 18px;
  font-size: 13.5px;
  color: var(--gray);
  font-weight: 500;
}

.aset__block {
  margin-bottom: 16px;
}

.aset__panel {
  background: var(--white);
  border: 1px solid var(--line-2);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-sm);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.aset__panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.aset__panel-text {
  margin: -8px 0 0;
  font-size: 12.5px;
  color: var(--gray);
}

.aset__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.aset__actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.aset__system {
  background: var(--bg);
  border: 1px dashed var(--line);
  border-radius: var(--r-lg);
  padding: 18px 20px;
}

.aset__facts {
  margin: 12px 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.aset__fact dt {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-2);
  margin-bottom: 3px;
}

.aset__fact dd {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

@media (max-width: 640px) {
  .aset__grid {
    grid-template-columns: 1fr;
  }
}
</style>
