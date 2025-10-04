import { defineStore } from 'pinia'
import axiosInstance from '../utils/axiosInstance'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('authToken') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    isVodic: (state) => state.user?.role === 'vodic',
    isTurista: (state) => state.user?.role === 'turista',
    isAdministrator: (state) => state.user?.role === 'administrator'
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axiosInstance.post('/api/auth/user/login', credentials)
        const { token, username, role } = response.data
        
        this.token = token
        this.user = { username, role }
        
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        // Fetch complete profile data including user ID
        await this.fetchProfile()
        
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.errors?.[0]?.message || 'Login failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        await axiosInstance.post('/api/auth/user/register', userData)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.errors || 'Registration failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axiosInstance.get('/api/auth/user/profile')
        this.user = { ...this.user, ...response.data }
        localStorage.setItem('user', JSON.stringify(this.user))
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.errors?.[0]?.message || 'Failed to fetch profile'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      
      try {
        await axiosInstance.put('/api/auth/user/profile', profileData)
        // Refresh profile data
        await this.fetchProfile()
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.errors?.[0]?.message || 'Failed to update profile'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null
      
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }
})