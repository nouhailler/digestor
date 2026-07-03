# Compléter les amines biogènes en masse (via Claude Web)

Workflow pour renseigner le profil d'amines biogènes de nombreux aliments à la fois,
puis le réinjecter dans Digestor. Complémentaire de l'analyse par aliment.

## Étapes

1. **Compléter le gratuit d'abord.** Dans Digestor → onglet **Aliments** → **Catalogue** →
   « **Compléter les amines (hors-ligne)** ». Remplit instantanément tout ce que le dictionnaire
   embarqué connaît (fromages, poissons, charcuterie, fermentés, fruits libérateurs…).
2. **Exporter le référentiel.** Même écran → « **Exporter le référentiel d'aliments** ».
3. **Projet Claude Web.** Sur claude.ai, créez un Projet, **joignez le fichier exporté**, et collez
   comme instructions le prompt dédié. Le prompt exact est copiable dans l'app :
   Aliments → « **Importer un référentiel** » → « **Comment compléter les amines en masse ?** » →
   « **Copier le prompt** ». (Source : `src/lib/foodReferenceImportPrompt.ts`,
   `CLAUDE_WEB_AMINES_PROMPT`.)
4. **Récupérer le patch.** Claude renvoie un petit JSON « patch » : uniquement le `name` et le bloc
   `amines` de chaque aliment notable (schéma public : `histamine`/`tyramine`/`putrescineCadaverine`,
   `histamineLiberator`, `daoInhibitor`, `maoInhibitor`, `fermented`, `freshnessDependent`). Sur une
   longue liste, Claude peut répondre en plusieurs blocs JSON successifs.
5. **Réimporter.** Aliments → « **Importer un référentiel** » → coller le JSON → **Prévisualiser** →
   **Importer**. La fusion **pose les amines sans toucher au reste** (FODMAP/SIBO/résumé/conseils,
   et la catégorie, sont conservés). Répétez pour chaque bloc si Claude a répondu en plusieurs fois.

## Honnêteté

La teneur en amines est très variable (fraîcheur, affinage, conservation). Le prompt demande
explicitement de ne renseigner un niveau que lorsqu'il y a un vrai signal et de laisser `unknown`
(ou d'omettre) en cas de doute — pas de fausse précision.
