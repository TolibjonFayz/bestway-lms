import { http } from './http'

/** Resumes the in-progress attempt, or the last result if none is open. */
export function fetchTestState(lessonItemId) {
  return http.get(`/tests/${lessonItemId}`).then((r) => r.data)
}

/** Draft persistence — what makes a reload or a dropped connection safe. */
export function saveTestAnswers(lessonItemId, answers) {
  return http.put(`/tests/${lessonItemId}/answers`, { answers }).then((r) => r.data)
}

export function submitTest(lessonItemId, answers) {
  return http.post(`/tests/${lessonItemId}/submit`, { answers }).then((r) => r.data)
}

export function retakeTest(lessonItemId) {
  return http.post(`/tests/${lessonItemId}/retake`).then((r) => r.data)
}
