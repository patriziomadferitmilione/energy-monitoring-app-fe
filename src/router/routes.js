const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue') },
      { path: 'bills', component: () => import('pages/BillsPage.vue') },
      { path: 'contracts', component: () => import('pages/ContractsPage.vue') },
    ],
    meta: { requiresAuth: true }, // Protect these routes
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
