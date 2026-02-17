# Руководство по использованию мультиязычности (i18n)

## Обзор

Приложение поддерживает два языка:
- **Русский (ru)** - язык по умолчанию
- **Кыргызский (ky)**

## Структура файлов

```
src/
├── locales/          # Файлы переводов
│   ├── ru.json       # Русские переводы
│   └── ky.json       # Кыргызские переводы
├── i18n/
│   └── index.ts      # Конфигурация Vue I18n
└── components/
    └── LanguageSwitcher.vue  # Компонент переключателя языка
```

## Использование переводов во Vue компонентах

### 1. В template (шаблоне)

```vue
<template>
  <div>
    <!-- Использование $t для переводов -->
    <h1>{{ $t('common.save') }}</h1>
    <button>{{ $t('common.cancel') }}</button>
  </div>
</template>
```

### 2. В script setup

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Использование функции t() для переводов
const message = t('common.success')
console.log(t('auth.welcomeBack'))
</script>
```

### 3. Переводы с параметрами

В файле локализации:
```json
{
  "greeting": "Привет, {name}!"
}
```

В компоненте:
```vue
<template>
  <p>{{ $t('greeting', { name: userName }) }}</p>
</template>
```

## Добавление новых переводов

### 1. Добавьте ключи в оба файла локализации

**src/locales/ru.json:**
```json
{
  "mySection": {
    "title": "Мой заголовок",
    "description": "Моё описание"
  }
}
```

**src/locales/ky.json:**
```json
{
  "mySection": {
    "title": "Менин башы",
    "description": "Менин сүрөттөмө"
  }
}
```

### 2. Используйте в компоненте

```vue
<template>
  <h1>{{ $t('mySection.title') }}</h1>
  <p>{{ $t('mySection.description') }}</p>
</template>
```

## Переключение языка

Компонент `LanguageSwitcher` уже добавлен в навигацию. При переключении языка:
1. Сохраняется выбор в localStorage
2. Устанавливается новая локаль
3. Страница перезагружается для применения изменений
4. Отправляется заголовок `Accept-Language` на сервер

## Backend (Laravel)

### Middleware

Middleware `SetLocale` автоматически устанавливает локаль на основе заголовка `Accept-Language`.

### Файлы переводов

```
lang/
├── ru/
│   └── messages.php   # Русские сообщения
└── ky/
    └── messages.php   # Кыргызские сообщения
```

### Использование в контроллерах

```php
// Использование переводов
return response()->json([
    'message' => __('messages.grade_set_successfully')
]);

// С параметрами
return response()->json([
    'message' => __('messages.user_created', ['name' => $user->name])
]);
```

## Примеры из проекта

### Журнал оценок
```vue
<template>
  <h1>{{ $t('journal.title') }}</h1>
  <button>{{ $t('journal.export') }}</button>

  <table>
    <th>{{ $t('journal.student') }}</th>
    <th>{{ $t('journal.yearlyGrade') }}</th>
    <th>{{ $t('journal.examGrade') }}</th>
  </table>
</template>
```

### Навигация
```vue
<template>
  <nav>
    <RouterLink to="/courses">
      {{ $t('nav.courses') }}
    </RouterLink>
    <RouterLink to="/journal">
      {{ $t('nav.journal') }}
    </RouterLink>
  </nav>
</template>
```

## Рекомендации

1. **Структура ключей**: Используйте понятную иерархию:
   - `common.*` - общие элементы (кнопки, действия)
   - `auth.*` - авторизация
   - `nav.*` - навигация
   - `journal.*` - журнал
   - и т.д.

2. **Единообразие**: Сохраняйте одинаковую структуру в обоих файлах локализации

3. **Проверка**: Всегда проверяйте переводы на обоих языках

4. **Комментарии**: Добавляйте комментарии для сложных переводов

5. **Значения по умолчанию**: Если перевод не найден, будет показан ключ

## Тестирование

1. Откройте приложение
2. Найдите переключатель языка в правом верхнем углу
3. Нажмите "Русский" или "Кыргызча"
4. Убедитесь, что интерфейс переключился

## Troubleshooting

### Переводы не отображаются
- Проверьте правильность ключа в файлах локализации
- Убедитесь, что ключ существует в обоих языковых файлах
- Проверьте консоль браузера на наличие ошибок

### Язык не сохраняется
- Проверьте localStorage в браузере
- Убедитесь, что middleware SetLocale зарегистрирован

### Сервер не получает язык
- Проверьте заголовок Accept-Language в Network tab
- Убедитесь, что Axios interceptor настроен правильно
