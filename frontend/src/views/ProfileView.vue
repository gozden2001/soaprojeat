<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto" max-width="600">
          <v-card-title class="text-center pa-6">
            <v-icon size="48" class="mb-4" color="primary">mdi-account-circle</v-icon>
            <h2>User Profile</h2>
          </v-card-title>
          
          <v-card-text v-if="profile">
            <v-form @submit.prevent="handleUpdateProfile">
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
              
              <!-- Read-only fields -->
              <v-text-field
                :model-value="profile.username"
                label="Username"
                prepend-inner-icon="mdi-account-circle"
                variant="outlined"
                readonly
                class="mb-3"
                hint="Username cannot be changed"
                persistent-hint
              />
              
              <v-text-field
                :model-value="profile.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                readonly
                class="mb-3"
                hint="Email cannot be changed"
                persistent-hint
              />
              
              <v-chip 
                :color="getRoleColor(profile.role)"
                size="large"
                class="mb-4"
                prepend-icon="mdi-account-group"
              >
                {{ getRoleLabel(profile.role) }}
              </v-chip>
              
              <!-- Profile fields -->
              <v-textarea
                v-model="form.biography"
                label="Biography"
                prepend-inner-icon="mdi-text"
                :error-messages="getFieldError('biography')"
                variant="outlined"
                class="mb-3"
                rows="3"
                hint="Tell us about yourself"
                persistent-hint
              />
              
              <v-text-field
                v-model="form.motto"
                label="Personal Motto"
                prepend-inner-icon="mdi-format-quote-close"
                :error-messages="getFieldError('motto')"
                variant="outlined"
                class="mb-3"
                hint="Your personal motto or favorite quote"
                persistent-hint
              />
              
              <v-text-field
                v-model="form.profileImage"
                label="Profile Image URL"
                prepend-inner-icon="mdi-image"
                :error-messages="getFieldError('profileImage')"
                variant="outlined"
                class="mb-3"
                hint="URL to your profile image"
                persistent-hint
              />
              
              <!-- Address Information (Read-only) -->
              <v-card variant="outlined" class="mb-3">
                <v-card-title class="text-h6 pa-4">
                  <v-icon start>mdi-map-marker</v-icon>
                  Address Information
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        :model-value="profile.address?.latitude"
                        label="Latitude"
                        prepend-inner-icon="mdi-latitude"
                        variant="outlined"
                        readonly
                        hint="Address cannot be changed"
                        persistent-hint
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        :model-value="profile.address?.longitude"
                        label="Longitude"
                        prepend-inner-icon="mdi-longitude"
                        variant="outlined"
                        readonly
                        hint="Address cannot be changed"
                        persistent-hint
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              
              <v-alert
                v-if="authStore.error"
                type="error"
                class="mb-3"
                variant="tonal"
              >
                <div v-if="Array.isArray(authStore.error)">
                  <div v-for="error in authStore.error" :key="error.path || error.message">
                    {{ error.message }}
                  </div>
                </div>
                <div v-else>
                  {{ authStore.error }}
                </div>
              </v-alert>
              
              <v-alert
                v-if="updateSuccess"
                type="success"
                class="mb-3"
                variant="tonal"
              >
                Profile updated successfully!
              </v-alert>
              
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.loading"
                prepend-icon="mdi-content-save"
                variant="elevated"
              >
                Update Profile
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-text v-else-if="authStore.loading">
            <v-skeleton-loader type="article"></v-skeleton-loader>
          </v-card-text>
          
          <v-card-text v-else>
            <v-alert type="error" variant="tonal">
              Failed to load profile. Please try again.
              <template #actions>
                <v-btn color="error" @click="loadProfile">Retry</v-btn>
              </template>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const profile = ref(null)
const updateSuccess = ref(false)
const form = ref({
  name: '',
  surname: '',
  biography: '',
  motto: '',
  profileImage: ''
})

const nameRules = [
  v => !!v || 'Name is required',
  v => v.length >= 2 || 'Name must be at least 2 characters'
]

const getFieldError = (field) => {
  if (Array.isArray(authStore.error)) {
    const fieldError = authStore.error.find(err => err.path === field)
    return fieldError ? fieldError.message : ''
  }
  return ''
}

const getRoleColor = (role) => {
  switch (role) {
    case 'vodic': return 'success'
    case 'turista': return 'info'
    case 'administrator': return 'warning'
    default: return 'primary'
  }
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'vodic': return 'Guide (Vodič)'
    case 'turista': return 'Tourist (Turista)'
    case 'administrator': return 'Administrator'
    default: return role
  }
}

const loadProfile = async () => {
  const result = await authStore.fetchProfile()
  if (result.success) {
    profile.value = result.data
    // Initialize form with profile data
    form.value = {
      name: profile.value.name || '',
      surname: profile.value.surname || '',
      biography: profile.value.biography || '',
      motto: profile.value.motto || '',
      profileImage: profile.value.profileImage || ''
    }
  }
}

const handleUpdateProfile = async () => {
  updateSuccess.value = false
  const result = await authStore.updateProfile(form.value)
  
  if (result.success) {
    updateSuccess.value = true
    // Reload profile to get updated data
    await loadProfile()
  }
}

onMounted(() => {
  loadProfile()
})
</script>