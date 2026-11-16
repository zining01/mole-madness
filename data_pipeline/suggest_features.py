"""Ask Claude which dermoscopic features are visible in each image.

The output is a second opinion to review, never written into annotations.json.
For each image the model sees its diagnosis' key + supportive features (whole-lesion
features only where listed there) and answers present / absent / uncertain with evidence.

    python suggest_features.py --variant with_dx      # model is told the diagnosis
    python suggest_features.py --variant blind        # model is not told
    python suggest_features.py --variant blind --dry-run       # print one prompt, no API call
    python suggest_features.py --variant blind --limit 2       # small paid test first
    python suggest_features.py --variant with_dx --model claude-haiku-5-5 --per-dx 1   # model bake-off
    python suggest_features.py --variant with_dx --hires      # full-resolution originals instead of 600-px web images
    python suggest_features.py --variant with_dx --ids-file suggestions/batch.json                  # first run
    python suggest_features.py --variant with_dx --ids-file suggestions/batch.json --run-name r2    # identical repeat
    python suggest_features.py --variant with_dx --missing-only   # after the feature lists change: ask only the new ones

Needs ANTHROPIC_API_KEY in the environment. By default it runs on every accepted
image in webapp/src/data/annotations.json. Results go to
data_pipeline/suggestions/<variant>.<model>[.hires][.<run-name>].json and are
resumable: re-running skips images already done. Then run compare_suggestions.py.
"""
import argparse
import base64
import io
import json
import math
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

# --- CONFIGURATION ---
DEFAULT_MODEL = "claude-opus-5-5"
EFFORT = "high"          # visual judgment is the hard part; don't skimp
WORKERS = 4              # parallel requests
MAX_TOKENS = 16000
# List prices, USD per million input / output tokens - for the cost estimate only.
PRICES = {
    "claude-opus-5-5": (4.00, 20.00),
    "claude-sonnet-5-5": (2.00, 10.00),
    "claude-haiku-5-5": (0.10, 0.50),
}
# Models with server-side refusal fallback (Claude Haiku 5.5 has none).
FALLBACK_MODELS = {"claude-opus-5-5", "claude-sonnet-5-5"}

ROOT = Path(__file__).resolve().parent.parent
ANNOTATIONS = ROOT / "webapp/src/data/annotations.json"
METADATA = ROOT / "webapp/src/metadata_cloud.json"
IMAGE_DIR = ROOT / "webapp/public/images"
ORIGINALS_DIR = ROOT / "data_pipeline/ham10000_data"   # derm12345_{train_part_1,train_part_2,test}/<code>/<id>.jpg
# Current Claude models read images up to 2576 px on the long edge and ~3.75 MP;
# anything larger is downscaled by the API, so --hires sends the largest that fits.
HIRES_MAX_EDGE = 2576
HIRES_MAX_PIXELS = 3_750_000
VOCAB_SCRIPT = ROOT / "webapp/scripts/export_vocabulary.mjs"
OUTPUT_DIR = ROOT / "data_pipeline/suggestions"
SAVE_EVERY = 10

STATUSES = ["present", "absent", "uncertain"]


