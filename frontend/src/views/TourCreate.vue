<template>
  <div class="tour-create-view">
    <!-- Hero Section -->
    <section class="create-hero-section">
      <v-container>
        <div class="hero-content animate-fade-in">
          <div class="hero-info">
            <div class="hero-icon">
              <v-icon size="48" color="white">mdi-map-marker-plus</v-icon>
            </div>
            <h1 class="hero-title font-heading">Kreiranje nove ture</h1>
            <p class="hero-subtitle">
              Podelite svoje omiljeno mesto sa svetom i kreirajte nezaboravno putovanje
            </p>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="content-container">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-form ref="form" v-model="valid" @submit.prevent="createTour" class="tour-form">
            
            <!-- Basic Information Card -->
            <v-card class="form-card" elevation="0">
              <v-card-title class="card-title">
                <v-icon class="title-icon">mdi-information</v-icon>
                Osnovne informacije
              </v-card-title>
              <v-card-text class="card-content">
                <div class="form-grid">
                  <v-text-field
                    v-model="tourData.name"
                    label="Naziv ture"
                    :rules="nameRules"
                    prepend-inner-icon="mdi-map-marker"
                    variant="outlined"
                    class="form-field"
                    required
                  />

                  <v-textarea
                    v-model="tourData.description"
                    label="Opis ture"
                    :rules="descriptionRules"
                    prepend-inner-icon="mdi-text"
                    variant="outlined"
                    rows="4"
                    class="form-field"
                    required
                  />

                  <v-select
                    v-model="tourData.difficulty"
                    label="Težina ture"
                    :items="difficultyOptions"
                    :rules="difficultyRules"
                    prepend-inner-icon="mdi-trending-up"
                    variant="outlined"
                    class="form-field"
                    required
                  />

                  <v-text-field
                    v-model.number="tourData.estimatedDuration"
                    label="Procenjena dužina (minuti)"
                    type="number"
                    prepend-inner-icon="mdi-clock-outline"
                    variant="outlined"
                    class="form-field"
                    hint="Koliko minuta je potrebno za završetak ture"
                  />
                </div>
              </v-card-text>
            </v-card>

            <!-- Tags Card -->
            <v-card class="form-card" elevation="0">
              <v-card-title class="card-title">
                <v-icon class="title-icon">mdi-tag-multiple</v-icon>
                Tagovi i kategorije
              </v-card-title>
              <v-card-text class="card-content">
                <v-combobox
                  v-model="tourData.tags"
                  label="Tagovi"
                  multiple
                  chips
                  closable-chips
                  prepend-inner-icon="mdi-tag-multiple"
                  variant="outlined"
                  hint="Dodajte tagove koji opisuju vašu turu (maksimalno 10)"
                  :rules="tagsRules"
                  class="tags-field"
                >
                  <template v-slot:chip="{ props, item }">
                    <v-chip
                      v-bind="props"
                      :text="item.raw"
                      size="small"
                      color="primary"
                      class="tour-tag-chip"
                    />
                  </template>
                </v-combobox>
              </v-card-text>
            </v-card>

            <!-- Images Card -->
            <v-card class="form-card" elevation="0">
              <v-card-title class="card-title">
                <v-icon class="title-icon">mdi-image-multiple</v-icon>
                Slike ture
              </v-card-title>
              <v-card-text class="card-content">
                <v-text-field
                  v-model="newImageUrl"
                  label="URL slike"
                  prepend-inner-icon="mdi-image"
                  append-inner-icon="mdi-plus"
                  variant="outlined"
                  @click:append-inner="addImage"
                  @keyup.enter="addImage"
                  hint="Dodajte URL slike za vašu turu"
                  class="image-input"
                />

                <div v-if="tourData.images.length > 0" class="images-grid">
                  <v-card
                    v-for="(image, index) in tourData.images"
                    :key="index"
                    class="image-card"
                    elevation="0"
                  >
                    <v-img
                      :src="image"
                      height="180"
                      cover
                      class="image-preview"
                    >
                      <template v-slot:placeholder>
                        <div class="image-placeholder">
                          <v-progress-circular indeterminate color="primary" />
                        </div>
                      </template>
                    </v-img>
                    <v-card-actions class="image-actions">
                      <v-spacer />
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        variant="text"
                        @click="removeImage(index)"
                        class="delete-btn"
                      />
                    </v-card-actions>
                  </v-card>
                </div>

                <v-alert
                  v-if="tourData.images.length === 0"
                  type="info"
                  variant="tonal"
                  class="empty-images-alert"
                  prominent
                >
                  <template #title>
                    <v-icon start>mdi-information</v-icon>
                    Dodajte slike za vašu turu
                  </template>
                  <p class="alert-text">
                    Dodajte slike da učinite vašu turu privlačnijom za turiste
                  </p>
                </v-alert>
              </v-card-text>
            </v-card>

            <!-- Status Information Card -->
            <v-card class="form-card status-card" elevation="0">
              <v-card-title class="card-title">
                <v-icon class="title-icon">mdi-flag-outline</v-icon>
                Status ture
              </v-card-title>
              <v-card-text class="card-content">
                <v-alert 
                  type="info" 
                  variant="tonal" 
                  class="status-alert"
                  prominent
                >
                  <template #title>
                    <v-icon start>mdi-information</v-icon>
                    Informacije o statusu
                  </template>
                  <p class="alert-text">
                    Tura će biti kreirana sa statusom "Draft" i cenom 0.00€.
                    Možete je objaviti kasnije kada budete spremni.
                  </p>
                </v-alert>
              </v-card-text>
            </v-card>

            <!-- Actions Card -->
            <v-card class="actions-card" elevation="0">
              <v-card-text class="actions-content">
                <div class="actions-grid">
                  <v-btn
                    color="grey"
                    variant="outlined"
                    size="large"
                    prepend-icon="mdi-cancel"
                    @click="cancel"
                    class="action-btn cancel-btn"
                  >
                    Otkaži
                  </v-btn>
                  
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="large"
                    prepend-icon="mdi-content-save"
                    type="submit"
                    :loading="loading"
                    :disabled="!valid"
                    class="action-btn submit-btn"
                  >
                    Kreiraj turu
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-form>
        </v-col>
      </v-row>
    </v-container>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="5000"
      location="top"
      class="custom-snackbar"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
        >
          Zatvori
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import tourAPI from '../api/tours'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'TourCreate',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const valid = ref(false)
    const loading = ref(false)
    const newImageUrl = ref('')
    const showSnackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('success')

    const tourData = reactive({
      name: '',
      description: '',
      difficulty: '',
      tags: [],
      images: [],
      estimatedDuration: null
    })

    const difficultyOptions = [
      { title: 'Lako', value: 'easy' },
      { title: 'Srednje', value: 'medium' },
      { title: 'Teško', value: 'hard' }
    ]

    // Validation rules
    const nameRules = [
      v => !!v || 'Naziv ture je obavezan',
      v => (v && v.length >= 1) || 'Naziv mora imati najmanje 1 karakter',
      v => (v && v.length <= 200) || 'Naziv ne može imati više od 200 karaktera'
    ]

    const descriptionRules = [
      v => !!v || 'Opis ture je obavezan',
      v => (v && v.length >= 10) || 'Opis mora imati najmanje 10 karaktera',
      v => (v && v.length <= 5000) || 'Opis ne može imati više od 5000 karaktera'
    ]

    const difficultyRules = [
      v => !!v || 'Težina ture je obavezna'
    ]

    const tagsRules = [
      v => !v || v.length <= 10 || 'Maksimalno 10 tagova je dozvoljeno'
    ]

    // Methods
    const addImage = () => {
      if (newImageUrl.value && !tourData.images.includes(newImageUrl.value)) {
        if (tourData.images.length < 10) {
          tourData.images.push(newImageUrl.value)
          newImageUrl.value = ''
        } else {
          showSnackbar.value = true
          snackbarMessage.value = 'Maksimalno 10 slika je dozvoljeno'
          snackbarColor.value = 'error'
        }
      }
    }

    const removeImage = (index) => {
      tourData.images.splice(index, 1)
    }

    const createTour = async () => {
      if (!valid.value) return

      // Check if user is authenticated and has permission
      if (!authStore.isAuthenticated) {
        showSnackbar.value = true
        snackbarMessage.value = 'Morate biti prijavljeni da biste kreirali turu'
        snackbarColor.value = 'error'
        return
      }

      if (authStore.user.role !== 'vodic' && authStore.user.role !== 'administrator') {
        showSnackbar.value = true
        snackbarMessage.value = 'Samo vodiči mogu kreirati ture'
        snackbarColor.value = 'error'
        return
      }

      loading.value = true

      try {
        const result = await tourAPI.createTour({
          name: tourData.name,
          description: tourData.description,
          difficulty: tourData.difficulty,
          tags: tourData.tags,
          images: tourData.images,
          estimatedDuration: tourData.estimatedDuration
        })

        if (result.success) {
          showSnackbar.value = true
          snackbarMessage.value = 'Tura je uspešno kreirana!'
          snackbarColor.value = 'success'
          
          // Redirect to my tours after a short delay
          setTimeout(() => {
            router.push('/tours/my')
          }, 1500)
        } else {
          showSnackbar.value = true
          snackbarMessage.value = result.error
          snackbarColor.value = 'error'
        }
      } catch (error) {
        console.error('Create tour error:', error)
        showSnackbar.value = true
        snackbarMessage.value = 'Greška prilikom kreiranja ture'
        snackbarColor.value = 'error'
      } finally {
        loading.value = false
      }
    }

    const cancel = () => {
      router.push('/tours')
    }

    return {
      valid,
      loading,
      newImageUrl,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      tourData,
      difficultyOptions,
      nameRules,
      descriptionRules,
      difficultyRules,
      tagsRules,
      addImage,
      removeImage,
      createTour,
      cancel
    }
  }
}
</script>

