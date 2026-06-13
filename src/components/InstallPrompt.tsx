import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'digestor-a2hs-dismissed';

/** Invite discrète « Ajouter à l'écran d'accueil ». */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!evt || hidden) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setHidden(true);
  };

  return (
    <div className="no-print safe-bottom fixed inset-x-3 bottom-20 z-30 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 shadow-xl">
      <Download size={18} style={{ color: 'var(--color-leger)' }} />
      <p className="flex-1 text-sm text-ink">Installer Digestor sur votre téléphone ?</p>
      <button
        type="button"
        onClick={async () => {
          await evt.prompt();
          await evt.userChoice;
          setEvt(null);
        }}
        className="rounded-full px-3 py-1.5 text-sm font-medium"
        style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
      >
        Installer
      </button>
      <button type="button" onClick={dismiss} aria-label="Ignorer" className="text-muted hover:text-ink">
        <X size={16} />
      </button>
    </div>
  );
}
