<template>
  <div class="blog-author-view">
    <!-- Hero Header Section -->
    <section class="author-hero-section">
      <v-container>
        <div class="hero-content animate-fade-in">
          <!-- Navigation -->
          <div class="hero-navigation">
            <v-btn
              icon
              variant="text"
              class="back-btn"
              @click="$router.push('/blogs')"
            >
              <v-icon color="white">mdi-arrow-left</v-icon>
            </v-btn>
          </div>
          
          <!-- Author Info -->
          <div class="hero-info">
            <div class="hero-icon">
              <v-icon size="48" color="white">mdi-account-circle</v-icon>
            </div>
            <h1 class="hero-title font-heading">Blogovi autora</h1>
            <div v-if="authorInfo" class="hero-author-info">
              <div class="author-name">{{ authorInfo.username }}</div>
              <div class="author-role">{{ authorInfo.role === 'vodic' ? 'Vodič' : 'Turista' }}</div>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="content-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-h6">Učitavaju se blogovi...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section">
        <div class="error-content">
          <v-icon size="80" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <h3 class="error-title">Greška</h3>
          <p class="error-message">{{ error }}</p>
        </div>
      </div>

      <!-- No Blogs State -->
      <div v-else-if="blogs.length === 0" class="empty-section">
        <div class="empty-content">
          <v-icon size="80" class="mb-4 empty-icon">mdi-post-outline</v-icon>
          <h3 class="empty-title">Nema blogova</h3>
          <p class="empty-message">Ovaj autor još uvek nije napisao nijedan blog.</p>
        </div>
      </div>

      <!-- Blogs Grid -->
      <v-row v-else class="blogs-grid">
        <v-col
          v-for="blog in blogs"
          :key="blog._id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card 
            class="blog-card h-100"
            elevation="0"
            @click="$router.push(`/blogs/${blog._id}`)"
          >
            <!-- Blog Images Preview -->
            <v-img
              v-if="blog.images && blog.images.length > 0"
              :src="blog.images[0].url"
              height="200"
              cover
              class="blog-image"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </template>
              
              <div class="image-overlay">
                <v-icon color="white" size="24">mdi-eye</v-icon>
              </div>
            </v-img>
            
            <div v-else class="no-image-placeholder">
              <v-icon size="48" color="var(--warm-orange)">mdi-image-off</v-icon>
            </div>
            
            <v-card-title class="blog-title">
              {{ blog.title }}
            </v-card-title>
            
            <v-card-text class="blog-content">
              <p class="blog-description">
                {{ truncateText(blog.description, 120) }}
              </p>
              
              <!-- Tags -->
              <div v-if="blog.tags && blog.tags.length > 0" class="blog-tags">
                <v-chip
                  v-for="tag in blog.tags.slice(0, 3)"
                  :key="tag"
                  size="x-small"
                  class="blog-tag"
                >
                  {{ tag }}
                </v-chip>
                <v-chip
                  v-if="blog.tags.length > 3"
                  size="x-small"
                  class="more-tags"
                >
                  +{{ blog.tags.length - 3 }}
                </v-chip>
              </div>
            </v-card-text>

            <v-card-actions class="blog-actions">
              <div class="blog-date">
                {{ formatDate(blog.createdAt) }}
              </div>
              
              <!-- Edit/Delete actions if it's user's own blog -->
              <div v-if="canEditBlog(blog)" class="blog-edit-actions">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  class="edit-btn"
                  @click.stop="editBlog(blog._id)"
                >
                  <v-icon size="18">mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  class="delete-btn"
                  @click.stop="confirmDelete(blog)"
                >
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="pagination.totalPages > 1" class="pagination-row">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="pagination.totalPages"
            :total-visible="7"
            @update:model-value="changePage"
            class="custom-pagination"
          />
        </v-col>
      </v-row>

      <!-- Blog Stats -->
      <v-row v-if="pagination.totalBlogs > 0" class="stats-row">
        <v-col cols="12">
          <v-card class="stats-card" elevation="0">
            <v-card-text class="stats-content">
              <div class="stats-number">{{ pagination.totalBlogs }}</div>
              <div class="stats-label">
                {{ pagination.totalBlogs === 1 ? 'blog ukupno' : 'blogova ukupno' }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="480" class="delete-dialog">
      <v-card class="delete-card">
        <v-card-title class="delete-title">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Potvrdi brisanje
        </v-card-title>
        <v-card-text class="delete-message">
          Da li ste sigurni da želite da obrišete blog "{{ blogToDelete?.title }}"? 
          Ova akcija se ne može poništiti.
        </v-card-text>
        <v-card-actions class="delete-actions">
          <v-spacer />
          <v-btn @click="deleteDialog = false" class="cancel-delete-btn">
            Otkaži
          </v-btn>
          <v-btn 
            color="error" 
            @click="deleteBlog" 
            :loading="deleteLoading"
            class="confirm-delete-btn"
          >
            Obriši
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      class="custom-snackbar"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Zatvori
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import blogAPI from '../api/blogs'

const route = useRoute()
const router = useRouter()
const userStore = useAuthStore()

// Reactive data
const blogs = ref([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const authorInfo = ref(null)
const pagination = ref({
  currentPage: 1,
  totalPages: 0,
  totalBlogs: 0,
  hasNext: false,
  hasPrev: false
})

const deleteDialog = ref(false)
const blogToDelete = ref(null)
const deleteLoading = ref(false)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Methods
const loadAuthorBlogs = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const authorId = route.params.authorId
    const result = await blogAPI.getBlogsByAuthor(authorId, currentPage.value, 9)
    
    if (result.success) {
      blogs.value = result.data.blogs
      pagination.value = result.data.pagination
      
      // Extract author info from first blog if available
      if (result.data.blogs.length > 0) {
        authorInfo.value = result.data.blogs[0].author
      }
    } else {
      error.value = result.error || 'Greška pri učitavanju blogova'
    }
  } catch (err) {
    error.value = 'Greška pri učitavanju blogova'
    console.error('Error loading author blogs:', err)
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  currentPage.value = page
  loadAuthorBlogs()
}

const canEditBlog = (blog) => {
  return userStore.isAuthenticated && 
         userStore.user && 
         blog.author.userId === userStore.user.id
}

const editBlog = (blogId) => {
  router.push(`/blogs/${blogId}/edit`)
}

const confirmDelete = (blog) => {
  blogToDelete.value = blog
  deleteDialog.value = true
}

const deleteBlog = async () => {
  if (!blogToDelete.value) return
  
  deleteLoading.value = true
  
  try {
    const result = await blogAPI.deleteBlog(blogToDelete.value._id)
    
    if (result.success) {
      showSnackbar('Blog je uspešno obrisan', 'success')
      
      // Remove blog from list
      blogs.value = blogs.value.filter(b => b._id !== blogToDelete.value._id)
      
      // Reload if page is empty
      if (blogs.value.length === 0 && currentPage.value > 1) {
        currentPage.value = currentPage.value - 1
        loadAuthorBlogs()
      } else if (blogs.value.length === 0) {
        loadAuthorBlogs()
      }
    } else {
      showSnackbar(result.error || 'Greška pri brisanju bloga', 'error')
    }
  } catch (error) {
    showSnackbar('Greška pri brisanju bloga', 'error')
    console.error('Error deleting blog:', error)
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
    blogToDelete.value = null
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

const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

// Lifecycle
onMounted(() => {
  loadAuthorBlogs()
})
</script>

<style scoped>
.blog-author-view {
  overflow-x: hidden;
}

/* Hero Section */
.author-hero-section {
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
  margin-bottom: 16px;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hero-author-info {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  padding: 16px 24px;
  display: inline-block;
  margin-top: 8px;
}

.author-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.author-role {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Main Content */
.content-container {
  margin-top: -40px;
  position: relative;
  z-index: 2;
}

/* Loading, Error, Empty States */
.loading-section, .error-section, .empty-section {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.error-content, .empty-content {
  max-width: 400px;
}

.error-title, .empty-title {
  color: var(--warm-brown);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.error-message, .empty-message {
  color: rgba(28, 25, 23, 0.7);
  margin-bottom: 0;
  font-size: 1rem;
}

.empty-icon {
  color: rgba(212, 115, 10, 0.5) !important;
}

/* Blogs Grid */
.blogs-grid {
  margin-top: 20px;
}

.blog-card {
  border-radius: var(--border-radius-xl) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  box-shadow: var(--warm-shadow-md) !important;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--warm-shadow-xl) !important;
    
    .image-overlay {
      opacity: 1;
    }
    
    .blog-image {
      transform: scale(1.05);
    }
  }
}

.blog-image {
  transition: transform 0.3s ease;
  position: relative;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.no-image-placeholder {
  height: 200px;
  background: var(--light-orange);
  display: flex;
  align-items: center;
  justify-content: center;
}

.blog-title {
  font-size: 1.2rem !important;
  font-weight: 700 !important;
  color: var(--warm-brown) !important;
  line-height: 1.3 !important;
  padding: 16px 20px 8px !important;
}

.blog-content {
  padding: 0 20px 8px !important;
}

.blog-description {
  color: rgba(28, 25, 23, 0.8);
  line-height: 1.5;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.blog-tag {
  background: var(--light-orange) !important;
  color: var(--warm-brown) !important;
  border: 1px solid rgba(212, 115, 10, 0.3) !important;
  font-weight: 500 !important;
}

.more-tags {
  background: rgba(245, 158, 11, 0.1) !important;
  color: var(--warm-orange) !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
}

.blog-actions {
  padding: 12px 20px 16px !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

.blog-date {
  font-size: 0.85rem;
  color: rgba(28, 25, 23, 0.6);
  font-weight: 500;
}

.blog-edit-actions {
  display: flex;
  gap: 4px;
}

.edit-btn, .delete-btn {
  transition: all 0.3s ease !important;
  
  &:hover {
    background: rgba(245, 158, 11, 0.1) !important;
  }
}

/* Pagination */
.pagination-row {
  margin-top: 40px;
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

/* Stats */
.stats-row {
  margin-top: 32px;
}

.stats-card {
  border-radius: var(--border-radius-xl) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  box-shadow: var(--warm-shadow-md) !important;
}

.stats-content {
  text-align: center;
  padding: 32px !important;
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--warm-orange);
  margin-bottom: 8px;
}

.stats-label {
  font-size: 1rem;
  color: rgba(28, 25, 23, 0.7);
  font-weight: 500;
}

/* Delete Dialog */
.delete-dialog :deep(.v-overlay__content) {
  border-radius: var(--border-radius-lg) !important;
}

.delete-card {
  border-radius: var(--border-radius-lg) !important;
}

.delete-title {
  font-weight: 700;
  color: var(--warm-brown);
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
}

.delete-message {
  padding: 24px !important;
  font-size: 1rem;
  color: rgba(28, 25, 23, 0.8);
}

.delete-actions {
  padding: 16px 24px 24px !important;
  gap: 12px;
}

.cancel-delete-btn, .confirm-delete-btn {
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

/* Custom Snackbar */
.custom-snackbar {
  :deep(.v-snackbar__wrapper) {
    border-radius: var(--border-radius-md) !important;
    backdrop-filter: blur(20px) !important;
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .author-hero-section {
    padding: 40px 0 60px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .content-container {
    margin: -20px 16px 0;
  }
  
  .stats-content {
    padding: 24px !important;
  }
  
  .stats-number {
    font-size: 2rem;
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
  
  .author-name {
    font-size: 1.1rem;
  }
  
  .author-role {
    font-size: 0.9rem;
  }
  
  .hero-author-info {
    padding: 12px 16px;
  }
  
  .blog-title {
    font-size: 1.1rem !important;
  }
  
  .blog-description {
    font-size: 0.9rem;
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