# AIGMS Control Framework v0.5 — plan d'implémentation

*Réponse à la spécification fonctionnelle V0.2. Écrit après audit de l'existant,
avant toute ligne de code.*

---

## 0. Ce que l'audit a trouvé

Trois constats commandent tout le plan. Ils sont vérifiés en base, pas supposés.

### Le moteur d'applicabilité existe déjà

`public.catalog_applicability_rule` — une ligne par (référentiel, code de
contrôle, **condition**, **motif rédigé**). Aujourd'hui : **83 règles couvrant
46 contrôles-types**, sur **19 conditions**.

```
personal_data · vulnerable_persons · sensitive_data · autonomy_gte_l3
criticality_high · external_vendor · model_provider · gpai_dependency
role_host · role_developer · high_risk_potential · privacy_impact
security_impact · transparency_obligations · asset_agent · asset_own_model
asset_dataset · in_service · external_persons
```

La spécification décrit ce moteur comme à construire (§12, §13). **Il est
construit.** Ce qui manque n'est pas le moteur : ce sont **les faits qu'il sait
lire**. Aucune condition ne décrit aujourd'hui le RAG, les outils d'agent, MCP,
la mémoire persistante, le code spécifique, ni la capacité d'agir.

Et l'explicabilité demandée au §14 existe : chaque règle porte son motif, que
l'écran affiche déjà à côté de la proposition.

### Le contrôle-type porte déjà les structures demandées

`public.catalog_control` :

```
control_code · control_version · title · status · control_type · objective
owner_role · review_frequency · phase · scope · measure_kind
applicability (jsonb) · risks (jsonb) · requirements (jsonb)
assessment_questions (jsonb) · expected_evidence (jsonb) · tests (jsonb)
maturity_model (jsonb) · framework_mappings (jsonb)
remediation_guidance (jsonb) · external_refs (jsonb)
```

`assessment_questions` et `expected_evidence` sont des **tableaux JSON**. Les
rendre conditionnels (§8, §9) ne demande **aucune migration de schéma** : il
suffit de passer d'un tableau de chaînes à un tableau d'objets portant
`{ text, condition, priority, reference }`, et de lire les deux formes.

`framework_mappings` porte déjà `{ framework, version, reference }` — ISO 42001,
ISO 27001, AI Act. Y ajouter NIST AI RMF, NIST SSDF, OWASP GenAI, MITRE ATLAS
(§25) est un enrichissement de données, pas de modèle.

### Le versionnement existe et est immuable

Import JSON/CSV, validation au dépôt, commit atomique, publication. Une version
publiée ne se corrige pas : on en dépose une nouvelle, et les contrôles déjà
instanciés gardent leur version d'origine. **La v0.5 se publie comme la v0.4
l'a été** — c'est exactement ce qu'exige le §27, et rien n'est à construire.

### Ce qui manque vraiment

1. **Les faits techniques du cas d'usage** (§10). `ai_use_case` porte
   `involves_personal_data`, `involves_sensitive_data`,
   `involves_vulnerable_persons`, `autonomy_level`, `decision_impact`,
   `criticality`. Rien sur RAG, agents, outils, MCP, mémoire, code spécifique,
   capacité d'agir.
2. **Les conditions correspondantes** dans le moteur.
3. **Les questions et preuves conditionnelles** dans les contrôles-types.
4. **Les contrôles absents**, à déterminer par Gap Analysis.
5. **La vue Attack Surface** (§23) — dérivée, pas un registre.

---

## 1. Gap Analysis préliminaire

Inventaire réel des domaines : **CMP, DAT, GOV, HUM, INC, INV, MON, OPS, RSK,
SEC, SUP, USE** — 120 contrôles-types par version.

Les quinze thèmes de la checklist (§6), confrontés aux contrôles réels :

