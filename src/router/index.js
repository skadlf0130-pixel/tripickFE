import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 인증 / 온보딩 (비로그인 접근 가능)
  { path: '/auth', name: 'auth-home', component: () => import('../views/auth/AuthHome.vue') },
  { path: '/auth/signup', name: 'signup', component: () => import('../views/auth/SignupView.vue') },
  { path: '/auth/login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
  { path: '/auth/onboarding', name: 'onboarding', component: () => import('../views/auth/OnboardingPreferencesView.vue') },

  // 공유 일정 뷰어 (비로그인 접근 가능)
  { path: '/shared/:token', name: 'shared-schedule-viewer', component: () => import('../views/schedule/SharedScheduleViewerView.vue') },

  // 홈 / 탐색
  { path: '/', name: 'home', meta: { requiresAuth: true }, component: () => import('../views/home/HomeView.vue') },
  { path: '/spots/:id', name: 'spot-detail', meta: { requiresAuth: true }, component: () => import('../views/home/SpotDetailView.vue') },
  { path: '/festivals/:id', name: 'festival-detail', meta: { requiresAuth: true }, component: () => import('../views/home/FestivalDetailView.vue') },
  { path: '/search', name: 'search', meta: { requiresAuth: true }, component: () => import('../views/home/SearchView.vue') },
  { path: '/search/results', name: 'search-results', meta: { requiresAuth: true }, component: () => import('../views/home/SearchResultsView.vue') },

  // 여행 일정 관리
  { path: '/schedules', name: 'schedule-list', meta: { requiresAuth: true }, component: () => import('../views/schedule/ScheduleListView.vue') },
  { path: '/schedules/generate', name: 'schedule-generate', meta: { requiresAuth: true }, component: () => import('../views/schedule/ScheduleGenerateView.vue') },
  { path: '/schedules/:id/edit', name: 'schedule-edit', meta: { requiresAuth: true }, component: () => import('../views/schedule/ScheduleEditView.vue') },
  { path: '/schedules/:id/share', name: 'schedule-share-settings', meta: { requiresAuth: true }, component: () => import('../views/schedule/ScheduleShareSettingsView.vue') },

  // 커뮤니티 / 이벤트
  { path: '/community', name: 'community', meta: { requiresAuth: true }, component: () => import('../views/community/CommunityView.vue') },
  { path: '/community/reviews', name: 'review-list', meta: { requiresAuth: true }, component: () => import('../views/community/ReviewListView.vue') },
  { path: '/community/reviews/:id', name: 'review-detail', meta: { requiresAuth: true }, component: () => import('../views/community/ReviewDetailView.vue') },
  { path: '/community/events', name: 'event-list', meta: { requiresAuth: true }, component: () => import('../views/community/EventListView.vue') },
  { path: '/community/events/:id', name: 'event-detail', meta: { requiresAuth: true }, component: () => import('../views/community/EventDetailView.vue') },

  // 마이페이지 / 설정
  { path: '/mypage', name: 'mypage', meta: { requiresAuth: true }, component: () => import('../views/mypage/MyPageView.vue') },
  { path: '/mypage/profile/edit', name: 'profile-edit', meta: { requiresAuth: true }, component: () => import('../views/mypage/ProfileEditView.vue') },
  { path: '/mypage/favorites', name: 'favorites', meta: { requiresAuth: true }, component: () => import('../views/mypage/FavoritesView.vue') },
  { path: '/mypage/notifications', name: 'notification-center', meta: { requiresAuth: true }, component: () => import('../views/mypage/NotificationCenterView.vue') },
  { path: '/mypage/notifications/settings', name: 'notification-settings', meta: { requiresAuth: true }, component: () => import('../views/mypage/NotificationSettingsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(to => {
  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }
  }
  if ((to.name === 'login' || to.name === 'signup' || to.name === 'auth-home') && token) {
    return { name: 'home' }
  }
})

export default router
