import React, { useState } from 'react';
import { QuizSetup } from './QuizSetup.jsx';
import { QuizQuestion } from './QuizQuestion.jsx';
import { QuizSummary } from './QuizSummary.jsx';
import { answerOf, answers, newSession, presets } from './quiz.js';
import styles from './Quiz.module.css';

const SETTINGS_KEY = 'quiz.settings';
const DEFAULTS = { mode: 'basic', selected: presets('basic')[0].ids, count: 20 };
const MODE_KEYS = ['basic', 'advanced'];

// Remembered per browser for convenience; falls back to defaults if storage is
// unavailable or the saved selection no longer matches the diagnoses.
const loadSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (saved && MODE_KEYS.includes(saved.mode) && Array.isArray(saved.selected)) {
      return { ...DEFAULTS, ...saved, selected: saved.selected.filter((id) => answers(saved.mode)[id]) };
    }
  } catch {
    // ignore
  }
  return DEFAULTS;
};
const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // private mode / blocked storage
  }
};

export function QuizApp() {
  const [settings, setSettings] = useState(loadSettings);
  const [session, setSession] = useState(null); // [{ case, options }]
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const updateSettings = (next) => {
    setSettings(next);
    saveSettings(next);
  };

  const start = () => {
    setSession(newSession(settings.mode, settings.selected, settings.count));
    setAnswers([]);
    setIndex(0);
    setFinished(false);
    window.scrollTo(0, 0);
  };

  const answer = (dx) => setAnswers((prev) => Object.assign([...prev], { [index]: dx }));

  const next = () => {
    if (index === session.length - 1) setFinished(true);
    else setIndex(index + 1);
    window.scrollTo(0, 0);
  };

  let content;
  if (!session) {
    content = <QuizSetup settings={settings} onChange={updateSettings} onStart={start} />;
  } else if (session.length === 0) {
    content = (
      <div className={styles.card}>
        <p>No cases are available for that selection yet.</p>
        <button type="button" className={styles.primary} onClick={() => setSession(null)}>Back</button>
      </div>
    );
  } else if (finished) {
    content = (
      <QuizSummary session={session} answers={answers} mode={settings.mode} onAgain={start} onNewQuiz={() => setSession(null)} />
    );
  } else {
    content = (
      <QuizQuestion
        key={index}
        item={session[index]}
        mode={settings.mode}
        number={index + 1}
        total={session.length}
        score={answers.filter((a, i) => a != null && a === answerOf(session[i].case, settings.mode)).length}
        chosen={answers[index] ?? null}
        onAnswer={answer}
        onNext={next}
      />
    );
  }

  return <div className={styles.page}>{content}</div>;
}
