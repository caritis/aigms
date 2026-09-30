-- =============================================================================
-- AIGMS — 0118 — Un jalon qui n'est pas prêt s'assume, il n'interdit pas
-- =============================================================================
-- Soumettre une décision de jalon était refusé tant que ses préconditions
-- n'étaient pas réunies : « on ne fait pas voter sur ce qui sera refusé »
-- (0065). Le motif paraît sage, et il coûte cher.
--
-- Le jalon est DÉJÀ tenu au bon endroit. À l'approbation,
-- `app.apply_decision_on_status` réévalue le gate ; s'il refuse, la décision
-- reste ce qu'elle est, LE STATUT NE BOUGE PAS, et celui qui a soumis reçoit
-- « décision approuvée, jalon non franchi » avec ce qui manque. La barrière à
-- la soumission est donc une seconde serrure sur la même porte — et elle
-- empêche tout le reste : pas de décision, donc pas d'avertissement, pas
-- d'approbation, pas de trace de ce qu'on a voulu faire. Le dossier reste muet
-- sur une mise en production qu'une organisation a demandée.
--
-- C'est la règle déjà posée pour les preuves manquantes (0097, 0098) :
-- l'organisation n'est pas empêchée, elle est mise devant ce qu'elle assume.
-- On l'applique au jalon.
--
--   * À la soumission, l'état du jalon est FIGÉ sur la décision, et celui qui
--     soumet doit dire ce qu'il en est. Sans cette phrase, la base refuse.
--   * L'approbateur la reçoit, par alerte et par courriel.
--   * Le franchissement, lui, reste refusé tant que le gate n'est pas prêt.
--     Rien n'est retiré : ce qui était interdit devient assumé, et tracé.
-- =============================================================================

alter table public.governance_decision
  add column if not exists milestone_gap           jsonb,
  add column if not exists milestone_gap_statement text;

comment on column public.governance_decision.milestone_gap is
  'Les préconditions du jalon non satisfaites au moment de la soumission, figées. Elles ne sont pas relues ensuite : ce que l''approbateur a lu ce jour-là ne se réécrit pas (0118).';

comment on column public.governance_decision.milestone_gap_statement is
  'Ce que celui qui soumet dit de cet écart : remédiation en cours, échéance visée. Exigé dès que l''écart n''est pas vide.';

-- -----------------------------------------------------------------------------
-- 1. Ce qui retient le jalon, au moment de la soumission
-- -----------------------------------------------------------------------------
-- La précondition qu'une décision APPORTE ne compte pas contre elle : le gate
-- APPROUVÉ exige une autorisation d'usage approuvée, et c'est justement celle
-- qu'on soumet. Miroir de `GATE_CHECK_SATISFIED_BY`, côté serveur.
create or replace function app.decision_milestone_gap(p_use_case_id uuid, p_type app.decision_type)
returns jsonb
language plpgsql
stable
security definer
set search_path = app, public, pg_catalog
as $$
declare
  v_target  app.use_case_status;
  v_apporte text;
  v_gate    jsonb;
begin
  v_target := case p_type
    when 'use_case_authorization' then 'APPROVED'
    when 'pilot_approval'         then 'PILOT'
    when 'go_production'          then 'PRODUCTION'
    when 'suspension'             then 'SUSPENDED'
    when 'retirement'             then 'RETIRED'
    else null end::app.use_case_status;
  if v_target is null or p_use_case_id is null then return '[]'::jsonb; end if;

  v_apporte := case p_type
    when 'use_case_authorization' then 'AUTHORIZATION_DECISION'
    when 'pilot_approval'         then 'PILOT_DECISION'
    when 'go_production'          then 'PRODUCTION_DECISION'
    when 'retirement'             then 'RETIREMENT_DECISION'
    else null end;

  v_gate := app.evaluate_gate(p_use_case_id, v_target);

  return coalesce((
    select jsonb_agg(c order by c ->> 'code')
    from jsonb_array_elements(v_gate -> 'checks') c
    where not (c ->> 'satisfied')::boolean
      and coalesce(c ->> 'severity', 'blocking') = 'blocking'
      and (v_apporte is null or c ->> 'code' <> v_apporte)
  ), '[]'::jsonb);
