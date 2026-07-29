<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '@/api/posts'
import { useToast } from '@/composables/useToast'
import BottomNav from '@/components/common/BottomNav.vue'

const router = useRouter()
const toast  = useToast()

// BE PostResponse 필드: postId, userId, festivalId, title, content,
//                       viewCount, likeCount, commentCount, createdAt
// sort/keyword/authorName/photoUrls 미지원 → 클라이언트에서 처리

const sort    = ref('latest')
const posts   = ref([])
const loading = ref(true)
const page    = ref(0)
const hasMore = ref(true)
const likedSet = ref(new Set())   // 로컬 좋아요 추적

const sortOptions = [
  { value: 'latest',  label: '최신' },
  { value: 'popular', label: '인기' },
]

async function fetchPosts(reset = false) {
  if (reset) { page.value = 0; posts.value = []; hasMore.value = true }
  if (!hasMore.value) return
  loading.value = true
  try {
    // BE PostController: page, size 만 지원
    const { data } = await postApi.getList({ page: page.value, size: 10 })
    let items = data.data?.content ?? []
    // 인기순 클라이언트 정렬
    if (sort.value === 'popular') {
      items = [...items].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    }
    posts.value.push(...items)
    hasMore.value = !data.data?.last
    page.value++
  } catch {
    toast.error('후기를 불러올 수 없어요')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPosts(true))

function changeSort(val) {
  sort.value = val
  fetchPosts(true)
}

async function toggleLike(post) {
  const id = post.postId
  try {
    if (likedSet.value.has(id)) {
      await postApi.unlike(id)
      post.likeCount = Math.max(0, (post.likeCount ?? 0) - 1)
      likedSet.value.delete(id)
    } else {
      await postApi.like(id)
      post.likeCount = (post.likeCount ?? 0) + 1
      likedSet.value.add(id)
    }
  } catch {
    toast.error('잠시 후 다시 시도해주세요')
  }
}
</script>

<template>
  <div class="page">
    <!-- 헤더 -->
    <div class="header">
      <h1 class="header-title">여행 후기</h1>
      <button class="btn-write" @click="router.push('/community/reviews/new')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        후기 작성
      </button>
    </div>

    <!-- 정렬 탭 -->
    <div class="sort-bar">
      <button
        v-for="opt in sortOptions" :key="opt.value"
        class="sort-btn"
        :class="{ active: sort === opt.value }"
        @click="changeSort(opt.value)"
      >{{ opt.label }}</button>
    </div>

    <!-- 로딩 스켈레톤 -->
    <div v-if="loading && !posts.length" class="feed">
      <div v-for="i in 4" :key="i" class="post-card skeleton-card">
        <div class="skeleton-row">
          <div class="skeleton avatar-sk" />
          <div class="skeleton-texts">
            <div class="skeleton line w50" />
            <div class="skeleton line w30" />
          </div>
        </div>
        <div class="skeleton line w90 mt8" />
        <div class="skeleton image-sk" />
      </div>
    </div>

    <!-- 피드 -->
    <div v-else class="feed">
      <article
        v-for="post in posts" :key="post.postId"
        class="post-card"
        @click="router.push(`/community/reviews/${post.postId}`)"
      >
        <!-- 작성자 (BE: userId만 반환, authorName 없음) -->
        <div class="author-row">
          <div class="avatar">{{ String(post.userId ?? '?')[0] }}</div>
          <div class="author-info">
            <p class="author-name">사용자 {{ post.userId }}</p>
            <p class="post-date">{{ post.createdAt?.slice(0, 10) }}</p>
          </div>
          <!-- festivalId만 있음, festivalName 없음 -->
          <span v-if="post.festivalId" class="festival-badge">축제 후기</span>
        </div>

        <!-- 제목 + 본문 미리보기 -->
        <p class="post-title">{{ post.title }}</p>
        <p v-if="post.content" class="post-preview">{{ post.content }}</p>

        <!-- 이미지: PostResponse에 media 없음, PostDetailResponse에만 있음 -->
        <!-- 상세 페이지에서만 이미지 표시 -->

        <!-- 액션 -->
        <div class="actions-row" @click.stop>
          <button class="action-btn" :class="{ liked: likedSet.has(post.postId) }" @click="toggleLike(post)">
            <svg width="17" height="17" viewBox="0 0 24 24"
              :fill="likedSet.has(post.postId) ? '#E53E3E' : 'none'"
              :stroke="likedSet.has(post.postId) ? '#E53E3E' : 'var(--c-text-muted)'"
              stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ post.likeCount ?? 0 }}</span>
          </button>
          <button class="action-btn" @click="router.push(`/community/reviews/${post.postId}`)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{{ post.commentCount ?? 0 }}</span>
          </button>
        </div>
      </article>

      <!-- 더 보기 -->
      <button v-if="hasMore && !loading" class="btn-more" @click="fetchPosts()">
        더 보기
      </button>
      <p v-if="!hasMore && posts.length" class="end-label">모든 후기를 봤어요</p>
      <p v-if="!loading && !posts.length" class="empty-label">아직 후기가 없어요. 첫 후기를 남겨보세요!</p>
    </div>

    <BottomNav />
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
  justify-content: space-between;
  padding: 20px 20px 0;
  background: var(--c-surface);
}
.header-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--c-text);
}
.btn-write {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 99px;
  border: none;
  background: var(--c-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

/* ── 정렬 탭 ── */
.sort-bar {
  display: flex;
  padding: 0 20px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  gap: 0;
}
.sort-btn {
  padding: 14px 16px 12px;
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-muted);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.sort-btn.active {
  color: var(--c-primary);
  border-bottom-color: var(--c-primary);
}

/* ── 피드 ── */
.feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 80px;
}
.post-card {
  background: var(--c-surface);
  padding: 18px 20px 14px;
  cursor: pointer;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-primary-bg);
  color: var(--c-primary);
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.author-info { flex: 1; min-width: 0; }
.author-name { font-size: 13px; font-weight: 700; color: var(--c-text); }
.post-date   { font-size: 11px; color: var(--c-text-muted); }
.festival-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-primary);
  background: var(--c-primary-bg);
  padding: 3px 8px;
  border-radius: 99px;
  white-space: nowrap;
}

