# AIGMS — Guide de l'utilisateur

*Support de formation. Version 2 — 2 octobre 2026.*

---

## 1. À qui s'adresse ce guide

À toute personne qui reçoit un compte AIGMS : AI Governance Officer,
administrateur client, porteur d'une solution d'IA, comité des risques, DPO ou
RSSI, comité de direction, auditeur.

Il se lit dans l'ordre pour une première prise en main, et se consulte par
section ensuite. Le **chapitre 4** dit ce que l'application attend de vous
selon votre rôle : commencez par là si vous êtes pressé.

> **Une phrase à retenir avant tout le reste.** AIGMS n'automatise aucune
> décision de gouvernance. Il propose, il calcule, il rappelle, il refuse — mais
> **c'est toujours une personne nommée qui décide, et son nom reste attaché à ce
> qu'elle a décidé.**

---

## 2. Les treize mots d'AIGMS

Ces mots ont un sens précis dans l'application. Les confondre fait perdre du
temps, et parfois fausse un dossier.

| Mot | Ce qu'il désigne | Ce qu'il n'est pas |
|---|---|---|
| **Cas d'usage** | Un emploi de l'IA dans un métier : « générer les devis ». C'est l'unité de gouvernance — tout s'y rattache. | Un outil, un projet, un service |
| **Actif d'IA** | Ce que le cas d'usage **emploie** : un modèle, un agent, un système, un jeu de données. C'est l'objet gouverné. | L'outil qui sert à le contrôler |
| **Outillage** | Ce **avec quoi** on tient un contrôle : passerelle d'appels IA, DLP, journalisation, supervision humaine. C'est l'instrument. | L'objet gouverné |
| **Contrôle-type** | Un modèle du référentiel : « AIGMS-SEC-008 — Prévention de l'exfiltration ». Il dit *quoi* maîtriser. | Une réalité de votre organisation |
| **Contrôle opérationnel** | Ce que votre organisation met **réellement** en œuvre, avec un responsable, un état et des preuves. | Un vœu |
| **Applicabilité** | Ce que **ce cas d'usage** retient d'un contrôle : applicable, non applicable, à déterminer. | L'état du contrôle |
| **Preuve** | Une pièce **validée et non échue** qui démontre un contrôle. | Une déclaration de bonne foi |
| **Criticité** | Combien d'effort de gouvernance ce cas d'usage mérite. Se pose au triage. | Le niveau de risque |
| **Risque** | Un événement redouté, coté vraisemblance × gravité. | La criticité |
| **Passerelle** *(gate)* | Ce que l'application vérifie avant d'autoriser un changement d'étape. | Une formalité |
| **Décision** | Un acte de gouvernance : quelqu'un demande, quelqu'un d'autre accorde, et les deux restent au dossier. | Une validation par courriel |
| **Changement** | Un **fait** à venir sur le système : le modèle change, l'autonomie augmente, une population nouvelle est touchée. | Une décision |
| **Écart** | Ce qui manque au moment où l'on décide — une preuve, une précondition. Il se **déclare** et s'assume ; il n'interdit pas. | Un échec |

> **Le piège le plus fréquent : actif d'IA contre outillage.** Un même produit
> peut être les deux. Une passerelle d'appels IA est un **instrument de
> contrôle** — elle applique vos règles — *et* une **ressource du système** —
> elle traite vos données. Quand c'est le cas, déclarez-la « les deux » :
> l'application la fera entrer dans le périmètre gouverné.

---

## 3. Se repérer dans l'écran

### La barre du haut

De gauche à droite : la marque, puis **les sections de l'organisation sur
laquelle vous travaillez**, puis le **Pilotage** (votre portefeuille entier),
puis le nom de l'organisation courante, vos notifications, votre compte.

L'ordre des sections **dépend de votre rôle** : l'application met en tête ce
que vous avez à faire. Rien n'est retiré pour autant — tout reste accessible
sous le menu **Registres**, et un lien qu'on vous partage fonctionne toujours.

### Les pastilles chiffrées

Un chiffre dans la barre signale **ce qui appelle une action**. Il se survole,
et dit alors ce qu'il compte : « 1 risque élevé ouvert », « 38 exigences sans
décision ».

| Couleur | Sens |
|---|---|
| **Rouge** | C'est en retard — cela aurait déjà dû être fait |
| **Ambre** | Cela attend une main |

Le chiffre du **Pilotage** porte **tout le portefeuille**, pas seulement
l'organisation ouverte : le survol le précise.

> **Une pastille absente ne veut pas dire « rien à faire ».** Selon votre rôle,
> certaines sections ne vous sollicitent pas — vous en êtes *informé*, pas
> *saisi*. L'auditeur, par exemple, n'en porte aucune : il constate, il ne
> solde rien.

### La frise d'avancement

Sur la fiche d'un cas d'usage, huit pastilles reliées par des chevrons disent
**où en est le dossier** et dans quel sens il va.

- La pastille **pleine** est l'étape courante.
- Un **◆** marque un jalon obligatoire : le passage est refusé côté serveur
  tant que ses préconditions ne sont pas réunies, et le « i » du jalon les
  liste, évaluées en continu.
- Sous la frise, **ce qui s'ouvre d'ici** : chaque étape atteignable, le sens
  — `→` en avant, `↩` en arrière, `⨯` sortie — et si elle **se franchit** ou
  **se décide**.

> **Les issues s'ancrent, elles ne s'ajoutent pas.** « Approuvé sous
> conditions », « Refusé », « Suspendu » ne sont pas des étapes : ce sont des
> **issues** d'une étape. La frise les montre à leur place, dans leur couleur
> et **sous leur nom** — on ne lit pas « Approuvé » là où il est écrit « sous
> conditions ».

