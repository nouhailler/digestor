import { normalize } from './foodClassifier';

/**
 * Fiches encyclopédiques détaillées des principales amines biogènes impliquées
 * dans les intolérances alimentaires. Contenu statique (markdown léger, rendu par
 * le composant `Markdown`), informatif et non médical.
 */
export interface AmineArticle {
  name: string;
  summary: string; // repère court (liste de l'encyclopédie)
  markdown: string; // contenu détaillé
}

const HISTAMINE = `## ❓ 1. Qu'est-ce que l'histamine ?
L'histamine (ou 2-(imidazol-4-yl)éthanamine) est une amine biogène dérivée de l'acide aminé L-histidine. C'est un composé ubiquitaire aux fonctions multiples :

- Médiateur clé de l'inflammation allergique et des réactions d'hypersensibilité immédiate.
- Neurotransmetteur central impliqué dans l'éveil, la vigilance, la régulation de l'appétit et de la température corporelle.
- Stimulant de la sécrétion gastrique acide.
- Amine vasoactive majeure, également présente dans de nombreux aliments, où sa dégradation insuffisante peut provoquer des tableaux d'intolérance ou d'intoxication.

L'histamine est stockée dans les mastocytes et les basophiles, et peut être libérée massivement lors d'une réaction allergique IgE-dépendante.

## 🧪 2. Structure et propriétés chimiques
- **Nom IUPAC** : 2-(1H-imidazol-4-yl)éthanamine
- **Formule brute** : C₅H₉N₃
- **Masse molaire** : 111,15 g/mol
- **Structure** : un noyau imidazole substitué en position 4 par une chaîne éthylamine (cycle aromatique azoté à 5 chaînons, deux atomes d'azote).
- **Aspect** : solide blanc à jaunâtre, hygroscopique, photosensible.
- **Point de fusion** : 83–84 °C (base libre) ; ses sels (dichlorhydrate, phosphate) fondent plus haut.
- **Solubilité** : très soluble dans l'eau, l'éthanol, le méthanol chaud ; faiblement soluble dans les solvants apolaires.
- **Propriétés acido-basiques** : pKa₁ ~ 6,0 (azote de l'imidazole) et pKa₂ ~ 9,8 (amine primaire). Au pH physiologique (7,4), ~ 96 % est sous forme monocationique.
- **Stabilité** : se dégrade lentement à la lumière et à la chaleur ; relativement stable en milieu acide.

## 🧬 3. Biosynthèse
La synthèse se fait par décarboxylation de la L-histidine, catalysée par l'**histidine décarboxylase (HDC)** :

- **Cellules de mammifères** : HDC présente dans les mastocytes, basophiles, cellules ECL de la muqueuse gastrique, neurones histaminergiques de l'hypothalamus, certaines cellules immunitaires. Cofacteur : phosphate de pyridoxal (vitamine B6).
- **Micro-organismes** : de nombreuses bactéries (lactobacilles, entérobactéries, Morganella, Photobacterium…) possèdent une histidine décarboxylase active à pH acide ou neutre. Cette voie explique l'accumulation d'histamine dans les aliments fermentés ou mal conservés, en particulier les produits de la pêche.

La régulation de l'HDC est transcriptionnelle ; elle est induite par des stimuli inflammatoires et des cytokines. Une fois synthétisée, l'histamine est stockée dans des granules ou libérée.

## 📍 4. Stockage et localisation
- **Mastocytes et basophiles** : granules liés à des protéoglycanes (héparine). Réservoir principal des allergies.
- **Cellules ECL de l'estomac** : productrices d'histamine gastrique en réponse à la gastrine ; stimulent la sécrétion acide par les cellules pariétales.
- **Neurones histaminergiques** : noyau tubéromamillaire de l'hypothalamus postérieur, projetant dans tout le SNC (éveil, appétit, cognition).
- **Autres** : plaquettes, cellules dendritiques, monocytes/macrophages, en plus faible quantité.

## 🍽️ 5. Présence dans les aliments
L'histamine s'accumule dans les aliments riches en protéines par décarboxylation bactérienne de l'histidine (mauvaise conservation, fermentations non maîtrisées). **La cuisson ne détruit pas l'histamine une fois formée.**

| Aliment | Histamine (mg/kg) |
| --- | --- |
| Poissons (thon, maquereau, bonite, sardine, anchois, hareng) mal conservés | 0 – >10 000 (intoxication dès 200–500) |
| Fromages affinés (cheddar, emmental, gouda, parmesan, roquefort) | 10 – 2 500 |
| Charcuteries fermentées/séchées (salami, saucisson) | 0 – 600 |
| Vin rouge | 0,5 – 30 |
| Vin blanc, champagne | < 10 |
| Bière | 0,5 – 20 |
| Choucroute, kimchi | 0 – 250 |
| Sauce soja, nuoc-mâm | 10 – 1 000 |
| Vinaigre, aliments vinaigrés | traces à 50 |
| Chocolat, cacao | 1 – 20 |

Les poissons sont la première cause d'intoxication histaminique (scombroïdose). La réglementation européenne fixe un seuil de 100–200 mg/kg dans les produits de la pêche (200 pour les Scombridae, 100 pour les autres). Certains aliments sont **histamino-libérateurs** sans être histaminés (blanc d'œuf cru, agrumes, fraises, fruits à coque).

## ♻️ 6. Métabolisme et dégradation
Deux voies enzymatiques principales :

### a) Méthylation (voie tissulaire dominante)
- Enzyme : **histamine N-méthyltransférase (HNMT)**, cytosolique (foie, rein, poumon, cerveau, intestin).
- Produit : N-méthylhistamine, oxydée par la MAO-B en acide N-méthylimidazole acétique (urine).

### b) Désamination oxydative (voie intestinale et circulante)
- Enzyme : **diamine oxydase (DAO)** (ancienne « histaminase »), sécrétée par les entérocytes ; première barrière contre l'histamine alimentaire.
- Produit : imidazole acétaldéhyde → acide imidazole acétique (urine).

L'efficacité dépend de la génétique, de certaines maladies et de nombreux médicaments. **Un déficit en DAO est un mécanisme clé de l'intolérance à l'histamine.**

## ⚙️ 7. Récepteurs et effets physiologiques
Quatre récepteurs couplés aux protéines G : H₁, H₂, H₃, H₄.

### Récepteur H₁
- **Localisation** : muscle lisse (bronches, vaisseaux), endothélium, terminaisons sensorielles, peau. Couplé à Gαq (↑ Ca²⁺).
- **Effets** : vasodilatation et ↑ perméabilité capillaire (œdème, urticaire), bronchoconstriction, prurit/éternuements/douleur, maintien de l'éveil (les anti-H1 de 1ʳᵉ génération sont sédatifs).

### Récepteur H₂
- **Localisation** : cellules pariétales gastriques, muscle lisse vasculaire, cœur. Couplé à Gαs (↑ AMPc).
- **Effets** : sécrétion d'acide gastrique, relaxation vasculaire, effet inotrope/chronotrope positif modeste, rétrocontrôle négatif sur la libération mastocytaire.

### Récepteur H₃
- **Localisation** : surtout présynaptique dans le SNC. Couplé à Gαi/o (↓ AMPc).
- **Effets** : autorécepteur inhibant synthèse/libération d'histamine ; module d'autres neurotransmetteurs ; régulation veille-sommeil, appétit, cognition (cible pour la narcolepsie).

### Récepteur H₄
- **Localisation** : cellules hématopoïétiques (éosinophiles, mastocytes, lymphocytes T…). Couplé à Gαi/o.
- **Effets** : chimiotactisme et activation immunitaire, inflammation chronique, prurit, asthme (antihistaminiques expérimentaux).

## ⚠️ 8. Intolérance à l'histamine (HIT)
« Pseudo-allergie histaminique » : déséquilibre entre apport/libération et capacité de dégradation.

**Causes** :
- Déficit en DAO : génétique (polymorphismes AOC1), acquis (MICI, cœliaquie, SII, insuffisance hépatique), ou inhibition médicamenteuse.
- Apport excessif d'histamine et d'amines biogènes.
- Compétition par d'autres amines (putrescine, cadavérine, tyramine) saturant la DAO.
- Hyperperméabilité intestinale ; libération accrue (aliments histamino-libérateurs, mastocytose).

**Symptômes (polymorphes)** :
- Cutanés : érythème, flush, urticaire, prurit.
- Digestifs : douleurs, ballonnements, diarrhée, nausées.
- Cardiovasculaires : hypotension, tachycardie, palpitations.
- Respiratoires : rhinorrhée, congestion, éternuements.
- Neurologiques : céphalées, migraines, vertiges. Parfois troubles menstruels, fatigue.

Les symptômes surviennent des minutes à quelques heures après un repas riche en histamine. Le diagnostic repose sur l'amélioration sous régime pauvre en histamine ; le dosage de la DAO et de l'histamine peut aider (marqueurs non standardisés).

**Aliments à éviter/limiter** : poissons en conserve/fumés/marinés ; fromages affinés ; charcuteries ; fermentés (choucroute, kimchi, miso, sauce soja, tempeh, vinaigre) ; alcool (le vin rouge, la bière ; l'alcool inhibe aussi la DAO) ; fruits histamino-libérateurs (agrumes, fraises, bananes, ananas, papaye) ; tomates, épinards, aubergine ; chocolat ; additifs (sulfites, benzoates).

## 🤧 9. Allergies IgE-médiées
Dans l'allergie de type I, l'histamine est le principal médiateur préformé libéré par les mastocytes/basophiles lors du pontage des IgE (récepteur FcεRI).

- **Réactions locales** : rhinite, conjonctivite, urticaire, asthme.
- **Réaction systémique** : anaphylaxie (vasodilatation massive, hypotension, bronchospasme) → choc anaphylactique potentiellement mortel.

Effets via H₁ (œdème, bronchospasme) et partiellement H₂. Le traitement de l'anaphylaxie repose sur l'**adrénaline** (effet inverse sur vaisseaux et bronches), les antihistaminiques en adjuvant.

## 💊 10. Interactions médicamenteuses
**Inhibiteurs de la DAO** (↑ risque d'HIT) : isoniazide, doxycycline, acétylcystéine, ambroxol, propafénone, certains tricycliques et IMAO, propofol/thiopental, morphine/codéine/tramadol, vérapamil, **alcool** (inhibiteur puissant + ↑ perméabilité).

**Histamino-libérateurs** (dégranulation non IgE) : opiacés, curares (atracurium…), produits de contraste iodés, vancomycine (« homme rouge »), polymyxine B.

**Antihistaminiques** : anti-H₁ (cétirizine, loratadine, fexofénadine…) = base du traitement allergique ; 1ʳᵉ génération (diphénhydramine, hydroxyzine) sédatifs. Anti-H₂ (cimétidine, famotidine) = ↓ sécrétion acide (ulcère, reflux).

## 🧠 11. Rôle dans le système nerveux central
Neurotransmetteur majeur de l'éveil : les neurones du noyau tubéromamillaire sont actifs à l'éveil, silencieux en sommeil paradoxal. Le blocage des H₁ centraux entraîne une sédation. L'histamine régule aussi l'appétit (anorexigène), la thermorégulation, l'apprentissage, la douleur. Les antagonistes H₃ (piste pour narcolepsie, TDAH, Alzheimer) augmentent la libération d'histamine.

## 🏥 12. Pathologies spécifiques
- **Gastrinome (Zollinger-Ellison)** : ↑ gastrine → hyperplasie ECL → histamine gastrique chronique, ulcères.
- **Mastocytose** : prolifération mastocytaire, libération excessive (flush, prurit, douleurs, ulcères, ostéoporose) ; diagnostic par tryptase et métabolites urinaires.
- **Leucémie myéloïde chronique / néoplasies** : production accrue par les basophiles.
- **Intoxication histaminique (scombroïdose)** : poisson à très haute teneur → flush, céphalées, nausées, diarrhée, palpitations. Résolution rapide sous antihistaminiques.

## 🔬 13. Dosages et tests
- **Histamine plasmatique** : demi-vie très courte (5–10 min), prélever vite et sur glace. Élevée dans l'anaphylaxie, la mastocytose.
- **Métabolites urinaires** : acide N-méthylimidazole acétique (24 h).
- **Tryptase sérique** : plus stable, aide au diagnostic d'anaphylaxie/mastocytose.
- **Activité DAO plasmatique** : suspicion d'HIT (corrélation imparfaite).
- **Tests cutanés** : histamine = témoin positif du prick test.

## 📜 14. Usage médical et histoire
La bétahistine (agoniste H₁ faible / antagoniste H₃) est utilisée dans la maladie de Ménière. Découverte : synthétisée en 1907 (Windaus & Vogt), isolée en 1910 (Dale & Laidlaw). Premiers antihistaminiques dans les années 1940 (Bovet, Nobel 1957) ; anti-H₂ dans les années 1970 (James Black, cimétidine) ; récepteurs H₃ et H₄ clonés en 1999–2000.

## ✅ En résumé
L'histamine est une amine biogène omniprésente, pivot de l'allergie immédiate, de la sécrétion acide gastrique et de l'éveil. Sa double origine (endogène et alimentaire), la multiplicité de ses récepteurs et son catabolisme enzymatique fragile en font un sujet à la croisée de l'allergologie, de la neurologie, de la gastro-entérologie et de la nutrition.`;

