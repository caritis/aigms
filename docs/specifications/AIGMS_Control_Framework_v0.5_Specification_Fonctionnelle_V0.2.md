# AIGMS --- Spécification fonctionnelle

## Évolution du AIGMS Control Framework v0.4 vers v0.5 --- Applicabilité contextuelle & AI Security Assurance

**Version du document :** V0.2\
**Produit :** AIGMS --- AI Governance Management System by Caritis\
**Cible :** Claude Code / équipe de développement AIGMS\
**Objet :** Faire évoluer le référentiel de contrôles existant sans
créer un second référentiel, sans dupliquer les contrôles déjà présents
et sans complexifier les cas d'usage simples.

------------------------------------------------------------------------

# 1. Vision et principe directeur

AIGMS possède actuellement un **AIGMS Control Framework v0.4** composé
d'environ 120 contrôles-types.

Chaque contrôle-type porte déjà notamment :

-   un code ;
-   un intitulé ;
-   un domaine ;
-   une nature de mesure ;
-   un objectif / une description ;
-   une fréquence ;
-   éventuellement un responsable-type ;
-   des preuves attendues ;
-   des questions d'évaluation ;
-   des correspondances, notamment ISO/IEC 42001.

Ce modèle constitue le **socle à conserver**.

La présente évolution ne doit pas créer un nouveau « AI Security
Framework » parallèle.

Elle doit faire évoluer le référentiel existant vers :

> **AIGMS Control Framework v0.5**

avec trois améliorations principales :

1.  enrichir les contrôles existants lorsque leur périmètre couvre déjà
    les nouveaux risques IA ;
2.  créer uniquement les contrôles réellement absents après Gap Analysis
    ;
3.  rendre contrôles, questions d'évaluation et preuves attendues
    **contextuellement applicables au cas d'usage**.

Principe produit :

> **Le référentiel est complet ; son application est contextuelle.**

Tous les cas d'usage ne doivent donc pas recevoir tous les contrôles.

------------------------------------------------------------------------

# 2. Exigence impérative : analyser l'existant avant toute modification

Claude Code doit commencer par analyser :

-   le repository AIGMS ;
-   le schéma de données ;
-   le AIGMS Control Framework v0.4 ;
-   les \~120 contrôles-types existants ;
-   les domaines et natures de mesures ;
-   les preuves attendues ;
-   les questions d'évaluation ;
-   les mappings ISO/IEC 42001 existants ;
-   le mécanisme de publication/version du référentiel ;
-   l'instanciation d'un contrôle-type en contrôle opérationnel ;
-   la DoA / applicabilité existante ;
-   les risques ;
-   les actifs ;
-   les preuves ;
-   les décisions ;
-   la Risk Map ;
-   les cas d'usage ;
-   les workflows et écrans existants.

## Règle absolue

Avant de proposer un nouveau contrôle, répondre à :

> **« Un contrôle v0.4 couvre-t-il déjà ce besoin, éventuellement avec
> un enrichissement de son objectif, de ses questions, de ses preuves ou
> de ses mappings ? »**

Si OUI :

**enrichir l'existant.**

Si NON :

**proposer un nouveau contrôle.**

Aucun nouveau contrôle ne doit être créé simplement parce qu'un
référentiel externe utilise un intitulé différent.

------------------------------------------------------------------------

# 3. Architecture conceptuelle à préserver

Le modèle fondamental reste :

``` text
CONTROL TYPE
      |
      v
AIGMS Control Framework
      |
      v
Operational Control
      |
      +--> Organisation
      +--> Use Case
      +--> Asset
      +--> Risk
      +--> Owner
      +--> Evidence
      +--> Decision
```

Ne pas créer un deuxième moteur de contrôles.

Ne pas créer un deuxième registre de preuves.

Ne pas créer un deuxième Risk Register.

Ne pas créer une seconde DoA.

------------------------------------------------------------------------

# 4. Structure du contrôle-type v0.5

Conserver les propriétés existantes.

Structure conceptuelle cible :

