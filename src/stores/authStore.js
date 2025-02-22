import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // baseUrl: 'http://localhost:5000',
    baseUrl: 'https://backend.bollettify.com',
    isAuthenticated: !!localStorage.getItem('token'),
  }),

  actions: {
    login(token) {
      localStorage.setItem('token', token)
      localStorage.setItem('authenticated', 'true')
      this.isAuthenticated = true
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('authenticated')
      this.isAuthenticated = false
    },

    async checkAuth() {
      const token = localStorage.getItem('token')

      if (!token) {
        localStorage.removeItem('authenticated')
        this.isAuthenticated = false
        return
      }

      try {
        const response = await axios.get(`${this.baseUrl}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 200) {
          this.isAuthenticated = true
          localStorage.setItem('authenticated', 'true')
        } else {
          this.logout()
        }
      } catch (error) {
        console.error('[authStore] Auth check failed:', error)
        this.logout()
      }
    },
  },
})
