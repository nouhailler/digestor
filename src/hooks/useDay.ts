import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { DayEntry } from '../types';
import { getDay, putDay } from '../lib/db';
import { emptyDay } from '../lib/factory';

/**
 * Charge le DayEntry d'une date et fournit un setter qui sauvegarde
 * automatiquement dans Dexie (debounce 500 ms).
 *
 * La source est **réactive** (`useLiveQuery`) : si la base change pour cette date
 * en dehors de ce hook — typiquement l'import vocal qui écrit directement le jour
 * affiché — l'écran se met à jour sans avoir à changer de date. Les éditions
 * locales non encore sauvegardées ne sont jamais écrasées (drapeau `dirty`).
 */
export function useDay(date: string) {
  const [day, setDay] = useState<DayEntry | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  // Le querier ne renvoie jamais `undefined` (toujours un jour, vide au besoin) :
  // ainsi `stored === undefined` signifie sans ambiguïté « chargement en cours ».
  const stored = useLiveQuery(() => getDay(date).then((d) => d ?? emptyDay(date)), [date]);

  // Changement de date : on repart d'un état de chargement propre.
  useEffect(() => {
    dirty.current = false;
    setDay(null);
  }, [date]);

  // Adopte l'état persisté, sauf si une édition locale est en attente d'écriture.
  useEffect(() => {
    if (stored === undefined) return; // chargement en cours
    if (!dirty.current) setDay(stored);
  }, [stored]);

  function update(updater: (prev: DayEntry) => DayEntry) {
    dirty.current = true;
    setDay((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void putDay(next).then(() => {
          dirty.current = false;
        });
      }, 500);
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
