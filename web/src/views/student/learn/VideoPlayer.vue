<script setup>
import { computed } from 'vue'
import VideoPlayerFile from './VideoPlayerFile.vue'
import VideoPlayerYouTube from './VideoPlayerYouTube.vue'

/* Lessons are hosted on YouTube; local files remain playable for offline
   development. Both variants emit the same events, so the lesson view's
   progress reporting does not care which one is mounted. */

const props = defineProps({
  source: {
    type: Object,
    required: true,
    validator: (value) =>
      (value.kind === 'youtube' && typeof value.id === 'string') ||
      (value.kind === 'file' && typeof value.url === 'string'),
  },
  poster: { type: String, default: '' },
})

defineEmits(['tick', 'pause', 'play', 'ended'])

const isYouTube = computed(() => props.source.kind === 'youtube')
</script>

<template>
  <VideoPlayerYouTube
    v-if="isYouTube"
    :video-id="source.id"
    @tick="$emit('tick', $event)"
    @play="$emit('play', $event)"
    @pause="$emit('pause', $event)"
    @ended="$emit('ended', $event)"
  />
  <VideoPlayerFile
    v-else
    :src="source.url"
    :poster="poster"
    @tick="$emit('tick', $event)"
    @play="$emit('play', $event)"
    @pause="$emit('pause', $event)"
    @ended="$emit('ended', $event)"
  />
</template>
