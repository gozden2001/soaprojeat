<template>
  <div class="tour-detail-view">
    <!-- Hero Section -->
    <section v-if="tour" class="tour-hero-section">
      <v-container>
        <div class="hero-content animate-fade-in">
          <div class="hero-info">
            <div class="hero-icon">
              <v-icon size="48" color="white">mdi-map-marker</v-icon>
            </div>
            <h1 class="hero-title font-heading">{{ tour.name }}</h1>
            <div class="hero-meta">
              <div class="meta-chips">
                <v-chip
                  :color="getStatusColor(tour.status)"
                  size="small"
                  variant="flat"
                  class="status-chip"
                >
                  {{ getStatusText(tour.status) }}
                </v-chip>
                <v-chip
                  :color="getDifficultyColor(tour.difficulty)"
                  size="small"
                  variant="flat"
                  class="difficulty-chip"
                >
                  {{ getDifficultyText(tour.difficulty) }}
                </v-chip>
              </div>
              <div class="meta-details">
                <div class="meta-item">
                  <v-icon size="small" color="white">mdi-account</v-icon>
                  <span>{{ tour.authorUsername }}</span>
                </div>
                <div class="meta-item">
                  <v-icon size="small" color="white">mdi-currency-eur</v-icon>
                  <span>{{ tour.price }}€</span>
                </div>
                <div v-if="tour.estimatedDuration" class="meta-item">
                  <v-icon size="small" color="white">mdi-clock-outline</v-icon>
                  <span>{{ tour.estimatedDuration }} min</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Hero Actions -->
          <div class="hero-actions">
            <v-btn
              color="white"
              size="large"
              prepend-icon="mdi-arrow-left"
              @click="goBack"
              class="back-btn"
            >
              Nazad
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="content-container">
      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <v-card class="loading-card" elevation="0">
          <v-card-text class="loading-content">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
            <p class="loading-text">Učitavanje ture...</p>
          </v-card-text>
        </v-card>
      </div>

      <!-- Tour Content -->
      <div v-else-if="tour" class="tour-content">
        <!-- Tour Images Carousel -->
        <v-card v-if="tour.images && tour.images.length > 0" class="images-card" elevation="0">
          <v-carousel
            height="500"
            hide-delimiter-background
            show-arrows="hover"
            class="tour-carousel"
          >
            <v-carousel-item
              v-for="(image, index) in tour.images"
              :key="index"
              :src="image"
              cover
              class="carousel-item"
            >
              <div class="carousel-overlay">
                <v-chip class="image-counter">
                  {{ index + 1 }} / {{ tour.images.length }}
                </v-chip>
              </div>
            </v-carousel-item>
          </v-carousel>
        </v-card>

        <!-- Tour Description -->
        <v-card class="description-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-text</v-icon>
            Opis ture
          </v-card-title>
          <v-card-text class="description-content">
            <p class="description-text">{{ tour.description }}</p>
          </v-card-text>
        </v-card>

        <!-- Tour Tags -->
        <v-card v-if="tour.tags && tour.tags.length > 0" class="tags-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-tag-multiple</v-icon>
            Tagovi
          </v-card-title>
          <v-card-text class="tags-content">
            <div class="tags-grid">
              <v-chip
                v-for="tag in tour.tags"
                :key="tag"
                variant="outlined"
                color="primary"
                class="tour-tag"
              >
                {{ tag }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <!-- Key Points - Purchased/Author View -->
        <v-card v-if="(owns || canEdit) && keyPoints.length > 0" class="keypoints-card" elevation="0">
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-map-marker-multiple</v-icon>
            Ključne tačke ture
            <v-chip
              v-if="owns"
              color="success"
              size="small"
              variant="flat"
              class="access-chip"
            >
              <v-icon start size="small">mdi-check-circle</v-icon>
              Sve tačke dostupne
            </v-chip>
          </v-card-title>
          <v-card-text class="keypoints-content">
            <div class="keypoints-grid">
              <v-card
                v-for="(keyPoint, index) in keyPoints"
                :key="keyPoint.id"
                class="keypoint-card"
                elevation="0"
              >
                <v-card-title class="keypoint-title">
                  <v-chip
                    color="primary"
                    size="small"
                    class="keypoint-number"
                  >
                    {{ index + 1 }}
                  </v-chip>
                  <span class="keypoint-name">{{ keyPoint.name }}</span>
                </v-card-title>
                
                <v-card-text class="keypoint-content">
                  <p class="keypoint-description">
                    {{ keyPoint.description || 'Nema opisa' }}
                  </p>
                  
                  <div class="keypoint-details">
                    <div v-if="keyPoint.latitude && keyPoint.longitude" class="detail-item">
                      <v-icon size="small" color="primary">mdi-map-marker</v-icon>
                      <span class="detail-text">
                        {{ Number(keyPoint.latitude).toFixed(6) }}, {{ Number(keyPoint.longitude).toFixed(6) }}
                      </span>
                    </div>
                    
                    <div v-if="keyPoint.order" class="detail-item">
                      <v-icon size="small" color="primary">mdi-sort-numeric-ascending</v-icon>
                      <span class="detail-text">Redosled: {{ keyPoint.order }}</span>
                    </div>
                  </div>
                </v-card-text>

                <div v-if="keyPoint.image" class="keypoint-image">
                  <v-img
                    :src="keyPoint.image"
                    height="200"
                    cover
                    class="keypoint-img"
                  />
                </div>
              </v-card>
            </div>
          </v-card-text>
        </v-card>

        <!-- Key Points - Locked View for Tourists -->
        <v-card 
          v-else-if="authStore.user?.role === 'turista' && !owns && tour.status === 'published'" 
          class="locked-card" 
          elevation="0"
        >
          <v-card-title class="card-title">
            <v-icon class="title-icon">mdi-lock</v-icon>
            Ključne tačke ture
          </v-card-title>
          <v-card-text class="locked-content">
            <v-alert 
              type="info" 
              variant="tonal" 
              class="purchase-alert"
              prominent
            >
              <template #title>
                <v-icon start>mdi-information</v-icon>
                Kupite turu da vidite sve ključne tačke
              </template>
              <p class="alert-text">
                Tura sadrži {{ keyPoints.length || '...' }} ključnih tačaka koje će biti otkrivene nakon kupovine.
                Videćete početnu i krajnju tačku, kao i sve detalje o ruti.
              </p>
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Actions Panel -->
        <v-card class="actions-card" elevation="0">
          <v-card-text class="actions-content">
            <!-- Author Actions -->
            <div v-if="canEdit" class="author-actions">
              <h3 class="actions-title">Upravljanje turom</h3>
              <div class="actions-grid">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-pencil"
                  @click="editTour"
                  class="action-btn"
                  size="large"
                >
                  Edituj turu
                </v-btn>
                
                <v-btn
                  color="info"
                  variant="outlined"
                  prepend-icon="mdi-map-marker-multiple"
                  @click="manageKeyPoints"
                  class="action-btn"
                  size="large"
                >
                  Ključne tačke
                </v-btn>
                
                <v-btn
                  v-if="tour.status === 'draft'"
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-publish"
                  @click="publishTour"
                  class="action-btn primary-action"
                  size="large"
                >
                  Objavi turu
                </v-btn>
                
                <v-btn
                  v-if="tour.status === 'published'"
                  color="orange"
                  variant="flat"
                  prepend-icon="mdi-archive"
                  @click="archiveTour"
                  class="action-btn"
                  size="large"
                >
                  Arhiviraj
                </v-btn>
              </div>
            </div>
            
            <!-- Tourist Actions -->
            <div v-else-if="tour.status === 'published' && authStore.user?.role === 'turista'" class="tourist-actions">
              <h3 class="actions-title">Akcije</h3>
              <div class="actions-grid tourist-grid">
                <!-- Completed Tour -->
                <v-card
                  v-if="owns && isCompleted"
                  class="status-card completed-card"
                  elevation="0"
                >
                  <v-card-text class="status-content">
                    <v-icon size="48" color="success">mdi-check-circle</v-icon>
                    <h4 class="status-title">Tura završena</h4>
                    <p class="status-text">Uspešno ste završili ovu turu!</p>
                  </v-card-text>
                </v-card>
                
                <!-- Active Tour -->
                <v-btn
                  v-else-if="owns && !isCompleted"
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-play"
                  @click="startActiveTour"
                  class="action-btn primary-action"
                  size="x-large"
                >
                  Pokreni turu
                </v-btn>
                
                <!-- Purchase Status -->
                <v-card
                  v-if="owns"
                  class="status-card purchased-card"
                  elevation="0"
                >
                  <v-card-text class="status-content">
                    <v-icon size="48" color="success">mdi-check-circle</v-icon>
                    <h4 class="status-title">Tura kupljena</h4>
                    <p class="status-text">Imate pristup svim ključnim tačkama</p>
                  </v-card-text>
                </v-card>
                
                <!-- Add to Cart -->
                <v-btn
                  v-else
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-cart-plus"
                  @click="addToCart"
                  :loading="addingToCart"
                  class="action-btn primary-action"
                  size="x-large"
                >
                  Dodaj u korpu ({{ tour.price }}€)
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <v-card class="error-card" elevation="0">
          <v-card-text class="error-content">
            <v-icon size="80" color="error" class="error-icon">
              mdi-alert-circle
            </v-icon>
            <h2 class="error-title">Tura nije pronađena</h2>
            <p class="error-message">
              Tražena tura ne postoji ili je obrisana.
            </p>
            <v-btn
              color="primary"
              variant="flat"
              @click="goBack"
              class="error-action"
              size="large"
            >
              Nazad na listu tura
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-container>

    <!-- Publish Dialog -->
    <v-dialog v-model="publishDialog" max-width="480" class="publish-dialog">
      <v-card class="publish-card">
        <v-card-title class="publish-title">
          <v-icon start color="success">mdi-publish</v-icon>
          Objavi turu
        </v-card-title>
        <v-card-text class="publish-content">
          <p class="publish-description">
            Postavite cenu za turu "{{ tour?.name }}" pre objavljivanja.
          </p>
          <v-text-field
            v-model="publishPrice"
            label="Cena (€)"
            type="number"
            min="1"
            step="0.01"
            variant="outlined"
            prepend-inner-icon="mdi-currency-eur"
            :rules="[
              v => !!v || 'Cena je obavezna',
              v => v > 0 || 'Cena mora biti veća od 0'
            ]"
            class="price-field"
          />
        </v-card-text>
        <v-card-actions class="publish-actions">
          <v-spacer />
          <v-btn @click="publishDialog = false" class="cancel-btn">Otkaži</v-btn>
          <v-btn 
            color="success" 
            @click="confirmPublish"
            :disabled="!publishPrice || publishPrice <= 0"
            class="publish-btn"
          >
            Objavi
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
      class="custom-snackbar"
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import tourAPI from '../api/tours'
import cartAPI from '../api/cart'
import purchasesAPI from '../api/purchases'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'TourDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const loading = ref(false)
    const tour = ref(null)
    const keyPoints = ref([])
    const owns = ref(false)
    const isCompleted = ref(false)
    const showSnackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('success')
    const publishDialog = ref(false)
    const publishPrice = ref(0)
    const addingToCart = ref(false)

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
        console.log('Loading tour with ID:', route.params.id)
        console.log('User role:', authStore.user?.role)
        const result = await tourAPI.getTourById(route.params.id)
        console.log('getTourById result:', result)
        if (result.success) {
          tour.value = result.data
          console.log('Loaded tour data:', tour.value)
          console.log('Tour isPurchased:', tour.value.isPurchased)
          
          // Check ownership after loading tour
          if (authStore.user?.role === 'turista') {
            await checkOwnership()
          } else if (canEdit.value) {
            // If user is author, load key points directly
            console.log('User is author, loading key points directly')
            await loadKeyPoints()
          }
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

    const checkOwnership = async () => {
      try {
        console.log('Checking ownership for tour:', route.params.id)
        const result = await purchasesAPI.checkTourOwnership(route.params.id)
        console.log('Ownership check result:', result)
        if (result.success) {
          owns.value = result.data.owns
          console.log('Owns tour:', owns.value, 'Can edit:', canEdit.value)
          
          // Check if tour is completed (only for tourists who own the tour)
          if (owns.value && authStore.user?.role === 'turista') {
            await checkCompletion()
          }
          
          // Load key points after ownership check
          if (owns.value || canEdit.value) {
            console.log('Loading key points...')
            await loadKeyPoints()
          }
        }
      } catch (error) {
        console.error('Check ownership error:', error)
      }
    }

    const checkCompletion = async () => {
      try {
        const result = await purchasesAPI.checkTourCompletion(route.params.id)
        if (result.success) {
          isCompleted.value = result.data.isCompleted
          console.log('Tour completed:', isCompleted.value)
        }
      } catch (error) {
        console.error('Check completion error:', error)
      }
    }

    const loadKeyPoints = async () => {
      try {
        console.log('Attempting to load key points for tour:', route.params.id)
        const result = await tourAPI.getTourKeyPoints(route.params.id)
        console.log('Key points result:', result)
        if (result.success) {
          // Extract keyPoints array from the response
          keyPoints.value = result.data.keyPoints || result.data || []
          console.log('Key points loaded:', keyPoints.value)
          console.log('Key points count:', keyPoints.value.length)
        }
      } catch (error) {
        console.error('Load key points error:', error)
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    const addToCart = async () => {
      try {
        addingToCart.value = true
        const result = await cartAPI.addToCart(tour.value.id)
        
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = result.data.message || 'Tura je dodana u korpu'
          snackbarColor.value = 'success'
          
          // Update tour purchase status
          await loadTour()
        } else {
          showSnackbar.value = true
          snackbarMessage.value = result.error || 'Greška pri dodavanju u korpu'
          snackbarColor.value = 'error'
        }
      } catch (error) {
        console.error('Add to cart error:', error)
        showSnackbar.value = true
        snackbarMessage.value = 'Greška pri dodavanju u korpu'
        snackbarColor.value = 'error'
      } finally {
        addingToCart.value = false
      }
    }

    const editTour = () => {
      router.push(`/tours/${tour.value.id}/edit`)
    }

    const manageKeyPoints = () => {
      router.push(`/tours/${tour.value.id}/key-points`)
    }

    const openPublishDialog = () => {
      console.log('openPublishDialog called for tour:', tour.value.id)
      publishPrice.value = 0
      publishDialog.value = true
      console.log('publishDialog set to true')
    }

    const confirmPublish = async () => {
      console.log('confirmPublish called with price:', publishPrice.value)
      if (!publishPrice.value || publishPrice.value <= 0) return

      try {
        console.log('Calling API with tour ID:', tour.value.id, 'and price:', publishPrice.value)
        const result = await tourAPI.publishTour(tour.value.id, publishPrice.value)
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno objavljena!'
          snackbarColor.value = 'success'
          publishDialog.value = false
          publishPrice.value = 0
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

    const publishTour = async () => {
      // This method is now replaced with openPublishDialog
      openPublishDialog()
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

    const startActiveTour = () => {
      router.push(`/tours/${tour.value.id}/active`)
    }

    onMounted(() => {
      loadTour()
    })

    return {
      loading,
      tour,
      keyPoints,
      owns,
      isCompleted,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      addingToCart,
      authStore,
      canEdit,
      getStatusColor,
      getStatusText,
      getDifficultyColor,
      getDifficultyText,
      goBack,
      editTour,
      manageKeyPoints,
      publishDialog,
      publishPrice,
      openPublishDialog,
      confirmPublish,
      publishTour,
      archiveTour,
      addToCart,
      startActiveTour
    }
  }
}
</script>

<style lang="scss" scoped>
.tour-detail-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--warm-bg-gradient-start), var(--warm-bg-gradient-end));
}

