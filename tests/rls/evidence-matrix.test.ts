import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Client } from 'pg'
import { asUser, becomeUser, connect, DEMO, expectFailure } from '../helpers/db'

/**
 * Matrice des preuves et Declaration d'Applicabilite ajustee.
 *
 * La migration est generee depuis le fichier de donnees : ces tests verifient
 * que les deux n'ont pas diverge, que la criticite attendue depend bien du
 * profil d'activite, et que la regle d'or — aucune case vide — se voit.
 */

const SOURCE = 'knowledge/frameworks/aigms/evidence-matrix/v1/matrice-preuves.json'
const source = JSON.parse(readFileSync(SOURCE, 'utf8')) as {
  matrix: { typology_count: number; profile_count: number }
  profiles: { code: string }[]
  typologies: {
    code: string
    ordinal: number
    name: string
    technical_description: string
    deliverables: string[]
    references: { framework: string; version: string; reference: string }[]
    criticality: Record<string, string>
  }[]
  unresolved_references: { typology: string; framework: string; reference: string }[]
}

let db: Client

beforeAll(async () => {
  db = await connect()
})

afterAll(async () => {
  await db.end()
})

describe('Matrice des preuves', () => {
  it('la base et le fichier de données ne divergent pas', async () => {
    const { rows } = await db.query<{
      code: string
      ordinal: number
      name: string
      technical_description: string
      deliverables: string[]
    }>(
      'select code, ordinal, name, technical_description, deliverables from public.evidence_typology order by ordinal',
    )

    expect(rows).toHaveLength(source.matrix.typology_count)
    for (const [index, typology] of source.typologies.entries()) {
      const row = rows[index]!
      expect(row.code).toBe(typology.code)
      expect(row.name).toBe(typology.name)
      expect(row.technical_description).toBe(typology.technical_description)
      expect(row.deliverables).toEqual(typology.deliverables)
    }
  })

  it('chaque case de la matrice est chargée', async () => {
    const { rows } = await db.query<{ code: string; profile: string; criticality: string }>(
      `select t.code, p.profile::text, p.criticality::text
         from public.evidence_typology_profile p
         join public.evidence_typology t on t.id = p.typology_id`,
    )

    expect(rows).toHaveLength(source.matrix.typology_count * source.matrix.profile_count)
    for (const typology of source.typologies) {
      for (const profile of source.profiles) {
        const cell = rows.find((r) => r.code === typology.code && r.profile === profile.code)
        expect(cell?.criticality).toBe(typology.criticality[profile.code])
      }
    }
  })

  it('les références qui ne se résolvent pas sont nommées, pas tues', async () => {
    // Une Declaration qui les tairait paraitrait complete en omettant ce
    // qu'elle ne sait pas rapprocher.
    const { rows } = await db.query<{
      typology_code: string
      framework_code: string
      reference: string
    }>('select typology_code, framework_code, reference from app.evidence_matrix_gaps()')

    const actual = rows
      .map((r) => `${r.typology_code}|${r.framework_code}|${r.reference}`)
      .sort()
    const declared = source.unresolved_references
      .map((r) => `${r.typology}|${r.framework}|${r.reference}`)
      .sort()

    expect(actual).toEqual(declared)
  })

  /*
   * Le garde-fou de 0112.
   *
   * « Surveillance continue et dérive » citait A.10.5 et A.10.6. Le chapitre
   * A.10 de l'annexe A s'arrête à A.10.4 : ces références n'existaient pas, la
   * jointure vers les contrôles ne trouvait rien, et se taisait. La typologie
   * la plus critique du profil « utilisateur métier » n'était rattachée à rien
   * pendant un mois, sans que rien ne le dise.
   */
  it('ne cite aucune exigence ISO qui n’existe pas', async () => {
    const { rows } = await db.query<{ typology_code: string; reference: string }>(
      'select typology_code, reference from app.orphan_typology_references()',
    )

    expect(rows.map((r) => `${r.typology_code} ${r.reference}`)).toEqual([])
  })

  it('chaque typologie garde au moins une ancre dans le référentiel chargé', async () => {
    // Une typologie sans ancre ISO ne peut être rapprochée d'aucun contrôle :
    // l'écran l'annoncerait comme attendue sans dire par quoi la servir.
    const { rows } = await db.query<{ code: string; ancres: string }>(
      `select t.code, count(tr.reference)::text as ancres
         from public.evidence_typology t
         left join public.evidence_typology_reference tr
           on tr.typology_id = t.id and tr.framework_code = 'ISO_IEC_42001'
        group by t.code
        having count(tr.reference) = 0`,
    )

    expect(rows.map((r) => r.code)).toEqual([])
  })
})

