import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, becomeUser, connect, DEMO, expectFailure } from '../helpers/db'

/**
 * 0109 : deux portes pour retirer un risque, et elles ne servent pas la meme
 * chose. On CLOT ce qui a vecu — rien ne disparait, le motif est obligatoire.
 * On EFFACE l'erratum — et seulement ce qui n'a rien laisse derriere lui.
 */

let db: Client
beforeAll(async () => {
  db = await connect()
})
afterAll(async () => {
  await db.end()
})

/** Un risque neuf, encore « identifié », sans rien qui y pende. */
async function risqueNeuf(c: Client): Promise<string> {
  const { rows } = await c.query<{ id: string }>(
    `insert into public.risk (tenant_id, organization_id, use_case_id, title, scenario, category,
                              owner_user_id, inherent_likelihood, inherent_impact)
     values ($1, $2, $3, 'Risque à retirer', 'Scénario de test des deux portes.', 'operational', $4, 2, 3)
     returning id`,
    [DEMO.tenantA, DEMO.orgA, DEMO.useCasePilot, DEMO.riskOwnerA],
  )
  return rows[0]!.id
}

describe('Clore un risque', () => {
  it('exige un motif, et l’enregistre au nom de qui le clôt', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)

      // Sans motif : la contrainte refuse.
      const muet = await expectFailure(
        c,
        `update public.risk set status = 'closed', closed_by = $2, closed_at = now() where id = $1`,
        [id, DEMO.officerA],
      )
      // Au nom d'un autre : le garde-fou refuse.
      const autrui = await expectFailure(
        c,
        `update public.risk set status = 'closed', closed_by = $2, closure_reason = 'Périmètre abandonné.' where id = $1`,
        [id, DEMO.riskOwnerA],
      )

      await c.query(
        `update public.risk set status = 'closed', closed_by = $2,
                closure_reason = 'Le cas d''usage a changé de périmètre : ce risque ne porte plus.'
          where id = $1`,
        [id, DEMO.officerA],
      )
      const { rows } = await c.query<{ status: string; closed_by: string; closed_at: string | null }>(
        'select status, closed_by, closed_at from public.risk where id = $1',
        [id],
      )
      return { muet: muet.message, autrui: autrui.message, close: rows[0]! }
    })

    expect(r.muet).toMatch(/risk_closure_requires_reason/)
    expect(r.autrui).toMatch(/en son propre nom/)
    expect(r.close.status).toBe('closed')
    expect(r.close.closed_by).toBe(DEMO.officerA)
    // La date se pose seule : on ne la saisit pas.
    expect(r.close.closed_at).not.toBeNull()
  })

  it('revient au responsable du risque aussi : il en répond, il peut le dire éteint', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)
      await becomeUser(c, DEMO.riskOwnerA)
      await c.query(
        `update public.risk set status = 'closed', closed_by = $2,
                closure_reason = 'Le fournisseur a été remplacé : le scénario ne peut plus survenir.'
          where id = $1`,
        [id, DEMO.riskOwnerA],
      )
      const { rows } = await c.query<{ status: string }>('select status from public.risk where id = $1', [id])
      return rows[0]!.status
    })

    expect(r).toBe('closed')
  })

  it('rouvrir efface la clôture : un motif qui ne vaut plus ne se garde pas', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)
      await c.query(
        `update public.risk set status = 'closed', closed_by = $2, closure_reason = 'Éteint.' where id = $1`,
        [id, DEMO.officerA],
      )
      await c.query(`update public.risk set status = 'identified' where id = $1`, [id])
      const { rows } = await c.query<{
        closed_at: string | null
        closed_by: string | null
        closure_reason: string | null
      }>('select closed_at, closed_by, closure_reason from public.risk where id = $1', [id])
      return rows[0]!
    })

    expect(r).toEqual({ closed_at: null, closed_by: null, closure_reason: null })
  })
})

describe('Effacer un risque', () => {
  it('l’officer efface une ligne qui n’a rien laissé derrière elle', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)
      await c.query('delete from public.risk where id = $1', [id])
      const { rows } = await c.query<{ n: string }>(
        'select count(*)::text as n from public.risk where id = $1',
        [id],
      )
      // L'instantané d'avant reste au journal : traçabilité, pas prévention.
      const { rows: trace } = await c.query<{ n: string }>(
        `select count(*)::text as n from public.audit_log
          where entity_type = 'risk' and entity_id = $1 and action = 'delete'`,
        [id],
      )
      return { reste: Number(rows[0]!.n), trace: Number(trace[0]!.n) }
    })

    expect(r.reste).toBe(0)
    expect(r.trace).toBe(1)
  })

  it('le responsable du risque ne l’efface pas : il en répond', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)
      await becomeUser(c, DEMO.riskOwnerA)
      const refus = await expectFailure(c, 'delete from public.risk where id = $1', [id])
      await becomeUser(c, DEMO.officerA)
      const { rows } = await c.query<{ n: string }>(
        'select count(*)::text as n from public.risk where id = $1',
        [id],
      )
      return { refus: refus.message, reste: Number(rows[0]!.n) }
    })

    expect(r.refus).toMatch(/AI Governance Officer|administrateur client/)
    expect(r.reste).toBe(1)
  })

  it('un risque traité ne s’efface pas : il se clôt', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)
      await c.query(
        `insert into public.risk_treatment (tenant_id, risk_id, strategy, description, owner_user_id)
         values ($1, $2, 'transfer', 'Clause contractuelle avec le fournisseur.', $3)`,
        [DEMO.tenantA, id, DEMO.systemOwnerA],
      )
      const refus = await expectFailure(c, 'delete from public.risk where id = $1', [id])
      return refus.message
    })

    expect(r).toMatch(/il se clôt, il ne s’efface pas/)
    expect(r).toMatch(/traitement/)
  })

  it('un risque accepté ne s’efface pas', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)
      await becomeUser(c, DEMO.riskOwnerA)
      await c.query(
        `update public.risk set status = 'accepted', accepted_by = $2, accepted_at = now(),
                acceptance_rationale = 'Tenable en l''état, revue dans six mois.',
                acceptance_review_at = current_date + 180
          where id = $1`,
        [id, DEMO.riskOwnerA],
      )
      await becomeUser(c, DEMO.officerA)
      return (await expectFailure(c, 'delete from public.risk where id = $1', [id])).message
    })

    expect(r).toMatch(/Il a été accepté|statut/)
  })

  it('un risque désigné par une décision ne s’efface pas', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueNeuf(c)
      const { rows: d } = await c.query<{ id: string }>(
        `insert into public.governance_decision (tenant_id, organization_id, use_case_id, decision_type,
                                                 subject, decision_statement, status)
         values ($1, $2, $3, 'risk_acceptance', 'Acceptation de test', 'Le risque est assumé.', 'draft')
         returning id`,
        [DEMO.tenantA, DEMO.orgA, DEMO.useCasePilot],
      )
      await c.query(
        `insert into public.decision_link (tenant_id, decision_id, target_type, target_id)
         values ($1, $2, 'risk', $3)`,
        [DEMO.tenantA, d[0]!.id, id],
      )
      return (await expectFailure(c, 'delete from public.risk where id = $1', [id])).message
    })

    expect(r).toMatch(/décision/)
  })
})