### Le « i » et le « ! »

Un rond **i** ouvre une explication : à quoi sert cet écran, ce qu'on s'y
trompe le plus souvent. Un rond **!** est un mode d'emploi à lire **avant**
d'agir, pas un complément qu'on peut ignorer.

Prenez l'habitude de les ouvrir la première fois. Ils contiennent les règles
que l'application applique, écrites en français.

---

## 4. Votre rôle : ce que l'application attend de vous

| Rôle | Ce dont vous répondez | Ce que la barre vous ouvre en premier |
|---|---|---|
| **AI Governance Officer** | Conduire le système de management : usages, risques, contrôles, preuves | Cas d'usage · Processus et risques |
| **Administrateur client** | Les accès de votre organisation, la mise en service, et **l'arbitrage des cas critiques** — qu'il partage avec le Comité de direction | Cas d'usage · Processus et risques |
| **Porteur de l'IA** | Déclarer l'usage, répondre de son fonctionnement, fournir les preuves | Cas d'usage · Processus et risques |
| **Comité des risques** | Coter, traiter ou **accepter** un risque — en votre nom | Processus et risques |
| **Expert métier (DPO / RSSI)** | Être consulté sur les contrôles et la conformité | Cas d'usage · Processus et risques |
| **Comité de direction** | Trancher là où cela engage l'entreprise, et **arbitrer les cas critiques** — qu'il partage avec l'Administrateur client | **Pilotage** · Décisions |
| **Auditeur** | Constater, sans rien modifier | **Pilotage** · Cas d'usage |
| **Administration de la plateforme** | Ouvrir les accès et entretenir les référentiels — **elle ne gouverne rien** | Ses propres écrans |

### Ce que votre rôle ne vous permet pas

L'application refuse en le disant, et la règle est tenue par la base de
données, pas par l'écran. Trois exemples que vous rencontrerez :

- **Accepter un risque** revient à la personne désignée responsable de ce
  risque, **et à elle seule**. Un autre rôle, même l'officer, se voit refuser
  l'acte, avec le nom de la personne à qui il revient.
- **Assumer un écart de preuve** à la mise en production revient à la personne
  appelée à se prononcer. Elle reçoit un courriel et une notification.
- **Effacer un risque** est fermé à son responsable : il en répond, il ne
  l'efface pas. Il peut le **clore**, ce qui n'est pas la même chose (§ 7).

---

## 5. Le fil d'un cas d'usage — huit gestes

C'est le cœur du travail quotidien. Les huit gestes se suivent, mais on y
revient : rien n'est figé, et tout changement laisse une trace.

### Geste 1 — Déclarer l'usage

**Cas d'usage → Déclarer un cas d'usage.**

Nommez-le par ce qu'il fait, pas par l'outil employé : « Génération de devis
par IA générative », non « ChatGPT ». Renseignez la finalité, le processus
métier, le porteur, le responsable redevable, les utilisateurs, les personnes
concernées, les données traitées, le niveau d'autonomie.

Puis, onglet **Avancement**, rattachez les **actifs d'IA** employés.

> **Ce que le rattachement déclenche.** L'actif apporte son fournisseur, et le
> fournisseur apporte sa revue. Une revue tiers non close deviendra une
> **précondition de mise en production** : la fiche l'affiche aussitôt.

### Geste 2 — Trier : la criticité

**Onglet Avancement → carte Criticité → la grille.**

Quatre questions. La grille ne décore pas : chaque réponse **écrit un fait** sur
la fiche. Répondre « des données personnelles » rend l'étude d'impact exigée,
pré-coche l'AIPD, et fait apparaître d'elles-mêmes les contrôles de protection
des données à l'étape 5.

### Geste 3 — Qualifier au regard du règlement

**Onglet Avancement → Qualification réglementaire.**

Le rôle de votre organisation — fournisseur, déployeur, importateur,
distributeur — et les drapeaux qui s'appliquent. AIGMS **ne décide pas** de
votre qualification : il l'enregistre, avec son motif, sa date et son auteur.

### Geste 4 — Coter le risque

**Onglet Risques → Identifier un risque.**

| Champ | Ce qu'on attend |
|---|---|
| **Intitulé** | L'événement redouté, en une ligne. Pas la cause, pas la parade |
| **Scénario** | Ce qui arrive, à qui, par quel enchaînement. C'est le seul champ qu'un auditeur relit |
| **Catégorie** | La nature de l'atteinte. L'infobulle donne les treize définitions |
| **Qui répond du risque** | Cette personne **seule** pourra l'accepter |
| **Vraisemblance × Gravité** | Deux crans de 1 à 5, **avant** tout traitement : c'est le risque inhérent |

Les deux listes portent le chiffre **et** le mot — « 4 — Probable », « 4 —
Majeure » — et la définition du cran choisi s'affiche dessous. Le niveau se
calcule et s'affiche **avant** d'enregistrer : « Critique — 4 × 4 = 16 ». Il
n'est jamais saisi, pour qu'il ne puisse pas diverger de sa cotation.

> **Ce qui se produit pendant que vous écrivez.** Dès que le scénario est
> rédigé, **sans que vous cliquiez**, l'assistant propose les contrôles du
> registre et des référentiels qui s'en approchent, avec l'extrait qui
> correspond. La catégorie entre dans la recherche : c'est elle qui sépare une
> fuite de données d'une erreur de calcul quand le scénario parle des deux.

### Geste 5 — Retenir les contrôles, et dire avec quoi ils se tiennent

