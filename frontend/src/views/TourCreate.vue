<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            <v-icon left class="mr-2">mdi-map-marker-plus</v-icon>
            Kreiranje nove ture
          </v-card-title>

          <v-form ref="form" v-model="valid" @submit.prevent="createTour">
            <!-- Basic Information -->
            <v-card subtitle="Osnovne informacije" class="mb-4">
              <v-card-text>
                <v-text-field
                  v-model="tourData.name"
                  label="Naziv ture"
                  :rules="nameRules"
                  prepend-icon="mdi-map-marker"
                  variant="outlined"
                  class="mb-3"
                  required
                />

                <v-textarea
                  v-model="tourData.description"
                  label="Opis ture"
                  :rules="descriptionRules"
                  prepend-icon="mdi-text"
                  variant="outlined"
                  rows="4"
                  class="mb-3"
                  required
                />

                <v-select
                  v-model="tourData.difficulty"
                  label="Težina ture"
                  :items="difficultyOptions"
                  :rules="difficultyRules"
                  prepend-icon="mdi-trending-up"
                  variant="outlined"
                  class="mb-3"
                  required
                />

                <v-text-field
                  v-model.number="tourData.estimatedDuration"
                  label="Procenjena dužina (minuti)"
                  type="number"
                  prepend-icon="mdi-clock-outline"
                  variant="outlined"
                  class="mb-3"
                  hint="Koliko minuta je potrebno za završetak ture"
                />
              </v-card-text>
            </v-card>

            <!-- Tags -->
            <v-card subtitle="Tagovi i kategorije" class="mb-4">
              <v-card-text>
                <v-combobox
                  v-model="tourData.tags"
                  label="Tagovi"
                  multiple
                  chips
                  closable-chips
                  prepend-icon="mdi-tag-multiple"
                  variant="outlined"
                  hint="Dodajte tagove koji opisuju vašu turu (maksimalno 10)"
                  :rules="tagsRules"
                >
                  <template v-slot:chip="{ props, item }">
                    <v-chip
                      v-bind="props"
                      :text="item.raw"
                      size="small"
                      color="primary"
                    />
                  </template>
                </v-combobox>
              </v-card-text>
            </v-card>

            <!-- Images -->
            <v-card subtitle="Slike ture" class="mb-4">
              <v-card-text>
                <v-text-field
                  v-model="newImageUrl"
                  label="URL slike"
                  prepend-icon="mdi-image"
                  append-icon="mdi-plus"
                  variant="outlined"
                  @click:append="addImage"
                  @keyup.enter="addImage"
                  hint="Dodajte URL slike za vašu turu"
                  class="mb-3"
                />

                <div v-if="tourData.images.length > 0" class="mb-3">
                  <v-row>
                    <v-col
                      v-for="(image, index) in tourData.images"
                      :key="index"
                      cols="12" sm="6" md="4"
                    >
                      <v-card>
                        <v-img
                          :src="image"
                          height="150"
                          cover
                          class="grey lighten-2"
                        />
                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            icon="mdi-delete"
                            size="small"
                            color="error"
                            @click="removeImage(index)"
                          />
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>

                <v-alert
                  v-if="tourData.images.length === 0"
                  type="info"
                  variant="tonal"
                  class="mb-3"
                >
                  <v-icon start icon="mdi-information" />
                  Dodajte slike da učinite vašu turu privlačnijom
                </v-alert>
              </v-card-text>
            </v-card>

            <!-- Status Information -->
            <v-card subtitle="Status ture" class="mb-6">
              <v-card-text>
                <v-alert type="info" variant="tonal">
                  <v-icon start icon="mdi-information" />
                  Tura će biti kreirana sa statusom "Draft" i cenom 0.00€.
                  Možete je objaviti kasnije kada budete spremni.
                </v-alert>
              </v-card-text>
            </v-card>

            <!-- Actions -->
            <v-row class="mt-4">
              <v-col>
                <v-btn
                  color="grey"
                  variant="outlined"
                  size="large"
                  prepend-icon="mdi-cancel"
                  @click="cancel"
                  class="mr-3"
                >
                  Otkaži
                </v-btn>
                
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-content-save"
                  type="submit"
                  :loading="loading"
                  :disabled="!valid"
                >
                  Kreiraj turu
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="5000"
      location="top"
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
  </v-container>
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

<style scoped>
.v-card-subtitle {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
</style>