# Script de démonstration — Shadow AI dans le BTP

*Version 1 — 25 septembre 2026. Durée visée : 12 minutes, 15 avec l'option.*

Ce script déroule un cas d'usage réel devant un prospect du bâtiment : **des
commerciaux génèrent leurs devis sur des comptes ChatGPT personnels**, en y
versant d'anciens devis, des grilles de prix fournisseurs et des marges.

Il ne montre pas des écrans. Il montre **une chaîne de responsabilité** qui se
termine par un courriel qu'une personne nommée reçoit, lit et assume — en
direct, pendant la démonstration.

---

## 1. Ce qui est déjà en place

**Rien de cette section ne se déroule devant le prospect.** C'est le décor,
monté à l'avance.

### La société

| | |
|---|---|
| Raison sociale | BATIVAL Construction SAS *(fictive)* |
| Secteur | Bâtiment et travaux publics |
| Effectif | 340 salariés, Bordeaux |
| Rôle vis-à-vis de l'IA | **Exploitant de solution tierce** |

Ce dernier point commande tout le reste : BATIVAL **n'entraîne aucun modèle**.
AIGMS ne lui demandera donc aucune preuve de code, d'apprentissage ou de jeu de
données d'entraînement — seulement des preuves d'**usage**, de **contrat** et de
**surveillance**. C'est exactement ce que dit la fiche de conformité du
prospect, et c'est un argument d'ouverture : *« votre outil ne va pas vous
demander ce que vous ne pouvez pas produire. »*

### Les huit comptes

Mot de passe commun : `Demo!Passw0rd`

| Adresse | Nom | Rôle | Ce qu'il fait dans la démonstration |
|---|---|---|---|
| `admin@aigms.eu` | Inès Duhamel | Administrateur de la plateforme | Ouvre les accès. **Ne gouverne rien** |
| `officer@aigms.eu` | Camille Rousset | AI Governance Officer | Conduit les étapes 1 à 8 |
| `dsi-admin@aigms.eu` | Marc Lecomte | Administrateur client | **Reçoit le courriel et approuve** |
| `devsecops@aigms.eu` | Dominique Etchart | Porteur de l'IA | Accepte les risques résiduels |
| `risk-comity@aigms.eu` | Sacha Belarbi | Comité des risques | Répond du risque coté |
| `rssi@aigms.eu` | Yann Cazaux | Expert métier (DPO / RSSI) | Cité, non sollicité |
| `direction@aigms.eu` | Élodie Marchetti | Comité de direction | Citée, non sollicitée |
| `audit@aigms.eu` | Noa Lasserre | Auditeur | Cité, non sollicité |

> **Ce sont les mêmes personnes que sur l'autre organisation de démonstration.**
> Ce n'est pas un raccourci : une adresse ne porte qu'une identité, et c'est la
> réalité d'un cabinet — un officer, plusieurs clients. Si le prospect le
> remarque, c'est une occasion : ouvrez le **Pilotage**, il verra le portefeuille
> entier sur un écran.

### Ce que BATIVAL emploie déjà

Deux **actifs d'IA** sont inscrits au registre avant la démonstration. Ils n'y
sont pas par commodité : un actif se décrit une fois et se lit ensuite depuis
tous ses cas d'usage — on ne le crée pas au milieu d'une présentation.

| Actif | Nature | Ce qu'il porte |
|---|---|---|
| Assistant conversationnel grand public — comptes personnels | Système d'IA | Souscrit à titre individuel par les commerciaux. Aucune console d'entreprise, aucun réglage de rétention. **Données personnelles.** |
| Devis émis et grilles de prix fournisseurs | Jeu de données | L'historique des devis, marges et coordonnées clients — ce qui est versé dans l'assistant. **Données personnelles.** |

Le fournisseur qui les porte est inscrit lui aussi, **revue non close, sans
DPA, hors Union européenne**. C'est ce qui rendra la ligne « Tiers non revu »
visible dès l'étape 1.

