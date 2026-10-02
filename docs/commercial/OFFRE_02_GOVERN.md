> ## ⚠ Document remplacé
>
> **Ce document est caduc depuis le 2 octobre 2026.** Il décrivait trois offres
> — Discover, Govern, Assure — chiffrées en jours × TJM 900 €.
>
> La structuration retenue en compte **huit offres** à **prix de résultat**, avec
> un TJM de **650 € HT** réservé au hors-périmètre, et des charges nettement
> plus serrées. Elle vit dans le catalogue Izarralde
> *(`Catalogue_Izarralde_AI_Governance_TJM650`)*.
>
> **Ne pas s'en servir en rendez-vous.** Conservé pour mémoire du raisonnement
> de cadrage ; à supprimer sur accord du propriétaire.

---

# Offre GOVERN
## Construire le système de management de l'IA, et le brancher sur le réel

*Version 1 — 30 septembre 2026. Document de cadrage commercial.*

---

## 1. Ce que le client achète

**Un système de management de l'IA qui fonctionne — pas un corpus documentaire.**

À l'issue de GOVERN, l'organisation ne possède pas seulement des politiques :
elle possède une **chaîne qui tient de bout en bout**, du cas d'usage déclaré
jusqu'à la décision de mise en production signée, en passant par les contrôles,
l'outillage qui les sert et les preuves qui les démontrent.

Le test de recette n'est pas « les documents sont-ils écrits ? » mais :

> **Un cas d'usage traverse-t-il toute la chaîne, jusqu'à une décision de mise
> en production approuvée par quelqu'un qui en répond, avec les preuves
> rattachées ?**

Si oui, la mission est faite. Sinon, elle ne l'est pas — quel que soit le nombre
de pages livrées.

> **La phrase de vente.** « La plupart des programmes de conformité produisent
> des classeurs que personne n'ouvre. Celui-ci produit un dossier qu'un
> auditeur peut ouvrir, et une chaîne que vos équipes utilisent parce qu'elle
> leur sert. »

---

## 2. Contenu distinctif

### 2.1 La règle BUILD / CONNECT / DON'T BUILD

C'est le cœur de la méthode, et c'est ce qui distingue l'offre d'un projet de
conformité classique.

| | Ce que cela veut dire | Exemple |
|---|---|---|
| **BUILD** | Ce qui n'existe nulle part et que la gouvernance doit porter | Registre des cas d'usage, cotation, décisions, preuves |
| **CONNECT** | Ce qui existe déjà chez le client et qu'on **branche** | Le SIEM, le DLP, la GED, l'ITSM, l'IAM |
| **DON'T BUILD** | Ce qu'on **refuse** de reconstruire | Un SIEM, un DLP, un IAM, une CMDB, un ITSM |

> **L'argument qui désarme l'objection budgétaire.** « Je ne vais pas vous
> vendre un outil qui refait ce que vous payez déjà. Votre DLP reste votre DLP.
> Ce que j'apporte, c'est le lien : **ce contrôle-là est tenu par ce
> produit-là, et voici la preuve.** »

### 2.2 Les contrôles sont outillés, pas seulement écrits

Un contrôle qui énonce un moyen sans le nommer ne se prouve pas. GOVERN pose,
pour chaque contrôle applicable :

- **sa nature** — organisationnel, technique, contractuel ;
- **ce qui le sert** — le produit réellement employé chez le client, pas une
  famille générique ;
- **sur quoi il porte** — l'actif d'IA concerné ;
- **la preuve attendue**, et son échéance de renouvellement.

Le référentiel AIGMS-CF fournit **120 contrôles-types** en 12 domaines, avec
leurs questions d'évaluation, leurs preuves attendues et leurs correspondances
ISO/IEC 42001 et AI Act. On n'écrit pas les contrôles : on **retient** ceux qui
s'appliquent, et on les instancie chez le client.

### 2.3 Les passerelles de gouvernance sont tenues par la machine

Les jalons du cycle de vie — Triage, Évaluation, Revue, Approbation, Pilote,
Production — ne sont pas des cases dans un tableur. Chaque passage est **évalué
côté serveur**, et la mise en production porte **huit préconditions** :

