import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, connect, DEMO, expectFailure } from '../helpers/db'

/**
 * Organisations gerees et organisation courante.
 *
 * Deux notions a ne pas confondre : ce qu'on a le DROIT de lire, et ce qu'on
 * GOUVERNE. La seconde vient d'une attribution de role portee par
 * l'administration ; la premiere s'arrete a la frontiere du tenant.
 *
 * Le choix de l'organisation courante est une preference d'affichage : il
 * n'ouvre aucun droit, mais il est contraint — pointer hors du perimetre gere
 * produirait des ecrans vides et inexplicables.
 */

const PLATFORM_ADMIN = '66666666-6666-4666-8666-666666666666'

let db: Client

beforeAll(async () => {
  db = await connect()
})

afterAll(async () => {
  await db.end()
})

async function managed(user: string) {
  return asUser(db, user, async (c) => {
    const { rows } = await c.query<{ id: string; name: string; role: string | null }>(
      'select id, name, role::text from app.managed_organizations()',
    )
    return rows
  })
}

describe('Organisations gérées', () => {
  it('ne retient que celles où un rôle a été attribué', async () => {
    const rows = await managed(DEMO.officerA)

    // Le portefeuille d'un cabinet : le meme officer sur deux organisations du
    // meme tenant. Ce qui compte n'est pas leur nombre mais leur origine — une
    // attribution de role, et rien d'autre.
    expect(rows.map((r) => r.id).sort()).toEqual([DEMO.orgA, DEMO.orgBtp].sort())
    expect(rows.every((r) => r.role === 'governance_officer')).toBe(true)
  })

  it('porte le rôle attribué, qui peut différer du rôle de tenant', async () => {
    const rows = await managed(DEMO.auditorA)
    expect(rows[0]!.role).toBe('auditor')
  })

  it('ne franchit pas la frontière du tenant', async () => {
    const rows = await managed(DEMO.officerB)
    expect(rows.some((r) => r.id === DEMO.orgA)).toBe(false)
  })

  it('ouvre à l’administration celles de son tenant', async () => {
    // Elle les cree : elle ne peut pas attribuer un role sur ce qu'elle ne
    // verrait pas.
    const rows = await managed(PLATFORM_ADMIN)
    expect(rows.some((r) => r.id === DEMO.orgA)).toBe(true)
  })
})

describe('Organisation courante', () => {
  it('vaut la seule gérée quand il n’y a rien à choisir', async () => {
    /*
      Le jeu de demonstration porte desormais un portefeuille : le meme officer
      sur deux organisations. Pour eprouver la branche « une seule », on lui
      retire son second mandat et sa preference, le temps d'une transaction
      annulee — plutot que de reecrire le decor pour arranger un test.
    */
    await db.query('begin')
    try {
      await db.query('delete from public.role_assignment where user_id = $1 and organization_id = $2', [
        DEMO.officerA,
        DEMO.orgBtp,
      ])
      await db.query('update public.user_profile set current_organization_id = null where id = $1', [
        DEMO.officerA,
      ])
      await db.query("select set_config('role', 'authenticated', true)")
      await db.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: DEMO.officerA, role: 'authenticated' }),
      ])
      const { rows } = await db.query<{ id: string | null }>('select app.current_organization() as id')
      expect(rows[0]!.id).toBe(DEMO.orgA)
    } finally {
      await db.query('rollback')
    }
  })

  it('reste vide tant que le portefeuille en compte plusieurs', async () => {
    // Deux organisations gerees, aucune preference : deviner ouvrirait un
    // ecran qui n'est pas celui qu'on regardait. La personne choisit.
    const current = await asUser(db, DEMO.officerA, async (c) => {
      await c.query('update public.user_profile set current_organization_id = null where id = $1', [
        DEMO.officerA,
      ])
      const { rows } = await c.query<{ id: string | null }>('select app.current_organization() as id')
      return rows[0]!.id
    })

    expect(current).toBeNull()
  })

  it('refuse un choix hors du périmètre géré', async () => {
    await asUser(db, DEMO.officerA, async (c) => {
      const failure = await expectFailure(
        c,
        'update public.user_profile set current_organization_id = $1 where id = $2',
        [DEMO.orgB, DEMO.officerA],
      )
      expect(failure.message).toMatch(/ne fait pas partie de celles que vous gérez/)
    })
  })

  it('accepte un choix dans le périmètre, et le rend', async () => {
    const current = await asUser(db, DEMO.officerA, async (c) => {
      await c.query('update public.user_profile set current_organization_id = $1 where id = $2', [
        DEMO.orgA,
        DEMO.officerA,
      ])
      const { rows } = await c.query<{ id: string | null }>(
        'select app.current_organization() as id',
      )
      return rows[0]!.id
    })

    expect(current).toBe(DEMO.orgA)
  })

  it('n’ouvre aucun droit', async () => {
    // Une preference d'affichage ne doit rien changer a ce que la RLS accorde :
    // c'est tout l'interet de la garder hors des predicats d'autorisation.
    const visible = await asUser(db, DEMO.officerB, async (c) => {
      const { rows } = await c.query<{ n: string }>(
        'select count(*)::text as n from public.organization where id = $1',
        [DEMO.orgA],
      )
      return Number(rows[0]!.n)
    })

    expect(visible).toBe(0)
  })
})
