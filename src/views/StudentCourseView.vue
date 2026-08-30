<template>
  <div class="course-container">
    <div class="card" v-if="course">
      <div class="course-header">
        <h2>{{ course.title }}</h2>
        <p class="course-meta">
          <span v-if="course.subject">{{ course.subject.name }}</span>
          <span v-if="course.level"> • {{ course.level.number }} {{ $t('studentCourse.class') }}</span>
          <span v-if="course.teacher"> • {{ course.teacher.name }}</span>
        </p>

        <!-- Overall course progress -->
        <div class="overall-progress">
          <div class="progress-label">
            <span>{{ $t('studentCourse.overallProgress') }}</span>
            <span class="progress-percentage">{{ overallProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <section v-if="course.modules?.length" class="modules">
        <div v-for="m in course.modules" :key="m.id" class="module-card">
          <div class="module-header" @click="toggleModule(m.id)">
            <div class="module-title">
              <span class="module-number">{{ m.number }}.</span>
              <span>{{ m.title }}</span>
            </div>
            <div class="module-progress-section">
              <span class="module-progress-text">{{ getModuleProgress(m) }}%</span>
              <button class="toggle-btn" :class="{ open: isModuleOpen(m.id) }">
                <ChevronDown :size="16" />
              </button>
            </div>
          </div>

          <!-- Module progress bar -->
          <div class="module-progress-bar">
            <div class="progress-fill" :style="{ width: getModuleProgress(m) + '%' }"></div>
          </div>

          <div v-if="isModuleOpen(m.id)" class="module-content">
            <ul v-if="m.chapters?.length" class="chapters">
              <li v-for="ch in m.chapters" :key="ch.id" class="chapter-item">
                <div class="chapter-header">
                  <strong>{{ ch.number }}. {{ ch.title }}</strong>
                </div>
                <ul v-if="ch.paragraphs?.length" class="paragraphs">
                  <li v-for="p in ch.paragraphs" :key="p.id" class="paragraph-item">
                    <RouterLink
                      :to="`/student/paragraphs/${p.id}`"
                      class="paragraph-link"
                      :class="getParagraphStatusClass(p.id)"
                    >
                      <component :is="getParagraphStatusIcon(p.id)" class="paragraph-status-icon" :size="16" />
                      <span class="paragraph-text">
                        {{ ch.number }}.{{ p.number }} — {{ p.title }}
                        <span v-if="p.description" class="paragraph-desc"> — {{ p.description }}</span>
                      </span>
                      <AlarmClock v-if="hasDeadlineSoon(p.id)" class="deadline-badge" :size="14" />
                    </RouterLink>
                  </li>
                </ul>
                <p v-else class="no-content">{{ $t('studentCourse.noParagraphs') }}</p>
              </li>
            </ul>
            <p v-else class="no-content">{{ $t('studentCourse.noChapters') }}</p>
          </div>
        </div>
      </section>
    </div>
    <p v-else class="loading">{{ $t('studentCourse.loading') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CheckCircle2, CircleDot, AlarmClock, ChevronDown, type LucideIcon } from 'lucide-vue-next'
import api from '../utils/api'
import { useBreadcrumb } from '../composables/useBreadcrumb'

const route = useRoute()
const { t } = useI18n()
const course = ref<any|null>(null)
const progress = ref<any[]>([])
const openModules = ref<Set<number>>(new Set())
const error = ref('')
const { setBreadcrumb } = useBreadcrumb()

interface ParagraphProgress {
  paragraph_id: number
  status: 'not_started' | 'in_progress' | 'completed'
  last_visited_at: string | null
  completed_at: string | null
}

async function load() {
  try {
    const { data } = await api.get(`/student/courses/${route.params.id}`)
    course.value = data

    // Open all modules by default
    if (data.modules) {
      data.modules.forEach((m: any) => openModules.value.add(m.id))
    }

    // Обновляем breadcrumb с названием курса
    if (data && data.title) {
      setBreadcrumb(route.path, {
        label: data.title,
        icon: 'journal'
      })
    }

    // Load progress
    await loadProgress()
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('studentCourse.loadError')
  }
}

async function loadProgress() {
  try {
    const { data } = await api.get(`/student/courses/${route.params.id}/progress`)
    progress.value = data
  } catch (e) {
    console.error('Failed to load progress:', e)
  }
}

function toggleModule(moduleId: number) {
  if (openModules.value.has(moduleId)) {
    openModules.value.delete(moduleId)
  } else {
    openModules.value.add(moduleId)
  }
}

function isModuleOpen(moduleId: number): boolean {
  return openModules.value.has(moduleId)
}

function getParagraphProgress(paragraphId: number): ParagraphProgress | null {
  return progress.value.find((p: ParagraphProgress) => p.paragraph_id === paragraphId) || null
}

function getParagraphStatus(paragraphId: number): string {
  const p = getParagraphProgress(paragraphId)
  return p ? p.status : 'not_started'
}

function getParagraphStatusIcon(paragraphId: number): LucideIcon | null {
  const status = getParagraphStatus(paragraphId)
  if (status === 'completed') return CheckCircle2
  if (status === 'in_progress') return CircleDot
  return null
}

function getParagraphStatusClass(paragraphId: number): string {
  const status = getParagraphStatus(paragraphId)
  return `status-${status}`
}

function hasDeadlineSoon(_paragraphId: number): boolean {
  // TODO: Implement deadline checking when assignments have deadlines
  return false
}

function getModuleProgress(module: any): number {
  if (!module.chapters || module.chapters.length === 0) return 0

  let totalParagraphs = 0
  let completedParagraphs = 0

  module.chapters.forEach((ch: any) => {
    if (ch.paragraphs) {
      ch.paragraphs.forEach((p: any) => {
        totalParagraphs++
        if (getParagraphStatus(p.id) === 'completed') {
          completedParagraphs++
        }
      })
    }
  })

  if (totalParagraphs === 0) return 0
  return Math.round((completedParagraphs / totalParagraphs) * 100)
}

const overallProgress = computed(() => {
  if (!course.value || !course.value.modules || course.value.modules.length === 0) return 0

  let totalParagraphs = 0
  let completedParagraphs = 0

  course.value.modules.forEach((m: any) => {
    m.chapters?.forEach((ch: any) => {
      ch.paragraphs?.forEach((p: any) => {
        totalParagraphs++
        if (getParagraphStatus(p.id) === 'completed') {
          completedParagraphs++
        }
      })
    })
  })

  if (totalParagraphs === 0) return 0
  return Math.round((completedParagraphs / totalParagraphs) * 100)
})

onMounted(load)

// Следим за изменениями route.params.id
watch(() => route.params.id, () => {
  if (route.params.id) {
    load()
  }
})
</script>

<style scoped>
.course-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.course-header {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.course-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 700;
}

.course-meta {
  margin: 0 0 1.5rem 0;
  opacity: 0.95;
  font-size: 0.95rem;
}

.overall-progress {
  margin-top: 1.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-percentage {
  font-weight: 700;
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #48bb78;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.modules {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  cursor: pointer;
  transition: background 0.2s;
}

.module-header:hover {
  background: #edf2f7;
}

.module-title {
  display: flex;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  color: #2d3748;
}

.module-number {
  color: #667eea;
  font-weight: 700;
}

.module-progress-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.module-progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #718096;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0.25rem;
}

.toggle-btn.open {
  transform: rotate(180deg);
}

.module-progress-bar {
  height: 4px;
  background: #e2e8f0;
}

.module-progress-bar .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.module-content {
  padding: 1rem 1.5rem;
}

.chapters {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-item {
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
}

.chapter-header {
  margin-bottom: 0.75rem;
  color: #2d3748;
}

.paragraphs {
  list-style: none;
  margin: 0;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.paragraph-item {
  position: relative;
}

.paragraph-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  color: #4a5568;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
  background: white;
  border: 1px solid #e2e8f0;
}

.paragraph-link:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateX(4px);
}

.paragraph-status-icon {
  font-size: 1rem;
  min-width: 1.25rem;
}

.paragraph-text {
  flex: 1;
}

.paragraph-desc {
  color: #718096;
  font-size: 0.875rem;
}

.deadline-badge {
  font-size: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.paragraph-link.status-completed {
  border-left: 3px solid #48bb78;
}

.paragraph-link.status-in_progress {
  border-left: 3px solid #ed8936;
}

.no-content {
  color: #a0aec0;
  font-style: italic;
  margin: 0.5rem 0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.125rem;
}
@media (max-width: 500px) {
  .course-container {
    padding: 0;
  }
  
  .card {
    padding: 0;
  }

  .modules {
    padding: 0;
  }
}
</style>
