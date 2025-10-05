<template>
  <div class="map-picker">
    <div id="keyPointsMap" class="map-container"></div>
    
    <!-- Coordinate Input -->
    <div class="coordinate-inputs mt-3">
      <v-row>
        <v-col cols="6">
          <v-text-field
            :model-value="selectedCoordinates.latitude"
            @update:model-value="updateLatitude"
            label="Latitude"
            type="number"
            step="0.000001"
            variant="outlined"
            density="compact"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            :model-value="selectedCoordinates.longitude"
            @update:model-value="updateLongitude"
            label="Longitude"
            type="number"
            step="0.000001"
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>
      
      <div class="d-flex justify-center">
        <v-btn
          v-if="hasSelection"
          color="primary"
          variant="flat"
          size="small"
          @click="confirmSelection"
        >
          Potvrdi koordinate
        </v-btn>
        <v-btn
          v-if="hasSelection"
          color="grey"
          variant="outlined"
          size="small"
          class="ml-2"
          @click="clearSelection"
        >
          Očisti
        </v-btn>
      </div>
    </div>
    
    <!-- Key Points Info -->
    <div v-if="keyPoints && keyPoints.length > 0" class="key-points-info mt-3">
      <v-card variant="outlined">
        <v-card-text class="py-2">
          <div class="text-caption text-center">
            <v-icon size="small" class="mr-1">mdi-map-marker-multiple</v-icon>
            {{ keyPoints.length }} ključnih tačaka na mapi
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Circle from 'ol/geom/Circle'
import { defaultConfig } from '../config/config'

