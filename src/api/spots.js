// festival-service API (gateway :8080 → festival-service :8082)
// 여행지 목록/상세
import api from './client'

export const spotApi = {
  // 여행지 목록: { region?, category?, page, size }
  getList: (params) =>
    api.get('/api/travel-spots', { params }),

  // 여행지 상세
  getDetail: (id) =>
    api.get(`/api/travel-spots/${id}`),

  // 여행지 찜 추가
  addBookmark: (spotId) =>
    api.post(`/api/travel-spots/${spotId}/bookmarks`),

  // 여행지 찜 취소
  removeBookmark: (spotId) =>
    api.delete(`/api/travel-spots/${spotId}/bookmarks`),

  // 내 여행지 찜 목록: { page, size }
  getMyBookmarks: (params) =>
    api.get('/api/spot-bookmarks', { params }),
}
