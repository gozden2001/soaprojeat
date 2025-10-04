<template>
  <v-container fluid>
    <v-row>
      <!-- Key Points List -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-map-marker-multiple</v-icon>
            Ključne tačke
            <v-spacer />
            <v-chip v-if="stats" size="small" color="primary">
              {{ stats.totalKeyPoints }}
            </v-chip>
          </v-card-title>
          
          <v-card-subtitle v-if="stats">
            {{ stats.requiredKeyPoints }} obaveznih, {{ stats.optionalKeyPoints }} opcionalnih
            <br>
            Ukupno vreme: {{ stats.totalEstimatedTime }} min
          </v-card-subtitle>
          
          <v-divider />
          
          <v-card-actions>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openAddDialog"
              :disabled="!canEdit"
              variant="flat"
              size="small"
            >
              Dodaj tačku
            </v-btn>
            <v-spacer />
            <v-btn
              icon="mdi-refresh"
              @click="loadKeyPoints"
              :loading="loading"
              variant="text"
              size="small"
            />
          </v-card-actions>
          
          <v-divider />
          
          <!-- Key Points List -->
          <div class="key-points-list">
            <v-list v-if="keyPoints.length > 0" density="compact">
              <v-list-item
                v-for="(keyPoint, index) in keyPoints"
                :key="keyPoint.id"
                @click="selectKeyPoint(keyPoint)"
                :active="selectedKeyPoint?.id === keyPoint.id"
                class="key-point-item"
              >
                <template #prepend>
                  <v-chip
                    size="x-small"
                    :color="keyPoint.isRequired ? 'error' : 'warning'"
                    variant="flat"
                    class="order-chip"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </template>
                
                <v-list-item-title class="text-subtitle-2">
                  {{ keyPoint.name }}
                </v-list-item-title>
                
                <v-list-item-subtitle class="text-caption">
                  <div class="d-flex align-center">
                    <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                    {{ keyPoint.coordinates.latitude.toFixed(4) }}, 
                    {{ keyPoint.coordinates.longitude.toFixed(4) }}
                  </div>
                  <div v-if="keyPoint.estimatedTimeMinutes" class="d-flex align-center mt-1">
                    <v-icon size="x-small" class="mr-1">mdi-clock-outline</v-icon>
                    {{ keyPoint.estimatedTimeMinutes }} min
                  </div>
                </v-list-item-subtitle>
                
                <template #append>
                  <div class="d-flex">
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="x-small"
                      @click.stop="editKeyPoint(keyPoint)"
                      :disabled="!canEdit"
                    />
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="x-small"
                      color="error"
                      @click.stop="deleteKeyPoint(keyPoint)"
                      :disabled="!canEdit"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>
            
            <div v-else class="pa-4 text-center">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">
                mdi-map-marker-off
              </v-icon>
              <p class="text-body-2 text-grey">
                Nema dodanih ključnih tačaka
              </p>
              <v-btn
                v-if="canEdit"
                color="primary"
                variant="outlined"
                size="small"
                @click="openAddDialog"
              >
                Dodaj prvu tačku
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <!-- Map View -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-map</v-icon>
            Mapa ključnih tačaka
            <v-spacer />
            <v-chip v-if="selectedKeyPoint" color="primary" size="small">
              {{ selectedKeyPoint.name }}
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <KeyPointMapPicker
              :initial-coordinates="mapCenter"
              :key-points="keyPoints"
              :selected-key-point="selectedKeyPoint"
              @coordinates-selected="onCoordinatesSelected"
              @key-point-selected="selectKeyPoint"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Add/Edit Key Point Dialog -->
    <v-dialog v-model="showDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">{{ editingKeyPoint ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingKeyPoint ? 'Edituj ključnu tačku' : 'Dodaj ključnu tačku' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="keyPointForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="keyPointData.name"
                  label="Naziv tačke"
                  :rules="nameRules"
                  variant="outlined"
                  required
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="keyPointData.description"
                  label="Opis tačke"
                  :rules="descriptionRules"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  v-model.number="keyPointData.coordinates.latitude"
                  label="Latitude"
                  type="number"
                  step="0.000001"
                  :rules="latitudeRules"
                  variant="outlined"
                  required
                />
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  v-model.number="keyPointData.coordinates.longitude"
                  label="Longitude"
                  type="number"
                  step="0.000001"
                  :rules="longitudeRules"
                  variant="outlined"
                  required
                />
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  v-model.number="keyPointData.estimatedTimeMinutes"
                  label="Procenjeno vreme (min)"
                  type="number"
                  min="1"
                  max="1440"
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  v-model.number="keyPointData.radius"
                  label="Radius (metri)"
                  type="number"
                  min="1"
                  max="1000"
                  :rules="radiusRules"
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12">
                <v-switch
                  v-model="keyPointData.isRequired"
                  label="Obavezna tačka"
                  color="primary"
                  inset
                />
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="newImageUrl"
                  label="URL slike"
                  variant="outlined"
                  append-icon="mdi-plus"
                  @click:append="addImage"
                  @keyup.enter="addImage"
                />
                
                <div v-if="keyPointData.images.length > 0" class="mt-2">
                  <v-chip
                    v-for="(image, index) in keyPointData.images"
                    :key="index"
                    closable
                    @click:close="removeImage(index)"
                    class="mr-2 mb-2"
                    size="small"
                  >
                    Slika {{ index + 1 }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDialog" variant="text">
            Otkaži
          </v-btn>
          <v-btn
            @click="saveKeyPoint"
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ editingKeyPoint ? 'Ažuriraj' : 'Dodaj' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Potvrda brisanja
        </v-card-title>
        <v-card-text>
          Da li ste sigurni da želite da obrišete ključnu tačku "{{ keyPointToDelete?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false" variant="text">
            Otkaži
          </v-btn>
          <v-btn
            @click="confirmDelete"
            color="error"
            variant="flat"
            :loading="deleting"
          >
            Obriši
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="5000"
      location="top"
    >
      {{ snackbarMessage }}
      <template #actions>
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
    
    const mapCenter = computed(() => {
      if (keyPoints.value.length > 0) {
        const firstPoint = keyPoints.value[0]
        return firstPoint.coordinates
      }
      return { latitude: 45.2671, longitude: 19.8335 } // Novi Sad center
    })
    
    const keyPointData = reactive({
      name: '',
      description: '',
      coordinates: {
        latitude: 45.2671,
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
      resetKeyPointData()
      showDialog.value = true
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
    
    const resetKeyPointData = () => {
      Object.assign(keyPointData, {
        name: '',
        description: '',
        coordinates: {
          latitude: 45.2671,
          longitude: 19.8335
        },
        estimatedTimeMinutes: null,
        radius: 50,
        isRequired: true,
        images: []
      })
      newImageUrl.value = ''
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
      keyPointData.coordinates = coordinates
    }
    
    const saveKeyPoint = async () => {
      if (!formValid.value) return
      
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
      resetKeyPointData()
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
.key-points-list {
  max-height: 400px;
  overflow-y: auto;
}

.key-point-item {
  border-left: 3px solid transparent;
  transition: border-color 0.2s;
}

.key-point-item.v-list-item--active {
  border-left-color: rgb(var(--v-theme-primary));
}

.order-chip {
  margin-right: 8px;
}
</style>