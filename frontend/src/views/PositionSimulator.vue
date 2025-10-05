<template>
  <v-container fluid class="modern-container">
    <!-- Modern Header -->
    <div class="header-section mb-8">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="40" color="white">mdi-crosshairs-gps</v-icon>
        </div>
        <div class="header-text">
          <h1 class="text-h4 font-weight-bold mb-2">Simulator pozicije</h1>
          <p class="text-body-1 opacity-80">
            Postavite svoju trenutnu poziciju za simulaciju GPS lokacije tokom tura
          </p>
        </div>
        <div class="header-status">
          <div class="status-card" :class="{ 'active': hasPosition }">
            <div class="status-icon">
              <v-icon 
                :color="hasPosition ? 'success' : 'warning'" 
                size="24"
              >
                {{ hasPosition ? 'mdi-map-marker-check' : 'mdi-map-marker-off' }}
              </v-icon>
            </div>
            <div class="status-content">
              <div class="status-label">Status pozicije</div>
              <div class="status-value" :class="{ 'active': hasPosition }">
                {{ hasPosition ? 'Postavljena' : 'Nije postavljena' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-layout">
      <!-- Position Control Panel -->
      <div class="control-panel">
        <div class="panel-header">
          <h2 class="panel-title">Kontrola pozicije</h2>
          <v-chip 
            :color="hasPosition ? 'success' : 'warning'" 
            variant="tonal" 
            size="small"
          >
            {{ hasPosition ? 'Aktivna' : 'Neaktivna' }}
          </v-chip>
        </div>
        
        <!-- Current Position Display -->
        <div class="position-display">
          <div class="display-header">
            <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
            <span class="display-title">Trenutna pozicija</span>
          </div>
          <div class="coordinates-container">
            <div v-if="hasPosition" class="coordinates">
              <div class="coordinate-item">
                <span class="coordinate-label">Lat:</span>
                <span class="coordinate-value">{{ currentPosition.latitude.toFixed(6) }}</span>
              </div>
              <div class="coordinate-item">
                <span class="coordinate-label">Lng:</span>
                <span class="coordinate-value">{{ currentPosition.longitude.toFixed(6) }}</span>
              </div>
            </div>
            <div v-else class="no-position">
              <v-icon class="mr-2" color="grey">mdi-map-marker-off</v-icon>
              <span>Pozicija nije postavljena</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <v-btn
            color="primary"
            prepend-icon="mdi-crosshairs-gps"
            @click="getCurrentLocation"
            :loading="gettingLocation"
            size="large"
            variant="elevated"
            class="location-btn"
          >
            Koristi GPS lokaciju
          </v-btn>
          
          <v-btn
            v-if="hasPosition"
            color="error"
            prepend-icon="mdi-delete"
            @click="clearPosition"
            size="large"
            variant="outlined"
            class="clear-btn"
          >
            Ukloni poziciju
          </v-btn>
        </div>

        <!-- Instructions Card -->
        <div class="instructions-card">
          <div class="instructions-header">
            <v-icon class="mr-2" color="info">mdi-information</v-icon>
            <span class="instructions-title">Kako koristiti</span>
          </div>
          <div class="instructions-list">
            <div class="instruction-item">
              <v-icon size="16" color="primary" class="mr-2">mdi-mouse</v-icon>
              <span>Kliknite na mapu da postavite poziciju</span>
            </div>
            <div class="instruction-item">
              <v-icon size="16" color="primary" class="mr-2">mdi-crosshairs-gps</v-icon>
              <span>Koristite GPS za automatsko postavljanje</span>
            </div>
            <div class="instruction-item">
              <v-icon size="16" color="primary" class="mr-2">mdi-map-marker</v-icon>
              <span>Pozicija se koristi za simulaciju tokom tura</span>
            </div>
            <div class="instruction-item">
              <v-icon size="16" color="primary" class="mr-2">mdi-refresh</v-icon>
              <span>Možete promeniti poziciju u bilo kom trenutku</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Panel -->
      <div class="map-panel">
        <div class="panel-header">
          <h2 class="panel-title">Interaktivna mapa</h2>
          <div class="map-actions">
            <v-btn
              icon="mdi-crosshairs"
              variant="outlined"
              size="small"
              @click="centerMapOnPosition"
              :disabled="!hasPosition"
              class="center-btn"
            />
          </div>
        </div>
        
        <div class="map-container">
          <div 
            ref="mapContainer" 
            class="position-map"
          />
          <div v-if="!hasPosition" class="map-overlay">
            <div class="overlay-content">
              <v-icon size="64" color="primary" class="opacity-60">mdi-map-marker-plus</v-icon>
              <h3 class="overlay-title">Kliknite na mapu</h3>
              <p class="overlay-description">da postavite svoju poziciju</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modern Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="5000"
      location="top"
      class="modern-snackbar"
      variant="elevated"
    >
      <div class="snackbar-content">
        <v-icon 
          :color="snackbarColor === 'error' ? 'error' : snackbarColor === 'warning' ? 'warning' : 'success'" 
          class="mr-2"
        >
          {{ getSnackbarIcon() }}
        </v-icon>
        {{ snackbarMessage }}
      </div>
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
          icon="mdi-close"
          size="small"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

    // Computed properties
    const hasPosition = computed(() => {
      return currentPosition.value.latitude !== null && currentPosition.value.longitude !== null
    })

    const showMessage = (message, color = 'success') => {
      snackbarMessage.value = message
      snackbarColor.value = color
      showSnackbar.value = true
    }

    const getSnackbarIcon = () => {
      switch (snackbarColor.value) {
        case 'error':
          return 'mdi-alert-circle'
        case 'warning':
          return 'mdi-alert'
        case 'success':
        default:
          return 'mdi-check-circle'
      }
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

    const centerMapOnPosition = () => {
      if (hasPosition.value && map.value) {
        const coordinates = fromLonLat([currentPosition.value.longitude, currentPosition.value.latitude])
        map.value.getView().animate({
          center: coordinates,
          zoom: 15,
          duration: 1000
        })
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
      hasPosition,
      getCurrentLocation,
      clearPosition,
      centerMapOnPosition,
      getSnackbarIcon
    }
  }
}
</script>

<style scoped>
.modern-container {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%);
  min-height: 100vh;
  padding: 2rem 1rem;
}

/* Header Section */
.header-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(156, 39, 176, 1) 100%);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.3);
}