**Onglet Contrôles affectés → Proposer des contrôles.**

L'assistant rend des dizaines de propositions, en deux groupes : **déclenchées**
par les faits que vous avez déclarés, et **socle**, attendues de tout cas
d'usage. Vous n'en retenez que ce qui vaut.

Pour vous y retrouver, la fenêtre porte en haut :

- une **recherche libre** — code, mot du titre, motif, nom d'outil ;
- des **pastilles de domaine** avec leur compte — GOV, SEC, SUP, DAT… ;
- un bouton **« ★ Les plus appropriés »** : ce qu'un fait de la fiche a
  déclenché, et ce que le référentiel rend obligatoire.

Chaque ligne concernée porte sa marque, `★ déclenché` ou `★ obligatoire`, et la
raison est écrite à côté.

#### Le crayon : la fiche d'un contrôle, en trois onglets

Sur chaque ligne de contrôle, un **crayon**. Il n'ouvre pas un champ, il ouvre
trois onglets :

| Onglet | Ce qu'on y fait |
|---|---|
| **Applicabilité** | Applicable, non applicable, à déterminer. La justification est **obligatoire** pour une exclusion |
| **Actifs d'IA** | Poser la mesure sur l'actif qui la porte — rattacher ou inscrire un actif si besoin |
| **Outillage** | Retenir le produit employé — le déclarer si besoin |

Un **point ambre** sur l'onglet *Actifs d'IA* signale qu'une mesure technique
applicable ne repose sur aucun actif. Vous le voyez sans ouvrir les trois
onglets.

Sur chaque onglet, le geste courant est en haut et son bouton reste visible en
bas pendant que vous faites défiler. Les gestes rares sont repliés — **sauf
quand le registre est vide**, où ils s'ouvrent d'eux-mêmes.

> **Le fournisseur se crée sur place.** Dans les deux formulaires de création,
> le champ *Fournisseur* porte « + Nouveau fournisseur… ». Deux champs, nom et
> pays, et le tiers naît avec l'actif ou avec l'outil — *revue non commencée*,
> ce que l'application vous dit aussitôt.

#### Un contrôle qui n'apparaît pas dans les propositions

Certains contrôles sont de **portée organisation** : la politique d'usage, le
comité, l'audit interne. Ils se tiennent **une fois pour toute l'organisation**
et ne s'affectent à aucun cas d'usage — ils ne figurent donc dans aucune
proposition de cas d'usage. Vous les retenez depuis **Registres → Contrôles et
outillages → Proposer les contrôles d'organisation**.

### Geste 6 — Produire une preuve, puis la valider

Sur la ligne d'un contrôle applicable, une **icône de pièce**. Sa couleur dit
l'état : rouge quand rien ne démontre le contrôle, verte quand une pièce
validée et non échue le démontre.

Deux filtres, *Avec preuve(s)* et *Sans preuve*, réduisent la liste.

#### Déposer : deux champs qu'on confond

La fenêtre de dépôt porte **deux listes voisines qui ne disent pas la même
chose**. C'est la confusion la plus fréquente de l'écran.

| Champ | Ce que c'est | Exemple |
|---|---|---|
| **Typologie de preuve** *(facultatif)* | L'une des **huit typologies techniques** de la matrice AIGMS, adossée à ISO/IEC 42001 : isolation, intégrité des données, équité, explicabilité, alignement, cybersécurité IA, surveillance et dérive, empreinte environnementale. | *Surveillance continue et dérive* |
| **Nature** | La **forme matérielle** de la pièce. | Document, capture d'écran, extrait de journal, attestation, résultat de test, configuration, déclarative |

Pour une charte ou une politique : **« — Aucune typologie technique »**, nature
**Document**. Une charte n'est pas une preuve d'ingénierie.

> **Le préfixe de criticité n'est pas décoratif.** La liste des typologies est
> triée par ce que **le rôle de votre organisation vis-à-vis de l'IA** rend
> exigeant. Un utilisateur métier voit *Surveillance et dérive* en **critique**
> et l'équité en **faible** ; un développeur de modèles verrait l'inverse. On
> ne vous demande pas de prouver l'équité d'un modèle que vous n'entraînez pas.

#### Valider : un second acte, et il n'est pas facultatif

**Registres → Preuves → filtre « À valider » → « Valider en mon nom ».**

> **Un dépôt n'est pas une validation.** La pièce arrive « à valider », et
> celui qui la fournit n'atteste pas lui-même de sa recevabilité. Tant que ce
> second acte n'a pas eu lieu, **la preuve existe mais ne démontre rien** — et
> c'est exactement ce que l'application en fait.

Conséquence concrète : une **mise en production s'appuie sur au moins une pièce
validée**. Si le registre n'en porte aucune, la décision ne part pas, et
l'écran vous renvoie ici.

> **La règle, partout dans l'outil.** Un contrôle n'est pas tenu parce qu'on l'a
> déclaré opérant. Il est tenu parce qu'une **pièce validée et non échue** le
> démontre. Une preuve expirée cesse de compter, sans que personne n'ait à
> intervenir.

#### Où l'on voit ce qui manque

**Registres → Preuves**, carte **« Preuves attendues »**. Les huit typologies,
triées par criticité pour votre rôle — et, sous chacune, **ce qui la sert** :

| Ce qu'on lit | Ce que ça veut dire | Ce que l'écran propose |
|---|---|---|
| *Servie par AIGMS-MON-004 · A.6.2.6* | Un contrôle la porte, il manque la pièce | **Déposer** |
| *Aucun contrôle ne la sert* | Rien ne la porte : déposer n'y suffira pas | **Retenir un contrôle** |

