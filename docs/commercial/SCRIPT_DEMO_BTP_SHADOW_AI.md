# Script de démonstration — Shadow AI dans le BTP

*Version 1 — 25 septembre 2026. Durée visée : 20 minutes, 22 avec l'option.*

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

## 2. Le fil — neuf gestes

| # | Étape | Qui | Durée |
|---|---|---|---|
| 1 | Déclarer l'usage | Officer | 1 min 30 |
| 2 | Trier — la criticité | Officer | 1 min 30 |
| 3 | Qualifier au regard du règlement | Officer | 1 min |
| 4 | Coter le risque | Officer | 1 min 30 |
| 5 | Retenir les contrôles et leur outillage | Officer | 2 min |
| 6 | Produire une preuve | Officer | 2 min |
| 7 | Conduire l'étude d'impact | Officer + Porteur | 4 min |
| 8 | **Franchir les jalons, puis décider — le moment clé** | Officer + Administrateur client | 4 min |
| 9 | La Déclaration d'Applicabilité | Officer | 2 min |

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
contrôle sur ce cas d'usage**, en trois onglets.

| Onglet | Ce qu'on y fait | Sur quels contrôles |
|---|---|---|
| **Applicabilité** | Statuer **Applicable** — la justification n'est obligatoire que pour une exclusion | les quatre |
| **Actifs d'IA** | Poser la mesure sur l'assistant conversationnel, état *Prévue* | AIGMS-SEC-008, AIGMS-SEC-006 *(mesures techniques)* |
| **Outillage** | Déclarer le produit sur la famille que le référentiel attend | voir le tableau ci-dessous |

#### Les quatre natures d'actif — à connaître avant de saisir

Quand vous inscrivez un actif, l'écran demande sa **nature**. Les quatre ne se
recouvrent pas, et le prospect posera la question.

| Nature | Ce que c'est | Exemple chez BATIVAL |
|---|---|---|
| **Système d'IA** | Ce qui est **déployé et utilisé** tel quel : une application, un service, un assistant. La nature la plus fréquente | ChatGPT Enterprise |
| **Modèle** | Le modèle lui-même, **entraîné ou acquis**, servant un ou plusieurs systèmes, avec sa version | — |
| **Agent** | Un système qui **enchaîne des actions** avec une autonomie propre : il ne répond pas, il agit | — |
| **Jeu de données** | Ce que le système **apprend ou mobilise** : entraînement, réglage, évaluation, base documentaire | Devis émis et grilles de prix |

> **La phrase qui tranche.** « Un *système* est employé. Un *modèle* est ce qui
> produit la sortie. Un *agent* décide de ses actions. Un *jeu de données* est
> ce dont il se nourrit. BATIVAL n'entraîne aucun modèle et n'exploite aucun
> agent : deux des quatre cases resteront vides, et c'est une information. »

#### Pourquoi « Poser sur l'actif » ne propose qu'un seul actif

La liste ne contient **que ce que ce cas d'usage emploie** — pas tout le
registre. Poser une mesure sur un actif que le cas d'usage n'emploie pas ne
voudrait rien dire.