``` text
ControlType
|
+-- Code
+-- Name
+-- Domain
+-- MeasureNature
+-- Objective
+-- Frequency
+-- DefaultOwner
|
+-- ExpectedEvidence
|
+-- AssessmentQuestions
|
+-- ApplicabilityMetadata        [NOUVEAU / à adapter à l’existant]
|
+-- RiskMappings                 [NOUVEAU ou enrichi]
|
+-- FrameworkMappings            [ENRICHI]
     +-- ISO/IEC 42001
     +-- ISO/IEC 27001
     +-- NIST AI RMF
     +-- NIST SSDF
     +-- OWASP GenAI
     +-- MITRE ATLAS
     +-- EU AI Act si pertinent
```

Cette structure est conceptuelle.

Claude doit d'abord déterminer comment l'implémenter avec le minimum de
changements dans le modèle actuel.

------------------------------------------------------------------------

# 5. Gap Analysis obligatoire v0.4 → v0.5

Avant implémentation, produire une matrice :

  ----------------------------------------------------------------------------------
  Contrôle /     Couvert v0.4   Action         Contrôle v0.4   Justification
  besoin                                       concerné        
  -------------- -------------- -------------- --------------- ---------------------
  Moindre        Oui            Enrichir       AIGMS-SEC-003   Étendre aux
  privilège                                                    outils/actions agents
  agent                                                        

  Gestion        Oui            Enrichir       AIGMS-SEC-004   Ajouter clés
  secrets                                                      LLM/tokens MCP
  LLM/MCP                                                      

  Prompt         Oui            Enrichir       AIGMS-SEC-007   Étendre injection
  injection                                                    indirecte/RAG/agent

  Exfiltration   Oui            Enrichir       AIGMS-SEC-008   Ajouter scénarios
  IA                                                           LLM/RAG/agent

  Abuse          Oui            Enrichir       AIGMS-SEC-009   Étendre
  API/modèles                                                  consommation/usage
                                                               abusif

  Code Security  À vérifier     Enrichir ou    À déterminer    Gap Analysis
  Review                        créer                          

  Supply Chain   À vérifier     Enrichir ou    À déterminer    Gap Analysis
  IA                            créer                          

  RAG / Vector   À vérifier     Enrichir ou    À déterminer    Gap Analysis
  Security                      créer                          

  Agent Memory   À vérifier     Enrichir ou    À déterminer    Gap Analysis
  Security                      créer                          

  Human Approval À vérifier     Enrichir ou    À déterminer    Gap Analysis
                                créer                          

  AI Security    À vérifier     Enrichir ou    À déterminer    Gap Analysis
  Testing                       créer                          

  AI Incident    À vérifier     Enrichir ou    À déterminer    Gap Analysis
  Response                      créer                          
  ----------------------------------------------------------------------------------

Les références ci-dessus aux contrôles visibles de la v0.4 sont des
hypothèses de travail confirmées par l'interface actuelle. Claude doit
vérifier leur définition réelle avant modification.

------------------------------------------------------------------------

# 6. Ne pas créer systématiquement une famille de 15 nouveaux contrôles

La précédente hypothèse `SEC-AI-001...015` est abandonnée comme règle
d'implémentation.

Les thèmes suivants constituent désormais une **checklist de
couverture** pour la Gap Analysis :

``` text
Secure AI Development Lifecycle
AI Code Security Review
AI Supply Chain Security
Prompt Injection Protection
Input / Output Validation
Secrets & Credential Protection
AI Data & Model Integrity
Agent Tool Authorization
Human Approval for Critical Actions
RAG & Vector Security
AI Security Testing
AI Runtime Monitoring
Model / Prompt Change Control
Agent Memory Security
AI Incident Response
```

Pour chaque thème :

``` text
EXISTING
    -> conserver

EXISTING BUT INCOMPLETE
    -> enrichir

MISSING
    -> créer un nouveau contrôle-type v0.5
```

------------------------------------------------------------------------

# 7. Principe : contrôle générique, évaluation contextuelle

Éviter les doublons spécialisés lorsqu'un contrôle générique peut
couvrir plusieurs architectures.

Exemple :

## AIGMS-SEC-003 --- Moindre privilège

Le contrôle reste unique.

Son objectif peut couvrir :

