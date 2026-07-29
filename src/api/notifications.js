// notification-service API (gateway :8080 → notification-service :8085)
// 알림 목록, 읽음 처리, 알림 유형별 수신 설정
import api from './client'

export const notificationApi = {
  // 내 알림 목록: { page, size }
  getList: (params) =>
    api.get('/api/notifications', { params }),

  // 읽지 않은 알림 개수
  getUnreadCount: () =>
    api.get('/api/notifications/unread-count'),

  // 알림 읽음 처리
  markRead: (notificationId) =>
    api.patch(`/api/notifications/${notificationId}/read`),

  // 전체 알림 읽음 처리
  markAllRead: () =>
    api.patch('/api/notifications/read-all'),

  // 알림 유형별 수신 설정 목록 조회
  getSettings: () =>
    api.get('/api/notifications/settings'),

  // 알림 수신 설정 변경
  // type: NotificationType (FESTIVAL_REMINDER, REVIEW_COMMENT 등)
  // data: { channel: 'PUSH' | 'EMAIL', email?: string }
  updateSetting: (type, data) =>
    api.put(`/api/notifications/settings/${type}`, data),
}
