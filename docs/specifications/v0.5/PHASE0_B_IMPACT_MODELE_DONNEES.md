# v0.5 — Phase 0, document B
## Impact sur le modèle de données

*3 octobre 2026. Phase 0 : aucun code. Document à relire avant la Phase 1.*

---

## 1. Le constat, d'abord

**L'essentiel de ce que la v0.5 demande existe déjà.** Relevé en base, pas
supposé :

| Ce que la v0.5 demande | État | Où |
|---|---|---|
| Questions d'évaluation par contrôle | ✅ existe | `catalog_control.assessment_questions` *(jsonb)* |
| Preuves attendues par contrôle | ✅ existe | `catalog_control.expected_evidence` *(jsonb)* |
| Applicabilité par défaut du contrôle | ✅ existe | `catalog_control.applicability` *(jsonb)* |
| **Moteur d'applicabilité conditionnelle** | ✅ **existe** | `app.suggest_controls()` + `public.catalog_applicability_rule` |
| **Conditions déclaratives, avec motif** | ✅ **existe** | 21 valeurs de `app.suggestion_condition`, chacune avec son `reason` |
| Versionnement immuable du référentiel | ✅ existe | `catalog_version` — 0.2 et 0.3 *superseded*, 0.4 *published* |
| Portée et nature du contrôle | ✅ existe | `catalog_control.scope`, `measure_kind`, `phase` |
| **Profil technique du cas d'usage** | ❌ **manque** | — |
| **Niveau d'assurance dérivé** | ❌ **manque** | — |

**Deux manques sur neuf.** Le reste est en place et sert déjà en production de
recette.

> **Ce que cela change pour le plan.** La Phase 2 — *conditions du moteur* — ne
> construit rien : elle **ajoute des valeurs** à une énumération et des lignes à
> une table. La Phase 1 est la seule qui crée une structure.

---

## 2. Ce qui existe, en détail

### 2.1 Le moteur d'applicabilité

```
public.catalog_applicability_rule
  framework_code · control_code · condition · reason
  unique (framework_code, control_code, condition)
```

`app.suggest_controls(use_case_id)` lit les **faits** du cas d'usage, les
traduit en conditions, et rend les contrôles dont au moins une règle est
satisfaite — **avec le motif écrit**, qui s'affiche à l'écran.

Les 21 conditions actuelles :

```
personal_data · vulnerable_persons · autonomy_gte_l3 · criticality_high
external_vendor · model_provider · high_risk_potential · privacy_impact
security_impact · gpai_dependency · transparency_obligations
role_host · role_developer · role_integrator · role_business_user
asset_agent · asset_own_model · asset_dataset
in_service · external_persons · sensitive_data
```

> **C'est la pièce maîtresse, et elle est déjà là.** La v0.5 ajoute des
> conditions à cette liste ; elle ne réinvente pas le mécanisme. Le motif
> rédigé — *« des données personnelles sont mobilisées »* — est déjà ce que
> l'utilisateur lit dans la fenêtre des propositions.

### 2.2 Le contrôle-type

`catalog_control` porte déjà onze colonnes `jsonb` : `applicability`, `risks`,
`requirements`, `assessment_questions`, `expected_evidence`, `tests`,
`maturity_model`, `framework_mappings`, `remediation_guidance`, `external_refs`.

**Les questions et preuves conditionnelles ne demandent aucune colonne neuve** :
elles s'écrivent dans la structure existante, en ajoutant une clé de condition à
chaque entrée. C'est la raison pour laquelle la **Phase 3 ne porte aucune
migration** — c'est du JSON.

---

## 3. Ce qu'il faut créer

### 3.1 Le profil technique — **une table 1-1**

```sql
create table public.use_case_technical_profile (
  use_case_id uuid primary key references public.ai_use_case (id) on delete cascade,
  tenant_id   uuid not null references public.tenant (id) on delete cascade,
  -- Composition
  uses_llm                boolean,
  uses_rag                boolean,
  uses_agents             boolean,
  uses_multi_agent        boolean,
  uses_tools              boolean,
  uses_mcp                boolean,
  uses_persistent_memory  boolean,
  -- Origine et données
  uses_external_model     boolean,
  uses_open_source_model  boolean,
  uses_fine_tuning        boolean,
  uses_custom_code        boolean,
  -- Capacités d'action
  can_execute_actions        boolean,
  can_modify_data            boolean,
  can_send_external_messages boolean,
  can_trigger_transactions   boolean,
  can_change_permissions     boolean,
  -- Exposition
  internet_access         boolean,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.user_profile (id)
);
```

**Pourquoi une table et non des colonnes sur `ai_use_case`** — la décision est
prise par l'ADR-0033, et elle tient :

1. **Ces attributs sont presque toujours nuls.** Dix-sept colonnes vides sur
   chaque ligne d'un registre qu'on lit en liste.
