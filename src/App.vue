<template>
  <div class="app-root">
    <!-- Header -->
    <AppHeader
      :sidebar-open="sidebarOpen"
      :has-sidebar="hasSidebar"
      @toggle-sidebar="toggleSidebar"
      @logout="logout"
    />

    <!-- Breadcrumbs -->
    <AppBreadcrumbs v-if="isAuth" />

    <!-- Main Layout -->
    <div class="app-layout">
      <!-- Sidebar -->
      <aside
        v-if="hasSidebar"
        class="app-sidebar"
        :class="{
          open: sidebarOpen,
          collapsed: sidebarCollapsed
        }"
      >
        <div class="sidebar-content">
          <!-- User Info -->
          <div class="sidebar-user">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-info" v-if="!sidebarCollapsed">
              <div class="user-name">{{ userName }}</div>
              <div class="user-role">{{ userRoleLabel }}</div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="sidebar-nav">
            <RouterLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="nav-item"
              :title="item.label"
              @click="closeSidebarOnMobile"
            >
              <component :is="getIcon(item.icon)" class="nav-icon" :size="20" />
              <span class="nav-label" v-if="!sidebarCollapsed">{{ item.label }}</span>
            </RouterLink>
          </nav>

          <!-- Collapse button (desktop only) -->
          <div class="sidebar-footer">
            <button @click="toggleCollapse" class="btn-collapse" :title="sidebarCollapsed ? t('common.expand') : t('common.collapse')">
              <ArrowRight v-if="sidebarCollapsed" :size="18" />
              <ArrowLeft v-else :size="18" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      <div
        v-if="hasSidebar && sidebarOpen"
        class="sidebar-overlay"
        @click="closeSidebar"
      ></div>

      <!-- Main Content -->
      <main class="app-main" :class="{ 'with-sidebar': hasSidebar, 'sidebar-collapsed': sidebarCollapsed }">
        <router-view />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useI18n } from 'vue-i18n'
import AppBreadcrumbs from './components/AppBreadcrumbs.vue'
import AppHeader from './components/AppHeader.vue'
import api from './utils/api'
import { getIcon } from './utils/icons'
import { ArrowRight, ArrowLeft } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

// State
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

// Computed
const isAuth = computed(() => !!auth.token)
const userRole = computed(() => auth.user?.role || '')
const userName = computed(() => auth.user?.name || 'Пользователь')
const userInitial = computed(() => auth.user?.username?.charAt(0).toUpperCase() || 'U')

const userRoleLabel = computed(() => {
  const role = userRole.value
  if (role === 'admin') return t('menu.role.admin')
  if (role === 'teacher') return t('menu.role.teacher')
  if (role === 'student') return t('menu.role.student')
  return t('menu.role.user')
})

const hasSidebar = computed(() => {
  const role = userRole.value
  return role === 'admin' || role === 'teacher' || role === 'student'
})

// Menu items by role
const menuItems = computed(() => {
  const role = userRole.value

  if (role === 'admin') {
    return [
      { path: '/admin/groups', icon: 'school', label: t('menu.admin.groups') },
      { path: '/admin/students', icon: 'student', label: t('menu.admin.students') },
      { path: '/admin/applications', icon: 'applications', label: t('menu.admin.applications') },
      { path: '/admin/teachers', icon: 'teacher', label: t('menu.admin.teachers') },
      { path: '/admin/courses', icon: 'course', label: t('menu.admin.courses') },
      { path: '/admin/subjects', icon: 'course', label: t('menu.admin.subjects') },
      { path: '/admin/submissions', icon: 'edit', label: t('menu.admin.submissions') },
      { path: '/admin/journal', icon: 'journal', label: t('menu.admin.journal') },
      { path: '/admin/user-passwords', icon: 'password', label: t('menu.admin.passwords') },
    ]
  }

  if (role === 'teacher') {
    return [
      { path: '/teacher/courses', icon: 'course', label: t('menu.teacher.courses') },
      { path: '/teacher/submissions', icon: 'edit', label: t('menu.teacher.submissions') },
      { path: '/teacher/journal', icon: 'journal', label: t('menu.teacher.journal') },
      { path: '/teacher/profile', icon: 'profile', label: t('menu.teacher.profile') },
    ]
  }

  if (role === 'student') {
    return [
      { path: '/student/courses', icon: 'course', label: t('menu.student.courses') },
      { path: '/student/assignments', icon: 'assignment', label: t('menu.student.assignments') },
      { path: '/student/journal', icon: 'stats', label: t('menu.student.journal') },
      { path: '/student/profile', icon: 'profile', label: t('menu.student.profile') },
    ]
  }

  return []
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  if (window.innerWidth >= 1024) {
    // На desktop сохраняем состояние
    localStorage.setItem('sidebarOpen', sidebarOpen.value.toString())
  }
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    closeSidebar()
  }
}

const toggleCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
}

const logout = () => {
  auth.logout()
  router.push('/login')
}

