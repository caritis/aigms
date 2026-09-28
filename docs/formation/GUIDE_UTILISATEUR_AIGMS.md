# AIGMS — Guide de l'utilisateur

*Support de formation. Version 1 — 28 septembre 2026.*

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

## 2. Les dix mots d'AIGMS

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
| **Administrateur client** | Les accès de votre organisation, et l'arbitrage quand il vous revient | Cas d'usage · Processus et risques |
| **Porteur de l'IA** | Déclarer l'usage, répondre de son fonctionnement, fournir les preuves | Cas d'usage · Processus et risques |
| **Comité des risques** | Coter, traiter ou **accepter** un risque — en votre nom | Processus et risques |
| **Expert métier (DPO / RSSI)** | Être consulté sur les contrôles et la conformité | Cas d'usage · Processus et risques |
| **Comité de direction** | Trancher là où cela engage l'entreprise | **Pilotage** · Décisions |
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

### Geste 6 — Produire une preuve

Sur la ligne d'un contrôle applicable, une **icône de pièce**. Sa couleur dit
l'état : rouge quand rien ne démontre le contrôle, verte quand une pièce
validée et non échue le démontre.

Deux filtres, *Avec preuve(s)* et *Sans preuve*, réduisent la liste.

> **La règle, partout dans l'outil.** Un contrôle n'est pas tenu parce qu'on l'a
> déclaré opérant. Il est tenu parce qu'une **pièce validée et non échue** le
> démontre. Une preuve expirée cesse de compter, sans que personne n'ait à
> intervenir.

### Geste 7 — Conduire l'étude d'impact

**Cas d'usage → Conduire une étude d'impact IA.**

Les parties prenantes, les constats, leur gravité et leur vraisemblance, les
mesures de réduction. Un constat sévère **ouvre une action bloquante** : elle
apparaît dans le suivi et retient la mise en production.

### Geste 8 — Décider

**Onglet Décisions et changements.**

La décision de mise en production traverse les **passerelles**. L'écran liste
ce qui est satisfait et ce qui ne l'est pas, contrôle par contrôle.

> **L'écart de preuve.** Si des contrôles applicables ne sont pas démontrés,
> l'application ne bloque pas — mais elle **avertit par courriel et par
> notification la personne appelée à se prononcer**, qui doit assumer l'écart
> en son nom, avec une justification. Cette personne peut ensuite approuver.
> C'est l'un des moments où la chaîne de responsabilité se voit le mieux.

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

Six exercices, sur l'organisation de démonstration. Comptez deux heures.

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

### TP 5 — Produire une preuve *(15 min)*

Cochez le filtre *Sans preuve*. Déposez une preuve sur un contrôle. **À
observer :** l'icône qui change de couleur et le compte qui descend.

### TP 6 — Décider, et assumer un écart *(20 min)*

Tentez une mise en production avec des contrôles non démontrés. **À observer :**
l'avertissement, le courriel envoyé à la personne appelée à se prononcer, et ce
qu'elle doit écrire pour assumer l'écart.

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

**Qui peut voir ce que je saisis ?**
Toutes les personnes de votre tenant, selon leur rôle. L'écriture, elle, est
strictement bornée — et toute opération sensible est portée au journal, avec
votre nom et la date.

---

*Ce guide décrit AIGMS au 28 septembre 2026. Les écrans évoluent ; les règles
qu'il énonce sont tenues par la base de données et changent rarement.*