| Thème | Contrôle v0.4 | Verdict |
|---|---|---|
| Secure AI Development Lifecycle | `SEC-001` Sécurité dès la conception | **Enrichir** |
| AI Code Security Review | *aucun* | **Gap probable** |
| AI Supply Chain Security | `OPS-008` Dépendances · `SUP-*` | **Enrichir** — SBOM/AIBOM à vérifier |
| Prompt Injection Protection | `SEC-007` | **Enrichir** — indirecte, RAG, agent |
| Input / Output Validation | `SEC-010` · `SEC-011` | **Enrichir** |
| Secrets & Credential Protection | `SEC-004` | **Enrichir** — clés LLM, tokens MCP |
| AI Data & Model Integrity | `DAT-*` · `OPS-003` | **À instruire** |
| Agent Tool Authorization | `SEC-003` Moindre privilège | **Enrichir** |
| Human Approval for Critical Actions | `HUM-002` Validation humaine | **Enrichir** |
| RAG & Vector Security | *à instruire dans DAT* | **Gap probable** |
| AI Security Testing | `SEC-012` | **Enrichir** |
| AI Runtime Monitoring | `MON-*` · `SEC-006` | **Couvert** |
| Model / Prompt Change Control | `OPS-003` · `OPS-004` | **Couvert** |
| Agent Memory Security | *aucun* | **Gap probable** |
| AI Incident Response | `INC-*` | **Couvert** |

**Trois gaps probables, pas quinze.** Le reste s'enrichit. C'est précisément ce
que le §30 et le §36 exigent.

> Ce tableau est une **hypothèse de travail**. La Phase 0 le confirme contrôle
> par contrôle, en lisant l'objectif, les questions et les preuves de chacun —
> et non son seul intitulé.

---

## 2. Les phases

Chaque phase est **livrable seule**, **testée**, et **réversible**. Aucune ne
casse un cas d'usage existant.

### Phase 0 — Audit et Gap Analysis · *sans code*

Lire les 120 contrôles-types un par un sur les quinze thèmes. Trancher
enrichir / créer, contrôle par contrôle, avec la justification exigée par
l'AC-03 et l'AC-04.

**Livrables :** `AIGMS_Control_Framework_v0.5_Gap_Analysis.md`,
`AIGMS_v0.5_Data_Model_Impact.md`, `AIGMS_v0.5_Applicability_Rules.md`.

**Validation attendue avant la suite.**

### Phase 1 — Le profil technique du cas d'usage

Les faits que le moteur ne sait pas encore lire.

**Modèle.** Une migration, une table `use_case_technical_profile` en relation
1-1 — et non vingt colonnes sur `ai_use_case`. Raison : ces attributs sont
**optionnels**, souvent tous nuls, et destinés à s'étoffer. Les poser sur la
fiche du cas d'usage la chargerait d'un tiers de colonnes vides et
compliquerait chaque lecture.

**Écran.** Une carte « Profil technique » sur l'onglet *Avancement*, **repliée
par défaut**, qui ne s'ouvre que si l'on y touche. Un cas simple ne la voit
jamais. Les faits déjà connus — données personnelles, autonomie, actifs
rattachés — sont **pré-remplis et non redemandés** (§10).

**Niveau d'assurance.** Dérivé, jamais saisi : L0 simple, L1 connecté, L2
intégré, L3 agentique (§11). Affiché comme la criticité l'est déjà, avec ce
qu'il entraîne.

**Compatibilité.** Aucun cas existant n'est invalidé : profil absent = L0, et
le parcours actuel ne bouge pas (AC-05, AC-06).

### Phase 2 — Les conditions du moteur

Ajouter au vocabulaire de `catalog_applicability_rule` les conditions issues du
profil : `uses_rag`, `uses_agent_tools`, `uses_mcp`, `persistent_memory`,
`custom_code`, `can_execute_actions`, `can_modify_data`, `can_trigger_transactions`,
`external_model`, `fine_tuning`, `internet_access`.

Puis écrire les règles correspondantes, **chacune avec son motif rédigé** — la
règle sans motif n'existe pas dans ce modèle, et c'est ce qui rend
l'explicabilité automatique.

