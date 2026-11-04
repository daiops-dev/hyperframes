# Changes from HyperFrames

Built from [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) `v0.9.9` by `daiops/build.mjs`.

## Removed

Everything outside `skills/` except `LICENSE` and `CREDITS.md`: `CHANGES.md`, `NOTICE`, `README.md`, `daiops.yaml`.

## Added

- `daiops.yaml`: pinned tools DAIOps installs for employees hired from this talent
- `NOTICE`, this file, and `README.md` (replaces the upstream README)
- `daiops/`: the build script and templates

## Modified

Totals: 441 `npx hyperframes` calls, 0 update prompts removed, rules block in 9 `SKILL.md`.

| File | Change |
|---|---|
| `skills/figma/SKILL.md` | npx hyperframes -> hyperframes (5); added DAIOps workspace rules block (1) |
| `skills/hyperframes-cli/references/beats.md` | npx hyperframes -> hyperframes (5) |
| `skills/hyperframes-cli/references/cloud.md` | npx hyperframes -> hyperframes (23) |
| `skills/hyperframes-cli/references/cloudrun.md` | npx hyperframes -> hyperframes (7) |
| `skills/hyperframes-cli/references/compare-and-batch.md` | npx hyperframes -> hyperframes (4) |
| `skills/hyperframes-cli/references/conventions.md` | npx hyperframes -> hyperframes (2) |
| `skills/hyperframes-cli/references/doctor-browser.md` | npx hyperframes -> hyperframes (9) |
| `skills/hyperframes-cli/references/feedback.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes-cli/references/init-and-scaffold.md` | npx hyperframes -> hyperframes (17) |
| `skills/hyperframes-cli/references/lambda.md` | npx hyperframes -> hyperframes (14) |
| `skills/hyperframes-cli/references/lint-validate-inspect.md` | npx hyperframes -> hyperframes (28) |
| `skills/hyperframes-cli/references/preview-render.md` | npx hyperframes -> hyperframes (35) |
| `skills/hyperframes-cli/references/upgrade-info-misc.md` | npx hyperframes -> hyperframes (26) |
| `skills/hyperframes-cli/SKILL.md` | npx hyperframes -> hyperframes (9); added DAIOps workspace rules block (1); render a draft instead of handing over a preview URL (1) |
| `skills/hyperframes-registry/references/contributing.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes-registry/references/discovery.md` | npx hyperframes -> hyperframes (10) |
| `skills/hyperframes-registry/references/search.md` | npx hyperframes -> hyperframes (11) |
| `skills/hyperframes-registry/SKILL.md` | npx hyperframes -> hyperframes (4); added DAIOps workspace rules block (1) |
| `skills/hyperframes/references/captions.md` | npx hyperframes -> hyperframes (5) |
| `skills/hyperframes/references/film.md` | npx hyperframes -> hyperframes (4) |
| `skills/hyperframes/references/format.md` | npx hyperframes -> hyperframes (2) |
| `skills/hyperframes/references/look.md` | npx hyperframes -> hyperframes (2) |
| `skills/hyperframes/references/motion.md` | npx hyperframes -> hyperframes (5) |
| `skills/hyperframes/references/plugin-installation.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/references/review.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes/references/runtimes.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/references/skill-lifecycle.md` | npx hyperframes -> hyperframes (11) |
| `skills/hyperframes/references/sound.md` | npx hyperframes -> hyperframes (4) |
| `skills/hyperframes/references/storyboard.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/references/types/data.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/references/types/launch.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/references/types/music.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/SKILL.md` | npx hyperframes -> hyperframes (11); added DAIOps workspace rules block (1); render a draft instead of waiting at the Studio preview (1); removed the desktop app section (1) |
| `skills/media-use/audio/references/bgm.md` | npx hyperframes -> hyperframes (2); no sign-in preflight (1); MusicGen disabled note (1) |
| `skills/media-use/audio/references/captions/authoring.md` | npx hyperframes -> hyperframes (4) |
| `skills/media-use/audio/references/captions/transcript-handling.md` | npx hyperframes -> hyperframes (3) |
| `skills/media-use/audio/references/remove-background.md` | npx hyperframes -> hyperframes (6) |
| `skills/media-use/audio/references/requirements.md` | npx hyperframes -> hyperframes (3) |
| `skills/media-use/audio/references/sfx.md` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/audio/references/transcribe.md` | npx hyperframes -> hyperframes (7) |
| `skills/media-use/audio/references/tts-to-captions.md` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/audio/references/tts.md` | npx hyperframes -> hyperframes (9); no sign-in preflight (1) |
| `skills/media-use/audio/scripts/lib/bgm.mjs` | MusicGen fallback disabled (CC-BY-NC weights) (1) |
| `skills/media-use/audio/scripts/lib/heygen.mjs` | npx hyperframes -> hyperframes (6) |
| `skills/media-use/audio/scripts/lib/heygen.test.mjs` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/audio/scripts/lib/tts.cleanup.test.mjs` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/audio/scripts/lib/tts.mjs` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/audio/scripts/lib/tts.test.mjs` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/references/audio.md` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/references/grading.md` | npx hyperframes -> hyperframes (8) |
| `skills/media-use/references/heygen.md` | npx hyperframes -> hyperframes (13) |
| `skills/media-use/references/local.md` | npx hyperframes -> hyperframes (7) |
| `skills/media-use/references/media-treatment-recipes.md` | npx hyperframes -> hyperframes (6) |
| `skills/media-use/references/meta.md` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/references/mixing.md` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/references/operations.md` | npx hyperframes -> hyperframes (3) |
| `skills/media-use/references/resolve.md` | npx hyperframes -> hyperframes (10) |
| `skills/media-use/references/setup-providers.md` | npx hyperframes -> hyperframes (5) |
| `skills/media-use/scripts/transcribe.mjs` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/scripts/transcribe.test.mjs` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/SKILL.md` | npx hyperframes -> hyperframes (9); added DAIOps workspace rules block (1); no HeyGen sign-in step (1) |
| `skills/remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/README.md` | npx hyperframes -> hyperframes (2) |
| `skills/remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/README.md` | npx hyperframes -> hyperframes (2) |
| `skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/README.md` | npx hyperframes -> hyperframes (2) |
| `skills/remotion-to-hyperframes/references/eval.md` | npx hyperframes -> hyperframes (2) |
| `skills/remotion-to-hyperframes/references/transitions.md` | npx hyperframes -> hyperframes (2) |
| `skills/remotion-to-hyperframes/SKILL.md` | npx hyperframes -> hyperframes (3); added DAIOps workspace rules block (1) |
| `skills/reverse-any-video/references/animated.md` | npx hyperframes -> hyperframes (2) |
| `skills/reverse-any-video/references/match.md` | npx hyperframes -> hyperframes (2) |
| `skills/reverse-any-video/references/people.md` | npx hyperframes -> hyperframes (5) |
| `skills/reverse-any-video/references/start.md` | npx hyperframes -> hyperframes (10) |
| `skills/reverse-any-video/SKILL.md` | npx hyperframes -> hyperframes (11); added DAIOps workspace rules block (1) |
| `skills/slideshow/references/standalone-harness.md` | npx hyperframes -> hyperframes (1) |
| `skills/slideshow/SKILL.md` | npx hyperframes -> hyperframes (3); added DAIOps workspace rules block (1) |
| `skills/style-sampling/references/remix.md` | npx hyperframes -> hyperframes (4) |
| `skills/style-sampling/SKILL.md` | npx hyperframes -> hyperframes (5); added DAIOps workspace rules block (1) |