1. Classification réglementaire complète et validée
2. Aucun risque élevé ou critique sans traitement ni acceptation
3. Étude d'impact achevée lorsqu'elle est requise
4. Revue fournisseur close pour chaque tiers impliqué
5. Supervision humaine approuvée, ou non applicable et justifiée
6. Applicabilité statuée pour tous les contrôles obligatoires
7. Décision de mise en production approuvée et en vigueur
8. Aucune action bloquante ouverte

> **Ce qui convainc un dirigeant.** « Ce n'est pas une politique qu'on peut
> oublier d'appliquer. Le système refuse le passage, et il dit laquelle des
> huit manque. On ne peut pas mettre en service par inadvertance. »

### 2.4 Ce qui n'est pas prêt s'assume, il n'est pas interdit

Une organisation réelle met en service avec des écarts. Le nier produit des
contournements ; les interdire produit des systèmes parallèles.

GOVERN installe donc la règle inverse : **un écart se déclare, se nomme et
s'assume nominativement.** La personne qui décide voit, avant de signer, les
contrôles sans preuve et les préconditions manquantes, avec l'explication de
celui qui demande. Elle coche, elle signe, et cela reste au dossier — **figé
tel qu'il était ce jour-là**.

C'est ce qu'un auditeur vient chercher, et c'est ce qu'aucun tableur ne sait
faire.

### 2.5 La séparation des rôles est portée par la base

L'auteur d'une mise en production, d'une acceptation de risque ou d'une
exception **ne peut pas l'approuver lui-même**. L'arbitrage d'un cas critique
revient à deux rôles seulement — la direction et l'administrateur client. Le
porteur d'un système ne valide pas ses propres preuves.

Ce ne sont pas des réglages d'écran : ce sont des règles de base de données. Une
gouvernance qui se contourne en changeant un paramètre ne vaut rien.

### 2.6 CONNECT : les intégrations qui comptent, et seulement elles

| Intégration | Ce qu'elle apporte | Effort |
|---|---|---|
| **Annuaire / SSO** | Les personnes sont celles de l'entreprise, les rôles suivent | Faible |
| **GED / stockage de preuves** | Les pièces restent où elles vivent ; AIGMS les référence | Faible à moyen |
| **ITSM** *(tickets)* | Les actions de remédiation rejoignent le flux d'exploitation | Moyen |
| **SIEM / DLP / passerelle IA** | Les journaux alimentent les preuves techniques | Moyen à fort |
| **Achats / contrats** | La revue fournisseur s'appuie sur le contrat réel | Moyen |

**Règle de cadrage** : on retient **deux intégrations au maximum** dans la
mission de base. Au-delà, c'est une option chiffrée. C'est la deuxième cause de
dérapage après la disponibilité des personnes.

---

## 3. Pré-requis

### 3.1 Le pré-requis qui commande tout

> **DISCOVER achevé, ou un équivalent fourni par le client.**

GOVERN construit sur un inventaire coté et une qualification posée. Sans eux, la
mission commence par les refaire — et le chiffrage saute. Si le client a déjà un
inventaire, prévoir **2 jours de reprise et de validation** et le dire dans la
proposition.

### 3.2 Fonctionnels

| Pré-requis | Pourquoi |
|---|---|
| **Un responsable de gouvernance IA désigné**, 1 j/semaine | C'est lui qui portera le système après vous. S'il n'existe pas, la mission produit un outil orphelin |
| **Un porteur nommé par cas d'usage** | Il accepte les risques résiduels ; personne ne peut le faire à sa place |
| **Un responsable redevable** par cas d'usage | Il répond du dossier ; il arbitre |
| **Un comité capable de se prononcer** | Direction ou administrateur client : quelqu'un doit pouvoir approuver une mise en production |
| **Une politique d'usage IA approuvée**, ou la décision de l'écrire | Premier contrôle du référentiel ; son absence bloque la chaîne |
| **Les contrats des fournisseurs IA** | Les clauses contractuelles sont des contrôles à part entière |
| Disponibilité métier : **1 à 2 ateliers de 2 h par semaine** | La construction se fait avec eux, pas pour eux |

### 3.3 Techniques

