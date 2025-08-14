<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()

async function handleLogin() {
  errorMessage.value = ''
  try {
    const response = await fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed.')
    }

    localStorage.setItem('accessToken', data.access)
    localStorage.setItem('refreshToken', data.refresh)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-form">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit" class="auth-btn">Login</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
.auth-form {
  background: white;
  padding: 2rem 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
h1 {
  text-align: center;
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.auth-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 4px;
}
</style>
