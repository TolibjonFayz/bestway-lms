import { onScopeDispose, ref } from 'vue'

/* Pronunciation is spoken by the browser for now. Real recordings will replace
   the body of speak() — call sites only ever see speak()/speaking/supported,
   so swapping in audio files touches this file alone. */
export function useSpeech(defaultLang = 'en-US') {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  const supported = Boolean(synth)
  const speaking = ref(false)

  function speak(text, lang = defaultLang) {
    if (!supported || !text) return

    /* Cancel first: tapping the button twice should re-read the word, not
       queue a second reading behind the first. */
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.onstart = () => {
      speaking.value = true
    }
    utterance.onend = () => {
      speaking.value = false
    }
    utterance.onerror = () => {
      speaking.value = false
    }
    synth.speak(utterance)
  }

  function stop() {
    if (!supported) return
    synth.cancel()
    speaking.value = false
  }

  /* Leaving the trainer mid-word must not keep talking over the next screen. */
  onScopeDispose(stop)

  return { speak, stop, speaking, supported }
}