def load_vocabulary():
    out = subprocess.run(["node", str(VOCAB_SCRIPT)], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def candidate_features(vocab, dx_id):
    """The diagnosis' key + supportive features, whole-lesion ones included only
    where they're on those lists."""
    lists = vocab["diagnosisFeatures"][dx_id]
    return list(dict.fromkeys(lists["key"] + lists["supportive"]))


def build_prompt(vocab, candidates, dx_name, source_label, variant):
    lines = ["You are helping a dermatologist build dermoscopy teaching material. Examine this dermoscopy image carefully."]
    if variant == "with_dx":
        lines.append(f"The diagnosis is {dx_name} (dataset label: {source_label}). Use this only as context.")
    lines += [
        "",
        "For EACH feature listed below, decide whether it is visible in this image:",
        '- "present": clearly visible somewhere in the lesion',
        '- "absent": not visible',
        '- "uncertain": possibly present, or image quality prevents a confident call',
        "",
        "Judge only what is visible in this particular image. Many lesions show only some of the features "
        "typical for their diagnosis; do not mark a feature present just because it is typical.",
        "The image was taken with polarized dermoscopy, so features marked (polarized only) can be assessed.",
        '"no_pigment_network" means no pigment network of any kind, so it cannot be present together with '
        '"typical_network" or "atypical_network".',
        'For "present" or "uncertain", give brief evidence: where in the image (e.g. "upper left edge") and '
        'what it looks like. For "absent", evidence can be an empty string.',
        "",
        "Features (answer under each id):",
    ]
    for f in candidates:
        d = vocab["features"][f]
        pol = " (polarized only)" if d.get("polarizedOnly") else ""
        lines.append(f"- {f}: {d['name']}{pol}. {d['description']}")
    return "\n".join(lines)


def output_schema(candidates):
    """One required entry per candidate, so the model can't skip a feature."""
    answer = {
        "type": "object",
        "properties": {
            "status": {"type": "string", "enum": STATUSES},
            "evidence": {"type": "string"},
        },
        "required": ["status", "evidence"],
        "additionalProperties": False,
    }
    return {
        "type": "object",
        "properties": {f: answer for f in candidates},
        "required": candidates,
        "additionalProperties": False,
    }


_originals = None


def image_block(img_id, hires):
    """The 600-px web image, or (hires) the original resized to Claude's maximum."""
    if not hires:
        data, media_type = (IMAGE_DIR / f"{img_id}.webp").read_bytes(), "image/webp"
    else:
        from PIL import Image

        global _originals
        if _originals is None:
            _originals = {p.stem: p for p in ORIGINALS_DIR.glob("derm12345_*/*/*.jpg")}
        with Image.open(_originals[img_id]) as im:
            w, h = im.size
            scale = min(1.0, HIRES_MAX_EDGE / max(w, h), math.sqrt(HIRES_MAX_PIXELS / (w * h)))
            im = im.convert("RGB").resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=90)
        data, media_type = buf.getvalue(), "image/jpeg"
    return {"type": "base64", "media_type": media_type, "data": base64.standard_b64encode(data).decode("utf-8")}


def ask(client, model, img_id, prompt, candidates, hires=False):
    # Server-side fallback: if a safety classifier declines, the API re-runs
    # the request on Anthropic's recommended fallback model in the same call.
    fallback = (
        {"betas": ["server-side-fallback-2026-07-01"], "fallbacks": "default"} if model in FALLBACK_MODELS else {}
    )
    response = client.beta.messages.create(
        model=model,
        max_tokens=MAX_TOKENS,
        **fallback,
        output_config={
            "effort": EFFORT,
            "format": {"type": "json_schema", "schema": output_schema(candidates)},
        },
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": image_block(img_id, hires)},
                {"type": "text", "text": prompt},
            ],
        }],
    )
    if response.stop_reason == "refusal":
        category = response.stop_details.category if response.stop_details else None
        raise RuntimeError(f"refused (category: {category})")
    if response.stop_reason == "max_tokens":
        raise RuntimeError("hit max_tokens before finishing")
    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text), response.model, response.usage


