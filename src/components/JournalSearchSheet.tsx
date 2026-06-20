import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileText, Search, Utensils } from 'lucide-react';
import { Sheet } from './Sheet';
import { getAllDays } from '../lib/db';
import { SEARCH_MIN, searchJournal } from '../lib/journalSearch';
import { dayLongLabel } from '../lib/dates';

interface JournalSearchSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenDay: (iso: string) => void;
}

export function JournalSearchSheet({ open, onClose, onOpenDay }: JournalSearchSheetProps) {
  const days = useLiveQuery(() => getAllDays(), []) ?? [];
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchJournal(days, query), [days, query]);
  const tooShort = query.trim().length < SEARCH_MIN;

  return (
    <Sheet open={open} title="Rechercher dans le journal" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
          <Search size={16} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Aliment, symptôme ou note (2 lettres min.)…"
            className="w-full bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Effacer" className="text-muted hover:text-ink">
              ✕
            </button>
          )}
        </div>

        {tooShort ? (
          <p className="text-muted">Tapez au moins {SEARCH_MIN} lettres pour chercher dans tout votre journal.</p>
        ) : results.length === 0 ? (
          <p className="text-muted">Aucun résultat pour « {query.trim()} ».</p>
        ) : (
          <>
            <p className="text-xs text-muted">
              {results.length} jour{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}.
            </p>
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.date}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDay(r.date);
                      onClose();
                    }}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-left hover:border-leger"
                  >
                    <span className="block font-medium text-ink">{dayLongLabel(r.date)}</span>
                    {r.foods.length > 0 && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        <Utensils size={12} /> {r.foods.join(', ')}
                      </span>
                    )}
                    {r.symptoms.length > 0 && (
                      <span className="mt-0.5 block text-xs" style={{ color: 'var(--color-modere)' }}>
                        {r.symptoms.join(', ')}
                      </span>
                    )}
                    {r.noteMatch && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        <FileText size={12} /> correspondance dans les notes
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Sheet>
  );
}
