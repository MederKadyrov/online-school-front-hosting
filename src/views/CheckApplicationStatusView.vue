<template>
  <div class="check-status-page">
    <div class="container">
      <div class="status-card">
        <h1>{{ $t('checkApplicationStatus') }}</h1>
        <p class="description">{{ $t('checkApplicationStatusDescription') }}</p>

        <form @submit.prevent="checkStatus" v-if="!application">
          <div class="form-group">
            <label for="registration_number">{{ $t('registrationNumber') }}</label>
            <input
              type="text"
              id="registration_number"
              v-model="registrationNumber"
              :placeholder="$t('enterRegistrationNumber')"
              required
            />
          </div>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? $t('checking') : $t('checkStatus') }}
          </button>
        </form>

        <div v-if="application" class="application-result">
          <div class="status-header">
            <h2>{{ $t('applicationStatus') }}</h2>
            <span :class="['status-badge', application.status]">
              {{ $t(`applicationStatus.${application.status}`) }}
            </span>
          </div>

          <div class="application-details">
            <div class="detail-row">
              <span class="label">{{ $t('registrationNumber') }}:</span>
              <span class="value">{{ application.registration_number }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('submittedAt') }}:</span>
              <span class="value">{{ formatDate(application.submitted_at) }}</span>
            </div>
            <div class="detail-row" v-if="application.reviewed_at">
              <span class="label">{{ $t('reviewedAt') }}:</span>
              <span class="value">{{ formatDate(application.reviewed_at) }}</span>
            </div>
            <div class="detail-row" v-if="application.admin_comment">
              <span class="label">{{ $t('adminComment') }}:</span>
              <span class="value">{{ application.admin_comment }}</span>
            </div>
          </div>

          <div v-if="application.can_revise" class="revision-section">
            <div class="alert alert-warning">
              <p>{{ $t('revisionRequired') }}</p>
              <button @click="goToRevision" class="btn-warning">
                {{ $t('reviseApplication') }}
              </button>
            </div>
          </div>

          <button @click="reset" class="btn-secondary">
            {{ $t('checkAnother') }}
          </button>
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()
const router = useRouter()

const registrationNumber = ref('')
const application = ref<any>(null)
const loading = ref(false)
const error = ref('')

const checkStatus = async () => {
  if (!registrationNumber.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/applications/check-status', {
      registration_number: registrationNumber.value.trim()
    })
    application.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || t('errorCheckingStatus')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const goToRevision = () => {
  router.push({
    path: '/revise-application',
    query: {
      registration_number: application.value.registration_number,
      token: application.value.revision_token
    }
  })
}

const reset = () => {
  application.value = null
  registrationNumber.value = ''
  error.value = ''
}
</script>

<style scoped>
.check-status-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 600px;
  width: 100%;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.75rem;
  text-align: center;
}

.description {
  color: #718096;
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary, .btn-secondary, .btn-warning {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
  margin-top: 1rem;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-warning {
  background: #ed8936;
  color: white;
}

.btn-warning:hover {
  background: #dd6b20;
}

.application-result {
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

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.status-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.approved {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.rejected {
  background: #feb2b2;
  color: #742a2a;
}

.status-badge.needs_revision {
  background: #feebc8;
  color: #7c2d12;
}

.application-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-row .label {
  font-weight: 600;
  color: #4a5568;
}

.detail-row .value {
  color: #2d3748;
  text-align: right;
}

.revision-section {
  margin: 1.5rem 0;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.alert-warning {
  background: #fef5e7;
  border: 1px solid #f39c12;
  color: #7c2d12;
}

.alert-warning p {
  margin-bottom: 1rem;
}

.alert-error {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #742a2a;
}
</style>
