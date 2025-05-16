<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-card">
        <h2 class="login-title">Login Your Account</h2>
        <p class="login-subtitle">
          Hey, Enter your details to get sign in to your account
        </p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <input
              type="text"
              placeholder="Enter Email address"
              v-model="username"
              @input="validateUsername"
              :class="['form-control', { 'is-invalid': errors.username }]"
            />
            <small v-if="errors.username" class="error-message">{{ errors.username }}</small>
          </div>

          <div class="form-group password-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Passcode"
              v-model="password"
              @input="validatePassword"
              :class="['form-control', { 'is-invalid': errors.password }]"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
            <small v-if="errors.password" class="error-message">{{ errors.password }}</small>
          </div>

          <div class="form-footer">Having trouble in sign in?</div>

          <button
            type="submit"
            class="btn-submit"
            :disabled="isLoading || Object.values(errors).some(error => !!error)"
          >
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Sign in</span>
          </button>

          <div class="divider">Or Sign in with</div>

          <div class="social-buttons">
            <button class="social-btn google">Google</button>
            <button class="social-btn apple">Apple ID</button>
            <button class="social-btn facebook">Facebook</button>
          </div>

          <div class="signup-prompt">
            Not Registered Yet?
            <a href="#">Create an account</a>
          </div>

          <div v-if="loginError" class="alert-error">
            {{ loginError }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const store = useStore()
const router = useRouter()
const toast = useToast()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')

const errors = reactive({
  username: '',
  password: ''
})

const validateUsername = () => {
  errors.username = username.value.trim() ? '' : "Le nom d'utilisateur est requis"
}

const validatePassword = () => {
  if (!password.value) {
    errors.password = 'Le mot de passe est requis'
  } else if (password.value.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
  } else {
    errors.password = ''
  }
}

const isFormValid = computed(() => {
  return !!username.value.trim() && !!password.value && !errors.username && !errors.password
})

const handleLogin = async () => {
  if (!isFormValid.value) return
  validateUsername()
  validatePassword()
  if (errors.username || errors.password) return
  isLoading.value = true
  loginError.value = ''
  try {
    await store.dispatch('auth/login', { username: username.value, password: password.value })
    toast.success('Connexion réussie!')
    router.push('/gallery')
  } catch (error: any) {
    loginError.value = error.message || 'Erreur de connexion'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #faf6f2;
  background-image: url('/public/images/login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: 'Inter', sans-serif;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: left;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.login-card {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 0.95);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #555;
  font-size: 14px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
  position: relative;
}

.password-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

.is-invalid {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
}

.btn-submit {
  background-color: #f4a261;
  color: white;
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit:hover {
  background-color: #e78f47;
}

.divider {
  margin: 20px 0 10px;
  font-size: 14px;
  color: #999;
}

.social-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.social-btn {
  flex: 1;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  margin: 0 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.social-btn:hover {
  background: #f0f0f0;
}

.signup-prompt {
  font-size: 13px;
  color: #777;
}

.signup-prompt a {
  color: #f4a261;
  text-decoration: none;
  font-weight: 500;
}

.alert-error {
  margin-top: 10px;
  color: #e74c3c;
  background: #fdecea;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}

.loader {
  border: 3px solid #fff;
  border-top: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive styles */
@media (max-width: 768px) {
  .login-page {
    background-position: 70% center;
  }
  
  .login-box {
    max-width: 360px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0 15px;
  }
  
  .login-card {
    padding: 25px 15px;
  }
  
  .social-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .social-btn {
    margin: 0;
  }
}
</style>
