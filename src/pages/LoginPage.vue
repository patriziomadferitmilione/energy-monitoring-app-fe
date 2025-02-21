<template>
  <q-layout view="lHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="q-pa-md shadow-2" style="width: 300px">
          <q-card-section>
            <div class="text-h6">Login</div>
          </q-card-section>

          <!-- Form to avoid DOM warning -->
          <q-form @submit.prevent="login">
            <q-card-section>
              <q-input v-model="email" label="Email" type="email" autocomplete="email" />
              <q-input
                v-model="password"
                label="Password"
                type="password"
                class="q-mt-md"
                autocomplete="current-password"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn type="submit" label="Login" color="primary" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useAuthStore } from 'stores/authStore'
import axios from 'axios'

export default {
  data() {
    return {
      authStore: useAuthStore(),
      email: '',
      password: '',
    }
  },
  methods: {
    async login() {
      try {
        const response = await axios.post(`https://${this.authStore.baseUrl}/api/auth/login`, {
          email: this.email,
          password: this.password,
        })

        if (response.status === 200) {
          this.authStore.login(response.data.token)
          this.$router.push('/')
        } else {
          console.warn('[LoginPage] Login failed:', response.data.message)
          alert(response.data.message || 'Login failed')
        }
      } catch (error) {
        console.error('[LoginPage] Login error:', error)
        alert('Invalid credentials or server error.')
      }
    },
  },
}
</script>
