<template>
  <div class="student-journal-view">
    <!-- Заголовок -->
    <div class="page-header">
      <h1>{{ $t('studentJournal.title') }}</h1>
      <p class="page-subtitle">{{ $t('studentJournal.subtitle') }}</p>
    </div>

    <!-- Фильтры -->
    <div class="filters-card">
      <div class="filter-group">
        <label>{{ $t('studentJournal.courseFilter') }}</label>
        <select v-model="filters.course_id" @change="onCourseChange">
          <option value="">{{ $t('studentJournal.selectCourse') }}</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.display_name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('studentJournal.moduleFilter') }}</label>
        <select v-model="filters.module_id" @change="loadJournal" :disabled="!filters.course_id">
          <option value="all">{{ $t('studentJournal.allModules') }}</option>
          <option v-for="module in modules" :key="module.id" :value="module.id">
            {{ module.display_name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Статистика -->
    <div v-if="journalData.total_grades !== undefined" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <span class="stat-label">{{ $t('studentJournal.totalGrades') }}</span>
          <strong class="stat-value">{{ journalData.total_grades }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <span class="stat-label">{{ $t('studentJournal.averageScore') }}</span>
          <strong class="stat-value" :class="getAverageClass(journalData.average)">
            {{ journalData.average?.toFixed(2) || 'N/A' }}
          </strong>
        </div>
      </div>
    </div>

    <!-- Таблица оценок -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('studentJournal.loading') }}</p>
    </div>

    <div v-else-if="filters.course_id && journalData.paragraphs?.length" class="table-container">
      <div class="scroll-hint">{{ $t('studentJournal.scrollHint') }}</div>
      <div class="journal-table-wrapper">
        <table class="journal-table">
        <thead>
          <tr class="header-row-1">
            <template v-for="module in journalData.modules" :key="module.module_id">
              <th
                :colspan="(paragraphsByModule[module.module_id]?.length || 0) * 2 + 1"
                :class="getModuleClass(module.module_number)"
              >
                {{ module.display_name }} - {{ module.title }}
              </th>
            </template>
            <th rowspan="3" class="final-grade-col">{{ $t('studentJournal.yearlyGrade') }}</th>
            <th v-if="journalData.course?.has_exam_grades" rowspan="3" class="final-grade-col">{{ $t('studentJournal.examGrade') }}</th>
            <th v-if="journalData.course?.has_exam_grades" rowspan="3" class="final-grade-col">{{ $t('studentJournal.finalGrade') }}</th>
          </tr>
          <tr class="header-row-2">
            <template v-for="module in journalData.modules" :key="'para-' + module.module_id">
              <template v-for="paragraph in paragraphsByModule[module.module_id]" :key="paragraph.paragraph_id">
                <th colspan="2" class="paragraph-header" :title="paragraph.title">
                  {{ paragraph.display_name }}
                </th>
              </template>
              <th rowspan="2" class="module-grade-header">{{ $t('studentJournal.moduleGradeShort') }}</th>
            </template>
          </tr>
          <tr class="header-row-3">
            <template v-for="module in journalData.modules" :key="'sub-' + module.module_id">
              <template v-for="paragraph in paragraphsByModule[module.module_id]" :key="'subh-' + paragraph.paragraph_id">
                <th class="subheader">{{ $t('studentJournal.assignmentShort') }}</th>
                <th class="subheader">{{ $t('studentJournal.testShort') }}</th>
              </template>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr>
            <template v-for="module in journalData.modules" :key="'mod-' + module.module_id">
              <template v-for="paragraph in paragraphsByModule[module.module_id]" :key="'grade-' + paragraph.paragraph_id">
                <td
                  class="grade-cell"
                  :class="[
                    getGradeCellClass(journalData.grades_by_paragraph[paragraph.paragraph_id]?.assignment?.grade),
                    getModuleCellClass(module.module_number)
                  ]"
                  @click="showGradeDetails(journalData.grades_by_paragraph[paragraph.paragraph_id]?.assignment, 'assignment')"
                  :title="getGradeTitle(journalData.grades_by_paragraph[paragraph.paragraph_id]?.assignment)"
                >
                  {{ journalData.grades_by_paragraph[paragraph.paragraph_id]?.assignment?.grade || '—' }}
                </td>
                <td
                  class="grade-cell"
                  :class="[
                    getGradeCellClass(journalData.grades_by_paragraph[paragraph.paragraph_id]?.quiz?.grade),
                    getModuleCellClass(module.module_number)
                  ]"
                  @click="showGradeDetails(journalData.grades_by_paragraph[paragraph.paragraph_id]?.quiz, 'quiz')"
                  :title="getGradeTitle(journalData.grades_by_paragraph[paragraph.paragraph_id]?.quiz)"
                >
                  {{ journalData.grades_by_paragraph[paragraph.paragraph_id]?.quiz?.grade || '—' }}
                </td>
              </template>

              <!-- Модульная оценка -->
              <td
                class="module-grade-cell"
                :class="[
                  getGradeCellClass(journalData.grades_by_module[module.module_id]?.grade),
                  getModuleCellClass(module.module_number)
                ]"
                @click="showModuleGradeDetails(journalData.grades_by_module[module.module_id])"
                :title="getModuleGradeTitle(journalData.grades_by_module[module.module_id])"
              >
                {{ journalData.grades_by_module[module.module_id]?.grade || '—' }}
              </td>
            </template>

            <!-- Годовая оценка -->
            <td
              class="final-grade-cell"
              :class="getGradeCellClass(journalData.yearly_grade?.grade)"
              @click="showFinalGradeDetails(journalData.yearly_grade, $t('studentJournal.yearlyGrade'))"
              :title="getFinalGradeTitle(journalData.yearly_grade)"
            >
              {{ journalData.yearly_grade?.grade || '—' }}
            </td>

            <!-- Экзаменационная оценка (только для 9 и 11 классов) -->
            <td
              v-if="journalData.course?.has_exam_grades"
              class="final-grade-cell"
              :class="getGradeCellClass(journalData.exam_grade?.grade)"
              @click="showFinalGradeDetails(journalData.exam_grade, $t('studentJournal.examGrade'))"
              :title="getFinalGradeTitle(journalData.exam_grade)"
            >
              {{ journalData.exam_grade?.grade || '—' }}
            </td>

            <!-- Итоговая оценка (только для 9 и 11 классов) -->
            <td
              v-if="journalData.course?.has_exam_grades"
              class="final-grade-cell"
              :class="getGradeCellClass(journalData.final_grade?.grade)"
              @click="showFinalGradeDetails(journalData.final_grade, $t('studentJournal.finalGrade'))"
              :title="getFinalGradeTitle(journalData.final_grade)"
            >
              {{ journalData.final_grade?.grade || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <div v-else-if="filters.course_id" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>{{ $t('studentJournal.noGrades') }}</h3>
      <p>{{ $t('studentJournal.noGradesMessage') }}</p>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>{{ $t('studentJournal.selectCourseTitle') }}</h3>
      <p>{{ $t('studentJournal.selectCourseMessage') }}</p>
    </div>

    <!-- Модалка с деталями оценки -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('studentJournal.gradeDetailsTitle') }}</h2>

        <div v-if="gradeDetails" class="grade-details">
          <div class="detail-row">
            <span class="label">{{ $t('studentJournal.type') }}</span>
            <span class="value">{{ gradeDetails.title }}</span>
          </div>
          <div v-if="gradeDetails.type === 'QuizAttempt'" class="detail-row">
            <span class="label">{{ $t('studentJournal.score') }}</span>
            <span class="value">{{ gradeDetails.score }} / {{ gradeDetails.max_points }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('studentJournal.grade') }}</span>
            <span class="value grade-badge" :class="getGradeBadgeClass(gradeDetails.grade)">
              {{ gradeDetails.grade }}
            </span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('studentJournal.date') }}</span>
            <span class="value">{{ formatDate(gradeDetails.graded_at) }}</span>
          </div>

          <div v-if="gradeDetails.teacher_comment" class="detail-row full-width">
            <span class="label">{{ $t('studentJournal.teacherComment') }}</span>
            <p class="comment">{{ gradeDetails.teacher_comment }}</p>
          </div>
        </div>

        <button @click="closeModal" class="close-btn">{{ $t('studentJournal.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

interface Course {
  id: number
  display_name: string
  subject_name: string
  teacher_name: string
}

interface Module {
  id: number
  display_name: string
}

interface ParagraphInfo {
  paragraph_id: number
  module_id: number
  module_number: number
  chapter_number: number
  paragraph_number: number
  display_name: string
  title: string
}

interface ModuleInfo {
  module_id: number
  module_number: number
  display_name: string
  title: string
}

interface GradeInfo {
  id: number
  grade: number | null
  score: number
  max_points: number
  title: string
  graded_at: string
  teacher_comment?: string | null
  type?: string
}

interface ModuleGradeInfo {
  id: number
  grade: number | null
  graded_at: string | null
  teacher_comment?: string | null
}

interface FinalGradeInfo {
  id: number
  grade: number | null
  graded_at: string | null
  teacher_comment?: string | null
}

interface JournalData {
  grades_by_paragraph: {
    [paragraph_id: number]: {
      assignment: GradeInfo | null
      quiz: GradeInfo | null
    }
  }
  grades_by_module: {
    [module_id: number]: ModuleGradeInfo | null
  }
  paragraphs: ParagraphInfo[]
  modules: ModuleInfo[]
  yearly_grade?: FinalGradeInfo | null
  exam_grade?: FinalGradeInfo | null
  final_grade?: FinalGradeInfo | null
  course?: {
    id: number
    level_id: number
    has_exam_grades: boolean
  }
  average?: number
  total_grades?: number
}

const courses = ref<Course[]>([])
const modules = ref<Module[]>([])

const filters = ref({
  course_id: '',
  module_id: 'all'
})

const journalData = ref<JournalData>({
  grades_by_paragraph: {},
  grades_by_module: {},
  paragraphs: [],
  modules: []
})
const loading = ref(false)

const showModal = ref(false)
const gradeDetails = ref<GradeInfo | null>(null)

// Группируем параграфы по модулям
const paragraphsByModule = computed(() => {
  const grouped: { [moduleId: number]: ParagraphInfo[] } = {}
  journalData.value.paragraphs.forEach(para => {
    if (!grouped[para.module_id]) {
      grouped[para.module_id] = []
    }
    grouped[para.module_id].push(para)
  })
  return grouped
})

onMounted(async () => {
  await loadCourses()
})

async function loadCourses() {
  try {
    const response = await api.get('/student/journal/courses')
    courses.value = response.data
  } catch (error) {
    console.error(t('studentJournal.errorLoadingCourses'), error)
  }
}

async function onCourseChange() {
  filters.value.module_id = 'all'
  if (filters.value.course_id) {
    await loadModules()
    await loadJournal()
  } else {
    journalData.value = {
      grades_by_paragraph: {},
      grades_by_module: {},
      paragraphs: [],
      modules: []
    }
  }
}

async function loadModules() {
  if (!filters.value.course_id) return

  try {
    const response = await api.get('/student/journal/modules', {
      params: { course_id: filters.value.course_id }
    })
    modules.value = response.data
  } catch (error) {
    console.error(t('studentJournal.errorLoadingModules'), error)
  }
}

async function loadJournal() {
  if (!filters.value.course_id) return

  loading.value = true
  try {
    const response = await api.get('/student/journal', {
      params: filters.value
    })
    journalData.value = response.data
  } catch (error) {
    console.error(t('studentJournal.errorLoadingJournal'), error)
  } finally {
    loading.value = false
  }
}

function showGradeDetails(gradeInfo: GradeInfo | null | undefined, type: 'assignment' | 'quiz' = 'assignment') {
  if (gradeInfo) {
    gradeDetails.value = {
      ...gradeInfo,
      type: type === 'quiz' ? 'QuizAttempt' : 'AssignmentSubmission'
    }
    showModal.value = true
  }
}

function showModuleGradeDetails(moduleGrade: ModuleGradeInfo | null | undefined) {
  if (moduleGrade) {
    gradeDetails.value = {
      id: moduleGrade.id,
      grade: moduleGrade.grade,
      score: 0,
      max_points: 0,
      title: t('studentJournal.moduleGrade'),
      graded_at: moduleGrade.graded_at || '',
      teacher_comment: moduleGrade.teacher_comment
    }
    showModal.value = true
  }
}

function showFinalGradeDetails(finalGrade: FinalGradeInfo | null | undefined, title: string) {
  if (finalGrade) {
    gradeDetails.value = {
      id: finalGrade.id,
      grade: finalGrade.grade,
      score: 0,
      max_points: 0,
      title: title,
      graded_at: finalGrade.graded_at || '',
      teacher_comment: finalGrade.teacher_comment
    }
    showModal.value = true
  }
}

function getFinalGradeTitle(finalGrade: FinalGradeInfo | null | undefined): string {
  if (!finalGrade) return ''
  return `${t('studentJournal.date')}: ${formatDate(finalGrade.graded_at || '')}`
}

function closeModal() {
  showModal.value = false
  gradeDetails.value = null
}

function getGradeTitle(gradeInfo: GradeInfo | null | undefined): string {
  if (!gradeInfo) return ''
  return `${gradeInfo.title}\n${t('studentJournal.score')}: ${gradeInfo.score}/${gradeInfo.max_points}\n${t('studentJournal.date')}: ${formatDate(gradeInfo.graded_at)}`
}

function getModuleGradeTitle(moduleGrade: ModuleGradeInfo | null | undefined): string {
  if (!moduleGrade) return ''
  return `${t('studentJournal.moduleGrade')}\n${t('studentJournal.date')}: ${formatDate(moduleGrade.graded_at || '')}`
}

function getGradeCellClass(grade: number | null | undefined): string {
  if (!grade) return ''
  if (grade === 5) return 'grade-5'
  if (grade >= 4) return 'grade-4'
  if (grade >= 3) return 'grade-3'
  return 'grade-2'
}

function getModuleClass(moduleNumber: number): string {
  return `module-${moduleNumber % 4}`
}

function getModuleCellClass(moduleNumber: number): string {
  return `module-bg-${moduleNumber % 4}`
}

function getGradeBadgeClass(grade: number | null): string {
  if (!grade) return 'grade-none'
  if (grade === 5) return 'grade-5'
  if (grade === 4) return 'grade-4'
  if (grade === 3) return 'grade-3'
  return 'grade-2'
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getAverageClass(average: number | undefined): string {
  if (!average) return ''
  if (average >= 4.5) return 'excellent'
  if (average >= 3.5) return 'good'
  if (average >= 2.5) return 'satisfactory'
  return 'poor'
}
</script>

<style scoped>
.student-journal-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Заголовок страницы */
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 32px;
  color: #213547;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.page-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

/* Фильтры */
.filters-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.filter-group label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.filter-group select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
  cursor: pointer;
  color: #555555;
}

.filter-group select:hover:not(:disabled) {
  border-color: #667eea;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  border-color: #e5e7eb;
  color: #9ca3af;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 48px;
  line-height: 1;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #213547;
}

.stat-value.excellent {
  color: #22c55e;
}

.stat-value.good {
  color: #3b82f6;
}

.stat-value.satisfactory {
  color: #f59e0b;
}

.stat-value.poor {
  color: #ef4444;
}

/* Состояние загрузки */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

/* Контейнер таблицы */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.scroll-hint {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
}

.journal-table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
  max-height: 70vh;
  min-height: 400px;
}

/* Кастомный скроллбар */
.journal-table-wrapper::-webkit-scrollbar {
  height: 12px;
  width: 12px;
}

.journal-table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.journal-table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

.journal-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.journal-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  color: #213547;
  font-size: 14px;
}

.journal-table th,
.journal-table td {
  padding: 12px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.journal-table th {
  background-color: #f8fafc;
  color: #1e293b;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Заголовки модулей */
.header-row-1 th {
  font-size: 15px;
  font-weight: 700;
  padding: 16px;
  color: white;
}

.module-0 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.module-1 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.module-2 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
}

.module-3 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important;
}


/* Заголовки параграфов */
.paragraph-header {
  background-color: #f1f5f9;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

/* Подзаголовки З/Т */
.header-row-3 .subheader {
  background-color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  width: 50px;
  padding: 10px;
  color: #1e293b;
}

/* Ячейки с оценками */
.grade-cell {
  cursor: pointer;
  font-weight: 700;
  font-size: 18px;
  min-width: 50px;
  padding: 14px 10px;
  transition: all 0.2s;
  position: relative;
}

.grade-cell:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  z-index: 20;
  border-radius: 8px;
}

/* Фоны ячеек по модулям */
.module-bg-0 {
  background-color: #f0f3ff;
}

.module-bg-1 {
  background-color: #fff0f7;
}

.module-bg-2 {
  background-color: #f0fbff;
}

.module-bg-3 {
  background-color: #f0fff7;
}

/* Цветовая индикация оценок */
.grade-cell.grade-5 {
  /* color: #27ae60; */
  font-weight: 800;
}

.grade-cell.grade-4 {
  /* color: #3498db; */
  font-weight: 800;
}

.grade-cell.grade-3 {
  /* color: #f39c12; */
  font-weight: 800;
}

.grade-cell.grade-2 {
  /* color: #e74c3c; */
  font-weight: 800;
}

/* Модульная оценка */
.module-grade-header {
  background-color: #95a5a6;
  font-size: 12px;
  font-weight: 700;
  width: 50px;
  padding: 8px;
  border-left: 3px solid #34495e !important;
  color: white;
}

.module-grade-cell {
  font-weight: 800;
  font-size: 18px;
  min-width: 50px;
  padding: 12px 8px;
  border-left: 3px solid #34495e !important;
  background-color: rgba(52, 73, 94, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.module-grade-cell:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 20;
}

/* Финальные оценки (годовая, экзаменационная, итоговая) */
.header-row-1 .final-grade-col {
  /* background-color: #fff3cd; */
  font-weight: 700;
  min-width: 80px;
  /* border-left: 2px solid; */
  /* color: #856404; */
    background-color: #e9ecef;
  color: #333;
  
}


.final-grade-cell {
  background-color: #fffbf0;
  font-weight: 700;
  font-size: 18px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 2px solid #ffc107;
}

.final-grade-cell:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  z-index: 20;
}

.grade-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 16px;
}

