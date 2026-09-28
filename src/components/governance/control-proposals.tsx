'use client'

import { useActionState, useMemo, useState } from 'react'
import { retainSuggestedControls, type FormState } from '@/lib/actions/controls'
import { FormFeedback, Submit } from '@/components/forms'
import { Modal } from '@/components/modal'

/**
 * Propositions de controles pour un cas d'usage.
 *
 * L'assistant propose, l'humain retient. Les propositions viennent de
 * `app.suggest_controls` — regles d'applicabilite, faits du cas d'usage, role
 * de l'organisation — et chacune porte son motif. On coche, on retient, rien
 * ne s'ecrit avant.
 *
 * Trois rangs selon le role : ce qu'on lit d'abord, ensuite, et ce qui n'est
 * la que parce qu'un fait l'a declenche. Trois etats : deja affecte (grise),
 * present dans la liste operationnelle mais pas affecte, a ajouter depuis le
 * referentiel.
 */

export type Proposal = {
  catalog_control_id: string
  framework_code: string
  code: string
  title: string
  domain_code: string
  domain_name: string
  phase: string | null
  tier: 'triggered' | 'baseline' | 'core' | 'relevant' | 'secondary'
  mandatory: boolean
  reasons: string[]
  state: 'already_affected' | 'operational_not_affected' | 'to_add'
  control_id: string | null
  tools: { code: string; acronym: string | null; automation: string | null }[]
}

export type Suggestions = {
  available: boolean
  reason?: string
  facts?: string[]
  profile?: string | null
  proposals?: Proposal[]
  /** La population d'ou les propositions sont tirees (0079). */
  population?: { use_case?: number; baseline?: number; organization?: number }
  /** Les conditionnels qu'aucun fait ne declenche, et ce qui les declencherait. */
  not_proposed?: { code: string; title: string; domain_name: string; triggers: string[] }[]
}

const TIER_LABELS: Record<Proposal['tier'], { title: string; hint: string }> = {
  triggered: { title: 'Propres à ce cas d’usage', hint: 'Déclenchés par ses faits : données, personnes, actifs, classification, fournisseurs, statut.' },
  baseline: { title: 'Socle de tout cas d’usage', hint: 'Attendus quel que soit l’usage : finalité, responsables, risques, supervision, journalisation.' },
  core: { title: 'À lire d’abord', hint: 'Les domaines au cœur du rôle de l’organisation.' },
  relevant: { title: 'Ensuite', hint: 'Pertinents pour ce rôle, sans être au premier plan.' },
  secondary: { title: 'Hors du cœur du rôle', hint: 'Moins attendus pour ce rôle.' },
}

const FACT_LABELS: Record<string, string> = {
  personal_data: 'données personnelles',
  vulnerable_persons: 'personnes vulnérables',
  autonomy_gte_l3: 'autonomie L3 ou plus',
  criticality_high: 'criticité élevée ou critique',
  external_vendor: 'fournisseur tiers',
  model_provider: 'fournisseur de modèle',
  role_host: 'rôle : hébergeur',
  role_developer: 'rôle : développeur',
  role_integrator: 'rôle : intégrateur',
  role_business_user: 'rôle : utilisateur métier',
  in_service: 'en service',
  external_persons: 'personnes extérieures concernées',
  high_risk_potential: 'haut risque potentiel (AI Act)',
  privacy_impact: 'impact vie privée',
  security_impact: 'impact sécurité',
  gpai_dependency: 'modèle à usage général',
  transparency_obligations: 'obligations de transparence',
  asset_agent: 'agent',
  asset_own_model: 'modèle propre',
  asset_dataset: 'jeu de données',
}

