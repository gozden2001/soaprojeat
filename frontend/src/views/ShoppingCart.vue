<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <v-card>
          <v-card-title class="text-h4">
            <v-icon left class="mr-2">mdi-cart</v-icon>
            Korpa za kupovinu
          </v-card-title>
          <v-card-subtitle>
            Proverite stavke u vašoj korpi pre završetka kupovine
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cart Content -->
    <v-row>
      <v-col>
        <v-card>
          <!-- Loading State -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-4">Učitavanje korpe...</p>
          </div>

          <!-- Empty Cart -->
          <div v-else-if="!cart.items || cart.items.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-cart-off</v-icon>
            <h3 class="text-h5 mt-4 mb-2">Vaša korpa je prazna</h3>
            <p class="text-body-1 text-grey-darken-1 mb-4">
              Dodajte ture u korpu da biste mogli da ih kupite
            </p>
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              @click="$router.push('/tours')"
            >
              Pregledaj ture
            </v-btn>
          </div>

          <!-- Cart Items -->
          <div v-else>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  v-for="item in cart.items"
                  :key="item.id"
                  class="border-b"
                >
                  <template v-slot:prepend>
                    <v-avatar size="80" rounded>
                      <v-img
                        v-if="item.tour?.images && item.tour.images.length > 0"
                        :src="item.tour.images[0]"
                        :alt="item.tourName"
                        cover
                      />
                      <v-icon v-else size="40" color="grey">mdi-image-off</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="text-h6 mb-1">
                    {{ item.tourName }}
                  </v-list-item-title>
                  
                  <v-list-item-subtitle class="mb-2">
                    <v-chip
                      size="small"
                      :color="getDifficultyColor(item.tour?.difficulty)"
                      variant="flat"
                      class="mr-2"
                    >
                      {{ getDifficultyText(item.tour?.difficulty) }}
                    </v-chip>
                    
                    <span class="text-body-2">
                      Status: {{ getStatusText(item.tour?.status) }}
                    </span>
                  </v-list-item-subtitle>

                  <div class="d-flex align-center">
                    <div class="mr-4">
                      <div class="text-body-2 text-grey">Cena:</div>
                      <div class="text-h6 text-primary">
                        {{ formatPrice(item.tourPrice) }} EUR
                      </div>
                    </div>
                  </div>

                  <template v-slot:append>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      color="error"
                      @click="removeFromCart(item.tourId)"
                      :loading="removingItems.has(item.tourId)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>

            <!-- Cart Summary -->
            <v-divider />
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-h6">Ukupno stavki:</span>
                <span class="text-h6">{{ cart.totalItems }}</span>
              </div>
              
              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-h5">Ukupna cena:</span>
                <span class="text-h4 text-primary font-weight-bold">
                  {{ formatPrice(cart.totalPrice) }} EUR
                </span>
              </div>

              <div class="d-flex gap-3">
                <v-btn
                  color="error"
                  variant="outlined"
                  prepend-icon="mdi-delete-sweep"
                  @click="clearCart"
                  :loading="clearing"
                  :disabled="cart.totalItems === 0"
                >
                  Isprazni korpu
                </v-btn>
                
                <v-spacer />
                
                <v-btn
                  color="primary"
                  size="large"
                  prepend-icon="mdi-credit-card"
                  @click="proceedToCheckout"
                  :loading="processing"
                  :disabled="cart.totalItems === 0"
                >
                  Nastavi sa kupovinom
                </v-btn>
              </div>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Checkout Dialog -->
    <v-dialog v-model="checkoutDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h5">
          <v-icon left class="mr-2">mdi-credit-card</v-icon>
          Potvrda kupovine
        </v-card-title>
        
        <v-card-text>
          <div v-if="checkoutSummary">
            <p class="text-body-1 mb-4">
              Da li ste sigurni da želite da kupite sledeće ture:
            </p>
            
            <v-list density="compact">
              <v-list-item
                v-for="item in checkoutSummary.validItems"
                :key="item.tourId"
                class="px-0"
              >
                <v-list-item-title>{{ item.tourName }}</v-list-item-title>
                <template v-slot:append>
                  <span class="text-primary font-weight-bold">
                    {{ formatPrice(item.price) }} EUR
                  </span>
                </template>
              </v-list-item>
            </v-list>
            
            <v-divider class="my-4" />
            
            <div class="d-flex justify-space-between align-center">
              <span class="text-h6">Ukupno za plaćanje:</span>
              <span class="text-h5 text-primary font-weight-bold">
                {{ formatPrice(checkoutSummary.totalAmount) }} EUR
              </span>
            </div>

            <div v-if="checkoutSummary.hasInvalidItems" class="mt-4">
              <v-alert type="warning" variant="tonal">
                <v-alert-title>Upozorenje</v-alert-title>
                <p>Neke stavke u vašoj korpi više nisu dostupne:</p>
                <ul>
                  <li v-for="invalid in checkoutSummary.invalidItems" :key="invalid.tourName">
                    <strong>{{ invalid.tourName }}</strong>: {{ invalid.reason }}
                  </li>
                </ul>
              </v-alert>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-btn
            variant="text"
            @click="checkoutDialog = false"
            :disabled="processing"
          >
            Otkaži
          </v-btn>
          
          <v-spacer />
          
          <v-btn
            color="primary"
            @click="completeCheckout"
            :loading="processing"
            :disabled="!checkoutSummary?.canProceed"
          >
            Potvrdi kupovinu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 text-success">
          <v-icon left class="mr-2">mdi-check-circle</v-icon>
          Kupovina uspešna!
        </v-card-title>
        
        <v-card-text>
          <p class="text-body-1 mb-4">
            Uspešno ste kupili {{ purchaseResult?.purchaseTokens?.length }} turu/tura.
          </p>
          
          <p class="text-body-2 text-grey-darken-1">
            Sada možete da pokrenete kupljene ture iz sekcije "Moje ture".
          </p>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="goToMyTours"
          >
            Idi na moje ture
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
import cartAPI from '../api/cart'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ShoppingCart',
  setup() {
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
      // Navigate to purchased tours or user's tours
      // This would need to be implemented based on your routing structure
      showMessage('Preusmavanje na moje ture...')
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
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>