import { http } from './http'

export function fetchPracticeSummary() {
  return http.get('/practice/summary').then((r) => r.data)
}

export function fetchPracticeVocab() {
  return http.get('/practice/vocab').then((r) => r.data)
}

export function answerPracticeWord(payload) {
  return http.post('/practice/vocab/answer', payload).then((r) => r.data)
}

export function fetchPracticeMistakes() {
  return http.get('/practice/mistakes').then((r) => r.data)
}

export function checkPracticeMistake(payload) {
  return http.post('/practice/mistakes/check', payload).then((r) => r.data)
}

export function fetchExtraLessons() {
  return http.get('/extra-lessons').then((r) => r.data)
}

export function createExtraLesson(payload) {
  return http.post('/extra-lessons', payload).then((r) => r.data)
}

export function fetchTeacherExtraLessons() {
  return http.get('/teacher/extra-lessons').then((r) => r.data)
}

export function answerTeacherExtraLesson(id, payload) {
  return http.patch(`/teacher/extra-lessons/${id}`, payload).then((r) => r.data)
}
