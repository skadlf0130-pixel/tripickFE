<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { notificationApi } from '@/api/notifications'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast  = useToast()

const notifications = ref([])
const loading       = ref(true)

function isToday(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

const todayItems = () => notifications.value.filter(n => isToday(n.createdAt))
const prevItems  = () => notifications.value.filter(n => !isToday(n.createdAt))

onMounted(async () => {
  try {
    const { data } = await notificationApi.getList({ page: 0, size: 50 })
    notifications.value = data.data?.content ?? []
  } catch {
    toast.error('알림을 불러올 수 없어요')
  } finally {
    loading.value = false
  }
})

async function markRead(n) {
  if (n.isRead) return
  try {
    await notificationApi.markRead(n.notificationId)
    n.isRead = true
  } catch { /* 무시 */ }
}

async function markAllRead() {
  try {
    await notificationApi.markAllRead()
    notifications.value.forEach(n => { n.isRead = true })
    toast.success('모든 알림을 읽음 처리했어요')
  } catch {
    toast.error('잠시 후 다시 시도해주세요')
  }
}

function handleClick(n) {
  markRead(n)
}

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

const ICON_MAP = {
  FESTIVAL_REMINDER: '🎪',
  REVIEW_COMMENT:    '💬',
  LIKE:              '❤️',
  FOLLOW:            '👤',
  SYSTEM:            '📢',
}
</script>

<template>
  <div class="page">
    <!-- 헤더 -->
    <div class="header">
      <button class="btn-back" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <h1 class="header-title">알림</h1>
      <button class="btn-all-read" @click="markAllRead">모두 읽음</button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="loading-list">
      <div v-for="i in 6" :key="i" class="skeleton-item">
        <div class="skeleton dot-sk" />
        <div class="skeleton icon-sk" />
        <div class="skeleton-texts">
          <div class="skeleton line w80" />
          <div class="skeleton line w40" />
        </div>
      </div>
    </div>

    <template v-else>
      <!-- 오늘 알림 -->
      <section v-if="todayItems().length">
        <p class="section-label">오늘</p>
        <div
          v-for="n in todayItems()" :key="n.notificationId"
          class="notif-item"
          :class="{ unread: !n.isRead }"
          @click="handleClick(n)"
        >
          <div class="unread-dot" :class="{ visible: !n.isRead }" />
          <div class="notif-icon">{{ ICON_MAP[n.type] ?? '🔔' }}</div>
          <div class="notif-body">
            <p class="notif-msg">{{ n.content }}</p>
            <p class="notif-time">{{ relativeTime(n.createdAt) }}</p>
          </div>
        </div>
      </section>

      <!-- 이전 알림 -->
      <section v-if="prevItems().length">
        <p class="section-label">이전</p>
        <div
          v-for="n in prevItems()" :key="n.notificationId"
          class="notif-item"
          :class="{ unread: !n.isRead }"
          @click="handleClick(n)"
        >
          <div class="unread-dot" :class="{ visible: !n.isRead }" />
          <div class="notif-icon">{{ ICON_MAP[n.type] ?? '🔔' }}</div>
          <div class="notif-body">
            <p class="notif-msg">{{ n.content }}</p>
            <p class="notif-time">{{ relativeTime(n.createdAt) }}</p>
          </div>
        </div>
      </section>

      <!-- 빈 상태 -->
      <div v-if="!notifications.length" class="empty-state">
        <span class="empty-icon">🔔</span>
        <p>새로운 알림이 없어요</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-bg);
  min-height: 100dvh;
}

/* ── 헤더 ── */
.header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text);
  display: flex;
  padding: 4px;
  margin-right: 8px;
}
.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text);
}
.btn-all-read {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--c-primary);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

/* ── 섹션 라벨 ── */
.section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-muted);
  letter-spacing: 0.04em;
  padding: 14px 20px 6px;
  text-transform: uppercase;
}

/* ── 알림 아이템 ── */
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  cursor: pointer;
  transition: background 0.1s;
  position: relative;
}
.notif-item.unread { background: #EBF6FD; }
.notif-item:active { background: var(--c-bg); }

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
  margin-top: 6px;
  transition: background 0.15s;
}
.unread-dot.visible { background: var(--c-primary); }

.notif-icon {
  font-size: 22px;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--c-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-body { flex: 1; min-width: 0; }
.notif-msg {
  font-size: 14px;
  color: var(--c-text);
  line-height: 1.5;
  margin-bottom: 4px;
}
.notif-time {
  font-size: 12px;
  color: var(--c-text-muted);
}

/* ── 빈 상태 ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 24px;
  color: var(--c-text-muted);
  font-size: 14px;
}
.empty-icon { font-size: 44px; }

/* ── 스켈레톤 ── */
.loading-list { padding: 8px 0; }
.skeleton-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--c-border);
}
.skeleton-texts { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.skeleton {
  background: linear-gradient(90deg, var(--c-border) 25%, var(--c-bg) 50%, var(--c-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
.dot-sk  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.icon-sk { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
.line    { height: 12px; }
.w40 { width: 40%; }
.w80 { width: 80%; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
</style>
