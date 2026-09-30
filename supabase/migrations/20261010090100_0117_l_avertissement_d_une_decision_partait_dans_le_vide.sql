-- =============================================================================
-- AIGMS — 0117 — L'avertissement d'une décision partait dans le vide
-- =============================================================================
-- Aucun courriel de décision n'est jamais parti. Pas depuis hier, où l'envoi
-- immédiat a été étendu à tous les types : depuis l'origine, y compris pour la
-- mise en production, la décision la plus tendue du registre.
--
-- `claim_decision_notices` (0100) lit `n.subject_type` et `n.subject_id`. La
-- table `notification` porte `entity_type` et `entity_id` : ces colonnes
-- n'existent pas. PL/pgSQL ne valide pas le corps d'une fonction à sa création,
-- seulement à sa première exécution — la faute a donc traversé la migration, la
-- revue et les tests sans se signaler.
--
-- Et elle ne se signalait pas non plus à l'usage : l'application appelle cette
-- fonction dans un `try/catch` volontairement muet, au motif qu'une mise en
-- production ne se refuse pas parce qu'un courriel a échoué. Le motif est bon ;
-- il a rendu la panne invisible pendant des semaines. Un test la tient
-- désormais — la fonction doit s'exécuter, même pour ne rien rendre.
-- =============================================================================

create or replace function public.claim_decision_notices(p_decision_id uuid)
returns table (
  notification_id uuid, email text, full_name text,
  kind text, title text, body text, href text, organization_name text
)
language plpgsql
volatile
security definer
set search_path = app, public, pg_catalog
as $$
declare v_decision public.governance_decision%rowtype;
begin
  select * into v_decision from public.governance_decision where id = p_decision_id;
  if v_decision.id is null or not app.has_tenant_access(v_decision.tenant_id) then
    return;
  end if;

  return query
  with dues as (
    update public.notification n
       set emailed_at = now()
     where n.entity_type = 'governance_decision'
       and n.entity_id = p_decision_id
       and n.emailed_at is null
       and n.read_at is null
       and n.due_at <= now()
       and n.kind in ('decision_to_approve', 'decision_gap_notice')
       and (select p.email_enabled and p.immediate_enabled
              from app.notification_preference_of(n.recipient_user_id) p)
    returning n.id, n.recipient_user_id, n.kind, n.title, n.body, n.href, n.organization_id
  )
  select d.id, u.email, u.full_name, d.kind::text, d.title, d.body, d.href, o.name
  from dues d
  join public.user_profile u on u.id = d.recipient_user_id
  left join public.organization o on o.id = d.organization_id;
end;
$$;

comment on function public.claim_decision_notices is
  'Rend les avertissements d''une décision et les marque comme partis, pour que l''application les envoie sans attendre la tâche planifiée. Un seul des deux envoie (0100, colonnes corrigées en 0117).';
