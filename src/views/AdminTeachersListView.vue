<template>
  <div class="card">
    <div class="head">
      <h3>{{ $t('teachers.title') }}</h3>
      <router-link class="btn" to="/admin/teachers/new">+ {{ $t('teachers.add') }}</router-link>
    </div>

    <div class="toolbar">
      <input v-model="search" :placeholder="$t('teachers.searchPlaceholder')" @input="debouncedLoad" />
    </div>

    <table class="tbl">
      <thead>
      <tr>
        <th>{{ $t('teachers.fullName') }}</th>
        <th>{{ $t('teachers.email') }}</th>
        <th>{{ $t('teachers.phone') }}</th>
        <th>{{ $t('teachers.subjects') }}</th>
        <th style="width:160px">{{ $t('common.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="t in teachers" :key="t.id" @click="showTeacherDetails(t.id)" class="teacher-row">
        <td>{{ t.name }}</td>
        <td>{{ t.email }}</td>
        <td>{{ t.phone }}</td>
        <td>{{ (t.subjects || []).map((s: any)=>s.name).join(', ') }}</td>
        <td class="actions" @click.stop>
          <router-link class="btn" :to="`/admin/teachers/${t.id}/edit`">{{ $t('common.edit') }}</router-link>
          <button class="btn danger" @click="remove(t)">{{ $t('common.delete') }}</button>
        </td>
      </tr>
      </tbody>
    </table>

    <p v-if="error" class="error">{{ error }}</p>

    <!-- Модалка с детальной информацией -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('teachers.modalTitle') }}</h2>

        <div v-if="teacherDetails" class="teacher-details">
          <!-- Личная информация -->
          <div class="details-section">
            <h3>{{ $t('teachers.personalInfo') }}</h3>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.lastName') }}:</span>
              <span class="value">{{ teacherDetails.last_name || $t('teachers.notSpecified') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.firstName') }}:</span>
              <span class="value">{{ teacherDetails.first_name || $t('teachers.notSpecified') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.middleName') }}:</span>
              <span class="value">{{ teacherDetails.middle_name || $t('teachers.notSpecified') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.pin') }}:</span>
              <span class="value">{{ teacherDetails.pin || $t('teachers.notSpecified') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.sex') }}:</span>
              <span class="value">{{ getSexLabel(teacherDetails.sex) }}</span>
            </div>
          </div>

          <!-- Контактная информация -->
          <div class="details-section">
            <h3>{{ $t('teachers.contactInfo') }}</h3>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.email') }}:</span>
              <span class="value">{{ teacherDetails.email || $t('teachers.notSpecified') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.phone') }}:</span>
              <span class="value">{{ teacherDetails.phone || $t('teachers.notSpecified') }}</span>
            </div>
          </div>

          <!-- Дополнительная информация -->
          <div class="details-section">
            <h3>{{ $t('teachers.additionalInfo') }}</h3>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.citizenship') }}:</span>
              <span class="value">{{ teacherDetails.citizenship || $t('teachers.notSpecified') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('teachers.address') }}:</span>
              <span class="value">{{ teacherDetails.address || $t('teachers.notSpecified') }}</span>
            </div>
          </div>

          <!-- Преподаваемые предметы -->
          <div class="details-section">
            <h3>{{ $t('teachers.teachingSubjects') }}</h3>
            <div v-if="teacherSubjects.length > 0" class="subjects-list">
              <span v-for="subject in teacherSubjects" :key="subject.id" class="subject-tag">
                {{ subject.name }}
              </span>
            </div>
            <div v-else class="no-subjects">
              {{ $t('teachers.noSubjects') }}
            </div>
          </div>
        </div>

        <div v-else class="loading">{{ $t('common.loading') }}</div>

        <button @click="closeModal" class="close-btn">{{ $t('common.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const teachers = ref<any[]>([])
const search = ref('')
const error = ref('')
const showModal = ref(false)
const teacherDetails = ref<any>(null)
const allSubjects = ref<any[]>([])

// Computed свойство для получения предметов преподавателя
const teacherSubjects = computed(() => {
  if (!teacherDetails.value || !teacherDetails.value.subjects || !Array.isArray(teacherDetails.value.subjects)) {
    return []
  }

  // Если subjects содержит объекты с name, возвращаем их
  if (teacherDetails.value.subjects.length > 0 && teacherDetails.value.subjects[0].name) {
    return teacherDetails.value.subjects
  }

  // Если subjects содержит только ID, фильтруем allSubjects
  const subjectIds = teacherDetails.value.subjects
  return allSubjects.value.filter(s => subjectIds.includes(s.id))
})

async function load() {
  error.value = ''
  try {
    const { data } = await api.get('/admin/teachers', { params: { search: search.value } })
    teachers.value = data
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('teachers.loadError')
  }
}

async function loadSubjects() {
  try {
    const { data } = await api.get('/admin/subjects')
    allSubjects.value = data
  } catch (e: any) {
    console.error('Ошибка загрузки предметов:', e)
  }
}

function debounce(fn: Function, ms=400) {
  let t: any
  return (...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
const debouncedLoad = debounce(load, 400)

async function remove(row: any) {
  if (!confirm(t('teachers.deleteConfirm', { name: row.name }))) return
  try {
    await api.delete(`/admin/teachers/${row.id}`)
    await load()
  } catch (e:any) {
    alert(e?.data?.message || e?.message || t('teachers.deleteError'))
  }
}

async function showTeacherDetails(teacherId: number) {
  showModal.value = true
  teacherDetails.value = null

  try {
    const { data } = await api.get(`/admin/teachers/${teacherId}`)
    teacherDetails.value = data
  } catch (e: any) {
    console.error('Ошибка загрузки деталей преподавателя:', e)
    error.value = e?.data?.message || e?.message || t('teachers.loadError')
  }
}

function closeModal() {
  showModal.value = false
  teacherDetails.value = null
}

function getSexLabel(sex: string | null): string {
  if (!sex) return t('teachers.notSpecified')
  if (sex === 'male') return t('teachers.male')
  if (sex === 'female') return t('teachers.female')
  return sex
}

// Загружаем данные при инициализации
load()
loadSubjects()
</script>

<style scoped>
.card { padding:12px; border:1px solid #eee; border-radius:8px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.toolbar { margin-bottom:8px; }
.tbl { width:100%; border-collapse:collapse; }
.tbl th, .tbl td { border-bottom:1px solid #eee; padding:8px; text-align:left; vertical-align:top; }
.btn { padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; text-decoration:none; }
.btn.danger { border-color:#e53935; color:#e53935; }
.error { color:#b00020; margin-top:8px; }
.actions { display:flex; gap:6px; }

/* Кликабельная строка */
.teacher-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.teacher-row:hover {
  background-color: #f8f9fa;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  color: #333;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.teacher-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.details-section {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background-color: #f9f9f9;
}

.details-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-row .label {
  font-weight: 600;
  color: #666;
  min-width: 180px;
}

.detail-row .value {
  color: #333;
  text-align: right;
  flex: 1;
}

.subjects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subject-tag {
  display: inline-block;
  padding: 6px 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.no-subjects {
  color: #999;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.close-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 14px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #5a6268;
}
</style>
