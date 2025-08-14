import { createRouter, createWebHistory } from 'vue-router'
import CalculatorView from '../views/CalculatorView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'Calculator',
    component: CalculatorView,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('accessToken')

  if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
