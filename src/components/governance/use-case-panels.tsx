'use client'

import { useActionState, useState } from 'react'
import {
  acceptRisk,
  closeRisk,
  createRisk,
  eraseRisk,
  saveClassification,
  saveTriage,
  updateRisk,
  type FormState,
} from '@/lib/actions/governance'
import { Field, FIELD, FormFeedback, Submit } from '@/components/forms'
import { Modal } from '@/components/modal'
import { ControlFinder } from '@/components/governance/control-finder'
import { InfoTip } from '@/components/info-tip'
import {
  IMPACT_SCALE,
  LIKELIHOOD_SCALE,
  RISK_CATEGORIES,
  rateRiskLevel,
} from '@/lib/domain/risk'
import { RISK_LEVEL_LABELS } from '@/lib/domain/governance'
import {
  CLASSIFICATION_FLAG_EFFECTS,
  CLASSIFICATION_FLAG_LABELS,
  ORGANIZATION_ROLE_LABELS,
} from '@/lib/domain/classification'
import {
  CRITICALITY_CONSEQUENCES,
  CRITICALITY_GRID,
  CRITICALITY_LABELS,
  CRITICALITY_ORDER,
  criticalityRank,
  GRID_EFFECTS,
  suggestCriticality,
  type CriticalitySignal,
  type GridAnswers,
} from '@/lib/domain/criticality'

/**
 * Etapes de gouvernance saisies depuis la fiche du cas d'usage.
 *
 * Chaque etape est un volet : on ne travaille jamais sur tout le dossier en
 * meme temps, et celle qui reste a faire s'ouvre d'elle-meme. C'est le meme
 * principe que la carte de l'increment suivant — on saisit la ou l'on regarde,
 * sans changer de page.
 */