export default {
  name: 'KeyPointMapPicker',
  props: {
    initialCoordinates: {
      type: Object,
      default: () => ({ latitude: 45.2671, longitude: 19.8335 })
    },
    keyPoints: {
      type: Array,
      default: () => []
    },
    selectedKeyPoint: {
      type: Object,
      default: null
    }
  },
  emits: ['coordinates-selected', 'key-point-selected'],
  setup(props, { emit }) {
    const map = ref(null)
    const vectorSource = ref(null)
    const tempVectorSource = ref(null)
    const selectedCoordinates = reactive({
      latitude: props.initialCoordinates.latitude,
      longitude: props.initialCoordinates.longitude
    })
    
    const hasSelection = computed(() => {
      return selectedCoordinates.latitude !== null && selectedCoordinates.longitude !== null
    })
    
    const initializeMap = async () => {
      await nextTick()
      
      if (!map.value) {
        // Vector source for key points
        vectorSource.value = new VectorSource()
        
        // Vector source for temporary markers
        tempVectorSource.value = new VectorSource()
        
        const vectorLayer = new VectorLayer({
          source: vectorSource.value
        })
        
        const tempVectorLayer = new VectorLayer({
          source: tempVectorSource.value
        })
        
        map.value = new Map({
          target: 'keyPointsMap',
          layers: [
            new TileLayer({
              source: new OSM()
            }),
            vectorLayer,
            tempVectorLayer
          ],
          view: new View({
            center: fromLonLat([selectedCoordinates.longitude, selectedCoordinates.latitude]),
            zoom: defaultConfig.mapZoom
          })
        })
        
        // Handle map clicks
        map.value.on('click', (event) => {
          const coordinates = toLonLat(event.coordinate)
          selectedCoordinates.latitude = parseFloat(coordinates[1].toFixed(6))
          selectedCoordinates.longitude = parseFloat(coordinates[0].toFixed(6))
          
          addTempMarker(event.coordinate)
          
          // Emit coordinates when map is clicked
          emit('coordinates-selected', {
            latitude: selectedCoordinates.latitude,
            longitude: selectedCoordinates.longitude
          })
        })
        
        // Handle feature clicks for key points
        map.value.on('click', (event) => {
          map.value.forEachFeatureAtPixel(event.pixel, (feature) => {
            const keyPointId = feature.get('keyPointId')
            if (keyPointId) {
              const keyPoint = props.keyPoints.find(kp => kp.id === keyPointId)
              if (keyPoint) {
                emit('key-point-selected', keyPoint)
              }
            }
          })
        })
        
        // Load initial key points
        updateKeyPointsOnMap()
      }
    }
    
    const addTempMarker = (coordinate) => {
      tempVectorSource.value.clear()
      
      const marker = new Feature({
        geometry: new Point(coordinate)
      })
      
      marker.setStyle(defaultConfig.tempMarkerStyle)
      tempVectorSource.value.addFeature(marker)
    }
    
    const updateKeyPointsOnMap = () => {
      if (!vectorSource.value) return
      
      vectorSource.value.clear()
      
      props.keyPoints.forEach(keyPoint => {
        const coordinate = fromLonLat([keyPoint.coordinates.longitude, keyPoint.coordinates.latitude])
        
        // Add marker
        const marker = new Feature({
          geometry: new Point(coordinate),
          keyPointId: keyPoint.id,
          keyPoint: keyPoint
        })
        
        const isSelected = props.selectedKeyPoint?.id === keyPoint.id
        marker.setStyle(isSelected ? defaultConfig.selectedKeyPointMarkerStyle : defaultConfig.keyPointMarkerStyle)
        vectorSource.value.addFeature(marker)
        
        // Add radius circle if specified
        if (keyPoint.radius && keyPoint.radius > 0) {
          const circle = new Feature({
            geometry: new Circle(coordinate, keyPoint.radius)
          })
          circle.setStyle(defaultConfig.keyPointRadiusStyle)
          vectorSource.value.addFeature(circle)
        }
      })
    }
    
    const updateLatitude = (value) => {
      const lat = parseFloat(value)
      if (!isNaN(lat) && lat >= -90 && lat <= 90) {
        selectedCoordinates.latitude = lat
        updateMapCenter()
        // Emit coordinates when manually updated
        emit('coordinates-selected', {
          latitude: selectedCoordinates.latitude,
          longitude: selectedCoordinates.longitude
        })
      }
    }
    
    const updateLongitude = (value) => {
      const lng = parseFloat(value)
      if (!isNaN(lng) && lng >= -180 && lng <= 180) {
        selectedCoordinates.longitude = lng
        updateMapCenter()
        // Emit coordinates when manually updated
        emit('coordinates-selected', {
          latitude: selectedCoordinates.latitude,
          longitude: selectedCoordinates.longitude
        })
      }
    }
    
    const updateMapCenter = () => {
      if (map.value && hasSelection.value) {
        const coordinate = fromLonLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
        map.value.getView().setCenter(coordinate)
        addTempMarker(coordinate)
      }
    }
    
    const confirmSelection = () => {
      if (hasSelection.value) {
        emit('coordinates-selected', {
          latitude: selectedCoordinates.latitude,
          longitude: selectedCoordinates.longitude
        })
        tempVectorSource.value.clear()
      }
    }
    
    const clearSelection = () => {
      selectedCoordinates.latitude = props.initialCoordinates.latitude
      selectedCoordinates.longitude = props.initialCoordinates.longitude
      tempVectorSource.value?.clear()
    }
    
    const destroyMap = () => {
      if (map.value) {
        map.value.setTarget(null)
        map.value = null
        vectorSource.value = null
        tempVectorSource.value = null
      }
    }
    
    // Watch for changes in key points
    watch(() => props.keyPoints, () => {
      updateKeyPointsOnMap()
    }, { deep: true })
    
    // Watch for changes in selected key point
    watch(() => props.selectedKeyPoint, () => {
      updateKeyPointsOnMap()
    })
    
    onMounted(() => {
      initializeMap()
    })
    
    onUnmounted(() => {
      destroyMap()
    })
    
    return {
      selectedCoordinates,
      hasSelection,
      updateLatitude,
      updateLongitude,
      confirmSelection,
      clearSelection
    }
  }
}
</script>

<style scoped>
/* OpenLayers basic styles */
.ol-viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.ol-viewport canvas {
  position: absolute;
  left: 0;
  top: 0;
}

.ol-control {
  position: absolute;
  background-color: rgba(255,255,255,.4);
  border-radius: 4px;
  padding: 2px;
}

.ol-control button {
  display: block;
  margin: 1px;
  padding: 0;
  color: white;
  font-size: 1.14em;
  font-weight: 700;
  text-decoration: none;
  text-align: center;
  height: 1.375em;
  width: 1.375em;
  background-color: rgba(0,60,136,.5);
  border: none;
  border-radius: 2px;
}

.ol-control button:hover {
  background-color: rgba(0,60,136,.7);
}

.ol-zoom {
  top: .5em;
  left: .5em;
}

.ol-attribution {
  text-align: right;
  bottom: .5em;
  right: .5em;
  max-width: calc(100% - 1.3em);
}

.ol-attribution ul {
  margin: 0;
  padding: 0 .5em;
  font-size: .7rem;
  line-height: 1.375em;
  color: #000;
  text-shadow: 0 0 2px #fff;
}

.ol-attribution li {
  display: inline;
  list-style: none;
  line-height: inherit;
}

/* Component specific styles */
.map-container {
  width: 100%;
  height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.coordinate-inputs {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.key-points-info {
  margin-top: 8px;
}
</style>