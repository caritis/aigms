import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Shell } from '@/components/shell'
import { Badge, Card, Empty, Stat, StatStrip } from '@/components/ui'
import { InfoTip } from '@/components/info-tip'
import { ControlToolingModal } from '@/components/governance/control-tooling-modal'
import { ControlProposals, type Suggestions } from '@/components/governance/control-proposals'
import { SegmentedFilter } from '@/components/governance/segmented-filter'
import {
  ControlStateForm,
  RequirementMappingForm,
} from '@/components/governance/control-forms'
import { CONTROL_STATUS_LABELS, formatDate, MEASURE_KIND_LABELS } from '@/lib/domain/governance'

/**
 * Referentiel de controles de l'organisation.
 *
 * Tout ce que la plateforme sait lire — couverture, graphe, chemin du risque,
 * Declaration d'Applicabilite, registre des preuves — repose sur ces lignes.
 * Elles n'etaient creees que par le jeu de demonstration : sur un client reel,
 * la moitie des ecrans restait vide sans qu'on puisse y remedier.
 */

type Control = {
  id: string
  business_ref: string
  code: string
  name: string
  objective: string
  status: string
  is_mandatory: boolean
  frequency: string | null
  measure_kind: string
  expected_evidence: string[] | null
  assessment_questions: string[] | null
  owner: { full_name: string | null; email: string } | null
  last_tested_at: string | null
  next_test_at: string | null
  /** Le contrôle-type dont il est l'instance, s'il vient d'un référentiel. */
  catalog?: unknown
}

const STATE_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'operating', label: 'Opérants' },
  { key: 'implemented', label: 'Mis en place' },
  { key: 'proposed', label: 'Proposés' },
  { key: 'ineffective', label: 'Inefficaces' },
  { key: 'retired', label: 'Retirés' },
] as const