.grade-5 {
  background-color: #27ae60;
  color: white;
}

.grade-4 {
  background-color: #3498db;
  color: white;
}

.grade-3 {
  background-color: #f39c12;
  color: white;
}

.grade-2 {
  background-color: #e74c3c;
  color: white;
}

.grade-none {
  background-color: #95a5a6;
  color: white;
}

/* Модалка */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  padding: 35px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2c3e50;
  font-size: 24px;
}

.grade-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background-color: #ecf0f1;
  border-radius: 6px;
}

.detail-row.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.detail-row .label {
  font-weight: 700;
  color: #7f8c8d;
  font-size: 14px;
}

.detail-row .value {
  color: #2c3e50;
  font-weight: 600;
}

.detail-row .comment {
  margin: 0;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  width: 100%;
  white-space: pre-wrap;
  border-left: 4px solid #3498db;
}

.close-btn {
  margin-top: 25px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  display: block;
}

.empty-state h3 {
  font-size: 24px;
  color: #213547;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.empty-state p {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .student-journal-view {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .filters-card {
    padding: 16px;
    gap: 16px;
  }

  .filter-group {
    min-width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    font-size: 40px;
  }

  .stat-value {
    font-size: 28px;
  }

  .scroll-hint {
    font-size: 12px;
    padding: 10px;
  }

  .journal-table th,
  .journal-table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .grade-cell {
    font-size: 16px;
    padding: 10px 6px;
    min-width: 45px;
  }

  .header-row-1 th {
    font-size: 13px;
    padding: 12px;
  }

  .empty-state {
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 56px;
  }

  .empty-state h3 {
    font-size: 20px;
  }

  .empty-state p {
    font-size: 14px;
  }

  .modal-content {
    padding: 24px;
  }
}

@media print {
  .filters-card,
  .scroll-hint,
  .modal-overlay {
    display: none;
  }

  .table-container {
    box-shadow: none;
  }

  .journal-table-wrapper {
    overflow: visible;
  }
}
</style>
