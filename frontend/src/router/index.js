import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import ProfileView from '../views/ProfileView.vue'
import BlogListView from '../views/BlogListView.vue'
import BlogDetailView from '../views/BlogDetailView.vue'
import BlogCreateView from '../views/BlogCreateView.vue'
import BlogAuthorView from '../views/BlogAuthorView.vue'
import TourList from '../views/TourList.vue'
import TourCreate from '../views/TourCreate.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUpView,
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/blogs',
    name: 'BlogList',
    component: BlogListView
  },
  {
    path: '/blogs/create',
    name: 'BlogCreate',
    component: BlogCreateView,
    meta: { requiresAuth: true }
  },
  {
    path: '/blogs/:id',
    name: 'BlogDetail',
    component: BlogDetailView
  },
  {
    path: '/blogs/:id/edit',
    name: 'BlogEdit',
    component: BlogCreateView,
    meta: { requiresAuth: true }
  },
  {
    path: '/blogs/author/:authorId',
    name: 'BlogAuthor',
    component: BlogAuthorView
  },
  {
    path: '/users/:userId/follows',
    name: 'UserFollows',
    component: () => import('../views/UserFollowsView.vue')
  },
  {
    path: '/tours',
    name: 'TourList',
    component: TourList
  },
  {
    path: '/tours/create',
    name: 'TourCreate',
    component: TourCreate,
    meta: { requiresAuth: true, requiresRole: ['vodic', 'administrator'] }
  },
  {
    path: '/tours/my',
    name: 'MyTours',
    component: TourList,
    meta: { requiresAuth: true },
    props: { showMyTours: true }
  },
  {
    path: '/tours/:id',
    name: 'TourDetail',
    component: () => import('../views/TourDetail.vue')
  },
  {
    path: '/tours/:id/edit',
    name: 'TourEdit',
    component: TourCreate,
    meta: { requiresAuth: true, requiresRole: ['vodic', 'administrator'] }
  },
  {
    path: '/tours/:id/key-points',
    name: 'TourKeyPoints',
    component: () => import('../views/TourKeyPointsManager.vue'),
    meta: { requiresAuth: true, requiresRole: ['vodic', 'administrator'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresRole) {
    // Check if user has required role
    const requiredRoles = Array.isArray(to.meta.requiresRole) ? to.meta.requiresRole : [to.meta.requiresRole]
    const userRole = authStore.user?.role
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      // Redirect to unauthorized page or home
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router