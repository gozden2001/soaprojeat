<template>
  <v-container fluid class="modern-container">
    <!-- Modern Header -->
    <div class="header-section mb-8">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="40" color="white">mdi-cart</v-icon>
        </div>
        <div class="header-text">
          <h1 class="text-h4 font-weight-bold mb-2">Korpa za kupovinu</h1>
          <p class="text-body-1 opacity-80">
            Proverite stavke u vašoj korpi i završite kupovinu
          </p>
        </div>
        <div v-if="cart.items && cart.items.length > 0" class="header-stats">
          <div class="stat-card">
            <div class="stat-number">{{ cart.totalItems }}</div>
            <div class="stat-label">{{ cart.totalItems === 1 ? 'Stavka' : 'Stavki' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ formatPrice(cart.totalPrice) }}</div>
            <div class="stat-label">EUR ukupno</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Content -->
    <div class="cart-section">
      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <div class="loading-card">
          <v-progress-circular 
            indeterminate 
            color="primary" 
            size="64"
            width="6"
          />
          <h3 class="loading-title">Učitavanje korpe...</h3>
          <p class="loading-description">Molimo sačekajte trenutak</p>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="!cart.items || cart.items.length === 0" class="empty-section">
        <div class="empty-card">
          <div class="empty-icon">
            <v-icon size="120" color="primary" class="opacity-60">mdi-cart-off</v-icon>
          </div>
          <h2 class="empty-title">Vaša korpa je prazna</h2>
          <p class="empty-description">
            Dodajte ture u korpu da biste mogli da ih kupite i uživate u novim avanturama
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

      <!-- Cart Items -->
      <div v-else class="cart-content">
        <!-- Items List -->
        <div class="items-section">
          <div class="section-header">
            <h2 class="section-title">Stavke u korpi</h2>
            <v-chip color="primary" variant="tonal" size="small">
              {{ cart.totalItems }} {{ cart.totalItems === 1 ? 'stavka' : 'stavki' }}
            </v-chip>
          </div>
          
          <div class="items-list">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="cart-item"
            >
              <!-- Item Image -->
              <div class="item-image">
                <v-img
                  v-if="item.tour?.images && item.tour.images.length > 0"
                  :src="item.tour.images[0]"
                  :alt="item.tourName"
                  width="100"
                  height="100"
                  cover
                  class="rounded-lg"
                />
                <div v-else class="image-placeholder">
                  <v-icon size="40" color="grey-lighten-1">mdi-image-off</v-icon>
                </div>
              </div>

              <!-- Item Content -->
              <div class="item-content">
                <div class="item-header">
                  <h3 class="item-title">{{ item.tourName }}</h3>
                  <div class="item-badges">
                    <v-chip
                      size="x-small"
                      :color="getDifficultyColor(item.tour?.difficulty)"
                      variant="tonal"
                      class="mr-1"
                    >
                      {{ getDifficultyText(item.tour?.difficulty) }}
                    </v-chip>
                    <v-chip
                      size="x-small"
                      :color="getStatusColor(item.tour?.status)"
                      variant="outlined"
                    >
                      {{ getStatusText(item.tour?.status) }}
                    </v-chip>
                  </div>
                </div>
                
                <div class="item-details">
                  <div class="price-section">
                    <span class="price-label">Cena:</span>
                    <span class="price-value">{{ formatPrice(item.tourPrice) }} EUR</span>
                  </div>
                </div>
              </div>

              <!-- Item Actions -->
              <div class="item-actions">
                <v-btn
                  icon="mdi-delete"
                  variant="outlined"
                  color="error"
                  @click="removeFromCart(item.tourId)"
                  :loading="removingItems.has(item.tourId)"
                  size="small"
                  class="remove-btn"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="summary-section">
          <div class="summary-card">
            <div class="summary-header">
              <h2 class="summary-title">Rezime narudžbine</h2>
            </div>
            
            <div class="summary-content">
              <div class="summary-row">
                <span class="summary-label">Broj stavki:</span>
                <span class="summary-value">{{ cart.totalItems }}</span>
              </div>
              
              <div class="summary-row total-row">
                <span class="summary-label">Ukupna cena:</span>
                <span class="summary-total">{{ formatPrice(cart.totalPrice) }} EUR</span>
              </div>
            </div>

            <div class="summary-actions">
              <v-btn
                color="error"
                variant="outlined"
                prepend-icon="mdi-delete-sweep"
                @click="clearCart"
                :loading="clearing"
                :disabled="cart.totalItems === 0"
                size="large"
                class="clear-btn"
              >
                Isprazni korpu
              </v-btn>
              
              <v-btn
                color="primary"
                size="x-large"
                prepend-icon="mdi-credit-card"
                @click="proceedToCheckout"
                :loading="processing"
                :disabled="cart.totalItems === 0"
                variant="elevated"
                class="checkout-btn"
              >
                Kupi sada
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modern Checkout Dialog -->
    <v-dialog v-model="checkoutDialog" max-width="700" persistent class="modern-dialog">
      <v-card class="checkout-dialog">
        <div class="dialog-header">
          <div class="dialog-icon">
            <v-icon size="24" color="primary">mdi-credit-card</v-icon>
          </div>
          <div class="dialog-title">
            <h2 class="text-h5 font-weight-bold">Potvrda kupovine</h2>
            <p class="text-body-2 opacity-70">Proverite detalje pre završetka kupovine</p>
          </div>
        </div>
        
        <v-card-text class="dialog-content">
          <div v-if="checkoutSummary">
            <div class="checkout-description">
              <p class="confirmation-text">
                Da li ste sigurni da želite da kupite sledeće ture:
              </p>
            </div>
            
            <div class="checkout-items">
              <div
                v-for="item in checkoutSummary.validItems"
                :key="item.tourId"
                class="checkout-item"
              >
                <div class="checkout-item-content">
                  <v-icon class="mr-3" color="primary">mdi-map-marker</v-icon>
                  <div class="checkout-item-details">
                    <div class="checkout-item-name">{{ item.tourName }}</div>
                  </div>
                </div>
                <div class="checkout-item-price">
                  {{ formatPrice(item.price) }} EUR
                </div>
              </div>
            </div>
            
            <div class="checkout-total">
              <div class="total-row">
                <span class="total-label">Ukupno za plaćanje:</span>
                <span class="total-amount">{{ formatPrice(checkoutSummary.totalAmount) }} EUR</span>
              </div>
            </div>

            <div v-if="checkoutSummary.hasInvalidItems" class="checkout-warning">
              <v-alert type="warning" variant="tonal" class="warning-alert">
                <template #title>
                  <div class="alert-title">
                    <v-icon class="mr-2">mdi-alert</v-icon>
                    Upozorenje
                  </div>
                </template>
                <div class="alert-content">
                  <p>Neke stavke u vašoj korpi više nisu dostupne:</p>
                  <ul class="invalid-items-list">
                    <li v-for="invalid in checkoutSummary.invalidItems" :key="invalid.tourName">
                      <strong>{{ invalid.tourName }}</strong>: {{ invalid.reason }}
                    </li>
                  </ul>
                </div>
              </v-alert>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <v-btn
            variant="outlined"
            @click="checkoutDialog = false"
            :disabled="processing"
            size="large"
            class="cancel-btn"
          >
            Otkaži
          </v-btn>
          
          <v-spacer />
          
          <v-btn
            color="primary"
            @click="completeCheckout"
            :loading="processing"
            :disabled="!checkoutSummary?.canProceed"
            variant="elevated"
            size="large"
            class="confirm-btn"
          >
            <v-icon start>mdi-credit-card</v-icon>
            Potvrdi kupovinu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modern Success Dialog -->
    <v-dialog v-model="successDialog" max-width="500" class="modern-dialog">
      <v-card class="success-dialog">
        <div class="dialog-header success">
          <div class="dialog-icon">
            <v-icon size="24" color="success">mdi-check-circle</v-icon>
          </div>
          <div class="dialog-title">
            <h2 class="text-h5 font-weight-bold text-success">Kupovina uspešna!</h2>
            <p class="text-body-2 opacity-70">Vaša narudžbina je uspešno obrađena</p>
          </div>
        </div>
        
        <v-card-text class="dialog-content">
          <div class="success-content">
            <div class="success-summary">
              <p class="success-message">
                Uspešno ste kupili <strong>{{ purchaseResult?.purchaseTokens?.length }}</strong> 
                {{ purchaseResult?.purchaseTokens?.length === 1 ? 'turu' : 'tura' }}.
              </p>
              
              <div class="success-details">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span>Sada možete da pokrenete kupljene ture iz sekcije "Moje ture".</span>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            color="primary"
            @click="goToMyTours"
            variant="elevated"
            size="large"
            prepend-icon="mdi-shopping"
            class="success-btn"
          >
            Idi na moje ture
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
import cartAPI from '../api/cart'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ShoppingCart',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const loading = ref(true)
    const processing = ref(false)
    const clearing = ref(false)
    const removingItems = ref(new Set())
    
    const cart = ref({
      items: [],
      totalItems: 0,
      totalPrice: 0
    })
    
    const checkoutDialog = ref(false)
    const successDialog = ref(false)
    const checkoutSummary = ref(null)
    const purchaseResult = ref(null)
    
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

    const getDifficultyColor = (difficulty) => {
      const colors = {
        easy: 'success',
        medium: 'warning', 
        hard: 'error'
      }
      return colors[difficulty] || 'grey'
    }

    const getDifficultyText = (difficulty) => {
      const texts = {
        easy: 'Lako',
        medium: 'Srednje',
        hard: 'Teško'
      }
      return texts[difficulty] || difficulty
    }

    const getStatusColor = (status) => {
      const colors = {
        draft: 'warning',
        published: 'success',
        archived: 'error'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        draft: 'Nacrt',
        published: 'Objavljena',
        archived: 'Arhivirana'
      }
      return texts[status] || status
    }

    const loadCart = async () => {
      try {
        loading.value = true
        const result = await cartAPI.getCart()
        
        if (result.success) {
          cart.value = result.data
        } else {
          showMessage(result.error || 'Greška pri učitavanju korpe', 'error')
        }
      } catch (error) {
        console.error('Load cart error:', error)
        showMessage('Greška pri učitavanju korpe', 'error')
      } finally {
        loading.value = false
      }
    }

    const removeFromCart = async (tourId) => {
      try {
        removingItems.value.add(tourId)
        const result = await cartAPI.removeFromCart(tourId)
        
        if (result.success) {
          cart.value = result.data.cart
          showMessage('Tura je uklonjena iz korpe')
        } else {
          showMessage(result.error || 'Greška pri uklanjanju ture', 'error')
        }
      } catch (error) {
        console.error('Remove from cart error:', error)
        showMessage('Greška pri uklanjanju ture', 'error')
      } finally {
        removingItems.value.delete(tourId)
      }
    }

    const clearCart = async () => {
      try {
        clearing.value = true
        const result = await cartAPI.clearCart()
        
        if (result.success) {
          cart.value = result.data.cart
          showMessage('Korpa je ispražnjena')
        } else {
          showMessage(result.error || 'Greška pri brisanju korpe', 'error')
        }
      } catch (error) {
        console.error('Clear cart error:', error)
        showMessage('Greška pri brisanju korpe', 'error')
      } finally {
        clearing.value = false
      }
    }

    const proceedToCheckout = async () => {
      try {
        processing.value = true
        const result = await cartAPI.getCheckoutSummary()
        
        if (result.success) {
          checkoutSummary.value = result.data
          checkoutDialog.value = true
        } else {
          showMessage(result.error || 'Greška pri pripremi kupovine', 'error')
        }
      } catch (error) {
        console.error('Checkout summary error:', error)
        showMessage('Greška pri pripremi kupovine', 'error')
      } finally {
        processing.value = false
      }
    }

    const completeCheckout = async () => {
      try {
        processing.value = true
        const result = await cartAPI.checkout()
        
        if (result.success) {
          purchaseResult.value = result.data
          checkoutDialog.value = false
          successDialog.value = true
          cart.value = { items: [], totalItems: 0, totalPrice: 0 }
        } else {
          showMessage(result.error || 'Greška pri kupovini', 'error')
        }
      } catch (error) {
        console.error('Checkout error:', error)
        showMessage('Greška pri kupovini', 'error')
      } finally {
        processing.value = false
      }
    }

    const goToMyTours = () => {
      successDialog.value = false
      router.push('/my-purchases')
    }

    onMounted(async () => {
      // Check if user is tourist
      if (authStore.user?.role !== 'turista') {
        showMessage('Samo turisti mogu pristupiti korpi', 'warning')
        return
      }
      
      await loadCart()
    })

    return {
      loading,
      processing,
      clearing,
      removingItems,
      cart,
      checkoutDialog,
      successDialog,
      checkoutSummary,
      purchaseResult,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      formatPrice,
      getDifficultyColor,
      getDifficultyText,
      getStatusColor,
      getStatusText,
      removeFromCart,
      clearCart,
      proceedToCheckout,
      completeCheckout,
      goToMyTours
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

/* Cart Section */
.cart-section {
  margin-top: 2rem;
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

/* Cart Content */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

/* Items Section */
.items-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
}

.items-list {
  padding: 1rem;
}

/* Cart Item */
.cart-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(25, 118, 210, 0.3);
}

