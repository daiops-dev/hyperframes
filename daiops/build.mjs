#!/usr/bin/env node
/**
 * Builds the DAIOps copy of HyperFrames from an upstream checkout.
 *
 *   node daiops/build.mjs <upstream-tag>      (run at the repository root, on a checkout of that tag)
 *
 * Why a build and not a rebase: the full upstream archive is about 150 MB and DAIOps stores a
 * talent's whole repository archive (80 MB limit). Only `skills/` is needed. Deleting the rest
 * in a commit and rebasing it would conflict on every upstream change, so the copy is rebuilt
 * from each upstream tag instead. Every patch counts its matches and the build fails on zero,
 * so a reworded upstream file cannot silently drop a fix.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ref = process.argv[2]
if (!ref || !/^v\d+\.\d+\.\d+$/.test(ref)) {
  console.error('usage: node daiops/build.mjs vX.Y.Z')
  process.exit(2)
}
const cliVersion = ref.slice(1)
const root = process.cwd()
const here = path.join(root, 'daiops')
for (const p of ['skills', 'LICENSE', 'daiops']) {
  if (!fs.existsSync(path.join(root, p))) {
    console.error(`missing ${p}: run at the repository root on an upstream checkout with daiops/ restored`)
    process.exit(2)
  }
}

// 1. Keep only what a DAIOps employee needs.
const KEEP = new Set(['.git', 'skills', 'LICENSE', 'CREDITS.md', 'daiops'])
const removed = []
for (const entry of fs.readdirSync(root)) {
  if (KEEP.has(entry)) continue
  fs.rmSync(path.join(root, entry), { recursive: true, force: true })
  removed.push(entry)
}

// 2. Patch skills/.
const TEXT = /\.(md|mjs|js|cjs|ts|sh|py|txt|json|ya?ml|html)$/
const NPX = /npx hyperframes(?:@latest)?(?=[\s`'"),.;:\]]|$)/g
const FRESH = /^> \*\*First, keep this skill fresh.*\n?/gm
const RULES = fs.readFileSync(path.join(here, 'rules.md'), 'utf8').trim()
const RULES_BLOCK = /<!-- daiops:begin -->[\s\S]*?<!-- daiops:end -->\n*/

const changes = new Map()
const note = (file, what, n) => {
  if (n === 0) return
  const c = changes.get(file) ?? {}
  c[what] = (c[what] ?? 0) + n
  changes.set(file, c)
}
let skillFiles = 0
const problems0 = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (TEXT.test(entry.name)) patch(p)
  }
}

function patch(file) {
  const rel = path.relative(root, file)
  let text = fs.readFileSync(file, 'utf8')
  const before = text

  const npx = text.match(NPX)?.length ?? 0
  text = text.replace(NPX, 'hyperframes')
  note(rel, 'npx hyperframes -> hyperframes', npx)

  if (path.basename(file) === 'SKILL.md') {
    skillFiles += 1
    const fresh = text.match(FRESH)?.length ?? 0
    text = text.replace(FRESH, '')
    note(rel, 'removed "keep this skill fresh" update prompt', fresh)

    text = text.replace(RULES_BLOCK, '')
    const fm = text.match(/^---\n[\s\S]*?\n---\n/)
    const at = fm ? fm[0].length : 0
    text = `${text.slice(0, at)}\n${RULES}\n\n${text.slice(at).replace(/^\n+/, '')}`
    note(rel, 'added DAIOps workspace rules block', 1)
  }

  if (text !== before) fs.writeFileSync(file, text)
}

walk(path.join(root, 'skills'))

