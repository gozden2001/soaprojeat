<template>
  <div class="blog-create-view">
    <!-- Header Section -->
    <section class="create-header-section">
      <v-container>
        <div class="header-content animate-fade-in">
          <div class="header-navigation">
            <v-btn
              icon
              variant="text"
              class="back-btn"
              @click="$router.push('/blogs')"
            >
              <v-icon color="white">mdi-arrow-left</v-icon>
            </v-btn>
          </div>
          
          <div class="header-info">
            <div class="header-icon">
              <v-icon size="48" color="white">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
            </div>
            <h1 class="header-title font-heading">{{ isEditing ? 'Uredi Blog' : 'Novi Blog' }}</h1>
            <p class="header-subtitle">
              {{ isEditing ? 'Uredite svoj blog post' : 'Podelite svoje putničko iskustvo sa svetom' }}
            </p>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="pa-6">
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <v-card class="create-card" elevation="0">
            <v-card-text class="pa-8">
              <v-form ref="formRef" v-model="formValid" @submit.prevent="submitBlog">
                <!-- Blog Title -->
                <div class="form-section">
                  <h3 class="section-title">Naslov Bloga</h3>
                  <v-text-field
                    v-model="blogForm.title"
                    label="Naslov bloga *"
                    variant="outlined"
                    :rules="titleRules"
                    :error-messages="errors.title"
                    prepend-inner-icon="mdi-format-title"
                    counter="200"
                    class="form-field"
                    hint="Unesite privlačan naslov koji opisuje vaše iskustvo"
                  />
                </div>

                <!-- Blog Description -->
                <div class="form-section">
                  <h3 class="section-title">Sadržaj Bloga</h3>
                  <v-textarea
                    v-model="blogForm.description"
                    label="Sadržaj bloga *"
                    variant="outlined"
                    :rules="descriptionRules"
                    :error-messages="errors.description"
                    prepend-inner-icon="mdi-text"
                    counter="2000"
                    rows="8"
                    class="form-field"
                    hint="Opišite svoje iskustvo, lokacije koje ste posetili, preporuke za druge turiste..."
                  />
                </div>

                <!-- Tags Input -->
                <div class="form-section">
                  <h3 class="section-title">Tagovi</h3>
                  <v-combobox
                    v-model="blogForm.tags"
                    label="Tagovi"
                    variant="outlined"
                    multiple
                    chips
                    clearable
                    prepend-inner-icon="mdi-tag-multiple"
                    hint="Dodajte tagove koji opisuju vaš blog (npr: turizam, priroda, kultura)"
                    class="form-field"
                    :rules="tagsRules"
                  >
                    <template v-slot:chip="{ props, item }">
                      <v-chip
                        v-bind="props"
                        :text="item"
                        closable
                        class="blog-tag-chip"
                        @click:close="removeTag(item)"
                      />
                    </template>
                  </v-combobox>
                </div>

                <!-- Images Section -->
                <div class="form-section">
                  <v-card class="images-section" variant="outlined">
                    <v-card-title class="images-header">
                      <div class="images-title">
                        <v-icon class="mr-3" color="primary">mdi-image-multiple</v-icon>
                        <span class="section-title">Slike (opciono)</span>
                      </div>
                    </v-card-title>
                    
                    <v-card-text class="pa-6">
                      <!-- Add Image URL -->
                      <v-row>
                        <v-col cols="12" md="8">
                          <v-text-field
                            v-model="newImageUrl"
                            label="URL slike"
                            variant="outlined"
                            prepend-inner-icon="mdi-link"
                            hint="Dodajte URL slike (npr. sa Imgur, Google Photos, itd.)"
                            class="form-field"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="newImageDescription"
                            label="Opis slike"
                            variant="outlined"
                            hint="Kratki opis slike"
                            class="form-field"
                          />
                        </v-col>
                      </v-row>
                      
                      <v-btn
                        @click="addImage"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-plus"
                        :disabled="!newImageUrl"
                        class="add-image-btn mb-6"
                      >
                        Dodaj Sliku
                      </v-btn>

                      <!-- Images Preview -->
                      <div v-if="blogForm.images.length > 0" class="images-preview">
                        <h4 class="preview-title mb-4">Dodane slike:</h4>
                        <v-row>
                          <v-col
                            v-for="(image, index) in blogForm.images"
                            :key="index"
                            cols="12"
                            sm="6"
                            md="4"
                          >
                            <v-card class="image-preview-card">
                              <v-img
                                :src="image.url"
                                height="180"
                                cover
                                class="image-preview"
                              >
                                <template v-slot:placeholder>
                                  <v-row class="fill-height ma-0" align="center" justify="center">
                                    <v-progress-circular indeterminate color="primary" />
                                  </v-row>
                                </template>
                                
                                <v-btn
                                  icon
                                  size="small"
                                  color="error"
                                  class="remove-image-btn"
                                  @click="removeImage(index)"
                                >
                                  <v-icon>mdi-close</v-icon>
                                </v-btn>
                              </v-img>
                              
                              <v-card-text v-if="image.description" class="image-description">
                                {{ image.description }}
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                  <v-btn
                    @click="$router.push('/blogs')"
                    variant="outlined"
                    size="large"
                    class="cancel-btn"
                    prepend-icon="mdi-close"
                  >
                    Otkaži
                  </v-btn>
                  
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    :loading="submitting"
                    :disabled="!formValid"
                    class="submit-btn"
                    :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-send'"
                  >
                    {{ isEditing ? 'Sačuvaj Izmene' : 'Objavi Blog' }}
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

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
.blog-create-view {
  overflow-x: hidden;
}

