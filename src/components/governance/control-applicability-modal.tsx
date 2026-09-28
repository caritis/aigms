'use client'

import { useActionState, useEffect, useState } from 'react'
import { placeMeasureOnAsset, setControlApplicability, type FormState } from '@/lib/actions/controls'
import { retainTooling, saveTooling } from '@/lib/actions/tooling'
import { declareAssetForUseCase, linkAssetToUseCase } from '@/lib/actions/registry'
import { createClient } from '@/lib/supabase/client'
import { Field, FIELD, FormFeedback, Submit } from '@/components/forms'
import { Modal } from '@/components/modal'
import { InfoTip } from '@/components/info-tip'
import { ASSET_KIND_LABELS, ASSET_MEASURE_STATUS_LABELS } from '@/lib/domain/governance'
import type { ControlToolingView } from '@/components/governance/tooling-forms'

/**
 * La fiche d'un controle sur ce cas d'usage, en trois onglets.
 *
 * Elle repond a trois questions qui se posaient sur trois boutons alignes sur
 * la meme ligne : ce controle s'applique-t-il ici, sur QUOI se pose-t-il, et
 * AVEC QUOI se tient-il. Empilees, elles faisaient une fenetre qu'on faisait
 * defiler sans savoir ou l'on en etait ; separees, chacune tient dans un
 * ecran.
 *
 * Elle porte aussi la distinction que l'interface laissait floue :
 *
 *   — un **actif d'IA** est ce que le cas d'usage EMPLOIE : un modele, un
 *     agent, un systeme, un jeu de donnees. C'est l'objet gouverne, et c'est
 *     sur lui qu'une mesure technique se pose ;
 *   — un **outillage** est ce avec quoi on TIENT la mesure : une passerelle,
 *     un DLP, un SIEM, un dispositif de supervision humaine. C'est
 *     l'instrument, et c'est de lui que la preuve se prend.
 *
 * Le meme produit peut etre les deux — une passerelle d'IA est un instrument
 * de controle et une ressource du systeme — et c'est precisement pourquoi le
 * dire ici, au moment ou l'on choisit.
 *
 * Les deux onglets de rattachement savent aussi CREER : rien ne se rattache
 * quand le registre est vide, et renvoyer au registre fait perdre le fil.
 */

const ROLE_HINTS: Record<string, string> = {
  system_resource: 'ressource du système',
  both: 'instrument et ressource',
}

const ASSET_KINDS = [
  ['ai_system', 'Système d’IA'],
  ['ai_model', 'Modèle'],
  ['ai_agent', 'Agent'],
  ['dataset', 'Jeu de données'],
] as const

type Onglet = 'applicabilite' | 'actifs' | 'outillage'

const ONGLETS: { key: Onglet; label: string }[] = [
  { key: 'applicabilite', label: 'Applicabilité' },
  { key: 'actifs', label: 'Actifs d’IA' },
  { key: 'outillage', label: 'Outillage' },
]