.header-text {
  flex: 1;
  min-width: 300px;
}

.header-status {
  display: flex;
  align-items: center;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 2px solid rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
}

.status-card.active {
  border-color: rgba(76, 175, 80, 0.5);
  background: rgba(76, 175, 80, 0.1);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-content {
  text-align: left;
}

.status-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.25rem;
}

.status-value {
  font-weight: 600;
  font-size: 1rem;
  color: rgb(var(--v-theme-warning));
}

.status-value.active {
  color: rgb(var(--v-theme-success));
}

/* Content Layout */
.content-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

/* Control Panel */
.control-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.panel-header {
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-radius: 24px 24px 0 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
}

/* Position Display */
.position-display {
  padding: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.display-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.display-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.8);
}

.coordinates-container {
  background: rgba(25, 118, 210, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.coordinates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.coordinate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.coordinate-label {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
}

.coordinate-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  font-size: 0.95rem;
}

.no-position {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: rgba(0, 0, 0, 0.6);
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.location-btn {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(156, 39, 176, 1) 100%);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.4);
  border-radius: 16px;
  font-weight: 600;
}

.location-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(25, 118, 210, 0.5);
}

.clear-btn {
  border-radius: 16px;
  font-weight: 600;
}

/* Instructions Card */
.instructions-card {
  padding: 2rem;
}

.instructions-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.instructions-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.8);
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.instruction-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(33, 150, 243, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.1);
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
}

/* Map Panel */
.map-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
}

.map-actions {
  display: flex;
  gap: 0.5rem;
}

.center-btn {
  border-radius: 12px;
}

.map-container {
  position: relative;
  height: 600px;
  overflow: hidden;
}

.position-map {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  text-align: center;
  padding: 2rem;
}

.overlay-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: rgba(0, 0, 0, 0.8);
}

.overlay-description {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

/* Snackbar */
.modern-snackbar {
  border-radius: 16px;
}

.snackbar-content {
  display: flex;
  align-items: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .control-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .modern-container {
    padding: 1rem 0.5rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .header-status {
    width: 100%;
    justify-content: center;
  }
  
  .status-card {
    width: 100%;
    justify-content: center;
  }
  
  .content-layout {
    gap: 1.5rem;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-buttons {
    padding: 1.5rem;
  }
  
  .map-container {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 1.5rem;
  }
  
  .position-display,
  .action-buttons,
  .instructions-card {
    padding: 1.5rem;
  }
  
  .coordinates {
    gap: 0.5rem;
  }
  
  .coordinate-item {
    padding: 0.5rem;
  }
  
  .instructions-list {
    gap: 0.75rem;
  }
  
  .instruction-item {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
}
</style>