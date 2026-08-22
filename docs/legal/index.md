# Informations légales

> ⚠️ **Relecture juridique recommandée.** Cette page décrit le fonctionnement réel de
> l'application, vérifiable dans son code. Elle a été rédigée pour une **diffusion
> restreinte** (usage personnel et cercle proche). Avant toute mise à disposition
> publique — magasin d'applications, référencement, communication ouverte — faites-la
> relire par un juriste : les sections **Éditeur**, **Confidentialité** et **Conditions
> d'utilisation** engagent la responsabilité de l'éditeur.

## Avertissement médical

Ce texte est celui affiché dans l'application (**Menu `⋯` → À propos & avertissement
médical**).

Digestor est un **journal de suivi** alimentaire et symptomatique destiné à repérer des
tendances pour la candidose intestinale, le SIBO et le SII.

**Cet outil sert au suivi et au repérage de tendances. Ce n'est pas un dispositif de
diagnostic.**

- Le **SIBO** se confirme par un **test respiratoire**.
- Le **SII** repose sur des **critères cliniques** (Rome IV).
- L'hypothèse d'une **candidose systémique** chronique reste débattue en médecine ; la
  candidose intestinale localisée, elle, est reconnue.

**Consultez un médecin ou un gastro-entérologue pour toute interprétation.**

Les analyses produites par l'assistant IA, les fiches de symptômes, les fiches d'organes
et les repères sur les amines biogènes sont des **repères indicatifs, non médicaux**.

Les symptômes classés **« Signes d'alerte »** (gonflement de la gorge ou de la langue,
difficulté à avaler ou à respirer, chute de tension avec malaise, urticaire généralisée
qui s'aggrave) décrivent des **urgences médicales**. Digestor les enregistre mais
**n'alerte personne à votre place** : appelez les secours.

## Confidentialité

Résumé des faits, vérifiables dans le code et détaillés dans
[Données et confidentialité](../data/index.md) :

- Aucune donnée n'est envoyée à un serveur de l'application : **il n'y en a pas**.
- Toutes les données sont stockées **localement** (IndexedDB) sur votre appareil.
- Aucun compte, aucun cookie de suivi, aucune mesure d'audience.
- **Deux** appels réseau existent, et seulement sur votre action explicite :
  - **OpenRouter** (`openrouter.ai`) — si vous configurez l'assistant IA. Votre clé y est
    envoyée pour authentifier la requête, avec le nom d'un aliment ou une description de
    journée / période et votre contexte de profil (**sans votre nom**).
  - **Open Food Facts** (`world.openfoodfacts.org`) — lors d'un scan, avec **le seul
    code-barres**.
- La **clé API n'est jamais incluse** dans la sauvegarde JSON.
- Le partage d'une analyse et l'impression du dossier médical sont déclenchés par vous
  seul.

### Responsable du traitement

**Swinux** — canton de Vaud, Suisse — <contact@swinux.ch>.

### Données traitées par l'éditeur

**Aucune.** Swinux n'exploite ni serveur, ni base de données, ni service de collecte pour
Digestor. L'éditeur n'a **aucun accès** à vos données de journal, à votre profil santé, à
vos analyses ni à votre clé API : elles ne quittent pas votre appareil.

Il n'existe donc **aucun traitement de données personnelles** effectué par l'éditeur, et
par conséquent aucune conservation, aucun transfert et aucune sous-traitance de son fait.

### Destinataires tiers, déclenchés par vous

Deux services extérieurs peuvent recevoir des données, **uniquement** lorsque vous
actionnez vous-même la fonction correspondante :

| Destinataire | Données transmises | Déclencheur |
|---|---|---|
| **OpenRouter** (`openrouter.ai`) | Votre clé API, le nom d'un aliment ou la description d'une journée / période, votre contexte de profil (**sans votre nom**) | Vous configurez l'assistant IA **et** lancez une analyse |
| **Open Food Facts** (`world.openfoodfacts.org`) | Le code-barres scanné, rien d'autre | Vous scannez un produit |

