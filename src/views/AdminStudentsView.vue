<template>
  <div class="admin-students-view">
    <div class="header">
      <h1>{{ $t("students.title") }}</h1>
      <div v-if="total > 0" class="student-counter">
        {{ $t("students.count") }}: <strong>{{ total }}</strong>
      </div>
    </div>

    <div class="toolbar">
      <input v-model="search" :placeholder="$t('students.searchPlaceholder')" @input="debouncedLoad" class="search-input" />

      <select v-model="filters.gender" @change="applyFilters" class="filter-select">
        <option value="">{{ $t("students.allGenders") }}</option>
        <option value="male">{{ $t("students.male") }}</option>
        <option value="female">{{ $t("students.female") }}</option>

      </select>

      <select v-model="filters.level_id" @change="applyFilters" class="filter-select">
        <option value="">{{ $t("students.allLevels") }}</option>
        <option v-for="level in levels" :key="level.id" :value="level.id">
          {{ level.number }} {{ $t("students.class") }}
        </option>
      </select>

      <select v-model="filters.group_id" @change="applyFilters" class="filter-select">
        <option value="">{{ $t("students.allGroups") }}</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">
          {{ group.display_name }}
        </option>
      </select>

      <button @click="exportStudents" class="export-btn" :disabled="!allStudents || allStudents.length === 0">
        📄 {{ $t("students.exportCsv") }}
      </button>
    </div>

    <!-- Таблица студентов -->
    <div v-if="loading" class="loading">{{ $t("students.loading") }}</div>

    <div v-else class="table-wrapper">
      <table class="students-table">
        <thead>
          <tr>
            <th>{{ $t("students.number") }}</th>
            <th>{{ $t("students.fullName") }}</th>
            <th>{{ $t("students.gender") }}</th>
            <th>{{ $t("students.level") }}</th>
            <th>{{ $t("students.group") }}</th>
            <th>{{ $t("students.birthDate") }}</th>
            <th>{{ $t("students.pin") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(student, index) in filteredStudents"
            :key="student.id"
            @dblclick="showStudentDetails(student.id)"
            class="student-row"
          >
            <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
            <td>{{ student.full_name }}</td>
            <td>{{ student.gender_display }}</td>
            <td>{{ student.level }}</td>
            <td>{{ student.group }}</td>
            <td>{{ formatDate(student.birth_date) }}</td>
            <td>{{ student.pin }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredStudents.length === 0" class="no-data">
        {{ $t("students.notFound") }}
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="page-btn">«</button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">‹</button>

        <span class="page-info">{{ $t("students.page") }} {{ currentPage }} {{ $t("students.of") }} {{ totalPages }}</span>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">›</button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="page-btn">»</button>
      </div>
    </div>

    <!-- Модалка с детальной информацией -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t("students.modalTitle") }}</h2>

        <div v-if="studentDetails" class="student-details">
          <div class="details-section">
            <h3>{{ $t("students.mainInfo") }}</h3>
            <div class="detail-row">
              <span class="label">{{ $t("students.fullName") }}:</span>
              <span class="value">{{ studentDetails.full_name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.gender") }}:</span>
              <span class="value">{{ studentDetails.gender_display }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.birthDate") }}:</span>
              <span class="value">{{ formatDate(studentDetails.birth_date) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.pin") }}:</span>
              <span class="value">{{ studentDetails.pin }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.level") }}:</span>
              <span class="value">{{ studentDetails.level?.title || $t("students.notSpecified") }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.group") }}:</span>
              <span class="value">{{ studentDetails.group?.display_name || $t("students.notSpecifiedFemale") }}</span>
            </div>
          </div>

          <div class="details-section">
            <h3>{{ $t("students.contactInfo") }}</h3>
            <div class="detail-row">
              <span class="label">{{ $t("students.email") }}:</span>
              <span class="value">{{ studentDetails.email || $t("students.notSpecified") }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.phone") }}:</span>
              <span class="value">{{ studentDetails.phone || $t("students.notSpecified") }}</span>
            </div>
          </div>

          <div v-if="studentDetails.document" class="details-section">
            <h3>{{ $t("students.documentInfo") }}</h3>
            <div class="detail-row">
              <span class="label">{{ $t("students.documentType") }}:</span>
              <span class="value">{{ studentDetails.document.document_type }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.documentNumber") }}:</span>
              <span class="value">{{ studentDetails.document.document_number }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.issueDate") }}:</span>
              <span class="value">{{ formatDate(studentDetails.document.issue_date) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t("students.issuingAuthority") }}:</span>
              <span class="value">{{ studentDetails.document.issuing_authority }}</span>
            </div>
          </div>

          <div v-if="studentDetails.guardians && studentDetails.guardians.length > 0" class="details-section">
            <h3>{{ $t("students.guardiansInfo") }}</h3>
            <div v-for="guardian in studentDetails.guardians" :key="guardian.id" class="guardian-info">
              <div class="detail-row">
                <span class="label">{{ $t("students.fullName") }}:</span>
                <span class="value">{{ guardian.full_name }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t("students.relationship") }}:</span>
                <span class="value">{{ guardian.relationship }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t("students.phone") }}:</span>
                <span class="value">{{ guardian.phone }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t("students.email") }}:</span>
                <span class="value">{{ guardian.email }}</span>
              </div>
              <hr v-if="studentDetails.guardians.length > 1" />
            </div>
          </div>
        </div>

        <div v-else class="loading">{{ $t("students.loading") }}</div>

        <button @click="closeModal" class="close-btn">{{ $t("students.close") }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

interface Student {
  id: number
  full_name: string
  gender: string
  gender_display: string
  level: string
  level_id: number | null
  group: string
  group_id: number | null
  birth_date: string
  pin: string
}

interface Level {
  id: number
  number: number
  title: string
}

interface Group {
  id: number
  display_name: string
}

interface StudentDetails {
  id: number
  full_name: string
  first_name: string
  last_name: string
  middle_name: string
  email: string
  phone: string
  gender: string
  gender_display: string
  birth_date: string
  pin: string
  level: {
    id: number
    number: number
    title: string
  } | null
  group: {
    id: number
    display_name: string
    class_letter: string
  } | null
  guardians: Array<{
    id: number
    full_name: string
    phone: string
    email: string
    relationship: string
  }>
  document: {
    document_type: string
    document_number: string
    issue_date: string
    issuing_authority: string
  } | null
}

const allStudents = ref<Student[]>([])
const levels = ref<Level[]>([])
const groups = ref<Group[]>([])
const loading = ref(false)
const showModal = ref(false)
const studentDetails = ref<StudentDetails | null>(null)
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(50)
const total = ref(0)

const filters = ref({
  gender: '',
  level_id: '',
  group_id: ''
})

const filteredStudents = computed(() => allStudents.value)

onMounted(async () => {
  await loadLevels()
  await loadGroups()
})

async function loadLevels() {
  try {
    const response = await api.get('/levels')
    levels.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки уровней:', error)
  }
}

async function loadGroups() {
  try {
    const response = await api.get('/admin/groups')
    groups.value = response.data.map((g: any) => ({
      id: g.id,
      display_name: g.level.number + g.class_letter
    }))
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

async function loadStudents() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      per_page: perPage.value
    }
    if (search.value) {
      params.search = search.value
    }
    if (filters.value.gender) {
      params.gender = filters.value.gender
    }
    if (filters.value.level_id) {
      params.level_id = filters.value.level_id
    }
    if (filters.value.group_id) {
      params.group_id = filters.value.group_id
    }

    const response = await api.get('/admin/students/list', { params })
    allStudents.value = response.data.data
    currentPage.value = response.data.current_page
    totalPages.value = response.data.last_page
    total.value = response.data.total
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  currentPage.value = 1 // Reset to first page on filter change
  loadStudents()
}

function debounce(fn: Function, ms = 400) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

const debouncedLoad = debounce(() => {
  currentPage.value = 1 // Reset to first page on search
  loadStudents()
}, 400)

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadStudents()
  }
}

async function showStudentDetails(studentId: number) {
  showModal.value = true
  studentDetails.value = null

  try {
    const response = await api.get(`/admin/students/${studentId}/details`)
    studentDetails.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки деталей студента:', error)
  }
}

function closeModal() {
  showModal.value = false
  studentDetails.value = null
}

async function exportStudents() {
  try {
    const params: any = {}
    if (search.value) {
      params.search = search.value
    }
    if (filters.value.gender) {
      params.gender = filters.value.gender
    }
    if (filters.value.level_id) {
      params.level_id = filters.value.level_id
    }
    if (filters.value.group_id) {
      params.group_id = filters.value.group_id
    }

    const response = await api.get('/admin/students/export', {
      params,
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let filename = 'students.csv'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка экспорта студентов:', error)
    alert(t('students.exportError'))
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return t('students.notSpecifiedFemale')
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Load initial data
loadStudents()
</script>

<style scoped>
.admin-students-view {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
}

.student-counter {
  font-size: 16px;
  color: #666;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.student-counter strong {
  color: #007bff;
  font-size: 20px;
}

.toolbar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  color: #333;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  min-width: 150px;
  color: #333;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.export-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.export-btn:hover:not(:disabled) {
  background-color: #218838;
}

.export-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.table-wrapper {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  color: #333;
}

.students-table th,
.students-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.students-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.student-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.student-row:hover {
  background-color: #f8f9fa;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ddd;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  padding: 8px 16px;
  color: #666;
  font-size: 14px;
}

/* Модалка */
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
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 25px;
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
  border-bottom: 2px solid #007bff;
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
  min-width: 150px;
}

.detail-row .value {
  color: #333;
  text-align: right;
  flex: 1;
}

.guardian-info {
  margin-bottom: 10px;
}

.guardian-info hr {
  margin: 15px 0;
  border: none;
  border-top: 1px solid #ddd;
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
}

.close-btn:hover {
  background-color: #5a6268;
}
</style>
