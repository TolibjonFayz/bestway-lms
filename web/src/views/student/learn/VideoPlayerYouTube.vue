<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LessonsStateCard from '../lessons/LessonsStateCard.vue'
import { loadYouTubeApi } from '@/composables/useYouTubeApi'
import uz from '@/locales/uz'

/* YouTube's own controls stay — reimplementing play/seek over an iframe we do
   not own buys nothing and breaks whenever their player changes. The lesson
   chrome around the player is ours; the pixels inside it are theirs. */

/** How often we sample playback position while playing. The view throttles
    what actually reaches the server; this only keeps the local bar honest. */
const TICK_MS = 1000

const props = defineProps({
  videoId: { type: String, required: true },
})

const emit = defineEmits(['tick', 'pause', 'play', 'ended'])

const hostEl = ref(null)
const failed = ref(false)

let player = null
let ticker = null
let destroyed = false

function watchedPercent() {
  if (!player?.getDuration) return 0
  const duration = player.getDuration()
  if (!duration) return 0
  return Math.min(100, Math.round((player.getCurrentTime() / duration) * 100))
}

function startTicking() {
  stopTicking()
  ticker = setInterval(() => emit('tick', watchedPercent()), TICK_MS)
}

function stopTicking() {
  if (ticker) clearInterval(ticker)
  ticker = null
}

function onStateChange(event) {
  const states = window.YT?.PlayerState
  if (!states) return

  if (event.data === states.PLAYING) {
    emit('play', watchedPercent())
    startTicking()
    return
  }

  stopTicking()

  if (event.data === states.PAUSED) emit('pause', watchedPercent())
  /* Report a true 100 on completion: the last sample can land a fraction
     short and leave the finish button locked on a fully watched lesson. */
  else if (event.data === states.ENDED) emit('ended', 100)
}

async function mountPlayer() {
  try {
    const YT = await loadYouTubeApi()
    /* The component can unmount while the API request is still in flight. */
    if (destroyed || !hostEl.value) return

    player = new YT.Player(hostEl.value, {
      videoId: props.videoId,
      playerVars: {
        modestbranding: 1,
        /* Suggested videos at the end stay inside this channel's content
           rather than sending a student off into unrelated recommendations. */
        rel: 0,
        playsinline: 1,
      },
      events: {
        onStateChange,
        onError: () => (failed.value = true),
      },
    })
  } catch {
    failed.value = true
  }
}

function destroyPlayer() {
  stopTicking()
  player?.destroy?.()
  player = null
}

/* Moving between video lessons reuses the component, so swap the loaded video
   rather than leaving the previous one playing. */
watch(
  () => props.videoId,
  (id) => {
    if (player?.loadVideoById) player.loadVideoById(id)
  },
)

onMounted(mountPlayer)

onBeforeUnmount(() => {
  destroyed = true
  destroyPlayer()
})

defineExpose({ watchedPercent })
</script>

<template>
  <LessonsStateCard
    v-if="failed"
    variant="error"
    icon="video"
    :title="uz.video.youtubeErrorTitle"
    :text="uz.video.youtubeErrorText"
  />
  <div v-else class="ytplayer">
    <div ref="hostEl" class="ytplayer__frame" />
  </div>
</template>

<style scoped>
.ytplayer {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--ink);
  border-radius: 16px;
  overflow: hidden;
}

.ytplayer__frame,
.ytplayer__frame :deep(iframe) {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

@media (max-width: 1023px) {
  .ytplayer {
    border-radius: 0;
  }
}
</style>
