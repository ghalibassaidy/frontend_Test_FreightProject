<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Membaca URL API dari file .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const username = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const router = useRouter()

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!username.value || !email.value || !password.value) {
    errorMessage.value = 'All fields are required.'
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.username || data.email || data.password || 'Registration failed.')
    }

    successMessage.value = 'Registration successful! Please log in.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div class="view-container">
    <div class="auth-container">
      <h1>Register New Account</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Choose a username"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Choose a password"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button type="submit" class="auth-btn">Register</button>

        <p class="switch-form">
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: calc(100vh - 100px);
}
.auth-container {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid #e9ecef;
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
  font-weight: 500;
}
input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}
.auth-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 8px;
}
.error-message {
  color: #dc3545;
  text-align: center;
}
.success-message {
  color: #28a745;
  text-align: center;
}
.switch-form {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
