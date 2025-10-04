<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <v-card>
          <v-card-title class="text-h4">
            <v-icon left class="mr-2">mdi-map</v-icon>
            {{ showMyTours ? 'Moje ture' : 'Sve ture' }}
          </v-card-title>
          <v-card-subtitle v-if="showMyTours">
            Upravljajte vašim turama
          </v-card-subtitle>
          <v-card-actions>
            <v-btn
              v-if="canCreateTours && showMyTours"
              color="primary"
              prepend-icon="mdi-plus"
              @click="$router.push('/tours/create')"
            >
              Kreiranje nove ture
            </v-btn>
            <v-spacer />
            <v-btn-toggle
              v-model="viewMode"
              mandatory
              variant="outlined"
            >
              <v-btn value="all" icon="mdi-earth" @click="showMyTours = false" />
              <v-btn 
                v-if="authStore.isAuthenticated" 
                value="my" 
                icon="mdi-account" 
                @click="showMyTours = true" 
              />
            </v-btn-toggle>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col>
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.status"
                  label="Status"
                  :items="statusOptions"
                  clearable
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.difficulty"
                  label="Težina"
                  :items="difficultyOptions"
                  clearable
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.search"
                  label="Pretraži ture"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="loadTours"
                  :loading="loading"
                  block
                >
                  Pretraži
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tours Grid -->
    <v-row>
      <v-col
        v-for="tour in tours"
        :key="tour.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card class="tour-card" height="400">
          <!-- Tour Image -->
          <v-img
            :src="tour.images?.[0] || '/placeholder-tour.jpg'"
            height="200"
            cover
            class="grey lighten-2"
          >
            <div class="d-flex pa-2">
              <v-chip
                :color="getStatusColor(tour.status)"
                size="small"
                variant="flat"
              >
                {{ getStatusText(tour.status) }}
              </v-chip>
              <v-spacer />
              <v-chip
                :color="getDifficultyColor(tour.difficulty)"
                size="small"
                variant="flat"
              >
                {{ getDifficultyText(tour.difficulty) }}
              </v-chip>
            </div>
          </v-img>

          <!-- Tour Content -->
          <v-card-text class="d-flex flex-column" style="height: 200px;">
            <div>
              <v-card-title class="pa-0 text-h6 mb-2">
                {{ tour.name }}
              </v-card-title>
              <v-card-subtitle class="pa-0 mb-2">
                <v-icon size="small" class="mr-1">mdi-account</v-icon>
                {{ tour.authorUsername }}
              </v-card-subtitle>
              <p class="text-body-2 mb-2" style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                {{ tour.description }}
              </p>
            </div>

            <v-spacer />

            <!-- Tour Details -->
            <div class="mb-2">
              <v-row dense>
                <v-col v-if="tour.estimatedDuration">
                  <v-chip size="x-small" variant="text">
                    <v-icon start size="small">mdi-clock-outline</v-icon>
                    {{ tour.estimatedDuration }}min
                  </v-chip>
                </v-col>
                <v-col>
                  <v-chip size="x-small" variant="text">
                    <v-icon start size="small">mdi-currency-eur</v-icon>
                    {{ tour.price }}€
                  </v-chip>
                </v-col>
              </v-row>
            </div>

            <!-- Tags -->
            <div v-if="tour.tags && tour.tags.length > 0" class="mb-2">
              <v-chip
                v-for="tag in tour.tags.slice(0, 3)"
                :key="tag"
                size="x-small"
                variant="outlined"
                class="mr-1"
              >
                {{ tag }}
              </v-chip>
              <span v-if="tour.tags.length > 3" class="text-caption">
                +{{ tour.tags.length - 3 }}
              </span>
            </div>
          </v-card-text>

          <!-- Tour Actions -->
          <v-card-actions>
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="mdi-eye"
              @click="viewTour(tour)"
            >
              Prikaži
            </v-btn>
            
            <v-spacer />
            
            <!-- Author Actions -->
            <div v-if="canEditTour(tour)" class="d-flex">
              <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item @click="editTour(tour)">
                    <v-list-item-title>
                      <v-icon start>mdi-pencil</v-icon>
                      Edituj
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item 
                    v-if="tour.status === 'draft'"
                    @click="publishTour(tour)"
                  >
                    <v-list-item-title>
                      <v-icon start>mdi-publish</v-icon>
                      Objavi
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item 
                    v-if="tour.status === 'published'"
                    @click="archiveTour(tour)"
                  >
                    <v-list-item-title>
                      <v-icon start>mdi-archive</v-icon>
                      Arhiviraj
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="deleteTour(tour)">
                    <v-list-item-title class="text-error">
                      <v-icon start>mdi-delete</v-icon>
                      Obriši
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-if="!loading && tours.length === 0" justify="center">
      <v-col cols="12" md="6">
        <v-card class="text-center pa-8">
          <v-icon size="80" color="grey-lighten-1" class="mb-4">
            mdi-map-marker-off
          </v-icon>
          <v-card-title class="text-h5 mb-2">
            {{ showMyTours ? 'Nemate kreiranje tura' : 'Nema dostupnih tura' }}
          </v-card-title>
          <v-card-text>
            {{ showMyTours ? 'Kreirajte svoju prvu turu da počnete.' : 'Trenutno nema objavljenih tura.' }}
          </v-card-text>
          <v-card-actions v-if="showMyTours && canCreateTours" justify="center">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="$router.push('/tours/create')"
            >
              Kreiraj turu
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="mt-2">Učitavanje tura...</p>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <v-row v-if="totalPages > 1" justify="center" class="mt-4">
      <v-col cols="auto">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          @update:model-value="loadTours"
        />
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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>
          <v-icon start color="error">mdi-delete</v-icon>
          Potvrda brisanja
        </v-card-title>
        <v-card-text>
          Da li ste sigurni da želite da obrišete turu "{{ selectedTour?.name }}"?
          Ova akcija se ne može poništiti.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Otkaži</v-btn>
          <v-btn color="error" @click="confirmDelete">Obriši</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import tourAPI from '../api/tours'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'TourList',
  props: {
    showMyTours: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const loading = ref(false)
    const tours = ref([])
    const currentPage = ref(1)
    const totalPages = ref(0)
    const showMyTours = ref(props.showMyTours) // Use prop to set initial state
    const viewMode = ref(props.showMyTours ? 'my' : 'all') // Set view mode based on prop
    const showSnackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('success')
    const deleteDialog = ref(false)
    const selectedTour = ref(null)

    const filters = reactive({
      status: '',
      difficulty: '',
      search: ''
    })

    const statusOptions = [
      { title: 'Draft', value: 'draft' },
      { title: 'Objavljeno', value: 'published' },
      { title: 'Arhivirano', value: 'archived' }
    ]

    const difficultyOptions = [
      { title: 'Lako', value: 'easy' },
      { title: 'Srednje', value: 'medium' },
      { title: 'Teško', value: 'hard' }
    ]

    const canCreateTours = computed(() => {
      return authStore.isAuthenticated && 
             (authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator')
    })

    const canEditTour = (tour) => {
      return authStore.isAuthenticated && 
             authStore.user?.id === tour.authorId
    }

    // Watch for view mode changes
    watch(viewMode, (newMode) => {
      showMyTours.value = newMode === 'my'
      currentPage.value = 1
      loadTours()
    })

    // Watch for route changes to handle navigation between /tours and /tours/my
    watch(() => route.path, (newPath) => {
      const isMyToursRoute = newPath === '/tours/my'
      showMyTours.value = isMyToursRoute
      viewMode.value = isMyToursRoute ? 'my' : 'all'
      currentPage.value = 1
      loadTours()
    })

    // Watch for prop changes (when component is reused)
    watch(() => props.showMyTours, (newValue) => {
      showMyTours.value = newValue
      viewMode.value = newValue ? 'my' : 'all'
      currentPage.value = 1
      loadTours()
    })

    // Helper functions
    const getStatusColor = (status) => {
      switch (status) {
        case 'draft': return 'orange'
        case 'published': return 'green'
        case 'archived': return 'grey'
        default: return 'grey'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'draft': return 'Draft'
        case 'published': return 'Objavljeno'
        case 'archived': return 'Arhivirano'
        default: return status
      }
    }

    const getDifficultyColor = (difficulty) => {
      switch (difficulty) {
        case 'easy': return 'green'
        case 'medium': return 'orange'
        case 'hard': return 'red'
        default: return 'grey'
      }
    }

    const getDifficultyText = (difficulty) => {
      switch (difficulty) {
        case 'easy': return 'Lako'
        case 'medium': return 'Srednje'
        case 'hard': return 'Teško'
        default: return difficulty
      }
    }

    // Methods
    const loadTours = async () => {
      loading.value = true
      try {
        const result = showMyTours.value 
          ? await tourAPI.getMyTours(currentPage.value, 12, filters)
          : await tourAPI.getAllTours(currentPage.value, 12, filters)

        if (result.success) {
          tours.value = result.data.tours
          totalPages.value = result.data.pagination.totalPages
        } else {
          showSnackbar.value = true
          snackbarMessage.value = result.error
          snackbarColor.value = 'error'
        }
      } catch (error) {
        console.error('Load tours error:', error)
        showSnackbar.value = true
        snackbarMessage.value = 'Greška prilikom učitavanja tura'
        snackbarColor.value = 'error'
      } finally {
        loading.value = false
      }
    }

    const viewTour = (tour) => {
      router.push(`/tours/${tour.id}`)
    }

    const editTour = (tour) => {
      router.push(`/tours/${tour.id}/edit`)
    }

    const publishTour = async (tour) => {
      try {
        const result = await tourAPI.publishTour(tour.id)
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno objavljena!'
          snackbarColor.value = 'success'
          loadTours()
        } else {
          showSnackbar.value = true
          snackbarMessage.value = result.error
          snackbarColor.value = 'error'
        }
      } catch (error) {
        console.error('Publish tour error:', error)
        showSnackbar.value = true
        snackbarMessage.value = 'Greška prilikom objavljivanja ture'
        snackbarColor.value = 'error'
      }
    }

    const archiveTour = async (tour) => {
      try {
        const result = await tourAPI.archiveTour(tour.id)
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno arhivirana!'
          snackbarColor.value = 'success'
          loadTours()
        } else {
          showSnackbar.value = true
          snackbarMessage.value = result.error
          snackbarColor.value = 'error'
        }
      } catch (error) {
        console.error('Archive tour error:', error)
        showSnackbar.value = true
        snackbarMessage.value = 'Greška prilikom arhiviranja ture'
        snackbarColor.value = 'error'
      }
    }

    const deleteTour = (tour) => {
      selectedTour.value = tour
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      if (!selectedTour.value) return

      try {
        const result = await tourAPI.deleteTour(selectedTour.value.id)
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno obrisana!'
          snackbarColor.value = 'success'
          deleteDialog.value = false
          selectedTour.value = null
          loadTours()
        } else {
          showSnackbar.value = true
          snackbarMessage.value = result.error
          snackbarColor.value = 'error'
        }
      } catch (error) {
        console.error('Delete tour error:', error)
        showSnackbar.value = true
        snackbarMessage.value = 'Greška prilikom brisanja ture'
        snackbarColor.value = 'error'
      }
    }

    onMounted(() => {
      loadTours()
    })

    return {
      loading,
      tours,
      currentPage,
      totalPages,
      showMyTours,
      viewMode,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      deleteDialog,
      selectedTour,
      filters,
      statusOptions,
      difficultyOptions,
      authStore,
      canCreateTours,
      getStatusColor,
      getStatusText,
      getDifficultyColor,
      getDifficultyText,
      loadTours,
      viewTour,
      editTour,
      canEditTour,
      publishTour,
      archiveTour,
      deleteTour,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.tour-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.tour-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>