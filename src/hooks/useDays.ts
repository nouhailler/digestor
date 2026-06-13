import { useLiveQuery } from 'dexie-react-hooks';
import type { DayEntry } from '../types';
import { db } from '../lib/db';
import { emptyDay } from '../lib/factory';

/**
 * Charge en live les DayEntry pour une liste de dates ISO.
 * Les dates absentes en base sont renvoyées comme jours vides,
 * dans l'ordre fourni.
 */
export function useDays(dates: string[]): DayEntry[] | undefined {
  const key = dates.join(',');
  return useLiveQuery(async () => {
    const rows = await db.days.bulkGet(dates);
    return dates.map((date, i) => rows[i] ?? emptyDay(date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
