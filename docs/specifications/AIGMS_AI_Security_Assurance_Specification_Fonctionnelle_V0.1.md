# AIGMS --- Spécification fonctionnelle

## Extension « AI Security Assurance » --- Contrôles de sécurité technique adaptés aux cas d'usage

**Version :** V0.1\
**Produit :** AIGMS --- AI Governance Management System by Caritis\
**Objet :** Étendre l'existant sans casser ni complexifier le parcours
actuel de déclaration des cas d'usage simples.

------------------------------------------------------------------------

## 1. Intention produit

AIGMS dispose déjà d'un parcours de déclaration et de gouvernance des
cas d'usage IA. Cette évolution ne doit **ni remplacer, ni refondre, ni
alourdir** ce fonctionnement existant.

L'objectif est d'ajouter progressivement une capacité de **Security
Assurance** permettant, lorsque le contexte le justifie, de :

1.  qualifier la surface technique d'un cas d'usage ;
2.  identifier les risques de sécurité IA pertinents ;
3.  déterminer automatiquement les contrôles applicables ;
4.  relier ces contrôles aux actifs et composants concernés ;
5.  demander et conserver les preuves appropriées ;
6.  assister l'utilisateur dans la remédiation ;
7.  maintenir la traçabilité des décisions.

### Principe fondamental

> **Tous les cas d'usage IA ne nécessitent pas le même niveau d'analyse
> technique.**

AIGMS doit conserver un parcours très simple pour un usage élémentaire
et augmenter progressivement la profondeur du contrôle lorsque
l'architecture, les données, l'autonomie ou la criticité augmentent.

L'extension doit donc fonctionner selon une logique de **progressive
disclosure / progressive assurance**.

------------------------------------------------------------------------

# 2. Contraintes impératives d'intégration à l'existant

Avant toute implémentation, analyser le code, le modèle de données, les
écrans, services, API et workflows AIGMS existants.

## 2.1 Ne pas recréer ce qui existe déjà

Réutiliser prioritairement les entités et mécanismes existants
concernant notamment :

-   cas d'usage IA ;
-   organisation / tenant ;
-   utilisateurs et rôles ;
-   risques ;
-   contrôles ;
-   référentiels ;
-   preuves ;
-   décisions ;
-   responsables / owners ;
-   statuts ;
-   scoring ;
-   Risk Map ;
-   pré-classification réglementaire ;
-   Declaration of Applicability / DoA ;
-   journalisation et historique.

**Aucune nouvelle entité ne doit être créée si l'objet fonctionnel
existe déjà sous une autre forme.**

Si une extension de modèle suffit, privilégier cette solution.

## 2.2 Compatibilité ascendante

Tous les cas d'usage existants doivent continuer à fonctionner sans
migration fonctionnelle imposée à l'utilisateur.

Un ancien cas d'usage ne doit pas devenir incomplet ou invalide parce
que les nouveaux champs Security Assurance n'ont pas été renseignés.

Les nouveaux attributs doivent donc être :

-   optionnels par défaut ;
-   initialisés avec des valeurs compatibles ;
-   activés uniquement lorsque nécessaires.

## 2.3 Ne pas transformer la création d'un cas d'usage en questionnaire cyber

Le formulaire actuel de déclaration doit rester le point d'entrée
principal.

Le profil technique détaillé ne doit apparaître que :

-   lorsqu'une réponse existante permet de détecter un besoin ;
-   lorsque l'utilisateur active volontairement l'analyse avancée ;
-   ou lorsque le moteur de règles identifie une architecture
    nécessitant une qualification supplémentaire.

------------------------------------------------------------------------

# 3. Modèle de maturité du cas d'usage

Introduire une notion fonctionnelle de **Security Assurance Level**.

Elle ne constitue pas un score de conformité mais détermine la
profondeur d'analyse requise.

## LEVEL 0 --- Usage simple

Exemples :

-   rédaction ;
-   résumé ;
-   traduction ;
-   brainstorming ;
-   génération de contenu non sensible.

Exemple :

> Un collaborateur utilise un assistant IA approuvé pour reformuler une
> communication interne non confidentielle.

AIGMS conserve le parcours actuel.

Aucune cartographie technique détaillée obligatoire.

Contrôles génériques possibles :

-   usage d'un outil autorisé ;
-   politique d'utilisation ;
-   absence de données interdites ;
-   sensibilisation utilisateur.

------------------------------------------------------------------------

## LEVEL 1 --- Usage connecté

Exemples :

-   API LLM ;
-   application métier utilisant Claude/OpenAI/Mistral ;
-   RAG documentaire ;
-   accès à des données internes.

