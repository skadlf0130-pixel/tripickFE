// 인증 상태 전역 스토어
// accessToken/refreshToken/user를 localStorage에 동기화하여 새로고침 후에도 유지
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const USER_KEY = 'auth_user'
const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem(ACCESS_KEY) ?? null)
  const refreshToken = ref(localStorage.getItem(REFRESH_KEY) ?? null)
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'))

  const isLoggedIn = computed(() => !!accessToken.value)

  // 로그인 성공 시 토큰 및 유저 정보 저장
  function setSession(data) {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    user.value = { userId: data.userId, name: data.name, role: data.role }
    localStorage.setItem(ACCESS_KEY, data.accessToken)
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  // 로그아웃 또는 토큰 만료 시 세션 초기화
  function clearSession() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { accessToken, refreshToken, user, isLoggedIn, setSession, clearSession }
})