-   utilisateurs ;
-   comptes de service ;
-   applications ;
-   agents ;
-   outils ;
-   API ;
-   MCP.

### Questions communes

``` text
Les droits accordés sont-ils limités au strict nécessaire ?
Les accès sont-ils revus périodiquement ?
```

### Questions conditionnelles --- Agent

``` text
L’agent peut-il utiliser uniquement les outils nécessaires à sa mission ?
Peut-il modifier ou supprimer des données ?
Les actions sensibles nécessitent-elles une autorisation supplémentaire ?
Les credentials de l’agent possèdent-ils des droits supérieurs au besoin réel ?
```

### Questions conditionnelles --- MCP

``` text
Les scopes accordés aux serveurs MCP sont-ils limités ?
Les outils exposés sont-ils explicitement autorisés ?
```

Le contrôle reste `AIGMS-SEC-003`.

------------------------------------------------------------------------

# 8. Questions d'évaluation conditionnelles

Faire évoluer le modèle :

``` text
ControlType
   |
   +-- AssessmentQuestions
          |
          +-- Common Questions
          |
          +-- Conditional Questions
                 +-- LLM
                 +-- RAG
                 +-- Agent
                 +-- MCP
                 +-- CustomCode
                 +-- SensitiveData
                 +-- AutonomousAction
                 +-- PersistentMemory
```

Chaque question conditionnelle doit pouvoir porter :

``` text
Question
Condition
Priority
Reference
```

Exemple :

``` text
Control: AIGMS-SEC-007

Question:
"Des documents récupérés par le RAG peuvent-ils contenir
des instructions interprétables par le modèle ?"

Condition:
UsesRAG = true
```

Autre exemple :

``` text
Question:
"Une injection de prompt peut-elle provoquer l’appel
d’un outil ou l’exécution d’une action ?"

Condition:
UsesAgent = true AND UsesTools = true
```

------------------------------------------------------------------------

# 9. Preuves attendues conditionnelles

Appliquer le même principe aux preuves.

Structure :

``` text
ExpectedEvidence
|
+-- Common
|
+-- Conditional
     +-- LLM
     +-- RAG
     +-- Agent
     +-- MCP
     +-- CustomCode
     +-- SensitiveData
```

Exemple :

## AIGMS-SEC-004 --- Gestion des secrets

### Preuves communes

``` text
Politique de gestion des secrets
Configuration du coffre de secrets
```

### Si API LLM

``` text
Configuration de stockage des clés API
Rotation des credentials
```

### Si Agent

``` text
Liste des credentials accessibles à l’agent
Scopes et permissions
```

### Si MCP

``` text
Configuration d’authentification MCP
Scopes accordés
Politique de rotation des tokens
```

Ne demander à l'utilisateur que les preuves pertinentes.

------------------------------------------------------------------------

# 10. Profil technique du cas d'usage

Ne pas transformer la déclaration d'un cas d'usage en questionnaire
cyber.

Ajouter progressivement un profil technique minimal.

Attributs conceptuels :

``` text
UsesLLM
UsesRAG
UsesAgents
UsesMultiAgent
UsesTools
UsesMCP
UsesPersistentMemory

UsesSensitiveData
UsesPersonalData
UsesExternalModel
UsesOpenSourceModel
UsesFineTuning
UsesCustomCode

CanExecuteActions
CanModifyData
CanSendExternalMessages
CanTriggerTransactions
CanChangePermissions

InternetAccess
CriticalDecision
HumanApprovalRequired
```

Ces propriétés doivent être :

-   optionnelles lorsque non nécessaires ;
-   dérivées des réponses existantes lorsque possible ;
-   demandées progressivement ;
-   jamais toutes affichées systématiquement.

------------------------------------------------------------------------

# 11. Progressive Assurance

Introduire une profondeur d'analyse proportionnée au cas d'usage.

Cette notion ne constitue pas un score de conformité.

## Level 0 --- Simple

Exemples :

-   rédaction ;
-   résumé ;
-   traduction ;
-   brainstorming ;
-   génération non sensible.

Parcours AIGMS existant conservé.

Pas de cartographie technique obligatoire.

## Level 1 --- Connecté

