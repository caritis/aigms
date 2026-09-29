'use client'

import { useActionState, useState, useTransition } from 'react'
import { Field, FIELD, FormFeedback, Submit } from '@/components/forms'
import { VendorPicker } from '@/components/governance/registry-forms'
import { Modal } from '@/components/modal'
import { removeTooling, retainTooling, saveTooling, type FormState } from '@/lib/actions/tooling'

/**
 * Declarer avec quoi l'organisation tient ses controles, et retenir ce qui
 * vaut pour un controle donne. Le referentiel propose une famille ; on y
 * inscrit le produit employe.
 */

/** À quel titre l'outil est déclaré. Les intitulés disent le texte qui le fonde. */
export const TOOLING_ROLES = [
  {
    value: 'control_instrument',
    label: 'Instrument d’un contrôle',
    hint: 'Il sert à tenir ou à prouver un contrôle — ISO/IEC 27002, RGPD art. 32.',
  },
  {
    value: 'system_resource',
    label: 'Ressource d’un système d’IA',
    hint: 'Il a servi à développer, entraîner, valider ou exploiter un système — ISO/IEC 42001 A.4.4, annexe IV de l’AI Act.',
  },
  {
    value: 'both',
    label: 'Les deux',
    hint: 'Une passerelle d’appels IA, un juge LLM, un assistant de code : instrument de contrôle et objet à gouverner.',
  },
] as const

export type ToolingRole = (typeof TOOLING_ROLES)[number]['value']

export type ToolFamily = {
  code: string
  acronym: string | null
  name: string
  domain: string | null
  phase: string | null
  definition: string | null
  /** Ce qui tient un controle d'IA, ou l'outillage informatique qui y concourt (0110). */
  scope: 'ai_core' | 'it_support'
  examples: string[]
  expected_evidence: string[]
  controls: number
  /** Les contrôles que cette famille sert, pour les nommer plutôt que les compter. */
  served_controls: {
    id: string
    code: string
    name: string
    status: string
    measure_kind: 'technical' | 'organizational' | 'contractual'
    retained: boolean
  }[]
  /** Une famille porte autant de produits que l'organisation en emploie (0095). */
  declared: DeclaredTool[]
}

export type DeclaredTool = {
  id: string
  product: string
  note: string | null
  role: ToolingRole
  vendor: { id: string; name: string; review_status: string } | null
  asset: { id: string; name: string; business_ref: string; kind: string } | null
  connector: { id: string; name: string; status: string } | null
  used_by: number
}

const errorsOf = (state: FormState | null) => (state && !state.ok ? (state.fieldErrors ?? {}) : {})

