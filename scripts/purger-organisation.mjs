#!/usr/bin/env node
/**
 * Remettre une organisation de démonstration à blanc.
 *
 * Une organisation NE SE SUPPRIME PAS : le déclencheur
 * `organization_never_deleted` (0038) le refuse à tout rôle, et c'est la bonne
 * règle — ses décisions et ses preuves doivent rester lisibles, et le journal
 * d'audit ne porte AUCUNE clé étrangère vers elle. Effacer la ligne laisserait
 * donc un journal plein d'identifiants qui ne se résolvent plus.
 *
 * Ce script efface donc ce que la démonstration a PRODUIT, et laisse le décor :
 * l'organisation, ses membres, leurs rôles. On rejoue le scénario le lendemain
 * sans rien recréer.
 *
 * Deux niveaux :
 *
 *   scenario  (défaut) — tout ce qu'une démonstration crée : cas d'usage,
 *              risques, contrôles, outillage, preuves, décisions, processus,
 *              notifications. Les actifs d'IA et les fournisseurs du décor
 *              restent : le scénario en a besoin dès l'étape 1.
 *   complet            — le précédent, plus les actifs d'IA et les
 *              fournisseurs. Il ne reste que l'organisation et ses comptes.
 *
 * Il ne s'exécute pas sans `--oui`. Sans ce drapeau il COMPTE et n'écrit rien.
 *
 *   node scripts/purger-organisation.mjs --org <uuid|business_ref>
 *   node scripts/purger-organisation.mjs --org BATIVAL --complet --oui
 *   node scripts/purger-organisation.mjs --org … --ref <projectRef> --oui
 *
 * Sans `--ref`, il travaille sur la base locale (DATABASE_URL).
 */
import { readFileSync } from 'node:fs'
import pg from 'pg'

// -----------------------------------------------------------------------------
// Ce qu'on n'efface jamais
// -----------------------------------------------------------------------------
/**
 * L'organisation du jeu de données complet. Les tests RLS, les autres
 * démonstrations et la matrice des preuves en dépendent : une purge par erreur
 * coûterait une journée. Le refus est ici, en dur, et non dans un commentaire.
 */
const INTOUCHABLE = new Set([
  'cccccccc-0000-4000-8000-000000000001', // IzarLink Demo
])

/**
 * Les tables portant `organization_id`, dans l'ordre où on les vide.
 *
 * Tout casse en cascade depuis l'organisation, mais on ne supprime pas
 * l'organisation : il faut donc viser table par table. L'ordre compte pour une
 * raison — `guard_risk_delete` (0109) refuse d'effacer un risque qui a produit
 * des effets, SAUF quand le cas d'usage qui le portait vient de disparaître.
 * En passant par le cas d'usage, la cascade fait le travail sans forcer le
 * garde-fou. C'est vérifié par un test.
 */
const TABLES = [
  'ai_use_case',   // cascade : risques, traitements, études d'impact, supervision,
                   // qualification, applicabilité, décisions, changements, incidents
  'control',       // cascade : outillage retenu, correspondances, preuves rattachées
  'organization_tooling',
  'evidence',
  'soa_decision',
  'governance_decision',
  'governance_review',
  'action',
  'incident',
  'change_request',
  'reassessment',
  'assessment',
  'impact_assessment',
  'human_oversight_plan',
  'regulatory_classification',
  'risk',
  'activity',
  'process',
  'business_unit',
  'notification',
]

/** Le décor du scénario : présent dès l'étape 1, effacé seulement en `complet`. */
const DECOR = ['ai_asset', 'vendor']

/**
 * Jamais touché. `role_assignment` porte les huit comptes de démonstration sur
 * cette organisation : les effacer obligerait à refaire l'administration avant
 * chaque répétition, pour rien.
 */
const JAMAIS = ['role_assignment', 'membership', 'organization', 'audit_log']

// -----------------------------------------------------------------------------
// Arguments
// -----------------------------------------------------------------------------
const args = process.argv.slice(2)
const flag = (nom) => args.includes(nom)
const valeur = (nom) => {
  const i = args.indexOf(nom)
  return i === -1 ? null : args[i + 1]
}

const cible = valeur('--org')
const complet = flag('--complet')
const ecrire = flag('--oui')
const ref = valeur('--ref')

if (!cible) {
  console.error('Usage : node scripts/purger-organisation.mjs --org <uuid|business_ref> [--complet] [--ref <projectRef>] [--oui]')
  console.error('Sans --oui, le script compte et n’écrit rien.')
  process.exit(1)
}

