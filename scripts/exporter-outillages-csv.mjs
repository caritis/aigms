/**
 * Exporte la typologie d'outillage de l'editeur en CSV, pour servir de modele
 * a l'import d'administration.
 *
 * Le modele n'est pas un squelette vide : c'est l'etat REEL du referentiel.
 * Un administrateur qui veut ajouter une famille part de ce qui existe, voit
 * comment les colonnes sont remplies, et n'a pas a deviner un format.
 *
 *   DATABASE_URL=... node scripts/exporter-outillages-csv.mjs
 */
import { writeFileSync } from 'node:fs'
import pg from 'pg'

const COLONNES = [
  'code', 'scope', 'phase', 'domain', 'acronym', 'tool_service', 'definition',
  'tool_examples', 'controlled_object', 'control_question', 'expected_evidence',
  'nature', 'automation', 'frequency', 'owner_role', 'risk_addressed',
  'iso42001_refs', 'iso27001_refs', 'other_frameworks', 'priority', 'applicability',
  'control_codes',
]

/** Les listes tiennent dans une cellule, separees par « | ». */
const liste = (v) => (Array.isArray(v) ? v.join(' | ') : (v ?? ''))

/** Le point-virgule separe les colonnes : on protege ce qui en contient. */
const cellule = (v) => {
  const s = String(v ?? '')
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
const { rows } = await client.query(`
  select t.code, t.scope, t.phase::text, t.domain, t.acronym, t.tool_service, t.definition,
         t.tool_examples, t.controlled_object, t.control_question, t.expected_evidence,
         t.nature, t.automation, t.frequency, t.owner_role, t.risk_addressed,
         t.iso42001_refs, t.iso27001_refs, t.other_frameworks, t.priority, t.applicability,
         coalesce((select string_agg(m.control_code, ' | ' order by m.control_code)
                     from public.catalog_tool_control m where m.tool_id = t.id), '') as control_codes
    from public.catalog_tool t
   where t.tenant_id is null
   order by (t.scope = 'ai_core') desc, t.tool_service`)
await client.end()

const lignes = [COLONNES.join(';')]
for (const r of rows) {
  lignes.push(COLONNES.map((c) => cellule(liste(r[c]))).join(';'))
}
writeFileSync('public/modeles/referentiel-outillages.csv', lignes.join('\n') + '\n', 'utf8')
console.log(`${rows.length} familles exportées dans public/modeles/referentiel-outillages.csv`)
