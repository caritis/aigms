'use client'

import { useActionState, useEffect, useState } from 'react'
import { placeMeasureOnAsset, setControlApplicability, type FormState } from '@/lib/actions/controls'
import { retainTooling, saveTooling } from '@/lib/actions/tooling'
import { createClient } from '@/lib/supabase/client'
import { Field, FIELD, FormFeedback, Submit } from '@/components/forms'
import { Modal } from '@/components/modal'
import { ASSET_KIND_LABELS, ASSET_MEASURE_STATUS_LABELS } from '@/lib/domain/governance'
import type { ControlToolingView } from '@/components/governance/tooling-forms'

/**
 * La fiche d'un controle sur ce cas d'usage, en une fenetre.
 *
 * Elle repond a trois questions qui se posaient sur trois boutons differents,
 * alignes sur la meme ligne : ce controle s'applique-t-il ici, sur QUOI se
 * pose-t-il, et AVEC QUOI se tient-il. Les trois se lisent ensemble — poser
 * une mesure sur un actif n'a de sens que si elle est applicable, et
 * l'outillage est ce qui la rend prouvable.
 *
 * Elle porte aussi la distinction que l'ecran laissait floue :
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
 * dire ici, au moment ou l'on choisit, evite de les confondre.
 */

const ROLE_HINTS: Record<string, string> = {
  system_resource: 'ressource du système',
  both: 'instrument et ressource',
}

export function ControlApplicabilityModal({
  organizationId,
  useCaseId,
  control,
  current,
  justification,
  assets,
  carriers,
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
}) {
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
    >
      {() => (
        <div className="flex flex-col gap-6">
          <ApplicabilitySection
            useCaseId={useCaseId}
            control={control}
            current={current}
            justification={justification}
          />
          {technical ? (
            <AssetSection useCaseId={useCaseId} control={control} assets={assets} carriers={carriers} />
          ) : null}
          <ToolingSection organizationId={organizationId} control={control} />
        </div>
      )}
    </Modal>
  )
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-100 pt-5 first:border-0 first:pt-0">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <p className="mb-3 mt-0.5 text-xs leading-relaxed text-ink-500">{hint}</p>
      {children}
    </section>
  )
}

function ApplicabilitySection({
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
    <Section
      title="Applicabilité"
      hint="Ce que ce cas d’usage retient du contrôle — et pourquoi, si on l’écarte."
    >
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
            rows={3}
            defaultValue={justification ?? ''}
            className={FIELD}
          />
        </Field>
        <FormFeedback state={state} />
        <Submit pending={pending} idle="Statuer" />
      </form>
    </Section>
  )
}

/**
 * Sur quel actif d'IA la mesure se pose.
 *
 * Elle ne « s'applique » pas au cas d'usage en l'air : elle se tient sur ce
 * modele, ce systeme, ce jeu de donnees — et c'est la qu'on la prouve.
 */
function AssetSection({
  useCaseId,
  control,
  assets,
  carriers,
}: {
  useCaseId: string
  control: { id: string; code: string; name: string }
  assets: { asset_id: string; name: string; kind: string }[]
  carriers: { asset_id: string; name: string; status: string; note: string | null }[]
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(placeMeasureOnAsset, null)
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}
  const placed = carriers.map((c) => c.asset_id)
  const remaining = assets.filter((a) => !placed.includes(a.asset_id))

  return (
    <Section
      title="Actifs d’IA qui la portent"
      hint="Un actif d’IA est ce que le cas d’usage emploie — un modèle, un agent, un système, un jeu de données. Une mesure technique se pose dessus ; c’est là qu’elle se prouve."
    >
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
        <p className="mb-3 text-sm text-warn-600">
          Aucun actif ne porte encore cette mesure : en l’état, elle est énoncée sans être posée.
        </p>
      )}

      {assets.length ? (
        <form action={formAction} className="flex flex-col gap-4 rounded-md border border-ink-200 p-3.5">
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
          <FormFeedback state={state} />
          <Submit pending={pending} idle="Poser la mesure" />
        </form>
      ) : (
        <p className="rounded-md border border-dashed border-ink-200 px-3.5 py-2.5 text-sm text-ink-600">
          Aucun actif d’IA n’est rattaché à ce cas d’usage. Rattachez d’abord le modèle, l’agent, le
          système ou le jeu de données employé, depuis l’onglet <strong className="font-medium">Avancement</strong>.
        </p>
      )}
    </Section>
  )
}