Exemples :

-   API LLM ;
-   application utilisant un LLM ;
-   données internes ;
-   RAG simple.

Quelques questions complémentaires.

## Level 2 --- Intégré / automatisé

Exemples :

-   RAG sensible ;
-   workflow ;
-   API métier ;
-   code spécifique ;
-   fine-tuning ;
-   modèle open source ;
-   modification de données.

Analyse de sécurité renforcée.

## Level 3 --- Agentique / critique

Exemples :

-   agent ;
-   multi-agent ;
-   MCP ;
-   mémoire persistante ;
-   actions autonomes ;
-   transactions ;
-   modification de permissions ;
-   décision critique.

Analyse Security Assurance complète.

------------------------------------------------------------------------

# 12. Moteur d'applicabilité

Le moteur ne doit pas créer de nouveaux contrôles.

Il sélectionne les contrôles-types pertinents du **même AIGMS Control
Framework v0.5**.

Architecture :

``` text
AIGMS CONTROL FRAMEWORK v0.5
             |
             v
     Applicability Engine
             |
      +------+------+------+
      |             |      |
   Simple          RAG    Agent
      |             |      |
      v             v      v
Recommended Operational Controls
```

Les volumes ne doivent jamais être codés en dur.

------------------------------------------------------------------------

# 13. Règles d'applicabilité

Exemples conceptuels :

``` text
IF UsesCustomCode = true
THEN recommend controls covering:
     - secure development
     - code review
     - dependencies
     - secrets
     - change control
```

``` text
IF UsesRAG = true
THEN recommend controls covering:
     - prompt injection
     - input/output validation
     - data access
     - RAG/vector security
```

``` text
IF UsesAgents = true AND UsesTools = true
THEN recommend controls covering:
     - least privilege
     - tool authorization
     - prompt injection
     - monitoring
     - security testing
```

``` text
IF UsesPersistentMemory = true
THEN recommend control covering:
     - memory integrity/security
```

``` text
IF CanExecuteActions = true
OR CanModifyData = true
OR CanTriggerTransactions = true
THEN recommend controls covering:
     - least privilege
     - human approval
     - monitoring
     - decision traceability
```

Important :

Le moteur doit cibler des **codes de contrôles réels v0.5**, déterminés
après Gap Analysis.

------------------------------------------------------------------------

# 14. Explicabilité de l'applicabilité

Chaque recommandation doit pouvoir répondre à :

> Pourquoi ce contrôle m'est-il proposé ?

Exemple :

``` text
AIGMS-SEC-007 — Protection contre les injections de requêtes

RECOMMANDÉ

Pourquoi ?
Ce cas d’usage :
✓ utilise un LLM
✓ utilise un RAG
✓ consomme des documents internes ou externes

Risque couvert :
Injection indirecte de prompt

Questions supplémentaires :
2

Preuves contextuelles attendues :
3
```

------------------------------------------------------------------------

# 15. UX --- évolution de l'écran « Ajouter un contrôle »

Préserver :

``` text
Depuis un référentiel
Libre
```

Ajouter idéalement un troisième accès :

``` text
Recommandés pour ce cas d’usage
```

Exemple :

``` text
Ajouter un contrôle

[ Recommandés pour ce cas d’usage (12) ]
[ Depuis le référentiel (xxx)           ]
[ Libre                                 ]
```

Dans « Recommandés » :

``` text
AIGMS-SEC-007 — Protection contre les injections

Pourquoi recommandé ?
RAG + contenu documentaire + LLM

Risque :
Indirect Prompt Injection

[Ajouter]
```

L'utilisateur conserve toujours la possibilité de choisir librement dans
le référentiel.

------------------------------------------------------------------------

# 16. Exemple minimal --- cas simple

Cas :

> Assistant approuvé utilisé pour reformuler une communication non
> sensible.

Profil :

``` text
UsesLLM            true
UsesRAG            false
UsesAgents         false
UsesCustomCode     false
UsesSensitiveData  false
CanExecuteActions  false
```

Résultat :

-   parcours actuel conservé ;
-   pas d'Attack Surface obligatoire ;
-   pas de contrôles code ;
-   pas de contrôles agent ;
-   quelques contrôles organisationnels / sécurité génériques si
    pertinents.