export function ControlProposals({
  organizationId,
  useCaseId,
  suggestions,
}: {
  organizationId: string
  /** Absent : portee organisation — les controles du systeme de management. */
  useCaseId?: string
  suggestions: Suggestions
}) {
  const organizationMode = !useCaseId
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(
    retainSuggestedControls,
    null,
  )
  const proposals = useMemo(() => suggestions.proposals ?? [], [suggestions.proposals])
  const selectable = proposals.filter((p) => p.state !== 'already_affected')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [openTiers, setOpenTiers] = useState<Set<string>>(new Set(['triggered', 'core']))
  /*
    Quarante-quatre propositions tiennent sur trois ecrans de defilement : on
    y cherchait un controle en le lisant. Trois filtres, cumulables, pour
    n'afficher que ce qu'on cherche — et un tri qui remonte ce qui compte.
  */
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<string | null>(null)
  const [onlyRecommended, setOnlyRecommended] = useState(false)

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleTier = (tier: string) =>
    setOpenTiers((prev) => {
      const next = new Set(prev)
      if (next.has(tier)) next.delete(tier)
      else next.add(tier)
      return next
    })
  const checkAll = (ids: string[]) =>
    setChecked((prev) => {
      const next = new Set(prev)
      const all = ids.every((id) => next.has(id))
      for (const id of ids) {
        if (all) next.delete(id)
        else next.add(id)
      }
      return next
    })

  const selections = proposals
    .filter((p) => checked.has(p.catalog_control_id))
    .map((p) => ({ catalogControlId: p.catalog_control_id, controlId: p.control_id, reason: p.reasons.join(' ') }))

  /*
    « Le plus approprie » n'est pas une opinion : c'est ce qu'un fait de la
    fiche a declenche, ou ce que le referentiel rend obligatoire. Les deux se
    marquent, et se filtrent d'un clic.
  */
  const isRecommended = (p: Proposal) => p.tier === 'triggered' || p.mandatory

  const normalize = (v: string) =>
    v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const needle = normalize(query.trim())

  const matches = (p: Proposal) => {
    if (domain && p.domain_code !== domain) return false
    if (onlyRecommended && !isRecommended(p)) return false
    if (!needle) return true
    const hay = normalize(
      [p.code, p.title, p.domain_code, p.domain_name, p.phase ?? '', p.reasons.join(' '),
       p.tools.map((t) => `${t.code} ${t.acronym ?? ''}`).join(' ')].join(' '),
    )
    return needle.split(/\s+/).every((word) => hay.includes(word))
  }

  const visible = proposals.filter(matches)
  const filtering = Boolean(needle) || Boolean(domain) || onlyRecommended

  /** Les domaines presents, avec leur compte — pour filtrer sans deviner. */
  const domains = useMemo(() => {
    const seen = new Map<string, { code: string; name: string; count: number }>()
    for (const p of proposals) {
      const entry = seen.get(p.domain_code)
      if (entry) entry.count += 1
      else seen.set(p.domain_code, { code: p.domain_code, name: p.domain_name, count: 1 })
    }
    return [...seen.values()].sort((a, b) => a.code.localeCompare(b.code))
  }, [proposals])

  const recommendedCount = proposals.filter(isRecommended).length

  /*
    La recherche porte aussi sur les non proposes : chercher un code et ne
    rien trouver, alors qu'il est la sous un repli, c'est conclure a tort
    qu'il n'existe pas.
  */
  const notProposed = (suggestions.not_proposed ?? []).filter((n) => {
    if (!needle) return true
    const hay = normalize([n.code, n.title, n.domain_name, n.triggers.join(' ')].join(' '))
    return needle.split(/\s+/).every((word) => hay.includes(word))
  })

  const tiers = (['triggered', 'baseline', 'core', 'relevant', 'secondary'] as const)
    .map((tier) => ({
      tier,
      items: visible
        .filter((p) => p.tier === tier)
        // Ce qui appelle un geste d'abord : a retenir, puis a affecter, puis
        // ce qui est deja fait. A rang egal, le recommande remonte.
        .sort((a, b) => {
          const rank = (x: Proposal) => (x.state === 'already_affected' ? 2 : x.state === 'operational_not_affected' ? 1 : 0)
          return rank(a) - rank(b) || Number(isRecommended(b)) - Number(isRecommended(a)) || a.code.localeCompare(b.code)
        }),
    }))
    .filter((t) => t.items.length)

  return (
    <Modal
      closeOnSuccess={false}
      trigger={organizationMode ? 'Proposer les contrôles d’organisation' : 'Proposer des contrôles'}
      title={organizationMode ? 'Contrôles du système de management' : 'Propositions de contrôles'}
      description={
        organizationMode
          ? 'Se tiennent une fois pour toute l’organisation — politique, comité, audit interne, inventaire… Ils ne s’affectent pas à un cas d’usage. Rien ne s’écrit avant que vous ne reteniez.'
          : 'Calculées depuis le référentiel, le rôle de l’organisation et les faits du cas d’usage. Rien ne s’écrit avant que vous ne reteniez.'
      }
    >
      {() => (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="organizationId" value={organizationId} />
          {useCaseId ? <input type="hidden" name="useCaseId" value={useCaseId} /> : null}
          <input type="hidden" name="selections" value={JSON.stringify(selections)} />

          {!suggestions.available ? (
            <p className="rounded-md border border-ink-200 bg-ink-50 px-3.5 py-3 text-sm text-ink-600">
              {suggestions.reason ?? 'Aucune proposition.'}
            </p>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-ink-500">
                {organizationMode ? '' : 'Ce que l’assistant a lu : '}
                {organizationMode
                  ? ''
                  : `${(suggestions.facts ?? []).length ? (suggestions.facts ?? []).map((f) => FACT_LABELS[f] ?? f).join(' · ') : 'aucun fait particulier'}. `}
                {proposals.length} proposition(s), {selectable.length} à retenir,{' '}
                {proposals.length - selectable.length} {organizationMode ? 'déjà dans la liste' : 'déjà affectée(s)'}.
              </p>
              {/*
                D'ou viennent-elles, et sur combien : les deux fenetres ne
                puisent pas dans la meme population du referentiel. Le dire
                evite de chercher les 51 parmi les 59.
              */}
              {suggestions.population ? (
                <p className="rounded-md bg-ink-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
                  {organizationMode ? (
                    <>
                      <strong className="font-medium text-ink-800">{suggestions.population.organization ?? proposals.length} sur {suggestions.population.organization ?? proposals.length}</strong>{' '}
                      contrôles de portée organisation du référentiel : tous se tiennent, l’ordre suit le rôle. Les contrôles
                      de portée cas d’usage se proposent depuis chaque fiche, selon ses faits.
                    </>
                  ) : (
                    <>
                      <strong className="font-medium text-ink-800">{proposals.length} sur {suggestions.population.use_case ?? '—'}</strong>{' '}
                      contrôles de portée cas d’usage du référentiel : {suggestions.population.baseline ?? '—'} de socle, toujours
                      proposés, et ceux qu’un fait de la fiche déclenche. Les {suggestions.population.organization ?? '—'} contrôles
                      du système de management se retiennent une fois, depuis le registre des contrôles. Un contrôle écrit
                      librement n’est pas rattaché au référentiel : il n’apparaît pas ici, même affecté.
                    </>
                  )}
                </p>
              ) : null}

              {/*
                La barre de recherche : un mot libre, un domaine, et le
                raccourci vers ce que l'assistant juge le plus approprie. Elle
                reste en haut pendant qu'on fait defiler la liste.
              */}
              <div className="sticky top-0 z-10 -mx-5 flex flex-col gap-2.5 border-b border-ink-100 bg-white px-5 pb-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative min-w-56 flex-1">
                    <span className="sr-only">Chercher un contrôle</span>
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Chercher : un code, un mot du titre, un motif, un outil…"
                      className="w-full rounded-md border border-ink-200 bg-white py-1.5 pl-8 pr-2.5 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                    />
                    <span aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOnlyRecommended((v) => !v)}
                    aria-pressed={onlyRecommended}
                    className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                      onlyRecommended
                        ? 'border-brand-600 bg-brand-500/10 text-brand-700'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-100'
                    }`}
                    title="Déclenchés par un fait de la fiche, ou rendus obligatoires par le référentiel."
                  >
                    ★ Les plus appropriés · {recommendedCount}
                  </button>
                  {filtering ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        setDomain(null)
                        setOnlyRecommended(false)
                      }}
                      className="shrink-0 text-xs text-ink-500 hover:underline"
                    >
                      Tout afficher
                    </button>
                  ) : null}
                </div>
                {domains.length > 1 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {domains.map((d) => (
                      <button
                        key={d.code}
                        type="button"
                        onClick={() => setDomain((prev) => (prev === d.code ? null : d.code))}
                        aria-pressed={domain === d.code}
                        title={d.name}
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${
                          domain === d.code
                            ? 'border-night-900 bg-night-900 text-white'
                            : 'border-ink-200 text-ink-600 hover:bg-ink-100'
                        }`}
                      >
                        {d.code} <span className="tabular-nums opacity-70">{d.count}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {filtering ? (
                  <p className="text-xs text-ink-500">
                    {visible.length} affiché(s) sur {proposals.length}
                    {domain ? ` · ${domains.find((d) => d.code === domain)?.name}` : ''}
                  </p>
                ) : null}
              </div>

              {filtering && !visible.length ? (
                <p className="rounded-md border border-dashed border-ink-200 px-3.5 py-3 text-sm text-ink-600">
                  Aucune proposition ne correspond. Un contrôle absent d’ici n’est pas forcément absent du
                  référentiel : les contrôles de portée organisation, et ceux qu’aucun fait de la fiche ne
                  déclenche, s’ajoutent depuis le registre des contrôles.
                </p>
              ) : null}

              {tiers.map(({ tier, items }) => {
                const ids = items.filter((p) => p.state !== 'already_affected').map((p) => p.catalog_control_id)
                const open = filtering || openTiers.has(tier)
                return (
                  <section key={tier} className="rounded-md border border-ink-200">
                    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleTier(tier)}
                        aria-expanded={open}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-sm font-semibold text-ink-900">
                          {TIER_LABELS[tier].title}{' '}
                          <span className="font-normal text-ink-500">· {items.length}</span>
                        </span>
                        <span className="block text-xs text-ink-500">{TIER_LABELS[tier].hint}</span>
                      </button>
                      {ids.length ? (
                        <button
                          type="button"
                          onClick={() => checkAll(ids)}
                          className="shrink-0 text-xs text-brand-600 hover:underline"
                        >
                          {ids.every((id) => checked.has(id)) ? 'Tout décocher' : 'Tout cocher'}
                        </button>
                      ) : null}
                    </div>

                    {open ? (
                      <ul className="divide-y divide-ink-100 border-t border-ink-100">
                        {items.map((p) => {
                          const affected = p.state === 'already_affected'
                          return (
                            <li key={p.catalog_control_id} className={`px-3.5 py-2.5 ${affected ? 'opacity-60' : ''}`}>
                              <label className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  disabled={affected}
                                  checked={affected || checked.has(p.catalog_control_id)}
                                  onChange={() => toggle(p.catalog_control_id)}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="font-mono text-xs text-ink-400">{p.code}</span>
                                    <span className="font-medium text-ink-900">{p.title}</span>
                                    {isRecommended(p) ? (
                                      <span
                                        className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-700"
                                        title={p.mandatory ? 'Obligatoire au référentiel.' : 'Déclenché par un fait de la fiche.'}
                                      >
                                        ★ {p.mandatory ? 'obligatoire' : 'déclenché'}
                                      </span>
                                    ) : null}
                                    {p.state === 'already_affected' ? (
                                      <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-600">
                                        {organizationMode ? 'déjà dans la liste' : 'déjà affecté'}
                                      </span>
                                    ) : p.state === 'operational_not_affected' ? (
                                      <span className="rounded bg-warn-600/10 px-1.5 py-0.5 text-[10px] text-warn-600">dans la liste, à affecter</span>
                                    ) : (
                                      <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] text-brand-700">à ajouter depuis le référentiel</span>
                                    )}
                                  </span>
                                  <span className="mt-0.5 block text-xs text-ink-500">
                                    {p.domain_code} · {p.domain_name}
                                    {p.phase ? ` · ${p.phase}` : ''}
                                  </span>
                                  <span className="mt-1 block text-xs leading-relaxed text-ink-700">
                                    {p.reasons.join(' ')}
                                  </span>
                                  {p.tools.length ? (
                                    <span className="mt-1 block text-xs text-ink-500">
                                      Se tient avec :{' '}
                                      {p.tools.map((t) => t.acronym ?? t.code).join(', ')}
                                    </span>
                                  ) : null}
                                </span>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}
                  </section>
                )
              })}
              {!organizationMode && notProposed.length ? (
                <details open={Boolean(needle)} className="rounded-md border border-dashed border-ink-200 px-3.5 py-2.5">
                  <summary className="cursor-pointer text-sm text-ink-600">
                    Non proposés · {notProposed.length}
                    <span className="block text-xs text-ink-400">Conditionnels qu’aucun fait de la fiche ne déclenche — et ce qui les déclencherait.</span>
                  </summary>
                  <ul className="mt-2 divide-y divide-ink-100">
                    {notProposed.map((n) => (
                      <li key={n.code} className="py-1.5 text-xs">
                        <span className="text-ink-800">{n.code} — {n.title}</span>
                        <span className="block text-ink-400">
                          {n.domain_name} · se déclencherait par : {n.triggers.length ? n.triggers.map((t) => FACT_LABELS[t] ?? t).join(', ') : 'aucune règle'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          )}

          <FormFeedback state={state} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-ink-500">{checked.size} coché(s)</span>
            <Submit pending={pending} idle={`Retenir la sélection${checked.size ? ` (${checked.size})` : ''}`} />
          </div>
        </form>
      )}
    </Modal>
  )
}
