#!/usr/bin/env node
/**
 * Render a HyperFrames project with a small watermark layered on top, without touching the scenes.
 * Added by DAIOps (see CHANGES.md). Use it for social exports; the master stays unmarked.
 *
 *   node watermark-export.mjs --project ./my-video --mark ./mark.svg --out ./renders/social.mp4 \
 *     [--hide-at 25] [--corner tl|tr] [--height-pct 4.5] [--opacity 0.55] [--color white|black|original] \
 *     [--square] [--quality delivery]
 *
 * - Copies the project to a temporary folder, adds the mark to the root composition as one timed clip
 *   (`class="clip"`, shown from 0 to --hide-at, default the whole film), renders, and deletes the copy
 * - Size is a share of the frame height, placed in a top corner with a 4% margin, kept inside the centre
 *   square so a 1:1 crop never cuts it. One flat colour, no shadow
 * - --square also writes `<out>-1x1.mp4`, a centre crop. 9:16 is not a crop of 16:9 (it loses most of the
 *   frame): make a vertical composition for it instead
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

function args(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) out[key] = true
    else { out[key] = next; i++ }
  }
  return out
}

const a = args(process.argv.slice(2))
const fail = (m) => { console.error(`watermark-export: ${m}`); process.exit(2) }
if (!a.project || !a.mark || !a.out) fail('usage: --project <dir> --mark <svg|png> --out <file.mp4> [options]')
const project = path.resolve(a.project)
const mark = path.resolve(a.mark)
const out = path.resolve(a.out)
if (!fs.existsSync(path.join(project, 'index.html'))) fail(`no index.html in ${project}`)
if (!fs.existsSync(mark)) fail(`mark not found: ${mark}`)

const corner = a.corner === 'tr' ? 'tr' : 'tl'
const heightPct = Number(a['height-pct'] ?? 4.5)
const opacity = Number(a.opacity ?? 0.55)
const color = ['white', 'black', 'original'].includes(a.color) ? a.color : 'white'
if (!(heightPct > 0 && heightPct <= 10)) fail('--height-pct must be in (0, 10]')
if (!(opacity > 0 && opacity <= 1)) fail('--opacity must be in (0, 1]')

const indexSrc = fs.readFileSync(path.join(project, 'index.html'), 'utf8')
const rootOpen = indexSrc.match(/<div\b[^>]*\bid="root"[^>]*>/)
if (!rootOpen) fail('root composition (<div id="root" …>) not found in index.html')
const attr = (name) => Number(rootOpen[0].match(new RegExp(`${name}="([\\d.]+)"`))?.[1])
const W = attr('data-width') || 1920
const H = attr('data-height') || 1080
const duration = attr('data-duration')
if (!duration) fail('root has no data-duration')
const hideAt = a['hide-at'] !== undefined ? Number(a['hide-at']) : duration
if (!(hideAt > 0 && hideAt <= duration)) fail(`--hide-at must be in (0, ${duration}]`)

// Placement: a top corner with a 4% margin, inside the centre square (x from (W-H)/2 to (W+H)/2) for 1:1 crops
const size = Math.round((H * heightPct) / 100)
const margin = Math.round(H * 0.04)
const squareLeft = Math.max(0, Math.round((W - H) / 2))
const left = corner === 'tl' ? squareLeft + margin : W - squareLeft - margin - size
const filter =
  color === 'white' ? 'brightness(0) invert(1)' : color === 'black' ? 'brightness(0)' : 'none'
const ext = path.extname(mark).toLowerCase() || '.svg'

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-watermark-'))
try {
  fs.cpSync(project, work, {
    recursive: true,
    filter: (src) => !path.relative(project, src).split(path.sep).some((s) => ['renders', 'node_modules', '.git'].includes(s)),
  })
  fs.mkdirSync(path.join(work, 'assets'), { recursive: true })
  fs.copyFileSync(mark, path.join(work, 'assets', `__watermark${ext}`))
  const overlay =
    `\n<img id="__watermark" class="clip" src="assets/__watermark${ext}" alt="" ` +
    `data-start="0" data-duration="${hideAt}" data-track-index="999" data-layout-allow-overlap ` +
    `style="position:absolute;top:${margin}px;left:${left}px;height:${size}px;width:auto;` +
    `opacity:${opacity};filter:${filter};z-index:2147483000;pointer-events:none" />`
  fs.writeFileSync(path.join(work, 'index.html'), indexSrc.replace(rootOpen[0], rootOpen[0] + overlay))

  fs.mkdirSync(path.dirname(out), { recursive: true })
  execFileSync('hyperframes', ['render', work, '--output', out, '--quality', String(a.quality ?? 'delivery')], { stdio: 'inherit' })
  console.log(`watermark-export: ${out} (mark ${size}px, ${corner}, opacity ${opacity}, hidden from ${hideAt}s)`)

  if (a.square) {
    const sq = out.replace(/\.mp4$/i, '') + '-1x1.mp4'
    const side = Math.min(W, H)
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', out, '-vf', `crop=${side}:${side}:(iw-${side})/2:(ih-${side})/2`, '-c:a', 'copy', sq], { stdio: 'inherit' })
    console.log(`watermark-export: ${sq} (centre ${side}x${side})`)
  }
} finally {
  fs.rmSync(work, { recursive: true, force: true })
}
