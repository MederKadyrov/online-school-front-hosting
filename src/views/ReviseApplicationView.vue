<template>
  <div class="revise-page">
    <div class="container">
      <div class="revise-card">
        <h1>{{ $t('reviseApplication') }}</h1>
        <p class="description">{{ $t('reviseApplicationDescription') }}</p>

        <div v-if="adminComment" class="admin-comment-section">
          <h3>{{ $t('adminComment') }}</h3>
          <p class="admin-comment">{{ adminComment }}</p>
        </div>

        <div v-if="loadingData" class="loading-state">
          <p>{{ $t('loading') }}</p>
        </div>

        <form v-else @submit.prevent="submitRevision">
          <div class="form-section">
            <h3>{{ $t('uploadDocuments') }}</h3>
            <p class="section-description">{{ $t('uploadOnlyChangedDocuments') }}</p>

            <!-- Student Photo -->
            <div class="form-group">
              <label>{{ $t('studentPhoto') }} <small class="optional-label">({{ $t('optional') }})</small></label>
              <div v-if="hasExistingDocument('student_photo') && !documentsToReplace['student_photo']" class="existing-document">
                <div class="document-status">
                  <Check class="status-icon" :size="16" />
                  <span class="status-text">{{ $t('documentUploaded') }}</span>
                </div>
                <div class="document-actions">
                  <button type="button" @click="viewDocument('student_photo')" class="btn-view">
                    <Eye :size="16" /> {{ $t('view') }}
                  </button>
                  <button type="button" @click="markForReplacement('student_photo')" class="btn-replace">
                    <RefreshCw :size="16" /> {{ $t('replace') }}
                  </button>
                </div>
              </div>
              <div v-else class="upload-area">
                <input
                  type="file"
                  id="student_photo"
                  @change="handleFileChange('student_photo', $event)"
                  accept="image/jpeg,image/jpg,image/png,image/png"
                />
                <button v-if="documentsToReplace['student_photo']" type="button" @click="cancelReplacement('student_photo')" class="btn-cancel-replace">
                  {{ $t('keepExisting') }}
                </button>
              </div>
            </div>

            <!-- Guardian Application -->
            <div class="form-group">
              <label>{{ $t('guardianApplication') }}</label>
              <div v-if="hasExistingDocument('guardian_application') && !documentsToReplace['guardian_application']" class="existing-document">
                <div class="document-status">
                  <Check class="status-icon" :size="16" />
                  <span class="status-text">{{ $t('documentUploaded') }}</span>
                </div>
                <div class="document-actions">
                  <button type="button" @click="viewDocument('guardian_application')" class="btn-view">
                    <Eye :size="16" /> {{ $t('view') }}
                  </button>
                  <button type="button" @click="markForReplacement('guardian_application')" class="btn-replace">
                    <RefreshCw :size="16" /> {{ $t('replace') }}
                  </button>
                </div>
              </div>
              <div v-else class="upload-area">
                <input
                  type="file"
                  id="guardian_application"
                  @change="handleFileChange('guardian_application', $event)"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <button v-if="documentsToReplace['guardian_application']" type="button" @click="cancelReplacement('guardian_application')" class="btn-cancel-replace">
                  {{ $t('keepExisting') }}
                </button>
              </div>
            </div>

            <!-- Birth Certificate -->
            <div class="form-group">
              <label>{{ $t('birthCertificate') }}</label>
              <div v-if="hasExistingDocument('birth_certificate') && !documentsToReplace['birth_certificate']" class="existing-document">
                <div class="document-status">
                  <Check class="status-icon" :size="16" />
                  <span class="status-text">{{ $t('documentUploaded') }}</span>
                </div>
                <div class="document-actions">
                  <button type="button" @click="viewDocument('birth_certificate')" class="btn-view">
                    <Eye :size="16" /> {{ $t('view') }}
                  </button>
                  <button type="button" @click="markForReplacement('birth_certificate')" class="btn-replace">
                    <RefreshCw :size="16" /> {{ $t('replace') }}
                  </button>
                </div>
              </div>
              <div v-else class="upload-area">
                <input
                  type="file"
                  id="birth_certificate"
                  @change="handleFileChange('birth_certificate', $event)"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <button v-if="documentsToReplace['birth_certificate']" type="button" @click="cancelReplacement('birth_certificate')" class="btn-cancel-replace">
                  {{ $t('keepExisting') }}
                </button>
              </div>
            </div>

            <!-- Student PIN Document -->
            <div class="form-group">
              <label>{{ $t('studentPinDocument') }}</label>
              <div v-if="hasExistingDocument('student_pin_doc') && !documentsToReplace['student_pin_doc']" class="existing-document">
                <div class="document-status">
                  <Check class="status-icon" :size="16" />
                  <span class="status-text">{{ $t('documentUploaded') }}</span>
                </div>
                <div class="document-actions">
                  <button type="button" @click="viewDocument('student_pin_doc')" class="btn-view">
                    <Eye :size="16" /> {{ $t('view') }}
                  </button>
                  <button type="button" @click="markForReplacement('student_pin_doc')" class="btn-replace">
                    <RefreshCw :size="16" /> {{ $t('replace') }}
                  </button>
                </div>
              </div>
              <div v-else class="upload-area">
                <input
                  type="file"
                  id="student_pin_doc"
                  @change="handleFileChange('student_pin_doc', $event)"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <button v-if="documentsToReplace['student_pin_doc']" type="button" @click="cancelReplacement('student_pin_doc')" class="btn-cancel-replace">
                  {{ $t('keepExisting') }}
                </button>
              </div>
            </div>

            <!-- Guardian Passport -->
            <div class="form-group">
              <label>{{ $t('guardianPassport') }}</label>
              <div v-if="hasExistingDocument('guardian_passport') && !documentsToReplace['guardian_passport']" class="existing-document">
                <div class="document-status">
                  <Check class="status-icon" :size="16" />
                  <span class="status-text">{{ $t('documentUploaded') }}</span>
                </div>
                <div class="document-actions">
                  <button type="button" @click="viewDocument('guardian_passport')" class="btn-view">
                    <Eye :size="16" /> {{ $t('view') }}
                  </button>
                  <button type="button" @click="markForReplacement('guardian_passport')" class="btn-replace">
                    <RefreshCw :size="16" /> {{ $t('replace') }}
                  </button>
                </div>
              </div>
              <div v-else class="upload-area">
                <input
                  type="file"
                  id="guardian_passport"
                  @change="handleFileChange('guardian_passport', $event)"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <button v-if="documentsToReplace['guardian_passport']" type="button" @click="cancelReplacement('guardian_passport')" class="btn-cancel-replace">
                  {{ $t('keepExisting') }}
                </button>
              </div>
            </div>

            <!-- Medical Certificate -->
            <div class="form-group">
              <label>{{ $t('medicalCertificate') }}</label>
              <div v-if="hasExistingDocument('medical_certificate') && !documentsToReplace['medical_certificate']" class="existing-document">
                <div class="document-status">
                  <Check class="status-icon" :size="16" />
                  <span class="status-text">{{ $t('documentUploaded') }}</span>
                </div>
                <div class="document-actions">
                  <button type="button" @click="viewDocument('medical_certificate')" class="btn-view">
                    <Eye :size="16" /> {{ $t('view') }}
                  </button>
                  <button type="button" @click="markForReplacement('medical_certificate')" class="btn-replace">
                    <RefreshCw :size="16" /> {{ $t('replace') }}
                  </button>
                </div>
              </div>
              <div v-else class="upload-area">
                <input
                  type="file"
                  id="medical_certificate"
                  @change="handleFileChange('medical_certificate', $event)"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <button v-if="documentsToReplace['medical_certificate']" type="button" @click="cancelReplacement('medical_certificate')" class="btn-cancel-replace">
                  {{ $t('keepExisting') }}
                </button>
              </div>
            </div>

            <!-- Previous School Record -->
            <div class="form-group">
              <label>{{ $t('previousSchoolRecord') }}</label>
              <div v-if="hasExistingDocument('previous_school_record') && !documentsToReplace['previous_school_record']" class="existing-document">
                <div class="document-status">
                  <Check class="status-icon" :size="16" />
                  <span class="status-text">{{ $t('documentUploaded') }}</span>
                </div>
                <div class="document-actions">
                  <button type="button" @click="viewDocument('previous_school_record')" class="btn-view">
                    <Eye :size="16" /> {{ $t('view') }}
                  </button>
                  <button type="button" @click="markForReplacement('previous_school_record')" class="btn-replace">
                    <RefreshCw :size="16" /> {{ $t('replace') }}
                  </button>
                </div>
              </div>
              <div v-else class="upload-area">
                <input
                  type="file"
                  id="previous_school_record"
                  @change="handleFileChange('previous_school_record', $event)"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <button v-if="documentsToReplace['previous_school_record']" type="button" @click="cancelReplacement('previous_school_record')" class="btn-cancel-replace">
                  {{ $t('keepExisting') }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div v-if="success" class="alert alert-success">
            {{ success }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading || !!success">
            {{ loading ? $t('submitting') : $t('submitRevision') }}
          </button>
        </form>
      </div>
    </div>

    <!-- Модальное окно для просмотра документа -->
    <div v-if="showDocumentModal" class="modal-overlay" @click.self="closeDocumentModal">
      <div class="modal modal-document">
        <div class="modal-header">
          <h3>{{ $t(`documentTypes.${currentDocumentKey}`) }}</h3>
          <button @click="closeDocumentModal" class="btn-close"><X :size="18" /></button>
        </div>
        <div class="document-preview">
          <iframe :src="documentPreviewUrl" frameborder="0"></iframe>
        </div>
        <div class="modal-actions">
          <button @click="closeDocumentModal" class="btn-cancel">{{ $t('close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Check, Eye, RefreshCw, X } from 'lucide-vue-next'
import api from '../utils/api'

const { t } = useI18n()
const route = useRoute()

const registrationNumber = ref('')
const revisionToken = ref('')
const adminComment = ref('')
const existingDocuments = ref<Record<string, string>>({})
const files = ref<Record<string, File>>({})
const documentsToReplace = ref<Record<string, boolean>>({})
const loading = ref(false)
const loadingData = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  registrationNumber.value = route.query.registration_number as string || ''
  revisionToken.value = route.query.token as string || ''

  if (!registrationNumber.value || !revisionToken.value) {
    error.value = t('invalidRevisionLink')
    return
  }

  await loadApplicationData()
})

const loadApplicationData = async () => {
  loadingData.value = true
  try {
    const response = await api.post('/applications/revision-data', {
      registration_number: registrationNumber.value,
      revision_token: revisionToken.value
    })

    adminComment.value = response.data.admin_comment || ''
    existingDocuments.value = response.data.documents || {}
  } catch (err: any) {
    error.value = err.response?.data?.message || t('errorLoadingData')
  } finally {
    loadingData.value = false
  }
}

const showDocumentModal = ref(false)
const documentPreviewUrl = ref('')
const currentDocumentKey = ref('')

const hasExistingDocument = (docKey: string) => {
  return !!existingDocuments.value[docKey]
}

const markForReplacement = (docKey: string) => {
  documentsToReplace.value[docKey] = true
}

const cancelReplacement = (docKey: string) => {
  documentsToReplace.value[docKey] = false
  delete files.value[docKey]
  // Очищаем input
  const input = document.getElementById(docKey) as HTMLInputElement
  if (input) input.value = ''
}

const viewDocument = async (docKey: string) => {
  try {
    const response = await api.get(`/applications/revision-document/${docKey}`, {
      params: {
        registration_number: registrationNumber.value,
        revision_token: revisionToken.value
      },
      responseType: 'blob'
    })

    // Проверяем, что ответ действительно blob (файл), а не JSON ошибка
    if (response.data.type && response.data.type.includes('application/json')) {
      // Это JSON ошибка, а не файл
      const text = await response.data.text()
      const errorData = JSON.parse(text)
      error.value = errorData.message || t('errorLoadingDocument')
      return
    }

    // Получаем MIME type из response headers или из blob
    const contentType = response.headers['content-type'] || response.data.type

    // Создаем blob с правильным MIME type
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)

    documentPreviewUrl.value = url
    currentDocumentKey.value = docKey
    showDocumentModal.value = true
  } catch (err: any) {
    console.error('Error viewing document:', err)

    // Если ошибка содержит blob, пытаемся прочитать JSON
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text()
        const errorData = JSON.parse(text)
        error.value = errorData.message || t('errorLoadingDocument')
      } catch {
        error.value = t('errorLoadingDocument')
      }
    } else {
      error.value = err.response?.data?.message || t('errorLoadingDocument')
    }
  }
}

