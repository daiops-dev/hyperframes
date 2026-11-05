#!/usr/bin/env node
/**
 * List the on-screen text of a HyperFrames project with the times each line is readable, as subtitle cues.
 * Added by DAIOps (see CHANGES.md). The talent video upload tool translates these cues into per-language
 * WebVTT files, so a film with no narration can still carry subtitles.
 *
 *   node subtitle-cues.mjs --project ./my-video --out ./renders/subtitle-cues.json [--step 0.1] [--min-font 28]
 *
 * - Starts a background preview of the project, opens it in the render Chrome, seeks the film every --step
 *   seconds and records each text block that is readable at that time (opacity >= 0.5, inside the frame,
 *   not display:none or visibility:hidden). Each cue's start and end are then narrowed to about 10 ms
 * - Which blocks count: when any element carries `data-subtitle`, only those blocks (and their children)
 *   are listed. Otherwise every block whose font size is at least --min-font px at 1080 lines (default 28),
 *   so small UI labels in a mock screen are left out. Add `data-no-subtitle` to drop one block
 * - A block that changes its text (a typing effect, a counter) becomes one cue per distinct text that stays
 *   readable for at least 0.4 s
 * - Output: { version: 1, duration, width, height, cues: [{ start, end, text }] } in seconds, sorted by start
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

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
const fail = (m) => { console.error(`subtitle-cues: ${m}`); process.exit(2) }
if (!a.project || !a.out) fail('usage: --project <dir> --out <file.json> [--step 0.1] [--min-font 28]')
const project = path.resolve(a.project)
const out = path.resolve(a.out)
if (!fs.existsSync(path.join(project, 'index.html'))) fail(`no index.html in ${project}`)
const step = Number(a.step ?? 0.1)
const minFont = Number(a['min-font'] ?? 28)
if (!(step >= 0.02 && step <= 0.5)) fail('--step must be in [0.02, 0.5]')
if (!(minFont > 0)) fail('--min-font must be > 0')
const MIN_HOLD = 0.4

// puppeteer-core ships inside the hyperframes CLI; load it from there so the project needs no install
function loadPuppeteer() {
  const roots = []
  try { roots.push(path.join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'hyperframes')) } catch {}
  roots.push(process.cwd(), project)
  for (const root of roots) {
    try { return createRequire(path.join(root, 'package.json'))('puppeteer-core') } catch {}
  }
  fail('puppeteer-core not found (it comes with the hyperframes CLI: npm i -g hyperframes)')
}

const hf = (...cmd) => execFileSync('hyperframes', cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const chrome = hf('browser', 'path').trim().split('\n').pop().trim()
if (!chrome || !fs.existsSync(chrome)) fail('render Chrome not found: run `hyperframes browser ensure` first')

const port = String(a.port ?? 3900 + Math.floor(Math.random() * 90))
const started = JSON.parse(hf('preview', project, '--background', '--no-open', '--force-new', '--port', port, '--json').trim().split('\n').pop())
if (!started.ok) fail(`preview did not start: ${JSON.stringify(started).slice(0, 300)}`)
const { serverUrl, projectName } = started.result
const pageUrl = `${serverUrl}/api/projects/${encodeURIComponent(projectName)}/preview/comp/index.html`

const puppeteer = loadPuppeteer()
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
try {
  const page = await browser.newPage()
  const size = await (async () => {
    await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 60000 })
    await page.waitForFunction(() => window.__player && window.__clipManifest, { timeout: 30000 })
    return page.evaluate(() => {
      const root = document.querySelector('[data-composition-id]')
      return {
        width: Number(root?.getAttribute('data-width')) || 1920,
        height: Number(root?.getAttribute('data-height')) || 1080,
        duration: Number(window.__clipManifest.durationSeconds) || 0,
      }
    })
  })()
  if (!size.duration) fail('film has no duration')
  await page.setViewport({ width: size.width, height: size.height })
  await page.evaluate(() => window.__player.enableRenderMode?.())

  const fontFloor = (minFont * Math.min(size.width, size.height)) / 1080
  // Returns [key, text] for each readable block at time t
  const sample = async (t) => {
    await page.evaluate((t) => window.__player.renderSeek(t), t)
    await page.evaluate(() => window.__hfWaitForSeekCompletion?.())
    return page.evaluate((fontFloor, W, H) => {
      const tagged = document.querySelector('[data-subtitle]') !== null
      const inline = new Set(['inline', 'inline-block', 'contents'])
      const blockOf = (el) => {
        let e = el
        while (e.parentElement && inline.has(getComputedStyle(e).display)) e = e.parentElement
        return e
      }
      const readable = (el) => {
        let opacity = 1
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
          const cs = getComputedStyle(e)
          if (cs.display === 'none' || cs.visibility === 'hidden') return false
          opacity *= Number(cs.opacity)
        }
        const r = el.getBoundingClientRect()
        return opacity >= 0.5 && r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < W && r.top < H
      }
      const seen = new Map()
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue
        const el = n.parentElement
        if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue
        if (el.closest('[data-no-subtitle]')) continue
        if (tagged ? !el.closest('[data-subtitle]') : parseFloat(getComputedStyle(el).fontSize) < fontFloor) continue
        if (!readable(el)) continue
        const block = tagged ? el.closest('[data-subtitle]') : blockOf(el)
        if (seen.has(block)) continue
        if (!block.__subtitleKey) block.__subtitleKey = `b${(window.__subtitleKeys = (window.__subtitleKeys ?? 0) + 1)}`
        seen.set(block, [block.__subtitleKey, block.innerText.replace(/\s+/g, ' ').trim()])
      }
      return [...seen.values()].filter(([, text]) => text)
    }, fontFloor, size.width, size.height)
  }

  const times = []
  for (let t = 0; t < size.duration; t = Math.round((t + step) * 1000) / 1000) times.push(t)
  const frames = []
  for (const t of times) frames.push(new Map(await sample(t)))

  // Runs of consecutive samples where one block shows the same text
  const runs = []
  const open = new Map()
  frames.forEach((frame, i) => {
    for (const [key, run] of open) {
      if (frame.get(key) !== run.text) { runs.push(run); open.delete(key) }
    }
    for (const [key, text] of frame) {
      if (!open.has(key)) open.set(key, { key, text, first: i, last: i })
      else open.get(key).last = i
    }
    for (const run of open.values()) if (frame.has(run.key)) run.last = i
  })
  runs.push(...open.values())

  // Narrow each edge between the last sample without the text and the first with it
  const showsAt = async (run, t) => (new Map(await sample(t))).get(run.key) === run.text
  const narrow = async (run, outside, inside) => {
    for (let k = 0; k < 4; k++) {
      const mid = (outside + inside) / 2
      if (await showsAt(run, mid)) inside = mid
      else outside = mid
    }
    return inside
  }
  const cues = []
  for (const run of runs) {
    const start = run.first === 0 ? 0 : await narrow(run, times[run.first - 1], times[run.first])
    const end = run.last === times.length - 1
      ? size.duration
      : await narrow(run, times[run.last + 1], times[run.last])
    if (end - start < MIN_HOLD) continue
    cues.push({ start: Math.round(start * 1000) / 1000, end: Math.round(end * 1000) / 1000, text: run.text })
  }
  cues.sort((x, y) => x.start - y.start || x.end - y.end)

  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify({ version: 1, duration: size.duration, width: size.width, height: size.height, cues }, null, 2) + '\n')
  console.log(`subtitle-cues: ${out} (${cues.length} cues over ${size.duration}s, ${times.length} samples)`)
  for (const c of cues) console.log(`  ${c.start.toFixed(2)}-${c.end.toFixed(2)}  ${c.text.slice(0, 80)}`)
} finally {
  await browser.close()
  try { hf('preview', project, '--stop') } catch {}
}
