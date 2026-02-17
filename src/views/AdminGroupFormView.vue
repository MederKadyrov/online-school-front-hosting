<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isEdit = !!route.params.id

const levels = ref<any[]>([])
const teachers = ref<any[]>([])
const form = ref({
  level_id: null as number|null,
  class_letter: '',
  homeroom_teacher_id: null as number|null,
})
const error = ref(''); const ok = ref(false)

async function loadTeachers() {
  // используем /admin/teachers (index) — он уже отдаёт name/email/phone
  const { data } = await api.get('/admin/teachers', { params: { limit: 500 } })
  // на всякий: у нас index и так ограничивает до 200; этого хватает для выпадашки
  teachers.value = data
}

async function loadLevels() {
  const { data } = await api.get('/admin/levels') // сделай простой контроллер/роут: id, number, title
  levels.value = data
}
async function loadRow() {
  if (!isEdit) return
  const { data } = await api.get(`/admin/groups/${route.params.id}`)
  form.value.level_id = data.level?.id ?? null
  form.value.class_letter = data.class_letter ?? ''
  form.value.homeroom_teacher_id = data.homeroom_teacher_id ?? null
}
async function submit() {
  error.value=''; ok.value=false
  try {
    if (isEdit) {
      await api.put(`/admin/groups/${route.params.id}`, form.value)
      ok.value=true
    } else {
      await api.post('/admin/groups', form.value)
      router.push('/admin/groups')
    }
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('groupForm.saveError')
  }
}
onMounted(async () => { await Promise.all([loadLevels(), loadTeachers(), loadRow()]) })
</script>

<template>
  <div class="card">
    <a data-v-6e9086f4="" href="/admin/groups" class="btn">← Группы</a>
    <h3>{{ isEdit ? $t('groupForm.editTitle') : $t('groupForm.createTitle') }}</h3>
    <form @submit.prevent="submit">
      <label>{{ $t('groupForm.level') }}</label>
      <select v-model.number="form.level_id" class="inp" required>
        <option :value="null">{{ $t('groupForm.levelSelect') }}</option>
        <option v-for="lv in levels" :key="lv.id" :value="lv.id">
          {{ lv.number }} {{ $t('groupForm.class') }}
        </option>
      </select>

      <label>{{ $t('groupForm.letter') }}</label>
      <input v-model="form.class_letter" class="inp" :placeholder="$t('groupForm.letterPlaceholder')" maxlength="2"/>

      <label>{{ $t('groupForm.homeroomTeacher') }}</label>
      <select v-model.number="form.homeroom_teacher_id" class="inp">
        <option :value="null">{{ $t('groupForm.teacherNotSelected') }}</option>
        <option v-for="t in teachers" :key="t.id" :value="t.id">
          {{ t.name }} ({{ t.email }})
        </option>
      </select>

      <div class="actions">
        <button class="btn primary" type="submit">{{ $t('groupForm.save') }}</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="ok" class="ok">{{ $t('groupForm.saved') }}</p>
    </form>
  </div>
</template>

<style scoped>
.card{padding:12px;border:1px solid #eee;border-radius:8px; display: flex;flex-direction: column;}
.inp{display:block;width:100%;padding:6px;border:1px solid #ddd;border-radius:6px;margin-bottom:8px}
.actions{margin-top:8px}
.btn{padding:6px 10px;border:1px solid #ddd;border-radius:6px;background:#fff;width: fit-content;margin-left: auto;}
.btn.primary{border-color:#0a4ea6;color:#0a4ea6}
.error{color:#b00020}
.ok{color:#0a7f2e}
</style>
