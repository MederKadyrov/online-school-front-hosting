<template>
  <div class="applications-list">
    <div class="page-header">
      <h1>{{ $t('studentApplications') }}</h1>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>{{ $t('status') }}</label>
        <select v-model="filters.status" @change="() => loadApplications()">
          <option value="">{{ $t('all') }}</option>
          <option value="pending">{{ $t('applicationStatus.pending') }}</option>
          <option value="approved">{{ $t('applicationStatus.approved') }}</option>
          <option value="rejected">{{ $t('applicationStatus.rejected') }}</option>
          <option value="needs_revision">{{ $t('applicationStatus.needs_revision') }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('search') }}</label>
        <input
          v-model="filters.search"
          @input="debounceSearch"
          :placeholder="$t('searchByRegistrationNumberOrEmail')"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">
      {{ $t('loading') }}...
    </div>

    <div v-else-if="applications.length === 0" class="empty-state">
      <p>{{ $t('noApplicationsFound') }}</p>
    </div>

    <div v-else class="applications-table">
      <table>
        <thead>
          <tr>
            <th>{{ $t('registrationNumber') }}</th>
            <th>{{ $t('studentName') }}</th>
            <th>{{ $t('guardianEmail') }}</th>
            <th>{{ $t('submittedAt') }}</th>
            <th>{{ $t('status') }}</th>
            <th>{{ $t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id">
            <td>
              <span class="pin-badge">{{ app.registration_number }}</span>
            </td>
            <td>
              <div class="student-info">
                <strong>{{ getStudentName(app) }}</strong>
              </div>
            </td>
            <td>{{ app.guardian_email }}</td>
            <td>{{ formatDate(app.submitted_at) }}</td>
            <td>
              <span :class="['status-badge', app.status]">
                {{ $t(`applicationStatus.${app.status}`) }}
              </span>
            </td>
            <td>
              <button @click="viewApplication(app.id)" class="btn-view">
                {{ $t('view') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.total > pagination.per_page" class="pagination">
      <button
        @click="changePage(pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        class="btn-page"
      >
        {{ $t('previous') }}
      </button>
      <span class="page-info">
        {{ $t('page') }} {{ pagination.current_page }} {{ $t('of') }} {{ pagination.last_page }}
      </span>
      <button
        @click="changePage(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="btn-page"
      >
        {{ $t('next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/api'

const router = useRouter()

const applications = ref<any[]>([])
const loading = ref(false)
const filters = ref({
  status: '',
  search: ''
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0
})

let searchTimeout: any = null

onMounted(() => {
  loadApplications()
})

const loadApplications = async (page = 1) => {
  loading.value = true
  try {
    const params: any = { page }
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.search) params.search = filters.value.search

    const response = await api.get('/admin/applications', { params })
    applications.value = response.data.data
    pagination.value = {
      current_page: response.data.current_page,
      last_page: response.data.last_page,
      per_page: response.data.per_page,
      total: response.data.total
    }
  } catch (error) {
    console.error('Error loading applications:', error)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadApplications()
  }, 500)
}

const changePage = (page: number) => {
  loadApplications(page)
}

const getStudentName = (app: any) => {
  const student = app.application_data?.student
  if (!student) return 'N/A'
  return `${student.last_name} ${student.first_name} ${student.middle_name || ''}`.trim()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const viewApplication = (id: number) => {
  router.push(`/admin/applications/${id}`)
}
</script>

<style scoped>
.applications-list {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a202c;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 0.625rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #667eea;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  color: #718096;
}

.applications-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f7fafc;
}

th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

.pin-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #edf2f7;
  color: #2d3748;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
}

.student-info strong {
  color: #1a202c;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #feebc8;
  color: #7c2d12;
}

.status-badge.approved {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.rejected {
  background: #feb2b2;
  color: #742a2a;
}

.status-badge.needs_revision {
  background: #fed7aa;
  color: #92400e;
}

.btn-view {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
  font-weight: 600;
}
</style>
