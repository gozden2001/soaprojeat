<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-title @click="$router.push('/')" style="cursor: pointer;">
      <v-icon class="me-2">mdi-map-marker</v-icon>
      Tourism App
    </v-app-bar-title>

    <!-- Navigation Menu -->
    <div class="d-flex align-center me-4">
      <v-btn variant="text" to="/">
        <v-icon>mdi-home</v-icon>
        Početna
      </v-btn>
      
      <v-btn variant="text" to="/blogs">
        <v-icon>mdi-post</v-icon>
        Blogovi
      </v-btn>
      
      <v-btn variant="text" to="/tours">
        <v-icon>mdi-map</v-icon>
        Ture
      </v-btn>
    </div>

    <v-spacer></v-spacer>

    <template v-if="authStore.isAuthenticated">
      <v-chip class="me-4" color="accent" variant="outlined">
        <v-icon start>mdi-account</v-icon>
        {{ authStore.user?.username }} ({{ authStore.user?.role === 'vodic' ? 'Vodič' : 'Turista' }})
      </v-chip>
      
      <v-btn variant="text" to="/blogs/create">
        <v-icon>mdi-plus</v-icon>
        Novi Blog
      </v-btn>
      
      <v-btn 
        v-if="authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator'"
        variant="text" 
        to="/tours/create"
      >
        <v-icon>mdi-map-plus</v-icon>
        Nova Tura
      </v-btn>
      
      <v-btn 
        v-if="authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator'"
        variant="text" 
        to="/tours/my"
      >
        <v-icon>mdi-map-account</v-icon>
        Moje Ture
      </v-btn>
      
      <v-btn variant="text" to="/profile">
        <v-icon>mdi-account-circle</v-icon>
        Profil
      </v-btn>
      
      <v-btn variant="text" @click="logout">
        <v-icon>mdi-logout</v-icon>
        Odjava
      </v-btn>
    </template>

    <template v-else>
      <v-btn variant="text" to="/login">
        <v-icon>mdi-login</v-icon>
        Prijava
      </v-btn>
      
      <v-btn variant="text" to="/signup">
        <v-icon>mdi-account-plus</v-icon>
        Registracija
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