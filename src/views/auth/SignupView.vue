<!-- 회원가입 화면 — 이메일/닉네임/비밀번호 입력 후 authApi.register() 호출 -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { useToast } from '@/composables/useToast'

const router    = useRouter()
const toast     = useToast()

const name      = ref('')   // BE 필드명 name (닉네임/이름)
const email     = ref('')
const password  = ref('')
const pwConfirm = ref('')
const showPw    = ref(false)
const loading   = ref(false)

// BE RegisterRequest 패턴: 8자 이상 + 영문 + 숫자 + 특수문자
const PW_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

function validate() {
  if (!name.value.trim() || name.value.trim().length < 2) { toast.error('이름은 2자 이상 입력해주세요'); return false }
  if (!email.value)           { toast.error('이메일을 입력해주세요'); return false }
  if (!PW_PATTERN.test(password.value)) {
    toast.error('비밀번호는 8자 이상, 영문+숫자+특수문자(@$!%*#?&)를 포함해야 합니다')
    return false
  }
  if (password.value !== pwConfirm.value) { toast.error('비밀번호가 일치하지 않습니다'); return false }
  return true
}

async function signup() {
  if (!validate()) return
  loading.value = true
  try {
    await authApi.register({ name: name.value.trim(), email: email.value, password: password.value })
    toast.success('회원가입이 완료됐어요!')
    router.push('/auth/login')
  } catch (e) {
    toast.error(e.response?.data?.message ?? '회원가입에 실패했습니다')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <button class="back" @click="router.back()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </button>

    <div class="logo">TRIPICK</div>
    <h1 class="heading">새 계정 만들기</h1>
    <p class="sub">여행 취향을 저장하고 AI 추천을 받아보세요</p>

    <form class="form" @submit.prevent="signup">
      <div class="field">
        <label class="label">이름 <span class="hint">(닉네임으로 표시됩니다)</span></label>
        <input v-model="name" type="text" class="input" placeholder="2~20자 이름 또는 닉네임" maxlength="20" />
      </div>

      <div class="field">
        <label class="label">이메일</label>
        <input v-model="email" type="email" class="input" placeholder="travel@email.com" autocomplete="email" />
      </div>

      <div class="field">
        <label class="label">비밀번호 <span class="hint">(영문+숫자+특수문자 8자 이상)</span></label>
        <div class="input input--pw">
          <input
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            placeholder="비밀번호 입력"
            autocomplete="new-password"
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

      <div class="field">
        <label class="label">비밀번호 확인</label>
        <div class="input input--pw" :class="{ 'input--error': pwConfirm && password !== pwConfirm }">
          <input
            v-model="pwConfirm"
            :type="showPw ? 'text' : 'password'"
            placeholder="비밀번호 재입력"
            autocomplete="new-password"
          />
        </div>
        <span v-if="pwConfirm && password !== pwConfirm" class="err-msg">비밀번호가 일치하지 않습니다</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? '가입 중...' : '회원가입' }}
      </button>
    </form>

    <p class="to-login">
      이미 계정이 있으신가요?
      <span @click="router.push('/auth/login')">로그인</span>
    </p>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-surface);
  padding: 52px 32px 48px;
  position: relative;
}

.back {
  position: absolute;
  top: 16px;
  left: 20px;
  background: none;
  border: none;
  color: var(--c-text);
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--c-primary-text);
  margin-top: 8px;
}

.heading {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-text);
  margin-top: 20px;
  line-height: 1.35;
}

.sub {
  margin-top: 8px;
  font-size: 14px;
  color: var(--c-text-sub);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.field { display: flex; flex-direction: column; gap: 8px; }

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-label);
}
.hint { font-weight: 400; color: var(--c-text-muted); }

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
.input--error { border-color: var(--c-error) !important; }

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

.err-msg {
  font-size: 12px;
  color: var(--c-error);
  margin-top: -4px;
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

.to-login {
  text-align: center;
  margin-top: 28px;
  font-size: 13px;
  color: var(--c-text-sub);
}
.to-login span {
  color: var(--c-primary);
  font-weight: 700;
  cursor: pointer;
}
</style>
