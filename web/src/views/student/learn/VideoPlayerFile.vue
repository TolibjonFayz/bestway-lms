<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import BwIcon from '@/components/base/BwIcon.vue'
import uz from '@/locales/uz'

const SPEEDS = [1, 1.25, 1.5, 2]

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
})

/* The view owns progress reporting; the player only says what happened. */
const emit = defineEmits(['tick', 'pause', 'play', 'ended'])

const videoEl = ref(null)
const frameEl = ref(null)
const playing = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const bufferedEnd = ref(0)
const speedIndex = ref(0)
const scrubbing = ref(false)

const speedLabel = computed(() => `${SPEEDS[speedIndex.value]}x`)
const playedRatio = computed(() =>
  duration.value ? currentTime.value / duration.value : 0,
)
const bufferedRatio = computed(() =>
  duration.value ? Math.min(1, bufferedEnd.value / duration.value) : 0,
)

function clock(seconds) {
  if (!Number.isFinite(seconds)) return '00:00'
  const whole = Math.max(0, Math.floor(seconds))
  const m = String(Math.floor(whole / 60)).padStart(2, '0')
  const s = String(whole % 60).padStart(2, '0')
  return `${m}:${s}`
}

const timeLabel = computed(
  () => `${clock(currentTime.value)} / ${clock(duration.value)}`,
)

function togglePlay() {
  const el = videoEl.value
  if (!el) return
  if (el.paused) void el.play()
  else el.pause()
}

function onTimeUpdate() {
  const el = videoEl.value
  if (!el || scrubbing.value) return
  currentTime.value = el.currentTime
  if (el.buffered.length) {
    bufferedEnd.value = el.buffered.end(el.buffered.length - 1)
  }
  emit('tick', watchedPercent())
}

/* Watched percentage is position-based: the furthest point reached, not the
   sum of seconds played, so scrubbing forward does not inflate it beyond
   where the student actually is. */
function watchedPercent() {
  if (!duration.value) return 0
  return Math.min(100, Math.round((currentTime.value / duration.value) * 100))
}

function cycleSpeed() {
  speedIndex.value = (speedIndex.value + 1) % SPEEDS.length
  if (videoEl.value) videoEl.value.playbackRate = SPEEDS[speedIndex.value]
}

function seekFromEvent(event) {
  const bar = event.currentTarget.getBoundingClientRect()
  const point = event.clientX ?? event.touches?.[0]?.clientX
  if (point === undefined || !duration.value) return
  const ratio = Math.min(1, Math.max(0, (point - bar.left) / bar.width))
  const el = videoEl.value
  if (!el) return
  el.currentTime = ratio * duration.value
  currentTime.value = el.currentTime
}

function onScrubStart(event) {
  scrubbing.value = true
  seekFromEvent(event)
}

function onScrubEnd() {
  if (!scrubbing.value) return
  scrubbing.value = false
  emit('tick', watchedPercent())
}

function toggleFullscreen() {
  const frame = frameEl.value
  if (!frame) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void frame.requestFullscreen?.()
}

/* Keyboard control on the timeline, since it is a slider in all but markup. */
function onTimelineKey(event) {
  const el = videoEl.value
  if (!el || !duration.value) return
  const step = event.shiftKey ? 30 : 5
  if (event.key === 'ArrowRight') el.currentTime = Math.min(duration.value, el.currentTime + step)
  else if (event.key === 'ArrowLeft') el.currentTime = Math.max(0, el.currentTime - step)
  else return
  event.preventDefault()
  currentTime.value = el.currentTime
  emit('tick', watchedPercent())
}

watch(playing, (isPlaying) => emit(isPlaying ? 'play' : 'pause', watchedPercent()))

onBeforeUnmount(() => videoEl.value?.pause())

defineExpose({ watchedPercent })
</script>