Objectif UX :

> Le nouvel enrichissement doit être presque invisible pour ce cas.

------------------------------------------------------------------------

# 17. Exemple détaillé --- cas agentique

Cas :

> Agent IA connecté à Odoo, utilisant un RAG interne, capable de
> préparer puis envoyer un devis.

Profil :

``` text
UsesLLM              true
UsesRAG              true
UsesAgents           true
UsesTools            true
UsesPersistentMemory à déterminer
UsesSensitiveData    true
UsesCustomCode       true
CanModifyData        true
CanSendExternalMessages true
```

AIGMS :

1.  identifie les caractéristiques ;
2.  détermine le niveau d'assurance ;
3.  propose les contrôles v0.5 applicables ;
4.  active les questions contextuelles ;
5.  active les preuves contextuelles ;
6.  associe les risques pertinents ;
7.  laisse l'humain accepter/modifier/N/A ;
8.  journalise la décision.

------------------------------------------------------------------------

# 18. Gestion du code : principe stratégique

AIGMS ne doit pas devenir :

-   SonarQube ;
-   Snyk ;
-   Semgrep ;
-   GitHub Advanced Security ;
-   un SAST ;
-   un SCA.

AIGMS doit gouverner **la réalisation et la preuve des analyses**.

Chaîne :

``` text
Source Code
   |
   v
GitHub / GitLab / Azure DevOps
   |
   +--> SAST
   +--> SCA
   +--> Secret Scan
   +--> Dependency Scan
   +--> Security Tests
              |
              v
            AIGMS
              |
              v
        CONTROL EVIDENCE
```

------------------------------------------------------------------------

# 19. Contrôle potentiel : revue de sécurité du code

Créer ce contrôle uniquement si aucun contrôle v0.4 ne couvre
suffisamment le besoin.

Exemple conceptuel :

## AIGMS-SEC-0XX --- Revue de sécurité du code et des dépendances IA

### Objectif

Les composants logiciels développés ou intégrés dans un système IA font
l'objet d'analyses de sécurité adaptées avant leur mise en production et
lors de leurs évolutions.

### Applicabilité

``` text
UsesCustomCode = true
```

### Preuves attendues

``` text
Rapport SAST
Rapport SCA
Secret scan
Dependency scan
SBOM si applicable
Revue de code
Résultat pipeline CI/CD
```

### Questions d'évaluation

``` text
Le code spécifique fait-il l’objet d’une analyse de sécurité ?
Les dépendances sont-elles analysées ?
Les secrets sont-ils détectés avant déploiement ?
Les vulnérabilités critiques bloquent-elles le déploiement ?
Les revues sont-elles renouvelées après changement significatif ?
```

------------------------------------------------------------------------

# 20. Assets et Technical Components

Avant de créer `TechnicalComponent`, vérifier le modèle Asset existant.

Préférer une extension / typologie d'Asset si possible.

Types potentiels :

``` text
AI_MODEL
LLM_PROVIDER
AGENT
MCP_SERVER
TOOL
API
RAG
VECTOR_STORE
DATASET
DATABASE
APPLICATION
IDENTITY_PROVIDER
CODE_REPOSITORY
CI_CD_PIPELINE
MODEL_REGISTRY
OTHER
```

Relation cible :

``` text
AI Use Case
   |
   +-- Business Process
   +-- Assets / Technical Components
   +-- Risks
   +-- Operational Controls
   +-- Evidence
   +-- Decisions
```

Un cas simple peut ne comporter aucun composant technique explicitement
renseigné.

------------------------------------------------------------------------

# 21. Risk / Control / Implementation / Evidence

Maintenir une séparation stricte.

## Risk

Ce qui peut arriver.

``` text
Prompt Injection
Sensitive Data Leakage
Model Poisoning
Excessive Agency
Compromised Dependency
Memory Poisoning
Model Extraction
Unauthorized Tool Execution
```

## Control

Ce qui réduit le risque.

``` text
AIGMS-SEC-003 — Moindre privilège
```

## Implementation

Comment le client réalise la mesure.

