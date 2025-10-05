<template>
  <div class="user-follows-view">
    <!-- Hero Header Section -->
    <section class="follows-hero-section">
      <v-container>
        <div class="hero-content animate-fade-in">
          <!-- Navigation -->
          <div class="hero-navigation">
            <v-btn
              icon
              variant="text"
              class="back-btn"
              @click="$router.go(-1)"
            >
              <v-icon color="white">mdi-arrow-left</v-icon>
            </v-btn>
          </div>
          
          <!-- Page Info -->
          <div class="hero-info">
            <div class="hero-icon">
              <v-icon size="48" color="white">mdi-account-heart</v-icon>
            </div>
            <h1 class="hero-title font-heading">{{ pageTitle }}</h1>
            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-number">{{ followStats.followers }}</div>
                <div class="stat-label">Pratilaca</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-number">{{ followStats.following }}</div>
                <div class="stat-label">Prati</div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="content-container">
      <v-card class="main-card" elevation="0">
        <!-- Tabs -->
        <v-card-text class="tabs-section">
          <v-tabs 
            v-model="activeTab" 
            class="custom-tabs"
            align-tabs="center"
          >
            <v-tab value="followers" class="tab-item">
              <v-icon class="tab-icon">mdi-account-group</v-icon>
              <span class="tab-text">Pratioци ({{ followStats.followers }})</span>
            </v-tab>
            <v-tab value="following" class="tab-item">
              <v-icon class="tab-icon">mdi-account-multiple</v-icon>
              <span class="tab-text">Prati ({{ followStats.following }})</span>
            </v-tab>
            <v-tab value="mutual" class="tab-item">
              <v-icon class="tab-icon">mdi-account-heart</v-icon>
              <span class="tab-text">Međusobno praćenje</span>
            </v-tab>
          </v-tabs>
        </v-card-text>

        <v-divider class="custom-divider"></v-divider>

        <!-- Loading Progress -->
        <v-progress-linear 
          v-if="loading" 
          indeterminate 
          color="primary"
          class="loading-bar"
        />

        <!-- Content Windows -->
        <v-card-text class="content-section">
          <v-window v-model="activeTab" class="custom-window">
            <!-- Followers Tab -->
            <v-window-item value="followers">
              <div v-if="followers.length === 0 && !loading" class="empty-state">
                <v-icon size="80" class="empty-icon">mdi-account-off</v-icon>
                <h3 class="empty-title">Nema pratilaca</h3>
                <p class="empty-message">Ovaj korisnik još uvek nema pratioca.</p>
              </div>
              <div v-else class="users-list">
                <div
                  v-for="follower in followers"
                  :key="follower.userId"
                  class="user-item"
                >
                  <div class="user-avatar">
                    <v-avatar size="48" class="custom-avatar">
                      <v-icon color="white">mdi-account</v-icon>
                    </v-avatar>
                  </div>
                  
                  <div class="user-info">
                    <div class="user-name">{{ follower.username }}</div>
                    <div class="user-subtitle">Korisnik ID: {{ follower.userId }}</div>
                  </div>

                  <div class="user-actions">
                    <FollowButton
                      v-if="follower.userId !== authStore.user?.id"
                      :user-id="follower.userId"
                      :username="follower.username"
                      @follow-changed="onFollowChanged"
                    />
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- Following Tab -->
            <v-window-item value="following">
              <div v-if="following.length === 0 && !loading" class="empty-state">
                <v-icon size="80" class="empty-icon">mdi-account-off</v-icon>
                <h3 class="empty-title">Ne prati nikoga</h3>
                <p class="empty-message">Ovaj korisnik još uvek ne prati nikoga.</p>
              </div>
              <div v-else class="users-list">
                <div
                  v-for="followedUser in following"
                  :key="followedUser.userId"
                  class="user-item"
                >
                  <div class="user-avatar">
                    <v-avatar size="48" class="custom-avatar">
                      <v-icon color="white">mdi-account</v-icon>
                    </v-avatar>
                  </div>
                  
                  <div class="user-info">
                    <div class="user-name">{{ followedUser.username }}</div>
                    <div class="user-subtitle">Korisnik ID: {{ followedUser.userId }}</div>
                  </div>

                  <div class="user-actions">
                    <FollowButton
                      v-if="followedUser.userId !== authStore.user?.id"
                      :user-id="followedUser.userId"
                      :username="followedUser.username"
                      @follow-changed="onFollowChanged"
                    />
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- Mutual Follows Tab -->
            <v-window-item value="mutual">
              <div v-if="mutualFollows.length === 0 && !loading" class="empty-state">
                <v-icon size="80" class="empty-icon">mdi-account-heart-outline</v-icon>
                <h3 class="empty-title">Nema međusobnog praćenja</h3>
                <p class="empty-message">Nema korisnika koji se međusobno prate.</p>
              </div>
              <div v-else class="users-list">
                <div
                  v-for="mutualUser in mutualFollows"
                  :key="mutualUser.userId"
                  class="user-item mutual-item"
                >
                  <div class="user-avatar">
                    <v-avatar size="48" class="mutual-avatar">
                      <v-icon color="white">mdi-account-heart</v-icon>
                    </v-avatar>
                  </div>
                  
                  <div class="user-info">
                    <div class="user-name">{{ mutualUser.username }}</div>
                    <div class="user-subtitle">Međusobno praćenje</div>
                  </div>

                  <div class="user-actions">
                    <FollowButton
                      v-if="mutualUser.userId !== authStore.user?.id"
                      :user-id="mutualUser.userId"
                      :username="mutualUser.username"
                      @follow-changed="onFollowChanged"
                    />
                  </div>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="pagination-section">
          <v-pagination
            v-model="currentPage"
            :length="pagination.totalPages"
            @update:model-value="loadData"
            class="custom-pagination"
          />
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import followAPI from '../api/follows'
import { useAuthStore } from '../stores/auth'
import FollowButton from '../components/FollowButton.vue'

