// community-service API (gateway :8080 → community-service :8084)
// 커뮤니티 후기 게시물, 댓글, 좋아요
import api from './client'

export const postApi = {
  // 게시물 목록: { page, size }
  getList: (params) =>
    api.get('/api/posts', { params }),

  // 게시물 상세
  getDetail: (postId) =>
    api.get(`/api/posts/${postId}`),

  // 게시물 작성: { title, content, festivalId?, photoUrls?, videoUrl? }
  create: (data) =>
    api.post('/api/posts', data),

  // 게시물 삭제 (본인만 가능)
  remove: (postId) =>
    api.delete(`/api/posts/${postId}`),

  // 댓글 목록: { page, size }
  getComments: (postId, params) =>
    api.get(`/api/posts/${postId}/comments`, { params }),

  // 댓글 작성: { content }
  createComment: (postId, data) =>
    api.post(`/api/posts/${postId}/comments`, data),

  // 댓글 삭제 (본인만 가능)
  deleteComment: (postId, commentId) =>
    api.delete(`/api/posts/${postId}/comments/${commentId}`),

  // 좋아요
  like: (postId) =>
    api.post(`/api/posts/${postId}/likes`),

  // 좋아요 취소
  unlike: (postId) =>
    api.delete(`/api/posts/${postId}/likes`),

  // 게시물 신고: { reason }
  reportPost: (postId, data) =>
    api.post(`/api/posts/${postId}/report`, data),

  // 댓글 신고: { reason }
  reportComment: (postId, commentId, data) =>
    api.post(`/api/posts/${postId}/comments/${commentId}/report`, data),
}