<style lang="scss" scoped>
.tour-create-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--warm-bg-gradient-start), var(--warm-bg-gradient-end));
}

/* Hero Section */
.create-hero-section {
  background: linear-gradient(135deg, #D4730A 0%, #F59E0B 100%) !important;
  color: white !important;
  padding: 3rem 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
  }

  * {
    color: white !important;
  }
}

.hero-content {
  text-align: center;
}

.hero-info {
  max-width: 600px;
  margin: 0 auto;

  .hero-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: white !important;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 0;
    color: white !important;
    line-height: 1.5;
  }
}

/* Content Container */
.content-container {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

/* Form Styling */
.tour-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Common Card Styling */
.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(212, 115, 10, 0.08);
  border: 1px solid var(--warm-border);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(212, 115, 10, 0.12);
  }

  .card-title {
    background: var(--warm-bg-secondary);
    border-bottom: 1px solid var(--warm-border);
    padding: 1.5rem 2rem;
    font-weight: 700;
    color: var(--warm-text-primary);
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .title-icon {
      color: var(--warm-primary);
    }
  }

  .card-content {
    padding: 2rem;
  }
}

/* Form Fields */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  :deep(.v-field) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(212, 115, 10, 0.04);
    transition: all 0.3s ease;
  }

  :deep(.v-field--focused) {
    box-shadow: 0 4px 12px rgba(212, 115, 10, 0.12);
  }

  :deep(.v-field__input) {
    color: var(--warm-text-primary);
  }

  :deep(.v-label) {
    color: var(--warm-text-secondary);
  }
}

