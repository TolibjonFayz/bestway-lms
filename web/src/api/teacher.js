import { http } from './http'

export function fetchTeacherDashboard() {
  return http.get('/teacher/dashboard').then((r) => r.data)
}

export function fetchTeacherSubmissions(params = {}) {
  return http.get('/teacher/submissions', { params }).then((r) => r.data)
}

export function fetchTeacherSubmission(id) {
  return http.get(`/teacher/submissions/${id}`).then((r) => r.data)
}

export function gradeTeacherSubmission(id, payload) {
  return http.post(`/teacher/submissions/${id}/grade`, payload).then((r) => r.data)
}