const closeDocumentModal = () => {
  showDocumentModal.value = false
  if (documentPreviewUrl.value) {
    window.URL.revokeObjectURL(documentPreviewUrl.value)
    documentPreviewUrl.value = ''
  }
  currentDocumentKey.value = ''
}

const handleFileChange = (fieldName: string, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    files.value[fieldName] = target.files[0]
  }
}

const submitRevision = async () => {
  error.value = ''
  success.value = ''

  loading.value = true

  try {
    const formData = new FormData()
    formData.append('registration_number', registrationNumber.value)
    formData.append('revision_token', revisionToken.value)

    // Добавляем только те файлы, которые были выбраны для замены
    Object.entries(files.value).forEach(([key, file]) => {
      formData.append(key, file)
    })

    const response = await api.post('/applications/revise', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    success.value = response.data.message
    files.value = {}

    // Очищаем файловые инпуты
    const fileInputs = document.querySelectorAll('input[type="file"]')
    fileInputs.forEach((input: any) => {
      input.value = ''
    })
  } catch (err: any) {
    error.value = err.response?.data?.message || t('errorSubmittingRevision')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.revise-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.revise-card {
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

.admin-comment-section {
  background: #fef5e7;
  border-left: 4px solid #f39c12;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
}

.admin-comment-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #7c2d12;
  margin-bottom: 0.5rem;
}

.admin-comment {
  color: #744210;
  line-height: 1.6;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.section-description {
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
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

input[type="file"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: pointer;
}

input[type="file"]:hover {
  border-color: #667eea;
  background: #f7fafc;
}

small {
  display: block;
  color: #718096;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #742a2a;
}

.alert-success {
  background: #c6f6d5;
  border: 1px solid #68d391;
  color: #22543d;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.125rem;
}

.optional-label {
  font-weight: normal;
  color: #718096;
}

.existing-document {
  padding: 1rem;
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.document-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-size: 1.25rem;
  color: #22c55e;
}

.status-text {
  color: #15803d;
  font-weight: 600;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view,
.btn-replace {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view {
  background: #48bb78;
  color: white;
}

.btn-view:hover {
  background: #38a169;
}

.btn-replace {
  background: #f59e0b;
  color: white;
}

.btn-replace:hover {
  background: #d97706;
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-cancel-replace {
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-cancel-replace:hover {
  background: #cbd5e0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-document {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  width: 1000px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a202c;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #2d3748;
}

.document-preview {
  flex: 1;
  min-height: 600px;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.document-preview iframe {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #e2e8f0;
  color: #2d3748;
}

.btn-cancel:hover {
  background: #cbd5e0;
}
</style>
