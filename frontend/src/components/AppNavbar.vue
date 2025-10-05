<template>
  <v-app-bar elevation="0" class="warm-navbar" density="comfortable">
    <!-- Logo / Home -->
    <v-btn class="navbar-brand" variant="text" @click="$router.push('/')">
      <div class="brand-content">
        <v-icon class="brand-icon">mdi-map-marker</v-icon>
        <span class="brand-text">Tourism App</span>
      </div>
    </v-btn>

    <v-spacer />

    <!-- Navigation Items -->
    <v-toolbar-items class="hidden-sm-and-down nav-items">
      <v-btn
        variant="text"
        to="/"
        class="nav-item"
        :class="{ 'nav-item--active': isActive('/') }"
      >
        <v-icon class="nav-icon">mdi-home</v-icon>
        <span class="nav-text">Početna</span>
      </v-btn>
      
      <v-btn
        variant="text"
        to="/blogs"
        class="nav-item"
        :class="{ 'nav-item--active': isActive('/blogs') }"
      >
        <v-icon class="nav-icon">mdi-post</v-icon>
        <span class="nav-text">Blogovi</span>
      </v-btn>
      
      <v-btn
        variant="text"
        to="/tours"
        class="nav-item"
        :class="{ 'nav-item--active': isActive('/tours') }"
      >
        <v-icon class="nav-icon">mdi-map</v-icon>
        <span class="nav-text">Ture</span>
      </v-btn>
    </v-toolbar-items>

    <v-spacer />

    <!-- Auth Section -->
    <div class="auth-section">
      <template v-if="authStore.isAuthenticated">
        <v-chip class="user-chip me-4" color="accent" variant="outlined">
          <v-icon start>mdi-account</v-icon>
          {{ authStore.user?.username }} ({{ authStore.user?.role === 'vodic' ? 'Vodič' : 'Turista' }})
        </v-chip>
        
        <v-btn variant="text" to="/blogs/create" class="nav-item">
          <v-icon class="nav-icon">mdi-plus</v-icon>
          <span class="nav-text">Novi Blog</span>
        </v-btn>
        
        <v-btn 
          v-if="authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator'"
          variant="text" 
          to="/tours/create"
          class="nav-item"
        >
          <v-icon class="nav-icon">mdi-map-plus</v-icon>
          <span class="nav-text">Nova Tura</span>
        </v-btn>
        
        <v-btn 
          v-if="authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator'"
          variant="text" 
          to="/tours/my"
          class="nav-item"
        >
          <v-icon class="nav-icon">mdi-map-account</v-icon>
          <span class="nav-text">Moje Ture</span>
        </v-btn>
        
        <v-btn 
          v-if="authStore.user?.role === 'turista'"
          variant="text" 
          to="/position-simulator"
          class="nav-item"
        >
          <v-icon class="nav-icon">mdi-crosshairs-gps</v-icon>
          <span class="nav-text">Pozicija</span>
        </v-btn>
        
        <v-btn 
          v-if="authStore.user?.role === 'turista'"
          variant="text" 
          to="/cart"
          class="nav-item"
        >
          <v-icon class="nav-icon">mdi-cart</v-icon>
          <span class="nav-text">Korpa</span>
        </v-btn>
        
        <v-btn 
          v-if="authStore.user?.role === 'turista'"
          variant="text" 
          to="/my-purchases"
          class="nav-item"
        >
          <v-icon class="nav-icon">mdi-shopping</v-icon>
          <span class="nav-text">Kupljene Ture</span>
        </v-btn>

        <v-menu offset-y class="profile-menu">
          <template #activator="{ props }">
            <v-btn v-bind="props" class="profile-btn" icon>
              <v-avatar size="32" class="profile-avatar">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-card class="user-menu-card" elevation="8">
            <v-list class="user-menu">
              <v-list-item to="/profile" class="menu-item">
                <template #prepend>
                  <v-icon class="menu-icon">mdi-account-circle</v-icon>
                </template>
                <v-list-item-title>Profil</v-list-item-title>
              </v-list-item>
              <v-list-item @click="logout" class="menu-item">
                <template #prepend>
                  <v-icon class="menu-icon">mdi-logout</v-icon>
                </template>
                <v-list-item-title>Odjava</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>

      <template v-else>
        <v-btn
          prepend-icon="mdi-login"
          to="/login"
          class="login-btn"
          size="large"
        >
          Prijava
        </v-btn>
        
        <v-btn
          prepend-icon="mdi-account-plus"
          to="/signup"
          class="signup-btn ms-2"
          variant="outlined"
          size="large"
        >
          Registracija
        </v-btn>
      </template>
    </div>

    <!-- Mobile Menu -->
    <v-btn class="hidden-md-and-up mobile-menu-btn" icon @click="mobileMenuOpen = !mobileMenuOpen">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer
    v-model="mobileMenuOpen"
    temporary
    location="right"
    class="mobile-nav"
  >
    <v-list class="mobile-nav-list">
      <v-list-item to="/" @click="mobileMenuOpen = false" class="mobile-nav-item">
        <template #prepend>
          <v-icon class="mobile-nav-icon">mdi-home</v-icon>
        </template>
        <v-list-item-title>Početna</v-list-item-title>
      </v-list-item>
      
      <v-list-item to="/blogs" @click="mobileMenuOpen = false" class="mobile-nav-item">
        <template #prepend>
          <v-icon class="mobile-nav-icon">mdi-post</v-icon>
        </template>
        <v-list-item-title>Blogovi</v-list-item-title>
      </v-list-item>
      
      <v-list-item to="/tours" @click="mobileMenuOpen = false" class="mobile-nav-item">
        <template #prepend>
          <v-icon class="mobile-nav-icon">mdi-map</v-icon>
        </template>
        <v-list-item-title>Ture</v-list-item-title>
      </v-list-item>

      <!-- Mobile Auth Items -->
      <template v-if="authStore.isAuthenticated">
        <v-divider class="my-2" />
        
        <v-list-item to="/blogs/create" @click="mobileMenuOpen = false" class="mobile-nav-item">
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-plus</v-icon>
          </template>
          <v-list-item-title>Novi Blog</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          v-if="authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator'"
          to="/tours/create" 
          @click="mobileMenuOpen = false" 
          class="mobile-nav-item"
        >
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-map-plus</v-icon>
          </template>
          <v-list-item-title>Nova Tura</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          v-if="authStore.user?.role === 'vodic' || authStore.user?.role === 'administrator'"
          to="/tours/my" 
          @click="mobileMenuOpen = false" 
          class="mobile-nav-item"
        >
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-map-account</v-icon>
          </template>
          <v-list-item-title>Moje Ture</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          v-if="authStore.user?.role === 'turista'"
          to="/position-simulator" 
          @click="mobileMenuOpen = false" 
          class="mobile-nav-item"
        >
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-crosshairs-gps</v-icon>
          </template>
          <v-list-item-title>Pozicija</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          v-if="authStore.user?.role === 'turista'"
          to="/cart" 
          @click="mobileMenuOpen = false" 
          class="mobile-nav-item"
        >
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-cart</v-icon>
          </template>
          <v-list-item-title>Korpa</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          v-if="authStore.user?.role === 'turista'"
          to="/my-purchases" 
          @click="mobileMenuOpen = false" 
          class="mobile-nav-item"
        >
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-shopping</v-icon>
          </template>
          <v-list-item-title>Kupljene Ture</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/profile" @click="mobileMenuOpen = false" class="mobile-nav-item">
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-account-circle</v-icon>
          </template>
          <v-list-item-title>Profil</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="logout; mobileMenuOpen = false" class="mobile-nav-item">
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-logout</v-icon>
          </template>
          <v-list-item-title>Odjava</v-list-item-title>
        </v-list-item>
      </template>
      
      <template v-else>
        <v-divider class="my-2" />
        
        <v-list-item to="/login" @click="mobileMenuOpen = false" class="mobile-nav-item">
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-login</v-icon>
          </template>
          <v-list-item-title>Prijava</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/signup" @click="mobileMenuOpen = false" class="mobile-nav-item">
          <template #prepend>
            <v-icon class="mobile-nav-icon">mdi-account-plus</v-icon>
          </template>
          <v-list-item-title>Registracija</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/')
}

