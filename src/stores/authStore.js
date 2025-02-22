import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    baseUrl: 'http://localhost:5000',
    // baseUrl: 'https://backend.bollettify.com',
    isAuthenticated: !!localStorage.getItem('token'),
    loggedUser: JSON.parse(localStorage.getItem('loggedUser')) || null,
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post(`${this.baseUrl}/api/auth/login`, credentials)
        const user = response.data
        console.log('login res', response)
        localStorage.setItem('token', user.token)
        localStorage.setItem('loggedUser', JSON.stringify(user))
        localStorage.setItem('authenticated', 'true')

        this.isAuthenticated = true
        this.loggedUser = user
      } catch (error) {
        console.error('[authStore] Login failed:', error)
        throw error
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('authenticated')
      localStorage.removeItem('loggedUser')
      this.isAuthenticated = false
      this.loggedUser = null
    },

    async checkAuth() {
      const token = localStorage.getItem('token')

      if (!token) {
        this.logout()
        return
      }

      try {
        const response = await axios.get(`${this.baseUrl}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 200) {
          this.isAuthenticated = true
          this.loggedUser = response.data
          localStorage.setItem('loggedUser', JSON.stringify(response.data))
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
