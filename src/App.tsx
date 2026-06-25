import { lazy, Suspense, useEffect, useState } from 'react';
import { Legend } from './components/Legend';
import { BottomNav, type Tab } from './components/BottomNav';
import { MenuSheet } from './components/MenuSheet';
import { AboutSheet } from './components/AboutSheet';
import { InstallPrompt } from './components/InstallPrompt';
import { AiSettingsSheet } from './components/ai/AiSettingsSheet';
import { ProfileSheet } from './components/ProfileSheet';
import { HelpSheet } from './components/HelpSheet';
import { Onboarding } from './components/Onboarding';
import { Tour } from './components/Tour';
import { ImportMealsSheet } from './components/ImportMealsSheet';
import { MedicalRecordSheet } from './components/MedicalRecordSheet';
import { TreatmentsSheet } from './components/TreatmentsSheet';
import { ReintroSheet } from './components/ReintroSheet';
import { MealTemplatesSheet } from './components/MealTemplatesSheet';
import { JournalSearchSheet } from './components/JournalSearchSheet';
import { BackupReminder } from './components/BackupReminder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { JournalView } from './views/JournalView';
import { WeekView } from './views/WeekView';
import { AlimentsView } from './views/AlimentsView';
import { ReperesView } from './views/ReperesView';
import { useProfile } from './hooks/useProfile';

// Recharts est lourd : on isole l'écran Évolution dans son propre chunk,
// chargé à la demande (code-splitting) quand l'onglet est ouvert.
const EvolutionView = lazy(() =>
  import('./views/EvolutionView').then((m) => ({ default: m.EvolutionView })),
);
import { isEmpty, isOnboardingDone, setOnboardingDone, getSeenTours, markTourSeen, resetTours } from './lib/db';
import { TOURS } from './lib/tour';
import { seedIfEmpty, SEED_DAYS } from './lib/seed';
import { ensurePersistentStorage } from './lib/storage';
import { fromISODate, todayISO, weekLabel } from './lib/dates';

