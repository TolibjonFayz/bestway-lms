import { http } from './http'

export function fetchMarks(month, page = 1, limit = 20) {
  return http.get('/marks', { params: { month, page, limit } }).then((r) => r.data)
}
