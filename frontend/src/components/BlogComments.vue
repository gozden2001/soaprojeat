<template>
  <v-card class="mt-4">
    <v-card-title class="d-flex align-center">
      <v-icon start>mdi-comment-multiple</v-icon>
      Komentari ({{ totalComments }})
    </v-card-title>

    <!-- Comment Form -->
    <v-card-text v-if="authStore.isAuthenticated">
      <v-form @submit.prevent="submitComment">
        <v-textarea
          v-model="newComment"
          label="Napišite komentar..."
          rows="3"
          variant="outlined"
          :disabled="loading"
          maxlength="1000"
          counter
        ></v-textarea>
        <v-btn
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="!newComment.trim()"
          class="mt-2"
        >
          Dodaj komentar
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-text v-else>
      <v-alert type="info" variant="tonal">
        <router-link to="/login" class="text-decoration-none">
          Prijavite se
        </router-link>
        da biste mogli da komentarišete.
      </v-alert>
    </v-card-text>

    <!-- Comments List -->
    <v-divider></v-divider>
    
    <div v-if="comments.length === 0" class="pa-4 text-center text-grey">
      <v-icon size="64" color="grey-lighten-2">mdi-comment-off</v-icon>
      <p class="mt-2">Nema komentara</p>
    </div>

    <div v-else>
      <v-list>
        <v-list-item
          v-for="comment in comments"
          :key="comment._id"
          class="py-4"
        >
          <template v-slot:prepend>
            <v-avatar color="primary">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="d-flex align-center">
            <span class="font-weight-bold">{{ comment.author.username }}</span>
            <v-chip 
              :color="getRoleColor(comment.author.role)" 
              size="x-small" 
              class="ml-2"
            >
              {{ comment.author.role }}
            </v-chip>
            <v-spacer></v-spacer>
            <span class="text-caption text-grey">
              {{ formatDate(comment.createdAt) }}
            </span>
          </v-list-item-title>

          <v-list-item-subtitle class="mt-2">
            <div v-if="editingComment === comment._id">
              <v-textarea
                v-model="editCommentText"
                variant="outlined"
                rows="2"
                maxlength="1000"
                counter
              ></v-textarea>
              <div class="d-flex gap-2 mt-2">
                <v-btn
                  size="small"
                  color="primary"
                  @click="saveEdit(comment._id)"
                  :loading="loading"
                >
                  Sačuvaj
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="cancelEdit"
                >
                  Otkaži
                </v-btn>
              </div>
            </div>
            <div v-else>
              <p class="mb-2">{{ comment.content }}</p>
              <div 
                v-if="comment.author.userId === authStore.user?.id" 
                class="d-flex gap-2"
              >
                <v-btn
                  size="x-small"
                  color="blue"
                  variant="text"
                  @click="startEdit(comment)"
                >
                  <v-icon start size="small">mdi-pencil</v-icon>
                  Uredi
                </v-btn>
                <v-btn
                  size="x-small"
                  color="red"
                  variant="text"
                  @click="deleteComment(comment._id)"
                  :loading="loading"
                >
                  <v-icon start size="small">mdi-delete</v-icon>
                  Obriši
                </v-btn>
              </div>
            </div>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="d-flex justify-center pa-4">
        <v-pagination
          v-model="currentPage"
          :length="pagination.totalPages"
          @update:model-value="loadComments"
        ></v-pagination>
      </div>
    </div>
  </v-card>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import commentAPI from '../api/comments'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'BlogComments',
  props: {
    blogId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    const comments = ref([])
    const newComment = ref('')
    const loading = ref(false)
    const currentPage = ref(1)
    const pagination = ref({
      totalPages: 0,
      totalComments: 0,
      hasNext: false,
      hasPrev: false
    })
    const editingComment = ref(null)
    const editCommentText = ref('')

    const totalComments = computed(() => pagination.value.totalComments)

    const loadComments = async (page = 1) => {
      try {
        const result = await commentAPI.getCommentsByBlog(props.blogId, page, 10)
        if (result.success) {
          comments.value = result.data.comments
          pagination.value = result.data.pagination
          currentPage.value = page
        }
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }

    const submitComment = async () => {
      if (!newComment.value.trim()) return

      loading.value = true
      try {
        const result = await commentAPI.createComment(props.blogId, newComment.value.trim())
        if (result.success) {
          newComment.value = ''
          await loadComments(1) // Reload from first page
        } else {
          alert(result.error)
        }
      } catch (error) {
        console.error('Error creating comment:', error)
        alert('Greška pri dodavanju komentara')
      } finally {
        loading.value = false
      }
    }

    const startEdit = (comment) => {
      editingComment.value = comment._id
      editCommentText.value = comment.content
    }

    const cancelEdit = () => {
      editingComment.value = null
      editCommentText.value = ''
    }

    const saveEdit = async (commentId) => {
      if (!editCommentText.value.trim()) return

      loading.value = true
      try {
        const result = await commentAPI.updateComment(commentId, editCommentText.value.trim())
        if (result.success) {
          await loadComments(currentPage.value)
          cancelEdit()
        } else {
          alert(result.error)
        }
      } catch (error) {
        console.error('Error updating comment:', error)
        alert('Greška pri ažuriranju komentara')
      } finally {
        loading.value = false
      }
    }

    const deleteComment = async (commentId) => {
      if (!confirm('Da li ste sigurni da želite da obrišete ovaj komentar?')) return

      loading.value = true
      try {
        const result = await commentAPI.deleteComment(commentId)
        if (result.success) {
          await loadComments(currentPage.value)
        } else {
          alert(result.error)
        }
      } catch (error) {
        console.error('Error deleting comment:', error)
        alert('Greška pri brisanju komentara')
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('sr-RS', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getRoleColor = (role) => {
      switch (role) {
        case 'administrator': return 'red'
        case 'vodic': return 'green'
        case 'turista': return 'blue'
        default: return 'grey'
      }
    }

    onMounted(() => {
      loadComments()
    })

    return {
      authStore,
      comments,
      newComment,
      loading,
      currentPage,
      pagination,
      totalComments,
      editingComment,
      editCommentText,
      loadComments,
      submitComment,
      startEdit,
      cancelEdit,
      saveEdit,
      deleteComment,
      formatDate,
      getRoleColor
    }
  }
}
</script>