> **Ne confondez pas les deux mots, le prospect le fera.** Un **actif d'IA**
> est ce que le cas d'usage *emploie*. Un **outillage** est ce *avec quoi* on
> tient un contrôle — passerelle, DLP, journalisation. Le premier est l'objet
> gouverné ; le second est l'instrument, et c'est de lui que la preuve se
> prend. Un même produit peut être les deux : une passerelle d'appels IA est
> un instrument de contrôle *et* une ressource du système.

### À vérifier dix minutes avant

- Les deux organisations apparaissent dans le menu utilisateur.
- La boîte `dsi-admin@aigms.eu` est ouverte dans un onglet, déjà connectée.
- Un second navigateur (ou une fenêtre privée) est prêt pour la bascule de
  compte : basculer d'identité est le geste le plus lent de la démonstration.

---

## 2. Le fil — huit gestes

| # | Étape | Qui | Durée |
|---|---|---|---|
| 1 | Déclarer l'usage | Officer | 1 min 30 |
| 2 | Trier — la criticité | Officer | 1 min 30 |
| 3 | Qualifier au regard du règlement | Officer | 1 min |
| 4 | Coter le risque | Officer | 1 min 30 |
| 5 | Retenir les contrôles et leur outillage | Officer | 2 min |
| 6 | Produire une preuve | Officer | 1 min 30 |
| 7 | Conduire l'étude d'impact | Officer + Porteur | 2 min |
| 8 | **Décider — le moment clé** | Officer + Administrateur client | 2 min 30 |

---

### Étape 1 — Déclarer l'usage

**`officer@aigms.eu` · menu utilisateur → se placer sur BATIVAL Construction ·
Cas d'usage → Déclarer un cas d'usage**

| Champ | À saisir |
|---|---|
| Nom | Génération de devis par IA générative |
| Finalité | Rédiger les devis clients à partir d'anciens devis et des grilles de prix fournisseurs, pour réduire le délai de réponse aux appels d'offres. |
| Processus métier | Commercial — réponse aux appels d'offres |
| Bénéfice attendu | Délai de réponse divisé par deux |
| Porteur de l'IA | Dominique Etchart |
| Responsable redevable | Marc Lecomte |
| Utilisateurs | Les quatorze commerciaux et chargés d'affaires |
| Personnes concernées | Les clients, dont les devis portent les coordonnées |
| Données traitées | Anciens devis, grilles de prix fournisseurs, marges, coordonnées clients |
| Niveau d'autonomie | **L1 — il propose, un humain valide** |

Puis, sur l'onglet *Avancement*, **Rattacher un actif** : l'assistant
conversationnel, et le jeu de devis. Deux gestes, dix secondes.

> **Ce que le rattachement déclenche.** Le fournisseur arrive avec l'actif, et
> avec lui sa revue non close : la fiche affiche **« Tiers non revu »** sans
> qu'on ait rien saisi de plus. Une revue tiers ouverte retiendra la mise en
> production — le prospect le verra à l'étape 8.

> **Insistez ici.** « Je déclare un usage que personne n'a autorisé, qui tourne
> déjà, et dont la direction ignore l'existence. Le registre ne l'interdit pas :
> il le rend **visible**. On n'encadre que ce qu'on a nommé. »

---

### Étape 2 — Trier : la criticité

**Onglet *Avancement* → carte Criticité → la grille**

| Question | Réponse |
|---|---|
| Qui subit une erreur du système ? | Des clients ou partenaires identifiés |
| Une erreur se rattrape… | Avec un coût ou un délai |
| Que fait le système de sa sortie ? | Il propose : un humain valide chaque cas |
| Quelles données traite-t-il ? | **Des données personnelles** |

Criticité retenue : **Élevée**.
Justification : *« Un devis erroné engage l'entreprise sur un prix. Les données
versées sortent du périmètre contractuel. »*

