<template>
  <div class="application-details" v-if="application">
    <div class="page-header">
      <button @click="goBack" class="btn-back"><ArrowLeft :size="16" /> {{ $t("back") }}</button>
      <h1>{{ $t("applicationDetails") }}</h1>
      <span :class="['status-badge-large', application.status]">
        {{ $t(`applicationStatus.${application.status}`) }}
      </span>
    </div>

    <div class="content-grid">
      <!-- Основная информация -->
      <div class="card">
        <h2>{{ $t("generalInformation") }}</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">{{ $t("registrationNumber") }}:</span>
            <span class="value pin-badge">{{
              application.registration_number
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("submittedAt") }}:</span>
            <span class="value">{{
              formatDate(application.submitted_at)
            }}</span>
          </div>
          <div class="info-item" v-if="application.reviewed_at">
            <span class="label">{{ $t("reviewedAt") }}:</span>
            <span class="value">{{ formatDate(application.reviewed_at) }}</span>
          </div>
          <div class="info-item" v-if="application.reviewer">
            <span class="label">{{ $t("reviewedBy") }}:</span>
            <span class="value">{{
              getReviewerName(application.reviewer)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Данные студента -->
      <div class="card">
        <h2>{{ $t("studentInformation") }}</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">{{ $t("fullName") }}:</span>
            <span class="value">{{ getStudentFullName() }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("sex") }}:</span>
            <span class="value">{{ $t(`sex.${studentData.sex}`) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("birthDate") }}:</span>
            <span class="value">{{ studentData.birth_date }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("citizenship") }}:</span>
            <span class="value">{{ studentData.citizenship }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("pin") }}:</span>
            <span class="value">{{ studentData.pin }}</span>
          </div>
          <div class="info-item" v-if="studentData.phone">
            <span class="label">{{ $t("phone") }}:</span>
            <span class="value">{{ studentData.phone }}</span>
          </div>
          <div class="info-item" v-if="studentData.email">
            <span class="label">{{ $t("email") }}:</span>
            <span class="value">{{ studentData.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("level") }}:</span>
            <span class="value">{{ studentData.level_id }}</span>
          </div>
        </div>
      </div>

      <!-- Данные опекуна -->
      <div class="card">
        <h2>{{ $t("guardianInformation") }}</h2>
        <div class="guardian-type">
          <span class="label">{{ $t("guardianType") }}:</span>
          <span class="value">{{
            $t(`guardianType.${application.application_data.guardian_type}`)
          }}</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">{{ $t("fullName") }}:</span>
            <span class="value">{{ getGuardianFullName() }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("sex") }}:</span>
            <span class="value">{{ $t(`sex.${guardianData.sex}`) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("citizenship") }}:</span>
            <span class="value">{{ guardianData.citizenship }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("pin") }}:</span>
            <span class="value">{{ guardianData.pin }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("phone") }}:</span>
            <span class="value">{{ guardianData.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t("email") }}:</span>
            <span class="value">{{ guardianData.email }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">{{ $t("address") }}:</span>
            <span class="value">{{ guardianData.address }}</span>
          </div>
        </div>
      </div>

      <!-- Документы -->
      <div class="card">
        <h2>{{ $t("documents") }}</h2>
        <div class="documents-grid">
          <div
            v-for="(_path, key) in application.documents"
            :key="key"
            class="document-item"
          >
            <FileText class="document-icon" :size="28" />
            <div class="document-info">
              <strong>{{ $t(`documentTypes.${key}`) }}</strong>
              <div class="document-actions">
                <button @click="viewDocument(String(key))" class="btn-view-doc">
                  <Eye :size="16" /> {{ $t("view") }}
                </button>
                <button @click="downloadDocument(String(key))" class="btn-download">
                  <Download :size="16" /> {{ $t("download") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- История модерации -->
      <div
        class="card"
        v-if="application.reviews && application.reviews.length > 0"
      >
        <h2>{{ $t("reviewHistory") }}</h2>
        <div class="timeline">
          <div
            v-for="review in application.reviews"
            :key="review.id"
            class="timeline-item"
          >
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span :class="['action-badge', review.action]">
                  {{ $t(`reviewAction.${review.action}`) }}
                </span>
                <span class="timeline-date">{{
                  formatDate(review.created_at)
                }}</span>
              </div>
              <div class="timeline-reviewer">
                {{ getReviewerName(review.reviewer) }}
              </div>
              <div v-if="review.comment" class="timeline-comment">
                {{ review.comment }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Комментарий админа -->
      <div class="card" v-if="application.admin_comment">
        <h2>{{ $t("adminComment") }}</h2>
        <p class="admin-comment">{{ application.admin_comment }}</p>
      </div>

      <!-- Действия модератора -->
      <div class="card actions-card" v-if="canModerate">
        <h2>{{ $t("moderationActions") }}</h2>

        <div class="action-buttons">
          <button
            @click="showApproveModal = true"
            class="btn-action btn-approve"
          >
            <Check :size="16" /> {{ $t("approveApplication") }}
          </button>
          <button
            @click="showRevisionModal = true"
            class="btn-action btn-revision"
          >
            <RefreshCw :size="16" /> {{ $t("requestRevision") }}
          </button>
          <button @click="showRejectModal = true" class="btn-action btn-reject">
            <X :size="16" /> {{ $t("rejectApplication") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для одобрения -->
    <div
      v-if="showApproveModal"
      class="modal-overlay"
      @click.self="showApproveModal = false"
    >
      <div class="modal">
        <h3>{{ $t("confirmApproval") }}</h3>
        <p>{{ $t("confirmApprovalMessage") }}</p>
        <textarea
          v-model="moderationComment"
          :placeholder="$t('optionalComment')"
          rows="3"
        ></textarea>
        <div class="modal-actions">
          <button @click="showApproveModal = false" class="btn-cancel">
            {{ $t("cancel") }}
          </button>
          <button
            @click="approveApplication"
            class="btn-confirm"
            :disabled="processing"
          >
            {{ processing ? $t("processing") : $t("approve") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для запроса изменений -->
    <div
      v-if="showRevisionModal"
      class="modal-overlay"
      @click.self="showRevisionModal = false"
    >
      <div class="modal">
        <h3>{{ $t("requestRevision") }}</h3>
        <p>{{ $t("requestRevisionMessage") }}</p>
        <textarea
          v-model="moderationComment"
          :placeholder="$t('requiredComment')"
          rows="4"
          required
        ></textarea>
        <div class="modal-actions">
          <button @click="showRevisionModal = false" class="btn-cancel">
            {{ $t("cancel") }}
          </button>
          <button
            @click="requestRevision"
            class="btn-confirm"
            :disabled="processing || !moderationComment"
          >
            {{ processing ? $t("processing") : $t("sendRequest") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для отклонения -->
    <div
      v-if="showRejectModal"
      class="modal-overlay"
      @click.self="showRejectModal = false"
    >
      <div class="modal">
        <h3>{{ $t("confirmRejection") }}</h3>
        <p>{{ $t("confirmRejectionMessage") }}</p>
        <textarea
          v-model="moderationComment"
          :placeholder="$t('requiredComment')"
          rows="4"
          required
        ></textarea>
        <div class="modal-actions">
          <button @click="showRejectModal = false" class="btn-cancel">
            {{ $t("cancel") }}
          </button>
          <button
            @click="rejectApplication"
            class="btn-confirm btn-danger"
            :disabled="processing || !moderationComment"
          >
            {{ processing ? $t("processing") : $t("reject") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для просмотра документа -->
    <div
      v-if="showDocumentModal"
      class="modal-overlay"
      @click.self="closeDocumentModal"
    >
      <div class="modal modal-document">
        <div class="modal-header">
          <h3>{{ $t(`documentTypes.${currentDocumentKey}`) }}</h3>
          <button @click="closeDocumentModal" class="btn-close"><X :size="18" /></button>
        </div>
        <div class="document-preview">
          <iframe :src="documentPreviewUrl" frameborder="0"></iframe>
        </div>
        <div class="modal-actions">
          <button
            @click="downloadDocument(currentDocumentKey)"
            class="btn-confirm"
          >
            <Download :size="16" /> {{ $t("download") }}
          </button>
          <button @click="closeDocumentModal" class="btn-cancel">
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowLeft, FileText, Eye, Download, Check, RefreshCw, X } from "lucide-vue-next";
import api from "../../utils/api";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const application = ref<any>(null);
const loading = ref(false);
const processing = ref(false);
const showApproveModal = ref(false);
const showRevisionModal = ref(false);
const showRejectModal = ref(false);
const moderationComment = ref("");

const studentData = computed(
  () => application.value?.application_data?.student || {}
);
const guardianData = computed(
  () => application.value?.application_data?.guardian || {}
);
const canModerate = computed(() =>
  ["pending", "needs_revision"].includes(application.value?.status)
);

onMounted(() => {
  loadApplication();
});

const loadApplication = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/admin/applications/${route.params.id}`);
    application.value = response.data;
  } catch (error) {
    console.error("Error loading application:", error);
    router.push("/admin/applications");
  } finally {
    loading.value = false;
  }
};

const getStudentFullName = () => {
  const s = studentData.value;
  return `${s.last_name} ${s.first_name} ${s.middle_name || ""}`.trim();
};

const getGuardianFullName = () => {
  const g = guardianData.value;
  return `${g.last_name} ${g.first_name} ${g.middle_name || ""}`.trim();
};

const getReviewerName = (reviewer: any) => {
  if (!reviewer) return "N/A";
  return `${reviewer.last_name} ${reviewer.first_name}`.trim();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const showDocumentModal = ref(false);
const documentPreviewUrl = ref("");
const currentDocumentKey = ref("");

const viewDocument = async (documentKey: string) => {
  try {
    const response = await api.get(
      `/admin/applications/${application.value.id}/documents/${documentKey}/view`,
      { responseType: "blob" }
    );

    // Получаем MIME type из response headers или из blob
    const contentType = response.headers['content-type'] || response.data.type;

    // Создаем blob с правильным MIME type
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    documentPreviewUrl.value = url;
    currentDocumentKey.value = documentKey;
    showDocumentModal.value = true;
  } catch (error) {
    console.error("Error viewing document:", error);
    alert(t("errorLoadingDocument"));
  }
};

const closeDocumentModal = () => {
  showDocumentModal.value = false;
  if (documentPreviewUrl.value) {
    window.URL.revokeObjectURL(documentPreviewUrl.value);
    documentPreviewUrl.value = "";
  }
  currentDocumentKey.value = "";
};

const downloadDocument = async (documentKey: string) => {
  try {
    const response = await api.get(
      `/admin/applications/${application.value.id}/documents/${documentKey}/download`,
      { responseType: "blob" }
    );

    // Получаем MIME type и создаем blob с правильным типом
    const contentType = response.headers['content-type'] || response.data.type;
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    // Определяем расширение файла на основе MIME type
    let extension = 'pdf';
    if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
      extension = 'jpg';
    } else if (contentType.includes('image/png')) {
      extension = 'png';
    }

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${documentKey}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading document:", error);
    alert(t("errorDownloadingDocument"));
  }
};

const approveApplication = async () => {
  processing.value = true;
  try {
    await api.post(`/admin/applications/${application.value.id}/approve`, {
      comment: moderationComment.value,
    });
    showApproveModal.value = false;
    moderationComment.value = "";
    await loadApplication();
    alert(t("applicationApproved"));
  } catch (error: any) {
    alert(error.response?.data?.message || t("errorProcessingRequest"));
  } finally {
    processing.value = false;
  }
};

const requestRevision = async () => {
  if (!moderationComment.value.trim()) return;

  processing.value = true;
  try {
    await api.post(
      `/admin/applications/${application.value.id}/request-revision`,
      {
        comment: moderationComment.value,
      }
    );
    showRevisionModal.value = false;
    moderationComment.value = "";
    await loadApplication();
    alert(t("revisionRequested"));
  } catch (error: any) {
    alert(error.response?.data?.message || t("errorProcessingRequest"));
  } finally {
    processing.value = false;
  }
};

const rejectApplication = async () => {
  if (!moderationComment.value.trim()) return;

  processing.value = true;
  try {
    await api.post(`/admin/applications/${application.value.id}/reject`, {
      comment: moderationComment.value,
    });
    showRejectModal.value = false;
    moderationComment.value = "";
    await loadApplication();
    alert(t("applicationRejected"));
  } catch (error: any) {
    alert(error.response?.data?.message || t("errorProcessingRequest"));
  } finally {
    processing.value = false;
  }
};

const goBack = () => {
  router.push("/admin/applications");
};
</script>

<style scoped>
.application-details {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-header h1 {
  flex: 1;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.status-badge-large {
  padding: 0.75rem 1.5rem;
  border-radius: 24px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge-large.pending {
  background: #feebc8;
  color: #7c2d12;
}

.status-badge-large.approved {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge-large.rejected {
  background: #feb2b2;
  color: #742a2a;
}

.status-badge-large.needs_revision {
  background: #fed7aa;
  color: #92400e;
}

.content-grid {
  display: grid;
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #718096;
}

.info-item .value {
  font-size: 1rem;
  color: #1a202c;
}

.pin-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  background: #edf2f7;
  color: #2d3748;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
}

.documents-grid {
  display: grid;
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  gap: 1rem;
  @media (width <= 992px) {
    grid-template-columns: repeat(1, minmax(200px, 1fr));
  }
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.document-icon {
  font-size: 2rem;
}

.document-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.document-info strong {
  font-size: 0.875rem;
  color: #2d3748;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view-doc,
.btn-download {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-view-doc {
  background: #48bb78;
  color: white;
}

.btn-view-doc:hover {
  background: #38a169;
}

.btn-download {
  background: #667eea;
  color: white;
}

.btn-download:hover {
  background: #5568d3;
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  background: #667eea;
  border-radius: 50%;
  margin-top: 0.375rem;
  position: relative;
}

.timeline-marker::after {
  content: "";
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 40px;
  background: #e2e8f0;
}

.timeline-item:last-child .timeline-marker::after {
  display: none;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.action-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.action-badge.approved {
  background: #c6f6d5;
  color: #22543d;
}

.action-badge.rejected {
  background: #feb2b2;
  color: #742a2a;
}

.action-badge.revision_requested {
  background: #fed7aa;
  color: #92400e;
}

.action-badge.resubmitted {
  background: #bee3f8;
  color: #2c5282;
}

.timeline-date {
  font-size: 0.75rem;
  color: #718096;
}

.timeline-reviewer {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.timeline-comment {
  font-size: 0.875rem;
  color: #2d3748;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.admin-comment {
  padding: 1rem;
  background: #fef5e7;
  border-left: 4px solid #f39c12;
  border-radius: 6px;
  color: #744210;
  line-height: 1.6;
}

.actions-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.actions-card h2 {
  color: white;
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.btn-action {
  padding: 1rem;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: white;
}

.btn-action:hover {
  background: white;
  transform: translateY(-2px);
}

.btn-action.btn-approve:hover {
  color: #22543d;
}

.btn-action.btn-revision:hover {
  color: #92400e;
}

.btn-action.btn-reject:hover {
  color: #742a2a;
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

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
}

.modal h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.modal p {
  color: #4a5568;
  margin-bottom: 1rem;
}

.modal textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 1.5rem;
}

.modal textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-cancel:hover {
  background: #cbd5e0;
}

.btn-confirm {
  background: #667eea;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #5568d3;
}

.btn-confirm.btn-danger {
  background: #f56565;
}

.btn-confirm.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.guardian-type {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
}

.guardian-type .label {
  font-weight: 600;
  color: #4a5568;
}

.guardian-type .value {
  color: #1a202c;
  font-weight: 600;
}

.modal-document {
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
</style>