``` text
Azure Managed Identity
RBAC
API Gateway
Tool allowlist
```

## Evidence

Ce qui démontre l'existence ou l'efficacité.

``` text
IAM export
SAST report
Pipeline result
Pull Request approval
Security test
SIEM log
Architecture diagram
```

------------------------------------------------------------------------

# 22. Evidence Assurance

Conserver le repository de preuves existant.

L'enrichir si nécessaire avec :

``` text
Evidence
|
+-- Source
+-- CollectedAt
+-- ValidUntil
+-- RelatedControl
+-- RelatedAsset
+-- Status
```

Statuts possibles :

``` text
VALID
EXPIRING
EXPIRED
MISSING
REJECTED
```

Ne pas créer un deuxième système de preuves.

------------------------------------------------------------------------

# 23. Attack Surface

La vue Attack Surface est une vue dérivée, non un nouveau registre.

Elle ne doit apparaître que lorsque pertinente.

``` text
                 AI USE CASE
                     |
        +------------+------------+
        |            |            |
       DATA         MODEL        AGENT
        |            |            |
     Leakage      Extraction   Injection
     Poisoning    Supply       Excessive Agency
     Privacy      Chain             |
                                    |
                                  TOOLS
                                    |
                               IAM/API/MCP
```

Chaque élément remonte vers les objets existants :

``` text
Attack Surface
     -> Risk
     -> Operational Control
     -> Evidence
     -> Decision
```

Statuts visuels possibles :

``` text
GREEN  couvert
AMBER  partiel
RED    non maîtrisé
GREY   non applicable
```

------------------------------------------------------------------------

# 24. Assistant AIGMS

Réutiliser l'assistant / RAG existant lorsque possible.

Fonction :

> **Analyser la sécurité technique**

Entrées :

``` text
Use Case
Technical Profile
Assets
Risks
Existing Operational Controls
Evidence
Decisions
```

Knowledge base :

``` text
AIGMS Control Framework v0.5
ISO/IEC 42001
ISO/IEC 27001
NIST AI RMF
NIST SSDF
OWASP GenAI
MITRE ATLAS
```

Sortie :

``` text
Contrôle recommandé
Code réel AIGMS v0.5

Pourquoi ?
...

Risque couvert
...

Questions contextuelles
...

Preuves suggérées
...

[ACCEPTER]
[MODIFIER]
[NON APPLICABLE]
```

L'assistant propose.

L'humain décide.

------------------------------------------------------------------------

# 25. Framework mappings

Les mappings externes enrichissent les contrôles AIGMS.

Ils ne doivent jamais créer automatiquement des duplications.

Architecture :

``` text
AIGMS CONTROL
     |
     +-- ISO/IEC 42001
     +-- ISO/IEC 27001
     +-- NIST AI RMF
     +-- NIST SSDF
     +-- OWASP GenAI
     +-- MITRE ATLAS
```

Principe :

> **Un contrôle AIGMS, plusieurs exigences couvertes.**

------------------------------------------------------------------------

# 26. Declaration of Applicability

Réutiliser la DoA existante.

Statuts :

``` text
Applicable
Not Applicable
Pending Assessment
```

Pour un contrôle recommandé sur un cas avancé, une décision
`Not Applicable` doit pouvoir exiger une justification.

Exemple :

``` text
Control:
Agent Memory Security

Status:
NOT APPLICABLE

Reason:
The agent has no persistent memory.
```

------------------------------------------------------------------------

# 27. Versionnement du référentiel

La v0.5 doit être publiée comme une **nouvelle version du AIGMS Control
Framework**, et non comme un référentiel indépendant.

Préserver :

-   historique v0.4 ;
-   traçabilité des modifications ;
-   contrôles supprimés/dépréciés si nécessaire ;
-   mapping ancien → nouveau ;
-   compatibilité des contrôles opérationnels déjà instanciés.

Ne pas modifier silencieusement le sens d'un contrôle déjà utilisé.

Si une modification est substantielle :

-   versionner ;
-   tracer ;
-   définir l'impact sur les contrôles opérationnels existants.

------------------------------------------------------------------------

# 28. Compatibilité ascendante

