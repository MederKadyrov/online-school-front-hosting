<template>
  <div class="assignments-container">
    <div class="assignments-header">
      <h1>{{ $t('studentAssignments.title') }}</h1>
    </div>

    <div class="filters-panel">
      <div class="filter-group">
        <label>{{ $t('studentAssignments.course') }}:</label>
        <select v-model="filters.courseId" @change="loadAssignments">
          <option value="">{{ $t('studentAssignments.allCourses') }}</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('studentAssignments.status') }}:</label>
        <select v-model="filters.status" @change="loadAssignments">
          <option value="">{{ $t('studentAssignments.all') }}</option>
          <option value="pending">{{ $t('studentAssignments.statusPending') }}</option>
          <option value="submitted">{{ $t('studentAssignments.statusSubmitted') }}</option>
          <option value="graded">{{ $t('studentAssignments.statusGraded') }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ $t('studentAssignments.loading') }}</p>
    </div>

    <div v-else-if="assignments.length === 0" class="no-data">
      <ClipboardList class="no-data-icon" :size="48" />
      <p>{{ $t('studentAssignments.noAssignments') }}</p>
    </div>

    <div v-else class="assignments-grid">
      <div
        v-for="assignment in assignments"
        :key="assignment.id"
        class="assignment-card"
        :class="getAssignmentCardClass(assignment)"
      >
        <div class="card-header">
          <div class="title-with-badge">
            <span class="type-badge" :class="assignment.type === 'quiz' ? 'type-quiz' : 'type-assignment'">
              <FlaskConical v-if="assignment.type === 'quiz'" :size="14" />
              <NotebookPen v-else :size="14" />
              {{ assignment.type === 'quiz' ? $t('studentAssignments.quiz') : $t('studentAssignments.assignment') }}
            </span>
            <h3 class="assignment-title">{{ assignment.title }}</h3>
          </div>
          <span class="status-badge" :class="getStatusClass(assignment.submission_status)">
            {{ getStatusLabel(assignment.submission_status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="course-info">
            <span class="course-name">{{ assignment.course_title }}</span>
            <ArrowRight class="breadcrumb-separator" :size="14" />
            <span class="module-name">{{ assignment.module_title }}</span>
            <ArrowRight class="breadcrumb-separator" :size="14" />
            <span class="chapter-name">{{ assignment.chapter_title }}</span>
          </div>

          <p v-if="assignment.description" class="description">
            {{ assignment.description }}
          </p>

          <div class="card-info-grid">
            <div class="info-item">
              <div class="info-label">{{ $t('studentAssignments.deadline') }}</div>
              <div class="info-value" :class="getDeadlineClass(assignment.deadline)">
                {{ getDeadlineText(assignment.deadline) }}
              </div>
            </div>

            <div v-if="assignment.grade" class="info-item">
              <div class="info-label">{{ $t('studentAssignments.grade') }}</div>
              <div class="info-value grade-value">{{ assignment.grade }}/5</div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button
            class="btn-action"
            @click="handleAssignmentClick(assignment)"
          >
            <span class="btn-icon">
              <Eye v-if="assignment.submission_status === 'graded'" :size="16" />
              <FlaskConical v-else-if="assignment.type === 'quiz'" :size="16" />
              <Pencil v-else :size="16" />
            </span>
            <span class="btn-text">
              {{ assignment.submission_status === 'graded'
                ? $t('studentAssignments.view')
                : (assignment.type === 'quiz' ? $t('studentAssignments.takeQuiz') : $t('studentAssignments.complete'))
              }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal для предупреждения о дедлайне -->
    <div v-if="showDeadlineModal" class="modal-overlay" @click="closeDeadlineModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <AlertTriangle class="modal-icon warning" :size="32" />
          <h3>{{ $t('studentAssignments.deadlineExpiredTitle') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ $t('studentAssignments.deadlineExpiredMessage') }}</p>
          <p>{{ $t('studentAssignments.continueAnyway') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeadlineModal">{{ $t('studentAssignments.cancel') }}</button>
          <button class="btn-confirm" @click="confirmDeadlineAction">{{ $t('studentAssignments.continue') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ClipboardList, FlaskConical, NotebookPen, ArrowRight, Eye, Pencil, AlertTriangle } from 'lucide-vue-next'
import api from '../utils/api'

const router = useRouter()
const { t } = useI18n()

interface Assignment {
  id: number
  title: string
  description: string | null
  deadline: string | null
  max_points: number
  paragraph_id: number
  course_title: string
  module_title: string
  chapter_title: string
  submission_status: string | null
  grade: number | null
  type: 'assignment' | 'quiz'
}

interface Course {
  id: number
  title: string
}

const loading = ref(false)
const assignments = ref<Assignment[]>([])
const courses = ref<Course[]>([])
const showDeadlineModal = ref(false)
const pendingParagraphId = ref<number | null>(null)

const filters = ref({
  courseId: '',
  status: ''
})

onMounted(() => {
  loadCourses()
  loadAssignments()
})

async function loadCourses() {
  try {
    const { data } = await api.get('/student/courses')
    courses.value = data
  } catch (error) {
    console.error('Failed to load courses:', error)
  }
}

async function loadAssignments() {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.courseId) params.course_id = filters.value.courseId
    if (filters.value.status) params.status = filters.value.status

    // Загружаем и задания, и тесты параллельно
    const [assignmentsResponse, quizzesResponse] = await Promise.all([
      api.get('/student/assignments', { params }),
      api.get('/student/quizzes', { params })
    ])

    // Добавляем тип к каждому элементу
    const assignmentsWithType = assignmentsResponse.data.map((item: any) => ({
      ...item,
      type: 'assignment'
    }))

    const quizzesWithType = quizzesResponse.data.map((item: any) => ({
      ...item,
      type: 'quiz'
    }))

    // Объединяем и сортируем по дедлайну (сначала с дедлайном, потом без)
    const combined = [...assignmentsWithType, ...quizzesWithType]
    combined.sort((a, b) => {
      // Если у обоих есть дедлайн, сортируем по дате
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      // Элементы с дедлайном идут первыми
      if (a.deadline && !b.deadline) return -1
      if (!a.deadline && b.deadline) return 1
      // Если у обоих нет дедлайна, сортируем по ID (новые сначала)
      return b.id - a.id
    })

    assignments.value = combined
  } catch (error) {
    console.error('Failed to load assignments and quizzes:', error)
  } finally {
    loading.value = false
  }
}

function getStatusLabel(status: string | null): string {
  if (!status || status === 'pending') return t('studentAssignments.statusPending')
  if (status === 'submitted') return t('studentAssignments.statusSubmitted')
  if (status === 'graded') return t('studentAssignments.statusGraded')
  if (status === 'returned') return t('studentAssignments.statusReturned')
  return status
}

function getStatusClass(status: string | null): string {
  if (!status || status === 'pending') return 'status-pending'
  if (status === 'submitted') return 'status-submitted'
  if (status === 'graded') return 'status-graded'
  if (status === 'returned') return 'status-returned'
  return ''
}

function getAssignmentCardClass(assignment: Assignment): string {
  const classes = []

  if (assignment.deadline && isDeadlinePassed(assignment.deadline) && !assignment.submission_status) {
    classes.push('overdue')
  } else if (assignment.deadline && isDeadlineSoon(assignment.deadline) && !assignment.submission_status) {
    classes.push('deadline-soon')
  }

  if (assignment.submission_status === 'graded') {
    classes.push('completed')
  }

  return classes.join(' ')
}

function isDeadlineSoon(deadline: string): boolean {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffDays = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays > 0 && diffDays <= 3
}

function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date()
}

function getDeadlineText(deadline: string | null): string {
  if (!deadline) return '—'

  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMs < 0) {
    return t('studentAssignments.deadlineExpired')
  } else if (diffDays === 0) {
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return t('studentAssignments.remainingMinutes', { minutes: diffMinutes })
    }
    return t('studentAssignments.remainingHours', { hours: diffHours })
  } else if (diffDays === 1) {
    return t('studentAssignments.remainingOneDay')
  } else if (diffDays <= 3) {
    return t('studentAssignments.remainingDays', { days: diffDays })
  } else {
    return t('studentAssignments.remainingDays', { days: diffDays })
  }
}

function getDeadlineClass(deadline: string | null): string {
  if (!deadline) return ''

  if (isDeadlinePassed(deadline)) {
    return 'deadline-expired'
  } else if (isDeadlineSoon(deadline)) {
    return 'deadline-warning'
  }
  return ''
}

function handleAssignmentClick(assignment: Assignment) {
  // Для тестов переходим напрямую к тесту
  if (assignment.type === 'quiz') {
    router.push(`/student/paragraphs/${assignment.paragraph_id}/quiz`)
    return
  }

  // Если задание уже оценено, разрешаем просмотр
  if (assignment.submission_status === 'graded') {
    router.push(`/student/paragraphs/${assignment.paragraph_id}`)
    return
  }

  // Если есть дедлайн и он истек, показываем предупреждение
  if (assignment.deadline && isDeadlinePassed(assignment.deadline) && !assignment.submission_status) {
    pendingParagraphId.value = assignment.paragraph_id
    showDeadlineModal.value = true
    return
  }

  // Переходим к заданию
  router.push(`/student/paragraphs/${assignment.paragraph_id}`)
}

function closeDeadlineModal() {
  showDeadlineModal.value = false
  pendingParagraphId.value = null
}

function confirmDeadlineAction() {
  if (pendingParagraphId.value) {
    router.push(`/student/paragraphs/${pendingParagraphId.value}`)
  }
  closeDeadlineModal()
}
</script>

<style scoped>
.assignments-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.assignments-header {
  margin-bottom: 2rem;
}

.assignments-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.filters-panel {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.filter-group select {
  padding: 0.625rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  color: #2d3748;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  font-size: 1.125rem;
  margin: 0;
}

.no-data {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-data p {
  color: #a0aec0;
  font-size: 1.125rem;
  margin: 0;
}

.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.assignment-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
}

.assignment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.assignment-card.overdue {
  border-color: #fc8181;
  background: linear-gradient(to bottom, #fff5f5 0%, white 40px);
}

.assignment-card.deadline-soon {
  border-color: #f6ad55;
  background: linear-gradient(to bottom, #fffaf0 0%, white 40px);
}

.assignment-card.completed {
  border-color: #68d391;
  background: linear-gradient(to bottom, #f0fff4 0%, white 40px);
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title-with-badge {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.type-assignment {
  background: #e6f3ff;
  color: #0066cc;
}

.type-quiz {
  background: #fff3e6;
  color: #cc6600;
}

.assignment-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  line-height: 1.4;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pending {
  background: #fed7d7;
  color: #c53030;
}

.status-submitted {
  background: #bee3f8;
  color: #2c5282;
}

.status-graded {
  background: #c6f6d5;
  color: #22543d;
}

.status-returned {
  background: #feebc8;
  color: #c05621;
}

.card-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
  line-height: 1.5;
}

.course-name {
  font-weight: 600;
  color: #4a5568;
}

.breadcrumb-separator {
  color: #cbd5e0;
}

.module-name,
.chapter-name {
  color: #718096;
}

.description {
  color: #4a5568;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: auto;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a0aec0;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #2d3748;
}

.deadline-warning {
  color: #dd6b20;
}

.deadline-expired {
  color: #e53e3e;
  font-weight: 700;
}

.grade-value {
  color: #38a169;
  font-size: 1.125rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
}

.btn-action {
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-action:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.125rem;
}

.btn-text {
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .assignments-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .assignments-container {
    padding: 1rem;
  }

  .assignments-header h1 {
    font-size: 1.5rem;
  }

  .filters-panel {
    flex-direction: column;
    padding: 1rem;
  }

  .assignments-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .status-badge {
    align-self: flex-start;
  }

  .card-body {
    padding: 1rem;
  }

  .course-info {
    font-size: 0.8125rem;
  }

  .card-info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .assignments-header h1 {
    font-size: 1.25rem;
  }

  .assignment-title {
    font-size: 1rem;
  }

  .card-info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .btn-action {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.modal-body {
  padding: 0 2rem 2rem;
  text-align: center;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.6;
}

.modal-body p:first-child {
  font-weight: 600;
  color: #e53e3e;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  border-radius: 0 0 16px 16px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-cancel:active,
.btn-confirm:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .modal-icon {
    font-size: 3rem;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 0 1.5rem 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
</style>
