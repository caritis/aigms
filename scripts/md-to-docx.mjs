#!/usr/bin/env node
/**
 * Un Markdown, rendu en Word.
 *
 * Les documents commerciaux sont ecrits en Markdown — c'est lui qui est
 * versionne, relu et diffe. Le .docx n'en est que la remise, pour la
 * presentation et la signature. Les generateurs precedents portaient leur
 * contenu en JavaScript : le texte vivait a deux endroits, et les deux ont
 * divergé. Celui-ci ne porte que la mise en page.
 *
 *   node scripts/md-to-docx.mjs docs/commercial/OFFRE_01_DISCOVER.md [...]
 *
 * Ce qu'il rend : titres, paragraphes, listes a puces et numerotees, tableaux,
 * citations, traits de separation, et en ligne : gras, italique, code. Le reste
 * passe tel quel plutot que d'etre avale — un document incomplet se voit, un
 * document silencieusement ampute, non.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'
import { createRequire } from 'node:module'
// `docx` est une dependance du projet : on la resout depuis ce fichier. La
// resoudre depuis un repertoire de session liait le script a la machine qui
// l'avait ecrit, et il cessait de tourner ailleurs.
const require = createRequire(import.meta.url)
const {
  AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} = require('docx')

const FONT = 'Calibri'
const ENCRE = '0C2036'
const MARQUE = '09AEAE'
const GRIS = '595959'
const GRID = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
const BORDERS = { top: GRID, bottom: GRID, left: GRID, right: GRID }

/**
 * Le gras, l'italique et le code, en ligne.
 *
 * On decoupe sur les marqueurs plutot que de les effacer : `**` non ferme reste
 * visible, ce qui signale la faute de frappe au lieu de la masquer.
 */
function runs(texte, base = {}) {
  const out = []
  const motif = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let dernier = 0
  for (const m of texte.matchAll(motif)) {
    if (m.index > dernier) out.push(new TextRun({ text: texte.slice(dernier, m.index), font: FONT, ...base }))
    const brut = m[0]
    if (brut.startsWith('**')) {
      out.push(new TextRun({ text: brut.slice(2, -2), font: FONT, ...base, bold: true }))
    } else if (brut.startsWith('`')) {
      out.push(new TextRun({ text: brut.slice(1, -1), font: 'Consolas', size: base.size ?? 20, color: base.color }))
    } else {
      out.push(new TextRun({ text: brut.slice(1, -1), font: FONT, ...base, italics: true }))
    }
    dernier = m.index + brut.length
  }
  if (dernier < texte.length) out.push(new TextRun({ text: texte.slice(dernier), font: FONT, ...base }))
  return out.length ? out : [new TextRun({ text: '', font: FONT, ...base })]
}

const NIVEAUX = [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4]
const TAILLES = [40, 30, 24, 22, 20]

function titre(niveau, texte) {
  return new Paragraph({
    heading: NIVEAUX[Math.min(niveau - 1, 4)],
    spacing: { before: niveau <= 2 ? 360 : 260, after: 140 },
    children: runs(texte, { bold: true, size: TAILLES[Math.min(niveau - 1, 4)], color: niveau === 2 ? MARQUE : ENCRE }),
  })
}

const cellule = (valeur, entete) => new TableCell({
  borders: BORDERS,
  shading: entete ? { type: ShadingType.CLEAR, fill: ENCRE } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: [new Paragraph({
    children: runs(valeur, { size: 18, bold: entete, color: entete ? 'FFFFFF' : undefined }),
  })],
})

/** Une ligne de tableau Markdown, decoupee sans casser les `\|` echappes. */
const colonnes = (ligne) =>
  ligne.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'))

const estSeparateur = (ligne) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(ligne) && ligne.includes('-')