// Restore sidebar state from localStorage
onMounted(async () => {
  // Загружаем данные пользователя при монтировании
  if (auth.token && !auth.user) {
    try {
      console.log('🔍 Checking token validity...')
      // Сначала проверим токен через debug endpoint
      try {
        const debugResponse = await api.get('/debug/token')
        console.log('✅ Token is valid:', debugResponse.data)
      } catch (debugError: any) {
        console.error('❌ Token debug failed:', debugError?.data || debugError)
      }

      // Теперь попробуем загрузить пользователя
      await auth.fetchMe()
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Если токен невалиден, очищаем его и редиректим на логин
      if ((error as any)?.status === 401) {
        console.warn('⚠️ Token is invalid, logging out')
        auth.logout()
        router.push('/login')
      }
    }
  }

  // После загрузки пользователя восстанавливаем состояние sidebar
  if (hasSidebar.value) {
    const savedOpen = localStorage.getItem('sidebarOpen')
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')

    // На desktop показываем sidebar по умолчанию
    if (window.innerWidth >= 1024) {
      sidebarOpen.value = savedOpen !== 'false'
    }

    sidebarCollapsed.value = savedCollapsed === 'true'
  }
})
</script>

<style>
/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #212121;
  background: #fafafa;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  padding: 2rem 0 0 0;
}

/* App Root - Full Height */
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ============================================
   LAYOUT - Sidebar + Main Content
   ============================================ */
.app-layout {
  /* Header height */
  margin-top: 64px;
  flex: 1;
  display: flex;
  position: relative;
}

/* ============================================
   SIDEBAR
   ============================================ */
.app-sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  width: 260px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  transition: transform 0.3s ease, width 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.08);
}

.app-sidebar.collapsed {
  width: 70px;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* User Info */
.sidebar-user {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #dee2e6;
  background: #ffffff;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #757575;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #424242;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  margin-bottom: 4px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
}

.nav-item:hover {
  background: #e9ecef;
  color: #212121;
}

.nav-item.router-link-active {
  background: linear-gradient(90deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%);
  color: #2196f3;
  font-weight: 600;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #2196f3;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  width: 24px;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.app-sidebar.collapsed .nav-label {
  display: none;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #dee2e6;
}

.btn-collapse {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  color: #424242;
  font-size: 18px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-collapse:hover {
  background: #e9ecef;
}

/* Sidebar Overlay (mobile) */
.sidebar-overlay {
  display: none;
}

/* ============================================
   MAIN CONTENT
   ============================================ */
.app-main {
  flex: 1;
  /* padding: 24px; */
  min-height: calc(100vh - 64px);
  background: #fafafa;
  transition: margin-left 0.3s ease;
}

.app-main.with-sidebar {
  /* margin-left: 260px; */
}

.app-main.with-sidebar.sidebar-collapsed {
  /* margin-left: 70px; */
}

/* ============================================
   RESPONSIVE
   ============================================ */

/* Desktop */
@media (min-width: 1024px) {
  .app-sidebar {
    transform: translateX(0);
  }

  .app-sidebar:not(.open) {
    transform: translateX(-100%);
  }
}

/* Tablet and Mobile */
@media (max-width: 1023px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar.open {
    transform: translateX(0);
  }

  .app-sidebar.collapsed {
    width: 260px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  .sidebar-footer {
    display: none;
  }

  .app-main.with-sidebar {
    margin-left: 0;
  }

  .app-main.with-sidebar.sidebar-collapsed {
    margin-left: 0;
  }
}

/* Mobile */


@media (max-width: 768px) {
  .app-main {
    padding: 16px 12px;
  }
}

@media (max-width: 500px) {
  .app-main {
    padding: 0;
  }
}





/* ============================================
   FORM ELEMENTS
   ============================================ */
input, select, textarea {
  padding: 12px;
  margin: 4px 0;
  width: 100%;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

label {
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 4px;
  display: block;
  color: #424242;
  font-size: 14px;
}

/* button:not(.btn-logout):not(.btn-hamburger):not(.btn-collapse) {
  padding: 12px 12px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
  background: #2196f3;
  color: white;
}

button:not(.btn-logout):not(.btn-hamburger):not(.btn-collapse):hover {
  background: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

button:not(.btn-logout):not(.btn-hamburger):not(.btn-collapse):active {
  transform: translateY(0);
} */

.lang_btn {
  padding: 12px 12px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Card */
.card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* Grid Layout */
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .row {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 16px;
  }
}

/* Messages */
.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 12px 0;
  white-space: pre-wrap;
  border-left: 4px solid #d32f2f;
  font-size: 14px;
}

.success {
  color: #2e7d32;
  background: #e8f5e9;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 12px 0;
  border-left: 4px solid #2e7d32;
  font-size: 14px;
}

small.help {
  color: #757575;
  font-size: 12px;
  display: block;
  margin-top: 4px;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  color: #212121;
  margin-bottom: 16px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
}

h2 {
  font-size: 24px;
  font-weight: 600;
}

h3 {
  font-size: 20px;
  font-weight: 600;
}

@media (max-width: 768px) {
  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 18px;
  }
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1 { gap: 8px; }
.gap-2 { gap: 16px; }
.gap-3 { gap: 24px; }
</style>
