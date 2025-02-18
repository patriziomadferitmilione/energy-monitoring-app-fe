<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md shadow-2" style="width: 300px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="email" label="Email" type="email" />
        <q-input v-model="password" label="Password" type="password" class="q-mt-md" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Login" color="primary" @click="login" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    async login() {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
        })

        const data = await response.json()
        if (response.ok) {
          localStorage.setItem('token', data.token)
          this.$emit('login-success') // Notify App.vue to switch to MainLayout
        } else {
          alert(data.message || 'Login failed')
        }
      } catch (error) {
        console.log('Login error', error)
      }
    },
  },
}
</script>
