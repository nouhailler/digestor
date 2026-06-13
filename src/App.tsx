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
import { ImportMealsSheet } from './components/ImportMealsSheet';
import { BackupReminder } from './components/BackupReminder';
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
import { isEmpty, isOnboardingDone, setOnboardingDone } from './lib/db';
import { seedIfEmpty, SEED_DAYS } from './lib/seed';
import { ensurePersistentStorage } from './lib/storage';
import { fromISODate, todayISO, weekLabel } from './lib/dates';

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('journal');
  const [date, setDate] = useState<string>(todayISO());
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [importMealsOpen, setImportMealsOpen] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    // Demande un stockage persistant (limite l'éviction auto, surtout iOS).
    void ensurePersistentStorage();
    (async () => {
      const wasEmpty = await isEmpty();
      await seedIfEmpty();
      // Au tout premier lancement, ouvrir sur le rendu de référence (semaine seed).
      if (wasEmpty) setDate(SEED_DAYS[0].date);
      setShowOnboarding(!(await isOnboardingDone()));
      setReady(true);
    })();
  }, []);

  function finishOnboarding() {
    setShowOnboarding(false);
    void setOnboardingDone(true);
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

      <div className="px-4">
        <BackupReminder />
      </div>

      <main>
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
            <EvolutionView date={date} />
          </Suspense>
        )}
        {tab === 'reperes' && (
          <ReperesView onAbout={() => setAboutOpen(true)} onOpenAiSettings={() => setAiSettingsOpen(true)} />
        )}
      </main>

      <InstallPrompt />
      <BottomNav active={tab} onChange={setTab} />

      <MenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onAbout={() => setAboutOpen(true)}
        onOpenAiSettings={() => setAiSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onReplayOnboarding={() => setShowOnboarding(true)}
        onOpenImportMeals={() => setImportMealsOpen(true)}
      />
      <AboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <AiSettingsSheet open={aiSettingsOpen} onClose={() => setAiSettingsOpen(false)} />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
      <HelpSheet open={helpOpen} tab={tab} onClose={() => setHelpOpen(false)} />
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
    </div>
  );
}
