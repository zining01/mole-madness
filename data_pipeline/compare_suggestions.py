"""Compare the model's feature calls with your tags in annotations.json.

    python compare_suggestions.py                                  # every file in suggestions/
    python compare_suggestions.py with_dx.claude-haiku-5-5 with_dx.claude-opus-5-5
    python compare_suggestions.py --brief                          # summary table only

For each variant: overall agreement (and Cohen's kappa) over every image x feature
pair the model was asked about, a per-feature table, and how often the model calls
a diagnosis' key features present compared with you (the "textbook bias" check).
Also writes suggestions/disagreements_<variant>.csv to review case by case.

"uncertain" answers count as not-present for the agreement numbers and are
reported separately. Features you tagged but the model wasn't asked about (ones
outside the diagnosis' lists) are left out of the comparison.
"""
import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ANNOTATIONS = ROOT / "webapp/src/data/annotations.json"
SUGGESTIONS = ROOT / "data_pipeline/suggestions"
sys.path.insert(0, str(Path(__file__).resolve().parent))
from suggest_features import PRICES, load_vocabulary  # noqa: E402


def kappa(both, user_only, model_only, neither):
    n = both + user_only + model_only + neither
    if n == 0:
        return float("nan")
    po = (both + neither) / n
    pu, pm = (both + user_only) / n, (both + model_only) / n
    pe = pu * pm + (1 - pu) * (1 - pm)
    return (po - pe) / (1 - pe) if pe < 1 else float("nan")


def compare(variant, vocab, annotations, brief=False):
    suggestions = json.loads((SUGGESTIONS / f"{variant}.json").read_text())
    feats = vocab["features"]
    per_feature = defaultdict(lambda: {"both": 0, "user_only": 0, "model_only": 0, "neither": 0, "uncertain": 0})
    key_rates = {"user": 0, "model": 0, "n": 0}
    rows = []

    for img_id, s in suggestions.items():
        a = annotations.get(img_id)
        if not a or a["status"] != "accepted":
            continue
        user = set(a["present"])
        key = set(vocab["diagnosisFeatures"][s["dx"]]["key"])
        for f, ans in s["features"].items():
            u, m = f in user, ans["status"] == "present"
            c = per_feature[f]
            if ans["status"] == "uncertain":
                c["uncertain"] += 1
            c["both" if u and m else "user_only" if u else "model_only" if m else "neither"] += 1
            if f in key:
                key_rates["n"] += 1
                key_rates["user"] += u
                key_rates["model"] += m
            if u != m or ans["status"] == "uncertain":
                rows.append({
                    "image": img_id, "dx": s["dx"], "feature": f, "feature_name": feats[f]["name"],
                    "you": "present" if u else "not ticked", "model": ans["status"], "evidence": ans["evidence"],
                })

    tot = {k: sum(c[k] for c in per_feature.values()) for k in ("both", "user_only", "model_only", "neither", "uncertain")}
    pairs = tot["both"] + tot["user_only"] + tot["model_only"] + tot["neither"]
    images = sum(1 for i in suggestions if annotations.get(i, {}).get("status") == "accepted")
    costs = [
        s["usage"]["input_tokens"] / 1e6 * PRICES[s["model"]][0] + s["usage"]["output_tokens"] / 1e6 * PRICES[s["model"]][1]
        for s in suggestions.values() if "usage" in s and s["model"] in PRICES
    ]
    summary = {
        "name": variant, "images": images,
        "agree": (tot["both"] + tot["neither"]) / pairs if pairs else float("nan"),
        "kappa": kappa(tot["both"], tot["user_only"], tot["model_only"], tot["neither"]),
        "user_only": tot["user_only"], "model_only": tot["model_only"], "uncertain": tot["uncertain"],
        "key_user": key_rates["user"] / key_rates["n"] if key_rates["n"] else float("nan"),
        "key_model": key_rates["model"] / key_rates["n"] if key_rates["n"] else float("nan"),
        "cost": sum(costs) / len(costs) if costs else float("nan"),
    }
    if brief:
        return summary

    print(f"\n=== {variant}  ({images} images, {pairs} image x feature calls, model: "
          f"{next(iter(suggestions.values()))['model'] if suggestions else '-'}) ===")
    print(f"agreement {(tot['both'] + tot['neither']) / pairs:.0%}   kappa {kappa(tot['both'], tot['user_only'], tot['model_only'], tot['neither']):.2f}   "
          f"uncertain {tot['uncertain']}")
    print(f"you ticked, model agreed: {tot['both']}   you ticked, model didn't: {tot['user_only']}   "
          f"model says present, you didn't tick: {tot['model_only']}")
    if key_rates["n"]:
        print(f"key features called present: you {key_rates['user'] / key_rates['n']:.0%}, "
              f"model {key_rates['model'] / key_rates['n']:.0%}  (over {key_rates['n']} image x key-feature pairs)")

    print(f"\n{'feature':38} {'asked':>5} {'you+':>5} {'mdl+':>5} {'both':>5} {'agree':>6} {'kappa':>6}")
    for f, c in sorted(per_feature.items(), key=lambda kv: -(kv[1]["both"] + kv[1]["user_only"] + kv[1]["model_only"])):
        n = c["both"] + c["user_only"] + c["model_only"] + c["neither"]
        k = kappa(c["both"], c["user_only"], c["model_only"], c["neither"])
        print(f"{feats[f]['name'][:38]:38} {n:5} {c['both'] + c['user_only']:5} {c['both'] + c['model_only']:5} "
              f"{c['both']:5} {(c['both'] + c['neither']) / n:6.0%} {k:6.2f}")

    out = SUGGESTIONS / f"disagreements_{variant}.csv"
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["image", "dx", "feature", "feature_name", "you", "model", "evidence"])
        w.writeheader()
        w.writerows(sorted(rows, key=lambda r: (r["dx"], r["image"], r["feature"])))
    print(f"\n{len(rows)} disagreements / uncertain calls written to {out}")
    return summary