Ces services sont soumis à **leurs propres conditions et politiques de confidentialité**,
sur lesquelles l'éditeur n'a aucune maîtrise. Consultez-les avant d'activer l'assistant IA.
Si vous n'activez ni l'IA ni le scanner, **aucune donnée ne quitte jamais votre appareil**.

### Base légale et finalité

Le stockage local sert exclusivement au **fonctionnement de l'application** que vous avez
choisi d'installer. Les deux appels tiers reposent sur votre **action explicite**.

### Vos droits

Vos données étant entièrement sous votre contrôle sur votre appareil, vous les exercez
directement, sans passer par l'éditeur :

| Droit | Comment |
|---|---|
| **Accès et portabilité** | Menu `⋯` → *Sauvegarder mes données (JSON)* — fichier lisible et réutilisable |
| **Rectification** | Modifiez n'importe quelle journée dans le Journal |
| **Effacement** | Supprimez un élément dans l'application, ou effacez les données du site / désinstallez l'application |
| **Opposition** | N'activez pas l'assistant IA ni le scanner : aucune donnée ne sort |

L'éditeur ne peut ni fournir, ni corriger, ni supprimer vos données à votre place : il n'y
a pas accès. Pour toute question : <contact@swinux.ch>.

### Droit applicable

Digestor est édité depuis la **Suisse** et relève de la **loi fédérale sur la protection
des données (LPD)**.

> `À vérifier` — si l'application venait à être proposée activement à des personnes
> résidant dans l'Union européenne, le **RGPD** pourrait s'appliquer par extraterritorialité.
> L'absence de collecte par l'éditeur simplifie beaucoup la question, mais elle ne la
> tranche pas : à faire confirmer avant toute diffusion large.

## Conditions d'utilisation

En utilisant Digestor, vous acceptez les conditions suivantes.

**1. Objet.** Digestor est un journal alimentaire et symptomatique personnel, mis à
disposition gratuitement. Il sert au suivi et au repérage de tendances.

**2. Usage non médical.** Digestor **n'est pas un dispositif médical** et ne pose aucun
diagnostic. Les analyses, fiches et corrélations qu'il produit sont des **repères
indicatifs**. Aucune décision de santé — modification de régime, arrêt ou début d'un
traitement — ne doit être prise sur cette seule base. Consultez un professionnel de santé.

