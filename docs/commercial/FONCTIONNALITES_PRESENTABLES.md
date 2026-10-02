# AIGMS — Ce qui se présente aujourd'hui

*Inventaire commercial de la version en service. Version 1 — 2 octobre 2026.*

---

## Comment lire ce document

**Tout ce qui suit existe, fonctionne et se montre en démonstration.** Les
chiffres ont été relevés en base, pas estimés. Ce qui n'est pas encore là
figure au **chapitre 9**, séparément — pour que personne ne le promette par
inadvertance.

Trois colonnes de lecture :

| Pictogramme | Sens |
|---|---|
| **◆** | **Différenciateur** — ce que les concurrents ne font pas, ou mal |
| ● | Attendu du marché — il faut l'avoir, cela ne se vend pas seul |
| ▸ | Détail qui convainc en démonstration |

---

## 1. Le socle : multi-tenant, multi-organisations, par rôle

| | Fonctionnalité | À dire |
|---|---|---|
| ● | **Multi-tenant natif** avec isolation en base | Un cabinet gère N clients sans qu'aucun ne voie les autres |
| ◆ | **Isolation testée, pas déclarée** | 402 tests automatisés, dont une large part sur l'isolation et les droits |
| ● | **Huit rôles** : officer, administrateur client, porteur, expert, comité des risques, comité de direction, auditeur, administrateur plateforme | Le RACI est documenté et **appliqué par la base** |
| ◆ | **Le menu s'ordonne selon le rôle**, sans rien masquer | Un comité de direction voit ses décisions en tête ; l'auditeur ne porte aucune pastille — il constate, il ne solde rien |
| ● | Portefeuille multi-organisations *(Pilotage)* | Le partenaire voit ses clients d'un écran |
| ▸ | **Journal d'audit** horodaté et nominatif sur les opérations sensibles | Exportable |

> **L'argument de fond.** « Les règles de gouvernance ne sont pas des réglages
> d'écran. Elles sont dans la base de données. Changer un paramètre ne les
> contourne pas. »

---

## 2. Registre des usages et triage

| | Fonctionnalité | À dire |
|---|---|---|
| ● | **Registre des cas d'usage** : finalité, processus, porteur, redevable, utilisateurs, personnes concernées, données, autonomie | L'unité de gouvernance — tout s'y rattache |
| ● | **Registre des actifs d'IA** : système, modèle, agent, jeu de données | Quatre natures distinctes, expliquées à la saisie |
| ◆ | **Un produit, deux rôles, une saisie** | Une passerelle d'appels IA est *gouvernée* ET *instrument de contrôle*. Le rôle **se déduit**, il ne se choisit pas |
| ● | **Registre des fournisseurs** avec revue tierce | La revue conditionne la mise en production |
| ◆ | **Triage de criticité sur grille de faits** | On ne demande pas « est-ce critique ? » mais des faits — données personnelles, vulnérabilité, autonomie, décision engageante — et la criticité se calcule |
| ◆ | **Cartographie processus → activités → cas d'usage**, avec quatre vues : Processus, Couverture, Risques, **Graphe** | Le graphe montre **où la chaîne rompt** |
| ▸ | Création d'un fournisseur ou d'un actif **sans quitter l'écran** | On n'oblige jamais à sortir pour créer ce qui manque au moment où il manque |

---

## 3. Qualification réglementaire

| | Fonctionnalité | À dire |
|---|---|---|
| ● | **Qualification AI Act** : rôle de l'organisation, niveau de risque, drapeaux | Datée, motivée, révisable |
| ◆ | **Les échéances réglementaires ne sont jamais codées en dur** | Elles sont des données de référentiel, versionnées : le règlement bouge, le produit suit sans redéploiement |
| ● | Articulation **RGPD** : l'AIPD est référencée, jamais remplacée | *« L'étude d'impact IA ne s'y substitue pas : elle la référence »* |
| ▸ | Quatre référentiels chargés : **ISO/IEC 42001** *(41 exigences)*, **ISO/IEC 42005**, **EU AI Act**, **RGPD** | Extensible par import |

