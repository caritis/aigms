-- =============================================================================
-- AIGMS — 0114 — Une typologie attendue dit ce qui la sert, ou que rien ne la sert
-- =============================================================================
-- La carte « Preuves attendues » annonçait une typologie CRITIQUE et proposait
-- « Déposer ». Elle ne disait pas sur quel contrôle déposer, ni si un contrôle
-- existait seulement. Le prospect lisait « Surveillance continue et dérive —
-- critique — 0 valide », cliquait, et se retrouvait devant un formulaire qu'il
-- ne savait pas remplir.
--
-- La chaîne existe pourtant, et la migration 0112 vient de la réparer :
--   typologie -> exigence de l'annexe A -> contrôles de l'organisation.
-- Il suffisait de la rendre. La carte peut alors distinguer deux silences très
-- différents : « un contrôle la sert, il manque la pièce » et « rien ne la sert,
-- il manque le contrôle ». Le second ne se solde pas en déposant un document.
--
-- On rend aussi les références qui ancrent la typologie : elles mènent à la
-- Déclaration d'Applicabilité, à l'endroit exact où l'exigence se lit et se
-- tranche.
-- =============================================================================

drop function if exists public.typology_coverage(uuid);
drop function if exists app.typology_coverage(uuid);

create function app.typology_coverage(p_organization_id uuid)
returns table (
  code            text,
  name            text,
  criticality     app.evidence_criticality,
  evidence_total  integer,
  evidence_valid  integer,
  control_count   integer,
  controls        text[],
  refs            text[]
)
language sql
stable
security definer
set search_path = app, public, pg_catalog
as $$
  with typologies as (
    select * from app.evidence_typologies(p_organization_id)
  ),
  -- Les exigences de l'annexe A qui ancrent chaque typologie. Le corps de la
  -- norme est cité mais non chargé (0022) : il ne peut porter aucun contrôle,
  -- et n'a donc rien à faire ici.
  ancres as (
    select t.id as typology_id, r.id as requirement_id, tr.reference
    from typologies t
    join public.evidence_typology_reference tr
      on tr.typology_id = t.id and tr.framework_code = 'ISO_IEC_42001'
    join public.framework f
      on f.code = tr.framework_code and f.version = tr.framework_version
    join public.requirement r
      on r.framework_id = f.id and r.requirement_reference = tr.reference
  ),
  servants as (
    select distinct a.typology_id, c.code
    from ancres a
    join public.control_requirement_map m on m.requirement_id = a.requirement_id
    join public.control c on c.id = m.control_id
    where c.organization_id = p_organization_id
  )
  select
    t.code, t.name, t.criticality,
    count(e.id)::integer,
    count(e.id) filter (
      where e.validation_status = 'validated'
        and app.evidence_freshness(e.valid_until) <> 'expired')::integer,
    (select count(*)::integer from servants s where s.typology_id = t.id),
    coalesce((select array_agg(s.code order by s.code) from servants s where s.typology_id = t.id), '{}'),
    coalesce((select array_agg(distinct a.reference order by a.reference) from ancres a where a.typology_id = t.id), '{}')
  from typologies t
  left join public.evidence e
    on e.typology_id = t.id and e.organization_id = p_organization_id
  group by t.id, t.code, t.name, t.criticality, t.ordinal
  order by
    case t.criticality
      when 'critical'   then 1
      when 'high'       then 2
      when 'moderate'   then 3
      when 'low'        then 4
      when 'negligible' then 5
      else 6
    end,
    t.ordinal;
$$;

comment on function app.typology_coverage is
  'Preuves déposées par typologie, au regard de la criticité attendue pour le profil — et ce qui la sert : les contrôles de l''organisation rattachés à ses exigences d''ancrage. Zéro contrôle ne se solde pas en déposant une pièce (0114).';

create function public.typology_coverage(p_organization_id uuid)
returns table (
  code text, name text, criticality app.evidence_criticality,
  evidence_total integer, evidence_valid integer,
  control_count integer, controls text[], refs text[]
)
language sql stable security invoker
set search_path = app, public, pg_catalog
as $$ select * from app.typology_coverage(p_organization_id); $$;

revoke all on function public.typology_coverage(uuid) from public, anon;
grant execute on function public.typology_coverage(uuid) to authenticated;
