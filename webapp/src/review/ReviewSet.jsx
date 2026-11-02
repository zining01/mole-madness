import React, { useState } from 'react';
import { useAccount } from '../auth/account.js';
import { features } from '../data/features.js';
import { CaseImage } from '../quiz/CaseImage.jsx';
import { checklistFor, dxName, inVocabularyOrder, orderFor, otherGroupsFor, reviewCases } from './reviewSet.js';
import { useReviews } from './useReviews.js';
import quiz from '../quiz/Quiz.module.css';
import styles from './ReviewSet.module.css';

// The review set (#review, #review/<case id>): the same fixed images for every
// reviewer, in their own order. For each image they're told the diagnosis, as
// Claude was, and record which checklist features are present, absent (unticked)
// or can't be assessed, plus any other features and a comment. Claude's raw
// calls stay hidden until they save, unless they choose to fill in from them.
export default function ReviewSet({ caseId }) {
  const account = useAccount();
  let body;
  if (!account.enabled) body = <p>Reviewer sign-in isn't set up for this site.</p>;
  else if (account.loading) body = <p className={quiz.hint}>Loading…</p>;
  else if (account.role !== 'reviewer') {
    body = (
      <>
        <h2 className={quiz.cardTitle}>Review set</h2>
        <p>The review set is for invited reviewers.</p>
        <button type="button" className={quiz.preset} onClick={account.signIn}>Sign in</button>
      </>
    );
  } else if (account.approved === false) {
    body = (
      <p className={quiz.reviewNotice}>
        You're signed in as {account.email}, which isn't on the reviewer list. Ask the person who shared this link to
        add it, then <button type="button" className={quiz.linkButton} onClick={account.recheck}>check again</button>.
      </p>
    );
  } else if (account.approved === null) body = <p className={quiz.hint}>Loading…</p>;
  else return <Reviewing caseId={caseId} />;

  return <div className={styles.page}><div className={quiz.card}>{body}</div></div>;
}

function Reviewing({ caseId }) {
  const account = useAccount();
  const { reviews, loadError, save } = useReviews();
  const [order] = useState(() => orderFor(account.email));

  let body;
  if (loadError) body = <p className={quiz.reportError}>{loadError}</p>;
  else if (!reviews) body = <p className={quiz.hint}>Loading your reviews…</p>;
  else if (caseId && reviewCases[caseId]) {
    const nextId = [...order.slice(order.indexOf(caseId) + 1), ...order].find((id) => id !== caseId && !reviews[id]);
    body = (
      <ReviewCase key={caseId} c={reviewCases[caseId]} number={order.indexOf(caseId) + 1} total={order.length}
        saved={reviews[caseId]} save={save} nextId={nextId} />
    );
  } else body = <Overview order={order} reviews={reviews} />;

  return <div className={styles.page}><div className={quiz.card}>{body}</div></div>;
}

function Overview({ order, reviews }) {
  const done = order.filter((id) => reviews[id]).length;
  const next = order.find((id) => !reviews[id]);
  return (
    <>
      <h2 className={quiz.cardTitle}>Review set</h2>
      <p>
        {order.length} images, the same for every reviewer. For each, you're told the diagnosis and tick the features
        you see. Mark a feature "can't assess" when the image doesn't let you tell (focus, cropping, glare).
      </p>
      <p className={quiz.hint}>
        Claude's calls stay hidden until you save, so your first answers are your own. They're kept even if you change
        them later. About a minute per image.
      </p>
      <div className={styles.progress}><span style={{ width: `${(100 * done) / order.length}%` }} /></div>
      <p className={quiz.hint}>{done} of {order.length} reviewed</p>
      {next ? (
        <a className={styles.primaryLink} href={`#review/${next}`}>{done ? 'Continue' : 'Start'} →</a>
      ) : (
        <p className={styles.done}>All done. Thank you!</p>
      )}
      <div className={styles.grid}>
        {order.map((id, i) => (
          <a key={id} href={`#review/${id}`} className={styles.tile} aria-label={`Image ${i + 1}${reviews[id] ? ', reviewed' : ''}`}>
            <img src={reviewCases[id].image || reviewCases[id].src} alt="" loading="lazy" />
            {reviews[id] && <span className={styles.tick}>✓</span>}
          </a>
        ))}
      </div>
    </>
  );
}

const CALL_LABEL = { present: 'present', absent: 'absent', uncertain: 'unsure' };

