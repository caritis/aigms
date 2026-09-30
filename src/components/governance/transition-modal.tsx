'use client'

import { useState } from 'react'
import { Modal } from '@/components/modal'
import { InfoTip } from '@/components/info-tip'
import { TransitionPanel } from '@/components/transition-panel'
import { DecisionForm, type DecisionDossier } from '@/components/governance/decision-forms'
import { ChangeRequestFields } from '@/components/governance/operations-forms'
import { USE_CASE_STATUS_LABELS, type UseCaseStatus } from '@/lib/domain/governance'

/**
 * « Faire évoluer », la porte unique — a trois intentions.
 *
 *   * Franchir un jalon : les jalons NON engageants (triage, evaluation,
 *     revue, surveillance, retours) — une transition immediate, avec motif.
 *   * Decider : les jalons ENGAGEANTS (approuve, pilote, production,
 *     suspension, retrait) — c'est la decision, approuvee, qui franchira.
 *   * Prevoir un changement du systeme : une evolution a une date prevue,
 *     que le moteur de reevaluation lit — pas un jalon.
 *
 * Trois choses differentes, une seule porte : on ne se demande plus laquelle
 * des trois fenetres ouvrir.
 */
const ENGAGING: UseCaseStatus[] = ['APPROVED', 'CONDITIONAL_APPROVAL', 'REJECTED', 'PILOT', 'PRODUCTION', 'SUSPENDED', 'RETIRED']

type Intent = 'step' | 'decide' | 'change'

