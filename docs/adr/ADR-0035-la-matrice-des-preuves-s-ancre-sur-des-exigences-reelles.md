# ADR-0035 — La matrice des preuves s'ancre sur des exigences réelles

*Statut : acceptée — 30 septembre 2026.*
*Migrations : 0112, 0113, 0114, 0115.*

## Ce qui a été constaté

Sur la page **Preuves**, la carte « Preuves attendues » annonçait, pour une
organisation de profil *utilisateur métier* :

> **Critique · Surveillance continue et dérive** — 0/0 valide — *Déposer*

Le propriétaire a posé la question qui met le doigt dessus : **cette preuve
n'est proposée nulle part, et n'est rattachée à aucun contrôle.** Elle avait
raison sur les deux points, et pour trois causes distinctes.

### 1. Deux références qui n'existent pas

La typologie `DRIFT` citait **ISO/IEC 42001 A.10.5 et A.10.6**. Le chapitre A.10
de l'annexe A s'intitule « Relations avec les tiers et les clients » et s'arrête
à **A.10.4**. Ces deux références n'existent ni dans la norme, ni dans notre
table `requirement`.

La chaîne qui relie une typologie à un contrôle passe par là :

```
evidence_typology → evidence_typology_reference → requirement
                  → control_requirement_map → control
```

Une référence absente rompt la chaîne **en silence** : la jointure ne rend rien,
et rien ne signale qu'elle n'a rien rendu. La typologie la plus critique du
profil est restée orpheline sans que rien ne le dise.

L'ancre juste existait pourtant, et le contrôle qui la sert aussi :
**A.6.2.6 « Exploitation et surveillance »** — *« le système en service est
surveillé […] la dérive de performance… »* — que sert **AIGMS-MON-004
« Détection de la dérive »**.

### 2. D'autres ancres hors sujet

En vérifiant les sept autres typologies, quatre pointaient sur des exigences qui
existent mais parlent d'autre chose. La matrice elle-même en signalait une, dans
son champ `reference_warnings`, et personne n'avait donné suite.

### 3. Aucun contrôle jamais rattaché à un article du règlement

Le catalogue de contrôles nomme le référentiel **`AI_ACT`** et écrit
`Art. 14 (contrôle humain)`. La table des exigences le nomme **`EU_AI_ACT`** et
écrit `Art. 14`. L'instanciation comparait les deux chaînes à l'identique.
**Soixante-dix correspondances n'ont jamais produit un seul rattachement.**

## Décision

### A — Les ancres sont corrigées (0112, 0113)

| Typologie | Retiré | Posé | Motif |
|---|---|---|---|
| **DRIFT** | A.10.5, A.10.6 | **A.6.2.6**, A.6.2.8 | N'existent pas. A.6.2.6 nomme la dérive ; A.6.2.8 porte le journal des arbitrages humains |
| **XAI** | A.10.2, A.10.4 | **A.6.2.7**, A.8.2 | Répartition des responsabilités et relations clients : contractuel, pas explicabilité |
| **ISOL** | A.7.3, A.7.4 | **A.4.5** | Acquisition et qualité des données ne disent rien du cloisonnement des calculs |
| **GREEN** | A.8.4 | **A.4.5** | A.8.4 traite de la communication des incidents — avertissement déjà porté par la matrice |
| **CYBER** | A.6.2.3 | **A.6.2.4** | La documentation de conception consigne des choix ; elle ne démontre pas qu'on a testé |
| **ALIGN** | — | + **A.6.2.4** | L'alignement se démontre par la validation avant mise en service |
| **FAIR** | — | + **A.5.4** | L'équité se juge sur les personnes affectées, pas seulement sur les données |

`INTG` était juste, et n'a pas bougé.

**Un garde-fou empêche la récidive.** `app.orphan_typology_references()` rend
les références à l'annexe A que la matrice cite sans qu'elles existent, et un
test exige qu'elle rende zéro ligne. Il se borne à l'annexe A : le corps de la
norme — 6.1.2, 8.4, 9.3 — n'est délibérément pas chargé, et le citer reste
légitime. Le volet « Références que le référentiel chargé ne porte pas » le dit
déjà à l'écran, et c'est la bonne place pour une lacune assumée.

### B — Les articles du règlement se rejoignent (0115)

La normalisation se fait **à la jointure**, pas dans les données :
`app.normalize_framework_code` reconnaît le règlement sous ses deux noms,
`app.normalize_requirement_reference` ramène `Art. 14 §4 d) (passer outre,
inverser)` à `Art. 14`.

Le libellé long **reste écrit dans le catalogue** : il dit à quel titre le
contrôle répond à l'article, et c'est une information qu'un auditeur lit. On ne
réécrit pas une source pour faire marcher une jointure.

Les contrôles déjà retenus rattrapent leurs rattachements manquants : sans cela,
la correction n'aurait valu que pour les contrôles retenus après elle.

### C — Une typologie dit ce qui la sert (0114)

`app.typology_coverage` rend désormais, par typologie, **les contrôles de
l'organisation qui la servent** et **les exigences qui l'ancrent**.

La carte distingue alors deux silences qu'elle confondait :

| Situation | Ce que l'écran dit | Ce qu'il propose |
|---|---|---|
| Un contrôle la sert, aucune preuve | *Servie par AIGMS-MON-004 · A.6.2.6, A.6.2.8* | **Déposer** |
| **Rien ne la sert** | *Aucun contrôle ne la sert* + bandeau ambre | **Retenir un contrôle** → Déclaration d'Applicabilité |

Le second ne se solde pas en déposant un document. Proposer « Déposer » là où
aucun contrôle n'existe menait à un formulaire qu'on ne savait pas remplir.

## Conséquences

- **DRIFT est servie.** Sur le jeu de démonstration, elle porte ses deux ancres
  et le contrôle qui les tient.
- **La Déclaration d'Applicabilité gagne deux exigences couvertes** — *Contrôle
  humain* et *Obligations de transparence* — qui figuraient « non couvertes »
  alors que des contrôles les servaient depuis l'origine.
- **Le jeu de démonstration a changé.** L'exclusion contestée portait sur A.7.4,
  qui ne porte plus de typologie : elle porte maintenant sur A.4.5, et le motif
  — *« l'infrastructure est fournie par notre hébergeur : sa documentation vaut
  la nôtre »* — est précisément ce qu'un auditeur conteste à un hébergeur.
- **Cinq tests nouveaux** tiennent la chaîne : aucune référence inventée, chaque
  typologie garde au moins une ancre, la dérive est servie, le règlement se
  reconnaît sous ses deux noms, les contrôles rejoignent les articles chargés.

## Ce qui reste ouvert

- **La pertinence des ancres n'est pas testable.** Le garde-fou vérifie qu'une
  référence existe, pas qu'elle convient. Les sept corrections ci-dessus sont
  argumentées une par une dans `matrice-preuves.json` (`reference_corrections`),
  et **une relecture humaine reste un préalable à tout usage commercial** — ce
  que la matrice disait déjà d'elle-même.
- **Les articles non chargés restent non chargés.** Art. 10, 13, 15, 40, 61 du
  règlement, et ISO/IEC 27001 : la matrice les cite, AIGMS ne les porte pas, et
  l'écran le dit plutôt que de le taire.
- **Le lien typologie ↔ contrôle reste indirect**, par l'exigence. La question
  posée puis mise en pause — *déduire la typologie de preuve du contrôle sur
  lequel on dépose* — devient réalisable maintenant que la chaîne tient.