/* Hero Section */
.tour-hero-section {
  background: linear-gradient(135deg, #D4730A 0%, #F59E0B 100%) !important;
  color: white !important;
  padding: 3rem 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
  }

  * {
    color: white !important;
  }
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.hero-info {
  flex: 1;
  min-width: 300px;

  .hero-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    line-height: 1.2;
    color: white !important;
  }

  .hero-meta {
    .meta-chips {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;

      .status-chip,
      .difficulty-chip {
        backdrop-filter: blur(10px);
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }

    .meta-details {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 500;
        opacity: 0.9;
        color: white !important;
        
        span {
          color: white !important;
        }
      }
    }
  }
}

.hero-actions {
  .back-btn {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #D4730A !important;
    font-weight: 600;
    padding: 0 2rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
      background: white !important;
      color: #D4730A !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
}

/* Content Container */
.content-container {
  padding-top: 2rem;
  max-width: 1200px;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .loading-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(212, 115, 10, 0.08);
    border: 1px solid var(--warm-border);

    .loading-content {
      padding: 3rem;
      text-align: center;

      .loading-text {
        color: var(--warm-text-secondary);
        font-size: 1.1rem;
        margin-top: 1rem;
      }
    }
  }
}

/* Tour Content */
.tour-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Common Card Styling */
.images-card,
.description-card,
.tags-card,
.keypoints-card,
.locked-card,
.actions-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(212, 115, 10, 0.08);
  border: 1px solid var(--warm-border);
  overflow: hidden;

  .card-title {
    background: var(--warm-bg-secondary);
    border-bottom: 1px solid var(--warm-border);
    padding: 1.5rem 2rem;
    font-weight: 700;
    color: var(--warm-text-primary);
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .title-icon {
      color: var(--warm-primary);
    }

    .access-chip {
      margin-left: auto;
      background: var(--warm-success);
      color: white;
      font-weight: 600;
    }
  }
}

