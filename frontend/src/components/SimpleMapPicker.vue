<template>
  <div class="map-container">
    <div ref="mapElement" class="map-element">
      <!-- Simple map placeholder with coordinate display -->
      <div class="map-overlay">
        <div class="coordinates-display">
          <h4>Mapa Koordinata</h4>
          <p v-if="selectedCoordinates">
            <strong>Odabrane koordinate:</strong><br>
            Latitude: {{ selectedCoordinates.latitude.toFixed(6) }}<br>
            Longitude: {{ selectedCoordinates.longitude.toFixed(6) }}
          </p>
          <p v-else>Kliknite na mapu da odaberete koordinate</p>
        </div>
        
        <!-- Key points display -->
        <div v-if="keyPoints.length > 0" class="key-points-overlay">
          <h5>Ključne tačke:</h5>
          <div 
            v-for="(point, index) in keyPoints" 
            :key="point.id"
            class="key-point-marker"
            :style="getMarkerStyle(point.coordinates)"
            @click="selectKeyPoint(point)"
          >
            <v-chip 
              size="small" 
              :color="selectedKeyPoint?.id === point.id ? 'primary' : 'secondary'"
            >
              {{ index + 1 }}
            </v-chip>
          </div>
        </div>
        
        <!-- Selection marker -->
        <div 
          v-if="selectedCoordinates" 
          class="selection-marker"
          :style="getMarkerStyle(selectedCoordinates)"
        >
          <v-icon color="red" size="large">mdi-map-marker</v-icon>
        </div>
      </div>
      
      <!-- Simple grid background to simulate map -->
      <div class="map-grid">
        <div 
          v-for="row in 20" 
          :key="`row-${row}`" 
          class="grid-row"
        >
          <div 
            v-for="col in 30" 
            :key="`col-${col}`" 
            class="grid-cell"
            @click="onMapClick($event, row, col)"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="map-controls">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model.number="manualLatitude"
            label="Latitude"
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            variant="outlined"
            density="compact"
            @update:model-value="updateManualCoordinates"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="manualLongitude"
            label="Longitude"
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            variant="outlined"
            density="compact"
            @update:model-value="updateManualCoordinates"
          />
        </v-col>
      </v-row>
      
      <v-row>
        <v-col>
          <v-btn
            v-if="selectedCoordinates"
            color="primary"
            variant="flat"
            @click="confirmSelection"
            block
          >
            Potvrdi koordinate
          </v-btn>
          <v-btn
            v-if="selectedCoordinates"
            color="grey"
            variant="outlined"
            @click="clearSelection"
            block
            class="mt-2"
          >
            Obriši selekciju
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'

export default {
  name: 'SimpleMapPicker',
  props: {
    initialCoordinates: {
      type: Object,
      default: () => ({ latitude: 45.2671, longitude: 19.8335 }) // Novi Sad center
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
    const mapElement = ref(null)
    const selectedCoordinates = ref(null)
    const manualLatitude = ref(props.initialCoordinates.latitude)
    const manualLongitude = ref(props.initialCoordinates.longitude)
    
    // Map boundaries (roughly Novi Sad area)
    const mapBounds = {
      north: 45.3,
      south: 45.2,
      east: 19.9,
      west: 19.7
    }
    
    const onMapClick = (event, row, col) => {
      const rect = mapElement.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Convert pixel coordinates to lat/lng
      const latitude = mapBounds.north - (y / rect.height) * (mapBounds.north - mapBounds.south)
      const longitude = mapBounds.west + (x / rect.width) * (mapBounds.east - mapBounds.west)
      
      selectedCoordinates.value = {
        latitude: Math.round(latitude * 1000000) / 1000000,
        longitude: Math.round(longitude * 1000000) / 1000000
      }
      
      manualLatitude.value = selectedCoordinates.value.latitude
      manualLongitude.value = selectedCoordinates.value.longitude
    }
    
    const getMarkerStyle = (coordinates) => {
      if (!coordinates) return {}
      
      // Convert lat/lng to pixel position
      const latPercent = ((mapBounds.north - coordinates.latitude) / (mapBounds.north - mapBounds.south)) * 100
      const lngPercent = ((coordinates.longitude - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100
      
      return {
        position: 'absolute',
        top: `${latPercent}%`,
        left: `${lngPercent}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10
      }
    }
    
    const updateManualCoordinates = () => {
      if (manualLatitude.value && manualLongitude.value) {
        selectedCoordinates.value = {
          latitude: manualLatitude.value,
          longitude: manualLongitude.value
        }
      }
    }
    
    const confirmSelection = () => {
      if (selectedCoordinates.value) {
        emit('coordinates-selected', selectedCoordinates.value)
      }
    }
    
    const clearSelection = () => {
      selectedCoordinates.value = null
      manualLatitude.value = props.initialCoordinates.latitude
      manualLongitude.value = props.initialCoordinates.longitude
    }
    
    const selectKeyPoint = (keyPoint) => {
      emit('key-point-selected', keyPoint)
    }
    
    // Watch for initial coordinates changes
    watch(() => props.initialCoordinates, (newCoords) => {
      if (newCoords) {
        selectedCoordinates.value = { ...newCoords }
        manualLatitude.value = newCoords.latitude
        manualLongitude.value = newCoords.longitude
      }
    }, { immediate: true })
    
    return {
      mapElement,
      selectedCoordinates,
      manualLatitude,
      manualLongitude,
      onMapClick,
      getMarkerStyle,
      updateManualCoordinates,
      confirmSelection,
      clearSelection,
      selectKeyPoint
    }
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.map-element {
  position: relative;
  width: 100%;
  height: 400px;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f5e8 0%, #d4f1d4 100%);
  cursor: crosshair;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}

.coordinates-display {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.key-points-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 200px;
}

.selection-marker {
  pointer-events: none;
}

.key-point-marker {
  cursor: pointer;
  pointer-events: auto;
}

.key-point-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.map-grid {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grid-row {
  flex: 1;
  display: flex;
}

.grid-cell {
  flex: 1;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.grid-cell:hover {
  background-color: rgba(25, 118, 210, 0.1);
}

.map-controls {
  margin-top: 16px;
}

.map-controls .v-text-field {
  font-size: 14px;
}
</style>