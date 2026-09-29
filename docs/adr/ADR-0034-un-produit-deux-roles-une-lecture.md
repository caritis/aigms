# ADR-0034 — Un produit, deux rôles, une seule lecture

*29 septembre 2026. Aucune migration.*

## Contexte

ADR-0026 puis ADR-0031 ont posé la distinction entre **actif d'IA** — l'objet
gouverné — et **outillage** — l'instrument du contrôle. Elle est juste, sourcée,
et adossée aux textes : ISO/IEC 42001 A.4.4 range l'outillage du *système* parmi
les ressources à documenter ; ISO/IEC 27002 et le RGPD art. 32 rangent
l'outillage du *contrôle* parmi les mesures.

Les utilisateurs — et le propriétaire du produit lui-même — **n'arrivent pas à
l'expliquer**. Le fournisseur, qui se superpose aux deux, achève de brouiller.

Le diagnostic n'est pas que la distinction est mauvaise. C'est que **l'écran
posait la mauvaise question**.

1. Il faisait **choisir un registre avant de comprendre** — « Actifs d'IA » ou
   « Outillage » — donc avoir la théorie en tête avant d'avoir rien saisi.
2. Il **reposait la question en abstrait** : le formulaire d'outillage demandait
   « déclaré à quel titre », avec trois réponses et leurs références normatives.
   Exact, et c'est le moment précis où l'on décrochait.
3. Il affichait le **fournisseur dans les deux formulaires** avec deux libellés,
   laissant croire à deux sortes de tiers.

Le fond : **un produit n'est ni un actif ni un outil en soi.** Il l'est par le
rôle qu'il joue dans une phrase — « le cas d'usage *emploie* Netskope », « le
contrôle *se tient avec* Netskope ». Demander de classer la chose, c'est
demander de répondre à une question mal posée.

## Décisions

1. **Le rôle ne se demande plus, il se déduit.** Un outil déclaré depuis un
   contrôle en est l'instrument. Rattaché à un actif d'IA employé, il est les
   deux. Le champ `role` reste en base et garde son sens ; l'écran cesse de le
   poser, et affiche la phrase qui en découle.

2. **La seule question posée est concrète** : « Est-ce aussi un actif d'IA que
   vous employez ? », avec pour exemples une passerelle d'appels IA, un juge
   LLM, un assistant de code. Elle porte sur un fait que l'utilisateur connaît,
   non sur une taxonomie.

3. **L'homonyme se reconnaît et le lien se propose.** Saisir « Netskope » comme
   outil alors qu'il figure au registre des actifs déclenche une proposition de
   rattachement — comparaison sans accents, sans casse, par inclusion, pour que
   « Netskope » reconnaisse « Netskope DLP ». C'était le cas qui faisait douter
   de la distinction ; il devient celui qui la démontre.

4. **Le fournisseur porte partout la même phrase** — « Qui vous le fournit ? » —
   et dit qu'il n'existe qu'un registre de tiers. Il est orthogonal : il ne dit
   pas ce qu'est la chose.

5. **Deux registres pour écrire, une lecture pour comprendre.** Une vue « Tout
   ce que vous employez » liste chaque produit **une fois**, avec ses pastilles
   *Gouverné* et *Instrument* et son fournisseur. Un outil rattaché à un actif
   n'y paraît pas deux fois : il porte les deux rôles sur la même ligne.

6. **Un test à dire, pas une définition à retenir.** Porté par l'infobulle de la
   fiche d'un contrôle :

   > Si l'auditeur dit « montrez-moi ce que fait votre IA », il parle des
   > **actifs**. S'il dit « prouvez-moi que vous la maîtrisez », il parle de
   > l'**outillage**.

## Conséquences

Aucune migration. Aucun changement de modèle : `organization_tooling.role` et
`organization_tooling.asset_id` existaient depuis 0094 — **personne ne s'en
servait parce que rien ne le proposait**.

La v0.5 va multiplier les natures de composants — serveurs MCP, bases
vectorielles, dépôts de code, pipelines. Une distinction déjà floue à deux
registres serait intenable à dix natures : c'est pourquoi cette correction passe
**avant** la Phase 0 du référentiel.

Un point reste ouvert : la vue unifiée est en **lecture seule**. On n'y déclare
rien, et c'est voulu — les deux formulaires n'ont ni les mêmes champs ni la même
origine réglementaire. Si l'usage montre qu'on cherche à y saisir, il faudra
trancher entre y ouvrir les deux gestes et assumer deux registres visibles.

## Alternatives écartées

**Fusionner les deux tables.** Un actif porte version, hébergement, données
personnelles, rattachement aux cas d'usage ; un outil porte une famille du
référentiel, un connecteur, des contrôles qui le retiennent. Une table commune
aurait porté deux moitiés de colonnes vides, et la Déclaration d'Applicabilité
comme la carte d'outillage auraient dû filtrer sur un discriminant — c'est-à-dire
reconstruire la distinction, en moins lisible.

**Mieux expliquer.** C'était la tentation, et l'infobulle existante le faisait
déjà correctement. Une explication qu'il faut relire à chaque saisie n'est pas
une explication : c'est une dette d'interface.

**Supprimer la notion d'outillage.** Elle est ce qui permet de dire « ce
contrôle se tient avec Netskope, chez nous » plutôt que « avec un outil de
prévention des fuites ». C'est cette phrase qui dit à l'auditeur où prendre la
preuve, et c'est la valeur du registre.
