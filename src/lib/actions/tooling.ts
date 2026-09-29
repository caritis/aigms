'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { resolveVendor } from '@/lib/actions/registry'
import { vendorIdSaisi } from '@/lib/domain/vendors'

/**
 * Avec quoi l'organisation tient ses controles.
 *
 * Une ligne par famille d'outillage du referentiel, le produit employe. Ce
 * n'est pas un inventaire du SI : pas d'instances, pas de dependances. Le
 * referentiel propose une typologie ; l'officer retient ce qui vaut pour SON
 * controle, et le controle-type n'est jamais modifie.
 */
export type FormState =
  | { ok: true; message: string; toolingId?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

function firstIssues(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return { ok: false, message: 'Merci de corriger les champs signalés.', fieldErrors }
}

function explain(error: { message: string }): string {
  if (error.message.includes('row-level security')) return 'Votre rôle ne permet pas cette écriture.'
  if (error.message.includes('duplicate key')) return 'Ce produit est déjà déclaré sur cette famille : le corriger plutôt que l’ajouter.'
  const raise = error.message.match(/^(?:.*?:\s)?([A-ZÀ-Ü][^\n]*)$/m)
  return raise?.[1] ?? error.message
}

const toolingSchema = z.object({
  organizationId: z.string().uuid(),
  toolingId: z.string().uuid().optional().or(z.literal('')),
  toolCode: z.string().trim().min(2).max(64),
  product: z.string().trim().min(2, 'Nommer le produit employé.').max(160),
  vendorId: z.string().uuid().optional().or(z.literal('')),
  /*
    À quel titre l'outil est déclaré : instrument d'un contrôle (ISO 27002,
    RGPD art. 32), ressource d'un système d'IA (ISO 42001 A.4.4), ou les deux.

    Ce n'est plus une question posée. Un produit n'est ni l'un ni l'autre EN
    SOI : il l'est par le rôle qu'il joue. Un outil déclaré depuis un contrôle
    en est l'instrument ; rattaché à un actif d'IA employé, il est les deux.
    Le champ reste accepté pour qui l'enverrait, mais l'écran ne le demande
    plus — et le rattachement le tranche.
  */
  role: z.enum(['control_instrument', 'system_resource', 'both']).default('control_instrument'),
  // Renseigné quand l'outil est lui-même un actif d'IA déclaré.
  assetId: z.string().uuid().optional().or(z.literal('')),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

function paths(organizationId: string, useCaseId?: string) {
  revalidatePath(`/admin/organizations/${organizationId}/outillage`)
  revalidatePath(`/admin/organizations/${organizationId}/controles`)
  /*
    La fiche du cas d'usage aussi, quand la declaration en vient : le registre
    des tiers qu'elle a passe a la fenetre est alors perime, et un fournisseur
    cree a l'instant n'apparaitrait pas dans la liste.
  */
  if (useCaseId) revalidatePath(`/admin/use-cases/${useCaseId}`)
}

export async function saveTooling(_previous: FormState | null, formData: FormData): Promise<FormState> {
  const useCaseId = formData.get('useCaseId')
  const parsed = toolingSchema.safeParse({
    organizationId: formData.get('organizationId'),
    toolingId: formData.get('toolingId') ?? '',
    toolCode: formData.get('toolCode'),
    product: formData.get('product'),
    vendorId: vendorIdSaisi(formData),
    role: formData.get('role') || 'control_instrument',
    assetId: formData.get('assetId') ?? '',
    note: formData.get('note') ?? '',
  })
  if (!parsed.success) return firstIssues(parsed.error)
  const d = parsed.data

  const supabase = await createClient()
  const { data: organization } = await supabase
    .from('organization')
    .select('tenant_id')
    .eq('id', d.organizationId)
    .maybeSingle()
  if (!organization) return { ok: false, message: 'Organisation introuvable.' }

  // Le tiers peut naitre avec l'outil : un produit sans fournisseur declare
  // laisse une revue tierce introuvable au moment ou elle conditionnera la
  // mise en production.
  const fournisseur = await resolveVendor(formData, d.organizationId, organization.tenant_id)
  if (!fournisseur.ok) {
    return { ok: false, message: fournisseur.message, fieldErrors: { vendorId: fournisseur.message } }
  }

  const row = {
    tenant_id: organization.tenant_id,
    organization_id: d.organizationId,
    tool_code: d.toolCode,
    product: d.product,
    vendor_id: fournisseur.vendorId,
    // Déduit, jamais deviné : rattaché à un actif, l'outil est les deux.
    role: d.assetId ? 'both' : d.role,
    asset_id: d.assetId || null,
    note: d.note || null,
  }

  /*
    L'identifiant revient a l'ecran. Le produit qu'on vient de nommer
    apparaissait dans la liste a cocher — mais decoche, au milieu des autres,
    au-dessus du volet ou l'on venait d'ecrire : on ne le voyait pas, et l'on
    concluait qu'il fallait rafraichir. Le rendre permet de le cocher
    d'office : le geste se termine la ou il a commence.
  */
  const { data: outil, error } = d.toolingId
    ? await supabase.from('organization_tooling').update(row).eq('id', d.toolingId).select('id').single()
    : await supabase.from('organization_tooling').insert(row).select('id').single()
  if (error) {
    // Le tiers a pu naitre avant l'echec : le taire ferait chercher un
    // fournisseur qu'on croirait perdu, et le recreer en double.
    return {
      ok: false,
      message: fournisseur.cree
        ? `${explain(error)} Le tiers ${fournisseur.cree} a bien été créé : reprenez en le choisissant dans la liste.`
        : explain(error),
    }
  }

  paths(d.organizationId, typeof useCaseId === 'string' ? useCaseId : undefined)
  // Brancher une source pour en tirer les preuves reste a venir, et relevera
  // de l'administration de la plateforme : la colonne existe, l'ecran ne la
  // propose pas.
  return {
    ok: true,
    toolingId: outil.id,
    message: fournisseur.cree
      ? `${d.product} enregistré, et le tiers ${fournisseur.cree} créé — sa revue reste à ouvrir. Il est coché ci-dessus : « Retenir » l'attache à ce contrôle.`
      : `${d.product} enregistré et coché ci-dessus : « Retenir » l’attache à ce contrôle.`,
  }
}

export async function removeTooling(organizationId: string, toolingId: string): Promise<FormState> {
  const supabase = await createClient()
  const { error } = await supabase.from('organization_tooling').delete().eq('id', toolingId)
  if (error) return { ok: false, message: explain(error) }
  paths(organizationId)
  return { ok: true, message: 'Outil retiré de la carte.' }
}

// -----------------------------------------------------------------------------
// Ce qu'un controle retient
// -----------------------------------------------------------------------------
const retainSchema = z.object({
  organizationId: z.string().uuid(),
  controlId: z.string().uuid(),
  toolingIds: z.array(z.string().uuid()),
  rationale: z.string().trim().max(1000).optional().or(z.literal('')),
})

export async function retainTooling(_previous: FormState | null, formData: FormData): Promise<FormState> {
  const parsed = retainSchema.safeParse({
    organizationId: formData.get('organizationId'),
    controlId: formData.get('controlId'),
    toolingIds: formData.getAll('toolingIds').filter((v): v is string => typeof v === 'string' && v.length > 0),
    rationale: formData.get('rationale') ?? '',
  })
  if (!parsed.success) return firstIssues(parsed.error)
  const d = parsed.data

  const supabase = await createClient()
  const { data: control } = await supabase
    .from('control')
    .select('tenant_id')
    .eq('id', d.controlId)
    .maybeSingle()
  if (!control) return { ok: false, message: 'Contrôle introuvable.' }

  // Ce que l'officer retient remplace ce qu'il retenait : la carte d'un
  // controle se lit d'un coup, elle ne s'empile pas.
  const { error: clearError } = await supabase.from('control_tooling').delete().eq('control_id', d.controlId)
  if (clearError) return { ok: false, message: explain(clearError) }

  if (d.toolingIds.length) {
    const { error } = await supabase.from('control_tooling').insert(
      d.toolingIds.map((toolingId) => ({
        tenant_id: control.tenant_id,
        control_id: d.controlId,
        tooling_id: toolingId,
        rationale: d.rationale || null,
      })),
    )
    if (error) return { ok: false, message: explain(error) }
  }

  paths(d.organizationId)
  return {
    ok: true,
    message: d.toolingIds.length
      ? `Ce contrôle se tient avec ${d.toolingIds.length} outil(s).`
      : 'Aucun outil retenu : ce contrôle se tient à la main.',
  }
}
