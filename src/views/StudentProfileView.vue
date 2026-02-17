<template>
  <div class="profile-view">
    <div class="page-header">
      <h1>👤 {{ $t('studentProfile.title') }}</h1>
      <p class="subtitle">{{ $t('studentProfile.subtitle') }}</p>
    </div>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>{{ $t('studentProfile.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="fetchProfile" class="btn-retry">{{ $t('studentProfile.tryAgain') }}</button>
    </div>

    <div v-else-if="profile" class="profile-content">
      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          📋 {{ $t('studentProfile.tabProfile') }}
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'documents' }"
          @click="activeTab = 'documents'"
        >
          📄 {{ $t('studentProfile.tabDocuments') }}
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'password' }"
          @click="activeTab = 'password'"
        >
          🔒 {{ $t('studentProfile.tabPassword') }}
        </button>
      </div>

      <!-- Tab: Profile -->
      <div v-if="activeTab === 'profile'" class="tab-content">
        <!-- Личная информация -->
        <div class="profile-card">
          <div class="card-header">
            <h2>📋 {{ $t('studentProfile.personalInfo') }}</h2>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.lastName') }}:</span>
                <span class="info-value">{{ profile.last_name || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.firstName') }}:</span>
                <span class="info-value">{{ profile.first_name || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.middleName') }}:</span>
                <span class="info-value">{{ profile.middle_name || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.pin') }}:</span>
                <span class="info-value">{{ profile.pin || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.gender') }}:</span>
                <span class="info-value">{{ formatGender(profile.gender) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.birthDate') }}:</span>
                <span class="info-value">{{ formatDate(profile.birth_date) }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.email') }}:</span>
                <span class="info-value">{{ profile.email || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.phone') }}:</span>
                <span class="info-value">{{ profile.phone || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.registrationDate') }}:</span>
                <span class="info-value">{{ formatDate(profile.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о классе -->
        <div v-if="profile.group" class="profile-card">
          <div class="card-header">
            <h2>🏫 {{ $t('studentProfile.classInfo') }}</h2>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.class') }}:</span>
                <span class="info-value">{{ profile.group.display_name || '—' }}</span>
              </div>
              <div class="info-item" v-if="profile.group.level">
                <span class="info-label">{{ $t('studentProfile.level') }}:</span>
                <span class="info-value">{{ profile.group.level.number }} {{ $t('studentProfile.classWord') }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('studentProfile.classLetter') }}:</span>
                <span class="info-value">{{ profile.group.class_letter || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Documents -->
      <div v-if="activeTab === 'documents'" class="tab-content">
        <div class="profile-card">
          <div class="card-header">
            <h2>📄 {{ $t('studentProfile.studentDocuments') }}</h2>
          </div>
          <div class="card-body">
            <div v-if="profile.documents && profile.documents.length > 0">
              <div class="documents-list">
                <div v-for="doc in profile.documents" :key="doc.id" class="document-item">
                  <div class="document-icon">📎</div>
                  <div class="document-info">
                    <div class="document-name">{{ doc.name }}</div>
                    <div class="document-meta">
                      <span class="document-type">{{ doc.type }}</span>
                      <span class="document-date">{{ formatDate(doc.uploaded_at) }}</span>
                    </div>
                  </div>
                  <a
                    v-if="doc.file_url"
                    :href="doc.file_url"
                    target="_blank"
                    class="btn-download"
                    :title="$t('studentProfile.download')"
                  >
                    📥
                  </a>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-icon">📭</span>
              <p>{{ $t('studentProfile.noDocuments') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Password -->
      <div v-if="activeTab === 'password'" class="tab-content">
        <div class="profile-card">
          <div class="card-header">
            <h2>🔒 {{ $t('studentProfile.changePassword') }}</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword" class="password-form">
              <div class="form-group">
                <label for="current_password">{{ $t('studentProfile.currentPassword') }}:</label>
                <input
                  type="password"
                  id="current_password"
                  v-model="passwordForm.current_password"
                  class="inp"
                  required
                />
              </div>
              <div class="form-group">
                <label for="new_password">{{ $t('studentProfile.newPassword') }}:</label>
                <input
                  type="password"
                  id="new_password"
                  v-model="passwordForm.new_password"
                  class="inp"
                  required
                  minlength="6"
                />
                <small class="form-hint">{{ $t('studentProfile.minChars') }}</small>
              </div>
              <div class="form-group">
                <label for="new_password_confirmation">{{ $t('studentProfile.confirmPassword') }}:</label>
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
                {{ changingPassword ? $t('studentProfile.saving') : $t('studentProfile.changePasswordBtn') }}
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
import api from '../utils/api'

const { t } = useI18n()

interface Document {
  id: number
  name: string
  type: string
  file_url: string | null
  uploaded_at: string
}

interface Profile {
  id: number
  email: string | null
  phone: string | null
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  pin: string | null
  gender: string | null
  birth_date: string | null
  created_at: string
  documents?: Document[]
  group?: {
    id: number
    class_letter: string
    display_name: string
    level?: {
      id: number
      number: number
    }
  }
}

const loading = ref(true)
const error = ref('')
const profile = ref<Profile | null>(null)
const activeTab = ref<'profile' | 'documents' | 'password'>('profile')

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

function formatGender(gender: string | null | undefined): string {
  if (!gender) return '—'
  if (gender === 'male' || gender === 'м' || gender === 'М') return t('studentProfile.genderMale')
  if (gender === 'female' || gender === 'ж' || gender === 'Ж') return t('studentProfile.genderFemale')
  return gender
}

async function fetchProfile() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/student/profile')
    profile.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || t('studentProfile.loadError')
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    passwordError.value = t('studentProfile.passwordMismatch')
    return
  }

  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await api.post('/student/change-password', passwordForm.value)
    passwordSuccess.value = t('studentProfile.passwordChanged')
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
  } catch (e: any) {
    passwordError.value = e?.response?.data?.message || e?.message || t('studentProfile.passwordChangeError')
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

/* Documents */
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.document-item:hover {
  background: #f0f4f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.document-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #718096;
}

.document-type {
  padding: 0.125rem 0.5rem;
  background: #e2e8f0;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-download {
  padding: 0.5rem 0.75rem;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 1.25rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-download:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
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

  .document-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 400px) {
  .tabs-nav {
    flex-direction: column;
  }
}
</style>