.post-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 4px;
}
.post-preview {
  font-size: 13px;
  color: var(--c-text-sub);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

/* 이미지 그리드 */
.image-grid {
  display: grid;
  gap: 3px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
}
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; }
.grid-3 .post-img:first-child { grid-row: 1 / 3; }
.post-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
.grid-1 .post-img { aspect-ratio: 16/9; }
.more-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: calc(50% - 1.5px);
  aspect-ratio: 1;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 액션 */
.actions-row {
  display: flex;
  gap: 16px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--c-text-muted);
  font-family: inherit;
}
.action-btn.liked span { color: #E53E3E; font-weight: 600; }

.btn-more {
  margin: 8px 20px;
  width: calc(100% - 40px);
  height: 44px;
  border-radius: var(--r-card-sm);
  border: 1.5px solid var(--c-border);
  background: none;
  font-size: 14px;
  color: var(--c-text-sub);
  font-family: inherit;
  cursor: pointer;
}
.end-label, .empty-label {
  text-align: center;
  font-size: 13px;
  color: var(--c-text-muted);
  padding: 24px;
}

/* 스켈레톤 */
.skeleton-card { background: var(--c-surface); padding: 18px 20px; }
.skeleton-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.skeleton-texts { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.skeleton {
  background: linear-gradient(90deg, var(--c-border) 25%, var(--c-bg) 50%, var(--c-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
.avatar-sk { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
.image-sk { height: 160px; border-radius: 12px; margin-top: 12px; }
.line { height: 12px; }
.w30 { width: 30%; }
.w50 { width: 50%; }
.w90 { width: 90%; }
.mt8 { margin-top: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
</style>
