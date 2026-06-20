import { useRef, useState } from 'react';
import {
  FileText,
  GraduationCap,
  Info,
  Mic,
  Moon,
  RotateCcw,
  Save,
  Sparkles,
  Stethoscope,
  Sun,
  Upload,
  UserCog,
} from 'lucide-react';
import { Sheet } from './Sheet';
import { importAll, type ExportPayload } from '../lib/db';
import { downloadBackup } from '../lib/backup';
import { loadSeed } from '../lib/seed';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../lib/theme';

interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  onAbout: () => void;
  onOpenAiSettings: () => void;
  onOpenProfile: () => void;
  onReplayOnboarding: () => void;
  onOpenImportMeals: () => void;
  onOpenMedicalRecord: () => void;
}

export function MenuSheet({
  open,
  onClose,
  onAbout,
  onOpenAiSettings,
  onOpenProfile,
  onReplayOnboarding,
  onOpenImportMeals,
  onOpenMedicalRecord,
}: MenuSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  async function handleExport() {
    await downloadBackup();
    setMsg('Sauvegarde téléchargée. Conservez ce fichier en lieu sûr.');
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
        {/* Sauvegarde mise en avant */}
        <button
          type="button"
          onClick={handleExport}
          title="Télécharge un fichier JSON contenant toutes vos données (sauf la clé IA). À conserver pour restaurer ou changer d'appareil."
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium"
          style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
        >
          <Save size={17} /> Sauvegarder mes données (JSON)
        </button>

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

        {/* Apparence : thème sombre (défaut) ou clair */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Apparence</p>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-1">
            <ThemeOption icon={<Moon size={16} />} label="Sombre" value="dark" current={theme} onSelect={setTheme} />
            <ThemeOption icon={<Sun size={16} />} label="Clair" value="light" current={theme} onSelect={setTheme} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MenuButton icon={<Upload size={16} />} label="Restaurer (JSON)" onClick={() => fileRef.current?.click()} />
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
            onOpenMedicalRecord();
          }}
          title="Synthèse complète de votre journal (profil, symptômes, transit, aliments, corrélations) à imprimer / partager avec un médecin."
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted hover:text-ink"
        >
          <Stethoscope size={16} /> Dossier médical
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

function ThemeOption({
  icon,
  label,
  value,
  current,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  value: Theme;
  current: Theme;
  onSelect: (t: Theme) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm"
      style={{
        backgroundColor: active ? 'var(--color-surface-2)' : 'transparent',
        color: active ? 'var(--color-ink)' : 'var(--color-muted)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {icon} {label}
    </button>
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
