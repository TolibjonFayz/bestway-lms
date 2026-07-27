<script setup>
import { ref } from 'vue'
import BwCheckbox from '@/components/base/BwCheckbox.vue'
import BwInput from '@/components/base/BwInput.vue'
import BwPhoneInput from '@/components/base/BwPhoneInput.vue'
import BwRadio from '@/components/base/BwRadio.vue'
import BwSearchInput from '@/components/base/BwSearchInput.vue'
import BwSelect from '@/components/base/BwSelect.vue'
import DsLabel from '../DsLabel.vue'
import DsSection from '../DsSection.vue'
import uz from '@/locales/uz'
import ds from '../dsCopy'

const name = ref('')
const focusDemo = ref('Jasur Rahimov')
const password = ref('BestWay2026')
const phoneDesign = ref('901234567')
const phoneBrief = ref('901234567')
const group = ref(ds.sample.groups[0])
const query = ref('')
const email = ref('jasur@')
const studentId = ref(ds.sample.studentId)

const remember = ref(true)
const notify = ref(false)
const level = ref('b1')

const LEVELS = [
  ['a1', uz.levels.a1],
  ['a2', uz.levels.a2],
  ['b1', uz.levels.b1],
  ['b2', uz.levels.b2],
]
</script>

<template>
  <DsSection
    number="04"
    :title="ds.formControls"
    gloss="Form controls"
    :note="ds.formControlsNote"
  >
    <div class="ds-forms">
      <BwInput
        v-model="name"
        :label="uz.form.fullName"
        :placeholder="uz.form.fullNamePlaceholder"
        :helper="ds.fieldDefault"
      />

      <!-- The mockup pins this one open so the ring is visible in a screenshot. -->
      <div class="ds-forms__focus">
        <label class="ds-forms__label" for="ds-focus-demo">{{ ds.fieldFocus }}</label>
        <input id="ds-focus-demo" v-model="focusDemo" class="ds-forms__focus-input" />
        <div class="ds-forms__helper">{{ ds.fieldFocusNote }}</div>
      </div>

      <BwInput
        v-model="password"
        type="password"
        :label="uz.form.password"
        :helper="ds.fieldPasswordNote"
        autocomplete="current-password"
      />

      <BwPhoneInput
        v-model="phoneDesign"
        :label="uz.form.phone"
        :helper="uz.form.phoneHelper"
      />

      <BwPhoneInput
        v-model="phoneBrief"
        format="parens"
        flag
        :label="uz.form.phone"
        :helper="ds.phoneBriefNote"
      />

      <BwSelect
        v-model="group"
        :label="uz.form.group"
        :options="ds.sample.groups"
        :helper="ds.fieldSelectNote"
      />

      <BwSearchInput
        v-model="query"
        :label="uz.form.search"
        :placeholder="uz.form.searchPlaceholder"
        :helper="ds.fieldSearchNote"
      />

      <BwInput
        v-model="email"
        type="email"
        :label="uz.form.email"
        :error="uz.form.emailError"
      />

      <BwInput
        v-model="studentId"
        :label="uz.form.studentId"
        :helper="ds.fieldDisabledNote"
        disabled
      />
    </div>

    <div class="ds-forms__toggles">
      <div>
        <DsLabel>Checkbox</DsLabel>
        <div class="ds-forms__stack">
          <BwCheckbox v-model="remember" :label="uz.form.rememberMe" />
          <BwCheckbox v-model="notify" :label="uz.form.notifications" />
          <BwCheckbox :model-value="false" :label="ds.fieldFocused" data-force="focus" />
          <BwCheckbox :model-value="false" :label="ds.disabled" disabled />
        </div>
      </div>
      <div>
        <DsLabel>Radio · {{ uz.levels.languageLevel }}</DsLabel>
        <div class="ds-forms__stack">
          <BwRadio
            v-for="[value, label] in LEVELS"
            :key="value"
            v-model="level"
            name="ds-level"
            :value="value"
            :label="label"
          />
        </div>
      </div>
    </div>
  </DsSection>
</template>

<style scoped>
.ds-forms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

.ds-forms__label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: var(--ink-3);
  margin-bottom: 8px;
}

.ds-forms__focus-input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  font-family: inherit;
  font-weight: 500;
  font-size: 15px;
  color: var(--ink);
  background: var(--white);
  border: 1.5px solid var(--green);
  border-radius: 10px;
  outline: none;
  box-shadow: var(--ring-green);
}

.ds-forms__helper {
  font-size: 12px;
  color: var(--gray-2);
  margin-top: 7px;
}

.ds-forms__toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 22px;
  margin-top: 26px;
  padding-top: 24px;
  border-top: 1px solid var(--line-2);
}

.ds-forms__stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
