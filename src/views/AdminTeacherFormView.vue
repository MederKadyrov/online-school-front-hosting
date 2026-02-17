<template>
  <div class="card" :key="String(route.params.id) || 'new'">
    <h3>{{ isEdit ? $t('teacherForm.editTitle') : $t('teacherForm.createTitle') }}</h3>

    <!-- Лоадер -->
    <div v-if="loading" class="muted">{{ $t('teacherForm.loading') }}</div>

    <!-- Форма показывается только когда загрузились данные (или создаём нового) -->
    <form v-else @submit.prevent="submit">
      <div class="grid">
        <div>
          <label>{{ $t('teacherForm.lastName') }}</label>
          <input v-model="form.last_name" :class="['inp', errors.last_name && 'input-error']" />
          <span v-if="errors.last_name" class="field-error">{{ errors.last_name }}</span>
        </div>
        <div>
          <label>{{ $t('teacherForm.firstName') }}</label>
          <input v-model="form.first_name" :class="['inp', errors.first_name && 'input-error']" />
          <span v-if="errors.first_name" class="field-error">{{ errors.first_name }}</span>
        </div>
        <div>
          <label>{{ $t('teacherForm.middleName') }}</label>
          <input v-model="form.middle_name" :class="['inp', errors.middle_name && 'input-error']" />
          <span v-if="errors.middle_name" class="field-error">{{ errors.middle_name }}</span>
        </div>

        <div>
          <label>{{ $t('teacherForm.email') }}</label>
          <input v-model="form.email" :class="['inp', errors.email && 'input-error']" />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>
        <div>
          <label>{{ $t('teacherForm.phone') }}</label>
          <input v-model="form.phone" :class="['inp', errors.phone && 'input-error']" />
          <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
        </div>
        <div>
          <label>{{ $t('teacherForm.sex') }}</label>
          <select v-model="form.sex" :class="['inp', errors.sex && 'input-error']">
            <option value="">{{ $t('teacherForm.selectSex') }}</option>
            <option value="male">{{ $t('teacherForm.male') }}</option>
            <option value="female">{{ $t('teacherForm.female') }}</option>
          </select>
          <span v-if="errors.sex" class="field-error">{{ errors.sex }}</span>
        </div>

        <div>
          <label>{{ $t('teacherForm.pin') }}</label>
          <input v-model="form.pin" maxlength="14" :class="['inp', errors.pin && 'input-error']" />
          <span v-if="errors.pin" class="field-error">{{ errors.pin }}</span>
        </div>
        <div>
          <label>{{ $t('teacherForm.citizenship') }}</label>
          <select v-model="form.citizenship" :class="['inp', errors.citizenship && 'input-error']">
            <option value="">{{ $t('teacherForm.selectCountry') }}</option>
            <option value="KG">{{ $t('teacherForm.kyrgyzstan') }}</option>
            <option value="RU">{{ $t('teacherForm.russia') }}</option>
            <option value="UZ">{{ $t('teacherForm.uzbekistan') }}</option>
            <option value="TJ">{{ $t('teacherForm.tajikistan') }}</option>
            <option value="KZ">{{ $t('teacherForm.kazakhstan') }}</option>
            <option value="CN">{{ $t('teacherForm.china') }}</option>
            <option value="TR">{{ $t('teacherForm.turkey') }}</option>
            <option value="OTHER">{{ $t('teacherForm.other') }}</option>
          </select>
          <span v-if="errors.citizenship" class="field-error">{{ errors.citizenship }}</span>
        </div>
        <div>
          <label>{{ $t('teacherForm.address') }}</label>
          <input v-model="form.address" :class="['inp', errors.address && 'input-error']" />
          <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
        </div>

        <!-- Пароль редактируем опционально: поля видны только в режиме создания -->
        <div v-if="!isEdit">
          <label>{{ $t('teacherForm.password') }}</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              :class="['inp', errors.password && 'input-error']"
            />
            <button type="button" @click="showPassword = !showPassword" class="password-toggle-teacher">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>
        <div v-if="!isEdit">
          <label>{{ $t('teacherForm.passwordConfirmation') }}</label>
          <div class="password-input-wrapper">
            <input
              :type="showPasswordConfirm ? 'text' : 'password'"
              v-model="form.password_confirmation"
              :class="['inp', errors.password_confirmation && 'input-error']"
            />
            <button type="button" @click="showPasswordConfirm = !showPasswordConfirm" class="password-toggle-teacher">
              {{ showPasswordConfirm ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password_confirmation" class="field-error">{{ errors.password_confirmation }}</span>
        </div>
      </div>

      <div class="subjects">
        <h4>{{ $t('teacherForm.subjects') }}</h4>
        <div class="chips">
          <label v-for="s in subjects" :key="s.id" class="chip">
            <input type="checkbox" :value="s.id" v-model="form.subjects" />
            {{ s.name }}
          </label>
        </div>
      </div>

      <div class="actions">
        <router-link to="/admin/teachers" class="btn">← {{ $t('teacherForm.back') }}</router-link>
        <button class="btn primary" type="submit" :disabled="saving">
          {{ saving ? $t('teacherForm.saving') : (isEdit ? $t('teacherForm.save') : $t('teacherForm.create')) }}
        </button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="ok" class="ok">{{ $t('teacherForm.saved') }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({
  last_name: '', first_name: '', middle_name: '',
  email: '', phone: '', sex: '', pin: '', citizenship: '', address: '',
  password: '', password_confirmation: '',
  subjects: [] as number[],
})

const form = ref<any>(emptyForm())
const subjects = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const ok = ref(false)
const errors = ref<Record<string, string>>({})
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

async function loadSubjects() {
  const { data } = await api.get('/admin/subjects')
  subjects.value = data
}

async function loadRow() {
  if (!isEdit.value) {
    form.value = emptyForm()
    return
  }
  const { data } = await api.get(`/admin/teachers/${route.params.id}`)
  // data содержит: last_name, first_name, middle_name, email, phone, sex, pin, citizenship, address, subjects: number[]
  form.value = {
    ...emptyForm(),
    ...data,
    password: '',
    password_confirmation: '',
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
  }
}

async function loadAll() {
  loading.value = true
  error.value = ''
  ok.value = false
  try {
    await Promise.all([loadSubjects(), loadRow()])
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('teacherForm.loadError')
  } finally {
    loading.value = false
  }
}

async function submit() {
  error.value = ''; ok.value = false; errors.value = {}; saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/admin/teachers/${route.params.id}`, form.value)
      ok.value = true
    } else {
      await api.post('/admin/teachers', form.value)
      router.push('/admin/teachers')
    }
  } catch (e:any) {
    // Проверяем, есть ли детальные ошибки валидации
    if (e?.data?.errors && typeof e.data.errors === 'object') {
      errors.value = e.data.errors
      error.value = t('teacherForm.validationError')
    } else {
      error.value = e?.data?.message || e?.message || t('teacherForm.saveError')
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadAll)

// Если навигация между разными учителями происходит без полного перезахода — перезагрузим данные
watch(() => route.params.id, () => {
  loadAll()
})
</script>

<style scoped>
.card { padding:12px; border:1px solid #eee; border-radius:8px; }
.muted { color:#666; }
.grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; }
.inp { width:100%; padding:6px; border:1px solid #ddd; border-radius:6px; }
.subjects { margin-top:12px; }
.chips { display:flex; flex-wrap:wrap; gap:8px; }
.chip { border:1px solid #ddd; border-radius:999px; padding:6px 10px; }
.actions { margin-top:12px; display:flex; gap:8px; }
.btn { padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; text-decoration:none; }
.btn.primary { border-color:#0a4ea6; color:#0a4ea6; }
.error { color:#b00020; margin-top:8px; white-space:pre-wrap; }
.ok { color:#0a7f2e; margin-top:8px; }

/* Password toggle */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .inp {
  padding-right: 40px;
}

.password-toggle-teacher {
  padding: 6px 12px;
  position: absolute;
  right: 8px;
  /* background: none; */
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  background: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  font-family: inherit;
  color: white;
}

.password-toggle-teacher:hover {
  opacity: 0.7;
}



/* Field-level error messages */
.field-error {
  display: block;
  color: #b00020;
  font-size: 12px;
  margin-top: 4px;
}

.input-error {
  border-color: #b00020 !important;
  background-color: #fff5f5;
}
</style>
