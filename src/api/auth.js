// auth-service API (gateway :8080 → auth-service :8081)
// 회원가입, 로그인, 토큰 재발급, 비밀번호 재설정
import api from './client'

export const authApi = {
  // 회원가입: { name(2~20자), email, password(영문+숫자+특수문자 8자↑), phone? }
  register: (data) =>
    api.post('/api/auth/register', data),

  // 이메일 중복 확인
  checkEmail: (email) =>
    api.get('/api/auth/check-email', { params: { email } }),

  // 로그인: { email, password }
  login: (data) =>
    api.post('/api/auth/login', data),

  // 로그아웃 (refreshToken 무효화)
  logout: (refreshToken) =>
    api.post('/api/auth/logout', { refreshToken }),

  // 액세스 토큰 재발급
  refresh: (refreshToken) =>
    api.post('/api/auth/token/refresh', { refreshToken }),

  // 비밀번호 재설정 메일 발송
  forgotPassword: (email) =>
    api.post('/api/auth/password/forgot', { email }),

  // 비밀번호 재설정: { token, newPassword }
  resetPassword: (data) =>
    api.post('/api/auth/password/reset', data),
}
