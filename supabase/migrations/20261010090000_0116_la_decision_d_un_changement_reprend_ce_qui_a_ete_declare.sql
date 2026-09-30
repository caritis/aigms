-- =============================================================================
-- AIGMS — 0116 — La décision d'un changement reprend ce qui a été déclaré
-- =============================================================================
-- Depuis que « Changement significatif » a quitté la liste des décisions qu'on
-- soumet, le SEUL chemin est : déclarer le fait, laisser le moteur qualifier,
-- et trancher la décision qu'il ouvre. Ce chemin est le bon — on ne sait pas
-- d'avance si un changement engage — mais la décision engendrée était pauvre :
-- elle citait la référence du changement et le verdict, et rien de ce que la
-- personne venait de saisir.
--
-- Or elle avait tout dit : les natures touchées, l'autonomie qui augmente et
-- son niveau visé, les huit faits que le moteur lit, la date prévue. Celui qui
-- se prononce devait ouvrir le changement à côté pour savoir sur quoi.
--
-- Trois choses changent :
--
--   1. La décision REPREND la déclaration — natures ET faits, l'écart
--      d'autonomie chiffré, la date prévue, et les conditions que la base
--      applique déjà sans les écrire.
--   2. Sa date d'effet est la DATE PRÉVUE du changement. Une décision de
--      changement prend effet quand le changement a lieu, pas quand on
--      l'approuve. Elle ne porte aucun jalon : rien d'autre n'en dépend.
--   3. Elle EST ADRESSÉE. Elle naissait sans personne appelée à se prononcer :
--      elle n'apparaissait dans la file de personne et n'envoyait aucune
--      alerte. Le déclarant désigne qui tranche ; à défaut, le Responsable
--      redevable. Et quand ce n'est pas lui — le Porteur déclare un changement
--      décidé en réunion, et demande à un autre de se prononcer — le
--      Responsable redevable en est informé quand même : il répond du cas
--      d'usage, il ne l'apprend pas après coup.
-- =============================================================================

alter table public.change_request
  add column if not exists expected_approver_user_id uuid
    references public.user_profile (id) on delete set null;

comment on column public.change_request.expected_approver_user_id is
  'La personne appelée à se prononcer sur la décision que ce changement ouvrira. Par défaut le Responsable redevable du cas d''usage ; s''il en est désigné une autre, le redevable est informé quand même (0116).';

-- -----------------------------------------------------------------------------
-- Ce que la déclaration dit, en toutes lettres
-- -----------------------------------------------------------------------------
-- Les natures disent SUR QUOI porte le changement ; les faits disent CE QUI
-- s'aggrave. Les deux se lisent : « portant sur le modèle et les données » ne
-- remplace pas « de nouvelles personnes sont concernées ».
create or replace function app.change_natures(p_change public.change_request)
returns text
language sql
immutable
set search_path = app, public, pg_catalog
as $$
  select string_agg(
    case t::text
      when 'MODEL'      then 'le modèle'
      when 'DATASET'    then 'les données'
      when 'PURPOSE'    then 'la finalité'
      when 'VENDOR'     then 'le fournisseur'
      when 'AUTONOMY'   then 'l’autonomie'
      when 'POPULATION' then 'la population concernée'
      when 'TERRITORY'  then 'le territoire'
      when 'SECURITY'   then 'la sécurité'
      when 'DEPLOYMENT' then 'le déploiement'
      else lower(t::text)
    end, ', ' order by t::text)
  from unnest(p_change.change_types) t;
$$;

create or replace function app.change_facts(p_change public.change_request)
returns text[]
language sql
immutable
set search_path = app, public, pg_catalog
as $$
  select array_remove(array[
    case when p_change.increases_autonomy then 'l’autonomie augmente' end,
    case when p_change.changes_purpose then 'la finalité change' end,
    case when p_change.new_population_affected then 'de nouvelles personnes sont concernées' end,
    case when p_change.new_territory then 'un nouveau territoire est visé' end,
    case when p_change.changes_personal_data then 'les données personnelles changent' end,
    case when p_change.changes_vendor then 'le fournisseur change' end,
    case when p_change.changes_model then 'le modèle change' end,
    case when p_change.changes_dataset then 'les jeux de données changent' end,
    case when p_change.security_relevant then 'il y a incidence sur la sécurité' end
  ], null);
$$;

-- Le perimetre rouvert se lisait en codes : « classification, oversight,
-- impact_assessment, risk ». Celui qui se prononce n'a pas a connaitre les
-- noms de colonnes.
create or replace function app.reassessment_scope_fr(p_scope text[])
returns text
language sql
immutable
set search_path = app, pg_catalog
as $$
  select string_agg(
    case s
      when 'classification'    then 'la qualification réglementaire'
      when 'risk'              then 'les risques'
      when 'controls'          then 'les contrôles'
      when 'control'           then 'les contrôles'
      when 'impact_assessment' then 'l’étude d’impact'
      when 'oversight'         then 'la supervision humaine'
      when 'evidence'          then 'les preuves'
      when 'criticality'       then 'la criticité'
      else s
    end, ', ' order by s)
  from unnest(coalesce(p_scope, '{}')) s;
$$;

comment on function app.change_facts is
  'Les faits objectifs qu''une déclaration de changement coche, en clair. Ce que le moteur lit, rendu lisible dans la décision qu''il ouvre (0116).';

