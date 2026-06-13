import { useRef, useState } from 'react';
import {
  Download,
  FileText,
  GraduationCap,
  Info,
  Mic,
  RotateCcw,
  Sparkles,
  Upload,
  UserCog,
} from 'lucide-react';
import { Sheet } from './Sheet';
import { exportAll, importAll, type ExportPayload } from '../lib/db';
import { loadSeed } from '../lib/seed';
import { toISODate } from '../lib/dates';

interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  onAbout: () => void;
  onOpenAiSettings: () => void;
  onOpenProfile: () => void;
  onReplayOnboarding: () => void;
  onOpenImportMeals: () => void;
}

export function MenuSheet({
  open,
  onClose,
  onAbout,
  onOpenAiSettings,
  onOpenProfile,
  onReplayOnboarding,
  onOpenImportMeals,
}: MenuSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleExport() {
    const payload = await exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digestor-${toISODate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text()) as ExportPayload;
      await importAll(payload);
      setMsg('Import réussi. Données remplacées.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Échec de l’import.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleReset() {
    if (!confirm('Réinitialiser les données de démo (Lundi/Mardi du 9 juin 2025) ? Les jours existants pour ces dates seront écrasés.'))
      return;
    await loadSeed();
    setMsg('Données de démo réinitialisées.');
  }

  return (
    <Sheet open={open} title="Menu" onClose={onClose}>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenImportMeals();
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink hover:border-leger"
        >
          <Mic size={16} className="text-muted" /> Entrer un repas (voix → JSON)
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenProfile();
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink hover:border-leger"
        >
          <UserCog size={16} className="text-muted" /> Profil santé (intolérances, allergies…)
        </button>

        <div className="grid grid-cols-2 gap-3">
          <MenuButton icon={<Download size={16} />} label="Exporter JSON" onClick={handleExport} />
          <MenuButton icon={<Upload size={16} />} label="Importer JSON" onClick={() => fileRef.current?.click()} />
          <MenuButton icon={<FileText size={16} />} label="Exporter PDF" onClick={() => window.print()} />
          <MenuButton icon={<RotateCcw size={16} />} label="Données de démo" onClick={handleReset} />
        </div>

        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />

        {msg && <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink">{msg}</p>}

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAiSettings();
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted hover:text-ink"
        >
          <Sparkles size={16} /> Assistant IA (OpenRouter)
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onReplayOnboarding();
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted hover:text-ink"
        >
          <GraduationCap size={16} /> Revoir le tutoriel
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onAbout();
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted hover:text-ink"
        >
          <Info size={16} /> À propos & avertissement médical
        </button>
      </div>
    </Sheet>
  );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-3 text-sm text-ink hover:border-leger"
    >
      <span className="text-muted">{icon}</span>
      {label}
    </button>
  );
}