/* Images Carousel */
.images-card {
  .tour-carousel {
    border-radius: 20px;
    overflow: hidden;

    .carousel-item {
      position: relative;

      .carousel-overlay {
        position: absolute;
        top: 1rem;
        right: 1rem;
        z-index: 2;

        .image-counter {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          backdrop-filter: blur(10px);
          font-weight: 600;
        }
      }
    }
  }
}

/* Description Card */
.description-card {
  .description-content {
    padding: 2rem;

    .description-text {
      color: var(--warm-text-secondary);
      font-size: 1.1rem;
      line-height: 1.7;
      margin: 0;
    }
  }
}

/* Tags Card */
.tags-card {
  .tags-content {
    padding: 2rem;

    .tags-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;

      .tour-tag {
        border-color: var(--warm-primary);
        color: var(--warm-primary);
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          background: var(--warm-primary);
          color: white;
        }
      }
    }
  }
}

/* Key Points */
.keypoints-card {
  .keypoints-content {
    padding: 2rem;

    .keypoints-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;

      .keypoint-card {
        background: var(--warm-bg-secondary);
        border: 1px solid var(--warm-border);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(212, 115, 10, 0.12);
        }

        .keypoint-title {
          background: white;
          border-bottom: 1px solid var(--warm-border);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .keypoint-number {
            background: var(--warm-primary);
            color: white;
            font-weight: 700;
          }

          .keypoint-name {
            font-weight: 600;
            color: var(--warm-text-primary);
          }
        }

        .keypoint-content {
          padding: 1.5rem;

          .keypoint-description {
            color: var(--warm-text-secondary);
            line-height: 1.6;
            margin-bottom: 1rem;
          }

          .keypoint-details {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            .detail-item {
              display: flex;
              align-items: center;
              gap: 0.5rem;

              .detail-text {
                color: var(--warm-text-secondary);
                font-size: 0.9rem;
              }
            }
          }
        }

        .keypoint-image {
          .keypoint-img {
            border-radius: 0;
          }
        }
      }
    }
  }
}

