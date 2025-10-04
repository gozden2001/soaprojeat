<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="mx-auto" max-width="400">
          <v-card-title class="text-center pa-6">
            <v-icon size="48" class="mb-4" color="primary">mdi-login</v-icon>
            <h2>Login</h2>
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
                :error-messages="getFieldError('email')"
                variant="outlined"
                class="mb-3"
                required
              />
              
              <v-text-field
                v-model="form.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :rules="passwordRules"
                :error-messages="getFieldError('password')"
                variant="outlined"
                class="mb-3"
                required
              />
              
              <v-alert
                v-if="authStore.error && !Array.isArray(authStore.error)"
                type="error"
                class="mb-3"
                variant="tonal"
              >
                {{ authStore.error }}
              </v-alert>
              
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.loading"
                prepend-icon="mdi-login"
                variant="elevated"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="justify-center pb-6">
            <p class="text-body-2">
              Don't have an account?
              <router-link to="/signup" class="text-primary text-decoration-none">
                Sign up here
              </router-link>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const form = ref({
  email: '',
  password: ''
})

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  v => !!v || 'Password is required'
]

const getFieldError = (field) => {
  if (Array.isArray(authStore.error)) {
    const fieldError = authStore.error.find(err => err.path === field)
    return fieldError ? fieldError.message : ''
  }
  return ''
}

const handleLogin = async () => {
  const result = await authStore.login(form.value)
  
  if (result.success) {
    router.push('/')
  }
}
</script>