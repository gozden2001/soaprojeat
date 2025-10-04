<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12" lg="8" class="mx-auto">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              @click="$router.push('/blogs')"
              class="mr-2"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h2>{{ isEditing ? 'Uredi Blog' : 'Novi Blog' }}</h2>
          </v-card-title>

          <v-card-text>
            <v-form ref="formRef" v-model="formValid" @submit.prevent="submitBlog">
              <!-- Blog Title -->
              <v-text-field
                v-model="blogForm.title"
                label="Naslov bloga *"
                variant="outlined"
                :rules="titleRules"
                :error-messages="errors.title"
                prepend-inner-icon="mdi-format-title"
                counter="200"
                class="mb-4"
              />

              <!-- Blog Description -->
              <v-textarea
                v-model="blogForm.description"
                label="Sadržaj bloga *"
                variant="outlined"
                :rules="descriptionRules"
                :error-messages="errors.description"
                prepend-inner-icon="mdi-text"
                counter="2000"
                rows="8"
                class="mb-4"
                hint="Opišite svoje iskustvo, lokacije koje ste posetili, preporuke za druge turiste..."
              />

              <!-- Tags Input -->
              <v-combobox
                v-model="blogForm.tags"
                label="Tagovi"
                variant="outlined"
                multiple
                chips
                clearable
                prepend-inner-icon="mdi-tag-multiple"
                hint="Dodajte tagove koji opisuju vaš blog (npr: turizam, priroda, kultura)"
                class="mb-4"
                :rules="tagsRules"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip
                    v-bind="props"
                    :text="item"
                    closable
                    @click:close="removeTag(item)"
                  />
                </template>
              </v-combobox>

              <!-- Images Section -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-h6">
                  <v-icon class="mr-2">mdi-image-multiple</v-icon>
                  Slike (opciono)
                </v-card-title>
                
                <v-card-text>
                  <!-- Add Image URL -->
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-text-field
                        v-model="newImageUrl"
                        label="URL slike"
                        variant="outlined"
                        prepend-inner-icon="mdi-link"
                        hint="Dodajte URL slike (npr. sa Imgur, Google Photos, itd.)"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="newImageDescription"
                        label="Opis slike"
                        variant="outlined"
                        hint="Kratki opis slike"
                      />
                    </v-col>
                  </v-row>
                  
                  <v-btn
                    @click="addImage"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-plus"
                    :disabled="!newImageUrl"
                    class="mb-4"
                  >
                    Dodaj Sliku
                  </v-btn>

                  <!-- Images Preview -->
                  <div v-if="blogForm.images.length > 0">
                    <h4 class="mb-3">Dodane slike:</h4>
                    <v-row>
                      <v-col
                        v-for="(image, index) in blogForm.images"
                        :key="index"
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-card>
                          <v-img
                            :src="image.url"
                            height="150"
                            cover
                          >
                            <template v-slot:placeholder>
                              <v-row class="fill-height ma-0" align="center" justify="center">
                                <v-progress-circular indeterminate color="grey-lighten-5" />
                              </v-row>
                            </template>
                            
                            <v-btn
                              icon
                              size="small"
                              color="error"
                              class="ma-2"
                              style="position: absolute; top: 0; right: 0;"
                              @click="removeImage(index)"
                            >
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-img>
                          
                          <v-card-text v-if="image.description" class="text-caption pa-2">
                            {{ image.description }}
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Form Actions -->
              <div class="d-flex justify-end gap-2">
                <v-btn
                  @click="$router.push('/blogs')"
                  variant="outlined"
                >
                  Otkaži
                </v-btn>
                
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="submitting"
                  :disabled="!formValid"
                >
                  {{ isEditing ? 'Sačuvaj Izmene' : 'Objavi Blog' }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Zatvori
        </v-btn>
      </template>
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

// Check authentication
if (!userStore.isAuthenticated) {
  router.push('/login')
}

// Reactive data
const formRef = ref(null)
const formValid = ref(false)
const submitting = ref(false)
const loading = ref(false)
const isEditing = computed(() => !!route.params.id)

const blogForm = ref({
  title: '',
  description: '',
  tags: [],
  images: []
})

const newImageUrl = ref('')
const newImageDescription = ref('')

const errors = ref({
  title: [],
  description: [],
  tags: []
})

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Validation rules
const titleRules = [
  v => !!v || 'Naslov je obavezan',
  v => (v && v.length >= 3) || 'Naslov mora imati najmanje 3 karaktera',
  v => (v && v.length <= 200) || 'Naslov ne može imati više od 200 karaktera'
]

const descriptionRules = [
  v => !!v || 'Sadržaj je obavezan',
  v => (v && v.length >= 10) || 'Sadržaj mora imati najmanje 10 karaktera',
  v => (v && v.length <= 2000) || 'Sadržaj ne može imati više od 2000 karaktera'
]

const tagsRules = [
  v => !v || v.length <= 20 || 'Maksimalno 20 tagova',
  v => !v || v.every(tag => tag.length <= 50) || 'Tag ne može imati više od 50 karaktera'
]

// Methods
const loadBlogForEdit = async () => {
  if (!isEditing.value) return
  
  loading.value = true
  try {
    const result = await blogAPI.getBlogById(route.params.id)
    
    if (result.success) {
      const blog = result.data
      
      // Check if user can edit this blog
      if (blog.author.userId !== userStore.user.id) {
        showSnackbar('Nemate dozvolu za uređivanje ovog bloga', 'error')
        router.push('/blogs')
        return
      }
      
      blogForm.value = {
        title: blog.title,
        description: blog.description,
        tags: [...blog.tags],
        images: [...blog.images]
      }
    } else {
      showSnackbar('Blog nije pronađen', 'error')
      router.push('/blogs')
    }
  } catch (error) {
    showSnackbar('Greška pri učitavanju bloga', 'error')
    console.error('Error loading blog:', error)
  } finally {
    loading.value = false
  }
}

const addImage = () => {
  if (!newImageUrl.value) return
  
  // Basic URL validation
  try {
    new URL(newImageUrl.value)
  } catch {
    showSnackbar('Neispravna URL adresa slike', 'error')
    return
  }
  
  blogForm.value.images.push({
    url: newImageUrl.value,
    description: newImageDescription.value || ''
  })
  
  newImageUrl.value = ''
  newImageDescription.value = ''
}

const removeImage = (index) => {
  blogForm.value.images.splice(index, 1)
}

const removeTag = (tag) => {
  const index = blogForm.value.tags.indexOf(tag)
  if (index > -1) {
    blogForm.value.tags.splice(index, 1)
  }
}

const submitBlog = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  if (!valid) return
  
  submitting.value = true
  errors.value = { title: [], description: [], tags: [] }
  
  try {
    const blogData = {
      title: blogForm.value.title.trim(),
      description: blogForm.value.description.trim(),
      tags: blogForm.value.tags.filter(tag => tag.trim()),
      images: blogForm.value.images
    }
    
    let result
    if (isEditing.value) {
      result = await blogAPI.updateBlog(route.params.id, blogData)
    } else {
      result = await blogAPI.createBlog(blogData)
    }
    
    if (result.success) {
      showSnackbar(
        isEditing.value ? 'Blog je uspešno ažuriran!' : 'Blog je uspešno kreiran!',
        'success'
      )
      
      // Navigate to the blog detail page
      const blogId = isEditing.value ? route.params.id : result.data.blog._id
      setTimeout(() => {
        router.push(`/blogs/${blogId}`)
      }, 1500)
    } else {
      // Handle validation errors
      if (result.error.includes('Validation')) {
        showSnackbar('Molimo proverite unete podatke', 'error')
      } else {
        showSnackbar(result.error, 'error')
      }
    }
  } catch (error) {
    console.error('Error submitting blog:', error)
    showSnackbar('Greška pri čuvanju bloga', 'error')
  } finally {
    submitting.value = false
  }
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
  if (isEditing.value) {
    loadBlogForEdit()
  }
})
</script>

<style scoped>
.gap-2 > * + * {
  margin-left: 8px;
}
</style>