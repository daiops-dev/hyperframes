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
;(function count(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) count(p)
    else if (TEXT.test(entry.name)) leftover += fs.readFileSync(p, 'utf8').match(/npx hyperframes/g)?.length ?? 0
  }
})(path.join(root, 'skills'))

const problems = []
if (totals.npx === 0) problems.push('no `npx hyperframes` was replaced (did upstream change its wording?)')
if (totals.fresh === 0) problems.push('no "keep this skill fresh" prompt was removed (did upstream change its wording?)')
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
