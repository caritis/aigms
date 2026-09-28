import type { RiskLevel } from '@/lib/domain/governance'

/**
 * L'echelle de cotation, et ce que chaque cran veut dire.
 *
 * La base ne stocke qu'un chiffre de 1 a 5 : c'est ce qui rend la cotation
 * calculable et testable. Mais un chiffre nu ne se cote pas — deux personnes
 * n'entendent pas la meme chose par « 4 ». Les libelles sont donc portes ici,
 * a cote du chiffre, et l'ecran affiche toujours les deux.
 *
 * Module pur : les pages serveur relisent ces libelles pour afficher un
 * risque deja cote.
 */
export type Scale = { value: 1 | 2 | 3 | 4 | 5; label: string; hint: string }

export const LIKELIHOOD_SCALE: Scale[] = [
  { value: 1, label: 'Improbable', hint: 'Jamais observé, et rien ne le rend plausible.' },
  { value: 2, label: 'Peu probable', hint: 'Concevable, mais il faudrait un concours de circonstances.' },
  { value: 3, label: 'Possible', hint: 'S’est déjà produit ailleurs, ou rien n’empêche que cela arrive.' },
  { value: 4, label: 'Probable', hint: 'S’est déjà produit ici, ou les conditions sont réunies.' },
  { value: 5, label: 'Quasi certain', hint: 'Se produit régulièrement, ou se produira faute d’agir.' },
]

export const IMPACT_SCALE: Scale[] = [
  { value: 1, label: 'Négligeable', hint: 'Sans conséquence perceptible pour qui que ce soit.' },
  { value: 2, label: 'Mineure', hint: 'Gêne rattrapable dans la journée, sans coût notable.' },
  { value: 3, label: 'Modérée', hint: 'Coût, délai ou mécontentement réels, mais contenus.' },
  { value: 4, label: 'Majeure', hint: 'Atteinte aux personnes, perte financière lourde, ou manquement réglementaire.' },
  { value: 5, label: 'Critique', hint: 'Dommage irréversible, sanction, ou remise en cause de l’activité.' },
]

/**
 * La cotation, telle que la base la calcule.
 *
 * Copie fidele de `app.rate_risk_level` : elle sert a MONTRER le niveau
 * pendant la saisie, jamais a l'ecrire. Un test unitaire verifie les
 * vingt-cinq combinaisons contre les seuils de la migration 0008 — si l'un
 * des deux bouge sans l'autre, il tombe.
 */
export function rateRiskLevel(likelihood: number, impact: number): RiskLevel {
  const product = likelihood * impact
  if (product >= 16) return 'critical'
  if (product >= 10) return 'high'
  if (product >= 5) return 'moderate'
  return 'low'
}

/**
 * Les categories de risque, et ce que chacune recouvre.
 *
 * Sans la definition, on classe au hasard — et une categorie posee au hasard
 * fausse le rapprochement avec les controles, qui s'appuie dessus.
 */
export type RiskCategory = {
  value: string
  label: string
  description: string
}

export const RISK_CATEGORIES: RiskCategory[] = [
  {
    value: 'bias_discrimination',
    label: 'Biais et discrimination',
    description:
      'Le système traite différemment des personnes selon l’âge, le sexe, l’origine ou une autre caractéristique protégée — volontairement ou par ses données.',
  },
  {
    value: 'fundamental_rights',
    label: 'Droits fondamentaux',
    description:
      'Atteinte à la dignité, à la liberté d’expression, au droit à un recours, ou à l’accès à un service essentiel.',
  },
  {
    value: 'privacy',
    label: 'Vie privée',
    description:
      'Données personnelles collectées, conservées, réutilisées ou transmises au-delà de ce qui a été prévu et annoncé.',
  },
  {
    value: 'security',
    label: 'Sécurité',
    description:
      'Accès non autorisé, fuite, altération ou indisponibilité du système, de ses données ou de ses modèles.',
  },
  {
    value: 'safety',
    label: 'Sécurité des personnes',
    description:
      'Le fonctionnement du système peut blesser quelqu’un, directement ou par la décision qu’il entraîne.',
  },
  {
    value: 'accuracy_robustness',
    label: 'Exactitude et robustesse',
    description:
      'Le système se trompe, invente, ou se dégrade hors de son domaine d’emploi — dérive, cas limites, données inhabituelles.',
  },
  {
    value: 'transparency',
    label: 'Transparence',
    description:
      'Les personnes ne savent pas qu’une IA intervient, ne peuvent pas comprendre la décision, ni la contester.',
  },
  {
    value: 'operational',
    label: 'Opérationnel',
    description:
      'Interruption du processus métier, dépendance à une compétence unique, procédure de repli absente ou jamais éprouvée.',
  },
  {
    value: 'financial',
    label: 'Financier',
    description: 'Perte, surcoût, engagement contractuel erroné, ou dérive de la dépense d’usage.',
  },
  {
    value: 'reputational',
    label: 'Réputation',
    description: 'Atteinte à l’image auprès des clients, des salariés, du marché ou d’une autorité.',
  },
  {
    value: 'legal_compliance',
    label: 'Conformité',
    description:
      'Manquement à une obligation — AI Act, RGPD, droit sectoriel, propriété intellectuelle, engagement contractuel.',
  },
  {
    value: 'third_party',
    label: 'Tiers',
    description:
      'Le risque naît chez un fournisseur : modèle, hébergement, sous-traitant — et échappe en partie à notre maîtrise.',
  },
  {
    value: 'environmental',
    label: 'Environnement',
    description: 'Consommation d’énergie, d’eau ou de matériel qu’entraînent l’entraînement et l’usage.',
  },
]

export const RISK_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  RISK_CATEGORIES.map((c) => [c.value, c.label]),
)