.cart-item:last-child {
  margin-bottom: 0;
}

/* Item Image */
.item-image {
  flex-shrink: 0;
}

.image-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

/* Item Content */
.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
  line-height: 1.3;
}

.item-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.price-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

/* Item Actions */
.item-actions {
  flex-shrink: 0;
}

.remove-btn {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  transform: scale(1.05);
}

/* Summary Section */
.summary-section {
  position: sticky;
  top: 2rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.summary-header {
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
}

.summary-content {
  padding: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.summary-row:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.summary-label {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.7);
}

.summary-value {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.total-row {
  padding: 1.5rem 0 0 0;
  border-top: 2px solid rgba(25, 118, 210, 0.2);
  margin-top: 1rem;
}

.total-row .summary-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.summary-total {
  font-size: 2rem;
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}

.summary-actions {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.clear-btn,
.checkout-btn {
  border-radius: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.checkout-btn {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(156, 39, 176, 1) 100%);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.4);
  padding: 1rem 2rem;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(25, 118, 210, 0.5);
}

/* Dialog Styles */
.modern-dialog :deep(.v-overlay__content) {
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.checkout-dialog,
.success-dialog {
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

.dialog-header.success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%);
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

.checkout-description {
  margin-bottom: 2rem;
}

.confirmation-text {
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.7);
  margin: 0;
}

.checkout-items {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.checkout-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.checkout-item:last-child {
  margin-bottom: 0;
}

.checkout-item-content {
  display: flex;
  align-items: center;
}

.checkout-item-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.checkout-item-price {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  font-size: 1.1rem;
}

.checkout-total {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.total-amount {
  font-size: 2rem;
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}

.checkout-warning {
  margin-top: 1rem;
}

.warning-alert {
  border-radius: 16px;
}

.alert-title {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.invalid-items-list {
  margin-top: 1rem;
  padding-left: 1.5rem;
}

.dialog-actions {
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cancel-btn,
.confirm-btn,
.success-btn {
  border-radius: 12px;
  min-width: 140px;
  font-weight: 600;
}

.confirm-btn,
.success-btn {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

/* Success Dialog */
.success-content {
  text-align: center;
}

.success-message {
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 1.5rem;
}

.success-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(33, 150, 243, 0.1);
  padding: 1rem;
  border-radius: 12px;
  color: rgba(0, 0, 0, 0.7);
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
@media (max-width: 1200px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .summary-section {
    position: static;
  }
}

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
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
  }
  
  .item-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }
  
  .summary-actions {
    gap: 0.75rem;
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
  .confirm-btn,
  .success-btn {
    width: 100%;
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
  
  .cart-item {
    padding: 1rem;
  }
  
  .item-title {
    font-size: 1.1rem;
  }
}
</style>