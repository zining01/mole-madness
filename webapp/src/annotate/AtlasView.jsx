import React from 'react';
import { features } from '../data/features.js';
import { plural } from './queue.js';
import styles from './Annotate.module.css';

const BY_CATEGORY = Object.entries(features).reduce((acc, [id, f]) => {
  (acc[f.category] ??= []).push(id);
  return acc;
}, {});
const ALL = Object.keys(features);
const CANDIDATE_LIMIT = 6;

// One reference example per feature (or a few) for teaching what it looks like.
// Atlas examples are accepted images marked ★ for that feature in the editor;
// features without one yet show images already tagged with them as candidates.
export function AtlasView({ annotations, onOpen }) {
  const accepted = Object.entries(annotations).filter(([, a]) => a.status === 'accepted');
  const examplesOf = (f) => accepted.filter(([, a]) => a.atlas.includes(f)).map(([id]) => id);
  const candidatesOf = (f) => accepted.filter(([, a]) => a.present.includes(f) && !a.atlas.includes(f)).map(([id]) => id);
  const covered = ALL.filter((f) => examplesOf(f).length > 0).length;

  const mini = (id, caption) => (
    <button key={id} type="button" className={styles.miniThumb} onClick={() => onOpen(id)} title={id}>
      <img src={`/images/${id}.webp`} alt={id} loading="lazy" />
      <span>{caption}</span>
    </button>
  );

  return (
    <div>
      <h2>Feature atlas</h2>
      <p className={styles.meta}>
        {covered} / {ALL.length} features have a reference example. In the editor, press ☆ next to a
        ticked feature to make that image its example. For drawable features, add a highlight too.
      </p>

      {Object.entries(BY_CATEGORY).map(([category, ids]) => (
        <section key={category}>
          <h3>{category}</h3>
          {ids.map((f) => {
            const examples = examplesOf(f);
            const candidates = candidatesOf(f);
            const needsHighlight = (id) =>
              features[f].annotate === 'region' && !annotations[id].highlights.some((h) => h.feature === f);
            return (
              <div key={f} className={styles.atlasRow}>
                <div>
                  <strong>{features[f].name}</strong>
                  {features[f].polarizedOnly && <span className={styles.tag}>polarized</span>}
                  <p className={styles.meta}>{features[f].description}</p>
                  <p className={`${styles.meta} ${examples.length === 0 ? styles.missing : ''}`}>
                    {plural(examples.length, 'example')} · tagged in {plural(examples.length + candidates.length, 'image')}
                  </p>
                </div>
                <div className={styles.atlasThumbs}>
                  {examples.map((id) => mini(id, needsHighlight(id) ? '★ no highlight' : '★'))}
                  {examples.length === 0 && candidates.slice(0, CANDIDATE_LIMIT).map((id) => mini(id, 'candidate'))}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
