'use client'

import { Modal } from '@/components/modal'
import { EvidenceUploadForm, type ControlChoice, type TypologyChoice } from '@/components/governance/evidence-forms'

/**
 * Deposer une preuve sans quitter la fiche.
 *
 * Le depot est le meme qu'au registre — la piece, ce qu'elle demontre, le
 * controle qu'elle prouve — mais il s'ouvre la ou l'on lit ce qui manque, le
 * controle deja choisi. Naviguer vers le registre pour revenir ensuite
 * faisait perdre le fil.
 */
export function EvidenceDepositModal({
  organizationId,
  controls,
  typologies,
  defaultControlId,
  useCaseId,
  closesActionId,
  trigger = 'Déposer une preuve',
  triggerClassName,
}: {
  organizationId: string
  controls: ControlChoice[]
  typologies: TypologyChoice[]
  defaultControlId?: string
  useCaseId?: string
  /**
   * L'action que ce depot solde.
   *
   * Une action « deposer la preuve de l'evaluation d'impact » se cloturait en
   * passant par le registre, qui la recevait en parametre d'adresse. La fenetre
   * la porte aussi : le geste se termine la ou il a commence.
   */
  closesActionId?: string
  trigger?: string
  triggerClassName?: string
}) {
  return (
    <Modal
      trigger={trigger}
      triggerClassName={triggerClassName}
      title="Déposer une preuve"
      description={
        closesActionId
          ? 'Un dépôt n’est pas une validation : la pièce arrivera « à valider », et l’action se soldera.'
          : 'Un dépôt n’est pas une validation : la pièce arrivera « à valider ».'
      }
    >
      {() =>
        controls.length || typologies.length ? (
          <EvidenceUploadForm
            organizationId={organizationId}
            controls={controls}
            typologies={typologies}
            defaultControlId={defaultControlId}
            useCaseId={useCaseId}
            closesActionId={closesActionId}
          />
        ) : (
          <p className="text-sm text-ink-600">Aucun contrôle auquel rattacher une preuve pour l’instant.</p>
        )
      }
    </Modal>
  )
}
