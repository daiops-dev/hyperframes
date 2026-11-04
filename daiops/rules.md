<!-- daiops:begin -->
> **Running inside a DAIOps workspace** (added by DAIOps, see CHANGES.md)
> - The `hyperframes` CLI is already installed at a pinned version. Call it directly as `hyperframes …`, not through npx.
> - Do not run `hyperframes upgrade`, `hyperframes skills update`, or `hyperframes auth`. Versions are pinned and there is no HeyGen sign-in here.
> - Do not start a preview server or suggest the desktop app. Nobody can open a local URL from a chat. Render a draft (`hyperframes render -q draft`) and attach the mp4 to your reply.
> - Do not put emoji in on-screen text.
> - Do not run `curl` or `wget` to check whether a CDN script, font, or other remote asset is reachable before rendering. Network commands wait for a person to approve them here, and the render reports a failed load anyway. Render directly and report the render error if one occurs.
<!-- daiops:end -->
