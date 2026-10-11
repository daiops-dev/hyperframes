# Changes from HyperFrames

Built from [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) `v0.8.147` by `daiops/build.mjs`.

## Removed

Everything outside `skills/` except `LICENSE` and `CREDITS.md`: `.agents`, `.claude`, `.claude-plugin`, `.codex`, `.codex-plugin`, `.cursor-plugin`, `.editorconfig`, `.env.example`, `.fallowrc.jsonc`, `.gitattributes`, `.github`, `.gitignore`, `.oxfmtrc.json`, `.oxlintrc.json`, `.prettierignore`, `ADOPTERS.md`, `AGENTS.md`, `CLAUDE.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `DESIGN.md`, `DOCS_GUIDELINES.md`, `Dockerfile.test`, `README.md`, `SECURITY.md`, `TRIAGE.md`, `assets`, `bun.lock`, `commitlint.config.js`, `docs`, `examples`, `gemini-extension.json`, `knip.config.ts`, `lefthook.yml`, `package.json`, `packages`, `plans`, `plugin.json`, `registry`, `releases`, `scripts`, `skills-manifest.json`, `themes`, `updates`.

## Added

- `daiops.yaml`: pinned tools DAIOps installs for employees hired from this talent
- `NOTICE`, this file, and `README.md` (replaces the upstream README)
- `daiops/`: the build script and templates

## Modified

Totals: 482 `npx hyperframes` calls, 10 update prompts removed, rules block in 21 `SKILL.md`.

| File | Change |
|---|---|
| `skills/embedded-captions/modes/standard/_anatomy.md` | npx hyperframes -> hyperframes (1) |
| `skills/embedded-captions/SKILL.md` | npx hyperframes -> hyperframes (2); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/faceless-explainer/SKILL.md` | npx hyperframes -> hyperframes (11); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/figma/SKILL.md` | npx hyperframes -> hyperframes (4); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/general-video/SKILL.md` | npx hyperframes -> hyperframes (9); added DAIOps workspace rules block (1) |
| `skills/hyperframes-animation/adapters/animejs.md` | npx hyperframes -> hyperframes (2) |
| `skills/hyperframes-animation/adapters/css-animations.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes-animation/adapters/lottie.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes-animation/adapters/three.md` | npx hyperframes -> hyperframes (4) |
| `skills/hyperframes-animation/adapters/typegpu.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-animation/adapters/waapi.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes-animation/SKILL.md` | npx hyperframes -> hyperframes (1); added DAIOps workspace rules block (1) |
| `skills/hyperframes-animation/techniques.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-audio/references/diagnosis.md` | npx hyperframes -> hyperframes (2) |
| `skills/hyperframes-audio/SKILL.md` | npx hyperframes -> hyperframes (1); added DAIOps workspace rules block (1) |
| `skills/hyperframes-cli/references/beats.md` | npx hyperframes -> hyperframes (4) |
| `skills/hyperframes-cli/references/cloud.md` | npx hyperframes -> hyperframes (22) |
| `skills/hyperframes-cli/references/cloudrun.md` | npx hyperframes -> hyperframes (7) |
| `skills/hyperframes-cli/references/compare-and-batch.md` | npx hyperframes -> hyperframes (4) |
| `skills/hyperframes-cli/references/doctor-browser.md` | npx hyperframes -> hyperframes (9) |
| `skills/hyperframes-cli/references/init-and-scaffold.md` | npx hyperframes -> hyperframes (16) |
| `skills/hyperframes-cli/references/lambda.md` | npx hyperframes -> hyperframes (14) |
| `skills/hyperframes-cli/references/lint-validate-inspect.md` | npx hyperframes -> hyperframes (24) |
| `skills/hyperframes-cli/references/preview-render.md` | npx hyperframes -> hyperframes (35) |
| `skills/hyperframes-cli/references/upgrade-info-misc.md` | npx hyperframes -> hyperframes (26) |
| `skills/hyperframes-cli/SKILL.md` | npx hyperframes -> hyperframes (42); added DAIOps workspace rules block (1) |
| `skills/hyperframes-core/references/creator-editing-recipes.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-core/references/data-attributes.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-core/references/full-screen-motion.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-core/references/tailwind.md` | npx hyperframes -> hyperframes (2) |
| `skills/hyperframes-core/references/variables-and-media.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-core/SKILL.md` | npx hyperframes -> hyperframes (6); added DAIOps workspace rules block (1) |
| `skills/hyperframes-creative/references/beat-direction.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-creative/references/composition-patterns.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-creative/references/design-picker.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes-creative/SKILL.md` | added DAIOps workspace rules block (1) |
| `skills/hyperframes-keyframes/SKILL.md` | npx hyperframes -> hyperframes (8); added DAIOps workspace rules block (1) |
| `skills/hyperframes-registry/references/contributing.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes-registry/references/discovery.md` | npx hyperframes -> hyperframes (10) |
| `skills/hyperframes-registry/SKILL.md` | npx hyperframes -> hyperframes (9); added DAIOps workspace rules block (1) |
| `skills/hyperframes-studio/SKILL.md` | added DAIOps workspace rules block (1) |
| `skills/hyperframes/references/capability-menu.md` | npx hyperframes -> hyperframes (4) |
| `skills/hyperframes/references/plugin-installation.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/references/production-loop.md` | npx hyperframes -> hyperframes (3) |
| `skills/hyperframes/references/review-loop.md` | npx hyperframes -> hyperframes (1) |
| `skills/hyperframes/references/skill-lifecycle.md` | npx hyperframes -> hyperframes (7) |
| `skills/hyperframes/SKILL.md` | npx hyperframes -> hyperframes (7); added DAIOps workspace rules block (1) |
| `skills/media-use/audio/references/bgm.md` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/audio/references/captions/authoring.md` | npx hyperframes -> hyperframes (4) |
| `skills/media-use/audio/references/captions/transcript-handling.md` | npx hyperframes -> hyperframes (3) |
| `skills/media-use/audio/references/remove-background.md` | npx hyperframes -> hyperframes (6) |
| `skills/media-use/audio/references/requirements.md` | npx hyperframes -> hyperframes (3) |
| `skills/media-use/audio/references/sfx.md` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/audio/references/transcribe.md` | npx hyperframes -> hyperframes (6) |
| `skills/media-use/audio/references/tts-to-captions.md` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/audio/references/tts.md` | npx hyperframes -> hyperframes (9) |
| `skills/media-use/audio/scripts/lib/heygen.mjs` | npx hyperframes -> hyperframes (4) |
| `skills/media-use/audio/scripts/lib/tts.mjs` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/audio/scripts/lib/tts.test.mjs` | npx hyperframes -> hyperframes (2) |
| `skills/media-use/references/audio.md` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/references/grading.md` | npx hyperframes -> hyperframes (7) |
| `skills/media-use/references/media-treatment-recipes.md` | npx hyperframes -> hyperframes (6) |
| `skills/media-use/references/meta.md` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/references/operations.md` | npx hyperframes -> hyperframes (3) |
| `skills/media-use/references/resolve.md` | npx hyperframes -> hyperframes (10) |
| `skills/media-use/references/setup-providers.md` | npx hyperframes -> hyperframes (3) |
| `skills/media-use/scripts/transcribe.mjs` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/scripts/transcribe.test.mjs` | npx hyperframes -> hyperframes (1) |
| `skills/media-use/SKILL.md` | npx hyperframes -> hyperframes (2); added DAIOps workspace rules block (1) |
| `skills/motion-graphics/agents/builder.md` | npx hyperframes -> hyperframes (3) |
| `skills/motion-graphics/agents/director.md` | npx hyperframes -> hyperframes (1) |
| `skills/motion-graphics/agents/finalize.md` | npx hyperframes -> hyperframes (3) |
| `skills/motion-graphics/catalog-map.md` | npx hyperframes -> hyperframes (4) |
| `skills/motion-graphics/categories/charts/module.md` | npx hyperframes -> hyperframes (2) |
| `skills/motion-graphics/categories/kinetic-type/module.md` | npx hyperframes -> hyperframes (1) |
| `skills/motion-graphics/categories/lower-thirds/module.md` | npx hyperframes -> hyperframes (1) |
| `skills/motion-graphics/categories/maps/module.md` | npx hyperframes -> hyperframes (1) |
| `skills/motion-graphics/categories/tweet/module.md` | npx hyperframes -> hyperframes (1) |
| `skills/motion-graphics/references/motion-vocabulary.md` | npx hyperframes -> hyperframes (1) |
| `skills/motion-graphics/SKILL.md` | npx hyperframes -> hyperframes (8); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/music-to-video/SKILL.md` | npx hyperframes -> hyperframes (7); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/pr-to-video/references/code-vocabulary.md` | npx hyperframes -> hyperframes (4) |
| `skills/pr-to-video/SKILL.md` | npx hyperframes -> hyperframes (12); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/product-launch-video/SKILL.md` | npx hyperframes -> hyperframes (11); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/README.md` | npx hyperframes -> hyperframes (1) |
| `skills/remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/README.md` | npx hyperframes -> hyperframes (1) |
| `skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/README.md` | npx hyperframes -> hyperframes (1) |
| `skills/remotion-to-hyperframes/references/transitions.md` | npx hyperframes -> hyperframes (2) |
| `skills/remotion-to-hyperframes/SKILL.md` | npx hyperframes -> hyperframes (4); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/slideshow/SKILL.md` | npx hyperframes -> hyperframes (7); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
| `skills/talking-head-recut/SKILL.md` | npx hyperframes -> hyperframes (9); removed "keep this skill fresh" update prompt (1); added DAIOps workspace rules block (1) |
