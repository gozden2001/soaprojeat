<template>
  <div class="blog-list-view">
    <!-- Hero Header Section -->
    <section class="blog-header-section">
      <v-container>
        <div class="blog-header-content animate-fade-in">
          <div class="header-icon">
            <v-icon size="64" color="white">mdi-post</v-icon>
          </div>
          <h1 class="header-title font-heading">Turistički Blogovi</h1>
          <p class="header-subtitle">
            Otkrijte neverovatne destinacije kroz priče drugih putnika
          </p>
          
          <div class="header-actions" v-if="userStore.isAuthenticated">
            <v-btn
              size="large"
              color="white"
              variant="elevated"
              class="create-btn"
              prepend-icon="mdi-plus"
              @click="$router.push('/blogs/create')"
            >
              Novi Blog
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="pa-6">
      <!-- Search and Filter Section -->
      <v-row class="search-section">
        <v-col cols="12">
          <v-card class="search-card" elevation="0">
            <v-card-text class="pa-6">
              <v-row align="center">
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="searchTerm"
                    label="Pretražite blogove..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    clearable
                    class="search-field"
                    @keyup.enter="searchBlogs"
                    @click:clear="clearSearch"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn 
                    color="primary" 
                    size="large"
                    block 
                    @click="searchBlogs"
                    :loading="loading"
                    class="search-btn"
                  >
                    Pretraži
                  </v-btn>
                </v-col>
              </v-row>
              
              <!-- Popular Tags -->
              <div v-if="blogStats.popularTags?.length > 0" class="mt-6">
                <h4 class="tags-title font-heading mb-3">Popularni tagovi:</h4>
                <v-chip-group class="tags-group">
                  <v-chip
                    v-for="tag in blogStats.popularTags"
                    :key="tag._id"
                    @click="filterByTag(tag._id)"
                    size="small"
                    variant="outlined"
                    class="tag-chip"
                  >
                    {{ tag._id }} ({{ tag.count }})
                  </v-chip>
                </v-chip-group>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Blog Stats -->
      <v-row v-if="blogStats.totalBlogs > 0" class="stats-section">
        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="0">
            <v-card-text class="text-center pa-6">
              <div class="stat-icon">
                <v-icon size="48" color="#D4730A">mdi-post-outline</v-icon>
              </div>
              <h3 class="stat-number">{{ blogStats.totalBlogs }}</h3>
              <p class="stat-label">Ukupno blogova</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="0">
            <v-card-text class="text-center pa-6">
              <div class="stat-icon">
                <v-icon size="48" color="#16A34A">mdi-tag-multiple</v-icon>
              </div>
              <h3 class="stat-number">{{ blogStats.popularTags?.length || 0 }}</h3>
              <p class="stat-label">Aktivnih tagova</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="0">
            <v-card-text class="text-center pa-6">
              <div class="stat-icon">
                <v-icon size="48" color="#3B82F6">mdi-account-group</v-icon>
              </div>
              <h3 class="stat-number">{{ blogStats.topAuthors?.length || 0 }}</h3>
              <p class="stat-label">Aktivnih autora</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Blog List -->
      <v-row class="blogs-grid">
        <v-col cols="12">
          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="primary" size="64" />
            <p class="loading-text">Učitavaju se blogovi...</p>
          </div>

          <div v-else-if="blogs.length === 0" class="empty-state">
            <div class="empty-icon">
              <v-icon size="80" color="rgba(212, 115, 10, 0.4)">mdi-post-outline</v-icon>
            </div>
            <h3 class="empty-title">Nema blogova</h3>
            <p class="empty-text">
              {{ searchTerm ? 'Nema rezultata pretrage.' : 'Budite prvi koji će napisati blog!' }}
            </p>
            <v-btn
              v-if="userStore.isAuthenticated && !searchTerm"
              color="primary"
              size="large"
              prepend-icon="mdi-plus"
              @click="$router.push('/blogs/create')"
              class="mt-4"
            >
              Kreiraj Prvi Blog
            </v-btn>
          </div>

          <v-row v-else class="blog-cards">
            <v-col
              v-for="(blog, index) in blogs"
              :key="blog._id"
              cols="12"
              sm="6"
              lg="4"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <v-card 
                class="blog-card h-100"
                elevation="0"
                @click="$router.push(`/blogs/${blog._id}`)"
              >
                <v-card-title class="blog-title">
                  {{ blog.title }}
                </v-card-title>
                
                <v-card-text class="blog-content">
                  <p class="blog-description">
                    {{ truncateText(blog.description, 150) }}
                  </p>
                  
                  <!-- Tags -->
                  <div v-if="blog.tags?.length > 0" class="blog-tags mt-4">
                    <v-chip
                      v-for="tag in blog.tags.slice(0, 3)"
                      :key="tag"
                      size="x-small"
                      class="tag-chip-small mr-1 mb-1"
                      variant="tonal"
                    >
                      {{ tag }}
                    </v-chip>
                    <v-chip
                      v-if="blog.tags.length > 3"
                      size="x-small"
                      variant="text"
                      class="more-tags"
                    >
                      +{{ blog.tags.length - 3 }}
                    </v-chip>
                  </div>
                </v-card-text>

                <v-card-actions class="blog-footer pa-4">
                  <div class="author-info">
                    <v-avatar size="32" class="author-avatar">
                      <span class="author-initial">
                        {{ blog.author?.username?.charAt(0)?.toUpperCase() || 'A' }}
                      </span>
                    </v-avatar>
                    <div class="author-details ml-3">
                      <div class="author-name">{{ blog.author?.username || 'Nepoznat autor' }}</div>
                      <div class="blog-date">{{ formatDate(blog.createdAt) }}</div>
                    </div>
                  </div>
                  
                  <v-spacer />
                  
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="read-more-btn"
                  >
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="pagination.totalPages > 1" class="pagination-section">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="pagination.totalPages"
            :total-visible="7"
            @update:model-value="changePage"
            class="blog-pagination"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import blogAPI from '../api/blogs'

