import { Activity, Leaf, Scale, Stethoscope, UtensilsCrossed } from 'lucide-react';
import { Sheet } from './Sheet';
import { amineDetail } from '../lib/biogenicAmines';

interface AmineDetailSheetProps {
  open: boolean;
  /** Nom de l'amine (ex. « Histamine ») ; la fiche est résolue par nom. */
  name: string;
  onClose: () => void;
}

/** Fiche détaillée d'une amine biogène à surveiller (effets, aliments, prévention, diagnostic). */
export function AmineDetailSheet({ open, name, onClose }: AmineDetailSheetProps) {
  const detail = amineDetail(name);
  return (
    <Sheet open={open && !!detail} title={detail?.name ?? name} onClose={onClose}>
      {detail && (
        <div className="space-y-4 text-sm">
          <p className="leading-relaxed text-ink">{detail.intro}</p>

          <Block icon={<Activity size={15} style={{ color: 'var(--color-severe)' }} />} title="Effets d'un excès">
            <List items={detail.effects} color="var(--color-severe)" />
          </Block>

          <Block
            icon={<UtensilsCrossed size={15} style={{ color: 'var(--color-modere)' }} />}
            title="Où on la trouve"
          >
            <List items={detail.foods} color="var(--color-modere)" />
          </Block>

          <Block icon={<Scale size={15} style={{ color: 'var(--color-modere)' }} />} title="Quelle quantité tolérer">
            <List items={detail.tolerance} color="var(--color-modere)" />
          </Block>

          <Block icon={<Leaf size={15} style={{ color: 'var(--color-leger)' }} />} title="Comment éviter les effets">
            <List items={detail.avoid} color="var(--color-leger)" />
          </Block>

          <Block icon={<Stethoscope size={15} className="text-muted" />} title="Comment repérer un excès">
            <List items={detail.diagnosis} color="var(--color-absent)" />
          </Block>

          <p className="border-t border-border/60 pt-3 text-xs text-muted">
            Repère indicatif, non médical. La teneur en amines varie selon la fraîcheur et l'affinage — en cas de
            doute, consultez un professionnel de santé.
          </p>
        </div>
      )}
    </Sheet>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

function List({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-1">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-ink">
          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          {t}
        </li>
      ))}
    </ul>
  );
}