export function ToolingForm({
  organizationId,
  family,
  vendors,
  assets,
  declared = null,
}: {
  organizationId: string
  family: ToolFamily
  vendors: { id: string; name: string }[]
  /** Les actifs d'IA de l'organisation : un outil peut en être un. */
  assets: { id: string; name: string; business_ref: string }[]
  /** Le produit à corriger. Absent : on en ajoute un à la famille. */
  declared?: DeclaredTool | null
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(saveTooling, null)
  const errors = errorsOf(state)

  return (
    <Modal
      trigger={declared ? 'Corriger' : family.declared.length ? 'Ajouter un produit' : 'Déclarer le produit'}
      triggerClassName={
        declared
          ? 'text-xs text-brand-600 hover:underline'
          : 'rounded-md border border-ink-200 px-2.5 py-1 text-xs text-ink-700 hover:bg-ink-100'
      }
      title={family.name}
      description={family.definition ?? 'Avec quoi cette famille de contrôles se tient chez vous.'}
    >
      {() => (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="organizationId" value={organizationId} />
          <input type="hidden" name="toolCode" value={family.code} />
          {declared ? <input type="hidden" name="toolingId" value={declared.id} /> : null}

          {family.examples.length ? (
            <p className="rounded-md bg-ink-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
              Exemples de cette famille : {family.examples.join(', ')}. Inscrivez ce que vous employez
              réellement. Plusieurs produits par famille sont admis — un par ligne, chacun avec son
              fournisseur et son connecteur. Ce n’est pas pour autant un inventaire du SI : pas
              d’instances, pas de versions, pas de dépendances.
            </p>
          ) : null}

          <ToolingFields
            idSuffix={family.code}
            vendors={vendors}
            assets={assets}
            errors={errors}
            declared={declared}
            placeholder={family.examples[0]}
          />
          {family.expected_evidence.length ? (
            <p className="text-xs leading-relaxed text-ink-500">
              Ce que cette famille produit d’ordinaire comme preuve : {family.expected_evidence.join(', ')}.
            </p>
          ) : null}

          <FormFeedback state={state} />
          <Submit pending={pending} idle={declared ? 'Enregistrer' : 'Déclarer'} />
        </form>
      )}
    </Modal>
  )
}

/**
 * Ce qui decrit un produit d'outillage, et rien d'autre.
 *
 * Les memes champs servent a la carte d'outillage et a la fiche d'un controle,
 * ou l'on declare le produit sans quitter l'ecran. Deux formulaires jumeaux
 * divergent au premier ajout — et l'on demande le fournisseur d'un cote, pas
 * de l'autre, sans que personne ne l'ait decide.
 */
export function ToolingFields({
  idSuffix,
  vendors,
  assets,
  errors,
  declared = null,
  placeholder,
}: {
  idSuffix: string
  vendors: { id: string; name: string }[]
  assets: { id: string; name: string; business_ref: string }[]
  errors: Record<string, string>
  declared?: DeclaredTool | null
  placeholder?: string
}) {
  const [produit, setProduit] = useState(declared?.product ?? '')
  const [actif, setActif] = useState(declared?.asset?.id ?? '')

  /*
    Le meme produit, des deux cotes. « Netskope » declare comme outil alors
    qu'il figure deja au registre des actifs : c'est le cas qui fait douter de
    la distinction. L'ecran le reconnait au nom et propose le lien, au lieu de
    laisser saisir deux fois la meme chose sans le dire.

    La comparaison est volontairement lache — sans accents, sans casse, par
    inclusion : « Netskope » doit reconnaitre « Netskope DLP ».
  */
  const nu = (v: string) => v.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const homonyme =
    !actif && produit.trim().length > 2
      ? assets.find((a) => {
          const [x, y] = [nu(a.name), nu(produit)]
          return x === y || x.includes(y) || y.includes(x)
        })
      : undefined

  return (
    <>
      <Field label="Produit employé" htmlFor={`product-${idSuffix}`} error={errors.product}>
            <input
              id={`product-${idSuffix}`}
              name="product"
              type="text"
              required
              value={produit}
              onChange={(event) => setProduit(event.target.value)}
              className={FIELD}
              placeholder={placeholder ?? 'Nom du produit'}
            />
          </Field>

          {homonyme ? (
            <div className="-mt-1 rounded-md border border-brand-600/25 bg-brand-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
              <p>
                <strong className="font-medium text-ink-900">{homonyme.name}</strong> figure déjà au
                registre des actifs d’IA ({homonyme.business_ref}). Si c’est le même produit,
                rattachez-le : il ne sera pas saisi deux fois, et il sera à la fois gouverné et
                instrument.
              </p>
              <button
                type="button"
                onClick={() => setActif(homonyme.id)}
                className="mt-1.5 rounded-md border border-brand-600/40 bg-white px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-500/10"
              >
                C’est le même — les rattacher
              </button>
            </div>
          ) : null}

          {/*
            Le connecteur ne se choisit pas ici : brancher une source releve
            de l'administration de la plateforme, et la maniere dont un
            fournisseur ouvrira son API pour tirer les preuves reste a poser.
            La colonne existe en base, l'ecran ne la propose pas encore.
          */}
          <VendorPicker
            idPrefix={`tool-${idSuffix}`}
            vendors={vendors}
            error={errors.vendorId}
            defaultValue={declared?.vendor?.id ?? ''}
          />

          {/*
            « Déclaré à quel titre » ne se demande plus.

            Le champ posait, en abstrait, la question que l'ecran doit resoudre
            a la place de l'utilisateur : instrument d'un controle, ressource
            d'un systeme d'IA, ou les deux. C'etait exact, source, et c'est le
            moment precis ou l'on decrochait — parce qu'un produit n'est ni
            l'un ni l'autre EN SOI : il l'est par le role qu'il joue ici.

            Le role se DEDUIT donc : un outil declare depuis un controle en est
            l'instrument ; s'il est aussi un actif d'IA employe, il est les
            deux. La seule question posee est concrete, et repond a un fait que
            l'utilisateur connait.
          */}
          <Field
            label="Est-ce aussi un actif d’IA que vous employez ?"
            htmlFor={`asset-${idSuffix}`}
            optional
            hint="Une passerelle d’appels IA, un juge LLM, un assistant de code : ils appliquent vos règles ET traitent vos données."
          >
            <select
              id={`asset-${idSuffix}`}
              name="assetId"
              value={actif}
              onChange={(event) => setActif(event.target.value)}
              className={FIELD}
            >
              <option value="">Non — il sert seulement à tenir des contrôles</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.business_ref} — {a.name}</option>
              ))}
            </select>
          </Field>
          <p className="-mt-2 text-xs leading-relaxed text-ink-500">
            {actif
              ? 'Il sera déclaré « instrument et ressource » : vous le gouvernez, et vous gouvernez avec.'
              : 'Il sera déclaré « instrument d’un contrôle » : vous gouvernez avec, sans le gouverner lui-même.'}
          </p>

          <Field label="Note" htmlFor={`note-${idSuffix}`} optional hint="Version, périmètre, ce qu’il couvre et ce qu’il ne couvre pas.">
            <textarea id={`note-${idSuffix}`} name="note" rows={2} defaultValue={declared?.note ?? ''} className={FIELD} />
          </Field>
    </>
  )
}

