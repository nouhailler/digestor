# FAQ

## Installation et prise en main

### Comment installer l'application ?

Ouvrez Digestor dans le navigateur, puis ajoutez-la à l'écran d'accueil. La procédure
diffère selon la plateforme — voir [Installation PWA](../getting-started/index.md#installation-pwa).

### Faut-il créer un compte ?

Non. Il n'y a ni compte, ni mot de passe, ni serveur.

### Comment revoir le tutoriel ?

Menu `⋯` → **Revoir le tutoriel & les visites guidées**. Le tutoriel se relance et chaque
écran rejouera sa visite guidée à la prochaine arrivée.

## Saisie

### Faut-il enregistrer manuellement ?

Non. Le journal est enregistré automatiquement à chaque modification. Seuls le **profil
santé**, les **traitements**, les **réintroductions** et les **modèles de repas** ont un
bouton de validation.

### Comment corriger la couleur d'un aliment ?

En mode édition, touchez la chip de l'aliment : la catégorie tourne
🔴 pro-candidose/SIBO → 🟢 bénéfique → ⚪ neutre. Une fois l'aliment analysé par l'IA, la
chip prend la couleur de sa sévérité FODMAP.

### Faut-il noter les symptômes par repas ou par jour ?

**Par repas**, dès que c'est possible : c'est ce qui permet les corrélations les plus
fines (tableau « Aliment suspect par symptôme » de l'écran Évolution). Le niveau
journée sert aux symptômes diffus. Les statistiques prennent toujours le **maximum** des
deux niveaux, donc rien n'est compté deux fois.

### Comment supprimer un aliment en double ?

Écran **Aliments** → **Trouver les doublons**. Les variantes proches (pluriel, accents,
orthographe) sont regroupées ; gardez l'entrée à conserver et supprimez les autres avec
l'icône corbeille.

### Modifier un modèle change-t-il mes repas passés ?

Non. Un modèle est copié au moment de l'insertion : les repas déjà créés sont
indépendants.

### Pourquoi aucune durée de satiété ne s'affiche ?

La durée **tenue** est calculée à partir du moment où votre faim repasse au-dessus de la
moitié de l'échelle. Tant qu'elle n'est pas revenue, Digestor affiche
« encore rassasié à +X h ». Il faut donc **au moins un relevé où la faim est remontée**.

### Pourquoi mon relevé de satiété n'apparaît nulle part ?

L'import de satiété rattache chaque relevé à un repas par sa **date et son heure**. Si
aucun repas ne correspond exactement, le relevé n'est rattaché à rien : vérifiez que le
repas existe bien dans le journal à cette heure-là.

### Pourquoi noter le stress dans un journal alimentaire ?

Parce que le stress, le manque de sommeil et le cycle menstruel modulent fortement les
symptômes digestifs. Digestor calcule leur lien **séparément** des aliments, ce qui évite
d'accuser un repas à tort. Voir [Bien-être & contexte](../features/contexte-bien-etre.md).

## Analyses et corrélations

### Pourquoi Digestor ne me dit-il rien alors que je saisis depuis une semaine ?

Parce que ses seuils ne sont pas atteints. Il faut au minimum **5 jours renseignés**,
un aliment présent **au moins 3 jours**, un taux de symptôme d'au moins **50 %** les
jours « avec », et un écart d'au moins **30 points** avec les jours « sans ».
En dessous, l'application dit qu'elle ne sait pas plutôt que d'inventer un motif.
Voir [Corrélations](../features/correlations.md).

### Pourquoi la récurrence ne suit-elle pas la plage choisie ?

Le tableau **Récurrence des aliments** couvre volontairement une fenêtre fixe de
**30 jours**, indépendante du sélecteur de plage, pour rester comparable d'une
consultation à l'autre. La fenêtre se termine au dernier jour renseigné.

### Qu'est-ce que la DAO ?

La **diamine oxydase**, l'enzyme qui dégrade l'histamine alimentaire dans l'intestin. Si
l'apport dépasse sa capacité — ou si un aliment la freine — l'histamine s'accumule et
peut provoquer démangeaisons, rougeurs, maux de tête ou troubles digestifs. Voir
[Amines biogènes](../features/amines-biogenes.md).

### Quelle plage choisir pour le rapport de période ?

**4 semaines** est le meilleur compromis : assez long pour lisser les variations, assez
court pour rester interprétable. **Semaine** est trop bruité, **Tout** dilue les
évolutions récentes.

### Les fiches de l'encyclopédie sont-elles fiables ?

Le socle statique est rédigé et embarqué dans l'application. Les approfondissements sont
générés par un modèle d'IA : ce sont des **repères informatifs, non médicaux**, à ne pas
utiliser comme référence clinique.

### D'où viennent les illustrations ?

Les planches anatomiques du guide du système digestif sont embarquées dans
l'application et proviennent de sources libres (Wikimedia, domaine public).

## Assistant IA

### L'IA est-elle obligatoire ?

Non. Sans clé, **aucune requête réseau n'est émise** et toutes les fonctions de journal,
de statistiques, de corrélations, de dossier médical et de sauvegarde restent
disponibles.

### Mes données sont-elles envoyées à l'IA ?

Uniquement ce qui est nécessaire, et uniquement quand **vous** lancez une analyse :
le nom d'un aliment, ou une description de la journée / de la période, plus votre
contexte de profil. Le détail exact figure dans
[Données et confidentialité](../data/index.md#ce-qui-sort-de-lappareil).

### Mon nom est-il envoyé à l'IA ?

Non. Le **nom du patient n'est jamais transmis**. Le contexte de profil comprend l'âge,
le sexe, les conditions, la phase FODMAP, les intolérances, les allergies, les aliments
évités, les antécédents, les médicaments et vos notes santé.

### Ma clé API est-elle dans la sauvegarde ?

Non, **jamais**. La clé reste dans le stockage local et n'est envoyée qu'à
`openrouter.ai`. Après une restauration sur un nouvel appareil, il faut la ressaisir ;
le modèle choisi, lui, est restauré.

### Les idées de repas tiennent-elles compte de mes allergies ?

Oui : les allergies déclarées dans le [profil santé](../features/profil-sante.md) sont
transmises avec une consigne explicite de les signaler. Vérifiez néanmoins chaque
suggestion — un modèle peut se tromper.

### Puis-je envoyer l'analyse à mon médecin ?

Oui. Sous une analyse de journée, **Partager** ouvre la feuille de partage de votre
système (mail, messagerie, Fichiers…) et **Télécharger** produit un fichier texte. Pour
un document complet, préférez le [dossier médical](../features/dossier-medical.md).

## Données

### Où sont mes données ?

Dans le stockage local (IndexedDB) du navigateur de cet appareil. Nulle part ailleurs.
Voir [Données et confidentialité](../data/index.md).

### Puis-je utiliser l'application sans Internet ?

Oui, entièrement — sauf les analyses IA et le scan de code-barres. Voir
[Hors connexion](../offline/index.md).

### À quelle fréquence sauvegarder ?

Au moins une fois par semaine : c'est le délai après lequel le bandeau de rappel
réapparaît. **Après chaque session de saisie importante**, c'est mieux.

### Comment exporter mes données ?

Menu `⋯` → **Sauvegarder mes données (JSON)**.

### Comment changer de téléphone ?

Exportez la sauvegarde sur l'ancien appareil, transférez le fichier, puis
**Restaurer (JSON)** sur le nouveau. Ressaisissez votre clé API. Voir
[Synchronisation](../sync/index.md#transférer-ses-données-dun-appareil-à-lautre).

### Comment supprimer mes données ?

Effacez les données du site dans les réglages du navigateur, ou désinstallez
l'application. La suppression est définitive.

### Comment réinitialiser l'application ?

Il n'y a pas de bouton « tout effacer » dans l'interface. **Menu `⋯` → Données de démo**
recharge les deux journées d'exemple (et écrase ces dates uniquement). Pour repartir
totalement de zéro, effacez les données du site.

### Que reçoit Open Food Facts ?

**Uniquement le code-barres** que vous scannez. Aucune donnée personnelle, aucune clé,
aucun identifiant.

### Digestor envoie-t-il quelque chose à Claude ?

Non. Les imports vocaux sont des **copier-coller** : vous dictez dans Claude Web, vous
copiez le JSON produit, vous le collez dans Digestor. L'application n'appelle jamais
claude.ai.

### Quelle différence entre le référentiel d'aliments et la sauvegarde ?

La **sauvegarde** contient toutes vos données (journal, profil, analyses…) et sert à
restaurer. Le **référentiel d'aliments** ne contient que le catalogue d'aliments et leurs
profils — ni journal, ni symptômes, ni profil santé — et sert à fiabiliser la saisie
vocale ou à compléter les amines en masse.

### Pourquoi mon thème n'est-il pas restauré après un import ?

Le thème est une **préférence d'appareil** stockée hors de la base de données : il n'est
volontairement ni exporté ni restauré. Rechoisissez-le dans Menu `⋯` → Apparence.

## Divers

### La recherche trouve-t-elle les pluriels ?

La recherche du journal est une correspondance textuelle simple, sans gestion des
synonymes. En revanche, le tableau de **récurrence** et la détection de **doublons**
regroupent bien les variantes proches (pluriel, accents).

### Quel aliment tester pour quel groupe FODMAP ?

Les repères usuels : **miel** pour le fructose, **lait** pour le lactose, **pain de blé**
ou **oignon** pour les fructanes, **légumineuses** pour les GOS, **avocat** ou
**chewing-gum au sorbitol** pour les polyols. Digestor n'impose aucun aliment : vous
saisissez celui que vous testez. Menez ces tests avec un professionnel de santé.

### Digestor peut-il m'envoyer des rappels ?

Non. Il n'y a **aucune notification** et aucune permission de notification n'est
demandée.

### Où est passée la courbe d'hydratation ?

L'écran Évolution n'affiche pas de graphe d'hydratation. L'hydratation reste saisie dans
le Journal (**Transit & hydratation**) et reprise dans le
[dossier médical](../features/dossier-medical.md), qui affiche la moyenne en L/j.

### Comment obtenir un PDF ?

**Menu `⋯` → Dossier médical → Imprimer / PDF**, puis choisissez « Enregistrer au format
PDF » dans la boîte d'impression du système. **Menu `⋯` → Exporter PDF** imprime
simplement l'écran courant.

### L'application pose-t-elle un diagnostic ?

Non, et elle ne le fera pas. C'est un outil de suivi et de repérage de tendances. Voir
[Informations légales](../legal/index.md).