const isActive = (path) => {
  // Active style for sections and sub-pages
  if (path === '/') {
    return router.currentRoute.value.path === '/'
  }
  return router.currentRoute.value.path === path || router.currentRoute.value.path.startsWith(path + '/')
}
</script>

<style scoped lang="scss">
:root {
  --warm-primary: #D4730A;
  --warm-secondary: #F59E0B;
  --warm-accent: #F97316;
  --warm-light: #FEF3E2;
  --warm-lighter: #FFFBF5;
  --warm-gradient: linear-gradient(135deg, #D4730A 0%, #F59E0B 100%);
  --warm-gradient-light: linear-gradient(135deg, #FEF3E2 0%, #FFFBF5 100%);
}

.warm-navbar {
  background: var(--warm-gradient) !important;
  border-bottom: 1px solid rgba(245, 158, 11, 0.3) !important;
  backdrop-filter: blur(20px) !important;

  // Brand Section
  .navbar-brand {
    color: white !important;
    padding: 8px 16px !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;

    .brand-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .brand-icon {
        font-size: 1.5rem !important;
        color: white !important;
      }

      .brand-text {
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }
  }

  // Navigation Items
  .nav-items {
    .nav-item {
      color: rgba(255, 255, 255, 0.9) !important;
      font-weight: 600 !important;
      letter-spacing: 0.3px !important;
      margin: 0 4px !important;
      border-radius: 12px !important;
      position: relative !important;
      transition: all 0.3s ease !important;
      padding: 8px 16px !important;

      .nav-icon {
        margin-right: 8px !important;
        font-size: 1.1rem !important;
      }

      .nav-text {
        font-size: 0.95rem !important;
      }

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.8);
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }

      &:hover {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.15) !important;

        &::before {
          width: 80%;
        }
      }
    }

    .nav-item--active {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;

      &::before {
        width: 80%;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.25) !important;
      }
    }
  }

  // Auth Section
  .auth-section {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-chip {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border-color: rgba(255, 255, 255, 0.4) !important;
    }

    .login-btn {
      background: white !important;
      color: var(--warm-primary) !important;
      border-radius: 12px !important;
      padding: 8px 20px !important;
      font-weight: 700 !important;
      letter-spacing: 0.5px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      transition: all 0.3s ease !important;

      &:hover {
        background: var(--warm-light) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
      }
    }

    .signup-btn {
      color: white !important;
      border-color: rgba(255, 255, 255, 0.6) !important;
      transition: all 0.3s ease !important;

      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: white !important;
      }
    }

    .profile-btn {
      color: rgba(255, 255, 255, 0.9) !important;
      transition: all 0.3s ease !important;

      .profile-avatar {
        background: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
      }

      &:hover {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.15) !important;
      }
    }
  }

  // Mobile Menu Button
  .mobile-menu-btn {
    color: white !important;
    transition: all 0.3s ease !important;

    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
    }
  }
}