describe('Typologies attendues d’une organisation', () => {
  it('classe les typologies par criticité pour le profil de l’organisation', async () => {
    const rows = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{ code: string; criticality: string; profile: string }>(
        'select code, criticality::text, profile::text from app.evidence_typologies($1)',
        [DEMO.orgA],
      )
      return rows
    })

    expect(rows).toHaveLength(source.matrix.typology_count)
    expect(rows[0]!.profile).toBe('infrastructure_host')

    // L'ordre est décroissant : la plus exigeante d'abord.
    const rank = ['critical', 'high', 'moderate', 'low', 'negligible']
    const positions = rows.map((r) => rank.indexOf(r.criticality))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('ne présume aucun profil quand il n’est pas renseigné', async () => {
    const rows = await asUser(db, DEMO.platformAdmin, async (c) => {
      // Le role se change en administration ; il se lit en gouvernance.
      await c.query('update public.organization set ai_activity_profile = null where id = $1', [
        DEMO.orgA,
      ])
      await becomeUser(c, DEMO.officerA)
      const { rows } = await c.query<{ criticality: string | null; profile: string | null }>(
        'select criticality::text, profile::text from app.evidence_typologies($1)',
        [DEMO.orgA],
      )
      return rows
    })

    expect(rows).toHaveLength(source.matrix.typology_count)
    for (const row of rows) {
      expect(row.criticality).toBeNull()
      expect(row.profile).toBeNull()
    }
  })

  it('ne rend rien à un tenant étranger', async () => {
    const rows = await asUser(db, DEMO.officerB, async (c) => {
      const { rows } = await c.query('select * from app.evidence_typologies($1)', [DEMO.orgA])
      return rows
    })
    expect(rows).toHaveLength(0)
  })

  it('deux profils n’attendent pas les mêmes preuves', async () => {
    // C'est toute la raison d'etre de la matrice : un hebergeur repond de
    // l'isolation de ses calculs, un utilisateur metier de la derive du systeme
    // qu'il exploite.
    const { rows } = await db.query<{ code: string; host: string; user_profile: string }>(
      `select t.code,
              max(p.criticality::text) filter (where p.profile = 'infrastructure_host') as host,
              max(p.criticality::text) filter (where p.profile = 'business_user') as user_profile
         from public.evidence_typology t
         join public.evidence_typology_profile p on p.typology_id = t.id
        group by t.code`,
    )

    const isolation = rows.find((r) => r.code === 'ISOL')!
    const drift = rows.find((r) => r.code === 'DRIFT')!

    expect(isolation.host).toBe('critical')
    expect(isolation.user_profile).toBe('low')
    expect(drift.host).toBe('negligible')
    expect(drift.user_profile).toBe('critical')
  })
})

describe('Ce qui sert une typologie', () => {
  /*
   * La chaine que 0112 a reparee et que 0114 rend lisible :
   *   typologie -> exigence de l'annexe A -> controles de l'organisation.
   *
   * « Surveillance continue et derive » citait deux references inexistantes :
   * elle n'etait servie par rien, et la carte proposait quand meme d'y deposer
   * une piece. Une preuve sans controle a demontrer ne demontre rien.
   */
  it('nomme les contrôles qui portent la dérive', async () => {
    const rows = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{
        code: string
        control_count: number
        controls: string[]
        refs: string[]
      }>('select code, control_count, controls, refs from app.typology_coverage($1)', [DEMO.orgA])
      return rows
    })

    const drift = rows.find((r) => r.code === 'DRIFT')!
    expect(drift.refs).toContain('A.6.2.6')
    expect(drift.control_count).toBeGreaterThan(0)
    expect(drift.controls.length).toBe(Number(drift.control_count))
  })

  it('ne rattache aucun contrôle par une exigence qui n’existe pas', async () => {
    // A.10.5 et A.10.6 ont disparu : la typologie ne peut plus s'y ancrer.
    const rows = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{ code: string; refs: string[] }>(
        'select code, refs from app.typology_coverage($1)',
        [DEMO.orgA],
      )
      return rows
    })

    const toutes = rows.flatMap((r) => r.refs)
    expect(toutes).not.toContain('A.10.5')
    expect(toutes).not.toContain('A.10.6')
  })
})

