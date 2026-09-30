-- =============================================================================
-- AIGMS — 0119 — L'arbitrage critique se propose à qui le tient
-- =============================================================================
-- Une mise en production s'ouvrait en proposant l'Administrateur client — la
-- DSI, celle qui met en service. C'est juste dans le cas ordinaire, et faux
-- dans celui qui compte : sur un cas d'usage de criticité ÉLEVÉE ou CRITIQUE,
-- l'arbitrage revient au Comité de direction (0055), et la base refuse
-- l'approbation de quiconque ne tient pas ce rôle.
--
-- Le défaut menait donc droit au mur : on soumettait à la DSI, la DSI recevait
-- l'alerte, ouvrait la décision, remplissait son verdict — et découvrait à
-- l'enregistrement qu'elle n'avait pas qualité. Le refus est bon ; le proposer
-- ne l'était pas.
--
-- `app.default_decision_approver` prend donc la criticité en compte : dès que
-- la décision relève de l'arbitrage critique, seul le Comité de direction est
-- proposé. Ailleurs, rien ne change.
-- =============================================================================

-- Le cas d'usage s'ajoute aux parametres : une surcharge laisserait deux
-- fonctions du meme nom, et Postgres refuserait de choisir.
drop function if exists app.default_decision_approver(uuid, app.decision_type);

create function app.default_decision_approver(
  p_organization_id uuid,
  p_type app.decision_type,
  p_use_case_id uuid default null
)
returns uuid
language sql
stable
security definer
set search_path = app, public, pg_catalog
as $$
  with arbitrage as (
    -- Le même test que le garde-fou : une exception de politique toujours,
    -- une mise en production lorsque le cas d'usage pèse.
    select p_type = 'policy_exception'
        or (p_type = 'go_production'
            and exists (select 1 from public.ai_use_case u
                         where u.id = p_use_case_id
                           and u.criticality in ('high', 'critical'))) as critique
  )
  select ra.user_id
  from public.role_assignment ra, arbitrage a
  where ra.organization_id = p_organization_id
    and ra.role = any (case
          when a.critique then array['executive_viewer']::app.app_role[]
          when p_type = 'go_production' then array['client_admin', 'executive_viewer']::app.app_role[]
          else array['executive_viewer']::app.app_role[] end)
    and (ra.valid_until is null or ra.valid_until > now())
  order by case ra.role when 'client_admin' then 0 else 1 end, ra.valid_from
  limit 1;
$$;

comment on function app.default_decision_approver is
  'La personne appelée à se prononcer, à défaut de désignation. Le Comité de direction dès que la décision relève de l''arbitrage critique — exception de politique, ou mise en production d''un cas d''usage élevé ou critique ; l''Administrateur client sur une mise en production ordinaire (0098, 0119).';

-- Le trigger de 0098 appelait la fonction sans le cas d'usage : il le passe.
create or replace function app.snapshot_evidence_gap()
returns trigger
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
declare v_gap jsonb;
begin
  if new.decision_type <> 'go_production' or new.use_case_id is null then
    return new;
  end if;

  -- La désignation par défaut vaut à la création comme à la soumission : une
  -- décision qui part sans destinataire n'avertit personne.
  if new.expected_approver_user_id is null then
    new.expected_approver_user_id :=
      app.default_decision_approver(new.organization_id, new.decision_type, new.use_case_id);
  end if;

  if new.status = 'submitted'
     and (tg_op = 'INSERT' or old.status is distinct from 'submitted') then
    v_gap := app.control_evidence_gap(new.use_case_id);
    new.evidence_gap := v_gap;

    if jsonb_array_length(v_gap) > 0
       and btrim(coalesce(new.evidence_gap_statement, '')) = '' then
      raise exception 'Cette mise en production laisse % contrôle(s) applicable(s) sans preuve (%). Dire ce qu''il en est — remédiation en cours, pièce non présentée — avant de la soumettre.',
        jsonb_array_length(v_gap),
        (select string_agg(g ->> 'code', ', ' order by g ->> 'code') from jsonb_array_elements(v_gap) g)
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Qui peut se prononcer, lisible depuis l'écran
-- -----------------------------------------------------------------------------
-- La liste « Personne appelée à se prononcer » alignait les noms sans dire
-- lequel tient l'arbitrage. On choisissait au hasard, et le refus venait après.
create or replace function public.decision_approvers(
  p_organization_id uuid,
  p_type app.decision_type,
  p_use_case_id uuid default null
)
returns table (user_id uuid, name text, roles text[], arbitre boolean, propose boolean)
language sql
stable
security definer
set search_path = app, public, pg_catalog
as $$
  -- On ne rend les personnes d'une organisation qu'a qui a acces a son tenant :
  -- `security definer` contourne la RLS, il ne dispense pas de la verifier.
  with acces as (
    select 1 from public.organization o
     where o.id = p_organization_id and app.has_tenant_access(o.tenant_id)
  ),
  defaut as (
    select app.default_decision_approver(p_organization_id, p_type, p_use_case_id) as id
  ),
  critique as (
    select p_type = 'policy_exception'
        or (p_type = 'go_production'
            and exists (select 1 from public.ai_use_case u
                         where u.id = p_use_case_id
                           and u.criticality in ('high', 'critical'))) as oui
  )
  select
    u.id,
    coalesce(nullif(u.full_name, ''), u.email),
    array_agg(distinct ra.role::text order by ra.role::text),
    bool_or(ra.role = any (app.roles_arbitrate())),
    u.id = (select id from defaut)
  from acces, public.role_assignment ra
  join public.user_profile u on u.id = ra.user_id
  where ra.organization_id = p_organization_id
    and (ra.valid_until is null or ra.valid_until > now())
  group by u.id, u.full_name, u.email
  -- Celui qui tient l'arbitrage en premier quand il est exigé.
  order by (case when (select oui from critique)
                  and bool_or(ra.role = any (app.roles_arbitrate())) then 0 else 1 end),
           coalesce(nullif(u.full_name, ''), u.email);
$$;

comment on function public.decision_approvers is
  'Les personnes de l''organisation qui peuvent se prononcer, avec leurs rôles, celui qui tient l''arbitrage critique, et celui qui est proposé par défaut (0119).';

revoke all on function public.decision_approvers(uuid, app.decision_type, uuid) from public, anon;
grant execute on function public.decision_approvers(uuid, app.decision_type, uuid) to authenticated;
