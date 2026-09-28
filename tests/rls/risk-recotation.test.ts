import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, becomeUser, connect, DEMO } from '../helpers/db'

/**
 * 0108 : une acceptation vaut pour le niveau auquel elle a ete donnee.
 *
 * `guard_risk_acceptance` (0058) ne se declenche que sur un changement de
 * statut : recoter un risque accepte ne le touchait pas, et l'on pouvait
 * faire assumer « critique » a qui avait assume « modere ». La passerelle
 * RISKS_TREATED voyait toujours un risque accepte, et laissait passer.
 */

let db: Client
beforeAll(async () => {
  db = await connect()
})
afterAll(async () => {
  await db.end()
})

/** Un risque modéré, accepté en son nom par son responsable. */
async function risqueAccepte(c: Client): Promise<string> {
  const { rows } = await c.query<{ id: string }>(
    `insert into public.risk (tenant_id, organization_id, use_case_id, title, scenario, category,
                              owner_user_id, inherent_likelihood, inherent_impact)
     values ($1, $2, $3, 'Risque de recotation', 'Scénario de test de recotation.', 'operational', $4, 2, 3)
     returning id`,
    [DEMO.tenantA, DEMO.orgA, DEMO.useCasePilot, DEMO.riskOwnerA],
  )
  const id = rows[0]!.id
  await becomeUser(c, DEMO.riskOwnerA)
  await c.query(
    `update public.risk set status = 'accepted', accepted_by = $2, accepted_at = now(),
            acceptance_rationale = 'Tenable : le contrôle compensatoire couvre le cas.',
            acceptance_review_at = current_date + 180
      where id = $1`,
    [id, DEMO.riskOwnerA],
  )
  return id
}

describe('Recoter un risque accepté', () => {
  it('à la hausse, l’acceptation tombe et son auteur est averti', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueAccepte(c)
      const { rows: avant } = await c.query<{ status: string; inherent_level: string }>(
        'select status, inherent_level::text from public.risk where id = $1',
        [id],
      )

      await becomeUser(c, DEMO.officerA)
      // 5 × 4 = 20 : critique.
      await c.query(
        'update public.risk set inherent_likelihood = 5, inherent_impact = 4 where id = $1',
        [id],
      )
      const { rows: apres } = await c.query<{
        status: string
        inherent_level: string
        accepted_by: string | null
        acceptance_rationale: string | null
      }>(
        'select status, inherent_level::text, accepted_by, acceptance_rationale from public.risk where id = $1',
        [id],
      )

      await becomeUser(c, DEMO.riskOwnerA)
      const { rows: alerte } = await c.query<{ kind: string }>(
        'select kind from public.my_notifications(50) where entity_id = $1',
        [id],
      )
      return { avant: avant[0]!, apres: apres[0]!, alerte: alerte.map((a) => a.kind) }
    })

    expect(r.avant).toEqual({ status: 'accepted', inherent_level: 'moderate' })
    expect(r.apres.inherent_level).toBe('critical')
    // L'acceptation ne couvre plus : elle est retirée, pas conservée en l'état.
    expect(r.apres.status).toBe('identified')
    expect(r.apres.accepted_by).toBeNull()
    expect(r.apres.acceptance_rationale).toBeNull()
    expect(r.alerte).toContain('risk_acceptance_void')
  })

  it('à la baisse, elle tient : qui a assumé plus assume moins', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueAccepte(c)
      await becomeUser(c, DEMO.officerA)
      // 1 × 2 = 2 : faible.
      await c.query(
        'update public.risk set inherent_likelihood = 1, inherent_impact = 2 where id = $1',
        [id],
      )
      const { rows } = await c.query<{ status: string; inherent_level: string; accepted_by: string | null }>(
        'select status, inherent_level::text, accepted_by from public.risk where id = $1',
        [id],
      )
      return rows[0]!
    })

    expect(r.inherent_level).toBe('low')
    expect(r.status).toBe('accepted')
    expect(r.accepted_by).toBe(DEMO.riskOwnerA)
  })

  it('une correction qui ne touche pas la cotation ne défait rien', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueAccepte(c)
      await becomeUser(c, DEMO.officerA)
      await c.query(
        `update public.risk set scenario = 'Scénario précisé après relecture.', category = 'security' where id = $1`,
        [id],
      )
      const { rows } = await c.query<{ status: string; category: string }>(
        'select status, category::text from public.risk where id = $1',
        [id],
      )
      return rows[0]!
    })

    expect(r).toEqual({ status: 'accepted', category: 'security' })
  })

  it('la recotation est portée au journal', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const id = await risqueAccepte(c)
      await becomeUser(c, DEMO.officerA)
      await c.query(
        'update public.risk set inherent_likelihood = 5, inherent_impact = 4 where id = $1',
        [id],
      )
      const { rows } = await c.query<{ n: string }>(
        `select count(*)::text as n from public.audit_log
          where entity_type = 'risk' and entity_id = $1 and action = 'update'`,
        [id],
      )
      return Number(rows[0]!.n)
    })

    expect(r).toBeGreaterThan(0)
  })
})
