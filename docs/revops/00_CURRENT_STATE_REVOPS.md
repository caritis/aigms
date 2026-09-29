# 00 — État actuel RevOps (PASS 1 — DISCOVER)

> Blueprint RevOps Caritis V1 — passe 1 sur 4. Inventaire de l'existant AIGMS utile
> au RevOps. **Aucun code, aucune migration.** Rédigé le 2026-09-29 à partir du
> dépôt `caritis/aigms`, branche `dev` (commit `f194c2b`), des 111 migrations
> `supabase/migrations/`, du code `src/` et de la documentation du dépôt.
> Source de la mission : `CARITIS/specifications/Prompt Claude — Blueprint RevOps Caritis V1.md`.
>
> Aucune base n'a été interrogée : l'état décrit est celui du **dépôt**, pas celui
> de la production (voir R6).

---

## 0. Synthèse

AIGMS est un **système de gouvernance mûr et un système commercial vide**.

- Côté gouvernance : modèle multi-tenant complet, 30+ tables métier, gates en SQL,
  journal d'audit inaltérable sur toutes les tables, notifications et courriels,
  tableaux de pilotage portefeuille, 58 fichiers de tests RLS.
- Côté revenu : **rien**, hormis `organization.status` (`prospect | pilot | active | archived`,
  jamais lu par aucune logique) et une table `contact_request` archivée.
- Côté télémétrie : pas d'outil d'analytics, mais `audit_log` enregistre déjà **chaque
  écriture** avec acteur, date, organisation et cas d'usage. C'est une source de
  télémétrie produit latente — à projeter, pas à réinventer.
- Côté intégration : un **registre** de connecteurs (contrat, santé, journal de
  synchronisation) mais aucun connecteur réel, aucun webhook, aucune file, aucun
  OAuth. Un seul job planifié : le cron Vercel quotidien des alertes.

Conséquence : la phase « RevOps Core interne » (spec §11, phase 1) peut s'appuyer
très largement sur l'existant. Le travail neuf porte sur le **cycle de vie
commercial**, la **projection télémétrie**, le **score d'adoption** et son
**historique**.

La spécification suppose une stack « React / Supabase ». Le code réel est
**Next.js 16 App Router + React 19 + Supabase** (PostgREST, Auth, Storage),
déployé sur Vercel (`dub1`), avec une alternative VPS documentée pour Izarhost.

---

## 1. Ce qui existe

### 1.1 Tenancy — le modèle partenaire existe déjà

| Niveau | Table | Rôle | Réf. |
|---|---|---|---|
| Tenant | `tenant` | cabinet, MSP, DSI externalisée — « pilote un portefeuille de clients » | `0002:5-8, 35-46` |
| Organisation | `organization` | client du tenant ; `status` prospect/pilot/active/archived ; identité légale et contact | `0002:123-163`, `0035:25-39` |
| Business unit | `business_unit` | arbre interne à une organisation | `0002:168-177` |
| Appartenance | `membership` (tenant) + `role_assignment` (par organisation) | un consultant peut être officer chez un client, auditeur chez un autre | `0002:98-208` |

