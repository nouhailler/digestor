import { describe, expect, it } from 'vitest';
import type { DayAnalysis } from '../types';
import { dayAnalysisFilename, formatDayAnalysis } from './dayAnalysisExport';

const base: DayAnalysis = {
  date: '2026-06-29',
  verdict: 'attention',
  summary: 'Journée plutôt lourde, à surveiller.',
  likelyTriggers: ['Pain blanc', 'Café'],
  improvements: [
    { action: 'Réduire le gluten le matin', why: 'Ballonnements récurrents après le petit-déjeuner' },
    { action: 'Boire plus d’eau', why: '' },
  ],
  model: 'test/model',
  updatedAt: '2026-06-29T10:00:00.000Z',
};

describe('formatDayAnalysis', () => {
  it('inclut le verdict, le résumé, les déclencheurs et les pistes', () => {
    const txt = formatDayAnalysis(base);
    expect(txt).toContain('Journée : À surveiller');
    expect(txt).toContain('Journée plutôt lourde');
    expect(txt).toContain('- Pain blanc');
    expect(txt).toContain('- Réduire le gluten le matin');
    expect(txt).toContain('  Pourquoi : Ballonnements récurrents après le petit-déjeuner');
    expect(txt).toContain('Généré par test/model');
  });

  it('omet la ligne « Pourquoi » quand la justification est vide', () => {
    const txt = formatDayAnalysis(base);
    const lines = txt.split('\n');
    const idx = lines.findIndex((l) => l.includes('Boire plus d’eau'));
    expect(lines[idx + 1].startsWith('  Pourquoi')).toBe(false);
  });

  it('tolère l’ancien format de piste (chaîne)', () => {
    const legacy = { ...base, improvements: ['Manger plus lentement' as unknown as never] };
    const txt = formatDayAnalysis(legacy as DayAnalysis);
    expect(txt).toContain('- Manger plus lentement');
  });

  it('n’affiche pas de section vide', () => {
    const empty: DayAnalysis = { ...base, likelyTriggers: [], improvements: [], summary: '' };
    const txt = formatDayAnalysis(empty);
    expect(txt).not.toContain('Déclencheurs probables');
    expect(txt).not.toContain("Pistes d'amélioration");
  });

  it('génère un nom de fichier daté', () => {
    expect(dayAnalysisFilename(base)).toBe('digestor-analyse-2026-06-29.txt');
  });
});
