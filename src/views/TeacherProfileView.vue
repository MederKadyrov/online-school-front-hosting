<template>
  <div class="profile-view">
    <div class="page-header">
      <h1><User :size="24" /> {{ $t('teacherProfile.title') }}</h1>
      <p class="subtitle">{{ $t('teacherProfile.subtitle') }}</p>
    </div>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>{{ $t('teacherProfile.loadingProfile') }}</p>
    </div>

    <div v-else-if="error" class="error-message">
      <AlertTriangle class="error-icon" :size="24" />
      <p>{{ error }}</p>
      <button @click="fetchProfile" class="btn-retry">{{ $t('teacherProfile.tryAgain') }}</button>
    </div>

    <div v-else-if="profile" class="profile-content">
      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <ClipboardList :size="16" /> {{ $t('teacherProfile.profileTab') }}
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'password' }"
          @click="activeTab = 'password'"
        >
          <Lock :size="16" /> {{ $t('teacherProfile.passwordTab') }}
        </button>
      </div>

      <!-- Tab: Profile -->
      <div v-if="activeTab === 'profile'" class="tab-content">
        <!-- Личная информация -->
        <div class="profile-card">
          <div class="card-header">
            <h2><ClipboardList :size="18" /> {{ $t('teacherProfile.personalInfo') }}</h2>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('teacherProfile.lastName') }}:</span>
                <span class="info-value">{{ profile.last_name || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('teacherProfile.firstName') }}:</span>
                <span class="info-value">{{ profile.first_name || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('teacherProfile.middleName') }}:</span>
                <span class="info-value">{{ profile.middle_name || '—' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">{{ $t('teacherProfile.email') }}:</span>
                <span class="info-value">{{ profile.email || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('teacherProfile.phone') }}:</span>
                <span class="info-value">{{ profile.phone || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('teacherProfile.registrationDate') }}:</span>
                <span class="info-value">{{ formatDate(profile.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о преподавании -->
        <div v-if="profile.subjects && profile.subjects.length > 0" class="profile-card">
          <div class="card-header">
            <h2><BookOpen :size="18" /> {{ $t('teacherProfile.teachingSubjects') }}</h2>
          </div>
          <div class="card-body">
            <div class="subjects-list">
              <div v-for="subject in profile.subjects" :key="subject.id" class="subject-badge">
                {{ subject.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Password -->
      <div v-if="activeTab === 'password'" class="tab-content">
        <div class="profile-card">
          <div class="card-header">
            <h2><Lock :size="18" /> {{ $t('teacherProfile.changePassword') }}</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword" class="password-form">
              <div class="form-group">
                <label for="current_password">{{ $t('teacherProfile.currentPassword') }}:</label>
                <input
                  type="password"
                  id="current_password"
                  v-model="passwordForm.current_password"
                  class="inp"
                  required
                />
              </div>
              <div class="form-group">
                <label for="new_password">{{ $t('teacherProfile.newPassword') }}:</label>
                <input
                  type="password"
                  id="new_password"
                  v-model="passwordForm.new_password"
                  class="inp"
                  required
                  minlength="6"
                />
                <small class="form-hint">{{ $t('teacherProfile.minChars') }}</small>
              </div>
              <div class="form-group">
                <label for="new_password_confirmation">{{ $t('teacherProfile.confirmPassword') }}:</label>
                <input
                  type="password"
                  id="new_password_confirmation"
                  v-model="passwordForm.new_password_confirmation"
                  class="inp"
                  required
                />
              </div>

              <div v-if="passwordError" class="alert alert-error">
                {{ passwordError }}
              </div>
              <div v-if="passwordSuccess" class="alert alert-success">
                {{ passwordSuccess }}
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                :disabled="changingPassword"
              >
                {{ changingPassword ? $t('teacherProfile.saving') : $t('teacherProfile.changePasswordBtn') }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, AlertTriangle, ClipboardList, Lock, BookOpen } from 'lucide-vue-next'
import api from '../utils/api'

const { t } = useI18n()

interface Profile {
  id: number
  email: string | null
  phone: string | null
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  created_at: string
  subjects?: Array<{
    id: number
    name: string
  }>
}

const loading = ref(true)
const error = ref('')
const profile = ref<Profile | null>(null)
const activeTab = ref<'profile' | 'password'>('profile')

const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return '—'
  }
}

async function fetchProfile() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/teacher/profile')
    profile.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || t('teacherProfile.loadError')
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    passwordError.value = t('teacherProfile.passwordMismatch')
    return
  }

  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await api.post('/teacher/change-password', passwordForm.value)
    passwordSuccess.value = t('teacherProfile.passwordChanged')
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
  } catch (e: any) {
    passwordError.value = e?.response?.data?.message || e?.message || t('teacherProfile.changePasswordError')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
}

/* Tabs Navigation */
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-button {
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #718096;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
  bottom: -2px;
}

.tab-button:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: #fee;
  border-radius: 8px;
  color: #c53030;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-retry:hover {
  background: #2563eb;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.25rem 1.5rem;
  color: white;
}

.card-header h2 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #1a202c;
  font-weight: 600;
}

.subjects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.subject-badge {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.password-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.inp {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.inp:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #718096;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.alert-error {
  background: #fee;
  color: #c53030;
  border: 1px solid #fc8181;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 1rem 0.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-body {
    padding: 1rem;
  }

  .tabs-nav {
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
