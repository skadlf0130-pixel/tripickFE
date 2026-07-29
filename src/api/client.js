// axios 기본 인스턴스 설정
// - 요청마다 localStorage의 access_token 자동 첨부
// - 401 응답 시 refresh_token으로 재발급 후 원래 요청 재시도
// - refresh 실패 시 토큰 삭제 후 로그인 페이지로 이동
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
})

// 요청 인터셉터: Authorization 헤더에 토큰 삽입
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 동시에 여러 요청이 401을 받을 때 refresh를 한 번만 호출하기 위한 큐
let isRefreshing = false
let refreshQueue = []

// 응답 인터셉터: 401 처리
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      isRefreshing = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('no refresh token')

        const { data } = await api.post('/api/auth/token/refresh', { refreshToken })
        const newToken = data.data.accessToken
        const newRefresh = data.data.refreshToken
        localStorage.setItem('access_token', newToken)
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh)
        refreshQueue.forEach(p => p.resolve(newToken))
        refreshQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        refreshQueue.forEach(p => p.reject())
        refreshQueue = []
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
        window.location.href = '/auth/login'
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
