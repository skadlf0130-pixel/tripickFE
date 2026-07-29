<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { spotApi } from '@/api/spots'
import { useToast } from '@/composables/useToast'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const spot        = ref(null)
const loading     = ref(true)
const bookmarked  = ref(false)

onMounted(async () => {
  try {
    const { data } = await spotApi.getDetail(route.params.id)
    spot.value = data.data  // BE: { spotId, name, region, category, description, imageUrl, latitude, longitude }
  } catch {
    toast.error('여행지 정보를 불러올 수 없어요')
  } finally {
    loading.value = false
  }
})

async function toggleBookmark() {
  try {
    if (bookmarked.value) {
      await spotApi.removeBookmark(route.params.id)
      toast.success('즐겨찾기를 해제했어요')
    } else {
      await spotApi.addBookmark(route.params.id)
      toast.success('즐겨찾기에 추가됐어요')
    }
    bookmarked.value = !bookmarked.value
  } catch {
    toast.error('잠시 후 다시 시도해주세요')
  }
}

function share() {
  if (navigator.share) {
    navigator.share({ title: spot.value?.name, url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
    toast.success('링크를 복사했어요')
  }
}

function addToSchedule() {
  router.push(`/schedules/generate?spotId=${route.params.id}`)
}
</script>

<template>
  <div class="page">
    <!-- 로딩 -->
    <div v-if="loading" class="skeleton-wrap">
      <div class="skeleton hero-skeleton" />
      <div class="skeleton-body">
        <div class="skeleton line w60" />
        <div class="skeleton line w40" />
        <div class="skeleton line w80" />
      </div>
    </div>

    <template v-else-if="spot">
      <!-- 히어로 이미지 -->
      <div class="hero">
        <img
          v-if="spot.imageUrl"
          :src="spot.imageUrl"
          :alt="spot.name"
          class="hero-img"
        />
        <div v-else class="hero-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b0c4d8" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>

        <!-- 오버레이 버튼들 -->
        <div class="hero-actions">
          <button class="icon-btn" @click="router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div class="hero-right-actions">
            <button class="icon-btn" @click="share">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
            </button>
            <button class="icon-btn" @click="toggleBookmark">
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="bookmarked ? '#1D6FBF' : 'none'" stroke="#1D6FBF" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 콘텐츠 패널 (히어로 위에 올라오는 카드) -->
      <div class="content-panel">
        <!-- AI 매칭 배지 + 카테고리 -->
        <div class="top-meta">
          <span v-if="spot.matchScore" class="match-badge">
            ✦ AI {{ spot.matchScore }}% 매칭
          </span>
          <span v-if="spot.category" class="category-tag">{{ spot.category }}</span>
        </div>

        <!-- 여행지 이름 -->
        <h1 class="spot-name">{{ spot.name }}</h1>

        <!-- 평점 + 위치 -->
        <div class="rating-row">
          <span v-if="spot.rating" class="stars">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5A623" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {{ spot.rating.toFixed(1) }}
            <span class="review-count" v-if="spot.reviewCount">({{ spot.reviewCount }})</span>
          </span>
          <span v-if="spot.address" class="location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {{ spot.address.split(' ').slice(0, 2).join(' ') }}
          </span>
        </div>

        <!-- 설명 -->
        <p v-if="spot.description" class="description">{{ spot.description }}</p>

        <!-- AI 추천 이유 카드 -->
        <div v-if="spot.recommendReason" class="reason-card">
          <div class="reason-header">
            <span class="reason-icon">✦</span>
            <span class="reason-title">왜 추천했나요?</span>
          </div>
          <p class="reason-text">{{ spot.recommendReason }}</p>
        </div>

        <!-- 상세 정보 -->
        <div class="info-list">
          <div v-if="spot.address" class="info-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ spot.address }}</span>
          </div>
          <div v-if="spot.openingHours" class="info-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span>{{ spot.openingHours }}</span>
          </div>
          <div v-if="spot.admissionFee !== undefined" class="info-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
            </svg>
            <span>{{ spot.admissionFee === 0 ? '무료' : `${spot.admissionFee.toLocaleString()}원` }}</span>
          </div>
          <div v-if="spot.phone" class="info-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14 19.79 19.79 0 0 1 1.61 5.47 2 2 0 0 1 3.58 3.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>{{ spot.phone }}</span>
          </div>
        </div>

        <div style="height: 100px" />
      </div>
    </template>

    <!-- 에러 -->
    <div v-else class="error-state">
      <p>여행지 정보를 불러올 수 없어요</p>
      <button class="btn-retry" @click="router.back()">돌아가기</button>
    </div>

    <!-- 하단 고정 바 -->
    <div v-if="spot" class="bottom-bar">
      <button class="btn-bookmark-bar" :class="{ active: bookmarked }" @click="toggleBookmark">
        <svg width="22" height="22" viewBox="0 0 24 24" :fill="bookmarked ? '#1D6FBF' : 'none'" :stroke="bookmarked ? '#1D6FBF' : 'var(--c-text-sub)'" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <button class="btn-add-schedule" @click="addToSchedule">
        내 일정에 추가
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-bg);
  min-height: 100dvh;
  position: relative;
}