---

## 4. Risques

| | Fonctionnalité | À dire |
|---|---|---|
| ● | Registre des risques, cotation **vraisemblance × gravité** | Treize catégories définies, pas un champ libre |
| ◆ | **Les échelles portent le mot, pas seulement le chiffre** | *« 4 — Probable »*, avec la définition du cran sous le champ. Deux personnes cotent pareil |
| ◆ | **Le niveau se calcule, il ne se saisit pas** | Il ne peut pas diverger de sa cotation |
| ◆ | **Proposition de contrôles pendant la frappe** | On décrit un risque en français ; l'application va chercher dans le référentiel ce qui le traite. Recherche plein texte française + similarité, **sans IA générative** |
| ● | Traitement, acceptation nominative avec terme, clôture motivée | Une acceptation sans date de revue n'en est pas une |
| ◆ | **Recoter un risque accepté annule l'acceptation** | Si le niveau monte, l'acceptation tombe et son auteur est averti |
| ◆ | **Clore et effacer sont deux portes** | Le responsable du risque peut clore ; effacer est réservé à l'erreur de saisie, et refusé dès que le risque a produit quelque chose |

---

## 5. Contrôles, outillage et preuves

### 5.1 Contrôles

| | Fonctionnalité | À dire |
|---|---|---|
| ● | **Référentiel AIGMS-CF : 120 contrôles-types en 12 domaines**, versionné *(3 versions chargées)* | Objectif, questions d'évaluation, preuves attendues, responsable, fréquence, correspondances ISO 42001 et AI Act |
| ◆ | **Proposition motivée de contrôles par cas d'usage** | *« Déclenchée : des données personnelles sont mobilisées »* — personne n'a coché une case pour le faire apparaître |
| ● | Applicabilité statuée par cas d'usage, justification exigée pour une exclusion | |
| ◆ | **Une fiche de contrôle en trois onglets** : applicabilité, actifs d'IA, outillage | Statuer, poser sur un actif et outiller **au même endroit** |
| ▸ | Filtres cumulés : état, domaine, outillage manquant | Un repli ne cache jamais un écart : la ligne fermée porte ce qui manque en ambre |

### 5.2 Outillage — **le différenciateur le plus vendeur**

| | Fonctionnalité | À dire |
|---|---|---|
| ◆ | **67 familles d'outillage** sur deux rangs, importables et extensibles | DLP, journalisation, passerelle d'appels IA, détection de dérive, red teaming… |
| ◆ | **Le référentiel suggère la famille ; le client nomme le produit** | *« Ce contrôle se tient avec un outil de prévention des fuites »* devient *« il se tient avec Netskope, chez nous »* |
| ◆ | **CONNECT plutôt que rebuild** | AIGMS ne refait ni SIEM, ni DLP, ni IAM, ni CMDB, ni ITSM. Il **relie** le contrôle au produit qui le sert |
| ▸ | Carte d'outillage de l'organisation, export CSV | Ce que l'entreprise paie déjà, et ce que ça tient |

### 5.3 Preuves

| | Fonctionnalité | À dire |
|---|---|---|
| ● | Registre des preuves : dépôt de fichier, lien externe, déclaratif | **Empreinte SHA-256** calculée au dépôt |
| ◆ | **Un dépôt n'est pas une validation** | Deux actes, deux personnes : celui qui fournit n'atteste pas de sa propre pièce |
| ◆ | **Une preuve expirée cesse de compter**, sans intervention | Et l'action de renouvellement s'ouvre d'elle-même |
| ◆ | **Matrice des preuves attendues : 8 typologies techniques × 4 profils d'activité** | Un hébergeur et une PME utilisatrice n'ont pas les mêmes preuves à produire. **Ce n'est pas de l'indulgence, c'est de la pertinence** |
| ◆ | **La carte dit ce qui sert chaque typologie** — ou que rien ne la sert | Une preuve sans contrôle à démontrer ne démontre rien |
| ▸ | Renouvellement : la nouvelle pièce remplace l'ancienne **à sa validation** | Jusque-là, l'ancienne reste ce qui vaut |

