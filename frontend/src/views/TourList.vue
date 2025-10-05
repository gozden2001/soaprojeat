<template>
  <div class="tour-list-view">
    <!-- Hero Header Section -->
    <section class="tours-hero-section">
      <v-container>
        <div class="hero-content animate-fade-in">
          <!-- Page Info -->
          <div class="hero-info">
            <div class="hero-icon">
              <v-icon size="48" color="white">mdi-map</v-icon>
            </div>
            <h1 class="hero-title font-heading">
              {{ showMyTours ? 'Moje ture' : 'Sve ture' }}
            </h1>
            <p v-if="showMyTours" class="hero-subtitle">
              Upravljajte vašim turama i kreirajte nova putovanja
            </p>
            <p v-else class="hero-subtitle">
              Otkrijte nezaboravna putovanja i avanture
            </p>
          </div>
          
          <!-- Hero Actions -->
          <div class="hero-actions">
            <v-btn
              v-if="canCreateTours && showMyTours"
              color="white"
              size="large"
              prepend-icon="mdi-plus"
              @click="$router.push('/tours/create')"
              class="create-tour-btn"
            >
              Kreiranje nove ture
            </v-btn>
            
            <v-btn-toggle
              v-model="viewMode"
              mandatory
              variant="outlined"
              class="view-toggle"
            >
              <v-btn 
                value="all" 
                @click="showMyTours = false"
                class="toggle-btn"
              >
                <v-icon>mdi-earth</v-icon>
                <span class="ml-2 d-none d-sm-inline">Sve ture</span>
              </v-btn>
              <v-btn 
                v-if="authStore.isAuthenticated" 
                value="my" 
                @click="showMyTours = true"
                class="toggle-btn"
              >
                <v-icon>mdi-account</v-icon>
                <span class="ml-2 d-none d-sm-inline">Moje ture</span>
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="content-container">
      <!-- Search and Filters -->
      <v-card class="filters-card" elevation="0">
        <v-card-text class="filters-content">
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.status"
                label="Status"
                :items="statusOptions"
                clearable
                variant="outlined"
                density="compact"
                class="filter-field"
                prepend-inner-icon="mdi-flag"
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
                class="filter-field"
                prepend-inner-icon="mdi-chart-line"
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
                class="search-field"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-btn
                color="primary"
                variant="flat"
                @click="loadTours"
                :loading="loading"
                block
                size="large"
                class="search-btn"
              >
                Pretraži
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Tours Grid -->
      <div v-if="!loading && tours.length > 0" class="tours-grid">
        <v-row>
          <v-col
            v-for="tour in tours"
            :key="tour.id"
            cols="12" sm="6" md="4" lg="3"
          >
            <v-card 
              class="tour-card" 
              elevation="0"
              @click="viewTour(tour)"
            >
              <!-- Tour Image -->
              <v-img
                :src="tour.images?.[0] || '/placeholder-tour.jpg'"
                height="200"
                cover
                class="tour-image"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="primary" />
                  </v-row>
                </template>
                
                <div class="image-overlay">
                  <v-icon color="white" size="32">mdi-eye</v-icon>
                </div>
                
                <div class="tour-badges">
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
              </v-img>

              <!-- Tour Content -->
              <v-card-text class="tour-content">
                <v-card-title class="tour-title">
                  {{ tour.name }}
                </v-card-title>
                
                <v-card-subtitle class="tour-author">
                  <v-icon size="small" class="mr-1">mdi-account</v-icon>
                  {{ tour.authorUsername }}
                </v-card-subtitle>
                
                <p class="tour-description">
                  {{ tour.description }}
                </p>

                <!-- Tour Details -->
                <div class="tour-details">
                  <div class="detail-item" v-if="tour.estimatedDuration">
                    <v-icon size="small" color="primary">mdi-clock-outline</v-icon>
                    <span>{{ tour.estimatedDuration }}min</span>
                  </div>
                  <div class="detail-item">
                    <v-icon size="small" color="primary">mdi-currency-eur</v-icon>
                    <span>{{ tour.price }}€</span>
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="tour.tags && tour.tags.length > 0" class="tour-tags">
                  <v-chip
                    v-for="tag in tour.tags.slice(0, 3)"
                    :key="tag"
                    size="x-small"
                    class="tour-tag"
                  >
                    {{ tag }}
                  </v-chip>
                  <span v-if="tour.tags.length > 3" class="more-tags">
                    +{{ tour.tags.length - 3 }}
                  </span>
                </div>
              </v-card-text>

              <!-- Tour Actions -->
              <v-card-actions class="tour-actions">
                <v-btn
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-eye"
                  @click.stop="viewTour(tour)"
                  class="view-btn"
                >
                  Prikaži
                </v-btn>
                
                <v-spacer />
                
                <!-- Tourist Actions - Add to Cart -->
                <v-btn
                  v-if="authStore.user?.role === 'turista' && tour.status === 'published' && !tour.isPurchased && !showMyTours"
                  variant="outlined"
                  color="success"
                  prepend-icon="mdi-cart-plus"
                  @click.stop="addToCart(tour.id)"
                  :loading="addingToCart.has(tour.id)"
                  size="small"
                  class="cart-btn"
                >
                  Korpa
                </v-btn>
                
                <!-- Purchased Indicator -->
                <v-chip
                  v-if="tour.isPurchased"
                  color="success"
                  variant="flat"
                  size="small"
                  prepend-icon="mdi-check-circle"
                  class="purchased-chip"
                >
                  Kupljeno
                </v-chip>
                
                <!-- Author Actions -->
                <div v-if="canEditTour(tour)" class="author-actions">
                  <v-menu location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        variant="text"
                        v-bind="props"
                        @click.stop
                        class="actions-menu-btn"
                      />
                    </template>
                    <v-list class="actions-menu">
                      <v-list-item @click="editTour(tour)" class="menu-item">
                        <v-list-item-title>
                          <v-icon start>mdi-pencil</v-icon>
                          Edituj
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item 
                        v-if="tour.status === 'draft'"
                        @click="() => { console.log('Inline click for tour:', tour.id); openPublishDialog(tour); }"
                        class="menu-item"
                      >
                        <v-list-item-title>
                          <v-icon start>mdi-publish</v-icon>
                          Objavi
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item 
                        v-if="tour.status === 'published'"
                        @click="archiveTour(tour)"
                        class="menu-item"
                      >
                        <v-list-item-title>
                          <v-icon start>mdi-archive</v-icon>
                          Arhiviraj
                        </v-list-item-title>
                      </v-list-item>
                      <v-divider class="menu-divider" />
                      <v-list-item @click="deleteTour(tour)" class="menu-item delete-item">
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
      </div>

      <!-- Empty State -->
      <div v-if="!loading && tours.length === 0" class="empty-state">
        <v-card class="empty-card" elevation="0">
          <v-card-text class="empty-content">
            <v-icon size="80" class="empty-icon mb-4">
              mdi-map-marker-off
            </v-icon>
            <h3 class="empty-title">
              {{ showMyTours ? 'Nemate kreiranje tura' : 'Nema dostupnih tura' }}
            </h3>
            <p class="empty-message">
              {{ showMyTours ? 'Kreirajte svoju prvu turu da počnete.' : 'Trenutno nema objavljenih tura.' }}
            </p>
            <v-btn
              v-if="showMyTours && canCreateTours"
              color="primary"
              prepend-icon="mdi-plus"
              @click="$router.push('/tours/create')"
              class="create-first-tour-btn"
            >
              Kreiraj turu
            </v-btn>
          </v-card-text>
        </v-card>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="loading-text">Učitavanje tura...</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          @update:model-value="loadTours"
          class="custom-pagination"
        />
      </div>
    </v-container>

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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="480" class="delete-dialog">
      <v-card class="delete-card">
        <v-card-title class="delete-title">
          <v-icon start color="error">mdi-delete</v-icon>
          Potvrda brisanja
        </v-card-title>
        <v-card-text class="delete-message">
          Da li ste sigurni da želite da obrišete turu "{{ selectedTour?.name }}"?
          Ova akcija se ne može poništiti.
        </v-card-text>
        <v-card-actions class="delete-actions">
          <v-spacer />
          <v-btn @click="deleteDialog = false" class="cancel-btn">Otkaži</v-btn>
          <v-btn color="error" @click="confirmDelete" class="confirm-btn">Obriši</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Publish Dialog -->
    <v-dialog v-model="publishDialog" max-width="480" class="publish-dialog">
      <v-card class="publish-card">
        <v-card-title class="publish-title">
          <v-icon start color="success">mdi-publish</v-icon>
          Objavi turu
        </v-card-title>
        <v-card-text class="publish-content">
          <p class="publish-description">
            Postavite cenu za turu "{{ selectedTour?.name }}" pre objavljivanja.
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
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import tourAPI from '../api/tours'
import cartAPI from '../api/cart'
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
    const publishDialog = ref(false)
    const publishPrice = ref(0)
    const selectedTour = ref(null)
    const addingToCart = ref(new Set())

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

    const addToCart = async (tourId) => {
      try {
        addingToCart.value.add(tourId)
        const result = await cartAPI.addToCart(tourId)
        
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = result.data.message || 'Tura je dodana u korpu'
          snackbarColor.value = 'success'
          
          // Update the tour to mark it as in cart (optional, you might want to track this)
          const tour = tours.value.find(t => t.id === tourId)
          if (tour) {
            tour.inCart = true
          }
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
        addingToCart.value.delete(tourId)
      }
    }

    const viewTour = (tour) => {
      console.log('Navigating to tour:', tour.id)
      router.push(`/tours/${tour.id}`)
    }

    const editTour = (tour) => {
      router.push(`/tours/${tour.id}/edit`)
    }

    const openPublishDialog = (tour) => {
      console.log('openPublishDialog called with tour:', tour.id)
      selectedTour.value = tour
      publishPrice.value = 0
      publishDialog.value = true
      console.log('publishDialog set to true')
    }

    const confirmPublish = async () => {
      console.log('confirmPublish called with price:', publishPrice.value)
      if (!selectedTour.value || !publishPrice.value || publishPrice.value <= 0) return

      try {
        console.log('Calling API with tour ID:', selectedTour.value.id, 'and price:', publishPrice.value)
        const result = await tourAPI.publishTour(selectedTour.value.id, publishPrice.value)
        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno objavljena!'
          snackbarColor.value = 'success'
          publishDialog.value = false
          selectedTour.value = null
          publishPrice.value = 0
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
      publishDialog,
      publishPrice,
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
      addingToCart,
      loadTours,
      addToCart,
      viewTour,
      editTour,
      canEditTour,
      openPublishDialog,
      confirmPublish,
      archiveTour,
      deleteTour,
      confirmDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.tour-list-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--warm-bg-gradient-start), var(--warm-bg-gradient-end));
}

