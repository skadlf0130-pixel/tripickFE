<!-- 온보딩 선호도 설정 — 3단계: 지역 → 관심사 → 이동수단 -->
<!-- 완료 후 usePreferencesStore.save() → recommendationApi에서 사용 -->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePreferencesStore } from '@/stores/preferences'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const prefs  = usePreferencesStore()
const toast  = useToast()

const step = ref(1)

// Step 1: 지역
const regions = ['서울', '경기·인천', '강원', '충청', '전라', '경상', '제주']
const selectedRegion = ref(null)

// Step 2: 관심사 (최소 3개)
const interests = [
  { id: '자연·힐링' },
  { id: '액티비티' },
  { id: '미식탐방' },
  { id: '문화·예술' },
  { id: '도시탐방' },
  { id: '축제·이벤트' },
]
const selectedInterests = ref([])

function toggleInterest(id) {
  const idx = selectedInterests.value.indexOf(id)
  if (idx === -1) selectedInterests.value.push(id)
  else selectedInterests.value.splice(idx, 1)
}

// Step 3: 이동수단
const transports = ['대중교통', '자가용', '자전거', '무관']
const selectedTransport = ref('무관')

const progress = computed(() => [33, 66, 100][step.value - 1])

// 버튼 텍스트
const btnLabel = computed(() => {
  if (step.value === 3) return '시작하기'
  if (step.value === 2 && selectedInterests.value.length >= 3)
    return `다음 · ${selectedInterests.value.length}개 선택됨`
  return '다음'
})

function next() {
  if (step.value === 2 && selectedInterests.value.length < 3) {
    toast.error('관심사를 3개 이상 선택해주세요')
    return
  }
  if (step.value < 3) { step.value++; return }
  try {
    prefs.save({
      region:         selectedRegion.value,
      interests:      selectedInterests.value,
      transportation: selectedTransport.value,
    })
  } catch { /* 저장 실패해도 홈으로 이동 */ }
  toast.success('취향 설정 완료! AI 추천을 준비할게요')
  router.push('/').catch(() => { window.location.href = '/' })
}

function skip() {
  prefs.save({ region: null, interests: ['자연·힐링', '문화·예술', '미식탐방'], transportation: '무관' })
  router.push('/')
}
</script>

<template>
  <div class="page">
    <!-- 상단 헤더 -->
    <div class="header">
      <button v-if="step > 1" class="btn-back" @click="step--">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <button class="btn-skip" @click="skip">건너뛰기</button>
    </div>

    <!-- 진행바 -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <p class="step-label">STEP {{ step }}/3</p>

    <!-- ─── Step 1: 지역 ─── -->
    <template v-if="step === 1">
      <h1 class="heading">주로 여행하는<br>지역은 어디인가요?</h1>
      <p class="sub">선택 안 하면 전국 여행지를 추천드려요</p>

      <div class="region-grid">
        <button class="region-btn" :class="{ active: selectedRegion === null }" @click="selectedRegion = null">
          🗺️ 전국
        </button>
        <button
          v-for="r in regions" :key="r"
          class="region-btn"
          :class="{ active: selectedRegion === r }"
          @click="selectedRegion = r"
        >{{ r }}</button>
      </div>
    </template>

    <!-- ─── Step 2: 관심사 ─── -->
    <template v-else-if="step === 2">
      <h1 class="heading">어떤 여행을<br>좋아하세요?</h1>
      <p class="sub">취향을 알려주시면 AI가 딱 맞는 여행지와 축제를 찾아드려요. <b>3개 이상</b> 선택</p>

      <div class="interest-grid">
        <button
          v-for="item in interests" :key="item.id"
          class="interest-btn"
          :class="{ active: selectedInterests.includes(item.id) }"
          @click="toggleInterest(item.id)"
        >
          <div class="interest-overlay" />
          <span class="interest-label">{{ item.id }}</span>
          <div v-if="selectedInterests.includes(item.id)" class="check-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </button>
      </div>
    </template>

    <!-- ─── Step 3: 이동수단 ─── -->
    <template v-else>
      <h1 class="heading">주로 어떻게<br>이동하시나요?</h1>
      <p class="sub">최적 경로 추천에 활용돼요</p>

      <div class="transport-list">
        <button
          v-for="t in transports" :key="t"
          class="transport-btn"
          :class="{ active: selectedTransport === t }"
          @click="selectedTransport = t"
        >
          {{ t }}
          <svg v-if="selectedTransport === t" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- 하단 고정 버튼 -->
    <div class="btn-footer">
      <button class="btn-next" @click="next">{{ btnLabel }}</button>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-bg);
  padding: 16px 24px 120px;
  position: relative;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}
.btn-back {
  background: none;
  border: none;
  color: var(--c-text);
  cursor: pointer;
  padding: 4px;
  display: flex;
}
.btn-skip {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--c-text-muted);
  cursor: pointer;
  margin-left: auto;
  font-family: inherit;
}

/* 진행바 */
.progress-track {
  height: 4px;
  background: var(--c-border);
  border-radius: 99px;
  margin-top: 12px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 99px;
  transition: width 0.35s ease;
}

.step-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-primary);
  letter-spacing: 0.08em;
  margin-top: 22px;
}

.heading {
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-text);
  margin-top: 10px;
  line-height: 1.32;
}

.sub {
  font-size: 14px;
  color: var(--c-text-sub);
  line-height: 1.6;
  margin-top: 12px;
  margin-bottom: 26px;
}
.sub b { color: var(--c-primary); font-weight: 600; }

/* ── Step 1: 지역 그리드 ── */
.region-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.region-btn {
  height: 56px;
  border-radius: var(--r-card-sm);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-sub);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.region-btn.active {
  border-color: var(--c-primary);
  background: var(--c-primary-bg);
  color: var(--c-primary);
}

/* ── Step 2: 관심사 카드 (디자인 파일 스타일) ── */
.interest-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 13px;
}
.interest-btn {
  position: relative;
  height: 106px;
  border-radius: 18px;
  overflow: hidden;
  border: 2px solid transparent;
  /* 텍스처 배경 */
  background: repeating-linear-gradient(135deg, #EFECE4 0 11px, #E7E3DA 11px 22px);
  cursor: pointer;
  transition: border-color 0.15s;
  font-family: inherit;
  padding: 0;
}
.interest-btn.active {
  border-color: var(--c-primary);
}
.interest-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(42, 39, 34, 0.55));
  pointer-events: none;
}
.interest-label {
  position: absolute;
  left: 12px;
  bottom: 11px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.check-badge {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--c-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Step 3: 이동수단 ── */
.transport-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.transport-btn {
  width: 100%;
  height: 58px;
  border-radius: var(--r-card-sm);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-sub);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.transport-btn.active {
  border-color: var(--c-primary);
  background: var(--c-primary-bg);
  color: var(--c-primary);
}

/* ── 하단 고정 버튼 ── */
.btn-footer {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: var(--max-width);
  padding: 18px 30px 34px;
  background: linear-gradient(180deg, rgba(235, 246, 253, 0), var(--c-bg) 28%);
}
.btn-next {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 16px;
  background: var(--c-primary);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-next:active { opacity: 0.85; }
</style>