AIGMS demande quelques informations techniques supplémentaires.

------------------------------------------------------------------------

## LEVEL 2 --- Usage intégré / automatisé

Exemples :

-   RAG sensible ;
-   workflow automatisé ;
-   appel d'API métier ;
-   modification de données ;
-   outils externes ;
-   modèle open source ou fine-tuning.

Une analyse Security Assurance devient recommandée ou obligatoire selon
le risque.

------------------------------------------------------------------------

## LEVEL 3 --- Usage agentique / critique

Exemples :

-   agent autonome ;
-   multi-agent ;
-   mémoire persistante ;
-   MCP ;
-   accès SI ;
-   capacité d'exécution ;
-   décision ou action à impact important ;
-   transaction ;
-   modification de droits ;
-   action irréversible.

AIGMS active l'analyse technique complète.

------------------------------------------------------------------------

# 4. Qualification progressive du profil technique

Créer, si le modèle existant ne permet pas déjà de les représenter, les
attributs fonctionnels suivants.

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

Ces propriétés ne doivent **pas toutes être affichées
systématiquement**.

Le formulaire doit fonctionner par questions conditionnelles.

Exemple :

``` text
Ce système utilise-t-il un agent capable d’agir ?

NON
→ continuer le parcours normal

OUI
→ afficher :
   - Quels outils peut-il utiliser ?
   - Peut-il modifier des données ?
   - Dispose-t-il d’une mémoire ?
   - Une validation humaine est-elle requise ?
```

------------------------------------------------------------------------

# 5. Objet fonctionnel « Technical Component »

Avant création, vérifier si la notion d'Asset existante permet déjà de
porter ces informations.

Si nécessaire, ajouter une spécialisation `TechnicalComponent` ou un
type d'Asset.

Types possibles :

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

Relations attendues :

``` text
AI Use Case
    |
    +-- Business Process
    |
    +-- Assets
    |
    +-- Technical Components
    |      +-- Model
    |      +-- Agent
    |      +-- RAG
    |      +-- Dataset
    |      +-- API
    |      +-- MCP Server
    |      +-- Tool
    |
    +-- Risks
    +-- Controls
    +-- Decisions
    +-- Evidence
```

Un cas d'usage simple peut avoir **zéro Technical Component
explicitement renseigné**.

------------------------------------------------------------------------

# 6. Famille de contrôles « SEC-AI --- Secure AI Engineering »

Ne pas créer un unique contrôle « Sécuriser le code IA ».

Créer une famille de contrôles atomiques pouvant être activés
indépendamment.

  -----------------------------------------------------------------------
  ID                      Contrôle                Objet
  ----------------------- ----------------------- -----------------------
  SEC-AI-01               Secure AI Development   Développement sécurisé
                          Lifecycle               

  SEC-AI-02               AI Code Security Review Revue/SAST du code

  SEC-AI-03               Dependency & Supply     Packages, modèles et
                          Chain Security          dépendances

  SEC-AI-04               Prompt Injection        Injection
                          Protection              directe/indirecte

  SEC-AI-05               Input / Output          Validation
                          Validation              entrées/sorties

  SEC-AI-06               Secrets & Credential    Secrets, tokens et API
                          Protection              keys

  SEC-AI-07               AI Data & Model         Intégrité
                          Integrity               données/modèles

  SEC-AI-08               Agent Tool              Least privilege
                          Authorization           agents/outils

  SEC-AI-09               Human Approval for      Human-in-the-loop
                          Critical Actions        

  SEC-AI-10               RAG & Vector Security   Sources, ACL,
                                                  embeddings

  SEC-AI-11               AI Security Testing     Tests adversariaux

  SEC-AI-12               AI Runtime Monitoring   Logs, anomalies,
                                                  surveillance

  SEC-AI-13               Model / Prompt Change   Versioning et
                          Control                 changements

  SEC-AI-14               Agent Memory Security   Mémoire persistante

  SEC-AI-15               AI Incident Response    Réponse aux incidents
                                                  IA
  -----------------------------------------------------------------------

Chaque contrôle doit supporter le mécanisme de contrôle existant AIGMS :

``` text
Applicable
Not Applicable
Implemented
Partially Implemented
Not Implemented
Evidence Required
Owner
Due Date
Risk Link
Decision Link
```

Ne pas dupliquer ces propriétés si elles existent déjà.

------------------------------------------------------------------------

# 7. Moteur d'applicabilité des contrôles

Créer un mécanisme de règles permettant à AIGMS de **proposer** les
contrôles pertinents.

Il ne doit pas appliquer aveuglément les 15 contrôles.

Exemples :

