/**
 * Les phases du cycle de vie d'un systeme d'IA — ISO/IEC 42001 A.6 — dans
 * l'ordre ou elles se suivent : l'ordre porte l'information autant que les
 * mots. « Avec quoi cet actif a ete fait » se lit par phase.
 *
 * Module pur, sans `'use client'` : la fiche d'un actif est rendue sur le
 * serveur et lit ces libelles. Importes depuis un module client, ils ne
 * seraient qu'une reference — et `PHASE_LABELS[...]` echouerait a
 * l'execution, sans que le typage ni la compilation n'en disent rien.
 */
export const TOOLING_PHASES = [
  { value: 'design', label: 'Conception' },
  { value: 'data', label: 'Données' },
  { value: 'training', label: 'Entraînement' },
  { value: 'validation', label: 'Validation' },
  { value: 'deployment', label: 'Déploiement' },
  { value: 'operation', label: 'Exploitation' },
] as const

export type ToolingPhase = (typeof TOOLING_PHASES)[number]['value']

export const PHASE_LABELS: Record<string, string> = Object.fromEntries(
  TOOLING_PHASES.map((p) => [p.value, p.label]),
)
