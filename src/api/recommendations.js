// recommendation-service API (gateway :8080 → recommendation-service :8083)
// Gemini AI 기반 축제/여행지 추천
import api from './client'

export const recommendationApi = {
  // AI 추천 요청: { region?, interests: string[], transportation }
  // 동일 조건 24시간 내 재요청 시 캐시된 결과 반환
  recommend: (data) =>
    api.post('/api/recommendations', data),

  // 추천 결과 조회
  getResult: (id) =>
    api.get(`/api/recommendations/${id}`),
}
