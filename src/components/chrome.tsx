'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  createContext,
  Suspense,
  use,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Wordmark } from '@/components/logo'
import { NavDropdown } from '@/components/nav-dropdown'
import { UserMenu } from '@/components/admin/user-menu'
import { AttentionDot } from '@/components/governance/attention'
import { describeAttention, SECTION_ATTENTION, type Attention } from '@/lib/governance/attention'
import type { Branding } from '@/lib/branding'
import {
  ORGANIZATION_SECTIONS,
  menuProfile,
  registerSections,
  type OrganizationSection,
} from '@/lib/domain/sections'

/**
 * La barre de navigation, cote navigateur.
 *
 * Elle vit dans la mise en page du groupe `(espace)` : l'App Router la
 * CONSERVE d'une navigation a l'autre, elle ne se recalcule pas. C'est tout
 * l'objet de ADR-0029 — six allers-retours par clic s'evaporent.
 *
 * Elle doit donc savoir seule ou l'on se trouve. Deux sources, dans cet ordre :
 *
 *   1. le CHEMIN, quand il porte l'organisation — `/admin/organizations/<id>/…`.
 *      C'est le cas des trente-trois pages d'organisation, et cela vaut des le
 *      rendu serveur : aucun clignotement ;
 *   2. ce que la page ANNONCE, pour les adresses qui ne portent pas
 *      l'organisation — la fiche d'un cas d'usage. L'annonce arrive apres
 *      l'hydratation ; la barre affiche d'ici la l'organisation courante du
 *      profil.
 *
 * Les compteurs ne sont jamais rappeles : la mise en page charge l'attention de
 * TOUTES les organisations accessibles en un appel — c'est la meme fonction qui
 * sert le pilotage — et la barre y lit la ligne qui la concerne.
 */

type Announcement = { organizationId: string; section: OrganizationSection } | null

const AnnounceContext = createContext<(a: Announcement) => void>(() => {})

/**
 * Ce qu'une page dit de sa place, quand le chemin ne le dit pas.
 *
 * Rien ne s'affiche : le composant n'existe que pour son effet. Il se demonte
 * avec sa page, et remet alors la barre a l'organisation du profil.
 */
export function AnnounceSection({
  organizationId,
  section,
}: {
  organizationId: string
  section: OrganizationSection
}) {
  const announce = useContext(AnnounceContext)
  useEffect(() => {
    announce({ organizationId, section })
    return () => announce(null)
  }, [announce, organizationId, section])
  return null
}