Tous les cas d'usage existants doivent rester fonctionnels.

Les nouveaux attributs :

-   ne doivent pas rendre les anciens dossiers invalides ;
-   doivent être optionnels par défaut ;
-   ne doivent pas déclencher automatiquement une non-conformité ;
-   ne doivent pas imposer une requalification immédiate.

Un utilisateur pourra enrichir progressivement un cas existant.

------------------------------------------------------------------------

# 29. Priorités d'implémentation

## Phase 0 --- Audit

Obligatoire avant code :

1.  analyser v0.4 ;
2.  analyser modèle de données ;
3.  Gap Analysis des contrôles ;
4.  identifier les contrôles à conserver ;
5.  identifier les contrôles à enrichir ;
6.  identifier les vrais gaps ;
7.  proposer le delta v0.5.

**Livrable avant implémentation :
`AIGMS_Control_Framework_v0.5_Gap_Analysis.md`.**

## Phase 1 --- Framework v0.5

Implémenter :

-   contrôles enrichis ;
-   nouveaux contrôles strictement nécessaires ;
-   mappings complémentaires ;
-   versionnement.

## Phase 2 --- Applicability

Implémenter :

-   profil technique minimal ;
-   règles ;
-   recommandations de contrôles ;
-   explicabilité.

## Phase 3 --- Contextual Assessment

Implémenter :

-   questions conditionnelles ;
-   preuves conditionnelles ;
-   affichage contextuel.

## Phase 4 --- Assets / Attack Surface

Implémenter si nécessaire :

-   enrichissement Assets ;
-   composants techniques ;
-   vue Attack Surface.

## Phase 5 --- Assistant

Ajouter :

-   recommandations RAG ;
-   explications ;
-   propositions de preuves ;
-   validation humaine.

## Phase 6 --- Evidence Automation

Connecteurs possibles :

``` text
GitHub
GitLab
Azure DevOps
SonarQube
Snyk
Defender
SIEM
IAM
Cloud providers
```

------------------------------------------------------------------------

# 30. Critères d'acceptation

### AC-01

Le AIGMS Control Framework reste le référentiel principal unique.

### AC-02

La v0.5 est une évolution versionnée de la v0.4.

### AC-03

Aucun contrôle n'est créé sans Gap Analysis préalable.

### AC-04

Un contrôle existant est enrichi plutôt que dupliqué lorsque son
objectif couvre déjà le besoin.

### AC-05

Un cas simple conserve un parcours simple.

### AC-06

Les anciens cas d'usage restent valides.

### AC-07

Les questions conditionnelles ne s'affichent que si leur contexte est
applicable.

### AC-08

Les preuves conditionnelles ne sont demandées que si pertinentes.

### AC-09

Le moteur explique pourquoi un contrôle est recommandé.

### AC-10

Une recommandation ne vaut jamais décision de conformité.

### AC-11

L'utilisateur peut accepter, modifier ou déclarer N/A.

### AC-12

La DoA existante est réutilisée.

### AC-13

Le registre de preuves existant est réutilisé.

### AC-14

Le Risk Register existant est réutilisé.

### AC-15

Les contrôles opérationnels déjà instanciés depuis v0.4 restent
exploitables.

### AC-16

AIGMS ne devient pas un scanner de code.

### AC-17

Les résultats de scanners externes peuvent devenir des preuves AIGMS.

------------------------------------------------------------------------

# 31. Anti-patterns interdits

Ne pas :

-   créer un `AI Security Framework` parallèle ;
-   créer systématiquement 15 nouveaux contrôles ;
-   dupliquer `AIGMS-SEC-003`, `SEC-004`, `SEC-007`, etc. sous d'autres
    noms ;
-   refaire le formulaire Use Case ;
-   créer un second Risk Register ;
-   créer une seconde DoA ;
-   créer un second Evidence Repository ;
-   appliquer tous les contrôles à tous les cas ;
-   afficher toutes les questions techniques à un utilisateur métier ;
-   imposer une architecture détaillée à un cas simple ;
-   considérer la réponse d'un LLM comme preuve de conformité ;
-   analyser tout le code source dans AIGMS ;
-   transformer AIGMS en SAST/SCA ;
-   casser les contrôles opérationnels v0.4 existants ;
-   modifier silencieusement la sémantique d'un contrôle publié.

