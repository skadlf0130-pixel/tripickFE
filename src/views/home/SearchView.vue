<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { spotApi } from '@/api/spots'
import { festivalApi } from '@/api/festivals'
import { postApi } from '@/api/posts'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast  = useToast()

const query     = ref('')
const activeTab = ref('spot')   // spot | festival | review
const loading   = ref(false)

const spotResults     = ref([])
const festivalResults = ref([])
const reviewResults   = ref([])

const selectedRegion   = ref(null)
const selectedCategory = ref(null)

const regionChips   = ['전체', '서울', '경기', '강원', '충청', '전라', '경상', '제주']
const categoryChips = ['전체', '자연·힐링', '액티비티', '문화·예술', '미식탐방', '도시탐방']

const inputEl = ref(null)

onMounted(() => inputEl.value?.focus())

const currentResults = computed(() => {
  if (activeTab.value === 'spot')     return spotResults.value
  if (activeTab.value === 'festival') return festivalResults.value
  return reviewResults.value
})

let debounceTimer = null
watch([query, activeTab, selectedRegion, selectedCategory], () => {
  clearTimeout(debounceTimer)
  if (!query.value.trim()) {
    spotResults.value = []
    festivalResults.value = []
    reviewResults.value = []
    return
  }
  debounceTimer = setTimeout(search, 350)
})

async function search() {
  loading.value = true
  try {
    const q = query.value.trim()
    if (activeTab.value === 'spot') {
      const { data } = await spotApi.getList({
        keyword:  q,
        region:   selectedRegion.value !== '전체' ? selectedRegion.value : undefined,
        category: selectedCategory.value !== '전체' ? selectedCategory.value : undefined,
        page: 0, size: 20,
      })
      spotResults.value = data.data?.content ?? []
    } else if (activeTab.value === 'festival') {
      const { data } = await festivalApi.getList({
        keyword: q,
        region:  selectedRegion.value !== '전체' ? selectedRegion.value : undefined,
        page: 0, size: 20,
      })
      festivalResults.value = data.data?.content ?? []
    } else {
      const { data } = await postApi.getList({ keyword: q, page: 0, size: 20 })
      reviewResults.value = data.data?.content ?? []
    }
  } catch {
    toast.error('검색 중 오류가 발생했어요')
  } finally {
    loading.value = false
  }
}

function clearQuery() {
  query.value = ''
  inputEl.value?.focus()
}

function goSpot(id)     { router.push(`/spots/${id}`) }
function goFestival(id) { router.push(`/festivals/${id}`) }
function goReview(id)   { router.push(`/community/reviews/${id}`) }
</script>

