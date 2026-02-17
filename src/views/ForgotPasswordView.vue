<template>
  <div class="card">
    <h3>{{ $t('forgotPassword.title') }}</h3>

    <!-- Шаг 1: Ввод PIN -->
    <div v-if="step === 1">
      <p style="color: #666; margin-bottom: 16px;">
        {{ $t('forgotPassword.step1Description') }}
      </p>
      <label>{{ $t('forgotPassword.pinLabel') }}</label>
      <input
        v-model="pin"
        :placeholder="$t('forgotPassword.pinPlaceholder')"
        maxlength="14"
        @keyup.enter="sendCode"
      />
      <button @click="sendCode" :disabled="loading">
        {{ loading ? $t('forgotPassword.sending') : $t('forgotPassword.sendCodeButton') }}
      </button>
      <div v-if="maskedEmail" style="color: #28a745; margin-top: 8px;">
        {{ $t('forgotPassword.codeSentTo', { email: maskedEmail }) }}
      </div>
      <div v-if="error" class="error" style="margin-top: 8px;">{{ error }}</div>
      <RouterLink to="/login" style="display: block; margin-top: 16px; color: #007bff;">
        {{ $t('forgotPassword.backToLogin') }}
      </RouterLink>
    </div>

    <!-- Шаг 2: Ввод кода и нового пароля -->
    <div v-if="step === 2">
      <p style="color: #666; margin-bottom: 16px;">
        {{ $t('forgotPassword.step2Description') }}
      </p>
      <label>{{ $t('forgotPassword.codeLabel') }}</label>
      <input
        v-model="code"
        :placeholder="$t('forgotPassword.codePlaceholder')"
        maxlength="6"
        @keyup.enter="resetPassword"
      />
      <label>{{ $t('forgotPassword.newPasswordLabel') }}</label>
      <input
        v-model="password"
        type="password"
        :placeholder="$t('forgotPassword.newPasswordPlaceholder')"
        @keyup.enter="resetPassword"
      />
      <label>{{ $t('forgotPassword.confirmPasswordLabel') }}</label>
      <input
        v-model="passwordConfirmation"
        type="password"
        :placeholder="$t('forgotPassword.confirmPasswordPlaceholder')"
        @keyup.enter="resetPassword"
      />
      <button @click="resetPassword" :disabled="loading">
        {{ loading ? $t('forgotPassword.saving') : $t('forgotPassword.resetPasswordButton') }}
      </button>
      <button @click="goBackToStep1" style="background: #6c757d; margin-top: 8px;">
        {{ $t('forgotPassword.resendCode') }}
      </button>
      <div v-if="error" class="error" style="margin-top: 8px;">{{ error }}</div>
    </div>

    <!-- Шаг 3: Успех -->
    <div v-if="step === 3">
      <div style="color: #28a745; text-align: center; padding: 24px;">
        <h4>{{ $t('forgotPassword.successTitle') }}</h4>
        <p>{{ $t('forgotPassword.successMessage') }}</p>
        <RouterLink to="/login">
          <button style="margin-top: 16px;">{{ $t('forgotPassword.goToLogin') }}</button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const step = ref(1)
const pin = ref('')
const code = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const maskedEmail = ref('')
const error = ref('')
const loading = ref(false)

const sendCode = async () => {
  error.value = ''
  if (!pin.value || pin.value.length !== 14) {
    error.value = t('forgotPassword.pinValidation')
    return
  }

  loading.value = true
  try {
    const { data } = await api.post('/auth/forgot-password', { pin: pin.value })
    maskedEmail.value = data.email
    step.value = 2
  } catch (e: any) {
    error.value = e?.response?.data?.message || t('forgotPassword.sendCodeError')
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  error.value = ''

  if (!code.value || code.value.length !== 6) {
    error.value = t('forgotPassword.codeValidation')
    return
  }

  if (!password.value || password.value.length < 6) {
    error.value = t('forgotPassword.passwordValidation')
    return
  }

  if (password.value !== passwordConfirmation.value) {
    error.value = t('forgotPassword.passwordMismatch')
    return
  }

  loading.value = true
  try {
    await api.post('/auth/reset-password', {
      pin: pin.value,
      code: code.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    step.value = 3
  } catch (e: any) {
    error.value = e?.response?.data?.message || t('forgotPassword.resetPasswordError')
  } finally {
    loading.value = false
  }
}

const goBackToStep1 = () => {
  step.value = 1
  code.value = ''
  password.value = ''
  passwordConfirmation.value = ''
  error.value = ''
  maskedEmail.value = ''
}
</script>

<style scoped>
.card {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #555;
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  text-align: center;
}

h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

label {
  display: block;
  margin-top: 12px;
  margin-bottom: 4px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

button {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  font-size: 14px;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
