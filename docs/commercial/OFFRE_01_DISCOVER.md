# Offre DISCOVER
## Savoir ce que votre IA fait déjà, et ce que cela vous engage

*Version 1 — 30 septembre 2026. Document de cadrage commercial.*

---

## 1. Ce que le client achète

**Un état des lieux opposable de l'usage de l'IA dans son organisation, et la
liste ordonnée de ce qu'il doit traiter.**

Pas un audit qui se range dans un tiroir : un **registre vivant**, dans AIGMS,
que l'organisation garde et qui devient le socle des deux offres suivantes.

À l'issue de DISCOVER, le dirigeant sait répondre à quatre questions qu'il ne
sait pas trancher aujourd'hui :

1. **Qu'est-ce qui tourne réellement chez nous ?** — y compris ce que personne
   n'a déclaré.
2. **Qu'est-ce qui nous expose ?** — réglementairement, contractuellement,
   opérationnellement.
3. **Par quoi commencer ?** — un plan hiérarchisé, pas une liste de trente-huit
   contrôles.
4. **Qui répond de quoi ?** — nommément.

> **La phrase de vente.** « Vous ne pouvez pas gouverner ce que vous ne savez
> pas que vous employez. Trente jours après, vous le savez — et c'est écrit
> quelque part qui ne dépend pas de moi. »

---

## 2. Contenu distinctif

Ce qui distingue DISCOVER d'un audit de conformité classique, point par point.

### 2.1 Le Shadow AI se trouve, il ne se déclare pas

L'inventaire ne repose pas sur un questionnaire envoyé aux directions. Il croise
**quatre sources** :

| Source | Ce qu'elle révèle |
|---|---|
| Ateliers métier par processus | L'usage assumé, et le vocabulaire réel |
| Dépenses et abonnements (compta, cartes) | Les comptes personnels et les abonnements grand public |
| Journaux réseau / proxy / DLP, si disponibles | Les destinations effectivement appelées |
| Entretiens individuels courts | Ce qu'on ne dit pas en réunion |

**C'est ce croisement qui fait la différence.** Un questionnaire rend huit
systèmes ; le croisement en rend vingt-trois, dont les quinze que personne
n'avait déclarés — et ce sont eux qui exposent.

### 2.2 Le triage précède la conformité

On ne traite pas trente-huit exigences sur vingt-trois systèmes. On **cote la
criticité** de chaque usage sur une grille qui interroge les faits — données
personnelles, personnes vulnérables, autonomie, décision engageante, périmètre —
et l'effort de gouvernance suit la criticité.

**Conséquence commerciale** : le client voit tout de suite que 80 % de son
inventaire ne demande presque rien, et que l'effort porte sur trois ou quatre
usages. Ça rend la suite finançable.

### 2.3 La qualification réglementaire est posée, datée et révisable

Rôle au sens de l'**AI Act** (fournisseur, déployeur, importateur,
distributeur), niveau de risque, obligations de transparence (art. 50),
articulation avec le **RGPD** (art. 35 — AIPD) et **ISO/IEC 42001**.

**Ce qu'on ne fait pas** : promettre une conformité. On pose une qualification
motivée, avec sa date et son auteur, que l'organisation peut défendre et
réviser. Les échéances de l'AI Act ne sont jamais codées en dur : elles sont des
données de référentiel, versionnées.

### 2.4 Une étude d'impact réelle, pas un formulaire

Sur le ou les usages critiques : **ISO/IEC 42005** conduite pour de vrai —
parties prenantes (y compris celles que personne ne voit), bénéfices **et**
préjudices par domaine, mesures de réduction confiées et datées, **double
signature** : visa de méthode par le responsable de gouvernance, acceptation des
risques résiduels par le porteur.

C'est le livrable qui impressionne un DPO, un assureur ou un donneur d'ordre.

### 2.5 Tout atterrit dans l'outil, pas dans un rapport

Chaque constat devient une **donnée** : un cas d'usage, un risque coté, un
fournisseur à revoir, une action confiée avec une échéance. Le rapport est une
**vue** de ces données, pas leur seul support.

> **Ce qui vaut, commercialement.** À la fin de DISCOVER, le client a un
> environnement AIGMS peuplé. S'il s'arrête là, il garde un registre à jour et
> une abonnement. S'il continue, GOVERN part d'un socle et non d'une page
> blanche. **L'offre suivante se vend d'elle-même.**

---

## 3. Pré-requis

### 3.1 Fonctionnels — sans eux, la mission dérape

