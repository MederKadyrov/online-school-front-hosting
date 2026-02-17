<template>
  <div class="container">
    <div class="page-header">
      <h2>{{ $t('teacherCourses.title') }}</h2>
    </div>

    <div class="card">
      <h3>{{ $t('teacherCourses.createNew') }}</h3>
      <div class="form-row">
        <div class="form-group">
          <label>{{ $t('teacherCourses.subject') }}</label>
          <select v-model.number="form.subject_id" class="form-input">
            <option :value="0">{{ $t('teacherCourses.selectSubject') }}</option>
            <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ $t('teacherCourses.class') }}</label>
          <select v-model.number="form.level_id" class="form-input">
            <option :value="0">{{ $t('teacherCourses.selectClass') }}</option>
            <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.number }} {{ $t('teacherCourses.classWord') }}</option>
          </select>
        </div>
        <div class="form-group">
          <button class="btn-create" @click="createCourse">{{ $t('teacherCourses.createCourse') }}</button>
        </div>
      </div>
    </div>

    <div class="courses-grid">
      <div class="course-card" v-for="c in rows" :key="c.id">
        <div class="course-header">
          <h3>{{ c.title }}</h3>
        </div>
        <div class="course-info">
          <div class="info-item">
            <span class="info-label">{{ $t('teacherCourses.subject') }}:</span>
            <span class="info-value">{{ c.subject }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('teacherCourses.class') }}:</span>
            <span class="info-value">{{ c.level }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('teacherCourses.status') }}:</span>
            <span class="info-value">{{ c.status }}</span>
          </div>
        </div>
        <router-link class="btn-open" :to="`/teacher/courses/${c.id}/edit`">
          {{ $t('teacherCourses.openCourse') }}
        </router-link>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const rows = ref<any[]>([])
const subjects = ref<any[]>([])
const levels = ref<any[]>([])
const error = ref('')
const form = ref({ subject_id: 0, level_id: 0 })

async function loadSubjects(){ const { data } = await api.get('/teacher/subjects'); subjects.value = data }
async function loadLevels(){ const { data } = await api.get('/levels'); levels.value = data }
async function load(){ const { data } = await api.get('/teacher/courses'); rows.value = data }

async function createCourse(){
  if (!form.value.subject_id || !form.value.level_id) { alert(t('teacherCourses.selectBoth')); return }
  const { data } = await api.post('/teacher/courses', form.value)
  // после создания попадём в редактор
  window.location.href = `/teacher/courses/${data.id}/edit`
}

onMounted(async ()=>{ await Promise.all([loadSubjects(), loadLevels(), load()]) })
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #212121;
  margin: 0;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
}

.card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 20px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #424242;
  margin: 0;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: #f8f9fa;
  color: #212121;
}

.form-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  background: #fff;
}

.btn-create {
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-create:hover {
  background: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-create:active {
  transform: translateY(0);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.course-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.course-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.info-label {
  color: #757575;
  font-weight: 500;
}

.info-value {
  color: #212121;
  font-weight: 600;
}

.btn-open {
  display: inline-block;
  padding: 10px 20px;
  background: transparent;
  color: #2196f3;
  border: 1px solid #2196f3;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-open:hover {
  background: #2196f3;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  border-left: 4px solid #d32f2f;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .page-header h2 {
    font-size: 24px;
  }

  .card {
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
