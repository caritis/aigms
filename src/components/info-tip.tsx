'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Note explicative, repliee derriere une icone.
 *
 * Elle sert a ce qui doit rester DISPONIBLE sans rester PRESENT : une mise en
 * garde qu'on lit une fois et qu'on veut pouvoir relire, sans qu'elle occupe le
 * haut de l'ecran a chaque visite.
 *
 * Ce n'est pas une infobulle au survol : le contenu tient plusieurs phrases, et
 * une bulle qui disparait des qu'on bouge la souris ne se lit pas. Elle s'ouvre
 * au clic, se ferme par Echap ou en cliquant ailleurs — et reste donc
 * atteignable au clavier.
 */
export function InfoTip({
  label,
  title,
  tone = 'neutral',
  align = 'right',
  sign = 'i',
  children,
}: {
  /** Nom accessible du bouton. Decrit ce qu'on va lire, pas l'icone. */
  label: string
  title?: string
  /** Le bouton porte une couleur quand il signale un etat : a faire, en ordre. */
  tone?: 'neutral' | 'ok' | 'todo'
  /** Ou s'ouvre le panneau par rapport au bouton. */
  align?: 'right' | 'left'
  /**
   * Le signe porte par le bouton. « i » renseigne ; « ! » previent qu'il y a
   * quelque chose a comprendre AVANT d'agir — le mode d'emploi d'un ecran, et
   * non un complement qu'on peut ignorer.
   */
  sign?: 'i' | '!'
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onClick = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex size-7 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
          open
            ? 'border-brand-600 bg-brand-600 text-white'
            : tone === 'todo'
              ? 'border-warn-600 bg-warn-600/10 text-warn-600 hover:bg-warn-600/20'
              : tone === 'ok'
                ? 'border-ok-600 bg-ok-600/10 text-ok-600 hover:bg-ok-600/20'
                : 'border-ink-300 text-ink-500 hover:border-ink-400 hover:text-ink-700'
        }`}
      >
        <span aria-hidden>{sign}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label}
          /*
            Le panneau ne depasse pas la hauteur de la fenetre : treize
            definitions tenaient sur deux ecrans et debordaient sous le pli,
            sans rien pour le dire. Le titre reste en place, le corps defile.
          */
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} z-20 mt-2 flex max-h-[min(30rem,70vh)] w-[min(30rem,calc(100vw-3rem))] flex-col rounded-lg border border-ink-200 bg-white text-left shadow-[0_1px_2px_rgb(30_42_68/0.04),0_12px_32px_rgb(30_42_68/0.12)]`}
        >
          {title ? (
            <p className="shrink-0 border-b border-ink-100 px-5 pb-2.5 pt-4 text-sm font-semibold text-ink-900">
              {title}
            </p>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        </div>
      ) : null}
    </div>
  )
}