export function convertir(markdown) {
  const lignes = markdown.split('\n')
  const blocs = []
  let i = 0

  while (i < lignes.length) {
    const ligne = lignes[i]

    // Tableau : une ligne de colonnes suivie de son separateur.
    if (ligne.trim().startsWith('|') && estSeparateur(lignes[i + 1] ?? '')) {
      const rows = [new TableRow({ children: colonnes(ligne).map((c) => cellule(c, true)) })]
      i += 2
      while (i < lignes.length && lignes[i].trim().startsWith('|')) {
        rows.push(new TableRow({ children: colonnes(lignes[i]).map((c) => cellule(c, false)) }))
        i += 1
      }
      blocs.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
      blocs.push(new Paragraph({ text: '', spacing: { after: 120 } }))
      continue
    }

    // Citation : ce qu'il faut dire, encadre.
    if (ligne.startsWith('> ') || ligne === '>') {
      const dedans = []
      while (i < lignes.length && (lignes[i].startsWith('> ') || lignes[i] === '>')) {
        dedans.push(lignes[i].replace(/^> ?/, ''))
        i += 1
      }
      // Un tableau dans une citation se rend comme un tableau : l'encadrer
      // produirait une bouillie.
      if (dedans.some((l) => l.trim().startsWith('|'))) {
        blocs.push(...convertir(dedans.join('\n')).blocs)
        continue
      }
      for (const [n, l] of dedans.entries()) {
        if (!l.trim()) continue
        blocs.push(new Paragraph({
          children: runs(l.replace(/^[-*] /, '• '), { italics: true }),
          spacing: { before: n === 0 ? 120 : 0, after: n === dedans.length - 1 ? 160 : 40 },
          shading: { type: ShadingType.CLEAR, fill: 'E8F8F8' },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: MARQUE, space: 8 } },
        }))
      }
      continue
    }

    // Titres.
    const h = ligne.match(/^(#{1,5}) (.+)$/)
    if (h) {
      blocs.push(titre(h[1].length, h[2]))
      i += 1
      continue
    }

    // Trait de separation.
    if (/^---+$/.test(ligne.trim())) {
      blocs.push(new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D0D7DE', space: 1 } },
        spacing: { before: 200, after: 200 },
      }))
      i += 1
      continue
    }

    // Listes, a puces ou numerotees, avec un niveau d'indentation.
    const puce = ligne.match(/^(\s*)[-*] (.+)$/)
    const num = ligne.match(/^(\s*)\d+\. (.+)$/)
    if (puce || num) {
      const m = puce ?? num
      const niveau = Math.min(Math.floor(m[1].length / 2), 2)
      blocs.push(new Paragraph({
        children: runs(m[2]),
        bullet: puce ? { level: niveau } : undefined,
        numbering: num ? { reference: 'ordonnee', level: niveau } : undefined,
        spacing: { after: 80 },
        indent: num && !puce ? { left: 360 + niveau * 360 } : undefined,
      }))
      i += 1
      continue
    }

    // Paragraphe, ou ligne vide.
    if (ligne.trim()) {
      // Les lignes d'un meme paragraphe se recollent : le Markdown les coupe
      // a quatre-vingts colonnes, Word n'a pas a le savoir.
      const morceaux = [ligne.trim()]
      i += 1
      while (
        i < lignes.length && lignes[i].trim() &&
        !/^(#{1,5} |[-*] |\d+\. |> |\|)/.test(lignes[i]) && !/^---+$/.test(lignes[i].trim())
      ) {
        morceaux.push(lignes[i].trim())
        i += 1
      }
      const texte = morceaux.join(' ')
      const italique = /^\*[^*].*\*$/.test(texte)
      blocs.push(new Paragraph({
        children: runs(italique ? texte.slice(1, -1) : texte, italique ? { italics: true, color: GRIS, size: 18 } : {}),
        spacing: { after: 140 },
      }))
      continue
    }

    i += 1
  }

  return { blocs }
}

function document(markdown) {
  const { blocs } = convertir(markdown)
  return new Document({
    creator: 'AIGMS — CARITIS',
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    numbering: {
      config: [{
        reference: 'ordonnee',
        levels: [0, 1, 2].map((level) => ({
          level, format: 'decimal', text: `%${level + 1}.`, alignment: AlignmentType.START,
        })),
      }],
    },
    sections: [{
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
      children: blocs,
    }],
  })
}

const fichiers = process.argv.slice(2)
if (!fichiers.length) {
  console.error('Usage : node scripts/md-to-docx.mjs <fichier.md> [...]')
  process.exit(1)
}

for (const chemin of fichiers) {
  const sortie = chemin.replace(/\.md$/, '.docx')
  const buffer = await Packer.toBuffer(document(readFileSync(chemin, 'utf8')))
  writeFileSync(sortie, buffer)
  console.log(`${basename(sortie)} écrit`)
}
