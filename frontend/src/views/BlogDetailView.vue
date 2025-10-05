<template>
  <div class="blog-detail-view">
    <div v-if="loading" class="loading-section">
      <v-container class="text-center pa-12">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-h6">Učitava se blog...</p>
      </v-container>
    </div>

    <div v-else-if="error" class="error-section">
      <v-container class="text-center pa-12">
        <div class="error-content">
          <v-icon size="80" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <h3 class="error-title">Greška</h3>
          <p class="error-message">{{ error }}</p>
          <v-btn 
            color="primary" 
            @click="$router.push('/blogs')" 
            class="mt-6 back-to-blogs-btn"
            prepend-icon="mdi-arrow-left"
          >
            Nazad na blogove
          </v-btn>
        </div>
      </v-container>
    </div>

    <div v-else-if="blog" class="blog-content-section">
      <!-- Hero Header Section -->
      <section class="blog-hero-section">
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
            
            <!-- Blog Title and Meta -->
            <div class="hero-info">
              <h1 class="hero-title font-heading">{{ blog.title }}</h1>
              
              <!-- Author Info -->
              <div class="hero-author">
                <v-avatar size="48" class="author-avatar">
                  <span class="text-h6">
                    {{ blog.author?.username?.charAt(0)?.toUpperCase() || 'A' }}
                  </span>
                </v-avatar>
                <div class="author-details">
                  <div class="author-name">{{ blog.author?.username || 'Nepoznat autor' }}</div>
                  <div class="author-role">
                    {{ blog.author?.role === 'vodic' ? 'Vodič' : 'Turista' }} • {{ formatDate(blog.createdAt) }}
                  </div>
                </div>
              </div>
              
              <!-- Tags -->
              <div v-if="blog.tags?.length > 0" class="hero-tags">
                <v-chip
                  v-for="tag in blog.tags"
                  :key="tag"
                  size="small"
                  class="hero-tag"
                  @click="searchByTag(tag)"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-container>
      </section>

      <v-container class="content-container">
        <v-row>
          <!-- Main Content -->
          <v-col cols="12" lg="8">
            <v-card class="main-content-card" elevation="0">
              <!-- Blog Content -->
              <v-card-text class="blog-text-content">
                <div class="blog-content">
                  <p v-for="(paragraph, index) in formattedDescription" :key="index" class="content-paragraph">
                    {{ paragraph }}
                  </p>
                </div>
              </v-card-text>

              <!-- Images Section -->
              <v-card-text v-if="blog.images?.length > 0" class="images-section">
                <h3 class="images-title">Galerija slika</h3>
                <v-row class="images-grid">
                  <v-col
                    v-for="(image, index) in blog.images"
                    :key="index"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-card class="image-card" @click="openImageViewer(image)">
                      <v-img
                        :src="image.url"
                        :alt="image.description || 'Blog slika'"
                        height="220"
                        cover
                        class="image-preview"
                      >
                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="primary" />
                          </v-row>
                        </template>
                        
                        <div class="image-overlay">
                          <v-icon color="white" size="32">mdi-magnify-plus</v-icon>
                        </div>
                      </v-img>
                      
                      <v-card-text v-if="image.description" class="image-description">
                        {{ image.description }}
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>

              <!-- Actions -->
              <v-card-actions v-if="canEditBlog" class="blog-actions">
                <v-spacer />
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-pencil"
                  @click="editBlog"
                  class="action-btn"
                >
                  Uredi Blog
                </v-btn>
                <v-btn
                  color="error"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  @click="confirmDelete"
                  class="action-btn"
                >
                  Obriši Blog
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Sidebar -->
          <v-col cols="12" lg="4">
            <!-- Author Info Card -->
            <v-card class="sidebar-card author-card" elevation="0">
              <v-card-title class="card-title">
                <v-icon class="mr-2" color="primary">mdi-account</v-icon>
                O autoru
              </v-card-title>
              <v-card-text class="author-info">
                <div class="author-profile">
                  <v-avatar size="64" class="author-main-avatar">
                    <span class="text-h5">
                      {{ blog.author?.username?.charAt(0)?.toUpperCase() || 'A' }}
                    </span>
                  </v-avatar>
                  <div class="author-meta">
                    <div class="author-main-name">{{ blog.author?.username || 'Nepoznat autor' }}</div>
                    <div class="author-main-role">
                      {{ blog.author?.role === 'vodic' ? 'Vodič' : 'Turista' }}
                    </div>
                  </div>
                </div>
                
                <div class="author-actions">
                  <v-btn
                    v-if="blog.author?.userId"
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="viewAuthorBlogs"
                    prepend-icon="mdi-book-open-page-variant"
                    class="author-action-btn"
                  >
                    Više blogova
                  </v-btn>
                  <FollowButton
                    v-if="blog.author?.userId && blog.author.userId !== userStore.user?.id"
                    :user-id="blog.author.userId"
                    :username="blog.author.username"
                    @follow-changed="onFollowChanged"
                  />
                </div>
              </v-card-text>
            </v-card>

            <!-- Related Blogs -->
            <v-card v-if="relatedBlogs.length > 0" class="sidebar-card related-card" elevation="0">
              <v-card-title class="card-title">
                <v-icon class="mr-2" color="primary">mdi-bookmark-multiple</v-icon>
                Slični blogovi
              </v-card-title>
              <v-card-text class="related-content">
                <div v-for="relatedBlog in relatedBlogs" :key="relatedBlog._id" class="related-blog-item">
                  <v-card
                    class="related-blog-card"
                    @click="$router.push(`/blogs/${relatedBlog._id}`)"
                  >
                    <v-card-text class="related-blog-content">
                      <div class="related-blog-title">{{ relatedBlog.title }}</div>
                      <div class="related-blog-description">
                        {{ truncateText(relatedBlog.description, 80) }}
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Comments Section -->
        <v-row class="comments-section">
          <v-col cols="12" lg="8">
            <BlogComments :blog-id="blog._id" />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Image Viewer Dialog -->
    <v-dialog v-model="imageDialog" max-width="900" class="image-dialog">
      <v-card v-if="selectedImage" class="image-viewer-card">
        <v-img 
          :src="selectedImage.url" 
          :alt="selectedImage.description"
          max-height="70vh"
          contain
        />
        <v-card-text v-if="selectedImage.description" class="image-viewer-description">
          {{ selectedImage.description }}
        </v-card-text>
        <v-card-actions class="image-viewer-actions">
          <v-spacer />
          <v-btn color="primary" @click="imageDialog = false" class="close-btn">
            Zatvori
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="480" class="delete-dialog">
      <v-card class="delete-card">
        <v-card-title class="delete-title">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Potvrdi brisanje
        </v-card-title>
        <v-card-text class="delete-message">
          Da li ste sigurni da želite da obrišete ovaj blog? Ova akcija se ne može poništiti.
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import blogAPI from '../api/blogs'
import FollowButton from '../components/FollowButton.vue'
import BlogComments from '../components/BlogComments.vue'

