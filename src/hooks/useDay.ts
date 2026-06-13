import { useEffect, useRef, useState } from 'react';
import type { DayEntry } from '../types';
import { getDay, putDay } from '../lib/db';
import { emptyDay } from '../lib/factory';

/**
 * Charge le DayEntry d'une date et fournit un setter qui sauvegarde
 * automatiquement dans Dexie (debounce 500 ms).
 */
export function useDay(date: string) {
  const [day, setDay] = useState<DayEntry | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    setDay(null);
    getDay(date).then((d) => {
      if (alive) setDay(d ?? emptyDay(date));
    });
    return () => {
      alive = false;
    };
  }, [date]);

  function update(updater: (prev: DayEntry) => DayEntry) {
    setDay((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void putDay(next), 500);
      return next;
    });
  }

  // Flush en attente au démontage / changement de date.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [date]);

  return { day, update };
}
