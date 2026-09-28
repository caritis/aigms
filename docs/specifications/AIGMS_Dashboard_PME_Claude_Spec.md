# AIGMS — Base de spécification Dashboard PME / Intégrateur

## 1. Finalité

Construire dans AIGMS un dashboard permettant de répondre simultanément à deux questions :

1. **Côté client PME :** la gouvernance de l'IA devient-elle réellement maîtrisée et démontrable ?
2. **Côté intégrateur/MSP :** les risques et écarts détectés font-ils émerger des remédiations, des services managés et du revenu additionnel mesurable ?

Le dashboard ne doit jamais confondre :
- un **risque identifié** ;
- une **opportunité de remédiation** ;
- un **pipeline commercial pondéré** ;
- un **revenu effectivement gagné**.

---

## 2. Persona de référence

Scénario initial configurable :
- PME : ~100 collaborateurs
- ~15 usages IA estimés
- ~4 usages critiques/sensibles
- ~40 contrôles applicables sur le périmètre pilote
- POC : 30 jours

Ces valeurs sont des **hypothèses de dimensionnement**, modifiables par organisation.

---

## 3. Modèle de décision

### Niveau 1 — Visibilité
Questions :
- Combien d'usages IA sont connus ?
- Combien restent potentiellement hors gouvernance ?
- Chaque usage a-t-il un owner ?

KPIs :
- `ai_use_cases_discovered`
- `ai_discovery_coverage`
- `owner_coverage`

Cibles POC :
- Discovery Coverage >= 80 %
- Owner Coverage >= 90 %

### Niveau 2 — Maîtrise du risque
Questions :
- Les usages ont-ils été évalués ?
- Quels risques critiques restent ouverts ?
- Quels contrôles sont applicables et effectivement mis en œuvre ?

KPIs :
- `risk_assessment_coverage`
- `critical_open_risks`
- `control_coverage`

Cibles POC :
- Risk Assessment Coverage >= 90 %
- Critical Open Risks <= 2 avec décision/plan formalisé
- Control Coverage >= 80 %

### Niveau 3 — Assurance
Questions :
- Les contrôles disposent-ils de preuves ?
- Ces preuves sont-elles encore valides ?

KPIs :
- `evidence_assurance_rate`
- `evidence_freshness`

Cibles POC :
- Evidence Assurance Rate >= 75 %
- Evidence Freshness >= 85 %

### Niveau 4 — Remédiation
Questions :
- Quels gaps peuvent devenir des actions ?
- Combien sont réellement qualifiés ?
- Combien de temps faut-il pour les traiter ?

KPIs :
- `remediation_opportunities`
- `mean_time_to_remediate`
- `sla_remediation_compliance`

Cibles :
- >= 5 opportunités qualifiées sur le scénario de référence
- MTTR <= 30 jours à terme
- SLA compliance >= 85 %

### Niveau 5 — Valeur intégrateur
Questions :
- Quelle valeur de remédiation le dispositif fait-il émerger ?
- Quelle part peut devenir récurrente ?
- Quel revenu est réellement attribuable à AIGMS ?

KPIs :
- `remediation_opportunity_value`
- `recurring_service_opportunity`
- `remediation_conversion_rate`
- `aigms_influenced_revenue`
- `managed_controls`

---

## 4. Formules principales

### AI Discovery Coverage
`discovered_use_cases / estimated_use_cases`

### Owner Coverage
`use_cases_with_owner / discovered_use_cases`

### Risk Assessment Coverage
`assessed_use_cases / discovered_use_cases`

### Control Coverage
`implemented_controls / applicable_controls`

### Evidence Assurance Rate
`controls_with_valid_evidence / controls_requiring_evidence`

### Evidence Freshness
`non_expired_required_evidence / required_evidence`

### Remediation Opportunity Value (ROV)
Pour chaque opportunité :

`estimated_service_value * conversion_probability`

Puis :