/* Hero Section */
.tours-hero-section {
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
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: white !important;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 0;
    color: white !important;
  }
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  .create-tour-btn {
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

  .view-toggle {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    backdrop-filter: blur(10px);

    .toggle-btn {
      color: white !important;
      border-color: rgba(255, 255, 255, 0.3) !important;

      &.v-btn--selected {
        background: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
      }
    }
  }
}

/* Content Container */
.content-container {
  padding-top: 2rem;
  max-width: 1400px;
}

/* Filters Card */
.filters-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(212, 115, 10, 0.08);
  border: 1px solid var(--warm-border);
  margin-bottom: 2rem;
  overflow: hidden;

  .filters-content {
    padding: 2rem;
  }

  .filter-field,
  .search-field {
    :deep(.v-field) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(212, 115, 10, 0.04);
    }

    :deep(.v-field--focused) {
      box-shadow: 0 4px 12px rgba(212, 115, 10, 0.12);
    }
  }

  .search-btn {
    height: 56px;
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    box-shadow: 0 4px 12px rgba(212, 115, 10, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 115, 10, 0.3);
    }
  }
}

/* Tours Grid */
.tours-grid {
  margin-bottom: 3rem;
}

/* Tour Cards */
.tour-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid var(--warm-border);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(212, 115, 10, 0.15);
    border-color: var(--warm-secondary);

    .tour-image .image-overlay {
      opacity: 1;
    }

    .tour-title {
      color: var(--warm-primary);
    }
  }

  .tour-image {
    position: relative;
    border-radius: 20px 20px 0 0;

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(212, 115, 10, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 20px 20px 0 0;
    }

    .tour-badges {
      position: absolute;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: space-between;
      z-index: 2;

      .status-chip,
      .difficulty-chip {
        backdrop-filter: blur(10px);
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .tour-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;

    .tour-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--warm-text-primary);
      margin-bottom: 0.5rem;
      transition: color 0.3s ease;
      line-height: 1.3;
    }

    .tour-author {
      color: var(--warm-text-secondary);
      margin-bottom: 1rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
    }

    .tour-description {
      color: var(--warm-text-secondary);
      line-height: 1.5;
      margin-bottom: 1rem;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tour-details {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--warm-text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
      }
    }

    .tour-tags {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;

      .tour-tag {
        background: var(--warm-bg-secondary);
        color: var(--warm-primary);
        border: 1px solid var(--warm-border);
        font-weight: 500;
      }

      .more-tags {
        color: var(--warm-text-secondary);
        font-size: 0.8rem;
        font-weight: 500;
      }
    }
  }

  .tour-actions {
    padding: 1rem 1.5rem;
    background: var(--warm-bg-secondary);
    border-top: 1px solid var(--warm-border);

    .view-btn {
      color: var(--warm-primary);
      font-weight: 600;
      text-transform: none;

      &:hover {
        background: rgba(212, 115, 10, 0.08);
      }
    }

    .cart-btn {
      border-color: var(--warm-success);
      color: var(--warm-success);
      font-weight: 600;
      text-transform: none;

      &:hover {
        background: var(--warm-success);
        color: white;
      }
    }

    .purchased-chip {
      background: var(--warm-success);
      color: white;
      font-weight: 600;
    }

    .author-actions {
      .actions-menu-btn {
        color: var(--warm-text-secondary);

        &:hover {
          background: rgba(212, 115, 10, 0.08);
          color: var(--warm-primary);
        }
      }
    }
  }
}

