-- =============================================================================
-- AIGMS — 0110 — Le cœur IA de l'outillage, et ce que les textes exigeaient
-- =============================================================================
-- Les 61 familles viennent d'un classeur IT/IA. Trente et une relèvent de
-- l'infrastructure informatique pure — IaaS, PaaS, CMDB, ITSM, UEM/MDM, NMS,
-- EDR/XDR, CSPM, CWPP, CNAPP, conteneurs, orchestration. Les proposer d'abord
-- à un AI Governance Officer de PME, c'est l'inviter à inventorier son système
-- d'information : exactement ce que le CLAUDE.md du projet interdit de
-- construire (« ne pas construire SIEM, DLP, IAM, CMDB, ITSM »).
--
-- On ne SUPPRIME rien : les rattachements aux contrôles-types survivent, et un
-- produit déjà déclaré sur une famille d'infrastructure reste lisible. On
-- CLASSE. Deux rangs :
--
--   'ai_core'    — ce qui tient ou prouve un contrôle d'IA. Proposé d'abord.
--   'it_support' — l'outillage informatique qui peut servir, mais qu'on ne
--                  demande pas de recenser. Derrière un repli.
--
-- Et l'on comble six manques que les textes nomment et que le classeur, écrit
-- du point de vue de l'exploitation informatique, ne pouvait pas voir :
-- marquage des contenus synthétiques (AI Act art. 50), nomenclature et fiches
-- de modèle (annexe IV), tests de biais (ISO/IEC 24027), explicabilité
-- (art. 13 et 86), droits des personnes (RGPD ch. III), registre des AIPD
-- (RGPD art. 35).
-- =============================================================================

alter table public.catalog_tool
  add column if not exists scope text not null default 'it_support'
    check (scope in ('ai_core', 'it_support'));

comment on column public.catalog_tool.scope is
  'Ce qui tient un contrôle d''IA (ai_core) ou l''outillage informatique qui peut y concourir (it_support). Classe la saisie ; ne retire rien (0110).';

create index if not exists catalog_tool_scope_idx on public.catalog_tool (scope, tool_service);

update public.catalog_tool set scope = 'ai_core'
 where tenant_id is null
   and code in (
     -- Ce qui ne parle que d'IA.
     'CTRL-AI-001', 'CTRL-AI-002', 'CTRL-AI-003', 'CTRL-AI-004', 'CTRL-AI-005',
     'CTRL-AI-006', 'CTRL-AI-007', 'CTRL-AI-008', 'CTRL-AI-009', 'CTRL-AI-010',
     -- Les données : ce que le système apprend, mobilise et laisse fuir.
     'CTRL-DAT-001', 'CTRL-DAT-002', 'CTRL-DAT-003', 'CTRL-DAT-004',
     -- La gouvernance elle-même : décisions, preuves, supervision, incidents.
     'CTRL-GOV-001', 'CTRL-GOV-002', 'CTRL-GOV-003', 'CTRL-GOV-004',
     'CTRL-GRC-001', 'CTRL-GRC-002', 'CTRL-GRC-003',
     -- Les tiers, les accès aux modèles, la nomenclature, le coût.
     'CTRL-TPR-001', 'CTRL-IAM-001', 'CTRL-SUP-001', 'CTRL-API-001', 'CTRL-FIN-001',
     -- La journalisation : AI Act art. 12, et la preuve se prend là.
     'CTRL-OBS-001', 'CTRL-OBS-003', 'CTRL-OBS-004', 'CTRL-SEC-001'
   );

-- -----------------------------------------------------------------------------
-- Les six familles que le classeur ne pouvait pas voir
-- -----------------------------------------------------------------------------
insert into public.catalog_tool (
  tenant_id, code, phase, domain, acronym, tool_service, definition, tool_examples,
  controlled_object, control_question, expected_evidence, nature, automation,
  frequency, owner_role, risk_addressed, iso42001_refs, iso27001_refs,
  other_frameworks, priority, applicability, scope
)
select null, v.code, v.phase::app.aigms_phase, v.domain, v.acronym, v.tool_service, v.definition,
       v.tool_examples::jsonb, v.controlled_object, v.control_question, v.expected_evidence::jsonb,
       v.nature, v.automation, v.frequency, v.owner_role, v.risk_addressed,
       v.iso42001_refs::jsonb, v.iso27001_refs::jsonb, v.other_frameworks::jsonb,
       v.priority, v.applicability, 'ai_core'
