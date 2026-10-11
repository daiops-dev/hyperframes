# hyperframes (DAIOps copy)

This repository is a **modified copy** of [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
at `{{UPSTREAM_REF}}`, prepared so a DAIOps AI employee can use the HyperFrames skills in a chat workspace.

- **Original work**: HyperFrames, Copyright 2026 HeyGen, Inc., licensed under the Apache License 2.0 ([LICENSE](LICENSE), unchanged).
- **What we changed**: see [CHANGES.md](CHANGES.md). In short: only `skills/` is kept, `npx hyperframes` calls become `hyperframes`
  (the CLI is pre-installed at a pinned version), the "keep this skill fresh" update prompts are removed, and every `SKILL.md`
  starts with a short block of rules for the DAIOps workspace.
- **What gets installed**: [daiops.yaml](daiops.yaml) lists the pinned tools DAIOps installs for employees hired from this talent.
- **Notice**: [NOTICE](NOTICE).

For HyperFrames itself (docs, CLI, issues), use the original repository. This copy does not accept HyperFrames bug reports.

## Updating to a new upstream release

1. Fetch the new upstream tag and start branch `daiops` from it.
2. Restore the `daiops/` folder from the previous `daiops-<tag>` tag.
3. Run `node daiops/build.mjs <tag>`. It fails if a patch no longer matches anything.
4. Commit, tag `daiops-<tag>`, and publish the branch and the tag.
5. Re-screen the talent in the DAIOps admin console (new commit) and update it.

---

이 레포는 HyperFrames(HeyGen, Apache-2.0)를 DAIOps 작업 공간에서 쓰도록 고친 사본입니다. 바꾼 내용은 CHANGES.md 에 있습니다.
