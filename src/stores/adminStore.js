import { defineStore } from 'pinia'
import axios from 'axios'
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
    // Users
    async fetchUsers() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${globalBaseUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.users = response.data
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },

    async addUser() {
      try {
        const response = await axios.post(`${globalBaseUrl}/api/auth/register`, this.newUser, {
          headers: {
            'Content-Type': 'application/json',
          },
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
      } catch (error) {
        console.error('Error registering user:', error)
      }
    },

    async updateUser() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.put(
          `${globalBaseUrl}/api/users/${this.editingUserId}`,
          this.newUser,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
      } catch (error) {
        console.error('Error updating user:', error)
      }
    },

    async deleteUser(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${globalBaseUrl}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.users = this.users.filter((user) => user._id !== id)
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    },

    openUserDialog() {
      this.showUserDialog = true
    },
    closeUserDialog() {
      this.showUserDialog = false
    },
    resetNewUser() {
      this.newUser = { name: '', email: '', password: '' }
    },

    // Providers
    async fetchProviders() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${globalBaseUrl}/api/providers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('providers', response)
        this.providers = response.data
      } catch (error) {
        console.error('Error fetching providers:', error)
      } finally {
        this.loading = false
      }
    },

    async addProvider() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${globalBaseUrl}/api/providers`, this.newProvider, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        this.providers.push(response.data)
        this.closeProviderDialog()
        this.resetNewProvider()
      } catch (error) {
        console.error('Error adding provider:', error)
      }
    },

    async updateProvider() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.put(
          `${globalBaseUrl}/api/providers/${this.editingProviderId}`,
          this.newProvider,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
      } catch (error) {
        console.error('Error updating provider:', error)
      }
    },

    async deleteProvider(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${globalBaseUrl}/api/providers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.providers = this.providers.filter((provider) => provider._id !== id)
      } catch (error) {
        console.error('Error deleting provider:', error)
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