- **Tenant = partenaire, organisation = son client.** ADR-0002 l'assume ; ADR-0016
  ajoute la marque blanche par tenant (« c'est le cabinet qui revend »).
- Vues portefeuille : `managed_organizations`, `attention_by_organization`,
  `organizations_readiness`, `/admin/pilotage?organisation=toutes`.
- **Caritis (l'éditeur) n'est pas modélisé comme tenant.** Sa visibilité transverse
  repose uniquement sur `user_profile.is_platform_admin`.

### 1.2 Sécurité

- RLS forcée sur toutes les tables ; lecture `app.has_tenant_access(tenant_id)`,
  écriture `app.has_tenant_role(tenant_id, <ensemble de rôles>)` (`0005`, `0014`).
- `anon` n'a aucun droit (`0005:35-40`, `0030`).
- 8 rôles (`platform_admin`, `governance_officer`, `client_admin`, `system_owner`,
  `risk_owner`, `reviewer`, `auditor`, `executive_viewer`) ; matrice de capacités
  calculée en base (`0039`) ; RACI imposé en base (`0055`).
- Clé `service_role` confinée (règle ESLint) à la création de comptes et au cron.
- Secrets de connecteurs jamais stockés : seul le **nom** de la variable
  d'environnement l'est, un trigger refuse les valeurs ressemblant à un secret
  (ADR-0009, `0019:135-156`).

### 1.3 Journal et événements

| Source | Contenu | Utilité RevOps |
|---|---|---|
| `audit_log` (`0004`, `0033`, `0077`) | Toute création / modification / suppression sur ~40 tables, via triggers. Acteur, rôle, date, `organization_id`, `use_case_id`, état avant/après complet. Append-only. `audit_coverage_gaps()` doit rester vide. | **Source primaire de télémétrie** : utilisateurs actifs, usage par fonctionnalité, jalons d'activation, transitions de statut. |
| `governance_event` (`0004:129-199`) | Table d'événements métier typés (16 types), émis par `app.emit_event()`. | Base d'un futur *outbox*. Aujourd'hui : 7 types émis sur 16, **pas d'`organization_id`**, lue par personne. |
| `notification` (`0053`, `0086`) | Notifications nominatives, `due_at` futur pour les rappels, `read_at`, `emailed_at`. | Canal d'alerte interne tout prêt (CSM, partenaire). |

Actions d'audit définies mais **jamais écrites** : `login`, `read_sensitive`,
`archive`, `decision_approved`, `decision_rejected`, `risk_accepted`, `gate_evaluated`.

### 1.4 Indicateurs déjà calculés (SQL)

| Fonction | Mesure | Nature |
|---|---|---|
| `organization_readiness` / `organizations_readiness` | les 6 rôles de gouvernance sont-ils tenus ? (sinon écritures bloquées) | jalon binaire d'onboarding |
| `governance_health` (`0025`) | 100 − pénalités (risques hauts ouverts, preuves périmées, actions en retard…) ; bandes sound / attention / action_required | **hygiène** de la gouvernance — explicitement « pas un taux de conformité » |
| `attention_by_organization` (`0031`) | compteurs d'éléments à traiter par organisation | charge / retard |
| `control_coverage`, `risk_heatmap`, `soa_readiness`, `typology_coverage`, `evidence_matrix_gaps` | couverture des contrôles, preuves, SoA | profondeur de déploiement |
| `review_cadence` + `governance_review` (`0067`) | cadence de revue attendue vs revues tenues | rythme de gouvernance |

### 1.5 Entités de gouvernance comptables

Toutes portent `tenant_id`, `organization_id` (sauf mention), `created_at`, un
`business_ref`, et la plupart un propriétaire.

| Entité | Table | Statuts utiles |
|---|---|---|
| Fournisseur | `vendor` | `review_status` |
| Actif IA | `ai_asset` | `kind` (système, modèle, agent, dataset) ; `owner_user_id` |
| Cas d'usage | `ai_use_case` | DRAFT → TRIAGE → … → PILOT → PRODUCTION → MONITORING ; `status_changed_at` |
| Classification | `regulatory_classification` | `is_current` |
| Risque | `risk` | identified → … → mitigated / accepted / closed |
| Contrôle | `control` | proposed / implemented / **operating** / ineffective / retired |
| Applicabilité | `control_applicability`, `soa_decision` | applicable / not_applicable / to_determine |
| Preuve | `evidence` | pending / **validated** / rejected ; `evidence_type = 'connector_pull'` ; fraîcheur calculée |
| Décision | `governance_decision` | 8 types dont `pilot_approval`, `go_production` |
| Gate | *(pas de table)* | `evaluate_gate`, trace dans `audit_log` (`gate_blocked`, `status_transition`) |
| Action | `action` | open / in_progress / blocked / done / overdue ; `is_blocking` |
| Incident / CAPA | `incident`, `capa` | cycle OPEN → CLOSED |
| Revue | `governance_review` | planned / held / cancelled |

**N'existent pas :** entité *Shadow AI* (aucune table, colonne ni drapeau), drapeau
« collecte automatisée » sur la preuve (seulement `connector_pull` et un champ
texte `source`).

### 1.6 Commercial

| Élément | État |
|---|---|
| `organization.status` | enum prospect/pilot/active/archived, défaut `prospect`. **Lu par aucune fonction, aucune policy, aucun gate.** Pas d'historique, pas de dates. |
| `contact_request` (`0016`) | nom, email, organisation, téléphone, profil (dont `conseil_msp_integrateur`), statut new/contacted/qualified/archived/spam. **Écriture publique fermée** depuis `0030` ; archive lisible par platform_admin (`/admin/contacts`). Aucun lien vers tenant ou organisation. |
| Formulaire caritis.fr `/contact` | « Demander à être rappelé » → **courriel uniquement** (Resend), aucune persistance, aucun CRM. |
| Abonnement, plan, prix, ARR/MRR, opportunité, CRM | **absents** (grep : 0 occurrence métier). |
| Portail partenaire | absent ; seule la vue portefeuille interne au tenant existe. |

### 1.7 Intégration et automatisation

| Élément | État |
|---|---|
| `governance_connector` + `connector_sync_run` (`0019`) | registre : type (13 dont `generic_webhook`), capacités, scopes, source de vérité, fréquence, santé, dernière erreur. Lecture seule par défaut. **Au niveau tenant, pas organisation.** |
| Connecteur réel | aucun. `testConnector` vérifie la variable d'env et fait un `HEAD` sur `base_url`. |
| OAuth, Graph, Gmail, Calendar | absents. Seul OIDC Azure pour la connexion (`email openid profile`). |
| Webhook entrant / sortant, file, outbox, pg_cron, pg_net, Edge Functions | **absents.** |
| Job planifié | un seul : cron Vercel `0 7 * * *` → `/api/alertes/envoi` (Bearer `CRON_SECRET`, client service_role). |
| Courriel | `sendSystemEmail` (Resend, texte brut) : ouverture de compte, alerte immédiate, digest. |
| n8n | documenté (`docs/automatisation/GUIDE_N8N_V1.md`, 5 scénarios, polling PostgREST sous compte d'automatisation), non déployé. Webhook sortant chiffré à 1–2 j, non décidé. |
| Analytics produit | aucun (ni PostHog, ni Vercel Analytics, ni Sentry). |

### 1.8 Documentation commerciale existante

- **Discovery Workshop** — trois définitions divergentes : 45–90 min (`OFFRE_AI_GOVERNANCE_OFFICE_V5` §3),
  2–3 h en 7 blocs avec 5 livrables (`AIGMS_Plan_Service_Discovery_Workshop…` §6-7),
  45 min « atelier de qualification » (site caritis.fr). Aucun prix.
- **Pilote** — plusieurs définitions : Sprint 5 j + J0-J30/60/90 ; POC 30 j avec gates
  **J5 / J10 / J20 / J25 / J30** et sortie GO / EXTEND / STOP
  (`docs/specifications/AIGMS_Dashboard_PME_Claude_Spec.md`) ; aucune ne correspond au
  J0/J7/J15/J21/J30 de la mission. Aucun prix.
- **Offre** — service managé ESSENTIEL / PILOTAGE / CRITIQUE (4 / 8 / 16 jours-consultant/an),
  funnel cible 80–100 comptes → 7 signés (`Plan de service` §4, §14).
- **Partenaire Izarralde / Izarhost** — rôles définis (relation, intégration,
  remédiation, hébergement) ; hébergement VPS et identité mutualisée documentés
  (`HEBERGEMENT_VPS_V1.md`, `IDENTITE_V1.md`, option A recommandée).
- **Spécification la plus proche du RevOps** : `AIGMS_Dashboard_PME_Claude_Spec.md`
  (POC 30 j, ROV, ARR, `CommercialOpportunity`, `RevenueAttribution`, `KpiSnapshot`,
  cloisonnement client / partenaire). **Non implémentée.**
- **Indicateurs déjà nommés** : `governance_health` (implémenté) et
  « AI Governance Index » M15 (8 piliers, maturité, non implémenté).

---

## 2. Ce qui peut être réutilisé

| Besoin RevOps | Existant réutilisable | Écart à combler |
|---|---|---|
| Compte / organisation | `organization` + identité + contact | cycle de vie commercial, historique, dates |
| Portefeuille partenaire | `tenant` = partenaire ; vues portefeuille ; marque blanche | typage direct / partenaire ; niveau éditeur |
| Lead | `contact_request` (profil, statut) | réouverture contrôlée depuis caritis.fr, lien vers organisation |
| Télémétrie produit | `audit_log` (toutes écritures, `organization_id`) | projection sans PII, catalogue d'événements, connexions |
| Événements de domaine | `governance_event` + `app.emit_event()` | `organization_id`, types manquants, consommateur |
| Adoption Score | comptages sur les entités §1.5 ; readiness ; coverage ; review cadence | formule, snapshots, tendance |
| Customer Health | `governance_health`, `attention_by_organization` | combinaison avec adoption et activité |
| Alertes internes (adoption risk, jalons pilote) | `notification` + `due_at` futur + digest courriel | nouveaux `notification_kind` |
| Tâches planifiées | cron Vercel + `CRON_SECRET` | nouveaux points d'entrée (snapshot quotidien, dispatch) |
| Rapports (Discovery, Pilot, Business Review) | vues d'impression `/impression/*`, export DOCX (`docx`) | gabarits RevOps |
| Couche d'intégration | `governance_connector`, `connector_sync_run`, contrat d'intégration (matrice V2 l.70) | outbox, livraison, idempotence, secrets OAuth |
| Tests | 58 fichiers RLS (`tests/rls`), helpers d'impersonation | tests des nouvelles tables |

---

## 3. Gaps

**Commercial**
- G1. Aucun cycle de vie Lead → Qualified → Discovery → Pilot → Decision → Customer → Expansion.
  `organization.status` ne couvre que 4 états, sans historique ni dates.
- G2. Aucune entité Pilot (dates, jalons, critères de succès, issue).
- G3. Aucune entité commerciale (abonnement, plan, ARR/MRR, opportunité, identifiant CRM).
- G4. Le lead n'est persisté nulle part : le formulaire caritis.fr n'envoie qu'un courriel,
  et la production n'a d'ailleurs pas encore la clé Resend.

**Produit / télémétrie**
- G5. Pas de catalogue d'événements produit ; `audit_log` contient des données
  personnelles et métier en clair (états avant/après), à projeter avant tout usage.
- G6. Pas d'événement de connexion ni de lecture : l'« utilisateur actif » ne peut
  aujourd'hui se mesurer que par l'**écriture**.
- G7. `governance_event` incomplet (7/16 types, pas d'`organization_id`,
  `IncidentOpened` jamais émis à la création).
- G8. Pas de Shadow AI ni de drapeau de collecte automatisée : deux signaux demandés
  par la mission n'ont pas de donnée source.

**Scores**
- G9. Pas d'Adoption Score, pas d'historique (aucune table de snapshots).
- G10. Risque de confusion de noms : `governance_health` (hygiène), AI Governance Index
  (maturité, spec M15), Adoption Score (usage). Trois indicateurs, trois noms à tenir distincts.

**Intégration**
- G11. Ni outbox, ni webhook entrant ou sortant, ni file, ni idempotence, ni clé API.
- G12. Connecteurs rattachés au tenant, pas à l'organisation cliente.
- G13. Aucun connecteur messagerie / agenda / CRM ; aucune conception de scopes OAuth.

---

## 4. Risques relevés

| # | Risque | Gravité | Détail |
|---|---|---|---|
| R1 | **Isolation par tenant, pas par organisation** | **Haute** | Toutes les policies lisent `has_tenant_access(tenant_id)`. Un membre d'un tenant partenaire lit **toutes** les organisations clientes de ce tenant ; le filtrage par organisation n'existe que dans l'UI. Acceptable si seuls les consultants du partenaire sont membres ; **bloquant** si des utilisateurs du client final (`client_admin`, `executive_viewer`…) ont un compte dans un tenant partenaire, et bloquant pour tout portail client ou vue partenaire exposée. |
| R2 | Lectures transverses du platform_admin non journalisées | Moyenne | Les commentaires (`0003:48`, `0017:15`) affirment le contraire ; `read_sensitive` n'est jamais écrit. Une console RevOps éditeur hériterait du trou. |
| R3 | PII dans `audit_log` | Moyenne | États complets avant/après. Toute exportation vers un outil tiers doit passer par une projection minimale. |
| R4 | Pas de niveau « éditeur » | Moyenne | Le pipeline commercial de Caritis (prospects directs, partenaires) n'a pas de place naturelle : Caritis n'est pas un tenant. |
| R5 | Définitions commerciales divergentes | Moyenne | Discovery (45 min / 90 min / 2-3 h), pilote (J5…J30 vs J0…J30) : le funnel ne sera mesurable qu'une fois ces jalons figés. |
| R6 | Écart dépôt / production | À vérifier | La documentation d'audit signale une production bloquée à la migration 0016 alors que le dépôt en compte 111. Tout le RevOps suppose un schéma à jour en production. |
| R7 | Documentation périmée | Faible | ADR-0007 non marqué remplacé par ADR-0013 ; ADR-0019 dit « aucun courriel envoyé » ; `AIGMS_TARGET_ARCHITECTURE.md` et `IMPLEMENTATION_STATUS.md` obsolètes ; dates d'octobre 2026 postérieures à aujourd'hui dans plusieurs fichiers et noms de migrations (0107–0111). |

---

## 5. Décisions architecturales à prendre (avant PASS 2)

| # | Décision | Options | Recommandation provisoire |
|---|---|---|---|
| D1 | **Où vit la donnée Revenue en V1 ?** | a) dans AIGMS (schéma `revops` distinct) ; b) CRM externe dès maintenant ; c) tableur | **a)** un noyau minimal dans un schéma dédié, sans montant ni contrat au-delà d'ARR/MRR déclaratifs. Le CRM (phase 5) reprendra la main sur la relation commerciale ; AIGMS gardera stade, pilote et adoption. |
| D2 | **Qu'est-ce qu'un « compte » ?** | a) `organization` = compte (clé `OrganizationId ↔ CRMAccountId`) ; b) entité `account` séparée | **a)** l'organisation est le compte. Un lead non converti reste hors du modèle de gouvernance (table de leads distincte). |
| D3 | **Niveau éditeur Caritis** | a) Caritis devient un tenant « direct » + fonctions éditeur ; b) schéma `revops` hors tenancy, lisible par platform_admin seulement | **b)** pour la donnée commerciale éditeur ; les clients directs restent des organisations d'un tenant Caritis. À confirmer (Q2). |
| D4 | **Partenaire** | a) partenaire = tenant existant + `tenant.kind` (direct / partner) ; b) entités Partner / PartnerAccount / PartnerCustomer | **a)** : le modèle existe, les vues portefeuille aussi. Pas de hiérarchie à deux niveaux en V1. |
| D5 | **Source de télémétrie** | a) projection d'`audit_log` ; b) instrumentation applicative ; c) outil externe (PostHog…) | **a)** table `product_event` alimentée **en base** (triggers / `emit_event`), catalogue court, sans PII. Cohérent avec l'architecture « tout en base » et avec l'hébergement VPS. |
| D6 | **Transport d'événements** | a) outbox + dispatcher cron Vercel ; b) pg_net / webhooks Supabase ; c) file managée | **a)** : pas de dépendance nouvelle, portable sur VPS. |
| D7 | **Historique du score** | a) snapshot quotidien matérialisé ; b) recalcul à la volée | **a)** : la tendance « +37 points / 15 jours » exige des snapshots. |
| D8 | **Isolation organisation (R1)** | a) statu quo documenté ; b) policies par organisation | Dépend de Q7 ; **prérequis** à toute vue partenaire ou client exposée. |

