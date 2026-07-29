import { http } from './http'

/** The whole student home screen in one request. */
export function fetchDashboard() {
  return http.get('/dashboard').then((r) => r.data)
}
