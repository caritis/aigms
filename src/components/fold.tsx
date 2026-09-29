'use client'

import { useState, type ReactNode } from 'react'

/**
 * Une rubrique numerotee, qui se replie et qui dit son etat fermee.
 *
 * L'etude d'impact empilait quatre cartes de meme poids : on ne voyait pas
 * qu'elles forment une conduite ordonnee, et il fallait faire defiler toute
 * l'analyse croisee pour atteindre le plan de remediation. Les rubriques
 * portent donc leur rang — 1, 1.1, 2, 3 — et se replient.
 *
 * Repliee, une rubrique n'est pas muette : la ligne de resume tient ce que
 * l'ouvrir aurait appris. « 3 parties prenantes, aucune vulnerable » se lit
 * sans deplier ; c'est ce qui evite de descendre chercher.
 *
 * Le geste de la rubrique — modifier le cadrage, ajouter un constat — reste
 * hors du bouton de repli : cliquer « Ajouter » ne doit pas refermer ce qu'on
 * vient d'ouvrir.
 */
const ACCENT: Record<'neutral' | 'warn' | 'stop' | 'done', string> = {
  neutral: 'border-ink-200',
  warn: 'border-ink-200 border-l-4 border-l-warn-600',
  stop: 'border-ink-200 border-l-4 border-l-stop-600',
  done: 'border-ink-200 border-l-4 border-l-ok-600',
}

const RANG: Record<'neutral' | 'warn' | 'stop' | 'done', string> = {
  neutral: 'bg-ink-100 text-ink-600',
  warn: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  stop: 'bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200',
  done: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200',
}

export function Fold({
  step,
  title,
  subtitle,
  summary,
  tone = 'neutral',
  action,
  defaultOpen = true,
  children,
}: {
  /** Le rang de la rubrique dans la conduite : « 1 », « 1.1 », « 2 », « 3 ». */
  step: string
  title: string
  /** Ce que la rubrique sert, en une ligne. Visible ouverte comme fermee. */
  subtitle?: string
  /** Ce qu'elle contient, compte fait : la raison de ne pas l'ouvrir. */
  summary?: ReactNode
  tone?: 'neutral' | 'warn' | 'stop' | 'done'
  /** Le geste de la rubrique. Hors du bouton de repli, donc toujours sûr. */
  action?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`rounded-lg border bg-white ${ACCENT[tone]}`}>
      <header className="flex items-start justify-between gap-3 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="group flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={`mt-0.5 inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${RANG[tone]}`}
          >
            {step}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-ink-900 group-hover:text-brand-700">{title}</span>
              {/* Le chevron dit le sens du geste : il pointe vers ce qui va s'ouvrir. */}
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`size-4 shrink-0 text-ink-400 transition-transform ${open ? 'rotate-90' : ''}`}
              >
                <path d="M7 5l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {subtitle ? <span className="mt-0.5 block text-xs text-ink-400">{subtitle}</span> : null}
            {summary ? <span className="mt-1 block text-xs text-ink-600">{summary}</span> : null}
          </span>
        </button>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {open ? <div className="border-t border-ink-100 px-4 py-4 sm:px-5">{children}</div> : null}
    </section>
  )
}
