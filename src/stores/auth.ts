import { defineStore } from 'pinia'
import api from '../utils/api'

type User = {
    id: number;
    name: string;
    email: string | null;
    pin?: string;
    role?: string;
    username?: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        user: null as User | null,
    }),
    actions: {
        async login(pin: string, password: string) {
            console.log('🔐 Login attempt for PIN:', pin)
            const { data } = await api.post('/auth/login', { pin, password })
            console.log('✅ Login response:', data)
            this.token = data.token
            localStorage.setItem('token', this.token)
            this.user = data.user
            console.log('💾 Token saved to localStorage:', this.token.substring(0, 20) + '...')
            console.log('👤 User:', this.user)
        },
        async fetchMe() {
            if (!this.token) {
                console.warn('⚠️ fetchMe called but no token available')
                return
            }
            console.log('🔍 Fetching user info with token:', this.token.substring(0, 20) + '...')
            const { data } = await api.get('/auth/me')
            this.user = data
            console.log('👤 User fetched:', data)
        },
        logout() {
            console.log('👋 Logging out')
            this.token = ''
            this.user = null
            localStorage.removeItem('token')
        },
    },
})