``` text
IF UsesCustomCode = true
THEN propose SEC-AI-01
             SEC-AI-02
             SEC-AI-03
             SEC-AI-06
             SEC-AI-13
```

``` text
IF UsesRAG = true
THEN propose SEC-AI-04
             SEC-AI-05
             SEC-AI-10
```

``` text
IF UsesAgents = true AND UsesTools = true
THEN propose SEC-AI-04
             SEC-AI-08
             SEC-AI-11
             SEC-AI-12
```

``` text
IF UsesPersistentMemory = true
THEN propose SEC-AI-14
```

``` text
IF CanExecuteActions = true
OR CanModifyData = true
OR CanTriggerTransactions = true
THEN propose SEC-AI-08
             SEC-AI-09
             SEC-AI-12
```

``` text
IF UsesOpenSourceModel = true
THEN propose SEC-AI-03
             SEC-AI-07
             SEC-AI-11
```

Chaque proposition doit enregistrer :

``` text
ControlId
ApplicabilityReason
TriggeredBy
Reference
SuggestedEvidence
Confidence
```

------------------------------------------------------------------------

# 8. Distinction Risk / Control / Evidence

Respecter strictement la séparation suivante.

## Risk

Ce qui peut arriver.

Exemples :

``` text
Indirect Prompt Injection
Model Poisoning
Sensitive Data Leakage
Excessive Agency
Compromised AI Dependency
Agent Memory Poisoning
Model Extraction
Unauthorized Tool Execution
```

## Control

Ce qui réduit le risque.

Exemple :

``` text
SEC-AI-08 — Agent Tool Authorization
```

## Implementation

Comment le client réalise le contrôle.

Exemple :

``` text
Azure Managed Identity
RBAC
API Gateway
allowlist d’actions
```

## Evidence

Ce qui démontre que la mesure existe et fonctionne.

Exemple :

``` text
IAM configuration export
CI/CD report
SAST report
Pull Request approval
Penetration test
Security test report
SIEM log
Architecture diagram
```

Cette séparation est fondamentale pour AIGMS.

------------------------------------------------------------------------

# 9. Gestion spécifique du code

AIGMS ne doit pas devenir un scanner de code.

Le produit doit gouverner **le résultat des outils de sécurité**, et non
reproduire leurs fonctions.

Architecture cible :

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
     +--> AI Security Tests
              |
              v
           AIGMS
              |
              v
      CONTROL EVIDENCE
```

Exemple de contrôle :

``` text
SEC-AI-02
AI Code Security Review
```

Evidence Policy :

``` text
SAST executed = true
Critical vulnerabilities = 0
High vulnerabilities <= accepted threshold
Review approved = true
Evidence age <= configured period
```

AIGMS doit pouvoir enregistrer manuellement ces preuves dans un premier
temps.

Les connecteurs automatiques viendront ensuite.

------------------------------------------------------------------------

# 10. Evidence Assurance

Ajouter progressivement une notion de qualité de preuve.

Exemple :

``` text
Evidence
   |
   +-- source
   +-- collectedAt
   +-- validUntil
   +-- relatedControl
   +-- relatedAsset
   +-- relatedComponent
   +-- status
```

Statuts :

``` text
VALID
EXPIRING
EXPIRED
MISSING
REJECTED
```

Un contrôle ne doit pas être considéré comme durablement maîtrisé
uniquement parce qu'une preuve a été déposée une fois.

------------------------------------------------------------------------

# 11. Attack Surface

Ajouter une vue **AI Attack Surface** uniquement pour les cas qui le
justifient.

Ne pas afficher cette vue comme obligatoire pour un cas simple.

Structure conceptuelle :

``` text
                   AI USE CASE
                       |
        +--------------+--------------+
        |              |              |
       DATA           MODEL          AGENT
        |              |              |
     Leakage        Extraction     Injection
     Poisoning      Supply Chain   Excessive Agency
     Privacy        Poisoning          |
                                      TOOLS
                                       |
                                 IAM / API / MCP
```

Chaque zone peut afficher :

``` text
GREEN  = risques couverts
AMBER  = couverture partielle
RED    = risque non maîtrisé
GREY   = non applicable
```

Un clic doit permettre de remonter :

``` text
Attack Surface
→ Risk
→ Control
→ Implementation
→ Evidence
→ Decision
```

------------------------------------------------------------------------

# 12. Assistant IA Security Assurance

Réutiliser l'assistant/RAG AIGMS existant plutôt que créer un second
assistant si cela est possible.

Fonction :

### « Analyser la sécurité technique »

Contexte transmis :

``` text
Use Case
Technical Profile
Assets
Technical Components
Risks
Existing Controls
Existing Evidence
Decisions
```

Connaissances RAG :

``` text
AIGMS Control Framework
NIST AI RMF
NIST SSDF / SP 800-218A
OWASP GenAI
MITRE ATLAS
ISO/IEC 27001
ISO/IEC 42001
```

L'assistant ne décide jamais seul de la conformité.

Il génère des **propositions explicables**.

Exemple :

``` text
Contrôle recommandé