**3. Absence de garantie.** Le logiciel est fourni « en l'état », sans garantie d'aucune
sorte, conformément à la [licence MIT](#licence). L'éditeur ne garantit ni l'exactitude
des analyses, ni la disponibilité des services tiers, ni l'absence d'erreurs.

**4. Vos données sont sous votre responsabilité.** Elles sont stockées **uniquement sur
votre appareil**. L'éditeur n'en détient aucune copie et ne peut donc rien restaurer.
Le navigateur peut les effacer sans préavis (manque d'espace, inactivité, nettoyage) :
**il vous appartient d'exporter régulièrement vos sauvegardes**. Voir
[Sauvegarde & restauration](../features/sauvegarde-restauration.md).

**5. Services tiers.** L'assistant IA et le scanner de produits s'appuient sur des services
extérieurs, régis par leurs propres conditions. Leur activation et leur usage relèvent de
votre choix, et leur coût éventuel de votre responsabilité.

**6. Limitation de responsabilité.** Dans les limites permises par le droit applicable,
l'éditeur ne saurait être tenu responsable d'un dommage direct ou indirect résultant de
l'usage de l'application, notamment d'une perte de données ou d'une décision prise sur la
foi de ses résultats.

**7. Évolution.** L'application est en développement (version antérieure à 1.0) :
fonctionnalités et formats de données peuvent changer. Les présentes conditions peuvent
être modifiées ; la version en vigueur est celle publiée ici.

**8. Droit applicable.** Droit suisse.

> `À vérifier` — clauses rédigées pour une diffusion restreinte. Une limitation de
> responsabilité n'écarte jamais la responsabilité en cas de faute grave, et sa portée
> exacte dépend du droit applicable et de la qualité de l'utilisateur (consommateur ou
> non). À faire relire avant diffusion large.

## Cookies

Digestor **n'utilise aucun cookie**. Il utilise le stockage local du navigateur
(IndexedDB, `localStorage`, `sessionStorage`) pour **son propre fonctionnement**, sans
finalité de suivi ni de publicité. Voir [Stockage local](../data/index.md#stockage-local-détail).

## Licence

Digestor est distribué sous **licence MIT** (fichier [`LICENSE`](../../LICENSE) du dépôt).
Le logiciel est fourni « en l'état », sans garantie d'aucune sorte.

## Crédits et services tiers

| Élément | Origine | Rôle |
|---|---|---|
| **Open Food Facts** | `world.openfoodfacts.org` | Recherche de produits par code-barres (base ouverte, sans clé) |
| **OpenRouter** | `openrouter.ai` | Passerelle vers les modèles d'IA, avec votre clé personnelle |
| **Planches anatomiques** | Wikimedia, domaine public | Guide du système digestif |
| **Table CIQUAL** | Anses | Socle de composition nutritionnelle |
| **Échelle de Bristol** | Référence clinique publique | Classification des selles |
| **Critères de Rome IV** | Référence clinique publique | Cadre de définition du SII |
| React, Vite, Dexie, Recharts, Tailwind CSS, lucide-react, date-fns, ZXing | Projets open source | Bibliothèques utilisées |

## Éditeur et hébergeur

### Éditeur

| | |
|---|---|
| **Éditeur** | Swinux |
| **Localisation** | Canton de Vaud, Suisse |
| **Contact** | <contact@swinux.ch> |

L'adresse se limite volontairement au canton : l'application n'est pas diffusée
publiquement.

> `À vérifier` — si Digestor est un jour mis à disposition du public, vérifiez avec un
> juriste quelles coordonnées doivent être publiées, et sous quelle forme.

### Hébergeur

L'application est un site statique, déployé sur **Netlify** (configuration
[`netlify.toml`](https://github.com/nouhailler/digestor/blob/main/netlify.toml) du dépôt).

| | |
|---|---|
| **Raison sociale** | Netlify, Inc. |
| **Adresse** | 101 2nd Street, San Francisco, CA 94105, États-Unis |
| **Téléphone** | Non publié par l'hébergeur |
| **Contact juridique** | <legal@netlify.com> |
| **Contact confidentialité** | <privacy@netlify.com> |
| **Support** | <support@netlify.com> |

Informations relevées sur les pages légales de Netlify
([conditions d'utilisation](https://www.netlify.com/legal/terms-of-use/),
[politique de confidentialité](https://www.netlify.com/privacy/)).

> `À vérifier` — ces coordonnées sont susceptibles de changer : reconfirmez-les sur les
> pages légales de l'hébergeur au moment d'une publication. Si le déploiement change
> d'hébergeur, remplacez ce bloc.

**Hébergement hors de Suisse.** Netlify est une société américaine. Cet hébergement
concerne les **fichiers de l'application** (code, styles, images, documentation), pas vos
données : celles-ci restent sur votre appareil et ne sont jamais transmises à
l'hébergeur. Voir [Données et confidentialité](../data/index.md).


## Consentements

L'application ne demande **aucun consentement** au traitement de données, puisqu'aucune
donnée n'est transmise sans action explicite de votre part. Les deux appels réseau
existants sont déclenchés par un bouton, et l'assistant IA nécessite que vous saisissiez
vous-même une clé.

Aucun consentement n'est donc recueilli au premier lancement, faute d'objet : il n'y a ni
collecte, ni mesure d'audience, ni cookie.

> `À vérifier` — à réexaminer si une fonction impliquant une transmission automatique de
> données était un jour ajoutée.

## Voir aussi

- [Données et confidentialité](../data/index.md)
- [Permissions](../permissions/index.md)
- [Limites connues](../reference/limitations.md)
