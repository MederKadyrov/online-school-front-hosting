<template>
  <div class="student-paragraph-view">
    <!-- Заголовок параграфа -->
    <div class="paragraph-header">
      <h1>{{ paragraph?.title || $t('studentParagraph.paragraph') }}</h1>
      <p v-if="paragraph?.chapter" class="paragraph-path">
        {{ paragraph.chapter?.module?.course?.title }} <ArrowRight :size="14" />
        {{ $t('studentParagraph.module') }} {{ paragraph.chapter?.module?.number }} <ArrowRight :size="14" />
        {{ $t('studentParagraph.chapter') }} {{ paragraph.chapter?.number }}
      </p>
    </div>

    <!-- Сетка контента -->
    <div class="content-grid">

      <!-- Ресурсы -->
      <section class="content-section resources-section">
        <div class="section-header">
          <h2>{{ $t('studentParagraph.learningMaterials') }}</h2>
        </div>

        <div class="section-body">
          <p v-if="resErr" class="error-message">{{ resErr }}</p>

          <div v-if="res.length" class="resources-list">
            <div v-for="r in res" :key="r.id" class="resource-card">
              <div class="resource-header">
                <span class="resource-type-badge" :class="`badge-${r.type}`">
                  {{ getResourceTypeLabel(r.type) }}
                </span>
                <h3 class="resource-title">{{ r.title || $t('studentParagraph.untitled') }}</h3>
              </div>

              <div class="resource-content">
                <template v-if="r.type === 'file' && r.path">
                  <a :href="storageUrl(r.path)" target="_blank" class="resource-link">
                    {{ $t('studentParagraph.downloadFile') }}
                  </a>
                  <span v-if="r.mime" class="resource-meta">{{ r.mime }}</span>
                </template>

                <template v-else-if="r.type !== 'text' && r.url">
                  <a :href="r.url" target="_blank" class="resource-link">
                    {{ $t('studentParagraph.openLink') }}
                  </a>
                </template>

                <template v-else-if="r.type === 'text'">
                  <div class="resource-text" v-html="r.text_content"></div>
                </template>

                <span v-if="r.duration_sec" class="resource-duration">
                  <Timer :size="14" /> {{ formatDuration(r.duration_sec) }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <Inbox class="empty-icon" :size="40" />
            <p>{{ $t('studentParagraph.noMaterials') }}</p>
          </div>
        </div>
      </section>

      <!-- Тест -->
      <section class="content-section quiz-section">
        <div class="section-header">
          <h2>{{ $t('studentParagraph.testing') }}</h2>
        </div>

        <div class="section-body">
          <p v-if="quizErr" class="error-message">{{ quizErr }}</p>

          <div v-if="quiz && quiz.id" class="quiz-card">
            <h3 class="quiz-title">{{ quiz.title }}</h3>

            <div v-if="quiz.instructions" class="quiz-instructions" v-html="quiz.instructions"></div>

            <div class="quiz-info">
              <div class="info-item">
                <Timer class="info-icon" :size="16" />
                <span class="info-label">{{ $t('studentParagraph.time') }}</span>
                <span class="info-value">{{ quiz.time_limit_sec ? formatDuration(quiz.time_limit_sec) : $t('studentParagraph.unlimited') }}</span>
              </div>
              <div class="info-item">
                <RefreshCw class="info-icon" :size="16" />
                <span class="info-label">{{ $t('studentParagraph.attempts') }}</span>
                <span class="info-value">{{ quiz.max_attempts || $t('studentParagraph.unlimited') }}</span>
              </div>
            </div>

            <div v-if="isQuizExpired" class="expired-notice">
              <AlarmClock class="expired-icon" :size="16" />
              <p>{{ $t('studentParagraph.quizExpired') }}</p>
            </div>

            <RouterLink
              v-else
              class="btn btn-primary btn-large"
              :class="{ 'btn-disabled': isQuizExpired }"
              :to="isQuizExpired ? '#' : `/student/paragraphs/${route.params.paragraphId}/quiz`"
              @click.prevent="isQuizExpired ? null : $router.push(`/student/paragraphs/${route.params.paragraphId}/quiz`)"
            >
              {{ $t('studentParagraph.startTest') }}
            </RouterLink>
          </div>

          <div v-else class="empty-state">
            <NotebookPen class="empty-icon" :size="40" />
            <p>{{ $t('studentParagraph.noQuiz') }}</p>
          </div>
        </div>
      </section>

      <!-- Задание -->
      <section class="content-section assignment-section">
        <div class="section-header">
          <h2>{{ $t('studentParagraph.practicalAssignment') }}</h2>
        </div>

        <div class="section-body">
          <div v-if="asg" class="assignment-card">
            <h3 class="assignment-title">{{ asg.title }}</h3>

            <div class="assignment-instructions" v-html="asg.instructions"></div>

            <!-- Файл-условие задания -->
            <div v-if="asg.attachments_path" class="attachment-info">
              <Paperclip class="attachment-icon" :size="16" />
              <a :href="storageUrl(asg.attachments_path)" target="_blank" rel="noopener" class="attachment-link">
                {{ asg.attachments_path.split('/').pop() }}
              </a>
            </div>

            <div class="assignment-meta">
              <div class="meta-item" :class="{ 'meta-expired': isAssignmentExpired }">
                <Calendar class="meta-icon" :size="14" />
                <span class="meta-label">{{ $t('studentParagraph.deadline') }}</span>
                <span class="meta-value">{{ formatDate(asg.due_at) || $t('studentParagraph.notSpecified') }}</span>
                <span v-if="isAssignmentExpired" class="expired-badge">{{ $t('studentParagraph.expired') }}</span>
              </div>
            </div>

            <!-- Статус отправки -->
            <div v-if="my" class="submission-status">
              <div class="status-header">
                <span class="status-badge" :class="`status-${my.status}`">
                  {{ getStatusLabel(my.status) }}
                </span>
                <span v-if="my.grade_5" class="grade-badge" :class="`grade-${my.grade_5}`">
                  {{ $t('studentParagraph.grade') }}: {{ my.grade_5 }}
                </span>
              </div>

              <div v-if="my.teacher_comment" class="teacher-comment">
                <strong>{{ $t('studentParagraph.teacherComment') }}</strong>
                <p>{{ my.teacher_comment }}</p>
              </div>
            </div>

            <!-- Уведомление об истекшем дедлайне -->
            <div v-if="isAssignmentExpired && !my" class="expired-notice-large">
              <AlarmClock class="expired-icon-large" :size="32" />
              <h4>{{ $t('studentParagraph.assignmentExpiredTitle') }}</h4>
              <p>{{ $t('studentParagraph.assignmentExpiredMessage') }}</p>
            </div>

            <!-- Форма отправки -->
            <div v-else class="submission-form" :class="{ 'disabled': isFormDisabled }">
              <h4>{{ $t('studentParagraph.submitSolution') }}</h4>

              <div class="form-group">
                <label for="text-answer">{{ $t('studentParagraph.textAnswer') }}</label>
                <textarea
                  id="text-answer"
                  v-model="answer.text"
                  class="form-textarea"
                  rows="6"
                  :placeholder="$t('studentParagraph.enterAnswer')"
                  :disabled="isFormDisabled"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="file-input">{{ $t('studentParagraph.attachFile') }}</label>
                <div class="file-input-wrapper">
                  <input
                    id="file-input"
                    type="file"
                    @change="pickFile"
                    :disabled="isFormDisabled"
                    class="file-input"
                  />
                  <label for="file-input" class="file-input-label">
                    <Paperclip class="file-icon" :size="16" />
                    <span>{{ answer.file ? answer.file.name : $t('studentParagraph.selectFile') }}</span>
                  </label>
                </div>
              </div>

              <button
                class="btn btn-success btn-large"
                @click="submit"
                :disabled="submitting || isFormDisabled"
              >
                {{ submitting ? $t('studentParagraph.submitting') : $t('studentParagraph.submitAssignment') }}
              </button>

              <p v-if="isFormDisabled && !isAssignmentExpired" class="form-note">
                {{ $t('studentParagraph.alreadySubmitted') }}
              </p>
            </div>
          </div>

          <div v-else class="empty-state">
            <FileText class="empty-icon" :size="40" />
            <p>{{ $t('studentParagraph.noAssignments') }}</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Timer, RefreshCw, AlarmClock, Inbox, FileText, Paperclip, Calendar, NotebookPen, ArrowRight } from 'lucide-vue-next'
