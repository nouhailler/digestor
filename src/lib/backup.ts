import { exportAll, setLastExportAt } from './db';
import { toISODate } from './dates';

/**
 * Génère le fichier JSON de sauvegarde, déclenche le téléchargement et
 * enregistre la date du dernier export (pour le rappel périodique).
 */
export async function downloadBackup(): Promise<void> {
  const payload = await exportAll();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `digestor-${toISODate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  await setLastExportAt(new Date().toISOString());
}

/** Nombre de jours écoulés depuis un ISO, ou null. */
export function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

/** Seuil (jours) au-delà duquel on suggère une nouvelle sauvegarde. */
export const BACKUP_REMINDER_DAYS = 7;