const userStore = useAuthStore()

// Reactive data
const blogs = ref([])
const loading = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const pagination = ref({
  currentPage: 1,
  totalPages: 0,
  totalBlogs: 0,
  hasNext: false,
  hasPrev: false
})
const blogStats = ref({
  totalBlogs: 0,
  popularTags: [],
  topAuthors: []
})

// Methods
const loadBlogs = async () => {
  loading.value = true
  try {
    const result = await blogAPI.getAllBlogs(currentPage.value, 9)
    if (result.success) {
      blogs.value = result.data.blogs
      pagination.value = result.data.pagination
    } else {
      console.error('Failed to load blogs:', result.error)
    }
  } catch (error) {
    console.error('Error loading blogs:', error)
  } finally {
    loading.value = false
  }
}

const loadBlogStats = async () => {
  try {
    const result = await blogAPI.getBlogStats()
    if (result.success) {
      blogStats.value = result.data
    }
  } catch (error) {
    console.error('Error loading blog stats:', error)
  }
}

const searchBlogs = async () => {
  if (!searchTerm.value.trim()) {
    loadBlogs()
    return
  }
  
  loading.value = true
  try {
    const result = await blogAPI.searchBlogs(searchTerm.value, 1, 9)
    if (result.success) {
      blogs.value = result.data.blogs
      pagination.value = result.data.pagination
      currentPage.value = 1
    } else {
      console.error('Failed to search blogs:', result.error)
    }
  } catch (error) {
    console.error('Error searching blogs:', error)
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchTerm.value = ''
  currentPage.value = 1
  loadBlogs()
}

const filterByTag = (tag) => {
  searchTerm.value = tag
  searchBlogs()
}

const changePage = (page) => {
  currentPage.value = page
  if (searchTerm.value.trim()) {
    searchBlogs()
  } else {
    loadBlogs()
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadBlogs()
  loadBlogStats()
})
</script>

<style scoped>
.blog-list-view {
  overflow-x: hidden;
}

/* Hero Header Section */
.blog-header-section {
  background: var(--warm-gradient);
  padding: 80px 0 100px;
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

.blog-header-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.header-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.header-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  margin-top: 32px;
}

.create-btn {
  color: var(--warm-orange) !important;
  border-radius: var(--border-radius-md) !important;
  padding: 0 32px !important;
  height: 56px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
  }
}

/* Search Section */
.search-section {
  margin-top: -50px;
  position: relative;
  z-index: 2;
}

.search-card {
  border-radius: var(--border-radius-lg) !important;
  backdrop-filter: blur(20px) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  box-shadow: var(--warm-shadow-lg) !important;
}

