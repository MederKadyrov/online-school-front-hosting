<template>
  <div class="language-switcher">
    <button
      @click="toggleLocale"
      class="lang-btn"
    >
      {{ currentLocaleName }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

const currentLocaleName = computed(() => {
  return currentLocale.value === 'ru' ? 'RU' : 'KG'
})

const toggleLocale = () => {
  const newLocale = currentLocale.value === 'ru' ? 'ky' : 'ru'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
  // Перезагружаем страницу для применения изменений во всех компонентах
  window.location.reload()
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lang-btn {
  padding: 11px 6px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  color: #3b82f6;
  font-weight: bold;
}

.lang-btn:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
</style>