| Pré-requis | Pourquoi | Qui le fournit |
|---|---|---|
| **Un sponsor exécutif nommé**, avec mandat écrit | L'inventaire touche des usages non déclarés : sans mandat, les entretiens se ferment | Direction générale |
| **Un correspondant interne** disponible, 0,5 j/semaine | Il ouvre les portes, relance, tient le calendrier | Client |
| **La liste des processus métier** et des directions | Structure les ateliers ; évite de cartographier au hasard | Client |
| **Accès aux personnes** : 6 à 12 entretiens de 45 min | L'inventaire ne se fait pas sur pièces | Client |
| **Une politique d'usage IA existante**, même embryonnaire | Sert de point de départ ; son absence est elle-même un constat | Client |
| **Les contrats fournisseurs IA** en vigueur | La due diligence tiers s'appuie dessus | Achats / juridique |

**Point de vigilance à contractualiser** : l'engagement de disponibilité des
personnes. C'est la première cause de dérapage, et elle n'est pas de votre fait.

### 3.2 Techniques — légers, et c'est voulu

| Pré-requis | Détail |
|---|---|
| **Un environnement AIGMS** | Instance dédiée au client, hébergée par le partenaire ou en mutualisé |
| **Des comptes nommés** | Un par rôle sollicité : sponsor, correspondant, porteurs d'usage |
| **Un domaine de messagerie vérifié** | Les alertes partent nommément ; une adresse générique ruine la traçabilité |
| **Extraction des dépenses logicielles** | 12 mois, format libre (CSV, export compta) |
| **Journaux proxy / DLP**, *si l'organisation en dispose* | **Facultatif** — améliore l'inventaire sans le conditionner |

> **Ce qui n'est PAS requis, et c'est un argument** : aucune intégration,
> aucun connecteur, aucun accès aux systèmes de production, aucune installation
> chez le client. DISCOVER ne touche à rien.

---

## 4. Plan d'implémentation

Cinq séquences. Le découpage est calibré pour une **PME de 50 à 250 personnes**
avec 1 à 3 usages critiques ; le facteur ETI est donné au §5.

### Séquence 1 — Mandat et cadrage *(D0–D2)*

| Jour | Ce qui se fait | Livrable intermédiaire |
|---|---|---|
| J1 | Réunion de lancement, mandat signé, périmètre arrêté | Note de cadrage |
| J2 | Contexte, objectifs IA, parties intéressées, RACI des rôles | Matrice des rôles |

**Point de contrôle** : le périmètre est écrit et le sponsor l'a validé. Toute
extension ultérieure est un avenant.

### Séquence 2 — Inventaire *(D3)*

| Jour | Ce qui se fait |
|---|---|
| J3–J4 | Ateliers par processus (3 à 5 ateliers de 2 h) |
| J5 | Dépouillement dépenses, entretiens individuels, recoupement |

**Livrable** : registre des cas d'usage, systèmes, modèles, agents et jeux de
données — avec la **colonne qui fait mal** : déclaré / découvert.

### Séquence 3 — Triage et qualification *(D4–D5)*

| Jour | Ce qui se fait |
|---|---|
| J6 | Cotation de criticité sur la grille, usage par usage |
| J7 *(½)* | Pré-classification AI Act et screening des politiques |

**Point de contrôle** : la liste courte des usages critiques est arrêtée avec le
sponsor. C'est elle qui commande le reste de la mission.

### Séquence 4 — Approfondissement des usages critiques *(D6–D9)*

| Jour | Ce qui se fait |
|---|---|
| J7 *(½)*–J8 | Cotation des risques (ISO/IEC 23894) sur les usages retenus |
| J9 | Étude d'impact ISO/IEC 42005 sur l'usage le plus exposé |
| J10 *(½)* | Baseline données et sécurité ; due diligence des fournisseurs IA |

### Séquence 5 — Cible, plan et restitution *(D10–D12)*

| Jour | Ce qui se fait |
|---|---|
| J10 *(½)* | Maturité de gouvernance, appétence au risque, périmètre cible |
| J11 | Rédaction du rapport et du plan hiérarchisé |
| J12 *(½)* | **Restitution CODIR** et gate DISCOVERY |

> **Le gate est un vrai gate.** Trois issues : poursuivre vers GOVERN, ajuster
> le périmètre, ou s'arrêter avec un registre tenu. Le dire à l'avance rend la
> restitution crédible.

---

## 5. Charge estimée

### 5.1 Base de chiffrage