describe('Les articles de l’AI Act se rejoignent', () => {
  /*
   * Le catalogue ecrit « AI_ACT » et « Art. 14 (controle humain) » ; la table
   * des exigences ecrit « EU_AI_ACT » et « Art. 14 ». Aucun controle n'a jamais
   * ete rattache a un article du reglement — soixante-dix correspondances pour
   * rien. On normalise a la jointure, sans toucher au libelle du catalogue, qui
   * dit a quel titre le controle repond.
   */
  it('reconnaît le règlement sous ses deux noms', async () => {
    const { rows } = await db.query<{ a: string; b: string }>(
      "select app.normalize_framework_code('AI_ACT') as a, app.normalize_framework_code('EU_AI_ACT') as b",
    )
    expect(rows[0]!.a).toBe('EU_AI_ACT')
    expect(rows[0]!.b).toBe('EU_AI_ACT')
  })

  it('ramène un article à sa référence courte, et laisse l’annexe intacte', async () => {
    const { rows } = await db.query<{ ref: string; attendu: string }>(
      `select v.ref, app.normalize_requirement_reference(v.fw, v.ref) as attendu
         from (values
           ('AI_ACT', 'Art. 14 (contrôle humain)'),
           ('AI_ACT', 'Art. 14 §4 d) (passer outre, inverser)'),
           ('AI_ACT', 'Art. 50 (transparence)'),
           ('ISO_IEC_42001', 'A.6.2.6')
         ) as v(fw, ref)`,
    )
    expect(rows.map((r) => r.attendu)).toEqual(['Art. 14', 'Art. 14', 'Art. 50', 'A.6.2.6'])
  })

  it('rattache les contrôles aux articles chargés', async () => {
    const { rows } = await db.query<{ reference: string; controles: string }>(
      `select r.requirement_reference as reference, count(*)::text as controles
         from public.control_requirement_map m
         join public.requirement r on r.id = m.requirement_id
         join public.framework f on f.id = r.framework_id
        where f.code = 'EU_AI_ACT'
        group by 1 order by 1`,
    )

    // Deux articles sont chargés : le contrôle humain et la transparence.
    expect(rows.map((r) => r.reference)).toEqual(['Art. 14', 'Art. 50'])
    for (const row of rows) expect(Number(row.controles)).toBeGreaterThan(0)
  })
})

describe('Déclaration d’Applicabilité ajustée à la criticité', () => {
  type Row = {
    requirement_reference: string
    expected_criticality: string | null
    evidence_regime: string
    coverage: string
    soa_status: string | null
    gap: string | null
  }

  async function soa(user: string, organization: string) {
    return asUser(db, user, async (c) => {
      const { rows } = await c.query<Row>(
        `select requirement_reference, expected_criticality::text, evidence_regime,
                coverage, soa_status::text, gap
           from app.statement_of_applicability($1)`,
        [organization],
      )
      return rows
    })
  }

  it('déduit le régime de preuve de la criticité attendue', async () => {
    const rows = await soa(DEMO.officerA, DEMO.orgA)

    for (const row of rows) {
      if (row.expected_criticality === 'critical' || row.expected_criticality === 'high') {
        expect(row.evidence_regime).toBe('technical')
      } else if (row.expected_criticality === 'moderate' || row.expected_criticality === 'low') {
        expect(row.evidence_regime).toBe('organisational')
      } else if (row.expected_criticality === 'negligible') {
        expect(row.evidence_regime).toBe('exclusion')
      } else {
        expect(row.evidence_regime).toBe('unspecified')
      }
    }
  })

  it('le régime change avec le profil, sur la même exigence', async () => {
    const asHost = await soa(DEMO.officerA, DEMO.orgA)
    const asIntegrator = await asUser(db, DEMO.platformAdmin, async (c) => {
      await c.query(
        "update public.organization set ai_activity_profile = 'integrator_consultant' where id = $1",
        [DEMO.orgA],
      )
      await becomeUser(c, DEMO.officerA)
      const { rows } = await c.query<Row>(
        `select requirement_reference, expected_criticality::text, evidence_regime,
                coverage, soa_status::text, gap
           from app.statement_of_applicability($1)`,
        [DEMO.orgA],
      )
      return rows
    })

    // A.6.2.7 « Documentation technique » porte l'explicabilite : negligeable
    // pour un hebergeur qui n'entraine ni ne concoit rien, elevee pour un
    // integrateur qui deploie des systemes chez ses clients. Meme exigence,
    // meme base, deux regimes. (Ancre corrigee par 0112 : la matrice citait
    // A.10.2, qui traite de la repartition des responsabilites.)
    const host = asHost.find((r) => r.requirement_reference === 'A.6.2.7')!
    const integrator = asIntegrator.find((r) => r.requirement_reference === 'A.6.2.7')!

    expect(host.evidence_regime).toBe('exclusion')
    expect(integrator.evidence_regime).toBe('technical')

    // Et symetriquement sur l'isolation, qui pese sur l'hebergeur seul :
    // A.4.5 « Ressources systeme et de calcul ».
    const hostIsolation = asHost.find((r) => r.requirement_reference === 'A.4.5')!
    const integratorIsolation = asIntegrator.find((r) => r.requirement_reference === 'A.4.5')!

    expect(hostIsolation.evidence_regime).toBe('technical')
    expect(integratorIsolation.evidence_regime).toBe('organisational')
  })

  it('signale toute exigence laissée sans décision', async () => {
    const rows = await soa(DEMO.officerA, DEMO.orgA)
    const undecided = rows.filter((r) => r.soa_status === null)

    expect(undecided.length).toBeGreaterThan(0)
    for (const row of undecided) expect(row.gap).toBe('undecided')
  })

  it('conteste une exclusion là où la matrice attend une preuve', async () => {
    const rows = await soa(DEMO.officerA, DEMO.orgA)
    const contested = rows.filter((r) => r.gap === 'exclusion_contested')

    expect(contested.length).toBeGreaterThan(0)
    for (const row of contested) {
      expect(row.soa_status).toBe('excluded')
      expect(['technical', 'organisational']).toContain(row.evidence_regime)
    }
  })

  it('ne conteste pas une exclusion que la matrice ne contredit pas', async () => {
    const rows = await soa(DEMO.officerA, DEMO.orgA)
    const accepted = rows.filter(
      (r) => r.soa_status === 'excluded' && r.evidence_regime === 'unspecified',
    )

    expect(accepted.length).toBeGreaterThan(0)
    for (const row of accepted) expect(row.gap).toBeNull()
  })

  it('rend un état d’avancement cohérent', async () => {
    const readiness = await asUser(db, DEMO.officerA, async (c) => {
      const { rows } = await c.query<{ r: Record<string, unknown> }>(
        'select app.soa_readiness($1) as r',
        [DEMO.orgA],
      )
      return rows[0]!.r as {
        available: boolean
        requirements: number
        decided: number
        selected: number
        excluded: number
        undecided: number
      }
    })

    expect(readiness.available).toBe(true)
    expect(readiness.decided).toBe(readiness.selected + readiness.excluded)
    expect(readiness.undecided).toBe(readiness.requirements - readiness.decided)
  })

  it('reste soumise à l’habilitation', async () => {
    const rows = await soa(DEMO.officerB, DEMO.orgA)
    expect(rows).toHaveLength(0)
  })
})

