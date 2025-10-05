<template>
  <v-container fluid class="modern-container">
    <!-- Modern Header -->
    <div class="header-section mb-8">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="40" color="white">mdi-shopping</v-icon>
        </div>
        <div class="header-text">
          <h1 class="text-h4 font-weight-bold mb-2">Moje kupljene ture</h1>
          <p class="text-body-1 opacity-80">Pregledajte sve ture koje ste kupili i pokrenite ih kada god želite</p>
        </div>
        <div v-if="purchases && purchases.length > 0" class="header-stats">
          <div class="stat-card">
            <div class="stat-number">{{ purchases.length }}</div>
            <div class="stat-label">Ukupno tura</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getActiveToursCount() }}</div>
            <div class="stat-label">Aktivne</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ formatPrice(getTotalSpent()) }}</div>
            <div class="stat-label">EUR potrošeno</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-card">
        <v-progress-circular 
          indeterminate 
          color="primary" 
          size="64"
          width="6"
        />
        <h3 class="loading-title">Učitavanje vaših tura...</h3>
        <p class="loading-description">Molimo sačekajte trenutak</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!purchases || purchases.length === 0" class="empty-section">
      <div class="empty-card">
        <div class="empty-icon">
          <v-icon size="120" color="primary" class="opacity-60">mdi-shopping-outline</v-icon>
        </div>
        <h2 class="empty-title">Nemate kupljenih tura</h2>
        <p class="empty-description">
          Istražite naše zanimljive ture i kupite one koje vas zanimaju. 
          Možete ih pokrenuti bilo kada i uživati u avanturi!
        </p>
        <v-btn
          color="primary"
          prepend-icon="mdi-compass"
          @click="$router.push('/tours')"
          size="x-large"
          class="explore-btn"
          variant="elevated"
        >
          Istražite ture
        </v-btn>
      </div>
    </div>

    <!-- Tours Grid -->
    <div v-else class="tours-section">
      <div class="tours-grid">
        <div
          v-for="purchase in purchases"
          :key="purchase.id"
          class="tour-card-container"
        >
          <div class="tour-card">
            <!-- Tour Image with Overlays -->
            <div class="tour-image-container">
              <v-img
                :src="purchase.tour?.images?.[0] || '/api/placeholder/400/300'"
                height="240"
                cover
                class="tour-image"
              >
                <div class="image-overlay">
                  <!-- Status Badge -->
                  <v-chip
                    :color="getStatusColor(purchase)"
                    size="small"
                    class="status-badge"
                    variant="elevated"
                  >
                    <v-icon start size="16">{{ getStatusIcon(purchase) }}</v-icon>
                    {{ getStatusText(purchase) }}
                  </v-chip>

                  <!-- Purchase Date -->
                  <v-chip
                    color="surface"
                    size="small"
                    variant="elevated"
                    class="date-badge"
                    prepend-icon="mdi-calendar"
                  >
                    {{ formatDate(purchase.purchaseDate) }}
                  </v-chip>
                </div>
              </v-img>
            </div>

            <!-- Tour Content -->
            <div class="tour-content">
              <div class="tour-header">
                <h3 class="tour-title">
                  {{ purchase.tour?.name || 'Nepoznata tura' }}
                </h3>
                <v-chip
                  :color="getTourStatusColor(purchase.tour?.status)"
                  size="x-small"
                  variant="tonal"
                  class="tour-status-chip"
                >
                  {{ getTourStatusText(purchase.tour?.status) }}
                </v-chip>
              </div>

              <p class="tour-description">
                {{ getTruncatedDescription(purchase.tour?.description, 120) }}
              </p>

              <!-- Purchase Details -->
              <div class="purchase-details">
                <div class="detail-item">
                  <div class="detail-label">Plaćena cena</div>
                  <div class="detail-value price">
                    {{ formatPrice(purchase.purchasePrice) }} EUR
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Token važi do</div>
                  <div class="detail-value" :class="getExpiryClass(purchase.expiryDate)">
                    {{ formatDate(purchase.expiryDate) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tour Actions -->
            <div class="tour-actions">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-information"
                @click="viewTourDetails(purchase.tour?.id)"
                size="small"
                class="action-btn"
              >
                Detalji
              </v-btn>

              <v-btn
                v-if="canStartTour(purchase)"
                color="success"
                prepend-icon="mdi-play"
                @click="startTour(purchase)"
                size="small"
                variant="elevated"
                class="action-btn start-btn"
              >
                Pokreni
              </v-btn>

              <v-btn
                v-else-if="isExpired(purchase.expiryDate)"
                color="error"
                variant="outlined"
                disabled
                size="small"
                class="action-btn"
                prepend-icon="mdi-clock-alert"
              >
                Istekao
              </v-btn>

              <v-btn
                v-else-if="purchase.isCompleted"
                color="success"
                variant="tonal"
                disabled
                size="small"
                class="action-btn"
                prepend-icon="mdi-check-circle"
              >
                Završena
              </v-btn>

              <v-btn
                v-else-if="purchase.tour?.status === 'archived'"
                color="warning"
                variant="outlined"
                disabled
                size="small"
                class="action-btn"
                prepend-icon="mdi-archive"
              >
                Arhivirana
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Statistics Card -->
    <div v-if="purchases && purchases.length > 0" class="statistics-section mt-8">
      <div class="statistics-card">
        <div class="statistics-header">
          <div class="statistics-icon">
            <v-icon size="32" color="primary">mdi-chart-line</v-icon>
          </div>
          <div class="statistics-title">
            <h2 class="text-h5 font-weight-bold">Statistike kupovina</h2>
            <p class="text-body-2 opacity-70">Pregled vaših aktivnosti i potrošnje</p>
          </div>
        </div>
        
        <div class="statistics-grid">
          <div class="statistic-item">
            <div class="statistic-icon">
              <v-icon size="24" color="primary">mdi-shopping</v-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-number">{{ purchases.length }}</div>
              <div class="statistic-label">Ukupno tura</div>
            </div>
          </div>
          
          <div class="statistic-item">
            <div class="statistic-icon">
              <v-icon size="24" color="success">mdi-play-circle</v-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-number">{{ getActiveToursCount() }}</div>
              <div class="statistic-label">Dostupne za pokretanje</div>
            </div>
          </div>
          
          <div class="statistic-item">
            <div class="statistic-icon">
              <v-icon size="24" color="info">mdi-currency-eur</v-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-number">{{ formatPrice(getTotalSpent()) }}</div>
              <div class="statistic-label">Ukupno potrošeno (EUR)</div>
            </div>
          </div>
          
          <div class="statistic-item">
            <div class="statistic-icon">
              <v-icon size="24" color="warning">mdi-clock-alert</v-icon>
            </div>
            <div class="statistic-content">
              <div class="statistic-number">{{ getExpiredToursCount() }}</div>
              <div class="statistic-label">Istekle ture</div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
      <template v-slot:actions>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import purchasesAPI from '../api/purchases'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'MyPurchasedTours',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const loading = ref(true)
    const purchases = ref([])
    
    const showSnackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('success')

    const showMessage = (message, color = 'success') => {
      snackbarMessage.value = message
      snackbarColor.value = color
      showSnackbar.value = true
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('sr-RS').format(parseFloat(price || 0))
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getTruncatedDescription = (description, maxLength = 100) => {
      if (!description) return 'Nema opisa'
      if (description.length <= maxLength) return description
      return description.substring(0, maxLength) + '...'
    }

    const getStatusIcon = (purchase) => {
      // Priority: completion > expiry > purchase status
      if (purchase.isCompleted) {
        return 'mdi-check-circle'
      }
      
      if (isExpired(purchase.expiryDate)) {
        return 'mdi-clock-alert'
      }
      
      const icons = {
        pending: 'mdi-clock',
        completed: 'mdi-shopping',
        active: 'mdi-play-circle',
        used: 'mdi-check',
        expired: 'mdi-close-circle',
        refunded: 'mdi-undo'
      }
      return icons[purchase.status] || 'mdi-help-circle'
    }

    const getStatusColor = (purchase) => {
      // Priority: completion > expiry > purchase status
      if (purchase.isCompleted) {
        return 'success'
      }
      
      if (isExpired(purchase.expiryDate)) {
        return 'error'
      }
      
      const colors = {
        pending: 'warning',
        completed: 'success',
        active: 'primary',
        used: 'info',
        expired: 'error',
        refunded: 'warning'
      }
      return colors[purchase.status] || 'grey'
    }

    const getStatusText = (purchase) => {
      // Priority: completion > expiry > purchase status
      if (purchase.isCompleted) {
        return 'Završena'
      }
      
      if (isExpired(purchase.expiryDate)) {
        return 'Istekao'
      }
      
      const texts = {
        pending: 'Na čekanju',
        completed: 'Kupljeno',
        active: 'Dostupna',
        used: 'Iskorišćen',
        expired: 'Istekao',
        refunded: 'Refundiran'
      }
      return texts[purchase.status] || 'Nepoznato'
    }

    const getTourStatusColor = (status) => {
      const colors = {
        published: 'success',
        archived: 'warning',
        draft: 'info'
      }
      return colors[status] || 'grey'
    }

    const getTourStatusText = (status) => {
      const texts = {
        published: 'Objavljena',
        archived: 'Arhivirana',
        draft: 'Nacrt'
      }
      return texts[status] || status
    }

    const isExpired = (expiryDate) => {
      if (!expiryDate) return false
      return new Date(expiryDate) < new Date()
    }

    const getExpiryClass = (expiryDate) => {
      if (!expiryDate) return ''
      const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) return 'text-error'
      if (daysUntilExpiry <= 7) return 'text-warning'
      return 'text-success'
    }

    const canStartTour = (purchase) => {
      return purchase.status === 'active' && 
             purchase.tour?.status === 'published' && 
             !isExpired(purchase.expiryDate) &&
             !purchase.isCompleted  // Cannot start if already completed
    }

    const getActiveToursCount = () => {
      return purchases.value.filter(p => canStartTour(p)).length
    }

    const getExpiredToursCount = () => {
      return purchases.value.filter(p => isExpired(p.expiryDate)).length
    }

    const getTotalSpent = () => {
      return purchases.value.reduce((total, purchase) => {
        return total + parseFloat(purchase.purchasePrice || 0)
      }, 0)
    }

    const loadPurchases = async () => {
      try {
        loading.value = true
        const result = await purchasesAPI.getPurchases()
        
        if (result.success) {
          purchases.value = result.data
        } else {
          showMessage(result.error, 'error')
        }
      } catch (error) {
        console.error('Load purchases error:', error)
        showMessage('Greška pri učitavanju kupljenih tura', 'error')
      } finally {
        loading.value = false
      }
    }

    const viewTourDetails = (tourId) => {
      if (tourId) {
        router.push(`/tours/${tourId}`)
      }
    }

    const startTour = async (purchase) => {
      try {
        // Validate token first
        const validation = await purchasesAPI.validatePurchaseToken(purchase.tour.id)
        
        if (validation.success && validation.data.valid) {
          // Navigate to active tour page
          showMessage('Pokretanje ture...', 'info')
          router.push(`/tours/${purchase.tour.id}/active`)
        } else {
          showMessage(validation.data?.message || 'Token nije valjan', 'error')
        }
      } catch (error) {
        console.error('Start tour error:', error)
        showMessage('Greška pri pokretanju ture', 'error')
      }
    }

    onMounted(async () => {
      // Check if user is tourist
      if (authStore.user?.role !== 'turista') {
        showMessage('Samo turisti mogu pristupiti kupljenim turama', 'warning')
        router.push('/')
        return
      }
      
      await loadPurchases()
    })

    return {
      loading,
      purchases,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      formatPrice,
      formatDate,
      getTruncatedDescription,
      getStatusIcon,
      getStatusColor,
      getStatusText,
      getTourStatusColor,
      getTourStatusText,
      isExpired,
      getExpiryClass,
      canStartTour,
      getActiveToursCount,
      getExpiredToursCount,
      getTotalSpent,
      viewTourDetails,
      startTour
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
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  text-align: center;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  min-width: 100px;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

/* Loading Section */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-card {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-title {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
}

.loading-description {
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

/* Empty Section */
.empty-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.empty-card {
  text-align: center;
  padding: 4rem 3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.empty-icon {
  margin-bottom: 2rem;
}

.empty-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: rgba(0, 0, 0, 0.8);
}

.empty-description {
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.explore-btn {
  border-radius: 16px;
  padding: 1rem 2rem;
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.3);
  font-weight: 600;
}

/* Tours Section */
.tours-section {
  margin-top: 2rem;
}

.tours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
}

.tour-card-container {
  height: 100%;
}

.tour-card {
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.tour-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-color: rgba(25, 118, 210, 0.3);
}

/* Tour Image */
.tour-image-container {
  position: relative;
  overflow: hidden;
}

.tour-image {
  transition: transform 0.3s ease;
}

.tour-card:hover .tour-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 30%,
    transparent 70%,
    rgba(0, 0, 0, 0.3) 100%
  );
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
}

.status-badge {
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.date-badge {
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Tour Content */
.tour-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tour-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.tour-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.3;
  margin: 0;
  flex: 1;
}

.tour-status-chip {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.tour-description {
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex: 1;
}

.purchase-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  text-align: center;
  padding: 1rem;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.detail-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.5rem;
}

.detail-value {
  font-weight: 600;
  font-size: 1rem;
}

.detail-value.price {
  color: rgb(var(--v-theme-success));
  font-size: 1.1rem;
}

/* Tour Actions */
.tour-actions {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.action-btn {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.start-btn {
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

/* Statistics Section */
.statistics-section {
  margin-top: 3rem;
}

.statistics-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.statistics-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.statistics-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 16px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.statistic-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.statistic-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.statistic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.statistic-content {
  flex: 1;
}

.statistic-number {
  font-size: 1.75rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1;
}

.statistic-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 0.25rem;
}

/* Expiry Classes */
.text-error {
  color: rgb(var(--v-theme-error)) !important;
  font-weight: 600;
}

.text-warning {
  color: rgb(var(--v-theme-warning)) !important;
  font-weight: 600;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
  font-weight: 600;
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
    width: 100%;
  }
  
  .tours-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .tour-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .purchase-details {
    grid-template-columns: 1fr;
  }
  
  .tour-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .statistics-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .statistics-grid {
    grid-template-columns: 1fr;
  }
  
  .statistic-item {
    justify-content: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .empty-card {
    padding: 2rem 1.5rem;
    margin: 0 1rem;
  }
  
  .empty-title {
    font-size: 1.5rem;
  }
  
  .empty-description {
    font-size: 1rem;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-card {
    width: 100%;
  }
}
</style>