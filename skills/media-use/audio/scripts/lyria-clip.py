#!/usr/bin/env python3
"""30-second background music with Lyria 3 Clip, using timestamped sections.

Lyria 3 Clip (`lyria-3-clip-preview`, aistudio.google.com/docs/music-generation) always returns a
30 s MP3 and follows "[m:ss - m:ss] Section: ..." lines in the prompt. One shot, no live steering,
results vary between calls. Reads the same plan.json as lyria-sections.py and writes an MP3.

    python lyria-clip.py --plan plan.json --output track.mp3
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
from pathlib import Path


def ts(sec: float) -> str:
    s = int(round(sec))
    return f"{s // 60}:{s % 60:02d}"


def build_prompt(plan: dict) -> str:
    secs = sorted(plan["sections"], key=lambda s: s["at"])
    bar = 4 * 60.0 / float(plan.get("bpm", 100))
    if plan.get("snap_bars", True) is not False:
        for s in secs:  # section changes on bar lines; a change mid-bar made Clip insert a 1.7 s gap (11/05)
            s["at"] = round(round(s["at"] / bar) * bar, 3)
    dur = min(30.0, float(plan["duration"]))  # Clip always returns 30 s
    head = plan.get("clip_style") or (
        f"Instrumental only, no vocals. Background score for a {int(dur)}-second product explainer video. "
        f"{plan.get('bpm', 100)} BPM, steady tempo throughout. One continuous piece: every section flows into "
        f"the next without any pause, break or silence."
    )
    lines = [head]
    for i, s in enumerate(secs):
        end = secs[i + 1]["at"] if i + 1 < len(secs) else dur
        label = s.get("label", f"Section {i + 1}")
        text = s.get("clip") or ", ".join(p["text"] for p in sorted(s["prompts"], key=lambda p: -p["weight"]))
        lines.append(f"[{ts(s['at'])} - {ts(end)}] {label}: {text}.")
    if plan.get("negative"):
        lines.append(f"Avoid: {plan['negative']}.")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", required=True)
    ap.add_argument("--output", required=True)
    a = ap.parse_args()
    plan = json.loads(Path(a.plan).read_text(encoding="utf-8"))
    prompt = build_prompt(plan)
    print("prompt:\n" + prompt, flush=True)

    from google import genai

    key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY") or ""
    if not key:
        print("generation failed: GEMINI_API_KEY is not set", file=sys.stderr)
        sys.exit(1)
    import time

    client = genai.Client(api_key=key)
    # Run in the background and poll, so a slow or stuck generation ends with a clear error instead of hanging
    try:
        interaction = client.interactions.create(model="lyria-3-clip-preview", input=prompt, background=True, timeout=60)
        deadline = time.time() + float(plan.get("clip_timeout", 240))
        while getattr(interaction, "status", None) in (None, "in_progress", "queued", "requires_continuation"):
            if time.time() > deadline:
                print(f"generation failed: still {interaction.status} after {plan.get('clip_timeout', 240)} s (id {interaction.id})", file=sys.stderr)
                sys.exit(1)
            print(f"status {interaction.status} …", flush=True)
            time.sleep(5)
            interaction = client.interactions.get(interaction.id, timeout=30)
        print(f"status {interaction.status}", flush=True)
    except Exception as exc:  # report the raw error, do not fall back to another tool
        print(f"generation failed: {exc}", file=sys.stderr)
        sys.exit(1)
    audio = getattr(interaction, "output_audio", None)
    if not audio or not getattr(audio, "data", None):
        print(f"generation failed: no audio in response ({interaction!r})"[:800], file=sys.stderr)
        sys.exit(1)
    out = Path(a.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    data = audio.data
    out.write_bytes(data if isinstance(data, (bytes, bytearray)) else base64.b64decode(data))
    print(f"mime: {getattr(audio, 'mime_type', None) or getattr(audio, 'mimeType', '?')}")
    print(f"BGM: {out}")


if __name__ == "__main__":
    main()