const TYRAMINE = `## ❓ 1. Qu'est-ce que la tyramine ?
La tyramine (ou 4-hydroxyphénéthylamine) est une amine biogène dérivée de la tyrosine, de la famille des amines traces. Elle est surtout connue pour son implication dans les crises hypertensives sous IMAO — le fameux « effet fromage » — et comme déclencheur possible de migraines.

## 🧪 2. Structure et propriétés chimiques
- **Nom IUPAC** : 4-(2-aminoéthyl)phénol
- **Formule brute** : C₈H₁₁NO — **Masse molaire** : 137,18 g/mol
- **Structure** : cycle benzénique avec un hydroxyle en para et une chaîne éthylamine.
- **Aspect** : solide cristallin incolore à jaunâtre. **Point de fusion** : ~ 160–162 °C.
- **Solubilité** : soluble dans l'eau, l'éthanol, le méthanol ; peu soluble dans les solvants apolaires.
- **pKa** : ~ 9,3 (amine) et 10,9 (phénol) — surtout protonée au pH physiologique.

## 🧬 3. Biosynthèse
Décarboxylation de la L-tyrosine :
- **Micro-organismes** : de nombreuses bactéries (lactobacilles, entérocoques) ont une tyrosine décarboxylase → principale source dans les aliments fermentés et l'intestin.
- **Humain** : la décarboxylase des acides aminés aromatiques (AADC) peut produire un peu de tyramine ; le microbiote intestinal en synthétise à partir de la tyrosine alimentaire.

Chez les invertébrés, la tyramine est un neurotransmetteur (comme l'octopamine).

## 🍽️ 4. Présence dans les aliments
La tyramine s'accumule lors de la dégradation protéique (vieillissement, fermentation, putréfaction). Elle **résiste à la cuisson et à la congélation**.

| Aliment | Tyramine (mg/kg) |
| --- | --- |
| Fromages à pâte dure/affinés (cheddar, parmesan, gruyère, bleu) | 100 – 1500+ |
| Fromages frais (ricotta, cottage, fromage à la crème) | < 10 |
| Charcuteries fermentées/séchées | 20 – 300 |
| Poisson fumé, mariné, en conserve (hareng, anchois) | 0 – 400 |
| Bière pression (artisanale, refermentée) | 1 – 20 |
| Bière en bouteille/canette | < 5 |
| Vin rouge | 1 – 10 |
| Sauce soja, miso, tempeh | 10 – 2000 |
| Choucroute, kimchi | 10 – 250 |
| Extraits de levure (Marmite, Vegemite) | 500 – 2000 |
| Fruits très mûrs (bananes, avocats) | 10 – 50 |

Les fromages au lait cru longuement affinés et les fermentés asiatiques sont parmi les plus riches ; les aliments frais en contiennent très peu.

## ♻️ 5. Métabolisme normal
Normalement, la tyramine ingérée est dégradée avant d'atteindre la circulation :
- **Intestin et foie** : la **MAO-A** oxyde la tyramine en 4-hydroxyphénylacétaldéhyde → acide 4-hydroxyphénylacétique (urine). Ce puissant « premier passage » fait qu'un repas riche en tyramine n'augmente quasiment pas sa concentration plasmatique chez une personne saine.
- Une fraction circulante peut être convertie en octopamine par la dopamine β-hydroxylase.

## ⚙️ 6. Mécanisme d'action
La tyramine est un **sympathomimétique indirect** :
- Captée par le transporteur de la noradrénaline (NET) dans les terminaisons sympathiques.
- Elle déplace la noradrénaline (et un peu de dopamine) des vésicules vers le cytoplasme.
- La noradrénaline est libérée massivement → stimulation adrénergique, vasoconstriction, ↑ pression artérielle.

Quand les MAO sont inhibées, ce mécanisme n'est plus contré → élévations brutales et dangereuses de la pression (crise hypertensive, risque d'hémorragie cérébrale, d'infarctus, d'œdème pulmonaire). L'effet vasoconstricteur est aussi évoqué comme déclencheur de migraines.

## 💊 7. Interactions : le « cheese effect »
- **IMAO irréversibles non sélectifs** (phénelzine, tranylcypromine, isocarboxazide) : régime pauvre en tyramine strict **obligatoire**.
- **IMAO-B sélectifs** (sélégiline, rasagiline) : aux doses de la maladie de Parkinson, la MAO-A intestinale reste fonctionnelle → pas de « cheese effect » (sauf fortes doses ou patch transdermique).
- **IMAO-A réversibles** (moclobémide) : risque bien moindre, mais éviter de très grandes quantités en une prise.
- **Autres** : linézolide (IMAO faible), sympathomimétiques (éphédrine, pseudoéphédrine, amphétamines) à éviter avec les IMAO.

## 🧀 8. Aliments à éviter sous IMAO
Fromages affinés (seuls les frais non affinés sont autorisés) ; charcuteries fermentées/séchées ; poissons marinés/fumés/fermentés (nuoc-mâm) ; soja fermenté (miso, sauce soja, tempeh — le tofu frais est autorisé) ; choucroute, kimchi ; extraits de levure ; **bière pression** (risque majeur ; la bière en bouteille est généralement pauvre) ; vin rouge en excès ; fruits très mûrs. Le chocolat n'en contient que des traces (longtemps déconseillé par prudence).

## 🤕 9. Tyramine et migraine
En dehors des IMAO, la tyramine est un déclencheur connu chez certaines personnes ayant un déficit partiel en MAO ou une sensibilité vasculaire. Un régime pauvre en tyramine peut être proposé dans les migraines résistantes (résultats variables).

## 🧠 10. Amine trace cérébrale
Synthétisée en faible quantité, la tyramine agit sur les récepteurs associés aux amines traces (**TAAR1**), modulant les transmissions dopaminergique, noradrénergique et sérotoninergique — rôle possible dans l'humeur, l'attention, la motricité. Étudiée dans la schizophrénie et la dépression.

## 🔬 11. Détection et histoire
Dosage par HPLC (UV, fluorescence, spectrométrie de masse) ; kits ELISA pour les aliments ; acide 4-hydroxyphénylacétique urinaire comme reflet d'exposition. Pas de teneur maximale réglementaire. Le lien fromage ↔ crise hypertensive sous IMAO a été identifié dans les années 1960 par Barry Blackwell.

## ✅ En résumé
La tyramine est ubiquitaire dans les aliments fermentés/vieillis, normalement dégradée efficacement par les MAO. Son caractère sympathomimétique indirect n'expose à un risque vital que si ce système est inhibé, mais elle reste un facteur alimentaire à considérer dans les migraines.`;