Une preuve sans contrôle à démontrer ne démontre rien : c'est pourquoi le
second cas renvoie à la Déclaration d'Applicabilité au lieu d'ouvrir un
formulaire de dépôt.

### Geste 7 — Conduire l'étude d'impact

**Cas d'usage → Conduire une étude d'impact IA.**

L'écran suit le modèle **ISO/IEC 42005** en quatre rubriques. Trois se
saisissent ; **la quatrième s'écrit toute seule**.

| Rubrique | Ce qu'on y fait | Qui l'écrit |
|---|---|---|
| **1. Cadrage et contexte** | Périmètre, méthode, phase du cycle de vie, AIPD | Vous — le reste vient de la fiche |
| **1.1 Parties prenantes** | Les groupes affectés, vulnérables ou non, consultés ou non | Vous |
| **2. Analyse croisée** | Bénéfices et préjudices, par domaine de la norme | Vous |
| **3. Plan de gouvernance et remédiation** | Les mesures devenues actions, confiées et datées | **L'application** |

**Les rubriques se replient**, et une rubrique fermée n'est pas muette : elle
porte sa ligne de résumé — *« 3 groupe(s) · aucun vulnérable · 1 consulté »*,
*« 2 mesure(s) · 1 action bloquante »*. Le cadrage se replie de lui-même dès
qu'un constat existe.

#### Les parties prenantes : chercher celui qu'on n'a pas vu

Un groupe affecté **directement ou non**. Les utilisateurs en sont, rarement
les seuls : les personnes dont les données sont traitées, celles qui subissent
la décision sans jamais voir l'outil, et les tiers dont les informations
transitent sans qu'ils l'aient demandé.

**Cocher « groupe vulnérable »** renforce le niveau d'examen attendu : la
gravité d'un préjudice ne se cote pas de la même façon quand celui qui le subit
ne peut ni le refuser ni le contester.

#### Les constats : trois régimes, commandés par la gravité

Chaque constat est un **bénéfice** ou un **préjudice**, dans l'un des douze
domaines de la norme, groupés en quatre familles. Le champ *Gravité* devient
*Ampleur* sur un bénéfice, et le cadre « mesure de réduction » disparaît : on
ne réduit pas un bénéfice.

| Gravité du préjudice | Ce que l'application en fait |
|---|---|
| **Grave** | Une action **bloquante** : le jalon Production ne passera pas |
| **Significative** | Une action **suivie**, non bloquante |
| **Limitée** ou négligeable | **Rien** — la ligne affiche *« Aucune action — gravité limitée »* |

#### Deux champs marqués *facultatif* qui ne le sont qu'en apparence

Dans le cadre **Mesure de réduction** :

**L'échéance devient la date de l'action.** Vous la saisissez, l'action la
porte. Vous la laissez vide, l'application pose **soixante jours** sans le
dire. Vous la corrigez plus tard, l'action suit — tant qu'elle n'est ni close
ni annulée. Et c'est cette date qui rend l'action **en retard** : comptée dans
l'attention de l'organisation, portée en tête du courriel de son responsable.

**La gravité résiduelle est ce que le Porteur devra assumer.** C'est le seul
endroit où l'on dit ce qui reste **une fois la mesure en place**, et c'est
exactement la liste qu'il verra avant de signer.

| Vous renseignez | Ce que le Porteur assume |
|---|---|
| **Limitée** | Rien pour ce constat : il **sort** de la liste |
| **Rien** | La gravité **initiale** — comme si la mesure n'existait pas |
| Significative ou Grave | Ce niveau-là, et il signe en sachant quoi |

> **Renseigner « résiduel : limité » ne débloque rien.** L'action reste
> bloquante parce que le préjudice, lui, était grave : ce qui compte pour la
> production, c'est ce qui aurait lieu **sans** la mesure, tant qu'elle n'est
> pas faite. La gravité résiduelle dit à celui qui signe **ce qu'il signe**.

#### La rubrique 3 ne se saisit pas

Elle reprend les mesures de la rubrique 2 et donne, pour chacune, **le numéro
de l'action ouverte**, qui ramène à l'onglet *Actions et incidents* du cas
d'usage, sur la bonne ligne.

> **La mesure EST l'action.** On ne recopie pas une mesure d'un rapport vers un
> plan d'action : corrigez l'échéance dans l'étude, l'action suit. Et si vous
> voulez une mesure de plus, **ajoutez le constat qui la justifie** — c'est la
> différence entre un plan d'action et un plan d'action tracé.

#### Conclure : deux actes, deux signataires

L'AI Governance Officer **vise l'étude** — sa méthode tient. Le **Porteur de
l'IA accepte les risques résiduels** — l'organisation assume ce qui reste. Une
même personne ne pose pas les deux, et le Porteur peut **renvoyer l'étude** en
disant pourquoi : le visa tombe alors.

Avant de viser, la colonne de droite liste **ce qui manque** : partie prenante
absente, aucun constat, préjudice grave sans mesure, AIPD requise sans
référence. Quand tout est là : *« Rien ne manque : l'étude peut s'achever. »*

#### Après l'achèvement

Une **action s'ouvre** : *« Déposer la preuve de l'évaluation d'impact »*, à
trente jours. Et le pavé **Preuve** porte un bouton : **« Déposer l'export comme
preuve »** — un clic, l'export Word part au registre, à valider, et l'action se
solde.