`ROV = SUM(weighted_opportunity_value)`

> Le ROV est un pipeline pondéré. Il ne doit jamais être affiché comme du chiffre d'affaires acquis.

### Remediation Conversion Rate
`won_remediations / qualified_remediation_opportunities`

### AIGMS Influenced Revenue
Somme des revenus **gagnés** disposant d'une chaîne d'attribution vérifiable :

`AI Use Case -> Risk -> Control Gap -> Remediation -> Opportunity -> Won`

### Governance Completion
Moyenne pondérée configurable de :
- Discovery Coverage
- Owner Coverage
- Risk Assessment Coverage
- Control Coverage
- Evidence Assurance Rate

---

## 5. Seuils UX

Utiliser trois états :

- `ALERT` : sous le seuil minimal ; décision/action requise
- `TARGET` : cible POC atteinte
- `MATURE` : niveau d'industrialisation

Exemple :

| KPI | ALERT | TARGET J30 | MATURE |
|---|---:|---:|---:|
| Discovery Coverage | < 60% | >= 80% | >= 95% |
| Owner Coverage | < 70% | >= 90% | 100% |
| Control Coverage | < 60% | >= 80% | >= 95% |
| Evidence Assurance | < 50% | >= 75% | >= 90% |
| ROV | < 10 k€ | >= 20 k€ | >= 30 k€ |
| Recurring Opportunity | < 2 k€ ARR | >= 5 k€ ARR | >= 10 k€ ARR |
| MTTR | > 60 j | <= 30 j | <= 15 j |
| Governance Completion | < 60% | >= 80% | >= 95% |

Les seuils financiers doivent être **paramétrables par partenaire**.

---

## 6. Architecture du dashboard

### Bandeau exécutif
Afficher 6 cartes maximum :
1. Governance Completion
2. Critical Open Risks
3. Evidence Assurance Rate
4. Remediation Opportunities
5. Remediation Opportunity Value
6. Recurring Service Opportunity

Chaque carte contient :
- valeur actuelle ;
- cible ;
- variation depuis baseline ;
- état ALERT/TARGET/MATURE ;
- lien drill-down.

### Bloc « Governance »
Graphiques :
- usages : estimated / discovered / assessed / owned ;
- risques par criticité ;
- contrôles : applicable / implemented / evidenced ;
- évolution du risque résiduel.

### Bloc « Remediation »
Afficher :
- top gaps par criticité ;
- service technique associé ;
- owner ;
- échéance ;
- statut ;
- valeur estimée ;
- récurrence potentielle.

### Bloc « Partner Value »
Afficher séparément :
- ROV ;
- pipeline brut ;
- pipeline pondéré ;
- ARR potentiel ;
- revenu gagné influencé par AIGMS ;
- taux de conversion ;
- nombre de contrôles managés.

Ne jamais additionner pipeline et revenu gagné dans un même total.

---

## 7. Modèle de données minimal

```text
Organization
AIUseCase
Asset
Risk
Control
ControlApplicability
Evidence
ControlGap
Remediation
ServiceCatalogItem
CommercialOpportunity
RevenueAttribution
KpiSnapshot
```

Relations importantes :

```text
Organization
  -> AIUseCase
      -> Asset
      -> Risk
          -> ControlApplicability
              -> Control
              -> Evidence
              -> ControlGap
                  -> Remediation
                      -> ServiceCatalogItem
                      -> CommercialOpportunity
                          -> RevenueAttribution
```

---

## 8. Objet RemediationOpportunity