const PHENYLETHYLAMINE = `## ❓ 1. Qu'est-ce que la phényléthylamine ?
La phényléthylamine (β-phényléthylamine, PEA) est une amine trace endogène, la plus simple des phénéthylamines (cycle benzénique + chaîne éthylamine). Présente dans le cerveau (neuromodulateur rapide à demi-vie très courte) et dans certains aliments (chocolat, fromages, vin), d'où sa réputation de « molécule de l'amour ». Son squelette est à la base des amphétamines, de la MDMA, de la mescaline et de nombreux médicaments.

## 🧪 2. Structure et propriétés chimiques
- **Nom IUPAC** : 2-phényléthylamine — **Formule brute** : C₈H₁₁N — **Masse molaire** : 121,18 g/mol
- **Structure** : cycle benzénique non substitué + groupe aminoéthyle. Archétype des phénéthylamines.
- **Aspect** : liquide incolore à jaunâtre, très volatil ; **odeur** « de poisson ».
- **Point d'ébullition** : 197–200 °C. **Point de fusion** : ~ –60 °C (liquide à température ambiante ; le chlorhydrate fond vers 217 °C).
- **Solubilité** : peu soluble dans l'eau (base libre), très soluble dans les solvants organiques ; le chlorhydrate est très hydrosoluble.
- **pKa** : ~ 9,8 — presque entièrement protonée au pH physiologique.

## 🧬 3. Biosynthèse
Décarboxylation de la L-phénylalanine par la **décarboxylase des acides aminés aromatiques (AADC)**.
- **Cerveau** : synthèse très faible (la phénylalanine est surtout hydroxylée en tyrosine). La PEA formée est stockée via le VMAT2 ou dégradée immédiatement.
- **Micro-organismes** : phénylalanine décarboxylase → accumulation dans fromages affinés, cacao, charcuteries.

## 🍽️ 4. Présence dans les aliments
Formée par décarboxylation microbienne/enzymatique dans les aliments fermentés/affinés. Thermostable.

| Aliment | PEA (mg/kg) |
| --- | --- |
| Chocolat (cacao) | 5 – 50 (jusqu'à 100) |
| Fromages affinés (cheddar, gouda, parmesan, bleu) | 10 – 200+ |
| Fromages à pâte molle (camembert, brie) | 1 – 30 |
| Charcuteries fermentées/séchées | 0 – 100 |
| Vin rouge | 0,5 – 15 |
| Bière | 0,5 – 10 |
| Sauce soja, miso | 1 – 50 |

Le chocolat est le plus médiatisé, mais les quantités absorbées sont très faibles et rapidement dégradées, insuffisantes pour un effet psychoactif franc (sauf déficit en MAO-B).

## ♻️ 5. Métabolisme et dégradation
La PEA est l'une des amines traces les plus rapidement dégradées :
### a) Désamination oxydative (voie principale)
- Enzyme : **MAO-B** (la MAO-A avec faible affinité). PEA → phénylacétaldéhyde → **acide phénylacétique (PAA)**, conjugué en phénylacétylglutamine (urine).
- **Demi-vie plasmatique** : ~ 30 secondes à 5 minutes.

### b) N-méthylation (mineure)
La PNMT peut N-méthyler la PEA en N-méthylphényléthylamine (plus stimulante) — négligeable en conditions physiologiques.

**Conséquence** : par voie orale, la PEA est presque entièrement dégradée par les MAO-B avant la circulation → effet quasi nul sans inhibiteur de MAO-B (sélégiline).

## ⚙️ 6. Mécanisme d'action
Sympathomimétique indirect :
- Substrat des transporteurs NET et DAT ; captée par le VMAT2, elle déplace les catécholamines (noradrénaline, dopamine) → libération dans la fente synaptique.
- **Agoniste prototypique de TAAR1** (Gαs, ↑ AMPc) dans les neurones dopaminergiques/noradrénergiques/sérotoninergiques.
- **Périphérie** : vasoconstriction indirecte → ↑ pression, tachycardie ; à forte dose : palpitations, sueurs, mydriase, agitation.
- **Centre** : traverse la barrière hémato-encéphalique ; effets stimulants brefs proches des amphétamines (vigilance, humeur, ↓ appétit, légère euphorie).

## 🧠 7. « Molécule de l'amour » et dépression
- **« Molécule de l'amour »** : idée popularisée par Michael Liebowitz (années 1980) — PEA du chocolat et sentiment amoureux. Observations controversées, non solidement répliquées.
- **Dépression** : baisse de PEA/PAA urinaire rapportée dans la dépression endogène ; effets antidépresseurs possibles de la sélégiline ou de la phénylalanine (+ B6) dans certaines études ouvertes.
- Autres fonctions : attention, mémoire, réponse au stress ; étudiée dans schizophrénie, TDAH, Alzheimer.

## 🤕 8. Phényléthylamine et migraine
Parfois citée comme déclencheur : la PEA est vasoactive ; un défaut de dégradation par la MAO-B a été trouvé chez des migraineux. Le chocolat contient aussi tyramine, théobromine et caféine → imputation difficile. Rôle mal établi, probablement multifactoriel.

## 💊 9. Interactions et risques
- **IMAO non sélectifs** : la dégradation de la PEA est bloquée y compris dans l'intestin → un apport important peut provoquer une crise hypertensive (mécanisme noradrénergique/dopaminergique), similaire à l'« effet fromage ».
- **IMAO-B sélectifs** (sélégiline, rasagiline) : réduisent la dégradation hépatique/centrale ; risque à fortes doses ou en patch. La sélégiline est parfois détournée avec de la PEA (dangereux).
- **Sympathomimétiques** : addition des effets cardiovasculaires. **Alcool** : ↑ passage intestinal.
- **Phénylcétonurie** : accumulation de phénylalanine → production accrue de PEA ; le régime strict la réduit.

## 💉 10. Complément alimentaire et sport
La PEA orale est très peu biodisponible (dégradation MAO-B) → effets souvent nuls à 300–500 mg, sauf activité MAO-B basse. Certains produits l'associent à des inhibiteurs de MAO-B (hordénine, Citrus aurantium) — pratique risquée et non validée. Précurseur illicite d'amphétamines. Usage stimulant déconseillé (risque cardiovasculaire).

## 🔬 11. Détection et histoire
Dosage de l'acide phénylacétique urinaire (0,5–5 mg/24 h) ou par LC-MS/MS. Synthétisée en 1873 (Nicolae Teclu) ; a inspiré l'amphétamine (Edeleanu, 1887) ; TAAR1 identifié en 2001.

## ✅ En résumé
La PEA est une amine trace endogène et alimentaire, squelette des amphétamines, au métabolisme ultra-rapide par la MAO-B. Sympathomimétique indirect et neuromodulateur central (humeur, éveil, migraine), elle a peu d'impact consommée normalement, mais son accumulation (IMAO, prédispositions) peut être à risque.`;