> **Une étude ne se dépose qu'une fois par achèvement.** Le bouton disparaît
> ensuite. Pour en verser une autre version, il faut **rouvrir l'étude en
> disant pourquoi**, la réviser, la faire viser et accepter de nouveau. La
> nouvelle pièce **remplace** alors la précédente — et le remplacement ne prend
> effet qu'à **sa** validation : jusque-là, l'ancienne reste ce qui vaut.

### Geste 8 — Faire évoluer, et décider

**Le bouton « Faire évoluer », en tête de fiche.** L'onglet *Décisions et
changements* **se lit ; il ne se saisit pas** — sauf pour se prononcer sur une
décision qui attend, ce qui est un acte et non une saisie.

#### Trois portes, trois questions

| Intention | La question | Le statut |
|---|---|---|
| **Faire avancer l'instruction** | *Où en est le dossier ?* | change **tout de suite**, avec un motif |
| **Décider — ce qui engage** | *À quoi s'engage-t-on ?* | change **quand la décision est approuvée**, à sa date d'effet |
| **Déclarer un changement du système** | *Qu'est-ce qui change ?* | **ne bouge pas** |

> **« Faire avancer » ne veut pas dire « avancer ».** Le partage n'est pas
> entre l'avant et l'arrière, mais entre **ce qui instruit et ce qui engage**.
> Au début du cycle, franchir avance. Après l'approbation, **tout ce qui avance
> engage** — donc se décide — et il ne reste à franchir que le retour en
> arrière. La carte vous le dit quand c'est le cas.

Dans le sélecteur de transition, les cibles se rangent par sens :
`→ Poursuivre l'instruction`, `↩ Revenir en arrière`, `⨯ Sortir du parcours`.

#### Décider : neuf champs, dont quatre déjà rédigés

La fenêtre s'ouvre sur un bandeau : **« Reprise du dossier. »** L'objet, ce qui
est décidé, la justification et le contexte sont **proposés d'après ce que vous
avez déjà posé** — la finalité de la fiche, la criticité, les contrôles statués,
l'étude d'impact.

| Champ | Exigé | D'où vient la proposition |
|---|---|---|
| Type de décision | oui | — |
| Personne appelée à se prononcer | non | Celle qui tient l'arbitrage *(voir plus bas)* |
| Objet | oui, 5 car. | Type + nom de la fiche |
| **Ce qui est décidé** | oui, 20 car. | Type de décision |
| **Justification** | oui, 20 car. | Des faits **comptés**, pas une appréciation |
| **Contexte** | **oui**, 20 car. | La finalité de la fiche, mot pour mot |
| Options écartées · Conditions | non | *(repliées)* |
| Date d'effet · Date de revue | non* | Le jour même · dans un an |

\* La **date de revue devient exigée** sur une mise en production, qui réclame
aussi **au moins une preuve validée** rattachée.

> **Relisez-les.** Ce sont des propositions, pas des champs remplis à votre
> place : c'est votre nom qui les portera, et ce sont ces phrases qu'un auditeur
> lira. *« Ce qui est décidé »* n'est pas *« Justification »* : l'un est
> l'énoncé qui sera lu dans deux ans, l'autre le pourquoi.

#### Qui peut se prononcer

| Type de décision | Qui tranche |
|---|---|
| **Mise en production d'un cas critique**, **exception de politique**, **acceptation de risque** | **Deux rôles seulement** : l'Administrateur client et le Comité de direction |
| Mise en production ordinaire, autorisation d'usage, pilote | Les relecteurs habilités |

Et dans tous les cas : **l'auteur d'une décision engageante ne peut pas
l'approuver lui-même**. La base le refuse, quel que soit son rôle.

> **La garantie n'est pas dans le nombre de signataires, elle est dans la
> séparation.** Celui qui demande ne peut pas accorder.

#### Les deux écarts : AIGMS n'interdit pas, il fait assumer

À la soumission, si quelque chose manque, l'application **le montre et vous
demande de le dire** — elle ne refuse pas.

| Écart | Ce qu'il dit | Ce qu'on vous demande |
|---|---|---|
| **Écart de preuve** | Des contrôles applicables ne sont démontrés par aucune pièce validée | *« Ce que vous en dites »* |
| **Écart de jalon** | Des préconditions du jalon ne sont pas réunies | *« Ce que vous en dites »* |

Les préconditions s'affichent **en liste**, chacune avec ce qu'elle a constaté
et **le lien de l'écran qui la solde** — *« Clore les revues fournisseurs → »*,
*« Solder les actions bloquantes → »*.

La personne appelée à se prononcer reçoit les deux écarts **par alerte et par
courriel**, les retrouve dans sa fenêtre de verdict, et doit **cocher deux
cases** avant d'approuver. Chaque prise de connaissance est nominative.

> **Approuver ne met rien en service tant que le jalon n'est pas prêt.** La
> décision est enregistrée, la trace existe, et le statut **attend**. Celui qui
> a soumis reçoit alors *« Décision approuvée, jalon non franchi »*, avec ce qui
> manque. C'est un accord de principe tracé, qui n'ouvre pas la porte.

**Ce que la décision garde** : l'état des deux écarts **figé au moment de la
soumission**. Une preuve validée demain ne réécrit pas ce que l'approbateur a lu
aujourd'hui.

#### Déclarer un changement du système

La troisième porte. Vous déclarez **un fait** — modèle, données, finalité,
fournisseur, autonomie, population — à une date prévue. Le statut ne bouge pas.

Le **moteur de réévaluation** le qualifie, dit ce qu'il rouvre — qualification,
risques, contrôles, étude d'impact — et **s'il conclut à une réévaluation, il
ouvre la décision lui-même**, déjà rédigée à partir de ce que vous venez de
déclarer : les natures touchées, les faits cochés, l'écart d'autonomie chiffré,
et la date prévue, qui devient sa date d'effet.