// -----------------------------------------------------------------------------
// Deux façons de parler à la base : locale, ou distante par l'API de gestion
// -----------------------------------------------------------------------------
function env() {
  return Object.fromEntries(
    readFileSync('.env.local', 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  )
}

async function connecter() {
  if (ref) {
    const token = env().SUPABASE_ACCESS_TOKEN
    if (!token) throw new Error('SUPABASE_ACCESS_TOKEN absente de .env.local.')
    return {
      cible: `projet ${ref}`,
      async query(sql) {
        const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: sql }),
        })
        const body = await r.text()
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${body}`)
        return JSON.parse(body)
      },
      async fin() {},
    }
  }
  const url = process.env.DATABASE_URL ?? env().DATABASE_URL
  if (!url) throw new Error('DATABASE_URL absente : lancer `npx supabase start`, ou passer --ref.')
  const client = new pg.Client({ connectionString: url })
  await client.connect()
  return {
    cible: 'base locale',
    async query(sql) {
      const { rows } = await client.query(sql)
      return rows
    },
    async fin() {
      await client.end()
    },
  }
}

/** Une chaîne littérale SQL, entre apostrophes doublées. */
const lit = (v) => `'${String(v).replace(/'/g, "''")}'`

// -----------------------------------------------------------------------------
const db = await connecter()
try {
  const orgs = await db.query(`
    select id::text, name, business_ref, status::text
      from public.organization
     where id::text = ${lit(cible)} or business_ref ilike ${lit(cible)} or name ilike ${lit(`%${cible}%`)}`)

  if (!orgs.length) {
    console.error(`Aucune organisation ne correspond à « ${cible} » sur la ${db.cible}.`)
    process.exit(1)
  }
  if (orgs.length > 1) {
    console.error(`« ${cible} » désigne ${orgs.length} organisations. Précisez par identifiant :`)
    for (const o of orgs) console.error(`  ${o.id}  ${o.business_ref}  ${o.name}`)
    process.exit(1)
  }

  const org = orgs[0]
  if (INTOUCHABLE.has(org.id)) {
    console.error(`Refus : ${org.name} porte le jeu de données complet dont dépendent les tests et`)
    console.error('les autres démonstrations. Cette organisation ne se purge pas.')
    process.exit(1)
  }

  const tables = complet ? [...TABLES, ...DECOR] : TABLES
  console.log(`Organisation : ${org.name} (${org.business_ref}, ${org.status}) — ${db.cible}`)
  console.log(`Niveau       : ${complet ? 'complet — actifs et fournisseurs compris' : 'scénario — le décor reste'}`)
  console.log('')

  // On compte AVANT : c'est ce compte qui se relit après, et qui dit si la
  // purge a bien porté. Une suppression silencieuse ne se vérifie pas.
  let total = 0
  const avant = []
  for (const table of tables) {
    const [{ n }] = await db.query(
      `select count(*)::int as n from public.${table} where organization_id = ${lit(org.id)}`)
    if (n > 0) avant.push({ table, n })
    total += n
  }

  if (!total) {
    console.log('Rien à effacer : cette organisation ne porte aucune donnée de gouvernance.')
    process.exit(0)
  }

  for (const { table, n } of avant) console.log(`  ${String(n).padStart(5)}  ${table}`)
  console.log(`  ${String(total).padStart(5)}  au total`)
  console.log('')
  console.log(`Conservés : ${JAMAIS.join(', ')}${complet ? '' : `, ${DECOR.join(', ')}`}.`)

  // Les pièces déposées vivent dans le stockage, pas dans la base : aucune
  // requête SQL ne les emporte. Le dire, plutôt que de laisser croire.
  const [{ n: fichiers }] = await db.query(
    `select count(*)::int as n from public.evidence
      where organization_id = ${lit(org.id)} and storage_path is not null`)
  if (fichiers > 0) {
    console.log('')
    console.log(`Attention : ${fichiers} preuve(s) portent un fichier déposé. La ligne part, le`)
    console.log('fichier reste dans le stockage Supabase — il se retire depuis le tableau de bord.')
  }

  if (!ecrire) {
    console.log('')
    console.log('Aucune écriture : relancer avec --oui pour effacer.')
    process.exit(0)
  }

  console.log('')
  for (const table of tables) {
    await db.query(`delete from public.${table} where organization_id = ${lit(org.id)}`)
  }

  // On relit : la seule preuve que la purge a porté.
  let reste = 0
  for (const table of tables) {
    const [{ n }] = await db.query(
      `select count(*)::int as n from public.${table} where organization_id = ${lit(org.id)}`)
    if (n > 0) console.log(`  reste ${n} dans ${table}`)
    reste += n
  }

  if (reste) {
    console.error(`${reste} ligne(s) ont résisté. La purge est incomplète.`)
    process.exit(1)
  }
  console.log(`${total} ligne(s) effacées. ${org.name} est prête pour une nouvelle démonstration.`)
  console.log('Le journal d’audit garde la trace de chaque suppression.')
} finally {
  await db.fin()
}
