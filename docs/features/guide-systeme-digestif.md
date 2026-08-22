# Guide du système digestif

## Description

Un guide illustré hors ligne : anatomie du tube digestif, transit étape par étape,
microbiote intestinal.

## Objectif

Donner le contexte physiologique qui rend le reste compréhensible — pourquoi un
ballonnement une heure après le repas ne dit pas la même chose qu'un ballonnement le soir.

## Prérequis

Aucun pour le guide. L'approfondissement d'un organe nécessite l'IA.

## Comment l'utiliser

**Repères → Système digestif**, puis :

1. **Anatomie du tube digestif** — planche annotée.
2. **Le transit, étape par étape** — durées et rôle de chaque organe. **Touchez une
   étape** pour ouvrir la fiche de l'organe.
3. **Le microbiote intestinal** — équilibre (eubiose) contre déséquilibre (dysbiose), et
   le lien avec le SIBO et le *Candida*.

## Options

La fiche d'un organe contient : image, **rôle dans la digestion**, **pathologies
fréquentes**, et — après approfondissement IA — **pathologies détaillées**, **lien avec
candidose / SIBO / SII**, **prendre soin de cet organe**, **quand consulter**.

## Paramètres associés

[Assistant IA](../settings/index.md#assistant-ia-openrouter).

## Données utilisées

Illustrations embarquées dans l'application. Les approfondissements sont mis en cache
dans la table `organNotes` (clé = identifiant de l'organe) et inclus dans la sauvegarde.

## Résultat

Un guide consultable hors ligne, enrichi à la demande.

## Fonctionnement hors connexion

Intégral pour le guide et les fiches déjà générées.

## Fonctionnement en ligne

Génération d'un approfondissement, sur action explicite.

## Limites

Contenu pédagogique, **non médical**. La section **« Quand consulter »** liste des signes
d'alerte : ce n'est pas un tri d'urgence.

## Erreurs possibles

Voir [Codes et erreurs](../reference/errors.md#openrouter-ia).

## Dépannage

[L'IA ne répond pas](../troubleshooting/ia-ne-repond-pas.md)

## FAQ

- [D'où viennent les illustrations ?](../faq/index.md#doù-viennent-les-illustrations)
