<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto" max-width="500">
          <v-card-title class="text-center pa-6">
            <v-icon size="48" class="mb-4">mdi-map-marker</v-icon>
            <h2>Welcome to Tourism App</h2>
          </v-card-title>
          
          <v-card-text class="text-center">
            <p class="text-h6 mb-4">Explore amazing tours and create unforgettable memories!</p>
            
            <template v-if="authStore.isAuthenticated">
              <v-alert type="success" class="mb-4">
                Welcome, {{ authStore.user?.username }}! ({{ authStore.user?.role }})
              </v-alert>
              
              <div class="d-flex flex-column ga-3">
                <v-btn 
                  to="/profile" 
                  color="primary" 
                  size="large"
                  prepend-icon="mdi-account-circle"
                  variant="elevated"
                >
                  Manage Profile
                </v-btn>
                
                <template v-if="authStore.isVodic">
                  <v-btn 
                    color="success" 
                    size="large"
                    prepend-icon="mdi-map-plus"
                    variant="outlined"
                    disabled
                  >
                    Create Tours (Coming Soon)
                  </v-btn>
                </template>
                
                <template v-if="authStore.isTurista">
                  <v-btn 
                    color="info" 
                    size="large"
                    prepend-icon="mdi-compass"
                    variant="outlined"
                    disabled
                  >
                    Explore Tours (Coming Soon)
                  </v-btn>
                </template>
              </div>
            </template>
            
            <template v-else>
              <p class="mb-4">Please login or create an account to get started</p>
              <div class="d-flex flex-column ga-3">
                <v-btn 
                  to="/login" 
                  color="primary" 
                  size="large"
                  prepend-icon="mdi-login"
                  variant="elevated"
                >
                  Login
                </v-btn>
                <v-btn 
                  to="/signup" 
                  color="secondary" 
                  size="large"
                  prepend-icon="mdi-account-plus"
                  variant="outlined"
                >
                  Create Account
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>