import { features } from '../data/features.js';

// One color per feature category, chosen to stand out on brown/pink skin.
// Shapes are drawn over a white underlay, so these only need to differ from each other.
const CATEGORY_COLORS = {
  Network: '#2563eb',
  Lines: '#7c3aed',
  'Dots & globules': '#db2777',
  Structureless: '#ea580c',
  Acral: '#0891b2',
  Facial: '#65a30d',
  'Hair & follicles': '#a16207',
  'Keratin & surface': '#ca8a04',
  'BCC structures': '#0d9488',
  Vessels: '#dc2626',
};

export const featureColor = (featureId) => CATEGORY_COLORS[features[featureId]?.category] ?? '#111827';