export default {
  name: 'UserFollowsView',
  components: {
    FollowButton
  },
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    const activeTab = ref('followers')
    const loading = ref(false)
    const currentPage = ref(1)
    
    const followers = ref([])
    const following = ref([])
    const mutualFollows = ref([])
    
    const followStats = ref({
      followers: 0,
      following: 0
    })
    
    const pagination = ref({
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    })

    const userId = computed(() => route.params.userId)
    const pageTitle = computed(() => {
      const username = route.query.username || 'Korisnik'
      return `Praćenja - ${username}`
    })

    const loadFollowStats = async () => {
      try {
        const result = await followAPI.getFollowStats(userId.value)
        if (result.success) {
          followStats.value = result.data
        }
      } catch (error) {
        console.error('Error loading follow stats:', error)
      }
    }

    const loadFollowers = async (page = 1) => {
      loading.value = true
      try {
        const result = await followAPI.getFollowers(userId.value, page, 20)
        if (result.success) {
          followers.value = result.data.followers
          pagination.value = result.data.pagination
        }
      } catch (error) {
        console.error('Error loading followers:', error)
      } finally {
        loading.value = false
      }
    }

    const loadFollowing = async (page = 1) => {
      loading.value = true
      try {
        const result = await followAPI.getFollowing(userId.value, page, 20)
        if (result.success) {
          following.value = result.data.following
          pagination.value = result.data.pagination
        }
      } catch (error) {
        console.error('Error loading following:', error)
      } finally {
        loading.value = false
      }
    }

    const loadMutualFollows = async (page = 1) => {
      loading.value = true
      try {
        const result = await followAPI.getMutualFollows(userId.value, page, 20)
        if (result.success) {
          mutualFollows.value = result.data.mutualFollows
          pagination.value = result.data.pagination
        }
      } catch (error) {
        console.error('Error loading mutual follows:', error)
      } finally {
        loading.value = false
      }
    }

    const loadData = (page = 1) => {
      currentPage.value = page
      
      switch (activeTab.value) {
        case 'followers':
          loadFollowers(page)
          break
        case 'following':
          loadFollowing(page)
          break
        case 'mutual':
          loadMutualFollows(page)
          break
      }
    }

    const onFollowChanged = () => {
      // Reload current data and stats
      loadFollowStats()
      loadData(currentPage.value)
    }

    watch(activeTab, () => {
      currentPage.value = 1
      loadData(1)
    })

    watch(() => route.params.userId, () => {
      if (route.params.userId) {
        loadFollowStats()
        loadData(1)
      }
    })

    onMounted(() => {
      if (route.params.userId) {
        loadFollowStats()
        loadData(1)
      }
    })

    return {
      authStore,
      activeTab,
      loading,
      currentPage,
      followers,
      following,
      mutualFollows,
      followStats,
      pagination,
      pageTitle,
      loadData,
      onFollowChanged
    }
  }
}
</script>

<style scoped>
.user-follows-view {
  overflow-x: hidden;
}

