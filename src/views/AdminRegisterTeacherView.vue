<template>
  <div class="card">
    <h3>{{ $t('registerTeacher.title') }}</h3>

    <div class="row">
      <div>
        <label>{{ $t('registerTeacher.lastName') }}</label><input v-model="f.last_name" class="inp" />
        <label>{{ $t('registerTeacher.firstName') }}</label><input v-model="f.first_name" class="inp" />
        <label>{{ $t('registerTeacher.middleName') }}</label><input v-model="f.middle_name" class="inp" />

        <label>{{ $t('registerTeacher.email') }}</label><input v-model="f.email" class="inp" />
        <label>{{ $t('registerTeacher.password') }}</label><input v-model="f.password" type="password" class="inp" />
        <label>{{ $t('registerTeacher.passwordConfirmation') }}</label><input type="password" v-model="f.password_confirmation" class="inp" />

        <label>{{ $t('registerTeacher.phone') }}</label><input v-model="f.phone" class="inp" />
      </div>
      <div>
        <label>{{ $t('registerTeacher.sex') }}</label>
        <select v-model="f.sex" class="inp">
          <option value="male">{{ $t('registerTeacher.male') }}</option>
          <option value="female">{{ $t('registerTeacher.female') }}</option>
          <option value="other">{{ $t('registerTeacher.other') }}</option>
        </select>
        <label>{{ $t('registerTeacher.pin') }}</label><input v-model="f.pin" class="inp" />
        <label>{{ $t('registerTeacher.citizenship') }}</label><input v-model="f.citizenship" class="inp" />
        <label>{{ $t('registerTeacher.address') }}</label><input v-model="f.address" class="inp" />
      </div>
    </div>

    <div class="subjects-section">
      <h4>{{ $t('registerTeacher.subjects') }}</h4>
      <div v-if="subjects.length === 0">
        <small class="help">{{ $t('registerTeacher.noSubjects') }}</small>
      </div>
      <div v-else class="chips">
        <label v-for="s in subjects" :key="s.id" class="chip">
          <input type="checkbox" :value="s.id" v-model="selectedSubjects" />
          {{ s.name }} ({{ s.code }})
        </label>
      </div>
    </div>

    <div class="actions">
      <button class="btn primary" @click="submit" :disabled="saving">
        {{ saving ? $t('registerTeacher.saving') : $t('registerTeacher.create') }}
      </button>
    </div>
    <div v-if="ok" class="ok">{{ $t('registerTeacher.created') }}</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="result" class="result-box">
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const f = ref({
  last_name: "",
  first_name: "",
  middle_name: "",
  email: '',
  password: '',
  password_confirmation: "",
  phone: '',
  sex: 'other',
  pin: '',
  citizenship: 'KG',
  address: '',
})

const subjects = ref<any[]>([])
const selectedSubjects = ref<number[]>([])

const saving = ref(false)
const ok = ref(false)
const error = ref('')
const result = ref('')

async function loadSubjects() {
  try {
    const { data } = await api.get('/admin/subjects')
    subjects.value = data
  } catch (e:any) {
    error.value = e?.data?.message || t('registerTeacher.loadError')
  }
}

async function submit() {
  saving.value = true
  ok.value = false
  error.value = ''
  result.value = ''
  try {
    // простая валидация фронта
    if (!/^\d{14}$/.test(f.value.pin)) throw new Error(t('registerTeacher.pinValidation'))
    if (!f.value.email || !f.value.password) throw new Error(t('registerTeacher.emailPasswordRequired'))

    const payload = { ...f.value, subject_ids: selectedSubjects.value }
    const { data } = await api.post('/admin/teachers', payload)
    ok.value = true
    result.value = JSON.stringify(data, null, 2)
  } catch (e:any) {
    error.value = e?.data?.message || (e?.data ? JSON.stringify(e.data) : e?.message || t('registerTeacher.saveError'))
  } finally {
    saving.value = false
  }
}

onMounted(loadSubjects)
</script>

<style scoped>
.card { padding:12px; border:1px solid #eee; border-radius:8px; }
.row { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.row > div { display:flex; flex-direction:column; gap:8px; }
.inp { width:100%; padding:6px; border:1px solid #ddd; border-radius:6px; }
.subjects-section { margin-top:12px; }
.chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
.chip { border:1px solid #ddd; border-radius:999px; padding:6px 10px; cursor:pointer; }
.chip:hover { background:#f0f0f0; }
.help { color:#666; font-size:13px; }
.actions { margin-top:12px; display:flex; gap:8px; }
.btn { padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; text-decoration:none; cursor:pointer; }
.btn.primary { border-color:#0a4ea6; color:#0a4ea6; }
.btn:disabled { opacity:0.5; cursor:not-allowed; }
.error { color:#b00020; margin-top:8px; white-space:pre-wrap; }
.ok { color:#0a7f2e; margin-top:8px; }
.result-box { margin-top:12px; padding:12px; background:#f6f6f6; border-radius:6px; }
.result-box pre { margin:0; font-size:12px; overflow-x:auto; }
</style>