// 2b. Targeted patches where the upstream text tells the agent to do what a DAIOps workspace cannot
// (HeyGen sign-in, Studio preview, the desktop app) or must not (MusicGen, CC-BY-NC weights).
// Each patch must match exactly `expect` times, so a reworded upstream file fails the build.
const NO_SIGNIN = 'DAIOps: there is no HeyGen sign-in here. Do not run `hyperframes auth` or stop to ask the person to sign in; use the local route.'
const PATCHES = [
  {
    file: 'skills/hyperframes/SKILL.md',
    what: 'render a draft instead of waiting at the Studio preview',
    find: /^- Render when the person approves the Studio preview.*$/m,
    replace: '- Render a draft after your check and review pass and attach the mp4 (DAIOps: there is no Studio preview here).',
    expect: 1,
  },
  {
    file: 'skills/hyperframes/SKILL.md',
    what: 'removed the desktop app section',
    find: /^## The HyperFrames desktop app\n[\s\S]*?(?=^## )/m,
    replace: '',
    expect: 1,
  },
  {
    file: 'skills/hyperframes-cli/SKILL.md',
    what: 'render a draft instead of handing over a preview URL',
    find: /^4\. `hyperframes preview --background`.*$/m,
    replace: '4. Render a draft (`hyperframes render -q draft`) and attach the mp4 (DAIOps: nobody can open a preview URL from a chat).',
    expect: 1,
  },
  {
    file: 'skills/media-use/SKILL.md',
    what: 'no HeyGen sign-in step',
    find: /^\*\*Sign in\.\*\*.*$/m,
    replace: `**Sign in.** ${NO_SIGNIN} Music is generated with Lyria (\`$GEMINI_API_KEY\`); effects come from the bundled or Openverse sounds.`,
    expect: 1,
  },
  {
    file: 'skills/media-use/audio/references/bgm.md',
    what: 'no sign-in preflight',
    find: /^> \*\*Run the Preflight first.*$/m,
    replace: `> **${NO_SIGNIN}**`,
    expect: 1,
  },
  {
    file: 'skills/media-use/audio/references/tts.md',
    what: 'no sign-in preflight',
    find: /^> \*\*Run the Preflight first.*$/m,
    replace: `> **${NO_SIGNIN}**`,
    expect: 1,
  },
  {
    file: 'skills/media-use/audio/references/bgm.md',
    what: 'MusicGen disabled note',
    find: /^## Local generation \(fallback\) — Lyria → MusicGen$/m,
    replace: '## Local generation (fallback) — Lyria\n\n> **DAIOps:** MusicGen is disabled in this copy (its weights are CC-BY-NC). If Lyria fails, the track is skipped: deliver the video without music and say so.\n> For a film with scenes, plan the bed per scene instead of one prompt: `scripts/lyria-sections.py --plan plan.json` (Lyria RealTime, cross-fades weighted prompts at each scene start) or `scripts/lyria-clip.py --plan plan.json` (Lyria 3 Clip, one 30 s take from timestamped sections). Both read the same plan; see `scripts/bgm-plan.example.json`.',
    expect: 1,
  },
  {
    file: 'skills/media-use/audio/references/sfx.md',
    what: 'point to the DAIOps UI sound set',
    find: /^## Bundled library \(fallback\)$/m,
    replace: '## UI sound set (DAIOps)\n\n`assets/sfx-ui/` holds 37 CC0 interface sounds (Kenney) with several takes per role: key-tick, click, pop, panel-in, panel-out. Use it before the bundled library for UI films, rotate takes, and never use chime, ping, notification or sparkle (`hyperframes/references/sound.md`). See `assets/sfx-ui/README.md`.\n\n## Bundled library (fallback)',
    expect: 1,
  },
  {
    file: 'skills/media-use/audio/scripts/lib/bgm.mjs',
    what: 'MusicGen fallback disabled (CC-BY-NC weights)',
    find: /^  if \(!useLyria && !pyOk\(BGM_PY_PROBE\)\) pipInstall\(BGM_PY_DEPS\);$/m,
    replace: [
      '  // DAIOps: MusicGen weights are CC-BY-NC, so this copy never installs or runs it.',
      '  if (!useLyria) {',
      '    return {',
      '      disabled: true,',
      '      reason: lyriaConfigured',
      '        ? "Lyria configured but google-genai could not be installed; MusicGen is disabled in the DAIOps copy"',
      '        : "no Lyria key ($GEMINI_API_KEY); MusicGen is disabled in the DAIOps copy",',
      '    };',
      '  }',
    ].join('\n'),
    expect: 1,
  },
]
for (const p of PATCHES) {
  const file = path.join(root, p.file)
  if (!fs.existsSync(file)) {
    problems0.push(`patch target missing: ${p.file}`)
    continue
  }
  const text = fs.readFileSync(file, 'utf8')
  const flags = p.find.flags.includes('g') ? p.find.flags : `${p.find.flags}g`
  const n = text.match(new RegExp(p.find.source, flags))?.length ?? 0
  if (n !== p.expect) {
    problems0.push(`${p.file}: "${p.what}" matched ${n}, expected ${p.expect}`)
    continue
  }
  fs.writeFileSync(file, text.replace(p.find, p.replace))
  note(p.file, p.what, n)
}