| Séquence | PME *(50–250 p., 1–3 usages critiques)* | ETI *(250–2000 p., 5–15 usages, 2–3 entités)* |
|---|---:|---:|
| 1 — Mandat et cadrage | 2 j | 3 j |
| 2 — Inventaire | 3 j | 7 j |
| 3 — Triage et qualification | 1,5 j | 3 j |
| 4 — Usages critiques | 2,5 j | 6 j |
| 5 — Cible, plan, restitution | 2 j | 4 j |
| **Total intervention** | **11 j** | **23 j** |

### 5.2 Options chiffrables séparément

| Option | Charge | Quand la proposer |
|---|---:|---|
| Étude d'impact supplémentaire | **+1,5 j** / usage | Dès 2 usages critiques |
| Atelier de sensibilisation dirigeants *(AI literacy)* | **+1 j** | Quand le sponsor doute d'embarquer son comité |
| Analyse des journaux proxy / DLP | **+2 j** | Quand la DSI en dispose et soupçonne du Shadow AI |
| Entité supplémentaire *(filiale, site)* | **+3 j** | Groupe multi-entités |
| Version anglaise des livrables | **+1,5 j** | Groupe international, donneur d'ordre étranger |

### 5.3 Traduction en proposition commerciale

> À multiplier par votre TJM. **Exemple avec un TJM de 900 € HT** :
>
> | Format | Jours | Honoraires HT | Abonnement AIGMS |
> |---|---:|---:|---:|
> | **DISCOVER PME** | 11 j | **9 900 €** | 390 €/mois |
> | **DISCOVER ETI** | 23 j | **20 700 €** | 390 €/mois |
>
> L'abonnement est **facturé au client par le partenaire d'hébergement** et
> court après la mission : c'est ce qui rend le registre vivant. Le mentionner
> dès la proposition évite la mauvaise surprise au renouvellement.

**Durée calendaire** : 4 à 6 semaines en PME, 8 à 10 en ETI. La contrainte
n'est pas la charge, c'est la disponibilité des personnes à interroger.

---

## 6. Livrables

| Livrable | Forme | Ce qu'il sert |
|---|---|---|
| Note de cadrage et mandat | Document signé | Borne le périmètre |
| **Registre des actifs et cas d'usage** | **Dans AIGMS**, exportable | Le socle de tout le reste |
| Matrice des rôles et RACI | Document + rôles créés dans l'outil | Nomme qui répond de quoi |
| Cotation de criticité | Dans AIGMS, par usage | Hiérarchise l'effort |
| Qualification réglementaire | Dans AIGMS, datée et motivée | Défendable devant un tiers |
| Registre des risques coté | Dans AIGMS | Alimente GOVERN |
| **Étude d'impact ISO/IEC 42005** | Dans AIGMS + export Word | Le livrable qui convainc |
| Due diligence fournisseurs IA | Dans AIGMS | Ouvre les revues tierces |
| **Rapport DISCOVER et plan hiérarchisé** | Document + présentation CODIR | La décision |

---

## 7. Ce que l'offre ne couvre pas

À écrire noir sur blanc dans la proposition — c'est ce qui protège la mission.

- **Aucune mise en conformité.** DISCOVER constate et hiérarchise ; GOVERN
  construit.
- **Aucun développement, aucune intégration.** Pas de connecteur, pas de
  reprise de données automatisée.
- **Aucune certification, aucun avis d'audit.** Les livrables ne valent ni
  déclaration de conformité ni conclusion d'audit accrédité.
- **Aucun conseil juridique.** La qualification réglementaire est une lecture
  méthodologique, à faire confirmer par le conseil du client si l'enjeu le
  justifie.
- **Aucune reproduction du texte des normes.** Les référentiels s'obtiennent
  auprès de l'ISO ; AIGMS en exprime les exigences en propre.

---

## 8. Les trois offres, et pourquoi celle-ci d'abord

| | **DISCOVER** | GOVERN | ASSURE |
|---|---|---|---|
| La question | *Que faisons-nous déjà ?* | *Comment le tenons-nous ?* | *Comment le prouvons-nous dans la durée ?* |
| Méthode | DISCOVERY & ASSESS | BUILD & CONNECT | OPERATE |
| Nature | Ponctuelle | Projet | Récurrente |
| Charge PME | **11 j** | 24 j | 2 j/mois |
| Abonnement | 390 €/mois | 790 €/mois | 1 490 €/mois |

> **L'argument d'enchaînement.** « DISCOVER ne vous engage à rien au-delà de
> DISCOVER. Mais il vous donne la seule chose qui rend la suite chiffrable :
> **la liste de ce qui compte vraiment chez vous.** Sans elle, on vous vendra
> un programme de conformité au forfait, et vous paierez pour des systèmes qui
> n'exposent personne. »
