# Mole Madness (web app)

A dermoscopy trainer built around features: what each one looks like, how to tell it
from its look-alikes, and practice until it sticks. React + Vite, no backend needed for
learners.

## Pages

| Address | What it is |
|---|---|
| `#learn` | Feature map: every feature with a diagram |
| `#learn/<feature id>` | One feature: diagram, definition, look-alikes, examples, practice |
| `#practice` | Feature practice: two kinds of question |
| `#practice/<feature id, category, dx:<diagnosis id> or all>` | Starts a practice session on that scope |
| `#quiz` | The diagnosis quiz |
| `#review` | The fixed review set, for invited reviewers (see `../supabase/README.md`) |

In development, `/annotate` opens the annotation tool.

## Where things live

- `src/data/features.js`: the feature vocabulary and each diagnosis' feature lists
- `src/data/lookalikes.js`: pairs of features that get confused, with one sentence on telling them apart
- `src/data/annotations.json`: your reviewed annotations. `npm run export-cases` turns the accepted ones into `quizCases.json`
- `src/learn/`: feature map and feature pages. `Schematic.jsx` holds the diagrams, one entry per feature
- `src/practice/engine.js`: builds the practice questions and chooses what a session covers
- `src/data/display.js`: `SHOW_HIGHLIGHTS`, whether learners see the marks drawn on images (off until every image has them)
- `src/quiz/`: the diagnosis quiz
- `src/review/`: the reviewer set. `src/data/reviewSet.json` is frozen while reviews are being collected

## Commands

```
npm run dev             # start the app at http://localhost:5173
npm run build           # production build
npm run lint
npm run check-practice  # builds every possible practice question and checks it against the annotations
```

## Adding content

Everything in practice comes from accepted annotations, so the way to add questions is to
accept more images in `/annotate`:

- tagging a feature as present gives "name it" and "pick the lesion" questions
- highlights drawn on an image are kept but hidden from learners while `SHOW_HIGHLIGHTS` in `src/data/display.js` is off
- features with no accepted example show "No examples yet" on the feature map

`npm run check-practice` lists the features with few or no examples.

### Finding examples for thin features

The even, per-diagnosis sample leaves some features with few or no examples. The feature hunt
looks for those specifically (run from the repository root):

```
node webapp/scripts/export_hunt.mjs            # 1. pick unused images to screen → suggestions/hunt_batch.json
cd data_pipeline
python screen_features.py --dry-run            # 2. see one prompt, no API call
python screen_features.py --limit 10           #    small paid test
python screen_features.py                      #    the whole batch → suggestions/hunt_results.json
```

Then open `/annotate` → **Feature hunt**: each feature short of examples is listed with the
unreviewed images the model thinks show it. Click a lead to step through them with the keyboard:
→ / ← next and previous, A accept the feature, Z undo, X not an example, Enter open the editor.

Accepting with A saves a partial record: the image counts as an example of that feature, and
because the rest of its checklist wasn't assessed, the app never uses it as a lesion *without*
some other feature. Opening it in the editor and accepting there makes it a full record.

Optionally, pre-tag the hits in full first, so the editor opens with the whole checklist filled in:

```
node webapp/scripts/export_hunt.mjs --hits     # → suggestions/hunt_hits.json
cd data_pipeline
python suggest_features.py --variant with_dx --ids-file suggestions/hunt_hits.json
python suggest_features.py --variant with_dx --ids-file suggestions/hunt_hits.json --run-name r2
```

The hunt never offers images from the reviewer set, and takes one image per patient within a diagnosis.
