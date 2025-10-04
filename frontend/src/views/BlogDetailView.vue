<template>
  <v-container class="pa-6">
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4">Učitava se blog...</p>
    </div>

    <div v-else-if="error" class="text-center pa-12">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <h3 class="mt-4">Greška</h3>
      <p class="text-medium-emphasis">{{ error }}</p>
      <v-btn color="primary" @click="$router.push('/blogs')" class="mt-4">
        Nazad na blogove
      </v-btn>
    </div>

    <div v-else-if="blog">
      <!-- Navigation -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="$router.push('/blogs')"
          >
            Nazad na blogove
          </v-btn>
        </v-col>
      </v-row>

      <!-- Blog Content -->
      <v-row>
        <v-col cols="12" lg="8">
          <v-card>
            <!-- Blog Header -->
            <v-card-title class="text-h4 text-wrap pa-6">
              {{ blog.title }}
            </v-card-title>

            <!-- Author and Date Info -->
            <v-card-subtitle class="px-6 pb-4">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-avatar size="40" color="primary" class="mr-3">
                    <span class="text-h6">
                      {{ blog.author?.username?.charAt(0)?.toUpperCase() || 'A' }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1">{{ blog.author?.username || 'Nepoznat autor' }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ blog.author?.role === 'vodic' ? 'Vodič' : 'Turista' }}
                    </div>
                  </div>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ formatDate(blog.createdAt) }}
                </div>
              </div>
            </v-card-subtitle>

            <!-- Tags -->
            <v-card-text v-if="blog.tags?.length > 0" class="pt-0 px-6">
              <v-chip-group>
                <v-chip
                  v-for="tag in blog.tags"
                  :key="tag"
                  size="small"
                  variant="outlined"
                  @click="searchByTag(tag)"
                >
                  {{ tag }}
                </v-chip>
              </v-chip-group>
            </v-card-text>

            <!-- Blog Content -->
            <v-card-text class="px-6 pb-6">
              <div class="blog-content">
                <p v-for="(paragraph, index) in formattedDescription" :key="index" class="mb-4">
                  {{ paragraph }}
                </p>
              </div>
            </v-card-text>

            <!-- Images -->
            <v-card-text v-if="blog.images?.length > 0" class="px-6">
              <h3 class="mb-4">Slike</h3>
              <v-row>
                <v-col
                  v-for="(image, index) in blog.images"
                  :key="index"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card>
                    <v-img
                      :src="image.url"
                      :alt="image.description || 'Blog slika'"
                      height="200"
                      cover
                      @click="openImageViewer(image)"
                      style="cursor: pointer;"
                    >
                      <template v-slot:placeholder>
                        <v-row class="fill-height ma-0" align="center" justify="center">
                          <v-progress-circular indeterminate color="grey-lighten-5" />
                        </v-row>
                      </template>
                    </v-img>
                    <v-card-text v-if="image.description" class="text-caption">
                      {{ image.description }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Actions -->
            <v-card-actions v-if="canEditBlog" class="px-6 pb-6">
              <v-spacer />
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
                @click="editBlog"
              >
                Uredi Blog
              </v-btn>
              <v-btn
                color="error"
                variant="outlined"
                prepend-icon="mdi-delete"
                @click="confirmDelete"
              >
                Obriši Blog
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" lg="4">
          <!-- Author Info -->
          <v-card class="mb-4">
            <v-card-title>O autoru</v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar size="48" color="primary" class="mr-3">
                  <span class="text-h6">
                    {{ blog.author?.username?.charAt(0)?.toUpperCase() || 'A' }}
                  </span>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1">{{ blog.author?.username || 'Nepoznat autor' }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ blog.author?.role === 'vodic' ? 'Vodič' : 'Turista' }}
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  v-if="blog.author?.userId"
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="viewAuthorBlogs"
                >
                  Više blogova autora
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
          <v-card v-if="relatedBlogs.length > 0">
            <v-card-title>Slični blogovi</v-card-title>
            <v-card-text>
              <div v-for="relatedBlog in relatedBlogs" :key="relatedBlog._id" class="mb-3">
                <v-card
                  variant="outlined"
                  hover
                  @click="$router.push(`/blogs/${relatedBlog._id}`)"
                  style="cursor: pointer;"
                >
                  <v-card-text class="pa-3">
                    <div class="text-subtitle-2 mb-1">{{ relatedBlog.title }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ truncateText(relatedBlog.description, 80) }}
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Blog Comments Section -->
      <v-row class="mt-6">
        <v-col cols="12" lg="8">
          <BlogComments :blog-id="blog._id" />
        </v-col>
      </v-row>
    </div>

    <!-- Image Viewer Dialog -->
    <v-dialog v-model="imageDialog" max-width="800">
      <v-card v-if="selectedImage">
        <v-img :src="selectedImage.url" :alt="selectedImage.description" />
        <v-card-text v-if="selectedImage.description">
          {{ selectedImage.description }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="imageDialog = false">Zatvori</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Potvrdi brisanje</v-card-title>
        <v-card-text>
          Da li ste sigurni da želite da obrišete ovaj blog? Ova akcija se ne može poništiti.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Otkaži</v-btn>
          <v-btn color="error" @click="deleteBlog" :loading="deleteLoading">Obriši</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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
.blog-content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface));
}

.blog-content p {
  margin-bottom: 1rem;
  text-align: justify;
}
</style>