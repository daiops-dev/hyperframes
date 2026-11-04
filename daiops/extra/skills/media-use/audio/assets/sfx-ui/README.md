# UI sound set (DAIOps addition)

37 short interface sounds picked from Kenney "Interface Sounds" 1.0 (CC0 1.0, commercial use allowed,
no attribution required; see `LICENSE-kenney.txt`). Converted from OGG to 48 kHz stereo MP3. Added by
DAIOps (see the repository `CHANGES.md`); not part of upstream HyperFrames.

Use this set before the bundled `../sfx/` library for UI films. It has several takes per role, so a
repeated action never plays the same file twice in a row (`hyperframes/references/sound.md` §4).
`manifest.json` lists every file with its `role`, `duration` and a description.

| Role | Files | Put it on |
|---|---|---|
| `key-tick` | `tick_*`, `click_002`-`click_005` | text arriving letter by letter or line by line (quiet) |
| `click` | `click_001`, `select_*`, `toggle_*` | a real cursor click; a step turning on or a check landing |
| `pop` | `drop_*`, `pluck_002` | a chip, badge, card or number landing |
| `panel-in` | `open_*`, `maximize_*` | a result card or panel appearing, an element growing into view |
| `panel-out` | `close_*`, `minimize_*` | an element leaving or shrinking away |

Not here on purpose: chimes, dings, notification, confirmation, question and error tones (banned by
`sound.md`), and whooshes (use `../sfx/whoosh`, `whoosh-short`, `whoosh-cinematic` for scene cuts).
