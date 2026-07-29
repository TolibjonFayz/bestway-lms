/* The single place that turns a stored video record into something a <video>
   element can play. Hosting is still an open question for the centre (own
   server vs Vimeo vs a signed CDN URL) — when it is settled, only this file
   changes and every player follows. */

/** Extensions the plain <video> element can play directly. */
const DIRECT_PLAYBACK = /\.(mp4|webm|ogg|m3u8)(\?|$)/i

export function resolveVideoUrl(video) {
  const url = video?.url?.trim()
  if (!url) return null

  /* Anything the browser can stream by itself goes through untouched. */
  if (DIRECT_PLAYBACK.test(url)) return url

  /* A provider page URL (a YouTube watch link, say) is not a media file. The
     player shows its unsupported-source notice rather than a broken element,
     until the real hosting decision lands here. */
  return null
}

/** True when the stored source cannot be fed to a <video> element as-is. */
export function isPlayable(video) {
  return resolveVideoUrl(video) !== null
}
