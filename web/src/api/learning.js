import { http } from './http'

/** Throttled watch reporting; `completed` asks the server to finish the item. */
export function reportVideoProgress(lessonItemId, percent, completed = false) {
  return http
    .post('/progress/video', { lessonItemId, percent, completed })
    .then((r) => r.data)
}

export function fetchVocabWords(unitId) {
  return http.get(`/vocab/${unitId}/words`).then((r) => r.data)
}

export function answerVocabWord(vocabWordId, correct) {
  return http
    .post('/vocab/answer', { vocabWordId, correct })
    .then((r) => r.data)
}