> **Insistez ici.** « Regardez ce que la dernière réponse vient de faire. Elle
> n'a pas seulement calculé un niveau : elle a **écrit un fait** sur la fiche.
> À partir de maintenant, l'étude d'impact est exigée, l'AIPD se pré-coche, et
> les contrôles de protection des données se proposent d'eux-mêmes. La grille
> ne décore pas, elle déclenche. »

---

### Étape 3 — Qualifier au regard du règlement

**Onglet *Avancement* → Qualification réglementaire**

- Rôle de l'organisation : **Déployeur**
- Cocher : *Impact sur la vie privée*, *Fournisseur hors Union européenne*
- Justification : *« BATIVAL exploite une solution tierce. Il ne répond pas de
  l'entraînement du modèle, mais de l'usage qu'il en fait et des données qu'il
  y verse. »*

> **Insistez ici.** « AIGMS ne décide pas de votre qualification. Il l'enregistre,
> avec son motif, sa date et son auteur. Le jour où une autorité pose la
> question, vous n'avez pas à vous souvenir : vous ouvrez la fiche. »

---

### Étape 4 — Coter le risque

**Onglet *Risques* → Identifier un risque**

| Champ | À saisir |
|---|---|
| Intitulé | Fuite de données commerciales vers un tiers |
| Scénario | Devis, marges et prix fournisseurs versés dans un service public, hors contrat, potentiellement réutilisés pour l'entraînement du modèle. |
| Catégorie | **Tiers** |
| Qui répond de ce risque | Sacha Belarbi |
| Vraisemblance | **4 — Probable** |
| Gravité | **4 — Majeure** |

Sous le bandeau gris : **Niveau inhérent obtenu : Critique — 4 × 4 = 16.**

> **Ne passez pas trop vite sur la cotation.** Les deux listes portent le
> chiffre *et* le mot — « 4 — Probable », « 4 — Majeure » — et la définition du
> cran choisi s'écrit dessous. « Un outil qui vous demande de noter de 1 à 5
> sans dire ce que 4 veut dire vous donnera cinq cotations différentes pour cinq
> personnes. Ici, *Probable* signifie *s'est déjà produit chez vous, ou les
> conditions sont réunies*. Deux personnes cotent pareil. »

> **La catégorie n'est pas un classement décoratif.** L'infobulle à côté du
> champ donne les treize définitions. Celle-ci nourrit la recherche de contrôle
> à l'étape suivante.

#### Ce qui se produit pendant que vous écrivez

Dès que le scénario est rédigé, **sans que vous cliquiez sur quoi que ce soit**,
un encadré s'ouvre en bas de la fenêtre : *« L'assistant lit ce que vous écrivez
— intitulé, scénario, catégorie — et propose les contrôles du registre et des
référentiels qui s'en approchent. »* La liste apparaît seule, chaque ligne avec
l'extrait du contrôle qui correspond.

> **Le geste qui porte.** Laissez le silence s'installer une seconde avant de
> commenter. « Je n'ai rien demandé. J'ai décrit un risque en français, et
> l'outil est allé chercher dans cent vingt contrôles-types ce qui le traite.
> Vous pouvez en retenir un tout de suite — il rejoindra le registre et
> deviendra applicable — ou passer, et décider au traitement. »

Pour la démonstration, **ne retenez rien ici** : les contrôles se choisissent à
l'étape 5, et l'on veut montrer les deux chemins.

> **Insistez ici.** « Le risque n'est pas une ligne dans un tableur. Il appelle
> des contrôles, et il retiendra la mise en production tant qu'il n'est ni
> traité ni accepté par quelqu'un qui en répond. »

---

### Étape 5 — Retenir les contrôles, et dire avec quoi ils se tiennent

**Onglet *Contrôles affectés* → « Laisser l'assistant proposer »**

L'assistant rend **44 propositions**, en deux groupes : *déclenchées* par les
faits que vous venez de déclarer, et *socle* attendues de tout cas d'usage.
Vous n'en retenez que quatre — celles qui répondent à la fiche du prospect.