export default async function ControlsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ etat?: string; outillage?: string }>
}) {
  const { id } = await params
  const { etat, outillage } = await searchParams
  const supabase = await createClient()

  const [{ data: organization }, { data: controlRows }, { data: requirementRows }, { data: links }, { data: orgSuggestions }] =
    await Promise.all([
      supabase.from('organization').select('id, name, business_ref').eq('id', id).maybeSingle(),
      supabase
        .from('control')
        .select(
          'id, business_ref, code, name, objective, status, is_mandatory, measure_kind, frequency, last_tested_at, next_test_at, expected_evidence, assessment_questions, owner:owner_user_id (full_name, email), catalog:catalog_control_id (control_code, version:version_id (version, framework:framework_id (code)))',
        )
        .eq('organization_id', id)
        .order('code'),
      supabase
        .from('requirement')
        .select('id, requirement_reference, title, framework:framework_id!inner(code, version)')
        .eq('framework.code', 'ISO_IEC_42001')
        .eq('framework.version', '2023')
        .order('display_order'),
      supabase
        .from('control_requirement_map')
        .select('control_id, requirement:requirement_id (requirement_reference)'),
      supabase.rpc('suggest_organization_controls', { p_organization_id: id }),
    ])

  if (!organization) notFound()

  const controls = (controlRows ?? []) as unknown as Control[]
  const requirements = (requirementRows ?? []).map((r) => ({
    id: r.id,
    reference: r.requirement_reference,
    title: r.title,
  }))

  // Avec quoi chaque controle se tient, chez cette organisation (0088).
  const { data: toolingRows } = await supabase
    .from('control_tooling')
    .select('control_id, tooling:tooling_id (id, tool_code, product)')
  const toolingBy = new Map<string, { id: string; product: string }[]>()
  for (const row of toolingRows ?? []) {
    const tool = row.tooling as unknown as { id: string; product: string } | null
    if (!tool) continue
    const list = toolingBy.get(row.control_id) ?? []
    list.push(tool)
    toolingBy.set(row.control_id, list)
  }

  const mappedBy = new Map<string, string[]>()
  for (const link of links ?? []) {
    const requirement = link.requirement as unknown as { requirement_reference: string } | null
    if (!requirement) continue
    const list = mappedBy.get(link.control_id) ?? []
    list.push(requirement.requirement_reference)
    mappedBy.set(link.control_id, list)
  }

  /*
   * Un controle de nature technique dont aucun outillage n'est retenu enonce
   * un moyen sans le nommer : il ne se prouve pas (0094). Le filtre les isole
   * — sans cela, il fallait ouvrir les cent-vingt controles pour les trouver.
   */
  const needsTooling = (c: Control) => c.measure_kind === 'technical' && !toolingBy.has(c.id)
  const missingTooling = controls.filter(needsTooling)

  const byState = etat ? controls.filter((c) => c.status === etat) : controls
  const shown = outillage === 'manquant' ? byState.filter(needsTooling) : byState
  const operating = controls.filter((c) => c.status === 'operating').length
  const mandatory = controls.filter((c) => c.is_mandatory).length
  const unmapped = controls.filter((c) => !mappedBy.has(c.id)).length

  return (
    <Shell
      breadcrumb={[
        { href: '/admin/organizations', label: 'Organisations' },
        { href: `/admin/organizations/${id}`, label: organization.name },
      ]}
      organization={{ id, section: 'controles' }}
      title="Liste des contrôles opérationnels"
      subtitle="Le dispositif de maîtrise de l’organisation, et ce qu’il couvre."
      actions={
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/organizations/${id}/controles/nouveau`}
            className="rounded-md bg-night-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-night-800"
          >
            Ajouter un contrôle
          </Link>
          <ControlProposals
            organizationId={id}
            suggestions={(orgSuggestions ?? { available: false }) as Suggestions}
          />
          <Link
            href={`/admin/organizations/${id}/outillage`}
            className="rounded-md border border-ink-200 px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-100"
          >
            Outillage
          </Link>
          <InfoTip label="Comment lire cette liste" title="Contrôles opérationnels et contrôles-types">
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-600">
              <p>
                Cette liste est celle des contrôles que l’organisation met <em>réellement</em> en
                œuvre — le socle de tout ce que la plateforme sait dire : taux de couverture, graphe
                de gouvernance, chemin d’un risque, Déclaration d’Applicabilité. Un contrôle qui
                n’existe pas ici ne peut être ni prouvé, ni rattaché, ni opposé.
              </p>
              <p>
                <strong className="font-medium text-ink-800">D’où viennent-ils.</strong> D’un
                référentiel de contrôles-types — celui de l’éditeur, livré avec la plateforme, ou
                ceux qu’un cabinet importe — dont on ajoute un modèle, lien conservé et
                correspondances ISO 42001 rattachées ; ou librement, pour ce qui n’y figure pas.
                Un contrôle-type est un modèle ; un contrôle opérationnel est une réalité, avec
                un responsable, un état et des preuves.
              </p>
              <p>
                <strong className="font-medium text-ink-800">Trois gestes distincts.</strong> Créer
                le contrôle le décrit ; le déclarer <em>opérant</em> dit qu’il fonctionne ; y
                rattacher une preuve validée et non échue est ce qui le fait compter comme
                couvrant. Les trois sont nécessaires, et aucun ne remplace les autres.
              </p>
              <p>
                <strong className="font-medium text-ink-800">Les exigences.</strong> Rattacher un
                contrôle à une exigence de l’Annexe A alimente la Déclaration d’Applicabilité — un
                même contrôle en sert souvent plusieurs, et la preuve n’est collectée qu’une fois.
              </p>
            </div>
          </InfoTip>
        </div>
      }
    >
      <StatStrip>
        <Stat label="Contrôles" value={controls.length} />
        <Stat label="Opérants" value={operating} tone="ok" />
        <Stat label="Obligatoires" value={mandatory} />
        <Stat label="Sans exigence rattachée" value={unmapped} tone="warn" />
      </StatStrip>

      <div className="mb-5">
        <SegmentedFilter
          label="Filtrer par état"
          param="etat"
          basePath={`/admin/organizations/${id}/controles`}
          current={{ outillage: outillage ?? '' }}
          selected={etat}
          options={STATE_FILTERS.map((option) => ({
            key: option.key,
            label: option.label,
            count: option.key
              ? controls.filter((c) => c.status === option.key).length
              : controls.length,
          }))}
        />
      </div>

      {missingTooling.length ? (
        <div className="mb-5">
          <SegmentedFilter
            label="Outillage"
            param="outillage"
            basePath={`/admin/organizations/${id}/controles`}
            current={{ etat: etat ?? '' }}
            selected={outillage === 'manquant' ? 'manquant' : ''}
            options={[
              { key: '', label: 'Tous les contrôles', count: byState.length },
              {
                key: 'manquant',
                label: 'Technique, sans outillage',
                count: byState.filter(needsTooling).length,
                hint: 'Un contrôle technique qui ne dit pas avec quoi il se tient ne se prouve pas.',
              },
            ]}
          />
        </div>
      ) : null}

      {/*
        Chaque controle se replie.
        La liste portait pour chacun son objectif, ses exigences, son
        outillage, ses preuves attendues et deux boutons : six lignes par
        controle, et vingt controles faisaient une page ou l'on ne retrouvait
        rien. Repliee, une ligne tient sur deux — et ce qui manque s'y lit,
        parce qu'un repli qui cache un ecart ne vaut rien.

        La zone defile pour elle-meme : les filtres restent sous les yeux
        pendant qu'on parcourt la liste.
      */}
      <Card title="Contrôles opérationnels" subtitle={`${shown.length} contrôle(s) — replié ; le titre ouvre la fiche`}>
        {shown.length ? (
          <div className="-mx-5 max-h-[68vh] overflow-y-auto px-5">
          <ul className="flex flex-col divide-y divide-ink-100">
            {shown.map((control) => {
              const origin = control.catalog as unknown as {
                control_code: string
                version: { version: string; framework: { code: string } | null } | null
              } | null
              const exigences = mappedBy.get(control.id) ?? []
              const outils = toolingBy.get(control.id) ?? []
              const preuves = control.expected_evidence?.length ?? 0
              const questions = control.assessment_questions?.length ?? 0
              // Ce qui appelle un geste, et se lit SANS ouvrir la fiche.
              const manques = [
                !control.owner ? 'sans responsable' : null,
                !exigences.length ? 'aucune exigence' : null,
                !preuves && !questions ? 'rien à prouver' : null,
                control.measure_kind === 'technical' && !outils.length ? 'sans outillage' : null,
              ].filter(Boolean) as string[]

              return (
                <li key={control.id} className="py-1">
                  <details className="group">
                    <summary className="grid cursor-pointer grid-cols-[1.25rem_1fr_auto] items-start gap-x-3 gap-y-1 rounded-md px-1 py-2.5 marker:content-[''] hover:bg-ink-50">
                      <span
                        aria-hidden
                        className="pt-0.5 text-center text-ink-400 transition-transform group-open:rotate-90"
                      >
                        ›
                      </span>

                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-mono text-xs text-ink-400">{control.code}</span>
                          <span className="text-sm font-medium text-ink-900">{control.name}</span>
                          {origin ? (
                            <span
                              className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-normal text-ink-600"
                              title={`Instance du contrôle-type ${origin.control_code}`}
                            >
                              {origin.version?.framework?.code ?? 'référentiel'} v{origin.version?.version} · {origin.control_code}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs text-ink-500">
                          {control.business_ref}
                          {control.owner ? ` · ${control.owner.full_name ?? control.owner.email}` : ''}
                          {control.frequency ? ` · ${control.frequency}` : ''}
                          {control.last_tested_at
                            ? ` · testé le ${formatDate(control.last_tested_at)}`
                            : ' · jamais testé'}
                        </span>
                        {manques.length ? (
                          <span className="mt-1 block text-xs text-warn-600">{manques.join(' · ')}</span>
                        ) : null}
                      </span>

                      {/*
                        Les pastilles s'alignent a droite, dans le meme ordre
                        sur toutes les lignes : nature, obligation, etat. On
                        balaye une colonne, pas une ligne brisee.
                      */}
                      <span className="flex flex-wrap items-center justify-end gap-2">
                        <Badge tone="neutral">{MEASURE_KIND_LABELS[control.measure_kind] ?? control.measure_kind}</Badge>
                        {control.is_mandatory ? <Badge tone="warn">Obligatoire</Badge> : null}
                        <Badge
                          tone={
                            control.status === 'operating'
                              ? 'ok'
                              : control.status === 'ineffective'
                                ? 'stop'
                                : 'neutral'
                          }
                        >
                          {CONTROL_STATUS_LABELS[control.status] ?? control.status}
                        </Badge>
                      </span>
                    </summary>

                    <div className="grid grid-cols-[1.25rem_1fr] gap-x-3 pb-3">
                      <span />
                      <div className="flex flex-col gap-3 border-l-2 border-ink-100 pl-4">
                        <p className="text-sm leading-relaxed text-ink-600">{control.objective}</p>

                        <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                          <div>
                            <dt className="font-medium text-ink-700">Exigences rattachées</dt>
                            <dd className={exigences.length ? 'text-ink-600' : 'text-warn-600'}>
                              {exigences.length
                                ? exigences.join(', ')
                                : 'Aucune — ce contrôle ne compte dans aucune Déclaration.'}
                            </dd>
                          </div>
                          <div>
                            {/*
                              Avec quoi il se tient : le produit employe ici,
                              pas la famille du referentiel. C'est la qu'on
                              prend sa preuve.
                            */}
                            <dt className="font-medium text-ink-700">Avec quoi il se tient</dt>
                            <dd className={outils.length ? 'text-ink-600' : 'text-ink-500'}>
                              {outils.length
                                ? outils.map((t) => t.product).join(', ')
                                : 'À la main — aucun outil retenu.'}
                              {' · '}
                              <ControlToolingModal
                                organizationId={id}
                                controlId={control.id}
                                controlCode={control.code}
                              />
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-ink-700">Cadence</dt>
                            <dd className="text-ink-600">
                              {control.frequency ?? 'non fixée'}
                              {control.next_test_at ? ` · prochain test le ${formatDate(control.next_test_at)}` : ''}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-ink-700">Responsable</dt>
                            <dd className={control.owner ? 'text-ink-600' : 'text-warn-600'}>
                              {control.owner
                                ? (control.owner.full_name ?? control.owner.email)
                                : 'Aucun — un contrôle sans responsable ne se tient pas.'}
                            </dd>
                          </div>
                        </dl>

                        {/*
                          Le registre se lit pareil quelle que soit l'origine
                          du controle : ce qu'il faut prouver, ce qu'on demande.
                        */}
                        {preuves || questions ? (
                          <div className="grid gap-4 text-xs sm:grid-cols-2">
                            {preuves ? (
                              <div>
                                <p className="mb-1 font-medium text-ink-700">Preuves attendues · {preuves}</p>
                                <ul className="list-disc space-y-0.5 pl-4 text-ink-600">
                                  {control.expected_evidence!.map((e) => <li key={e}>{e}</li>)}
                                </ul>
                              </div>
                            ) : null}
                            {questions ? (
                              <div>
                                <p className="mb-1 font-medium text-ink-700">Questions d’évaluation · {questions}</p>
                                <ul className="list-disc space-y-0.5 pl-4 text-ink-600">
                                  {control.assessment_questions!.map((q) => <li key={q}>{q}</li>)}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-xs text-warn-600">
                            Ni preuve attendue ni question d’évaluation : le registre ne dit pas
                            comment ce contrôle se démontre.
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                          <ControlStateForm
                            organizationId={id}
                            controlId={control.id}
                            code={control.code}
                            status={control.status}
                            lastTestedAt={control.last_tested_at}
                            nextTestAt={control.next_test_at}
                          />
                          <RequirementMappingForm
                            organizationId={id}
                            controlId={control.id}
                            code={control.code}
                            requirements={requirements}
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                </li>
              )
            })}
          </ul>
          </div>
        ) : controls.length ? (
          <Empty>
            Aucun contrôle dans cet état.{' '}
            <Link
              href={`/admin/organizations/${id}/controles`}
              className="text-brand-600 hover:underline"
            >
              Revenir à la liste complète
            </Link>
            .
          </Empty>
        ) : (
          <Empty>
            Aucun contrôle. Tant que cette liste est vide, la couverture, le graphe et la
            Déclaration d’Applicabilité n’ont rien à montrer.
          </Empty>
        )}
      </Card>
    </Shell>
  )
}
