import { defineStore } from 'pinia'
import axios from 'axios'
import { Notify } from 'quasar'
import { globalBaseUrl } from 'src/boot/global'

export const useAdminStore = defineStore('adminStore', {
  state: () => ({
    users: [],
    providers: [],
    loading: false,
    showUserDialog: false,
    showProviderDialog: false,
    newUser: {
      role: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
    },
    newProvider: {
      name: '',
    },
  }),
  actions: {
    // User Management
    async fetchUsers() {
      this.loading = true
      try {
        const response = await axios.get(`${globalBaseUrl}/api/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.users = response.data
      } catch (error) {
        console.error('Error fetching users:', error)
        Notify.create({
          message: error.message || 'Errore nel recupero utenti',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },

    async addUser() {
      try {
        const response = await axios.post(`${globalBaseUrl}/api/auth/register`, this.newUser, {
          headers: { 'Content-Type': 'application/json' },
        })

        const newUser = {
          _id: response.data._id,
          email: response.data.email,
          role: response.data.role,
          first_name: this.newUser.first_name,
          last_name: this.newUser.last_name,
          phone: this.newUser.phone,
        }
        this.users.push(newUser)
        this.closeUserDialog()
        this.resetNewUser()

        Notify.create({
          message: 'Utente aggiunto correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error registering user:', error)
        Notify.create({
          message: error.message || 'Errore nella registrazione utente',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    async updateUser() {
      try {
        const response = await axios.put(
          `${globalBaseUrl}/api/users/${this.editingUserId}`,
          this.newUser,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          },
        )

        const index = this.users.findIndex((user) => user._id === this.editingUserId)
        if (index !== -1) {
          this.users[index] = response.data
        }
        this.closeUserDialog()
        this.resetNewUser()

        Notify.create({
          message: 'Utente aggiornato correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error updating user:', error)
        Notify.create({
          message: error.message || 'Errore nella modifica utente',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    async deleteUser(id) {
      try {
        await axios.delete(`${globalBaseUrl}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.users = this.users.filter((user) => user._id !== id)

        Notify.create({
          message: 'Utente eliminato correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error deleting user:', error)
        Notify.create({
          message: error.message || 'Errore nella cancellazione utente',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    openUserDialog() {
      this.showUserDialog = true
    },
    closeUserDialog() {
      this.showUserDialog = false
    },
    resetNewUser() {
      this.newUser = { role: '', first_name: '', last_name: '', email: '', phone: '', password: '' }
    },

    // Provider Management
    async fetchProviders() {
      this.loading = true
      try {
        const response = await axios.get(`${globalBaseUrl}/api/providers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.providers = response.data
        console.log(this.providers)
      } catch (error) {
        console.error('Error fetching providers:', error)
        Notify.create({
          message: error.message || 'Errore nel recupero provider',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },

    async addProvider() {
      try {
        const response = await axios.post(`${globalBaseUrl}/api/providers`, this.newProvider, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })
        this.providers.push(response.data)
        this.closeProviderDialog()
        this.resetNewProvider()

        Notify.create({
          message: 'Provider aggiunto correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error adding provider:', error)
        Notify.create({
          message: error.message || 'Errore nella creazione provider',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    async updateProvider() {
      try {
        const response = await axios.put(
          `${globalBaseUrl}/api/providers/${this.editingProviderId}`,
          this.newProvider,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          },
        )

        const index = this.providers.findIndex(
          (provider) => provider._id === this.editingProviderId,
        )
        if (index !== -1) {
          this.providers[index] = response.data
        }
        this.closeProviderDialog()
        this.resetNewProvider()

        Notify.create({
          message: 'Provider aggiornato correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error updating provider:', error)
        Notify.create({
          message: error.message || 'Errore nella modifica provider',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    async deleteProvider(id) {
      try {
        await axios.delete(`${globalBaseUrl}/api/providers/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.providers = this.providers.filter((provider) => provider._id !== id)

        Notify.create({
          message: 'Provider eliminato correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error deleting provider:', error)
        Notify.create({
          message: error.message || 'Errore nella cancellazione provider',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    openProviderDialog() {
      this.showProviderDialog = true
    },
    closeProviderDialog() {
      this.showProviderDialog = false
    },
    resetNewProvider() {
      this.newProvider = { name: '' }
    },
  },
})