const TRYPTAMINE = `## ❓ 1. Qu'est-ce que la tryptamine ?
La tryptamine (2-(indol-3-yl)éthanamine) est une amine biogène et une amine trace dérivée du L-tryptophane (noyau indole + chaîne éthylamine). C'est le **squelette fondamental** d'une vaste famille : la **sérotonine**, la **mélatonine**, les tryptamines psychédéliques (DMT, psilocybine, bufoténine, 5-MeO-DMT) et de nombreux alcaloïdes végétaux. Présente à l'état de traces dans le cerveau (neuromodulateur), dans l'alimentation et produite par le microbiote intestinal.

## 🧪 2. Structure et propriétés chimiques
- **Nom IUPAC** : 2-(1H-indol-3-yl)éthanamine — **Formule brute** : C₁₀H₁₂N₂ — **Masse molaire** : 160,22 g/mol
- **Structure** : noyau indole (benzène fusionné à un pyrrole) substitué en position 3 par une chaîne éthylamine.
- **Aspect** : solide cristallin blanc à jaune pâle, brunissant à l'air. **Point de fusion** : 113–115 °C.
- **Solubilité** : peu soluble dans l'eau, très soluble dans l'éthanol, le méthanol, le chloroforme.
- **pKa** : ~ 10,0 (amine). Majoritairement cationique au pH 7,4.
- **Fluorescence** naturelle (indole) utile pour la détection.

## 🧬 3. Biosynthèse
Décarboxylation du L-tryptophane par l'**AADC** (cofacteur B6) :
- **Mammifères** : neurones monoaminergiques, foie, reins ; faibles quantités, stockées via le VMAT2.
- **Microbiote intestinal** : de nombreuses bactéries (clostridies, Bacteroides, Lactobacillus…) → tryptamine agissant localement ou absorbée.
- **Plantes/champignons** : intermédiaire clé des alcaloïdes indoliques ; méthylée en NMT, DMT, puis hydroxylée (psilocine, bufoténine).

## 🍽️ 4. Présence dans les aliments
Présente dans les aliments protéinés fermentés/affinés, souvent avec d'autres amines. Thermostable.

| Aliment | Tryptamine (mg/kg) |
| --- | --- |
| Fromages affinés (cheddar, gouda, emmental, roquefort) | 10 – 150 (jusqu'à 300) |
| Charcuteries fermentées/séchées | 10 – 100 |
| Sauce soja, miso, tempeh | 10 – 80 |
| Vin rouge | 0,1 – 15 |
| Choucroute, kimchi | 1 – 40 |
| Tomates, bananes, ananas (mûrs) | 1 – 20 |
| Chocolat / cacao | 1 – 10 |

## ♻️ 5. Métabolisme et dégradation
Proche de celui de la sérotonine, sans l'étape d'hydroxylation :
- **MAO-A** (voie principale) : tryptamine → indole-3-acétaldéhyde → **acide indole-3-acétique (IAA)** (urine), ou → tryptophol.
- **Demi-vie** très courte (quelques minutes) → administration orale peu efficace sans inhibition des MAO.
- Excrétion d'IAA : ~ 1–8 mg/24 h.

## ⚙️ 6. Récepteurs et mécanisme
- **TAAR** : agoniste puissant de **TAAR1** (Gαs, ↑ AMPc) — module la neurotransmission monoaminergique. TAAR5 sensible aux amines à odeur de poisson (olfaction).
- **Récepteurs 5-HT** : agoniste (partiel/total) de plusieurs sous-types — 5-HT₁A (anxiolyse, hypothermie), 5-HT₂A (les dérivés N-méthylés comme DMT/psilocine y produisent les effets psychédéliques).
- **Transporteurs** : substrat du SERT → sérotoninomimétique indirect (faible).
- **Récepteur AhR** : la tryptamine et ses métabolites (microbiote) sont des ligands de l'AhR, important pour l'immunité intestinale et la barrière épithéliale.

## 🧠 7. Rôle dans le SNC et effets
- **Neuromodulation** : traces (quelques ng/g) ; module la transmission sérotoninergique via TAAR1. L'inhibition de la MAO-A augmente fortement les taux (effets comportementaux).
- **Sommeil/température** : hypothermie et ↑ sommeil lent profond (via 5-HT₁A).
- **Comportement alimentaire** : participation à la satiété.
- **Périphérie** : légère vasodilatation à faible dose ; contraction utérine/intestinale/bronchique (5-HT₂A, 5-HT₃).

## 🌿 8. L'univers des tryptamines
- **Neurotransmetteurs/hormones** : sérotonine (5-HT), mélatonine.
- **Psychédéliques** : DMT, psilocybine/psilocine, bufoténine, 5-MeO-DMT.
- **Alcaloïdes végétaux** : ibogaïne, yohimbine, alcaloïdes de l'ergot (précurseurs du LSD), mitragynine (kratom).
- **Médicaments** : triptans (5-HT₁B/₁D, migraine), prucalopride (5-HT₄), ondansétron (5-HT₃), vortioxétine.

## 💊 9. Interactions et risque
- **IMAO** : bloquent la dégradation → un apport d'aliments riches en tryptamine ou de tryptophane peut provoquer un **syndrome sérotoninergique**.
- **Autres sérotoninergiques** (ISRS, IRSN, tricycliques, tramadol, millepertuis, lithium) : risque potentialisé.
- **Antibiotiques/microbiote** : modifient la production périphérique (axe intestin-cerveau).

## 🏥 10. Pathologie humaine
- **Intolérance aux amines / migraine** : incriminée chez les sujets sensibles (déficit MAO).
- **Dépression** : perturbations des amines traces ; supplémentation en tryptophane aux bénéfices modestes.
- **Schizophrénie** : anciennes théories des « psychotogènes endogènes » (DMT, bufoténine) abandonnées ; rôle via TAAR1 étudié (agonistes TAAR1 en essai comme antipsychotiques).
- **Maladies intestinales** : la tryptamine du microbiote active l'AhR (barrière intestinale, immunité) — piste dans les MICI.

## 🔬 11. Détection et histoire
HPLC fluorimétrique, LC-MS/MS ; IAA urinaire (1–8 mg/24 h). Synthétisée en 1893 (von Baeyer) ; parenté avec la sérotonine (1948) ; théorie « molécule de la schizophrénie » (années 1960) ; TAAR découverts en 2001 ; essais psychédéliques (psilocybine) depuis 2010.

## ✅ En résumé
La tryptamine est le chaînon central de tout un univers de neurotransmetteurs, hormones, psychédéliques et médicaments. Amine trace au métabolisme éclair par la MAO-A, ligand des TAAR et des récepteurs 5-HT, produite par le microbiote : un acteur polyvalent à l'interface neurologie / psychiatrie / nutrition / gastro-entérologie.`;

