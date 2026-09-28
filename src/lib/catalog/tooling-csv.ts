import { detectDelimiter, splitLine, type CsvIssue } from '@/lib/catalog/csv'

/**
 * Traduction du CSV de la typologie d'outillage.
 *
 * Le fichier est celui qu'AIGMS exporte : une ligne par famille, les listes
 * separees par « | » dans une seule cellule. On le relit tel quel, pour que
 * l'aller-retour tableur soit sans perte — c'est la condition pour qu'un
 * referentiel s'entretienne vraiment.
 *
 * La validation refuse ce que la base refuserait de toute facon, mais AVANT
 * d'y toucher, et en nommant la ligne : une erreur de saisie au milieu de
 * soixante-sept lignes ne se trouve pas autrement.
 */

export const TOOLING_PHASES_CSV = ['DISCOVERY', 'GOVERN', 'BUILD', 'CONNECT', 'OPERATE'] as const
export const TOOLING_SCOPES = ['ai_core', 'it_support'] as const

/** Les colonnes que la base attend, et leur nature. */
const TEXTES = [
  'code', 'scope', 'phase', 'domain', 'acronym', 'tool_service', 'definition',
  'controlled_object', 'control_question', 'nature', 'automation', 'frequency',
  'owner_role', 'risk_addressed', 'priority', 'applicability',
] as const
const LISTES = [
  'tool_examples', 'expected_evidence', 'iso42001_refs', 'iso27001_refs',
  'other_frameworks', 'control_codes',
] as const

export type ToolingRow = Record<string, string | string[]>

export type ToolingTranslation =
  | { ok: true; rows: ToolingRow[]; coeur: number; support: number }
  | { ok: false; issues: CsvIssue[] }

/** Une cellule de liste : « a | b | c ». Vide donne un tableau vide. */
function toList(value: string): string[] {
  return value
    .split('|')
    .map((v) => v.trim())
    .filter(Boolean)
}

export function translateToolingCsv(raw: string): ToolingTranslation {
  const text = raw.replace(/^﻿/, '')
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) {
    return { ok: false, issues: [{ line: 1, message: 'Fichier vide ou sans ligne de données.' }] }
  }

  const delimiter = detectDelimiter(lines[0]!)
  const header = splitLine(lines[0]!, delimiter).map((h) => h.toLowerCase())
  const issues: CsvIssue[] = []

  for (const requise of ['code', 'tool_service']) {
    if (!header.includes(requise)) {
      issues.push({ line: 1, message: `Colonne obligatoire absente : ${requise}.` })
    }
  }
  if (issues.length) return { ok: false, issues }

  const index = (name: string) => header.indexOf(name)
  const rows: ToolingRow[] = []
  const vus = new Set<string>()

  for (let i = 1; i < lines.length; i += 1) {
    const ligne = i + 1
    const champs = splitLine(lines[i]!, delimiter)
    const lire = (name: string) => {
      const at = index(name)
      return at === -1 ? '' : (champs[at] ?? '').trim()
    }

    const code = lire('code')
    if (!code) {
      issues.push({ line: ligne, message: 'Code absent : chaque famille se désigne par son code.' })
      continue
    }
    if (vus.has(code)) {
      issues.push({ line: ligne, message: `Code en double : ${code}.` })
      continue
    }
    vus.add(code)

    if (!lire('tool_service')) {
      issues.push({ line: ligne, message: `${code} : nom de la famille absent (tool_service).` })
    }

    const scope = lire('scope') || 'it_support'
    if (!(TOOLING_SCOPES as readonly string[]).includes(scope)) {
      issues.push({
        line: ligne,
        message: `${code} : rang inconnu « ${scope} ». Attendu « ai_core » ou « it_support ».`,
      })
    }

    const phase = lire('phase')
    if (phase && !(TOOLING_PHASES_CSV as readonly string[]).includes(phase)) {
      issues.push({
        line: ligne,
        message: `${code} : phase inconnue « ${phase} ». Attendu ${TOOLING_PHASES_CSV.join(', ')}.`,
      })
    }

    const row: ToolingRow = {}
    for (const c of TEXTES) row[c] = c === 'scope' ? scope : lire(c)
    for (const c of LISTES) row[c] = toList(lire(c))
    rows.push(row)
  }

  if (issues.length) return { ok: false, issues }

  return {
    ok: true,
    rows,
    coeur: rows.filter((r) => r.scope === 'ai_core').length,
    support: rows.filter((r) => r.scope !== 'ai_core').length,
  }
}