SEC-AI-04
Prompt Injection Protection

Pourquoi ?
Le cas d’usage utilise un RAG alimenté
par des documents externes.

Risque :
Indirect Prompt Injection

Composant concerné :
Knowledge Base / RAG

Preuves suggérées :
- adversarial test report
- configuration d’isolation
- politique de sources RAG

[ACCEPTER]
[MODIFIER]
[NON APPLICABLE]
```

Toute décision utilisateur doit être journalisée.

------------------------------------------------------------------------

# 13. Parcours UX --- cas simple

Exemple :

> Utilisation d'un assistant approuvé pour résumer des comptes rendus
> non sensibles.

Parcours :

``` text
Create Use Case
      |
      v
Existing AIGMS questionnaire
      |
      v
Technical complexity detected: LOW
      |
      v
Security Assurance Level 0
      |
      v
Existing Risk / Regulatory Assessment
```

Aucune nouvelle étape obligatoire.

L'utilisateur peut éventuellement cliquer :

``` text
[ Analyse technique avancée ]
```

mais ce n'est pas nécessaire.

------------------------------------------------------------------------

# 14. Parcours UX --- cas avancé

Exemple :

> Agent IA connecté à Odoo, utilisant un RAG interne et capable de
> générer puis envoyer un devis.

``` text
Create Use Case
      |
      v
Existing questionnaire
      |
      v
Agent detected
      |
      v
3 questions complémentaires
      |
      v
Technical Profile
      |
      v
Attack Surface generated
      |
      v
Risks suggested
      |
      v
Controls suggested
      |
      v
Human validation
      |
      v
Evidence requirements
      |
      v
Operate / Monitor
```

Le système doit donner l'impression que **la complexité vient du cas
d'usage, pas d'AIGMS**.

------------------------------------------------------------------------

# 15. Progressive Assurance

Principe UX essentiel :

``` text
Simple Use Case
     |
     v
Simple Governance

Connected Use Case
     |
     v
Contextual Controls

Agentic Use Case
     |
     v
Security Assurance

Critical Use Case
     |
     v
Continuous Assurance
```

AIGMS adapte ainsi la profondeur de gouvernance au niveau réel
d'exposition.

------------------------------------------------------------------------

# 16. Référentiels et mapping

Les contrôles SEC-AI ne doivent pas être isolés.

Prévoir un mapping multiple :

``` text
AIGMS Control
      |
      +-- ISO/IEC 27001
      +-- ISO/IEC 42001
      +-- NIST AI RMF
      +-- NIST SSDF
      +-- OWASP GenAI
      +-- MITRE ATLAS
      +-- EU AI Act when relevant
```

Un même contrôle AIGMS peut contribuer à plusieurs exigences.

Cela évite la duplication des contrôles et constitue une proposition de
valeur majeure.

------------------------------------------------------------------------

# 17. DoA / Applicability

Réutiliser la Declaration of Applicability existante.

Pour chaque contrôle :

``` text
Applicable
Not Applicable
Pending Assessment
```

Si `Not Applicable`, justification obligatoire pour les contrôles
proposés automatiquement sur un cas Level 2 ou Level 3.

Exemple :

``` text
SEC-AI-14 Agent Memory Security

Status:
NOT APPLICABLE

Reason:
The agent has no persistent memory.
```

Cette décision devient une preuve de gouvernance.

------------------------------------------------------------------------

# 18. Architecture fonctionnelle cible

``` text
DISCOVER
   |
   v
AI USE CASE
   |
   v
PROFILE
   |
   +---- Simple ----------> Existing AIGMS flow
   |
   +---- Connected
   |
   +---- Agentic / Critical
             |
             v
      TECHNICAL PROFILE
             |
             v
     TECHNICAL COMPONENTS
             |
             v
      ATTACK SURFACE
             |
             v
          RISKS
             |
             v
    CONTROL APPLICABILITY
             |
             v
         CONTROLS
             |
             v
      IMPLEMENTATIONS
             |
             v
         EVIDENCE
             |
             v
         DECISION
             |
             v
          MONITOR
