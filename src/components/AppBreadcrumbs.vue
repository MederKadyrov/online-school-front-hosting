<template>
  <nav v-if="breadcrumbs.length > 0" class="breadcrumbs-container">
    <div class="breadcrumbs">
      <RouterLink to="/" class="breadcrumb-item home">
        <Home class="breadcrumb-icon" :size="16" />
        <span class="breadcrumb-label">Главная</span>
      </RouterLink>

      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <span class="breadcrumb-separator">›</span>

        <RouterLink
          v-if="crumb.path && index < breadcrumbs.length - 1"
          :to="crumb.path"
          class="breadcrumb-item"
        >
          <component :is="getIcon(crumb.icon)" v-if="crumb.icon" class="breadcrumb-icon" :size="16" />
          <span class="breadcrumb-label">{{ crumb.label }}</span>
        </RouterLink>

        <span v-else class="breadcrumb-item active">
          <component :is="getIcon(crumb.icon)" v-if="crumb.icon" class="breadcrumb-icon" :size="16" />
          <span class="breadcrumb-label">{{ crumb.label }}</span>
        </span>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home } from 'lucide-vue-next'
import { useBreadcrumb } from '../composables/useBreadcrumb'
import { getIcon } from '../utils/icons'

const route = useRoute()
const { getBreadcrumb, dynamicBreadcrumbs } = useBreadcrumb()

interface Breadcrumb {
  label: string
  path?: string
  icon?: string
}

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const crumbs: Breadcrumb[] = []

  // Получаем все matched routes (включая родительские)
  const matched = route.matched.filter(r => r.meta && r.meta.breadcrumb)

  matched.forEach((record) => {
    const meta = record.meta

    // Если breadcrumb - это массив (иерархия)
    if (Array.isArray(meta.breadcrumb)) {
      const breadcrumbArray = meta.breadcrumb as any[]
      breadcrumbArray.forEach((bc: any, index: number) => {
        // Для последнего элемента проверяем динамический breadcrumb текущего пути
        if (index === breadcrumbArray.length - 1) {
          const dynamicCrumb = getBreadcrumb(route.path)
          if (dynamicCrumb) {
            crumbs.push(dynamicCrumb)
            return
          }
        }

        // Проверяем динамические breadcrumbs для промежуточных путей
        if (bc.path) {
          const dynamicCrumb = getBreadcrumb(bc.path)
          if (dynamicCrumb) {
            crumbs.push(dynamicCrumb)
            return
          }
        } else if (bc.icon) {
          // Если нет path, ищем динамический breadcrumb по иконке
          // Проверяем все сохраненные breadcrumbs
          const allDynamic = Array.from(dynamicBreadcrumbs.value.entries())

          // Ищем по иконке и типу пути
          let found = null
          if (bc.icon === 'journal') {
            // Ищем breadcrumb курса
            found = allDynamic.find(([path, crumb]) => {
              return crumb.icon === 'journal' && path.startsWith('/student/courses/')
            })
          } else if (bc.icon === 'paragraph') {
            // Ищем breadcrumb параграфа
            found = allDynamic.find(([path, crumb]) => {
              return crumb.icon === 'paragraph' && path.startsWith('/student/paragraphs/')
            })
          }

          if (found) {
            crumbs.push(found[1])
            return
          }
        }

        crumbs.push(bc)
      })
    }
    // Если breadcrumb - это функция, вызываем её с route
    else if (typeof meta.breadcrumb === 'function') {
      const result = meta.breadcrumb(route)
      if (result) {
        crumbs.push(result)
      }
    }
    // Если breadcrumb - это объект
    else if (typeof meta.breadcrumb === 'object') {
      // Проверяем динамический breadcrumb для текущего пути
      const dynamicCrumb = getBreadcrumb(route.path)
      if (dynamicCrumb && record.path === route.path) {
        crumbs.push(dynamicCrumb)
      } else {
        crumbs.push(meta.breadcrumb as Breadcrumb)
      }
    }
    // Если breadcrumb - это строка
    else if (typeof meta.breadcrumb === 'string') {
      crumbs.push({
        label: meta.breadcrumb,
        path: record.path,
      })
    }
  })

  return crumbs
})
</script>

<style scoped>
.breadcrumbs-container {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 0;
  position: sticky;
  top: 64px;
  z-index: 100;
}

.breadcrumbs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  text-decoration: none;
  color: #424242;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.breadcrumb-item:not(.active):hover {
  background: #f5f5f5;
  color: #2196f3;
}

.breadcrumb-item.home {
  color: #757575;
}

.breadcrumb-item.active {
  color: #2196f3;
  font-weight: 600;
  cursor: default;
}

.breadcrumb-icon {
  flex-shrink: 0;
}

.breadcrumb-label {
  line-height: 1;
}

.breadcrumb-separator {
  color: #bdbdbd;
  font-size: 16px;
  user-select: none;
}

/* Mobile */
@media (max-width: 768px) {
  .breadcrumbs-container {
    padding: 8px 0;
  }

  .breadcrumbs {
    padding: 0 16px;
    gap: 4px;
  }

  .breadcrumb-item {
    padding: 4px 8px;
    font-size: 13px;
  }

  .breadcrumb-label {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .breadcrumb-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
