<!-- 홈 (AI 추천 피드) — 위치 헤더 + 검색 + 카테고리 + AI 추천 카드 + 축제 미니카드 -->
<!-- recommendationApi.recommend() + festivalApi.getList() 조합 -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { recommendationApi } from '@/api/recommendations'
import { festivalApi } from '@/api/festivals'
import { usePreferencesStore } from '@/stores/preferences'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const prefs  = usePreferencesStore()
const auth   = useAuthStore()

const loading         = ref(false)
const recommendations = ref([])   // RecommendedSpotResponse[]
const festivals       = ref([])   // FestivalResponse[]
const bookmarks       = ref(new Set())

// 카테고리 필터 (BE category 필드 기준 부분 매칭)
const categories     = ['전체', '자연·힐링', '액티비티', '미식탐방', '문화·예술', '축제']
const activeCategory = ref('전체')

const filtered = computed(() => {
  if (activeCategory.value === '전체') return recommendations.value
  return recommendations.value.filter(r =>
    r.category?.includes(activeCategory.value)
  )
})

async function fetchData() {
  loading.value = true
  try {
    const params = {
      region:         prefs.region,
      interests:      prefs.interests,
      transportation: prefs.transportation,
    }
    const [recRes, festRes] = await Promise.all([
      recommendationApi.recommend(params),
      festivalApi.getList({ size: 10 }),
    ])
    // BE RecommendationResponse: { recommendationId, travelSpots[], festivals[], createdAt }
    recommendations.value = recRes.data.data?.travelSpots ?? []
    festivals.value        = festRes.data.data?.content ?? []
  } catch {
    // 오류 시 빈 상태 유지 (화면은 보임)
  } finally {
    loading.value = false
  }
}

function toggleBookmark(id) {
  if (bookmarks.value.has(id)) {
    bookmarks.value.delete(id)
    festivalApi.removeBookmark(id).catch(() => {})
  } else {
    bookmarks.value.add(id)
    festivalApi.addBookmark(id).catch(() => {})
  }
}

function formatMatch(score) {
  return Math.round((score ?? 0.9) * 100)
}

onMounted(fetchData)
</script>

<template>
  <DefaultLayout>
    <template #header>
      <!-- 로케이션 헤더 + 알림 버튼 -->
      <div class="top-bar">
        <div class="location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span>{{ prefs.region ?? '전국' }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        <button class="btn-notif" @click="router.push('/mypage/notifications')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>
          </svg>
          <span class="notif-dot" />
        </button>
      </div>

      <!-- 인사말 -->
      <div class="greeting">
        <span class="greeting-name">{{ auth.user?.name ?? '여행자' }}님,</span>
        <span class="greeting-msg"> 오늘 어디로 떠나볼까요?</span>
      </div>

      <!-- 검색창 -->
      <button class="search-bar" @click="router.push('/search')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9FACA6" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.4-4.4"/>
        </svg>
        <span>여행지, 축제, 음식을 검색해보세요</span>
      </button>

      <!-- 카테고리 칩 -->
      <div class="categories">
        <button
          v-for="cat in categories"
          :key="cat"
          class="chip"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </template>

    <!-- 로딩 -->
    <LoadingSpinner v-if="loading" :overlay="false" message="AI가 추천을 준비 중이에요..." />

    <template v-else>
      <!-- ── AI 추천 섹션 ── -->
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">
            <span class="badge-ai">AI</span>
            맞춤 추천
          </h2>
          <span class="see-all" @click="router.push('/recommendation')">전체보기</span>
        </div>

        <div v-if="filtered.length === 0" class="empty">
          <p>추천 결과가 없어요.<br>온보딩에서 취향을 설정해보세요!</p>
          <button class="btn-go" @click="router.push('/auth/onboarding')">취향 설정하기</button>
        </div>

        <div v-else class="rec-list">
          <div
            v-for="rec in filtered"
            :key="rec.spotId"
            class="rec-card"
            @click="router.push(`/spots/${rec.spotId}`)"
          >
            <div class="rec-card__img">
              <img v-if="rec.imageUrl" :src="rec.imageUrl" :alt="rec.name" />
              <div v-else class="rec-card__img-placeholder" />
              <!-- BE에 score 없음 → sortOrder 기반 순위 표시 -->
              <div class="rec-card__match">추천 {{ rec.sortOrder ?? 1 }}순위</div>
            </div>
            <div class="rec-card__body">
              <div class="rec-card__tags">
                <span v-if="rec.category" class="tag">{{ rec.category }}</span>
                <span v-if="rec.region" class="tag">{{ rec.region }}</span>
              </div>
              <h3 class="rec-card__name">{{ rec.name }}</h3>
              <div class="rec-card__meta">
                <span class="rec-card__region">{{ rec.region }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 가까운 축제 섹션 ── -->
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">🎉 주변 축제</h2>
          <span class="see-all" @click="router.push('/festivals')">전체보기</span>
        </div>

        <div class="festival-scroll">
          <div
            v-for="fest in festivals"
            :key="fest.festivalId"
            class="festival-card"
            @click="router.push(`/festivals/${fest.festivalId}`)"
          >
            <div class="festival-card__img">
              <img v-if="fest.imageUrl" :src="fest.imageUrl" :alt="fest.name" />
              <div v-else class="festival-card__img-placeholder" />
              <button
                class="festival-card__heart"
                @click.stop="toggleBookmark(fest.festivalId)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1A5.5 5.5 0 0 0 3.2 12.4L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"
                    :fill="bookmarks.has(fest.festivalId) ? 'var(--c-error)' : 'none'"
                    :stroke="bookmarks.has(fest.festivalId) ? 'var(--c-error)' : 'currentColor'"
                  />
                </svg>
              </button>
            </div>
            <div class="festival-card__body">
              <p class="festival-card__region">{{ fest.region }}</p>
              <h3 class="festival-card__name">{{ fest.name }}</h3>
              <p class="festival-card__date">{{ fest.startDate }} ~ {{ fest.endDate }}</p>
            </div>
          </div>

          <div v-if="festivals.length === 0" class="empty">
            <p>근처 축제 정보를 불러오고 있어요</p>
          </div>
        </div>
      </section>
    </template>
  </DefaultLayout>
</template>

<style scoped>
/* 공통 */
.section { padding: 0 20px 32px; }
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text);
  display: flex;
  align-items: center;
  gap: 6px;
}
.badge-ai {
  background: var(--c-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  letter-spacing: 0.04em;
}
.see-all {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-primary);
  cursor: pointer;
}

