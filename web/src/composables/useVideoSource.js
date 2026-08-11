/* The single place that turns a stored video record into something playable.
   Lessons are hosted on YouTube as unlisted videos; plain file URLs still work
   so offline development against web/public/media needs no network.

   The server normalises whatever the admin pasted before storing it
   (api/src/common/video-source.ts), so in practice this only ever sees a
   canonical watch URL or a file path — but it parses the other YouTube shapes
   anyway, since the admin field previews a link before it is saved. */

/** YouTube ids are exactly 11 characters of an unpadded base64url alphabet. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

/** Extensions a <video> element can stream on its own. */
const DIRECT_PLAYBACK = /\.(mp4|webm|ogg|m3u8)(\?|$)/i

const YOUTUBE_HOSTS = new Set(['youtube.com', 'youtu.be', 'youtube-nocookie.com'])

function bareHost(hostname) {
  return hostname.replace(/^(www|m)\./i, '').toLowerCase()
}

function youtubeIdFromUrl(url) {
  const host = bareHost(url.hostname)

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0]
    return YOUTUBE_ID.test(id) ? id : null
  }

  const queryId = url.searchParams.get('v')
  if (queryId && YOUTUBE_ID.test(queryId)) return queryId

  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length === 2 && ['embed', 'shorts', 'live'].includes(segments[0])) {
    return YOUTUBE_ID.test(segments[1]) ? segments[1] : null
  }

  return null
}

/**
 * Parses a raw string into a playable source.
 * @returns {{kind:'youtube',id:string}|{kind:'file',url:string}|null}
 */
export function parseVideoSource(raw) {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  if (YOUTUBE_ID.test(trimmed)) return { kind: 'youtube', id: trimmed }

  /* Root-relative paths are not parseable as URLs on their own. */
  if (trimmed.startsWith('/')) {
    return DIRECT_PLAYBACK.test(trimmed) ? { kind: 'file', url: trimmed } : null
  }

  let url
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  if (YOUTUBE_HOSTS.has(bareHost(url.hostname))) {
    const id = youtubeIdFromUrl(url)
    return id ? { kind: 'youtube', id } : null
  }

  return DIRECT_PLAYBACK.test(url.pathname) ? { kind: 'file', url: trimmed } : null
}

/** Playable source for a video record from the API, or null when unset. */
export function resolveVideoSource(video) {
  return parseVideoSource(video?.url)
}

/** Poster frame for a YouTube id — used by the admin field to confirm the link. */
export function youtubeThumbnail(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

/** True when the stored source can actually be played. */
export function isPlayable(video) {
  return resolveVideoSource(video) !== null
}
