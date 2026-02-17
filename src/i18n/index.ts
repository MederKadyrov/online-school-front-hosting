import { createI18n } from 'vue-i18n'
import ru from '../locales/ru.json'
import ky from '../locales/ky.json'

// Получаем язык из localStorage или используем русский по умолчанию
const savedLocale = localStorage.getItem('locale') || 'ru'

const i18n = createI18n({
  legacy: false, // Используем Composition API
  locale: savedLocale, // Язык по умолчанию
  fallbackLocale: 'ru', // Запасной язык
  messages: {
    ru,
    ky
  },
  globalInjection: true // Позволяет использовать $t в шаблонах
})

export default i18n
