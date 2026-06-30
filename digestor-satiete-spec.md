# Feature: Suivi temporel de la satiété — Digestor

## Contexte
Digestor est un PWA offline-first de suivi digestif. Stack confirmée : `Vite` · `React 19` · `TypeScript` (strict) · `Tailwind CSS v4` · `Dexie` (IndexedDB) · `Recharts` · `date-fns` (locale fr) · `lucide-react` · `vite-plugin-pwa` · tests `Vitest` + Testing Library. Cette feature ajoute un suivi de satiété multi-points dans le temps, corrélé à la composition du repas précédent.

## Objectif
Après chaque repas journalisé, proposer des check-ins de satiété à plusieurs moments (immédiat, +1h, +2h, +3h) mesurant intensité de la faim, énergie/fébrilité, et envie de sucre via des Visual Analogue Scales (VAS), plus un type de satiété qualitatif. Le tout doit être corrélable avec la composition du repas (macros, fibres, etc.) déjà enregistrée.

## 1. Modèle de données

Ajouter une nouvelle table Dexie `satietyChecks`, liée à l'entrée de repas existante (`mealId`), sans modifier le schéma du repas lui-même.

```typescript
interface SatietyCheck {
  id?: number;
  mealId: number;              // FK vers l'entrée de repas existante
  timestamp: string;           // ISO 8601
  checkpoint: 'immediate' | '1h' | '2h' | '3h';

  // VAS : entiers 0-100, ancres textuelles gérées côté UI
  hungerIntensity: number;     // 0 = "aucune faim" / 100 = "faim extrême"
  energyLevel: number;         // 0 = "fébrile / coup de barre" / 100 = "énergie stable et claire"
  sugarCraving: number;        // 0 = "aucune envie" / 100 = "envie irrépressible"

  // Type de satiété qualitatif (uniquement pertinent pour checkpoint 'immediate' et '1h')
  satietyType?: 'légère' | 'lourde' | 'ballonnement' | null;

  notes?: string;
}
```

Mise à jour du schéma Dexie (exemple, à adapter au versioning existant):

```typescript
this.version(X).stores({
  // ...stores existants inchangés...
  satietyChecks: '++id, mealId, timestamp, checkpoint'
});
```

## 2. Flux UX

1. Juste après la saisie d'un repas → check-in `immediate` proposé automatiquement (peut être skippable).
2. Notifications/rappels locaux (si déjà gérés ailleurs dans l'app, réutiliser le même mécanisme) à +1h, +2h, +3h pour proposer les check-ins suivants. Utiliser `date-fns` (locale `fr`) pour tout calcul/formatage de timestamp et d'affichage relatif ("il y a 2h", etc.). Si l'app n'a pas de notifications push, prévoir un badge/rappel doux dans l'UI au prochain lancement si la fenêtre est passée.
3. Chaque check-in affiche 3 sliders VAS (0-100, drag continu, valeur par défaut au centre ou à une valeur neutre) :
   - **Intensité de la faim**
   - **Énergie / fébrilité**
   - **Envie de sucre**
4. Sur les checkpoints `immediate` et `1h` uniquement, ajouter un sélecteur de **type de satiété** : Légère / Lourde / Ballonnement (boutons radio ou chips avec icône `lucide-react` associée — pas de dropdown — ergonomie mobile).
5. Un check-in peut être ignoré sans bloquer le flux (pas de champ obligatoire au-delà du premier slider touché).

## 3. Composant UI : VAS Slider

Créer un composant réutilisable `<VasSlider>` :
- Range natif `<input type="range" min={0} max={100}>` stylé en Tailwind CSS v4, en réutilisant les classes/variables de thème déjà définies dans le projet (pas de CSS custom isolé, pas de dépendance externe type lib de sliders).
- Ancres textuelles aux deux extrémités, configurables par prop (`leftLabel`, `rightLabel`).
- Valeur affichée en temps réel pendant le drag (optionnel mais recommandé pour le feedback).
- Doit fonctionner correctement en mode tactile (zone de drag suffisamment grande, pas de conflit avec le scroll de la page).
- Tests Vitest + Testing Library : rendu, valeur initiale, mise à jour au drag/changement, accessibilité (label associé au input).

## 4. Corrélation avec la composition du repas

Construire une vue d'analyse (page ou section dédiée) qui croise `satietyChecks` avec les champs déjà présents sur l'entrée de repas (macros, fibres, type d'aliments, etc. — réutiliser le modèle de repas existant sans le modifier).

Fonctionnalités attendues :
- Graphique courbe de satiété avec **Recharts** (déjà présent dans le projet, ne pas ajouter de lib de charting) : axe X = checkpoints (immediate/1h/2h/3h), axe Y = `hungerIntensity` (et idéalement les 3 métriques superposées en `LineChart` multi-séries, ou en onglets si la lisibilité en pâtit).
- Vue agrégée : pour un repas donné, afficher en résumé sa composition (macros) à côté de la courbe de satiété correspondante.
- Vue comparative dans le temps : permettre de repérer des patterns, par exemple repas riches en fibres vs faible `hungerIntensity` moyen sur 3h, ou repas sucrés vs `sugarCraving` élevé au checkpoint 2h/3h. Pas besoin de stats avancées au départ — un simple regroupement par tranche de macro (ex: quartiles de fibres) suffit pour une v1.
- Si l'app a déjà une page de tendances/historique, intégrer cette corrélation comme un nouvel onglet plutôt que créer une page isolée.

## 5. Contraintes techniques

- Offline-first : tout doit fonctionner sans réseau, cohérent avec l'architecture existante de Digestor.
- Ne pas modifier le schéma de la table de repas existante — uniquement ajouter la nouvelle table en relation FK.
- Respecter les conventions de nommage et la structure de fichiers déjà en place dans le projet (vérifier `CONTEXT.md` / `CLAUDE.md` du repo avant de commencer).
- Composants typés strictement (TypeScript), pas de `any`.
- Pas de dépendance lourde ajoutée pour les sliders — implémentation native suffit.
- Tests Vitest + Testing Library obligatoires sur : `<VasSlider>` (cf. section 3), le flow de check-in (création/skip d'un check-in, association correcte au `mealId`), et la logique de calcul de corrélation (regroupement par quartile de fibres/macros, agrégation des moyennes par checkpoint).

## 6. Plan de travail suggéré pour Claude Code

1. Lire `CONTEXT.md`/`CLAUDE.md` du projet Digestor pour confirmer stack exacte et conventions.
2. Ajouter le modèle `SatietyCheck` + migration Dexie.
3. Créer le composant `<VasSlider>`.
4. Créer le flow de check-in (immediate + rappels 1h/2h/3h) avec sélecteur de type de satiété sur immediate/1h.
5. Créer la vue de corrélation (graphique + résumé composition repas).
6. Tester le cycle complet offline (ajout repas → check-ins → visualisation).
7. Écrire les tests Vitest + Testing Library (VasSlider, flow de check-in, logique de corrélation).
8. Mettre à jour `CONTEXT.md` avec le nouveau modèle de données pour continuité de session.
