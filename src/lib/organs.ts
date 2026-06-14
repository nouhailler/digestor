/**
 * Catalogue statique des organes du tube digestif (affiché hors-ligne, sans IA).
 * Chaque organe : image libre (domaine public, dans public/anatomy/organs/),
 * rôle dans la digestion, et pathologies fréquentes (descriptions courtes,
 * informatives et NON diagnostiques). L'IA sert ensuite à approfondir.
 */

export interface OrganPathology {
  name: string;
  desc: string;
}

export interface Organ {
  id: string;
  name: string;
  image: string; // chemin public/
  imageAlt: string;
  role: string;
  pathologies: OrganPathology[];
}

export const ORGANS: Organ[] = [
  {
    id: 'bouche',
    name: 'Bouche & glandes salivaires',
    image: '/anatomy/organs/bouche.jpg',
    imageAlt: 'Coupe de la tête et du cou montrant la cavité buccale et les glandes salivaires',
    role: "Première étape de la digestion : les dents broient les aliments (digestion mécanique) et la salive, riche en amylase, commence à découper l'amidon. Bien mâcher facilite tout le reste du trajet.",
    pathologies: [
      { name: 'Muguet buccal (candidose)', desc: "Enduit blanchâtre sur la langue et l'intérieur des joues, lié à une prolifération de Candida." },
      { name: 'Sécheresse buccale (xérostomie)', desc: "Manque de salive : la digestion de l'amidon démarre moins bien, bouche pâteuse." },
      { name: 'Aphtes', desc: 'Petites ulcérations douloureuses, parfois plus fréquentes en cas de troubles digestifs.' },
      { name: 'Caries & gingivite', desc: 'Une mauvaise santé bucco-dentaire gêne la mastication et donc la digestion.' },
    ],
  },
  {
    id: 'oesophage',
    name: 'Œsophage',
    image: '/anatomy/organs/oesophage.jpg',
    imageAlt: "Schéma de l'œsophage reliant la gorge à l'estomac",
    role: "Tube musculaire d'environ 25 cm qui conduit le bol alimentaire de la gorge à l'estomac grâce à des contractions (péristaltisme). Un sphincter à son extrémité empêche normalement le contenu acide de remonter.",
    pathologies: [
      { name: 'Reflux gastro-œsophagien (RGO)', desc: "Remontées acides et brûlures derrière le sternum quand le sphincter ne se ferme pas bien." },
      { name: 'Œsophagite', desc: "Inflammation de la muqueuse, souvent due à un reflux acide répété." },
      { name: 'Dysphagie', desc: "Sensation de gêne ou de blocage à la déglutition." },
      { name: 'Hernie hiatale', desc: "Une partie de l'estomac remonte à travers le diaphragme, favorisant le reflux." },
    ],
  },
  {
    id: 'estomac',
    name: 'Estomac',
    image: '/anatomy/organs/estomac.jpg',
    imageAlt: "Schéma de l'estomac en coupe",
    role: "Poche musculaire qui brasse les aliments et sécrète de l'acide chlorhydrique et de la pepsine : les protéines sont découpées et une grande partie des microbes ingérés est neutralisée. Il en sort une bouillie acide, le « chyme », libérée peu à peu vers l'intestin.",
    pathologies: [
      { name: 'Gastrite', desc: "Inflammation de la paroi de l'estomac (douleurs, nausées, lourdeurs)." },
      { name: 'Ulcère gastrique', desc: "Lésion de la muqueuse, souvent liée à Helicobacter pylori ou aux anti-inflammatoires." },
      { name: 'Dyspepsie', desc: "Digestion lente et difficile : lourdeurs, satiété rapide, inconfort après les repas." },
      { name: 'Infection à Helicobacter pylori', desc: "Bactérie qui colonise l'estomac et favorise gastrites et ulcères." },
      { name: 'Vidange lente (gastroparésie)', desc: "L'estomac se vide trop lentement : satiété précoce et ballonnements." },
    ],
  },
  {
    id: 'grele',
    name: 'Intestin grêle',
    image: '/anatomy/organs/intestin-grele.jpg',
    imageAlt: "Schéma de l'intestin grêle (duodénum, jéjunum, iléon)",
    role: "Long de 6 à 7 m (duodénum, jéjunum, iléon), c'est là que se fait l'essentiel de l'absorption des nutriments. La bile (foie/vésicule) émulsionne les graisses et les enzymes du pancréas finissent la découpe. Sa paroi, tapissée de villosités, offre une immense surface d'échange.",
    pathologies: [
      { name: 'SIBO (pullulation bactérienne)', desc: "Trop de bactéries dans le grêle : fermentation rapide des glucides, ballonnements précoces après le repas." },
      { name: 'Maladie cœliaque', desc: "Réaction au gluten qui abîme les villosités et réduit l'absorption." },
      { name: 'Intolérances (lactose, fructose)', desc: "Sucres mal digérés qui fermentent : gaz, douleurs, diarrhée." },
      { name: 'Malabsorption', desc: "Nutriments insuffisamment absorbés (carences, fatigue, selles grasses)." },
      { name: 'Maladie de Crohn', desc: "Inflammation chronique pouvant toucher le grêle (souvent l'iléon)." },
    ],
  },
  {
    id: 'colon',
    name: 'Gros intestin (côlon)',
    image: '/anatomy/organs/gros-intestin.jpg',
    imageAlt: 'Schéma du gros intestin : côlon ascendant, transverse, descendant, sigmoïde',
    role: "Le côlon réabsorbe l'eau et les minéraux, et héberge l'essentiel du microbiote, qui fermente les fibres non digérées (produisant gaz et acides gras bénéfiques). Les selles s'y forment et se déshydratent progressivement avant l'évacuation.",
    pathologies: [
      { name: "Syndrome de l'intestin irritable (SII)", desc: "Douleurs abdominales et transit instable (diarrhée et/ou constipation) sans lésion." },
      { name: 'Dysbiose', desc: "Déséquilibre du microbiote, terrain favorable aux ballonnements et inconforts." },
      { name: 'Candidose intestinale', desc: "Prolifération de levures (Candida) ; son rôle systémique reste débattu." },
      { name: 'Constipation / diarrhée', desc: "Troubles du transit liés à l'hydratation, aux fibres, au stress, au microbiote." },
      { name: 'Diverticules / diverticulite', desc: "Petites poches sur la paroi du côlon, parfois enflammées." },
    ],
  },
  {
    id: 'rectum',
    name: 'Rectum & anus',
    image: '/anatomy/organs/rectum.svg',
    imageAlt: 'Schéma du rectum et de l’anus avec les sphincters',
    role: "Le rectum stocke les selles jusqu'à l'évacuation, contrôlée par les sphincters de l'anus. Au total, un repas met en moyenne 24 à 72 h pour traverser tout le tube digestif.",
    pathologies: [
      { name: 'Hémorroïdes', desc: "Veines dilatées au niveau de l'anus : gêne, douleur, parfois saignement." },
      { name: 'Fissure anale', desc: "Petite déchirure douloureuse, souvent liée à des selles dures." },
      { name: "Constipation terminale", desc: "Difficulté à évacuer malgré l'envie, efforts de poussée." },
      { name: 'Saignement rectal', desc: "Du sang dans les selles doit toujours être évalué par un médecin." },
    ],
  },
];

const BY_ID = new Map(ORGANS.map((o) => [o.id, o]));

export function getOrgan(id: string): Organ | undefined {
  return BY_ID.get(id);
}
