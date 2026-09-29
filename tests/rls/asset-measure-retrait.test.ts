import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, connect, DEMO } from '../helpers/db'

/**
 * Poser une mesure sur un actif sans pouvoir l'en retirer fait mentir la
 * couverture : une mesure posee sur le mauvais actif compte comme juste, et
 * rien ne permet de revenir. Le retrait existe, et il ne touche PAS a
 * l'applicabilite du controle au cas d'usage — ce sont deux actes distincts.
 */

let db: Client
beforeAll(async () => {
  db = await connect()
})
afterAll(async () => {
  await db.end()
})

describe('Retirer une mesure d’un actif', () => {
  it('le rattachement part, l’applicabilité reste', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const { rows: control } = await c.query<{ id: string }>(
        `select id from public.control where organization_id = $1 and status <> 'retired' limit 1`,
        [DEMO.orgA],
      )
      const { rows: asset } = await c.query<{ id: string; tenant_id: string }>(
        'select id, tenant_id from public.ai_asset where organization_id = $1 limit 1',
        [DEMO.orgA],
      )

      await c.query(
        `insert into public.control_applicability (tenant_id, control_id, use_case_id, status)
         values ($1, $2, $3, 'applicable')
         on conflict (control_id, use_case_id) do update set status = 'applicable'`,
        [DEMO.tenantA, control[0]!.id, DEMO.useCasePilot],
      )
      await c.query(
        `insert into public.asset_control (tenant_id, asset_id, control_id, status)
         values ($1, $2, $3, 'planned')
         on conflict (asset_id, control_id) do update set status = 'planned'`,
        [asset[0]!.tenant_id, asset[0]!.id, control[0]!.id],
      )

      await c.query('delete from public.asset_control where asset_id = $1 and control_id = $2', [
        asset[0]!.id,
        control[0]!.id,
      ])

      const { rows: reste } = await c.query<{ n: string }>(
        'select count(*)::text as n from public.asset_control where asset_id = $1 and control_id = $2',
        [asset[0]!.id, control[0]!.id],
      )
      const { rows: applicabilite } = await c.query<{ status: string }>(
        'select status::text from public.control_applicability where control_id = $1 and use_case_id = $2',
        [control[0]!.id, DEMO.useCasePilot],
      )
      return { reste: Number(reste[0]!.n), applicabilite: applicabilite[0]?.status }
    })

    expect(r.reste).toBe(0)
    // Retirer une mesure d'un actif n'est pas la declarer non applicable.
    expect(r.applicabilite).toBe('applicable')
  })
})
