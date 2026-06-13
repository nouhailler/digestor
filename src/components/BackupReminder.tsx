import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Loader2, Save, X } from 'lucide-react';
import { db, getLastExportAt } from '../lib/db';
import { BACKUP_REMINDER_DAYS, daysSince, downloadBackup } from '../lib/backup';

const DISMISS_KEY = 'digestor-backup-reminder-dismissed';

/**
 * Bannière de rappel : invite à sauvegarder (export JSON) si l'utilisateur a des
 * données et n'a jamais exporté ou pas depuis BACKUP_REMINDER_DAYS jours.
 * Masquable pour la session.
 */
export function BackupReminder() {
  const lastExport = useLiveQuery(() => getLastExportAt(), []);
  const dayCount = useLiveQuery(() => db.days.count(), []);
  const insightCount = useLiveQuery(() => db.foodInsights.count(), []);
  const symptomCount = useLiveQuery(() => db.symptomNotes.count(), []);

  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Données « significatives » au-delà des 2 jours de démo.
  const hasData = (insightCount ?? 0) > 0 || (symptomCount ?? 0) > 0 || (dayCount ?? 0) > 2;
  const elapsed = daysSince(lastExport);
  const due = hasData && (elapsed === null || elapsed >= BACKUP_REMINDER_DAYS);

  if (saved) return null;
  if (!due || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  async function save() {
    setSaving(true);
    try {
      await downloadBackup();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="no-print mx-auto mt-3 flex max-w-3xl items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
      <Save size={16} className="shrink-0" style={{ color: 'var(--color-modere)' }} />
      <p className="flex-1 text-muted">
        <span className="text-ink">Sauvegardez vos données.</span>{' '}
        {elapsed === null
          ? 'Aucune sauvegarde encore.'
          : `Dernière sauvegarde il y a ${elapsed} jour${elapsed > 1 ? 's' : ''}.`}
      </p>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-60"
        style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Sauvegarder
      </button>
      <button type="button" onClick={dismiss} aria-label="Plus tard" className="shrink-0 text-muted hover:text-ink">
        <X size={15} />
      </button>
    </div>
  );
}