<template>
  <div class="page">
    <!-- 검색바 -->
    <div class="search-bar-wrap">
      <div class="search-bar">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          ref="inputEl"
          v-model="query"
          class="search-input"
          placeholder="여행지, 축제, 후기 검색..."
          type="search"
          @keyup.enter="search"
        />
        <button v-if="query" class="btn-clear" @click="clearQuery">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <button class="btn-cancel" @click="router.back()">취소</button>
    </div>

    <!-- 탭 -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'spot' }" @click="activeTab = 'spot'">
        여행지
        <span v-if="spotResults.length" class="tab-count">{{ spotResults.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'festival' }" @click="activeTab = 'festival'">
        축제
        <span v-if="festivalResults.length" class="tab-count">{{ festivalResults.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'review' }" @click="activeTab = 'review'">
        후기
        <span v-if="reviewResults.length" class="tab-count">{{ reviewResults.length }}</span>
      </button>
    </div>

    <!-- 필터 칩 (여행지/축제 탭) -->
    <template v-if="activeTab !== 'review'">
      <div class="filter-row">
        <button
          v-for="r in regionChips" :key="r"
          class="chip"
          :class="{ active: selectedRegion === r || (!selectedRegion && r === '전체') }"
          @click="selectedRegion = r === '전체' ? null : r"
        >{{ r }}</button>
      </div>
      <div v-if="activeTab === 'spot'" class="filter-row">
        <button
          v-for="c in categoryChips" :key="c"
          class="chip"
          :class="{ active: selectedCategory === c || (!selectedCategory && c === '전체') }"
          @click="selectedCategory = c === '전체' ? null : c"
        >{{ c }}</button>
      </div>
    </template>

    <!-- 결과 없음 / 검색 전 -->
    <div v-if="!query.trim()" class="empty-state">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--c-border)" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <p>검색어를 입력해보세요</p>
    </div>

    <div v-else-if="loading" class="loading-list">
      <div v-for="i in 5" :key="i" class="skeleton-item">
        <div class="skeleton thumb" />
        <div class="skeleton-texts">
          <div class="skeleton line w70" />
          <div class="skeleton line w50" />
        </div>
      </div>
    </div>

    <div v-else-if="!currentResults.length" class="empty-state">
      <p>"{{ query }}"에 대한 결과가 없어요</p>
    </div>

    <!-- 결과 목록 -->
    <div v-else class="result-list">
      <!-- 여행지 결과 -->
      <template v-if="activeTab === 'spot'">
        <div
          v-for="item in spotResults" :key="item.id"
          class="result-item"
          @click="goSpot(item.id)"
        >
          <div class="thumb-wrap">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="thumb" />
            <div v-else class="thumb thumb-empty" />
            <span v-if="item.matchScore" class="match-chip">{{ item.matchScore }}%</span>
          </div>
          <div class="result-info">
            <p class="result-name">{{ item.name }}</p>
            <p class="result-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ item.address?.split(' ').slice(0, 2).join(' ') }}
            </p>
            <div v-if="item.category" class="result-tags">
              <span class="tag">{{ item.category }}</span>
            </div>
          </div>
          <button class="btn-bookmark-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-sub)" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </template>

      <!-- 축제 결과 -->
      <template v-else-if="activeTab === 'festival'">
        <div
          v-for="item in festivalResults" :key="item.id"
          class="result-item"
          @click="goFestival(item.id)"
        >
          <div class="thumb-wrap">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="thumb" />
            <div v-else class="thumb thumb-empty" />
          </div>
          <div class="result-info">
            <p class="result-name">{{ item.name }}</p>
            <p class="result-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              {{ item.startDate }} ~ {{ item.endDate }}
            </p>
            <p class="result-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ item.location }}
            </p>
          </div>
        </div>
      </template>

      <!-- 후기 결과 -->
      <template v-else>
        <div
          v-for="item in reviewResults" :key="item.id"
          class="result-item"
          @click="goReview(item.id)"
        >
          <div class="thumb-wrap">
            <img v-if="item.photoUrls?.[0]" :src="item.photoUrls[0]" :alt="item.title" class="thumb" />
            <div v-else class="thumb thumb-empty" />
          </div>
          <div class="result-info">
            <p class="result-name">{{ item.title }}</p>
            <p class="result-meta">{{ item.authorName }} · {{ item.createdAt?.slice(0, 10) }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-bg);
  min-height: 100dvh;
}

/* ── 검색바 ── */
.search-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 12px;
  background: var(--c-surface);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--c-border);
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--c-bg);
  border-radius: 12px;
  padding: 0 12px;
  height: 44px;
  gap: 8px;
}
.search-icon { flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 15px;
  color: var(--c-text);
  font-family: inherit;
  outline: none;
}
.search-input::placeholder { color: var(--c-text-muted); }
.btn-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text-muted);
  display: flex;
  padding: 2px;
}
.btn-cancel {
  background: none;
  border: none;
  font-size: 14px;
  color: var(--c-primary);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

/* ── 탭 ── */
.tab-bar {
  display: flex;
  gap: 0;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
}
.tab-btn {
  flex: 1;
  height: 44px;
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-muted);
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.15s;
}
.tab-btn.active {
  color: var(--c-primary);
  border-bottom-color: var(--c-primary);
}
.tab-count {
  font-size: 11px;
  background: var(--c-primary);
  color: #fff;
  border-radius: 99px;
  padding: 1px 6px;
  font-weight: 700;
}

/* ── 필터 칩 ── */
.filter-row {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  background: var(--c-surface);
}
.filter-row::-webkit-scrollbar { display: none; }
.chip {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border-radius: 99px;
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-sub);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.chip.active {
  border-color: var(--c-primary);
  background: var(--c-primary-bg);
  color: var(--c-primary);
  font-weight: 600;
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

/* ── 결과 목록 ── */
.result-list {
  padding: 8px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--c-border);
  cursor: pointer;
}
.result-item:last-child { border-bottom: none; }

.thumb-wrap { position: relative; flex-shrink: 0; }
.thumb {
  width: 92px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  background: var(--c-border);
  display: block;
}
.thumb-empty { background: var(--c-border); }
.match-chip {
  position: absolute;
  top: 6px;
  left: 6px;
  background: var(--c-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 99px;
}

.result-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--c-text-muted);
}
.result-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag {
  font-size: 11px;
  color: var(--c-primary);
  background: var(--c-primary-bg);
  padding: 2px 8px;
  border-radius: 99px;
}

.btn-bookmark-sm {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
}

/* ── 스켈레톤 로딩 ── */
.loading-list {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.skeleton-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--c-border);
}
.skeleton-texts { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.skeleton {
  background: linear-gradient(90deg, var(--c-border) 25%, var(--c-bg) 50%, var(--c-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
.thumb.skeleton { width: 92px; height: 72px; border-radius: 10px; }
.line { height: 12px; }
.w50 { width: 50%; }
.w70 { width: 70%; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
</style>
