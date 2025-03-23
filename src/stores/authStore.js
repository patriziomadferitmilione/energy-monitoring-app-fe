import { defineStore } from 'pinia'
import axios from 'axios'
import { Notify } from 'quasar'
import { globalBaseUrl } from 'src/boot/global'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('token'),
    loggedUser: JSON.parse(localStorage.getItem('loggedUser')) || null,
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post(`${globalBaseUrl}/api/auth/login`, credentials)
        const user = response.data

        localStorage.setItem('token', user.token)
        localStorage.setItem('loggedUser', JSON.stringify(user))

        this.isAuthenticated = true
        this.loggedUser = user
        console.log('loggedUser', this.loggedUser)

        Notify.create({
          message: 'Login eseguito correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('[authStore] Login failed:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore nel login',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
        throw error
      }
    },

    async register(userData) {
      console.log('userData', userData)
      try {
        const response = await axios.post(`${globalBaseUrl}/api/auth/register`, userData)

        Notify.create({
          message: "Iscrizione avvenuta con successo! Ora puoi eseguire l'accesso",
          color: 'positive',
          position: 'bottom',
        })

        return response.data
      } catch (error) {
        console.error('[authStore] Registration failed:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore durante la registrazione',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
        throw error
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('loggedUser')
      this.isAuthenticated = false
      this.loggedUser = null
    },

    async checkAuth() {
      const token = localStorage.getItem('token')

      if (!token) {
        localStorage.removeItem('token')
        localStorage.removeItem('loggedUser')
        this.isAuthenticated = false
        this.loggedUser = null
        return
      }

      try {
        const response = await axios.get(`${globalBaseUrl}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 200) {
          this.isAuthenticated = true
          this.loggedUser = response.data.user
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
