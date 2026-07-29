import { http } from './http'

/* The roadmap needs every unit at once to draw a connected timeline, so the
   list endpoints are asked for a whole course rather than a default page. */
const WHOLE_COURSE = 100

export function fetchCourses() {
  return http
    .get('/courses', { params: { limit: WHOLE_COURSE } })
    .then((r) => r.data)
}

export function fetchCourseUnits(courseId) {
  return http
    .get(`/courses/${courseId}/units`, { params: { limit: WHOLE_COURSE } })
    .then((r) => r.data)
}

export function fetchUnit(unitId) {
  return http.get(`/units/${unitId}`).then((r) => r.data)
}