function ReviewCase({ c, number, total, saved, save, nextId }) {
  const checklist = checklistFor(c);
  const otherGroups = otherGroupsFor(c);
  const claudePresent = checklist.filter((f) => c.claude[f]?.status === 'present');
  const claudeUncertain = checklist.filter((f) => c.claude[f]?.status === 'uncertain');

  const [present, setPresent] = useState(() => new Set(saved?.present ?? []));
  const [unassessable, setUnassessable] = useState(() => new Set(saved?.unassessable ?? []));
  const [comment, setComment] = useState(saved?.comment ?? '');
  const [filledIn, setFilledIn] = useState(false);
  const [claudeShown, setClaudeShown] = useState(false);
  const [status, setStatus] = useState(saved ? 'saved' : 'new'); // new | changed | saving | saved
  const [error, setError] = useState(null);

  const changed = () => {
    setStatus('changed');
    setError(null);
  };
  const toggle = (set, setter, f) => {
    const next = new Set(set);
    if (next.has(f)) next.delete(f);
    else next.add(f);
    setter(next);
  };
  const togglePresent = (f) => {
    toggle(present, setPresent, f);
    changed();
  };
  const toggleUnassessable = (f) => {
    toggle(unassessable, setUnassessable, f);
    if (present.has(f)) toggle(present, setPresent, f);
    changed();
  };
  const fillIn = () => {
    setPresent(new Set([...present, ...claudePresent]));
    setUnassessable(new Set([...unassessable].filter((f) => !claudePresent.includes(f))));
    setFilledIn(true);
    changed();
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    const err = await save({
      case_id: c.id,
      code: c.code,
      dx: c.dx,
      diagnosis: c.diagnosis,
      present: inVocabularyOrder(present),
      unassessable: inVocabularyOrder(unassessable),
      offered: checklist,
      claude_present: claudePresent,
      claude_uncertain: claudeUncertain,
      blind: !filledIn && !claudeShown,
      comment: comment.trim() || null,
    });
    setError(err);
    setStatus(err ? 'changed' : 'saved');
  };

  // Agreement on the checklist, leaving out features either side couldn't call.
  const comparable = checklist.filter((f) => !unassessable.has(f) && c.claude[f] && c.claude[f].status !== 'uncertain');
  const agreed = comparable.filter((f) => present.has(f) === (c.claude[f].status === 'present')).length;
  const otherTicked = otherGroups.flatMap((g) => g.ids).filter((f) => present.has(f)).length;

  return (
    <form onSubmit={submit}>
      <div className={styles.caseHeader}>
        <a href="#review">← Review set</a>
        <span className={quiz.hint}>Image {number} of {total}</span>
      </div>
      <CaseImage c={c} />
      <p className={styles.diagnosis}>
        Diagnosis: <strong>{c.diagnosis}</strong>
        {c.diagnosis !== dxName(c) && <span className={quiz.hint}> ({dxName(c)})</span>}
      </p>

      <h3 className={styles.sectionTitle}>Checklist for {dxName(c)}</h3>
      <p className={quiz.hint}>Tick what you see. Leave a box empty if the feature is absent; use "can't assess" if you can't tell.</p>
      <ul className={styles.checklist}>
        {checklist.map((f) => {
          const call = c.claude[f];
          const mine = unassessable.has(f) ? null : present.has(f);
          const agrees = call && call.status !== 'uncertain' && mine !== null && mine === (call.status === 'present');
          return (
            <li key={f}>
              <div className={styles.row}>
                <label title={features[f].description} className={unassessable.has(f) ? styles.muted : undefined}>
                  <input type="checkbox" checked={present.has(f)} disabled={unassessable.has(f)} onChange={() => togglePresent(f)} />
                  <span>{features[f].name}</span>
                </label>
                <button type="button" className={styles.cantAssess} aria-pressed={unassessable.has(f)}
                  onClick={() => toggleUnassessable(f)}>Can't assess</button>
              </div>
              {claudeShown && call && (
                <p className={styles.claudeCall}>
                  <span className={`${styles.callBadge} ${styles[`call_${call.status}`]}`}>Claude: {CALL_LABEL[call.status]}</span>
                  {agrees && <span className={styles.agree}> · matches you</span>}
                  {call.evidence && <span className={styles.evidence}> {call.evidence}</span>}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <details className={quiz.moreFeatures}>
        <summary>Other features you see{otherTicked > 0 && ` (${otherTicked} ticked)`}</summary>
        {otherGroups.map(({ category, ids }) => (
          <fieldset key={category} className={quiz.dxGroup}>
            <legend>{category}</legend>
            {ids.map((f) => (
              <label key={f} className={quiz.dxOption} title={features[f].description}>
                <input type="checkbox" checked={present.has(f)} onChange={() => togglePresent(f)} />
                <span>{features[f].name}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </details>

      <label className={quiz.commentLabel} htmlFor={`comment-${c.id}`}>Comments (optional)</label>
      <textarea id={`comment-${c.id}`} className={styles.comment} rows={3} maxLength={2000} value={comment}
        placeholder="Anything about the diagnosis, the features or the image"
        onChange={(e) => { setComment(e.target.value); changed(); }} />

      {claudeShown && comparable.length > 0 && (
        <p className={quiz.reviewNotice}>
          You and Claude agree on {agreed} of {comparable.length} checklist features that you both called. Experts often
          disagree on these calls too; measuring that is part of the point.
        </p>
      )}

      <div className={styles.actions}>
        {status === 'saved' && nextId ? (
          <a className={styles.primaryLink} href={`#review/${nextId}`}>Next image →</a>
        ) : status === 'saved' ? (
          <a className={styles.primaryLink} href="#review">Back to the review set</a>
        ) : (
          <button type="submit" className={styles.primaryButton} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : saved ? 'Save changes' : 'Save review'}
          </button>
        )}
        {status === 'saved' && <span className={styles.savedNote}>Saved ✓</span>}
        {!claudeShown && !filledIn && status !== 'saved' && (
          <button type="button" className={quiz.linkButton} onClick={fillIn}>Fill in from Claude's calls</button>
        )}
        {!claudeShown && status === 'saved' && (
          <button type="button" className={quiz.linkButton} onClick={() => setClaudeShown(true)}>Show Claude's calls</button>
        )}
      </div>
      {filledIn && !claudeShown && (
        <p className={quiz.hint}>Ticked what Claude called present. Change anything you disagree with; this review is recorded as assisted.</p>
      )}
      {error && <p className={quiz.reportError}>{error}</p>}
    </form>
  );
}
