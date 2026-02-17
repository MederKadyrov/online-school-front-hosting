<template>
  <div class="admin-courses-view">
    <div class="header">
      <h1>{{ $t('courses.title') }}</h1>
      <div v-if="total > 0" class="courses-counter">
        {{ $t('courses.totalCount') }}: <strong>{{ total }}</strong>
      </div>
    </div>

    <div class="toolbar">
      <select v-model="filters.subject_id" @change="applyFilters" class="filter-select">
        <option value="">{{ $t('courses.allSubjects') }}</option>
        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
          {{ subject.name }}
        </option>
      </select>

      <select v-model="filters.level_id" @change="applyFilters" class="filter-select">
        <option value="">{{ $t('courses.allLevels') }}</option>
        <option v-for="level in levels" :key="level.id" :value="level.id">
          {{ level.number }} {{ $t('courses.class') }}
        </option>
      </select>

      <select v-model="filters.group_id" @change="applyFilters" class="filter-select">
        <option value="">{{ $t('courses.allGroups') }}</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">
          {{ group.display_name }}
        </option>
      </select>

      <select v-model="filters.teacher_id" @change="applyFilters" class="filter-select">
        <option value="">{{ $t('courses.allTeachers') }}</option>
        <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
          {{ teacher.name }}
        </option>
      </select>
    </div>

    <!-- Таблица курсов -->
    <div v-if="loading" class="loading">{{ $t('courses.loading') }}</div>

    <div v-else class="table-wrapper">
      <table class="courses-table">
        <thead>
          <tr>
            <th>{{ $t('courses.number') }}</th>
            <th>{{ $t('courses.level') }}</th>
            <th>{{ $t('courses.subject') }}</th>
            <th>{{ $t('courses.teacher') }}</th>
            <th>{{ $t('courses.groups') }}</th>
            <th>{{ $t('courses.modules') }}</th>
            <th>{{ $t('courses.created') }}</th>
            <th>{{ $t('courses.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(course, index) in courses" :key="course.id" class="course-row">
            <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
            <td>{{ course.level.number }} {{ $t('courses.class') }}</td>
            <td>{{ course.subject.name }}</td>
            <td>{{ course.teacher.name }}</td>
            <td>
              <span v-if="course.groups.length > 0">
                {{ course.groups.map(g => g.display_name).join(', ') }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>{{ course.modules_count }}</td>
            <td>{{ course.created_at }}</td>
            <td>
              <RouterLink :to="`/admin/courses/${course.id}`" class="btn-view">
                {{ $t('courses.view') }}
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="courses.length === 0" class="no-data">
        {{ $t('courses.notFound') }}
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="page-btn">«</button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">‹</button>

        <span class="page-info">{{ $t('courses.page') }} {{ currentPage }} {{ $t('courses.of') }} {{ totalPages }}</span>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">›</button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="page-btn">»</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

interface Course {
  id: number
  title: string
  subject: {
    id: number
    name: string
  }
  teacher: {
    id: number
    name: string
  }
  level: {
    id: number
    number: number
    title: string
  }
  groups: Array<{
    id: number
    display_name: string
  }>
  modules_count: number
  created_at: string
}

const courses = ref<Course[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(50)
const total = ref(0)

const filters = ref({
  subject_id: '',
  level_id: '',
  group_id: '',
  teacher_id: ''
})

const subjects = ref<Array<{ id: number; name: string }>>([])
const levels = ref<Array<{ id: number; number: number }>>([])
const groups = ref<Array<{ id: number; display_name: string }>>([])
const teachers = ref<Array<{ id: number; name: string }>>([])

async function loadCourses() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      per_page: perPage.value
    }
    if (filters.value.subject_id) {
      params.subject_id = filters.value.subject_id
    }
    if (filters.value.level_id) {
      params.level_id = filters.value.level_id
    }
    if (filters.value.group_id) {
      params.group_id = filters.value.group_id
    }
    if (filters.value.teacher_id) {
      params.teacher_id = filters.value.teacher_id
    }

    const response = await api.get('/admin/courses', { params })
    courses.value = response.data.data
    currentPage.value = response.data.current_page
    totalPages.value = response.data.last_page
    total.value = response.data.total
  } catch (error) {
    console.error(t('courses.loadError'), error)
  } finally {
    loading.value = false
  }
}

async function loadFiltersData() {
  try {
    // Загружаем предметы
    const subjectsRes = await api.get('/admin/subjects')
    subjects.value = subjectsRes.data.map((s: any) => ({
      id: s.id,
      name: s.name
    }))

    // Загружаем уровни
    const levelsRes = await api.get('/levels')
    levels.value = levelsRes.data.map((l: any) => ({
      id: l.id,
      number: l.number
    }))

    // Загружаем группы
    const groupsRes = await api.get('/admin/groups')
    groups.value = groupsRes.data.map((g: any) => ({
      id: g.id,
      display_name: g.display_name
    }))

    // Загружаем учителей
    const teachersRes = await api.get('/admin/teachers')
    teachers.value = teachersRes.data.map((t: any) => ({
      id: t.id,
      name: t.name
    }))
  } catch (error) {
    console.error('Ошибка загрузки данных для фильтров:', error)
  }
}

function applyFilters() {
  currentPage.value = 1
  loadCourses()
}


function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadCourses()
  }
}

// Load initial data
loadFiltersData()
loadCourses()
</script>

<style scoped>
.admin-courses-view {
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

.courses-counter {
  font-size: 16px;
  color: #666;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.courses-counter strong {
  color: #007bff;
  font-size: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  min-width: 180px;
  color: #272525;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
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

.courses-table {
  width: 100%;
  border-collapse: collapse;
  color: #333;
}

.courses-table th,
.courses-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.courses-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.course-row:hover {
  background-color: #f8f9fa;
}

.course-title {
  font-weight: 500;
  color: #212121;
}

.text-muted {
  color: #999;
}

.btn-view {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
  transition: background-color 0.2s;
  display: inline-block;
}

.btn-view:hover {
  background-color: #0056b3;
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
</style>