def save(path, results):
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps({k: results[k] for k in sorted(results)}, indent=2) + "\n")
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--variant", choices=["with_dx", "blind"], required=True)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--ids", help="comma-separated image ids (default: all accepted images)")
    ap.add_argument("--ids-file", help="JSON list of image ids, e.g. from webapp/scripts/export_batch.mjs")
    ap.add_argument("--run-name", help="save to a separate file, e.g. r2 for an identical repeat run")
    ap.add_argument("--limit", type=int, help="stop after this many new images")
    ap.add_argument("--per-dx", type=int, help="only the first N accepted images of each diagnosis (stable order)")
    ap.add_argument("--hires", action="store_true", help="send full-resolution originals (resized to Claude's maximum)")
    ap.add_argument("--missing-only", action="store_true",
                    help="ask only about list features an image has no answer for yet, merging into its results")
    ap.add_argument("--dry-run", action="store_true", help="print the prompt for the first image and exit")
    args = ap.parse_args()

    vocab = load_vocabulary()
    metadata = json.loads(METADATA.read_text())
    annotations = json.loads(ANNOTATIONS.read_text())
    if args.ids_file:
        ids = json.loads(Path(args.ids_file).read_text())
    elif args.ids:
        ids = args.ids.split(",")
    else:
        ids = sorted(i for i, a in annotations.items() if a["status"] == "accepted")
    if args.per_dx:
        per_dx, sampled = {}, []
        for i in ids:
            dx = vocab["codeToDx"][metadata[i]["code"]]
            per_dx[dx] = per_dx.get(dx, 0) + 1
            if per_dx[dx] <= args.per_dx:
                sampled.append(i)
        ids = sampled

    OUTPUT_DIR.mkdir(exist_ok=True)
    suffix = (".hires" if args.hires else "") + (f".{args.run_name}" if args.run_name else "")
    out_path = OUTPUT_DIR / f"{args.variant}.{args.model}{suffix}.json"
    price_in, price_out = PRICES.get(args.model, PRICES[DEFAULT_MODEL])
    results = json.loads(out_path.read_text()) if out_path.exists() else {}
    def missing(img_id):
        dx = vocab["codeToDx"][metadata[img_id]["code"]]
        return [f for f in candidate_features(vocab, dx) if f not in results[img_id]["features"]]

    if args.missing_only:
        todo = [i for i in ids if i in results and missing(i)]
    else:
        todo = [i for i in ids if results.get(i, {}).get("model") != args.model]
    already = len(ids) - len(todo)
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(ids)} images selected, {already} already done with {args.model}, {len(todo)} to run.")

    def job(img_id):
        rec = metadata[img_id]
        dx = vocab["codeToDx"][rec["code"]]
        cands = missing(img_id) if args.missing_only else candidate_features(vocab, dx)
        prompt = build_prompt(vocab, cands, vocab["diagnoses"][dx]["name"], rec["diagnosis"], args.variant)
        return dx, cands, prompt

    if args.dry_run:
        _, cands, prompt = job(todo[0] if todo else ids[0])
        print(prompt)
        print(f"\n[schema: {len(cands)} required feature entries]")
        return

    import anthropic

    client = anthropic.Anthropic(max_retries=5)  # SDK retries 429 / 5xx / connection errors
    tokens_in = tokens_out = done = 0

    def run(img_id):
        dx, cands, prompt = job(img_id)
        answers, served_by, usage = ask(client, args.model, img_id, prompt, cands, args.hires)
        return img_id, dx, cands, answers, served_by, usage

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(run, i): i for i in todo}
        for fut in as_completed(futures):
            img_id = futures[fut]
            try:
                img_id, dx, cands, answers, served_by, usage = fut.result()
            except anthropic.AuthenticationError:
                pool.shutdown(cancel_futures=True)
                raise SystemExit("Authentication failed: is ANTHROPIC_API_KEY set and valid?")
            except (anthropic.APIError, RuntimeError, json.JSONDecodeError, StopIteration) as e:
                print(f"  {img_id}: error {type(e).__name__}: {e}")
                continue
            done += 1
            tokens_in += usage.input_tokens
            tokens_out += usage.output_tokens
            new_answers = {f: {"status": answers[f]["status"], "evidence": answers[f]["evidence"].strip()} for f in cands}
            if args.missing_only:
                rec = results[img_id]
                rec["features"].update(new_answers)
                rec["usage"] = {k: rec.get("usage", {}).get(k, 0) + getattr(usage, k) for k in ("input_tokens", "output_tokens")}
                rec.setdefault("added", []).append(
                    {"features": cands, "created": datetime.now(timezone.utc).isoformat(timespec="seconds")})
            else:
                results[img_id] = {
                    "model": args.model,
                    "served_by": served_by,
                    "variant": args.variant,
                    "dx": dx,
                    "image": "original, resized to Claude's maximum" if args.hires else "600-px web image",
                    "created": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                    "features": new_answers,
                    "usage": {"input_tokens": usage.input_tokens, "output_tokens": usage.output_tokens},
                }
            cost = tokens_in / 1e6 * price_in + tokens_out / 1e6 * price_out
            note = "" if served_by == args.model else f" (served by fallback {served_by})"
            print(f"[{done}/{len(todo)}] {img_id} {dx}: "
                  f"{sum(a['status'] == 'present' for a in answers.values())} present{note}   ~${cost:.2f} so far")
            if done % SAVE_EVERY == 0:
                save(out_path, results)

    save(out_path, results)
    cost = tokens_in / 1e6 * price_in + tokens_out / 1e6 * price_out
    print(f"Saved {len(results)} images to {out_path}. This run: {done} images, "
          f"{tokens_in:,} input + {tokens_out:,} output tokens, ~${cost:.2f} at list price.")


if __name__ == "__main__":
    main()