/* ── 히어로 ── */
.hero {
  position: relative;
  height: 286px;
  background: var(--c-border);
  overflow: hidden;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #DDE8F2;
}
.hero-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 100%);
}
.hero-right-actions {
  display: flex;
  gap: 8px;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--c-text);
}

/* ── 콘텐츠 패널 ── */
.content-panel {
  margin-top: -24px;
  background: var(--c-surface);
  border-radius: 24px 24px 0 0;
  padding: 24px 24px 0;
  min-height: calc(100dvh - 262px);
}

.top-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.match-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-primary);
  background: var(--c-primary-bg);
  padding: 3px 10px;
  border-radius: 99px;
}
.category-tag {
  font-size: 12px;
  color: var(--c-text-sub);
  background: var(--c-bg);
  padding: 3px 10px;
  border-radius: 99px;
}

.spot-name {
  font-size: 24px;
  font-weight: 800;
  color: var(--c-text);
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.stars {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}
.review-count { color: var(--c-text-sub); font-weight: 400; }
.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--c-text-sub);
}

.description {
  font-size: 14px;
  color: var(--c-text-sub);
  line-height: 1.7;
  margin-bottom: 20px;
}

/* ── AI 추천 이유 ── */
.reason-card {
  background: var(--c-primary-bg);
  border-radius: var(--r-card);
  padding: 16px;
  margin-bottom: 20px;
}
.reason-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.reason-icon { color: var(--c-primary); font-size: 14px; }
.reason-title { font-size: 13px; font-weight: 700; color: var(--c-primary); }
.reason-text { font-size: 14px; color: var(--c-text); line-height: 1.65; }

/* ── 상세 정보 ── */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--c-border);
  padding-top: 20px;
}
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: var(--c-text);
  line-height: 1.5;
}
.info-row svg { flex-shrink: 0; margin-top: 2px; }

/* ── 하단 바 ── */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--max-width);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px 28px;
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
}
.btn-bookmark-bar {
  width: 50px;
  height: 50px;
  border-radius: var(--r-card-sm);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.15s;
}
.btn-bookmark-bar.active { border-color: var(--c-primary); }
.btn-add-schedule {
  flex: 1;
  height: 50px;
  border: none;
  border-radius: var(--r-card-sm);
  background: var(--c-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

/* ── 스켈레톤 ── */
.skeleton-wrap { padding: 0; }
.hero-skeleton { height: 286px; border-radius: 0; }
.skeleton-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.skeleton {
  background: linear-gradient(90deg, var(--c-border) 25%, var(--c-bg) 50%, var(--c-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
.line { height: 14px; }
.w40 { width: 40%; }
.w60 { width: 60%; }
.w80 { width: 80%; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

/* ── 에러 ── */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60dvh;
  gap: 16px;
  color: var(--c-text-muted);
}
.btn-retry {
  padding: 10px 24px;
  border-radius: 99px;
  border: 1.5px solid var(--c-border);
  background: none;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  color: var(--c-text-sub);
}
</style>
