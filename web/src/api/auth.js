import { http } from './http'

/** phone is the bare 9 digits — the mask never leaves the component. */
export function login(phone, password) {
  return http.post('/auth/login', { phone, password }).then((r) => r.data)
}

export function refresh(refreshToken) {
  return http.post('/auth/refresh', { refreshToken }).then((r) => r.data)
}

export function me() {
  return http.get('/auth/me').then((r) => r.data)
}

export function logout(refreshToken) {
  return http.post('/auth/logout', { refreshToken }).then((r) => r.data)
}
