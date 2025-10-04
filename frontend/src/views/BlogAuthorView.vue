<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <v-card class="mb-6">
          <v-card-title class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              @click="$router.push('/blogs')"
              class="mr-2"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div>
              <h2>Blogovi autora</h2>
              <div v-if="authorInfo" class="text-subtitle-1 text-medium-emphasis">
                {{ authorInfo.username }} ({{ authorInfo.role === 'vodic' ? 'Vodič' : 'Turista' }})
              </div>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4">Učitavaju se blogovi...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center pa-12">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <h3 class="mt-4">Greška</h3>
      <p class="text-medium-emphasis">{{ error }}</p>
    </div>

    <!-- No Blogs State -->
    <div v-else-if="blogs.length === 0" class="text-center pa-12">
      <v-icon size="64" color="grey">mdi-post-outline</v-icon>
      <h3 class="mt-4">Nema blogova</h3>
      <p class="text-medium-emphasis">Ovaj autor još uvek nije napisao nijedan blog.</p>
    </div>

    <!-- Blogs Grid -->
    <v-row v-else>
      <v-col
        v-for="blog in blogs"
        :key="blog._id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card 
          class="blog-card h-100"
          hover
          @click="$router.push(`/blogs/${blog._id}`)"
          style="cursor: pointer;"
        >
          <!-- Blog Images Preview -->
          <v-img
            v-if="blog.images && blog.images.length > 0"
            :src="blog.images[0].url"
            height="200"
            cover
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey-lighten-5" />
              </v-row>
            </template>
          </v-img>
          
          <v-card-title class="text-wrap">
            {{ blog.title }}
          </v-card-title>
          
          <v-card-text>
            <p class="blog-description mb-3">
              {{ truncateText(blog.description, 120) }}
            </p>
            
            <!-- Tags -->
            <div v-if="blog.tags && blog.tags.length > 0">
              <v-chip
                v-for="tag in blog.tags.slice(0, 3)"
                :key="tag"
                size="x-small"
                class="mr-1 mb-1"
                variant="outlined"
              >
                {{ tag }}
              </v-chip>
              <v-chip
                v-if="blog.tags.length > 3"
                size="x-small"
                variant="text"
              >
                +{{ blog.tags.length - 3 }}
              </v-chip>
            </div>
          </v-card-text>

          <v-card-actions class="justify-space-between">
            <div class="text-caption text-medium-emphasis">
              {{ formatDate(blog.createdAt) }}
            </div>
            
            <!-- Edit/Delete actions if it's user's own blog -->
            <div v-if="canEditBlog(blog)" class="d-flex gap-1">
              <v-btn
                icon
                size="small"
                variant="text"
                @click.stop="editBlog(blog._id)"
              >
                <v-icon size="18">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                color="error"
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
    <v-row v-if="pagination.totalPages > 1">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          @update:model-value="changePage"
        />
      </v-col>
    </v-row>

    <!-- Blog Stats -->
    <v-row v-if="pagination.totalBlogs > 0" class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center">
            <h3>{{ pagination.totalBlogs }}</h3>
            <p class="text-medium-emphasis">
              {{ pagination.totalBlogs === 1 ? 'blog ukupno' : 'blogova ukupno' }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Potvrdi brisanje</v-card-title>
        <v-card-text>
          Da li ste sigurni da želite da obrišete blog "{{ blogToDelete?.title }}"? 
          Ova akcija se ne može poništiti.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Otkaži</v-btn>
          <v-btn color="error" @click="deleteBlog" :loading="deleteLoading">Obriši</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
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
.blog-card {
  transition: all 0.3s ease;
}

.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.blog-description {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.5;
}

.gap-1 > * + * {
  margin-left: 4px;
}
</style>