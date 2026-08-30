<template>
  <div class="teacher-journal-view">
    <h1>{{ $t('teacherJournal.title') }}</h1>

    <!-- Фильтры -->
    <div class="filters">
      <div class="filter-group">
        <label>{{ $t('teacherJournal.group') }}:</label>
        <select v-model="filters.group_id" @change="onGroupChange">
          <option value="">{{ $t('teacherJournal.selectGroup') }}</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.display_name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('teacherJournal.course') }}:</label>
        <select v-model="filters.course_id" @change="onCourseChange" :disabled="!filters.group_id">
          <option value="">{{ $t('teacherJournal.selectCourse') }}</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.display_name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ $t('teacherJournal.module') }}:</label>
        <select v-model="filters.module_id" @change="loadJournal" :disabled="!filters.course_id">
          <option value="all">{{ $t('teacherJournal.allModules') }}</option>
          <option v-for="module in modules" :key="module.id" :value="module.id">
            {{ module.display_name }}
          </option>
        </select>
      </div>

      <button @click="exportJournal" :disabled="!journalData.students?.length" class="export-btn">
        <FileText :size="16" /> {{ $t('teacherJournal.export') }}
      </button>
    </div>

    <!-- Статистика -->
    <div v-if="journalData.summary" class="summary">
      <div class="summary-item">
        <span>{{ $t('teacherJournal.totalStudents') }}:</span>
        <strong>{{ journalData.summary.total_students }}</strong>
      </div>
      <div class="summary-item">
        <span>{{ $t('teacherJournal.totalGrades') }}:</span>
        <strong>{{ journalData.summary.total_grades }}</strong>
      </div>
      <div class="summary-item">
        <span>{{ $t('teacherJournal.averageGrade') }}:</span>
        <strong>{{ journalData.summary.average_grade?.toFixed(2) || 'N/A' }}</strong>
      </div>
    </div>

    <!-- Таблица журнала -->
    <div v-if="loading" class="loading">{{ $t('teacherJournal.loading') }}</div>

    <div v-else-if="journalData.students?.length" class="journal-table-wrapper">
      <table class="journal-table">
        <thead>
          <tr class="header-row-1">
            <th rowspan="3" class="sticky-col">№</th>
            <th rowspan="3" class="sticky-col student-name-col">{{ $t('teacherJournal.student') }}</th>
            <template v-for="module in journalData.modules" :key="module.module_id">
              <th
                :colspan="(paragraphsByModule[module.module_id]?.length || 0) * 2 + 1"
                :class="getModuleClass(module.module_number)"
              >
                {{ module.display_name }}
              </th>
            </template>
            <th rowspan="3" class="final-grade-col">{{ $t('teacherJournal.yearly') }}</th>
            <th v-if="journalData.course?.has_exam_grades" rowspan="3" class="final-grade-col">{{ $t('teacherJournal.exam') }}</th>
            <th v-if="journalData.course?.has_exam_grades" rowspan="3" class="final-grade-col">{{ $t('teacherJournal.final') }}</th>
            <th rowspan="3" class="average-col">{{ $t('teacherJournal.averageGrade') }}</th>
          </tr>
          <tr class="header-row-2">
            <template v-for="module in journalData.modules" :key="'para-' + module.module_id">
              <template v-for="paragraph in paragraphsByModule[module.module_id]" :key="paragraph.paragraph_id">
                <th colspan="2" class="paragraph-header" :title="paragraph.title">
                  {{ paragraph.display_name }}
                </th>
              </template>
              <th rowspan="2" class="module-grade-header">{{ $t('teacherJournal.moduleGradeShort') }}</th>
            </template>
          </tr>
          <tr class="header-row-3">
            <template v-for="module in journalData.modules" :key="'sub-' + module.module_id">
              <template v-for="paragraph in paragraphsByModule[module.module_id]" :key="'subh-' + paragraph.paragraph_id">
                <th class="subheader">{{ $t('teacherJournal.assignmentShort') }}</th>
                <th class="subheader">{{ $t('teacherJournal.quizShort') }}</th>
              </template>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, index) in journalData.students" :key="student.student_id">
            <td class="sticky-col">{{ index + 1 }}</td>
            <td class="sticky-col student-name-col">{{ student.student_name }}</td>

            <template v-for="module in journalData.modules" :key="'mod-' + module.module_id">
              <template v-for="paragraph in paragraphsByModule[module.module_id]" :key="'grade-' + paragraph.paragraph_id">
                <td
                  class="grade-cell"
                  :class="[
                    getGradeCellClass(student.grades_by_paragraph[paragraph.paragraph_id]?.assignment?.grade),
                    getModuleCellClass(module.module_number)
                  ]"
                  @click="handleGradeClick(student.grades_by_paragraph[paragraph.paragraph_id]?.assignment)"
                >
                  {{ student.grades_by_paragraph[paragraph.paragraph_id]?.assignment?.grade || '—' }}
                </td>
                <td
                  class="grade-cell"
                  :class="[
                    getGradeCellClass(student.grades_by_paragraph[paragraph.paragraph_id]?.quiz?.grade),
                    getModuleCellClass(module.module_number)
                  ]"
                  @click="handleGradeClick(student.grades_by_paragraph[paragraph.paragraph_id]?.quiz)"
                >
                  {{ student.grades_by_paragraph[paragraph.paragraph_id]?.quiz?.grade || '—' }}
                </td>
              </template>

              <!-- Модульная оценка (редактируемая) -->
              <td
                class="module-grade-cell editable"
                :class="[
                  getGradeCellClass(student.grades_by_module[module.module_id]?.grade),
                  getModuleCellClass(module.module_number)
                ]"
                @click="openModuleGradeModal(student, module)"
                :title="student.grades_by_module[module.module_id]?.graded_at ? t('teacherJournal.gradedAt', { date: formatDate(student.grades_by_module[module.module_id]!.graded_at!) }) : t('teacherJournal.clickToGrade')"
              >
                {{ student.grades_by_module[module.module_id]?.grade || '—' }}
              </td>
            </template>

            <!-- Годовая оценка (редактируемая) -->
            <td
              class="final-grade-cell editable"
              :class="getGradeCellClass(student.yearly_grade?.grade)"
              @click="openFinalGradeModal(student, 'yearly')"
              :title="student.yearly_grade?.graded_at ? t('teacherJournal.gradedAt', { date: formatDate(student.yearly_grade.graded_at) }) : t('teacherJournal.clickToGradeYearly')"
            >
              {{ student.yearly_grade?.grade || '—' }}
            </td>

            <!-- Экзаменационная оценка (только для 9 и 11 классов) -->
            <td
              v-if="journalData.course?.has_exam_grades"
              class="final-grade-cell editable"
              :class="getGradeCellClass(student.exam_grade?.grade)"
              @click="openFinalGradeModal(student, 'exam')"
              :title="student.exam_grade?.graded_at ? t('teacherJournal.gradedAt', { date: formatDate(student.exam_grade.graded_at) }) : t('teacherJournal.clickToGradeExam')"
            >
              {{ student.exam_grade?.grade || '—' }}
            </td>

            <!-- Итоговая оценка (только для 9 и 11 классов) -->
            <td
              v-if="journalData.course?.has_exam_grades"
              class="final-grade-cell editable"
              :class="getGradeCellClass(student.final_grade?.grade)"
              @click="openFinalGradeModal(student, 'final')"
              :title="student.final_grade?.graded_at ? t('teacherJournal.gradedAt', { date: formatDate(student.final_grade.graded_at) }) : t('teacherJournal.clickToGradeFinal')"
            >
              {{ student.final_grade?.grade || '—' }}
            </td>

            <td class="average-cell">{{ student.average?.toFixed(2) || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="filters.group_id && filters.course_id" class="no-data">
      {{ $t('teacherJournal.noData') }}
    </div>

    <div v-else class="no-data">
      {{ $t('teacherJournal.selectGroupAndCourse') }}
    </div>

    <!-- Модалка для выставления модульной оценки -->
    <div v-if="showModuleGradeModal" class="modal-overlay" @click="closeModuleGradeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('teacherJournal.moduleGrade') }}</h2>

        <div v-if="moduleGradeForm.student" class="grade-form">
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.student') }}:</span>
            <span class="value">{{ moduleGradeForm.student.student_name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.module') }}:</span>
            <span class="value">{{ moduleGradeForm.module?.display_name }} - {{ moduleGradeForm.module?.title }}</span>
          </div>

          <div class="form-group">
            <label for="grade">{{ $t('teacherJournal.gradeLabel') }}:</label>
            <select id="grade" v-model.number="moduleGradeForm.grade_5" required>
              <option :value="null">{{ $t('teacherJournal.selectGrade') }}</option>
              <option :value="5">5 ({{ $t('teacherJournal.excellent') }})</option>
              <option :value="4">4 ({{ $t('teacherJournal.good') }})</option>
              <option :value="3">3 ({{ $t('teacherJournal.satisfactory') }})</option>
              <option :value="2">2 ({{ $t('teacherJournal.unsatisfactory') }})</option>
            </select>
          </div>

          <div class="form-group">
            <label for="comment">{{ $t('teacherJournal.comment') }}:</label>
            <textarea
              id="comment"
              v-model="moduleGradeForm.teacher_comment"
              rows="3"
              maxlength="1000"
              :placeholder="$t('teacherJournal.commentPlaceholder')"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button @click="saveModuleGrade" :disabled="moduleGradeForm.grade_5 === null || saving" class="save-btn">
              {{ saving ? $t('teacherJournal.saving') : $t('teacherJournal.save') }}
            </button>
            <button
              v-if="moduleGradeForm.id"
              @click="deleteModuleGrade"
              :disabled="saving"
              class="delete-btn"
            >
              {{ $t('teacherJournal.deleteGrade') }}
            </button>
            <button @click="closeModuleGradeModal" :disabled="saving" class="cancel-btn">
              {{ $t('teacherJournal.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка для выставления финальных оценок (годовая, экзамен, итоговая) -->
    <div v-if="showFinalGradeModal" class="modal-overlay" @click="closeFinalGradeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ getFinalGradeTitle() }}</h2>

        <div v-if="finalGradeForm.student" class="grade-form">
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.student') }}:</span>
            <span class="value">{{ finalGradeForm.student.student_name }}</span>
          </div>

          <div class="form-group">
            <label for="final-grade">{{ $t('teacherJournal.gradeLabel') }}:</label>
            <select id="final-grade" v-model.number="finalGradeForm.grade_5" required>
              <option :value="null">{{ $t('teacherJournal.selectGrade') }}</option>
              <option :value="5">5 ({{ $t('teacherJournal.excellent') }})</option>
              <option :value="4">4 ({{ $t('teacherJournal.good') }})</option>
              <option :value="3">3 ({{ $t('teacherJournal.satisfactory') }})</option>
              <option :value="2">2 ({{ $t('teacherJournal.unsatisfactory') }})</option>
            </select>
          </div>

          <div class="form-group">
            <label for="final-comment">{{ $t('teacherJournal.comment') }}:</label>
            <textarea
              id="final-comment"
              v-model="finalGradeForm.teacher_comment"
              rows="3"
              maxlength="1000"
              :placeholder="$t('teacherJournal.commentPlaceholder')"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button @click="saveFinalGrade" :disabled="finalGradeForm.grade_5 === null || saving" class="save-btn">
              {{ saving ? $t('teacherJournal.saving') : $t('teacherJournal.save') }}
            </button>
            <button
              v-if="finalGradeForm.id"
              @click="deleteFinalGrade"
              :disabled="saving"
              class="delete-btn"
            >
              {{ $t('teacherJournal.deleteGrade') }}
            </button>
            <button @click="closeFinalGradeModal" :disabled="saving" class="cancel-btn">
              {{ $t('teacherJournal.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка с деталями оценки (для заданий и тестов) -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('teacherJournal.gradeDetails') }}</h2>

        <div v-if="gradeDetails" class="grade-details">
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.student') }}:</span>
            <span class="value">{{ gradeDetails.student_name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.group') }}:</span>
            <span class="value">{{ gradeDetails.group }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.subject') }}:</span>
            <span class="value">{{ gradeDetails.subject }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.type') }}:</span>
            <span class="value">{{ getGradeType(gradeDetails.type) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.itemTitle') }}:</span>
            <span class="value">{{ gradeDetails.title }}</span>
          </div>
          <div v-if="gradeDetails.type === 'QuizAttempt'" class="detail-row">
            <span class="label">{{ $t('teacherJournal.points') }}:</span>
            <span class="value">{{ gradeDetails.score }} / {{ gradeDetails.max_points }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.gradeValue') }}:</span>
            <span class="value grade-badge" :class="getGradeBadgeClass(gradeDetails.grade_5)">
              {{ gradeDetails.grade_5 }}
            </span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('teacherJournal.date') }}:</span>
            <span class="value">{{ formatDate(gradeDetails.graded_at) }}</span>
          </div>

          <div v-if="gradeDetails.teacher_comment" class="detail-row full-width">
            <span class="label">{{ $t('teacherJournal.teacherComment') }}:</span>
            <p class="comment">{{ gradeDetails.teacher_comment }}</p>
          </div>
        </div>

        <div v-else class="loading">{{ $t('teacherJournal.loading') }}</div>

        <button @click="closeModal" class="close-btn">{{ $t('teacherJournal.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileText } from 'lucide-vue-next'
import api from '../utils/api'

const { t } = useI18n()

interface Group {
  id: number
  display_name: string
}

interface Course {
  id: number
  display_name: string
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

interface StudentData {
  student_id: number
  student_name: string
  grades_by_paragraph: {
    [paragraph_id: number]: {
      assignment: GradeInfo | null
      quiz: GradeInfo | null
    }
  }
  grades_by_module: {
    [module_id: number]: ModuleGradeInfo | null
  }
  yearly_grade: FinalGradeInfo | null
  exam_grade: FinalGradeInfo | null
  final_grade: FinalGradeInfo | null
  average: number
}

interface JournalData {
  students: StudentData[]
  paragraphs: ParagraphInfo[]
  modules: ModuleInfo[]
  course?: {
    id: number
    level_id: number
    has_exam_grades: boolean
  }
  summary?: {
    total_students: number
    total_grades: number
    average_grade: number
  }
}

const groups = ref<Group[]>([])
const courses = ref<Course[]>([])
const modules = ref<Module[]>([])

const filters = ref({
  group_id: '',
  course_id: '',
  module_id: 'all'
})

const journalData = ref<JournalData>({ students: [], paragraphs: [], modules: [] })
const loading = ref(false)

const showModal = ref(false)
const gradeDetails = ref<any>(null)

const showModuleGradeModal = ref(false)
const moduleGradeForm = ref<{
  id: number | null
  student: StudentData | null
  module: ModuleInfo | null
  grade_5: number | null
  teacher_comment: string
}>({
  id: null,
  student: null,
  module: null,
  grade_5: null,
  teacher_comment: ''
})

const showFinalGradeModal = ref(false)
const finalGradeForm = ref<{
  id: number | null
  student: StudentData | null
  gradeType: 'yearly' | 'exam' | 'final' | null
  grade_5: number | null
  teacher_comment: string
}>({
  id: null,
  student: null,
  gradeType: null,
  grade_5: null,
  teacher_comment: ''
})

const saving = ref(false)

// Группируем параграфы по модулям для визуального отображения
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
  await loadGroups()
})

async function loadGroups() {
  try {
    const response = await api.get('/teacher/journal/groups')
    groups.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

async function loadCourses(groupId?: string) {
  try {
    const params = groupId ? { group_id: groupId } : {}
    const response = await api.get('/teacher/journal/courses', { params })
    courses.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error)
  }
}

async function onGroupChange() {
  filters.value.course_id = ''
  filters.value.module_id = 'all'
  modules.value = []
  journalData.value = { students: [], paragraphs: [], modules: [] }

  // Загружаем курсы для выбранной группы
  if (filters.value.group_id) {
    await loadCourses(filters.value.group_id)
  } else {
    courses.value = []
  }
}

async function onCourseChange() {
  filters.value.module_id = 'all'
  await loadModules()
  await loadJournal()
}

async function loadModules() {
  if (!filters.value.course_id) return

  try {
    const response = await api.get('/teacher/journal/modules', {
      params: { course_id: filters.value.course_id }
    })
    modules.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки модулей:', error)
  }
}

async function loadJournal() {
  if (!filters.value.group_id || !filters.value.course_id) return

  loading.value = true
  try {
    const response = await api.get('/teacher/journal', {
      params: filters.value
    })
    journalData.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки журнала:', error)
  } finally {
    loading.value = false
  }
}

function handleGradeClick(gradeInfo: GradeInfo | null | undefined) {
  if (gradeInfo && gradeInfo.id) {
    showGradeDetails(gradeInfo.id)
  }
}

async function showGradeDetails(gradeId: number) {
  showModal.value = true
  gradeDetails.value = null

  try {
    const response = await api.get(`/teacher/journal/grades/${gradeId}`)
    gradeDetails.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки деталей оценки:', error)
  }
}

function closeModal() {
  showModal.value = false
  gradeDetails.value = null
}

function openModuleGradeModal(student: StudentData, module: ModuleInfo) {
  const existingGrade = student.grades_by_module[module.module_id]

  moduleGradeForm.value = {
    id: existingGrade?.id || null,
    student: student,
    module: module,
    grade_5: existingGrade?.grade || null,
    teacher_comment: existingGrade?.teacher_comment || ''
  }

  showModuleGradeModal.value = true
}

function closeModuleGradeModal() {
  showModuleGradeModal.value = false
  moduleGradeForm.value = {
    id: null,
    student: null,
    module: null,
    grade_5: null,
    teacher_comment: ''
  }
}

async function saveModuleGrade() {
  if (!moduleGradeForm.value.student || !moduleGradeForm.value.module || moduleGradeForm.value.grade_5 === null) {
    return
  }

  saving.value = true
  try {
    await api.post('/teacher/journal/module-grades', {
      student_id: moduleGradeForm.value.student.student_id,
      module_id: moduleGradeForm.value.module.module_id,
      course_id: filters.value.course_id,
      grade_5: moduleGradeForm.value.grade_5,
      teacher_comment: moduleGradeForm.value.teacher_comment
    })

    // Перезагружаем журнал
    await loadJournal()
    closeModuleGradeModal()
  } catch (error: any) {
    console.error('Ошибка сохранения модульной оценки:', error)
    alert('Ошибка сохранения оценки: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

async function deleteModuleGrade() {
  if (!moduleGradeForm.value.id) return

  if (!confirm('Вы уверены, что хотите удалить эту модульную оценку?')) return

  saving.value = true
  try {
    await api.delete(`/teacher/journal/module-grades/${moduleGradeForm.value.id}`)

    // Перезагружаем журнал
    await loadJournal()
    closeModuleGradeModal()
  } catch (error: any) {
    console.error('Ошибка удаления модульной оценки:', error)
    alert('Ошибка удаления оценки: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

// ===== Функции для финальных оценок (годовая, экзамен, итоговая) =====

function openFinalGradeModal(student: StudentData, gradeType: 'yearly' | 'exam' | 'final') {
  const existingGrade = gradeType === 'yearly'
    ? student.yearly_grade
    : gradeType === 'exam'
    ? student.exam_grade
    : student.final_grade

  finalGradeForm.value = {
    id: existingGrade?.id || null,
    student: student,
    gradeType: gradeType,
    grade_5: existingGrade?.grade || null,
    teacher_comment: existingGrade?.teacher_comment || ''
  }
  showFinalGradeModal.value = true
}

function closeFinalGradeModal() {
  showFinalGradeModal.value = false
  finalGradeForm.value = {
    id: null,
    student: null,
    gradeType: null,
    grade_5: null,
    teacher_comment: ''
  }
}

function getFinalGradeTitle(): string {
  const gradeType = finalGradeForm.value.gradeType || 'yearly'
  if (gradeType === 'yearly') return t('teacherJournal.yearlyGrade')
  if (gradeType === 'exam') return t('teacherJournal.examGrade')
  if (gradeType === 'final') return t('teacherJournal.finalGrade')
  return t('teacherJournal.finalGrade')
}

async function saveFinalGrade() {
  if (!finalGradeForm.value.student || finalGradeForm.value.grade_5 === null || !finalGradeForm.value.gradeType) {
    return
  }

  saving.value = true
  try {
    const endpoint = finalGradeForm.value.gradeType === 'yearly'
      ? 'yearly-grade'
      : finalGradeForm.value.gradeType === 'exam'
      ? 'exam-grade'
      : 'final-grade'

    await api.post(`/teacher/courses/${filters.value.course_id}/${endpoint}`, {
      student_id: finalGradeForm.value.student.student_id,
      grade_5: finalGradeForm.value.grade_5,
      teacher_comment: finalGradeForm.value.teacher_comment || null
    })

    // Перезагружаем журнал
    await loadJournal()
    closeFinalGradeModal()
  } catch (error: any) {
    console.error('Ошибка сохранения финальной оценки:', error)
    alert(t('teacherJournal.saveError') + ': ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

async function deleteFinalGrade() {
  if (!finalGradeForm.value.id) return

  const gradeTypeName = getFinalGradeTitle().toLowerCase()
  if (!confirm(t('teacherJournal.confirmDelete', { gradeName: gradeTypeName }))) return

  saving.value = true
  try {
    await api.delete(`/teacher/final-grades/${finalGradeForm.value.id}`)

    // Перезагружаем журнал
    await loadJournal()
    closeFinalGradeModal()
  } catch (error: any) {
    console.error('Ошибка удаления финальной оценки:', error)
    alert(t('teacherJournal.deleteError') + ': ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
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

function getGradeType(type: string): string {
  if (type === 'QuizAttempt') return t('teacherJournal.typeQuiz')
  if (type === 'AssignmentSubmission') return t('teacherJournal.typeAssignment')
  if (type === 'Module') return t('teacherJournal.typeModule')
  if (type === 'Lesson') return t('teacherJournal.typeLesson')
  return type
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

async function exportJournal() {
  try {
    const response = await api.get('/teacher/journal/export', {
      params: {
        group_id: filters.value.group_id,
        course_id: filters.value.course_id,
        module_id: filters.value.module_id
      },
      responseType: 'blob'
    })

    // Создаем blob URL и скачиваем файл
    const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // Извлекаем имя файла из заголовка Content-Disposition или генерируем его
    const contentDisposition = response.headers['content-disposition']
    let filename = 'journal.csv'
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
    console.error('Ошибка экспорта журнала:', error)
    alert('Ошибка при экспорте данных')
  }
}
</script>

<style scoped>
.teacher-journal-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  font-size: 14px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.filter-group select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.export-btn {
  padding: 8px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.export-btn:hover:not(:disabled) {
  background-color: #218838;
}

.export-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.summary {
  display: flex;
  gap: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-item span {
  font-size: 14px;
  color: #666;
}

.summary-item strong {
  font-size: 24px;
  color: #333;
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.journal-table-wrapper {
  overflow-x: auto;
  position: relative;
}

.journal-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  color: #333;
  font-size: 13px;
}

.journal-table th,
.journal-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
}

.journal-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.journal-table .sticky-col {
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 5;
}

.journal-table thead .sticky-col {
  z-index: 15;
  background-color: #f8f9fa;
}

.student-name-col {
  left: 40px !important;
  min-width: 180px;
  text-align: left;
}

.journal-table tbody .sticky-col:first-child {
  left: 0;
  width: 40px;
}

.journal-table tbody tr:hover {
  background-color: #f8f9fa;
}

.journal-table tbody tr:hover .sticky-col {
  background-color: #f8f9fa;
}

/* Заголовки модулей */
.header-row-1 th {
  background-color: #e9ecef;
  font-size: 14px;
  font-weight: 700;
}

.module-0 {
  background-color: #e3f2fd !important;
}

.module-1 {
  background-color: #f3e5f5 !important;
}

.module-2 {
  background-color: #e8f5e9 !important;
}

.module-3 {
  background-color: #fff3e0 !important;
}

/* Заголовки параграфов */
.paragraph-header {
  background-color: #f8f9fa;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* Подзаголовки З/Т */
.header-row-3 .subheader {
  background-color: #dee2e6;
  font-size: 11px;
  font-weight: 600;
  width: 35px;
  padding: 4px;
}

/* Ячейки с оценками */
.grade-cell {
  cursor: pointer;
  font-weight: 600;
  min-width: 35px;
  padding: 6px 4px;
  transition: transform 0.1s, box-shadow 0.1s;
}

.grade-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(0,0,0,0.2);
  z-index: 20;
}

/* Фоны ячеек по модулям */
.module-bg-0 {
  background-color: #f0f8ff;
}

.module-bg-1 {
  background-color: #faf5ff;
}

.module-bg-2 {
  background-color: #f1f8f4;
}

.module-bg-3 {
  background-color: #fffaf0;
}

/* Цветовая индикация оценок */
.grade-cell.grade-5 {
  /* color: #28a745; */
  font-weight: 700;
}

.grade-cell.grade-4 {
  /* color: #17a2b8; */
  font-weight: 700;
}

.grade-cell.grade-3 {
  /* color: #ffc107; */
  font-weight: 700;
}

.grade-cell.grade-2 {
  /* color: #dc3545; */
  font-weight: 700;
}

/* Модульная оценка */
.module-grade-header {
  background-color: #dee2e6;
  font-size: 11px;
  font-weight: 700;
  width: 40px;
  padding: 4px;
  border-left: 2px solid #495057 !important;
}

.module-grade-cell {
  font-weight: 700;
  min-width: 40px;
  padding: 6px 4px;
  border-left: 2px solid #495057 !important;
  background-color: rgba(0, 0, 0, 0.02);
}

.module-grade-cell.editable {
  cursor: pointer;
  transition: all 0.2s;
}

.module-grade-cell.editable:hover {
  background-color: rgba(40, 167, 69, 0.1);
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.3);
  z-index: 20;
}

/* Колонки финальных оценок */
.final-grade-col {
  background-color: #fff3cd;
  font-weight: 700;
  min-width: 80px;
  border-left: 2px solid #ffc107;
}

.final-grade-cell {
  background-color: #fffbf0;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 2px solid #ffc107;
}

.final-grade-cell.editable:hover {
  background-color: #fff8e1;
  box-shadow: 0 0 5px rgba(255, 193, 7, 0.3);
}

/* Колонка среднего балла */
.average-col {
  background-color: #e9ecef;
  font-weight: 700;
  min-width: 100px;
}

.average-cell {
  background-color: #f8f9fa;
  font-weight: 700;
  font-size: 14px;
  color: #495057;
}

.grade-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

.grade-5 {
  background-color: #28a745;
  color: white;
}

.grade-4 {
  background-color: #17a2b8;
  color: white;
}

.grade-3 {
  background-color: #ffc107;
  color: #333;
}

.grade-2 {
  background-color: #dc3545;
  color: white;
}

.grade-none {
  background-color: #6c757d;
  color: white;
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.grade-details, .grade-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detail-row.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.detail-row .label {
  font-weight: 600;
  color: #666;
}

.detail-row .value {
  color: #333;
}

.detail-row .comment {
  margin: 0;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  width: 100%;
  white-space: pre-wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.save-btn, .delete-btn, .cancel-btn, .close-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.save-btn {
  background-color: #28a745;
  color: white;
  flex: 1;
}

.save-btn:hover:not(:disabled) {
  background-color: #218838;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.close-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  width: 100%;
}

.close-btn:hover {
  background-color: #5a6268;
}

@media print {
  .filters, .export-btn, .modal-overlay {
    display: none !important;
  }

  .grade-cell, .module-grade-cell {
    cursor: default;
  }

  .grade-cell:hover, .module-grade-cell:hover {
    transform: none;
  }
}
</style>