------------------------------------------------------------------------

# 32. Directive Claude Code --- ordre impératif

Claude doit travailler dans cet ordre :

``` text
1. READ EXISTING CODE
        |
2. UNDERSTAND v0.4
        |
3. INVENTORY CONTROL TYPES
        |
4. GAP ANALYSIS
        |
5. PROPOSE v0.5 DELTA
        |
6. IDENTIFY DATA MODEL IMPACT
        |
7. IDENTIFY UI IMPACT
        |
8. PRESENT IMPLEMENTATION PLAN
        |
9. IMPLEMENT ONLY AFTER VALIDATION
```

Pour chaque nouvelle table :

> Pourquoi une extension de l'existant est-elle insuffisante ?

Pour chaque nouveau contrôle :

> Quel contrôle v0.4 a été évalué avant de conclure au gap ?

Pour chaque nouvelle question :

> Est-elle commune ou conditionnelle ?

Pour chaque nouvelle preuve :

> Dans quel contexte est-elle réellement nécessaire ?

------------------------------------------------------------------------

# 33. Livrables attendus de Claude avant développement

Claude doit produire :

### 1. `AIGMS_Control_Framework_v0.5_Gap_Analysis.md`

Contenant :

-   inventaire v0.4 ;
-   thèmes de sécurité analysés ;
-   couvertures ;
-   gaps ;
-   contrôles à enrichir ;
-   nouveaux contrôles proposés ;
-   justification.

### 2. `AIGMS_v0.5_Data_Model_Impact.md`

Contenant :

-   entités existantes réutilisées ;
-   extensions nécessaires ;
-   migrations ;
-   compatibilité.

### 3. `AIGMS_v0.5_Applicability_Rules.md`

Contenant :

-   propriétés du profil technique ;
-   règles ;
-   contrôles concernés ;
-   justification.

### 4. `AIGMS_v0.5_Implementation_Plan.md`

Contenant :

-   étapes ;
-   fichiers/classes impactés ;
-   migrations ;
-   UI ;
-   tests ;
-   rollback.

Ne pas démarrer une refonte globale sans ces analyses.

------------------------------------------------------------------------

# 34. Résultat fonctionnel attendu

AIGMS ne doit pas être perçu comme :

> « une bibliothèque de 135 contrôles ».

Il doit progressivement devenir :

> **un système capable de sélectionner, contextualiser, évaluer et
> prouver les contrôles réellement pertinents pour chaque usage IA.**

Chaîne cible :

``` text
USE CASE
    |
    v
TECHNICAL CONTEXT
    |
    v
APPLICABILITY
    |
    v
RELEVANT AIGMS CONTROLS
    |
    v
CONTEXTUAL QUESTIONS
    |
    v
EXPECTED EVIDENCE
    |
    v
HUMAN DECISION
    |
    v
MONITORING
```

------------------------------------------------------------------------

# 35. Proposition de valeur cible

## AIGMS --- Contextual AI Governance & Assurance

Le produit doit pouvoir dire :

> **« Je connais votre cas d'usage. Parmi le référentiel AIGMS, voici
> les contrôles qui semblent applicables, pourquoi ils le sont, les
> risques qu'ils couvrent, les questions à instruire et les preuves
> permettant d'en démontrer la mise en œuvre. »**

Pour un cas simple, cette intelligence reste discrète.

Pour un système complexe, connecté ou agentique, elle devient
progressivement plus approfondie.

C'est cette capacité de **gouvernance proportionnée et contextualisée**
qui constitue la proposition de valeur recherchée.

------------------------------------------------------------------------

# 36. Règle finale d'implémentation

> **Ne pas ajouter de complexité là où le cas d'usage n'en nécessite
> pas.**

Et :

> **Ne pas ajouter de contrôle là où le AIGMS Control Framework en
> possède déjà un qui peut être correctement enrichi.**

La v0.5 doit donc être une **évolution qualitative et contextuelle de la
v0.4**, et non une inflation du référentiel.