```

------------------------------------------------------------------------

# 19. Priorités d'implémentation

## Phase 1 --- Foundation

Implémenter :

-   Technical Profile minimal ;
-   Security Assurance Level ;
-   famille SEC-AI ;
-   règles d'applicabilité ;
-   intégration avec Risk / Control / Evidence existants.

Aucune intégration externe obligatoire.

## Phase 2 --- Technical Components

Ajouter :

-   Assets / Technical Components ;
-   relations UseCase ↔ Component ↔ Risk ↔ Control ;
-   vue Attack Surface.

## Phase 3 --- AI Assistant

Ajouter :

-   analyse contextuelle ;
-   recommandation de contrôles ;
-   explication ;
-   proposition de preuves ;
-   validation humaine.

## Phase 4 --- Evidence Automation

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

Ne pas rendre ces intégrations nécessaires à la V1.

------------------------------------------------------------------------

# 20. Critères d'acceptation

### AC-01

Un cas d'usage simple existant peut être créé/modifié sans remplir le
profil Security Assurance.

### AC-02

Les anciens cas d'usage restent valides après migration.

### AC-03

Aucun contrôle SEC-AI n'est automatiquement déclaré « conforme ».

### AC-04

Le moteur propose uniquement des contrôles contextualisés.

### AC-05

L'utilisateur peut accepter, modifier ou déclarer N/A un contrôle
proposé.

### AC-06

Toute décision N/A importante possède une justification.

### AC-07

Un contrôle peut être lié à plusieurs risques.

### AC-08

Un risque peut être lié à plusieurs composants.

### AC-09

Une preuve peut être reliée à un contrôle et, lorsque pertinent, à un
Asset/Technical Component.

### AC-10

La vue Attack Surface n'est pas imposée aux cas simples.

### AC-11

L'assistant IA formule des recommandations mais ne décide jamais
automatiquement de la conformité.

### AC-12

Les contrôles existants sont réutilisés lorsqu'ils couvrent déjà le
besoin.

------------------------------------------------------------------------

# 21. Anti-patterns à éviter

Ne pas :

-   refaire le formulaire Use Case ;
-   créer un second Risk Register ;
-   créer un second moteur de contrôles ;
-   créer un second Evidence Repository ;
-   dupliquer les contrôles ISO/NIST/OWASP ;
-   appliquer 15 contrôles à chaque cas ;
-   demander une architecture technique à un utilisateur métier pour un
    cas trivial ;
-   considérer automatiquement une recommandation Claude comme une
    décision ;
-   analyser directement tout le code source dans AIGMS ;
-   transformer AIGMS en SAST/SCA ;
-   introduire des champs obligatoires sans nécessité fonctionnelle.

------------------------------------------------------------------------

# 22. Directive d'implémentation pour Claude Code

Avant de coder :

1.  analyser le repository AIGMS ;
2.  identifier les entités existantes concernées ;
3.  identifier les services et composants UI réutilisables ;
4.  identifier les migrations réellement nécessaires ;
5.  produire un impact analysis ;
6.  proposer le design minimal compatible avec l'existant ;
7.  seulement ensuite implémenter.

Pour chaque nouvelle entité ou table proposée, répondre d'abord à :

> « Pourquoi l'existant ne permet-il pas de représenter cette
> information ? »

Si l'existant peut être étendu proprement, préférer l'extension.

------------------------------------------------------------------------

# 23. Résultat produit attendu

La fonctionnalité ne doit pas être perçue comme :

> « AIGMS possède 15 nouveaux contrôles de cybersécurité. »

Elle doit être perçue comme :

> **« AIGMS comprend la nature technique du cas d'usage et adapte
> automatiquement le niveau de gouvernance, les risques, les contrôles
> et les preuves attendues. »**

La chaîne de valeur cible devient :

``` text
USE CASE
   ↓
UNDERSTAND
   ↓
PROFILE
   ↓
IDENTIFY EXPOSURE
   ↓
SELECT CONTROLS
   ↓
IMPLEMENT
   ↓
COLLECT EVIDENCE
   ↓
DECIDE
   ↓
MONITOR
```

------------------------------------------------------------------------

# 24. Proposition de valeur

**AIGMS AI Security Assurance**

> Transformer la surface d'attaque réelle d'un système IA en risques,
> contrôles, responsabilités, décisions et preuves pilotables.

Trois capacités structurantes :

``` text
ATTACK SURFACE DISCOVERY
          ↓
CONTROL APPLICABILITY
          ↓
EVIDENCE ASSURANCE
```

L'objectif n'est pas d'augmenter la complexité d'AIGMS.

L'objectif est exactement inverse :

> **appliquer le bon niveau de gouvernance au bon cas d'usage.**
