/**
 * Le fournisseur, du côté pur.
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
