// Whether the quiz is the page on screen. The quiz stays mounted (keeping your
// place) while the glossary is open, so its keyboard shortcuts check this first.
import { createContext, useContext } from 'react';

export const QuizVisibleContext = createContext(true);
export const useQuizVisible = () => useContext(QuizVisibleContext);
