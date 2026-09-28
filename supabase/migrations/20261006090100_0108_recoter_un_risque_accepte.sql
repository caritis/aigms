-- =============================================================================
-- AIGMS — 0108 — Recoter un risque ne doit pas sauver son acceptation
-- =============================================================================
-- Le risque devient modifiable depuis sa fiche : une cotation se corrige, un
-- scénario se précise, une catégorie se reclasse. Tout cela était déjà prévu
-- par la base — `risk_compute_levels` recalcule le niveau, `risk_audit`
-- enregistre le changement, `risk_check_criticality` réveille le signal de
-- criticité. Un seul cas n'était pas couvert.
--
-- `guard_risk_acceptance` (0058) ne se déclenche que sur `update of status` :
-- une acceptation restait donc valable après une recotation, alors qu'elle
-- avait été donnée pour un niveau qui n'est plus celui du risque. Une
-- personne nommée avait assumé « modéré » ; on pouvait lui faire assumer
-- « critique » sans rien lui demander. La passerelle `RISKS_TREATED` voyait
-- toujours un risque accepté, et laissait passer la mise en production.
--
-- Ce qu'on fait — et ce qu'on ne fait pas. On ne refuse pas la recotation :
-- corriger une erreur de cotation est un acte légitime, et l'interdire
-- pousserait à créer un second risque pour contourner. On retire
-- l'acceptation, on ramène le risque à « identifié », et on le dit à la
-- personne qui l'avait acceptée. Elle décidera de l'assumer de nouveau.
--
-- Une recotation À LA BAISSE ne touche à rien : qui a assumé « critique »
-- assume « élevé » a fortiori.
-- =============================================================================

create or replace function app.void_acceptance_on_rerating()
returns trigger
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
declare
  v_avant app.risk_level;
  v_apres app.risk_level;
  v_uc    public.ai_use_case%rowtype;
  v_rang  constant text[] := array['low', 'moderate', 'high', 'critical'];
begin
  if current_setting('aigms.seed', true) = 'on' then return new; end if;
  if old.status <> 'accepted' then return new; end if;

  v_avant := coalesce(old.residual_level, old.inherent_level);
  v_apres := coalesce(new.residual_level, new.inherent_level);

  -- Le niveau n'a pas monté : l'acceptation couvre toujours.
  if array_position(v_rang, v_apres::text) <= array_position(v_rang, v_avant::text) then
    return new;
  end if;

  select * into v_uc from public.ai_use_case where id = new.use_case_id;

  perform app.notify(
    new.tenant_id, new.organization_id, old.accepted_by, 'risk_acceptance_void',
    format('Acceptation caduque — %s', new.title),
    format(
      'Ce risque était accepté au niveau « %s ». Il est recoté « %s » : votre acceptation ne le couvre plus et a été retirée. Le risque revient à « identifié ». Il vous revient de l''accepter de nouveau, ou de le faire traiter.',
      v_avant, v_apres),
    format('/admin/use-cases/%s?onglet=risques', new.use_case_id),
    'risk', new.id);

  new.status := 'identified';
  new.accepted_by := null;
  new.accepted_at := null;
  new.acceptance_rationale := null;
  new.acceptance_review_at := null;
  return new;
end;
$$;

comment on function app.void_acceptance_on_rerating is
  'Une acceptation vaut pour le niveau auquel elle a été donnée. Recoter à la hausse la rend caduque : elle est retirée, le risque revient à « identifié », et la personne qui l''avait acceptée en est avertie (0108).';

create trigger risk_void_acceptance_on_rerating
  before update of inherent_likelihood, inherent_impact, residual_likelihood, residual_impact
  on public.risk
  for each row execute function app.void_acceptance_on_rerating();