/* Header Section */
.create-header-section {
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

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.header-navigation {
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

.header-info {
  padding-top: 20px;
}

.header-icon {
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

.header-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Main Card */
.create-card {
  margin-top: -40px;
  position: relative;
  z-index: 2;
  border-radius: var(--border-radius-xl) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(245, 158, 11, 0.1) !important;
  box-shadow: var(--warm-shadow-lg) !important;
}

/* Form Sections */
.form-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}

.form-field {
  :deep(.v-field) {
    border-radius: var(--border-radius-md) !important;
    box-shadow: 0 2px 8px rgba(212, 115, 10, 0.08) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(212, 115, 10, 0.12) !important;
    }
  }
  
  :deep(.v-field--focused) {
    box-shadow: 0 4px 20px rgba(212, 115, 10, 0.2) !important;
  }
  
  :deep(.v-field__prepend-inner) {
    .v-icon {
      color: var(--warm-orange) !important;
      opacity: 0.8;
    }
  }
}

.blog-tag-chip {
  background: var(--light-orange) !important;
  color: var(--warm-brown) !important;
  border: 1px solid rgba(212, 115, 10, 0.3) !important;
  font-weight: 500 !important;
  
  :deep(.v-chip__close) {
    color: var(--warm-brown) !important;
  }
}

/* Images Section */
.images-section {
  border-radius: var(--border-radius-lg) !important;
  border-color: rgba(212, 115, 10, 0.2) !important;
  background: rgba(245, 158, 11, 0.02) !important;
}

.images-header {
  background: rgba(245, 158, 11, 0.05);
  border-bottom: 1px solid rgba(212, 115, 10, 0.1);
}

.images-title {
  display: flex;
  align-items: center;
}

.add-image-btn {
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.3px !important;
}

.images-preview {
  margin-top: 24px;
}

.preview-title {
  color: var(--warm-brown);
  font-weight: 700;
}

.image-preview-card {
  border-radius: var(--border-radius-md) !important;
  overflow: hidden;
  transition: all 0.3s ease !important;
  
  &:hover {
    box-shadow: var(--warm-shadow-md) !important;
  }
}

.image-preview {
  position: relative;
}

.remove-image-btn {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.image-description {
  font-size: 0.85rem;
  color: rgba(28, 25, 23, 0.8);
  padding: 12px !important;
  background: rgba(245, 158, 11, 0.05);
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(245, 158, 11, 0.1);
}

.cancel-btn, .submit-btn {
  border-radius: var(--border-radius-md) !important;
  height: 56px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  padding: 0 32px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.cancel-btn {
  border-color: rgba(212, 115, 10, 0.4) !important;
  color: var(--warm-brown) !important;
  
  &:hover {
    background: rgba(212, 115, 10, 0.05) !important;
    border-color: var(--warm-orange) !important;
  }
}

.submit-btn {
  box-shadow: 0 4px 16px rgba(212, 115, 10, 0.25) !important;
  
  &:hover:not(:disabled) {
    box-shadow: 0 8px 24px rgba(212, 115, 10, 0.35) !important;
  }
  
  &:disabled {
    opacity: 0.6 !important;
    box-shadow: 0 2px 8px rgba(212, 115, 10, 0.1) !important;
  }
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
  .create-header-section {
    padding: 40px 0 60px;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .create-card {
    margin: -20px 16px 0;
  }
  
  .form-actions {
    flex-direction: column;
    
    .cancel-btn, .submit-btn {
      width: 100%;
    }
  }
}

@media (max-width: 600px) {
  .header-icon {
    width: 64px;
    height: 64px;
    
    .v-icon {
      font-size: 36px !important;
    }
  }
  
  .header-title {
    font-size: 1.6rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  :deep(.v-card-text) {
    padding: 24px !important;
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