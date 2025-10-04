<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-post</v-icon>
              <h2>Turistički Blogovi</h2>
            </div>
            <v-btn 
              v-if="userStore.isAuthenticated" 
              color="primary" 
              prepend-icon="mdi-plus"
              @click="$router.push('/blogs/create')"
            >
              Novi Blog
            </v-btn>
          </v-card-title>
          
          <!-- Search and Filter Section -->
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchTerm"
                  label="Pretražite blogove..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  clearable
                  @keyup.enter="searchBlogs"
                  @click:clear="clearSearch"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn 
                  color="primary" 
                  block 
                  @click="searchBlogs"
                  :loading="loading"
                >
                  Pretraži
                </v-btn>
              </v-col>
            </v-row>
            
            <!-- Popular Tags -->
            <div v-if="blogStats.popularTags?.length > 0" class="mt-4">
              <h4 class="mb-2">Popularni tagovi:</h4>
              <v-chip-group>
                <v-chip
                  v-for="tag in blogStats.popularTags"
                  :key="tag._id"
                  @click="filterByTag(tag._id)"
                  size="small"
                  variant="outlined"
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
    <v-row v-if="blogStats.totalBlogs > 0">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="primary">mdi-post-outline</v-icon>
            <h3 class="mt-2">{{ blogStats.totalBlogs }}</h3>
            <p class="text-medium-emphasis">Ukupno blogova</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="success">mdi-tag-multiple</v-icon>
            <h3 class="mt-2">{{ blogStats.popularTags?.length || 0 }}</h3>
            <p class="text-medium-emphasis">Aktivnih tagova</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-icon size="48" color="info">mdi-account-group</v-icon>
            <h3 class="mt-2">{{ blogStats.topAuthors?.length || 0 }}</h3>
            <p class="text-medium-emphasis">Aktivnih autora</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Blog List -->
    <v-row>
      <v-col cols="12">
        <div v-if="loading" class="text-center pa-6">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4">Učitavaju se blogovi...</p>
        </div>

        <div v-else-if="blogs.length === 0" class="text-center pa-6">
          <v-icon size="64" color="grey">mdi-post-outline</v-icon>
          <h3 class="mt-4">Nema blogova</h3>
          <p class="text-medium-emphasis">
            {{ searchTerm ? 'Nema rezultata pretrage.' : 'Budite prvi koji će napisati blog!' }}
          </p>
        </div>

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
              <v-card-title class="text-wrap">
                {{ blog.title }}
              </v-card-title>
              
              <v-card-text>
                <p class="blog-description">
                  {{ truncateText(blog.description, 150) }}
                </p>
                
                <!-- Tags -->
                <div v-if="blog.tags?.length > 0" class="mt-3">
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
                <div class="d-flex align-center">
                  <v-avatar size="24" color="primary">
                    <span class="text-caption">
                      {{ blog.author?.username?.charAt(0)?.toUpperCase() || 'A' }}
                    </span>
                  </v-avatar>
                  <span class="ml-2 text-caption">{{ blog.author?.username || 'Nepoznat autor' }}</span>
                </div>
                
                <div class="text-caption text-medium-emphasis">
                  {{ formatDate(blog.createdAt) }}
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
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
  </v-container>
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
</style>