import { describe, expect, it } from 'vitest';
import {
  collectInsights,
  countImport,
  mergeImportedDay,
  parseMealsImport,
  resolveIntensity,
  resolveSymptomKey,
} from './mealsImport';
import { emptyDay, makeMeal } from './factory';

describe('parseMealsImport', () => {
  it('parse le format canonique { days: [...] }', () => {
    const json = JSON.stringify({
      app: 'digestor',
      days: [
        {
          date: '2026-06-13',
          meals: [{ time: '08:00', foods: ['œufs brouillés (2)', 'avocat'] }],
        },
      ],
    });
    const r = parseMealsImport(json, '2026-06-01');
    expect(r.days).toHaveLength(1);
    expect(r.days[0].date).toBe('2026-06-13');
    expect(r.days[0].meals[0].foods.map((f) => f.name)).toEqual(['œufs brouillés (2)', 'avocat']);
  });

  it('accepte le raccourci jour unique { meals: [...] } et applique la date par défaut', () => {
    const r = parseMealsImport('{ "meals": [ { "time": "12:30", "foods": ["salade verte"] } ] }', '2026-06-13');
    expect(r.days[0].date).toBe('2026-06-13');
    expect(r.days[0].meals[0].time).toBe('12:30');
  });

  it('extrait le JSON même entouré de prose / fences', () => {
    const text = 'Voici ton JSON :\n```json\n{ "meals": [ { "time": "8:00", "foods": ["café"] } ] }\n```\nBonne journée !';
    const r = parseMealsImport(text, '2026-06-13');
    expect(r.days[0].meals[0].time).toBe('08:00'); // normalisé
  });

  it('normalise une heure invalide en 12:00 avec avertissement', () => {
    const r = parseMealsImport('{ "meals": [ { "time": "midi", "foods": ["pain"] } ] }', '2026-06-13');
    expect(r.days[0].meals[0].time).toBe('12:00');
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('accepte un aliment objet avec catégorie explicite', () => {
    const r = parseMealsImport(
      '{ "meals": [ { "time": "08:00", "foods": [ { "name": "miel maison", "category": "pro" } ] } ] }',
      '2026-06-13',
    );
    expect(r.days[0].meals[0].foods[0]).toEqual({ name: 'miel maison', category: 'pro' });
  });

  it('rejette un JSON non Digestor', () => {
    expect(() => parseMealsImport('{ "app": "autre", "meals": [] }', '2026-06-13')).toThrow();
  });

  it('rejette un texte sans repas exploitable', () => {
    expect(() => parseMealsImport('{ "days": [ { "meals": [] } ] }', '2026-06-13')).toThrow();
    expect(() => parseMealsImport('pas du json', '2026-06-13')).toThrow();
  });
});

describe('mergeImportedDay', () => {
  const imported = {
    date: '2026-06-13',
    meals: [{ time: '08:00', foods: [{ name: 'brocoli vapeur' }] }],
    notes: 'importé',
  };

  it('ajoute aux repas existants (append) et auto-classe les aliments', () => {
    const day = { ...emptyDay('2026-06-13'), meals: [makeMeal('07:00', ['café'])] };
    const merged = mergeImportedDay(day, imported, 'append');
    expect(merged.meals).toHaveLength(2);
    const added = merged.meals[1];
    expect(added.time).toBe('08:00');
    expect(added.foods[0].category).toBe('beneficial'); // brocoli → bénéfique
    expect(added.foods[0].id).toBeTruthy();
  });

  it('remplace les repas en mode replace', () => {
    const day = { ...emptyDay('2026-06-13'), meals: [makeMeal('07:00', ['café'])] };
    const merged = mergeImportedDay(day, imported, 'replace');
    expect(merged.meals).toHaveLength(1);
    expect(merged.meals[0].time).toBe('08:00');
  });

  it('fusionne les notes', () => {
    const day = { ...emptyDay('2026-06-13'), notes: 'déjà là' };
    expect(mergeImportedDay(day, imported, 'append').notes).toBe('déjà là\nimporté');
  });
});

describe('countImport', () => {
  it('compte repas, aliments, fiches et jours avec symptômes', () => {
    const parsed = parseMealsImport(
      '{ "days": [ { "meals": [ { "time": "08:00", "foods": ["a","b"] }, { "time": "12:00", "foods": ["c"] } ], "symptoms": { "gaz": "leger" } } ] }',
      '2026-06-13',
    );
    expect(countImport(parsed)).toEqual({ meals: 2, foods: 3, insights: 0, symptomDays: 1 });
  });
});

describe('résolution symptômes / intensités', () => {
  it('reconnaît clés canoniques, libellés et synonymes', () => {
    expect(resolveSymptomKey('fatigue_apres_repas')).toBe('fatigue_apres_repas');
    expect(resolveSymptomKey('Diarrhée / selles molles')).toBe('diarrhee');
    expect(resolveSymptomKey('flatulences')).toBe('gaz');
    expect(resolveSymptomKey('inconnu xyz')).toBeNull();
  });
  it('reconnaît les intensités (accents, synonymes)', () => {
    expect(resolveIntensity('sévère')).toBe('severe');
    expect(resolveIntensity('Modéré')).toBe('modere');
    expect(resolveIntensity('faible')).toBe('leger');
    expect(resolveIntensity('???')).toBeNull();
  });
});

describe('parse — aliment enrichi (fiche FODMAP/SIBO/candidose)', () => {
  const json = JSON.stringify({
    app: 'digestor',
    days: [
      {
        meals: [
          {
            time: '08:00',
            foods: [
              {
                name: 'kéfir de chèvre',
                fodmapLevel: 'low',
                fodmaps: { fructose: 'low', lactose: 'moderate', fructans: 'low', gos: 'low', polyols: 'low' },
                sibo: { verdict: 'favorable', note: 'Probiotique.' },
                candida: { verdict: 'attention', note: 'Selon tolérance.' },
              },
            ],
          },
        ],
        symptoms: { ballonnements: 'severe', 'envie de sucre': 'modere' },
        hydrationL: 1.5,
        stool: { label: 'Selles molles', count: 2, bristol: 6 },
        digestionDelayH: 3,
        quality: 'difficile',
      },
    ],
  });

  const parsed = parseMealsImport(json, '2026-06-13');
  const day = parsed.days[0];

  it('construit une fiche d’analyse et dérive la catégorie', () => {
    const food = day.meals[0].foods[0];
    expect(food.insight).toBeDefined();
    expect(food.insight!.fodmaps.lactose).toBe('moderate');
    expect(food.insight!.sibo.verdict).toBe('favorable');
    expect(food.category).toBe(food.insight!.category); // catégorie issue de la fiche
    expect(collectInsights(parsed)).toHaveLength(1);
  });

  it('parse symptômes (clé + synonyme), transit et qualité', () => {
    expect(day.symptoms).toEqual({ ballonnements: 'severe', envie_sucre: 'modere' });
    expect(day.hydrationL).toBe(1.5);
    expect(day.stool).toEqual({ label: 'Selles molles', count: 2, bristol: 6 });
    expect(day.digestionDelayH).toBe(3);
    expect(day.quality).toBe('difficile');
  });

  it('accepte un jour sans repas mais avec symptômes', () => {
    const r = parseMealsImport('{ "symptoms": { "nausees": "leger" } }', '2026-06-13');
    expect(r.days[0].meals).toHaveLength(0);
    expect(r.days[0].symptoms).toEqual({ nausees: 'leger' });
  });
});

describe('mergeImportedDay — symptômes & transit', () => {
  it('écrase les symptômes fournis et conserve les autres', () => {
    const day = {
      ...emptyDay('2026-06-13'),
      symptoms: { ...emptyDay('2026-06-13').symptoms, constipation: 'severe' as const },
    };
    const merged = mergeImportedDay(
      day,
      { date: '2026-06-13', meals: [], symptoms: { ballonnements: 'modere' }, hydrationL: 2 },
      'append',
    );
    expect(merged.symptoms.ballonnements).toBe('modere');
    expect(merged.symptoms.constipation).toBe('severe'); // préservé
    expect(merged.hydrationL).toBe(2);
  });
});
