<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { festivalApi } from '@/api/festivals'
import { useToast } from '@/composables/useToast'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

// BE FestivalDetailResponse:
// { festivalId, name, startDate, endDate, region, category,
//   description, imageUrl, officialUrl, latitude, longitude,
//   weatherForecast: [{ date, weatherCode, tempMin, tempMax, description }] }
// BE ReviewPageResponse: { content[], averageRating, totalPages, totalElements }

const festival   = ref(null)
const loading    = ref(true)
const bookmarked = ref(false)
const reviews    = ref([])
const avgRating  = ref(0)

onMounted(async () => {
  try {
    const { data } = await festivalApi.getDetail(route.params.id)
    festival.value = data.data
    await loadReviews()
  } catch {
    toast.error('축제 정보를 불러올 수 없어요')
  } finally {
    loading.value = false
  }
})

async function loadReviews() {
  try {
    const { data } = await festivalApi.getReviews(route.params.id, { page: 0, size: 5 })
    reviews.value  = data.data?.content ?? []
    avgRating.value = data.data?.averageRating ?? 0
  } catch { /* 무시 */ }
}

async function toggleBookmark() {
  try {
    if (bookmarked.value) {
      await festivalApi.removeBookmark(route.params.id)
      toast.success('찜을 해제했어요')
    } else {
      await festivalApi.addBookmark(route.params.id)
      toast.success('찜 목록에 추가됐어요')
    }
    bookmarked.value = !bookmarked.value
  } catch {
    toast.error('잠시 후 다시 시도해주세요')
  }
}

function share() {
  if (navigator.share) {
    navigator.share({ title: festival.value?.name, url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
    toast.success('링크를 복사했어요')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function formatDateRange(start, end) {
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

function isOngoing(start, end) {
  const now = new Date()
  return new Date(start) <= now && now <= new Date(end)
}

const WEATHER_ICON = {
  CLEAR: '☀️', PARTLY_CLOUDY: '⛅', CLOUDY: '☁️',
  RAIN: '🌧️', SNOW: '❄️', THUNDERSTORM: '⛈️',
}
</script>

<template>
  <div class="page">
    <!-- 로딩 -->
    <div v-if="loading" class="skeleton-wrap">
      <div class="skeleton hero-sk" />
      <div class="skeleton-body">
        <div class="skeleton line w60" />
        <div class="skeleton line w40" />
        <div class="skeleton line w80" />
      </div>
    </div>

    <template v-else-if="festival">
      <!-- 히어로 -->
      <div class="hero">
        <img v-if="festival.imageUrl" :src="festival.imageUrl" :alt="festival.name" class="hero-img" />
        <div v-else class="hero-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b0c4d8" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <div class="hero-gradient" />

        <div class="hero-actions">
          <button class="icon-btn" @click="router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div class="hero-right">
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

        <div class="hero-bottom">
          <span v-if="isOngoing(festival.startDate, festival.endDate)" class="badge-live">진행 중</span>
          <span v-if="festival.category" class="badge-category">{{ festival.category }}</span>
        </div>
      </div>

      <!-- 콘텐츠 패널 -->
      <div class="content-panel">
        <h1 class="festival-name">{{ festival.name }}</h1>

        <div class="meta-row">
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {{ formatDateRange(festival.startDate, festival.endDate) }}
          </span>
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {{ festival.region }}
          </span>
          <span v-if="avgRating" class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5A623" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {{ avgRating.toFixed(1) }}
          </span>
        </div>

        <p v-if="festival.description" class="description">{{ festival.description }}</p>

        <!-- 날씨 예보 -->
        <div v-if="festival.weatherForecast?.length" class="weather-section">
          <p class="section-title">기간 날씨 예보</p>
          <div class="weather-row">
            <div v-for="w in festival.weatherForecast" :key="w.date" class="weather-item">
              <p class="weather-date">{{ formatDate(w.date) }}</p>
              <p class="weather-icon-text">{{ WEATHER_ICON[w.weatherCode] ?? '🌤️' }}</p>
              <p class="weather-temp">{{ w.tempMin }}° / {{ w.tempMax }}°</p>
            </div>
          </div>
        </div>

        <!-- 공식 홈페이지 -->
        <a
          v-if="festival.officialUrl"
          :href="festival.officialUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="official-link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
          공식 홈페이지 방문
        </a>

        <!-- 후기 -->
        <div class="review-section">
          <div class="review-header">
            <p class="section-title">후기{{ reviews.length ? ` (${reviews.length})` : '' }}</p>
            <button
              class="btn-write-review"
              @click="router.push(`/community/reviews/new?festivalId=${festival.festivalId}`)"
            >
              후기 작성
            </button>
          </div>

          <div v-if="reviews.length" class="review-list">
            <div v-for="r in reviews" :key="r.reviewId" class="review-item">
              <div class="review-top">
                <div class="reviewer-avatar">{{ String(r.userId ?? '?')[0] }}</div>
                <div class="reviewer-info">
                  <p class="reviewer-name">사용자 {{ r.userId }}</p>
                  <div class="stars">
                    <svg
                      v-for="i in 5" :key="i"
                      width="12" height="12" viewBox="0 0 24 24"
                      :fill="i <= r.rating ? '#F5A623' : '#E2E8F0'" stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                </div>
                <p class="review-date">{{ r.createdAt?.slice(0, 10) }}</p>
              </div>
              <p class="review-content">{{ r.content }}</p>
            </div>
          </div>
          <div v-else class="review-empty">아직 후기가 없어요. 첫 번째 후기를 남겨보세요!</div>
        </div>

        <div style="height: 100px" />
      </div>
    </template>

    <!-- 에러 -->
    <div v-else class="error-state">
      <p>축제 정보를 불러올 수 없어요</p>
      <button class="btn-retry" @click="router.back()">돌아가기</button>
    </div>

    <!-- 하단 바 -->
    <div v-if="festival" class="bottom-bar">
      <button class="btn-bookmark-bar" :class="{ active: bookmarked }" @click="toggleBookmark">
        <svg width="22" height="22" viewBox="0 0 24 24" :fill="bookmarked ? '#1D6FBF' : 'none'" :stroke="bookmarked ? '#1D6FBF' : 'var(--c-text-sub)'" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <button
        class="btn-primary"
        @click="router.push(`/schedules/generate?festivalId=${festival.festivalId}`)"
      >
        일정에 추가
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
.hero { position: relative; height: 300px; background: var(--c-border); overflow: hidden; }
.hero-img { width: 100%; height: 100%; object-fit: cover; }
.hero-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #DDE8F2;
}
.hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.5) 100%);
}
.hero-actions {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 16px; display: flex; align-items: center; justify-content: space-between;
}
.hero-right { display: flex; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.9); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--c-text);
}
.hero-bottom {
  position: absolute; bottom: 16px; left: 16px;
  display: flex; gap: 8px; align-items: center;
}
.badge-live {
  background: #E53E3E; color: #fff;
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 99px;
}
.badge-category {
  background: rgba(255,255,255,0.9); color: var(--c-text);
  font-size: 12px; font-weight: 600;
  padding: 3px 10px; border-radius: 99px;
}

