import type { UseCaseStatus } from '@/lib/domain/governance'

/**
 * Transitions proposees dans l'interface.
 *
 * Cette table est un miroir de app.allowed_use_case_transitions, destine au
 * seul affichage. La base reste l'autorite : elle refuse toute transition non
 * autorisee, meme si cette table venait a diverger.
 */
export const UI_TRANSITIONS: Record<UseCaseStatus, UseCaseStatus[]> = {
  DRAFT: ['TRIAGE', 'RETIRED'],
  TRIAGE: ['ASSESSMENT', 'DRAFT', 'RETIRED'],
  ASSESSMENT: ['REVIEW', 'TRIAGE', 'RETIRED'],
  REVIEW: ['APPROVED', 'CONDITIONAL_APPROVAL', 'REJECTED', 'ASSESSMENT'],
  APPROVED: ['PILOT', 'PRODUCTION', 'RETIRED'],
  CONDITIONAL_APPROVAL: ['PILOT', 'RETIRED'],
  REJECTED: ['DRAFT', 'RETIRED'],
  PILOT: ['PRODUCTION', 'REVIEW', 'SUSPENDED', 'RETIRED'],
  PRODUCTION: ['MONITORING', 'REVIEW', 'SUSPENDED', 'RETIRED'],
  MONITORING: ['PRODUCTION', 'REVIEW', 'SUSPENDED', 'RETIRED'],
  SUSPENDED: ['PRODUCTION', 'REVIEW', 'RETIRED'],
  RETIRED: [],
}

/**
 * Les types de decision qui ont un sens depuis un jalon : ceux qui font
 * franchir le suivant, et ceux qui s'appliquent en service. L'acceptation de
 * risque se prend depuis le risque ; l'exception de politique, partout.
 */
export const DECISION_TYPES_BY_STATUS: Record<UseCaseStatus, string[]> = {
  DRAFT: ['retirement', 'policy_exception'],
  TRIAGE: ['retirement', 'policy_exception'],
  ASSESSMENT: ['retirement', 'policy_exception'],
  REVIEW: ['use_case_authorization', 'policy_exception', 'retirement'],
  APPROVED: ['pilot_approval', 'go_production', 'policy_exception', 'retirement'],
  CONDITIONAL_APPROVAL: ['pilot_approval', 'policy_exception', 'retirement'],
  REJECTED: ['use_case_authorization', 'retirement'],
  PILOT: ['go_production', 'suspension', 'significant_change', 'policy_exception', 'retirement'],
  PRODUCTION: ['suspension', 'significant_change', 'policy_exception', 'retirement'],
  MONITORING: ['suspension', 'significant_change', 'policy_exception', 'retirement'],
  SUSPENDED: ['go_production', 'significant_change', 'policy_exception', 'retirement'],
  RETIRED: [],
}

/**
 * La precondition qu'une decision SATISFAIT elle-meme.
 *
 * Le gate d'un jalon engageant exige « une decision approuvee » : c'est vrai
 * d'une TRANSITION, c'est absurde pour la decision qui l'apportera. Soumettre
 * une autorisation d'usage depuis Revue etait refuse au motif qu'aucune
 * autorisation d'usage n'etait approuvee — la porte demandait la clef qu'on
 * venait la chercher.
 *
 * On ecarte donc, a la soumission, la seule verification que cette decision a
 * precisement pour objet de remplir. Toutes les autres tiennent : une mise en
 * production reste jugee sur ses huit preconditions, dont aucune ne parle
 * d'elle-meme.
 */
export const GATE_CHECK_SATISFIED_BY: Record<string, string> = {
  use_case_authorization: 'AUTHORIZATION_DECISION',
  pilot_approval: 'PILOT_DECISION',
  retirement: 'RETIREMENT_DECISION',
}

/** Le jalon qu'une decision fait franchir, une fois approuvee. */
export const MILESTONE_OF_DECISION: Record<string, string> = {
  use_case_authorization: 'APPROVED',
  pilot_approval: 'PILOT',
  go_production: 'PRODUCTION',
  suspension: 'SUSPENDED',
  retirement: 'RETIRED',
}

/**
 * Ce qui manque VRAIMENT pour soumettre cette decision : les verifications
 * bloquantes non satisfaites, moins celle qu'elle apporte.
 */
export function blockingGateChecks<T extends { code?: string; satisfied: boolean }>(
  decisionType: string,
  checks: T[],
  isBlocking: (check: T) => boolean,
): T[] {
  const apportee = GATE_CHECK_SATISFIED_BY[decisionType]
  return checks.filter((c) => !c.satisfied && isBlocking(c) && c.code !== apportee)
}
