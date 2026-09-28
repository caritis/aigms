-- =============================================================================
-- AIGMS — 0109 — Clore un risque, et n'effacer que ce qui n'a rien produit
-- =============================================================================
-- Le statut « closed » existait depuis 0008 : l'écran le lisait, le registre
-- imprimé l'excluait, et RIEN ne permettait de le poser. Il manquait donc la
-- marche normale entre « ce risque n'a plus lieu d'être » et « supprimons la
-- ligne » — et faute de cette marche, on voulait supprimer.
--
-- Deux portes, et elles ne servent pas la même chose.
--
--   CLORE — un risque qui a vécu et n'a plus lieu d'être : périmètre modifié,
--   cas d'usage abandonné, risque absorbé par un autre. Rien ne disparaît :
--   traitements, constats et décisions restent lisibles. Un risque clos sort
--   de la passerelle RISKS_TREATED : c'est pourquoi le motif est obligatoire
--   et l'auteur enregistré, comme pour une acceptation. Ouverte aussi au
--   responsable du risque : il en répond, il peut dire qu'il est éteint.
--
--   SUPPRIMER — l'erratum : un doublon, un essai, un risque saisi sur le
--   mauvais cas d'usage. Uniquement pour une ligne qui n'a RIEN laissé
--   derrière elle, et les conditions se vérifient ici, pas dans l'écran.
--   Fermée au responsable du risque : il en répond, il ne doit pas pouvoir
--   l'effacer. Fermée à l'administrateur de plateforme : il ne gouverne rien.
--
-- Ce qu'on n'empêche PAS, et pourquoi. Un risque critique tout juste saisi,
-- sans traitement, remplit les conditions de suppression : l'effacer ferait
-- passer la passerelle. Une condition de plus rendrait l'erratum inutilisable.
-- La parade est ailleurs, et elle existe déjà : `audit_business` écrit
-- l'instantané complet d'avant, avec son auteur et sa date, et le journal se
-- lit par cas d'usage. Traçabilité, pas prévention — la même doctrine que
-- partout ailleurs dans la base.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Clore : un motif, un auteur, une date
-- -----------------------------------------------------------------------------
alter table public.risk
  add column if not exists closed_at     timestamptz,
  add column if not exists closed_by     uuid references public.user_profile (id) on delete set null,
  add column if not exists closure_reason text;

comment on column public.risk.closure_reason is
  'Pourquoi le risque n’a plus lieu d’être. Obligatoire : une clôture sort le risque de la passerelle de production, elle ne peut pas être muette.';

alter table public.risk
  drop constraint if exists risk_closure_requires_reason;
alter table public.risk
  add constraint risk_closure_requires_reason check (
    status <> 'closed'
    or (closed_by is not null and closed_at is not null and btrim(coalesce(closure_reason, '')) <> '')
  );

create or replace function app.guard_risk_closure()
returns trigger
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
begin
  if current_setting('aigms.seed', true) = 'on' then return new; end if;
  if app.current_user_id() is null then return new; end if;

  if new.status = 'closed' and (tg_op = 'INSERT' or old.status is distinct from 'closed') then
    -- On clôt en son propre nom : la ligne dira qui a estimé le risque éteint.
    if new.closed_by is distinct from app.current_user_id() then
      raise exception 'Un risque se clôt en son propre nom.' using errcode = 'check_violation';
    end if;
    new.closed_at := coalesce(new.closed_at, now());
  end if;

  -- Rouvrir efface la clôture : on ne garde pas un motif qui ne vaut plus.
  if tg_op = 'UPDATE' and old.status = 'closed' and new.status <> 'closed' then
    new.closed_at := null;
    new.closed_by := null;
    new.closure_reason := null;
  end if;

  return new;
end;
$$;

comment on function app.guard_risk_closure is
  'Une clôture est nominative et motivée ; rouvrir un risque efface la clôture (0109).';

create trigger risk_guard_closure before insert or update of status on public.risk
  for each row execute function app.guard_risk_closure();

-- -----------------------------------------------------------------------------
-- 2. Supprimer : seulement ce qui n'a rien produit
-- -----------------------------------------------------------------------------
create or replace function app.roles_erase_risk()
returns app.app_role[]
language sql immutable set search_path = pg_catalog as $$
  select array['governance_officer', 'client_admin']::app.app_role[];
$$;

comment on function app.roles_erase_risk is
  'Qui peut effacer un risque saisi par erreur. Le responsable du risque en est exclu : il en répond, il ne l’efface pas. L’administrateur de plateforme aussi : il ne gouverne rien (0109).';

grant execute on function app.roles_erase_risk() to authenticated, service_role;

create or replace function app.guard_risk_delete()
returns trigger
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
declare v_quoi text;
begin
  if current_setting('aigms.seed', true) = 'on' then return old; end if;
  if app.current_user_id() is null then return old; end if;

  -- Suppression en cascade : le cas d'usage ou l'organisation qui portait le
  -- risque vient de partir. Le garde-fou protege la ligne contre un effacement
  -- DELIBERE, pas contre la disparition de ce a quoi elle appartenait.
  if old.use_case_id is not null
     and not exists (select 1 from public.ai_use_case u where u.id = old.use_case_id) then
    return old;
  end if;
  if not exists (select 1 from public.organization o where o.id = old.organization_id) then
    return old;
  end if;

  if not app.has_tenant_role(old.tenant_id, app.roles_erase_risk()) then
    raise exception 'Effacer un risque revient à l’AI Governance Officer ou à l’administrateur client. Un risque dont vous répondez se clôt, avec son motif.'
      using errcode = 'insufficient_privilege';
  end if;

  -- Ce qui interdit l'effacement : tout ce qui prouve que le risque a vécu.
  select string_agg(m, ' ') into v_quoi from (
    select 'Son statut n’est plus « identifié ».' as m where old.status <> 'identified'
    union all
    select 'Il a été accepté.' where old.accepted_at is not null
    union all
    select format('%s traitement(s) lui sont rattachés.', count(*)::text)
      from public.risk_treatment t where t.risk_id = old.id having count(*) > 0
    union all
    select format('%s décision(s) le désignent.', count(*)::text)
      from public.decision_link l where l.target_type = 'risk' and l.target_id = old.id having count(*) > 0
    union all
    select format('%s constat(s) d’étude d’impact y renvoient.', count(*)::text)
      from public.impact_finding f where f.linked_risk_id = old.id having count(*) > 0
  ) as raisons;

  if v_quoi is not null then
    raise exception 'Ce risque a produit des effets : il se clôt, il ne s’efface pas. %', v_quoi
      using errcode = 'check_violation';
  end if;

  return old;
end;
$$;

comment on function app.guard_risk_delete is
  'N’admet l’effacement que d’un risque qui n’a rien laissé derrière lui : encore « identifié », jamais accepté, sans traitement, sans décision qui le désigne, sans constat d’impact qui y renvoie. Tout le reste se clôt (0109).';

create trigger risk_guard_delete before delete on public.risk
  for each row execute function app.guard_risk_delete();
