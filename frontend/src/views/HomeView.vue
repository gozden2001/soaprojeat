<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <v-container>
        <v-row align="center" justify="center" class="min-height-70vh">
          <v-col cols="12" md="8" lg="6" class="text-center">
            <div class="hero-content animate-fade-in">
              <div class="hero-icon">
                <v-icon size="80" color="white">mdi-map-marker</v-icon>
              </div>
              <h1 class="hero-title font-heading">
                Dobrodošli u Tourism App
              </h1>
              <p class="hero-subtitle">
                Istražite neverovatne ture i kreirajte nezaboravne uspomene sa našom platformom za turizam!
              </p>
              <div class="hero-actions" v-if="!authStore.isAuthenticated">
                <v-btn
                  size="large"
                  color="white"
                  variant="elevated"
                  class="hero-btn primary-btn"
                  prepend-icon="mdi-account-plus"
                  to="/signup"
                >
                  Kreiraj Nalog
                </v-btn>
                <v-btn
                  size="large"
                  variant="outlined"
                  class="hero-btn secondary-btn"
                  prepend-icon="mdi-login"
                  to="/login"
                >
                  Prijavi se
                </v-btn>
              </div>
              <div class="hero-actions" v-else>
                <v-alert type="success" class="mb-4 welcome-alert">
                  Dobrodošli, {{ authStore.user?.username }}! ({{ authStore.user?.role === 'vodic' ? 'Vodič' : 'Turista' }})
                </v-alert>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Quick Actions Section -->
    <section class="quick-actions-section">
      <v-container>
        <div class="section-header">
          <h2 class="section-title font-heading">Brze Akcije</h2>
          <p class="section-subtitle">Pristupite najkorisnijim funkcijama aplikacije</p>
        </div>
        
        <v-row class="actions-grid justify-center">
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-card class="action-card" elevation="0" to="/blogs">
              <v-card-text class="text-center pa-6">
                <div class="action-icon">
                  <v-icon size="40" color="#D4730A">mdi-post</v-icon>
                </div>
                <h4 class="action-title">Blogovi</h4>
                <p class="action-description">Pogledajte najnovije blogove</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-card class="action-card" elevation="0" to="/tours">
              <v-card-text class="text-center pa-6">
                <div class="action-icon">
                  <v-icon size="40" color="#16A34A">mdi-map</v-icon>
                </div>
                <h4 class="action-title">Ture</h4>
                <p class="action-description">Istražite dostupne ture</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="4" lg="3" v-if="authStore.isAuthenticated">
            <v-card class="action-card" elevation="0" to="/profile">
              <v-card-text class="text-center pa-6">
                <div class="action-icon">
                  <v-icon size="40" color="#3B82F6">mdi-account-circle</v-icon>
                </div>
                <h4 class="action-title">Profil</h4>
                <p class="action-description">Upravljajte profilom</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="4" lg="3" v-if="authStore.isAuthenticated">
            <v-card class="action-card" elevation="0" to="/blogs/create">
              <v-card-text class="text-center pa-6">
                <div class="action-icon">
                  <v-icon size="40" color="#10B981">mdi-plus</v-icon>
                </div>
                <h4 class="action-title">Novi Blog</h4>
                <p class="action-description">Kreirajte novi blog</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Guide specific actions -->
          <template v-if="authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator'">
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-card class="action-card" elevation="0" to="/tours/create">
                <v-card-text class="text-center pa-6">
                  <div class="action-icon">
                    <v-icon size="40" color="#8B5CF6">mdi-map-plus</v-icon>
                  </div>
                  <h4 class="action-title">Nova Tura</h4>
                  <p class="action-description">Kreirajte novu turu</p>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-card class="action-card" elevation="0" to="/tours/my">
                <v-card-text class="text-center pa-6">
                  <div class="action-icon">
                    <v-icon size="40" color="#F59E0B">mdi-map-account</v-icon>
                  </div>
                  <h4 class="action-title">Moje Ture</h4>
                  <p class="action-description">Upravljajte turama</p>
                </v-card-text>
              </v-card>
            </v-col>
          </template>

          <!-- Tourist specific actions -->
          <template v-if="authStore.user?.role === 'turista'">
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-card class="action-card" elevation="0" to="/position-simulator">
                <v-card-text class="text-center pa-6">
                  <div class="action-icon">
                    <v-icon size="40" color="#EF4444">mdi-crosshairs-gps</v-icon>
                  </div>
                  <h4 class="action-title">Pozicija</h4>
                  <p class="action-description">Simulator pozicije</p>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-card class="action-card" elevation="0" to="/cart">
                <v-card-text class="text-center pa-6">
                  <div class="action-icon">
                    <v-icon size="40" color="#059669">mdi-cart</v-icon>
                  </div>
                  <h4 class="action-title">Korpa</h4>
                  <p class="action-description">Vaša korpa za kupovinu</p>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-card class="action-card" elevation="0" to="/my-purchases">
                <v-card-text class="text-center pa-6">
                  <div class="action-icon">
                    <v-icon size="40" color="#7C3AED">mdi-shopping</v-icon>
                  </div>
                  <h4 class="action-title">Kupljene Ture</h4>
                  <p class="action-description">Vaše kupljene ture</p>
                </v-card-text>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.home-view {
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  background: var(--warm-gradient);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="rgba(255,255,255,0.05)"><circle cx="30" cy="30" r="2"/></g></svg>') repeat;
    opacity: 0.3;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, var(--warm-bg), transparent);
  }
}

.min-height-70vh {
  min-height: 70vh;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  border-radius: var(--border-radius-md) !important;
  padding: 0 32px !important;
  height: 56px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.primary-btn {
  color: var(--warm-orange) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
  }
}

.secondary-btn {
  border: 2px solid rgba(255, 255, 255, 0.8) !important;
  color: white !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: white !important;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1) !important;
  }
}

.welcome-alert {
  border-radius: var(--border-radius-md) !important;
  backdrop-filter: blur(10px) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  color: var(--warm-brown) !important;
  font-weight: 600 !important;
}

/* Quick Actions Section */
.quick-actions-section {
  padding: 80px 0;
  background: var(--warm-surface);
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--warm-brown);
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: rgba(28, 25, 23, 0.7);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.actions-grid {
  margin-top: 32px;
}

.action-card {
  border-radius: var(--border-radius-lg) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  height: 100%;
  animation: fadeInUp 0.6s ease-out both;
  
  &:hover {
    box-shadow: var(--warm-shadow-lg) !important;
    border-color: rgba(245, 158, 11, 0.2) !important;
    transform: translateY(-4px);
  }
}

.action-icon {
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  transition: all 0.3s ease;
}

.action-card:hover .action-icon {
  background: rgba(245, 158, 11, 0.15);
}

.action-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.action-description {
  font-size: 0.9rem;
  color: rgba(28, 25, 23, 0.8);
  line-height: 1.6;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 960px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .quick-actions-section {
    padding: 60px 0;
  }
}

@media (max-width: 600px) {
  .hero-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 24px;
    
    .v-icon {
      font-size: 60px !important;
    }
  }
  
  .hero-title {
    font-size: 2rem;
    margin-bottom: 16px;
  }
  
  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 32px;
  }
  
  .hero-btn {
    height: 48px !important;
    font-size: 0.95rem !important;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .action-icon {
    width: 56px;
    height: 56px;
    
    .v-icon {
      font-size: 32px !important;
    }
  }
  
  :deep(.v-card-text) {
    padding: 20px !important;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>