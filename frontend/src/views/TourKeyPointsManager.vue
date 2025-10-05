<template>
  <v-container fluid class="modern-container">
    <!-- Header Section -->
    <div class="header-section mb-8">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="40" color="primary">mdi-map-marker-multiple</v-icon>
        </div>
        <div class="header-text">
          <h1 class="text-h4 font-weight-bold mb-2">Upravljanje ključnim tačkama</h1>
          <p class="text-body-1 opacity-80">Kreirajte i organizujte ključne tačke vaše ture</p>
        </div>
        <div v-if="stats" class="header-stats">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalKeyPoints }}</div>
            <div class="stat-label">Ukupno tačaka</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalEstimatedTime }}</div>
            <div class="stat-label">Minuta</div>
          </div>
        </div>
      </div>
    </div>

    <v-row class="content-row">
      <!-- Key Points Panel -->
      <v-col cols="12" md="4">
        <div class="keypoints-panel">
          <div class="panel-header">
            <div class="panel-title">
              <v-icon class="mr-3" color="primary">mdi-format-list-numbered</v-icon>
              <span class="text-h6 font-weight-bold">Ključne tačke</span>
            </div>
            <div class="panel-badges" v-if="stats">
              <v-chip 
                size="small" 
                color="error" 
                variant="outlined"
                class="mr-2"
                prepend-icon="mdi-alert-circle"
              >
                {{ stats.requiredKeyPoints }} obaveznih
              </v-chip>
              <v-chip 
                size="small" 
                color="warning" 
                variant="outlined"
                prepend-icon="mdi-information"
              >
                {{ stats.optionalKeyPoints }} opcionalnih
              </v-chip>
            </div>
          </div>
          
          <div class="panel-actions">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openAddDialog"
              :disabled="!canEdit"
              variant="elevated"
              size="small"
              class="add-button"
            >
              Nova tačka
            </v-btn>
            <v-btn
              icon="mdi-refresh"
              @click="loadKeyPoints"
              :loading="loading"
              variant="outlined"
              size="small"
              class="refresh-button"
            />
          </div>
          
          <!-- Key Points List -->
          <div class="keypoints-list">
            <div v-if="keyPoints.length > 0" class="points-container">
              <div
                v-for="(keyPoint, index) in keyPoints"
                :key="keyPoint.id"
                @click="selectKeyPoint(keyPoint)"
                :class="['keypoint-card', { 'selected': selectedKeyPoint?.id === keyPoint.id }]"
              >
                <div class="keypoint-order">
                  <v-chip
                    size="small"
                    :color="keyPoint.isRequired ? 'error' : 'warning'"
                    variant="flat"
                    class="order-chip"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </div>
                
                <div class="keypoint-content">
                  <div class="keypoint-name">
                    {{ keyPoint.name }}
                  </div>
                  
                  <div class="keypoint-details">
                    <div class="detail-row">
                      <v-icon size="14" class="mr-1 opacity-70">mdi-map-marker</v-icon>
                      <span class="coordinates">
                        {{ keyPoint.coordinates.latitude.toFixed(4) }}, 
                        {{ keyPoint.coordinates.longitude.toFixed(4) }}
                      </span>
                    </div>
                    <div v-if="keyPoint.estimatedTimeMinutes" class="detail-row mt-1">
                      <v-icon size="14" class="mr-1 opacity-70">mdi-clock-outline</v-icon>
                      <span>{{ keyPoint.estimatedTimeMinutes }} min</span>
                    </div>
                  </div>
                </div>
                
                <div class="keypoint-actions">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="x-small"
                    @click.stop="editKeyPoint(keyPoint)"
                    :disabled="!canEdit"
                    class="action-btn edit-btn"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="x-small"
                    color="error"
                    @click.stop="deleteKeyPoint(keyPoint)"
                    :disabled="!canEdit"
                    class="action-btn delete-btn"
                  />
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">
                <v-icon size="64" color="primary" class="opacity-50">
                  mdi-map-marker-off
                </v-icon>
              </div>
              <h3 class="empty-title">Nema dodanih tačaka</h3>
              <p class="empty-description">
                Dodajte ključne tačke da biste definisali rutu vaše ture
              </p>
              <v-btn
                v-if="canEdit"
                color="primary"
                variant="elevated"
                size="large"
                @click="openAddDialog"
                prepend-icon="mdi-plus"
                class="empty-action"
              >
                Dodaj prvu tačku
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
      
      <!-- Map Panel -->
      <v-col cols="12" md="8">
        <div class="map-panel">
          <div class="panel-header">
            <div class="panel-title">
              <v-icon class="mr-3" color="primary">mdi-map</v-icon>
              <span class="text-h6 font-weight-bold">Mapa ključnih tačaka</span>
            </div>
            <div v-if="selectedKeyPoint" class="selected-point">
              <v-chip color="primary" variant="tonal" size="small" prepend-icon="mdi-map-marker">
                {{ selectedKeyPoint.name }}
              </v-chip>
            </div>
          </div>
          
          <div class="map-container">
            <KeyPointMapPicker
              :initial-coordinates="mapCenter"
              :key-points="keyPoints"
              :selected-key-point="selectedKeyPoint"
              @coordinates-selected="onCoordinatesSelected"
              @key-point-selected="selectKeyPoint"
            />
          </div>
        </div>
      </v-col>
    </v-row>
    
    <!-- Modern Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="700" persistent class="modern-dialog">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <div class="dialog-icon">
            <v-icon size="24" :color="editingKeyPoint ? 'warning' : 'primary'">
              {{ editingKeyPoint ? 'mdi-pencil' : 'mdi-plus' }}
            </v-icon>
          </div>
          <div class="dialog-title">
            <h2 class="text-h5 font-weight-bold">
              {{ editingKeyPoint ? 'Edituj ključnu tačku' : 'Dodaj novu ključnu tačku' }}
            </h2>
            <p class="text-body-2 opacity-70">
              {{ editingKeyPoint ? 'Ažurirajte informacije o tačci' : 'Unesite podatke o novoj ključnoj tačci' }}
            </p>
          </div>
        </div>
        
        <v-card-text class="dialog-content">
          <v-form ref="keyPointForm" v-model="formValid">
            <div class="form-section">
              <h3 class="section-title">Osnovne informacije</h3>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="keyPointData.name"
                    label="Naziv ključne tačke"
                    :rules="nameRules"
                    variant="outlined"
                    required
                    prepend-inner-icon="mdi-map-marker"
                    class="modern-input"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-textarea
                    v-model="keyPointData.description"
                    label="Opis tačke"
                    :rules="descriptionRules"
                    variant="outlined"
                    rows="3"
                    prepend-inner-icon="mdi-text"
                    class="modern-input"
                  />
                </v-col>
              </v-row>
            </div>

            <div class="form-section">
              <h3 class="section-title">Lokacija</h3>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="keyPointData.coordinates.latitude"
                    label="Geografska širina"
                    type="number"
                    step="0.000001"
                    :rules="latitudeRules"
                    variant="outlined"
                    required
                    prepend-inner-icon="mdi-latitude"
                    class="modern-input"
                  />
                </v-col>
                
                <v-col cols="6">
                  <v-text-field
                    v-model.number="keyPointData.coordinates.longitude"
                    label="Geografska dužina"
                    type="number"
                    step="0.000001"
                    :rules="longitudeRules"
                    variant="outlined"
                    required
                    prepend-inner-icon="mdi-longitude"
                    class="modern-input"
                  />
                </v-col>
              </v-row>
            </div>

            <div class="form-section">
              <h3 class="section-title">Dodatne opcije</h3>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="keyPointData.estimatedTimeMinutes"
                    label="Procenjeno vreme (min)"
                    type="number"
                    min="1"
                    max="1440"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock-outline"
                    class="modern-input"
                  />
                </v-col>
                
                <v-col cols="6">
                  <v-text-field
                    v-model.number="keyPointData.radius"
                    label="Radius zone (metri)"
                    type="number"
                    min="1"
                    max="1000"
                    :rules="radiusRules"
                    variant="outlined"
                    prepend-inner-icon="mdi-circle-outline"
                    class="modern-input"
                  />
                </v-col>
                
                <v-col cols="12">
                  <div class="switch-container">
                    <v-switch
                      v-model="keyPointData.isRequired"
                      label="Obavezna ključna tačka"
                      color="primary"
                      inset
                      hide-details
                      class="modern-switch"
                    />
                    <p class="switch-description">
                      Obavezne tačke moraju biti posećene da bi tura bila završena
                    </p>
                  </div>
                </v-col>
              </v-row>
            </div>

            <div class="form-section">
              <h3 class="section-title">Slike</h3>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="newImageUrl"
                    label="URL adresa slike"
                    variant="outlined"
                    append-inner-icon="mdi-plus"
                    @click:append-inner="addImage"
                    @keyup.enter="addImage"
                    prepend-inner-icon="mdi-image"
                    class="modern-input"
                  />
                  
                  <div v-if="keyPointData.images.length > 0" class="images-list">
                    <v-chip
                      v-for="(image, index) in keyPointData.images"
                      :key="index"
                      closable
                      @click:close="removeImage(index)"
                      class="image-chip"
                      size="small"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon start>mdi-image</v-icon>
                      Slika {{ index + 1 }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <v-btn @click="closeDialog" variant="outlined" size="large" class="cancel-btn">
            Otkaži
          </v-btn>
          <v-spacer />
          <v-btn
            @click="saveKeyPoint"
            :color="editingKeyPoint ? 'warning' : 'primary'"
            variant="elevated"
            size="large"
            :loading="saving"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ editingKeyPoint ? 'Ažuriraj tačku' : 'Dodaj tačku' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Modern Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450" class="modern-dialog">
      <v-card class="delete-dialog">
        <div class="dialog-header danger">
          <div class="dialog-icon">
            <v-icon size="24" color="error">mdi-alert-circle</v-icon>
          </div>
          <div class="dialog-title">
            <h2 class="text-h6 font-weight-bold">Potvrda brisanja</h2>
            <p class="text-body-2 opacity-70">Ova akcija se ne može poništiti</p>
          </div>
        </div>
        
        <v-card-text class="dialog-content">
          <div class="delete-content">
            <p class="delete-question">
              Da li ste sigurni da želite da obrišete ključnu tačku:
            </p>
            <div class="delete-item">
              <v-icon class="mr-2" color="error">mdi-map-marker</v-icon>
              <strong>"{{ keyPointToDelete?.name }}"</strong>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <v-btn @click="showDeleteDialog = false" variant="outlined" size="large">
            Otkaži
          </v-btn>
          <v-spacer />
          <v-btn
            @click="confirmDelete"
            color="error"
            variant="elevated"
            size="large"
            :loading="deleting"
            class="delete-confirm-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Obriši tačku
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
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
          :color="snackbarColor === 'error' ? 'error' : 'success'" 
          class="mr-2"
        >
          {{ snackbarColor === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}
        </v-icon>
        {{ snackbarMessage }}
      </div>
      <template #actions>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import tourKeyPointAPI from '../api/tourKeyPoints'
import { useAuthStore } from '../stores/auth'
import KeyPointMapPicker from '../components/KeyPointMapPicker.vue'

export default {
  name: 'TourKeyPointsManager',
  components: {
    KeyPointMapPicker
  },
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const keyPoints = ref([])
    const stats = ref(null)
    const selectedKeyPoint = ref(null)
    const showDialog = ref(false)
    const showDeleteDialog = ref(false)
    const keyPointToDelete = ref(null)
    const editingKeyPoint = ref(null)
    const formValid = ref(false)
    const newImageUrl = ref('')
    const showSnackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('success')
    
    const tourId = computed(() => parseInt(route.params.id))
    const canEdit = computed(() => {
      return authStore.isAuthenticated && 
             (authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator')
    })
    
    // Store coordinates selected on map
    const selectedMapCoordinates = ref({ latitude: 45.2671, longitude: 19.8335 })
    
    const mapCenter = computed(() => {
      // First priority: use selected coordinates from map
      if (selectedMapCoordinates.value) {
        return selectedMapCoordinates.value
      }
      // Second priority: use first existing key point
      if (keyPoints.value.length > 0) {
        const firstPoint = keyPoints.value[0]
        return firstPoint.coordinates
      }
      // Fallback: Novi Sad center
      return { latitude: 45.2671, longitude: 19.8335 }
    })
    
    const keyPointData = reactive({
      name: '',
      description: '',
      coordinates: {
        latitude: 45.2671, // This will be updated when dialog opens
        longitude: 19.8335
      },
      estimatedTimeMinutes: null,
      radius: 50,
      isRequired: true,
      images: []
    })
    
    // Validation rules
    const nameRules = [
      v => !!v || 'Naziv je obavezan',
      v => (v && v.length <= 200) || 'Naziv ne može biti duži od 200 karaktera'
    ]
    
    const descriptionRules = [
      v => !v || v.length <= 5000 || 'Opis ne može biti duži od 5000 karaktera'
    ]
    
    const latitudeRules = [
      v => v !== null && v !== undefined || 'Latitude je obavezna',
      v => (v >= -90 && v <= 90) || 'Latitude mora biti između -90 i 90'
    ]
    
    const longitudeRules = [
      v => v !== null && v !== undefined || 'Longitude je obavezna',
      v => (v >= -180 && v <= 180) || 'Longitude mora biti između -180 i 180'
    ]
    
    const radiusRules = [
      v => v > 0 || 'Radius mora biti veći od 0',
      v => v <= 1000 || 'Radius ne može biti veći od 1000 metara'
    ]
    
    // Methods
    const loadKeyPoints = async () => {
      loading.value = true
      try {
        const result = await tourKeyPointAPI.getKeyPointsByTour(tourId.value)
        if (result.success) {
          keyPoints.value = result.data.keyPoints
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError('Greška prilikom učitavanja ključnih tačaka')
      } finally {
        loading.value = false
      }
    }
    
    const loadStats = async () => {
      try {
        const result = await tourKeyPointAPI.getKeyPointStats(tourId.value)
        if (result.success) {
          stats.value = result.data
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    
    const selectKeyPoint = (keyPoint) => {
      selectedKeyPoint.value = keyPoint
    }
    
    const openAddDialog = () => {
      editingKeyPoint.value = null
      
      // Use coordinates from map, fallback to default if none selected
      const coords = selectedMapCoordinates.value || { latitude: 45.2671, longitude: 19.8335 }
      
      keyPointData.name = ''
      keyPointData.description = ''
      keyPointData.coordinates.latitude = coords.latitude
      keyPointData.coordinates.longitude = coords.longitude
      keyPointData.estimatedTimeMinutes = null
      keyPointData.radius = 50
      keyPointData.isRequired = true
      keyPointData.images = []
      newImageUrl.value = ''
      
      showDialog.value = true
      console.log('Dialog opened with coordinates:', keyPointData.coordinates)
      console.log('Selected map coordinates were:', selectedMapCoordinates.value)
    }
    
    const editKeyPoint = (keyPoint) => {
      editingKeyPoint.value = keyPoint
      Object.assign(keyPointData, {
        name: keyPoint.name,
        description: keyPoint.description || '',
        coordinates: { ...keyPoint.coordinates },
        estimatedTimeMinutes: keyPoint.estimatedTimeMinutes,
        radius: keyPoint.radius,
        isRequired: keyPoint.isRequired,
        images: [...(keyPoint.images || [])]
      })
      showDialog.value = true
    }
    
    const addImage = () => {
      if (newImageUrl.value && !keyPointData.images.includes(newImageUrl.value)) {
        if (keyPointData.images.length < 10) {
          keyPointData.images.push(newImageUrl.value)
          newImageUrl.value = ''
        } else {
          showError('Maksimalno 10 slika je dozvoljeno')
        }
      }
    }
    
    const removeImage = (index) => {
      keyPointData.images.splice(index, 1)
    }
    
    const onCoordinatesSelected = (coordinates) => {
      console.log('=== onCoordinatesSelected called ===')
      console.log('Received coordinates:', coordinates)
      selectedMapCoordinates.value = coordinates
      console.log('Updated selectedMapCoordinates.value:', selectedMapCoordinates.value)
      console.log('=== end onCoordinatesSelected ===')
    }
    
    const saveKeyPoint = async () => {
      if (!formValid.value) return
      
      console.log('Saving keyPoint with data:', keyPointData)
      console.log('Coordinates being sent:', keyPointData.coordinates)
      
      saving.value = true
      try {
        const data = {
          name: keyPointData.name,
          description: keyPointData.description,
          coordinates: keyPointData.coordinates,
          estimatedTimeMinutes: keyPointData.estimatedTimeMinutes,
          radius: keyPointData.radius,
          isRequired: keyPointData.isRequired,
          images: keyPointData.images
        }
        
        let result
        if (editingKeyPoint.value) {
          result = await tourKeyPointAPI.updateKeyPoint(editingKeyPoint.value.id, data)
        } else {
          result = await tourKeyPointAPI.createKeyPoint(tourId.value, data)
        }
        
        if (result.success) {
          showSuccess(editingKeyPoint.value ? 'Ključna tačka je ažurirana' : 'Ključna tačka je dodana')
          closeDialog()
          loadKeyPoints()
          loadStats()
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError('Greška prilikom čuvanja ključne tačke')
      } finally {
        saving.value = false
      }
    }
    
    const deleteKeyPoint = (keyPoint) => {
      keyPointToDelete.value = keyPoint
      showDeleteDialog.value = true
    }
    
    const confirmDelete = async () => {
      if (!keyPointToDelete.value) return
      
      deleting.value = true
      try {
        const result = await tourKeyPointAPI.deleteKeyPoint(keyPointToDelete.value.id)
        if (result.success) {
          showSuccess('Ključna tačka je obrisana')
          showDeleteDialog.value = false
          keyPointToDelete.value = null
          if (selectedKeyPoint.value?.id === keyPointToDelete.value?.id) {
            selectedKeyPoint.value = null
          }
          loadKeyPoints()
          loadStats()
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError('Greška prilikom brisanja ključne tačke')
      } finally {
        deleting.value = false
      }
    }
    

    
    const closeDialog = () => {
      showDialog.value = false
      editingKeyPoint.value = null
      // Clear form data
      keyPointData.name = ''
      keyPointData.description = ''
      keyPointData.estimatedTimeMinutes = null
      keyPointData.radius = 50
      keyPointData.isRequired = true
      keyPointData.images = []
      newImageUrl.value = ''
    }
    
    const showSuccess = (message) => {
      snackbarMessage.value = message
      snackbarColor.value = 'success'
      showSnackbar.value = true
    }
    
    const showError = (message) => {
      snackbarMessage.value = message
      snackbarColor.value = 'error'
      showSnackbar.value = true
    }
    
    onMounted(() => {
      loadKeyPoints()
      loadStats()
    })
    
    return {
      loading,
      saving,
      deleting,
      keyPoints,
      stats,
      selectedKeyPoint,
      showDialog,
      showDeleteDialog,
      keyPointToDelete,
      editingKeyPoint,
      formValid,
      newImageUrl,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      tourId,
      canEdit,
      mapCenter,
      keyPointData,
      selectedMapCoordinates,
      nameRules,
      descriptionRules,
      latitudeRules,
      longitudeRules,
      radiusRules,
      loadKeyPoints,
      selectKeyPoint,
      openAddDialog,
      editKeyPoint,
      addImage,
      removeImage,
      onCoordinatesSelected,
      saveKeyPoint,
      deleteKeyPoint,
      confirmDelete,
      closeDialog
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

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  min-width: 100px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

/* Content Row */
.content-row {
  gap: 2rem;
}

/* Panels */
.keypoints-panel,
.map-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
}

.panel-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.panel-title {
  display: flex;
  align-items: center;
}

.panel-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.panel-actions {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.add-button {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
  border-radius: 12px;
}

.refresh-button {
  border-radius: 12px;
}

/* Key Points List */
.keypoints-list {
  max-height: 500px;
  overflow-y: auto;
}

.points-container {
  padding: 1rem;
}

.keypoint-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.keypoint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: rgba(25, 118, 210, 0.3);
}

.keypoint-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.2);
}

.keypoint-order {
  margin-right: 1rem;
}

.keypoint-content {
  flex: 1;
}

.keypoint-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: rgba(0, 0, 0, 0.87);
}

.keypoint-details {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.detail-row {
  display: flex;
  align-items: center;
}

.coordinates {
  font-family: 'Courier New', monospace;
}

.keypoint-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: rgba(0, 0, 0, 0.7);
}

.empty-description {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.empty-action {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

/* Map Panel */
.map-container {
  padding: 1rem;
  height: 500px;
}

.selected-point {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Dialog Styles */
.modern-dialog :deep(.v-overlay__content) {
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-card {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-header {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.dialog-header.danger {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%);
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.dialog-content {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgba(25, 118, 210, 0.2);
  padding-bottom: 0.5rem;
}

.modern-input :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.switch-container {
  padding: 1rem;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.switch-description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.images-list {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.image-chip {
  border-radius: 8px;
}

.dialog-actions {
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cancel-btn,
.save-btn {
  border-radius: 12px;
  min-width: 120px;
}

.save-btn {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

/* Delete Dialog */
.delete-dialog .dialog-content {
  padding: 1.5rem 2rem;
}

.delete-content {
  text-align: center;
}

.delete-question {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: rgba(0, 0, 0, 0.7);
}

.delete-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 54, 0.2);
  font-size: 1.1rem;
}

.delete-confirm-btn {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
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
@media (max-width: 768px) {
  .modern-container {
    padding: 1rem 0.5rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .header-stats {
    justify-content: center;
    gap: 1rem;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .panel-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .map-container {
    height: 400px;
  }
  
  .dialog-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .dialog-content {
    padding: 1rem;
  }
  
  .dialog-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>