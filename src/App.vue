<template>
  <router-view v-if="authStore.isAuthenticated" />
  <LoginPage v-else />
</template>

<script>
import { useAuthStore } from 'stores/authStore'
import { useBillStore } from 'stores/billStore'
import LoginPage from 'pages/LoginPage.vue'

export default {
  components: { LoginPage },

  data() {
    return {
      authStore: useAuthStore(),
      billStore: useBillStore(),
    }
  },

  async created() {
    this.authStore.checkAuth()

    if (this.isAuthenticated) {
      await this.billStore.fetchBills()
    }
  },
}
</script>
