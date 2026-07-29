import { http } from './http'

export function fetchRating(scope, period, page = 1, limit = 20) {
  return http.get('/rating', { params: { scope, period, page, limit } }).then((r) => r.data)
}
