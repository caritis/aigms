import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { IMPACT_SCALE, LIKELIHOOD_SCALE, RISK_CATEGORIES, rateRiskLevel } from '@/lib/domain/risk'

/**
 * La cotation est calculee par la base — `app.rate_risk_level`, migration
 * 0008. L'ecran la recopie pour la MONTRER pendant la saisie : il ne l'ecrit
 * pas. Deux implantations de la meme regle divergent tot ou tard ; ces tests
 * relisent les seuils dans la migration elle-meme et les confrontent aux
 * vingt-cinq combinaisons.
 */

const MIGRATION = 'supabase/migrations/20260907130200_0008_risk_impact.sql'

/** Rejoue la regle SQL a partir des seuils lus dans la migration. */
function seuilsDeLaMigration(): { produit: number; niveau: string }[] {
  const sql = readFileSync(MIGRATION, 'utf-8')
  const bloc = sql.slice(sql.indexOf('function app.rate_risk_level'))
  const seuils = [...bloc.matchAll(/p_likelihood \* p_impact >= (\d+)\s+then\s+'(\w+)'/g)].map((m) => ({
    produit: Number(m[1]),
    niveau: m[2]!,
  }))
  expect(seuils.length).toBeGreaterThanOrEqual(3)
  return seuils
}

describe('Cotation d’un risque', () => {
  it('l’écran cote comme la base, sur les vingt-cinq combinaisons', () => {
    const seuils = seuilsDeLaMigration()
    const selonSql = (l: number, i: number) =>
      seuils.find((s) => l * i >= s.produit)?.niveau ?? 'low'

    for (let l = 1; l <= 5; l += 1) {
      for (let i = 1; i <= 5; i += 1) {
        expect(`${l}×${i} → ${rateRiskLevel(l, i)}`).toBe(`${l}×${i} → ${selonSql(l, i)}`)
      }
    }
  })

  it('les deux échelles couvrent les cinq crans, avec un libellé et une définition', () => {
    for (const echelle of [LIKELIHOOD_SCALE, IMPACT_SCALE]) {
      expect(echelle.map((c) => c.value)).toEqual([1, 2, 3, 4, 5])
      expect(echelle.every((c) => c.label.length > 2 && c.hint.length > 10)).toBe(true)
    }
  })

  it('chaque catégorie de risque porte une définition', () => {
    // Une categorie sans definition se choisit au hasard — et un classement au
    // hasard fausse le rapprochement avec les controles, qui s'appuie dessus.
    expect(RISK_CATEGORIES.every((c) => c.description.length > 30)).toBe(true)
  })

  it('les valeurs de catégorie sont celles que la validation serveur accepte', () => {
    const action = readFileSync('src/lib/actions/governance.ts', 'utf-8')
    const bloc = action.slice(action.indexOf('const RISK_CATEGORIES'))
    const acceptees = [...bloc.slice(0, bloc.indexOf(']')).matchAll(/'([a-z_]+)'/g)].map((m) => m[1])
    expect(RISK_CATEGORIES.map((c) => c.value).sort()).toEqual([...acceptees].sort())
  })
})
