<!-- 하단 탭 네비게이션 — 디자인 파일의 SVG 아이콘과 색상 그대로 적용 -->
<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'home',      label: '홈',      path: '/' },
  { name: 'search',    label: '검색',    path: '/search' },
  { name: 'schedule-list', label: '일정', path: '/schedules' },
  { name: 'community', label: '커뮤니티', path: '/community' },
  { name: 'mypage',    label: 'MY',      path: '/mypage' },
]

function isActive(tab) {
  if (tab.path === '/') return route.path === '/'
  return route.path.startsWith(tab.path)
}
</script>

<template>
  <nav class="bottom-nav">
    <!-- 홈 -->
    <button class="bottom-nav__item" :class="{ active: isActive(tabs[0]) }" @click="router.push('/')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>
      </svg>
      <span>홈</span>
    </button>

    <!-- 검색 -->
    <button class="bottom-nav__item" :class="{ active: isActive(tabs[1]) }" @click="router.push('/search')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
        <circle cx="11" cy="11" r="6"/>
        <line x1="20" y1="20" x2="16" y2="16"/>
      </svg>
      <span>검색</span>
    </button>

    <!-- 일정 -->
    <button class="bottom-nav__item" :class="{ active: isActive(tabs[2]) }" @click="router.push('/schedules')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="5" width="16" height="16" rx="2"/>
        <line x1="4" y1="9" x2="20" y2="9"/>
        <line x1="9" y1="3" x2="9" y2="6"/>
        <line x1="15" y1="3" x2="15" y2="6"/>
      </svg>
      <span>일정</span>
    </button>

    <!-- 커뮤니티 -->
    <button class="bottom-nav__item" :class="{ active: isActive(tabs[3]) }" @click="router.push('/community')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3z"/>
      </svg>
      <span>커뮤니티</span>
    </button>

    <!-- MY -->
    <button class="bottom-nav__item" :class="{ active: isActive(tabs[4]) }" @click="router.push('/mypage')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="3.5"/>
        <path d="M5 20a7 7 0 0 1 14 0"/>
      </svg>
      <span>MY</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--max-width);
  height: var(--nav-height);
  display: flex;
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
  z-index: 100;
  padding: 10px 6px 22px;
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 0;
  color: var(--c-text-muted);
  font-size: 10px;
  font-weight: 500;
  transition: color 0.15s;
}

.bottom-nav__item.active {
  color: var(--c-primary);
  font-weight: 600;
}
</style>
