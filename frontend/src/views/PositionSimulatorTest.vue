<template>
  <div class="position-simulator-test pa-4">
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-crosshairs-gps</v-icon>
        Position Simulator Test
      </v-card-title>
      
      <v-card-text>
        <p>Ova komponenta testira Position Simulator funkcionalnost nezavisno od ActiveTour komponente.</p>
      </v-card-text>
    </v-card>

    <!-- Simulator Status -->
    <v-card class="mb-4">
      <v-card-title>Status Simulatora</v-card-title>
      
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-3">
          <span><strong>Status:</strong></span>
          <v-chip 
            :color="simulatorStatus.isRunning ? 'green' : 'grey'"
            :text-color="simulatorStatus.isRunning ? 'white' : 'black'"
          >
            {{ simulatorStatus.isRunning ? 'Pokrenut' : 'Zaustavljen' }}
          </v-chip>
        </div>
        
        <div class="d-flex justify-space-between align-center mb-3">
          <span><strong>Trenutna pozicija:</strong></span>
          <span>{{ simulatorStatus.currentIndex + 1 }}/{{ simulatorStatus.totalPoints }}</span>
        </div>
        
        <div class="d-flex justify-space-between align-center mb-3">
          <span><strong>Progres:</strong></span>
          <span>{{ simulatorStatus.progress.toFixed(1) }}%</span>
        </div>
        
        <v-progress-linear 
          :model-value="simulatorStatus.progress"
          color="primary"
          height="6"
          rounded
        ></v-progress-linear>
      </v-card-text>
    </v-card>

    <!-- Current Position -->
    <v-card class="mb-4">
      <v-card-title>Trenutna Pozicija</v-card-title>
      
      <v-card-text>
        <div v-if="currentPosition">
          <div class="mb-2">
            <strong>Latitude:</strong> {{ currentPosition.latitude?.toFixed(6) || 'N/A' }}
          </div>
          <div class="mb-2">
            <strong>Longitude:</strong> {{ currentPosition.longitude?.toFixed(6) || 'N/A' }}
          </div>
          <div class="mb-2">
            <strong>Tip:</strong> 
            <v-chip 
              :color="currentPosition.type === 'keypoint' ? 'blue' : 'green'"
              size="small"
            >
              {{ currentPosition.type === 'keypoint' ? 'Ključna tačka' : 'Start' }}
            </v-chip>
          </div>
          <div v-if="currentPosition.name" class="mb-2">
            <strong>Naziv:</strong> {{ currentPosition.name }}
          </div>
          <div v-if="currentPosition.description" class="mb-2">
            <strong>Opis:</strong> {{ currentPosition.description }}
          </div>
        </div>
        <div v-else class="text-center py-4">
          <v-icon size="48" color="grey">mdi-map-marker-off</v-icon>
          <p class="mt-2 grey--text">Nema trenutne pozicije</p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Test Controls -->
    <v-card class="mb-4">
      <v-card-title>Kontrole Testa</v-card-title>
      
      <v-card-actions class="px-4 pb-4">
        <v-btn 
          @click="generateTestRoute"
          color="primary"
          :disabled="simulatorStatus.isRunning"
          prepend-icon="mdi-route"
        >
          Generiši test rutu
        </v-btn>
        
        <v-btn 
          @click="startSimulator"
          color="green"
          :disabled="simulatorStatus.isRunning || testRoute.length === 0"
          prepend-icon="mdi-play"
        >
          Pokreni
        </v-btn>
        
        <v-btn 
          @click="stopSimulator"
          color="red"
          :disabled="!simulatorStatus.isRunning"
          prepend-icon="mdi-stop"
        >
          Zaustavi
        </v-btn>
        
        <v-btn 
          @click="resetSimulator"
          color="orange"
          prepend-icon="mdi-refresh"
        >
          Resetuj
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Route Display -->
    <v-card v-if="testRoute.length > 0">
      <v-card-title>Test Ruta</v-card-title>
      
      <v-card-text>
        <v-list>
          <v-list-item 
            v-for="(point, index) in testRoute" 
            :key="index"
            :class="{ 'bg-primary': index === simulatorStatus.currentIndex }"
          >
            <v-list-item-icon>
              <v-icon 
                :color="index === simulatorStatus.currentIndex ? 'white' : (point.type === 'keypoint' ? 'blue' : 'green')"
              >
                {{ point.type === 'keypoint' ? 'mdi-map-marker-star' : 'mdi-map-marker' }}
              </v-icon>
            </v-list-item-icon>
            
            <v-list-item-content>
              <v-list-item-title 
                :class="{ 'white--text': index === simulatorStatus.currentIndex }"
              >
                {{ point.name || `Pozicija ${index + 1}` }}
              </v-list-item-title>
              <v-list-item-subtitle 
                :class="{ 'white--text': index === simulatorStatus.currentIndex }"
              >
                {{ point.latitude?.toFixed(6) }}, {{ point.longitude?.toFixed(6) }}
              </v-list-item-subtitle>
            </v-list-item-content>
            
            <v-list-item-action v-if="index === simulatorStatus.currentIndex">
              <v-chip color="white" text-color="primary" size="small">
                Trenutno
              </v-chip>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Position Log -->
    <v-card v-if="positionLog.length > 0">
      <v-card-title>Log Pozicija</v-card-title>
      
      <v-card-text>
        <div class="position-log" style="max-height: 300px; overflow-y: auto;">
          <div 
            v-for="(log, index) in positionLog.slice().reverse()" 
            :key="index"
            class="mb-2 pa-2"
            style="border: 1px solid #ddd; border-radius: 4px;"
          >
            <div class="text-caption text-grey">{{ log.timestamp }}</div>
            <div><strong>Pozicija:</strong> {{ log.latitude }}, {{ log.longitude }}</div>
            <div v-if="log.name"><strong>Naziv:</strong> {{ log.name }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import positionSimulator from '@/utils/positionSimulator'

export default {
  name: 'PositionSimulatorTest',
  setup() {
    // Reactive state
    const simulatorStatus = ref({
      isRunning: false,
      currentIndex: 0,
      totalPoints: 0,
      currentPosition: null,
      progress: 0
    })
    
    const currentPosition = ref(null)
    const testRoute = ref([])
    const positionLog = ref([])

    // Methods
    const updateStatus = () => {
      simulatorStatus.value = positionSimulator.getStatus()
      currentPosition.value = positionSimulator.getCurrentPosition()
    }

    const generateTestRoute = () => {
      // Generiši test rutu sa ključnim tačkama u Novom Sadu
      const keyPoints = [
        {
          id: 1,
          name: 'Petrovaradin Fortress',
          description: 'Istorijska tvrđava iz 18. veka',
          latitude: 45.2530,
          longitude: 19.8633
        },
        {
          id: 2,
          name: 'Trg Slobode',
          description: 'Glavni gradski trg',
          latitude: 45.2671,
          longitude: 19.8335
        },
        {
          id: 3,
          name: 'Štrand Beach',
          description: 'Popularna plaža na Dunavu',
          latitude: 45.2396,
          longitude: 19.8227
        },
        {
          id: 4,
          name: 'Dunavski Park',
          description: 'Centralni gradski park',
          latitude: 45.2658,
          longitude: 19.8317
        }
      ]

      positionSimulator.generateRoute(keyPoints)
      testRoute.value = [...positionSimulator.route]
      updateStatus()
      
      console.log('Generated test route with', testRoute.value.length, 'points')
    }

    const startSimulator = () => {
      positionSimulator.start()
      updateStatus()
    }

    const stopSimulator = () => {
      positionSimulator.stop()
      updateStatus()
    }

    const resetSimulator = () => {
      positionSimulator.reset()
      testRoute.value = []
      positionLog.value = []
      currentPosition.value = null
      updateStatus()
    }

    // Position update handler
    const handlePositionUpdate = (position) => {
      console.log('Position update received:', position)
      
      currentPosition.value = position
      updateStatus()
      
      // Dodaj u log
      positionLog.value.push({
        timestamp: new Date().toLocaleTimeString(),
        latitude: position.latitude?.toFixed(6),
        longitude: position.longitude?.toFixed(6),
        name: position.name || '',
        type: position.type
      })
      
      // Drži samo poslednih 20 pozicija
      if (positionLog.value.length > 20) {
        positionLog.value = positionLog.value.slice(-20)
      }
    }

    // Status update interval
    let statusInterval = null

    // Lifecycle hooks
    onMounted(() => {
      // Registruj callback za position updates
      positionSimulator.onPositionUpdate(handlePositionUpdate)
      
      // Redovno ažuriraj status
      statusInterval = setInterval(updateStatus, 1000)
      
      // Početno ažuriranje
      updateStatus()
      
      console.log('PositionSimulatorTest mounted')
    })

    onUnmounted(() => {
      // Ukloni callback
      positionSimulator.removePositionListener(handlePositionUpdate)
      
      // Zaustavi interval
      if (statusInterval) {
        clearInterval(statusInterval)
      }
      
      // Resetuj simulator
      positionSimulator.reset()
      
      console.log('PositionSimulatorTest unmounted')
    })

    return {
      simulatorStatus,
      currentPosition,
      testRoute,
      positionLog,
      generateTestRoute,
      startSimulator,
      stopSimulator,
      resetSimulator
    }
  }
}
</script>

<style scoped>
.position-simulator-test {
  max-width: 800px;
  margin: 0 auto;
}

.position-log {
  font-family: monospace;
  font-size: 0.875rem;
}

.bg-primary {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}
</style>