/** Ce que le chemin dit de lui-meme : organisation et section. */
function fromPathname(pathname: string): Announcement {
  const match = /^\/admin\/organizations\/([0-9a-f-]{36})(\/.*)?$/.exec(pathname)
  if (!match) return null
  const organizationId = match[1]!
  const rest = match[2] ?? ''
  // La section la plus longue qui prefixe le reste du chemin : `/preuves` et
  // `/preuves/deposer` designent le meme onglet.
  const section = [...ORGANIZATION_SECTIONS]
    .filter((s) => s.href && (rest === s.href || rest.startsWith(`${s.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]
  return { organizationId, section: section?.key ?? 'apercu' }
}

/**
 * Ce qui appelle une action, dans une section — ou dans plusieurs.
 *
 * `use` suspend CE composant, pas la barre : les intitules, les liens et les
 * menus s'affichent tout de suite, et les pastilles arrivent apres. Une
 * pastille absente une fraction de seconde ne trompe personne ; une barre
 * absente une seconde, si.
 */
function compter(row: Attention | undefined, key: OrganizationSection): number {
  if (!row) return 0
  return (SECTION_ATTENTION[key] ?? []).reduce((n, kind) => n + row[kind], 0)
}

/**
 * Ce que la pastille compte, en toutes lettres.
 *
 * Un chiffre nu se lit comme un retard : on voyait « 1 » sur « Processus et
 * risques » en arrivant sur une cartographie vide, sans moyen de savoir qu'il
 * s'agissait d'un risque eleve ouvert. Le survol le dit.
 */
function detailler(row: Attention | undefined, keys: readonly OrganizationSection[]): string {
  if (!row) return 'élément(s) appelant une action'
  const kinds = keys.flatMap((k) => SECTION_ATTENTION[k] ?? [])
  const parts = describeAttention(row, kinds)
  return parts.length ? parts.join(', ') : 'élément(s) appelant une action'
}

function SectionDot({
  attention,
  organizationId,
  keys,
  late = false,
  muted = false,
  label,
}: {
  attention: Promise<Attention[]>
  organizationId: string | null
  keys: readonly OrganizationSection[]
  late?: boolean
  /**
   * Ce role est INFORME de cette section, pas saisi : le chiffre se tait.
   * Compter a quelqu'un des retards qu'il ne peut pas solder, c'est l'inviter
   * a sortir de son role.
   */
  muted?: boolean
  label: string
}) {
  const row = use(attention).find((a) => a.organization_id === organizationId)
  if (muted) return null
  const total = keys.reduce((n, k) => n + compter(row, k), 0)
  // Le libelle donne passe si le detail est vide : il reste la reponse par defaut.
  return <AttentionDot count={total} late={late} inverted label={detailler(row, keys) || label} />
}

/** La meme, en clair : dans le menu deroulant, le fond n'est plus sombre. */
function SectionDotLight({
  attention,
  organizationId,
  section,
  muted = false,
}: {
  attention: Promise<Attention[]>
  organizationId: string | null
  section: OrganizationSection
  muted?: boolean
}) {
  const row = use(attention).find((a) => a.organization_id === organizationId)
  if (muted) return null
  return <AttentionDot count={compter(row, section)} late={false} label={detailler(row, [section])} />
}

/** Tout ce qui appelle une action sur le perimetre : la pastille du pilotage. */
/**
 * L'organisation sur laquelle on travaille, a droite de la barre.
 *
 * Elle affichait le nom du TENANT — « Demo » — c'est-a-dire le cabinet, pas le
 * client ouvert. Sur un portefeuille de plusieurs organisations, c'etait la
 * seule information que la barre ne donnait pas, et celle dont on a besoin
 * avant d'agir. Elle vient de la meme lecture que les pastilles : aucune
 * requete de plus. Pour l'administration, qui n'a pas de portefeuille, rien ne
 * s'affiche — et c'est juste.
 */
function OrganizationName({
  attention,
  organizationId,
}: {
  attention: Promise<Attention[]>
  organizationId: string | null
}) {
  const row = use(attention).find((a) => a.organization_id === organizationId)
  if (!row) return null
  return (
    <span className="hidden max-w-56 truncate text-sm text-white/60 lg:inline" title={row.organization_name}>
      {row.organization_name}
    </span>
  )
}

function TotalDot({ attention }: { attention: Promise<Attention[]> }) {
  const rows = use(attention)
  const total = rows.reduce((n, a) => n + a.total, 0)
  /*
    Le pilotage porte le portefeuille ENTIER : son chiffre additionne toutes
    les organisations. Sans le dire, on le lisait comme celui de
    l'organisation courante — et « 80 » restait incomprehensible.
  */
  const libelle =
    rows.length > 1
      ? `élément(s) appelant une action, sur ${rows.length} organisations`
      : 'élément(s) appelant une action'
  return <AttentionDot count={total} inverted label={libelle} />
}

/** Le compte d'alertes non lues, sur la cloche. */
function UnreadCount({ unread }: { unread: Promise<number> }) {
  const n = use(unread)
  if (!n) return null
  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-warn-600 px-1 text-[10px] font-semibold tabular-nums text-night-950">
      {n}
    </span>
  )
}

export function Chrome({
  viewer,
  branding,
  roleLabel,
  role,
  administrating,
  unread,
  attention,
  fallbackOrganizationId,
  adminNav,
  governanceNav,
  children,
}: {
  viewer: { fullName: string | null; email: string; tenantName: string | null } | null
  branding: Branding
  roleLabel: string
  /** Le rôle attribué : il commande ce que la barre met en avant (sections.ts). */
  role: string | null
  administrating: boolean
  unread: Promise<number>
  attention: Promise<Attention[]>
  fallbackOrganizationId: string | null
  adminNav: { href: string; label: string }[]
  governanceNav: { href: string; label: string }[]
  children: ReactNode
}) {
  const pathname = usePathname()
  const [announced, setAnnounced] = useState<Announcement>(null)

  const here = fromPathname(pathname) ?? announced
  const organizationId = here?.organizationId ?? fallbackOrganizationId
  const activeSection = here?.section ?? null
  const activePilotage = pathname.startsWith('/admin/pilotage')

  const nav = administrating ? adminNav : governanceNav
  /*
    Ce que ce role voit en premier, et ce qui ne le sollicite pas. La barre
    n'ouvre ni ne ferme aucun droit : elle range. Toute section reste
    atteignable par son adresse, et la RLS reste seule juge.
  */
  const profile = menuProfile(role)
  const registres = registerSections(profile)

  const pilotage = nav.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={activePilotage ? 'page' : undefined}
      className={`inline-flex items-baseline rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white ${
        activePilotage ? 'bg-white/10 text-white' : 'text-white/75'
      }`}
    >
      {link.label}
      <Suspense fallback={null}>
        <TotalDot attention={attention} />
      </Suspense>
    </Link>
  ))
  const orgBase = organizationId ? `/admin/organizations/${organizationId}` : null

  const announceValue = useMemo(() => setAnnounced, [])

  return (
    <AnnounceContext.Provider value={announceValue}>
      <div className="min-h-screen">
        {/*
          Bandeau sombre : la marque et la navigation se detachent du contenu,
          qui reste clair. Les teintes sont celles de la charte — bleu nuit,
          accent bleu-vert.
        */}
        <header className="bg-night-950 text-white shadow-[0_1px_0_rgb(255_255_255/0.06)]">
          <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-3">
            <Link
              href={administrating ? '/admin/organizations' : '/admin/pilotage'}
              aria-label={`${branding.label}, accueil`}
              className="shrink-0"
            >
              <Wordmark
                size={26}
                tone="light"
                label={branding.label}
                tagline={branding.tagline}
                logoUrl={branding.logoUrl}
              />
            </Link>

            <nav aria-label="Navigation principale" className="flex items-center gap-1 text-sm">
              {administrating ? (
                nav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
                    className={`inline-flex items-baseline rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white ${
                      pathname.startsWith(link.href) ? 'bg-white/10 text-white' : 'text-white/75'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  {/*
                    Le pilotage passe devant pour qui lit un portefeuille et non
                    un dossier — la direction, l'auditeur. Ce qu'on ouvre en
                    premier dit ce qu'on attend de vous.
                  */}
                  {profile.pilotageFirst ? pilotage : null}
                  {/*
                    Les sections de l'organisation courante — celle de la page,
                    sinon celle du profil. Sans organisation, les liens conduisent
                    a la liste : il faut en choisir une.
                  */}
                  {profile.primary.map((key) => {
                    const section = ORGANIZATION_SECTIONS.find((s) => s.key === key)!
                    const active = activeSection === key
                    return (
                      <Link
                        key={key}
                        href={orgBase ? `${orgBase}${section.href}` : '/admin/organizations'}
                        aria-current={active ? 'page' : undefined}
                        className={`inline-flex items-baseline rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white ${
                          active ? 'bg-white/10 text-white' : 'text-white/75'
                        }`}
                      >
                        {section.label}
                        <Suspense fallback={null}>
                          <SectionDot
                            attention={attention}
                            organizationId={organizationId}
                            keys={[key]}
                            late={key === 'processus'}
                            muted={profile.muted.includes(key)}
                            label="élément(s) appelant une action"
                          />
                        </Suspense>
                      </Link>
                    )
                  })}
                  <NavDropdown
                    label="Registres"
                    active={registres.some((key) => activeSection === key)}
                    badge={
                      <Suspense fallback={null}>
                        <SectionDot
                          attention={attention}
                          organizationId={organizationId}
                          keys={registres.filter((key) => !profile.muted.includes(key))}
                          label="élément(s) appelant une action dans les registres"
                        />
                      </Suspense>
                    }
                    items={registres.map((key) => {
                      const section = ORGANIZATION_SECTIONS.find((s) => s.key === key)!
                      return {
                        href: orgBase ? `${orgBase}${section.href}` : '/admin/organizations',
                        label: section.label,
                        active: activeSection === key,
                        badge: (
                          <Suspense fallback={null}>
                            <SectionDotLight
                              attention={attention}
                              organizationId={organizationId}
                              section={key}
                              muted={profile.muted.includes(key)}
                            />
                          </Suspense>
                        ),
                      }
                    })}
                  />
                  {profile.pilotageFirst ? null : pilotage}
                </>
              )}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              {viewer ? (
                <Suspense fallback={null}>
                  <OrganizationName attention={attention} organizationId={organizationId} />
                </Suspense>
              ) : null}
              {viewer ? (
                <Link
                  href="/admin/alertes"
                  aria-label="Mes alertes"
                  className="relative inline-flex items-center rounded-md p-1.5 text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 20a2 2 0 0 0 4 0"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <Suspense fallback={null}>
                    <UnreadCount unread={unread} />
                  </Suspense>
                </Link>
              ) : null}
              {viewer ? (
                <UserMenu
                  fullName={viewer.fullName}
                  email={viewer.email}
                  roleLabel={roleLabel}
                  canSettleOrganization={!administrating}
                />
              ) : null}
            </div>
          </div>

          {administrating ? (
            <div className="border-t border-white/10 bg-night-900">
              <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2 text-white">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path
                    d="M9 1.8 L15.9 5.4 V9.9 C15.9 13.1 12.9 15.6 9 16.5 C5.1 15.6 2.1 13.1 2.1 9.9 V5.4 Z"
                    stroke="var(--color-teal-400)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.4 8.9 L8.3 10.8 L11.8 7.2"
                    stroke="var(--color-teal-400)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-[13px]">
                  <span className="font-semibold">Administration de la plateforme.</span>{' '}
                  <span className="text-ink-200">
                    Vous ouvrez les accès : organisations, comptes et rôles. La gouvernance des cas
                    d’usage relève des rôles que vous attribuez.
                  </span>
                </p>
              </div>
            </div>
          ) : null}
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          {/*
            Averti seulement sur ecran etroit : une mention permanente serait du
            bruit pour ceux qui sont deja au bon endroit. L'application n'est pas
            bloquee pour autant — consulter depuis un telephone reste legitime.
          */}
          <p className="mb-5 rounded-md border border-warn-600/25 bg-warn-600/5 px-4 py-3 text-[13px] leading-relaxed text-ink-700 sm:hidden">
            Cet écran est étroit pour AIGMS. Cartes, matrices et déclarations se travaillent sur un
            poste de bureau ou une tablette ; ici, la consultation passe, la saisie sera
            inconfortable.
          </p>
          {children}
        </main>
      </div>
    </AnnounceContext.Provider>
  )
}
