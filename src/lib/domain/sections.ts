/**
 * Les sections d'une organisation, dans l'ordre ou l'on y travaille.
 *
 * Donnees PURES, et c'est tout leur interet : la barre de navigation les lit
 * dans le navigateur, l'en-tete de page les lit sur le serveur. Les avoir
 * laissees dans le composant client a coute une erreur serveur — depuis un
 * module `'use client'`, un composant serveur ne recoit pas la valeur mais une
 * reference, et `.includes()` leve. Meme lecon que pour `attention.ts`.
 */

export const ORGANIZATION_SECTIONS = [
  { key: 'apercu', label: 'Cas d’usage', href: '' },
  { key: 'processus', label: 'Processus et risques', href: '/processus' },
  { key: 'controles', label: 'Contrôles et outillages', href: '/controles' },
  { key: 'actifs', label: 'Actifs d’IA et fournisseurs', href: '/actifs' },
  { key: 'decisions', label: 'Décisions', href: '/decisions' },
  { key: 'soa', label: 'Déclaration d’Applicabilité', href: '/declaration-applicabilite' },
  { key: 'preuves', label: 'Preuves', href: '/preuves' },
  { key: 'suivi', label: 'Suivi d’actions et d’incidents', href: '/suivi' },
  { key: 'revues', label: 'Revues de gouvernance', href: '/revues' },
] as const

export type OrganizationSection = (typeof ORGANIZATION_SECTIONS)[number]['key']

/**
 * Une seule barre. Deux sections en premiere ligne — la ou l'on travaille —,
 * les registres sous un menu, et le pilotage. Le fil d'Ariane porte le mot
 * « Registres » sur les pages du menu, pour que l'endroit se nomme.
 */
export const PRIMARY_SECTIONS = ['apercu', 'processus'] as const

export const REGISTER_SECTIONS = [
  'controles',
  'actifs',
  'decisions',
  'soa',
  'preuves',
  'suivi',
  'revues',
] as const

/**
 * Ce que chaque rôle voit en premier, et ce qui ne le sollicite pas.
 *
 * La barre montrait les neuf sections à tout le monde. Ce n'est pas un trou de
 * sécurité — la RLS ouvre la lecture à tout le tenant et refuse les écritures —
 * mais un défaut de pertinence : un Comité de direction n'a rien à faire dans
 * le registre des preuves, et le lui présenter au même rang que ses décisions
 * lui fait chercher son travail.
 *
 * Trois règles, tenues pour chaque ligne :
 *
 *   1. Ne jamais masquer ce qu'un rôle PEUT faire. Un R ou un A de la matrice
 *      RACI met la section en première ligne.
 *   2. Estomper plutôt que retirer. Un I laisse la section accessible, sous
 *      « Registres », sans pastille — être informé ne veut pas dire être
 *      sollicité.
 *   3. Toujours laisser une porte. AUCUNE section n'est retirée : elles
 *      restent atteignables par leur adresse, un lien partagé continue de
 *      fonctionner, et la RLS reste seule juge de ce qui s'ouvre.
 */
export type MenuProfile = {
  /** Les sections en première ligne, dans l'ordre où ce rôle y travaille. */
  primary: readonly OrganizationSection[]
  /** Celles dont la pastille se tait : ce rôle en est informé, pas saisi. */
  muted: readonly OrganizationSection[]
  /** Le pilotage passe devant : le rôle lit un portefeuille, pas un dossier. */
  pilotageFirst?: boolean
}

const TOUTES = ORGANIZATION_SECTIONS.map((s) => s.key)

export const MENU_BY_ROLE: Record<string, MenuProfile> = {
  // Ils conduisent le système : rien ne leur est étranger.
  governance_officer: { primary: ['apercu', 'processus'], muted: [] },
  client_admin: { primary: ['apercu', 'processus'], muted: [] },
  platform_admin: { primary: ['apercu', 'processus'], muted: [] },

  // Il déclare, répond et fournit les preuves. La Déclaration, les décisions
  // et les revues se lisent, mais ne l'appellent pas.
  system_owner: { primary: ['apercu', 'processus'], muted: ['decisions', 'soa', 'revues'] },

  // Il répond des risques : la cartographie d'abord, puis ce qui les solde.
  risk_owner: { primary: ['processus', 'apercu'], muted: ['actifs', 'preuves', 'soa'] },

  // Il est consulté sur les contrôles et la conformité, pas sur l'inventaire.
  reviewer: { primary: ['apercu', 'processus'], muted: ['actifs', 'revues'] },

  // Il tranche là où cela engage. Le portefeuille d'abord, ses décisions
  // ensuite ; le reste reste lisible, sans le solliciter.
  executive_viewer: {
    primary: ['decisions'],
    muted: TOUTES.filter((k) => k !== 'decisions'),
    pilotageFirst: true,
  },

  // Il constate, il ne solde rien. Lui compter des retards qu'il ne peut pas
  // clore serait l'inviter à sortir de son rôle — le même raisonnement que
  // pour l'administration, qui n'a pas de gouvernance à suivre.
  auditor: { primary: ['apercu'], muted: TOUTES, pilotageFirst: true },
}

/** Le profil d'un rôle, ou celui qui ne présume rien quand il est inconnu. */
export function menuProfile(role: string | null): MenuProfile {
  return MENU_BY_ROLE[role ?? ''] ?? { primary: PRIMARY_SECTIONS, muted: [] }
}

/** Ce qui n'est pas en première ligne se lit sous « Registres ». */
export function registerSections(profile: MenuProfile): OrganizationSection[] {
  return TOUTES.filter((key) => !profile.primary.includes(key))
}
