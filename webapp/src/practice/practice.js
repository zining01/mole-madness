// The practice engine loaded with the app's cases. Components import from here;
// engine.js itself takes its cases as an argument so it can be checked from the command line.
import cases from '../data/quizCases.json';
import { SHOW_HIGHLIGHTS } from '../data/display.js';
import { createEngine } from './engine.js';

export const engine = createEngine(cases, Math.random, { useHighlights: SHOW_HIGHLIGHTS });
export { TYPES, TYPE_IDS, CURRICULUM } from './engine.js';

/** Where a "practice this" link points: #practice/<feature id>, #practice/<category> or #practice/all. */
export const practiceLink = (scope = 'all') => `#practice/${encodeURIComponent(scope)}`;
