/**
 * Socle statique d'une petite encyclopédie des symptômes digestifs, classée par
 * catégorie. Point de départ volontairement concis, destiné à être enrichi
 * (manuellement et via l'IA). Repères généraux, non médicaux.
 */
export interface EncyclopediaItem {
  name: string;
  manifestation: string;
}

export interface EncyclopediaCategory {
  category: string;
  items: EncyclopediaItem[];
}

export const ENCYCLOPEDIA: EncyclopediaCategory[] = [
  {
    category: 'Œsophage & estomac (digestif haut)',
    items: [
      { name: 'Reflux gastro-œsophagien (RGO)', manifestation: 'Remontées acides et brûlures derrière le sternum, surtout allongé ou après un repas gras/copieux.' },
      { name: "Brûlures d'estomac (pyrosis)", manifestation: 'Sensation de brûlure au creux de l’estomac, parfois goût acide en bouche.' },
      { name: 'Nausées', manifestation: 'Mal de cœur pouvant précéder un vomissement, souvent après le repas.' },
      { name: 'Satiété précoce / digestion lente', manifestation: 'Sensation d’être vite rassasié ou estomac « lourd » longtemps après manger.' },
      { name: 'Éructations (rots)', manifestation: 'Émission d’air par la bouche ; fréquente en cas d’aérophagie ou de SIBO.' },
      { name: 'Dysphagie (gêne à avaler)', manifestation: 'Sensation de blocage des aliments dans la gorge ou la poitrine.' },
      { name: 'Mauvaise haleine (halitose)', manifestation: 'Souvent liée à un reflux, une stase gastrique ou une dysbiose.' },
      { name: 'Goût amer ou acide', manifestation: 'Goût désagréable en bouche, fréquent au réveil en cas de reflux nocturne.' },
    ],
  },
  {
    category: 'Intestin & côlon (digestif bas)',
    items: [
      { name: 'Ballonnements', manifestation: 'Ventre gonflé / distendu, souvent par fermentation des FODMAP dans les heures suivant le repas.' },
      { name: 'Gaz / flatulences', manifestation: 'Production excessive de gaz (hydrogène, méthane), gargouillis et inconfort.' },
      { name: 'Douleurs / crampes abdominales', manifestation: 'Spasmes douloureux, souvent soulagés par l’évacuation (évocateur du SII).' },
      { name: 'Diarrhée', manifestation: 'Selles molles à liquides et fréquentes (Bristol 6-7), parfois urgentes.' },
      { name: 'Constipation', manifestation: 'Selles rares et dures (Bristol 1-2), efforts de poussée, évacuation difficile.' },
      { name: 'Urgence / évacuation incomplète', manifestation: 'Besoin pressant ou impression de ne pas avoir tout évacué (ténesme).' },
      { name: 'Borborygmes (gargouillis)', manifestation: 'Bruits intestinaux liés au déplacement des gaz et des liquides.' },
      { name: 'Alternance diarrhée / constipation', manifestation: 'Transit instable alternant les deux : profil mixte du SII.' },
    ],
  },
  {
    category: 'Selles & transit',
    items: [
      { name: 'Échelle de Bristol', manifestation: 'Type 1-2 = dur (constipation), 3-4 = normal, 5 = limite, 6-7 = mou/liquide (diarrhée). Voir le schéma ci-dessus.' },
      { name: 'Mucus dans les selles', manifestation: 'Glaires fréquentes dans le SII ; à signaler surtout si associées à du sang.' },
      { name: 'Selles grasses (stéatorrhée)', manifestation: 'Selles huileuses, pâles, malodorantes, qui flottent : malabsorption des graisses.' },
      { name: 'Selles décolorées (mastic)', manifestation: 'Selles très pâles : possible cause biliaire ou hépatique, à explorer.' },
      { name: 'Aliments non digérés visibles', manifestation: 'Fragments d’aliments dans les selles : transit rapide ou mastication insuffisante.' },
    ],
  },
  {
    category: 'Signes systémiques / extra-digestifs',
    items: [
      { name: 'Fatigue chronique', manifestation: 'Fatigue persistante non expliquée par le sommeil ; possible malabsorption/inflammation.' },
      { name: 'Brouillard mental', manifestation: 'Difficultés de concentration et de mémoire ; axe intestin-cerveau à l’étude.' },
      { name: 'Envie compulsive de sucre', manifestation: 'Fringales sucrées répétées, parfois liées à un déséquilibre du microbiote / au Candida.' },
      { name: 'Mycoses & démangeaisons', manifestation: 'Candidoses cutanéo-muqueuses et prurit ; signe possible de prolifération fongique.' },
      { name: 'Enduit lingual blanc', manifestation: 'Dépôt blanchâtre sur la langue (muguet) : candidose buccale.' },
      { name: 'Maux de tête / migraines', manifestation: 'Parfois associés aux intolérances alimentaires (histamine, gluten) et à la dysbiose.' },
      { name: 'Troubles cutanés (acné, eczéma, rosacée)', manifestation: 'Manifestations cutanées parfois liées à l’axe intestin-peau.' },
      { name: 'Troubles de l’humeur / sommeil', manifestation: 'Irritabilité, anxiété, sommeil perturbé : l’axe intestin-cerveau peut être impliqué.' },
      { name: 'Douleurs articulaires diffuses', manifestation: 'Parfois rapportées en cas d’inflammation de bas grade ou d’intolérances.' },
    ],
  },
  {
    category: '⚠️ Signes d’alarme (consulter un médecin)',
    items: [
      { name: 'Sang dans les selles', manifestation: 'Sang rouge ou selles noires (méléna) : consulter rapidement.' },
      { name: 'Perte de poids involontaire', manifestation: 'Amaigrissement inexpliqué : bilan médical nécessaire.' },
      { name: 'Symptômes nocturnes', manifestation: 'Douleurs ou diarrhées qui réveillent la nuit : à explorer.' },
      { name: 'Anémie', manifestation: 'Pâleur, essoufflement, fatigue : possible saignement digestif chronique.' },
      { name: 'Vomissements persistants', manifestation: 'Vomissements répétés ou incoercibles : avis médical rapide.' },
      { name: 'Fièvre digestive prolongée', manifestation: 'Fièvre associée à des troubles digestifs durables : à explorer.' },
    ],
  },
];

/** Tous les noms du socle (pour éviter les doublons à l'enrichissement IA). */
export function encyclopediaNames(): string[] {
  return ENCYCLOPEDIA.flatMap((c) => c.items.map((i) => i.name));
}
