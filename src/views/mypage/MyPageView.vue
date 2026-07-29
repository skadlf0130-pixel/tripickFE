<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import { notificationApi } from '@/api/notifications'
import { useToast } from '@/composables/useToast'
import BottomNav from '@/components/common/BottomNav.vue'

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToast()

const unreadCount = ref(0)

onMounted(async () => {
  try {
    const { data } = await notificationApi.getUnreadCount()
    unreadCount.value = data.data ?? 0
  } catch { /* 무시 */ }
})

async function logout() {
  try {
    await authApi.logout(auth.refreshToken)
  } catch { /* 토큰 만료 등 무시하고 로컬 세션 제거 */ }
  auth.clearSession()
  router.replace('/auth/login')
}

const menuItems = [
  { label: '프로필 편집',   icon: 'user',  path: '/mypage/profile/edit' },
  { label: '즐겨찾기',     icon: 'star',  path: '/mypage/favorites' },
  { label: '알림 설정',    icon: 'bell',  path: '/mypage/notifications/settings' },
]

const STYLE_TAGS = ['자연·힐링', '문화·예술', '미식탐방']
</script>

<template>
  <div class="page">
    <!-- 프로필 카드 -->
    <div class="profile-card">
      <div class="avatar-wrap">
        <div class="avatar">{{ auth.user?.name?.[0] ?? '?' }}</div>
      </div>
      <div class="profile-info">
        <p class="profile-name">{{ auth.user?.name ?? '여행자' }}</p>
        <p class="profile-role">{{ auth.user?.role === 'ADMIN' ? '관리자' : '일반 회원' }}</p>
      </div>
      <button class="btn-edit-profile" @click="router.push('/mypage/profile/edit')">편집</button>
    </div>

    <!-- 여행 스타일 태그 -->
    <div class="style-section">
      <p class="style-label">내 여행 스타일</p>
      <div class="style-tags">
        <span v-for="tag in STYLE_TAGS" :key="tag" class="style-tag">{{ tag }}</span>
        <button class="btn-add-tag" @click="router.push('/auth/onboarding')">+ 편집</button>
      </div>
    </div>

    <!-- 메뉴 리스트 -->
    <div class="menu-section">
      <!-- 알림 센터 (뱃지 포함) -->
      <button class="menu-item" @click="router.push('/mypage/notifications')">
        <span class="menu-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </span>
        <span class="menu-label">알림 센터</span>
        <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
        <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <button
        v-for="item in menuItems" :key="item.path"
        class="menu-item"
        @click="router.push(item.path)"
      >
        <span class="menu-icon">
          <!-- user -->
          <svg v-if="item.icon === 'user'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <!-- star -->
          <svg v-else-if="item.icon === 'star'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <!-- bell -->
          <svg v-else-if="item.icon === 'bell'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </span>
        <span class="menu-label">{{ item.label }}</span>
        <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <!-- 구분선 -->
      <div class="divider" />

      <!-- 로그아웃 -->
      <button class="menu-item danger" @click="logout">
        <span class="menu-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </span>
        <span class="menu-label">로그아웃</span>
      </button>
    </div>

    <p class="version-text">Tripick v1.0.0</p>

    <BottomNav />
  </div>
</template>

<style scoped>
.page {
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-bg);
  min-height: 100dvh;
  padding-bottom: 80px;
}

/* ── 프로필 카드 ── */
.profile-card {
  background: var(--c-surface);
  padding: 28px 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid var(--c-border);
}
.avatar-wrap { position: relative; }
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--c-primary-bg);
  color: var(--c-primary);
  font-size: 26px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--c-primary);
}
.profile-info { flex: 1; }
.profile-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text);
  margin-bottom: 3px;
}
.profile-role { font-size: 13px; color: var(--c-text-muted); }
.btn-edit-profile {
  padding: 7px 16px;
  border-radius: 99px;
  border: 1.5px solid var(--c-border);
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-sub);
  font-family: inherit;
  cursor: pointer;
}

/* ── 여행 스타일 ── */
.style-section {
  background: var(--c-surface);
  padding: 18px 20px;
  margin-top: 8px;
  border-bottom: 1px solid var(--c-border);
}
.style-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-muted);
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}
.style-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.style-tag {
  padding: 6px 14px;
  border-radius: 99px;
  background: var(--c-primary-bg);
  color: var(--c-primary);
  font-size: 13px;
  font-weight: 600;
}
.btn-add-tag {
  padding: 6px 14px;
  border-radius: 99px;
  border: 1.5px dashed var(--c-border);
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-muted);
  font-family: inherit;
  cursor: pointer;
}

/* ── 메뉴 ── */
.menu-section {
  background: var(--c-surface);
  margin-top: 8px;
}
.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px 20px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--c-border);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.menu-item:active { background: var(--c-bg); }
.menu-item.danger .menu-icon,
.menu-item.danger .menu-label { color: #E53E3E; }

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-sub);
  flex-shrink: 0;
}
.menu-label {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}
.badge {
  background: var(--c-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
}
.menu-arrow { color: var(--c-text-muted); flex-shrink: 0; }

.divider {
  height: 1px;
  background: var(--c-border);
  margin: 8px 0;
}

/* ── 버전 ── */
.version-text {
  text-align: center;
  font-size: 12px;
  color: var(--c-text-muted);
  margin-top: 24px;
}
</style>
