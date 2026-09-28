'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { translateToolingCsv } from '@/lib/catalog/tooling-csv'
import type { CatalogState } from '@/lib/actions/catalog'

/**
 * Import de la typologie d'outillage.
 *
 * En deux temps, comme l'import d'un referentiel de controles : on depose, on
 * LIT ce que le fichier ferait, puis on confirme. Rien n'entre en base avant.
 * Un import silencieux qui reussit a moitie est pire qu'un refus.
 *
 * L'ecriture revient a `app.import_catalog_tools`, qui verifie elle-meme que
 * l'appelant administre la plateforme : l'ecran ne decide d'aucun droit.
 */

const MAX_BYTES = 4 * 1024 * 1024

export async function verifierOutillages(
  _previous: CatalogState | null,
  formData: FormData,
): Promise<CatalogState> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choisissez un fichier CSV.' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: 'Fichier trop volumineux (limite : 4 Mo).' }
  }

  const raw = await file.text()
  const lu = translateToolingCsv(raw)
  if (!lu.ok) {
    return {
      ok: false,
      message: `${lu.issues.length} anomalie(s) : rien n’a été écrit.`,
      details: lu.issues.slice(0, 20).map((i) => `ligne ${i.line} — ${i.message}`),
    }
  }

  const supabase = await createClient()
  const { data: existantes } = await supabase
    .from('catalog_tool')
    .select('code')
    .is('tenant_id', null)
  const connus = new Set((existantes ?? []).map((f) => f.code as string))
  const nouvelles = lu.rows.filter((r) => !connus.has(r.code as string))

  return {
    ok: true,
    message: `${lu.rows.length} famille(s) lues, sans anomalie.`,
    // Le fichier relu voyage jusqu'à la confirmation : c'est LUI qu'on a
    // validé, et c'est lui qui doit s'écrire — pas une seconde lecture.
    jobId: Buffer.from(JSON.stringify(lu.rows)).toString('base64'),
    details: [
      `${lu.coeur} au rang « gouvernance de l’IA », ${lu.support} au rang « outillage informatique »`,
      `${nouvelles.length} nouvelle(s), ${lu.rows.length - nouvelles.length} mise(s) à jour`,
      ...(nouvelles.length
        ? [`Nouvelles : ${nouvelles.map((r) => r.code).slice(0, 12).join(', ')}${nouvelles.length > 12 ? '…' : ''}`]
        : []),
      'Aucune famille absente du fichier ne sera supprimée : un produit peut y être déclaré.',
    ],
  }
}

export async function importerOutillages(
  _previous: CatalogState | null,
  formData: FormData,
): Promise<CatalogState> {
  const paquet = formData.get('paquet')
  if (typeof paquet !== 'string' || !paquet) {
    return { ok: false, message: 'Rien à importer : déposez d’abord le fichier.' }
  }

  let rows: unknown
  try {
    rows = JSON.parse(Buffer.from(paquet, 'base64').toString('utf8'))
  } catch {
    return { ok: false, message: 'Le fichier vérifié n’a pas pu être relu. Déposez-le de nouveau.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('import_catalog_tools', { p_rows: rows as never })
  if (error) {
    const propre = error.message.match(/^(?:.*?:\s)?([A-ZÀ-Ü][^\n]*)$/m)
    return { ok: false, message: propre?.[1] ?? error.message }
  }

  const bilan = (data ?? {}) as { ajoutees?: number; mises_a_jour?: number; rattachements?: number }
  revalidatePath('/admin')
  return {
    ok: true,
    message: `${bilan.ajoutees ?? 0} famille(s) ajoutée(s), ${bilan.mises_a_jour ?? 0} mise(s) à jour.`,
    details: [`${bilan.rattachements ?? 0} rattachement(s) aux contrôles-types.`],
  }
}
