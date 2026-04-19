# HOWTO Moneylook

Moneylook est une plateforme de suivi de budget personnel.

Elle sert à centraliser les revenus, les dépenses, les comptes bancaires, les catégories et les opérations récurrentes afin de comprendre rapidement sa situation financière.

## À quoi sert Moneylook ?

Moneylook aide à répondre à des questions simples :

- combien ai-je gagné sur une période ?
- combien ai-je dépensé ?
- quel est mon solde net ?
- quelles catégories consomment le plus de budget ?
- comment évoluent mes comptes bancaires mois par mois ?
- quelle est ma balance sur les comptes courants ?
- quelles dépenses ou revenus récurrents dois-je appliquer ce mois-ci ?

La plateforme est pensée pour garder la main sur le budget mensuel et sur la trésorerie.

## Connexion

L'accès se fait avec un email et un mot de passe.

L'utilisateur est créé par l'administrateur directement côté serveur. Il n'y a pas de formulaire d'inscription public.

L'option "Se souvenir de moi" mémorise uniquement l'email dans le navigateur. Le mot de passe n'est pas conservé.

## Accueil

La page d'accueil donne accès aux principales sections :

- statistiques
- dépenses
- revenus
- paramètres via l'icône engrenage

Le menu engrenage regroupe les éléments de configuration comme les catégories, les comptes bancaires, les types de compte, les dépenses récurrentes et les revenus récurrents.

## Catégories

Les catégories servent à classer les dépenses et les revenus.

Chaque catégorie possède :

- un nom
- une icône
- une couleur

La couleur et l'icône permettent d'identifier rapidement les catégories dans les listes et les statistiques.

Exemples :

- Courses
- Logement
- Restaurants
- Transport
- Salaire
- Épargne

## Types de compte

Les types de compte permettent de regrouper les comptes bancaires.

Exemples :

- compte courant
- épargne
- investissement

Le type système `current` représente les comptes courants. Il est utilisé dans les statistiques pour calculer la balance des comptes courants.

## Comptes bancaires

Un compte bancaire contient :

- un libellé
- une devise
- un solde initial
- une indication de compte par défaut
- un type de compte

Le compte par défaut est présélectionné dans les formulaires lorsque c'est possible.

Le solde initial sert à calculer l'évolution des comptes bancaires. En revanche, la balance des comptes courants dans les statistiques représente uniquement la différence entre entrées et sorties sur la période choisie.

## Dépenses

La page Dépenses liste les sorties d'argent.

Une dépense contient :

- une date
- un libellé
- un montant
- une catégorie
- un compte bancaire

Les montants sont saisis en devise réelle, par exemple `12.50`. L'application s'occupe de convertir en centimes côté technique.

## Revenus

La page Revenus liste les entrées d'argent.

Un revenu contient :

- une date
- un libellé
- un montant
- une catégorie optionnelle
- un compte bancaire

Exemples :

- salaire
- remboursement
- allocation
- vente ponctuelle

## Dépenses récurrentes

Une dépense récurrente sert de modèle pour créer rapidement une dépense réelle.

Elle contient :

- un libellé
- un montant
- un statut actif ou inactif
- une politique de date
- une fréquence
- une catégorie
- un compte bancaire

Les dépenses récurrentes actives peuvent être appliquées depuis la page Dépenses avec le bouton dédié à côté du bouton d'ajout.

Dans le tableau d'application, vous pouvez ajuster :

- le montant
- la date proposée
- la catégorie

Chaque ligne se sauvegarde séparément. Une fois sauvegardée, elle disparaît du tableau d'ajout.

## Revenus récurrents

Un revenu récurrent fonctionne comme une dépense récurrente, mais pour les entrées d'argent.

Il sert par exemple à préparer :

- salaire
- rente
- revenus locatifs
- remboursement régulier

Les revenus récurrents actifs peuvent être appliqués depuis la page Revenus.

## Politique de date

La politique de date permet de proposer automatiquement une date lors de l'application d'un élément récurrent.

Valeurs possibles :

- même jour
- dernier jour du mois
- premier jour ouvré
- dernier jour ouvré

La date proposée peut être modifiée avant l'enregistrement final.

## Listes

Les listes permettent de consulter, filtrer, trier et modifier les données.

Fonctions disponibles :

- tri par colonne
- recherche par colonne
- pagination
- ajout rapide via la ligne dédiée
- édition via modale
- suppression
- import lorsque la ressource le permet

Les colonnes booléennes sont affichées avec une coche verte ou une croix rouge.

Les identifiants techniques ne sont pas affichés dans les listes.

## Statistiques

La page Statistiques donne une vue globale du budget.

Elle permet de choisir une période avec une date de début et une date de fin.

Elle affiche notamment :

- total des revenus
- total des dépenses
- solde net
- revenus des comptes courants
- dépenses des comptes courants
- balance des comptes courants
- répartition des dépenses par catégorie
- montant par compte bancaire
- montant par type de compte
- vue annuelle avec revenus et dépenses par mois
- évolution mensuelle des comptes bancaires

La balance des comptes courants indique uniquement la différence entre les revenus et dépenses des comptes courants sur la période sélectionnée.

## Import

Certaines pages proposent un import.

Le fonctionnement exact dépend de la ressource importée. Après import, vérifier les lignes créées, les catégories et les comptes bancaires associés.

## Conseils d'utilisation

Commencer par créer :

1. les catégories
2. les types de compte
3. les comptes bancaires
4. les revenus récurrents
5. les dépenses récurrentes

Ensuite, appliquer les revenus et dépenses récurrents chaque mois, puis ajouter les opérations ponctuelles.

Pour suivre la trésorerie, consulter régulièrement la page Statistiques avec la période du mois courant.

Pour suivre le budget, regarder en priorité :

- le solde net
- la balance des comptes courants
- la répartition des dépenses par catégorie
- l'évolution mensuelle des comptes