/* Action Menu */
.actions-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--warm-border);
  overflow: hidden;

  .menu-item {
    padding: 0.75rem 1rem;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--warm-bg-secondary);
    }

    &.delete-item:hover {
      background: rgba(220, 38, 38, 0.05);
    }
  }

  .menu-divider {
    border-color: var(--warm-border);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .empty-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(212, 115, 10, 0.08);
    border: 1px solid var(--warm-border);
    text-align: center;
    max-width: 500px;
    margin: 0 auto;

    .empty-content {
      padding: 3rem;
    }

    .empty-icon {
      color: var(--warm-text-disabled);
      margin-bottom: 1rem;
    }

    .empty-title {
      color: var(--warm-text-primary);
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .empty-message {
      color: var(--warm-text-secondary);
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .create-first-tour-btn {
      background: var(--warm-primary);
      color: white;
      font-weight: 600;
      text-transform: none;
      padding: 0 2rem;
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

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  .loading-text {
    color: var(--warm-text-secondary);
    font-size: 1.1rem;
    margin: 0;
  }
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  margin-bottom: 2rem;

  .custom-pagination {
    :deep(.v-pagination__item) {
      border-radius: 12px;
      margin: 0 0.25rem;
      transition: all 0.2s ease;
    }

    :deep(.v-pagination__item--is-active) {
      background: var(--warm-primary);
      color: white;
      box-shadow: 0 2px 8px rgba(212, 115, 10, 0.3);
    }

    :deep(.v-pagination__item:hover:not(.v-pagination__item--is-active)) {
      background: var(--warm-bg-secondary);
      color: var(--warm-primary);
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

/* Dialogs */
.delete-dialog,
.publish-dialog {
  :deep(.v-overlay__content) {
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
}

.delete-card,
.publish-card {
  .delete-title,
  .publish-title {
    background: var(--warm-bg-secondary);
    border-bottom: 1px solid var(--warm-border);
    padding: 1.5rem;
    font-weight: 700;
    color: var(--warm-text-primary);
  }

  .delete-message,
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

  .delete-actions,
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

    .confirm-btn,
    .publish-btn {
      text-transform: none;
      font-weight: 600;
      border-radius: 8px;
    }
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .tours-hero-section {
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

      .hero-subtitle {
        font-size: 1.1rem;
      }
    }

    .hero-actions {
      justify-content: center;
      
      .create-tour-btn {
        width: 100%;
        max-width: 300px;
      }
    }
  }

  .filters-card .filters-content {
    padding: 1.5rem;
  }

  .tour-card {
    .tour-content {
      padding: 1rem;
    }

    .tour-actions {
      padding: 0.75rem 1rem;
    }
  }

  .empty-state .empty-card .empty-content {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-actions .view-toggle {
    width: 100%;

    .toggle-btn {
      flex: 1;
    }
  }

  .tour-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tour-actions {
    flex-wrap: wrap;
    gap: 0.5rem;

    .cart-btn {
      flex: 1;
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