/**
 * Avec quoi le controle se tient.
 *
 * La vue ne se charge qu'a l'ouverture : la lire pour chacun des contrôles
 * affiches ferait autant de requetes pour un geste rare.
 */
function ToolingSection({
  organizationId,
  control,
}: {
  organizationId: string
  control: { id: string; code: string }
}) {
  const [view, setView] = useState<ControlToolingView | null>(null)
  const [failed, setFailed] = useState(false)
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(retainTooling, null)
  const [declareState, declareAction, declaring] = useActionState<FormState | null, FormData>(
    saveTooling,
    null,
  )
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)
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
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [control.id, declareState])

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const hint =
    'Un outillage est ce AVEC QUOI la mesure se tient — passerelle, DLP, journalisation, supervision humaine. Il n’est pas l’actif gouverné : c’est l’instrument, et c’est de lui que la preuve se prend.'

  if (failed) {
    return (
      <Section title="Avec quoi il se tient" hint={hint}>
        <p className="text-sm text-ink-500">La carte d’outillage n’a pas pu être lue.</p>
      </Section>
    )
  }
  if (!loaded || !view) {
    return (
      <Section title="Avec quoi il se tient" hint={hint}>
        <p className="text-sm text-ink-400">Lecture…</p>
      </Section>
    )
  }

  const suggestedIds = new Set(view.suggested.flatMap((s) => s.declared.map((d) => d.id)))

  return (
    <Section title="Avec quoi il se tient" hint={hint}>
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
            <legend className="mb-1 text-xs font-medium text-ink-700">Outils déclarés par l’organisation</legend>
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
            Aucun outil n’est encore déclaré pour cette organisation. Nommez-en un ci-dessous, ou
            tenez la carte complète depuis{' '}
            <strong className="font-medium">Registres → Contrôles et outillages → Outillage</strong>.
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
        Declarer le produit sans quitter la fiche.
        L'ordre du referentiel — une famille, puis le produit employe chez
        nous — obligeait a partir au registre de l'outillage, y trouver la
        bonne famille, revenir. Ici la famille est deja celle que le controle
        appelle : il ne reste que le nom du produit.
      */}
      {view.suggested.length ? (
        <form action={declareAction} className="mt-4 flex flex-col gap-3 rounded-md border border-ink-200 p-3.5">
          <input type="hidden" name="organizationId" value={organizationId} />
          <p className="text-xs font-medium text-ink-700">Déclarer un produit sur une famille attendue</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Famille du référentiel" htmlFor={`fam-${control.id}`}>
              <select id={`fam-${control.id}`} name="toolCode" defaultValue={view.suggested[0]?.code} className={FIELD}>
                {view.suggested.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.acronym ? `${f.acronym} — ${f.name}` : f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Produit employé"
              htmlFor={`prod-${control.id}`}
              hint={
                view.suggested[0]?.examples.length
                  ? `Par exemple : ${view.suggested[0].examples.slice(0, 3).join(', ')}.`
                  : undefined
              }
            >
              <input id={`prod-${control.id}`} name="product" type="text" required className={FIELD} />
            </Field>
          </div>
          <Field label="À quel titre" htmlFor={`role-${control.id}`}>
            <select id={`role-${control.id}`} name="role" defaultValue="control_instrument" className={FIELD}>
              <option value="control_instrument">Instrument d’un contrôle</option>
              <option value="system_resource">Ressource d’un système d’IA</option>
              <option value="both">Les deux</option>
            </select>
          </Field>
          <FormFeedback state={declareState} />
          <Submit pending={declaring} idle="Déclarer le produit" />
        </form>
      ) : null}
    </Section>
  )
}
