import { useEffect } from 'react';

// Custom hook to handle keyboard controls(left, right, and space) for the app
export function useKeyboardControls(onLeft, onRight, onSpace, isDisabled) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isDisabled) return;
      if (e.key === 'ArrowLeft') onLeft();
      if (e.key === 'ArrowRight') onRight();
      if (e.key === ' ' || e.key === 'Enter') onSpace();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLeft, onRight, onSpace, isDisabled]);
}