**Rien de nouveau côté écran** : la fenêtre des propositions affiche déjà
motif, groupe et marque. Un contrôle proposé parce que « le cas d'usage utilise
un RAG » se lira comme les autres.

### Phase 3 — Questions et preuves conditionnelles

Passer `assessment_questions` et `expected_evidence` d'un tableau de chaînes à
un tableau d'objets `{ text, condition, priority, reference }`, **en lisant les
deux formes**. Aucune migration : c'est du JSON.

L'écran filtre sur le profil. Un contrôle affiche ses questions communes, plus
celles que le contexte active — et rien d'autre (AC-07, AC-08).

### Phase 4 — Le référentiel v0.5

Enrichir les contrôles identifiés, créer les rares manquants, compléter les
mappings externes. **Publier comme version 0.5** par le mécanisme d'import
existant, la v0.4 restant lisible et les contrôles instanciés intacts (AC-02,
AC-15).

C'est la phase la plus longue en rédaction, la plus courte en code.

### Phase 5 — Typologie des actifs

Étendre `ai_asset.kind` — aujourd'hui quatre natures — vers celles qu'un
système agentique demande : serveur MCP, outil, base vectorielle, dépôt de
code, pipeline, registre de modèles… **Extension d'une énumération**, pas une
table `TechnicalComponent` (§20).

### Phase 6 — La vue Attack Surface

Une **vue dérivée**, lue depuis les objets existants — risques, contrôles,
preuves, décisions — et affichée seulement au-delà de L1. Vert couvert, ambre
partiel, rouge non maîtrisé, gris non applicable (§23).

Techniquement, c'est la vue *Graphe* et la vue *Couverture* réorganisées autour
des surfaces d'attaque. **Aucun nouveau registre.**

### Phase 7 — Automatisation des preuves · *hors périmètre immédiat*

Connecteurs GitHub, SonarQube, Snyk. Le socle `governance_connector` existe.
À planifier séparément : ce n'est pas une évolution du référentiel.

---

## 3. Ce que je ne ferai pas

- Aucun second référentiel, registre de risques, registre de preuves ou DdA.
- Aucune famille de quinze contrôles créée d'office.
- Aucune analyse de code dans AIGMS : les rapports des scanners deviennent des
  **preuves**, rien de plus (AC-16, AC-17).
- Aucune question technique imposée à un utilisateur métier sur un cas simple.
- Aucune modification silencieuse d'un contrôle publié.

---

## 4. Ce que je demande avant de commencer

**Une confirmation sur le découpage**, et un arbitrage sur deux points :

1. **Le profil technique : table séparée ou colonnes ?** Je propose une table
   1-1. Une vingtaine de colonnes optionnelles sur `ai_use_case` serait plus
   simple à écrire et plus lourde à vivre.
2. **La Phase 0 produit trois documents avant tout code.** C'est ce qu'exige la
   spécification. Confirmez que vous voulez les relire avant la Phase 1, ou
   dites-moi d'enchaîner.

---

## 5. Le cas de recette : UC-02 ScootAssist

Assistant conversationnel d'aide client, préparant des remboursements. Profil
attendu :

```
UsesLLM              true      UsesRAG             true
UsesAgents           true      UsesTools           true
UsesPersonalData     true      CanTriggerTransactions  true
UsesCustomCode       à confirmer
```

Niveau d'assurance attendu : **L3 — agentique**.

C'est le cas qui éprouve la chaîne entière : profil → conditions → contrôles
recommandés avec motif → questions contextuelles → preuves contextuelles →
décision humaine. Il se déroulera après la Phase 4, et servira de recette.

Le cas du développeur en sandbox — IDE, plugins, dépôts Git, paquets ouverts,
API de modèles — éprouve la branche `custom_code` et les contrôles de revue de
code : il est le second jeu de recette, et celui qui dira si le gap « AI Code
Security Review » était réel.