> **Insistez avant de cocher.** « Quarante-quatre propositions, et je n'en
> garde que quatre. Un outil qui vous en impose quarante-quatre vous fait
> abandonner au bout de trois. Ici, c'est l'officer qui retient, et le
> référentiel n'est jamais modifié. »

**Comment s'y retrouver dans les quarante-quatre.** La fenêtre porte en haut
une barre qui reste visible :

- une **recherche libre** — un code, un mot du titre, un motif, un nom d'outil ;
- des **pastilles de domaine** avec leur compte — GOV, SEC, SUP, DAT… ;
- un bouton **« ★ Les plus appropriés »** : les propositions déclenchées par un
  fait de la fiche, et celles que le référentiel rend obligatoires.

Chaque ligne concernée porte sa marque, `★ déclenché` ou `★ obligatoire`.
Cliquez **★ Les plus appropriés** : la liste tombe de quarante-quatre à une
poignée, et les quatre du tableau ci-dessous sont dedans.

> **À dire en cliquant.** « Le filtre ne devine rien. *Déclenché* veut dire
> qu'un fait que j'ai saisi l'a fait apparaître ; *obligatoire* veut dire que
> le référentiel l'attend de tout cas d'usage. Dans les deux cas, la raison est
> écrite à côté. »

#### Les quatre à cocher dans la liste des propositions

| Code | Intitulé | Groupe | Pourquoi l'assistant le propose |
|---|---|---|---|
| **AIGMS-SUP-005** | Utilisation des données par le fournisseur | **déclenchée** | *« Des données personnelles transitent chez un fournisseur : leur usage se borne. »* |
| **AIGMS-SEC-008** | Prévention de l'exfiltration de données | **déclenchée** | *« Des données personnelles sont mobilisées : le système ne doit pas les laisser sortir. »* |
| **AIGMS-SEC-006** | Journalisation de sécurité des systèmes d'IA | socle, **obligatoire** | *« Attendu de tout cas d'usage. »* |
| **AIGMS-HUM-001** | Niveau de supervision humaine | socle, **obligatoire** | *« Attendu de tout cas d'usage. »* |

> **Le geste qui porte.** Les deux premières lignes sont marquées
> **« déclenchée »** avec leur motif écrit en clair. « Personne n'a coché une
> case pour les faire apparaître. Elles sont là parce que j'ai répondu
> *données personnelles* dans la grille de criticité, il y a quatre minutes. »

#### Le cinquième ne se trouve pas dans les propositions

**AIGMS-GOV-008 — Politique d'usage acceptable de l'IA** porte la charte signée
qu'exige votre fiche. Il n'est **pas** proposé : le moteur le range au socle de
l'organisation, pas du cas d'usage. Pour le retenir :

**Registres → Contrôles et outillages → Ajouter un contrôle → onglet
« Depuis le référentiel »**

Filtrez le domaine **GOV — Gouvernance**, ou tapez `GOV-008` dans la recherche.
Le catalogue proposable à BATIVAL compte **120 contrôles-types** du référentiel
AIGMS-CF v0.4, dont 12 dans ce domaine.

> **À dire si on vous pose la question.** « L'assistant propose ; il ne décide
> pas. Ce qui relève de la politique d'entreprise ne se déduit pas d'un cas
> d'usage — c'est l'officer qui l'inscrit. »

#### Statuer, poser, outiller — au même endroit

De retour sur la fiche, onglet *Contrôles affectés* : chaque ligne porte un
**crayon** à gauche du code. Il n'ouvre pas un champ, il ouvre **la fiche du
contrôle sur ce cas d'usage**, en trois sections.

| Section | Ce qu'on y fait | Sur quels contrôles |
|---|---|---|
| **Applicabilité** | Statuer **Applicable** — sans justification, elle n'est obligatoire que pour une exclusion | les quatre |
| **Actifs d'IA qui la portent** | Poser la mesure sur l'assistant conversationnel, état *Prévue* | AIGMS-SEC-008, AIGMS-SEC-006 *(mesures techniques)* |
| **Avec quoi il se tient** | Déclarer le produit sur la famille que le référentiel attend | voir le tableau ci-dessous |

