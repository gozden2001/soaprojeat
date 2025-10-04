<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon start class="mr-2">mdi-map-marker</v-icon>
        Select Your Location
      </v-card-title>
      
      <v-card-text>
        <div class="mb-4">
          <KeyPointMapPicker
            :initial-coordinates="mapCenter"
            :key-points="[]"
            @coordinates-selected="onCoordinatesSelected"
          />
        </div>
        
        <v-row v-if="selectedCoordinates">
          <v-col cols="6">
            <v-text-field
              :model-value="selectedCoordinates.latitude"
              label="Latitude"
              variant="outlined"
              readonly
              density="compact"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="selectedCoordinates.longitude"
              label="Longitude"
              variant="outlined"
              readonly
              density="compact"
            />
          </v-col>
        </v-row>
        
        <v-alert
          v-if="!selectedCoordinates"
          type="info"
          variant="tonal"
          class="mb-3"
        >
          <v-icon start>mdi-information</v-icon>
          Click on the map to select your location
        </v-alert>
        
        <div class="d-flex justify-center">
          <v-btn
            @click="getCurrentLocation"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-crosshairs-gps"
            :loading="loadingLocation"
            class="mr-2"
          >
            Use Current Location
          </v-btn>
        </div>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          @click="closeDialog"
          variant="text"
        >
          Cancel
        </v-btn>
        <v-btn
          @click="confirmSelection"
          color="primary"
          variant="flat"
          :disabled="!selectedCoordinates"
        >
          Confirm Location
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import KeyPointMapPicker from './KeyPointMapPicker.vue'

const dialog = ref(false)
const selectedCoordinates = ref(null)
const loadingLocation = ref(false)

const mapCenter = {
  latitude: 45.2671,  // Novi Sad center
  longitude: 19.8335
}

const emit = defineEmits(['address-selected'])

const onCoordinatesSelected = (coordinates) => {
  selectedCoordinates.value = coordinates
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.')
    return
  }

  loadingLocation.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      selectedCoordinates.value = {
        latitude: lat,
        longitude: lng
      }
      
      loadingLocation.value = false
    },
    (error) => {
      console.error('Error getting location:', error)
      alert('Unable to retrieve your location. Please select manually on the map.')
      loadingLocation.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

const confirmSelection = () => {
  if (selectedCoordinates.value) {
    emit('address-selected', selectedCoordinates.value)
    closeDialog()
  }
}

const closeDialog = () => {
  dialog.value = false
  selectedCoordinates.value = null
}

const openDialog = () => {
  dialog.value = true
}

// Expose methods to parent
defineExpose({
  openDialog
})
</script>

<style scoped>
</style>