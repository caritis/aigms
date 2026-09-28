import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { translateToolingCsv } from '@/lib/catalog/tooling-csv'

/**
 * Le modele livre est l'etat REEL de la typologie. Il doit donc se relire
 * sans anomalie : un aller-retour tableur qui perd une ligne rendrait
 * l'entretien du referentiel plus risque que la migration qu'il remplace.
 */
describe('Typologie d’outillage en CSV', () => {
  it('le modèle livré se relit sans anomalie', () => {
    const raw = readFileSync('public/modeles/referentiel-outillages.csv', 'utf-8')
    const lu = translateToolingCsv(raw)

    expect(lu.ok).toBe(true)
    if (!lu.ok) return
    expect(lu.rows.length).toBe(67)
    expect(lu.coeur).toBe(36)
    expect(lu.support).toBe(31)
  })

  it('les listes traversent la cellule sans se perdre', () => {
    const raw = readFileSync('public/modeles/referentiel-outillages.csv', 'utf-8')
    const lu = translateToolingCsv(raw)
    if (!lu.ok) throw new Error('modèle illisible')

    const passerelle = lu.rows.find((r) => r.code === 'CTRL-AI-004')
    expect(passerelle?.tool_examples).toContain('Kong AI Gateway')
    // Les rattachements aux controles-types voyagent aussi : sans eux, une
    // famille reimportee perdrait ce qu'elle instrumente.
    expect(passerelle?.control_codes).toContain('AIGMS-SEC-008')
  })

  it('les six familles ajoutées pour les textes sont au cœur', () => {
    const raw = readFileSync('public/modeles/referentiel-outillages.csv', 'utf-8')
    const lu = translateToolingCsv(raw)
    if (!lu.ok) throw new Error('modèle illisible')

    for (const code of ['CTRL-AI-011', 'CTRL-AI-012', 'CTRL-AI-013', 'CTRL-AI-014', 'CTRL-AI-015', 'CTRL-AI-016']) {
      const f = lu.rows.find((r) => r.code === code)
      expect(`${code} ${f?.scope}`).toBe(`${code} ai_core`)
    }
  })

  it('un rang inconnu, un code en double ou un nom absent sont refusés', () => {
    const entete = 'code;scope;tool_service'
    const rang = translateToolingCsv(`${entete}\nCTRL-X;autre;Un outil`)
    const doublon = translateToolingCsv(`${entete}\nCTRL-X;ai_core;Un outil\nCTRL-X;ai_core;Un autre`)
    const sansNom = translateToolingCsv(`${entete}\nCTRL-X;ai_core;`)

    expect(rang.ok).toBe(false)
    expect(doublon.ok).toBe(false)
    expect(sansNom.ok).toBe(false)
    if (!rang.ok) expect(rang.issues[0]!.message).toMatch(/rang inconnu/)
    if (!doublon.ok) expect(doublon.issues[0]!.message).toMatch(/double/)
  })
})
