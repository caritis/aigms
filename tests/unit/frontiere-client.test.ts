import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Un composant serveur ne lit pas une donnee exportee par un module client.
 *
 * Depuis un module marque `'use client'`, le serveur ne recoit pas la valeur
 * mais une REFERENCE : `REGISTER_SECTIONS.includes(...)` leve, et la page
 * repond « A server error occurred ». Ni TypeScript ni le build ne le voient —
 * c'est une erreur d'execution, et elle a atteint l'utilisateur le
 * 23 septembre 2026 (ADR-0029).
 *
 * Importer un COMPOSANT depuis un module client est legitime, et c'est meme
 * ainsi que l'on compose. Seule la donnee est interdite : constantes,
 * fonctions utilitaires. Ce test ne verifie que cela.
 */

function fichiers(racine: string): string[] {
  return readdirSync(racine).flatMap((nom) => {
    const chemin = join(racine, nom)
    if (statSync(chemin).isDirectory()) return fichiers(chemin)
    return /\.tsx?$/.test(nom) ? [chemin] : []
  })
}

const tous = fichiers('src')
const estClient = (chemin: string) => readFileSync(chemin, 'utf8').slice(0, 200).includes("'use client'")

/** Ce qu'un module exporte et qui n'est pas un composant. */
function donneesExportees(chemin: string): string[] {
  const source = readFileSync(chemin, 'utf8')
  const noms: string[] = []
  for (const m of source.matchAll(/^export (const|let|function|enum) (\w+)/gm)) {
    const [, genre, nom] = m
    // Un composant se nomme en PascalCase : majuscule initiale, pas de tiret
    // bas. `ORGANIZATION_SECTIONS` commence aussi par une majuscule et n'en
    // est pas un — c'est ce qui a laissé passer la faute la première fois.
    const composant =
      (genre === 'const' || genre === 'function') && /^[A-Z][a-zA-Z0-9]*$/.test(nom!)
    if (composant) continue
    noms.push(nom!)
  }
  return noms
}

describe('Frontière serveur / client', () => {
  it('aucun module serveur ne lit une donnée exportée par un module client', () => {
    const fautes: string[] = []

    for (const client of tous.filter(estClient)) {
      const donnees = donneesExportees(client)
      if (!donnees.length) continue
      const alias = `@/${client.replace(/^src[\\/]/, '').replace(/\\/g, '/').replace(/\.tsx?$/, '')}`

      for (const autre of tous) {
        if (autre === client || estClient(autre)) continue
        const source = readFileSync(autre, 'utf8')
        for (const m of source.matchAll(
          new RegExp(`import \\{([^}]*)\\} from '${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'),
        )) {
          const importes = m[1]!.split(',').map((s) => s.trim().replace(/^type\s+/, ''))
          const interdits = donnees.filter((d) => importes.includes(d))
          if (interdits.length) fautes.push(`${autre} lit ${interdits.join(', ')} depuis ${alias}`)
        }
      }
    }

    expect(fautes).toEqual([])
  }, 30_000)

  /*
    L'erreur miroir, et elle est pire : un module `'use server'` ne peut
    exporter QUE des fonctions asynchrones. Une constante ou une fonction
    synchrone y annule TOUS les exports du module — « the module has no
    exports at all » — et tout ce qui en dependait tombe d'un coup.

    Ni `tsc` ni ESLint ne le voient. Seul `next build` le dit, c'est-a-dire au
    deploiement. Ce test le dit en une seconde.
  */
  it('un module d’actions serveur n’exporte que des fonctions asynchrones', () => {
    const fautes: string[] = []

    for (const fichier of tous) {
      const source = readFileSync(fichier, 'utf8')
      if (!/^\s*['"]use server['"]/m.test(source)) continue

      for (const m of source.matchAll(/^export\s+(?!type\b|interface\b)(\w+)\s*(\w+)?/gm)) {
        const [, mot, nom] = m
        // `export async function` est la seule forme admise ; `export type`
        // et `export interface` sont effaces a la compilation.
        if (mot === 'async') continue
        fautes.push(`${fichier} exporte « ${mot}${nom ? ` ${nom}` : ''} » : seules les fonctions asynchrones sont permises dans un module 'use server'.`)
      }
    }

    expect(fautes).toEqual([])
  })
})
