import { describe, expect, it } from 'vitest'
import {
  blockingGateChecks,
  GATE_CHECK_SATISFIED_BY,
  MILESTONE_OF_DECISION,
} from '@/lib/domain/transitions'

/**
 * La porte ne demande pas la clef qu'on vient lui apporter.
 *
 * Soumettre une autorisation d'usage depuis « Revue » etait refuse au motif
 * qu'aucune autorisation d'usage n'etait approuvee : le gate du jalon APPROUVE
 * exige exactement la decision qu'on essayait de soumettre. Trois des cinq
 * jalons engageants etaient dans ce cas, et la demonstration s'arretait la.
 */
type Check = { code: string; label: string; satisfied: boolean; severity?: 'blocking' | 'warning' }

const bloquante = (c: Check) => (c.severity ?? 'blocking') === 'blocking'

describe('les préconditions qui retiennent une décision', () => {
  it('écarte celle que la décision apporte elle-même', () => {
    const checks: Check[] = [
      { code: 'AUTHORIZATION_DECISION', label: 'Décision d’autorisation approuvée', satisfied: false },
    ]
    expect(blockingGateChecks('use_case_authorization', checks, bloquante)).toEqual([])
  })

  it('retient tout ce que la décision n’apporte pas', () => {
    const checks: Check[] = [
      { code: 'AUTHORIZATION_DECISION', label: 'Décision d’autorisation approuvée', satisfied: false },
      { code: 'RISKS_TREATED', label: 'Aucun risque élevé sans traitement', satisfied: false },
    ]
    expect(blockingGateChecks('use_case_authorization', checks, bloquante).map((c) => c.code)).toEqual([
      'RISKS_TREATED',
    ])
  })

  it('ne dispense de rien une mise en production : aucune de ses préconditions ne parle d’elle-même', () => {
    expect(GATE_CHECK_SATISFIED_BY.go_production).toBeUndefined()
    const checks: Check[] = [
      { code: 'AIIA_COMPLETE', label: 'Étude d’impact achevée', satisfied: false },
    ]
    expect(blockingGateChecks('go_production', checks, bloquante)).toHaveLength(1)
  })

  it('laisse passer les avertissements, qui s’assument à l’approbation', () => {
    const checks: Check[] = [
      { code: 'VENDOR_REVIEWS', label: 'Revues tierces closes', satisfied: false, severity: 'warning' },
    ]
    expect(blockingGateChecks('go_production', checks, bloquante)).toEqual([])
  })

  it('chaque jalon auto-référentiel a sa dispense, et elle porte le code du gate', () => {
    // Les trois gates de app.evaluate_gate qui exigent « une décision approuvée ».
    const attendus: Record<string, string> = {
      use_case_authorization: 'AUTHORIZATION_DECISION',
      pilot_approval: 'PILOT_DECISION',
      retirement: 'RETIREMENT_DECISION',
    }
    expect(GATE_CHECK_SATISFIED_BY).toEqual(attendus)
    for (const type of Object.keys(attendus)) {
      expect(MILESTONE_OF_DECISION[type]).toBeDefined()
    }
  })
})