---

## 6. Étude d'impact ISO/IEC 42005

| | Fonctionnalité | À dire |
|---|---|---|
| ◆ | **Quatre rubriques du modèle normatif**, conduites dans l'outil | Cadrage, parties prenantes, analyse croisée, plan de remédiation |
| ● | Douze domaines d'impact en quatre familles, bénéfices **et** préjudices | On ne conduit pas une étude à charge |
| ◆ | **Trois régimes commandés par la gravité** | Grave → action **bloquante** ; significatif → action suivie ; limité → rien |
| ◆ | **La mesure EST l'action** | Pas de recopie d'un rapport Word vers un plan d'action Excel : corriger l'échéance dans l'étude corrige l'action |
| ◆ | **Double signature** : visa de méthode par l'officer, acceptation des risques résiduels par le porteur | **Une même personne ne pose pas les deux.** La base le refuse |
| ● | Renvoi à l'étude motivé par le porteur, qui fait tomber le visa | |
| ◆ | **Export Word au format du modèle, déposé comme preuve d'un clic** | Et une seule fois par achèvement : une deuxième version passe par une réouverture motivée |
| ▸ | La rubrique 3 ne se saisit pas | Une mesure ne s'invente pas dans un plan d'action : elle répond à un constat |

---

## 7. Décisions et passerelles — **le cœur de la démonstration**

| | Fonctionnalité | À dire |
|---|---|---|
| ◆ | **Cycle de vie à 12 statuts, passerelles évaluées côté serveur** | On ne met pas en service par inadvertance |
| ◆ | **Huit préconditions sur la mise en production**, évaluées en continu | Classification, risques, étude d'impact, revue fournisseur, supervision humaine, contrôles obligatoires, décision, actions bloquantes |
| ◆ | **Trois portes, trois questions** : faire avancer l'instruction, décider, déclarer un changement | Le partage n'est pas avant/arrière : c'est **ce qui instruit** contre **ce qui engage** |
| ● | Huit types de décision, registre complet, date d'effet, date de revue | |
| ◆ | **Séparation des rôles portée par la base** | L'auteur d'une décision engageante ne peut pas l'approuver. Jamais, quel que soit son rôle |
| ◆ | **L'arbitrage critique revient à deux rôles seulement** | Administrateur client et comité de direction — calibré PME |
| ◆ | **AIGMS n'interdit pas, il fait assumer** | Écart de preuve **et** écart de jalon : la personne qui décide les voit, les assume nominativement, et cela reste **figé** au dossier |
| ◆ | **Approuver ne met rien en service tant que le jalon n'est pas prêt** | Un accord de principe tracé, qui n'ouvre pas la porte |
| ◆ | **La décision reprend le dossier** | Objet, énoncé, justification et contexte **proposés** d'après ce qui a déjà été posé — et l'écran dit que ce sont des propositions |
| ◆ | **Moteur de réévaluation sur changement** | Modèle, données, autonomie, population… : le moteur dit ce qu'il rouvre et **ouvre la décision lui-même**, déjà rédigée |

> **La phrase qui emporte la démonstration.** « L'outil ne m'a pas interdit de
> demander la mise en production. Il m'a obligé à dire devant tout le monde ce
> qui n'était pas fait, et il l'a envoyé à celui qui doit signer. Interdire,
> n'importe quel outil sait le faire. **Faire assumer, c'est autre chose.** »

---

## 8. Pilotage, alertes et restitution