/* ── 콘텐츠 패널 ── */
.content-panel {
  margin-top: -20px;
  background: var(--c-surface);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 0;
  min-height: calc(100dvh - 280px);
}
.festival-name {
  font-size: 22px; font-weight: 800;
  color: var(--c-text); letter-spacing: -0.02em;
  margin-bottom: 10px;
}
.meta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.meta-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; color: var(--c-text-sub);
}
.description {
  font-size: 14px; color: var(--c-text-sub); line-height: 1.7;
  margin-bottom: 20px; border-top: 1px solid var(--c-border); padding-top: 16px;
}

/* ── 날씨 ── */
.weather-section { margin-bottom: 20px; }
.section-title { font-size: 14px; font-weight: 700; color: var(--c-text); margin-bottom: 12px; }
.weather-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.weather-item {
  flex-shrink: 0; background: var(--c-bg); border-radius: 12px;
  padding: 10px 14px; text-align: center; min-width: 64px;
}
.weather-date { font-size: 11px; color: var(--c-text-muted); margin-bottom: 6px; }
.weather-icon-text { font-size: 22px; margin-bottom: 4px; }
.weather-temp { font-size: 11px; color: var(--c-text-sub); white-space: nowrap; }

/* ── 공식 URL ── */
.official-link {
  display: flex; align-items: center; gap: 8px;
  color: var(--c-primary); font-size: 14px; font-weight: 600;
  text-decoration: none;
  padding: 14px 0;
  border-top: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 20px;
}

/* ── 후기 ── */
.review-section { padding-top: 4px; }
.review-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
}
.btn-write-review {
  font-size: 13px; font-weight: 600; color: var(--c-primary);
  background: var(--c-primary-bg); border: none;
  padding: 6px 14px; border-radius: 99px;
  font-family: inherit; cursor: pointer;
}
.review-list { display: flex; flex-direction: column; gap: 16px; }
.review-item {
  background: var(--c-bg); border-radius: var(--r-card);
  padding: 14px 16px;
}
.review-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.reviewer-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--c-primary-bg); color: var(--c-primary);
  font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.reviewer-info { flex: 1; }
.reviewer-name { font-size: 13px; font-weight: 600; color: var(--c-text); }
.stars { display: flex; gap: 2px; margin-top: 2px; }
.review-date { font-size: 11px; color: var(--c-text-muted); }
.review-content { font-size: 14px; color: var(--c-text-sub); line-height: 1.6; }
.review-empty {
  text-align: center; color: var(--c-text-muted);
  font-size: 14px; padding: 30px 0;
}

/* ── 하단 바 ── */
.bottom-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: var(--max-width);
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px 28px;
  background: var(--c-surface); border-top: 1px solid var(--c-border);
}
.btn-bookmark-bar {
  width: 50px; height: 50px; border-radius: var(--r-card-sm);
  border: 1.5px solid var(--c-border); background: var(--c-surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: border-color 0.15s;
}
.btn-bookmark-bar.active { border-color: var(--c-primary); }
.btn-primary {
  flex: 1; height: 50px; border: none;
  border-radius: var(--r-card-sm); background: var(--c-primary);
  color: #fff; font-size: 15px; font-weight: 700;
  font-family: inherit; cursor: pointer;
}

/* ── 스켈레톤 ── */
.skeleton-wrap { padding: 0; }
.hero-sk { height: 300px; border-radius: 0; }
.skeleton-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.skeleton {
  background: linear-gradient(90deg, var(--c-border) 25%, var(--c-bg) 50%, var(--c-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
.line { height: 14px; }
.w40 { width: 40%; } .w60 { width: 60%; } .w80 { width: 80%; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

/* ── 에러 ── */
.error-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 60dvh; gap: 16px; color: var(--c-text-muted);
}
.btn-retry {
  padding: 10px 24px; border-radius: 99px;
  border: 1.5px solid var(--c-border); background: none;
  font-size: 14px; font-family: inherit; cursor: pointer;
  color: var(--c-text-sub);
}
</style>
