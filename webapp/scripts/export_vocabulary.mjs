// Prints the feature vocabulary and diagnosis mapping as JSON, so the Python
// scripts in data_pipeline/ use exactly the same definitions as the app.
//   node webapp/scripts/export_vocabulary.mjs
import { features, diagnosisFeatures } from '../src/data/features.js';
import { diagnosesForMode, codeToDx } from '../src/data/taxonomy.js';

const MODE = 'advanced'; // annotation happens at the advanced level

const diagnoses = Object.fromEntries(
  Object.entries(diagnosesForMode(MODE)).map(([id, dx]) => [id, { name: dx.name, codes: dx.codes }])
);

console.log(JSON.stringify({ features, diagnosisFeatures, diagnoses, codeToDx: codeToDx(MODE) }));
