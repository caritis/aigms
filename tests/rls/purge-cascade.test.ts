import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, connect, DEMO } from '../helpers/db'

/**
 * Ce sur quoi `scripts/purger-organisation.mjs` repose.
 *
 * Le script efface une organisation de demonstration table par table, en
 * commencant par les cas d'usage. Cet ordre n'est pas cosmetique :
 * `guard_risk_delete` (0109) REFUSE d'effacer un risque qui a produit des
 * effets, et ne laisse passer que la cascade — quand le cas d'usage qui le
 * portait vient de disparaitre. Si cette echappee tombait, la purge
 * echouerait au premier risque traite, et le script s'arreterait a moitie.
 */

let db: Client
beforeAll(async () => {
  db = await connect()
})
afterAll(async () => {
  await db.end()
})

describe('Purge d’une organisation de démonstration', () => {
  it('supprimer le cas d’usage emporte un risque que le garde-fou refuserait seul', async () => {
    const r = await asUser(db, DEMO.officerA, async (c) => {
      const { rows: uc } = await c.query<{ id: string }>(
        `insert into public.ai_use_case (tenant_id, organization_id, name, purpose, status)
         values ($1, $2, 'Cas de purge', 'Vérifier la cascade de la purge.', 'DRAFT') returning id`,
        [DEMO.tenantA, DEMO.orgA],
      )
      const { rows: risk } = await c.query<{ id: string }>(
        `insert into public.risk (tenant_id, organization_id, use_case_id, title, scenario, category,
                                  owner_user_id, inherent_likelihood, inherent_impact)
         values ($1, $2, $3, 'Risque de purge', 'Scénario de vérification de la purge.',
                 'operational', $4, 4, 4) returning id`,
        [DEMO.tenantA, DEMO.orgA, uc[0]!.id, DEMO.riskOwnerA],
      )
      // Un traitement : le risque « a produit des effets ».
      await c.query(
        `insert into public.risk_treatment (tenant_id, risk_id, strategy, description, owner_user_id)
         values ($1, $2, 'transfer', 'Clause contractuelle.', $3)`,
        [DEMO.tenantA, risk[0]!.id, DEMO.systemOwnerA],
      )

      // Seul, il ne s'efface pas.
      let direct = 'acceptée'
      await c.query('savepoint essai')
      try {
        await c.query('delete from public.risk where id = $1', [risk[0]!.id])
      } catch {
        direct = 'refusée'
      }
      await c.query('rollback to savepoint essai')

      // Par le cas d'usage, la cascade passe.
      await c.query('delete from public.ai_use_case where id = $1', [uc[0]!.id])
      const { rows: reste } = await c.query<{ n: string }>(
        'select count(*)::text as n from public.risk where id = $1',
        [risk[0]!.id],
      )
      return { direct, reste: Number(reste[0]!.n) }
    })

    expect(r.direct).toBe('refusée')
    expect(r.reste).toBe(0)
  })

  it('l’organisation, elle, ne se supprime pas — le garde-fou parle', async () => {
    /*
      A verifier hors RLS, et c'est tout l'interet du test. Pour un role
      ordinaire, la politique d'ecriture ne RETIENT pas la suppression : elle
      la FILTRE. La requete porte sur zero ligne et rend « succes » sans que
      rien ne soit supprime ni refuse. Le garde-fou ne se prononce que la ou
      la ligne est atteinte.

      C'est pourquoi le script de purge ne conclut jamais d'un « pas
      d'erreur » : il RECOMPTE apres coup.
    */
    await db.query('begin')
    let message: string
    try {
      await db.query('delete from public.organization where id = $1', [DEMO.orgA])
      message = 'acceptée'
    } catch (error) {
      message = (error as Error).message
    } finally {
      await db.query('rollback')
    }

    // C'est la raison d'être du script : on vide, on ne supprime pas.
    expect(message).toMatch(/ne se supprime pas|s'archive|s’archive/)
  })

  it('le journal d’audit ne dépend d’aucune organisation : il survit à la purge', async () => {
    const { rows } = await db.query<{ n: string }>(
      `select count(*)::text as n from pg_constraint
        where contype = 'f' and conrelid = 'public.audit_log'::regclass
          and confrelid = 'public.organization'::regclass`,
    )
    expect(Number(rows[0]!.n)).toBe(0)
  })
})
