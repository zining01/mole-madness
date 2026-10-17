// Builds src/data/quizCases.json: the accepted images from annotations.json with
// just what the quiz needs, so the app doesn't import the 7 MB metadata file.
// Runs automatically before `npm run dev` and `npm run build`; run it by hand
// (`npm run export-cases`) to pick up newly accepted images while dev is running.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const metadata = JSON.parse(fs.readFileSync(path('../src/metadata_cloud.json'), 'utf8'));
const annotations = JSON.parse(fs.readFileSync(path('../src/data/annotations.json'), 'utf8'));
const OUT = path('../src/data/quizCases.json');

const cases = Object.entries(annotations)
  .filter(([, a]) => a.status === 'accepted')
  .map(([id, a]) => {
    const m = metadata[id];
    return {
      id,
      code: a.code,
      patient: a.patient_id,
      image: m.image_url, // Cloudinary
      src: `/${m.src}`, // local fallback in dev
      label: m.diagnosis, // dataset diagnosis name
      present: a.present,
      evidence: a.evidence ?? {},
      highlights: a.highlights ?? [],
      note: a.note ?? '',
    };
  })
  .sort((x, y) => x.id.localeCompare(y.id));

fs.writeFileSync(OUT, JSON.stringify(cases) + '\n');
console.log(`Exported ${cases.length} quiz cases to ${OUT}`);
