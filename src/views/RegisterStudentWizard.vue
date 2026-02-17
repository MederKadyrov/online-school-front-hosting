<template>
  <div class="registration-container">
    <div class="registration-card">
      <!-- Header -->
      <div class="registration-header">
        <h1>{{ $t('studentRegistration.title') }}</h1>
        <p class="subtitle">{{ $t('studentRegistration.subtitle') }}</p>
      </div>

      <!-- Индикатор шагов -->
      <div class="steps-indicator">
        <div :class="['step-item', step===1 && 'active']">
          <div class="step-circle">
            <span class="step-icon">👤</span>
          </div>
          <span class="step-label">{{ $t('studentRegistration.step1Label') }}</span>
        </div>
        <div class="step-line"></div>
        <div :class="['step-item', step===2 && 'active']">
          <div class="step-circle">
            <span class="step-icon">📄</span>
          </div>
          <span class="step-label">{{ $t('studentRegistration.step2Label') }}</span>
        </div>
      </div>

      <!-- Шаг 1 -->
      <div v-if="step===1" class="step-content">
        <div class="section">
          <h2 class="section-title">{{ $t('studentRegistration.guardianSection') }}</h2>

          <div class="form-group">
            <label class="form-label">{{ $t('studentRegistration.guardianTypeLabel') }}</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" value="parent" v-model="guardianType" class="radio-input" />
                <span>{{ $t('studentRegistration.parent') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" value="representative" v-model="guardianType" class="radio-input" />
                <span>{{ $t('studentRegistration.representative') }}</span>
              </label>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.lastName') }} <span class="required">*</span></label>
              <input
                v-model="g.last_name"
                :class="['form-input', errors['guardian.last_name'] && 'input-error']"
                :placeholder="$t('studentRegistration.lastNamePlaceholder')"
              />
              <small class="error-message" v-if="errors['guardian.last_name']">{{ errors['guardian.last_name'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.firstName') }} <span class="required">*</span></label>
              <input
                v-model="g.first_name"
                :class="['form-input', errors['guardian.first_name'] && 'input-error']"
                :placeholder="$t('studentRegistration.firstNamePlaceholder')"
              />
              <small class="error-message" v-if="errors['guardian.first_name']">{{ errors['guardian.first_name'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.middleName') }}</label>
              <input
                v-model="g.middle_name"
                :class="['form-input', errors['guardian.middle_name'] && 'input-error']"
                :placeholder="$t('studentRegistration.middleNamePlaceholder')"
              />
              <small class="error-message" v-if="errors['guardian.middle_name']">{{ errors['guardian.middle_name'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.pin') }} <span class="required">*</span></label>
              <input
                v-model="g.pin"
                :class="['form-input', (errors['guardian.pin'] || guardianPinError) && 'input-error']"
                placeholder="00000000000000"
                maxlength="14"
              />
              <small class="error-message" v-if="errors['guardian.pin']">{{ errors['guardian.pin'] }}</small>
              <small class="error-message" v-if="guardianPinError">{{ guardianPinError }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.sex') }} <span class="required">*</span></label>
              <select
                v-model="g.sex"
                :class="['form-input', errors['guardian.sex'] && 'input-error']"
              >
                <option value="male">{{ $t('studentRegistration.male') }}</option>
                <option value="female">{{ $t('studentRegistration.female') }}</option>
              </select>
              <small class="error-message" v-if="errors['guardian.sex']">{{ errors['guardian.sex'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.citizenship') }} <span class="required">*</span></label>
              <select
                v-model="g.citizenship"
                :class="['form-input', errors['guardian.citizenship'] && 'input-error']"
              >
                <option value="">{{ $t('studentRegistration.selectCountry') }}</option>
                <option value="KG">{{ $t('studentRegistration.kyrgyzstan') }}</option>
                <option value="RU">{{ $t('studentRegistration.russia') }}</option>
                <option value="UZ">{{ $t('studentRegistration.uzbekistan') }}</option>
                <option value="TJ">{{ $t('studentRegistration.tajikistan') }}</option>
                <option value="KZ">{{ $t('studentRegistration.kazakhstan') }}</option>
                <option v-for="country in otherCountries" :key="country.code" :value="country.code">
                  {{ country.name }}
                </option>
              </select>
              <small class="error-message" v-if="errors['guardian.citizenship']">{{ errors['guardian.citizenship'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.phone') }} <span class="required">*</span></label>
              <input
                v-model="g.phone"
                :class="['form-input', errors['guardian.phone'] && 'input-error']"
                placeholder="+996 XXX XXX XXX"
              />
              <small class="error-message" v-if="errors['guardian.phone']">{{ errors['guardian.phone'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.email') }}</label>
              <input
                type="email"
                v-model="g.email"
                :class="['form-input', errors['guardian.email'] && 'input-error']"
                placeholder="example@mail.com"
              />
              <small class="error-message" v-if="errors['guardian.email']">{{ errors['guardian.email'] }}</small>
            </div>

            <div class="form-group form-group-full">
              <label class="form-label">{{ $t('studentRegistration.address') }} <span class="required">*</span></label>
              <input
                v-model="g.address"
                :class="['form-input', errors['guardian.address'] && 'input-error']"
                :placeholder="$t('studentRegistration.addressPlaceholder')"
              />
              <small class="error-message" v-if="errors['guardian.address']">{{ errors['guardian.address'] }}</small>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">{{ $t('studentRegistration.studentSection') }}</h2>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.lastName') }} <span class="required">*</span></label>
              <input
                v-model="s.last_name"
                :class="['form-input', errors['student.last_name'] && 'input-error']"
                :placeholder="$t('studentRegistration.lastNamePlaceholder')"
              />
              <small class="error-message" v-if="errors['student.last_name']">{{ errors['student.last_name'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.firstName') }} <span class="required">*</span></label>
              <input
                v-model="s.first_name"
                :class="['form-input', errors['student.first_name'] && 'input-error']"
                :placeholder="$t('studentRegistration.firstNamePlaceholder')"
              />
              <small class="error-message" v-if="errors['student.first_name']">{{ errors['student.first_name'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.middleName') }}</label>
              <input
                v-model="s.middle_name"
                :class="['form-input', errors['student.middle_name'] && 'input-error']"
                :placeholder="$t('studentRegistration.middleNamePlaceholder')"
              />
              <small class="error-message" v-if="errors['student.middle_name']">{{ errors['student.middle_name'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.studentPin') }} <span class="required">*</span></label>
              <input
                v-model="s.pin"
                :class="['form-input', (errors['student.pin'] || studentPinError) && 'input-error']"
                placeholder="00000000000000"
                maxlength="14"
              />
              <small class="error-message" v-if="errors['student.pin']">{{ errors['student.pin'] }}</small>
              <small class="error-message" v-if="studentPinError">{{ studentPinError }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.sex') }} <span class="required">*</span></label>
              <select
                v-model="s.sex"
                :class="['form-input', errors['student.sex'] && 'input-error']"
              >
                <option value="male">{{ $t('studentRegistration.male') }}</option>
                <option value="female">{{ $t('studentRegistration.female') }}</option>
              </select>
              <small class="error-message" v-if="errors['student.sex']">{{ errors['student.sex'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.citizenship') }} <span class="required">*</span></label>
              <select
                v-model="s.citizenship"
                :class="['form-input', errors['student.citizenship'] && 'input-error']"
              >
                <option value="">{{ $t('studentRegistration.selectCountry') }}</option>
                <option value="KG">{{ $t('studentRegistration.kyrgyzstan') }}</option>
                <option value="RU">{{ $t('studentRegistration.russia') }}</option>
                <option value="UZ">{{ $t('studentRegistration.uzbekistan') }}</option>
                <option value="TJ">{{ $t('studentRegistration.tajikistan') }}</option>
                <option value="KZ">{{ $t('studentRegistration.kazakhstan') }}</option>
                <option v-for="country in otherCountries" :key="country.code" :value="country.code">
                  {{ country.name }}
                </option>
              </select>
              <small class="error-message" v-if="errors['student.citizenship']">{{ errors['student.citizenship'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.birthDate') }} <span class="required">*</span></label>
              <input
                type="text"
                :value="birthDateDisplay"
                @input="onBirthDateInput"
                :class="['form-input', errors['student.birth_date'] && 'input-error']"
                placeholder="ДД/ММ/ГГГГ"
                maxlength="10"
              />
              <small class="error-message" v-if="errors['student.birth_date']">{{ errors['student.birth_date'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.level') }} <span class="required">*</span></label>
              <select
                v-model.number="level_id"
                :class="['form-input', errors['student.level_id'] && 'input-error']"
              >
                <option :value="0">{{ $t('studentRegistration.selectLevel') }}</option>
                <option v-for="lv in levels" :key="lv.id" :value="lv.id">
                  {{ lv.title || (lv.number + ' ' + $t('studentRegistration.class')) }}
                </option>
              </select>
              <small class="error-message" v-if="errors['student.level_id']">{{ errors['student.level_id'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.phone') }}</label>
              <input
                v-model="s.phone"
                :class="['form-input', errors['student.phone'] && 'input-error']"
                placeholder="+996 XXX XXX XXX"
              />
              <small class="error-message" v-if="errors['student.phone']">{{ errors['student.phone'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.email') }}</label>
              <input
                type="email"
                v-model="s.email"
                :class="['form-input', errors['student.email'] && 'input-error']"
                placeholder="example@mail.com"
              />
              <small class="error-message" v-if="errors['student.email']">{{ errors['student.email'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.password') }} <span class="required">*</span></label>
              <div class="password-input-wrapper">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="s.password"
                  :class="['form-input', errors['student.password'] && 'input-error']"
                  :placeholder="$t('studentRegistration.passwordPlaceholder')"
                />
                <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <small class="error-message" v-if="errors['student.password']">{{ errors['student.password'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.passwordConfirmation') }} <span class="required">*</span></label>
              <div class="password-input-wrapper">
                <input
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  v-model="s.password_confirmation"
                  :class="['form-input', errors['student.password_confirmation'] && 'input-error']"
                  :placeholder="$t('studentRegistration.repeatPassword')"
                />
                <button type="button" @click="showPasswordConfirm = !showPasswordConfirm" class="password-toggle">
                  {{ showPasswordConfirm ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <small class="error-message" v-if="errors['student.password_confirmation']">{{ errors['student.password_confirmation'] }}</small>
            </div>

            <div class="form-group form-group-full">
              <label class="form-label">{{ $t('studentRegistration.studentPhoto') }}</label>
              <div class="file-upload-wrapper">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  @change="handlePhotoChange"
                  :class="['form-input file-input', errors['student_photo'] && 'input-error']"
                  id="photo-upload"
                />
                <label for="photo-upload" class="file-label">
                  <span v-if="!studentPhotoPreview">📷 {{ $t('studentRegistration.selectPhoto') }}</span>
                  <span v-else>✓ {{ $t('studentRegistration.photoSelected') }}</span>
                </label>
              </div>
              <small class="error-message" v-if="errors['student_photo']">{{ errors['student_photo'] }}</small>
              <div v-if="studentPhotoPreview" class="photo-preview">
                <img :src="studentPhotoPreview" alt="Preview" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="error1" class="alert alert-error">{{ error1 }}</div>

        <div class="form-actions">
          <button @click="goStep2" class="btn btn-primary btn-large">
            {{ $t('studentRegistration.nextStep') }}
            <span class="btn-icon">→</span>
          </button>
        </div>
      </div>

      <!-- Шаг 2 -->
      <div v-else class="step-content">
        <div class="section">
          <h2 class="section-title">{{ $t('studentRegistration.documentsSection') }}</h2>
          <p class="section-description">{{ $t('studentRegistration.documentsDescription') }}</p>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.guardianApplication') }} <span class="required">*</span></label>
              <div class="file-upload-box">
                <input
                  type="file"
                  @change="pick('guardian_application',$event)"
                  accept=".jpg,.jpeg,.png,.pdf"
                  :id="'file-guardian-app'"
                  class="file-input-hidden"
                />
                <label :for="'file-guardian-app'" class="file-upload-label">
                  <span class="file-icon">📄</span>
                  <span class="file-text">{{ files.guardian_application ? files.guardian_application.name : $t('studentRegistration.selectFile') }}</span>
                </label>
              </div>
              <small class="error-message" v-if="errors['guardian_application']">{{ errors['guardian_application'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.guardianPassport') }} <span class="required">*</span></label>
              <div class="file-upload-box">
                <input
                  type="file"
                  @change="pick('guardian_passport',$event)"
                  accept=".jpg,.jpeg,.png,.pdf"
                  :id="'file-guardian-pass'"
                  class="file-input-hidden"
                />
                <label :for="'file-guardian-pass'" class="file-upload-label">
                  <span class="file-icon">📄</span>
                  <span class="file-text">{{ files.guardian_passport ? files.guardian_passport.name : $t('studentRegistration.selectFile') }}</span>
                </label>
              </div>
              <small class="error-message" v-if="errors['guardian_passport']">{{ errors['guardian_passport'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.birthCertificate') }} <span class="required">*</span></label>
              <div class="file-upload-box">
                <input
                  type="file"
                  @change="pick('birth_certificate',$event)"
                  accept=".jpg,.jpeg,.png,.pdf"
                  :id="'file-birth-cert'"
                  class="file-input-hidden"
                />
                <label :for="'file-birth-cert'" class="file-upload-label">
                  <span class="file-icon">📄</span>
                  <span class="file-text">{{ files.birth_certificate ? files.birth_certificate.name : $t('studentRegistration.selectFile') }}</span>
                </label>
              </div>
              <small class="error-message" v-if="errors['birth_certificate']">{{ errors['birth_certificate'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.studentPinDoc') }} <span class="required">*</span></label>
              <div class="file-upload-box">
                <input
                  type="file"
                  @change="pick('student_pin_doc',$event)"
                  accept=".jpg,.jpeg,.png,.pdf"
                  :id="'file-pin-doc'"
                  class="file-input-hidden"
                />
                <label :for="'file-pin-doc'" class="file-upload-label">
                  <span class="file-icon">📄</span>
                  <span class="file-text">{{ files.student_pin_doc ? files.student_pin_doc.name : $t('studentRegistration.selectFile') }}</span>
                </label>
              </div>
              <small class="error-message" v-if="errors['student_pin_doc']">{{ errors['student_pin_doc'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.medicalCertificate') }}</label>
              <div class="file-upload-box">
                <input
                  type="file"
                  @change="pick('medical_certificate',$event)"
                  accept=".jpg,.jpeg,.png,.pdf"
                  :id="'file-medical'"
                  class="file-input-hidden"
                />
                <label :for="'file-medical'" class="file-upload-label">
                  <span class="file-icon">📄</span>
                  <span class="file-text">{{ files.medical_certificate ? files.medical_certificate.name : $t('studentRegistration.selectFile') }}</span>
                </label>
              </div>
              <small class="error-message" v-if="errors['medical_certificate']">{{ errors['medical_certificate'] }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('studentRegistration.previousSchoolRecord') }} <span class="required">*</span></label>
              <div class="file-upload-box">
                <input
                  type="file"
                  @change="pick('previous_school_record',$event)"
                  accept=".jpg,.jpeg,.png,.pdf"
                  :id="'file-prev-school'"
                  class="file-input-hidden"
                />
                <label :for="'file-prev-school'" class="file-upload-label">
                  <span class="file-icon">📄</span>
                  <span class="file-text">{{ files.previous_school_record ? files.previous_school_record.name : $t('studentRegistration.selectFile') }}</span>
                </label>
              </div>
              <small class="error-message" v-if="errors['previous_school_record']">{{ errors['previous_school_record'] }}</small>
            </div>
          </div>
        </div>

        <div v-if="error2" class="alert alert-error">{{ error2 }}</div>
        <div v-if="ok" class="alert alert-success">
          <strong>✓ {{ $t('studentRegistration.successTitle') }}</strong>
          <p>{{ $t('studentRegistration.successMessage') }}</p>
          <div v-if="registrationNumber" class="registration-number-display">
            <p><strong>{{ $t('yourRegistrationNumber') }}:</strong></p>
            <p class="registration-number-value">{{ registrationNumber }}</p>
            <p class="registration-number-hint">{{ $t('saveRegistrationNumber') }}</p>
          </div>
        </div>

        <div class="form-actions" v-if="!ok">
          <button @click="step=1" class="btn btn-secondary">
            <span class="btn-icon">←</span>
            {{ $t('studentRegistration.back') }}
          </button>
          <button @click="submitAll" :disabled="saving" class="btn btn-primary btn-large">
            {{ saving ? $t('studentRegistration.sending') : $t('studentRegistration.finishRegistration') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '../utils/api'
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const step = ref<1|2>(1)
const error1 = ref(''); const error2 = ref('')
const saving = ref(false); const ok = ref(false)
const registrationNumber = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

// Отображение даты рождения в формате ДД/ММ/ГГГГ
const birthDateDisplay = ref('')

function onBirthDateInput(e: Event) {
  const input = e.target as HTMLInputElement
  // Убираем всё кроме цифр
  let digits = input.value.replace(/\D/g, '')
  // Ограничиваем до 8 цифр (ДДММГГГГ)
  digits = digits.slice(0, 8)

  // Форматируем с разделителями
  let formatted = ''
  if (digits.length > 0) formatted = digits.slice(0, 2)
  if (digits.length > 2) formatted += '/' + digits.slice(2, 4)
  if (digits.length > 4) formatted += '/' + digits.slice(4, 8)

  birthDateDisplay.value = formatted
  input.value = formatted

  // Если введена полная дата, конвертируем в YYYY-MM-DD для отправки
  if (digits.length === 8) {
    const day = digits.slice(0, 2)
    const month = digits.slice(2, 4)
    const year = digits.slice(4, 8)
    s.value.birth_date = `${year}-${month}-${day}`
  } else {
    s.value.birth_date = ''
  }
}

// Парсинг данных из ПИН (ПЧЧММГГГГРНННК)
function parsePinData(pin: string): { sex: 'male' | 'female' | null; birthDate: string | null; birthDateDisplay: string | null } {
  if (!/^\d{14}$/.test(pin)) return { sex: null, birthDate: null, birthDateDisplay: null }

  const genderDigit = parseInt(pin[0])
  const sex: 'male' | 'female' | null = genderDigit === 2 ? 'male' : genderDigit === 1 ? 'female' : null

  const dd = pin.slice(1, 3)
  const mm = pin.slice(3, 5)
  const yyyy = pin.slice(5, 9)

  const day = parseInt(dd)
  const month = parseInt(mm)
  const year = parseInt(yyyy)

  // Валидация даты
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear()) {
    return { sex, birthDate: null, birthDateDisplay: null }
  }

  const dateObj = new Date(year, month - 1, day)
  if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
    return { sex, birthDate: null, birthDateDisplay: null }
  }

  return {
    sex,
    birthDate: `${yyyy}-${mm}-${dd}`,
    birthDateDisplay: `${dd}/${mm}/${yyyy}`
  }
}

const studentPinError = ref('')
const guardianPinError = ref('')

// Countries list
const otherCountries = [
  { code: 'AF', name: 'Афганистан' },
  { code: 'AM', name: 'Армения' },
  { code: 'AZ', name: 'Азербайджан' },
  { code: 'BY', name: 'Беларусь' },
  { code: 'CN', name: 'Китай' },
  { code: 'GE', name: 'Грузия' },
  { code: 'IN', name: 'Индия' },
  { code: 'IR', name: 'Иран' },
  { code: 'MD', name: 'Молдова' },
  { code: 'MN', name: 'Монголия' },
  { code: 'PK', name: 'Пакистан' },
  { code: 'TR', name: 'Турция' },
  { code: 'TM', name: 'Туркменистан' },
  { code: 'UA', name: 'Украина' },
  { code: 'US', name: 'США' },
  { code: 'DE', name: 'Германия' },
  { code: 'FR', name: 'Франция' },
  { code: 'GB', name: 'Великобритания' },
]

// уровни
const levels = ref<any[]>([])
const level_id = ref<number>(0)
async function loadLevels() {
  try {
    const { data } = await api.get('/levels')
    levels.value = data
  } catch (e) { console.error(e) }
}

// Индикатор типа законного представителя
const guardianType = ref<'parent'|'representative'>('parent')

// Родитель/представитель
const g = ref({
  last_name: '', first_name: '', middle_name: '',
  sex: 'female', citizenship: 'KG', pin: '', phone: '',
  address: '', email: '',
})

// Ученик
const s = ref({
  last_name: '', first_name: '', middle_name: '',
  sex: 'male', citizenship: 'KG', birth_date: '',
  pin: '',
  phone: '', email: '',
  password: '', password_confirmation: '',
  class_letter: ''
})

// Автозаполнение полей студента по ПИН
watch(() => s.value.pin, (pin) => {
  studentPinError.value = ''
  if (pin.length < 14) return

  const data = parsePinData(pin)

  if (data.sex) {
    s.value.sex = data.sex
  }

  if (data.birthDate && data.birthDateDisplay) {
    s.value.birth_date = data.birthDate
    birthDateDisplay.value = data.birthDateDisplay
  } else if (/^\d{14}$/.test(pin)) {
    studentPinError.value = t('studentRegistration.validation.invalidPinDate')
  }
})

// Автозаполнение пола родителя/опекуна по ПИН
watch(() => g.value.pin, (pin) => {
  guardianPinError.value = ''
  if (pin.length < 14) return

  const data = parsePinData(pin)

  if (data.sex) {
    g.value.sex = data.sex
  }

  if (/^\d{14}$/.test(pin) && (!data.sex || !data.birthDate)) {
    guardianPinError.value = t('studentRegistration.validation.invalidPinDate')
  }
})

// Фото студента
const studentPhotoFile = ref<File | null>(null)
const studentPhotoPreview = ref<string>('')

// Файлы
const files = ref<Record<string, File | null>>({
  guardian_application: null,
  birth_certificate: null,
  student_pin_doc: null,
  guardian_passport: null,
  medical_certificate: null,
  previous_school_record: null,
})

const errors = ref<Record<string,string>>({})
function setFieldError(field: string, msg: string) { errors.value[field] = msg }
function clearErrors() { errors.value = {} }

function pick(key: string, e: Event) {
  const input = e.target as HTMLInputElement
  files.value[key] = (input.files && input.files[0]) || null
}

function handlePhotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  studentPhotoFile.value = file

  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      studentPhotoPreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    studentPhotoPreview.value = ''
  }
}

function validateClient(): boolean {
  clearErrors()
  // guardian
  if (!g.value.last_name) setFieldError('guardian.last_name', t('studentRegistration.validation.required'))
  if (!g.value.first_name) setFieldError('guardian.first_name', t('studentRegistration.validation.required'))
  if (!['male','female'].includes(g.value.sex)) setFieldError('guardian.sex', t('studentRegistration.validation.selectSex'))
  if (!g.value.citizenship) setFieldError('guardian.citizenship', t('studentRegistration.validation.required'))
  if (!/^\d{14}$/.test(g.value.pin)) setFieldError('guardian.pin', t('studentRegistration.validation.pin14'))
  if (!g.value.phone) setFieldError('guardian.phone', t('studentRegistration.validation.required'))
  if (!g.value.address) setFieldError('guardian.address', t('studentRegistration.validation.required'))
  if (g.value.email && !g.value.email.includes('@')) setFieldError('guardian.email', t('studentRegistration.validation.invalidEmail'))

  // student
  if (!s.value.last_name) setFieldError('student.last_name', t('studentRegistration.validation.required'))
  if (!s.value.first_name) setFieldError('student.first_name', t('studentRegistration.validation.required'))
  if (!s.value.pin || !/^\d{14}$/.test(s.value.pin)) {
    setFieldError('student.pin', t('studentRegistration.validation.studentPin14'))
  }
  if (!['male','female'].includes(s.value.sex)) setFieldError('student.sex', t('studentRegistration.validation.selectSex'))
  if (!s.value.citizenship) setFieldError('student.citizenship', t('studentRegistration.validation.required'))
  if (!s.value.birth_date) setFieldError('student.birth_date', t('studentRegistration.validation.required'))
  if (!level_id.value) setFieldError('student.level_id', t('studentRegistration.validation.selectLevel'))
  if (s.value.email && !s.value.email.includes('@')) setFieldError('student.email', t('studentRegistration.validation.invalidEmail'))
  if (!s.value.password) setFieldError('student.password', t('studentRegistration.validation.enterPassword'))
  if (s.value.password !== s.value.password_confirmation) setFieldError('student.password_confirmation', t('studentRegistration.validation.passwordMismatch'))

  return Object.keys(errors.value).length === 0
}


// Валидация и переход на шаг 2
async function goStep2() {
  error1.value = ''
  try {
    if (!validateClient()) {
      throw new Error(t('studentRegistration.validation.fixErrors'))
    }
    // префлайт: серверная проверка 422/200 (204)
    const payload = {
      guardian_type: guardianType.value,
      guardian: g.value,
      student: { ...s.value, level_id: level_id.value }
    }
    await api.post('/auth/register-student-validate', payload) // 204 No Content

    step.value = 2 // только если сервер одобрил
  } catch (e:any) {
    // распарсим 422 от Laravel
    if (e?.status === 422 && e?.data?.errors) {
      for (const [field, msgs] of Object.entries(e.data.errors)) {
        setFieldError(String(field), (msgs as string[]).join(', '))
      }
      error1.value = t('studentRegistration.validation.checkFields')
    } else {
      error1.value = e?.data?.message || e?.message || t('studentRegistration.validation.validationError')
    }
  }
}


function validateDocuments(): boolean {
  clearErrors()
  let hasErrors = false

  // Проверяем все обязательные документы
  if (!files.value.guardian_application) {
    setFieldError('guardian_application', t('studentRegistration.validation.required'))
    hasErrors = true
  }
  if (!files.value.guardian_passport) {
    setFieldError('guardian_passport', t('studentRegistration.validation.required'))
    hasErrors = true
  }
  if (!files.value.birth_certificate) {
    setFieldError('birth_certificate', t('studentRegistration.validation.required'))
    hasErrors = true
  }
  if (!files.value.student_pin_doc) {
    setFieldError('student_pin_doc', t('studentRegistration.validation.required'))
    hasErrors = true
  }
  if (!files.value.previous_school_record) {
    setFieldError('previous_school_record', t('studentRegistration.validation.required'))
    hasErrors = true
  }

  return !hasErrors
}

// Отправка данных и файлов
async function submitAll() {
  error2.value = ''; ok.value = false; saving.value = true
  try {
    // Проверяем, что все документы загружены
    if (!validateDocuments()) {
      error2.value = t('studentRegistration.validation.uploadAllDocuments')
      saving.value = false
      return
    }

    // Собираем FormData: и данные шага 1, и файлы
    const fd = new FormData()

    // guardian[...]
    Object.entries(g.value).forEach(([k,v]) => {
      if (v !== undefined && v !== null) fd.append(`guardian[${k}]`, String(v))
    })
    fd.append('guardian_type', guardianType.value)

    // student[...]
    const studentPayload = { ...s.value, level_id: level_id.value }
    Object.entries(studentPayload).forEach(([k,v]) => {
      if (v !== undefined && v !== null) fd.append(`student[${k}]`, String(v))
    })

    // файлы
    for (const [k,v] of Object.entries(files.value)) {
      if (v) fd.append(k, v as Blob)
    }

    // фото студента
    if (studentPhotoFile.value) {
      fd.append('student_photo', studentPhotoFile.value)
    }

    const response = await api.post('/auth/register-student', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // Сохраняем регистрационный номер из ответа
    if (response.data.registration_number) {
      registrationNumber.value = response.data.registration_number
    }

    ok.value = true
  } catch (e:any) {
    if (e?.status === 422 && e?.data?.errors) {
      const messages = []
      for (const [field, msgs] of Object.entries(e.data.errors)) {
        messages.push(`${field}: ${(msgs as string[]).join(', ')}`)
      }
      error2.value = messages.join('\n')
    } else {
      error2.value = e?.data?.message || e?.message || t('studentRegistration.validation.submissionError')
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadLevels)
</script>

<style scoped>
.registration-container {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.registration-card {
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}

.registration-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  text-align: center;
}

.registration-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  opacity: 0.95;
  font-size: 16px;
}

/* Steps Indicator */
.steps-indicator {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.step-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.step-icon {
  font-size: 28px;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  text-align: center;
}

.step-item.active .step-label {
  color: #667eea;
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #dee2e6;
  margin: 0 16px;
  max-width: 100px;
}

/* Step Content */
.step-content {
  padding: 32px 24px;
}

/* Section */
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 8px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-description {
  color: #6c757d;
  margin-bottom: 20px;
  font-size: 14px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  font-size: 14px;
  color: #424242;
  margin-bottom: 6px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.required {
  color: #dc3545;
}

.form-input {
  padding: 12px 16px;
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

.form-input.input-error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 4px;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Password Toggle */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.password-input-wrapper .form-input {
  padding-right: 50px;
}

.password-toggle {
  /* position: absolute; */
  /* right: 12px; */
  /* top: 50%; */
  /* transform: translateY(-50%); */
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  /* padding: 4px 8px; */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;
}

.password-toggle:hover {
  scale: 1.1;
}

/* File Upload */
.file-upload-wrapper {
  position: relative;
}

.file-input {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

.file-label {
  display: inline-block;
  padding: 12px 24px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  width: 100%;
}

.file-label:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.photo-preview {
  margin-top: 12px;
}

.photo-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* File Upload Box (Step 2) */
.file-upload-box {
  position: relative;
}

.file-input-hidden {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-label:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.file-icon {
  font-size: 24px;
}

.file-text {
  flex: 1;
  color: #6c757d;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Alerts */
.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-error {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

.alert-success strong {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

.alert-success p {
  margin: 0;
  font-size: 14px;
}

.registration-number-display {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff;
  border: 2px solid #4caf50;
  border-radius: 8px;
}

.registration-number-display p {
  margin: 0.5rem 0;
}

.registration-number-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: monospace;
  color: #2e7d32;
  text-align: center;
  padding: 0.75rem;
  background: #f1f8e9;
  border-radius: 6px;
  letter-spacing: 2px;
}

.registration-number-hint {
  font-size: 0.875rem;
  color: #558b2f;
  font-style: italic;
  text-align: center;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
}

.btn-large {
  padding: 14px 32px;
  font-size: 16px;
}

.btn-icon {
  font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .registration-container {
    padding: 16px;
  }

  .registration-header {
    padding: 24px 16px;
  }

  .registration-header h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .steps-indicator {
    padding: 16px;
  }

  .step-circle {
    width: 48px;
    height: 48px;
  }

  .step-icon {
    font-size: 24px;
  }

  .step-label {
    font-size: 12px;
  }

  .step-line {
    margin: 0 8px;
    max-width: 40px;
  }

  .step-content {
    padding: 20px 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .step-label {
    display: none;
  }
}
</style>