---

## 6. Questions réellement bloquantes

1. **Q1 — Utilisateurs du RevOps en V1.** Caritis seul (pilotage éditeur), ou aussi les
   partenaires (Izarralde) dès la V1 ? Cela décide si la vue Partner Portfolio est P1 ou P2.
2. **Q2 — Où vivent les clients directs de Caritis ?** Dans un tenant « Caritis » dédié ?
   Et Caritis doit-il voir le pipeline des partenaires (pilotes, adoption) ou seulement
   des agrégats ?
3. **Q3 — Définition canonique de l'étape Discovery.** Est-ce l'atelier de qualification de
   45 min (site), ou le Discovery Workshop de 2–3 h avec livrables ? (Proposition : 45 min =
   *Qualified*, atelier 2–3 h = *Discovery*.)
4. **Q4 — Pilote.** Durée et jalons de référence (J0/J7/J15/J21/J30 de la mission ou
   J5/J10/J20/J25/J30 de la spec Dashboard) ; payant ou non ; critères de succès.
5. **Q5 — Réception des leads.** Le formulaire caritis.fr doit-il écrire dans AIGMS
   (`contact_request` via un point d'entrée signé côté serveur) dès P0, ou rester en
   courriel jusqu'au choix du CRM ?
6. **Q6 — Production.** Quelle migration est appliquée en production aujourd'hui ?
   (Vérifiable en lecture seule sur le projet déclaré, avec votre accord.)
7. **Q7 — Comptes clients finaux.** Des utilisateurs du client (pas du partenaire) ont-ils ou
   auront-ils un compte AIGMS dans un tenant partenaire ? Si oui, R1 devient P0.

---

## 7. Première proposition de périmètre P0 / P1

Principe : **tout dans AIGMS / Supabase, aucun outil externe**, en réutilisant
triggers, notifications, cron Vercel et vues portefeuille.

### P0 — Foundation (rendre AIGMS observable)

| ID | Élément | Réutilise | Nouveau |
|---|---|---|---|
| P0-1 | Cycle de vie commercial de l'organisation : stade (Qualified → Discovery → Pilot → Decision → Customer → Expansion / Churned), dates, owner commercial, historique par trigger | `organization`, `audit_log` | enum + table d'historique |
| P0-2 | Lead minimal : persistance des demandes caritis.fr, qualification, conversion en organisation | `contact_request`, `/admin/contacts` | point d'entrée serveur signé, lien `organization_id` |
| P0-3 | Catalogue d'événements produit (≈ 12 événements) projeté sans PII, avec `organization_id` | `audit_log`, `governance_event`, triggers | table `product_event` |
| P0-4 | Adoption Score V1 : fonction SQL explicable (sous-scores, facteurs), snapshot quotidien, delta 7 / 30 j | entités §1.5, readiness, cron Vercel | fonction + table de snapshots |
| P0-5 | Corrections préalables : `organization_id` sur `governance_event`, émission `IncidentOpened` à la création, décision sur R1/R2 | — | migrations ciblées |

### P1 — Pilot

| ID | Élément | Réutilise | Nouveau |
|---|---|---|---|
| P1-1 | Objet Pilot : début, fin, jalons, critères de succès, issue GO / EXTEND / STOP | `governance_decision` (`pilot_approval`) comme trace | table `pilot` |
| P1-2 | Jalons pilote et **adoption risk** (inactivité ≥ X jours) → tâche interne | `notification` + `due_at`, digest courriel | nouveaux `notification_kind` |
| P1-3 | Business Review J21/J25 : synthèse imprimable / DOCX | vues `/impression/*`, lib `docx` | gabarit |
| P1-4 | Tableau de bord Caritis limité aux 8 KPI prioritaires | `/admin/pilotage`, RPC portefeuille | RPC d'agrégation |
| P1-5 | Signaux d'expansion (nouveaux cas d'usage, actifs, fournisseurs, BU) à **validation humaine** | `product_event` | table `expansion_signal` |