end;
$$;

comment on function app.decision_milestone_gap is
  'Les préconditions bloquantes qu''une décision de jalon laisse non satisfaites — hors celle qu''elle apporte elle-même. Figée sur la décision à sa soumission (0118).';

-- -----------------------------------------------------------------------------
-- 2. À la soumission : figer l'écart, exiger qu'on en dise quelque chose
-- -----------------------------------------------------------------------------
create or replace function app.snapshot_milestone_gap()
returns trigger
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
declare v_gap jsonb;
begin
  if new.use_case_id is null then return new; end if;
  if new.status <> 'submitted'
     or (tg_op = 'UPDATE' and old.status is not distinct from 'submitted') then
    return new;
  end if;

  v_gap := app.decision_milestone_gap(new.use_case_id, new.decision_type);
  new.milestone_gap := v_gap;

  if jsonb_array_length(v_gap) > 0
     and btrim(coalesce(new.milestone_gap_statement, '')) = '' then
    raise exception 'Ce jalon n’est pas prêt : % précondition(s) manquent (%). Dire ce qu’il en est avant de soumettre — ce que vous en dites sera lu par la personne appelée à se prononcer.',
      jsonb_array_length(v_gap),
      (select string_agg(g ->> 'label', ' ; ' order by g ->> 'code') from jsonb_array_elements(v_gap) g)
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger governance_decision_snapshot_milestone_gap
  before insert or update of status on public.governance_decision
  for each row execute function app.snapshot_milestone_gap();

-- -----------------------------------------------------------------------------
-- 3. L'approbateur le lit, dans son alerte comme dans son courriel
-- -----------------------------------------------------------------------------
create or replace function app.milestone_gap_sentence(p_decision public.governance_decision)
returns text
language sql
stable
set search_path = app, public, pg_catalog
as $$
  select case when coalesce(jsonb_array_length(p_decision.milestone_gap), 0) = 0 then null
    else format('Le jalon n’est pas prêt : %s précondition(s) manquent (%s). %s',
      jsonb_array_length(p_decision.milestone_gap),
      (select string_agg(g ->> 'label', ' ; ' order by g ->> 'code')
         from jsonb_array_elements(p_decision.milestone_gap) g),
      coalesce(nullif(btrim(p_decision.milestone_gap_statement), ''), 'Aucune explication donnée.'))
  end;
$$;

comment on function app.milestone_gap_sentence is
  'L''écart de jalon d''une décision, en une phrase — pour l''alerte et le courriel de qui doit se prononcer (0118).';

-- L'alerte destinée à celui qui statue porte les deux écarts : les preuves qui
-- manquent (0098) et les préconditions qui retiennent le jalon.
do $$
declare
  v_def   text;
  v_avant text;
begin
  v_def := pg_get_functiondef('app.notify_decision()'::regprocedure);
  v_avant := v_def;

  v_def := replace(v_def,
$old$               case when app.evidence_gap_sentence(new) is null then ''
                    else ' ATTENTION — ' || app.evidence_gap_sentence(new) end),$old$,
$new$               case when app.evidence_gap_sentence(new) is null then ''
                    else ' ATTENTION — ' || app.evidence_gap_sentence(new) end
             || case when app.milestone_gap_sentence(new) is null then ''
                     else ' ATTENTION — ' || app.milestone_gap_sentence(new) end),$new$);

  if v_def = v_avant or position('milestone_gap_sentence' in v_def) = 0 then
    raise exception 'Réécriture de notify_decision incomplète : le texte attendu n''a pas été trouvé.';
  end if;

  execute v_def;
end;
$$;
