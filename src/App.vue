<template>
  <router-view v-if="isAuthenticated" />
  <LoginPage v-else @login-success="handleLogin" />
</template>

<script>
import LoginPage from 'pages/LoginPage.vue'

export default {
  components: { LoginPage },
  data() {
    return {
      isAuthenticated: false,
    }
  },
  methods: {
    handleLogin() {
      this.isAuthenticated = true
      localStorage.setItem('authenticated', 'true') // Save login state
      this.$router.push('/') // Redirect to main layout
    },
    checkAuth() {
      this.isAuthenticated = localStorage.getItem('authenticated') === 'true'
    },
  },
  created() {
    this.checkAuth()
  },
}
</script>