import api from '../utils/api'
import { useBreadcrumb } from '../composables/useBreadcrumb'

const route = useRoute()
const { t } = useI18n()
const { setBreadcrumb } = useBreadcrumb()

const paragraph = ref<any | null>(null)
const asg = ref<any | null>(null)
const my = ref<any | null>(null)
const answer = ref<{ text: string, file: any | null }>({ text: '', file: null })
const submitting = ref(false)

// ресурсы
const res = ref<any[]>([])
const resErr = ref('')

// тест
const quiz = ref<any | null>(null)
const quizErr = ref('')

// Проверка, истек ли срок сдачи задания
const isAssignmentExpired = computed(() => {
  if (!asg.value?.due_at) return false
  const deadline = new Date(asg.value.due_at)
  const now = new Date()
  return now > deadline
})

// Проверка, истек ли срок сдачи теста (если будет добавлено поле deadline)
const isQuizExpired = computed(() => {
  if (!quiz.value?.due_at && !quiz.value?.deadline) return false
  const deadline = new Date(quiz.value.due_at || quiz.value.deadline)
  const now = new Date()
  return now > deadline
})

// Computed свойство для проверки, должна ли форма быть заблокирована
const isFormDisabled = computed(() => {
  if (!my.value) {
    // Если задание еще не начато, проверяем дедлайн
    return isAssignmentExpired.value
  }
  return my.value.status === 'submitted' || my.value.status === 'returned'
})

