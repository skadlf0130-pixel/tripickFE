<!-- 로그인 화면 — 디자인: Mobile / 로그인 -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router   = useRouter()
const auth     = useAuthStore()
const toast    = useToast()

const email    = ref('')
const password = ref('')
const showPw   = ref(false)
const loading  = ref(false)

async function login() {
  if (!email.value || !password.value) {
    toast.error('이메일과 비밀번호를 입력해주세요')
    return
  }
  loading.value = true
  try {
    const { data } = await authApi.login({ email: email.value, password: password.value })
    auth.setSession(data.data)
    const hasPrefs = localStorage.getItem('user_preferences')
    router.push(hasPrefs ? '/' : '/auth/onboarding')
  } catch (e) {
    toast.error(e.response?.data?.message ?? '이메일 또는 비밀번호가 올바르지 않습니다')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="logo">TRIPICK</div>

    <h1 class="heading">취향에 맞는 여행을<br>찾아드릴게요</h1>
    <p class="sub">로그인하고 AI 맞춤 추천을 받아보세요</p>

    <form class="form" @submit.prevent="login">
      <div class="field">
        <label class="label">이메일</label>
        <input v-model="email" type="email" class="input" placeholder="travel@email.com" autocomplete="email" />
      </div>

      <div class="field">
        <label class="label">비밀번호</label>
        <div class="input input--pw">
          <input
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            placeholder="비밀번호 입력"
            autocomplete="current-password"
          />
          <button type="button" @click="showPw = !showPw">
            <svg v-if="!showPw" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9FACA6" stroke-width="1.8">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9FACA6" stroke-width="1.8">
              <path d="M17.9 17.9A10 10 0 0 1 12 19c-6 0-10-7-10-7a17.8 17.8 0 0 1 4.1-5"/>
              <path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c6 0 10 7 10 7a17.8 17.8 0 0 1-2.1 3"/>
              <line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="forgot">
        <span @click="router.push('/auth/forgot-password')">비밀번호를 잊으셨나요?</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? '로그인 중...' : '로그인' }}
      </button>
    </form>

    <div class="divider"><span>또는</span></div>

    <div class="social">
      <button class="social-btn social-btn--google">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 11v2.8h6.5c-.3 1.6-2.2 4.7-6.5 4.7-3.9 0-7-3.2-7-7.2s3.1-7.2 7-7.2c2.2 0 3.7.9 4.5 1.7l2.1-2C17.2 2.3 14.9 1 12 1 6.5 1 2 5.5 2 11.3S6.5 21.6 12 21.6c6.9 0 9.8-4.8 9.8-9.1 0-.6-.1-1.1-.1-1.5H12z"/>
        </svg>
        Google로 계속하기
      </button>
      <button class="social-btn social-btn--kakao">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1F2D2C">
          <path d="M12 2C6.5 2 2 5.6 2 10c0 2.8 1.9 5.3 4.7 6.7-.2.7-.9 3-.9 3.4 0 .3.2.4.4.3.2 0 3.1-2.1 4.2-2.9.5.1 1 .1 1.6.1 5.5 0 10-3.6 10-8s-4.5-7.6-10-7.6z"/>
        </svg>
        카카오로 계속하기
      </button>
      <button class="social-btn social-btn--naver">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
          <path d="M14.4 2v11.2L9.6 2H2v20h7.2V10.8L14 22H22V2z"/>
        </svg>
        네이버로 계속하기
      </button>
    </div>

    <p class="to-signup">
      아직 계정이 없으신가요?
      <span @click="router.push('/auth/signup')">회원가입</span>
    </p>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-surface);
  padding: 60px 32px 48px;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--c-primary-text);
}

.heading {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-text);
  margin-top: 28px;
  line-height: 1.35;
}

.sub {
  margin-top: 10px;
  font-size: 14px;
  color: var(--c-text-sub);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 36px;
}

.field { display: flex; flex-direction: column; gap: 8px; }

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-label);
}

.input {
  height: 52px;
  border-radius: var(--r-input);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  padding: 0 16px;
  font-size: 14px;
  color: var(--c-text);
  font-family: inherit;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.input:focus { border-color: var(--c-primary); }

.input--pw {
  display: flex;
  align-items: center;
  padding: 0;
  overflow: hidden;
}
.input--pw input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 16px;
  height: 100%;
  font-size: 14px;
  color: var(--c-text);
  font-family: inherit;
  outline: none;
}
.input--pw button {
  background: none;
  border: none;
  padding: 0 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.forgot {
  display: flex;
  justify-content: flex-end;
}
.forgot span {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-primary);
  cursor: pointer;
}

.btn-primary {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 16px;
  background: var(--c-primary);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  margin-top: 10px;
  transition: opacity 0.15s;
  font-family: inherit;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--c-border);
}
.divider span { font-size: 12px; color: var(--c-text-muted); white-space: nowrap; }

.social { display: flex; flex-direction: column; gap: 10px; }

.social-btn {
  width: 100%;
  height: 52px;
  border-radius: var(--r-input);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s;
}
.social-btn:active { opacity: 0.8; }
.social-btn--google { border: 1px solid var(--c-border); background: #fff; color: var(--c-text); }
.social-btn--kakao  { border: none; background: var(--c-kakao); color: var(--c-text); }
.social-btn--naver  { border: none; background: var(--c-naver); color: #fff; }

.to-signup {
  text-align: center;
  margin-top: 28px;
  font-size: 13px;
  color: var(--c-text-sub);
}
.to-signup span {
  color: var(--c-primary);
  font-weight: 700;
  cursor: pointer;
}
</style>
