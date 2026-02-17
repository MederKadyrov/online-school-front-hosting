import { ref } from 'vue'

interface BreadcrumbItem {
  label: string
  icon?: string
  path?: string
}

// Глобальное реактивное состояние для динамических breadcrumbs
const dynamicBreadcrumbs = ref<Map<string, BreadcrumbItem>>(new Map())

export function useBreadcrumb() {
  /**
   * Установить динамический breadcrumb для текущего маршрута
   * @param routePath - путь маршрута (например, '/teacher/courses/1/edit')
   * @param breadcrumb - данные breadcrumb
   */
  const setBreadcrumb = (routePath: string, breadcrumb: BreadcrumbItem) => {
    dynamicBreadcrumbs.value.set(routePath, breadcrumb)
  }

  /**
   * Получить динамический breadcrumb для маршрута
   * @param routePath - путь маршрута
   */
  const getBreadcrumb = (routePath: string): BreadcrumbItem | undefined => {
    return dynamicBreadcrumbs.value.get(routePath)
  }

  /**
   * Очистить динамический breadcrumb для маршрута
   * @param routePath - путь маршрута
   */
  const clearBreadcrumb = (routePath: string) => {
    dynamicBreadcrumbs.value.delete(routePath)
  }

  /**
   * Очистить все динамические breadcrumbs
   */
  const clearAllBreadcrumbs = () => {
    dynamicBreadcrumbs.value.clear()
  }

  return {
    dynamicBreadcrumbs,
    setBreadcrumb,
    getBreadcrumb,
    clearBreadcrumb,
    clearAllBreadcrumbs
  }
}