function storageUrl(path: string) {
  return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${path.replace(/^public\//, '')}`
}

function pickFile(e: any) {
  answer.value.file = e.target.files?.[0] || null
}

function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'file': t('studentParagraph.resourceFile'),
    'video': t('studentParagraph.resourceVideo'),
    'link': t('studentParagraph.resourceLink'),
    'text': t('studentParagraph.resourceText'),
    'audio': t('studentParagraph.resourceAudio')
  }
  return labels[type] || type
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'draft': t('studentParagraph.statusDraft'),
    'submitted': t('studentParagraph.statusSubmitted'),
    'returned': t('studentParagraph.statusReturned')
  }
  return labels[status] || status
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} ${t('studentParagraph.seconds')}`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes} ${t('studentParagraph.minutes')} ${remainingSeconds} ${t('studentParagraph.seconds')}` : `${minutes} ${t('studentParagraph.minutes')}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function load() {
  try {
    const paragraphInfo = await api.get(`/student/paragraphs/${route.params.paragraphId}`)
    paragraph.value = paragraphInfo.data

    if (paragraph.value) {
      const courseId = paragraph.value.chapter?.module?.course?.id
      const courseTitle = paragraph.value.chapter?.module?.course?.title || 'Курс'
      const paragraphTitle = paragraph.value.title || 'Параграф'

      if (courseId) {
        setBreadcrumb(`/student/courses/${courseId}`, {
          label: courseTitle,
          icon: 'journal',
          path: `/student/courses/${courseId}`
        })
      }

      setBreadcrumb(route.path, {
        label: paragraphTitle,
        icon: 'paragraph',
        path: route.path
      })
    }
  } catch (e: any) {
    console.error(t('studentParagraph.errorLoadingParagraph'), e)
  }

  // задания
  try {
    const { data } = await api.get(`/student/paragraphs/${route.params.paragraphId}/assignments`)
    asg.value = data[0] || null
    if (asg.value) {
      const m = await api.get(`/student/assignments/${asg.value.id}/my`)
      my.value = m.data
    }
  } catch (e: any) {
    console.error(t('studentParagraph.errorLoadingAssignment'), e)
  }

  // ресурсы
  try {
    const r = await api.get(`/student/paragraphs/${route.params.paragraphId}/resources`)
    res.value = r.data || []
  } catch (e: any) {
    resErr.value = e?.data?.message || e?.message || t('studentParagraph.errorLoadingResources')
  }

  // тест
  try {
    const q = await api.get(`/student/paragraphs/${route.params.paragraphId}/quiz`)
    quiz.value = q.data || null
  } catch (e: any) {
    quizErr.value = e?.data?.message || e?.message || t('studentParagraph.errorLoadingQuiz')
  }

  // Update progress
  try {
    await api.post(`/student/paragraphs/${route.params.paragraphId}/progress`)
  } catch (e: any) {
    console.error('Failed to update progress:', e)
  }
}

async function submit() {
  if (!asg.value || submitting.value) return

  submitting.value = true
  try {
    const fd = new FormData()
    if (answer.value.file) fd.append('file', answer.value.file)
    if (answer.value.text) fd.append('text_answer', answer.value.text)

    const { data } = await api.post(`/student/assignments/${asg.value.id}/submit`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    my.value = data
    answer.value = { text: '', file: null }

    // Update progress after submitting assignment
    try {
      await api.post(`/student/paragraphs/${route.params.paragraphId}/progress`)
    } catch (e: any) {
      console.error('Failed to update progress:', e)
    }
  } catch (e: any) {
    alert(t('studentParagraph.submissionError') + ': ' + (e?.data?.message || e?.message))
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.student-paragraph-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Заголовок параграфа */
.paragraph-header {
  margin-bottom: 30px;
}

.paragraph-header h1 {
  font-size: 28px;
  color: #213547;
  margin: 0 0 8px 0;
}

.paragraph-path {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* Сетка контента */
.content-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

/* Секции */
.content-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.section-body {
  padding: 24px;
}

/* Ресурсы */
.resources-list {
  display: grid;
  gap: 16px;
}

.resource-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.resource-type-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-file { background: #dbeafe; color: #1e40af; }
.badge-video { background: #fce7f3; color: #be123c; }
.badge-link { background: #d1fae5; color: #065f46; }
.badge-text { background: #fef3c7; color: #92400e; }
.badge-audio { background: #e0e7ff; color: #3730a3; }

.resource-title {
  font-size: 16px;
  font-weight: 600;
  color: #213547;
  margin: 0;
  flex: 1;
}

.resource-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.resource-link:hover {
  text-decoration: underline;
}

.resource-text {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  line-height: 1.6;
  color: #374151;
}

.resource-meta,
.resource-duration {
  font-size: 13px;
  color: #6b7280;
}

/* Тест */
.quiz-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quiz-title {
  font-size: 20px;
  font-weight: 600;
  color: #213547;
  margin: 0;
}

.quiz-instructions {
  color: #4b5563;
  line-height: 1.6;
}

.quiz-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.info-icon {
  font-size: 20px;
}

.info-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #213547;
  font-weight: 500;
}

/* Задание */
.assignment-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.assignment-title {
  font-size: 20px;
  font-weight: 600;
  color: #213547;
  margin: 0;
}

.assignment-instructions {
  color: #4b5563;
  line-height: 1.6;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
}

.attachment-icon {
  font-size: 20px;
}

.attachment-link {
  color: #92400e;
  text-decoration: none;
  font-weight: 500;
}

.attachment-link:hover {
  text-decoration: underline;
}

.assignment-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 6px;
}

.meta-icon {
  font-size: 18px;
}

.meta-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.meta-value {
  color: #213547;
  font-weight: 500;
}

/* Статус отправки */
.submission-status {
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.status-draft { background: #e5e7eb; color: #374151; }
.status-submitted { background: #fef3c7; color: #92400e; }
.status-returned { background: #d1fae5; color: #065f46; }

.grade-badge {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.grade-5 { background: #22c55e; color: white; }
.grade-4 { background: #3b82f6; color: white; }
.grade-3 { background: #f59e0b; color: white; }
.grade-2 { background: #ef4444; color: white; }

.teacher-comment {
  margin-top: 8px;
}

.teacher-comment strong {
  display: block;
  margin-bottom: 8px;
  color: #065f46;
}

.teacher-comment p {
  margin: 0;
  color: #166534;
  line-height: 1.6;
}

/* Форма отправки */
.submission-form {
  padding: 20px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
}

.submission-form.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.submission-form h4 {
  margin: 0 0 16px 0;
  color: #213547;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-input-label:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.file-icon {
  font-size: 20px;
}

.form-note {
  margin-top: 12px;
  color: #6b7280;
  font-size: 13px;
  font-style: italic;
}

/* Кнопки */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-large {
  padding: 14px 28px;
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  color: #6b7280;
  font-size: 15px;
  margin: 0;
}

/* Сообщения об ошибках */
.error-message {
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}

/* Уведомление об истекшем дедлайне */
.expired-notice {
  padding: 16px 20px;
  background: #fee2e2;
  border: 2px solid #fca5a5;
  border-radius: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.expired-icon {
  font-size: 24px;
}

.expired-notice p {
  margin: 0;
  color: #991b1b;
  font-weight: 600;
  font-size: 15px;
}

.expired-notice-large {
  padding: 32px 24px;
  background: #fef2f2;
  border: 3px solid #fca5a5;
  border-radius: 16px;
  text-align: center;
}

.expired-icon-large {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.expired-notice-large h4 {
  color: #991b1b;
  font-size: 20px;
  margin: 0 0 12px 0;
}

.expired-notice-large p {
  color: #dc2626;
  font-size: 15px;
  margin: 0;
  line-height: 1.6;
}

.expired-badge {
  background: #dc2626;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-left: 8px;
}

.meta-item.meta-expired {
  background: #fee2e2;
  border: 2px solid #fca5a5;
}

.meta-item.meta-expired .meta-label,
.meta-item.meta-expired .meta-value {
  color: #991b1b;
}

.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed !important;
}

/* Адаптивность */
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }

  .resources-section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .student-paragraph-view {
    padding: 16px;
  }

  .paragraph-header h1 {
    font-size: 24px;
  }

  .section-header {
    padding: 16px;
  }

  .section-header h2 {
    font-size: 18px;
  }

  .section-body {
    padding: 16px;
  }

  .quiz-info,
  .assignment-meta {
    grid-template-columns: 1fr;
  }
}

@media print {
  .submission-form,
  .btn {
    display: none;
  }
}
</style>
