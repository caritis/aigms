import Link from 'next/link'
import { Badge, Card, Empty } from '@/components/ui'
import { Disclosure } from '@/components/forms'
import {
  ACTIVITY_PROFILE_LABELS,
  CRITICALITY_LABELS,
  criticalityTone,
  type ActivityProfile,
  type EvidenceCriticality,
} from '@/lib/domain/activity-profile'

/**
 * Matrice des preuves attendues.
 *
 * Une organisation n'a pas les memes preuves a produire selon ce qu'elle fait
 * de l'IA. Cette carte rend cette difference lisible : ce que son profil appelle
 * en premier, ce qu'elle a effectivement depose, et l'ecart entre les deux.
 *
 * Elle ne classe pas par ordre de la matrice mais par CRITICITE : ce qui pese
 * le plus se lit en premier, et le reste s'efface.
 */

export type TypologyCoverage = {
  code: string
  name: string
  criticality: EvidenceCriticality | null
  evidence_total: number
  evidence_valid: number
  /** Les contrôles de l'organisation rattachés aux exigences qui l'ancrent. */
  control_count: number
  controls: string[]
  /** Ces exigences, telles que la Déclaration d'Applicabilité les nomme. */
  refs: string[]
}

export type MatrixGap = {
  typology_code: string
  typology_name: string
  framework_code: string
  framework_version: string
  reference: string
}

export function EvidenceMatrixCard({
  organizationId,
  rows,
  profile,
  gaps,
}: {
  /** Renseigne, chaque typologie exigeante sans preuve propose d'en deposer une. */
  organizationId?: string
  rows: TypologyCoverage[]
  profile: ActivityProfile | null
  gaps: MatrixGap[]
}) {
  if (!profile) {
    return (
      <Card title="Preuves attendues" subtitle="Selon le rôle exercé vis-à-vis de l’IA">
        <Empty>
          Le rôle de cette organisation vis-à-vis de l’IA n’est pas renseigné. Sans lui, aucune
          criticité ne peut être attribuée : la matrice attend des preuves très différentes d’un
          hébergeur et d’un utilisateur métier.
        </Empty>
      </Card>
    )
  }

  const demanding = rows.filter(
    (r) => r.criticality === 'critical' || r.criticality === 'high',
  )
  const missing = demanding.filter((r) => r.evidence_valid === 0)
  /*
    Deux silences que la carte confondait.

    « Un contrôle la sert, il manque la pièce » se solde en déposant. « Rien ne
    la sert » ne se solde pas en déposant : il manque le contrôle, et le bouton
    « Déposer » menait alors à un formulaire qu'on ne savait pas remplir.
  */
  const unserved = demanding.filter((r) => r.control_count === 0)

  return (
    <Card
      title="Preuves attendues"
      subtitle={`Rôle « ${ACTIVITY_PROFILE_LABELS[profile]} » · ${demanding.length} typologie(s) exigeante(s)`}
    >
      {missing.length ? (
        <p className="mb-3 rounded-md border border-stop-600/30 bg-stop-600/5 px-3.5 py-2.5 text-sm text-stop-600">
          {missing.length} typologie{missing.length > 1 ? 's' : ''} critique
          {missing.length > 1 ? 's' : ''} ou élevée{missing.length > 1 ? 's' : ''} sans aucune
          preuve valide : {missing.map((m) => m.name).join(', ')}.
        </p>
      ) : null}

      {unserved.length ? (
        <p className="mb-3 rounded-md border border-warn-600/40 bg-warn-600/5 px-3.5 py-2.5 text-sm leading-relaxed text-ink-700">
          <strong className="font-medium text-ink-900">
            {unserved.length === 1 ? 'Une typologie exigeante' : `${unserved.length} typologies exigeantes`} que
            rien ne sert
          </strong>{' '}
          — {unserved.map((u) => u.name).join(', ')}. Aucun contrôle de cette organisation ne répond
          aux exigences qui les portent : <strong className="font-medium text-ink-900">déposer une
          pièce n’y suffira pas</strong>, il faut d’abord retenir un contrôle. La Déclaration
          d’Applicabilité dit lesquelles, et laisse les trancher.
        </p>
      ) : null}

      <ul className="flex flex-col divide-y divide-ink-100">
        {rows.map((row) => (
          <li key={row.code} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm text-ink-900">
                <span className="mr-2 font-mono text-xs text-ink-400">{row.code}</span>
                {row.name}
              </span>
              <span className="flex items-center gap-2">
                {/*
                  « Déposer » ne s'offre que si un contrôle porte la typologie :
                  sans lui, la piece n'aurait rien a demontrer.
                */}
                {organizationId &&
                row.evidence_valid === 0 &&
                row.control_count > 0 &&
                (row.criticality === 'critical' || row.criticality === 'high') ? (
                  <Link
                    href={`/admin/organizations/${organizationId}/preuves/deposer?typologie=${row.code}`}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    Déposer
                  </Link>
                ) : organizationId && row.control_count === 0 && row.refs.length ? (
                  <Link
                    href={`/admin/organizations/${organizationId}/declaration-applicabilite?exigence=${encodeURIComponent(row.refs[0]!)}`}
                    className="text-xs font-medium text-warn-600 hover:underline"
                  >
                    Retenir un contrôle
                  </Link>
                ) : null}
                <span
                  className={`text-xs ${
                    row.evidence_valid === 0 ? 'text-ink-400' : 'text-ink-600'
                  }`}
                >
                  {row.evidence_valid}/{row.evidence_total} valide
                  {row.evidence_valid > 1 ? 's' : ''}
                </span>
                <Badge tone={criticalityTone(row.criticality)}>
                  {row.criticality ? CRITICALITY_LABELS[row.criticality] : '—'}
                </Badge>
              </span>
            </div>
            {/*
              Ce qui la sert, nomme. Une typologie qui n'annonce qu'un compteur
              de preuves laisse chercher OU deposer ; celle-ci dit par quel
              controle elle passe, et sur quelle exigence elle s'ancre.
            */}
            <p className="mt-0.5 text-xs text-ink-400">
              {row.control_count
                ? `Servie par ${row.controls.slice(0, 4).join(', ')}${row.control_count > 4 ? `, +${row.control_count - 4}` : ''}`
                : 'Aucun contrôle ne la sert'}
              {row.refs.length ? ` · ${row.refs.join(', ')}` : ''}
            </p>
          </li>
        ))}
      </ul>

      {gaps.length ? (
        <div className="mt-4">
          <Disclosure
            title="Références que le référentiel chargé ne porte pas"
            summary={`${gaps.length} référence(s) citées par la matrice, sans correspondance en base`}
          >
            <p className="mb-2 text-sm text-ink-600">
              La matrice cite ces articles ; AIGMS ne les a pas encore chargés. Les taire produirait
              une Déclaration d’Applicabilité qui paraît complète en omettant ce qu’elle ne sait pas
              rapprocher.
            </p>
            <ul className="flex flex-col gap-1 text-xs text-ink-500">
              {gaps.map((gap) => (
                <li key={`${gap.typology_code}-${gap.framework_code}-${gap.reference}`}>
                  <span className="font-mono">{gap.typology_code}</span> — {gap.framework_code}{' '}
                  {gap.reference}
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      ) : null}
    </Card>
  )
}
