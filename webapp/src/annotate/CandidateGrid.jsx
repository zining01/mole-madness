import React, { useState } from 'react';
import { features } from '../data/features.js';
import { revealLabel } from '../data/taxonomy.js';
import { dxById, quotas, acceptedByCode, recordsFor, candidates, keyFeatureCoverage, plural } from './queue.js';
import { toReviewCount, twoRunPrefill } from './suggestions.js';
import styles from './Annotate.module.css';

const PAGE = 12;

// codeNames: source code → dataset diagnosis name, used to tell subtypes apart
// when the quiz group has no subtype labels of its own (e.g. junctional vs compound).
export function CandidateGrid({ dxId, index, annotations, target, codeNames, suggestions, second, onOpen }) {
  const [limit, setLimit] = useState(PAGE);
  const dx = dxById[dxId];
  const q = quotas(dxId, index, target);
  const done = acceptedByCode(dxId, annotations);
  const records = recordsFor(dxId, annotations);
  const next = candidates(dxId, index, annotations, target, limit);
  const coverage = keyFeatureCoverage(dxId, annotations);
  const toReview = records.accepted
    .map((id) => [id, toReviewCount(suggestions[id], annotations[id])])
    .filter(([, n]) => n > 0);
  const multiCode = dx.codes.length > 1;

  const codeLabel = (code) => dx.subtypes?.[code] ?? codeNames[code] ?? revealLabel(dxId, code);

  const thumb = (id, code, extra) => (
    <button key={id} type="button" className={styles.thumb} onClick={() => onOpen(id)}>
      <img src={`/images/${id}.webp`} alt={id} loading="lazy" />
      <span>{multiCode ? codeLabel(code) : id}</span>
      {extra && <span className={styles.meta}>{extra}</span>}
    </button>
  );

  return (
    <div>
      <h2>{dx.name}</h2>

      <div className={styles.chips}>
        {dx.codes.map((code) => (
          <span key={code} className={`${styles.chip} ${done[code] >= q[code] ? styles.chipDone : ''}`}>
            {multiCode ? codeLabel(code) : code}: {done[code]} / {q[code]}
          </span>
        ))}
      </div>

      <h3>Key features covered</h3>
      <div className={styles.chips}>
        {coverage.map(({ feature, count }) => (
          <span key={feature} className={`${styles.chip} ${count === 0 ? styles.chipMissing : ''}`}
            title={features[feature].description}>
            {features[feature].name}: {count}
          </span>
        ))}
      </div>

      {toReview.length > 0 && (
        <>
          <h3>Model suggestions to review ({toReview.length})</h3>
          <p className={styles.meta}>
            Accepted images where the model's second opinion differs from your tags.
          </p>
          <div className={styles.grid}>
            {toReview.map(([id, n]) => thumb(id, annotations[id].code, `${plural(n, 'suggestion')} to review`))}
          </div>
        </>
      )}

      <h3>Candidates</h3>
      <p className={styles.meta}>
        One image per patient not yet used for this diagnosis; subtypes still under quota come first.
      </p>
      {next.length === 0 ? (
        <p>No unreviewed patients left.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {next.map(({ id, code }) => {
              const prefill = twoRunPrefill(suggestions[id], second[id]);
              return thumb(id, code, prefill && `pre-tagged · ${prefill.present.length} features`);
            })}
          </div>
          {next.length === limit && (
            <button type="button" className={styles.btn} onClick={() => setLimit(limit + PAGE)}>Show more</button>
          )}
        </>
      )}

      {records.accepted.length > 0 && (
        <>
          <h3>Accepted ({records.accepted.length})</h3>
          <div className={styles.grid}>
            {records.accepted.map((id) =>
              thumb(id, annotations[id].code, annotations[id].partial
                ? `quick accept · ${plural(annotations[id].present.length, 'feature')} only`
                : `${annotations[id].present.length} features · ${annotations[id].highlights.length} highlights`)
            )}
          </div>
        </>
      )}

      {records.flagged.length > 0 && (
        <>
          <h3>Flagged ({records.flagged.length})</h3>
          <div className={styles.grid}>
            {records.flagged.map((id) => thumb(id, annotations[id].code, annotations[id].note || 'no note'))}
          </div>
        </>
      )}

      {records.skipped.length > 0 && (
        <details>
          <summary>Skipped ({records.skipped.length})</summary>
          <div className={styles.grid}>
            {records.skipped.map((id) => thumb(id, annotations[id].code, annotations[id].note))}
          </div>
        </details>
      )}
    </div>
  );
}