export function TransitionModal({
  useCaseId,
  organizationId,
  status,
  targets,
  unsettledRisks,
  unassessedRisks,
  currentAutonomy,
  decisionTypes,
  people,
  evidence,
  evidenceGap = [],
  useCaseName,
  defaultApproverUserId,
  dossier,
}: {
  useCaseId: string
  organizationId: string
  status: UseCaseStatus
  targets: UseCaseStatus[]
  unsettledRisks: number
  unassessedRisks: number
  currentAutonomy: string
  decisionTypes: string[]
  people: { userId: string; label: string }[]
  evidence: { id: string; business_ref: string; title: string }[]
  /**
   * Les controles applicables que rien ne prouve (0098).
   *
   * La porte unique rendait `DecisionForm` sans le lui passer : l'avertissement
   * qui doit se lire AVANT de soumettre une mise en production ne s'affichait
   * donc que depuis l'ancien bouton de l'onglet. Retirer ce bouton sans
   * rebrancher ceci aurait fait disparaitre la regle avec lui.
   */
  evidenceGap?: { control_id: string; code: string; name: string; is_mandatory: boolean }[]
  /** Le nom de la fiche, pour l'objet de la decision. */
  useCaseName?: string
  /** Le Responsable redevable : approbateur propose. */
  defaultApproverUserId?: string
  /** Ce que le dossier dit deja, pour en proposer la reprise. */
  dossier?: DecisionDossier
}) {
  const steps = targets.filter((t) => !ENGAGING.includes(t))
  const engaging = targets.filter((t) => ENGAGING.includes(t))
  const [intent, setIntent] = useState<Intent | null>(null)

  const INTENTS: { key: Intent; title: string; body: string; available: boolean }[] = [
    {
      key: 'step',
      title: 'Franchir un jalon',
      body: steps.length
        ? `Vers ${steps.map((t) => USE_CASE_STATUS_LABELS[t]).join(', ')} — tout de suite, avec un motif. Le gate de Revue reste le juge.`
        : 'Aucun jalon simple depuis ce statut : les suivants se décident.',
      available: steps.length > 0,
    },
    {
      key: 'decide',
      title: 'Décider',
      body: engaging.length || decisionTypes.length
        ? `Approuvé, pilote, production, suspension, retrait — un acte de gouvernance : approuvée, la décision franchit le jalon à sa date d’effet.${engaging.length ? ` D’ici : ${engaging.map((t) => USE_CASE_STATUS_LABELS[t]).join(', ')}.` : ''}`
        : 'Rien à décider depuis ce statut.',
      available: decisionTypes.length > 0,
    },
    // La troisieme intention s'ajoute apres, pour garder l'ordre a l'ecran.
    {
      key: 'change',
      title: 'Prévoir un changement du système',
      body: 'Modèle, données, finalité, fournisseur, autonomie, population… à une date prévue. Le moteur dit ce qu’il rouvre, et si une décision s’impose. Le statut ne bouge pas.',
      available: status !== 'RETIRED',
    },
  ]

  /*
    Ce que ce statut-ci permet, dit en clair sous les trois cartes.

    « Approuvé sous conditions » n'ouvre pas la production : il ouvre le
    pilote. On lisait « Approbation de pilote » dans la liste sans savoir si
    c'etait un reliquat ou le seul chemin — c'est le seul chemin.
  */
  const CHEMINS: Partial<Record<UseCaseStatus, string>> = {
    CONDITIONAL_APPROVAL:
      'Approuvé sous conditions : la mise en production ne s’ouvre pas d’ici. Le chemin passe par le pilote — c’est le sens des conditions posées à l’approbation. Une approbation pleine, elle, ouvrirait la production directement.',
    APPROVED: 'Approuvé : le pilote et la mise en production sont ouverts, l’un et l’autre par décision.',
    REJECTED: 'Refusé : le dossier se reprend en le ramenant au brouillon, ou se retire.',
    SUSPENDED: 'Suspendu : la reprise en service se décide, comme l’arrêt s’était décidé.',
  }
  const chemin = CHEMINS[status]

  return (
    <Modal
      trigger="Faire évoluer"
      triggerClassName="rounded-md bg-night-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-night-800"
      title="Faire évoluer le cas d’usage"
      description={`Statut courant : ${USE_CASE_STATUS_LABELS[status]}. Trois intentions, une porte.`}
      closeOnSuccess={intent === 'change' || intent === 'decide'}
      headerAside={
        <InfoTip sign="!" label="Ce que font les trois évolutions" title="Trois évolutions, et ce qu’elles engagent">
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-600">
            <p>
              Les trois ne se valent pas : l’une avance le dossier, l’autre engage
              l’organisation, la troisième décrit un fait sur le système. Les confondre fait
              franchir un jalon sans l’avoir décidé.
            </p>
            <div>
              <p className="font-medium text-ink-800">Franchir un jalon</p>
              <p>
                Pour les étapes <em>non engageantes</em> — triage, évaluation, revue,
                surveillance, retours. Le statut change <strong className="font-medium text-ink-800">tout
                de suite</strong>, avec un motif. Les passerelles restent juges : si l’une n’est pas
                satisfaite, le passage est refusé et l’écran dit laquelle.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink-800">Décider</p>
              <p>
                Pour les jalons <em>engageants</em> — approuvé, pilote, production, suspension,
                retrait. Le statut ne bouge pas maintenant : on enregistre une{' '}
                <strong className="font-medium text-ink-800">décision</strong>, qui doit être
                approuvée par quelqu’un d’autre que son auteur, et qui franchira le jalon à sa date
                d’effet. C’est ce qui laisse une trace nominative, et ce qu’un auditeur vient lire.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink-800">Prévoir un changement du système</p>
              <p>
                Modèle, données, finalité, fournisseur, autonomie, population… à une date prévue.{' '}
                <strong className="font-medium text-ink-800">Le statut ne bouge pas</strong> : ce
                n’est pas un jalon, c’est un fait. Le moteur de réévaluation le lit, dit ce qu’il
                rouvre — qualification, risques, contrôles, étude d’impact — et si une décision
                s’impose, il l’ouvre.
              </p>
            </div>
            <p className="text-ink-500">
              Ce que vous posez ici se relit ensuite dans l’onglet{' '}
              <strong className="font-medium text-ink-700">Décisions et changements</strong>, sur un
              seul fil, chacun disant à quoi il est lié.
            </p>
          </div>
        </InfoTip>
      }
    >
      {() => (
        /*
          Les trois intentions ne defilent pas : elles disent ou l'on est, et
          l'on doit pouvoir changer d'avis sans remonter. Ce qu'elles ouvrent
          defile dans sa propre zone, sous elles.

          Une fois l'intention prise, les cartes se resserrent : leur texte a
          servi a choisir, il n'a plus a occuper le tiers de la fenetre pendant
          qu'on saisit. Celle qui est choisie garde le sien.
        */
        <div className="flex max-h-[76vh] min-h-0 flex-col gap-3">
          <nav aria-label="Intention" className="grid shrink-0 gap-2 sm:grid-cols-3">
            {INTENTS.map((option) => (
              <button
                key={option.key}
                type="button"
                disabled={!option.available}
                aria-pressed={intent === option.key}
                onClick={() => setIntent(option.key)}
                className={`rounded-md border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  intent === option.key
                    ? 'border-night-900 bg-night-900 text-white'
                    : 'border-ink-200 bg-white hover:bg-ink-50'
                }`}
              >
                <span className="block text-sm font-semibold">{option.title}</span>
                {/*
                  Une carte indisponible garde son texte : c'est la qu'est
                  ecrit POURQUOI elle l'est. La griser sans rien dire laissait
                  chercher la porte qui manque.
                */}
                {intent === null || intent === option.key || !option.available ? (
                  <span className={`mt-0.5 block text-xs leading-relaxed ${intent === option.key ? 'text-white/80' : 'text-ink-500'}`}>
                    {option.body}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          {chemin ? (
            <p className="shrink-0 rounded-md border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
              {chemin}
            </p>
          ) : null}

          {intent === 'step' ? (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <TransitionPanel
              useCaseId={useCaseId}
              targets={steps}
              unsettledRisks={unsettledRisks}
              unassessedRisks={unassessedRisks}
            />
            </div>
          ) : intent === 'decide' ? (
            <DecisionForm
              organizationId={organizationId}
              useCases={[]}
              people={people}
              fixedUseCaseId={useCaseId}
              allowedTypes={decisionTypes}
              evidence={evidence}
              evidenceGap={evidenceGap}
              useCaseName={useCaseName}
              defaultApproverUserId={defaultApproverUserId}
              dossier={dossier}
              framed
            />
          ) : intent === 'change' ? (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <ChangeRequestFields organizationId={organizationId} useCaseId={useCaseId} currentAutonomy={currentAutonomy} />
            </div>
          ) : (
            <p className="text-sm text-ink-500">Choisir ce que l’on veut faire.</p>
          )}
        </div>
      )}
    </Modal>
  )
}