export default function App() {
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('journal');
  const [date, setDate] = useState<string>(todayISO());
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tourTab, setTourTab] = useState<Tab | null>(null);
  const [seenTours, setSeenTours] = useState<string[] | null>(null);
  const [importMealsOpen, setImportMealsOpen] = useState(false);
  const [medicalRecordOpen, setMedicalRecordOpen] = useState(false);
  const [treatmentsOpen, setTreatmentsOpen] = useState(false);
  const [reintroOpen, setReintroOpen] = useState(false);
  const [mealTemplatesOpen, setMealTemplatesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    // Demande un stockage persistant (limite l'éviction auto, surtout iOS).
    void ensurePersistentStorage();
    (async () => {
      try {
        const wasEmpty = await isEmpty();
        await seedIfEmpty();
        // Au tout premier lancement, ouvrir sur le rendu de référence (semaine seed).
        if (wasEmpty) setDate(SEED_DAYS[0].date);
        setShowOnboarding(!(await isOnboardingDone()));
        setSeenTours(await getSeenTours());
      } catch (err) {
        // Ne jamais figer sur l'écran de chargement : on affiche l'erreur et on
        // laisse l'app se rendre (les données restent dans IndexedDB).
        console.error('Échec du démarrage de Digestor :', err);
        setStartupError(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  function finishOnboarding() {
    setShowOnboarding(false);
    void setOnboardingDone(true);
  }

  // Visite guidée : se lance toute seule à la première arrivée sur chaque écran
  // (une fois l'onboarding passé). Mémorisée pour ne pas se rejouer ensuite.
  useEffect(() => {
    if (!ready || showOnboarding || seenTours === null || tourTab) return;
    if (!seenTours.includes(tab)) setTourTab(tab);
  }, [ready, showOnboarding, seenTours, tab, tourTab]);

  function closeTour() {
    const t = tourTab;
    setTourTab(null);
    if (t) {
      void markTourSeen(t);
      setSeenTours((s) => (s && !s.includes(t) ? [...s, t] : s));
    }
  }

  function replayTours() {
    void resetTours();
    setSeenTours([]);
    setShowOnboarding(true);
  }

  const title = `${weekLabel(fromISODate(date))} — Patient : ${profile?.patientName || 'exemple'}`;

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-muted">Chargement de Digestor…</div>
    );
  }

  return (
    <div className="min-h-full">
      <Legend title={title} onMenu={() => setMenuOpen(true)} onHelp={() => setHelpOpen(true)} />

      {startupError && (
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <div className="rounded-lg border border-severe/40 bg-severe/10 px-3 py-2 text-sm text-severe">
            Un problème est survenu au démarrage (tes données restent en sécurité). Détail : {startupError}
          </div>
        </div>
      )}

      <div className="px-4">
        <BackupReminder />
      </div>

      <main>
        <ErrorBoundary key={tab}>
        {tab === 'journal' && (
          <JournalView date={date} onDateChange={setDate} onOpenAiSettings={() => setAiSettingsOpen(true)} />
        )}
        {tab === 'aliments' && (
          <AlimentsView
            onOpenAiSettings={() => setAiSettingsOpen(true)}
            date={date}
            onOpenDay={(d) => {
              setDate(d);
              setTab('journal');
            }}
          />
        )}
        {tab === 'semaine' && (
          <WeekView
            date={date}
            onDateChange={setDate}
            onOpenDay={(d) => {
              setDate(d);
              setTab('journal');
            }}
          />
        )}
        {tab === 'evolution' && (
          <Suspense
            fallback={<div className="mx-auto max-w-3xl px-4 pt-10 text-center text-muted">Chargement des graphes…</div>}
          >
            <EvolutionView date={date} onOpenAiSettings={() => setAiSettingsOpen(true)} />
          </Suspense>
        )}
        {tab === 'reperes' && (
          <ReperesView onAbout={() => setAboutOpen(true)} onOpenAiSettings={() => setAiSettingsOpen(true)} />
        )}
        </ErrorBoundary>
      </main>

      <InstallPrompt />
      <BottomNav active={tab} onChange={setTab} />

      <MenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onAbout={() => setAboutOpen(true)}
        onOpenAiSettings={() => setAiSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onReplayOnboarding={replayTours}
        onOpenImportMeals={() => setImportMealsOpen(true)}
        onOpenMedicalRecord={() => setMedicalRecordOpen(true)}
        onOpenTreatments={() => setTreatmentsOpen(true)}
        onOpenReintro={() => setReintroOpen(true)}
        onOpenMealTemplates={() => setMealTemplatesOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <AboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <MedicalRecordSheet open={medicalRecordOpen} onClose={() => setMedicalRecordOpen(false)} />
      <TreatmentsSheet open={treatmentsOpen} onClose={() => setTreatmentsOpen(false)} />
      <ReintroSheet open={reintroOpen} onClose={() => setReintroOpen(false)} />
      <MealTemplatesSheet open={mealTemplatesOpen} onClose={() => setMealTemplatesOpen(false)} />
      <JournalSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenDay={(d) => {
          setSearchOpen(false);
          setDate(d);
          setTab('journal');
        }}
      />
      <AiSettingsSheet open={aiSettingsOpen} onClose={() => setAiSettingsOpen(false)} />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
      <HelpSheet
        open={helpOpen}
        tab={tab}
        onClose={() => setHelpOpen(false)}
        onStartTour={() => {
          setHelpOpen(false);
          setTourTab(tab);
        }}
      />
      <ImportMealsSheet
        open={importMealsOpen}
        defaultDate={date}
        onClose={() => setImportMealsOpen(false)}
        onImported={(d) => {
          setDate(d);
          setTab('journal');
        }}
      />

      {showOnboarding && <Onboarding onFinish={finishOnboarding} />}
      {tourTab && !showOnboarding && <Tour steps={TOURS[tourTab]} onClose={closeTour} />}
    </div>
  );
}
