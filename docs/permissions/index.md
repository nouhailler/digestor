# Permissions

Digestor demande **très peu** de permissions, et **aucune au démarrage**. Chacune est
demandée au moment précis où la fonction correspondante est utilisée.

## Résumé

| Permission | Quand | Obligatoire ? | Si refus |
|---|---|---|---|
| **Caméra** | À l'ouverture du scanner de code-barres | Non | Saisie manuelle du code-barres |
| **Stockage persistant** | Au démarrage, silencieusement | Non | L'application fonctionne ; risque d'éviction accru |

Digestor ne demande **jamais** : localisation, microphone, notifications, contacts,
Bluetooth, capteurs, accès aux fichiers en lecture (hors sélection explicite d'un
fichier de sauvegarde).

## Caméra

**Pourquoi** : lire le code-barres d'un produit emballé pour le retrouver dans
Open Food Facts. Voir [Scan d'un produit](../features/scan-code-barres.md).

**Quand** : à l'ouverture de la feuille **Scanner un produit**, jamais avant.

**Obligatoire ?** Non. Le scanner propose toujours la **saisie manuelle** du code.

**Si vous refusez** : le message *« Caméra indisponible. Saisissez le code-barres à la
main. »* s'affiche et le champ numérique reste utilisable. Aucune autre fonction n'est
affectée.

### Comment réactiver

| Plateforme | Chemin |
|---|---|
| **Android / Chrome** | Icône 🔒 ou ⓘ dans la barre d'adresse → *Autorisations* → **Caméra** → Autoriser |
| **Android (app installée)** | Réglages → Applications → Digestor → Autorisations → Caméra |
| **iOS / Safari** | Réglages → Safari → Caméra → *Demander* ou *Autoriser* ; ou `aA` dans la barre d'adresse → Réglages du site web |
| **Desktop Chrome / Edge** | Icône 🔒 dans la barre d'adresse → **Caméra** → Autoriser, puis rechargez |

> La caméra n'est accessible qu'en contexte **sécurisé (HTTPS)**. Sur une connexion
> non sécurisée, le navigateur refuse sans afficher de demande.

## Stockage persistant

**Pourquoi** : demander au navigateur de ne pas effacer automatiquement la base locale
(éviction en cas de manque d'espace, ou après plusieurs jours d'inactivité sur iOS).

**Quand** : une fois au démarrage, **sans boîte de dialogue** dans la plupart des
navigateurs. Certains peuvent afficher une demande.

**Obligatoire ?** Non — c'est une demande « au mieux » qui n'échoue jamais bruyamment.

**Si le navigateur refuse** : l'application fonctionne normalement, mais vos données sont
plus exposées à un effacement automatique. **Sauvegardez régulièrement** — voir
[Sauvegarde & restauration](../features/sauvegarde-restauration.md).

**Comment améliorer les chances d'obtention** : installer l'application sur l'écran
d'accueil, et l'utiliser régulièrement. Les critères exacts dépendent du navigateur.

## Ce que Digestor ne demande pas

| Permission | Pourquoi elle n'est pas nécessaire |
|---|---|
| **Microphone** | La dictée se fait dans Claude Web, pas dans Digestor : l'échange est un copier-coller |
| **Notifications** | Aucune notification n'est envoyée, aucun rappel n'est programmé |
| **Localisation** | Aucune fonction géographique |
| **Contacts / Bluetooth / capteurs** | Sans objet |

## Voir aussi

- [Données et confidentialité](../data/index.md)
- [Dépannage — la caméra ne s'ouvre pas](../troubleshooting/camera-indisponible.md)
