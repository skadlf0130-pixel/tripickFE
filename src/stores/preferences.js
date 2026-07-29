// 온보딩에서 수집한 여행 선호 설정 저장
// recommendationApi.recommend() 호출 시 사용
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const KEY = 'user_preferences'

export const usePreferencesStore = defineStore('preferences', () => {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')

  const region         = ref(saved?.region ?? null)         // null = 전국
  const interests      = ref(saved?.interests ?? [])        // string[]
  const transportation = ref(saved?.transportation ?? '무관')
  const completed      = ref(saved?.completed ?? false)

  const isReady = computed(() => completed.value && interests.value.length >= 3)

  function save(data) {
    region.value         = data.region
    interests.value      = data.interests
    transportation.value = data.transportation
    completed.value      = true
    localStorage.setItem(KEY, JSON.stringify({ ...data, completed: true }))
  }

  function clear() {
    region.value = null; interests.value = []; transportation.value = '무관'; completed.value = false
    localStorage.removeItem(KEY)
  }

  return { region, interests, transportation, completed, isReady, save, clear }
})