| Pré-requis | Détail | Criticité |
|---|---|---|
| **Environnement AIGMS provisionné** | Instance client, base isolée, sauvegardes | Bloquant |
| **Comptes nommés pour tous les rôles** | Un compte partagé ruine la traçabilité nominative | Bloquant |
| **Domaine de messagerie vérifié** | Les alertes et décisions partent nommément | Bloquant |
| **SSO / annuaire**, si retenu | Protocole, habilitations, référent technique | Selon périmètre |
| **Accès en lecture aux systèmes à connecter** | Un compte de service par intégration retenue | Selon périmètre |
| **Stockage des preuves** | Volume, rétention, localisation à arrêter | Bloquant |
| **Politique de conservation** | Combien de temps gardent-ils leurs preuves | Structurant |

> **Ce qui reste hors périmètre technique** : aucune modification des systèmes
> du client. AIGMS lit et référence ; il ne pilote ni ne reconfigure.

---

## 4. Plan d'implémentation

Six séquences. Calibré **PME, 1 à 3 usages critiques, 1 à 2 intégrations**.

### Séquence 1 — Socle de gouvernance *(B0–B3)*

| Jours | Ce qui se fait |
|---|---|
| J1–J2 | Mobilisation, architecture cible, périmètre du SMIA |
| J3 | Politique IA, accountability, objectifs et indicateurs |

**Point de contrôle** : la politique est rédigée et le circuit d'approbation est
lancé. Elle n'a pas besoin d'être signée pour continuer, mais son absence à la
fin bloque la recette.

### Séquence 2 — Registres et cycle de vie *(B4–B5)*

| Jours | Ce qui se fait |
|---|---|
| J4–J5 | Reprise de l'inventaire DISCOVER, configuration des registres |
| J6 | Jalons, passerelles, matrice des décisions par statut |

### Séquence 3 — Processus de maîtrise *(B6–B12)*

| Jours | Ce qui se fait |
|---|---|
| J7–J8 | Processus de gestion des risques, appétence, traitements |
| J9 | Processus d'étude d'impact et déclencheurs |
| J10 | Gouvernance des données, sécurité by design, interface ISO 27001 |
| J11 | Supervision humaine et niveaux d'autonomie |
| J12 | Gouvernance des tiers, modèles et agents |
| J13 *(½)* | AI literacy : plan de compétence et communication |

### Séquence 4 — Contrôles, preuves et incidents *(B13–B17)*

| Jours | Ce qui se fait |
|---|---|
| J13 *(½)*–J15 | **Bibliothèque de contrôles** : sélection, applicabilité, outillage |
| J16 | Gestion des preuves : typologies, échéances, renouvellement |
| J17 | Incidents, non-conformités, CAPA |
| J18 | Changements, réévaluation, revue de direction |

**C'est la séquence la plus lourde, et celle qui porte la valeur.** Ne pas la
compresser : c'est là que le système devient utilisable.

### Séquence 5 — CONNECT *(B18–B19)*

| Jours | Ce qui se fait |
|---|---|
| J19 | Conception des intégrations retenues, contrats d'interface |
| J20–J21 | Mise en œuvre, reprise de données, paramétrage AIGMS |

### Séquence 6 — Pilote et recette *(B20–B21)*

| Jours | Ce qui se fait |
|---|---|
| J22–J23 | **Pilote opérationnel** : un cas d'usage traverse toute la chaîne |
| J24 | Revue de préparation interne, gate BUILD, transfert de compétence |

> **Le pilote est le vrai livrable.** Faites-le sur un cas d'usage réel et
> exposé, pas sur un exemple. C'est ce que le client racontera en interne.

---

## 5. Charge estimée

### 5.1 Base de chiffrage

| Séquence | PME *(1–3 usages, 1–2 intégrations)* | ETI *(5–15 usages, 3–4 intégrations, 2–3 entités)* |
|---|---:|---:|
| 1 — Socle de gouvernance | 3 j | 6 j |
| 2 — Registres et cycle de vie | 3 j | 6 j |
| 3 — Processus de maîtrise | 6,5 j | 13 j |
| 4 — Contrôles, preuves, incidents | 5,5 j | 12 j |
| 5 — CONNECT | 3 j | 7 j |
| 6 — Pilote et recette | 3 j | 6 j |
| **Total intervention** | **24 j** | **50 j** |

### 5.2 Options chiffrables séparément

