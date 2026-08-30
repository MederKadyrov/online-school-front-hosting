import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import Home from '../views/HomeView.vue'
import Login from '../views/LoginView.vue'
import RegisterStudentWizard from '../views/RegisterStudentWizard.vue'
import { useAuthStore } from '../stores/auth'
import AdminRegisterTeacher from '../views/AdminRegisterTeacherView.vue'
import ForgotPassword from '../views/ForgotPasswordView.vue'

const routes: RouteRecordRaw[] = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/register-student', component: RegisterStudentWizard },
    {
        path: '/admin/register-teacher',
        component: AdminRegisterTeacher,
        meta: {
            auth: true,
            breadcrumb: { label: 'Регистрация учителя', icon: 'teacher' }
        }
    },
    {
        path: '/student/courses',
        component: () => import('../views/StudentCoursesView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Мои курсы', icon: 'course', path: '/student/courses' }
        }
    },
    {
        path: '/student/courses/:id',
        name: 'student-course',
        component: () => import('../views/StudentCourseView.vue'),
        meta: {
            auth: true,
            breadcrumb: [
                { label: 'Мои курсы', icon: 'course', path: '/student/courses' },
                { label: 'Курс', icon: 'journal' }
            ]
        }
    },
    
    {
        path: '/student/profile',
        component: () => import('../views/StudentProfileView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Мой профиль', icon: 'profile' }
        }
    },
    {
        path: '/student/paragraphs/:paragraphId',
        component: () => import('../views/StudentParagraphView.vue'),
        meta: {
            auth: true,
            breadcrumb: [
                { label: 'Мои курсы', icon: 'course', path: '/student/courses' },
                { label: 'Курс', icon: 'journal' },
                { label: 'Параграф', icon: 'paragraph' }
            ]
        }
    },
    {
        path: '/student/paragraphs/:paragraphId/quiz',
        component: () => import('../views/StudentQuizView.vue'),
        meta: {
            auth: true,
            breadcrumb: [
                { label: 'Мои курсы', icon: 'course', path: '/student/courses' },
                { label: 'Курс', icon: 'journal' },
                { label: 'Параграф', icon: 'paragraph' },
                { label: 'Тест', icon: 'quiz' }
            ]
        }
    },




    // Admin - Teachers
    {
        path: '/admin/teachers',
        component: () => import('../views/AdminTeachersListView.vue'),
        meta: {
            breadcrumb: { label: 'Учителя', icon: 'teacher' }
        }
    },
    {
        path: '/admin/teachers/new',
        component: () => import('../views/AdminTeacherFormView.vue'),
        meta: {
            breadcrumb: { label: 'Новый учитель', icon: 'new' }
        }
    },
    {
        path: '/admin/teachers/:id/edit',
        component: () => import('../views/AdminTeacherFormView.vue'),
        meta: {
            breadcrumb: { label: 'Редактирование', icon: 'edit' }
        }
    },

    // Admin - Groups
    {
        path: '/admin/groups',
        component: () => import('../views/AdminGroupsListView.vue'),
        meta: {
            breadcrumb: { label: 'Группы', icon: 'school', path: '/admin/groups' }
        }
    },
    {
        path: '/admin/groups/new',
        component: () => import('../views/AdminGroupFormView.vue'),
        meta: {
            breadcrumb: [
                { label: 'Группы', icon: 'school', path: '/admin/groups' },
                { label: 'Новая группа', icon: 'new' }
            ]
        }
    },
    {
        path: '/admin/groups/:id/edit',
        component: () => import('../views/AdminGroupFormView.vue'),
        meta: {
            breadcrumb: [
                { label: 'Группы', icon: 'school', path: '/admin/groups' },
                { label: 'Редактирование', icon: 'edit' }
            ]
        }
    },
    {
        path: '/admin/groups/:id/courses',
        component: () => import('../views/AdminGroupCoursesView.vue'),
        meta: {
            breadcrumb: [
                { label: 'Группы', icon: 'school', path: '/admin/groups' },
                { label: 'Курсы группы', icon: 'course' }
            ]
        }
    },
    {
        path: '/admin/groups/:id/students',
        component: () => import('../views/AdminGroupStudentsView.vue'),
        meta: {
            breadcrumb: [
                { label: 'Группы', icon: 'school', path: '/admin/groups' },
                { label: 'Студенты', icon: 'student' }
            ]
        }
    },

    // Admin - Other
    {
        path: '/admin/students',
        component: () => import('../views/AdminStudentsView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Студенты', icon: 'student' }
        }
    },
    {
        path: '/admin/courses',
        component: () => import('../views/AdminCoursesView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Курсы учителей', icon: 'course' }
        }
    },
    {
        path: '/admin/courses/:id',
        component: () => import('../views/AdminCourseDetailView.vue'),
        meta: {
            auth: true,
            breadcrumb: [
                { label: 'Курсы учителей', icon: 'course', path: '/admin/courses' },
                { label: 'Детали курса', icon: 'journal' }
            ]
        }
    },
    {
        path: '/admin/submissions',
        component: () => import('../views/AdminSubmissionsView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Проверка работ', icon: 'edit' }
        }
    },
    {
        path: '/admin/journal',
        component: () => import('../views/AdminJournalView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Журнал', icon: 'journal' }
        }
    },
    {
        path: '/admin/user-passwords',
        component: () => import('../views/AdminUserPasswordsView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Пароли', icon: 'password' }
        }
    },

    // Admin - Subjects
    {
        path: '/admin/subjects',
        component: () => import('../views/AdminSubjectsListView.vue'),
        meta: {
            breadcrumb: { label: 'Предметы', icon: 'course' }
        }
    },
    {
        path: '/admin/subjects/new',
        component: () => import('../views/AdminSubjectFormView.vue'),
        meta: {
            breadcrumb: { label: 'Новый предмет', icon: 'new' }
        }
    },
    {
        path: '/admin/subjects/:id/edit',
        component: () => import('../views/AdminSubjectFormView.vue'),
        meta: {
            breadcrumb: { label: 'Редактирование', icon: 'edit' }
        }
    },

    // Teacher
    {
        path: '/teacher/courses',
        component: () => import('../views/TeacherCoursesView.vue'),
        meta: {
            breadcrumb: { label: 'Мои курсы', icon: 'course', path: '/teacher/courses' }
        }
    },
    {
        path: '/teacher/courses/:id/edit',
        component: () => import('../views/TeacherCourseEditView.vue'),
        meta: {
            breadcrumb: [
                { label: 'Мои курсы', icon: 'course', path: '/teacher/courses' },
                { label: 'Редактирование курса', icon: 'edit' }
            ]
        }
    },
    {
        path: '/teacher/submissions',
        component: () => import('../views/TeacherSubmissionsView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Проверка работ', icon: 'edit' }
        }
    },
    {
        path: '/teacher/journal',
        component: () => import('../views/TeacherJournalView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Журнал', icon: 'journal' }
        }
    },
    {
        path: '/teacher/profile',
        component: () => import('../views/TeacherProfileView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Мой профиль', icon: 'profile' }
        }
    },

    // Student
    {
        path: '/student/journal',
        component: () => import('../views/StudentJournalView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Журнал', icon: 'journal' }
        }
    },
    {
        path: '/student/assignments',
        component: () => import('../views/StudentAssignmentsView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Мои задания', icon: 'assignment' }
        }
    },

    // Public - Applications
    {
        path: '/check-application',
        component: () => import('../views/CheckApplicationStatusView.vue'),
        meta: {
            breadcrumb: { label: 'Проверить статус заявки', icon: 'search' }
        }
    },
    {
        path: '/revise-application',
        component: () => import('../views/ReviseApplicationView.vue'),
        meta: {
            breadcrumb: { label: 'Редактировать заявку', icon: 'assignment' }
        }
    },

    // Admin - Applications
    {
        path: '/admin/applications',
        component: () => import('../views/admin/ApplicationsListView.vue'),
        meta: {
            auth: true,
            breadcrumb: { label: 'Заявки студентов', icon: 'applications', path: '/admin/applications' }
        }
    },
    {
        path: '/admin/applications/:id',
        component: () => import('../views/admin/ApplicationDetailsView.vue'),
        meta: {
            auth: true,
            breadcrumb: [
                { label: 'Заявки студентов', icon: 'applications', path: '/admin/applications' },
                { label: 'Детали заявки', icon: 'paragraph' }
            ]
        }
    },

]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore()
    if (to.meta.auth && !auth.token) {
        return next('/login')
    }
    next()
})

export default router
