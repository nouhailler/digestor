/**
 * Prompt à coller dans un Projet Claude Web (claude.ai), AVEC le fichier
 * « référentiel d'aliments » exporté depuis Digestor joint au projet. Claude
 * renvoie un petit JSON « patch » ne contenant que le nom + le profil d'amines
 * de chaque aliment concerné — à recoller dans Digestor via « Importer un
 * référentiel ». L'import fusionne : il pose les amines sans toucher au reste.
 *
 * Workflow décrit dans docs/claude-web-amines-prompt.md.
 */
export const CLAUDE_WEB_AMINES_PROMPT = `Tu complètes le profil d'AMINES BIOGÈNES des aliments d'un journal alimentaire (Digestor).
Un fichier de référence d'aliments Digestor est joint au projet (JSON avec "type": "food-reference"
et une liste "foods"). Ta mission : pour ces aliments, renseigner leur profil d'amines biogènes.

RÈGLES GÉNÉRALES
- Réponds UNIQUEMENT par un bloc de code JSON. Aucun texte avant ou après.
- Reprends le "name" de chaque aliment EXACTEMENT tel qu'il figure dans le fichier (à la casse/accents près),
  pour que Digestor le retrouve.
- Ne renvoie QUE le nom et le bloc "amines". NE recopie PAS les autres champs (FODMAP, sibo, candida, tips…) :
  Digestor les conserve tout seul.
- HONNÊTETÉ : la teneur en amines est très variable (fraîcheur, affinage, conservation). Ne renseigne un niveau
  que lorsqu'il y a un vrai signal. Si tu n'es pas sûr, mets "unknown" ou OMETS le champ. N'invente pas.
- N'inclus dans la sortie que les aliments qui ont un profil d'amines NOTABLE (au moins un niveau modéré/élevé,
  ou un mécanisme : libérateur / inhibiteur DAO ou MAO / fermenté). Laisse de côté les aliments clairement
  négligeables (légumes frais, riz, eau…) : inutile de les lister.

QUELLES AMINES / QUELS SIGNAUX
- Histamine ↑ : fermentés/affinés (fromages affinés, charcuterie sèche, choucroute, miso, sauce soja, kombucha,
  vinaigres), poissons semi-conserves/mal conservés (thon, maquereau, sardine, anchois), alcools fermentés.
- Tyramine ↑ : monte avec l'affinage (fromages affinés, charcuterie, extraits de levure, fèves, bananes très mûres).
- Putrescine/cadavérine ↑ : marqueurs de fraîcheur (aliments peu frais / en début de décomposition), agrumes.
- histamineLiberator : déclenche la libération d'histamine endogène même sans en contenir (fraise, agrumes,
  ananas, tomate, chocolat, blanc d'œuf, crustacés, additifs).
- daoInhibitor : freine la DAO (alcool, thé/café, cacao).
- maoInhibitor : freine la MAO → tyramine (réglisse, curcuma, fruit de la passion).
- fermented : aliment fermenté ou affiné. freshnessDependent : teneur qui dépend fortement de la fraîcheur.

FORMAT DE SORTIE
\`\`\`json
{
  "app": "digestor",
  "type": "food-reference",
  "foods": [
    {
      "name": "Roquefort",
      "amines": {
        "level": "high",
        "histamine": "high",
        "tyramine": "high",
        "putrescineCadaverine": "moderate",
        "histamineLiberator": false,
        "daoInhibitor": false,
        "maoInhibitor": false,
        "fermented": true,
        "freshnessDependent": false,
        "note": "Fromage bleu affiné : histamine et tyramine élevées."
      }
    },
    {
      "name": "Banane",
      "amines": {
        "level": "moderate",
        "tyramine": "low",
        "putrescineCadaverine": "low",
        "histamineLiberator": true,
        "freshnessDependent": true,
        "note": "Histamino-libératrice ; plus riche si très mûre."
      }
    }
  ]
}
\`\`\`
Champs de "amines" : "level" (global, low|moderate|high), "histamine"/"tyramine"/"putrescineCadaverine"
(low|moderate|high, omets si négligeable/incertain), "histamineLiberator"/"daoInhibitor"/"maoInhibitor"/
"fermented"/"freshnessDependent" (true/false), "note" (1 phrase, précise l'amine en cause).
Si la liste d'aliments est longue, tu peux la traiter en plusieurs réponses JSON successives (chacune un bloc
complet et valide) — Digestor les importe l'une après l'autre.`;
