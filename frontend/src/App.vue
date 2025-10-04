<template>
  <v-app>
    <app-navbar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>