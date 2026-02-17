<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <div class="login-icon">🔐</div>
        <h1>{{ $t('login.title') }}</h1>
        <p class="subtitle">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Form -->
      <div class="login-form">
        <div class="form-group">
          <label class="form-label">{{ $t('login.pinLabel') }}</label>
          <input
            v-model="pin"
            class="form-input"
            :placeholder="$t('login.pinPlaceholder')"
            maxlength="14"
            @keyup.enter="doLogin"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('login.passwordLabel') }}</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="form-input"
              :placeholder="$t('login.passwordPlaceholder')"
              @keyup.enter="doLogin"
            />
            <button type="button" @click="showPassword = !showPassword" class="password-toggle">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button @click="doLogin" class="btn btn-primary btn-block" :disabled="!pin || !password">
          {{ $t('login.loginButton') }}
        </button>

        <div class="login-links">
          <RouterLink to="/forgot-password" class="link link-primary">
            {{ $t('login.forgotPassword') }}
          </RouterLink>
          <RouterLink to="/register-student" class="link link-success">
            {{ $t('login.registerStudent') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const { t } = useI18n()

const pin = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)
const router = useRouter()
const auth = useAuthStore()

const doLogin = async () => {
  if (!pin.value || !password.value) return

  error.value = ''
  try {
    await auth.login(pin.value, password.value)

    // Redirect based on role
    const role = auth.user?.role
    if (role === 'admin') {
      router.push('/admin/groups')
    } else if (role === 'teacher') {
      router.push('/teacher/courses')
    } else if (role === 'student') {
      router.push('/student/courses')
    } else {
      router.push('/')
    }
  } catch (e: any) {
    error.value = e?.data?.message || t('login.invalidCredentials')
  }
}
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  max-width: 450px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 24px;
  text-align: center;
}

.login-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  opacity: 0.95;
  font-size: 15px;
}

.login-form {
  padding: 32px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-weight: 600;
  font-size: 14px;
  color: #424242;
  margin-bottom: 8px;
  display: block;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  font-family: inherit;
  background: #f8f9fa;
  color: #212121;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: #fff;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .form-input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;
}

.password-toggle:hover {
  background: #e9ecef;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-error {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.login-links {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.link {
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-block;
}

.link:hover {
  transform: translateX(2px);
}

.link-primary {
  color: #667eea;
}

.link-primary:hover {
  color: #5568d3;
}

.link-success {
  color: #28a745;
}

.link-success:hover {
  color: #218838;
}

@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }

  .login-header {
    padding: 32px 20px;
  }

  .login-icon {
    font-size: 56px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-form {
    padding: 24px 20px;
  }
}
</style>