from (values
  ('CTRL-AI-011', 'OPERATE', 'Transparence des contenus', 'Content Provenance',
   'Marquage et provenance des contenus générés',
   'Marque les sorties d''un système génératif comme produites par une IA, et atteste leur origine de façon lisible par une machine.',
   '["C2PA / Content Credentials", "filigrane invisible", "métadonnées de provenance", "mention visible à l''écran"]',
   'Les contenus produits par le système',
   'Les contenus générés sont-ils marqués comme tels, de manière robuste et vérifiable, et les personnes exposées en sont-elles informées ?',
   '["Exemple de contenu marqué", "procédure de marquage", "capture de la mention affichée"]',
   'Préventif', 'Automatique', 'Continue', 'Product Owner',
   'Contenu synthétique pris pour authentique ; obligation de transparence non tenue',
   '["ISO/IEC 42001 : transparence et information des parties intéressées"]',
   '["ISO/IEC 27001 : intégrité de l''information"]',
   '["AI Act art. 50 : marquage des contenus de synthèse et information des personnes"]',
   'Haute', 'Systèmes génératifs exposés à des personnes'),

  ('CTRL-AI-012', 'BUILD', 'Documentation technique', 'AIBOM / Model Card',
   'Nomenclature d''un système d''IA et fiches de modèle',
   'Inventorie ce dont un système d''IA est fait — modèles, jeux de données, bibliothèques, dépendances — et documente chaque modèle : usage prévu, limites, performances, populations évaluées.',
   '["Model card", "data card", "AIBOM", "CycloneDX ML-BOM", "fiche système"]',
   'La composition du système et ses modèles',
   'Sait-on de quoi le système est fait, et chaque modèle porte-t-il sa fiche — usage prévu, limites, performances, données d''évaluation ?',
   '["AIBOM à jour", "fiche de modèle signée", "journal des versions de composants"]',
   'Détectif', 'Semi-automatique', 'À chaque version', 'AI Engineer',
   'Composant inconnu, modèle employé hors de son domaine, documentation technique non produite',
   '["ISO/IEC 42001 A.6 : documentation du cycle de vie du système d''IA"]',
   '["ISO/IEC 27001 : gestion des actifs et des configurations"]',
   '["AI Act annexe IV : documentation technique", "AI Act art. 53 : documentation des modèles à usage général"]',
   'Haute', 'Tout système d''IA en production'),

  ('CTRL-AI-013', 'BUILD', 'Équité', 'Bias Testing',
   'Mesure des biais et de l''équité',
   'Mesure les écarts de performance et de traitement du système entre groupes de personnes, et suit ces écarts dans le temps.',
   '["Fairlearn", "AI Fairness 360", "campagne de test par segment", "audit d''équité externe"]',
   'Les sorties du système, par groupe de personnes',
   'Les écarts de traitement entre groupes sont-ils mesurés, documentés, et sous un seuil que quelqu''un a fixé ?',
   '["Rapport de mesure par segment", "seuils retenus et leur justification", "plan de correction"]',
   'Détectif', 'Semi-automatique', 'À chaque version, puis périodique', 'Data Scientist',
   'Discrimination indirecte, écart de performance non vu, plainte fondée',
   '["ISO/IEC 42001 : impacts sur les personnes", "ISO/IEC TR 24027 : biais dans les systèmes d''IA"]',
   '["ISO/IEC 27001 : qualité et intégrité des données"]',
   '["AI Act art. 10 : qualité des données et examen des biais", "RGPD art. 22 : décision automatisée"]',
   'Haute', 'Systèmes touchant des personnes'),

  ('CTRL-AI-014', 'OPERATE', 'Explicabilité', 'XAI',
   'Explication des sorties du système',
   'Produit, pour une sortie donnée, une explication intelligible par la personne concernée et par celui qui doit la contrôler.',
   '["SHAP", "LIME", "explication par règles", "motif rédigé et joint à la décision"]',
   'Une sortie du système, prise une par une',
   'Une personne concernée peut-elle obtenir une explication de la décision qui la touche, et celui qui supervise peut-il la comprendre ?',
   '["Exemple d''explication produite", "procédure de demande d''explication", "trace des demandes traitées"]',
   'Détectif', 'Semi-automatique', 'À la demande', 'Product Owner',
   'Décision incontestable faute d''être compréhensible ; supervision humaine de façade',
   '["ISO/IEC 42001 : transparence et explicabilité"]',
   '["ISO/IEC 27001 : traçabilité des traitements"]',
   '["AI Act art. 13 : transparence envers le déployeur", "AI Act art. 86 : droit à l''explication", "RGPD art. 22"]',
   'Haute', 'Systèmes à haut risque et décisions individuelles'),

  ('CTRL-AI-015', 'OPERATE', 'Droits des personnes', 'DSR',
   'Exercice des droits des personnes',
   'Reçoit, instruit et clôt les demandes d''accès, de rectification, d''opposition, d''effacement et de retrait de consentement, y compris lorsque les données ont servi à un système d''IA.',
   '["Portail de demandes", "registre des demandes", "module DSR d''un outil de conformité"]',
   'Les demandes des personnes concernées',
   'Une demande est-elle reçue, tracée, instruite dans le délai, et son effet propagé jusqu''aux jeux de données et aux index employés par le système ?',
   '["Registre des demandes", "délais de traitement", "preuve de propagation aux index et jeux d''entraînement"]',
   'Correctif', 'Semi-automatique', 'Continue', 'DPO',
   'Droit non exercé, donnée effacée d''un côté et vivante dans un index vectoriel',
   '["ISO/IEC 42001 : parties intéressées et leurs attentes"]',
   '["ISO/IEC 27701 : traitement des demandes des personnes"]',
   '["RGPD chapitre III : droits de la personne concernée"]',
   'Haute', 'Dès que des données personnelles sont mobilisées'),

  ('CTRL-AI-016', 'GOVERN', 'Protection des données', 'AIPD / DPIA',
   'Registre des analyses d''impact sur la protection des données',
   'Tient les AIPD, leur articulation avec l''évaluation d''impact du système d''IA, et la trace de la consultation du DPO comme de l''autorité lorsqu''elle est due.',
   '["Module AIPD d''un outil de conformité", "registre des traitements", "modèle CNIL"]',
   'Les traitements de données à risque élevé',
   'L''AIPD est-elle faite avant la mise en œuvre, révisée quand le traitement change, et sa conclusion suivie d''effet ?',
   '["AIPD signée", "avis du DPO", "trace de révision", "consultation préalable le cas échéant"]',
   'Préventif', 'Manuelle', 'À chaque traitement nouveau ou modifié', 'DPO',
   'Traitement à risque mis en œuvre sans analyse ; AIPD faite une fois et jamais revue',
   '["ISO/IEC 42005 : évaluation d''impact des systèmes d''IA"]',
   '["ISO/IEC 27701 : analyse d''impact vie privée"]',
   '["RGPD art. 35 et 36 : analyse d''impact et consultation préalable", "AI Act art. 27 : analyse d''impact sur les droits fondamentaux"]',
   'Haute', 'Traitements de données personnelles à risque élevé')
) as v(code, phase, domain, acronym, tool_service, definition, tool_examples,
       controlled_object, control_question, expected_evidence, nature, automation,
       frequency, owner_role, risk_addressed, iso42001_refs, iso27001_refs,
       other_frameworks, priority, applicability)
