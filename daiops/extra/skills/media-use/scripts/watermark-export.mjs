#!/usr/bin/env node
/**
 * Render a HyperFrames project with a small watermark layered on top, without touching the scenes.
 * Added by DAIOps (see CHANGES.md). Use it for social exports; the master stays unmarked.
 *
 *   node watermark-export.mjs --project ./my-video (--mark ./mark.svg | --text "Brand") --out ./renders/social.mp4 \
 *     [--hide-at 25] [--corner tr|tl] [--height-pct 4.5] [--opacity 0.55] [--color white|black|original] \
 *     [--square] [--quality delivery]
 *
 * - Copies the project to a temporary folder, adds the mark to the root composition as one timed clip
 *   (`class="clip"`, shown from 0 to --hide-at, default the whole film), renders, and deletes the copy
 * - Size is a share of the frame height, placed in a top corner (default top right) with a 4% margin from
 *   the edges of the frame it is shown in. One flat colour, no shadow
 * - --square also writes `<out>-1x1.mp4`, a centre crop rendered a second time with the mark moved to the
 *   corner of the square, so each cut has the mark in its own corner. 9:16 is not a crop of 16:9 (it loses
 *   most of the frame): make a vertical composition for it instead
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
if (!a.project || (!a.mark && !a.text) || !a.out) fail('usage: --project <dir> (--mark <svg|png> | --text <word>) --out <file.mp4> [options]')
if (a.mark && a.text) fail('use --mark or --text, not both')
const project = path.resolve(a.project)
const mark = a.mark ? path.resolve(a.mark) : null
const text = typeof a.text === 'string' ? a.text : null
const out = path.resolve(a.out)
if (!fs.existsSync(path.join(project, 'index.html'))) fail(`no index.html in ${project}`)
if (mark && !fs.existsSync(mark)) fail(`mark not found: ${mark}`)
if (text !== null && !/^[\p{L}\p{N} .\-]{1,24}$/u.test(text)) fail('--text must be 1-24 letters, digits, spaces, dots or hyphens')

const corner = a.corner === 'tl' ? 'tl' : 'tr'
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
if (a.square && /-1x1\.mp4$/i.test(out)) fail('--out names the full-frame file; the 1:1 cut gets "-1x1" added, so leave it off')
const hideAt = a['hide-at'] !== undefined ? Number(a['hide-at']) : duration
if (!(hideAt > 0 && hideAt <= duration)) fail(`--hide-at must be in (0, ${duration}]`)

// Placement: a top corner, 4% of the height in from the edges of the cut being made. The full frame uses the
// frame edges; the 1:1 cut uses the edges of the centre square (x from (W-H)/2 to (W+H)/2)
const size = Math.round((H * heightPct) / 100)
const margin = Math.round(H * 0.04)
const squareLeft = Math.max(0, Math.round((W - H) / 2))
const filter =
  color === 'white' ? 'brightness(0) invert(1)' : color === 'black' ? 'brightness(0)' : 'none'
const ext = mark ? path.extname(mark).toLowerCase() || '.svg' : ''
const ink = color === 'black' ? '#000' : '#fff'
const font = String(a.font ?? 'Pretendard').replace(/[^\p{L}\p{N} \-]/gu, '')
const weight = Number(a.weight ?? 700)

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-watermark-'))
try {
  fs.cpSync(project, work, {
    recursive: true,
    filter: (src) => !path.relative(project, src).split(path.sep).some((s) => ['renders', 'node_modules', '.git'].includes(s)),
  })
  if (mark) {
    fs.mkdirSync(path.join(work, 'assets'), { recursive: true })
    fs.copyFileSync(mark, path.join(work, 'assets', `__watermark${ext}`))
  }
  const timing = `data-start="0" data-duration="${hideAt}" data-track-index="999" data-layout-allow-overlap`
  const overlayAt = (inset) => {
    const side = corner === 'tl' ? `left:${inset}px` : `right:${inset}px`
    if (mark) {
      return (
        `\n<img id="__watermark" class="clip" src="assets/__watermark${ext}" alt="" ${timing} ` +
        `style="position:absolute;top:${margin}px;${side};height:${size}px;width:auto;` +
        `opacity:${opacity};filter:${filter};z-index:2147483000;pointer-events:none" />`
      )
    }
    // Word mark: the line box is the mark height, so the cap height sits at about 70% of it
    return (
      `\n<div id="__watermark" class="clip" ${timing} ` +
      `style="position:absolute;top:${margin}px;${side};height:${size}px;line-height:${size}px;` +
      `font-family:'${font}',sans-serif;font-weight:${weight};font-size:${size}px;letter-spacing:-0.01em;` +
      `color:${ink};opacity:${opacity};white-space:nowrap;z-index:2147483000;pointer-events:none">${text}</div>`
    )
  }
  const renderWith = (inset, file) => {
    fs.writeFileSync(path.join(work, 'index.html'), indexSrc.replace(rootOpen[0], rootOpen[0] + overlayAt(inset)))
    execFileSync('hyperframes', ['render', work, '--output', file, '--quality', String(a.quality ?? 'delivery')], { stdio: 'inherit' })
  }
  const label = `${text ? `text "${text}"` : 'mark'} ${size}px, ${corner}, opacity ${opacity}, hidden from ${hideAt}s`

  fs.mkdirSync(path.dirname(out), { recursive: true })
  renderWith(margin, out)
  console.log(`watermark-export: ${out} (${label})`)

  if (a.square) {
    const sq = out.replace(/\.mp4$/i, '') + '-1x1.mp4'
    const edge = Math.min(W, H)
    const full = path.join(work, '__square-full.mp4')
    renderWith(squareLeft + margin, full)
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', full, '-vf', `crop=${edge}:${edge}:(iw-${edge})/2:(ih-${edge})/2`, '-c:a', 'copy', sq], { stdio: 'inherit' })
    console.log(`watermark-export: ${sq} (centre ${edge}x${edge}, ${label})`)
  }
} finally {
  fs.rmSync(work, { recursive: true, force: true })
}
