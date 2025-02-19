import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'stores/authStore' // Import the store
import routes from './routes'

export default route(function () {
  const Router = createRouter({
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
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