const route = useRoute()
const router = useRouter()
const userStore = useAuthStore()

// Reactive data
const blog = ref(null)
const loading = ref(false)
const error = ref('')
const relatedBlogs = ref([])
const imageDialog = ref(false)
const selectedImage = ref(null)
const deleteDialog = ref(false)
const deleteLoading = ref(false)

// Computed
const canEditBlog = computed(() => {
  return userStore.isAuthenticated && 
         userStore.user && 
         blog.value?.author?.userId === userStore.user.id
})

const formattedDescription = computed(() => {
  if (!blog.value?.description) return []
  return blog.value.description.split('\n').filter(p => p.trim())
})

// Methods
const loadBlog = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const blogId = route.params.id
    const result = await blogAPI.getBlogById(blogId)
    
    if (result.success) {
      blog.value = result.data
      await loadRelatedBlogs()
    } else {
      error.value = result.error || 'Blog nije pronađen'
    }
  } catch (err) {
    error.value = 'Greška pri učitavanju bloga'
    console.error('Error loading blog:', err)
  } finally {
    loading.value = false
  }
}

const loadRelatedBlogs = async () => {
  if (!blog.value?.tags?.length) return
  
  try {
    // Search for blogs with similar tags
    const searchTerm = blog.value.tags[0] // Use first tag for related blogs
    const result = await blogAPI.searchBlogs(searchTerm, 1, 5)
    
    if (result.success) {
      // Filter out current blog and limit to 3 results
      relatedBlogs.value = result.data.blogs
        .filter(b => b._id !== blog.value._id)
        .slice(0, 3)
    }
  } catch (error) {
    console.error('Error loading related blogs:', error)
  }
}

const searchByTag = (tag) => {
  router.push({ path: '/blogs', query: { search: tag } })
}

const viewAuthorBlogs = () => {
  router.push(`/blogs/author/${blog.value.author.userId}`)
}

const editBlog = () => {
  router.push(`/blogs/${blog.value._id}/edit`)
}

const confirmDelete = () => {
  deleteDialog.value = true
}

const deleteBlog = async () => {
  deleteLoading.value = true
  
  try {
    const result = await blogAPI.deleteBlog(blog.value._id)
    
    if (result.success) {
      router.push('/blogs')
    } else {
      error.value = result.error || 'Greška pri brisanju bloga'
    }
  } catch (err) {
    error.value = 'Greška pri brisanju bloga'
    console.error('Error deleting blog:', err)
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
  }
}

const openImageViewer = (image) => {
  selectedImage.value = image
  imageDialog.value = true
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const onFollowChanged = () => {
  // This method can be used to update UI when follow status changes
  console.log('Follow status changed')
}

// Lifecycle
onMounted(() => {
  loadBlog()
})
</script>

<style scoped>
.blog-detail-view {
  overflow-x: hidden;
}

/* Loading and Error States */
.loading-section, .error-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  max-width: 400px;
}