export function CriticalityPanel({
  useCaseId,
  current,
  prefill,
  signal,
}: {
  useCaseId: string
  current: {
    criticality: string | null
    rationale: string | null
    grid: GridAnswers | null
    decision_impact: string | null
    next_review_at: string | null
  }
  /** Ce que la fiche sait deja : autonomie, donnees, personnes vulnerables. */
  prefill: GridAnswers
  signal: CriticalitySignal | null
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(saveTriage, null)
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}
  const done = Boolean(current.criticality)
  const [answers, setAnswers] = useState<GridAnswers>({ ...prefill, ...(current.grid ?? {}) })
  const suggested = suggestCriticality(answers)
  const [chosen, setChosen] = useState<string>(current.criticality ?? suggested ?? 'moderate')
  // Tant qu'on n'a pas choisi soi-meme, le niveau suit la grille.
  const [touched, setTouched] = useState(Boolean(current.criticality))
  const level = touched ? chosen : (suggested ?? chosen)
  const below = suggested !== null && criticalityRank(level) < criticalityRank(suggested)
  const belowFacts = signal?.observed && criticalityRank(level) < criticalityRank(signal.observed)

  /*
    La criticite se choisit dans une fenetre, comme la qualification : un acte
    court, qui se relit ensuite a droite du fil conducteur. La grille dit ce
    que le niveau engage, pas un adjectif ; l'officer retient le sien.
  */
  return (
    <Modal
      trigger={done ? 'Réviser la criticité' : 'Fixer la criticité'}
      title="Criticité du cas d’usage"
      description="Combien d’effort de gouvernance ce cas d’usage appelle. Un acte humain, tracé."
    >
      {() => (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="useCaseId" value={useCaseId} />

          <div className="rounded-md bg-ink-100 px-4 py-3 text-[13px] leading-relaxed text-ink-600">
            Quatre questions proposent un niveau ; vous retenez le vôtre. La criticité ne dit rien du
            règlement — c’est la qualification qui s’en charge — mais elle commande l’évaluation
            d’impact, l’arbitrage du Comité de direction et la cadence de revue. Les réponses ne
            servent pas qu’à proposer : ce qu’elles constatent — données personnelles ou sensibles,
            personnes vulnérables — s’inscrit sur la fiche et déclenche les règles qui s’y attachent.
          </div>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            {CRITICALITY_GRID.map((q) => (
              <Field key={q.key} label={q.label} htmlFor={`grid-${q.key}`}>
                <select
                  id={`grid-${q.key}`}
                  name={`grid.${q.key}`}
                  value={answers[q.key] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value || undefined }))}
                  className={FIELD}
                >
                  <option value="">—</option>
                  {q.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {GRID_EFFECTS[`${q.key}:${answers[q.key] ?? ''}`] ? (
                  <p className="mt-1 text-xs leading-snug text-ink-500">{GRID_EFFECTS[`${q.key}:${answers[q.key] ?? ''}`]}</p>
                ) : null}
              </Field>
            ))}
          </fieldset>

          <Field
            label="Criticité retenue"
            htmlFor="triage-criticality"
            hint={
              suggested
                ? `La grille propose : ${CRITICALITY_LABELS[suggested]}.`
                : 'Répondez à la grille pour obtenir une proposition, ou choisissez directement.'
            }
          >
            <select
              id="triage-criticality"
              name="criticality"
              value={level}
              onChange={(e) => {
                setChosen(e.target.value)
                setTouched(true)
              }}
              className={FIELD}
            >
              {CRITICALITY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CRITICALITY_LABELS[c]} — {CRITICALITY_CONSEQUENCES[c]}
                </option>
              ))}
            </select>
          </Field>
          {signal?.exceeds || belowFacts ? (
            <p className="rounded-md border border-warn-600/40 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-warn-600">
              Les faits imposent au moins <strong className="font-semibold">{CRITICALITY_LABELS[signal!.observed!]}</strong> :{' '}
              {signal!.reasons.join(' ')}
            </p>
          ) : null}

          <Field
            label="Justification"
            htmlFor="triage-rationale"
            error={errors.rationale}
            hint={
              below
                ? 'Vous retenez moins que la grille ne propose : dites pourquoi. Relu à la revue.'
                : 'Pourquoi ce niveau, en une ou deux phrases. Relu à la revue.'
            }
          >
            <textarea
              id="triage-rationale"
              name="rationale"
              rows={3}
              required
              defaultValue={current.rationale ?? ''}
              className={FIELD}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Portée de la décision" htmlFor="triage-impact" optional hint="Ce que le système décide ou influence, en une phrase.">
              <input
                id="triage-impact"
                name="decisionImpact"
                type="text"
                defaultValue={current.decision_impact ?? ''}
                className={FIELD}
              />
            </Field>
            <Field label="Prochaine revue" htmlFor="triage-review" optional>
              <input
                id="triage-review"
                name="nextReviewAt"
                type="date"
                defaultValue={current.next_review_at ?? ''}
                className={FIELD}
              />
            </Field>
          </div>

          <FormFeedback state={state} />
          <Submit pending={pending} idle={done ? 'Réviser la criticité' : 'Enregistrer la criticité'} />
        </form>
      )}
    </Modal>
  )
}

const FLAGS = Object.entries(CLASSIFICATION_FLAG_LABELS).map(([value, label]) => ({
  value,
  label,
  effect: CLASSIFICATION_FLAG_EFFECTS[value] ?? '',
}))
const ROLES = Object.entries(ORGANIZATION_ROLE_LABELS).map(([value, label]) => ({ value, label }))

