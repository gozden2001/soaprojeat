<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto" max-width="600">
          <v-card-title class="text-center pa-6">
            <v-icon size="48" class="mb-4" color="primary">mdi-account-plus</v-icon>
            <h2>Create Account</h2>
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.name"
                    label="First Name"
                    prepend-inner-icon="mdi-account"
                    :rules="nameRules"
                    :error-messages="getFieldError('name')"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.surname"
                    label="Last Name"
                    prepend-inner-icon="mdi-account"
                    :rules="nameRules"
                    :error-messages="getFieldError('surname')"
                    variant="outlined"
                    required
                  />
                </v-col>
              </v-row>
              
              <v-text-field
                v-model="form.username"
                label="Username"
                prepend-inner-icon="mdi-account-circle"
                :rules="usernameRules"
                :error-messages="getFieldError('username')"
                variant="outlined"
                class="mb-3"
                required
              />
              
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
              
              <v-select
                v-model="form.role"
                label="Role"
                :items="roleOptions"
                prepend-inner-icon="mdi-account-group"
                :rules="roleRules"
                :error-messages="getFieldError('role')"
                variant="outlined"
                class="mb-3"
                required
              />
              
              <!-- Address Section -->
              <v-card variant="outlined" class="mb-3">
                <v-card-title class="text-h6 pa-4">
                  <v-icon start>mdi-map-marker</v-icon>
                  Address Information
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="form.address.latitude"
                        label="Latitude"
                        type="number"
                        step="any"
                        prepend-inner-icon="mdi-latitude"
                        :rules="latitudeRules"
                        :error-messages="getFieldError('address.latitude')"
                        variant="outlined"
                        hint="Between -90 and 90"
                        persistent-hint
                        required
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="form.address.longitude"
                        label="Longitude"
                        type="number"
                        step="any"
                        prepend-inner-icon="mdi-longitude"
                        :rules="longitudeRules"
                        :error-messages="getFieldError('address.longitude')"
                        variant="outlined"
                        hint="Between -180 and 180"
                        persistent-hint
                        required
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              
              <v-alert
                v-if="authStore.error && Array.isArray(authStore.error)"
                type="error"
                class="mb-3"
                variant="tonal"
              >
                <div v-for="error in authStore.error" :key="error.path || error.message">
                  {{ error.message }}
                </div>
              </v-alert>
              
              <v-alert
                v-else-if="authStore.error"
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
                prepend-icon="mdi-account-plus"
                variant="elevated"
              >
                Create Account
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="justify-center pb-6">
            <p class="text-body-2">
              Already have an account?
              <router-link to="/login" class="text-primary text-decoration-none">
                Login here
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
  name: '',
  surname: '',
  username: '',
  email: '',
  password: '',
  role: 'turista',
  address: {
    latitude: null,
    longitude: null
  }
})

const roleOptions = [
  { title: 'Tourist (Turista)', value: 'turista' },
  { title: 'Guide (Vodič)', value: 'vodic' }
]

const nameRules = [
  v => !!v || 'Name is required',
  v => v.length >= 2 || 'Name must be at least 2 characters'
]

const usernameRules = [
  v => !!v || 'Username is required',
  v => v.length >= 3 || 'Username must be at least 3 characters'
]

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
]

const roleRules = [
  v => !!v || 'Role is required'
]

const latitudeRules = [
  v => v !== null && v !== '' || 'Latitude is required',
  v => (v >= -90 && v <= 90) || 'Latitude must be between -90 and 90'
]

const longitudeRules = [
  v => v !== null && v !== '' || 'Longitude is required',
  v => (v >= -180 && v <= 180) || 'Longitude must be between -180 and 180'
]

const getFieldError = (field) => {
  if (Array.isArray(authStore.error)) {
    const fieldError = authStore.error.find(err => err.path === field)
    return fieldError ? fieldError.message : ''
  }
  return ''
}

const handleRegister = async () => {
  const result = await authStore.register(form.value)
  
  if (result.success) {
    router.push('/login')
  }
}
</script>