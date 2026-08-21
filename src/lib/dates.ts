import {
  addDays,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';

/** Clé ISO d'un jour : "2025-06-09". */
export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function fromISODate(iso: string): Date {
  return parseISO(iso);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Lundi de la semaine contenant `d`. */
export function weekStart(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 });
}

export function weekEnd(d: Date): Date {
  return endOfWeek(d, { weekStartsOn: 1 });
}

/** Les 7 clés ISO (lundi→dimanche) de la semaine contenant `d`. */
export function weekDays(d: Date): string[] {
  const start = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(start, i)));
}

/** "Semaine du 9 au 15 juin 2025" (gère le changement de mois/année). */
export function weekLabel(d: Date): string {
  const start = weekStart(d);
  const end = weekEnd(d);
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `Semaine du ${format(start, 'd', { locale: fr })} au ${format(end, 'd MMMM yyyy', { locale: fr })}`;
  }
  if (sameYear) {
    return `Semaine du ${format(start, 'd MMM', { locale: fr })} au ${format(end, 'd MMM yyyy', { locale: fr })}`;
  }
  return `Semaine du ${format(start, 'd MMM yyyy', { locale: fr })} au ${format(end, 'd MMM yyyy', { locale: fr })}`;
}

/** "Lundi 9 juin". */
export function dayLongLabel(iso: string): string {
  const label = format(fromISODate(iso), 'EEEE d MMMM', { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "20 juin 2026" à partir d'une date ISO (jour ou datetime). */
export function dateLabel(iso: string): string {
  return format(parseISO(iso), 'd MMMM yyyy', { locale: fr });
}

/** "20 juin 2026, 8 h 05" à partir d'un datetime ISO (ex. horodatage de build). */
export function dateTimeLabel(iso: string): string {
  return format(parseISO(iso), "d MMMM yyyy, H 'h' mm", { locale: fr });
}

/** "lun. 9" (axes de graphes). */
export function dayShortLabel(iso: string): string {
  return format(fromISODate(iso), 'EEE d', { locale: fr });
}

/** "9 juin" (axes de graphes sur de longues périodes, où le jour de semaine est ambigu). */
export function dayMonthLabel(iso: string): string {
  return format(fromISODate(iso), 'd MMM', { locale: fr }).replace('.', '');
}

/** Abréviation du jour de semaine, ex. "lun" (agenda). */
export function weekdayShort(iso: string): string {
  return format(fromISODate(iso), 'EEE', { locale: fr }).replace('.', '');
}

/** Numéro du jour dans le mois, ex. "9". */
export function dayOfMonth(iso: string): string {
  return format(fromISODate(iso), 'd', { locale: fr });
}
