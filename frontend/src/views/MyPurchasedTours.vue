<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <v-card>
          <v-card-title class="text-h4">
            <v-icon left class="mr-2">mdi-shopping</v-icon>
            Moje kupljene ture
          </v-card-title>
          <v-card-subtitle>
            Ovde možete videti sve ture koje ste kupili
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col>
        <v-card class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-h6">Učitavanje kupljenih tura...</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="!purchases || purchases.length === 0">
      <v-col>
        <v-card class="text-center pa-8">
          <v-icon size="120" color="grey-lighten-2">mdi-shopping-outline</v-icon>
          <h3 class="text-h5 mt-4 mb-2">Nemate kupljenih tura</h3>
          <p class="text-body-1 text-grey-darken-1 mb-4">
            Kupite ture da biste mogli da ih pokrenete i istražite zanimljive lokacije
          </p>
          <v-btn
            color="primary"
            prepend-icon="mdi-magnify"
            @click="$router.push('/tours')"
            size="large"
          >
            Pregledaj dostupne ture
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Purchases Grid -->
    <v-row v-else>
      <v-col
        v-for="purchase in purchases"
        :key="purchase.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100" elevation="2">
          <!-- Tour Image -->
          <v-img
            :src="purchase.tour?.images?.[0] || '/api/placeholder/400/200'"
            height="200"
            cover
            class="position-relative"
          >
            <!-- Status Badge -->
            <v-chip
              :color="getStatusColor(purchase.status)"
              size="small"
              class="ma-2 position-absolute"
              style="top: 0; right: 0;"
            >
              {{ getStatusText(purchase.status) }}
            </v-chip>

            <!-- Purchase Date -->
            <div class="position-absolute bottom-0 left-0 ma-2">
              <v-chip
                color="black"
                size="small"
                variant="flat"
                prepend-icon="mdi-calendar"
              >
                {{ formatDate(purchase.purchaseDate) }}
              </v-chip>
            </div>
          </v-img>

          <!-- Tour Info -->
          <v-card-title class="pb-2">
            {{ purchase.tour?.name || 'Nepoznata tura' }}
          </v-card-title>

          <v-card-text class="pt-0">
            <p class="text-body-2 text-grey-darken-1 mb-3">
              {{ getTruncatedDescription(purchase.tour?.description, 100) }}
            </p>

            <!-- Purchase Details -->
            <div class="d-flex justify-space-between align-center mb-3">
              <div>
                <div class="text-caption text-grey">Plaćena cena:</div>
                <div class="text-h6 text-success">
                  {{ formatPrice(purchase.purchasePrice) }} EUR
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-caption text-grey">Token važi do:</div>
                <div class="text-body-2" :class="getExpiryClass(purchase.expiryDate)">
                  {{ formatDate(purchase.expiryDate) }}
                </div>
              </div>
            </div>

            <!-- Tour Status -->
            <v-chip
              :color="getTourStatusColor(purchase.tour?.status)"
              size="small"
              variant="tonal"
            >
              {{ getTourStatusText(purchase.tour?.status) }}
            </v-chip>
          </v-card-text>

          <!-- Actions -->
          <v-card-actions class="pt-0">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-information"
              @click="viewTourDetails(purchase.tour?.id)"
              size="small"
            >
              Detalji
            </v-btn>

            <v-spacer />

            <v-btn
              v-if="canStartTour(purchase)"
              color="success"
              prepend-icon="mdi-play"
              @click="startTour(purchase)"
              size="small"
            >
              Pokreni turu
            </v-btn>

            <v-btn
              v-else-if="isExpired(purchase.expiryDate)"
              color="error"
              variant="text"
              disabled
              size="small"
            >
              Istekao token
            </v-btn>

            <v-btn
              v-else-if="purchase.tour?.status === 'archived'"
              color="warning"
              variant="text"
              disabled
              size="small"
            >
              Arhivirana
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Statistics Card -->
    <v-row v-if="purchases && purchases.length > 0" class="mt-4">
      <v-col>
        <v-card>
          <v-card-title>
            <v-icon left class="mr-2">mdi-chart-line</v-icon>
            Statistike kupovina
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-primary">{{ purchases.length }}</div>
                  <div class="text-caption">Ukupno tura</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-success">{{ getActiveToursCount() }}</div>
                  <div class="text-caption">Aktivne ture</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-info">{{ formatPrice(getTotalSpent()) }} EUR</div>
                  <div class="text-caption">Ukupno potrošeno</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-warning">{{ getExpiredToursCount() }}</div>
                  <div class="text-caption">Istekle ture</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
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

    const getStatusColor = (status) => {
      const colors = {
        pending: 'warning',
        completed: 'success',
        active: 'success',
        used: 'info',
        expired: 'error',
        refunded: 'warning'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: 'Na čekanju',
        completed: 'Kupljeno',
        active: 'Aktivan',
        used: 'Iskorišćen',
        expired: 'Istekao',
        refunded: 'Refundiran'
      }
      return texts[status] || status
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
             !isExpired(purchase.expiryDate)
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
.position-absolute {
  position: absolute !important;
}

.bottom-0 {
  bottom: 0 !important;
}

.left-0 {
  left: 0 !important;
}

.right-0 {
  right: 0 !important;
}

.top-0 {
  top: 0 !important;
}
</style>