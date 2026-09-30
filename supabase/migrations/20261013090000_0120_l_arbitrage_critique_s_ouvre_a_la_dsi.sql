-- =============================================================================
-- AIGMS — 0120 — L'arbitrage critique s'ouvre à l'Administrateur client
-- =============================================================================
-- Décision du propriétaire, prise pour les PME et les ETI : l'arbitrage d'une
-- mise en production critique, et d'une exception à une politique, revient
-- désormais AUX DEUX — le Comité de direction et l'Administrateur client.
--
-- Ce que cela change, dit franchement : le RACI donnait cet « A » au seul
-- Comité de direction. Dans une PME, ce comité se réunit rarement, et souvent
-- ne se distingue pas de la direction elle-même ; exiger sa signature pour
-- chaque mise en service revenait à faire attendre le dossier pour une
-- formalité — ou, pire, à pousser quelqu'un à s'attribuer le rôle pour
-- avancer. Une règle qu'on contourne ne protège personne.
--
-- Ce que cela NE change PAS, et c'est l'essentiel :
--
--   * La séparation des rôles tient. L'auteur d'une mise en production, d'une
--     acceptation de risque ou d'une exception ne peut pas l'approuver
--     lui-même — quel que soit son rôle.
--   * L'AI Governance Officer, qui prépare le dossier, n'arbitre toujours pas.
--     L'arbitrage reste hors de la main qui instruit.
--   * Le Porteur de l'IA, l'Expert, le Comité des risques, l'Auditeur ne
--     l'obtiennent pas davantage.
--
-- L'arbitrage n'est donc pas ouvert : il passe d'une personne à deux, toutes
-- deux côté client, toutes deux distinctes de qui instruit.
-- =============================================================================

create or replace function app.roles_arbitrate()
returns app.app_role[]
language sql immutable set search_path = pg_catalog as $$
  select array['executive_viewer', 'client_admin']::app.app_role[];
$$;

comment on function app.roles_arbitrate is
  'Le Comité de direction et l''Administrateur client : les deux seuls à pouvoir approuver une mise en production critique ou une exception à une politique. Ouvert au second en 0120, pour les PME où le comité ne se réunit pas à la demande — la séparation des rôles, elle, ne bouge pas.';

-- -----------------------------------------------------------------------------
-- La personne proposée, désormais
-- -----------------------------------------------------------------------------
-- L'Administrateur client d'abord : c'est la DSI du client, celle qui met en
-- service, et c'est elle qu'on trouve dans une PME. Le Comité de direction
-- ensuite — sur une exception de politique, il vient en premier : une exception
-- à une règle qu'on s'est donnée n'est pas une affaire d'exploitation.
create or replace function app.default_decision_approver(
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
  select ra.user_id
  from public.role_assignment ra
  where ra.organization_id = p_organization_id
    and ra.role = any (case
          when p_type in ('go_production', 'policy_exception', 'risk_acceptance')
            then app.roles_arbitrate()
          else array['executive_viewer', 'client_admin']::app.app_role[] end)
    and (ra.valid_until is null or ra.valid_until > now())
  order by
    case
      -- Une exception à une politique remonte à la direction ; le reste
      -- s'adresse d'abord à qui met en service.
      when p_type = 'policy_exception' then case ra.role when 'executive_viewer' then 0 else 1 end
      else case ra.role when 'client_admin' then 0 else 1 end
    end,
    ra.valid_from
  limit 1;
$$;

comment on function app.default_decision_approver is
  'La personne appelée à se prononcer, à défaut de désignation : l''Administrateur client d''abord, le Comité de direction ensuite — et l''inverse sur une exception de politique. Les deux tiennent l''arbitrage critique (0098, 0119, 0120).';
