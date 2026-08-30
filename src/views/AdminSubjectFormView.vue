<template>
  <div class="card" :key="String(route.params.id) || 'new'">
    <h3>{{ isEdit ? $t('subjects.editTitle') : $t('subjects.createTitle') }}</h3>

    <div v-if="loading" class="muted">{{ $t('subjects.loading') }}</div>

    <form v-else @submit.prevent="submit">
      <div class="grid">
        <div class="field">
          <label>{{ $t('subjects.nameLabel') }}<span class="req">*</span></label>
          <input v-model.trim="form.name" class="inp" :placeholder="$t('subjects.namePlaceholder')" />
          <small v-if="errors.name" class="error">{{ errors.name }}</small>
        </div>

        <div class="field">
          <label>{{ $t('subjects.codeLabel') }}<span class="req">*</span></label>
          <input v-model.trim="form.code" class="inp" :placeholder="$t('subjects.codePlaceholder')" />
          <small class="muted">{{ $t('subjects.codeHint') }}</small>
          <small v-if="errors.code" class="error">{{ errors.code }}</small>
        </div>

        <div class="field">
          <label>{{ $t('subjects.areaLabel') }}</label>
          <select v-model.number="form.area_id" class="inp">
            <option :value="null">{{ $t('subjects.areaNotSelected') }}</option>
            <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
          <small v-if="errors.area_id" class="error">{{ errors.area_id }}</small>
        </div>
      </div>

      <div class="actions">
        <router-link class="btn" to="/admin/subjects"><ArrowLeft :size="16" /> {{ $t('subjects.backButton') }}</router-link>
        <button class="btn primary" type="submit" :disabled="saving">
          {{ saving ? $t('subjects.saving') : (isEdit ? $t('subjects.saveButton') : $t('subjects.createButton')) }}
        </button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="ok" class="ok">{{ $t('subjects.saved') }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import api from '../utils/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)

const areas = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const ok = ref(false)
const errors = ref<Record<string,string>>({})

const emptyForm = () => ({
  name: '',
  code: '',
  area_id: null as number|null,
})
const form = ref<any>(emptyForm())

async function loadAreas() {
  const { data } = await api.get('/admin/educational-areas')
  areas.value = data
}

async function loadRow() {
  if (!isEdit.value) { form.value = emptyForm(); return }
  const { data } = await api.get(`/admin/subjects/${route.params.id}`)
  form.value = {
    name: data.name,
    code: data.code,
    area_id: data.area_id ?? null,
  }
}

async function loadAll() {
  loading.value = true; error.value=''; ok.value=false; errors.value = {}
  try {
    await Promise.all([loadAreas(), loadRow()])
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('subjects.loadError')
  } finally {
    loading.value = false
  }
}

function mapBackendErrors(e:any) {
  // Лара часто возвращает { errors: { field: [msg] } }
  const out:Record<string,string> = {}
  const be = e?.data?.errors
  if (be && typeof be === 'object') {
    Object.keys(be).forEach(k => { if (be[k]?.length) out[k] = be[k][0] })
  }
  return out
}

async function submit() {
  error.value=''; ok.value=false; saving.value=true; errors.value = {}
  try {
    if (isEdit.value) {
      await api.put(`/admin/subjects/${route.params.id}`, form.value)
      ok.value = true
    } else {
      await api.post('/admin/subjects', form.value)
      router.push('/admin/subjects')
    }
  } catch (e:any) {
    errors.value = mapBackendErrors(e)
    error.value = e?.data?.message || e?.message || t('subjects.saveError')
  } finally {
    saving.value=false
  }
}

onMounted(loadAll)
watch(() => route.params.id, loadAll)
</script>

<style scoped>
.card{padding:12px;border:1px solid #eee;border-radius:8px}
.grid{display:grid;grid-template-columns: 1fr 1fr 1fr;gap:12px}
.field label{display:block;font-weight:600;margin-bottom:4px}
.req{color:#e53935;margin-left:4px}
.inp{width:100%;padding:6px;border:1px solid #ddd;border-radius:6px}
.muted{color:#666}
.actions{margin-top:12px;display:flex;gap:8px}
.btn{padding:6px 10px;border:1px solid #ddd;border-radius:6px;background:#fff;text-decoration:none;cursor:pointer}
.btn.primary{border-color:#0a4ea6;color:#0a4ea6}
.error{color:#b00020;margin-top:6px;white-space:pre-wrap}
.ok{color:#0a7f2e;margin-top:6px}
</style>
