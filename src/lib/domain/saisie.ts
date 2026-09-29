/**
 * Les valeurs-sentinelles de la saisie rapide, du côté pur.
 *
 * Trois formulaires proposent de créer ce qui manque sans quitter l'écran —
 * un fournisseur, un actif d'IA. La valeur qui porte ce choix n'est pas un
 * identifiant, et les schémas de validation attendent un UUID : ils
 * refuseraient la saisie AVANT que la création n'ait lieu.
 *
 * Un module `'use server'` ne peut exporter QUE des fonctions asynchrones :
 * une constante ou une fonction synchrone y annule tous les exports du
 * module, et le build échoue sur « the module has no exports at all ». Ni le
 * typage ni le lint ne le voient — seul `next build` le dit.
 *
 * Ces deux valeurs vivent donc ici, lues par l'écran comme par les actions.
 */

/**
 * La valeur que porte « + Nouveau fournisseur… ».
 *
 * Ce n'est pas un identifiant, et les schémas de validation attendent un
 * UUID : ils refusaient la saisie AVANT que la résolution n'ait lieu, sur un
 * « Invalid UUID » que rien ne rattachait au champ.
 */
export const NOUVEAU_FOURNISSEUR = '__nouveau__'

/** Ce que le schéma doit voir : un UUID, ou rien. Jamais le mot-clé. */
export function vendorIdSaisi(formData: FormData): string {
  const brut = formData.get('vendorId')
  if (typeof brut !== 'string' || brut === NOUVEAU_FOURNISSEUR) return ''
  return brut
}

/**
 * La valeur que porte « + Inscrire cet actif d'IA… ».
 *
 * Un produit qu'on déclare comme outil est souvent aussi un actif — une
 * passerelle d'appels IA applique les règles ET traite les données — et il
 * n'existe pas encore au registre au moment où on le déclare. Sans cette
 * porte, la question « est-ce aussi un actif ? » n'avait aucune réponse
 * possible : il fallait sortir, inscrire, revenir.
 */
export const NOUVEL_ACTIF = '__nouvel_actif__'

/** Même règle pour l'actif : un UUID, ou rien. */
export function assetIdSaisi(formData: FormData): string {
  const brut = formData.get('assetId')
  if (typeof brut !== 'string' || brut === NOUVEL_ACTIF) return ''
  return brut
}
