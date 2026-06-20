import { useState } from 'react';
import { addDays } from 'date-fns';
import {
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { SymptomKey } from '../types';
import { useDay } from '../hooks/useDay';
import { useKnownFoods } from '../hooks/useKnownFoods';
import { useFavorites } from '../hooks/useFavorites';
import { useFoodInsightMap } from '../hooks/useFoodInsightMap';
import { DayCard } from '../components/DayCard';
import { FoodInsightSheet } from '../components/ai/FoodInsightSheet';
import { DayAnalysisSheet } from '../components/ai/DayAnalysisSheet';
import { SymptomDetailSheet } from '../components/SymptomDetailSheet';
import { TipBanner } from '../components/TipBanner';
import { dayHasContent } from '../lib/aggregates';
import { SYMPTOM_HINTS, SYMPTOM_LABELS } from '../lib/constants';
import { findManifestation } from '../lib/encyclopedia';
import { fromISODate, toISODate, todayISO } from '../lib/dates';

interface JournalViewProps {
  date: string;
  onDateChange: (iso: string) => void;
  onOpenAiSettings: () => void;
}

export function JournalView({ date, onDateChange, onOpenAiSettings }: JournalViewProps) {
  const { day, update } = useDay(date);
  const knownFoods = useKnownFoods();
  const favorites = useFavorites();
  const favoriteNames = favorites.map((f) => f.name);
  const insights = useFoodInsightMap();
  const [foodInfo, setFoodInfo] = useState<string | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [symptomInfo, setSymptomInfo] = useState<{ name: string; hint: string } | null>(null);
  const openSymptom = (key: SymptomKey) =>
    setSymptomInfo({ name: SYMPTOM_LABELS[key], hint: SYMPTOM_HINTS[key] });

  const go = (delta: number) => onDateChange(toISODate(addDays(fromISODate(date), delta)));
  const isToday = date === todayISO();

  return (
    <div className="relative mx-auto max-w-3xl px-4 pt-4 pb-28">
      <TipBanner tab="journal" />

      {/* Navigation de date */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Jour précédent
        </button>

        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="rounded-md border border-border bg-surface-2 px-2 py-1 text-sm text-ink [color-scheme:dark]"
        />

        <button
          type="button"
          onClick={() => go(1)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-ink"
        >
          Jour suivant <ChevronRight size={16} />
        </button>
      </div>

      {!isToday && (
        <button
          type="button"
          onClick={() => onDateChange(todayISO())}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-ink"
        >
          <CalendarCheck size={14} /> Aller à aujourd'hui
        </button>
      )}

      {day ? (
        <>
          <DayCard day={day} update={update} onFoodInfo={setFoodInfo} onSymptomInfo={openSymptom} knownFoods={knownFoods} favorites={favoriteNames} insights={insights} />
          {dayHasContent(day) && (
            <button
              type="button"
              onClick={() => setAnalysisOpen(true)}
              title="Demande à l'IA un bilan de la journée : verdict global, déclencheurs probables et pistes d'amélioration. Nécessite une clé OpenRouter."
              className="no-print mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted hover:text-ink"
            >
              <Sparkles size={15} style={{ color: 'var(--color-leger)' }} /> Analyser ma journée avec l'IA
            </button>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          Chargement…
        </div>
      )}

      {/* Boutons ronds flottants : jour précédent / suivant */}
      <div className="no-print fixed bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Jour précédent"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-lg hover:text-ink"
        >
          <ChevronUp size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Jour suivant"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-lg hover:text-ink"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      <FoodInsightSheet
        open={foodInfo !== null}
        name={foodInfo ?? ''}
        onClose={() => setFoodInfo(null)}
        onOpenAiSettings={() => {
          setFoodInfo(null);
          onOpenAiSettings();
        }}
      />

      <DayAnalysisSheet
        open={analysisOpen}
        day={day}
        onClose={() => setAnalysisOpen(false)}
        onOpenAiSettings={() => {
          setAnalysisOpen(false);
          onOpenAiSettings();
        }}
      />

      <SymptomDetailSheet
        open={symptomInfo !== null}
        name={symptomInfo?.name ?? ''}
        staticHint={symptomInfo?.hint}
        onClose={() => setSymptomInfo(null)}
        onOpenAiSettings={() => {
          setSymptomInfo(null);
          onOpenAiSettings();
        }}
        onSelectRelated={(name) => setSymptomInfo({ name, hint: findManifestation(name) ?? '' })}
      />
    </div>
  );
}