| | Fonctionnalité | À dire |
|---|---|---|
| ◆ | **Déclaration d'Applicabilité** générée, exigence par exigence | Le document qu'un auditeur ouvre en premier |
| ◆ | **Le régime de preuve dépend du rôle de l'organisation** | Technique, organisationnelle, exclusion motivée |
| ▸ | Quatre compteurs **filtrants**, combinables, portés par l'adresse | Le lien se partage tel quel |
| ● | **Suivi d'actions et d'incidents**, CAPA, actions bloquantes | |
| ● | **Revues de gouvernance** : cadence, ordre du jour, relevé | |
| ◆ | **31 natures d'alerte**, nominatives, dans l'application et par courriel | Et la décision soumise part **sur-le-champ**, pas à la tâche planifiée du lendemain |
| ▸ | Réglage des notifications par personne | Synthèse à la cadence de chacun |
| ● | **Huit vues d'impression** : registre, actifs, preuves, Déclaration, étude d'impact, incident, revue, journal | |
| ▸ | Exports : Word *(étude d'impact, incident)*, CSV *(outillage)*, journal | |

---

## 9. Ce qui n'est **pas** encore là

À connaître avant d'entrer en rendez-vous. Ne jamais le promettre.

| Sujet | État réel | Quoi dire si on vous le demande |
|---|---|---|
| **Connecteurs automatisés** *(SIEM, DLP, ITSM, GED)* | La colonne existe en base ; **aucun connecteur livré** | « Le branchement se conçoit en mission ; l'outil référence, il ne tire pas encore les preuves tout seul » |
| **SSO / annuaire** | Non livré | « Comptes nommés aujourd'hui ; le raccordement est au programme » |
| Import en masse d'un inventaire existant | Partiel — référentiels et outillage s'importent, pas les cas d'usage | « L'inventaire se saisit, et c'est souvent ce qu'on veut : la saisie est le moment où l'on comprend » |
| **API publique** | Non | — |
| Multilingue | Français uniquement | « L'anglais est une option de mission » |
| **Typologie de preuve déduite du contrôle** | En cours | Ne pas annoncer |
| Déclaration d'Applicabilité pour d'autres référentiels qu'ISO 42001 | Le modèle le permet ; une seule est livrée | « Le moteur est multi-référentiel ; la Déclaration ISO 42001 est celle qui est faite » |

> **Règle d'or commerciale.** AIGMS **ne garantit aucune conformité** et ne vaut
> **ni certification ni avis d'audit**. Il rend la conformité *démontrable*.
> Cette phrase protège autant la vente que la mission — et elle figure dans
> l'application elle-même, sur la Déclaration d'Applicabilité.

---

## 10. Les cinq arguments à retenir

Si vous ne deviez en garder que cinq, ceux-ci.

1. **Les règles sont dans la base, pas dans l'écran.** Séparation des rôles,
   passerelles, acceptations nominatives : rien ne se contourne en changeant un
   paramètre.

2. **AIGMS n'interdit pas, il fait assumer.** C'est ce qui le rend utilisable
   par une PME réelle — et c'est ce qui produit le dossier qu'un auditeur vient
   chercher.

3. **CONNECT plutôt que rebuild.** Votre DLP reste votre DLP. Ce qu'apporte
   l'outil, c'est le lien : *ce contrôle-là est tenu par ce produit-là, et voici
   la preuve.*

4. **L'effort suit la criticité.** Le triage par les faits montre que 80 % de
   l'inventaire ne demande presque rien. C'est ce qui rend le programme
   finançable.

5. **Chaque acte porte un nom et une date.** Le jour où le responsable de
   gouvernance change de poste, ce qu'il savait reste dans le système.

---

## Annexe — Les chiffres, relevés en base

| | |
|---|---:|
| Contrôles-types *(par version du référentiel)* | **120** |
| Versions du référentiel chargées | 3 |
| Domaines de contrôle | 12 |
| Familles d'outillage | **67** |
| Exigences normatives chargées | 45 |
| Typologies de preuve techniques | 8 |
| Profils d'activité | 4 |
| Types de décision | 8 |
| Statuts du cycle de vie | 12 |
| Rôles | 8 |
| Natures d'alerte | 31 |
| Préconditions de la mise en production | 8 |
| Écrans de l'application | 37 |
| Vues d'impression | 8 |
| Tables en base | 65 |
| Migrations versionnées | 121 |
| Tests automatisés | **402** |
