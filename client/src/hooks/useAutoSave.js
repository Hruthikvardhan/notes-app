import { useEffect, useRef, useState } from 'react';
import { AUTOSAVE_INTERVAL_MS } from '../utils/constants';

// Calls `onSave(data)` every AUTOSAVE_INTERVAL_MS while `data` keeps changing,
// and skips saving if nothing changed since the last save.
export const useAutoSave = (data, onSave, enabled = true) => {
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const lastSavedRef = useRef(JSON.stringify(data));
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(async () => {
      const current = JSON.stringify(dataRef.current);
      if (current === lastSavedRef.current) return;

      setStatus('saving');
      try {
        await onSave(dataRef.current);
        lastSavedRef.current = current;
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [onSave, enabled]);

  return status;
};
