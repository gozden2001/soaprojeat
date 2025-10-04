<template>
  <v-btn
    :color="isFollowing ? 'grey' : 'primary'"
    :variant="isFollowing ? 'outlined' : 'elevated'"
    :loading="loading"
    @click="toggleFollow"
    size="small"
  >
    <v-icon start>
      {{ isFollowing ? 'mdi-account-minus' : 'mdi-account-plus' }}
    </v-icon>
    {{ isFollowing ? 'Unfollow' : 'Follow' }}
  </v-btn>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import followAPI from '../api/follows'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'FollowButton',
  props: {
    userId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  emits: ['follow-changed'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const isFollowing = ref(false)
    const loading = ref(false)

    const checkFollowStatus = async () => {
      if (!authStore.isAuthenticated || props.userId === authStore.user?.id) {
        return
      }

      try {
        const result = await followAPI.checkFollowStatus(props.userId)
        if (result.success) {
          isFollowing.value = result.data.isFollowing
        }
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }

    const toggleFollow = async () => {
      if (!authStore.isAuthenticated) {
        authStore.showLoginDialog = true
        return
      }

      if (props.userId === authStore.user?.id) {
        return // Can't follow yourself
      }

      loading.value = true
      
      try {
        let result
        if (isFollowing.value) {
          result = await followAPI.unfollowUser(props.userId)
        } else {
          result = await followAPI.followUser(props.userId, props.username)
        }

        if (result.success) {
          isFollowing.value = !isFollowing.value
          emit('follow-changed', {
            userId: props.userId,
            isFollowing: isFollowing.value
          })
        } else {
          console.error('Follow operation failed:', result.error)
        }
      } catch (error) {
        console.error('Error toggling follow:', error)
      } finally {
        loading.value = false
      }
    }

    watch(() => props.userId, () => {
      checkFollowStatus()
    })

    onMounted(() => {
      checkFollowStatus()
    })

    return {
      isFollowing,
      loading,
      toggleFollow
    }
  }
}
</script>