.error-title {
  color: var(--warm-brown);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.error-message {
  color: rgba(28, 25, 23, 0.7);
  margin-bottom: 0;
}

.back-to-blogs-btn {
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

/* Hero Section */
.blog-hero-section {
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
}

.hero-navigation {
  margin-bottom: 24px;
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
  max-width: 900px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin-bottom: 32px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hero-author {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.author-avatar {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  margin-right: 16px;
  
  span {
    color: white !important;
    font-weight: 700;
  }
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.author-role {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tag {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25) !important;
  }
}

/* Main Content */
.content-container {
  margin-top: -40px;
  position: relative;
  z-index: 2;
}

.main-content-card, .sidebar-card {
  border-radius: var(--border-radius-xl) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  box-shadow: var(--warm-shadow-lg) !important;
  margin-bottom: 24px;
}

.blog-text-content {
  padding: 40px !important;
}

.blog-content {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--warm-brown);
}

.content-paragraph {
  margin-bottom: 24px;
  text-align: justify;
  text-indent: 2em;
  
  &:first-child {
    text-indent: 0;
    font-size: 1.2rem;
    font-weight: 500;
    color: rgba(28, 25, 23, 0.9);
  }
}

/* Images Section */
.images-section {
  padding: 0 40px 40px !important;
}

.images-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 24px;
  border-bottom: 2px solid var(--light-orange);
  padding-bottom: 12px;
}

.images-grid {
  margin-top: 8px;
}

.image-card {
  border-radius: var(--border-radius-md) !important;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--warm-shadow-lg) !important;
    
    .image-overlay {
      opacity: 1;
    }
  }
}

.image-preview {
  position: relative;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-description {
  font-size: 0.9rem;
  color: rgba(28, 25, 23, 0.8);
  background: rgba(245, 158, 11, 0.05);
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

/* Blog Actions */
.blog-actions {
  padding: 24px 40px 40px !important;
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

.action-btn {
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  margin-left: 12px !important;
  
  &.v-btn--variant-outlined {
    border-width: 2px !important;
  }
}

/* Sidebar */
.sidebar-card {
  margin-bottom: 24px;
}

.card-title {
  background: rgba(245, 158, 11, 0.05);
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
  font-weight: 700;
  color: var(--warm-brown);
}

/* Author Card */
.author-info {
  padding: 24px !important;
}

.author-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.author-main-avatar {
  background: var(--light-orange) !important;
  border: 2px solid rgba(212, 115, 10, 0.3) !important;
  margin-right: 16px;
  
  span {
    color: var(--warm-brown) !important;
    font-weight: 700;
  }
}

.author-meta {
  flex: 1;
}

.author-main-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 4px;
}

.author-main-role {
  font-size: 0.9rem;
  color: rgba(28, 25, 23, 0.7);
}

.author-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.author-action-btn {
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  width: 100%;
}

/* Related Blogs */
.related-content {
  padding: 24px !important;
}

.related-blog-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.related-blog-card {
  border-radius: var(--border-radius-md) !important;
  cursor: pointer;
  transition: all 0.3s ease !important;
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
  
  &:hover {
    background: rgba(245, 158, 11, 0.05) !important;
    box-shadow: var(--warm-shadow-md) !important;
  }
}

.related-blog-content {
  padding: 16px !important;
}

.related-blog-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--warm-brown);
  margin-bottom: 8px;
  line-height: 1.3;
}

.related-blog-description {
  font-size: 0.85rem;
  color: rgba(28, 25, 23, 0.7);
  line-height: 1.4;
}

/* Comments Section */
.comments-section {
  margin-top: 40px;
}

/* Dialogs */
.image-dialog :deep(.v-overlay__content) {
  border-radius: var(--border-radius-lg) !important;
}

.image-viewer-card {
  border-radius: var(--border-radius-lg) !important;
}

.image-viewer-description {
  padding: 20px !important;
  font-size: 1rem;
  color: var(--warm-brown);
  text-align: center;
}

.image-viewer-actions {
  padding: 16px 24px 24px !important;
}

.close-btn {
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

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

/* Responsive Design */
@media (max-width: 960px) {
  .blog-hero-section {
    padding: 40px 0 60px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .main-content-card {
    margin: -20px 16px 24px;
  }
  
  .blog-text-content, .images-section {
    padding: 24px !important;
  }
  
  .blog-actions {
    padding: 16px 24px 24px !important;
    flex-direction: column;
    
    .action-btn {
      width: 100%;
      margin-left: 0 !important;
      margin-top: 8px;
      
      &:first-child {
        margin-top: 0;
      }
    }
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.6rem;
  }
  
  .hero-author {
    flex-direction: column;
    align-items: flex-start;
    
    .author-avatar {
      margin-right: 0;
      margin-bottom: 12px;
    }
  }
  
  .blog-content {
    font-size: 1.05rem;
  }
  
  .content-paragraph {
    text-indent: 0;
    margin-bottom: 20px;
  }
  
  .author-profile {
    flex-direction: column;
    text-align: center;
    
    .author-main-avatar {
      margin-right: 0;
      margin-bottom: 12px;
    }
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