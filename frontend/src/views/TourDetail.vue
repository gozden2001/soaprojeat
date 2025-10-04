<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Loading -->
        <v-card v-if="loading" class="text-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
          <p class="mt-2">Učitavanje ture...</p>
        </v-card>

        <!-- Tour Details -->
        <div v-else-if="tour">
          <!-- Tour Header -->
          <v-card class="mb-4">
            <v-card-title class="text-h4">
              <v-icon left class="mr-2">mdi-map-marker</v-icon>
              {{ tour.name }}
            </v-card-title>
            <v-card-subtitle>
              <v-row align="center" class="mt-1">
                <v-col cols="auto">
                  <v-chip
                    :color="getStatusColor(tour.status)"
                    size="small"
                    variant="flat"
                  >
                    {{ getStatusText(tour.status) }}
                  </v-chip>
                </v-col>
                <v-col cols="auto">
                  <v-chip
                    :color="getDifficultyColor(tour.difficulty)"
                    size="small"
                    variant="flat"
                  >
                    {{ getDifficultyText(tour.difficulty) }}
                  </v-chip>
                </v-col>
                <v-col cols="auto">
                  <v-icon size="small" class="mr-1">mdi-account</v-icon>
                  {{ tour.authorUsername }}
                </v-col>
                <v-col cols="auto">
                  <v-icon size="small" class="mr-1">mdi-currency-eur</v-icon>
                  {{ tour.price }}€
                </v-col>
                <v-col v-if="tour.estimatedDuration" cols="auto">
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                  {{ tour.estimatedDuration }} min
                </v-col>
              </v-row>
            </v-card-subtitle>
          </v-card>

          <!-- Tour Images -->
          <v-card v-if="tour.images && tour.images.length > 0" class="mb-4">
            <v-carousel
              height="400"
              hide-delimiter-background
              show-arrows="hover"
            >
              <v-carousel-item
                v-for="(image, index) in tour.images"
                :key="index"
                :src="image"
                cover
              />
            </v-carousel>
          </v-card>

          <!-- Tour Description -->
          <v-card class="mb-4">
            <v-card-title>
              <v-icon left class="mr-2">mdi-text</v-icon>
              Opis ture
            </v-card-title>
            <v-card-text>
              <p class="text-body-1">{{ tour.description }}</p>
            </v-card-text>
          </v-card>

          <!-- Tour Tags -->
          <v-card v-if="tour.tags && tour.tags.length > 0" class="mb-4">
            <v-card-title>
              <v-icon left class="mr-2">mdi-tag-multiple</v-icon>
              Tagovi
            </v-card-title>
            <v-card-text>
              <v-chip
                v-for="tag in tour.tags"
                :key="tag"
                class="mr-2 mb-2"
                variant="outlined"
                color="primary"
              >
                {{ tag }}
              </v-chip>
            </v-card-text>
          </v-card>

          <!-- Actions -->
          <v-card class="mb-4">
            <v-card-actions>
              <v-btn
                color="grey"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                @click="goBack"
              >
                Nazad
              </v-btn>
              
              <v-spacer />
              
              <!-- Author Actions -->
              <div v-if="canEdit" class="d-flex">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-pencil"
                  @click="editTour"
                  class="mr-2"
                >
                  Edituj
                </v-btn>
                
                <v-btn
                  color="info"
                  variant="outlined"
                  prepend-icon="mdi-map-marker-multiple"
                  @click="manageKeyPoints"
                  class="mr-2"
                >
                  Ključne tačke
                </v-btn>
                
                <v-btn
                  v-if="tour.status === 'draft'"
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-publish"
                  @click="publishTour"
                >
                  Objavi
                </v-btn>
                
                <v-btn
                  v-if="tour.status === 'published'"
                  color="orange"
                  variant="flat"
                  prepend-icon="mdi-archive"
                  @click="archiveTour"
                >
                  Arhiviraj
                </v-btn>
              </div>
              
              <!-- Public Actions -->
              <div v-else-if="tour.status === 'published'">
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-cart-plus"
                  @click="addToCart"
                >
                  Dodaj u korpu
                </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </div>

        <!-- Error State -->
        <v-card v-else class="text-center pa-8">
          <v-icon size="80" color="error" class="mb-4">
            mdi-alert-circle
          </v-icon>
          <v-card-title class="text-h5 mb-2">
            Tura nije pronađena
          </v-card-title>
          <v-card-text>
            Tražena tura ne postoji ili je obrisana.
          </v-card-text>
          <v-card-actions justify="center">
            <v-btn
              color="primary"
              variant="flat"
              @click="goBack"
            >
              Nazad na listu tura
            </v-btn>
          </v-card-actions>
        </v-card>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import tourAPI from '../api/tours'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'TourDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const loading = ref(false)
    const tour = ref(null)
    const showSnackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('success')

    const canEdit = computed(() => {
      return authStore.isAuthenticated && 
             parseInt(authStore.user?.id) === parseInt(tour.value?.authorId)
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
    const loadTour = async () => {
      loading.value = true
      try {
        const result = await tourAPI.getTourById(route.params.id)
        if (result.success) {
          tour.value = result.data
        } else {
          showSnackbar.value = true
          snackbarMessage.value = result.error
          snackbarColor.value = 'error'
        }
      } catch (error) {
        console.error('Load tour error:', error)
        showSnackbar.value = true
        snackbarMessage.value = 'Greška prilikom učitavanja ture'
        snackbarColor.value = 'error'
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    const editTour = () => {
      router.push(`/tours/${tour.value.id}/edit`)
    }

    const manageKeyPoints = () => {
      router.push(`/tours/${tour.value.id}/key-points`)
    }

    const publishTour = async () => {
      try {
        const result = await tourAPI.publishTour(tour.value.id)
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno objavljena!'
          snackbarColor.value = 'success'
          loadTour() // Reload to get updated status
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

    const archiveTour = async () => {
      try {
        const result = await tourAPI.archiveTour(tour.value.id)
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno arhivirana!'
          snackbarColor.value = 'success'
          loadTour() // Reload to get updated status
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

    const addToCart = () => {
      // TODO: Implement shopping cart functionality
      showSnackbar.value = true
      snackbarMessage.value = 'Funkcionalnost korpe će biti implementirana u sledećoj tački'
      snackbarColor.value = 'info'
    }

    onMounted(() => {
      loadTour()
    })

    return {
      loading,
      tour,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      canEdit,
      getStatusColor,
      getStatusText,
      getDifficultyColor,
      getDifficultyText,
      goBack,
      editTour,
      manageKeyPoints,
      publishTour,
      archiveTour,
      addToCart
    }
  }
}
</script>

<style scoped>
.v-card-subtitle {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
</style>