Vous désignez **qui se prononcera** ; le Responsable redevable est proposé. Si
vous en désignez un autre — un changement arrêté en réunion, que le Porteur
déclare et fait trancher par la DSI — **le redevable en est informé quand
même** : il répond du cas d'usage.

> **C'est pourquoi « changement significatif » ne figure pas parmi les décisions
> qu'on soumet.** Il doublait cette porte, dans l'ordre inverse : s'engager puis
> analyser. **On ne sait pas d'avance si un changement engage** — c'est la
> réévaluation qui le dit. Et un changement ne s'approuve pas sans sa décision.

---

## 6. Les registres

| Registre | Ce qu'il contient | Le geste principal |
|---|---|---|
| **Contrôles et outillages** | Le dispositif de maîtrise réellement en place | *Proposer les contrôles d'organisation* |
| **Actifs d'IA et fournisseurs** | Ce que l'organisation emploie, et les tiers dont elle dépend | *Déclarer un actif d'IA* |
| **Décisions** | Ce qui a été décidé, par qui, sur quel motif | — |
| **Déclaration d'Applicabilité** | Exigence par exigence, ce qui est retenu ou écarté | — |
| **Preuves** | Les pièces, leur validité, leur échéance | *Déposer une preuve* |
| **Suivi d'actions et d'incidents** | Ce qui reste à faire, ce qui s'est passé | — |
| **Revues de gouvernance** | Les revues tenues et à tenir | — |

### Le registre des contrôles

Chaque contrôle est **replié**. La ligne fermée porte le code, l'intitulé, la
référence, le responsable, et **ce qui manque** en ambre : *sans responsable*,
*aucune exigence*, *rien à prouver*, *sans outillage*. Un repli ne cache jamais
un écart.

Trois filtres se cumulent : **état**, **domaine** (GOV, DAT, SEC…) et
**outillage manquant**.

> **Écrire un contrôle est l'exception.** Un contrôle écrit à la main n'est
> rattaché à aucun contrôle-type : il ne porte ni preuves attendues ni questions
> d'évaluation, et n'apparaît dans aucune proposition. Préférez toujours
> *Proposer*.

### La Déclaration d'Applicabilité

Le document qu'un auditeur ouvre en premier : exigence par exigence, ce qui la
couvre **chez vous** et dans quel état.

| État | Ce qu'il signifie |
|---|---|
| **Couverte et prouvée** | Un contrôle opérant, avec au moins une preuve rattachée |
| **Opérante sans preuve** | Le contrôle fonctionne, mais rien ne permet de le démontrer |
| **Contrôle déclaré** | Un contrôle est rattaché, sans être encore opérant |
| **Non couverte** | Aucun contrôle ne répond à cette exigence |

**Les quatre compteurs filtrent ce qu'ils comptent** : un clic réduit la liste,
un second l'ôte. Ils se combinent avec le filtre d'écart et celui d'objectif
sans les effacer, et l'adresse les porte — le lien se partage tel quel.

> **La règle d'or, écrite en tête de page.** *« Aucune case vide : chaque
> exigence est sélectionnée ou exclue, et justifiée. »* C'est le premier défaut
> qu'un auditeur relève, et le seul qui ne se rattrape pas par un argument.

**Le rôle de votre organisation commande le régime de preuve** : technique,
organisationnelle, exclusion motivée. Le même référentiel ne demande pas la même
chose à un hébergeur et à une PME qui achète un assistant — ce n'est pas de
l'indulgence, c'est de la pertinence.

> **Une exclusion n'est pas une case décochée** : c'est une décision signée,
> avec son motif et le nom de qui l'a portée. Le jour de l'audit, on ne vous
> demandera pas si vous avez tout fait — on vous demandera **ce que vous avez
> décidé, et pourquoi**.

### Le registre des actifs et fournisseurs

Le filtre porte les natures d'actif — système, modèle, agent, jeu de données —
**et une entrée Fournisseurs**, qui donne la liste complète des tiers : statut
de revue, criticité, pays, date, et les actifs que chacun fournit. L'entrée
passe en ambre quand une revue n'est pas approuvée.

### La carte d'outillage

**Registres → Contrôles et outillages → Outillage.**

Le référentiel classe les familles sur deux rangs :

- **Gouvernance de l'IA** — ce qui tient ou prouve un contrôle d'IA. C'est ce
  que la saisie propose en premier ;
- **Outillage informatique** — infrastructure, exploitation, sécurité du SI.
  Utile quand un contrôle d'IA s'appuie dessus, **mais ce n'est pas un
  inventaire à tenir**. AIGMS ne construit pas de CMDB.

Vous déclarez **le produit employé chez vous**, pas la famille : la différence
entre « se tient avec un outil de prévention des fuites » et « se tient avec
Netskope, chez nous ». La seconde formule dit à l'auditeur où prendre la preuve.

---

## 7. Ce que l'application refuse, et pourquoi

Ces règles sont tenues par la base de données. Elles s'appliquent quel que soit
l'écran, et quel que soit le rôle.