| Famille suggérée | Produit à déclarer | Sur quel contrôle |
|---|---|---|
| Passerelle d'appels IA *(AI Gateway)* | ChatGPT Enterprise | AIGMS-SUP-005 |
| Prévention des fuites *(DLP)* | Netskope | AIGMS-SEC-008 |
| Journalisation *(Logs / SIEM)* | Splunk | AIGMS-SEC-006 |

La famille est **déjà proposée dans la liste déroulante** : c'est celle que le
contrôle appelle. Vous ne tapez que le nom du produit. Rien à chercher, aucun
aller-retour vers le registre.

> **Le geste qui porte.** Ouvrez **AIGMS-SEC-008** en premier. Avant que vous
> n'ayez rien déclaré, la fenêtre dit deux choses : *« Contrôle de nature
> technique, sans outillage retenu — il énonce un moyen sans le nommer : en
> l'état, il ne se prouve pas »*, et elle suggère **AI Gateway** et **DLP**.
> « Votre référentiel dit *“ce contrôle se tient avec un outil de prévention
> des fuites”*. C'est une typologie : elle dit où chercher, pas ce que vous
> employez. Ici, le contrôle dira **“se tient avec Netskope, chez nous”** — et
> l'auditeur saura où aller prendre la preuve. »

> **Confirmation visuelle à faire remarquer.** Sous la ligne d'une mesure
> technique que rien ne porte, l'écran affiche en orange **« Aucun actif ne la
> porte »**. Après le geste, la pastille verte de l'actif prend sa place.

### Étape 6 — Produire une preuve

**Retour sur le cas d'usage → onglet *Contrôles affectés***

1. Montrez l'en-tête du groupe replié : **« 4 applicables · 4 sans preuve »**.
2. Cochez le filtre **Sans preuve**. La liste se réduit.
3. Sur le contrôle d'encadrement de l'usage, cliquez l'**icône de pièce** — elle
   est rouge. Puis *Déposer une preuve*.

| Champ | À saisir |
|---|---|
| Titre | Charte d'utilisation de l'IA générative — version 1 |
| Typologie | Politique / charte |
| Valide jusqu'au | dans douze mois |

> **Confirmation visuelle à faire remarquer.** L'icône passe au **vert**, et le
> compte de l'en-tête descend à **3 sans preuve**. « Le contrôle n'est pas tenu
> parce qu'on l'a déclaré opérant. Il est tenu parce qu'une pièce validée et
> non échue le démontre. C'est la même règle partout dans l'outil. »

---

### Étape 7 — Conduire l'étude d'impact

**Cas d'usage → Conduire une étude d'impact IA**

- Parties prenantes : *Clients* (population : « environ 900 devis par an »),
  *Commerciaux*
- Constat : **« Prix ou normes obsolètes dans un devis émis »** — gravité
  **sévère**, vraisemblance probable
- Mesure : **« Relecture humaine obligatoire avant envoi »**, échéance à trente
  jours

Un constat sévère **ouvre une action bloquante** : montrez-la.

Puis : *Viser la méthode* en tant qu'officer.

**Basculez sur `devsecops@aigms.eu`** — Dominique Etchart reçoit l'alerte,
ouvre l'étude, et **accepte les risques résiduels** avec sa propre déclaration :
*« J'assume l'écart sous relecture systématique, avec audit trimestriel. »*

> **Insistez ici.** « Deux actes, deux signataires. L'officer atteste que
> l'étude est bien conduite ; le porteur dit que l'organisation assume ce qui
> reste. La base refuse que la même personne pose les deux — ce n'est pas un
> réglage d'écran. »

---

### Étape 8 — Décider : le moment qui emporte la décision

**`officer@aigms.eu` → onglet *Décisions* → Soumettre une décision → Mise en
production**

Le formulaire affiche l'écart : **les contrôles applicables sans preuve, nommés
par leur code**. Il exige que vous disiez ce qu'il en est :