### Hors P0/P1 (confirmé)

CRM, connecteurs Gmail / M365 / Calendar, n8n, webhooks sortants, Customer Health
Score complet (préparé via ses composants, non calculé), portail partenaire exposé
(tant que R1 n'est pas tranché).

---

## Annexe — sources principales

- Schéma : `supabase/migrations/0002, 0003, 0004, 0005, 0014, 0016, 0017, 0019, 0025, 0026, 0030, 0031, 0032, 0033, 0036, 0039, 0053, 0055, 0056, 0067, 0077, 0086, 0093`.
- Code : `src/proxy.ts`, `src/lib/actions/*`, `src/lib/email/*`, `src/lib/governance/*`,
  `src/app/api/alertes/envoi/route.ts`, `src/app/admin/(espace)/pilotage/page.tsx`, `vercel.json`.
- Documentation : `docs/adr/0002, 0007, 0008, 0009, 0013, 0016, 0019`,
  `docs/architecture/HEBERGEMENT_VPS_V1.md`, `docs/architecture/IDENTITE_V1.md`,
  `docs/automatisation/GUIDE_N8N_V1.md`, `docs/specifications/AIGMS_Dashboard_PME_Claude_Spec.md`,
  `02_Product/MATRICE_BUILD_CONNECT_DONT_BUILD_V2.md`, `03_Commercial/*`,
  `01_Methodology/01_DISCOVERY_ASSESS_V5.md`.