const PUTRESCINE = `## ❓ 1. Qu'est-ce que la putrescine ?
La putrescine (1,4-diaminobutane) est une diamine aliphatique du groupe des amines biogènes et des **polyamines**, présente chez tous les êtres vivants (croissance, prolifération cellulaire, stabilisation de l'ADN). Elle est connue pour son odeur de viande en décomposition, sa présence dans les aliments fermentés/altérés (indicateur de fraîcheur), et son rôle de précurseur de la spermidine et de la spermine.

## 🧪 2. Structure et propriétés chimiques
- **Nom IUPAC** : butane-1,4-diamine — **Formule brute** : C₄H₁₂N₂ — **Masse molaire** : 88,15 g/mol
- **Structure** : chaîne linéaire à 4 carbones, amine primaire à chaque extrémité.
- **Aspect** : liquide incolore (se solidifie au frais, fusion ~ 27 °C) ; **odeur** de poisson pourri.
- **Point d'ébullition** : 158–160 °C.
- **pKa** : ~ 9,3 et ~ 10,8 — **doublement protonée** au pH physiologique (ne traverse pas passivement les membranes).

## 🧬 3. Biosynthèse
### a) Décarboxylation de l'ornithine (voie ubiquitaire)
Enzyme : **ornithine décarboxylase (ODC)**, cytosolique, B6-dépendante. L-ornithine → putrescine + CO₂. L'ODC a une demi-vie très courte, finement régulée (antizyme) ; son activité augmente avec les facteurs de croissance, les promoteurs tumoraux, la régénération.
### b) Voie de l'agmatine (plantes, bactéries ; un peu chez les mammifères)
Arginine → agmatine (ADC) → putrescine + urée (agmatinase).
### c) Synthèse bactérienne
Entérocoques, lactobacilles, entérobactéries → grandes quantités (résistance au pH acide) → teneur élevée des aliments fermentés et du contenu intestinal.

## 🍽️ 4. Présence dans les aliments
Marqueur de fraîcheur : une teneur élevée signale une altération microbienne. Résiste à la cuisson et à la congélation.

| Aliment | Putrescine (mg/kg) |
| --- | --- |
| Fromages affinés | 10 – 1 500 |
| Charcuteries fermentées/séchées | 20 – 600 |
| Viande fraîche bien conservée | < 5 |
| Poissons mal conservés | 50 – 1 000+ |
| Sauce soja, miso | 10 – 400 |
| Vin rouge | 5 – 50 |
| Choucroute, kimchi | 10 – 250 |
| Agrumes | 5 – 100 |

Souvent accompagnée de cadavérine, d'histamine et de tyramine (« indice biogénique » de qualité sanitaire).

## ♻️ 5. Métabolisme chez l'homme
- **Absorption** intestinale (transporteurs de polyamines) ; une partie dégradée par la **DAO** intestinale.
- **Désamination oxydative (DAO)** : putrescine → GABA-aldéhyde → **GABA** (neurotransmetteur inhibiteur) — la putrescine est un précurseur direct du GABA dans les tissus exprimant la DAO.
- **Acétylation** (SSAT) → N-acétylputrescine (urine).
- **Transformation en polyamines** : putrescine → spermidine → spermine (voie anabolique essentielle à la croissance).
- **Demi-vie** courte (< 1 h).

## ⚙️ 6. Rôles physiologiques
- **Synthèse des polyamines** (fonction majeure) : indispensables à la prolifération, la stabilisation de la chromatine, la traduction (hypusination d'eIF5A), la modulation des canaux ioniques.
- **Neurotransmission GABAergique** : conversion en GABA (surtout périnatale) ; interaction avec le site polyamine du récepteur NMDA.
- **Effets cellulaires** : lien avec l'**autophagie** et la longévité (via la spermidine) ; stabilisation de HIF-1α (angiogenèse).
- **Bactéries/plantes** : résistance au stress acide, quorum sensing, synthèse d'alcaloïdes.

## ⚠️ 7. Pathologie et toxicologie
- **Potentialisation de l'histamine** : la putrescine (et la cadavérine) sont des substrats compétitifs de la DAO/HNMT → elles **inhibent le catabolisme de l'histamine** et augmentent son passage intestinal, aggravant l'intoxication histaminique (scombroïdose).
- **Nitrosamines** : en milieu acide, réaction avec les nitrites (cyclisation en pyrrolidine → N-nitrosopyrrolidine, cancérogène) — lien suspecté charcuteries nitritées ↔ cancer colorectal.
- **Cancer** : l'ODC est un proto-oncogène ; putrescine et polyamines nécessaires à la prolifération tumorale. Le **DFMO (éflornithine)** inhibe l'ODC (trypanocide, chimioprévention).
- **Neurodégénérescence, insuffisance rénale** : rôle ambivalent (autophagie protectrice vs stress oxydatif par H₂O₂ de la DAO) ; accumulation chez l'insuffisant rénal.

## 💊 8. Interactions médicamenteuses
- **Inhibiteurs de la DAO** : ↑ risque d'intolérance à l'histamine (par compétition) et possible ↑ du GABA central.
- **IMAO** : peu d'interaction (la putrescine n'est pas un bon substrat de la MAO).
- **Éflornithine (DFMO)** : inhibe l'ODC (cytopénies, troubles digestifs possibles).
- **AINS, corticoïdes** : ↓ l'activité ODC ; **antibiotiques** : ↓ la production intestinale.

## 🔬 9. Détection et histoire
HPLC (dérivation OPA, dansyl), électrophorèse capillaire, tests enzymatiques DAO ; « indice de putrescine/cadavérine » de fraîcheur (seuils de rejet). Isolée en 1885 par Ludwig Brieger (« ptomaïnes ») ; ODC et polyamines caractérisées dans les années 1960-1970 ; DFMO synthétisé en 1978 ; rôle en épigénétique/autophagie/longévité reconnu depuis 2000.

## ✅ En résumé
La putrescine est une diamine essentielle (précurseur des polyamines). Peu toxique seule, elle amplifie la toxicité de l'histamine et peut former des nitrosamines. Au cœur du métabolisme de la prolifération, c'est une cible thérapeutique en cancérologie, bien au-delà de sa réputation de « molécule de la pourriture ».`;

