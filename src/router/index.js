import { route } from 'quasar/wrappers'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from 'stores/authStore' // Import the store
import routes from './routes'

export default route(function () {
  const Router = createRouter({
    history: createWebHashHistory('/energy-monitoring-app-fe/'),
    routes,
  })

  // Navigation Guard: Protect Auth Routes
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  })

  return Router
})