.search-field {
  :deep(.v-field) {
    border-radius: var(--border-radius-md) !important;
  }
}

.search-btn {
  border-radius: var(--border-radius-md) !important;
  height: 56px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.3px !important;
}

.tags-title {
  color: var(--warm-brown);
  font-size: 1.1rem;
}

.tags-group {
  gap: 8px;
}

.tag-chip {
  border-radius: 20px !important;
  border-color: rgba(212, 115, 10, 0.3) !important;
  color: var(--warm-brown) !important;
  transition: all 0.2s ease !important;
  cursor: pointer;
  
  &:hover {
    background: var(--warm-amber) !important;
    color: white !important;
    border-color: var(--warm-amber) !important;
  }
}

/* Stats Section */
.stats-section {
  margin-top: 40px;
}

.stat-card {
  border-radius: var(--border-radius-lg) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  transition: all 0.3s ease !important;
  height: 100%;
  
  &:hover {
    box-shadow: var(--warm-shadow-md) !important;
    border-color: rgba(245, 158, 11, 0.2) !important;
  }
}

.stat-icon {
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--warm-brown);
  margin-bottom: 8px;
}

.stat-label {
  color: rgba(28, 25, 23, 0.7);
  font-weight: 500;
  margin: 0;
}

/* Loading and Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-text {
  margin-top: 24px;
  color: rgba(28, 25, 23, 0.7);
  font-size: 1.1rem;
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 16px;
}

.empty-text {
  color: rgba(28, 25, 23, 0.7);
  font-size: 1.1rem;
  margin: 0;
}

/* Blog Cards */
.blogs-grid {
  margin-top: 40px;
}

.blog-cards {
  margin-top: 16px;
}

.blog-card {
  border-radius: var(--border-radius-lg) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer;
  animation: fadeInUp 0.6s ease-out both;
  
  &:hover {
    box-shadow: var(--warm-shadow-lg) !important;
    border-color: rgba(245, 158, 11, 0.2) !important;
    transform: translateY(-4px);
    
    .read-more-btn {
      background: var(--warm-orange) !important;
      color: white !important;
    }
  }
}

.blog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--warm-brown);
  padding: 20px 20px 8px;
  line-height: 1.3;
}

.blog-content {
  padding: 0 20px 8px;
}

.blog-description {
  color: rgba(28, 25, 23, 0.8);
  line-height: 1.6;
  margin: 0;
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-chip-small {
  background: rgba(245, 158, 11, 0.1) !important;
  color: var(--warm-brown) !important;
  font-weight: 500 !important;
}

.more-tags {
  color: rgba(28, 25, 23, 0.6) !important;
  font-weight: 500;
}

.blog-footer {
  border-top: 1px solid rgba(245, 158, 11, 0.1);
  background: rgba(245, 158, 11, 0.02);
}

.author-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  background: var(--warm-gradient) !important;
  color: white !important;
  font-weight: 600;
}

.author-initial {
  font-size: 0.9rem;
}

.author-name {
  font-weight: 600;
  color: var(--warm-brown);
  font-size: 0.9rem;
}

.blog-date {
  font-size: 0.8rem;
  color: rgba(28, 25, 23, 0.6);
}

.read-more-btn {
  border-radius: 50% !important;
  color: var(--warm-orange) !important;
  transition: all 0.3s ease !important;
}

/* Pagination */
.pagination-section {
  margin-top: 60px;
}

.blog-pagination {
  :deep(.v-pagination__item) {
    border-radius: var(--border-radius-sm) !important;
    
    &.v-pagination__item--is-active {
      background: var(--warm-orange) !important;
      color: white !important;
    }
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .header-title {
    font-size: 2.2rem;
  }
  
  .header-subtitle {
    font-size: 1.1rem;
  }
  
  .search-section {
    margin-top: -30px;
  }
  
  .blog-header-section {
    padding: 60px 0 80px;
  }
}

@media (max-width: 600px) {
  .header-icon {
    width: 80px;
    height: 80px;
    
    .v-icon {
      font-size: 48px !important;
    }
  }
  
  .header-title {
    font-size: 1.8rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .create-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .search-card {
    margin: 0 8px;
  }
  
  .blog-cards {
    margin: 0 -8px;
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