const CADAVERINE = `## ❓ 1. Qu'est-ce que la cadavérine ?
La cadavérine (1,5-diaminopentane) est une diamine aliphatique du groupe des amines biogènes, proche de la putrescine (un carbone de plus). Universelle, elle est surtout connue pour son accumulation dans les tissus en décomposition et les aliments altérés (d'où son nom). Rôles : marqueur de putréfaction, potentialisateur de la toxicité de l'histamine, précurseur d'alcaloïdes (pipéridine) chez les plantes, et impliquée dans la formation de nitrosamines.

## 🧪 2. Structure et propriétés chimiques
- **Nom IUPAC** : pentane-1,5-diamine — **Formule brute** : C₅H₁₄N₂ — **Masse molaire** : 102,18 g/mol
- **Structure** : chaîne linéaire à 5 carbones, amine primaire à chaque extrémité.
- **Aspect** : liquide visqueux incolore à jaunâtre (fusion ~ 9 °C) ; souvent manipulée en sel (dichlorhydrate).
- **Point d'ébullition** : 178–180 °C.
- **pKa** : ~ 10,0 et ~ 10,9 — **doublement protonée** au pH physiologique.
- **Odeur** : extrêmement désagréable (chair en décomposition) ; les sels sont inodores.

## 🧬 3. Biosynthèse
Décarboxylation de la **L-lysine** :
- **Micro-organismes (voie majoritaire)** : **lysine décarboxylase (LDC)**, B6-dépendante. L-lysine → cadavérine + CO₂. Chez E. coli, la LDC acido-inductible (CadA) + antiport CadB = mécanisme de résistance au stress acide → fortes concentrations dans les aliments fermentés et l'intestin.
- **Plantes** : précurseur d'alcaloïdes pipéridiniques (coniine de la ciguë) et quinolizidiniques (lupins).
- **Mammifères** : biosynthèse endogène très limitée ; la cadavérine humaine provient surtout de l'alimentation et du microbiote.

## 🍽️ 4. Présence dans les aliments
Indicateur fiable de perte de fraîcheur (poissons, viandes). Très stable à la cuisson et à la congélation.

| Aliment | Cadavérine (mg/kg) |
| --- | --- |
| Poissons frais | < 10 |
| Poissons mal conservés | 50 – > 1 000 |
| Fromages affinés | 10 – 1 200 |
| Charcuteries fermentées/séchées | 20 – 700 |
| Viande altérée | 50 – > 500 |
| Sauce soja, miso, tempeh | 10 – 500 |
| Vin rouge | 5 – 100 |
| Choucroute, kimchi | 10 – 200 |

Presque toujours détectée avec la putrescine et l'histamine. > 100–200 mg/kg = motif de rejet qualitatif (pas de limite réglementaire propre).

## ♻️ 5. Métabolisme chez l'homme
- **Absorption** intestinale (transporteurs de diamines) ; partiellement dégradée dans la muqueuse.
- **DAO** : excellent substrat. Cadavérine → 5-aminopentanal (→ Δ¹-pipéridéine → pipéridine ou acide 5-aminovalérique) + H₂O₂.
- **MAO** : mauvais substrat. **Acétylation** (SSAT) → N-acétylcadavérine (urine).
- **Compétition avec l'histamine** : substrat compétitif de la DAO et de l'HNMT → en grande quantité, elle **inhibe la dégradation de l'histamine** et augmente sa toxicité.
- **Demi-vie** courte.

## ⚙️ 6. Rôles physiologiques
- **Mammifères** : pas de fonction endogène essentielle identifiée (contrairement à la putrescine) ; ne participe pas directement à la synthèse de spermidine/spermine. Peut moduler certains canaux ioniques. Son effet est surtout **indirect** (inhibition de la DAO).
- **Bactéries** : survie en milieu acide (maintien du pH).
- **Plantes** : précurseur d'alcaloïdes de défense (pipéridine, lupinine).

## ⚠️ 7. Pathologie et toxicologie
- **Intoxication histaminique potentialisée** : peu toxique seule, mais avec l'histamine (poissons mal conservés) elle aggrave le tableau (inhibition DAO/HNMT, ↑ perméabilité). Symptômes plus sévères/prolongés ; traitement par antihistaminiques.
- **Nitrosamines** : la cadavérine se cyclise en **pipéridine** → nitrosation par les nitrites → **N-nitrosopipéridine (NPIP)**, cancérogène possible (groupe 2B, CIRC) retrouvée dans les viandes transformées. La vitamine C / les polyphénols inhibent en partie cette nitrosation.
- **Marqueur tumoral** (moins spécifique que la putrescine), **toxicité urémique** (insuffisance rénale), **halitose/parodontite** (bactéries buccales anaérobies).

## 💊 8. Interactions médicamenteuses
- **Inhibiteurs de la DAO** : ↑ accumulation et surtout potentialisation de l'effet inhibiteur sur le catabolisme de l'histamine → aggravation d'une intolérance à l'histamine.
- **IMAO** : pas d'interaction directe (pas un substrat de la MAO).
- **Nitrites/nitrates** : co-ingestion avec des aliments riches en cadavérine (charcuteries) → formation de NPIP.
- **Probiotiques** : certaines souches à lysine décarboxylase pourraient ↑ la production intestinale.

## 🔬 9. Détection et histoire
HPLC (dérivation), GC-MS, électrophorèse capillaire, biocapteurs à DAO/LDC ; « indice d'amines biogènes » de fraîcheur (cadavérine > 50–100 mg/kg dans le poisson = altération avancée). Isolée en 1885 par Ludwig Brieger (« ptomaïnes ») ; lien cadavérine ↔ inhibition DAO ↔ intoxication histaminique élucidé dans les années 1970-1980 ; formation de N-nitrosopipéridine étudiée depuis les années 1990.

## ✅ En résumé
La cadavérine est la diamine emblématique de la putréfaction, synthétisée par décarboxylation de la lysine par les bactéries. Peu toxique seule, elle amplifie dangereusement les effets de l'histamine en bloquant sa dégradation et participe à la formation de nitrosamines cancérogènes. Sa mesure évalue la qualité sanitaire des aliments ; son rôle en pathologie, quoique indirect, en fait un facteur de risque significatif.`;