describe('Décision d’applicabilité', () => {
  async function requirementId(reference: string): Promise<string> {
    const { rows } = await db.query<{ id: string }>(
      `select r.id from public.requirement r
         join public.framework f on f.id = r.framework_id
        where f.code = 'ISO_IEC_42001' and r.requirement_reference = $1`,
      [reference],
    )
    return rows[0]!.id
  }

  const insert = (requirement: string, status: string, justification: string) => ({
    sql: `insert into public.soa_decision
            (tenant_id, organization_id, requirement_id, status, justification, decided_by)
          values ($1, $2, $3, $4, $5, $6)`,
    params: [DEMO.tenantA, DEMO.orgA, requirement, status, justification, DEMO.officerA],
  })

  it('refuse une décision sans justification', async () => {
    // La regle d'or ne tient pas dans un ecran : elle tient dans la contrainte.
    const requirement = await requirementId('A.3.2')
    await asUser(db, DEMO.officerA, async (c) => {
      const query = insert(requirement, 'excluded', '   ')
      const failure = await expectFailure(c, query.sql, query.params)
      expect(failure.code).toBe('23514')
    })
  })

  it('n’autorise pas à décider au nom d’un autre', async () => {
    const requirement = await requirementId('A.3.3')
    await asUser(db, DEMO.officerA, async (c) => {
      const query = insert(requirement, 'selected', 'Justification suffisamment développée pour être lue.')
      query.params[5] = DEMO.riskOwnerA
      const failure = await expectFailure(c, query.sql, query.params)
      expect(failure.message).toMatch(/en son propre nom/)
    })
  })

  it('journalise la décision', async () => {
    const requirement = await requirementId('A.4.3')
    await asUser(db, DEMO.officerA, async (c) => {
      const query = insert(
        requirement,
        'selected',
        'Les ressources en données sont inventoriées et rattachées à un responsable identifié.',
      )
      await c.query(query.sql, query.params)

      const { rows } = await c.query<{ n: string }>(
        `select count(*)::text as n from public.audit_log
          where entity_type = 'soa_decision' and entity_ref = 'A.4.3'`,
      )
      expect(Number(rows[0]!.n)).toBe(1)
    })
  })

  it('n’expose aucune décision à un tenant étranger', async () => {
    const visible = await asUser(db, DEMO.officerB, async (c) => {
      const { rows } = await c.query<{ n: string }>(
        'select count(*)::text as n from public.soa_decision',
      )
      return Number(rows[0]!.n)
    })
    expect(visible).toBe(0)
  })
})