-- -----------------------------------------------------------------------------
-- La décision engendrée
-- -----------------------------------------------------------------------------
create or replace function app.open_change_decision()
returns trigger
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
declare
  v_ch        public.change_request%rowtype;
  v_uc        public.ai_use_case%rowtype;
  v_verdict   app.reassessment_verdict;
  v_decision  uuid;
  v_submitter uuid;
  v_approver  uuid;
  v_natures   text;
  v_faits     text[];
  v_autonomie text;
begin
  v_verdict := coalesce(new.final_verdict, new.engine_verdict);
  if v_verdict = 'NO_REASSESSMENT' then return new; end if;
  select * into v_ch from public.change_request where id = new.change_request_id;
  if v_ch.id is null then return new; end if;
  -- Une décision porte déjà ce changement (celle qui l'a créé, ou une
  -- ouverture précédente) : on n'en ouvre pas une seconde.
  if (app.change_decision(v_ch.id)).id is not null then return new; end if;

  select * into v_uc from public.ai_use_case where id = v_ch.use_case_id;
  v_submitter := coalesce(v_ch.requested_by, app.current_user_id());
  v_approver := coalesce(v_ch.expected_approver_user_id, v_uc.accountable_user_id);

  v_natures := app.change_natures(v_ch);
  v_faits := app.change_facts(v_ch);
  -- L'écart chiffré : « de L1 à L3 » se lit, « l'autonomie augmente » se croit.
  v_autonomie := case
    when v_ch.increases_autonomy and v_ch.new_autonomy_level is not null
      then format(' — l’autonomie passe de %s à %s', v_uc.autonomy_level, v_ch.new_autonomy_level)
    else '' end;

  insert into public.governance_decision (
    tenant_id, organization_id, use_case_id, decision_type, subject, context,
    decision_statement, rationale, conditions, effective_from,
    expected_approver_user_id, status, submitted_by, submitted_at
  ) values (
    v_ch.tenant_id, v_ch.organization_id, v_ch.use_case_id, 'significant_change',
    format('Changement %s — %s', v_ch.business_ref, v_ch.title),
    v_ch.description,
    format('Mettre en œuvre le changement %s — « %s »%s%s%s, sous réserve de la réévaluation %s qu’il appelle sur %s.',
           v_ch.business_ref,
           v_ch.title,
           case when v_ch.planned_at is not null
                then format(', prévu le %s', app.fr_date(v_ch.planned_at)) else '' end,
           case when v_natures is not null then format(', portant sur %s', v_natures) else '' end,
           v_autonomie,
           case v_verdict when 'FULL_REASSESSMENT' then 'complète' else 'partielle' end,
           coalesce(nullif(app.reassessment_scope_fr(new.scope), ''), 'un périmètre à préciser')),
    format('La réévaluation conclut à une réévaluation %s.%s%s',
           case v_verdict when 'FULL_REASSESSMENT' then 'complète' else 'partielle' end,
           case when cardinality(v_faits) > 0
                then format(' Ce que la déclaration retient : %s.', array_to_string(v_faits, ' ; '))
                else '' end,
           case when new.engine_rationale is not null
                then format(' Motifs du moteur : %s',
                            (select string_agg(x, ' ') from jsonb_array_elements_text(new.engine_rationale) x))
                else '' end),
    format('La mise en œuvre est subordonnée à l’approbation de cette décision, et à la clôture de ce que la réévaluation rouvre%s.',
           case when v_ch.planned_at is not null
                then format('. Date prévue de mise en œuvre : %s', app.fr_date(v_ch.planned_at)) else '' end),
    v_ch.planned_at,
    v_approver,
    'submitted', v_submitter, now()
  ) returning id into v_decision;

  insert into public.decision_link (tenant_id, decision_id, target_type, target_id, note)
  values (v_ch.tenant_id, v_decision, 'change_request', v_ch.id, 'Le changement qui appelle cette décision.');

  /*
    Le Responsable redevable, même quand il n'est pas celui qui tranche.

    Le Porteur peut déclarer un changement arrêté en réunion et demander à un
    tiers de se prononcer. Le redevable répond du cas d'usage : il ne doit pas
    l'apprendre après coup. L'alerte de « décision à instruire » part vers
    l'approbateur désigné (trigger de 0053) ; celle-ci l'informe, lui, sans
    rien lui demander.
  */
  if v_uc.accountable_user_id is not null
     and v_uc.accountable_user_id is distinct from v_approver then
    perform app.notify(
      v_ch.tenant_id, v_ch.organization_id, v_uc.accountable_user_id, 'decision_to_approve',
      format('Changement déclaré sur « %s », décision ouverte', v_uc.name),
      format('%s — « %s » appelle une réévaluation %s. %s se prononcera. Vous répondez de ce cas d''usage : la décision est lisible au registre.',
             v_ch.business_ref, v_ch.title,
             case v_verdict when 'FULL_REASSESSMENT' then 'complète' else 'partielle' end,
             coalesce(app.person_name(v_approver), 'Une autre personne')),
      format('/admin/use-cases/%s?onglet=decisions', v_ch.use_case_id),
      'governance_decision', v_decision);
  end if;

  return new;
end;
$$;

comment on function app.open_change_decision is
  'Ouvre la décision qu''un changement appelle, en reprenant ce qui a été déclaré : natures, faits, écart d''autonomie, date prévue. Adressée au Responsable redevable par défaut ; s''il en est désigné un autre, le redevable est informé (0116).';