export function RemoveToolingButton({
  organizationId,
  toolingId,
  product,
  usedBy,
}: {
  organizationId: string
  toolingId: string
  product: string
  usedBy: number
}) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const warn = usedBy
          ? `${product} est retenu par ${usedBy} contrôle(s). Le retirer les laissera sans outil. Continuer ?`
          : `Retirer ${product} de la carte ?`
        if (confirm(warn)) start(() => void removeTooling(organizationId, toolingId))
      }}
      className="text-xs text-ink-400 hover:text-stop-600 hover:underline disabled:opacity-50"
    >
      Retirer
    </button>
  )
}

// -----------------------------------------------------------------------------
// Ce qu'un controle retient
// -----------------------------------------------------------------------------
export type ControlToolingView = {
  /** Ce que le contrôle engage, et ce qui lui manque pour se prouver (0094). */
  signal: {
    measure_kind: 'technical' | 'organizational' | 'contractual'
    needs_tooling: boolean
    evidence_automatable: boolean
  } | null
  suggested: { code: string; acronym: string | null; name: string; examples: string[]; declared: { id: string; product: string }[] }[]
  retained: { id: string; tooling_id: string; product: string; family: string | null; rationale: string | null; role: ToolingRole }[]
  available: { id: string; tool_code: string; product: string; family: string | null; role: ToolingRole }[]
}

export function ControlToolingForm({
  organizationId,
  controlId,
  controlCode,
  view,
}: {
  organizationId: string
  controlId: string
  controlCode: string
  view: ControlToolingView
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(retainTooling, null)
  const [checked, setChecked] = useState<Set<string>>(new Set(view.retained.map((r) => r.tooling_id)))
  const suggestedIds = new Set(view.suggested.flatMap((s) => s.declared.map((d) => d.id)))

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Modal
      trigger={view.retained.length ? `Se tient avec ${view.retained.length}` : 'Avec quoi il se tient'}
      triggerClassName="text-xs text-brand-600 hover:underline"
      title={`Avec quoi ${controlCode} se tient`}
      description="Le référentiel AIGMS suggère une famille d’outillage ; vous retenez le produit employé chez vous. Le contrôle-type n’est pas modifié."
    >
      {() => (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="organizationId" value={organizationId} />
          <input type="hidden" name="controlId" value={controlId} />

          {/*
            Le signal avant la liste : ce qui manque se lit d'abord, sinon on
            coche sans savoir pourquoi.
          */}
          {view.signal?.needs_tooling ? (
            <p className="rounded-md border border-warn-600/25 bg-warn-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
              <strong className="font-medium text-ink-900">Contrôle de nature technique, sans
              outillage retenu.</strong> Il énonce un moyen sans le nommer : en l’état, il ne se
              prouve pas. Retenez le produit employé, ou corrigez sa nature si la mesure est en
              réalité organisationnelle.
            </p>
          ) : null}
          {view.signal?.evidence_automatable ? (
            <p className="rounded-md border border-brand-600/25 bg-brand-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
              <strong className="font-medium text-ink-900">Sa preuve pourrait être
              automatique.</strong> Un outil retenu ici a son connecteur actif, et ce contrôle n’a
              aucune preuve validée et fraîche : la collecte se fait encore à la main.
            </p>
          ) : null}

          {view.suggested.length ? (
            <div className="rounded-md bg-ink-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
              Le référentiel AIGMS suggère :{' '}
              {view.suggested.map((s) => s.acronym ?? s.name).join(', ')}.
            </div>
          ) : (
            <p className="rounded-md bg-ink-100 px-3.5 py-2.5 text-xs text-ink-600">
              Le référentiel AIGMS ne suggère aucune famille pour ce contrôle — ou ce contrôle est libre,
              sans lien vers un contrôle-type. Retenez ce qui vaut chez vous.
            </p>
          )}

          {view.available.length ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">Outils de l’organisation</legend>
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
                      {tool.role === 'system_resource'
                        ? ' · ressource du système'
                        : tool.role === 'both'
                          ? ' · instrument et ressource'
                          : ''}
                      {suggestedIds.has(tool.id) ? ' · suggéré par le référentiel' : ''}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="text-sm text-warn-600">
              Aucun outil déclaré pour cette organisation. La carte d’outillage est gérée depuis
              « Outillage », au registre des contrôles.
            </p>
          )}

          <Field label="Pourquoi ce choix" htmlFor={`why-${controlId}`} optional hint="Ce que l’outil couvre pour ce contrôle, et où sa preuve se prend.">
            <textarea id={`why-${controlId}`} name="rationale" rows={2} defaultValue={view.retained[0]?.rationale ?? ''} className={FIELD} />
          </Field>

          <FormFeedback state={state} />
          <Submit pending={pending} idle="Retenir" />
        </form>
      )}
    </Modal>
  )
}
