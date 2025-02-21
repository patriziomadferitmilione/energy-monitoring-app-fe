import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    baseUrl: '95.217.214.37:5000',
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
        const response = await axios.get(`http://${this.baseUrl}/api/auth/verify`, {
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