export function ClassificationPanel({
  useCaseId,
  current,
}: {
  useCaseId: string
  current: {
    organization_role: string
    flags: string[]
    rationale: string
    legal_review_level: string
    legal_review_completed: boolean
    framework_version: string
    next_review_at: string | null
  } | null
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(
    saveClassification,
    null,
  )
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  // La qualification se pose et se revise depuis la fiche, dans une fenetre :
  // pas d'onglet a rejoindre pour un acte qui se relit ensuite a droite du
  // fil conducteur.
  return (
    <Modal
      trigger={current ? 'Réviser la qualification' : 'Qualifier maintenant'}
      title="Qualification au regard du règlement"
      description="Règlement (UE) 2024/1689 — AI Act. Un cadrage, pas un avis juridique."
    >
      {() => (
      <>
      <div className="mb-4 rounded-md bg-ink-100 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-ink-600">
          Au regard du <strong className="font-semibold">règlement (UE) 2024/1689</strong> — l’AI
          Act. Cette qualification est un <strong className="font-semibold">cadrage</strong>, pas un
          avis juridique : elle dit quelles obligations examiner et quel niveau de revue prévoir ;
          elle ne conclut pas à la conformité.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="useCaseId" value={useCaseId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rôle de l’organisation" htmlFor="cls-role">
            <select
              id="cls-role"
              name="organizationRole"
              defaultValue={current?.organization_role ?? 'deployer'}
              className={FIELD}
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Version du règlement"
            htmlFor="cls-version"
            hint="Le règlement évolue : on note la version qui a servi, pour que la qualification reste lisible plus tard."
          >
            <input
              id="cls-version"
              name="frameworkVersion"
              type="text"
              defaultValue={current?.framework_version ?? '2024/1689'}
              className={FIELD}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">Qualifications retenues</legend>
          {/*
            Chaque case engage quelque chose — un jalon bloque, une evaluation
            exigee, des controles proposes. Le dire sous le libelle, la ou l'on
            coche : une case qu'on coche sans savoir est une case mal cochee.
          */}
          <p className="mb-2 text-xs text-ink-500">Chacune engage la suite : ce qui est écrit dessous se déclenche côté serveur.</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {FLAGS.map((flag) => (
              <label key={flag.value} className="flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  name="flags"
                  value={flag.value}
                  defaultChecked={current?.flags.includes(flag.value)}
                  className="mt-0.5 size-4 rounded border-ink-300"
                />
                <span className="min-w-0">
                  {flag.label}
                  {flag.effect ? <span className="block text-xs leading-snug text-ink-400">{flag.effect}</span> : null}
                </span>
              </label>
            ))}
          </div>
          {errors.flags ? (
            <p role="alert" className="mt-1.5 text-[13px] text-stop-600">
              {errors.flags}
            </p>
          ) : null}
        </fieldset>

        <Field
          label="Justification"
          htmlFor="cls-rationale"
          error={errors.rationale}
          hint="Le raisonnement qui mène à ces qualifications. Un juriste doit pouvoir le reprendre."
        >
          <textarea
            id="cls-rationale"
            name="rationale"
            rows={4}
            required
            defaultValue={current?.rationale ?? ''}
            className={FIELD}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Revue juridique" htmlFor="cls-legal">
            <select
              id="cls-legal"
              name="legalReviewLevel"
              defaultValue={current?.legal_review_level ?? 'internal_review'}
              className={FIELD}
            >
              <option value="none">Non nécessaire</option>
              <option value="internal_review">Revue interne</option>
              <option value="external_counsel_required">Conseil externe requis</option>
            </select>
          </Field>

          <Field label="Prochaine revue" htmlFor="cls-review" optional>
            <input
              id="cls-review"
              name="nextReviewAt"
              type="date"
              defaultValue={current?.next_review_at ?? ''}
              className={FIELD}
            />
          </Field>
        </div>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            name="legalReviewCompleted"
            defaultChecked={current?.legal_review_completed}
            className="mt-0.5 size-4 rounded border-ink-300"
          />
          <span>
            La revue juridique est close
            <span className="block text-xs text-ink-500">
              Tant qu’elle ne l’est pas, le passage en production reste bloqué.
            </span>
          </span>
        </label>

        <FormFeedback state={state} />
        <Submit
          pending={pending}
          idle={current ? 'Remplacer la qualification' : 'Enregistrer la qualification'}
        />
      </form>
      </>
      )}
    </Modal>
  )
}

/**
 * Ce qui decrit un risque, et rien d'autre.
 *
 * Les memes champs servent a l'identifier et a le corriger : deux formulaires
 * jumeaux divergent au premier ajout, et c'est l'ecran de correction qui perd
 * — celui qu'on relit le moins. Le composant tient l'etat de ce qui s'affiche
 * en direct — la definition de la categorie, le niveau calcule — et le rend a
 * son parent quand celui-ci en a besoin.
 */
/**
 * Ce qu'on attend de chaque champ, dans l'en-tete de la fenetre.
 *
 * Elle occupait la premiere ligne du corps, seule sur sa rangee : un rond
 * flottant au-dessus du formulaire, et un vide sous l'en-tete. Elle se pose
 * la ou l'on regarde avant de saisir — a cote du titre.
 */
export function RiskFieldsNote() {
  return (
    <InfoTip label="Ce qu’on attend de chaque champ" title="Coter un risque">
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-600">
          <p>
            <strong className="font-medium text-ink-800">Intitulé.</strong> Ce qui peut mal
            tourner, en une ligne. Pas la cause, pas la parade : l’événement redouté.
          </p>
          <p>
            <strong className="font-medium text-ink-800">Scénario.</strong> Ce qui arrive, à qui,
            par quel enchaînement. C’est le seul champ qu’un auditeur relit : un risque sans
            scénario ne se traite pas, et l’assistant s’en sert pour chercher le contrôle.
          </p>
          <p>
            <strong className="font-medium text-ink-800">Catégorie.</strong> La nature de
            l’atteinte. Elle sert au rapprochement avec les contrôles et aux tableaux de bord :
            une catégorie posée au hasard fausse les deux.
          </p>
          <p>
            <strong className="font-medium text-ink-800">Qui répond du risque.</strong> Pas qui
            exécute la mesure — celui-là se désigne au traitement. Cette personne seule pourra
            accepter le risque, et la base le lui réserve.
          </p>
          <p>
            <strong className="font-medium text-ink-800">Vraisemblance × gravité.</strong> Deux
            crans de 1 à 5, cotés <em>avant</em> tout traitement : c’est le risque inhérent. Le
            niveau en découle et ne se saisit pas, pour qu’il ne puisse pas diverger de sa
            cotation.
          </p>
        </div>
      </InfoTip>
  )
}

function RiskFields({
  idPrefix,
  people,
  defaultOwnerUserId,
  criticality,
  errors,
  defaults,
  onChange,
}: {
  idPrefix: string
  people: { id: string; label: string }[]
  defaultOwnerUserId?: string | null
  criticality?: string | null
  errors: Record<string, string>
  defaults?: {
    title?: string
    scenario?: string
    category?: string
    likelihood?: number
    impact?: number
    ownerUserId?: string | null
    nextReviewAt?: string | null
  }
  /** Ce qui vient d'etre ecrit, pour nourrir la recherche de controle. */
  onChange?: (value: { title: string; scenario: string; categoryLabel: string }) => void
}) {
  const [category, setCategory] = useState(defaults?.category ?? 'operational')
  const [title, setTitle] = useState(defaults?.title ?? '')
  const [scenario, setScenario] = useState(defaults?.scenario ?? '')
  const [likelihood, setLikelihood] = useState(defaults?.likelihood ?? 3)
  const [impact, setImpact] = useState(defaults?.impact ?? 3)
  const level = rateRiskLevel(likelihood, impact)
  const categoryDef = RISK_CATEGORIES.find((c) => c.value === category)

  const emit = (next: Partial<{ title: string; scenario: string; category: string }>) => {
    const t = next.title ?? title
    const s = next.scenario ?? scenario
    const c = next.category ?? category
    onChange?.({
      title: t,
      scenario: s,
      categoryLabel: RISK_CATEGORIES.find((x) => x.value === c)?.label ?? '',
    })
  }

  return (
    <>
      <Field label="Intitulé" htmlFor={`${idPrefix}-title`} error={errors.title}>
        <input
          id={`${idPrefix}-title`}
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            emit({ title: event.target.value })
          }}
          className={FIELD}
          placeholder="Réponse erronée transmise au client"
        />
      </Field>

      <Field
        label="Scénario"
        htmlFor={`${idPrefix}-scenario`}
        error={errors.scenario}
        hint="Ce qui arrive, à qui, par quel enchaînement. Un risque sans scénario ne se traite pas."
      >
        <textarea
          id={`${idPrefix}-scenario`}
          name="scenario"
          rows={3}
          required
          value={scenario}
          onChange={(event) => {
            setScenario(event.target.value)
            emit({ scenario: event.target.value })
          }}
          className={FIELD}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        {/*
          La definition de la categorie choisie s'affiche sous le champ : on
          classait au hasard faute de savoir ce que chaque mot recouvre, et un
          classement au hasard fausse le rapprochement avec les controles.
        */}
        <Field label="Catégorie" htmlFor={`${idPrefix}-category`} hint={categoryDef?.description}>
          <div className="flex items-center gap-1.5">
            <select
              id={`${idPrefix}-category`}
              name="category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                emit({ category: event.target.value })
              }}
              className={FIELD}
            >
              {RISK_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <InfoTip label="Ce que recouvre chaque catégorie" title="Les treize catégories">
              <dl className="flex flex-col gap-2.5 text-sm leading-relaxed">
                {RISK_CATEGORIES.map((c) => (
                  <div key={c.value}>
                    <dt className="font-medium text-ink-800">{c.label}</dt>
                    <dd className="text-ink-600">{c.description}</dd>
                  </div>
                ))}
              </dl>
            </InfoTip>
          </div>
        </Field>

        {/*
          Ce n'est pas la personne qui exécute — le traitement designe son
          propre responsable. C'est celle qui REPOND du risque : elle seule
          pourra l'accepter, et la base le lui reserve.
        */}
        <Field
          label="Qui répond de ce risque"
          htmlFor={`${idPrefix}-owner`}
          error={errors.ownerUserId}
          hint={
            criticality === 'high' || criticality === 'critical'
              ? 'Cette personne seule pourra l’accepter — et, ce cas d’usage étant de criticité élevée, une décision approuvée par le Comité de direction sera exigée en plus. Qui exécute la mesure se désigne au traitement.'
              : 'Cette personne seule pourra l’accepter. Qui exécute la mesure se désigne au traitement, pas ici.'
          }
        >
          <select
            id={`${idPrefix}-owner`}
            name="ownerUserId"
            required
            defaultValue={defaults?.ownerUserId ?? defaultOwnerUserId ?? ''}
            className={FIELD}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.label}
                {person.id === defaultOwnerUserId ? ' — répond du cas d’usage' : ''}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/*
        La base ne stocke qu'un chiffre : c'est ce qui rend la cotation
        calculable et testable. Mais un chiffre nu ne se cote pas — deux
        personnes n'entendent pas la meme chose par « 4 ». Le libelle
        accompagne donc le chiffre, et la definition du cran choisi s'affiche
        dessous.
      */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Vraisemblance"
          htmlFor={`${idPrefix}-likelihood`}
          hint={LIKELIHOOD_SCALE.find((c) => c.value === likelihood)?.hint}
        >
          <select
            id={`${idPrefix}-likelihood`}
            name="inherentLikelihood"
            value={likelihood}
            onChange={(event) => setLikelihood(Number(event.target.value))}
            required
            className={FIELD}
          >
            {LIKELIHOOD_SCALE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value} — {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Gravité"
          htmlFor={`${idPrefix}-impact`}
          hint={IMPACT_SCALE.find((c) => c.value === impact)?.hint}
        >
          <select
            id={`${idPrefix}-impact`}
            name="inherentImpact"
            value={impact}
            onChange={(event) => setImpact(Number(event.target.value))}
            required
            className={FIELD}
          >
            {IMPACT_SCALE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value} — {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Prochaine revue" htmlFor={`${idPrefix}-review`} optional>
          <input
            id={`${idPrefix}-review`}
            name="nextReviewAt"
            type="date"
            defaultValue={defaults?.nextReviewAt ?? ''}
            className={FIELD}
          />
        </Field>
      </div>

      {/*
        Le niveau se voit AVANT d'enregistrer. Il est recopie de la regle de la
        base (`app.rate_risk_level`), jamais ecrit : un test unitaire confronte
        les deux sur les vingt-cinq combinaisons.
      */}
      <p className="flex flex-wrap items-center gap-2 rounded-md bg-ink-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
        <span>Niveau inhérent obtenu :</span>
        <span
          className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
            level === 'critical'
              ? 'bg-stop-600/10 text-stop-600'
              : level === 'high'
                ? 'bg-warn-600/10 text-warn-600'
                : level === 'moderate'
                  ? 'bg-ink-200 text-ink-700'
                  : 'bg-ok-600/10 text-ok-600'
          }`}
        >
          {RISK_LEVEL_LABELS[level]}
        </span>
        <span>
          — {likelihood} × {impact} = {likelihood * impact}. Le niveau est calculé, jamais saisi,
          pour qu’il ne puisse pas diverger de sa cotation.
        </span>
      </p>
    </>
  )
}

export function RiskPanel({
  useCaseId,
  organizationId,
  riskCount,
  people,
  controls = [],
  defaultOwnerUserId,
  criticality,
}: {
  useCaseId: string
  organizationId: string
  riskCount: number
  people: { id: string; label: string }[]
  /** Qui repond du cas d'usage : le responsable redevable, a defaut le porteur. */
  defaultOwnerUserId?: string | null
  /** Eleve ou critique : l'acceptation exigera en plus une decision du Comite. */
  criticality?: string | null
  /** Les controles applicables a ce cas d'usage : l'un d'eux peut traiter le risque des l'identification. */
  controls?: { id: string; code: string; name: string; status: string }[]
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(createRisk, null)
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}
  const [options, setOptions] = useState<{ id: string; code: string; name: string }[]>(controls)
  const [controlId, setControlId] = useState('')
  /** Ce qui est ecrit en ce moment : l'assistant cherche dessus. */
  const [written, setWritten] = useState({ title: '', scenario: '', categoryLabel: '' })
  const query = [written.title, written.scenario, written.categoryLabel].filter(Boolean).join(' ')

  // Le volet deplie occupait la colonne au-dessus de la liste des risques :
  // on lisait le formulaire avant ce qu'il complete. Un risque n'existe que
  // par son cas d'usage, il se saisit donc SANS quitter la page — mais a la
  // demande, et depuis la zone qu'il alimente.
  return (
    <Modal
      trigger={riskCount ? 'Identifier un risque' : 'Identifier le premier risque'}
      title="Identifier un risque"
      description="Le niveau se calcule ; il ne se saisit pas."
      headerAside={<RiskFieldsNote />}
    >
      {() => (
      /*
        Le corps defile, le bouton reste. On saisissait la cotation en haut et
        l'on cherchait « Enregistrer » tout en bas, apres la liste des
        controles que l'assistant venait de proposer — la fenetre s'allongeait
        a mesure qu'elle devenait utile.
      */
      <form action={formAction} className="flex max-h-[68vh] min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        <input type="hidden" name="useCaseId" value={useCaseId} />

        <RiskFields
          idPrefix="risk"
          people={people}
          defaultOwnerUserId={defaultOwnerUserId}
          criticality={criticality}
          errors={errors}
          onChange={setWritten}
        />

        {/*
          Le traitement est un acte distinct de l'identification — on cote
          d'abord, on traite ensuite. Mais quand le controle qui le traitera
          est deja connu, le dire ici ouvre le traitement sans repasser par
          une seconde fenetre.
        */}
        <Field
          label="Contrôle qui le traitera"
          htmlFor="risk-control"
          optional
          hint={
            options.length
              ? 'Les contrôles déjà affectés à ce cas d’usage, et ceux que l’assistant retient ci-dessous. Le renseigner ouvre un traitement « réduire », porté par le responsable du risque, et rend le contrôle applicable.'
              : 'Aucun contrôle n’est encore affecté à ce cas d’usage. Décrivez le scénario : l’assistant propose de lui-même, ci-dessous, ce qui s’en approche dans le registre et les référentiels.'
          }
        >
          <select
            id="risk-control"
            name="controlId"
            value={controlId}
            onChange={(event) => setControlId(event.target.value)}
            className={FIELD}
          >
            <option value="">— À décider au traitement</option>
            {options.map((control) => (
              <option key={control.id} value={control.id}>
                {control.code} — {control.name}
              </option>
            ))}
          </select>
        </Field>
        {/*
          L'assistant lit ce qui est ecrit et propose, au lieu d'attendre un
          clic sur « chercher ». La categorie entre dans la requete : elle dit
          la nature de l'atteinte, et c'est elle qui separe une fuite de
          donnees d'une erreur de calcul quand le scenario parle des deux.
        */}
        <ControlFinder
          organizationId={organizationId}
          useCaseId={useCaseId}
          autoQuery={query}
          readQuery={() => query}
          ownerUserId={() => (document.getElementById('risk-owner') as HTMLSelectElement | null)?.value ?? ''}
          onPick={(option) => {
            setOptions((current) => (current.some((c) => c.id === option.id) ? current : [...current, option]))
            setControlId(option.id)
          }}
        />

        </div>

        <div className="-mx-5 -mb-5 mt-4 flex flex-col gap-3 border-t border-ink-100 bg-white px-5 py-3.5">
          <FormFeedback state={state} />
          <Submit pending={pending} idle="Enregistrer le risque" />
        </div>
      </form>
      )}
    </Modal>
  )
}

/**
 * Corriger un risque deja enregistre.
 *
 * Une cotation se corrige : on cote souvent avant d'avoir tout compris, et un
 * registre qu'on ne peut pas amender se contourne par un second risque — on
 * perd alors le fil de celui qu'on avait ouvert.
 *
 * Ce que la correction entraine est dit dans la fenetre, pas decouvert apres
 * coup : la base recalcule le niveau, garde trace du changement, reveille le
 * signal de criticite du cas d'usage — et, si le risque etait accepte et que
 * son niveau monte, retire l'acceptation en avertissant celui qui l'avait
 * donnee. Une acceptation vaut pour le niveau auquel elle a ete donnee.
 */
export function RiskEditForm({
  useCaseId,
  risk,
  people,
  defaultOwnerUserId,
  criticality,
}: {
  useCaseId: string
  risk: {
    id: string
    business_ref: string
    title: string
    scenario: string | null
    category: string
    inherent_likelihood: number
    inherent_impact: number
    owner_user_id: string | null
    next_review_at: string | null
    status: string
  }
  people: { id: string; label: string }[]
  defaultOwnerUserId?: string | null
  criticality?: string | null
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(updateRisk, null)
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  return (
    <Modal
      trigger={
        <span aria-hidden className="text-sm leading-none">
          ✎
        </span>
      }
      triggerLabel={`Corriger ${risk.business_ref}`}
      triggerClassName="inline-flex size-6 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-ink-400 hover:text-ink-800"
      title={`${risk.business_ref} — corriger`}
      description="Le niveau se recalcule. Ce qui change est enregistré au journal."
      headerAside={<RiskFieldsNote />}
    >
      {() => (
        <form action={formAction} className="flex max-h-[68vh] min-h-0 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <input type="hidden" name="useCaseId" value={useCaseId} />
          <input type="hidden" name="riskId" value={risk.id} />

          {/*
            L'avertissement AVANT le geste, pas apres : recoter a la hausse un
            risque accepte retire l'acceptation. Le dire une fois que c'est
            fait serait le decouvrir.
          */}
          {risk.status === 'accepted' ? (
            <p className="rounded-md border border-warn-600/25 bg-warn-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
              <strong className="font-medium text-ink-900">Ce risque est accepté.</strong> Une
              acceptation vaut pour le niveau auquel elle a été donnée : si votre correction fait
              monter le niveau, elle sera retirée, le risque reviendra à « identifié », et la
              personne qui l’avait acceptée en sera avertie. Une correction à la baisse ne change
              rien.
            </p>
          ) : null}

          <RiskFields
            idPrefix={`risk-edit-${risk.id}`}
            people={people}
            defaultOwnerUserId={defaultOwnerUserId}
            criticality={criticality}
            errors={errors}
            defaults={{
              title: risk.title,
              scenario: risk.scenario ?? '',
              category: risk.category,
              likelihood: risk.inherent_likelihood,
              impact: risk.inherent_impact,
              ownerUserId: risk.owner_user_id,
              nextReviewAt: risk.next_review_at,
            }}
          />

          </div>

          <div className="-mx-5 -mb-5 mt-4 flex flex-col gap-3 border-t border-ink-100 bg-white px-5 py-3.5">
            <FormFeedback state={state} />
            <Submit pending={pending} idle="Enregistrer la correction" />
          </div>
        </form>
      )}
    </Modal>
  )
}

/**
 * Retirer un risque du registre — deux gestes, et ils ne servent pas la meme
 * chose.
 *
 * CLORE : un risque qui a vecu et n'a plus lieu d'etre. Rien ne disparait ;
 * le motif est obligatoire parce qu'un risque clos sort de la passerelle de
 * production. Ouvert au responsable du risque : il en repond, il peut dire
 * qu'il est eteint.
 *
 * EFFACER : l'erratum, et rien d'autre. Ferme au responsable du risque, pour
 * la meme raison qui lui ouvre la cloture — il en repond, il ne l'efface pas.
 */
export function RiskCloseForm({
  riskId,
  riskRef,
  useCaseId,
}: {
  riskId: string
  riskRef: string
  useCaseId: string
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(closeRisk, null)
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  return (
    <Modal
      trigger="Clore"
      triggerClassName="rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-100"
      title={`Clore ${riskRef}`}
      description="Pour un risque qui n’a plus lieu d’être. Rien n’est effacé."
    >
      {() => (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="riskId" value={riskId} />
          <input type="hidden" name="useCaseId" value={useCaseId} />
          <p className="rounded-md bg-ink-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
            Les traitements, les constats d’étude d’impact et les décisions qui désignent ce risque
            restent lisibles. Un risque clos <strong className="font-medium text-ink-800">ne retient
            plus la mise en production</strong> : c’est pourquoi le motif n’est pas facultatif, et
            pourquoi votre nom y reste attaché.
          </p>
          <Field
            label="Pourquoi ce risque n’a plus lieu d’être"
            htmlFor={`close-${riskId}`}
            error={errors.reason}
            hint="Périmètre modifié, cas d’usage abandonné, risque absorbé par un autre — dites lequel."
          >
            <textarea id={`close-${riskId}`} name="reason" rows={3} required className={FIELD} />
          </Field>
          <FormFeedback state={state} />
          <Submit pending={pending} idle="Clore le risque" />
        </form>
      )}
    </Modal>
  )
}

export function RiskEraseForm({
  riskId,
  riskRef,
  riskTitle,
  useCaseId,
}: {
  riskId: string
  riskRef: string
  riskTitle: string
  useCaseId: string
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(eraseRisk, null)
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  return (
    <Modal
      trigger="Effacer"
      triggerClassName="rounded-md border border-stop-600/30 px-2.5 py-1 text-xs font-medium text-stop-600 hover:bg-stop-600/10"
      title={`Effacer ${riskRef}`}
      description="Pour une ligne saisie par erreur, et rien d’autre."
    >
      {() => (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="riskId" value={riskId} />
          <input type="hidden" name="useCaseId" value={useCaseId} />
          <p className="rounded-md border border-stop-600/25 bg-stop-600/5 px-3.5 py-2.5 text-xs leading-relaxed text-ink-700">
            <strong className="font-medium text-ink-900">« {riskTitle} » disparaîtra du
            registre.</strong> La base ne l’admet que si ce risque n’a rien laissé derrière lui :
            encore « identifié », jamais accepté, sans traitement, sans décision qui le désigne,
            sans constat d’étude d’impact qui y renvoie. Autrement, elle refuse et vous le dit —
            ce risque se clôt.
          </p>
          <p className="text-xs leading-relaxed text-ink-500">
            Le journal en conserve l’instantané complet, votre nom, la date et le motif ci-dessous.
            Un effacement est tracé, pas silencieux.
          </p>
          <Field
            label="En quoi cette ligne est une erreur de saisie"
            htmlFor={`erase-${riskId}`}
            error={errors.reason}
            hint="Un doublon, un essai, un risque saisi sur le mauvais cas d’usage."
          >
            <input id={`erase-${riskId}`} name="reason" type="text" required className={FIELD} />
          </Field>
          <FormFeedback state={state} />
          <Submit pending={pending} idle="Effacer définitivement" />
        </form>
      )}
    </Modal>
  )
}

export function AcceptRiskForm({
  riskId,
  useCaseId,
}: {
  riskId: string
  useCaseId: string
}) {
  const [state, formAction, pending] = useActionState<FormState | null, FormData>(acceptRisk, null)
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3 rounded-md bg-ink-100 px-4 py-3">
      <input type="hidden" name="riskId" value={riskId} />
      <input type="hidden" name="useCaseId" value={useCaseId} />

      <p className="text-[13px] leading-relaxed text-ink-600">
        Accepter un risque vous engage nominativement. La justification et la date de revue sont
        exigées par la base, non par ce formulaire.
      </p>

      <Field label="Justification de l’acceptation" htmlFor={`accept-${riskId}`} error={errors.rationale}>
        <textarea id={`accept-${riskId}`} name="rationale" rows={2} required className={FIELD} />
      </Field>

      <Field label="Date de revue" htmlFor={`review-${riskId}`} error={errors.reviewAt}>
        <input id={`review-${riskId}`} name="reviewAt" type="date" required className={FIELD} />
      </Field>

      <FormFeedback state={state} />
      <Submit pending={pending} idle="Accepter ce risque" />
    </form>
  )
}