where not exists (
  select 1 from public.catalog_tool t where t.tenant_id is null and t.code = v.code
);

-- Ce que chaque nouvelle famille instrumente. Le lien passe par le CODE du
-- contrôle-type : il survit aux versions du référentiel.
insert into public.catalog_tool_control (tool_id, framework_code, control_code)
select tl.id, 'AIGMS-CF', m.control_code
from (values
  ('CTRL-AI-011', 'AIGMS-HUM-006'),
  ('CTRL-AI-011', 'AIGMS-USE-006'),
  ('CTRL-AI-012', 'AIGMS-INV-006'),
  ('CTRL-AI-012', 'AIGMS-INV-007'),
  ('CTRL-AI-013', 'AIGMS-DAT-008'),
  ('CTRL-AI-013', 'AIGMS-MON-002'),
  ('CTRL-AI-014', 'AIGMS-HUM-002'),
  ('CTRL-AI-014', 'AIGMS-HUM-006'),
  ('CTRL-AI-015', 'AIGMS-DAT-004'),
  ('CTRL-AI-015', 'AIGMS-DAT-010'),
  ('CTRL-AI-016', 'AIGMS-RSK-012'),
  ('CTRL-AI-016', 'AIGMS-DAT-004')
) as m(tool_code, control_code)
join public.catalog_tool tl on tl.code = m.tool_code and tl.tenant_id is null
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- La carte d'outillage rend le rang
-- -----------------------------------------------------------------------------
-- Reprise de la definition de 0095 — celle qui rend `declared` en LISTE et
-- porte `served_controls`. La reconstruire depuis 0094 la ferait reculer de
-- deux migrations sans que rien ne le dise : `create or replace` ne compare
-- pas, il remplace.
--
-- Sans ce rang ici, l'ecran de l'organisation et la fiche d'un controle
-- classeraient differemment la meme liste, et l'on ne saurait plus lequel dit
-- vrai.
create or replace function public.organization_tooling_map(p_organization_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = app, public, pg_catalog
as $$
  with scope as (
    select o.id, o.tenant_id from public.organization o
    where o.id = p_organization_id and app.has_tenant_access(o.tenant_id)
  ),
  -- Les familles que le référentiel rattache aux contrôles de l'organisation,
  -- et LESQUELS : « 7 contrôles attendent cette famille » ne dit pas où aller.
  expected as (
    select distinct t.id as tool_id, t.code, t.acronym, t.tool_service, t.domain,
           t.phase::text as phase, t.definition, t.tool_examples, t.expected_evidence, t.scope
    from public.catalog_tool t
    join public.catalog_tool_control m on m.tool_id = t.id
    cross join scope s
    where (t.tenant_id is null or t.tenant_id = s.tenant_id)
  ),
  served as (
    select e.code,
           jsonb_agg(jsonb_build_object(
             'id', c.id, 'code', c.code, 'name', c.name,
             'status', c.status, 'measure_kind', c.measure_kind,
             'retained', exists (select 1 from public.control_tooling ct where ct.control_id = c.id)
           ) order by c.code) as controls,
           count(*) as n
    from expected e
    join public.catalog_tool_control m2 on m2.tool_id = e.tool_id
    join public.catalog_control cc on cc.control_code = m2.control_code
    join public.control c on c.catalog_control_id = cc.id
    where c.organization_id = (select id from scope)
    group by e.code
  ),
  signals as (
    select
      count(*) filter (where app.control_needs_tooling(c.id))         as technical_without_tooling,
      count(*) filter (where app.control_evidence_automatable(c.id))  as evidence_automatable
    from public.control c
    where c.organization_id = (select id from scope)
  )
  select jsonb_build_object(
    'signals', (select jsonb_build_object(
        'technical_without_tooling', s.technical_without_tooling,
        'evidence_automatable', s.evidence_automatable) from signals s),
    'families', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', e.code, 'acronym', e.acronym, 'name', e.tool_service, 'domain', e.domain, 'phase', e.phase,
        'scope', e.scope,
        'definition', e.definition, 'examples', e.tool_examples, 'expected_evidence', e.expected_evidence,
        'controls', coalesce((select sv.n from served sv where sv.code = e.code), 0),
        'served_controls', coalesce((select sv.controls from served sv where sv.code = e.code), '[]'::jsonb),
        -- Plusieurs produits possibles : une liste, toujours — vide comprise.
        'declared', coalesce((select jsonb_agg(jsonb_build_object(
              'id', ot.id, 'product', ot.product, 'note', ot.note, 'role', ot.role,
              'vendor', (select jsonb_build_object('id', v.id, 'name', v.name, 'review_status', v.review_status)
                           from public.vendor v where v.id = ot.vendor_id),
              'asset', (select jsonb_build_object('id', a.id, 'name', a.name, 'business_ref', a.business_ref, 'kind', a.kind)
                          from public.ai_asset a where a.id = ot.asset_id),
              'connector', (select jsonb_build_object('id', gc.id, 'name', gc.display_name, 'status', gc.status)
                              from public.governance_connector gc where gc.id = ot.connector_id),
              'used_by', (select count(*) from public.control_tooling ct where ct.tooling_id = ot.id))
            order by ot.product)
            from public.organization_tooling ot
            where ot.organization_id = (select id from scope) and ot.tool_code = e.code), '[]'::jsonb)
      ) order by coalesce((select sv.n from served sv where sv.code = e.code), 0) desc, e.tool_service)
      from expected e), '[]'::jsonb)
  );
$$;


comment on function public.organization_tooling_map is
  'La carte d''outillage : par famille, les produits déclarés, les contrôles servis, les deux signaux (0095), et le rang de la famille (0110).';