// User Menu Dropdown
.user-menu-card {
  margin-top: 8px !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 8px 32px rgba(212, 115, 10, 0.25) !important;
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
  background: white !important;

  .user-menu {
    .menu-item {
      transition: all 0.2s ease !important;
      margin: 4px 8px !important;
      border-radius: 12px !important;
      color: var(--warm-primary) !important;

      .menu-icon {
        color: var(--warm-secondary) !important;
      }

      &:hover {
        background: var(--warm-light) !important;
        color: var(--warm-primary) !important;

        .menu-icon {
          color: var(--warm-primary) !important;
        }
      }
    }
  }
}

// Mobile Navigation
.mobile-nav {
  background: var(--warm-gradient-light) !important;
  border-left: 1px solid rgba(212, 115, 10, 0.2) !important;

  .mobile-nav-list {
    padding: 16px 8px !important;

    .mobile-nav-item {
      margin-bottom: 8px !important;
      border-radius: 12px !important;
      color: var(--warm-primary) !important;
      transition: all 0.3s ease !important;

      .mobile-nav-icon {
        color: var(--warm-secondary) !important;
      }

      &:hover {
        background: white !important;
        color: var(--warm-primary) !important;

        .mobile-nav-icon {
          color: var(--warm-primary) !important;
        }
      }
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .warm-navbar {
    .navbar-brand {
      padding: 4px 12px !important;

      .brand-content {
        gap: 8px;

        .brand-text {
          font-size: 1.1rem;
        }
      }
    }

    .auth-section {
      .login-btn, .signup-btn {
        padding: 6px 16px !important;
        font-size: 0.9rem !important;
      }
    }
  }
}
</style>