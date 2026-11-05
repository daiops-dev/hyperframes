#!/usr/bin/env python3
"""Section-steered background music with Lyria RealTime (v2).

Follows the official Lyria RealTime guidance (aistudio.google.com/docs/realtime-music-generation,
lyria-prompt-guide):
- send the FULL generation config on every update (unspecified fields reset to defaults)
- cross-fade weighted prompts over several seconds instead of replacing them at once
- keep instruments and mood as separate prompts so each can be weighted on its own
- bpm and scale are fixed for the whole track (changing them needs reset_context, a hard cut)
Also: generate `preroll` extra seconds first and drop them (the model ignores a quiet brief for the
first few seconds), and start each cross-fade `lead + fade` seconds before the section boundary so the
audible change lands on the cut (audio arrives in ~2 s chunks).

    python lyria-sections.py --plan plan.json --output track.wav

plan.json
{
  "duration": 30, "bpm": 96, "scale": "D_MAJOR_B_MINOR", "seed": 4242,
  "preroll": 5, "lead": 2.0, "fade": 3.0, "temperature": 1.1, "top_k": 40,
  "negative": "vocals, singing, heavy drums",
  "sections": [
    {"at": 0, "density": 0.15, "brightness": 0.3, "guidance": 3.5, "mute_drums": true,
     "prompts": [{"text": "Ambient, Synth Pads", "weight": 1.0}, {"text": "Soft Rhodes Piano", "weight": 0.4}]},
    ...
  ]
}
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import wave
from pathlib import Path

SAMPLE_RATE = 48000
CHANNELS = 2
SAMPLE_WIDTH = 2
BYTES_PER_SEC = SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH
STEP = 0.5  # seconds between cross-fade updates


def smooth(t: float) -> float:
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def blend(a: dict, b: dict, t: float) -> dict:
    """Blend two section states. Prompts present in only one side fade from/to zero."""
    s = smooth(t)
    texts = {p["text"] for p in a["prompts"]} | {p["text"] for p in b["prompts"]}
    wa = {p["text"]: p["weight"] for p in a["prompts"]}
    wb = {p["text"]: p["weight"] for p in b["prompts"]}
    prompts = []
    for text in sorted(texts):
        w = wa.get(text, 0.0) + (wb.get(text, 0.0) - wa.get(text, 0.0)) * s
        if abs(w) > 0.05:  # weight must not be 0
            prompts.append({"text": text, "weight": round(w, 3)})
    num = lambda k, d: a.get(k, d) + (b.get(k, d) - a.get(k, d)) * s
    return {
        "prompts": prompts,
        "density": num("density", 0.5),
        "brightness": num("brightness", 0.5),
        "guidance": num("guidance", 3.5),
        "mute_drums": b.get("mute_drums", False) if s >= 0.5 else a.get("mute_drums", False),
        "mute_bass": b.get("mute_bass", False) if s >= 0.5 else a.get("mute_bass", False),
    }


def bar_seconds(plan: dict) -> float:
    return 4 * 60.0 / float(plan.get("bpm", 100))  # 4/4


def snap_to_bars(plan: dict) -> None:
    """Move each section start to the nearest bar line (unless "snap_bars": false). Prints every move."""
    if plan.get("snap_bars", True) is False:
        return
    bar = bar_seconds(plan)
    for s in plan["sections"]:
        snapped = round(round(s["at"] / bar) * bar, 3)
        if snapped != s["at"]:
            print(f"  section {s.get('label', s['at'])}: {s['at']} s -> {snapped} s (bar {bar:.3f} s)")
        s["at"] = snapped


def state_at(plan: dict, t: float) -> dict:
    """Section state the stream should be steered to at output time t (preroll excluded)."""
    secs = plan["sections"]
    lead, fade = float(plan.get("lead", 2.0)), float(plan.get("fade", 3.0))
    cur = secs[0]
    for nxt in secs[1:]:
        end = nxt["at"] - lead
        # a short section shortens its cross-fade instead of starting it before the section begins
        start = max(cur["at"], end - fade)
        if t < start:
            return blend(cur, cur, 0)
        if t < end:
            return blend(cur, nxt, (t - start) / max(0.5, end - start))
        cur = nxt
    return blend(cur, cur, 0)


async def run(plan: dict, out_path: Path) -> None:
    from google import genai
    from google.genai import types

    key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY") or ""
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    client = genai.Client(api_key=key, http_options={"api_version": "v1alpha"})

    plan["sections"] = sorted(plan["sections"], key=lambda s: s["at"])
    snap_to_bars(plan)
    # generate `tail` extra seconds so the film can end on a bar and fade under the end card
    duration = float(plan["duration"]) + float(plan.get("tail", 3.0))
    preroll = float(plan.get("preroll", 5.0))
    total = int((duration + preroll) * BYTES_PER_SEC)
    scale = getattr(types.Scale, plan.get("scale", ""), None) if plan.get("scale") else None
    if plan.get("scale") and scale is None:
        raise RuntimeError(f"unknown scale {plan['scale']!r}; use one of {[s.name for s in types.Scale]}")

    def send_config(st: dict):
        cfg = {
            "bpm": int(plan.get("bpm", 100)),
            "temperature": float(plan.get("temperature", 1.1)),
            "top_k": int(plan.get("top_k", 40)),
            "guidance": float(st["guidance"]),
            "density": float(st["density"]),
            "brightness": float(st["brightness"]),
            "mute_drums": bool(st["mute_drums"]),
            "mute_bass": bool(st["mute_bass"]),
        }
        if "seed" in plan:
            cfg["seed"] = int(plan["seed"])
        if scale is not None:
            cfg["scale"] = scale
        return types.LiveMusicGenerationConfig(**cfg)

    def send_prompts(st: dict):
        ps = [types.WeightedPrompt(text=p["text"], weight=p["weight"]) for p in st["prompts"]]
        if plan.get("negative"):
            ps.append(types.WeightedPrompt(text=plan["negative"], weight=-1.0))
        return ps

    buf = bytearray()
    log: list[str] = []
    async with client.aio.live.music.connect(model="models/lyria-realtime-exp") as session:
        first = state_at(plan, 0.0)
        await session.set_weighted_prompts(prompts=send_prompts(first))
        await session.set_music_generation_config(config=send_config(first))
        await session.play()

        async def receive():
            while len(buf) < total:
                async for msg in session.receive():
                    sc = msg.server_content
                    if sc and sc.audio_chunks:
                        for chunk in sc.audio_chunks:
                            buf.extend(chunk.data)
                        if len(buf) >= total:
                            return
                    elif getattr(msg, "filtered_prompt", None):
                        print(f"[filtered] {msg.filtered_prompt}", file=sys.stderr)
                await asyncio.sleep(1e-6)

        async def steer():
            last = json.dumps(first, sort_keys=True)
            while len(buf) < total:
                await asyncio.sleep(STEP)
                t = len(buf) / BYTES_PER_SEC - preroll
                st = state_at(plan, max(0.0, t))
                key_ = json.dumps(st, sort_keys=True)
                if key_ != last:
                    await session.set_weighted_prompts(prompts=send_prompts(st))
                    await session.set_music_generation_config(config=send_config(st))
                    last = key_
                    top = max(st["prompts"], key=lambda p: p["weight"])["text"] if st["prompts"] else "-"
                    log.append(f"{t:6.2f}s  density {st['density']:.2f}  brightness {st['brightness']:.2f}  lead prompt: {top}")

        rx = asyncio.create_task(receive())
        tx = asyncio.create_task(steer())
        try:
            await asyncio.wait_for(rx, timeout=duration + preroll + 20)
        except TimeoutError:
            print(f"timeout: got {len(buf) / BYTES_PER_SEC:.1f}s", file=sys.stderr)
        tx.cancel()

    start = int(preroll * BYTES_PER_SEC)
    start -= start % (CHANNELS * SAMPLE_WIDTH)
    audio = bytes(buf[start:start + int(duration * BYTES_PER_SEC)])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out_path), "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPLE_WIDTH)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio)
    print(f"BGM: {out_path} ({len(audio) / BYTES_PER_SEC:.2f}s incl. {float(plan.get('tail', 3.0)):.1f}s tail, preroll {preroll:.1f}s dropped)")
    print("  section starts (use these as beat starts): " + ", ".join(f"{s.get('label', '?')} {s['at']}s" for s in plan["sections"]))
    for line in log:
        print("  " + line)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", required=True)
    ap.add_argument("--output", required=True)
    a = ap.parse_args()
    plan = json.loads(Path(a.plan).read_text(encoding="utf-8"))
    try:
        asyncio.run(run(plan, Path(a.output)))
    except RuntimeError as exc:
        print(f"generation failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
