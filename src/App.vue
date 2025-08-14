<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  router.push('/login').then(() => {
    window.location.reload()
  })
}
</script>

<template>
  <div>
    <header id="nav">
      <nav class="nav-links">
        <router-link to="/">Calculator</router-link>
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </nav>
      <nav>
        <a @click="logout" href="#" class="logout-btn">Logout</a>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8f9fa;
}

#nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

#nav a {
  font-weight: 600;
  color: #495057;
  text-decoration: none;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease-in-out;
}

#nav a.router-link-exact-active {
  color: #007bff;
  border-bottom-color: #007bff;
}

#nav a.logout-btn {
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}
#nav a.logout-btn:hover {
  background-color: #dc3545;
  color: white;
  border-bottom-color: transparent;
}

#nav a:not(.logout-btn):hover {
  color: #007bff;
}
</style>