<template>
  <div ref="frameEl" class="vplayer">
    <video
      ref="videoEl"
      class="vplayer__video"
      :src="src"
      :poster="poster || undefined"
      preload="metadata"
      playsinline
      @loadedmetadata="duration = $event.target.duration"
      @timeupdate="onTimeUpdate"
      @progress="onTimeUpdate"
      @play="playing = true"
      @pause="playing = false"
      @ended="playing = false; $emit('ended', 100)"
    />

    <button
      class="vplayer__surface"
      type="button"
      :aria-label="playing ? uz.video.pause : uz.video.play"
      @click="togglePlay"
    >
      <span class="vplayer__big" :class="{ 'is-hidden': playing }">
        <BwIcon name="play" :size="32" />
      </span>
    </button>

    <div class="vplayer__bar">
      <div
        class="vplayer__timeline"
        role="slider"
        tabindex="0"
        :aria-label="uz.video.playPause"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="Math.round(playedRatio * 100)"
        @mousedown="onScrubStart"
        @mousemove="scrubbing && seekFromEvent($event)"
        @mouseup="onScrubEnd"
        @mouseleave="onScrubEnd"
        @keydown="onTimelineKey"
      >
        <div class="vplayer__buffered" :style="{ width: `${bufferedRatio * 100}%` }" />
        <div class="vplayer__played" :style="{ width: `${playedRatio * 100}%` }" />
        <div class="vplayer__knob" :style="{ left: `${playedRatio * 100}%` }" />
      </div>

      <div class="vplayer__controls">
        <div class="vplayer__left">
          <button
            class="vplayer__icon-btn"
            type="button"
            :aria-label="uz.video.playPause"
            @click="togglePlay"
          >
            <BwIcon :name="playing ? 'pause' : 'play'" :size="playing ? 17 : 18" />
          </button>
          <span class="vplayer__time bw-nums">{{ timeLabel }}</span>
        </div>

        <div class="vplayer__right">
          <button class="vplayer__speed" type="button" @click="cycleSpeed">
            {{ speedLabel }}
          </button>
          <button
            class="vplayer__icon-btn"
            type="button"
            :aria-label="uz.video.fullscreen"
            @click="toggleFullscreen"
          >
            <BwIcon name="fullscreen" :size="18" :stroke-width="1.9" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vplayer {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--ink);
  border-radius: 16px;
  overflow: hidden;
}

.vplayer__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.vplayer__surface {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Leave the control bar clickable underneath. */
  bottom: 62px;
}

.vplayer__big {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: var(--layer-w-16);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  transition: opacity 0.15s;
}

/* While playing the overlay button stays reachable but gets out of the way. */
.vplayer__big.is-hidden {
  opacity: 0;
}

.vplayer__surface:hover .vplayer__big.is-hidden,
.vplayer__surface:focus-visible .vplayer__big.is-hidden {
  opacity: 1;
}

.vplayer__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 16px 12px;
  background: linear-gradient(180deg, var(--layer-ink-00), var(--layer-ink-86));
}

.vplayer__timeline {
  position: relative;
  height: 5px;
  background: var(--layer-w-24);
  border-radius: 99px;
  margin-bottom: 11px;
  cursor: pointer;
}

.vplayer__timeline:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 4px;
}

.vplayer__buffered,
.vplayer__played {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 99px;
}

.vplayer__buffered {
  background: var(--layer-w-32);
}

.vplayer__played {
  background: var(--green);
}

.vplayer__knob {
  position: absolute;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--white);
  transform: translate(-50%, -50%);
  box-shadow: var(--sh-scrub);
}

.vplayer__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.vplayer__left,
.vplayer__right {
  display: flex;
  align-items: center;
}

.vplayer__left {
  gap: 14px;
}

.vplayer__right {
  gap: 8px;
}

.vplayer__icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.vplayer__icon-btn:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 2px;
  border-radius: 6px;
}

.vplayer__time {
  font-size: 13px;
  font-weight: 600;
  color: var(--white);
}

.vplayer__speed {
  height: 28px;
  padding: 0 11px;
  border-radius: 8px;
  border: 1px solid var(--layer-w-30);
  background: var(--layer-w-08);
  color: var(--white);
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  font-family: inherit;
}

.vplayer__speed:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 2px;
}

@media (max-width: 1023px) {
  .vplayer {
    border-radius: 0;
  }

  .vplayer__bar {
    padding: 9px 12px;
  }

  .vplayer__timeline {
    height: 4px;
    margin-bottom: 7px;
  }

  .vplayer__knob {
    display: none;
  }

  .vplayer__big {
    width: 56px;
    height: 56px;
  }

  .vplayer__time {
    font-size: 11px;
  }

  .vplayer__surface {
    bottom: 48px;
  }
}
</style>
