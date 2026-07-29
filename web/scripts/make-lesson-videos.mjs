/* Generates the placeholder lesson videos the dev seed points at.

   The centre has not decided where real video will live yet (PLAN.md), and the
   public sample buckets we tried are no longer readable. Serving our own files
   from web/public/media keeps the player testable offline and matches the most
   likely destination — the centre's own server. The clips are gitignored;
   run `npm run media` after a clone to rebuild them.

   Requires ffmpeg on PATH. */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '..', 'public', 'media')

/* One clip per distinct duration in api/src/seed/data/curriculum.ts, so the
   duration stored in the database matches the file the player actually loads. */
const DURATIONS = [512, 634, 727, 588, 671, 745, 498, 623, 556, 702, 531, 604]

mkdirSync(outDir, { recursive: true })

for (const seconds of DURATIONS) {
  const target = resolve(outDir, `lesson-${seconds}.mp4`)
  if (existsSync(target)) {
    process.stdout.write(`skip  lesson-${seconds}.mp4\n`)
    continue
  }

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-f', 'lavfi',
      '-i', `testsrc=size=320x180:rate=4:duration=${seconds}`,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '48',
      /* A short GOP keeps seeking accurate, which the timeline depends on. */
      '-g', '8',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-movflags', '+faststart',
      target,
    ],
    { stdio: 'ignore' },
  )
  process.stdout.write(`built lesson-${seconds}.mp4\n`)
}

process.stdout.write(`\n${DURATIONS.length} clips in ${outDir}\n`)