/* Locked Card */
.locked-card {
  .locked-content {
    padding: 2rem;

    .purchase-alert {
      background: linear-gradient(135deg, rgba(212, 115, 10, 0.05), rgba(245, 158, 11, 0.05));
      border: 1px solid rgba(212, 115, 10, 0.2);
      border-radius: 16px;

      .alert-text {
        color: var(--warm-text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

/* Actions Card */
.actions-card {
  .actions-content {
    padding: 2rem;
  }

  .actions-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--warm-text-primary);
    margin-bottom: 1.5rem;
  }

  .actions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    &.tourist-grid {
      align-items: center;
    }

    .action-btn {
      flex: 1;
      min-width: 200px;
      text-transform: none;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      }

      &.primary-action {
        background: var(--warm-primary);
        color: white;
        box-shadow: 0 4px 12px rgba(212, 115, 10, 0.3);

        &:hover {
          background: var(--warm-primary-dark);
          box-shadow: 0 6px 20px rgba(212, 115, 10, 0.4);
        }
      }
    }
  }

  .status-card {
    flex: 1;
    min-width: 250px;
    background: linear-gradient(135deg, var(--warm-bg-secondary), white);
    border: 1px solid var(--warm-border);
    border-radius: 16px;

    .status-content {
      padding: 2rem;
      text-align: center;

      .status-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--warm-text-primary);
        margin: 1rem 0 0.5rem;
      }

      .status-text {
        color: var(--warm-text-secondary);
        margin: 0;
      }
    }

    &.completed-card {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1));
      border-color: rgba(34, 197, 94, 0.2);
    }

    &.purchased-card {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1));
      border-color: rgba(34, 197, 94, 0.2);
    }
  }
}