Champs minimaux :

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "sourceRiskId": "uuid",
  "sourceControlGapId": "uuid",
  "remediationId": "uuid",
  "serviceCatalogItemId": "uuid",
  "category": "IAM|Cyber|Cloud|M365|Hosting|Backup|Governance|Other",
  "estimatedValue": 6000,
  "recurringAnnualValue": 1200,
  "conversionProbability": 0.5,
  "weightedValue": 3000,
  "commercialStatus": "identified|qualified|proposed|won|lost",
  "ownerId": "uuid",
  "createdAt": "ISO-8601"
}
```

`weightedValue` doit être calculé côté domaine/service, pas saisi manuellement.

---

## 9. Gates de décision du POC 30 jours

### Gate J5 — Discovery
Continuer si :
- Discovery Coverage >= 60 %
- périmètre et owners principaux identifiés.

### Gate J10 — Risk
Continuer si :
- Risk Assessment Coverage >= 70 %
- risques prioritaires exploitables identifiés.

### Gate J20 — Controls & Evidence
Continuer si :
- Control Coverage >= 60 %
- gaps et preuves suffisamment structurés pour produire des remédiations.

### Gate J25 — Economic Validation
Le potentiel économique est considéré significatif si, selon le scénario PME initial :
- ROV >= 20 k€ **OU**
- Recurring Service Opportunity >= 5 k€ ARR.

Ces valeurs sont des objectifs commerciaux internes paramétrables, pas des benchmarks universels.

### Gate J30 — Industrialisation
Présenter à la direction :
- Governance Completion ;
- risques critiques ;
- Evidence Assurance ;
- backlog de remédiation ;
- ROV ;
- ARR potentiel ;
- plan 90 jours.

Décision :
`GO | EXTEND | STOP`

---

## 10. Exigences fonctionnelles pour Claude

1. Créer un service `KpiCalculationService`.
2. Les KPI doivent être calculés à partir des entités sources et historisés dans `KpiSnapshot`.
3. Permettre le filtrage :
   - organisation ;
   - campagne/période ;
   - business unit ;
   - criticité ;
   - catégorie de service ;
   - owner.
4. Permettre un drill-down depuis chaque KPI vers les objets qui expliquent sa valeur.
5. Conserver la traçabilité complète d'un revenu influencé :
   `UseCase -> Risk -> Gap -> Remediation -> Opportunity -> Revenue`.
6. Les seuils ALERT/TARGET/MATURE doivent être configurables par tenant/partenaire.
7. Séparer les droits :
   - client ;
   - consultant gouvernance ;
   - intégrateur technique ;
   - commercial partenaire ;
   - direction.
8. Le client ne doit pas voir les données commerciales internes du partenaire sauf configuration explicite.
9. Journaliser les changements de valeur, probabilité et statut d'une opportunité.
10. Prévoir export Excel/PDF des vues exécutives.

---

## 11. Critères d'acceptation

Le dashboard est acceptable si :
- chaque KPI peut être expliqué par ses données sources ;
- aucun pipeline n'est présenté comme revenu acquis ;
- chaque gap peut être relié à zéro, une ou plusieurs remédiations ;
- une remédiation peut être reliée à un service du catalogue ;
- les KPI sont historisables ;
- les seuils sont configurables ;
- les vues Client et Partner sont séparées ;
- la décision POC peut être produite à partir des KPI sans retraitement Excel obligatoire.

---

## 12. Prompt d'implémentation suggéré à Claude

Implémente le module `AIGMS Partner & Governance Dashboard` en respectant cette spécification.

Commence par :
1. analyser le modèle de données existant et réutiliser les entités déjà présentes ;
2. produire un gap analysis entre le modèle existant et les entités nécessaires ;
3. proposer les migrations minimales ;
4. implémenter les services de calcul KPI ;
5. implémenter les API/queries ;
6. créer la vue Governance ;
7. créer la vue Partner Value ;
8. ajouter les drill-downs et filtres ;
9. écrire les tests unitaires des formules ;
10. fournir un jeu de données PME de démonstration.

Ne duplique pas les concepts Risk, Control, Evidence, Asset ou Remediation s'ils existent déjà.
Le référentiel de contrôles existant reste la source des contrôles types, preuves attendues et questions d'évaluation.
Les nouveaux objets doivent enrichir ce modèle et non créer un second référentiel concurrent.