| Elle refuse | Parce que |
|---|---|
| Accepter un risque au nom d'un autre | Une acceptation est un acte nominatif |
| Accepter sans justification ni date de revue | Une acceptation sans terme n'en est pas une |
| Clore un risque sans motif | Une clôture sort le risque de la passerelle de production |
| Effacer un risque qui a produit quelque chose | Il se clôt ; l'effacement est réservé à l'erreur de saisie |
| Supprimer une organisation | Elle s'archive, pour que ses décisions restent lisibles |
| Saisir un niveau de risque | Il se calcule, pour qu'il ne diverge pas de sa cotation |
| Approuver sa propre décision engageante | Celui qui demande ne peut pas accorder |
| Approuver un arbitrage critique sans en tenir le rôle | Deux rôles seulement l'exercent |
| Approuver sans avoir déclaré connaître les écarts | Une prise de connaissance ne vaut que nominative |
| Soumettre un écart sans dire ce qu'il en est | Un écart tu n'est pas un écart assumé |
| Déposer deux fois la même étude d'impact | Une étude se dépose une fois par achèvement |
| Valider une preuve qu'on a déposée soi-même | On n'atteste pas de sa propre pièce |

> **Ce qu'elle ne refuse pas, et c'est délibéré.** Mettre en service avec des
> écarts. L'organisation n'est pas empêchée : elle est **mise devant ce qu'elle
> assume**, nommément, et la trace reste. Interdire produit des contournements ;
> faire assumer produit un dossier.

### Clore ou effacer un risque

Deux gestes, et ils ne servent pas la même chose.

**Clore** — pour un risque qui a vécu et n'a plus lieu d'être : périmètre
modifié, cas d'usage abandonné, risque absorbé par un autre. **Rien ne
disparaît.** Motif obligatoire, clôture en votre nom. Ouvert aussi au
responsable du risque.

**Effacer** — pour une ligne saisie par erreur : un doublon, un essai, un risque
porté sur le mauvais cas d'usage. Uniquement si elle n'a **rien laissé derrière
elle** : encore « identifié », jamais accepté, sans traitement, sans décision
qui la désigne, sans constat d'impact qui y renvoie. Réservé à l'officer et à
l'administrateur client. **Le journal en garde l'instantané complet, votre nom
et votre motif.**

### Recoter un risque déjà accepté

Une acceptation vaut **pour le niveau auquel elle a été donnée**. Si votre
correction fait **monter** le niveau, l'acceptation est retirée, le risque
revient à « identifié », et la personne qui l'avait acceptée en est avertie.
Une correction à la baisse ne change rien.

---

## 8. Administration

Réservée à l'administration de la plateforme. **Elle ne gouverne rien** : elle
ouvre les accès et entretient les référentiels.

### Importer un référentiel de contrôles

**Administration → Référentiels.** JSON canonique ou CSV au format du modèle.
Le document est validé au dépôt — structure, clés naturelles, domaines,
doublons — et **rien n'entre en base avant confirmation**. L'import est
atomique ; le fichier, son empreinte SHA-256 et son auteur sont conservés.

Une version publiée est **immuable** : pour la corriger, on en dépose une
nouvelle. Les contrôles déjà instanciés chez les clients ne bougent pas.

### Importer la typologie d'outillage

Même écran, même principe. **Le modèle CSV n'est pas un squelette vide : c'est
l'état réel de la typologie livrée.** On part de ce qui existe, on ajoute ou on
corrige une ligne, on redépose.

L'import **ajoute et met à jour ; il ne supprime jamais** — une famille absente
du fichier reste en place, parce qu'un produit peut y être déclaré chez un
client et un contrôle-type s'y rattacher.

---

## 9. Travaux pratiques

Huit exercices, sur l'organisation de démonstration. Comptez trois heures.

### TP 1 — Déclarer et trier *(20 min)*

Déclarez un cas d'usage de votre choix, rattachez-lui un actif d'IA, puis
remplissez la grille de criticité. **À observer :** ce que la dernière réponse
de la grille écrit sur la fiche, et ce qui change ensuite dans l'onglet
Avancement.

### TP 2 — Coter un risque *(20 min)*

Identifiez un risque avec un scénario d'au moins trois lignes. **À observer :**
le niveau qui s'affiche avant enregistrement, et les contrôles que l'assistant
propose **sans que vous cliquiez**. Changez la catégorie : les propositions
changent.

### TP 3 — Retenir des contrôles *(25 min)*

Ouvrez *Proposer des contrôles*. Utilisez la recherche, puis le filtre « les
plus appropriés ». Retenez-en trois. **À observer :** le motif écrit à côté des
propositions déclenchées.

### TP 4 — Équiper un contrôle *(25 min)*

Sur un contrôle technique, ouvrez le crayon. **À observer :** le point ambre sur
*Actifs d'IA*. Posez la mesure sur un actif, puis déclarez un outil — en créant
le fournisseur sur place. Vérifiez ensuite le fournisseur dans le registre.

### TP 5 — Produire une preuve, et la valider *(20 min)*

Cochez le filtre *Sans preuve*. Déposez une preuve sur un contrôle, en laissant
*Typologie de preuve* sur **« Aucune typologie technique »** et *Nature* sur
**Document**. **À observer :** l'icône passe à l'ambre, pas au vert.

Allez ensuite dans **Registres → Preuves → À valider** et validez la pièce en
votre nom. **À observer :** l'icône passe au vert, et le compte descend.
*Pourquoi deux temps ?* Un dépôt n'est pas une validation.

### TP 6 — Conduire une étude d'impact *(30 min)*

Ouvrez une étude et posez trois constats : un bénéfice, un préjudice **grave**
avec sa mesure, un préjudice **limité** sans mesure. **À observer :** la
rubrique 3 se remplit toute seule, le grave ouvre une action **bloquante**, le
limité n'ouvre rien.

Laissez l'échéance vide sur l'un, saisissez-la sur l'autre. **À observer :**
dans le suivi d'actions, l'une est datée à soixante jours, l'autre à votre date.