/* 탑 바 (헤더 안) */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: var(--header-height);
}
.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
}
.btn-notif {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--c-text);
}
.notif-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-error);
  border: 1.5px solid var(--c-surface);
}

.greeting {
  padding: 0 20px 4px;
  font-size: 15px;
  color: var(--c-text-sub);
}
.greeting-name { font-weight: 700; color: var(--c-text); }

/* 검색창 */
.search-bar {
  margin: 8px 20px;
  height: 48px;
  border-radius: var(--r-pill);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  color: var(--c-text-muted);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  width: calc(100% - 40px);
  text-align: left;
}

/* 카테고리 칩 */
.categories {
  display: flex;
  gap: 8px;
  padding: 8px 20px 12px;
  overflow-x: auto;
  scrollbar-width: none;
}
.categories::-webkit-scrollbar { display: none; }

.chip {
  white-space: nowrap;
  height: 34px;
  padding: 0 16px;
  border-radius: var(--r-pill);
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-sub);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.chip.active {
  background: var(--c-primary);
  border-color: var(--c-primary);
  color: #fff;
}

/* AI 추천 카드 */
.rec-list { display: flex; flex-direction: column; gap: 16px; }

.rec-card {
  border-radius: var(--r-card);
  overflow: hidden;
  background: var(--c-surface);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform 0.15s;
}
.rec-card:active { transform: scale(0.98); }

.rec-card__img {
  position: relative;
  height: 200px;
  background: var(--c-tag-gray);
}
.rec-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rec-card__img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--c-primary-bg) 0%, var(--c-tag-teal) 100%); }

.rec-card__match {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--c-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--r-pill);
}

.rec-card__body { padding: 16px; }
.rec-card__tags { display: flex; gap: 6px; margin-bottom: 8px; }
.tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-primary);
  background: var(--c-primary-bg);
  padding: 2px 8px;
  border-radius: var(--r-pill);
}
.rec-card__name {
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text);
  margin-bottom: 6px;
}
.rec-card__desc {
  font-size: 13px;
  color: var(--c-text-sub);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rec-card__meta { margin-top: 10px; }
.rec-card__region { font-size: 12px; color: var(--c-text-muted); }

/* 축제 가로 스크롤 */
.festival-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.festival-scroll::-webkit-scrollbar { display: none; }

.festival-card {
  flex-shrink: 0;
  width: 160px;
  border-radius: var(--r-card-sm);
  overflow: hidden;
  background: var(--c-surface);
  box-shadow: var(--shadow-card);
  cursor: pointer;
}
.festival-card__img {
  position: relative;
  height: 120px;
  background: var(--c-tag-gray);
}
.festival-card__img img { width: 100%; height: 100%; object-fit: cover; }
.festival-card__img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--c-tag-teal), var(--c-primary-bg)); }

.festival-card__heart {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.85);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--c-text-sub);
}

.festival-card__body { padding: 10px 12px 12px; }
.festival-card__region { font-size: 11px; color: var(--c-text-muted); margin-bottom: 4px; }
.festival-card__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.festival-card__date { font-size: 11px; color: var(--c-text-muted); margin-top: 4px; }

/* 빈 상태 */
.empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--c-text-sub);
  font-size: 14px;
  line-height: 1.7;
}
.btn-go {
  margin-top: 14px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: var(--r-pill);
  background: var(--c-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}
</style>
