/* The YouTube IFrame Player API is a single global script with a single global
   ready callback, so loading it is shared state: every player waits on the same
   promise instead of each appending its own <script> tag. Loaded lazily — a
   student who never opens a video lesson never fetches it. */

let apiPromise = null

export function loadYouTubeApi() {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }

    /* The API calls exactly one global hook when it finishes parsing. Chain any
       existing one rather than overwriting it. */
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT)
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => {
      /* Let a later attempt retry instead of caching the failure forever. */
      apiPromise = null
      reject(new Error('YouTube player API could not be loaded'))
    }
    document.head.appendChild(script)
  })

  return apiPromise
}