// 2c. Files DAIOps adds inside skills/ (daiops/extra/skills/** → skills/**). Never overwrite an upstream file:
// an extra that collides with upstream fails the build, so a new upstream file cannot be silently replaced.
const extraRoot = path.join(here, 'extra', 'skills')
const upstreamHas = (p) => {
  try {
    execFileSync('git', ['cat-file', '-e', `${ref}:${p}`], { cwd: root, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
const extras = []
if (fs.existsSync(extraRoot)) {
  ;(function copy(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const src = path.join(dir, entry.name)
      if (entry.isDirectory()) { copy(src); continue }
      const rel = path.relative(extraRoot, src)
      const dest = path.join(root, 'skills', rel)
      // A path upstream ships at this tag is upstream's: never overwrite it. Anything else is ours to (re)write,
      // including our own copy from an earlier build on this branch.
      if (upstreamHas(`skills/${rel}`)) { problems0.push(`extra collides with upstream: skills/${rel}`); continue }
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
      extras.push(`skills/${rel}`)
    }
  })(extraRoot)
}

// 3. Files DAIOps adds.
const fill = (s) => s.replaceAll('{{UPSTREAM_REF}}', ref).replaceAll('{{CLI_VERSION}}', cliVersion)
fs.writeFileSync(path.join(root, 'daiops.yaml'), fill(fs.readFileSync(path.join(here, 'daiops.template.yaml'), 'utf8')))
fs.writeFileSync(path.join(root, 'README.md'), fill(fs.readFileSync(path.join(here, 'README.template.md'), 'utf8')))
fs.writeFileSync(path.join(root, 'NOTICE'), fill(fs.readFileSync(path.join(here, 'NOTICE.template'), 'utf8')))

// 4. Totals and the gate.
const total = (what) => [...changes.values()].reduce((a, c) => a + (c[what] ?? 0), 0)
const totals = {
  npx: total('npx hyperframes -> hyperframes'),
  fresh: total('removed "keep this skill fresh" update prompt'),
  rules: total('added DAIOps workspace rules block'),
}
let leftover = 0
let freshLeft = 0
;(function count(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) count(p)
    else if (TEXT.test(entry.name)) {
      const t = fs.readFileSync(p, 'utf8')
      leftover += t.match(/npx hyperframes/g)?.length ?? 0
      freshLeft += t.match(/keep this skill fresh/gi)?.length ?? 0
    }
  }
})(path.join(root, 'skills'))

const problems = [...problems0]
if (totals.npx === 0) problems.push('no `npx hyperframes` was replaced (did upstream change its wording?)')
// Upstream dropped the "keep this skill fresh" prompt by v0.9.x; what matters is that none is left.
if (freshLeft !== 0) problems.push(`${freshLeft} "keep this skill fresh" prompt(s) left in skills/ (did upstream reword it?)`)
if (totals.rules !== skillFiles || skillFiles === 0) problems.push(`rules block added to ${totals.rules} of ${skillFiles} SKILL.md`)
if (leftover !== 0) problems.push(`${leftover} \`npx hyperframes\` left in skills/`)

// 5. CHANGES.md, the Apache-2.0 "prominent notice" of modified files.
const rows = [...changes.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, c]) => `| \`${file}\` | ${Object.entries(c).map(([w, n]) => `${w} (${n})`).join('; ')} |`)
fs.writeFileSync(
  path.join(root, 'CHANGES.md'),
  [
    '# Changes from HyperFrames',
    '',
    `Built from [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) \`${ref}\` by \`daiops/build.mjs\`.`,
    '',
    '## Removed',
    '',
    `Everything outside \`skills/\` except \`LICENSE\` and \`CREDITS.md\`: ${removed.sort().map((r) => `\`${r}\``).join(', ')}.`,
    '',
    '## Added',
    '',
    '- `daiops.yaml`: pinned tools DAIOps installs for employees hired from this talent',
    '- `NOTICE`, this file, and `README.md` (replaces the upstream README)',
    '- `daiops/`: the build script and templates',
    ...(extras.length
      ? [`- ${extras.length} files from \`daiops/extra/skills/\`: ${[...new Set(extras.map((e) => path.dirname(e)))].sort().map((d) => `\`${d}/\``).join(', ')}`]
      : []),
    '',
    '## Modified',
    '',
    `Totals: ${totals.npx} \`npx hyperframes\` calls, ${totals.fresh} update prompts removed, rules block in ${totals.rules} \`SKILL.md\`.`,
    '',
    '| File | Change |',
    '|---|---|',
    ...rows,
    '',
  ].join('\n'),
)

console.log(JSON.stringify({ ref, cliVersion, skillFiles, totals, leftover, removed: removed.length, modifiedFiles: changes.size }, null, 2))
if (problems.length > 0) {
  console.error(`BUILD FAILED:\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
