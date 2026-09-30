import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, becomeUser, connect, DEMO, expectFailure } from '../helpers/db'

/**
 * 0063 : un changement qui appelle une reevaluation ouvre une decision, et ne
 * se met pas en oeuvre sans elle ; une decision approuvee fait avancer le
 * changement ; un changement deja porte par une decision n'en ouvre pas une
 * seconde.
 */

let db: Client
beforeAll(async () => {
  db = await connect()
})
afterAll(async () => {
  await db.end()
})

describe('Décisions et changements', () => {
  it('un changement qui appelle une réévaluation ouvre une décision, et attend son approbation', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{ id: string }>(
        `insert into public.change_request (tenant_id, organization_id, use_case_id, title, description, change_types,
                                            changes_model, changes_personal_data, status, requested_by)
         values ($1, $2, $3, 'Nouveau modèle et nouvelles données', 'Le modèle change, et les données personnelles aussi.',
                 array['MODEL','DATASET']::app.change_type[], true, true, 'DRAFT', $4) returning id`,
        [DEMO.tenantA, DEMO.orgA, DEMO.useCaseProduction, DEMO.officerA],
      )
      const changeId = rows[0]!.id
      await c.query('select app.screen_change_request($1)', [changeId])
      const { rows: decision } = await c.query<{ id: string; status: string; decision_type: string; submitted_by: string }>(
        `select d.id, d.status, d.decision_type, d.submitted_by from public.decision_link l
           join public.governance_decision d on d.id = l.decision_id
          where l.target_type = 'change_request' and l.target_id = $1`, [changeId],
      )
      const blocked = await expectFailure(c, `update public.change_request set status = 'APPROVED' where id = $1`, [changeId])
      // Un relecteur approuve la decision : le changement passe approuve de lui-meme.
      await becomeUser(c, DEMO.reviewerA)
      await c.query(
        `update public.governance_decision set status = 'approved', approver_user_id = $2, approved_at = now(), effective_from = current_date
          where id = $1`, [decision[0]!.id, DEMO.reviewerA],
      )
      const { rows: after } = await c.query<{ status: string }>('select status from public.change_request where id = $1', [changeId])
      return { decision: decision[0], blocked, after: after[0]!.status }
    })
    expect(r.decision).toMatchObject({ status: 'submitted', decision_type: 'significant_change', submitted_by: DEMO.officerA })
    expect(r.blocked.message).toMatch(/appelle une décision/)
    expect(r.after).toBe('APPROVED')
  })

  /*
   * 0116 : la decision engendree REPREND ce qui a ete declare. Elle citait la
   * reference du changement et le verdict, et rien de ce que la personne venait
   * de saisir — celui qui se prononce devait ouvrir le changement a cote pour
   * savoir sur quoi.
   */
  it('reprend les natures, les faits, l’écart d’autonomie et la date prévue', async () => {
    const d = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{ id: string }>(
        `insert into public.change_request (tenant_id, organization_id, use_case_id, title, description, change_types,
                                            increases_autonomy, new_autonomy_level, new_population_affected,
                                            planned_at, status, requested_by)
         values ($1, $2, $3, 'Passage en agent autonome', 'L’assistant devient un agent qui exécute sans relecture.',
                 array['MODEL','AUTONOMY']::app.change_type[], true, 'L3', true,
                 current_date + 30, 'DRAFT', $4) returning id`,
        [DEMO.tenantA, DEMO.orgA, DEMO.useCaseProduction, DEMO.officerA],
      )
      const changeId = rows[0]!.id
      await c.query('select app.screen_change_request($1)', [changeId])
      const { rows: decision } = await c.query<{
        decision_statement: string
        rationale: string
        conditions: string
        effective_from: string | null
        expected_approver_user_id: string | null
      }>(
        `select d.decision_statement, d.rationale, d.conditions,
                d.effective_from::text as effective_from, d.expected_approver_user_id
           from public.decision_link l
           join public.governance_decision d on d.id = l.decision_id
          where l.target_type = 'change_request' and l.target_id = $1`,
        [changeId],
      )
      const { rows: uc } = await c.query<{ planned: string }>(
        'select (current_date + 30)::text as planned',
      )
      return { decision: decision[0]!, planned: uc[0]!.planned }
    })

    // Les natures, en clair.
    expect(d.decision.decision_statement).toContain('le modèle')
    expect(d.decision.decision_statement).toContain('l’autonomie')
    // L'ecart chiffre : « l'autonomie augmente » se croit, « de L1 à L3 » se lit.
    expect(d.decision.decision_statement).toMatch(/l’autonomie passe de \w+ à L3/)
    // Les faits coches, un par un.
    expect(d.decision.rationale).toContain('de nouvelles personnes sont concernées')
    // La date prevue devient la date d'effet : la decision prend effet quand le
    // changement a lieu, pas quand on l'approuve.
    expect(d.decision.effective_from).toBe(d.planned)
    expect(d.decision.conditions).toContain('subordonnée à l’approbation')
  })

  it('adresse la décision, et informe le redevable quand ce n’est pas lui', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{ id: string }>(
        `insert into public.change_request (tenant_id, organization_id, use_case_id, title, description, change_types,
                                            changes_model, status, requested_by, expected_approver_user_id)
         values ($1, $2, $3, 'Changement arrêté en réunion', 'Le modèle change, la DSI tranchera.',
                 array['MODEL']::app.change_type[], true, 'DRAFT', $4, $5) returning id`,
        [DEMO.tenantA, DEMO.orgA, DEMO.useCaseProduction, DEMO.officerA, DEMO.reviewerA],
      )
      const changeId = rows[0]!.id
      await c.query('select app.screen_change_request($1)', [changeId])
      const { rows: decision } = await c.query<{ id: string; expected_approver_user_id: string }>(
        `select d.id, d.expected_approver_user_id from public.decision_link l
           join public.governance_decision d on d.id = l.decision_id
          where l.target_type = 'change_request' and l.target_id = $1`,
        [changeId],
      )
      const { rows: accountable } = await c.query<{ accountable_user_id: string | null }>(
        'select accountable_user_id from public.ai_use_case where id = $1',
        [DEMO.useCaseProduction],
      )
      // La RLS ne montre a chacun que SES alertes : on lit celles des autres
      // hors session, dans la meme transaction — qui sera annulee comme les
      // autres.
      await c.query('set local role postgres')
      const { rows: notices } = await c.query<{ recipient_user_id: string }>(
        `select recipient_user_id from public.notification
          where entity_type = 'governance_decision' and entity_id = $1`,
        [decision[0]!.id],
      )
      return {
        approver: decision[0]!.expected_approver_user_id,
        accountable: accountable[0]!.accountable_user_id,
        destinataires: notices.map((n) => n.recipient_user_id),
      }
    })

    // Celui qu'on a designe se prononce.
    expect(r.approver).toBe(DEMO.reviewerA)
    // Et le redevable, qui repond du cas d'usage, en est informe quand meme.
    if (r.accountable && r.accountable !== r.approver) {
      expect(r.destinataires).toContain(r.accountable)
    }
    expect(r.destinataires).toContain(DEMO.reviewerA)
  })

  /*
   * 0117 : `claim_decision_notices` lisait `subject_type` / `subject_id`, qui
   * n'existent pas — la table porte `entity_type` / `entity_id`. PL/pgSQL ne
   * valide pas le corps a la creation, et l'application avale l'erreur : aucun
   * courriel de decision n'est jamais parti, mise en production comprise.
   */
  it('l’avertissement d’une décision se réclame sans lever', async () => {
    const compte = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{ n: string }>(
        `select count(*)::text as n from public.claim_decision_notices(
           (select id from public.governance_decision where organization_id = $1 limit 1))`,
        [DEMO.orgA],
      )
      return Number(rows[0]!.n)
    })

    expect(compte).toBeGreaterThanOrEqual(0)
  })

  it('un changement déjà porté par une décision n’en ouvre pas une seconde', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const { rows: d } = await c.query<{ id: string }>(
        `insert into public.governance_decision (tenant_id, organization_id, use_case_id, decision_type, subject, decision_statement, rationale, status, submitted_by, submitted_at)
         values ($1, $2, $3, 'suspension', 'Suspension du pilote', 'Le pilote est suspendu le temps de la revue.', 'Incident en cours.', 'submitted', $4, now()) returning id`,
        [DEMO.tenantA, DEMO.orgA, DEMO.useCasePilot, DEMO.officerA],
      )
      const { rows: ch } = await c.query<{ id: string }>(
        `insert into public.change_request (tenant_id, organization_id, use_case_id, title, description, change_types, security_relevant, status, requested_by)
         values ($1, $2, $3, 'Suspension du pilote', 'Arrêt du déploiement.', array['DEPLOYMENT']::app.change_type[], true, 'DRAFT', $4) returning id`,
        [DEMO.tenantA, DEMO.orgA, DEMO.useCasePilot, DEMO.officerA],
      )
      await c.query(
        `insert into public.decision_link (tenant_id, decision_id, target_type, target_id) values ($1, $2, 'change_request', $3)`,
        [DEMO.tenantA, d[0]!.id, ch[0]!.id],
      )
      await c.query('select app.screen_change_request($1)', [ch[0]!.id])
      const { rows: n } = await c.query<{ n: string }>(
        `select count(*)::text as n from public.decision_link where target_type = 'change_request' and target_id = $1`, [ch[0]!.id],
      )
      return Number(n[0]!.n)
    })
    expect(r).toBe(1)
  })
})
