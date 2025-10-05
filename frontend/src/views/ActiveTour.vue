<template>
  <div class="modern-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="40" color="white">mdi-map-marker-path</v-icon>
        </div>
        
        <div class="header-text">
          <h1 class="header-title">{{ tour?.name || 'Aktivna Tura' }}</h1>
          <p class="header-description">
            Pratite napredak kroz aktivnu turu i posetite sve ključne tačke
          </p>
        </div>
        
        <div class="header-status">
          <div class="status-card" :class="{ active: execution && !isPaused }">
            <div class="status-icon">
              <v-icon :color="getStatusIconColor()" size="24">
                {{ getStatusIcon() }}
              </v-icon>
            </div>
            <div class="status-content">
              <div class="status-label">Status ture</div>
              <div class="status-value" :class="{ active: execution && !isPaused }">
                {{ executionStatusText }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="progress-overview">
        <div class="progress-stats">
          <div class="stat-card duration">
            <div class="stat-icon">
              <v-icon color="blue" size="24">mdi-clock-outline</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">Trajanje</div>
              <div class="stat-value">{{ formatDuration(execution?.duration_minutes) }}</div>
            </div>
          </div>

          <div class="stat-card distance">
            <div class="stat-icon">
              <v-icon color="green" size="24">mdi-map-marker-distance</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">Pređeno</div>
              <div class="stat-value">{{ execution?.distance_covered?.toFixed(0) || 0 }}m</div>
            </div>
          </div>

          <div class="stat-card progress">
            <div class="stat-icon">
              <v-icon color="purple" size="24">mdi-checkbox-marked-circle</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">Napredak</div>
              <div class="stat-value">{{ keyPointsCompleted }}/{{ keyPoints?.length || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div class="progress-label">
            <span>Napredak ture</span>
            <span class="progress-percentage">{{ progressPercentage }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Layout -->
    <div class="content-layout">
      <!-- Map Section -->
      <div class="map-section">
        <div class="map-card">
          <div class="map-header">
            <h3 class="map-title">
              <v-icon left color="primary">mdi-map</v-icon>
              Mapa ture
            </h3>
            <div class="map-actions">
              <v-btn 
                v-if="!isSimulatorRunning && keyPoints.length > 0" 
                @click="startPositionTracking"
                variant="elevated"
                color="primary"
                size="small"
                class="action-btn"
              >
                <v-icon left size="18">mdi-play</v-icon>
                Pokreni simulaciju
              </v-btn>
              <v-btn 
                v-if="isSimulatorRunning" 
                @click="stopPositionSimulation"
                variant="elevated"
                color="error"
                size="small"
                class="action-btn"
              >
                <v-icon left size="18">mdi-stop</v-icon>
                Zaustavi simulaciju
              </v-btn>
            </div>
          </div>
          
          <div class="map-container">
            <div 
              ref="mapContainer" 
              class="tour-map"
            ></div>
          </div>
          
          <!-- Map Legend -->
          <div class="map-legend">
            <div class="legend-title">Legenda mape:</div>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-marker current"></div>
                <span>Vaša trenutna pozicija</span>
              </div>
              <div class="legend-item">
                <div class="legend-marker unvisited"></div>
                <span>Ključne tačke (neposećene)</span>
              </div>
              <div class="legend-item">
                <div class="legend-marker visited"></div>
                <span>Ključne tačke (posećene)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Points and Controls -->
      <div class="sidebar-section">
        <!-- Key Points -->
        <div class="keypoints-card">
          <div class="keypoints-header">
            <h3 class="keypoints-title">
              <v-icon left color="warning">mdi-map-marker-star</v-icon>
              Ključne tačke
            </h3>
            <v-chip 
              :color="keyPointsCompleted === keyPoints?.length ? 'success' : 'warning'"
              variant="elevated"
              size="small"
            >
              {{ keyPointsCompleted }}/{{ keyPoints?.length || 0 }}
            </v-chip>
          </div>
          
          <div class="keypoints-content">
            <div v-if="keyPoints?.length > 0" class="keypoints-list">
              <div 
                v-for="(keyPoint, index) in keyPoints" 
                :key="keyPoint.id"
                class="keypoint-item"
                :class="{ 
                  completed: isKeyPointCompleted(keyPoint.id), 
                  nearby: isNearKeyPoint(keyPoint) 
                }"
              >
                <div class="keypoint-status">
                  <v-icon 
                    :color="isKeyPointCompleted(keyPoint.id) ? 'success' : isNearKeyPoint(keyPoint) ? 'warning' : 'grey'"
                    size="20"
                  >
                    {{ isKeyPointCompleted(keyPoint.id) ? 'mdi-checkbox-marked-circle' : 'mdi-map-marker' }}
                  </v-icon>
                  <span class="keypoint-number">{{ index + 1 }}</span>
                </div>
                
                <div class="keypoint-info">
                  <div class="keypoint-name">
                    {{ keyPoint.name }}
                    <v-chip 
                      v-if="isNearKeyPoint(keyPoint)" 
                      color="warning" 
                      variant="elevated"
                      size="x-small" 
                    >
                      Blizu!
                    </v-chip>
                  </div>
                  
                  <div v-if="keyPoint.description" class="keypoint-description">
                    {{ keyPoint.description }}
                  </div>
                  
                  <div class="keypoint-coordinates">
                    {{ keyPoint.latitude?.toFixed(6) }}, {{ keyPoint.longitude?.toFixed(6) }}
                    <span v-if="currentLatitude && currentLongitude" class="distance">
                      ({{ calculateDistance(keyPoint.latitude, keyPoint.longitude).toFixed(0) }}m)
                    </span>
                  </div>
                </div>

                <div v-if="isNearKeyPoint(keyPoint) && !isKeyPointCompleted(keyPoint.id)" class="keypoint-action">
                  <v-btn 
                    @click="markKeyPointCompleted(keyPoint)"
                    color="success"
                    size="small"
                    variant="elevated"
                    class="visit-btn"
                  >
                    <v-icon left size="16">mdi-check</v-icon>
                    Poseti
                  </v-btn>
                </div>
              </div>
            </div>
            
            <div v-else class="no-keypoints">
              <div class="no-keypoints-icon">
                <v-icon size="64" color="grey-lighten-1">mdi-map-marker-off</v-icon>
              </div>
              <div class="no-keypoints-content">
                <h4 class="no-keypoints-title">Nema definisanih ključnih tačaka</h4>
                <p class="no-keypoints-description">
                  Autor ture još uvek nije definisao ključne tačke za ovu turu.
                </p>
                
                <div class="no-keypoints-actions">
                  <v-btn 
                    @click="generateTestKeyPoints"
                    color="primary"
                    variant="outlined"
                    class="test-btn"
                    v-if="tour && !keyPoints?.length"
                  >
                    <v-icon left>mdi-test-tube</v-icon>
                    Generiši test tačke
                  </v-btn>
                  
                  <v-btn 
                    @click="loadKeyPoints"
                    color="warning"
                    variant="outlined"
                    class="reload-btn"
                    v-if="tour"
                  >
                    <v-icon left>mdi-refresh</v-icon>
                    Reload tačke
                  </v-btn>
                </div>
                
                <!-- Debug info -->
                <div v-if="tour" class="debug-info">
                  <div class="debug-title">Debug informacije:</div>
                  <div class="debug-items">
                    <div>Tour ID: {{ tour.id }}</div>
                    <div>Tour Name: {{ tour.name }}</div>
                    <div>Tour Status: {{ tour.status }}</div>
                    <div>Key Points Length: {{ keyPoints?.length || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tour Controls -->
        <div class="controls-card">
          <div class="controls-header">
            <h3 class="controls-title">
              <v-icon left color="primary">mdi-controller</v-icon>
              Kontrole ture
            </h3>
          </div>
          
          <div class="controls-content">
            <v-btn 
              v-if="!execution"
              @click="startTour"
              color="success"
              :loading="loading"
              :disabled="!tour"
              variant="elevated"
              size="large"
              block
              class="control-btn start-btn"
            >
              <v-icon left>mdi-play</v-icon>
              Pokreni turu
            </v-btn>

            <div v-else class="active-controls">
              <v-btn 
                @click="pauseResumeTour"
                :color="isPaused ? 'success' : 'warning'"
                :loading="loading"
                variant="elevated"
                size="large"
                class="control-btn pause-btn"
              >
                <v-icon left>{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
                {{ isPaused ? 'Nastavi' : 'Pauziraj' }}
              </v-btn>

              <v-btn 
                @click="finishTour"
                color="error"
                :loading="loading"
                variant="elevated"
                size="large"
                class="control-btn finish-btn"
              >
                <v-icon left>mdi-stop</v-icon>
                Završi turu
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbars -->
    <v-snackbar
      v-model="showProgressSnackbar"
      :timeout="3000"
      color="success"
      location="bottom"
      class="modern-snackbar"
    >
      <div class="snackbar-content">
        <v-icon left color="white" size="20">mdi-check-circle</v-icon>
        {{ progressMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="showErrorSnackbar"
      :timeout="5000"
      color="error"
      location="bottom"
      class="modern-snackbar"
    >
      <div class="snackbar-content">
        <v-icon left color="white" size="20">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import tourExecutionAPI from '@/api/tourExecution'
import tourAPI from '@/api/tours'
import positionAPI from '@/api/position'
import positionSimulator from '@/utils/positionSimulator'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Icon } from 'ol/style'
import { Point } from 'ol/geom'
import { Feature } from 'ol'

export default {
  name: 'ActiveTour',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    
    // Map refs
    const mapContainer = ref(null)
    const map = ref(null)
    const vectorLayer = ref(null)
    const vectorSource = ref(null)
    const keyPointsLayer = ref(null)
    const keyPointsSource = ref(null)
    
    // Reactive state
    const tour = ref(null)
    const execution = ref(null)
    const keyPoints = ref([])
    const loading = ref(false)
    const currentLatitude = ref(null)
    const currentLongitude = ref(null)
    const completedKeyPoints = ref([])
    const isSimulatorRunning = ref(false)
    const isPaused = ref(false)
    
    // Snackbar state
    const showProgressSnackbar = ref(false)
    const showErrorSnackbar = ref(false)
    const progressMessage = ref('')
    const errorMessage = ref('')
    
    // Position update interval
    let positionUpdateInterval = null

    // Computed properties
    const executionStatusColor = computed(() => {
      if (!execution.value) return 'grey'
      switch (execution.value.status) {
        case 'active': return 'green'
        case 'completed': return 'blue'
        case 'abandoned': return 'red'
        default: return 'grey'
      }
    })

    const executionStatusText = computed(() => {
      if (!execution.value) return 'Nije pokrenuta'
      switch (execution.value.status) {
        case 'active': return isPaused.value ? 'Pauzirana' : 'Aktivna'
        case 'completed': return 'Završena'
        case 'abandoned': return 'Obustavljena'
        default: return 'Nepoznato'
      }
    })

    const keyPointsCompleted = computed(() => {
      return completedKeyPoints.value.length
    })

    const progressPercentage = computed(() => {
      if (!keyPoints.value || keyPoints.value.length === 0) return 0
      return Math.round((keyPointsCompleted.value / keyPoints.value.length) * 100)
    })

    // Helper methods for template
    const getStatusIcon = () => {
      if (!execution.value) return 'mdi-map-marker-off'
      if (isPaused.value) return 'mdi-pause-circle'
      switch (execution.value.status) {
        case 'active': return 'mdi-play-circle'
        case 'completed': return 'mdi-check-circle'
        case 'abandoned': return 'mdi-stop-circle'
        default: return 'mdi-help-circle'
      }
    }

    const getStatusIconColor = () => {
      if (!execution.value) return 'grey'
      if (isPaused.value) return 'warning'
      switch (execution.value.status) {
        case 'active': return 'success'
        case 'completed': return 'info'
        case 'abandoned': return 'error'
        default: return 'grey'
      }
    }

    // Methods
    const initializeMap = () => {
      if (!mapContainer.value) return

      // Create vector sources and layers
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

      keyPointsSource.value = new VectorSource()
      keyPointsLayer.value = new VectorLayer({
        source: keyPointsSource.value,
        style: (feature) => {
          const isCompleted = feature.get('completed')
          const color = isCompleted ? '#4CAF50' : '#2196F3' // Green if completed, blue if not
          
          return new Style({
            image: new Icon({
              src: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  ${isCompleted ? '<path fill="white" d="M9 12l2 2 4-4" stroke="white" stroke-width="1"/>' : ''}
                </svg>
              `),
              scale: 1.3,
              anchor: [0.5, 1]
            })
          })
        }
      })

      map.value = new Map({
        target: mapContainer.value,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          keyPointsLayer.value,
          vectorLayer.value
        ],
        view: new View({
          center: fromLonLat([19.8335, 45.2671]), // Novi Sad center
          zoom: 13
        })
      })
    }

    const updateCurrentPosition = (latitude, longitude) => {
      if (!vectorSource.value) return

      // Clear existing position marker
      vectorSource.value.clear()

      // Add new position marker with red color
      const marker = new Feature({
        geometry: new Point(fromLonLat([longitude, latitude]))
      })

      // Set red marker style for current position
      marker.setStyle(new Style({
        image: new Icon({
          src: 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="#FF4444" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              <circle cx="12" cy="9" r="3" fill="white"/>
            </svg>
          `),
          scale: 1.8,
          anchor: [0.5, 1]
        })
      }))

      // Store position data in marker
      marker.setProperties({
        type: 'currentPosition',
        latitude: latitude,
        longitude: longitude,
        timestamp: new Date().toISOString()
      })

      vectorSource.value.addFeature(marker)
      
      console.log(`Current position marker updated: ${latitude}, ${longitude}`)
    }

    const updateKeyPointsOnMap = () => {
      console.log('updateKeyPointsOnMap called')
      console.log('keyPointsSource exists:', !!keyPointsSource.value)
      console.log('keyPoints length:', keyPoints.value.length)
      console.log('map exists:', !!map.value)
      console.log('keyPoints data:', keyPoints.value)
      
      if (!keyPointsSource.value || !map.value) {
        console.log('Map or keyPointsSource not ready yet')
        return
      }

      if (!keyPoints.value || keyPoints.value.length === 0) {
        console.log('No key points to display')
        // Clear any existing markers
        keyPointsSource.value.clear()
        return
      }

      // Clear existing key points
      keyPointsSource.value.clear()
      console.log('Cleared existing markers')

      let markersAdded = 0

      // Add key points markers
      keyPoints.value.forEach((keyPoint, index) => {
        if (keyPoint.latitude && keyPoint.longitude && 
            !isNaN(keyPoint.latitude) && !isNaN(keyPoint.longitude)) {
          console.log(`Adding marker for: ${keyPoint.name} at ${keyPoint.latitude}, ${keyPoint.longitude}`)
          
          try {
            const marker = new Feature({
              geometry: new Point(fromLonLat([keyPoint.longitude, keyPoint.latitude]))
            })
            
            // Check if this key point is completed
            const isCompleted = completedKeyPoints.value.some(cp => cp.keyPointId === keyPoint.id)
            
            // Store key point data in marker for tooltip/popup and styling
            marker.setProperties({
              keyPointId: keyPoint.id,
              name: keyPoint.name,
              description: keyPoint.description,
              index: index + 1,
              completed: isCompleted
            })

            keyPointsSource.value.addFeature(marker)
            markersAdded++
            console.log(`Marker added for ${keyPoint.name} (completed: ${isCompleted})`)
          } catch (error) {
            console.error(`Error adding marker for ${keyPoint.name}:`, error)
          }
        } else {
          console.log(`Skipping marker for ${keyPoint.name} - invalid coordinates:`, 
                     keyPoint.latitude, keyPoint.longitude)
        }
      })

      console.log(`Total markers added: ${markersAdded}`)

      // Fit map view to include all key points only if we have valid markers
      if (markersAdded > 0) {
        try {
          const extent = keyPointsSource.value.getExtent()
          console.log('Fitting map to extent:', extent)
          
          // Check if extent is valid (not empty)
          if (extent && extent.length === 4 && 
              extent[0] !== Infinity && extent[1] !== Infinity &&
              extent[2] !== -Infinity && extent[3] !== -Infinity) {
            map.value.getView().fit(extent, { 
              padding: [50, 50, 50, 50],
              maxZoom: 15 
            })
          } else {
            console.log('Invalid extent, centering on first key point')
            // Center on first key point if extent is invalid
            const firstPoint = keyPoints.value[0]
            map.value.getView().setCenter(fromLonLat([firstPoint.longitude, firstPoint.latitude]))
            map.value.getView().setZoom(13)
          }
        } catch (error) {
          console.error('Error fitting map view:', error)
          // Fallback: center on Novi Sad
          map.value.getView().setCenter(fromLonLat([19.8335, 45.2671]))
          map.value.getView().setZoom(12)
        }
      } else {
        console.log('No valid markers added, keeping default view')
      }
      
      console.log('Key points update completed')
    }

    const loadUserPosition = async () => {
      try {
        console.log('Loading user position...')
        const result = await positionAPI.getCurrentPosition()
        
        if (result.success && result.data && result.data.latitude && result.data.longitude) {
          currentLatitude.value = result.data.latitude
          currentLongitude.value = result.data.longitude
          
          console.log(`User position loaded: ${result.data.latitude}, ${result.data.longitude}`)
          
          // Update current position marker immediately
          updateCurrentPosition(result.data.latitude, result.data.longitude)
        } else {
          console.log('No user position found, using default (Novi Sad center)')
          // Default to Novi Sad center if no position is set
          currentLatitude.value = 45.2671
          currentLongitude.value = 19.8335
          
          updateCurrentPosition(45.2671, 19.8335)
        }
      } catch (error) {
        console.error('Error loading user position:', error)
        // Fallback to default position
        currentLatitude.value = 45.2671
        currentLongitude.value = 19.8335
        updateCurrentPosition(45.2671, 19.8335)
      }
    }

    const showError = (message) => {
      errorMessage.value = message
      showErrorSnackbar.value = true
    }

    const showProgress = (message) => {
      progressMessage.value = message
      showProgressSnackbar.value = true
    }

    const loadTour = async () => {
      const tourId = route.params.tourId
      if (!tourId) {
        showError('ID ture nije specifisan')
        return
      }

      try {
        loading.value = true
        const result = await tourAPI.getTourById(tourId)
        
        if (result.success) {
          tour.value = result.data
          console.log('Loaded tour:', tour.value)
          // Load key points separately
          await loadKeyPoints()
        } else {
          showError(result.error || 'Greška pri učitavanju ture')
          console.error('Tour loading failed:', result.error)
        }
      } catch (error) {
        showError('Greška pri učitavanju ture')
        console.error('Load tour error:', error)
      } finally {
        loading.value = false
      }
    }

    const loadKeyPoints = async () => {
      if (!tour.value) return

      try {
        console.log('Loading key points for tour:', tour.value.id)
        const result = await tourAPI.getTourKeyPoints(tour.value.id)
        
        console.log('Key points API response:', result)
        
        if (result.success) {
          // Extract keyPoints array from the response
          keyPoints.value = result.data.keyPoints || result.data || []
          console.log('Key points loaded:', keyPoints.value)
          console.log('Key points count:', keyPoints.value.length)
          
          // Log each key point for debugging
          keyPoints.value.forEach((kp, index) => {
            console.log(`Key Point ${index + 1}:`, {
              id: kp.id,
              name: kp.name,
              description: kp.description,
              latitude: kp.latitude,
              longitude: kp.longitude,
              order: kp.order
            })
          })
          
          // Update map with key points - with delay to ensure map is ready
          setTimeout(() => {
            console.log('Calling updateKeyPointsOnMap from loadKeyPoints')
            if (map.value && keyPointsSource.value) {
              updateKeyPointsOnMap()
            }
          }, 500)
        } else {
          console.error('Failed to load key points:', result.error)
          keyPoints.value = []
        }
      } catch (error) {
        console.error('Load key points error:', error)
        keyPoints.value = []
      }
    }

    const checkActiveExecution = async () => {
      if (!tour.value) return

      try {
        const result = await tourExecutionAPI.getActiveExecution(tour.value.id)
        
        if (result.success) {
          execution.value = result.data
          // Update completed key points from execution data
          completedKeyPoints.value = result.data.completedKeyPoints || []
          console.log('Found active execution:', execution.value)
          console.log('Completed key points:', completedKeyPoints.value)
        } else {
          console.log('No active execution found')
        }
      } catch (error) {
        console.error('Check active execution error:', error)
      }
    }

    const startTour = async () => {
      if (!tour.value) return

      try {
        loading.value = true
        
        console.log('Starting tour with ID:', tour.value.id, 'Position:', currentLatitude.value, currentLongitude.value)
        
        const result = await tourExecutionAPI.startTour(
          tour.value.id,
          currentLatitude.value,
          currentLongitude.value
        )

        console.log('Start tour result:', result)

        if (result.success) {
          execution.value = result.data
          console.log('Execution set to:', execution.value)
          completedKeyPoints.value = []
          showProgress('Tura je uspešno pokrenuta!')
          
          // Pokreni pozicionu simulaciju
          setTimeout(() => {
            setupPositionSimulation()
          }, 1000)
        } else {
          console.error('Start tour failed:', result.error)
          showError(result.error || 'Greška pri pokretanju ture')
        }
      } catch (error) {
        showError('Greška pri pokretanju ture')
        console.error('Start tour error:', error)
      } finally {
        loading.value = false
      }
    }

    const finishTour = async () => {
      if (!execution.value) return

      try {
        loading.value = true
        
        const result = await tourExecutionAPI.finishTour(execution.value.id, 'completed')

        if (result.success) {
          execution.value = result.data
          showProgress('Tura je uspešno završena!')
          stopPositionSimulation()
          
          // Redirektuj na pregled kupljenih tura
          setTimeout(() => {
            router.push('/my-purchases')
          }, 2000)
        } else {
          showError(result.error || 'Greška pri završavanju ture')
        }
      } catch (error) {
        showError('Greška pri završavanju ture')
        console.error('Finish tour error:', error)
      } finally {
        loading.value = false
      }
    }

    const pauseResumeTour = () => {
      isPaused.value = !isPaused.value
      
      if (isPaused.value) {
        stopPositionSimulation()
        showProgress('Tura je pauzirana')
      } else {
        startPositionTracking()
        showProgress('Tura je nastavljena')
      }
    }

    const setupPositionSimulation = () => {
      if (!execution.value) return

      // Registruj callback za primanje pozicija (samo manuelne promene pozicije)
      positionSimulator.onPositionUpdate(handlePositionUpdate)
      
      // Pokreni regularno praćenje pozicije (bez automatskog kretanja)
      startPositionTracking()
    }

    const startPositionTracking = () => {
      // NE pokrećemo automatsko kretanje - korisnik treba manuelno da klikne na PositionSimulator mapu
      isSimulatorRunning.value = true
      
      // Pokreni regularno ažuriranje pozicije (svakih 10 sekundi)
      if (positionUpdateInterval) {
        clearInterval(positionUpdateInterval)
      }
      
      positionUpdateInterval = setInterval(async () => {
        if (execution.value && !isPaused.value) {
          try {
            // Prvo pita Position Simulator gde se nalazi
            const positionResult = await positionAPI.getCurrentPosition()
            
            if (positionResult.success && positionResult.data && positionResult.data.latitude && positionResult.data.longitude) {
              const lat = positionResult.data.latitude
              const lng = positionResult.data.longitude
              
              console.log(`Position fetched from simulator: ${lat}, ${lng}`)
              
              // Update local position
              currentLatitude.value = lat
              currentLongitude.value = lng
              updateCurrentPosition(lat, lng)
              
              // Then send new position to backend for proximity check
              await updatePosition(lat, lng)
              await checkKeyPointsProximity(lat, lng)
            } else {
              console.log('No position available from simulator')
            }
          } catch (error) {
            console.error('Error during position update cycle:', error)
          }
        }
      }, 10000) // Svakých 10 sekundi
      
      console.log('Position tracking started - user needs to manually set position in PositionSimulator')
    }

    const stopPositionSimulation = () => {
      positionSimulator.stop()
      isSimulatorRunning.value = false
      
      if (positionUpdateInterval) {
        clearInterval(positionUpdateInterval)
        positionUpdateInterval = null
      }
    }

    const handlePositionUpdate = (position) => {
      currentLatitude.value = position.latitude
      currentLongitude.value = position.longitude
      
      console.log('Position updated by simulator:', position)
      
      // Update position on map
      updateCurrentPosition(position.latitude, position.longitude)
      
      // Update last activity timestamp regardless of pause state
      if (execution.value) {
        execution.value.lastActivity = new Date().toISOString()
      }
    }

    const updatePosition = async (latitude, longitude) => {
      if (!execution.value) return

      try {
        const result = await tourExecutionAPI.updatePosition(execution.value.id, latitude, longitude)
        
        if (result.success) {
          // Ažuriraj execution podatke
          execution.value = { ...execution.value, ...result.data }
          console.log('Position updated on server:', result.data)
        } else {
          console.error('Failed to update position:', result.error)
        }
      } catch (error) {
        console.error('Update position error:', error)
      }
    }

    const checkKeyPointsProximity = async (latitude, longitude) => {
      if (!execution.value) {
        console.log('checkKeyPointsProximity: No execution found')
        return
      }

      console.log(`checkKeyPointsProximity: Checking proximity for position ${latitude}, ${longitude}`)

      try {
        const result = await tourExecutionAPI.checkKeyPoints(execution.value.id, latitude, longitude, 50)
        
        console.log('checkKeyPointsProximity result:', result)
        console.log('Result data details:', JSON.stringify(result.data, null, 2))
        
        if (result.success && result.data) {
          // Update all key points with completion status
          if (result.data.allKeyPoints) {
            // Merge with existing key points to preserve UI state
            keyPoints.value = keyPoints.value.map(kp => {
              const updatedKp = result.data.allKeyPoints.find(ukp => ukp.id === kp.id)
              return updatedKp ? { ...kp, ...updatedKp } : kp
            })
          }

          // Handle new completions
          if (result.data.newCompletions && result.data.newCompletions.length > 0) {
            console.log('New completions found:', result.data.newCompletions)
            result.data.newCompletions.forEach(completion => {
              // Add to completed key points if not already there
              if (!completedKeyPoints.value.find(cp => cp.keyPointId === completion.keyPointId)) {
                completedKeyPoints.value.push({
                  keyPointId: completion.keyPointId,
                  completedAt: completion.completedAt
                })
                console.log(`Key point completed: ${completion.keyPointName}`)
                showProgress(`Posećena ključna tačka: ${completion.keyPointName}`)
              }
            })
            
            // Update map to reflect completion status
            setTimeout(() => {
              if (map.value && keyPointsSource.value) {
                updateKeyPointsOnMap()
              }
            }, 100)
          } else {
            console.log('No new completions found')
          }

          // Update nearby key points for UI indicators
          if (result.data.nearbyKeyPoints && result.data.nearbyKeyPoints.length > 0) {
            result.data.nearbyKeyPoints.forEach(nearbyKp => {
              console.log(`Blizu ključne tačke: ${nearbyKp.name} (${nearbyKp.distance?.toFixed(0)}m)`)
            })
          }
        }
      } catch (error) {
        console.error('Check key points error:', error)
      }
    }

    const markKeyPointCompleted = async (keyPoint) => {
      if (!execution.value || isKeyPointCompleted(keyPoint.id)) return

      try {
        const result = await tourExecutionAPI.checkKeyPoints(
          execution.value.id, 
          currentLatitude.value, 
          currentLongitude.value, 
          100 // Veći radius za manuelno označavanje
        )

        if (result.success && result.data.newCompletions) {
          // Check if this specific key point was completed
          const completedNow = result.data.newCompletions.find(comp => comp.keyPointId === keyPoint.id)
          
          if (completedNow) {
            completedKeyPoints.value.push({
              keyPointId: keyPoint.id,
              completedAt: completedNow.completedAt
            })
            showProgress(`Ključna tačka "${keyPoint.name}" je označena kao posećena!`)
          } else {
            // If not automatically completed, manually add it (for testing purposes)
            completedKeyPoints.value.push({
              keyPointId: keyPoint.id,
              completedAt: new Date().toISOString()
            })
            showProgress(`Ključna tačka "${keyPoint.name}" je manuelno označena kao posećena!`)
          }
        }
      } catch (error) {
        console.error('Mark key point completed error:', error)
        showError('Greška pri označavanju ključne tačke')
      }
    }

    const isKeyPointCompleted = (keyPointId) => {
      return completedKeyPoints.value.some(cp => cp.keyPointId === keyPointId)
    }

    const isNearKeyPoint = (keyPoint) => {
      if (!currentLatitude.value || !currentLongitude.value) return false
      
      const distance = calculateDistance(keyPoint.latitude, keyPoint.longitude)
      return distance <= 50 // 50 metara
    }

    const calculateDistance = (lat, lng) => {
      if (!currentLatitude.value || !currentLongitude.value) return Infinity
      
      return positionSimulator.calculateDistance(
        currentLatitude.value,
        currentLongitude.value,
        lat,
        lng
      )
    }

    const formatDuration = (minutes) => {
      if (!minutes) return 'N/A'
      
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      
      if (hours > 0) {
        return `${hours}h ${mins}min`
      }
      return `${mins}min`
    }

    const generateTestKeyPoints = () => {
      // Generiši test ključne tačke za development
      if (tour.value) {
        keyPoints.value = [
          {
            id: 1,
            name: 'Petrovaradin Fortress',
            description: 'Istorijska tvrđava iz 18. veka',
            latitude: 45.2530,
            longitude: 19.8633,
            order: 0
          },
          {
            id: 2,
            name: 'Trg Slobode',
            description: 'Glavni gradski trg',
            latitude: 45.2671,
            longitude: 19.8335,
            order: 1
          },
          {
            id: 3,
            name: 'Štrand Beach',
            description: 'Popularna plaža na Dunavu',
            latitude: 45.2396,
            longitude: 19.8227,
            order: 2
          },
          {
            id: 4,
            name: 'Dunavski Park',
            description: 'Centralni gradski park',
            latitude: 45.2658,
            longitude: 19.8317,
            order: 3
          }
        ]
        
        showProgress('Test ključne tačke su generirane!')
        console.log('Generated test key points:', keyPoints.value)
        
        // Odmah ažuriraj mapu
        setTimeout(() => {
          updateKeyPointsOnMap()
          console.log('Map updated with test key points')
        }, 100)
      }
    }

    // Lifecycle hooks
    onMounted(async () => {
      console.log('ActiveTour mounted')
      initializeMap()
      
      // Load user position first
      await loadUserPosition()
      
      await loadTour()
      await checkActiveExecution()
      
      // Ako već postoji aktivna sesija, pripremi simulaciju
      if (execution.value && tour.value) {
        setupPositionSimulation()
      }
      
      // Ažuriraj mapu nakon što se sve učita, ali samo ako imamo podatke
      setTimeout(() => {
        if (map.value && keyPointsSource.value) {
          updateKeyPointsOnMap()
        }
      }, 1000)
    })

    // Watch for keyPoints changes
    watch(keyPoints, () => {
      console.log('Key points changed, updating map')
      setTimeout(() => {
        if (map.value && keyPointsSource.value) {
          updateKeyPointsOnMap()
        } else {
          console.log('Map or keyPointsSource not ready yet')
        }
      }, 100)
    }, { deep: true })

    onUnmounted(() => {
      stopPositionSimulation()
      positionSimulator.reset()
      
      if (map.value) {
        map.value.dispose()
      }
    })

    return {
      mapContainer,
      tour,
      keyPoints,
      execution,
      loading,
      currentLatitude,
      currentLongitude,
      completedKeyPoints,
      isSimulatorRunning,
      isPaused,
      showProgressSnackbar,
      showErrorSnackbar,
      progressMessage,
      errorMessage,
      executionStatusColor,
      executionStatusText,
      keyPointsCompleted,
      progressPercentage,
      getStatusIcon,
      getStatusIconColor,
      startTour,
      finishTour,
      pauseResumeTour,
      startPositionTracking,
      stopPositionSimulation,
      markKeyPointCompleted,
      isKeyPointCompleted,
      isNearKeyPoint,
      calculateDistance,
      formatDuration,
      generateTestKeyPoints,
      loadKeyPoints
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
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
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

.header-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: rgba(0, 0, 0, 0.87);
}

.header-description {
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
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

/* Progress Overview */
.progress-overview {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 2rem;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card.duration {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.stat-card.distance {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.stat-card.progress {
  border-left: 4px solid rgb(var(--v-theme-secondary));
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  text-align: left;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-weight: 600;
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.87);
}

/* Progress Bar */
.progress-bar-container {
  margin-top: 1rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
}

.progress-percentage {
  font-size: 1.1rem;
  color: rgb(var(--v-theme-primary));
}

.progress-bar {
  height: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)) 0%, rgba(156, 39, 176, 1) 100%);
  border-radius: 6px;
  transition: width 0.8s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Content Layout */
.content-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

/* Map Section */
.map-section {
  min-height: 600px;
}

.map-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

.map-header {
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.map-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
}

.map-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
}

.map-container {
  height: 500px;
  position: relative;
}

.tour-map {
  width: 100%;
  height: 100%;
}

.map-legend {
  padding: 1.5rem 2rem;
  background: rgba(248, 249, 250, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 1rem;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.7);
}

.legend-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.legend-marker.current {
  background-color: #FF4444;
}

.legend-marker.unvisited {
  background-color: #2196F3;
}

.legend-marker.visited {
  background-color: #4CAF50;
}

/* Sidebar Section */
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Key Points Card */
.keypoints-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.keypoints-header {
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.keypoints-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
}

.keypoints-content {
  padding: 2rem;
}

.keypoints-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.keypoint-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.keypoint-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.keypoint-item.completed {
  border-color: rgba(76, 175, 80, 0.5);
  background: rgba(76, 175, 80, 0.05);
}

.keypoint-item.nearby {
  border-color: rgba(255, 152, 0, 0.5);
  background: rgba(255, 152, 0, 0.05);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.keypoint-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 40px;
}

.keypoint-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
}

.keypoint-info {
  flex: 1;
  min-width: 0;
}

.keypoint-name {
  font-weight: 600;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.keypoint-description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.keypoint-coordinates {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.5);
  font-family: 'Courier New', monospace;
}

.distance {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.keypoint-action {
  display: flex;
  align-items: center;
}

.visit-btn {
  border-radius: 12px;
  font-weight: 600;
}

/* No Key Points */
.no-keypoints {
  text-align: center;
  padding: 2rem;
}

.no-keypoints-icon {
  margin-bottom: 1.5rem;
}

.no-keypoints-content {
  max-width: 300px;
  margin: 0 auto;
}

.no-keypoints-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  margin: 0 0 1rem 0;
}

.no-keypoints-description {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.no-keypoints-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.test-btn,
.reload-btn {
  border-radius: 12px;
  font-weight: 600;
}

.debug-info {
  text-align: left;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.8rem;
}

.debug-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.debug-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Controls Card */
.controls-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.controls-header {
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.controls-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
}

.controls-content {
  padding: 2rem;
}

.control-btn {
  border-radius: 16px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.start-btn {
  background: linear-gradient(135deg, rgb(var(--v-theme-success)) 0%, rgba(76, 175, 80, 0.8) 100%);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(76, 175, 80, 0.5);
}

.active-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pause-btn {
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3);
}

.pause-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 152, 0, 0.4);
}

.finish-btn {
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
}

.finish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(244, 67, 54, 0.4);
}

/* Snackbars */
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
  
  .sidebar-section {
    order: -1;
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
  
  .progress-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .map-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .map-container {
    height: 400px;
  }
  
  .keypoints-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .keypoint-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .keypoint-status {
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }
  
  .active-controls {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 1.5rem;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .progress-overview {
    padding-top: 1.5rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .map-header,
  .keypoints-header,
  .controls-header {
    padding: 1.5rem;
  }
  
  .keypoints-content,
  .controls-content {
    padding: 1.5rem;
  }
  
  .keypoint-item {
    padding: 1rem;
  }
  
  .no-keypoints {
    padding: 1.5rem;
  }
}
</style>