| Option | Charge | Quand la proposer |
|---|---:|---|
| Intégration supplémentaire | **+2 à 4 j** | Au-delà de deux, selon la complexité |
| Cas d'usage critique supplémentaire | **+2 j** | Contrôles, étude d'impact, supervision |
| Reprise d'un inventaire existant *(sans DISCOVER)* | **+2 j** | Client venant avec ses données |
| Rédaction complète de la politique IA | **+2 j** | Quand le client n'a rien et ne peut pas l'écrire |
| Formation des utilisateurs *(2 sessions)* | **+2 j** | Systématique au-delà de 10 utilisateurs |
| Accompagnement à la certification ISO/IEC 42001 | **+5 à 8 j** | Client visant la certification |
| Entité supplémentaire | **+8 j** | Groupe multi-entités |

### 5.3 Traduction en proposition commerciale

> **Exemple avec un TJM de 900 € HT** :
>
> | Format | Jours | Honoraires HT | Abonnement AIGMS |
> |---|---:|---:|---:|
> | **GOVERN PME** | 24 j | **21 600 €** | 790 €/mois |
> | **GOVERN ETI** | 50 j | **45 000 €** | 790 €/mois |
> | **DISCOVER + GOVERN PME** | 35 j | **31 500 €** | — |

**Durée calendaire** : 10 à 14 semaines en PME, 5 à 7 mois en ETI. La charge
s'étale : compter **2 à 2,5 jours par semaine** de présence effective.

> **Argument de séquencement à l'usage du commercial.** Proposer GOVERN en deux
> tranches — séquences 1 à 4, puis 5 et 6 — avec une décision entre les deux.
> Le client achète moins d'un coup, et la deuxième tranche se vend sur un
> système qu'il voit déjà fonctionner.

---

## 6. Livrables

| Livrable | Forme |
|---|---|
| Politique de gouvernance de l'IA | Document, circuit d'approbation |
| Périmètre du SMIA et parties intéressées | Document + configuration |
| **Registres configurés et peuplés** | Dans AIGMS |
| Jalons et passerelles paramétrés | Dans AIGMS, testés |
| Processus risques, impact, données, supervision, tiers | Documents + configuration |
| **Bibliothèque de contrôles applicables et outillés** | Dans AIGMS |
| Plan de gestion des preuves et échéances | Dans AIGMS |
| Processus incidents / CAPA / changements | Documents + configuration |
| Intégrations en service | Techniques + documentation d'exploitation |
| **Déclaration d'Applicabilité** | Dans AIGMS, exportable |
| **Dossier du pilote** | Un cas d'usage complet, décision signée |
| Rapport de revue de préparation interne | Document + présentation |
| Transfert de compétence | Guide utilisateur + 2 sessions |

---

## 7. Ce que l'offre ne couvre pas

- **Aucune certification.** GOVERN prépare ; l'organisme certificateur décide.
- **Aucune reconstruction d'outillage de sécurité.** SIEM, DLP, IAM, CMDB,
  ITSM, garde-fous d'exécution, observabilité de modèles : hors périmètre, par
  principe méthodologique.
- **Aucun développement spécifique dans AIGMS.** Les évolutions produit suivent
  la feuille de route de l'éditeur.
- **Aucune exploitation.** L'exécution dans la durée relève d'ASSURE.
- **Aucun conseil juridique** ni avis d'audit.
- **Aucune garantie de conformité.** Le système rend la conformité
  démontrable ; il ne la décrète pas.

---

## 8. Ce qui change pour le client, avant / après

| | Avant GOVERN | Après GOVERN |
|---|---|---|
| Un nouvel usage IA | Se met en place, on l'apprend après | Se déclare, se trie, se décide |
| Un contrôle | Une ligne dans un tableur | Un contrôle statué, outillé, prouvé |
| Une mise en production | Un courriel de validation | Une décision nominative, avec ses écarts assumés |
| Un audit | Deux semaines de reconstitution | Un export |
| Un départ du responsable | Le savoir part avec lui | Le dossier reste |

> **La phrase de clôture de la proposition.** « Le jour où votre responsable de
> gouvernance change de poste, ce qu'il savait reste dans le système. C'est la
> définition d'un système de management : il survit aux personnes. »
