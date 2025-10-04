<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto" max-width="500">
          <v-card-title class="text-center pa-6">
            <v-icon size="48" class="mb-4">mdi-map-marker</v-icon>
            <h2>Dobrodošli u Tourism App</h2>
          </v-card-title>
          
          <v-card-text class="text-center">
            <p class="text-h6 mb-4">Istražite neverovatne ture i kreirajte nezaboravne uspomene!</p>
            
            <template v-if="authStore.isAuthenticated">
              <v-alert type="success" class="mb-4">
                Dobrodošli, {{ authStore.user?.username }}! ({{ authStore.user?.role === 'vodic' ? 'Vodič' : 'Turista' }})
              </v-alert>
              
              <div class="d-flex flex-column ga-3">
                <v-btn 
                  to="/blogs" 
                  color="primary" 
                  size="large"
                  prepend-icon="mdi-post"
                  variant="elevated"
                >
                  Pogledaj Blogove
                </v-btn>
                
                <v-btn 
                  to="/blogs/create" 
                  color="success" 
                  size="large"
                  prepend-icon="mdi-plus"
                  variant="outlined"
                >
                  Kreiraj Novi Blog
                </v-btn>
                
                <v-btn 
                  to="/profile" 
                  color="info" 
                  size="large"
                  prepend-icon="mdi-account-circle"
                  variant="outlined"
                >
                  Upravljaj Profilom
                </v-btn>
                
                <template v-if="authStore.isVodic">
                  <v-btn 
                    color="secondary" 
                    size="large"
                    prepend-icon="mdi-map-plus"
                    variant="outlined"
                    disabled
                  >
                    Kreiraj Ture (Uskoro)
                  </v-btn>
                </template>
                
                <template v-if="authStore.isTurista">
                  <v-btn 
                    color="warning" 
                    size="large"
                    prepend-icon="mdi-compass"
                    variant="outlined"
                    disabled
                  >
                    Istraži Ture (Uskoro)
                  </v-btn>
                </template>
              </div>
            </template>
            
            <template v-else>
              <p class="mb-4">Molimo prijavite se ili kreirajte nalog da biste počeli</p>
              <div class="d-flex flex-column ga-3">
                <v-btn 
                  to="/blogs" 
                  color="primary" 
                  size="large"
                  prepend-icon="mdi-post"
                  variant="elevated"
                >
                  Pogledaj Blogove
                </v-btn>
                <v-btn 
                  to="/login" 
                  color="success" 
                  size="large"
                  prepend-icon="mdi-login"
                  variant="outlined"
                >
                  Prijavi se
                </v-btn>
                <v-btn 
                  to="/signup" 
                  color="secondary" 
                  size="large"
                  prepend-icon="mdi-account-plus"
                  variant="outlined"
                >
                  Kreiraj Nalog
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