export function ControlApplicabilityModal({
  organizationId,
  useCaseId,
  control,
  current,
  justification,
  assets,
  carriers,
  attachableAssets,
}: {
  organizationId: string
  useCaseId: string
  control: { id: string; code: string; name: string; measure_kind: string }
  current: string
  justification: string | null
  /** Les actifs d'IA rattaches au cas d'usage — ce sur quoi une mesure se pose. */
  assets: { asset_id: string; name: string; kind: string }[]
  /** Ceux qui portent deja cette mesure, avec son etat sur chacun. */
  carriers: { asset_id: string; name: string; status: string; note: string | null }[]
  /** Les actifs du registre que ce cas d'usage n'emploie pas encore. */
  attachableAssets: { id: string; name: string; kind: string }[]
}) {
  const [onglet, setOnglet] = useState<Onglet>('applicabilite')
  const technical = (control.measure_kind ?? 'organizational') === 'technical'

  return (
    <Modal
      closeOnSuccess={false}
      trigger={
        <span aria-hidden className="text-sm leading-none">
          ✎
        </span>
      }
      triggerLabel={`Statuer ${control.code} : applicabilité, actifs, outillage`}
      triggerClassName="inline-flex size-6 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-ink-400 hover:text-ink-800"
      title={`${control.code} — ${control.name}`}
      description="Ce contrôle s’applique-t-il ici, sur quel actif se pose-t-il, avec quel outillage se tient-il."
      headerAside={
        <InfoTip sign="!" label="À quoi servent ces trois onglets" title="Lire cette fenêtre">
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-600">
            <p>
              Trois questions se répondent ensemble, et une seule d’elles était posée jusqu’ici.
            </p>
            <p>
              <strong className="font-medium text-ink-800">Applicabilité.</strong> Ce que{' '}
              <em>ce cas d’usage</em> retient du contrôle. « Non applicable » exige une
              justification : c’est la première chose qu’un auditeur relève.
            </p>
            <p>
              <strong className="font-medium text-ink-800">Actifs d’IA.</strong> Ce que le cas
              d’usage <strong className="font-medium text-ink-800">emploie</strong> — un modèle,
              un agent, un système, un jeu de données. C’est l’objet gouverné. Une mesure technique
              se pose <em>dessus</em> : une mesure qui ne repose sur aucun actif est une phrase,
              pas un dispositif.
            </p>
            <p>
              <strong className="font-medium text-ink-800">Outillage.</strong> Ce{' '}
              <strong className="font-medium text-ink-800">avec quoi</strong> la mesure se tient —
              passerelle, DLP, journalisation, supervision humaine. Ce n’est pas l’objet gouverné :
              c’est l’instrument, et c’est de lui que la preuve se prend.
            </p>
            <p>
              Un même produit peut être les deux. Une passerelle d’appels d’IA est un instrument de
              contrôle <em>et</em> une ressource du système : elle se déclare alors « les deux ».
            </p>
            <p className="text-ink-500">
              Les deux derniers onglets savent aussi <em>créer</em> : rien ne se rattache quand le
              registre est vide, et vous renvoyer au registre vous ferait perdre le fil.
            </p>
          </div>
        </InfoTip>
      }
    >
      {() => (
        <div className="flex flex-col">
          <nav
            aria-label="Rubriques du contrôle"
            className="onglets-defilants -mx-5 -mt-5 mb-4 flex gap-1 border-b border-ink-200 px-5"
          >
            {ONGLETS.map((o) => {
              const actif = o.key === onglet
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setOnglet(o.key)}
                  aria-current={actif ? 'page' : undefined}
                  className={`-mb-px shrink-0 whitespace-nowrap rounded-t-md border-b-[3px] px-3.5 py-2.5 text-sm transition-colors ${
                    actif
                      ? 'border-brand-600 bg-brand-500/10 font-semibold text-brand-700'
                      : 'border-transparent text-ink-500 hover:border-ink-300 hover:bg-ink-100 hover:text-ink-900'
                  }`}
                >
                  {o.label}
                </button>
              )
            })}
          </nav>

          {/*
            Le corps defile, pas la page : on garde les onglets sous les yeux,
            et l'on sait toujours dans laquelle des trois questions on est.
          */}
          <div className="max-h-[60vh] min-h-0 overflow-y-auto pr-1">
            {onglet === 'applicabilite' ? (
              <ApplicabilityPanel
                useCaseId={useCaseId}
                control={control}
                current={current}
                justification={justification}
              />
            ) : onglet === 'actifs' ? (
              <AssetPanel
                organizationId={organizationId}
                useCaseId={useCaseId}
                control={control}
                technical={technical}
                assets={assets}
                carriers={carriers}
                attachableAssets={attachableAssets}
              />
            ) : (
              <ToolingPanel organizationId={organizationId} control={control} />
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function Intro({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs leading-relaxed text-ink-500">{children}</p>
}

function ApplicabilityPanel({
  useCaseId,
  control,
  current,
  justification,
}: {
  useCaseId: string
  control: { id: string }
  current: string
  justification: string | null
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(
    setControlApplicability,
    null,
  )
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  return (
    <>
      <Intro>
        Ce que ce cas d’usage retient du contrôle — et pourquoi, si on l’écarte.
      </Intro>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="useCaseId" value={useCaseId} />
        <input type="hidden" name="controlId" value={control.id} />
        <Field label="Applicabilité" htmlFor={`app-status-${control.id}`}>
          <select id={`app-status-${control.id}`} name="status" defaultValue={current} className={FIELD}>
            <option value="applicable">Applicable</option>
            <option value="not_applicable">Non applicable</option>
            <option value="to_determine">À déterminer</option>
          </select>
        </Field>
        <Field
          label="Justification"
          htmlFor={`app-justification-${control.id}`}
          error={errors.justification}
          hint="Obligatoire pour une exclusion : un « non applicable » silencieux est ce qu’un auditeur relève en premier."
        >
          <textarea
            id={`app-justification-${control.id}`}
            name="justification"
            rows={4}
            defaultValue={justification ?? ''}
            className={FIELD}
          />
        </Field>
        <FormFeedback state={state} />
        <Submit pending={pending} idle="Statuer" />
      </form>
    </>
  )
}

/**
 * Sur quel actif d'IA la mesure se pose — et comment en obtenir un.
 *
 * Trois gestes, du plus courant au plus rare : poser la mesure sur un actif
 * deja rattache, rattacher un actif du registre, inscrire un actif qui n'y est
 * pas encore.
 */
function AssetPanel({
  organizationId,
  useCaseId,
  control,
  technical,
  assets,
  carriers,
  attachableAssets,
}: {
  organizationId: string
  useCaseId: string
  control: { id: string; code: string; name: string }
  technical: boolean
  assets: { asset_id: string; name: string; kind: string }[]
  carriers: { asset_id: string; name: string; status: string; note: string | null }[]
  attachableAssets: { id: string; name: string; kind: string }[]
}) {
  const [poser, poserAction, poserPending] = useActionState<FormState | null, FormData>(
    placeMeasureOnAsset,
    null,
  )
  const [lier, lierAction, lierPending] = useActionState<FormState | null, FormData>(
    linkAssetToUseCase,
    null,
  )
  const [creer, creerAction, creerPending] = useActionState<FormState | null, FormData>(
    declareAssetForUseCase,
    null,
  )
  const errors = poser && !poser.ok ? (poser.fieldErrors ?? {}) : {}
  const placed = carriers.map((c) => c.asset_id)
  const remaining = assets.filter((a) => !placed.includes(a.asset_id))

  return (
    <>
      <Intro>
        Un actif d’IA est ce que le cas d’usage <strong className="font-medium text-ink-700">emploie</strong> —
        un modèle, un agent, un système, un jeu de données. C’est l’objet gouverné.{' '}
        {technical
          ? 'Cette mesure est technique : elle se pose dessus, et c’est là qu’elle se prouve.'
          : 'Cette mesure n’est pas technique : elle se tient sur l’organisation ou chez un fournisseur, pas sur un actif. Ce qui suit reste utile pour savoir ce que le cas d’usage emploie.'}
      </Intro>

      {technical ? (
        <section className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-900">Ce qui porte la mesure</h3>
          {carriers.length ? (
            <ul className="mb-3 flex flex-col gap-1.5">
              {carriers.map((c) => (
                <li key={c.asset_id} className="flex flex-wrap items-baseline gap-2 text-sm text-ink-800">
                  <span>{c.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      c.status === 'verified' || c.status === 'implemented'
                        ? 'bg-ok-600/10 text-ok-600'
                        : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {ASSET_MEASURE_STATUS_LABELS[c.status] ?? c.status}
                  </span>
                  {c.note ? <span className="text-xs text-ink-500">{c.note}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 rounded-md border border-warn-600/25 bg-warn-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
              Aucun actif ne porte encore cette mesure : en l’état, elle est énoncée sans être posée.
            </p>
          )}

          {assets.length ? (
            <form action={poserAction} className="flex flex-col gap-4 rounded-md border border-ink-200 p-3.5">
              <input type="hidden" name="useCaseId" value={useCaseId} />
              <input type="hidden" name="controlId" value={control.id} />
              <Field label="Poser sur l’actif" htmlFor={`am-asset-${control.id}`} error={errors.assetId}>
                <select id={`am-asset-${control.id}`} name="assetId" required defaultValue="" className={FIELD}>
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {(remaining.length ? remaining : assets).map((a) => (
                    <option key={a.asset_id} value={a.asset_id}>
                      {a.name} — {ASSET_KIND_LABELS[a.kind] ?? a.kind}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="État sur cet actif" htmlFor={`am-status-${control.id}`}>
                  <select id={`am-status-${control.id}`} name="status" defaultValue="planned" className={FIELD}>
                    {Object.entries(ASSET_MEASURE_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Note" htmlFor={`am-note-${control.id}`} optional hint="Comment elle est mise en œuvre ici.">
                  <input id={`am-note-${control.id}`} name="note" type="text" className={FIELD} />
                </Field>
              </div>
              <FormFeedback state={poser} />
              <Submit pending={poserPending} idle="Poser la mesure" />
            </form>
          ) : (
            <p className="rounded-md border border-dashed border-ink-200 px-3.5 py-2.5 text-sm text-ink-600">
              Aucun actif d’IA n’est rattaché à ce cas d’usage. Rattachez-en un ci-dessous, ou
              inscrivez-le : la mesure aura alors où se poser.
            </p>
          )}
        </section>
      ) : null}

      <section className="mb-5 border-t border-ink-100 pt-5">
        <h3 className="mb-1 text-sm font-semibold text-ink-900">
          Rattacher un actif déjà inscrit au registre
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-ink-500">
          Un actif se décrit une fois et se lit ensuite depuis tous ses cas d’usage. Son
          fournisseur le suit : une revue tiers non close deviendra une précondition de production.
        </p>
        {attachableAssets.length ? (
          <form action={lierAction} className="flex flex-col gap-3">
            <input type="hidden" name="useCaseId" value={useCaseId} />
            <Field label="Actif du registre" htmlFor={`link-asset-${control.id}`}>
              <select id={`link-asset-${control.id}`} name="assetId" required defaultValue="" className={FIELD}>
                <option value="" disabled>
                  Choisir…
                </option>
                {attachableAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {ASSET_KIND_LABELS[a.kind] ?? a.kind}
                  </option>
                ))}
              </select>
            </Field>
            <FormFeedback state={lier} />
            <Submit pending={lierPending} idle="Rattacher" />
          </form>
        ) : (
          <p className="text-sm text-ink-600">
            {assets.length
              ? 'Tous les actifs du registre sont déjà rattachés à ce cas d’usage.'
              : 'Le registre des actifs de cette organisation est vide. Inscrivez-en un ci-dessous.'}
          </p>
        )}
      </section>

      <section className="border-t border-ink-100 pt-5">
        <h3 className="mb-1 text-sm font-semibold text-ink-900">Inscrire un actif, et le rattacher</h3>
        <p className="mb-3 text-xs leading-relaxed text-ink-500">
          Le minimum qui fasse un actif identifiable. Le reste — version, fournisseur, responsable,
          description — se complète depuis sa fiche, au registre des actifs.
        </p>
        <form action={creerAction} className="flex flex-col gap-3 rounded-md border border-ink-200 p-3.5">
          <input type="hidden" name="useCaseId" value={useCaseId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nature" htmlFor={`new-kind-${control.id}`}>
              <select id={`new-kind-${control.id}`} name="kind" defaultValue="ai_system" className={FIELD}>
                {ASSET_KINDS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nom" htmlFor={`new-name-${control.id}`}>
              <input id={`new-name-${control.id}`} name="name" type="text" required className={FIELD} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Hébergement"
              htmlFor={`new-host-${control.id}`}
              optional
              hint="Où il tourne. Un hébergement hors Union européenne se lit ici."
            >
              <input id={`new-host-${control.id}`} name="hostingLocation" type="text" className={FIELD} />
            </Field>
            <label className="flex items-start gap-2.5 self-end pb-2 text-sm">
              <input type="checkbox" name="containsPersonalData" className="mt-0.5 size-4 rounded border-ink-300" />
              <span className="min-w-0">
                Contient des données personnelles
                <span className="block text-xs text-ink-400">
                  Ce fait remonte au cas d’usage et déclenche des contrôles.
                </span>
              </span>
            </label>
          </div>
          <FormFeedback state={creer} />
          <Submit pending={creerPending} idle="Inscrire et rattacher" />
        </form>
      </section>
    </>
  )
}

/**
 * Avec quoi le controle se tient.
 *
 * La vue ne se charge qu'a l'ouverture de l'onglet : la lire pour chacun des
 * controles affiches ferait autant de requetes pour un geste rare.
 */
function ToolingPanel({
  organizationId,
  control,
}: {
  organizationId: string
  control: { id: string; code: string }
}) {
  const [view, setView] = useState<ControlToolingView | null>(null)
  const [familles, setFamilles] = useState<
    { code: string; acronym: string | null; name: string; examples: string[] }[]
  >([])
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(retainTooling, null)
  const [declareState, declareAction, declaring] = useActionState<FormState | null, FormData>(
    saveTooling,
    null,
  )
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [famille, setFamille] = useState('')

  /*
    La vue se relit a chaque declaration : le produit qu'on vient de nommer
    doit apparaitre dans la liste a cocher, sans fermer la fenetre.
  */
  useEffect(() => {
    let cancelled = false
    void createClient()
      .rpc('control_tooling_view', { p_control_id: control.id })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setFailed(true)
          return
        }
        const v = data as unknown as ControlToolingView
        setView(v)
        setChecked((prev) => (prev.size ? prev : new Set(v.retained.map((r) => r.tooling_id))))
        setFamille((prev) => prev || v.suggested[0]?.code || '')
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [control.id, declareState])

  /*
    Toutes les familles du referentiel, pas seulement celles que ce controle
    appelle : l'outil qu'on emploie n'est pas toujours celui que la typologie
    attendait, et s'en tenir aux suggestions obligeait a repartir au registre.
  */
  useEffect(() => {
    let cancelled = false
    void createClient()
      .from('catalog_tool')
      .select('code, acronym, tool_service, tool_examples')
      .order('tool_service')
      .then(({ data }) => {
        if (cancelled || !data) return
        setFamilles(
          data.map((f) => ({
            code: f.code as string,
            acronym: (f.acronym as string | null) ?? null,
            name: (f.tool_service as string) ?? (f.code as string),
            examples: ((f.tool_examples as unknown as string[]) ?? []).filter(Boolean),
          })),
        )
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (failed) {
    return <p className="text-sm text-ink-500">La carte d’outillage n’a pas pu être lue.</p>
  }
  if (!loaded || !view) {
    return <p className="text-sm text-ink-400">Lecture…</p>
  }

  const suggestedIds = new Set(view.suggested.flatMap((s) => s.declared.map((d) => d.id)))
  const codesSuggeres = new Set(view.suggested.map((s) => s.code))
  const autres = familles.filter((f) => !codesSuggeres.has(f.code))
  const familleChoisie = familles.find((f) => f.code === famille)

  return (
    <>
      <Intro>
        Un outillage est ce <strong className="font-medium text-ink-700">avec quoi</strong> la
        mesure se tient — passerelle, DLP, journalisation, supervision humaine. Il n’est pas
        l’actif gouverné : c’est l’instrument, et c’est de lui que la preuve se prend.
      </Intro>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="organizationId" value={organizationId} />
        <input type="hidden" name="controlId" value={control.id} />

        {view.signal?.needs_tooling ? (
          <p className="rounded-md border border-warn-600/25 bg-warn-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
            <strong className="font-medium text-ink-900">Contrôle de nature technique, sans outillage
            retenu.</strong> Il énonce un moyen sans le nommer : en l’état, il ne se prouve pas.
          </p>
        ) : null}
        {view.signal?.evidence_automatable ? (
          <p className="rounded-md border border-brand-600/25 bg-brand-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
            <strong className="font-medium text-ink-900">Sa preuve pourrait être automatique.</strong> Un
            outil retenu ici a son connecteur actif, et ce contrôle n’a aucune preuve validée et fraîche.
          </p>
        ) : null}

        {view.suggested.length ? (
          <p className="rounded-md bg-ink-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
            Le référentiel AIGMS suggère : {view.suggested.map((s) => s.acronym ?? s.name).join(', ')}.
          </p>
        ) : null}

        {view.available.length ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-medium text-ink-700">
              Outils déclarés par l’organisation
            </legend>
            {view.available.map((tool) => (
              <label key={tool.id} className="flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  name="toolingIds"
                  value={tool.id}
                  checked={checked.has(tool.id)}
                  onChange={() => toggle(tool.id)}
                  className="mt-0.5 size-4 rounded border-ink-300"
                />
                <span className="min-w-0">
                  {tool.product}
                  <span className="block text-xs text-ink-400">
                    {tool.family ?? tool.tool_code}
                    {ROLE_HINTS[tool.role] ? ` · ${ROLE_HINTS[tool.role]}` : ''}
                    {suggestedIds.has(tool.id) ? ' · suggéré par le référentiel' : ''}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="rounded-md border border-dashed border-ink-200 px-3.5 py-2.5 text-sm text-ink-600">
            Aucun outil n’est encore déclaré pour cette organisation. Nommez-en un ci-dessous.
          </p>
        )}

        <Field
          label="Pourquoi ce choix"
          htmlFor={`why-${control.id}`}
          optional
          hint="Ce que l’outil couvre pour ce contrôle, et où sa preuve se prend."
        >
          <textarea
            id={`why-${control.id}`}
            name="rationale"
            rows={2}
            defaultValue={view.retained[0]?.rationale ?? ''}
            className={FIELD}
          />
        </Field>

        <FormFeedback state={state} />
        <Submit pending={pending} idle="Retenir" />
      </form>

      {/*
        Declarer le produit sans quitter la fiche. La famille se choisit dans
        TOUT le referentiel : celles que ce controle appelle d'abord, puis les
        autres — l'outil qu'on emploie n'est pas toujours celui que la
        typologie attendait.
      */}
      <section className="mt-5 border-t border-ink-100 pt-5">
        <h3 className="mb-1 text-sm font-semibold text-ink-900">Déclarer un produit</h3>
        <p className="mb-3 text-xs leading-relaxed text-ink-500">
          Une famille du référentiel, le produit employé chez vous. Ce n’est pas un inventaire du
          système d’information : pas d’instances, pas de versions, pas de dépendances.
        </p>
        <form action={declareAction} className="flex flex-col gap-3 rounded-md border border-ink-200 p-3.5">
          <input type="hidden" name="organizationId" value={organizationId} />
          <Field
            label="Famille du référentiel"
            htmlFor={`fam-${control.id}`}
            hint={
              familleChoisie?.examples.length
                ? `Exemples de cette famille : ${familleChoisie.examples.slice(0, 4).join(', ')}.`
                : undefined
            }
          >
            <select
              id={`fam-${control.id}`}
              name="toolCode"
              value={famille}
              onChange={(event) => setFamille(event.target.value)}
              required
              className={FIELD}
            >
              <option value="" disabled>
                Choisir…
              </option>
              {view.suggested.length ? (
                <optgroup label="Suggérées pour ce contrôle">
                  {view.suggested.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.acronym ? `${f.acronym} — ${f.name}` : f.name}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {autres.length ? (
                <optgroup label={`Toutes les familles du référentiel · ${familles.length}`}>
                  {autres.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.acronym ? `${f.acronym} — ${f.name}` : f.name}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Produit employé" htmlFor={`prod-${control.id}`}>
              <input id={`prod-${control.id}`} name="product" type="text" required className={FIELD} />
            </Field>
            <Field label="À quel titre" htmlFor={`role-${control.id}`}>
              <select id={`role-${control.id}`} name="role" defaultValue="control_instrument" className={FIELD}>
                <option value="control_instrument">Instrument d’un contrôle</option>
                <option value="system_resource">Ressource d’un système d’IA</option>
                <option value="both">Les deux</option>
              </select>
            </Field>
          </div>
          <FormFeedback state={declareState} />
          <Submit pending={declaring} idle="Déclarer le produit" />
        </form>
      </section>
    </>
  )
}
