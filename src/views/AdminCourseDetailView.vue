<template>
  <div class="admin-course-detail-view">
    <div v-if="loading" class="loading">{{ $t('courseDetail.loading') }}</div>

    <div v-else-if="course" class="course-content">
      <!-- Header -->
      <div class="course-header">
        <div class="breadcrumb">
          <RouterLink to="/admin/courses">← {{ $t('courseDetail.backToCourses') }}</RouterLink>
        </div>
        <h1>{{ course.title }}</h1>
        <div class="course-meta">
          <div class="meta-item">
            <span class="meta-label">{{ $t('courseDetail.subject') }}:</span>
            <span class="meta-value">{{ course.subject.name }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ $t('courseDetail.teacher') }}:</span>
            <span class="meta-value">{{ course.teacher.name }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ $t('courseDetail.level') }}:</span>
            <span class="meta-value">{{ course.level.number }} {{ $t('courseDetail.class') }}</span>
          </div>
          <div class="meta-item" v-if="course.groups.length > 0">
            <span class="meta-label">{{ $t('courseDetail.groups') }}:</span>
            <span class="meta-value">{{ course.groups.map(g => g.display_name).join(', ') }}</span>
          </div>
        </div>
      </div>

      <!-- Course Description -->
      <div v-if="course.description" class="course-description">
        <h3>{{ $t('courseDetail.description') }}</h3>
        <p>{{ course.description }}</p>
      </div>

      <!-- Modules -->
      <div class="modules-section">
        <h2>{{ $t('courseDetail.courseContent', { count: course.modules.length }) }}</h2>

        <div v-if="course.modules.length === 0" class="no-content">
          {{ $t('courseDetail.noModules') }}
        </div>

        <div v-for="module in course.modules" :key="module.id" class="module-card">
          <div class="module-header" @click="toggleModule(module.id)">
            <div class="module-title">
              <span class="module-number">{{ $t('courseDetail.module') }} {{ module.number }}</span>
              <span class="module-name">{{ module.title }}</span>
            </div>
            <div class="module-stats">
              <span class="stat">{{ $t('courseDetail.chaptersCount', { count: module.chapters.length }) }}</span>
              <span class="toggle-icon">{{ expandedModules.has(module.id) ? '▼' : '►' }}</span>
            </div>
          </div>

          <div v-show="expandedModules.has(module.id)" class="module-content">
            <!-- Chapters -->
            <div v-for="chapter in module.chapters" :key="chapter.id" class="chapter-card">
              <div class="chapter-header" @click="toggleChapter(chapter.id)">
                <div class="chapter-title">
                  <span class="chapter-number">{{ $t('courseDetail.chapter') }} {{ module.number }}.{{ chapter.number }}</span>
                  <span class="chapter-name">{{ chapter.title }}</span>
                </div>
                <div class="chapter-stats">
                  <span class="stat">{{ $t('courseDetail.paragraphsCount', { count: chapter.paragraphs.length }) }}</span>
                  <span class="toggle-icon">{{ expandedChapters.has(chapter.id) ? '▼' : '►' }}</span>
                </div>
              </div>

              <div v-show="expandedChapters.has(chapter.id)" class="chapter-content">
                <!-- Paragraphs -->
                <div v-for="paragraph in chapter.paragraphs" :key="paragraph.id" class="paragraph-card">
                  <div class="paragraph-header" @click="toggleParagraph(paragraph.id)">
                    <div class="paragraph-title">
                      <span class="paragraph-number">§{{ module.number }}.{{ chapter.number }}.{{ paragraph.number }}</span>
                      <span class="paragraph-name">{{ paragraph.title }}</span>
                    </div>
                    <div class="paragraph-badges">
                      <span v-if="paragraph.has_assignment" class="badge badge-assignment">{{ $t('courseDetail.assignment') }}</span>
                      <span v-if="paragraph.has_quiz" class="badge badge-quiz">{{ $t('courseDetail.quiz') }}</span>
                      <span v-if="paragraph.resources_count > 0" class="badge badge-resources">{{ $t('courseDetail.resourcesCount', { count: paragraph.resources_count }) }}</span>
                      <span class="toggle-icon">{{ expandedParagraphs.has(paragraph.id) ? '▼' : '►' }}</span>
                    </div>
                  </div>

                  <div v-show="expandedParagraphs.has(paragraph.id)" class="paragraph-content">
                    <!-- Description -->
                    <div v-if="paragraph.description" class="content-section">
                      <h5>{{ $t('courseDetail.description') }}:</h5>
                      <p class="content-text">{{ paragraph.description }}</p>
                    </div>

                    <!-- Resources -->
                    <div v-if="paragraph.resources && paragraph.resources.length > 0" class="resources-section">
                      <div class="collapsible-header" @click="toggleResources(paragraph.id)">
                        <h5>📎 {{ $t('courseDetail.resources', { count: paragraph.resources.length }) }}</h5>
                        <span class="toggle-icon">{{ expandedResources.has(paragraph.id) ? '▼' : '►' }}</span>
                      </div>
                      <div v-show="expandedResources.has(paragraph.id)" class="resources-list">
                        <div v-for="resource in paragraph.resources" :key="resource.id" class="resource-item">
                          <span class="resource-icon">{{ getResourceIcon(resource.type) }}</span>
                          <div class="resource-info">
                            <div class="resource-title">{{ resource.title }}</div>
                            <div class="resource-meta">
                              <span class="resource-type">{{ getResourceTypeLabel(resource.type) }}</span>
                              <a v-if="resource.url" :href="resource.url" target="_blank" class="resource-link">{{ $t('courseDetail.openLink') }}</a>
                              <span v-if="resource.path" class="resource-path">{{ resource.path }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Assignment -->
                    <div v-if="paragraph.assignment" class="assignment-section">
                      <div class="collapsible-header" @click="toggleAssignment(paragraph.assignment.id)">
                        <h5>📝 {{ $t('courseDetail.assignment') }}: {{ paragraph.assignment.title }}</h5>
                        <span class="toggle-icon">{{ expandedAssignments.has(paragraph.assignment.id) ? '▼' : '►' }}</span>
                      </div>
                      <div v-show="expandedAssignments.has(paragraph.assignment.id)" class="assignment-details">
                        <div v-if="paragraph.assignment.instructions" class="assignment-instructions">
                          <strong>{{ $t('courseDetail.instructions') }}:</strong>
                          <p>{{ paragraph.assignment.instructions }}</p>
                        </div>

                        <!-- Assignment Attachments -->
                        <div v-if="paragraph.assignment.has_attachments" class="assignment-attachments">
                          <strong>📎 {{ $t('courseDetail.attachedFiles') }}:</strong>
                          <div class="attachment-item">
                            <span class="attachment-icon">📄</span>
                            <span class="attachment-path">{{ paragraph.assignment.attachments_path }}</span>
                          </div>
                        </div>

                        <div class="assignment-meta">
                          <span v-if="paragraph.assignment.max_points" class="meta-badge">
                            {{ $t('courseDetail.points') }}: {{ paragraph.assignment.max_points }}
                          </span>
                          <span v-if="paragraph.assignment.due_at" class="meta-badge">
                            {{ $t('courseDetail.deadline') }}: {{ paragraph.assignment.due_at }}
                          </span>
                          <span class="meta-badge" :class="'status-' + paragraph.assignment.status">
                            {{ getStatusLabel(paragraph.assignment.status) }}
                          </span>
                          <span class="meta-badge">
                            {{ $t('courseDetail.submissionsCount', { count: paragraph.assignment.submissions_count }) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Quiz -->
                    <div v-if="paragraph.quiz" class="quiz-section">
                      <div class="collapsible-header" @click="toggleQuiz(paragraph.quiz.id)">
                        <h5>🧪 {{ $t('courseDetail.quiz') }}: {{ paragraph.quiz.title }}</h5>
                        <span class="toggle-icon">{{ expandedQuizzes.has(paragraph.quiz.id) ? '▼' : '►' }}</span>
                      </div>
                      <div v-show="expandedQuizzes.has(paragraph.quiz.id)" class="quiz-details">
                        <div v-if="paragraph.quiz.instructions" class="quiz-instructions">
                          <strong>{{ $t('courseDetail.instructions') }}:</strong>
                          <p>{{ paragraph.quiz.instructions }}</p>
                        </div>
                        <div class="quiz-meta">
                          <span class="meta-badge">
                            {{ $t('courseDetail.questionsCount', { count: paragraph.quiz.questions_count }) }}
                          </span>
                          <span v-if="paragraph.quiz.max_points" class="meta-badge">
                            {{ $t('courseDetail.points') }}: {{ paragraph.quiz.max_points }}
                          </span>
                          <span v-if="paragraph.quiz.time_limit_sec" class="meta-badge">
                            {{ $t('courseDetail.time') }}: {{ Math.floor(paragraph.quiz.time_limit_sec / 60) }} {{ $t('courseDetail.minutes') }}
                          </span>
                          <span v-if="paragraph.quiz.max_attempts" class="meta-badge">
                            {{ $t('courseDetail.attempts') }}: {{ paragraph.quiz.max_attempts }}
                          </span>
                          <span class="meta-badge" :class="'status-' + paragraph.quiz.status">
                            {{ getStatusLabel(paragraph.quiz.status) }}
                          </span>
                          <span v-if="paragraph.quiz.shuffle" class="meta-badge">
                            {{ $t('courseDetail.shuffle') }}: {{ $t('courseDetail.yes') }}
                          </span>
                        </div>

                        <!-- Quiz Questions -->
                        <div v-if="paragraph.quiz.questions && paragraph.quiz.questions.length > 0" class="quiz-questions">
                          <h6>{{ $t('courseDetail.quizQuestions') }}:</h6>
                          <div v-for="(question, qIdx) in paragraph.quiz.questions" :key="question.id" class="question-item">
                            <div class="question-header">
                              <span class="question-number">{{ $t('courseDetail.question') }} {{ qIdx + 1 }}</span>
                              <span class="question-type-badge">{{ getQuestionTypeLabel(question.type) }}</span>
                              <span class="question-points">{{ question.points }} {{ $t('courseDetail.points').toLowerCase() }}</span>
                            </div>
                            <div class="question-text">{{ question.text }}</div>

                            <!-- Options for multiple choice -->
                            <div v-if="question.options && question.options.length > 0" class="question-options">
                              <div v-for="option in question.options" :key="option.id" class="option-item">
                                <span class="option-check" :class="{ 'correct': option.is_correct, 'incorrect': !option.is_correct }">
                                  {{ option.is_correct ? '✓' : '✗' }}
                                </span>
                                <span class="option-text">{{ option.text }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()
const route = useRoute()

interface Course {
  id: number
  title: string
  description: string
  subject: { id: number; name: string }
  teacher: { id: number; name: string }
  level: { id: number; number: number; title: string }
  groups: Array<{ id: number; display_name: string }>
  modules: Array<{
    id: number
    title: string
    number: number
    order: number
    chapters: Array<{
      id: number
      title: string
      number: number
      order: number
      paragraphs: Array<{
        id: number
        title: string
        number: number
        order: number
        description: string
        has_assignment: boolean
        has_quiz: boolean
        assignment: {
          id: number
          title: string
          instructions: string
          due_at: string
          max_points: number
          status: string
          submissions_count: number
          attachments_path: string
          has_attachments: boolean
        } | null
        quiz: {
          id: number
          title: string
          instructions: string
          time_limit_sec: number
          max_attempts: number
          max_points: number
          shuffle: boolean
          status: string
          questions_count: number
          questions: Array<{
            id: number
            type: string
            text: string
            points: number
            position: number
            options: Array<{
              id: number
              text: string
              is_correct: boolean
              position: number
            }>
          }>
        } | null
        resources_count: number
        resources: Array<{
          id: number
          title: string
          type: string
          url: string
          path: string
          position: number
        }>
      }>
    }>
  }>
  created_at: string
  updated_at: string
}

const course = ref<Course | null>(null)
const loading = ref(false)
const expandedModules = ref(new Set<number>())
const expandedChapters = ref(new Set<number>())
const expandedParagraphs = ref(new Set<number>())
const expandedAssignments = ref(new Set<number>())
const expandedQuizzes = ref(new Set<number>())
const expandedResources = ref(new Set<number>())

onMounted(() => {
  loadCourse()
})

async function loadCourse() {
  loading.value = true
  try {
    const response = await api.get(`/admin/courses/${route.params.id}`)
    course.value = response.data

    // Expand first module by default
    if (course.value && course.value.modules.length > 0) {
      expandedModules.value.add(course.value.modules[0].id)
    }
  } catch (error) {
    console.error('Ошибка загрузки курса:', error)
  } finally {
    loading.value = false
  }
}

function toggleModule(id: number) {
  if (expandedModules.value.has(id)) {
    expandedModules.value.delete(id)
  } else {
    expandedModules.value.add(id)
  }
}

function toggleChapter(id: number) {
  if (expandedChapters.value.has(id)) {
    expandedChapters.value.delete(id)
  } else {
    expandedChapters.value.add(id)
  }
}

function toggleParagraph(id: number) {
  if (expandedParagraphs.value.has(id)) {
    expandedParagraphs.value.delete(id)
  } else {
    expandedParagraphs.value.add(id)
  }
}

function toggleAssignment(id: number) {
  if (expandedAssignments.value.has(id)) {
    expandedAssignments.value.delete(id)
  } else {
    expandedAssignments.value.add(id)
  }
}

function toggleQuiz(id: number) {
  if (expandedQuizzes.value.has(id)) {
    expandedQuizzes.value.delete(id)
  } else {
    expandedQuizzes.value.add(id)
  }
}

function toggleResources(id: number) {
  if (expandedResources.value.has(id)) {
    expandedResources.value.delete(id)
  } else {
    expandedResources.value.add(id)
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'draft': t('courseDetail.statusDraft'),
    'published': t('courseDetail.statusPublished'),
    'archived': t('courseDetail.statusArchived')
  }
  return labels[status] || status
}

function getResourceIcon(type: string): string {
  const icons: Record<string, string> = {
    'video': '🎥',
    'document': '📄',
    'link': '🔗',
    'image': '🖼️',
    'audio': '🎵',
    'pdf': '📕',
    'presentation': '📊',
    'text': '📝'
  }
  return icons[type] || '📎'
}

function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'video': t('courseDetail.resourceVideo'),
    'document': t('courseDetail.resourceDocument'),
    'link': t('courseDetail.resourceLink'),
    'image': t('courseDetail.resourceImage'),
    'audio': t('courseDetail.resourceAudio'),
    'pdf': t('courseDetail.resourcePdf'),
    'presentation': t('courseDetail.resourcePresentation'),
    'text': t('courseDetail.resourceText')
  }
  return labels[type] || type
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'multiple_choice': t('courseDetail.questionMultipleChoice'),
    'true_false': t('courseDetail.questionTrueFalse'),
    'short_answer': t('courseDetail.questionShortAnswer'),
    'essay': t('courseDetail.questionEssay'),
    'matching': t('courseDetail.questionMatching'),
    'fill_blank': t('courseDetail.questionFillBlank')
  }
  return labels[type] || type
}
</script>

<style scoped>
.admin-course-detail-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.breadcrumb {
  margin-bottom: 15px;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.course-header {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.course-header h1 {
  margin: 0 0 20px 0;
  color: #212121;
}

.course-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.meta-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.meta-value {
  font-size: 15px;
  color: #212121;
}

.course-description {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.course-description h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #212121;
}

.modules-section h2 {
  color: #212121;
  margin-bottom: 20px;
}

.no-content {
  text-align: center;
  padding: 40px;
  color: #999;
  background: white;
  border-radius: 8px;
}

/* Module Card */
.module-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  overflow: hidden;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: opacity 0.2s;
}

.module-header:hover {
  opacity: 0.9;
}

.module-title {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.module-number {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 600;
}

.module-name {
  font-size: 18px;
  font-weight: 600;
}

.module-stats {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat {
  font-size: 13px;
  opacity: 0.9;
}

.toggle-icon {
  font-size: 14px;
}

.module-content {
  padding: 15px;
  background: #f8f9fa;
}

/* Chapter Card */
.chapter-card {
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  background: #f8f9fa;
  transition: background 0.2s;
}

.chapter-header:hover {
  background: #e9ecef;
}

.chapter-title {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chapter-number {
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.chapter-name {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
}

.chapter-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 13px;
}

.chapter-content {
  padding: 10px;
}

/* Paragraph Card */
.paragraph-card {
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid #dee2e6;
}

.paragraph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.paragraph-header:hover {
  background: #f8f9fa;
}

.paragraph-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.paragraph-number {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.paragraph-name {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
}

.paragraph-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.badge-assignment {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-quiz {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-resources {
  background: #e8f5e9;
  color: #388e3c;
}

.paragraph-content {
  padding: 15px;
  background: #fafafa;
  border-top: 1px solid #dee2e6;
}

.content-section {
  margin-bottom: 15px;
}

.content-section h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #212121;
  font-size: 14px;
}

.content-text {
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  line-height: 1.6;
}

.assignment-section,
.quiz-section {
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  margin-bottom: 10px;
}

.assignment-details,
.quiz-details {
  padding: 10px;
  margin-top: 10px;
}

.assignment-instructions,
.quiz-instructions {
  margin-bottom: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.assignment-instructions p,
.quiz-instructions p {
  margin: 5px 0 0 0;
  color: #424242;
  line-height: 1.5;
}

.assignment-attachments {
  margin-bottom: 12px;
  padding: 10px;
  background: #e8f5e9;
  border-radius: 4px;
  border: 1px solid #c8e6c9;
}

.assignment-attachments strong {
  display: block;
  margin-bottom: 8px;
  color: #2e7d32;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.attachment-icon {
  font-size: 20px;
}

.attachment-path {
  font-family: monospace;
  font-size: 13px;
  color: #424242;
}

.assignment-meta,
.quiz-meta {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  font-size: 12px;
  flex-wrap: wrap;
}

.meta-badge {
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 12px;
  color: #424242;
  font-weight: 500;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-draft {
  background: #f5f5f5;
  color: #666;
}

.status-published {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-archived {
  background: #ffebee;
  color: #c62828;
}

/* Collapsible Headers */
.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 10px;
  transition: background 0.2s;
}

.collapsible-header:hover {
  background: #e9ecef;
}

.collapsible-header h5 {
  margin: 0;
  color: #212121;
  font-size: 14px;
  font-weight: 600;
}

.collapsible-header .toggle-icon {
  font-size: 12px;
  color: #666;
}

/* Resources */
.resources-section {
  margin-bottom: 15px;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.resource-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: background 0.2s;
}

.resource-item:hover {
  background: #f8f9fa;
}

.resource-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-weight: 500;
  color: #212121;
  margin-bottom: 4px;
}

.resource-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
}

.resource-type {
  padding: 2px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 10px;
  font-weight: 500;
}

.resource-link {
  color: #2196f3;
  text-decoration: none;
}

.resource-link:hover {
  text-decoration: underline;
}

.resource-path {
  color: #999;
  font-family: monospace;
  font-size: 11px;
}

/* Quiz Questions */
.quiz-questions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.quiz-questions h6 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #212121;
  font-size: 14px;
  font-weight: 600;
}

.question-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
}

.question-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.question-number {
  font-weight: 600;
  color: #212121;
  font-size: 13px;
}

.question-type-badge {
  padding: 2px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.question-points {
  padding: 2px 8px;
  background: #fff3e0;
  color: #e65100;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.question-text {
  margin-bottom: 10px;
  color: #212121;
  line-height: 1.5;
  font-size: 14px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.option-check {
  font-weight: 700;
  font-size: 18px;
  min-width: 24px;
  text-align: center;
}

.option-check.correct {
  color: #2e7d32;
}

.option-check.incorrect {
  color: #c62828;
}

.option-text {
  flex: 1;
  color: #212121;
  line-height: 1.4;
}

.correct-answer {
  margin-top: 10px;
  padding: 8px 10px;
  background: #e8f5e9;
  border-radius: 4px;
  border: 1px solid #66bb6a;
  color: #212121;
  font-size: 13px;
}

.correct-answer strong {
  color: #2e7d32;
}
</style>
