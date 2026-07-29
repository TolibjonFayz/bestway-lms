import { http } from './http'

export function fetchProfile() {
  return http.get('/profile').then((r) => r.data)
}

export function fetchAchievements(page = 1, limit = 20) {
  return http.get('/profile/achievements', { params: { page, limit } }).then((r) => r.data)
}

export function updateNotifications(enabled) {
  return http.patch('/profile/notifications', { enabled }).then((r) => r.data)
}

export function changePassword(currentPassword, newPassword) {
  return http.post('/profile/password', { currentPassword, newPassword })
}
