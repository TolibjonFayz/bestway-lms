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

export function fetchTeacherGroups() {
  return http.get('/teacher/groups').then((r) => r.data)
}

export function fetchTeacherGroup(groupId) {
  return http.get(`/teacher/groups/${groupId}`).then((r) => r.data)
}

export function fetchAttendanceRegister(params) {
  return http.get('/teacher/attendance', { params }).then((r) => r.data)
}

export function markAttendanceCell(payload) {
  return http.put('/teacher/attendance/cell', payload).then((r) => r.data)
}

export function markAttendanceDay(payload) {
  return http.put('/teacher/attendance/day', payload).then((r) => r.data)
}

export function clearAttendanceCell(params) {
  return http.delete('/teacher/attendance/cell', { params }).then((r) => r.data)
}
