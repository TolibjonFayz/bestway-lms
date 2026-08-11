/* Video hosting is YouTube (unlisted): the centre uploads a lesson, marks it
   "Unlisted" and pastes the link into the admin panel. Local files still play
   so offline development does not need the network — see web/public/media.

   Everything that accepts a video URL funnels through normaliseVideoSource, so
   whatever shape the admin pasted is stored in one canonical form and the
   player never has to guess. */

/** YouTube ids are exactly 11 characters of an unpadded base64url alphabet. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Extensions a <video> element can stream on its own. */
const DIRECT_PLAYBACK = /\.(mp4|webm|ogg|m3u8)(\?|$)/i;

/** Hosts whose links we understand, without the optional www./m. prefix. */
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
]);

export type VideoSource =
  | { kind: 'youtube'; id: string; url: string }
  | { kind: 'file'; url: string };

function bareHost(hostname: string): string {
  return hostname.replace(/^(www|m)\./i, '').toLowerCase();
}

/** The id out of a YouTube link, whichever of its several shapes it takes. */
function youtubeIdFromUrl(url: URL): string | null {
  const host = bareHost(url.hostname);

  /* youtu.be/ID — the id is the whole path. */
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return YOUTUBE_ID.test(id) ? id : null;
  }

  /* youtube.com/watch?v=ID — the canonical desktop form. */
  const queryId = url.searchParams.get('v');
  if (queryId && YOUTUBE_ID.test(queryId)) return queryId;

  /* /embed/ID, /shorts/ID and /live/ID all carry the id as the last segment. */
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length === 2 && ['embed', 'shorts', 'live'].includes(segments[0])) {
    return YOUTUBE_ID.test(segments[1]) ? segments[1] : null;
  }

  return null;
}

/**
 * Turns whatever the admin pasted into a canonical source, or null when it is
 * neither a YouTube reference nor a playable file URL.
 */
export function normaliseVideoSource(input: string): VideoSource | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  /* A bare id, pasted straight out of a YouTube URL bar. */
  if (YOUTUBE_ID.test(trimmed)) {
    return { kind: 'youtube', id: trimmed, url: youtubeWatchUrl(trimmed) };
  }

  /* Root-relative file paths (/media/lesson-512.mp4) are not parseable as URLs
     on their own, so they are checked before the URL constructor runs. */
  if (trimmed.startsWith('/')) {
    return DIRECT_PLAYBACK.test(trimmed) ? { kind: 'file', url: trimmed } : null;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  if (YOUTUBE_HOSTS.has(bareHost(url.hostname))) {
    const id = youtubeIdFromUrl(url);
    return id ? { kind: 'youtube', id, url: youtubeWatchUrl(id) } : null;
  }

  return DIRECT_PLAYBACK.test(url.pathname) ? { kind: 'file', url: trimmed } : null;
}

/** The form we store, so the database always holds one shape per provider. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** True when the stored value is a YouTube reference rather than a file. */
export function isYouTubeSource(url: string): boolean {
  return normaliseVideoSource(url)?.kind === 'youtube';
}