2. **Ils sont destinés à s'étoffer.** Un attribut neuf devient une colonne de
   plus sur la table la plus lue de l'application.
3. **La latence de la fiche vient d'être travaillée.** Une jointure facultative
   qu'on ne fait que lorsqu'on en a besoin coûte moins qu'un `select *` alourdi.
4. **L'absence de ligne a un sens** : le profil n'a pas été renseigné. Une
   colonne nulle ne distingue pas « non » de « pas renseigné ».

> **Trois attributs de la spécification ne sont pas repris**, parce qu'ils
> existent déjà sur `ai_use_case` : `uses_sensitive_data` et
> `uses_personal_data` *(→ `involves_personal_data`, et la grille de
> criticité)*, `critical_decision` *(→ `decision_impact` et `criticality`)*,
> `human_approval_required` *(→ le plan de supervision humaine)*. **Les
> redemander serait un questionnaire cyber**, ce que la spécification interdit
> explicitement.

### 3.2 Le niveau d'assurance — **dérivé, jamais saisi**

```sql
create function app.assurance_level(p_use_case_id uuid)
returns app.assurance_level   -- 'L0' | 'L1' | 'L2' | 'L3'
```

| Niveau | Il est atteint quand | Ce qu'il entraîne |
|---|---|---|
| **L0** — Simple | Aucun profil, ou LLM seul sans outil | Le parcours actuel, inchangé |
| **L1** — Connecté | RAG, ou modèle externe, ou accès internet | Branches RAG et fournisseur |
| **L2** — Intégré | Outils, MCP, ou capacité de modifier des données | Branches outils et moindre privilège |
| **L3** — Agentique | Agents, multi-agent, mémoire persistante, ou transaction / permissions | Toutes les branches, supervision humaine renforcée |

**Comme la criticité** : calculé, affiché avec ce qu'il entraîne écrit à côté,
et jamais saisissable. C'est la règle que le produit applique déjà au niveau de
risque — *« il se calcule, pour qu'il ne diverge pas de sa cotation »*.

> **Un profil absent vaut L0**, et le parcours actuel ne bouge pas. C'est ce qui
> rend la Phase 1 réversible et sans effet sur les dossiers existants.

---

## 4. Impact sur l'existant

| Objet | Impact | Détail |
|---|---|---|
| `ai_use_case` | **aucun** | Pas de colonne ajoutée |
| `catalog_control` | **aucun** | Les conditions s'écrivent dans le JSON existant |
| `catalog_applicability_rule` | **aucun sur la structure** | Des lignes s'ajoutent |
| `app.suggestion_condition` | **une migration** | `alter type … add value`, dans son propre fichier |
| `app.suggest_controls()` | **réécriture** | Lire le profil technique en plus des faits actuels |
| Fiche du cas d'usage | **un onglet ou un volet** | Le profil ne s'affiche pas tant qu'on ne le demande pas |
| Dossiers existants | **aucun** | Profil absent = L0 = comportement actuel |
| **RLS** | **une politique** | Sur `use_case_technical_profile`, calquée sur `ai_use_case` |

---

## 5. Les migrations attendues

| Phase | Migration | Nature | Réversible |
|---|---|---|---|
| 1 | `use_case_technical_profile` + RLS + `app.assurance_level` | création | ✅ `drop table` |
| 2 | `alter type app.suggestion_condition add value` ×N | **énumération — fichier dédié** | ❌ une valeur d'énumération ne se retire pas |
| 2 | Réécriture de `app.suggest_controls()` + lignes de règles | remplacement | ✅ `create or replace` |
| 3 | *aucune* | données JSON | ✅ |
| 4 | Chargement du référentiel v0.5 | données | ✅ la v0.4 reste `published` jusqu'au basculement |
| 5 | Typologie des actifs | énumération | ❌ |

> **Deux migrations d'énumération, donc deux fichiers dédiés.** C'est la règle
> du projet, tenue sur les douze précédentes : une valeur d'énumération ne
> s'ajoute pas dans une transaction qui fait autre chose.

---

## 6. Ce qu'il reste à trancher

| # | Question | Ma recommandation |
|---|---|---|
| 1 | **Table 1-1 ou colonnes** — l'arbitrage en suspens | **Table.** Quatre raisons au §3.1, dont la latence déjà travaillée |
| 2 | Le profil est-il saisi, ou dérivé des actifs rattachés ? | **Les deux** : dérivé quand c'est possible *(un actif de nature « agent » implique `uses_agents`)*, saisissable sinon. C'est ce que demande la spécification — *« dérivées des réponses existantes lorsque possible »* |
| 3 | Où s'affiche le profil ? | **Un volet replié de l'onglet Avancement**, pas un onglet de plus. Six onglets suffisent |
| 4 | Le niveau d'assurance modifie-t-il la criticité ? | **Non.** Deux axes distincts : la criticité dit l'effort de gouvernance, l'assurance dit la profondeur technique. Les confondre ferait d'un chatbot interne un cas critique |