### TP 7 — Décider, et assumer deux écarts *(25 min)*

Tentez une mise en production sur un dossier incomplet. **À observer :** la
liste des préconditions remonte en tête, chacune avec le lien qui la solde, et
le champ *« Ce que vous en dites »* devient exigé.

Écrivez-le, soumettez. **À observer :** la décision part, le courriel aussi.

Connectez-vous au compte de la personne désignée. **À observer :** les **deux**
encadrés — écart de preuve et écart de jalon —, les **deux** cases à cocher, et
le fait qu'approuver **ne met rien en service** tant que le jalon n'est pas prêt.

### TP 8 — Déclarer un changement du système *(15 min)*

Déclarez un changement qui **augmente l'autonomie** d'un cas d'usage. **À
observer :** le statut ne bouge pas, le moteur qualifie, et **la décision
s'ouvre toute seule** — déjà rédigée avec les natures touchées, l'écart
d'autonomie chiffré et la date prévue.

*Pourquoi ne peut-on pas décider directement ?* Parce qu'on ne sait pas d'avance
si un changement engage.

---

## 10. Questions fréquentes

**Je ne vois pas une section dans le menu.**
Elle n'a pas disparu. Selon votre rôle, elle se trouve sous **Registres**.
Aucune section n'est retirée, et un lien partagé fonctionne toujours.

**Un chiffre de la barre me semble faux.**
Survolez-le : il dit ce qu'il compte. Le chiffre du Pilotage porte **tout le
portefeuille**, pas l'organisation ouverte.

**Une liste est vide alors que j'ai saisi des données.**
Vérifiez d'abord les filtres actifs. Si un bandeau rouge annonce qu'une lecture
a échoué, signalez-le : l'écran ne reflète alors pas l'état réel du dossier.

**Un contrôle du registre n'apparaît pas dans les propositions d'un cas
d'usage.**
Il est probablement de **portée organisation** : il se tient une fois pour toute
l'organisation, et ne s'affecte à aucun cas d'usage. C'est le modèle, pas une
anomalie.

**J'ai coté un risque trop haut. Puis-je corriger ?**
Oui, au crayon sur sa ligne. S'il était accepté et que le niveau monte,
l'acceptation est retirée et son auteur averti.

**Puis-je supprimer un cas d'usage ?**
Non. Comme une organisation, il s'archive : ses décisions et ses preuves
doivent rester lisibles.

**J'ai déposé une preuve, mais le contrôle reste rouge.**
Un dépôt n'est pas une validation. La pièce attend qu'une autre personne la
valide en son nom : **Registres → Preuves → À valider**.

**« Faire avancer l'instruction » est grisé.**
Depuis ce statut, tout ce qui reste **engage** l'organisation : cela se décide,
cela ne se franchit pas. La carte vous le dit en toutes lettres.

**Je ne trouve pas « Changement significatif » dans les types de décision.**
Il n'y est plus. Déclarez le changement par la troisième porte : le moteur de
réévaluation dira s'il appelle une décision, et l'ouvrira lui-même.

**J'ai approuvé la mise en production, mais le statut n'a pas changé.**
Le jalon n'était pas prêt. La décision est enregistrée, la trace existe, et le
statut attend que les préconditions soient réunies. Celui qui a soumis a reçu
une alerte qui dit lesquelles.

**Le bouton « Déposer l'export comme preuve » a disparu de mon étude.**
Elle est déjà déposée. Une étude ne se dépose qu'une fois par achèvement : pour
en verser une autre version, rouvrez-la en disant pourquoi, révisez-la, faites-la
viser et accepter de nouveau.

**La personne que je voulais désigner n'arbitre pas.**
Sur une mise en production critique, une exception de politique ou une
acceptation de risque, **deux rôles seulement** se prononcent : l'Administrateur
client et le Comité de direction. La liste le dit à côté de chaque nom.

**Qui peut voir ce que je saisis ?**
Toutes les personnes de votre tenant, selon leur rôle. L'écriture, elle, est
strictement bornée — et toute opération sensible est portée au journal, avec
votre nom et la date.

---

*Ce guide décrit AIGMS au 2 octobre 2026. Les écrans évoluent ; les règles
qu'il énonce sont tenues par la base de données et changent rarement.*

---

## Ce qui a changé depuis la version 1 *(28 septembre 2026)*

À l'usage des personnes déjà formées.

| Où | Ce qui a changé |
|---|---|
| **Frise d'avancement** | Chevrons, sens de la marche, et ce qui s'ouvre d'ici. Les issues — « sous conditions », « refusé », « suspendu » — s'ancrent sur leur étape |
| **Geste 6 — Preuve** | La distinction *Typologie de preuve* / *Nature* est explicitée. **La validation devient une étape à part entière** |
| **Geste 7 — Étude d'impact** | Quatre rubriques repliables ; les trois régimes de gravité ; l'échéance et la gravité résiduelle disent ce qu'elles commandent ; une étude ne se dépose qu'une fois |
| **Geste 8 — Décider** | « Faire évoluer » et ses trois portes renommées ; quatre champs repris du dossier ; **l'écart de jalon s'assume** comme l'écart de preuve ; l'arbitrage critique revient à deux rôles |
| **Changement du système** | « Changement significatif » quitte les types de décision : on déclare le fait, le moteur conclut |
| **Déclaration d'Applicabilité** | Les quatre compteurs filtrent ce qu'ils comptent |
| **Preuves attendues** | La carte dit **ce qui sert** chaque typologie, ou que rien ne la sert |
| **Travaux pratiques** | Huit au lieu de six : la validation, l'étude d'impact et le changement s'ajoutent |
