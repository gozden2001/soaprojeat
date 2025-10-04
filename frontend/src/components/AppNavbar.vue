<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-title>
      <v-icon class="me-2">mdi-map-marker</v-icon>
      Tourism App
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <template v-if="authStore.isAuthenticated">
      <v-chip class="me-4" color="accent" variant="outlined">
        <v-icon start>mdi-account</v-icon>
        {{ authStore.user?.username }} ({{ authStore.user?.role }})
      </v-chip>
      
      <v-btn variant="text" to="/profile">
        <v-icon>mdi-account-circle</v-icon>
        Profile
      </v-btn>
      
      <v-btn variant="text" @click="logout">
        <v-icon>mdi-logout</v-icon>
        Logout
      </v-btn>
    </template>

    <template v-else>
      <v-btn variant="text" to="/login">
        <v-icon>mdi-login</v-icon>
        Login
      </v-btn>
      
      <v-btn variant="text" to="/signup">
        <v-icon>mdi-account-plus</v-icon>
        Sign Up
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>