> *« Charte signée le 12/11. Console Enterprise livrée, option de rétention
> désactivée. Passerelle DLP en recette, bascule prévue le 30/11. »*

La personne appelée à se prononcer est **Marc Lecomte**, proposé par défaut :
c'est la DSI côté client qui met en service.

**Soumettez.**

#### Maintenant, ouvrez la boîte de réception

`dsi-admin@aigms.eu` a reçu le courriel **sur-le-champ** — pas à la prochaine
tâche planifiée. Il porte les codes des contrôles manquants et votre phrase de
remédiation.

> **C'est le moment de la démonstration.** Laissez le silence s'installer.
> « Ce n'est pas une maquette. Ce message est parti il y a quinze secondes. »

#### Puis connectez-vous en `dsi-admin@aigms.eu`

- *Mes alertes* → la décision l'attend
- Il lit l'écart et la parole de l'officer
- Il coche **« J'ai pris connaissance de cet écart de preuve et l'assume en
  approuvant »**
- Il approuve

> **Insistez pour finir.** « Sans cette case, la **base** refuse l'approbation —
> pas l'écran, la base. Et l'écart reste au dossier, figé tel qu'il était au
> moment de la soumission : une preuve déposée demain ne réécrit pas ce que
> Marc a lu aujourd'hui. Voilà ce que vous pourrez montrer à un auditeur. »

---

## 3. Option — si le temps le permet (1 min 30)

**`admin@aigms.eu` → Organisations → BATIVAL Construction → Administration →
carte *Preuves exigées à la mise en production***

Posez une date **à moins de trente jours**. Enregistrez.

Trois choses partent immédiatement : l'officer et l'Administrateur client sont
avertis, **chaque cas d'usage qui porte un écart reçoit sa relance nominative**,
et deux rappels sont posés à J-30 et J-7. Comme la date est proche, le rappel
J-30 est déjà dû : il se lit tout de suite dans *Mes alertes*.

> « Jusqu'ici l'écart s'assumait. À partir de cette date, il retient la mise en
> production. Vous fixez la date, pas nous — c'est un engagement, il se
> négocie. »

---

## 4. Les quatre preuves de votre fiche, et où elles atterrissent

| Preuve exigée | Criticité | Référence | Dans AIGMS |
|---|---|---|---|
| Charte d'usage signée | Critique | ISO 42001 A.5 | Contrôle d'encadrement + pièce rattachée |
| Console Enterprise, rétention désactivée | Critique | A.7.2 · ISO 27001 A.18 | Contrôle de sécurité des données + revue du fournisseur |
| Journaux de la passerelle DLP | Élevé | A.10.6 · AI Act art. 12 | **AIGMS-SEC-008** + **AIGMS-SEC-006** |
| Rapport d'AIIA signé | Critique | ISO 42001 6.1.2 | Étude d'impact, double signature |

---

## 5. Ce qu'il ne faut pas faire

- **Ne pas dérouler l'administration** devant le prospect. Créer une
  organisation et déclarer huit comptes ne démontre rien et coûte cinq minutes.
- **Ne pas promettre de connecteur** qui n'existe pas. Ce qui se voit à l'écran
  est ce qui fonctionne ; le reste se dit au conditionnel.
- **Ne pas parler de certification.** AIGMS aide au cadrage, à la
  pré-classification, à la documentation et à la preuve. Il ne remplace ni un
  avis juridique, ni la décision d'un responsable, ni un audit.
- **Ne pas improviser une bascule de compte** : c'est le geste le plus lent.
  Deux navigateurs, préparés à l'avance.

---

## 6. Après la démonstration

Le cas d'usage créé reste dans BATIVAL Construction. Pour repartir d'une
organisation vierge à la prochaine démonstration, supprimez le cas d'usage
depuis sa fiche — **ne touchez jamais à IzarLink Demo**, qui porte le jeu de
données complet dont dépendent les autres démonstrations et les tests.
