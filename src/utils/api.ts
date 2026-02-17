import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    timeout: 15000,
    withCredentials: false,
})

api.interceptors.request.use((config) => {
    // Получаем токен напрямую из localStorage, чтобы избежать проблем с инициализацией store
    const token = localStorage.getItem('token')

    if (token) {
        config.headers = config.headers || {}
        config.headers['Authorization'] = `Bearer ${token}`
        config.headers['Accept'] = 'application/json'
        console.log('🔑 Token being sent:', token.substring(0, 20) + '...')
    } else {
        console.warn('⚠️ No token found in localStorage')
    }

    // Добавляем заголовок Accept-Language для локализации
    const locale = localStorage.getItem('locale') || 'ru'
    config.headers = config.headers || {}
    config.headers['Accept-Language'] = locale

    console.log('📤 Request headers:', config.headers)
    return config
})

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response) return Promise.reject(error.response)
        return Promise.reject({ status: 0, data: { message: 'Network error' } })
    }
)

export default api
