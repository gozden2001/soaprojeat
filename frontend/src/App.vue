<template>
  <v-app>
    <app-navbar />
    <v-main>
      <router-view :key="$route.fullPath" />
    </v-main>
  </v-app>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>