/* Error State */
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .error-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(212, 115, 10, 0.08);
    border: 1px solid var(--warm-border);
    max-width: 500px;

    .error-content {
      padding: 3rem;
      text-align: center;

      .error-icon {
        margin-bottom: 1rem;
      }

      .error-title {
        color: var(--warm-text-primary);
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      .error-message {
        color: var(--warm-text-secondary);
        font-size: 1.1rem;
        margin-bottom: 2rem;
        line-height: 1.5;
      }

      .error-action {
        background: var(--warm-primary);
        color: white;
        font-weight: 600;
        text-transform: none;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(212, 115, 10, 0.3);

        &:hover {
          background: var(--warm-primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 115, 10, 0.4);
        }
      }
    }
  }
}

/* Publish Dialog */
.publish-dialog {
  :deep(.v-overlay__content) {
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
}

.publish-card {
  .publish-title {
    background: var(--warm-bg-secondary);
    border-bottom: 1px solid var(--warm-border);
    padding: 1.5rem;
    font-weight: 700;
    color: var(--warm-text-primary);
  }

  .publish-content {
    padding: 1.5rem;

    .publish-description {
      color: var(--warm-text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .price-field {
      :deep(.v-field) {
        border-radius: 12px;
      }
    }
  }

  .publish-actions {
    padding: 1rem 1.5rem;
    background: var(--warm-bg-secondary);
    border-top: 1px solid var(--warm-border);

    .cancel-btn {
      color: var(--warm-text-secondary);
      text-transform: none;
      
      &:hover {
        background: rgba(108, 117, 125, 0.08);
      }
    }

    .publish-btn {
      text-transform: none;
      font-weight: 600;
      border-radius: 8px;
    }
  }
}

/* Custom Snackbar */
.custom-snackbar {
  :deep(.v-snackbar__wrapper) {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .tour-hero-section {
    padding: 2rem 0;

    .hero-content {
      flex-direction: column;
      text-align: center;
      gap: 1.5rem;
    }

    .hero-info {
      min-width: auto;

      .hero-title {
        font-size: 2rem;
      }

      .hero-meta {
        .meta-details {
          justify-content: center;
        }
      }
    }
  }

  .content-container {
    padding-top: 1rem;
  }

  .images-card,
  .description-card,
  .tags-card,
  .keypoints-card,
  .locked-card,
  .actions-card {
    .card-title {
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
    }
  }

  .description-card .description-content,
  .tags-card .tags-content,
  .keypoints-card .keypoints-content,
  .locked-card .locked-content,
  .actions-card .actions-content {
    padding: 1.5rem;
  }

  .keypoints-grid {
    grid-template-columns: 1fr !important;
  }

  .actions-grid {
    flex-direction: column;

    .action-btn {
      min-width: auto;
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .hero-info {
    .hero-meta {
      .meta-chips {
        justify-content: center;
      }

      .meta-details {
        flex-direction: column;
        gap: 0.75rem;
      }
    }
  }

  .keypoint-card {
    .keypoint-content {
      padding: 1rem !important;
    }
  }
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>