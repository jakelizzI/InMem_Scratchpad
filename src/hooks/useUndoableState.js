import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useUndoableState(initialValue = '') {
  const [present, setPresent] = useState(initialValue);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const isTypingRef = useRef(false);
  const debounceTimerRef = useRef(null);

  // Normal live typing: updates display immediately and safely
  const handleTyping = useCallback((newText) => {
    setPresent((prevPresent) => {
      // When a typing session begins, push previous state into past history
      if (!isTypingRef.current) {
        setPast((prevPast) => {
          const updated = [...prevPast, prevPresent];
          return updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated;
        });
        setFuture([]);
        isTypingRef.current = true;
      }
      return newText;
    });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset typing session flag after pause
    debounceTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 600);
  }, []);

  // Immediate state update for discrete Actions (JSON format, Regex replacement, Clear)
  const setTextImmediate = useCallback((newText) => {
    setPresent((currentPresent) => {
      if (newText === currentPresent) return currentPresent;
      setPast((prevPast) => {
        const updated = [...prevPast, currentPresent];
        return updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated;
      });
      setFuture([]);
      isTypingRef.current = false;
      return newText;
    });
  }, []);

  // Undo (Ctrl+Z)
  const undo = useCallback(() => {
    let succeeded = false;
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setPresent((currentPresent) => {
        setFuture((prevFuture) => [currentPresent, ...prevFuture]);
        return previous;
      });

      isTypingRef.current = false;
      succeeded = true;
      return newPast;
    });
    return succeeded;
  }, []);

  // Redo (Ctrl+Y / Ctrl+Shift+Z)
  const redo = useCallback(() => {
    let succeeded = false;
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPresent((currentPresent) => {
        setPast((prevPast) => {
          const updated = [...prevPast, currentPresent];
          return updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated;
        });
        return next;
      });

      isTypingRef.current = false;
      succeeded = true;
      return newFuture;
    });
    return succeeded;
  }, []);

  return {
    text: present,
    setText: handleTyping,
    setTextImmediate,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}
