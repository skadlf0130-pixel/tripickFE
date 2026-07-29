// festival-service API (gateway :8080 → festival-service :8082)
// 축제 목록/상세, 찜(북마크), 후기(리뷰)
import api from './client'

export const festivalApi = {
  // 축제 목록: { region?, month?, category?, page, size }
  getList: (params) =>
    api.get('/api/festivals', { params }),

  // 축제 상세 (기간에 따라 날씨 예보 포함)
  getDetail: (id) =>
    api.get(`/api/festivals/${id}`),

  // 축제 찜 추가
  addBookmark: (festivalId) =>
    api.post(`/api/festivals/${festivalId}/bookmarks`),

  // 축제 찜 취소
  removeBookmark: (festivalId) =>
    api.delete(`/api/festivals/${festivalId}/bookmarks`),

  // 내 찜 목록: { page, size }
  getMyBookmarks: (params) =>
    api.get('/api/bookmarks', { params }),

  // 후기 목록: { page, size }
  getReviews: (festivalId, params) =>
    api.get(`/api/festivals/${festivalId}/reviews`, { params }),

  // 후기 작성: { rating, content }
  createReview: (festivalId, data) =>
    api.post(`/api/festivals/${festivalId}/reviews`, data),

  // 후기 수정
  updateReview: (festivalId, reviewId, data) =>
    api.patch(`/api/festivals/${festivalId}/reviews/${reviewId}`, data),

  // 후기 삭제
  deleteReview: (festivalId, reviewId) =>
    api.delete(`/api/festivals/${festivalId}/reviews/${reviewId}`),
}
