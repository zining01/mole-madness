import React, { useState } from 'react';
import { features } from '../data/features.js';
import { featureColor } from '../utils/featureColors.js';
import { answerKeyFeatures, answerOf, answers, featureBreakdown, pearlFor, subtypeLabel } from './quiz.js';
import { ReportProblem } from './ReportProblem.jsx';
import styles from './Quiz.module.css';

// What the learner sees after answering: the diagnosis, the features in this
// image with notes on what to look for, the key features that aren't here, the
// annotator's teaching note and the clinical pearl. `onFocus` names the feature
// under the pointer so the image can emphasise its highlight.
export function AnswerReveal({ c, mode, chosen, onFocus }) {
  const [showPearl, setShowPearl] = useState(false);
  const answer = answerOf(c, mode);
  const dxInfo = answers(mode)[answer];
  const correct = chosen === answer;
  const subtype = subtypeLabel(c, mode);
  const { dxName, seen, missingKey } = featureBreakdown(c, mode);
  const highlighted = new Set(c.highlights.map((h) => h.feature));
  const pearl = pearlFor(c);
  const chosenKey = chosen && !correct ? answerKeyFeatures(chosen, mode) : [];

  return (
    <div className={styles.reveal}>
      <p className={correct ? styles.resultRight : styles.resultWrong}>
        {correct ? 'Correct' : chosen ? `Not quite — you chose ${answers(mode)[chosen].name}` : 'Answer'}
      </p>
      <h2 className={styles.dxName}>{dxInfo.name}</h2>
      {subtype && <p className={styles.subtype}>{subtype}</p>}
      <p className={styles.malignancy}>
        {dxInfo.superclass === 'Melanocytic' ? 'Melanocytic' : 'Non-melanocytic'} · {dxInfo.malignancy}
      </p>

      {seen.length > 0 && (
        <section>
          <h3>What to look for in this image</h3>
          <ul className={styles.featureList}>
            {seen.map(({ id, role, note }) => (
              <li key={id} onMouseEnter={() => onFocus?.(id)} onMouseLeave={() => onFocus?.(null)}>
                <span className={styles.swatch} style={{ background: featureColor(id) }} />
                <div>
                  <strong>{features[id].name}</strong>
                  {role && <span className={styles[`role_${role}`]}>{role}</span>}
                  {highlighted.has(id) && <span className={styles.marked}>marked on image</span>}
                  <p>{note ?? features[id].description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {missingKey.length > 0 && (
        <section>
          <h3>Also typical of {dxName.toLowerCase()}, not seen here</h3>
          <p className={styles.chips}>
            {missingKey.map((f) => (
              <span key={f} className={styles.chip} title={features[f].description}>{features[f].name}</span>
            ))}
          </p>
        </section>
      )}

      {chosenKey.length > 0 && (
        <section>
          <h3>{answers(mode)[chosen].name} would usually show</h3>
          <p className={styles.chips}>
            {chosenKey.map((f) => (
              <span key={f} className={`${styles.chip} ${c.present.includes(f) ? styles.chipShared : ''}`}
                title={features[f].description}>
                {features[f].name}{c.present.includes(f) && ' ✓'}
              </span>
            ))}
          </p>
          {chosenKey.some((f) => c.present.includes(f)) && (
            <p className={styles.hint}>✓ = also present in this lesion, which is what makes these two easy to confuse.</p>
          )}
        </section>
      )}

      {c.note && (
        <section>
          <h3>Teaching note</h3>
          <p>{c.note}</p>
        </section>
      )}

      {pearl && (
        <section>
          <button type="button" className={styles.linkButton} onClick={() => setShowPearl(!showPearl)}>
            {showPearl ? 'Hide clinical pearl ▲' : 'Clinical pearl ▼'}
          </button>
          {showPearl && (
            <div className={styles.pearl}>
              <p>{pearl.teachingTip}</p>
              <img src={pearl.cartoon} alt="Schematic of the dermoscopic pattern" onError={(e) => (e.currentTarget.hidden = true)} />
            </div>
          )}
        </section>
      )}

      <section>
        <ReportProblem key={c.id} c={c} mode={mode} />
      </section>
    </div>
  );
}
