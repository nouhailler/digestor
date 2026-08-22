# Synchronisation

## Il n'y en a pas — et c'est intentionnel

Digestor **ne synchronise rien**. Il n'y a ni compte, ni serveur, ni sauvegarde dans le
cloud, ni partage entre appareils.

C'est la contrepartie directe du modèle de confidentialité : ce qui ne quitte jamais
l'appareil ne peut pas fuiter, mais ne peut pas non plus se retrouver ailleurs tout seul.

## Conséquences pratiques

| Situation | Ce qui se passe |
|---|---|
| Vous saisissez sur le téléphone et ouvrez sur l'ordinateur | Les deux bases sont **indépendantes** ; rien n'est partagé |
| Vous changez de téléphone | Les données ne suivent pas : il faut exporter puis restaurer |
| Vous effacez les données du site | Tout est perdu, sans récupération possible |
| Deux navigateurs sur le même appareil | Deux bases distinctes |

## Transférer ses données d'un appareil à l'autre

C'est la seule procédure de « synchronisation », et elle est manuelle :

1. **Sur l'ancien appareil** : Menu `⋯` → **Sauvegarder mes données (JSON)**.
2. Transférez le fichier `digestor-AAAA-MM-JJ.json` (mail, cloud personnel, câble…).
3. **Sur le nouvel appareil** : ouvrez Digestor → Menu `⋯` → **Restaurer (JSON)** →
   choisissez le fichier.

⚠️ La restauration **remplace** l'intégralité des données présentes sur l'appareil cible.

La **clé API OpenRouter** n'est pas transférée (elle n'est jamais exportée) : ressaisissez-la.
Le **modèle** choisi, lui, est restauré.

## Fusion de deux appareils

Il n'existe **aucune fusion**. Si vous avez saisi des données sur deux appareils en
parallèle, restaurer l'un écrasera l'autre. Choisissez un appareil de référence.

## Voir aussi

- [Sauvegarde & restauration](../features/sauvegarde-restauration.md)
- [Hors connexion](../offline/index.md)
- [FAQ — Comment changer de téléphone ?](../faq/index.md#comment-changer-de-téléphone)
