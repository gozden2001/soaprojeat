<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <v-card>
          <v-card-title class="text-h4">
            <v-icon left class="mr-2">mdi-crosshairs-gps</v-icon>
            Simulator pozicije
          </v-card-title>
          <v-card-subtitle>
            Kliknite na mapu da postavite svoju trenutnu poziciju
          </v-card-subtitle>
          <v-card-text>
            <v-chip
              v-if="currentPosition.latitude && currentPosition.longitude"
              color="success"
              variant="flat"
              prepend-icon="mdi-map-marker"
            >
              {{ currentPosition.latitude.toFixed(6) }}, {{ currentPosition.longitude.toFixed(6) }}
            </v-chip>
            <v-chip
              v-else
              color="warning"
              variant="flat"
              prepend-icon="mdi-map-marker-off"
            >
              Pozicija nije postavljena
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              prepend-icon="mdi-crosshairs-gps"
              @click="getCurrentLocation"
              :loading="gettingLocation"
            >
              Koristi trenutnu lokaciju
            </v-btn>
            <v-btn
              v-if="currentPosition.latitude && currentPosition.longitude"
              color="error"
              prepend-icon="mdi-delete"
              @click="clearPosition"
            >
              Ukloni poziciju
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Map -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-text class="pa-0">
            <div 
              ref="mapContainer" 
              class="position-map"
              style="height: 500px; width: 100%;"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Instructions -->
    <v-row class="mt-4">
      <v-col>
        <v-alert type="info" variant="tonal">
          <v-alert-title>Kako koristiti simulator pozicije:</v-alert-title>
          <ul class="mt-2">
            <li>Kliknite bilo gde na mapi da postavite svoju trenutnu poziciju</li>
            <li>Koristite "Koristi trenutnu lokaciju" da automatski postavite GPS poziciju</li>
            <li>Vaša pozicija će biti sačuvana i korišćena za izvršavanje tura</li>
            <li>Možete u bilo kom trenutku promeniti poziciju ponovnim klikom na mapu</li>
          </ul>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="5000"
      location="top"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
        >
          Zatvori
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Icon } from 'ol/style'
import { Point } from 'ol/geom'
import { Feature } from 'ol'
import positionAPI from '../api/position'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'PositionSimulator',
  setup() {
    const authStore = useAuthStore()
    
    const mapContainer = ref(null)
    const map = ref(null)
    const vectorLayer = ref(null)
    const vectorSource = ref(null)
    const gettingLocation = ref(false)
    
    const currentPosition = ref({
      latitude: null,
      longitude: null
    })

    const showSnackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('success')

    const showMessage = (message, color = 'success') => {
      snackbarMessage.value = message
      snackbarColor.value = color
      showSnackbar.value = true
    }

    const initializeMap = () => {
      if (!mapContainer.value) return

      // Create vector source and layer for position marker
      vectorSource.value = new VectorSource()
      vectorLayer.value = new VectorLayer({
        source: vectorSource.value,
        style: new Style({
          image: new Icon({
            src: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#e53e3e" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
            scale: 1.5,
            anchor: [0.5, 1]
          })
        })
      })

      map.value = new Map({
        target: mapContainer.value,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer.value
        ],
        view: new View({
          center: fromLonLat([19.8335, 45.2671]), // Novi Sad center
          zoom: 13
        })
      })

      // Add click handler
      map.value.on('click', handleMapClick)
    }

    const handleMapClick = async (event) => {
      const coordinate = event.coordinate
      const [longitude, latitude] = toLonLat(coordinate)
      
      console.log('Map clicked at:', latitude, longitude)
      await setPosition(latitude, longitude)
    }

    const setPosition = async (latitude, longitude) => {
      try {
        const result = await positionAPI.setCurrentPosition(latitude, longitude)
        
        if (result.success) {
          currentPosition.value = {
            latitude: latitude,
            longitude: longitude
          }
          
          updateMapMarker(latitude, longitude)
          showMessage('Pozicija je uspešno postavljena!')
        } else {
          showMessage(result.error, 'error')
        }
      } catch (error) {
        console.error('Set position error:', error)
        showMessage('Greška prilikom postavljanja pozicije', 'error')
      }
    }

    const updateMapMarker = (latitude, longitude) => {
      if (!vectorSource.value) return

      // Clear existing features
      vectorSource.value.clear()

      // Add new marker
      const marker = new Feature({
        geometry: new Point(fromLonLat([longitude, latitude]))
      })

      vectorSource.value.addFeature(marker)

      // Center map on position
      map.value.getView().setCenter(fromLonLat([longitude, latitude]))
    }

    const loadCurrentPosition = async () => {
      try {
        const result = await positionAPI.getCurrentPosition()
        
        if (result.success && result.data.latitude && result.data.longitude) {
          currentPosition.value = {
            latitude: result.data.latitude,
            longitude: result.data.longitude
          }
          
          updateMapMarker(result.data.latitude, result.data.longitude)
        }
      } catch (error) {
        console.error('Load position error:', error)
      }
    }

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        showMessage('Geolocation nije podržan u ovom browser-u', 'error')
        return
      }

      gettingLocation.value = true

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          await setPosition(latitude, longitude)
          gettingLocation.value = false
        },
        (error) => {
          console.error('Geolocation error:', error)
          showMessage('Nije moguće dobiti trenutnu lokaciju', 'error')
          gettingLocation.value = false
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }

    const clearPosition = async () => {
      try {
        const result = await positionAPI.setCurrentPosition(0, 0)
        
        if (result.success) {
          currentPosition.value = {
            latitude: null,
            longitude: null
          }
          
          vectorSource.value?.clear()
          showMessage('Pozicija je uklonjena')
        } else {
          showMessage(result.error, 'error')
        }
      } catch (error) {
        console.error('Clear position error:', error)
        showMessage('Greška prilikom uklanjanja pozicije', 'error')
      }
    }

    onMounted(async () => {
      // Check if user is tourist
      if (authStore.user?.role !== 'turista') {
        showMessage('Simulator pozicije je dostupan samo turistima', 'warning')
        return
      }

      initializeMap()
      await loadCurrentPosition()
    })

    onUnmounted(() => {
      if (map.value) {
        map.value.dispose()
      }
    })

    return {
      mapContainer,
      currentPosition,
      gettingLocation,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      getCurrentLocation,
      clearPosition
    }
  }
}
</script>

<style scoped>
.position-map {
  border-radius: 4px;
}

.v-chip {
  font-family: 'Courier New', monospace;
}
</style>