def cross_check(names, annotations):
    """Your tags aren't ground truth, so for each run's disagreements with you, ask
    whether the other runs side with it. An "extra" call that other models also make
    is more likely a feature you missed; one no other model makes is more likely wrong."""
    runs = {n: json.loads((SUGGESTIONS / f"{n}.json").read_text()) for n in names}
    common = set.intersection(*(set(r) for r in runs.values()))
    common = {i for i in common if annotations.get(i, {}).get("status") == "accepted"}
    if len(runs) < 2 or not common:
        return
    print(f"\nCross-check on the {len(common)} images every run covers:")
    print(f"{'run':38} {'extra':>6} {'backed':>7} {'missed':>7} {'others agree w/ you':>20}")
    for n, run in runs.items():
        others = [r for m, r in runs.items() if m != n]
        extra = backed = missed = with_you = 0
        for i in common:
            user = set(annotations[i]["present"])
            for f, ans in run[i]["features"].items():
                mine = ans["status"] == "present"
                if mine == (f in user):
                    continue
                other_present = sum(o[i]["features"].get(f, {}).get("status") == "present" for o in others)
                if mine:
                    extra += 1
                    backed += other_present > 0
                else:
                    missed += 1
                    with_you += other_present > 0
        print(f"{n[:38]:38} {extra:6} {backed:7} {missed:7} {with_you:20}")
    print("backed = another model also says present · others agree w/ you = another model found what this one missed")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    brief = "--brief" in sys.argv
    names = args or sorted(p.stem for p in SUGGESTIONS.glob("*.json"))
    vocab = load_vocabulary()
    annotations = json.loads(ANNOTATIONS.read_text())
    summaries = []
    for name in names:
        if (SUGGESTIONS / f"{name}.json").exists():
            summaries.append(compare(name, vocab, annotations, brief))
        else:
            print(f"(no suggestions/{name}.json)")

    print(f"\n{'run':38} {'imgs':>4} {'agree':>6} {'kappa':>6} {'missed':>7} {'extra':>6} {'unsure':>6} "
          f"{'key you/model':>14} {'$/img':>7}")
    for s in summaries:
        print(f"{s['name'][:38]:38} {s['images']:4} {s['agree']:6.0%} {s['kappa']:6.2f} {s['user_only']:7} "
              f"{s['model_only']:6} {s['uncertain']:6} {s['key_user']:6.0%} /{s['key_model']:5.0%} {s['cost']:7.4f}")
    print("missed = you ticked, model didn't · extra = model says present, you didn't tick")
    cross_check([s["name"] for s in summaries], annotations)


if __name__ == "__main__":
    main()
