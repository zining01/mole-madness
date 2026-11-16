"""Feature hunt, step 2: screen unused images for the features that lack examples.

Each image in suggestions/hunt_batch.json (written by webapp/scripts/export_hunt.mjs)
comes with a short list of features to look for. The model is asked only about
those, which is much cheaper than the full checklist in suggest_features.py.
Its answers are leads to review on the Feature hunt page of /annotate, never
written into annotations.json.

    python screen_features.py --dry-run          # print one prompt, no API call
    python screen_features.py --limit 10         # small paid test first
    python screen_features.py                    # the whole batch
    python screen_features.py --model claude-opus-5-5

Needs ANTHROPIC_API_KEY in the environment. Results go to
data_pipeline/suggestions/hunt_results.json and are resumable: re-running asks
only the questions that have no answer yet.
"""
import argparse
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

from suggest_features import METADATA, OUTPUT_DIR, PRICES, SAVE_EVERY, WORKERS, ask, load_vocabulary, save

DEFAULT_MODEL = "claude-haiku-5-5"
BATCH = OUTPUT_DIR / "hunt_batch.json"
RESULTS = OUTPUT_DIR / "hunt_results.json"


def build_prompt(vocab, wanted, dx_name, source_label):
    lines = [
        "You are helping a dermatologist find teaching examples of specific dermoscopic features. "
        "Examine this dermoscopy image carefully.",
        f"The diagnosis is {dx_name} (dataset label: {source_label}). Use this only as context.",
        "The image was taken with polarized dermoscopy.",
        "",
        "For EACH feature listed below, decide whether this image would make a clear teaching example of it:",
        '- "present": clearly visible; a learner could be shown where it is',
        '- "uncertain": possibly present, subtle, or image quality prevents a confident call',
        '- "absent": not visible',
        "",
        "Judge only what is visible in this particular image. Many lesions show only some of the features "
        "typical for their diagnosis; do not mark a feature present just because it is typical.",
        'For "present" or "uncertain", give brief evidence: where in the image (e.g. "upper left edge") and '
        'what it looks like. For "absent", evidence can be an empty string.',
        "",
        "Features (answer under each id):",
    ]
    for f in wanted:
        d = vocab["features"][f]
        lines.append(f"- {f}: {d['name']}. {d['description']}")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--limit", type=int, help="stop after this many images")
    ap.add_argument("--dry-run", action="store_true", help="print the prompt for the first image and exit")
    args = ap.parse_args()

    if not BATCH.exists():
        raise SystemExit(f"{BATCH} not found: run `node webapp/scripts/export_hunt.mjs` first.")
    vocab = load_vocabulary()
    metadata = json.loads(METADATA.read_text())
    batch = json.loads(BATCH.read_text())
    results = json.loads(RESULTS.read_text()) if RESULTS.exists() else {}

    def unanswered(img_id):
        have = results.get(img_id, {}).get("features", {})
        return [f for f in batch[img_id] if f not in have]

    todo = [i for i in sorted(batch) if unanswered(i)]
    questions = sum(len(unanswered(i)) for i in todo)
    print(f"{len(batch)} images in the batch, {len(batch) - len(todo)} already screened, "
          f"{len(todo)} to run ({questions} feature questions) with {args.model}.")
    if args.limit:
        todo = todo[: args.limit]

    def job(img_id):
        rec = metadata[img_id]
        dx = vocab["codeToDx"][rec["code"]]
        wanted = unanswered(img_id)
        return dx, wanted, build_prompt(vocab, wanted, vocab["diagnoses"][dx]["name"], rec["diagnosis"])

    if args.dry_run:
        if not todo:
            raise SystemExit("Nothing left to screen.")
        _, wanted, prompt = job(todo[0])
        print(prompt)
        print(f"\n[schema: {len(wanted)} required feature entries]")
        return

    import anthropic

    client = anthropic.Anthropic(max_retries=5)  # SDK retries 429 / 5xx / connection errors
    price_in, price_out = PRICES.get(args.model, PRICES["claude-opus-5-5"])
    tokens_in = tokens_out = done = 0

    def run(img_id):
        dx, wanted, prompt = job(img_id)
        answers, served_by, usage = ask(client, args.model, img_id, prompt, wanted)
        return dx, wanted, answers, served_by, usage

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(run, i): i for i in todo}
        for fut in as_completed(futures):
            img_id = futures[fut]
            try:
                dx, wanted, answers, served_by, usage = fut.result()
            except anthropic.AuthenticationError:
                pool.shutdown(cancel_futures=True)
                raise SystemExit("Authentication failed: is ANTHROPIC_API_KEY set and valid?")
            except (anthropic.APIError, RuntimeError, json.JSONDecodeError, StopIteration) as e:
                print(f"  {img_id}: error {type(e).__name__}: {e}")
                continue
            done += 1
            tokens_in += usage.input_tokens
            tokens_out += usage.output_tokens
            now = datetime.now(timezone.utc).isoformat(timespec="seconds")
            rec = results.setdefault(img_id, {"dx": dx, "features": {}, "usage": {"input_tokens": 0, "output_tokens": 0}})
            for f in wanted:
                rec["features"][f] = {
                    "status": answers[f]["status"],
                    "evidence": answers[f]["evidence"].strip(),
                    "model": served_by,
                    "created": now,
                }
            rec["usage"]["input_tokens"] += usage.input_tokens
            rec["usage"]["output_tokens"] += usage.output_tokens
            cost = tokens_in / 1e6 * price_in + tokens_out / 1e6 * price_out
            found = [f for f in wanted if answers[f]["status"] == "present"]
            print(f"[{done}/{len(todo)}] {img_id} {dx}: {', '.join(found) or 'nothing clear'}   ~${cost:.2f} so far")
            if done % SAVE_EVERY == 0:
                save(RESULTS, results)

    save(RESULTS, results)
    cost = tokens_in / 1e6 * price_in + tokens_out / 1e6 * price_out
    print(f"Saved {len(results)} images to {RESULTS}. This run: {done} images, "
          f"{tokens_in:,} input + {tokens_out:,} output tokens, ~${cost:.2f} at list price.")
    print("Next: open /annotate → Feature hunt, or `node webapp/scripts/export_hunt.mjs --hits` to pre-tag the hits in full.")


if __name__ == "__main__":
    main()
