<template>
  <div class="acti            <span>Ključne tačke: {{ keyPointsCompleted }}/{{ keyPoints?.length || 0 }}</span>e-tour">
    <!-- Header sa osnovnim informacijama -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon left color="green">mdi-map-marker-path</v-icon>
        <span>{{ tour?.name || 'Tura' }}</span>
        <v-spacer></v-spacer>
        <v-chip 
          :color="executionStatusColor" 
          :text-color="executionStatusColor === 'yellow' ? 'black' : 'white'"
          small
        >
          {{ executionStatusText }}
        </v-chip>
      </v-card-title>
      
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-icon left small>mdi-clock-outline</v-icon>
          <span>Trajanje: {{ formatDuration(execution?.duration_minutes) }}</span>
        </div>
        
        <div class="d-flex align-center mb-2">
          <v-icon left small>mdi-map-marker-distance</v-icon>
          <span>Pređeno: {{ execution?.distance_covered?.toFixed(0) || 0 }}m</span>
        </div>

        <div v-if="keyPointsCompleted > 0" class="d-flex align-center">
          <v-icon left small>mdi-checkbox-marked-circle</v-icon>
          <span>Ključne tačke: {{ keyPointsCompleted }}/{{ tour?.key_points?.length || 0 }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- Mapa -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-map</v-icon>
        Mapa ture
      </v-card-title>
      
      <v-card-text>
        <div 
          ref="mapContainer" 
          class="tour-map"
          style="height: 400px; width: 100%;"
        ></div>
        
        <!-- Map controls overlay -->
        <div class="d-flex justify-center mt-3">
          <v-btn 
            v-if="!isSimulatorRunning && keyPoints.length > 0" 
            @click="startPositionSimulation"
            color="primary"
            prepend-icon="mdi-play"
          >
            Pokreni simulaciju
          </v-btn>
          <v-btn 
            v-if="isSimulatorRunning" 
            @click="stopPositionSimulation"
            color="red"
            prepend-icon="mdi-stop"
          >
            Zaustavi simulaciju
          </v-btn>
        </div>
        
        <!-- Map legend -->
        <div class="mt-3 pa-3 bg-grey-lighten-4 rounded">
          <div class="text-caption font-weight-bold mb-2">Legenda mape:</div>
          <div class="d-flex align-center mb-1">
            <div class="marker-legend-icon red mr-2"></div>
            <span class="text-caption">Vaša trenutna pozicija</span>
          </div>
          <div class="d-flex align-center mb-1">
            <div class="marker-legend-icon blue mr-2"></div>
            <span class="text-caption">Ključne tačke (neposećene)</span>
          </div>
          <div class="d-flex align-center">
            <div class="marker-legend-icon green mr-2"></div>
            <span class="text-caption">Ključne tačke (posećene)</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Ključne tačke -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-map-marker-star</v-icon>
        Ključne tačke
      </v-card-title>
      
      <v-card-text>
        <v-list v-if="keyPoints?.length > 0">
          <v-list-item 
            v-for="(keyPoint, index) in keyPoints" 
            :key="keyPoint.id"
            class="mb-2"
          >
            <template v-slot:prepend>
              <v-icon 
                :color="isKeyPointCompleted(keyPoint.id) ? 'green' : isNearKeyPoint(keyPoint) ? 'orange' : 'grey'"
              >
                {{ isKeyPointCompleted(keyPoint.id) ? 'mdi-checkbox-marked-circle' : 'mdi-map-marker' }}
              </v-icon>
            </template>
            
            <v-list-item-title>
              {{ keyPoint.name }}
              <v-chip 
                v-if="isNearKeyPoint(keyPoint)" 
                color="orange" 
                text-color="white" 
                size="x-small" 
                class="ml-2"
              >
                Blizu!
              </v-chip>
            </v-list-item-title>
            
            <v-list-item-subtitle v-if="keyPoint.description">
              {{ keyPoint.description }}
            </v-list-item-subtitle>
            
            <v-list-item-subtitle class="text-caption">
              {{ keyPoint.latitude?.toFixed(6) }}, {{ keyPoint.longitude?.toFixed(6) }}
              <span v-if="currentLatitude && currentLongitude" class="ml-2">
                ({{ calculateDistance(keyPoint.latitude, keyPoint.longitude).toFixed(0) }}m)
              </span>
            </v-list-item-subtitle>

            <template v-slot:append v-if="isNearKeyPoint(keyPoint) && !isKeyPointCompleted(keyPoint.id)">
              <v-btn 
                @click="markKeyPointCompleted(keyPoint)"
                color="green"
                size="small"
                variant="elevated"
              >
                <v-icon left small>mdi-check</v-icon>
                Poseti
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
        
        <div v-else class="text-center py-4">
          <v-icon size="48" color="grey">mdi-map-marker-off</v-icon>
          <p class="mt-2 grey--text">Nema definisanih ključnih tačaka za ovu turu</p>
          <p class="text-caption">Autor ture još uvek nije definisao ključne tačke.</p>
          
          <!-- Test button for development -->
          <v-btn 
            @click="generateTestKeyPoints"
            color="primary"
            variant="outlined"
            class="mt-2 mr-2"
            v-if="tour && !keyPoints?.length"
          >
            <v-icon left>mdi-test-tube</v-icon>
            Generiši test ključne tačke (za demo)
          </v-btn>
          
          <!-- Reload key points button -->
          <v-btn 
            @click="loadKeyPoints"
            color="orange"
            variant="outlined"
            class="mt-2"
            v-if="tour"
          >
            <v-icon left>mdi-refresh</v-icon>
            Reload ključne tačke
          </v-btn>
          
          <!-- Debug info -->
          <div v-if="tour" class="mt-3 text-left text-caption">
            <p><strong>Debug info:</strong></p>
            <p>Tour ID: {{ tour.id }}</p>
            <p>Tour Name: {{ tour.name }}</p>
            <p>Tour Status: {{ tour.status }}</p>
            <p>Key Points Length: {{ keyPoints?.length || 0 }}</p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Kontrole -->
    <v-card>
      <v-card-title>
        <v-icon left>mdi-controller</v-icon>
        Kontrole ture
      </v-card-title>
      
      <v-card-actions class="px-4 pb-4">
        <v-btn 
          v-if="!execution"
          @click="startTour"
          color="green"
          :loading="loading"
          :disabled="!tour"
          large
          block
        >
          <v-icon left>mdi-play</v-icon>
          Pokreni turu
        </v-btn>

        <template v-else>
          <v-btn 
            @click="pauseResumeTour"
            :color="isPaused ? 'green' : 'orange'"
            :loading="loading"
            class="mr-2"
          >
            <v-icon left>{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
            {{ isPaused ? 'Nastavi' : 'Pauziraj' }}
          </v-btn>

          <v-btn 
            @click="finishTour"
            color="red"
            :loading="loading"
          >
            <v-icon left>mdi-stop</v-icon>
            Završi turu
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>

    <!-- Progress snackbar -->
    <v-snackbar
      v-model="showProgressSnackbar"
      :timeout="3000"
      color="green"
      bottom
    >
      <v-icon left color="white">mdi-check-circle</v-icon>
      {{ progressMessage }}
    </v-snackbar>

    <!-- Error snackbar -->
    <v-snackbar
      v-model="showErrorSnackbar"
      :timeout="5000"
      color="red"
      bottom
    >
      <v-icon left color="white">mdi-alert-circle</v-icon>
      {{ errorMessage }}
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
        
        const result = await tourExecutionAPI.startTour(
          tour.value.id,
          currentLatitude.value,
          currentLongitude.value
        )

        if (result.success) {
          execution.value = result.data
          completedKeyPoints.value = []
          showProgress('Tura je uspešno pokrenuta!')
          
          // Pokreni pozicionu simulaciju
          setTimeout(() => {
            setupPositionSimulation()
          }, 1000)
        } else {
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
          
          // Redirektuj na pregled završene ture
          setTimeout(() => {
            router.push('/my-tours')
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
        startPositionSimulation()
        showProgress('Tura je nastavljena')
      }
    }

    const setupPositionSimulation = () => {
      if (!keyPoints.value || !execution.value) return

      // Generiši rutu za simulator
      positionSimulator.generateRoute(
        keyPoints.value,
        currentLatitude.value,
        currentLongitude.value
      )

      // Registruj callback za primanje pozicija
      positionSimulator.onPositionUpdate(handlePositionUpdate)
      
      // Pokreni simulator
      startPositionSimulation()
    }

    const startPositionSimulation = () => {
      positionSimulator.start()
      isSimulatorRunning.value = true
      
      // Pokreni regularno ažuriranje pozicije
      if (positionUpdateInterval) {
        clearInterval(positionUpdateInterval)
      }
      
      positionUpdateInterval = setInterval(async () => {
        if (execution.value && currentLatitude.value && currentLongitude.value && !isPaused.value) {
          console.log(`Position update: ${currentLatitude.value}, ${currentLongitude.value}`)
          await updatePosition(currentLatitude.value, currentLongitude.value)
          await checkKeyPointsProximity(currentLatitude.value, currentLongitude.value)
        }
      }, 10000) // Svakých 10 sekundi
      
      console.log('Position simulation and 10-second interval started')
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
      if (!execution.value) return

      try {
        const result = await tourExecutionAPI.checkKeyPoints(execution.value.id, latitude, longitude, 50)
        
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
            result.data.newCompletions.forEach(completion => {
              // Add to completed key points if not already there
              if (!completedKeyPoints.value.find(cp => cp.keyPointId === completion.keyPointId)) {
                completedKeyPoints.value.push({
                  keyPointId: completion.keyPointId,
                  completedAt: completion.completedAt
                })
                showProgress(`Posećena ključna tačka: ${completion.keyPointName}`)
              }
            })
            
            // Update map to reflect completion status
            setTimeout(() => {
              if (map.value && keyPointsSource.value) {
                updateKeyPointsOnMap()
              }
            }, 100)
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
      startTour,
      finishTour,
      pauseResumeTour,
      startPositionSimulation,
      stopPositionSimulation,
      markKeyPointCompleted,
      isKeyPointCompleted,
      isNearKeyPoint,
      calculateDistance,
      formatDuration,
      generateTestKeyPoints
    }
  }
}
</script>

<style scoped>
.active-tour {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

.map-placeholder {
  border: 2px dashed #ccc;
  border-radius: 8px;
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 8px;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* OpenLayers map styling */
.tour-map {
  border-radius: 4px;
}

.map-controls {
  display: flex;
  gap: 4px;
}

/* Map legend styling */
.marker-legend-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.marker-legend-icon.red {
  background-color: #FF4444;
}

.marker-legend-icon.blue {
  background-color: #2196F3;
}

.marker-legend-icon.green {
  background-color: #4CAF50;
}
</style>