/* Hero Section */
.follows-hero-section {
  background: var(--warm-gradient);
  padding: 60px 0 80px;
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
    height: 80px;
    background: linear-gradient(to top, var(--warm-bg), transparent);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-navigation {
  position: absolute;
  left: 0;
  top: 0;
}

.back-btn {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25) !important;
  }
}

.hero-info {
  padding-top: 20px;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  display: inline-flex;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* Main Content */
.content-container {
  margin-top: -40px;
  position: relative;
  z-index: 2;
}

.main-card {
  border-radius: var(--border-radius-xl) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  box-shadow: var(--warm-shadow-lg) !important;
}

/* Tabs Section */
.tabs-section {
  padding: 32px 32px 16px !important;
}

.custom-tabs {
  :deep(.v-tab) {
    border-radius: var(--border-radius-md) !important;
    font-weight: 600 !important;
    text-transform: none !important;
    color: rgba(28, 25, 23, 0.7) !important;
    margin: 0 8px !important;
    transition: all 0.3s ease !important;
    
    &.v-tab--selected {
      background: var(--light-orange) !important;
      color: var(--warm-brown) !important;
      box-shadow: var(--warm-shadow-sm) !important;
    }
    
    &:hover:not(.v-tab--selected) {
      background: rgba(245, 158, 11, 0.1) !important;
    }
  }
  
  :deep(.v-tabs-slider) {
    display: none;
  }
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px !important;
}

.tab-icon {
  font-size: 18px !important;
}

.tab-text {
  font-size: 0.95rem;
  white-space: nowrap;
}

.custom-divider {
  border-color: rgba(245, 158, 11, 0.2) !important;
  margin: 0 32px !important;
}

/* Loading Bar */
.loading-bar {
  margin: 0 32px;
}

/* Content Section */
.content-section {
  padding: 24px 32px 32px !important;
  min-height: 400px;
}

.custom-window {
  :deep(.v-window-item) {
    padding: 0;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  color: rgba(212, 115, 10, 0.4) !important;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 12px;
}

.empty-message {
  color: rgba(28, 25, 23, 0.6);
  font-size: 1rem;
  margin: 0;
}

/* Users List */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(245, 158, 11, 0.03);
  border: 1px solid rgba(245, 158, 11, 0.1);
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(245, 158, 11, 0.05);
    border-color: rgba(245, 158, 11, 0.2);
    box-shadow: var(--warm-shadow-sm);
  }
  
  &.mutual-item {
    background: rgba(233, 30, 99, 0.03);
    border-color: rgba(233, 30, 99, 0.1);
    
    &:hover {
      background: rgba(233, 30, 99, 0.05);
      border-color: rgba(233, 30, 99, 0.2);
    }
  }
}

.user-avatar {
  margin-right: 16px;
}

.custom-avatar {
  background: var(--warm-orange) !important;
  border: 2px solid rgba(212, 115, 10, 0.3) !important;
}

.mutual-avatar {
  background: #e91e63 !important;
  border: 2px solid rgba(233, 30, 99, 0.3) !important;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 4px;
}

.user-subtitle {
  font-size: 0.9rem;
  color: rgba(28, 25, 23, 0.6);
}

.user-actions {
  margin-left: 16px;
}

/* Pagination */
.pagination-section {
  padding: 16px 32px 32px;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

.custom-pagination {
  :deep(.v-pagination__item) {
    border-radius: var(--border-radius-md) !important;
    font-weight: 600 !important;
    
    &.v-pagination__item--is-active {
      background: var(--warm-orange) !important;
      color: white !important;
    }
  }
  
  :deep(.v-pagination__next),
  :deep(.v-pagination__prev) {
    border-radius: var(--border-radius-md) !important;
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .follows-hero-section {
    padding: 40px 0 60px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-stats {
    gap: 16px;
    padding: 16px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .content-container {
    margin: -20px 16px 0;
  }
  
  .tabs-section {
    padding: 24px 20px 16px !important;
  }
  
  .content-section {
    padding: 16px 20px 24px !important;
  }
  
  .custom-divider {
    margin: 0 20px !important;
  }
  
  .user-item {
    padding: 16px;
  }
  
  .pagination-section {
    padding: 16px 20px 24px;
  }
}

@media (max-width: 600px) {
  .hero-icon {
    width: 64px;
    height: 64px;
    
    .v-icon {
      font-size: 36px !important;
    }
  }
  
  .hero-title {
    font-size: 1.6rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .stat-divider {
    width: 40px;
    height: 1px;
  }
  
  .tab-text {
    font-size: 0.85rem;
  }
  
  .user-item {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .user-avatar {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .user-actions {
    margin-left: 0;
    margin-top: 12px;
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

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out;
}
</style>