Pour en ajouter, les deux volets sous le formulaire : **Rattacher un actif déjà
inscrit** (il existe au registre, il n'est pas encore employé ici) ou **Inscrire
un actif** (il n'existe pas encore).

> **À dire si on vous le demande.** « La liste est courte parce que le dossier
> est honnête : ce cas d'usage emploie un assistant et un jeu de données, pas
> l'informatique entière de l'entreprise. »

> **Avant de cliquer, montrez le point ambre.** Sur AIGMS-SEC-006 et
> AIGMS-SEC-008, l'onglet *Actifs d'IA* porte une pastille orange : la mesure
> est technique, applicable, et ne repose sur aucun actif. « L'outil ne me
> demande pas d'ouvrir trois onglets pour savoir où est le travail. Il me le
> montre. »

Sur chaque onglet, le geste courant est en haut et son bouton reste visible en
bas pendant qu'on fait défiler. Les gestes rares — *rattacher un actif déjà
inscrit*, *inscrire un actif*, *déclarer un produit* — sont repliés… **sauf
quand le registre est vide**, où ils s'ouvrent d'eux-mêmes : ce sont alors les
seuls gestes possibles.

Trois champs seulement se saisissent : la **famille**, le **produit**, et une
question fermée — *« Est-ce aussi un actif d'IA que vous employez ? »*

| Famille suggérée | Produit à déclarer | Sur quel contrôle | Aussi un actif ? |
|---|---|---|---|
| Prévention des fuites *(DLP)* | Netskope | AIGMS-SEC-008 | **non** |
| Journalisation *(Logs)* | Splunk | AIGMS-SEC-006 | **non** |
| Passerelle d'appels IA *(AI Gateway)* | Azure API Management | AIGMS-SEC-008 | **oui** — *« + L'inscrire au registre des actifs d'IA… »* |

> **Le rôle ne se choisit pas : il se déduit.** L'écran ne demande jamais
> « instrument ou ressource ? » — un produit n'est ni l'un ni l'autre en soi.
> Il pose une question de fait, et en tire la conséquence, écrite sous le champ :
>
> - **non** → *« Il sera déclaré instrument d'un contrôle : vous gouvernez avec,
>   sans le gouverner lui-même. »*
> - **oui** → *« Il sera déclaré instrument et ressource : vous le gouvernez, et
>   vous gouvernez avec. »*

La famille, elle, est **déjà proposée dans la liste déroulante** : c'est celle
que le contrôle appelle. Vous ne tapez que le nom du produit.

**La passerelle n'est nulle part encore** — et c'est le point. La question
*« est-ce aussi un actif d'IA ? »* n'aurait aucune réponse possible s'il fallait
d'abord sortir, ouvrir le registre des actifs, l'y inscrire, revenir. La liste
déroulante offre donc, en dernière ligne, **« + L'inscrire au registre des
actifs d'IA… »** : un seul champ de plus apparaît — **de quelle nature ?**
(*système d'IA*, par défaut) — et l'actif naît avec le nom du produit et le
fournisseur déjà saisis. Sa fiche se complète plus tard, au registre.

> Même geste que pour le fournisseur qu'on crée sans quitter l'écran : **on
> n'oblige jamais à sortir pour créer ce qui manque au moment où il manque.**

**Ce que la liste des outils déclarés affiche**, une fois plusieurs produits
posés — c'est ce que le prospect lira :

```
☑ Azure API Management    API Management · instrument et ressource
☑ Netskope                Data Loss Prevention · instrument · suggéré par le référentiel
☐ Splunk                  Journaux d'événements · instrument
```

Trois informations par ligne, et aucune à saisir : **la famille** du référentiel,
**le titre** auquel l'outil est déclaré, et le fait que le référentiel l'attendait
ou non pour ce contrôle-ci.

#### Le cas qui fait comprendre la différence

Sur la passerelle, l'écran demande : **« Est-ce aussi un actif d'IA que vous
employez ? »** Choisissez **« + L'inscrire au registre des actifs d'IA… »**,
nature **système d'IA**.

> **Le geste qui porte.** « Une passerelle d'appels IA **applique mes règles** —
> c'est un instrument de contrôle. Et elle **traite mes données** — c'est donc
> aussi quelque chose que je dois gouverner. Un produit, deux rôles. L'outil ne
> me demande pas de choisir : il me demande un fait, et il en déduit le reste. »

Ouvrez ensuite **Registres → Actifs d'IA et fournisseurs → Tout ce que vous
employez** : la passerelle y figure **une seule fois**, avec ses deux pastilles
*Gouverné* et *Instrument*. Netskope et Splunk ne portent que *Instrument*.
ChatGPT Enterprise ne porte que *Gouverné*.

> **La phrase à retenir, si on vous la demande.** « Si l'auditeur dit *montrez-moi
> ce que fait votre IA*, il parle des actifs. S'il dit *prouvez-moi que vous la
> maîtrisez*, il parle de l'outillage. »

#### Et AIGMS-SUP-005 ? Aucun outil

Ouvrez son onglet **Outillage**. L'écran dit : *« Le référentiel AIGMS ne
suggère aucune famille pour ce contrôle. »*

Ce n'est pas un manque. **AIGMS-SUP-005 est un contrôle contractuel** : il
établit *si le fournisseur peut utiliser les données soumises pour entraîner ses
modèles, les conserver, les relire*. Ce qui le tient n'est pas un outil, c'est un
**contrat** — et la preuve est la clause signée, plus la capture de la console
Enterprise montrant la rétention désactivée.

> **Insistez ici.** « Tout ne se tient pas avec un outil. Celui-ci se tient avec
> une signature. AIGMS ne me force pas à inventer un produit pour remplir une
> case : il me dit qu'il n'en attend pas, et il attend une preuve d'une autre
> nature. »

#### Où ChatGPT Enterprise se déclare, et pourquoi là

**C'est un actif d'IA, pas un outillage.** Il se déclare depuis l'onglet
*Actifs d'IA* du contrôle — ou depuis le registre — comme **système d'IA**, en
remplacement des comptes personnels. C'est ce que les commerciaux emploieront :
il traite vos devis, vos marges, vos coordonnées clients. **Il est l'objet
gouverné.**

Ce qui *tient* les contrôles, ce sont Netskope, Splunk et la passerelle. La
console Enterprise, elle, ne tient rien : elle **prouve** — sa configuration est
une pièce déposée sur AIGMS-SUP-005.

#### Le fournisseur se crée sans quitter l'écran

Au moment de déclarer *ChatGPT Enterprise* comme actif, le champ **« Qui vous le
fournit ? »** porte une entrée **« + Nouveau fournisseur… »**. Choisissez-la :
deux champs apparaissent, *nom* et *pays*. Saisissez `Open.AI` et `US`.

> **Le geste qui porte.** « Je viens de créer un tiers au milieu de ma saisie,
> sans perdre le fil. Et regardez ce que l'outil me répond : *le tiers Open.AI
> est créé, sa revue reste à ouvrir — elle conditionne la mise en production*.
> Je n'ai rien demandé de plus, et il vient de m'ouvrir une obligation. »

C'est le moment d'ouvrir **Registres → Actifs d'IA et fournisseurs →
Fournisseurs** : le tiers y est, en ambre, *revue non commencée*, avec l'actif
qu'il fournit. La chaîne s'est nouée toute seule.

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

1. Montrez l'en-tête du groupe replié : **« 5 applicables · 5 sans preuve »**.
2. Cochez le filtre **Sans preuve**. La liste se réduit.
3. **Sur la ligne d'AIGMS-GOV-008 — Politique d'usage acceptable de l'IA**,
   celui que vous êtes allé chercher au référentiel à l'étape 5, cliquez
   l'**icône de pièce** — elle est rouge. Puis *Déposer une preuve*.

> **Pourquoi celui-là.** Le référentiel énonce, pour AIGMS-GOV-008, les pièces
> qu'il attend : *politique d'usage acceptable*, *attestations de prise de
> connaissance*, *canal de signalement documenté*. La charte est la première
> des trois. C'est le contrôle que la fiche du prospect appelle quand elle
> exige « une charte d'usage signée ».

**Les champs, dans l'ordre de l'écran**

| Champ | À saisir | Pourquoi |
|---|---|---|
| **Typologie de preuve** *(facultatif)* | **— Aucune typologie technique** | Une charte n'est pas une preuve technique d'IA. Voir l'encadré ci-dessous. |
| **Ce que la preuve démontre** | `Charte d'utilisation de l'IA générative — version 1` | Le titre dit ce qui est démontré, pas le nom du fichier. |
| **Nature** | **Document** | La forme matérielle de la pièce. |
| **Fichier** | la charte en PDF | Son empreinte SHA-256 est calculée au dépôt. |
| **Valable jusqu'au** | dans douze mois | Le référentiel révise ce contrôle **chaque année**. |
| **Contrôle démontré** | **AIGMS-GOV-008** — déjà prérempli | Vous êtes parti de sa ligne : il n'y a rien à rechercher. |
| **Version** *(facultatif)* | `1.0` | |

#### Les deux listes ne disent pas la même chose — ne pas les confondre

C'est la question que le prospect posera, parce que les deux s'appellent presque
pareil.

**« Typologie de preuve »** ne propose **pas** des catégories documentaires. Elle
porte les **huit typologies techniques de la matrice des preuves AIGMS**,
adossées à ISO/IEC 42001 : *isolation et souveraineté*, *intégrité des données*,
*éthique et équité*, *explicabilité (XAI)*, *alignement et garde-fous*,
*cybersécurité spécifique à l'IA*, *surveillance et dérive*, *empreinte
environnementale*. Chacune dit **ce qu'il faut consigner** et **quels livrables
font preuve** — l'écran l'affiche dès que vous en choisissez une.

**Le préfixe de criticité n'est pas décoratif.** BATIVAL est déclarée
**utilisateur métier** : l'écran classe donc *Surveillance continue et dérive*
en **critique**, *explicabilité* et *cybersécurité IA* en **modéré**, et le
reste en **faible**. Un développeur de modèles verrait un tout autre classement
— *équité*, *alignement*, *XAI* passeraient en critique.

> **Le geste qui porte.** « Regardez l'ordre de cette liste. Il n'est pas
> alphabétique : il est trié par ce que **votre rôle vis-à-vis de l'IA** rend
> exigeant. Vous exploitez des systèmes achetés — on ne vous demandera pas de
> prouver l'équité d'un modèle que vous n'entraînez pas ; on vous demandera de
> prouver que vous surveillez sa dérive. »

**« Nature »**, juste en dessous, est la **forme matérielle** de la pièce :
document, capture d'écran, extrait de journal, attestation, résultat de test,
configuration, ou *déclarative — aucune pièce jointe*.

Pour une charte : **aucune typologie technique**, nature **Document**. Les deux
champs se remplissent alors sans hésitation — et vous venez de montrer que
l'outil sait distinguer une preuve d'organisation d'une preuve d'ingénierie.

> **Confirmation visuelle à faire remarquer.** L'icône passe au **vert**, et le
> compte de l'en-tête descend à **4 sans preuve**. « Le contrôle n'est pas tenu
> parce qu'on l'a déclaré opérant. Il est tenu parce qu'une pièce validée et
> non échue le démontre. C'est la même règle partout dans l'outil. »

> **Un dépôt n'est pas une validation.** Le bandeau de la fenêtre le dit, et la
> pièce arrive **« à valider »**. Celui qui fournit la pièce n'atteste pas
> lui-même de sa recevabilité.

---

### Étape 7 — Conduire l'étude d'impact

**Cas d'usage → Conduire une étude d'impact IA**

L'écran suit **le modèle ISO/IEC 42005** en quatre temps. Trois se saisissent,
**le quatrième s'écrit tout seul** — et c'est celui-là qu'il faut faire
remarquer.

| Rubrique | Ce qu'on y fait | Qui l'écrit |
|---|---|---|
| **1. Cadrage et contexte** | Le périmètre, la méthode, la phase, l'AIPD | Vous — le reste vient de la fiche |
| **1.1 Parties prenantes** | Les groupes affectés, vulnérables ou non, consultés ou non | Vous |
| **2. Analyse croisée des impacts** | Bénéfices et préjudices, par domaine de la norme | Vous |
| **3. Plan de gouvernance et remédiation** | Les mesures devenues actions, confiées et datées | **L'outil** — rien ne s'y saisit |

**Les quatre rubriques se replient**, et une rubrique fermée n'est pas muette :
elle porte sa ligne de résumé — *« 3 groupe(s) · aucun vulnérable · 1
consulté »*, *« 3 préjudice(s) · 1 bénéfice · 1 grave sans mesure de
réduction »*, *« 2 mesure(s) · 1 action bloquante pour la production »*. Le
cadrage se replie de lui-même dès qu'un constat existe : on n'a plus à faire
défiler un écran de contexte pour atteindre l'analyse.

> **À dire si le prospect le remarque.** « Je peux lire l'état de l'étude
> entière sans en ouvrir une seule rubrique. C'est fait pour la relecture — la
> vôtre, et celle de l'auditeur. »

---

#### 1. Cadrage et contexte

Le bouton **« Modifier le cadrage »** ouvre quatre champs seulement.

| Champ | À saisir | Remarque à faire |
|---|---|---|
| **Périmètre** | `Rédiger les devis clients à partir d'anciens devis et des grilles de prix fournisseurs, pour réduire le délai de réponse aux appels d'offres.` | Repris de la fiche : vous ne redécrivez pas le système |
| **Méthodologie** | `ISO/IEC 42005` | Modifiable — certains cabinets ont leur propre méthode |
| **Phase du cycle de vie** *(facultatif)* | **Développement** | Conception, Développement, Pilote, Déploiement, Exploitation, Retrait |
| **AIPD requise** | **déjà cochée** | Voir l'encadré ci-dessous |
| **Référence de l'AIPD** *(facultatif)* | `AIPD-2026-014` | Le numéro du dossier chez le DPO |
| **Prochaine revue** *(facultatif)* | dans douze mois | Une étude se revoit |

> **Le geste qui porte — la case AIPD pré-cochée.** « Je n'ai pas coché cette
> case. L'outil l'a fait, et il dit pourquoi, en dessous : *pré-cochée, des
> données personnelles sont en jeu — fiche ou actif rattaché*. C'est ma réponse
> de l'étape 3 qui remonte. Et lisez la phrase suivante : *l'étude d'impact IA
> ne s'y substitue pas, elle la référence.* Votre DPO garde son dossier ; AIGMS
> le cite, il ne le remplace pas. »

**Sous le formulaire, une fiche d'identité que personne ne saisit** : statut du
triage (*criticité élevée · étude exigée par les faits*), autonomie,
qualification au sens de l'AI Act, Porteur et Redevable, données en jeu avec
leurs pastilles, AIPD, et les actifs employés.

> **À dire.** « Sept informations, zéro saisie. Elles viennent de la fiche, du
> triage et du registre. Un auditeur qui ouvre cette page sait en dix secondes
> de quoi on parle. »

---

#### 1.1 Parties prenantes

*« Un groupe affecté par le système — directement ou non. »* **Trois à saisir,
une à la fois.**

| Groupe | Population estimée | Vulnérable | Consulté | Méthode |
|---|---|---|---|---|
| `Clients — maîtres d'ouvrage destinataires des devis` | `~900 devis par an` | non | non | — |
| `Commerciaux chargés d'affaires` | `14 personnes` | non | **oui** | `Atelier de deux heures, 3 septembre` |
| `Fournisseurs et sous-traitants cités dans les grilles de prix` | `~40 entreprises` | non | non | — |

> **Insistez sur le troisième.** « Personne ne pense à celui-là. Les commerciaux
> versent des **grilles de prix fournisseurs** dans l'outil : ce sont les
> conditions commerciales de tiers qui n'ont rien demandé et qui ne sont même
> pas au contrat. Une étude d'impact sert exactement à cela — trouver l'affecté
> qu'on n'avait pas vu. »

> **Le champ « vulnérable » et le silence qu'il faut assumer.** Aucun des trois
> groupes ne l'est, et l'outil ne vous pousse pas à en inventer un. « Chez vous,
> non. Si demain vous faites de la sélection de candidats ou de l'aide sociale,
> vous cocherez cette case et le niveau d'examen se renforcera de lui-même. »

---

#### 2. Analyse croisée des impacts

Le bouton **« Ajouter un constat »**. La fenêtre s'appelle *« 2. Constat :
bénéfice ou préjudice »* — les deux, et c'est délibéré.

Le champ **Domaine** ne propose pas une liste plate : **douze domaines groupés
en quatre familles** — *Droits fondamentaux et éthique*, *Vie privée et données
(AIPD)*, *Environnement et énergie*, *Impacts socio-économiques*.

**Quatre constats à saisir**, choisis pour montrer les trois régimes :

**① Le bénéfice** — on ne conduit pas une étude à charge.

| Champ | Valeur |
|---|---|
| Nature | **Bénéfice attendu** |
| Domaine | Emploi et conditions de travail |
| Description | `Le délai de réponse à un appel d'offres est divisé par deux. Les chargés d'affaires reprennent du temps sur la visite de chantier et la relation client.` |
| **Ampleur** | Significative |
| Vraisemblance | Probable |
| Partie prenante | Commerciaux |

> Le champ *Gravité* s'appelle **Ampleur** dès qu'on choisit *Bénéfice*, et le
> cadre « Mesure de réduction » disparaît. « On ne réduit pas un bénéfice. »

**② Le préjudice grave** — celui qui bloquera la production.

| Champ | Valeur |
|---|---|
| Nature | **Préjudice potentiel** |
| Domaine | Protection des consommateurs |
| Description | `Un devis part au client avec un prix ou une norme obsolètes, repris d'un ancien dossier. L'entreprise est engagée sur un chiffre qu'elle ne peut pas tenir, ou sur une norme qui ne s'applique plus.` |
| **Gravité** | **Grave** |
| Vraisemblance | Probable |
| Partie prenante | Clients |
| **Mesure** | `Relecture humaine obligatoire avant envoi, et double validation au-delà de 50 000 €.` |
| Responsable | Sacha Belarbi |
| Échéance | à trente jours |
| Gravité résiduelle | **Limitée** — ce que Dominique Etchart aura à assumer |
| **Risque du registre** | **le risque coté à l'étape 4** — *Fuite de données commerciales vers un tiers* |

**③ Le préjudice significatif** — une action, mais qui ne bloque pas.

| Champ | Valeur |
|---|---|
| Nature | Préjudice potentiel |
| Domaine | **Vie privée et protection des données** |
| Description | `Coordonnées de clients et conditions tarifaires de fournisseurs sont versées dans un service tiers, sans base contractuelle et potentiellement réutilisées pour l'entraînement.` |
| Gravité | **Significative** |
| Vraisemblance | Possible |
| Partie prenante | Fournisseurs et sous-traitants |
| Mesure | `Rétention désactivée sur la console Enterprise, et filtrage DLP sur les flux sortants.` |
| Responsable | Marc Lecomte |
| Échéance | 30/11 |
| Gravité résiduelle | Limitée |

**④ Le préjudice limité** — celui qui ne déclenche rien, et qu'il faut montrer.

| Champ | Valeur |
|---|---|
| Nature | Préjudice potentiel |
| Domaine | **Environnement et énergie** |
| Description | `Chaque devis généré consomme des appels à un modèle hébergé. À neuf cents devis par an, l'empreinte reste marginale au regard du poste chantier.` |
| Gravité | **Limitée** |
| Vraisemblance | Possible |
| Mesure | *(aucune)* |

> **Le tableau qui fait comprendre l'outil.** Dites-le en montrant les quatre
> lignes à l'écran :
>
> | Gravité du préjudice | Ce que l'outil en fait |
> |---|---|
> | **Grave** | Une action **bloquante** : le jalon Production ne passera pas |
> | **Significative** | Une action **suivie**, non bloquante |
> | **Limitée** ou négligeable | **Rien** — la ligne affiche *« Aucune action — gravité limitée »* |
>
> « Trois régimes, une seule règle : c'est la gravité que **vous** avez cotée
> qui décide, pas un réglage d'administrateur. Et tant qu'un préjudice grave
> n'a pas de mesure, l'écran l'écrit en orange sous la ligne : *sans mesure de
> réduction — un préjudice grave en porte une*. »

#### Deux champs marqués *facultatif* qui ne le sont qu'en apparence

Dans le cadre **Mesure de réduction**, à droite du responsable, deux champs
portent la mention *(facultatif)*. Ils le sont au sens où l'on peut enregistrer
sans eux — **pas au sens où ils ne feraient rien**.

**L'échéance *devient* la date de l'action.**

| Ce que vous faites | Ce qui se passe |
|---|---|
| Vous saisissez une date | L'action ouverte porte **cette** date |
| Vous laissez vide | L'action est datée **à soixante jours**, sans que rien ne vous le dise |
| Vous corrigez la date plus tard | L'action **suit** — tant qu'elle n'est ni close ni annulée |
| Vous effacez la date après coup | L'action **garde** celle qu'elle avait : on ne dédate pas un engagement pris |

Et cette date n'est pas décorative non plus : c'est elle qui rend l'action **en
retard**. Une action dépassée est comptée dans la pastille d'attention de
l'organisation, remonte dans la revue de gouvernance, et **part dans le courriel
récapitulatif de son responsable**, qui la lit en tête de liste.

> **Le geste qui porte.** Saisissez l'échéance du constat ② à trente jours, puis
> allez au **Suivi d'actions**. « La date que je viens de taper dans une étude
> d'impact est maintenant la date d'une action qui a un nom en face. Dans trente
> et un jours, Sacha Belarbi recevra un courriel qui la lui rappellera — sans
> que personne n'ait rien programmé. »

**La gravité résiduelle est ce que le Porteur devra assumer.**

C'est le seul endroit de l'outil où l'on dit **ce qui reste une fois la mesure
en place**. Et c'est exactement la liste que Dominique Etchart verra à l'étape
suivante, dans le pavé ambre : *« ce qui demeure de significatif ou grave après
mesures »*.

| Vous renseignez | Ce que le Porteur doit assumer | Effet |
|---|---|---|
| **Limitée** *(cas ② et ③)* | rien pour ce constat | Le constat **disparaît** de la liste à assumer : la mesure a fait son travail |
| **Rien** | la gravité **initiale** | Il lui est présenté un préjudice **grave**, comme si la relecture humaine n'existait pas |
| **Significative** ou **Grave** | ce niveau-là | Le constat reste dans la liste, et il signe en sachant quoi |

> **Ce qu'il faut dire, et ne pas éluder.** « Renseigner *résiduel : limité* ne
> débloque rien. L'action reste **bloquante** parce que le préjudice, lui, était
> grave — ce qui compte pour la production, c'est ce qui aurait lieu **sans** la
> mesure, tant qu'elle n'est pas faite. La gravité résiduelle ne lève pas
> l'obstacle : elle dit à celui qui signe **ce qu'il signe.** »

Les deux valeurs suivent la pièce : la ligne du constat affiche *« résiduel
limitée »*, et l'**export `.docx`** comme l'**impression** les portent dans la
phrase du constat. L'auditeur lit *gravité grave, probable ; résiduel limitée* —
il voit d'un trait la cotation avant et après.

---

#### 3. Plan de gouvernance et remédiation — **rien ne s'y saisit**

C'est la question que le prospect pose toujours : *« et là, on tape quoi ? »*
**Rien.** Cette rubrique n'a pas de bouton.

Elle **reprend les mesures saisies en rubrique 2** et affiche, pour chacune, le
domaine, l'extrait du constat, le responsable, l'échéance — et à droite **le
numéro de l'action ouverte, cliquable**, qui ramène à **l'onglet *Actions et
incidents* du cas d'usage**, sur la ligne exacte de cette action.

> **Le geste qui porte.** Cliquez sur le numéro d'action du constat ②. « Je
> quitte l'étude d'impact et je retombe **dans le dossier du cas d'usage**, sur
> la ligne de cette action-là — marquée **Bloquante**. C'est la même action. Je
> n'ai pas recopié une mesure d'un rapport Word vers un plan d'action Excel :
> **la mesure EST l'action**. Et si je corrige l'échéance dans l'étude, l'action
> suit — tant qu'elle est ouverte. »

> **Si on vous demande pourquoi ce n'est pas modifiable ici.** « Parce qu'une
> mesure ne s'invente pas dans un plan d'action : elle répond à un constat. Si
> vous voulez une mesure de plus, ajoutez le constat qui la justifie. C'est la
> différence entre un plan d'action et un plan d'action *tracé*. »

---

#### Conclusion et signatures — la colonne de droite

Avant de viser, montrez le pavé **Conclusion et signatures**. Tant que l'étude
est ouverte, il liste **ce qui manque**, en clair :

- *aucune partie prenante identifiée*
- *aucun constat — ni bénéfice ni préjudice*
- *n préjudice(s) grave(s) sans mesure de réduction*
- *AIPD requise sans référence*

Quand tout est là : **« Rien ne manque : l'étude peut s'achever. »**

**Vous, `officer@aigms.eu` → « Viser l'étude »**

| Champ | À saisir |
|---|---|
| Conclusion | `Les effets sont acceptables sous les deux mesures retenues : relecture humaine avant envoi, et rétention désactivée avec filtrage sortant. L'empreinte environnementale reste marginale. À surveiller : la tentation de sauter la relecture sous pression d'appel d'offres.` |
| Prochaine revue | dans douze mois |

La fenêtre rappelle la règle avant que vous ne signiez : *« votre visa dit que
la méthode tient ; l'acceptation du Porteur dit que l'organisation assume ce qui
demeure. Une même personne ne pose pas les deux. »*

**Basculez sur `devsecops@aigms.eu`** — Dominique Etchart ouvre l'étude. Il voit
en haut **« En attente de l'acceptation des risques résiduels »**, et la fenêtre
lui rappelle **ce qui demeure de significatif ou grave après mesures**, constat
par constat. Deux boutons seulement : *Accepter les risques résiduels*, ou
**Renvoyer à l'étude** — auquel cas le visa tombe et l'officer reprend la main.

> *« J'assume l'écart sous relecture systématique, avec audit trimestriel. »*

> **Insistez ici.** « Deux actes, deux signataires. L'officer atteste que
> l'étude est bien conduite ; le porteur dit que l'organisation assume ce qui
> reste. La base refuse que la même personne pose les deux — ce n'est pas un
> réglage d'écran. »

#### Ce qui se produit à la seconde où l'étude est achevée

Sans que vous demandiez quoi que ce soit, **une action s'ouvre** : *« Déposer la
preuve de l'évaluation d'impact IA-…  »*, confiée à qui l'a conduite, échéance à
trente jours. Le libellé cite l'AIPD si elle est requise.

Et dans la colonne de droite, le pavé **Preuve** porte un bouton : **« Déposer
l'export comme preuve »**. Un clic — l'export `.docx` au format du modèle part
au registre des preuves, *à valider*, et l'action se solde.

> **La phrase de fin d'étape.** « Le rapport d'étude d'impact n'est pas un
> fichier sur un partage réseau qu'on retrouvera peut-être. Il est une pièce du
> registre, horodatée, avec son empreinte, rattachée à son cas d'usage — et
> l'outil vient de m'ouvrir l'obligation de la déposer. »

---

### Étape 8 — Franchir les jalons, puis décider

#### Où cela se passe — et pourquoi pas dans l'onglet *Décisions*

**Tout part du bouton *« Faire évoluer »*, en tête de fiche.** L'onglet
*Décisions et changements* **ne se saisit pas** : il se lit. Il l'écrit lui-même
en toutes lettres — *« Ce fil se lit ; il ne se saisit pas. Soumettre une
décision ou prévoir un changement se fait par Faire évoluer, en tête de
fiche. »*

Le bouton ouvre **trois intentions**, et le point d'exclamation à côté du titre
explique ce que chacune engage :

| Intention | Ce qu'elle fait | Le statut |
|---|---|---|
| **Franchir un jalon** | Les étapes *non engageantes* — triage, évaluation, revue | change **tout de suite**, avec un motif |
| **Décider** | Les jalons *engageants* — approuvé, pilote, production, suspension, retrait | change **quand la décision est approuvée**, à sa date d'effet |
| **Prévoir un changement du système** | Modèle, données, finalité, fournisseur, autonomie… | **ne bouge pas** |

> **Insistez.** « Les trois ne se valent pas. L'une avance le dossier, l'autre
> **engage l'organisation**, la troisième décrit un fait sur le système. Les
> confondre, c'est franchir un jalon sans l'avoir décidé. »

#### Pourquoi la mise en production n'est pas proposée tout de suite

Le cas d'usage est encore **Brouillon**. Depuis ce statut, *Décider* ne propose
que *Retrait* et *Exception de politique* : **la mise en production n'existe
pas**, et ce n'est pas un défaut — c'est la chaîne de gouvernance qui refuse le
raccourci.

Chaque jalon a sa précondition, et **vous les avez toutes remplies sans le
savoir** aux étapes précédentes. Montrez ce tableau, c'est un argument à lui
seul :

| Jalon | Ce que la base exige | Rempli à l'étape |
|---|---|---|
| **Triage** | Finalité renseignée, Porteur et Redevable désignés | **1** |
| **Évaluation** | Criticité déterminée | **2** |
| **Revue** | Pré-classification réglementaire **et** au moins un risque identifié | **3** et **4** |
| **Approuvé** | Une décision *Autorisation d'usage* approuvée | *ci-dessous* |
| **Production** | Le gate complet — huit vérifications | *ci-dessous* |

> **Le geste qui porte.** « Je n'ai pas cliqué huit fois sur *Suivant*. J'ai fait
> le travail, et les jalons se sont ouverts parce que le travail était fait.
> Essayez de sauter une étape : la base vous dira laquelle manque, nommément. »

#### 8a — Franchir les trois jalons non engageants

**`officer@aigms.eu` → *Faire évoluer* → *Franchir un jalon***, trois fois, avec
un motif à chaque fois. La fenêtre montre les préconditions **cochées** avant de
laisser passer.

| Vers | Motif à saisir |
|---|---|
| **Triage** | `Fiche complète : finalité, porteur et redevable désignés.` |
| **Évaluation** | `Criticité élevée déterminée : données personnelles et décision commerciale engageante.` |
| **Revue** | `Classification posée, risque coté, contrôles retenus, étude d'impact achevée et acceptée.` |

#### 8b — La première décision : autoriser l'usage

**`officer@aigms.eu` → *Faire évoluer* → *Décider* → *Autorisation d'usage***

**Les neuf champs d'une décision, et lesquels sont exigés.** C'est le même
formulaire pour les huit types de décision : le remplir une fois suffit à le
connaître.

| Champ | Exigé ? | À saisir pour l'autorisation d'usage |
|---|---|---|
| **Type de décision** | oui | **Autorisation d'usage** |
| **Personne appelée à se prononcer** | non | **déjà proposée** — Marc Lecomte, le Responsable redevable de la fiche |
| **Objet** | oui — 5 car. min. | **déjà proposé** — *Autorisation d'usage — Génération de devis par IA générative* |
| **Ce qui est décidé** | oui — 20 car. min. | `Autoriser l'usage de la génération de devis assistée, sous les contrôles retenus et les mesures de l'étude d'impact.` |
| **Justification** | oui — 20 car. min. | `Criticité élevée, étude d'impact achevée et risques résiduels acceptés par le Porteur. Les quatre contrôles applicables sont statués et outillés.` |
| **Contexte** | **oui** — 20 car. min. | `Les commerciaux emploient déjà des comptes personnels. L'usage existe : il s'agit de l'encadrer, pas de l'autoriser à partir de rien.` |
| **Options écartées** | non | `Interdiction pure et simple — écartée : l'usage se poursuivrait hors de toute vue.` |
| **Conditions** | non | `Sous réserve de la bascule DLP au 30/11.` |
| **Date d'effet** · **Date de revue** | non *(la revue devient exigée sur une mise en production)* | **déjà proposées** — le jour même · dans un an quand la revue est exigée |

> **Quatre champs sont déjà remplis quand la fenêtre s'ouvre.** L'objet se
> déduit du type et du nom de la fiche ; la personne appelée à se prononcer est
> le **Responsable redevable** désigné à l'étape 1 ; la date d'effet est le jour
> même ; la date de revue, un an plus tard dès que la base l'exige. Tout se
> corrige d'un clic.
>
> « Ce que le dossier sait déjà, on ne vous le redemande pas. Ce qui reste à
> écrire — **ce qui est décidé, pourquoi, et dans quel contexte** — personne ne
> peut l'écrire à votre place, et l'outil ne fait pas semblant d'essayer. »

> **Trois champs que le prospect croit décoratifs, et qui ne le sont pas.**
>
> - **Ce qui est décidé** ≠ **Justification**. L'un est l'énoncé — *« c'est
>   cette phrase qui sera lue dans deux ans »* —, l'autre le pourquoi. L'écran
>   le dit sous chaque champ.
> - **Le contexte est exigé.** *« Une décision sans contexte ne se relit pas. »*
>   Vingt caractères minimum, refusés par la base, pas par l'écran.
> - **Les options écartées** se replient sous *« Options écartées et
>   conditions »* — facultatives, mais l'écran ajoute : *« mais c'est ce qui
>   fait tenir une décision »*. Une décision sans alternative examinée se
>   défend mal devant un auditeur.

L'écran annonce ce que la décision fera : *« Approuvée, elle fait passer le cas
d'usage “Approuvé” — ou “sous conditions”, ou “Refusé”. »*

**Soumettez.** Et arrêtez-vous une seconde sur ce qui vient de se passer — le
prospect va poser la question.

> **Le statut est resté « Revue ». C'est le point.** « Une décision naît
> **soumise**, jamais approuvée. Le jalon ne se franchit pas parce que
> quelqu'un a rempli un formulaire : il se franchit quand **quelqu'un s'est
> prononcé**, nommément. Regardez en haut : *1 décision à instruire*. Voilà
> l'état réel de mon dossier. »

**Onglet *Décisions et changements*** : la décision y figure, badge **Soumise**,
avec *« attend Marc Lecomte »*. Le bouton **« Se prononcer »** est sur sa ligne
— on tranche **devant le dossier**, pas dans un registre où les décisions de
tous les cas d'usage se mélangent.

Approuvez. **Le statut passe alors à Approuvé**, et c'est seulement là que
*Mise en production* apparaît dans la liste des décisions possibles.

> **Si on vous demande pourquoi vous pouvez approuver votre propre
> autorisation.** « Parce que la séparation des rôles ne s'applique pas à tout,
> et qu'AIGMS ne fait pas semblant. Elle est **exigée par la base** sur trois
> types : mise en production, acceptation de risque, exception de politique.
> Sur ceux-là, l'auteur ne peut pas être l'approbateur — vous le verrez au
> paragraphe suivant. Une autorisation d'usage, elle, peut se prononcer par
> l'officer : ce qu'on exige partout, c'est **un approbateur humain identifié**,
> et la base refuse une décision approuvée sans lui. »

#### Ce que votre verdict vient d'ouvrir — et ce qu'il a fermé

**Le verdict n'est pas binaire**, et il change la suite du parcours. La fenêtre
« Se prononcer » propose *Approuvée*, *Approuvée sous conditions*, *Refusée*.

| Verdict | Statut atteint | Ce qui s'ouvre ensuite |
|---|---|---|
| **Approuvée** | Approuvé | **Pilote *ou* Production** — les deux, au choix |
| **Approuvée sous conditions** | Approuvé sous conditions | **Le pilote seulement** — la production ne s'ouvre qu'après lui |
| **Refusée** | Refusé | Ramener au brouillon, ou retirer |

> **Si vous avez approuvé sous conditions**, la fenêtre *Faire évoluer* vous le
> dit sous les trois cartes : *« Approuvé sous conditions : la mise en
> production ne s'ouvre pas d'ici. Le chemin passe par le pilote — c'est le sens
> des conditions posées à l'approbation. »* **Ce n'est pas un reliquat dans la
> liste : c'est le seul chemin.** Et *Franchir un jalon* est grisé, parce que
> tout ce qui reste depuis là **engage** : cela se décide, cela ne se franchit
> pas.

**La frise le montre aussi.** « Approuvé sous conditions » n'est pas une étape,
c'est une **issue** de l'étape Approuvé : la frise l'y ancre, en ambre, sous son
propre nom — on ne lit pas « Approuvé » là où il est écrit « sous conditions ».

#### 8c — La décision qui emporte tout : la mise en production

**`officer@aigms.eu` → *Faire évoluer* → *Décider* → *Mise en production***

**Les mêmes neuf champs**, plus trois choses que ce type-là seul appelle.

| Champ | Ce qui change sur une mise en production |
|---|---|
| **Date de revue** | **devient exigée** — *« rien ne doit dormir »* |
| **Preuves sur lesquelles la décision se fonde** | **au moins une preuve validée** : cochez la charte déposée à l'étape 6 |
| **Ce que vous en dites** | apparaît *si* des contrôles applicables n'ont aucune preuve — et devient exigé |

**Depuis « Approuvé sous conditions », passez d'abord par le pilote** : décision
*Approbation de pilote*, approuvée → statut **Pilote**. C'est de là que *Mise en
production* devient proposable. Depuis « Approuvé » tout court, elle l'est
directement.

**Les huit préconditions du gate PRODUCTION.** Elles s'évaluent en continu, et
le « ◆ » de la frise ouvre leur liste. Montrez-la : c'est le cœur du produit.

| # | Précondition | Où elle a été remplie |
|---|---|---|
| 1 | Classification réglementaire complète et validée | étape **3** |
| 2 | Aucun risque élevé ou critique sans traitement effectif ni acceptation décidée | étape **4**, puis le traitement |
| 3 | AI Impact Assessment terminé lorsqu'il est requis | étape **7** — visa *et* acceptation |
| 4 | Revue fournisseur close pour chaque tiers impliqué | registre des fournisseurs — *Open.AI y est en ambre* |
| 5 | Supervision humaine approuvée, ou non applicable et justifiée | onglet *Supervision humaine* |
| 6 | Applicabilité statuée pour tous les contrôles obligatoires | étape **5** |
| 7 | Décision GO production approuvée et en vigueur | **c'est celle que vous soumettez** |
| 8 | Aucune action bloquante ouverte | le préjudice **grave** de l'étape 7 en a ouvert une |

> **Deux d'entre elles vont vous arrêter, et c'est voulu.** La **revue du
> fournisseur Open.AI** n'est pas close, et l'**action bloquante** née du
> préjudice grave est encore ouverte. « Regardez ce que l'outil refuse. Il ne
> refuse pas parce qu'une case n'est pas cochée : il refuse parce que
> **personne n'a encore répondu du fournisseur**, et parce qu'une mesure que
> vous avez vous-même jugée nécessaire n'est pas faite. Fermez-les, et le jalon
> s'ouvre. »
>
> Pour la démonstration : soldez l'action *(Suivi d'actions → Terminée)* et
> closez la revue fournisseur avant cette étape, ou assumez de montrer le refus
> — **c'est souvent le plus convaincant des deux**.

**La septième ne vous retient pas**, et il faut le dire si on vous le demande :
la décision que vous soumettez est précisément celle que cette précondition
attend. *« On ne demande pas à la porte la clef qu'on vient lui apporter. »*
Les sept autres, elles, jugent la soumission.

Le formulaire affiche l'écart : **les contrôles applicables sans preuve, nommés
par leur code**, les obligatoires en ambre. Il exige que vous disiez ce qu'il en
est :

> *« Charte signée le 12/11. Console Enterprise livrée, option de rétention
> désactivée. Passerelle DLP en recette, bascule prévue le 30/11. »*

La personne appelée à se prononcer est **Marc Lecomte**, proposé par défaut :
c'est la DSI côté client qui met en service. **Et vous ne pouvez pas vous
prononcer vous-même** : sur une mise en production, une acceptation de risque ou
une exception de politique, la base refuse que l'auteur approuve son propre
acte.

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

#### Quels courriels partent, et quand — à savoir avant qu'on vous le demande

Toutes les alertes ne partent pas au même moment, et c'est délibéré.

| Événement | Alerte dans l'application | Courriel |
|---|---|---|
| **Toute décision soumise** — autorisation, pilote, production, retrait… | oui | **sur-le-champ**, pendant la démonstration |
| Écart de preuve sur une mise en production | oui | **sur-le-champ**, avec les codes des contrôles |
| Étude visée → le Porteur doit accepter | oui | au passage suivant de la tâche planifiée |
| **Risques résiduels acceptés** (étape 7) | oui — l'officer la voit dans sa cloche | au passage suivant |
| Étude renvoyée à l'étude | oui | au passage suivant |
| Action en retard, preuve qui expire, revue due | oui | dans la **synthèse**, à la cadence de chacun |

> **Ce qui part tout de suite : ce qui attend quelqu'un.** Une décision soumise
> est adressée nommément à une personne qui doit se prononcer — elle ne gagne
> rien à dormir jusqu'au lendemain matin. Le reste rejoint la tâche planifiée,
> qui passe une fois par jour, ou la synthèse.

> **Ne promettez donc pas un courriel à l'étape 7.** Après l'acceptation de
> Dominique Etchart, l'officer reçoit bien *« Risques résiduels acceptés »* —
> **dans sa cloche, tout de suite ; par courriel, au prochain envoi.**

> **Avertissement sur l'environnement de démonstration.** La tâche planifiée
> **ne tourne que sur la production**. Sur `demo.aigms.eu`, qui est une
> Preview, seuls les courriels envoyés **sur-le-champ** partent — c'est-à-dire
> ceux des décisions. Tout le reste reste lisible dans « Mes alertes », et rien
> n'est perdu : il ne faut simplement pas l'annoncer devant un prospect.

---

### Étape 9 — La Déclaration d'Applicabilité, le document qu'un auditeur ouvre en premier

**Registres → Déclaration d'Applicabilité** *(2 min)*

C'est la pièce qu'on vous demandera en certification ISO/IEC 42001, et celle
qu'aucun tableur ne tient à jour. Elle se construit **toute seule** à partir de
ce que vous venez de faire — il ne reste qu'à trancher.

#### Ce que la page montre, sans rien saisir

Quatre compteurs en tête : **couvertes et prouvées**, **partiellement
couvertes**, **non couvertes**, **sans décision portée**. Puis, pour chaque
exigence du référentiel, ce qui la couvre **chez ce client** et dans quel état.

| État | Ce qu'il signifie |
|---|---|
| **Couverte et prouvée** *(vert)* | Un contrôle opérant, avec au moins une preuve rattachée |
| **Opérante sans preuve** *(ambre)* | Le contrôle fonctionne, mais rien ne permet de le démontrer |
| **Contrôle déclaré** *(ambre)* | Un contrôle est rattaché, sans être encore opérant |
| **Non couverte** *(rouge)* | Aucun contrôle ne répond à cette exigence |

> **Le geste qui porte.** « Personne n'a rempli cette page. Chaque ligne est le
> reflet de ce que nous avons fait depuis dix minutes : le contrôle retenu à
> l'étape 5 l'a fait passer de *non couverte* à *contrôle déclaré*, la preuve
> déposée à l'étape 6 l'a fait passer au vert. **Une exigence sans couverture
> s'affiche comme telle** — une ligne vide serait plus trompeuse qu'un aveu. »

#### La règle d'or, écrite en tête de page

> **« Aucune case vide : chaque exigence est sélectionnée ou exclue, et
> justifiée. »**

C'est le premier défaut qu'un auditeur relève, et le seul qui ne se rattrape pas
par un argument. La page compte donc, en clair : *« n exigences décidées sur N —
n sélectionnées, n exclues »*.

#### Le rôle de l'organisation commande le régime de preuve

La ligne suivante le dit : *« Le rôle **Utilisateur métier** impose une preuve
technique sur n d'entre elles. »* Selon la criticité que la matrice attribue à
ce rôle, chaque exigence appelle :

| Régime | Ce qui est attendu |
|---|---|
| **Preuve technique** | Décrire la mesure en place et pointer un livrable concret : journaux, manifestes, rapports d'audit |
| **Preuve organisationnelle** | L'exigence s'applique, mais la preuve est une politique, une clause, une procédure humaine |
| **Exclusion motivée** | Le rôle exercé ne rencontre pas ce risque : écrire pourquoi |
| **Non couverte par la matrice** | La matrice ne se prononce pas — la règle d'or s'applique quand même |

> **Insistez.** « Le même référentiel ne demande pas la même chose à un hébergeur
> et à une PME qui achète un assistant. Vous n'entraînez pas de modèle : on ne
> vous demandera pas de prouver l'équité d'un modèle que vous n'avez pas fait.
> **Ce n'est pas de l'indulgence, c'est de la pertinence** — et c'est ce qui rend
> l'exercice tenable. »

#### Trancher : le geste, et ce qu'on écrit

Le filtre **« Filtrer par écart »** isole ce qui appelle une décision :

| Écart | Ce qu'il rassemble |
|---|---|
| **À décider** | Ni sélectionnée ni exclue — la règle d'or n'est pas tenue |
| **Exclusion à réexaminer** | Exclue alors que la matrice attend une preuve pour ce rôle |
| **Preuve technique manquante** | Sélectionnée, attendue en technique, sans preuve technique |
| **Aucun contrôle rattaché** | Sélectionnée, mais rien ne la sert |

Sur la ligne, **« Décider — sélectionner ou exclure »** ouvre trois éléments : le
rappel de ce que le régime attend, deux boutons **Sélectionnée / Exclue**, et une
**justification obligatoire**. Puis *« Porter la décision »*.

**Trois lignes à faire devant le prospect** — prenez celles qui sont en écart
sur son écran ; à défaut, ces trois-là :

| Exigence | Décision | Justification à saisir |
|---|---|---|
| Une exigence servie par un contrôle retenu à l'étape 5 | **Sélectionnée** | `Servie par AIGMS-SEC-008, outillé par Netskope, preuve attendue au 30/11.` |
| Une exigence d'entraînement ou de conception de modèle | **Exclue** | `BATIVAL n'entraîne ni ne conçoit de modèle : elle exploite un système acquis. Le rôle d'utilisateur métier ne rencontre pas cette exigence.` |
| Une exigence d'hébergement ou d'isolation physique | **Exclue** | `L'infrastructure est celle du fournisseur, sous sa responsabilité. La clause contractuelle en tient lieu — voir AIGMS-SUP-005.` |

> **La phrase de fin.** « Une exclusion n'est pas une case décochée : c'est une
> **décision signée, avec son motif, et le nom de qui l'a portée**. Voilà la
> différence entre un tableur de conformité et un système de gouvernance. Le jour
> de l'audit, on ne vous demandera pas si vous avez tout fait — on vous demandera
> **ce que vous avez décidé, et pourquoi**. »

**Avertissement à connaître**, écrit dans l'infobulle de la page : les intitulés
et résumés sont **rédigés par AIGMS** et expriment ce qu'une organisation doit
pouvoir démontrer. Ils **ne reproduisent pas le texte de la norme**, qui s'obtient
auprès de l'ISO, et ne valent **ni avis de certification ni conclusion d'audit**.

> **Dites-le vous-même avant qu'on vous le demande.** « Nous ne vendons pas une
> certification, et nous ne redistribuons pas la norme. Nous vous donnons le
> document qui la sert, tenu à jour par votre travail. »

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
| Charte d'usage signée | Critique | ISO 42001 A.5 | **AIGMS-GOV-008** + pièce rattachée |
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

---

# Annexe — La suite de l'histoire

*Huit minutes. Se déroule après l'étape 8, et seulement si le prospect en
redemande. Objectif : éprouver et montrer les quatre vues de **Processus et
risques**.*

## Pourquoi cette annexe existe

La démonstration principale suit **un** usage, de bout en bout. Elle convainc
sur la chaîne de responsabilité, et laisse une question ouverte :

> *« D'accord pour un usage. Mais nous, on en a combien qu'on ne connaît pas ? »*

C'est exactement la question à laquelle la cartographie répond. Et la réponse
n'est pas un chiffre : c'est **une case vide**.

---

## Le décor : trois semaines plus tard

À raconter en une phrase avant de cliquer.

> « Trois semaines ont passé. Le devis par IA est encadré, sa charte est
> déposée, Marc Lecomte a assumé l'écart de preuve. Et le directeur général
> pose la question qui fâche : *est-ce que c'était le seul ?* »

---

## A1 — Cartographier ce que fait l'entreprise *(2 min)*

**`officer@aigms.eu` · Processus et risques → Ajouter un processus**

Deux processus, trois activités. C'est le minimum qui fasse une carte lisible.

| | Nom | Code | Nature |
|---|---|---|---|
| Processus 1 | Répondre aux appels d'offres | `AO` | **Réalisation** |
| Processus 2 | Gérer les ressources humaines | `RH` | **Support** |

Puis **Ajouter une activité** :

| Activité | Processus | Description |
|---|---|---|
| Chiffrage et rédaction des devis | Répondre aux appels d'offres | Établir le prix et rédiger la proposition remise au client. |
| Analyse des pièces marché | Répondre aux appels d'offres | Dépouiller les CCTP et les pièces administratives d'un dossier de consultation. |
| Recrutement des compagnons | Gérer les ressources humaines | Recevoir les candidatures, présélectionner, conduire les entretiens. |

> **Insistez ici.** « Je ne décris pas mon informatique. Je décris **ce que
> l'entreprise fait**. Trois nature de processus : pilotage, réalisation,
> support — c'est la structure d'un système de management, pas un organigramme
> technique. L'IA viendra se ranger là-dedans, et nulle part ailleurs. »

---

## A2 — Rattacher l'usage à son activité *(30 s)*

**Vue Processus → déplier « Répondre aux appels d'offres » → activité
« Chiffrage et rédaction des devis » → le bouton `+`**

Rattachez le cas d'usage **Génération de devis par IA générative**.

> **Confirmation visuelle.** Le panneau de droite se remplit : l'usage, sa
> criticité, ses risques, ses contrôles. « L'usage que nous venons de gouverner
> pendant dix minutes vient de trouver sa place dans l'entreprise. Ce n'est plus
> une fiche isolée : c'est une activité du processus commercial. »

---

## A3 — Le second usage, celui qu'on n'avait pas déclaré *(1 min 30)*

**Cas d'usage → Déclarer un cas d'usage**, puis rattacher à l'activité
**Analyse des pièces marché**.

| Champ | À saisir |
|---|---|
| Nom | Dépouillement assisté des CCTP |
| Finalité | Extraire d'un dossier de consultation les exigences techniques, les pénalités et les délais, pour décider s'il faut répondre. |
| Porteur de l'IA | Dominique Etchart |
| Responsable redevable | Marc Lecomte |
| Données traitées | Pièces marché publiques, notes internes de décision |
| Niveau d'autonomie | **L1 — il propose, un humain valide** |

Criticité : **Modérée** *(pas de données personnelles, erreur rattrapable)*.

> **Le geste qui porte.** « Celui-ci ne traite aucune donnée personnelle. Et
> regardez ce qu'AIGMS n'exige pas : pas d'étude d'impact, pas d'AIPD, presque
> aucun contrôle déclenché. **L'effort de gouvernance suit le risque.** Un outil
> qui vous demande la même chose pour les deux vous fera abandonner. »

---

## A4 — Vue **Couverture** : ce que les contrôles couvrent vraiment *(1 min 30)*

**Onglet Couverture, par activité**

Les barres sont basses, voire vides. C'est le moment le plus utile de l'annexe.

> **Insistez ici, lentement.** « Un contrôle n'est compté comme couvrant que
> s'il est **opérant** *et* **prouvé par une pièce validée et non échue**. Nous
> avons retenu cinq contrôles il y a dix minutes, et déposé **une** preuve.
> Cette barre dit la vérité : quatre contrôles sur cinq ne protègent encore
> personne. »

> **Et la phrase qui vend.** « C'est exactement ce qu'un auditeur vient
> vérifier. La différence entre un tableur de conformité et AIGMS est là : le
> tableur aurait affiché cinq contrôles verts. »

---

## A5 — Vue **Risques** : une décision n'est pas une alerte *(1 min 30)*

**Onglet Risques, par processus**

Le risque *Fuite de données commerciales* apparaît en **rouge** sur le processus
commercial.

**Basculez sur `risk-comity@aigms.eu` (Sacha Belarbi)** et acceptez le risque :
justification, date de revue.

**Revenez à la vue Risques.** La barre rouge a disparu.

> **Insistez ici.** « Le risque n'a pas été résolu. Il a été **assumé**, par une
> personne nommée, avec une justification et une date de revue. Les couleurs
> comptent les risques **ouverts**, pas le total — laisser celui-ci en rouge
> reviendrait à confondre une décision avec une alerte. »

> **Et la limite, à dire soi-même.** « Ce que vous ne devez jamais avoir, c'est
> un risque **sans décision**. Ni traité, ni accepté. Celui-là, AIGMS le garde
> en rouge et retient la mise en production. »

---

## A6 — Vue **Graphe** : où la chaîne rompt *(1 min 30)*

**Onglet Graphe → suivre le risque *Fuite de données commerciales***

Le chemin s'illumine : processus → activité → cas d'usage → risque → contrôle →
**preuve**. Et il s'arrête quelque part.

> **Le geste qui porte.** Laissez le prospect lire le chemin avant de parler.
> « AIGMS ne dit pas *“il manque des preuves”*. Il dit **où**, sur quel
> contrôle, pour quel risque, dans quelle activité de quel processus. C'est la
> différence entre un constat et une action. »

Montrez aussi un **contrôle partagé** entre les deux cas d'usage, s'il y en a
un : la preuve se collecte une fois et sert deux fois.

---

## A7 — La case vide *(1 min)*

**Retournez à la vue Processus.** L'activité **Recrutement des compagnons**
n'affiche aucun usage d'IA.

> **La phrase de clôture.** « Voilà la case la plus intéressante de l'écran.
> Elle ne dit pas *“il n'y a pas d'IA au recrutement”*. Elle dit *“personne n'a
> déclaré d'IA au recrutement”*. Nous avons commencé cette démonstration parce
> que des commerciaux utilisaient ChatGPT sans le dire. Combien de vos cases
> sont vides pour la même raison ? »

> **Et la sortie.** « C'est le travail de l'AI Governance Officer : passer de la
> case vide à la case déclarée. AIGMS ne le fait pas à votre place — il rend le
> travail visible, et il garde la trace de qui a décidé quoi. »

---

## Ce que cette annexe a démontré, en une ligne chacun

| Vue | Ce qu'elle prouve |
|---|---|
| **Processus** | L'IA se range dans ce que fait l'entreprise, pas dans un inventaire technique |
| **Couverture** | Un contrôle déclaré n'est pas un contrôle prouvé — et l'outil ne triche pas |
| **Risques** | Une décision assumée sort du rouge ; un risque sans décision n'en sort pas |
| **Graphe** | L'outil nomme l'endroit exact où la chaîne rompt |
| **La case vide** | Ce qu'on ne sait pas encore est une information, pas un trou |

## Après cette annexe — remettre BATIVAL à blanc

Tout ce que la démonstration et son annexe ont créé reste dans BATIVAL
Construction. Ne le retirez pas écran par écran : un script le fait, et il
compte avant d'écrire.

```
npm run demo:purger -- --org BATIVAL              # compte, n'écrit rien
npm run demo:purger -- --org BATIVAL --oui        # efface
```

Il conserve l'organisation, ses huit comptes et leurs rôles, ainsi que les deux
actifs d'IA et le fournisseur du décor : le scénario se rejoue dès l'étape 1
sans rien recréer. Ajoutez `--complet` pour retirer aussi le décor.

Sur la base d'une Preview ou de la préproduction, ajoutez `--ref <projectRef>`.

> **Il refuse IzarLink Demo**, en dur, quoi qu'on lui demande : cette
> organisation porte le jeu de données complet dont dépendent les autres
> démonstrations et les tests automatisés.

**Une organisation ne se supprime jamais** — la base le refuse, et c'est
voulu : ses décisions et ses preuves doivent rester lisibles, et le journal
d'audit ne porte aucune clé étrangère vers elle. On vide, on ne supprime pas.