export const AMINE_ARTICLES: AmineArticle[] = [
  {
    name: 'Histamine',
    summary:
      "Amine de l'allergie immédiate, de la sécrétion gastrique et de l'éveil ; pivot de l'intolérance à l'histamine.",
    markdown: HISTAMINE,
  },
  {
    name: 'Tyramine',
    summary: "Aliments fermentés/vieillis ; « effet fromage » sous IMAO et déclencheur de migraines.",
    markdown: TYRAMINE,
  },
  {
    name: 'Phényléthylamine',
    summary: "Amine trace du chocolat, squelette des amphétamines ; métabolisme ultra-rapide (MAO-B).",
    markdown: PHENYLETHYLAMINE,
  },
  {
    name: 'Tryptamine',
    summary: "Squelette de la sérotonine, de la mélatonine et des tryptamines psychédéliques.",
    markdown: TRYPTAMINE,
  },
  {
    name: 'Putrescine',
    summary: "Diamine de la putréfaction, précurseur des polyamines ; amplifie la toxicité de l'histamine.",
    markdown: PUTRESCINE,
  },
  {
    name: 'Cadavérine',
    summary: "Diamine de la décomposition (lysine) ; potentialise l'histamine, forme des nitrosamines.",
    markdown: CADAVERINE,
  },
];

/** Catégorie affichée dans l'encyclopédie pour les fiches amines. */
export const AMINE_CATEGORY = 'Amines biogènes';

const BY_KEY = new Map(AMINE_ARTICLES.map((a) => [normalize(a.name), a]));

/** Fiche article d'une amine par nom (normalisé), si elle existe. */
export function amineArticle(name: string): AmineArticle | undefined {
  return BY_KEY.get(normalize(name));
}
