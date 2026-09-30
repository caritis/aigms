-- =============================================================================
-- AIGMS — 0121 — L'écart de jalon se lit avant d'approuver, lui aussi
-- =============================================================================
-- La migration 0118 a rendu un jalon non prêt assumable : l'écart est figé sur
-- la décision, celui qui soumet dit ce qu'il en est, et l'approbateur le reçoit
-- par alerte et par courriel. Il manquait la moitié du geste : la fenêtre
-- « Se prononcer » ne l'affiche pas. On approuvait donc sans l'avoir sous les
-- yeux — à moins d'avoir lu son message avant d'ouvrir l'écran.
--
-- L'écart de preuve, lui, exige depuis 0098 une prise de connaissance
-- NOMINATIVE : sans elle, la base refuse l'approbation. Il n'y a aucune raison
-- de traiter autrement les préconditions qui retiennent le jalon — elles disent
-- que la mise en service n'aura pas lieu, ce qui est au moins aussi lourd.
--
-- Même règle, donc, et même trace : qui a coché est qui a approuvé.
-- =============================================================================

alter table public.governance_decision
  add column if not exists milestone_gap_acknowledged_at timestamptz,
  add column if not exists milestone_gap_acknowledged_by uuid
    references public.user_profile (id) on delete set null;

comment on column public.governance_decision.milestone_gap_acknowledged_at is
  'Quand l''écart de jalon a été assumé. L''approbation l''exige dès que l''écart n''est pas vide (0121).';

comment on column public.governance_decision.milestone_gap_acknowledged_by is
  'Qui l''a assumé : celui qui approuve. Une prise de connaissance ne vaut que nominative.';

create or replace function app.guard_milestone_gap_acknowledged()
returns trigger
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
begin
  if new.status not in ('approved', 'approved_with_conditions')
     or old.status = new.status
     or coalesce(jsonb_array_length(new.milestone_gap), 0) = 0 then
    return new;
  end if;

  if new.milestone_gap_acknowledged_at is null then
    raise exception 'Cette décision laisse % précondition(s) du jalon non réunies : l''approbation exige d''en avoir pris connaissance.',
      jsonb_array_length(new.milestone_gap)
      using errcode = 'check_violation';
  end if;

  new.milestone_gap_acknowledged_by :=
    coalesce(new.milestone_gap_acknowledged_by, new.approver_user_id);
  return new;
end;
$$;

create trigger governance_decision_guard_milestone_gap
  before update of status on public.governance_decision
  for each row execute function app.guard_milestone_gap_acknowledged();

-- -----------------------------------------------------------------------------
-- La prise de connaissance fait partie de l'acte, ici aussi
-- -----------------------------------------------------------------------------
-- Le garde-fou de l'arbitrage (0055) refuse à celui qui ne fait que se
-- prononcer toute écriture hors de la liste blanche : statut, approbateur,
-- conditions, motif, dates. La migration 0101 y a ajouté la prise de
-- connaissance de l'écart de preuve, pour la même raison — c'est un acte de
-- celui qui se prononce, pas une réécriture du dossier. Celle de l'écart de
-- jalon l'est tout autant.
do $$
declare v_def text; v_avant text;
begin
  v_def   := pg_get_functiondef('app.guard_decision_arbitration()'::regprocedure);
  v_avant := v_def;

  v_def := replace(v_def,
    '    v_old.evidence_gap_acknowledged_by := null; v_new.evidence_gap_acknowledged_by := null;',
$new$    v_old.evidence_gap_acknowledged_by := null; v_new.evidence_gap_acknowledged_by := null;
    -- Et celle de l'écart de jalon (0121).
    v_old.milestone_gap_acknowledged_at := null; v_new.milestone_gap_acknowledged_at := null;
    v_old.milestone_gap_acknowledged_by := null; v_new.milestone_gap_acknowledged_by := null;$new$);

  if v_def = v_avant or position('milestone_gap_acknowledged_at := null' in v_def) = 0 then
    raise exception 'Réécriture de guard_decision_arbitration incomplète : le texte attendu n''a pas été trouvé.';
  end if;

  execute v_def;
end;
$$;
