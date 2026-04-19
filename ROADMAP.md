# Roadmap Moneylook

Ce document présente les grandes orientations prévues pour les prochaines versions de Moneylook.

## Version actuelle

La version actuelle permet de suivre son budget personnel avec :

- comptes bancaires
- types de compte
- catégories
- dépenses
- revenus
- dépenses récurrentes
- revenus récurrents
- statistiques globales
- répartition des dépenses
- évolution mensuelle des comptes

L'objectif principal est de donner une vue claire sur le budget mensuel et la trésorerie.

## V2 - Assistant intelligent basé sur un LLM

La V2 intégrera un chatbot basé sur un LLM afin d'aider l'utilisateur à comprendre sa situation financière plus simplement.

L'objectif n'est pas d'ajouter un chatbot généraliste, mais un assistant spécialisé dans les données Moneylook.

Il devra permettre de poser des questions en langage naturel, par exemple :

- "Pourquoi mes dépenses ont augmenté ce mois-ci ?"
- "Combien ai-je dépensé en restaurants sur les trois derniers mois ?"
- "Quelle catégorie pèse le plus dans mon budget ?"
- "Quelle est ma balance sur les comptes courants ce mois-ci ?"
- "Est-ce que je peux mettre 300 CHF de côté ce mois-ci ?"
- "Compare mes revenus et dépenses entre mars et avril."
- "Quels sont les mouvements inhabituels ?"

## Fonctionnalités envisagées

### Analyse de la situation

Le chatbot pourra expliquer la situation globale :

- total des revenus
- total des dépenses
- solde net
- balance des comptes courants
- évolution des comptes bancaires
- catégories principales de dépense
- variations par rapport à une autre période

### Questions sur les données

L'utilisateur pourra demander des informations sans devoir chercher manuellement dans les tableaux :

- dépenses par catégorie
- revenus par période
- opérations d'un compte bancaire
- montants par type de compte
- dépenses ou revenus récurrents actifs
- comparaison entre périodes

### Détection d'anomalies

Le LLM pourra aider à expliquer des anomalies détectées par l'application :

- dépense inhabituellement élevée
- doublon probable
- revenu récurrent non appliqué
- dépense récurrente non appliquée
- compte courant qui baisse fortement
- catégorie dont le montant augmente rapidement

### Résumés automatiques

Moneylook pourra générer des résumés clairs :

- résumé mensuel
- résumé annuel
- points d'attention
- catégories à surveiller
- tendance de trésorerie

### Aide à la saisie

Le chatbot pourra proposer :

- une catégorie pour une dépense
- un compte bancaire probable
- une reformulation de libellé
- la création d'une dépense ou d'un revenu récurrent

Les actions de création ou de modification devront toujours être confirmées par l'utilisateur avant enregistrement.

## Principes de conception

La V2 devra respecter plusieurs principes :

- le LLM ne doit pas inventer les chiffres
- les calculs doivent rester faits par Moneylook
- le LLM doit expliquer les résultats, pas remplacer la logique métier
- aucune action sensible ne doit être exécutée sans confirmation explicite
- les données envoyées au LLM doivent être limitées au strict nécessaire
- la clé API du fournisseur LLM doit rester côté backend

## Architecture envisagée

Le front enverra les questions au backend.

Le backend préparera un contexte limité et structuré, appellera le LLM, puis renverra une réponse au front.

Flux envisagé :

```txt
Utilisateur
  -> Front Moneylook
  -> Backend Moneylook
  -> Outils de stats et données internes
  -> LLM
  -> Backend Moneylook
  -> Front Moneylook
```

Pour éviter les réponses approximatives, le backend pourra fournir au LLM des outils spécialisés :

- récupérer un résumé de période
- récupérer les dépenses par catégorie
- récupérer les balances des comptes
- comparer deux périodes
- détecter les opérations inhabituelles
- rechercher des opérations

## Étapes possibles

1. Chatbot en lecture seule sur les statistiques existantes.
2. Questions en langage naturel sur les dépenses, revenus et comptes.
3. Résumés mensuels automatiques.
4. Détection et explication d'anomalies.
5. Suggestions de catégories et de règles de saisie.
6. Préparation d'actions confirmables par l'utilisateur.

## Objectif produit

La V2 doit transformer Moneylook en copilote de budget personnel.

L'utilisateur doit pouvoir comprendre rapidement où va son argent, ce qui change dans son budget, ce qu'il peut améliorer, et quelles décisions prendre pour garder la main sur sa trésorerie.