/* Tags Field */
.tags-field {
  :deep(.v-field) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(212, 115, 10, 0.04);
  }

  .tour-tag-chip {
    background: var(--warm-primary);
    color: white;
    font-weight: 500;
  }
}

/* Images Section */
.image-input {
  margin-bottom: 1.5rem;

  :deep(.v-field) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(212, 115, 10, 0.04);
  }
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.image-card {
  background: var(--warm-bg-secondary);
  border: 1px solid var(--warm-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(212, 115, 10, 0.15);

    .delete-btn {
      opacity: 1;
    }
  }

  .image-preview {
    border-radius: 16px 16px 0 0;

    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: var(--warm-bg-secondary);
    }
  }

  .image-actions {
    padding: 0.5rem;
    background: white;
    border-top: 1px solid var(--warm-border);

    .delete-btn {
      opacity: 0.7;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
        background: rgba(220, 38, 38, 0.1);
      }
    }
  }
}

/* Alert Styling */
.empty-images-alert,
.status-alert {
  background: linear-gradient(135deg, rgba(212, 115, 10, 0.05), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(212, 115, 10, 0.2);
  border-radius: 16px;

  .alert-text {
    color: var(--warm-text-secondary);
    line-height: 1.6;
    margin: 0;
  }
}

/* Status Card */
.status-card {
  border-left: 4px solid var(--warm-primary);
}

/* Actions Card */
.actions-card {
  background: linear-gradient(135deg, var(--warm-bg-secondary), white);

  .actions-content {
    padding: 2rem;
  }

  .actions-grid {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex-wrap: wrap;

    .action-btn {
      min-width: 150px;
      text-transform: none;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      }

      &.cancel-btn {
        color: var(--warm-text-secondary);
        border-color: var(--warm-border);

        &:hover {
          background: rgba(108, 117, 125, 0.08);
          border-color: var(--warm-text-secondary);
        }
      }

      &.submit-btn {
        background: var(--warm-primary);
        color: white;
        box-shadow: 0 4px 12px rgba(212, 115, 10, 0.3);

        &:hover {
          background: var(--warm-primary-dark);
          box-shadow: 0 6px 20px rgba(212, 115, 10, 0.4);
        }

        &:disabled {
          background: var(--warm-text-disabled);
          color: white;
          opacity: 0.6;
        }
      }
    }
  }
}

/* Custom Snackbar */
.custom-snackbar {
  :deep(.v-snackbar__wrapper) {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-hero-section {
    padding: 2rem 0;

    .hero-info {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }
    }
  }

  .content-container {
    padding-top: 1rem;
  }

  .form-card {
    .card-title {
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
    }

    .card-content {
      padding: 1.5rem;
    }
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .actions-grid {
    flex-direction: column;

    .action-btn {
      min-width: auto;
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .hero-info {
    .hero-icon {
      width: 60px;
      height: 60px;
    }

    .hero-title {
      font-size: 1.75rem;
    }
  }

  .form-card .card-content {
    padding: 1rem;
  }

  .images-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>