<template>
  <div class="card">
    <h2>{{ $t('studentCourses.title') }}</h2>

    <p v-if="loading" class="muted">{{ $t('studentCourses.loading') }}</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="!courses.length" class="muted">{{ $t('studentCourses.noCourses') }}</p>

    <div v-else class="course-grid">
      <article v-for="course in courses" :key="course.id" class="course-card">
        <router-link :to="{ name: 'student-course', params: { id: course.id } }" class="course-link">
          <h3>{{ course.title }}</h3>
          <p class="muted">
            <span v-if="course.subject">{{ course.subject.name }}</span>
            <span v-if="course.level"> • {{ course.level.number }} {{ $t('studentCourses.class') }}</span>
            <span v-if="course.teacher"> • {{ course.teacher.name }}</span>
          </p>
        </router-link>
      </article>

      

<!--      <article v-for="course in courses" :key="course.id" class="course-card">-->
<!--        <header>-->
<!--          <h3>{{ course.title }}</h3>-->
<!--          <p class="muted">-->
<!--            <span v-if="course.subject">{{ course.subject.name }}</span>-->
<!--            <span v-if="course.level"> • {{ course.level.number }} класс</span>-->
<!--          </p>-->
<!--          <p class="muted" v-if="course.teacher">Преподаватель: {{ course.teacher.name }}</p>-->
<!--          <p class="muted" v-if="course.groups?.length">-->
<!--            Группа: {{ course.groups.map(g => g.name).join(', ') }}-->
<!--          </p>-->
<!--        </header>-->

<!--        <section v-if="course.modules?.length" class="modules">-->
<!--          <details v-for="module in course.modules" :key="module.id" open>-->
<!--            <summary>{{ module.number }}. {{ module.title }}</summary>-->
<!--            <ul v-if="module.chapters?.length" class="chapters">-->
<!--              <li v-for="chapter in module.chapters" :key="chapter.id">-->
<!--                <strong>{{ chapter.number }}. {{ chapter.title }}</strong>-->
<!--                <ul v-if="chapter.paragraphs?.length" class="paragraphs">-->
<!--                  <li v-for="paragraph in chapter.paragraphs" :key="paragraph.id">-->
<!--                    <RouterLink-->
<!--                      class="paragraph-link"-->
<!--                      :to="`/student/paragraphs/${paragraph.id}`"-->
<!--                    >-->
<!--                      <span>-->
<!--                        {{ chapter.number }}.{{ paragraph.number }} — {{ paragraph.title }}-->
<!--                      </span>-->
<!--                      <span v-if="paragraph.description" class="muted">-->
<!--                        — {{ paragraph.description }}-->
<!--                      </span>-->
<!--                    </RouterLink>-->
<!--                  </li>-->
<!--                </ul>-->
<!--                <p v-else class="muted">Нет параграфов</p>-->
<!--              </li>-->
<!--            </ul>-->
<!--            <p v-else class="muted">Нет глав</p>-->
<!--          </details>-->
<!--        </section>-->
<!--      </article>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const courses = ref<any[]>([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/student/courses')
    courses.value = Array.isArray(data) ? data : []
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || t('studentCourses.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.course-link { display:block; color:inherit; text-decoration:none }
.course-link:hover { text-decoration:underline }

.card { padding: 16px; border: 1px solid #eee; border-radius: 10px; }
.course-grid { display: flex; flex-direction: column; gap: 16px; }
.course-card { border: 1px solid #f0f0f0; border-radius: 8px; padding: 14px; background: #fff; color: #555555}
header { margin-bottom: 12px; }
.modules details { border: 1px solid #f4f4f4; border-radius: 6px; padding: 8px; margin-bottom: 10px; background: #fafafa; }
summary { cursor: pointer; font-weight: 600; }
.chapters { list-style: none; padding: 0; margin: 6px 0 0 0; display: flex; flex-direction: column; gap: 6px; }
.paragraphs { list-style: none; margin: 6px 0 0 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
.muted { color: #666; }
.error { color: #b00020; }
</style>
