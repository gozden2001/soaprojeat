<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-btn 
              icon="mdi-arrow-left" 
              variant="text" 
              @click="$router.go(-1)"
              class="mr-2"
            ></v-btn>
            <span>{{ pageTitle }}</span>
          </v-card-title>

          <v-card-text>
            <!-- Tabs for Followers/Following -->
            <v-tabs v-model="activeTab" align-tabs="center">
              <v-tab value="followers">
                <v-icon start>mdi-account-group</v-icon>
                Pratioци ({{ followStats.followers }})
              </v-tab>
              <v-tab value="following">
                <v-icon start>mdi-account-multiple</v-icon>
                Prati ({{ followStats.following }})
              </v-tab>
              <v-tab value="mutual">
                <v-icon start>mdi-account-heart</v-icon>
                Međusobno praćenje
              </v-tab>
            </v-tabs>

            <v-divider class="my-4"></v-divider>

            <!-- Loading -->
            <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

            <!-- Followers Tab -->
            <v-window v-model="activeTab">
              <v-window-item value="followers">
                <div v-if="followers.length === 0 && !loading" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2">mdi-account-off</v-icon>
                  <p class="mt-4 text-grey">Nema pratilaca</p>
                </div>
                <v-list v-else>
                  <v-list-item
                    v-for="follower in followers"
                    :key="follower.userId"
                    class="py-3"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary">
                        <v-icon>mdi-account</v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title>{{ follower.username }}</v-list-item-title>
                    <v-list-item-subtitle>Korisnik ID: {{ follower.userId }}</v-list-item-subtitle>

                    <template v-slot:append>
                      <FollowButton
                        v-if="follower.userId !== authStore.user?.id"
                        :user-id="follower.userId"
                        :username="follower.username"
                        @follow-changed="onFollowChanged"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-window-item>

              <!-- Following Tab -->
              <v-window-item value="following">
                <div v-if="following.length === 0 && !loading" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2">mdi-account-off</v-icon>
                  <p class="mt-4 text-grey">Ne prati nikoga</p>
                </div>
                <v-list v-else>
                  <v-list-item
                    v-for="followedUser in following"
                    :key="followedUser.userId"
                    class="py-3"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary">
                        <v-icon>mdi-account</v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title>{{ followedUser.username }}</v-list-item-title>
                    <v-list-item-subtitle>Korisnik ID: {{ followedUser.userId }}</v-list-item-subtitle>

                    <template v-slot:append>
                      <FollowButton
                        v-if="followedUser.userId !== authStore.user?.id"
                        :user-id="followedUser.userId"
                        :username="followedUser.username"
                        @follow-changed="onFollowChanged"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-window-item>

              <!-- Mutual Follows Tab -->
              <v-window-item value="mutual">
                <div v-if="mutualFollows.length === 0 && !loading" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2">mdi-account-heart-outline</v-icon>
                  <p class="mt-4 text-grey">Nema međusobnog praćenja</p>
                </div>
                <v-list v-else>
                  <v-list-item
                    v-for="mutualUser in mutualFollows"
                    :key="mutualUser.userId"
                    class="py-3"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="pink">
                        <v-icon>mdi-account-heart</v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title>{{ mutualUser.username }}</v-list-item-title>
                    <v-list-item-subtitle>Međusobno praćenje</v-list-item-subtitle>

                    <template v-slot:append>
                      <FollowButton
                        v-if="mutualUser.userId !== authStore.user?.id"
                        :user-id="mutualUser.userId"
                        :username="mutualUser.username"
                        @follow-changed="onFollowChanged"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-window-item>
            </v-window>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="d-flex justify-center mt-6">
              <v-pagination
                v-model="currentPage"
                :length="pagination.totalPages"
                @update:model-value="loadData"
              ></v-pagination>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import followAPI from '../api/follows'
import { useAuthStore } from '../stores/auth'
import FollowButton from '../components/FollowButton.vue'

export default {
  name: 'UserFollowsView',
  components: {
    FollowButton
  },
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    const activeTab = ref('followers')
    const loading = ref(false)
    const currentPage = ref(1)
    
    const followers = ref([])
    const following = ref([])
    const mutualFollows = ref([])
    
    const followStats = ref({
      followers: 0,
      following: 0
    })
    
    const pagination = ref({
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    })

    const userId = computed(() => route.params.userId)
    const pageTitle = computed(() => {
      const username = route.query.username || 'Korisnik'
      return `Praćenja - ${username}`
    })

    const loadFollowStats = async () => {
      try {
        const result = await followAPI.getFollowStats(userId.value)
        if (result.success) {
          followStats.value = result.data
        }
      } catch (error) {
        console.error('Error loading follow stats:', error)
      }
    }

    const loadFollowers = async (page = 1) => {
      loading.value = true
      try {
        const result = await followAPI.getFollowers(userId.value, page, 20)
        if (result.success) {
          followers.value = result.data.followers
          pagination.value = result.data.pagination
        }
      } catch (error) {
        console.error('Error loading followers:', error)
      } finally {
        loading.value = false
      }
    }

    const loadFollowing = async (page = 1) => {
      loading.value = true
      try {
        const result = await followAPI.getFollowing(userId.value, page, 20)
        if (result.success) {
          following.value = result.data.following
          pagination.value = result.data.pagination
        }
      } catch (error) {
        console.error('Error loading following:', error)
      } finally {
        loading.value = false
      }
    }

    const loadMutualFollows = async (page = 1) => {
      loading.value = true
      try {
        const result = await followAPI.getMutualFollows(userId.value, page, 20)
        if (result.success) {
          mutualFollows.value = result.data.mutualFollows
          pagination.value = result.data.pagination
        }
      } catch (error) {
        console.error('Error loading mutual follows:', error)
      } finally {
        loading.value = false
      }
    }

    const loadData = (page = 1) => {
      currentPage.value = page
      
      switch (activeTab.value) {
        case 'followers':
          loadFollowers(page)
          break
        case 'following':
          loadFollowing(page)
          break
        case 'mutual':
          loadMutualFollows(page)
          break
      }
    }

    const onFollowChanged = () => {
      // Reload current data and stats
      loadFollowStats()
      loadData(currentPage.value)
    }

    watch(activeTab, () => {
      currentPage.value = 1
      loadData(1)
    })

    watch(() => route.params.userId, () => {
      if (route.params.userId) {
        loadFollowStats()
        loadData(1)
      }
    })

    onMounted(() => {
      if (route.params.userId) {
        loadFollowStats()
        loadData(1)
      }
    })

    return {
      authStore,
      activeTab,
      loading,
      currentPage,
      followers,
      following,
      mutualFollows,
      followStats,
      pagination,
      pageTitle,
      loadData,
      onFollowChanged
    }
  }
}
</script>