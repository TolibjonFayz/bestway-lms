import { http } from './http'

export function fetchAdminCourses(params = {}) {
  return http.get('/admin/courses', { params }).then((r) => r.data)
}

export function createAdminCourse(payload) {
  return http.post('/admin/courses', payload).then((r) => r.data)
}

export function fetchAdminUnits(courseId, params = {}) {
  return http.get(`/admin/courses/${courseId}/units`, { params }).then((r) => r.data)
}

export function createAdminUnit(courseId, payload) {
  return http.post(`/admin/courses/${courseId}/units`, payload).then((r) => r.data)
}

export function reorderAdminUnits(courseId, orderedIds) {
  return http.patch(`/admin/courses/${courseId}/units/reorder`, { orderedIds }).then((r) => r.data)
}

export function fetchAdminUnitDetail(unitId) {
  return http.get(`/admin/units/${unitId}`).then((r) => r.data)
}

export function createAdminLessonItem(unitId, payload) {
  return http.post(`/admin/units/${unitId}/items`, payload).then((r) => r.data)
}

export function reorderAdminLessonItems(unitId, orderedIds) {
  return http.patch(`/admin/units/${unitId}/items/reorder`, { orderedIds }).then((r) => r.data)
}

export function updateAdminLessonItem(itemId, payload) {
  return http.patch(`/admin/items/${itemId}`, payload).then((r) => r.data)
}

export function deleteAdminLessonItem(itemId) {
  return http.delete(`/admin/items/${itemId}`).then((r) => r.data)
}

export function fetchAdminVocabWords(itemId, params = {}) {
  return http.get(`/admin/items/${itemId}/vocab-words`, { params }).then((r) => r.data)
}

export function createAdminVocabWord(itemId, payload) {
  return http.post(`/admin/items/${itemId}/vocab-words`, payload).then((r) => r.data)
}

export function importAdminVocabCsv(itemId, csv) {
  return http.post(`/admin/items/${itemId}/vocab-words/import`, { csv }).then((r) => r.data)
}

export function deleteAdminVocabWord(id) {
  return http.delete(`/admin/vocab-words/${id}`).then((r) => r.data)
}

export function fetchAdminQuestions(itemId, params = {}) {
  return http.get(`/admin/items/${itemId}/questions`, { params }).then((r) => r.data)
}

export function updateAdminQuestion(id, payload) {
  return http.patch(`/admin/questions/${id}`, payload).then((r) => r.data)
}

export function fetchAdminStudents(params = {}) {
  return http.get('/admin/students', { params }).then((r) => r.data)
}

export function createAdminStudent(payload) {
  return http.post('/admin/students', payload).then((r) => r.data)
}

export function setAdminStudentStatus(id, active) {
  return http.patch(`/admin/students/${id}/status`, { active }).then((r) => r.data)
}

export function bulkSetAdminStudentStatus(ids, active) {
  return http.patch('/admin/students/bulk-status', { ids, active }).then((r) => r.data)
}

export function setGroupZoomUrl(groupId, zoomJoinUrl) {
  return http.patch(`/admin/groups/${groupId}/zoom`, { zoomJoinUrl }).then((r) => r.data)
}

export function fetchCenterSettings() {
  return http.get('/settings').then((r) => r.data)
}

export function updateCenterSettings(payload) {
  return http.patch('/admin/settings', payload).then((r) => r.data)
}

export function fetchAdminOverview() {
  return http.get('/admin/overview').then((r) => r.data)
}

export function fetchAdminTeachers(params = {}) {
  return http.get('/admin/teachers', { params }).then((r) => r.data)
}

export function createAdminTeacher(payload) {
  return http.post('/admin/teachers', payload).then((r) => r.data)
}

export function updateAdminTeacher(id, payload) {
  return http.patch(`/admin/teachers/${id}`, payload).then((r) => r.data)
}

export function setAdminTeacherStatus(id, active) {
  return http.patch(`/admin/teachers/${id}/status`, { active }).then((r) => r.data)
}

export function fetchAdminGroups() {
  return http.get('/admin/groups').then((r) => r.data)
}
