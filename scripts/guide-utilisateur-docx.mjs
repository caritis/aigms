#!/usr/bin/env node
/**
 * Le guide de l'utilisateur, en Word.
 * Le Markdown fait foi ; ceci en est la remise, pour la formation.
 *
 *   NODE_PATH=/tmp/claude-1000/tools/node_modules node scripts/guide-utilisateur-docx.mjs
 */
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire('/tmp/claude-1000/tools/')
const {
  AlignmentType, Document, HeadingLevel, Packer, Paragraph,
  Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, ShadingType,
} = require('docx')

const FONT = 'Calibri'
const GRID = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
const BORDERS = { top: GRID, bottom: GRID, left: GRID, right: GRID }

const t = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size ?? 20, bold: o.bold, italics: o.italics, color: o.color })
const p = (text, o = {}) => new Paragraph({ children: [t(text, o)], spacing: { after: o.after ?? 120 }, alignment: o.align })
const h = (text, level = HeadingLevel.HEADING_1) => new Paragraph({
  heading: level, spacing: { before: 320, after: 140 },
  children: [t(text, { bold: true, size: level === HeadingLevel.HEADING_1 ? 28 : level === HeadingLevel.HEADING_2 ? 24 : 21, color: '0C2036' })],
})
const puce = (text, o = {}) => new Paragraph({ children: [t(text, o)], bullet: { level: 0 }, spacing: { after: 80 } })

/** Ce qu'il faut retenir, encadre. */
const retenir = (text, titre = 'À retenir') => new Paragraph({
  children: [t(`${titre} : `, { bold: true, color: '09AEAE' }), t(text)],
  spacing: { before: 120, after: 160 },
  shading: { type: ShadingType.CLEAR, fill: 'E8F8F8' },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: '09AEAE', space: 8 } },
})

/** Ce que l'application refuse : meme forme, autre couleur. */
const garde = (text) => new Paragraph({
  children: [t('Ce que la base tient : ', { bold: true, color: 'B3261E' }), t(text)],
  spacing: { before: 120, after: 160 },
  shading: { type: ShadingType.CLEAR, fill: 'FBECEA' },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: 'B3261E', space: 8 } },
})

const cell = (value, o = {}) => new TableCell({
  borders: BORDERS,
  shading: o.header ? { type: ShadingType.CLEAR, fill: '0C2036' }
    : o.doux ? { type: ShadingType.CLEAR, fill: 'F2F6FA' } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: (Array.isArray(value) ? value : [value]).map((l) =>
    new Paragraph({ children: [t(l, { size: 18, bold: o.header, color: o.header ? 'FFFFFF' : undefined })] })),
})
const table = (rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
const ligne = (cells, o = {}) => new TableRow({ children: cells.map((c) => cell(c, o)) })

/** Un travail pratique : titre, duree, consigne, ce qu'il faut observer. */
const tp = (num, nom, duree, consigne, observer) => [
  h(`TP ${num} — ${nom}`, HeadingLevel.HEADING_3),
  new Paragraph({ spacing: { after: 100 }, children: [t(duree, { bold: true, color: '09AEAE', size: 18 })] }),
  p(consigne),
  new Paragraph({
    children: [t('À observer : ', { bold: true }), t(observer, { italics: true })],
    spacing: { after: 200 },
  }),
]

const doc = new Document({
  creator: 'AIGMS — CARITIS',
  title: 'AIGMS — Guide de l’utilisateur',
  description: 'Support de formation',
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 900, right: 900 } } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [t('AIGMS', { bold: true, size: 44, color: '0C2036' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [t('Guide de l’utilisateur', { size: 28, color: '09AEAE' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 320 },
        children: [t('Support de formation · Version 1 — 28 septembre 2026', { size: 18, italics: true, color: '595959' })] }),

      retenir(
        'AIGMS n’automatise aucune décision de gouvernance. Il propose, il calcule, il rappelle, il refuse — mais c’est toujours une personne nommée qui décide, et son nom reste attaché à ce qu’elle a décidé.',
        'Avant tout le reste'),

      h('1. À qui s’adresse ce guide'),
      p('À toute personne qui reçoit un compte AIGMS : AI Governance Officer, administrateur client, porteur d’une solution d’IA, comité des risques, DPO ou RSSI, comité de direction, auditeur.'),
      p('Il se lit dans l’ordre pour une première prise en main, et se consulte par section ensuite. Le chapitre 4 dit ce que l’application attend de vous selon votre rôle : commencez par là si vous êtes pressé.'),

      h('2. Les dix mots d’AIGMS'),
      p('Ces mots ont un sens précis dans l’application. Les confondre fait perdre du temps, et parfois fausse un dossier.'),
      table([
        ligne(['Mot', 'Ce qu’il désigne', 'Ce qu’il n’est pas'], { header: true }),
        ligne(['Cas d’usage', 'Un emploi de l’IA dans un métier : « générer les devis ». L’unité de gouvernance — tout s’y rattache.', 'Un outil, un projet, un service']),
        ligne(['Actif d’IA', 'Ce que le cas d’usage EMPLOIE : modèle, agent, système, jeu de données. L’objet gouverné.', 'L’outil qui sert à le contrôler']),
        ligne(['Outillage', 'Ce AVEC QUOI on tient un contrôle : passerelle, DLP, journalisation, supervision humaine. L’instrument.', 'L’objet gouverné']),
        ligne(['Contrôle-type', 'Un modèle du référentiel. Il dit QUOI maîtriser.', 'Une réalité de votre organisation']),
        ligne(['Contrôle opérationnel', 'Ce que votre organisation met réellement en œuvre, avec un responsable, un état et des preuves.', 'Un vœu']),
        ligne(['Applicabilité', 'Ce que CE cas d’usage retient d’un contrôle : applicable, non applicable, à déterminer.', 'L’état du contrôle']),
        ligne(['Preuve', 'Une pièce validée et non échue qui démontre un contrôle.', 'Une déclaration de bonne foi']),
        ligne(['Criticité', 'Combien d’effort de gouvernance ce cas d’usage mérite. Se pose au triage.', 'Le niveau de risque']),
        ligne(['Risque', 'Un événement redouté, coté vraisemblance × gravité.', 'La criticité']),
        ligne(['Passerelle (gate)', 'Ce que l’application vérifie avant d’autoriser un changement d’étape.', 'Une formalité']),
      ]),
      p(''),
      retenir('Un même produit peut être un actif d’IA ET un outillage. Une passerelle d’appels IA applique vos règles (instrument de contrôle) et traite vos données (ressource du système). Déclarez-la « les deux » : elle entrera dans le périmètre gouverné.', 'Le piège le plus fréquent'),

      h('3. Se repérer dans l’écran'),
      h('La barre du haut', HeadingLevel.HEADING_2),
      p('De gauche à droite : la marque, les sections de l’organisation sur laquelle vous travaillez, le Pilotage (votre portefeuille entier), le nom de l’organisation courante, vos notifications, votre compte.'),
      p('L’ordre des sections dépend de votre rôle : l’application met en tête ce que vous avez à faire. Rien n’est retiré pour autant — tout reste accessible sous le menu Registres, et un lien qu’on vous partage fonctionne toujours.'),

      h('Les pastilles chiffrées', HeadingLevel.HEADING_2),
      p('Un chiffre dans la barre signale ce qui appelle une action. Il se survole, et dit alors ce qu’il compte : « 1 risque élevé ouvert », « 38 exigences sans décision ».'),
      table([
        ligne(['Couleur', 'Sens'], { header: true }),
        ligne(['Rouge', 'C’est en retard — cela aurait déjà dû être fait'], { doux: true }),
        ligne(['Ambre', 'Cela attend une main'], { doux: true }),
      ]),
      p(''),
      p('Le chiffre du Pilotage porte tout le portefeuille, pas seulement l’organisation ouverte : le survol le précise.'),
      retenir('Une pastille absente ne veut pas dire « rien à faire ». Selon votre rôle, certaines sections ne vous sollicitent pas — vous en êtes informé, pas saisi. L’auditeur n’en porte aucune : il constate, il ne solde rien.'),

      h('Le « i » et le « ! »', HeadingLevel.HEADING_2),
      p('Un rond « i » ouvre une explication : à quoi sert cet écran, ce qu’on s’y trompe le plus souvent. Un rond « ! » est un mode d’emploi à lire AVANT d’agir, pas un complément qu’on peut ignorer.'),
      p('Prenez l’habitude de les ouvrir la première fois. Ils contiennent les règles que l’application applique, écrites en français.'),

      h('4. Votre rôle : ce que l’application attend de vous'),
      table([
        ligne(['Rôle', 'Ce dont vous répondez', 'Ce que la barre ouvre en premier'], { header: true }),
        ligne(['AI Governance Officer', 'Conduire le système de management : usages, risques, contrôles, preuves', 'Cas d’usage · Processus et risques']),
        ligne(['Administrateur client', 'Les accès de votre organisation, et l’arbitrage quand il vous revient', 'Cas d’usage · Processus et risques']),
        ligne(['Porteur de l’IA', 'Déclarer l’usage, répondre de son fonctionnement, fournir les preuves', 'Cas d’usage · Processus et risques']),
        ligne(['Comité des risques', 'Coter, traiter ou ACCEPTER un risque — en votre nom', 'Processus et risques']),
        ligne(['Expert métier (DPO / RSSI)', 'Être consulté sur les contrôles et la conformité', 'Cas d’usage · Processus et risques']),
        ligne(['Comité de direction', 'Trancher là où cela engage l’entreprise', 'Pilotage · Décisions']),
        ligne(['Auditeur', 'Constater, sans rien modifier', 'Pilotage · Cas d’usage']),
        ligne(['Administration de la plateforme', 'Ouvrir les accès et entretenir les référentiels — elle ne gouverne rien', 'Ses propres écrans']),
      ]),
      p(''),
      h('Ce que votre rôle ne vous permet pas', HeadingLevel.HEADING_2),
      p('L’application refuse en le disant, et la règle est tenue par la base de données, pas par l’écran. Trois exemples que vous rencontrerez :'),
      puce('Accepter un risque revient à la personne désignée responsable de ce risque, et à elle seule. Un autre rôle se voit refuser l’acte, avec le nom de la personne à qui il revient.'),
      puce('Assumer un écart de preuve à la mise en production revient à la personne appelée à se prononcer. Elle reçoit un courriel et une notification.'),
      puce('Effacer un risque est fermé à son responsable : il en répond, il ne l’efface pas. Il peut le clore, ce qui n’est pas la même chose.'),

      h('5. Le fil d’un cas d’usage — huit gestes'),
      p('C’est le cœur du travail quotidien. Les huit gestes se suivent, mais on y revient : rien n’est figé, et tout changement laisse une trace.'),

      h('Geste 1 — Déclarer l’usage', HeadingLevel.HEADING_2),
      p('Cas d’usage → Déclarer un cas d’usage.', { bold: true }),
      p('Nommez-le par ce qu’il fait, pas par l’outil employé : « Génération de devis par IA générative », non « ChatGPT ». Renseignez la finalité, le processus métier, le porteur, le responsable redevable, les utilisateurs, les personnes concernées, les données traitées, le niveau d’autonomie.'),
      p('Puis, onglet Avancement, rattachez les actifs d’IA employés.'),
      retenir('L’actif apporte son fournisseur, et le fournisseur apporte sa revue. Une revue tiers non close devient une précondition de mise en production : la fiche l’affiche aussitôt.', 'Ce que le rattachement déclenche'),

      h('Geste 2 — Trier : la criticité', HeadingLevel.HEADING_2),
      p('Onglet Avancement → carte Criticité → la grille.', { bold: true }),
      p('Quatre questions. La grille ne décore pas : chaque réponse écrit un fait sur la fiche. Répondre « des données personnelles » rend l’étude d’impact exigée, pré-coche l’AIPD, et fait apparaître d’elles-mêmes les contrôles de protection des données au geste 5.'),

      h('Geste 3 — Qualifier au regard du règlement', HeadingLevel.HEADING_2),
      p('Onglet Avancement → Qualification réglementaire.', { bold: true }),
      p('Le rôle de votre organisation — fournisseur, déployeur, importateur, distributeur — et les drapeaux qui s’appliquent. AIGMS ne décide pas de votre qualification : il l’enregistre, avec son motif, sa date et son auteur.'),

      h('Geste 4 — Coter le risque', HeadingLevel.HEADING_2),
      p('Onglet Risques → Identifier un risque.', { bold: true }),
      table([
        ligne(['Champ', 'Ce qu’on attend'], { header: true }),
        ligne(['Intitulé', 'L’événement redouté, en une ligne. Pas la cause, pas la parade'], { doux: true }),
        ligne(['Scénario', 'Ce qui arrive, à qui, par quel enchaînement. C’est le seul champ qu’un auditeur relit'], { doux: true }),
        ligne(['Catégorie', 'La nature de l’atteinte. L’infobulle donne les treize définitions'], { doux: true }),
        ligne(['Qui répond du risque', 'Cette personne SEULE pourra l’accepter'], { doux: true }),
        ligne(['Vraisemblance × Gravité', 'Deux crans de 1 à 5, AVANT tout traitement : c’est le risque inhérent'], { doux: true }),
      ]),
      p(''),
      p('Les deux listes portent le chiffre ET le mot — « 4 — Probable », « 4 — Majeure » — et la définition du cran choisi s’affiche dessous. Le niveau se calcule et s’affiche avant d’enregistrer : « Critique — 4 × 4 = 16 ». Il n’est jamais saisi, pour qu’il ne puisse pas diverger de sa cotation.'),
      retenir('Dès que le scénario est rédigé, sans que vous cliquiez, l’assistant propose les contrôles du registre et des référentiels qui s’en approchent, avec l’extrait qui correspond. La catégorie entre dans la recherche : c’est elle qui sépare une fuite de données d’une erreur de calcul quand le scénario parle des deux.', 'Ce qui se produit pendant que vous écrivez'),

      h('Geste 5 — Retenir les contrôles, et dire avec quoi ils se tiennent', HeadingLevel.HEADING_2),
      p('Onglet Contrôles affectés → Proposer des contrôles.', { bold: true }),
      p('L’assistant rend des dizaines de propositions, en deux groupes : déclenchées par les faits que vous avez déclarés, et socle, attendues de tout cas d’usage. Vous n’en retenez que ce qui vaut.'),
      p('Pour vous y retrouver, la fenêtre porte en haut :'),
      puce('une recherche libre — code, mot du titre, motif, nom d’outil ;'),
      puce('des pastilles de domaine avec leur compte — GOV, SEC, SUP, DAT… ;'),
      puce('un bouton « ★ Les plus appropriés » : ce qu’un fait de la fiche a déclenché, et ce que le référentiel rend obligatoire.'),
      p('Chaque ligne concernée porte sa marque, « déclenché » ou « obligatoire », et la raison est écrite à côté.'),

      h('Le crayon : la fiche d’un contrôle, en trois onglets', HeadingLevel.HEADING_3),
      table([
        ligne(['Onglet', 'Ce qu’on y fait'], { header: true }),
        ligne(['Applicabilité', 'Applicable, non applicable, à déterminer. La justification est obligatoire pour une exclusion'], { doux: true }),
        ligne(['Actifs d’IA', 'Poser la mesure sur l’actif qui la porte — rattacher ou inscrire un actif si besoin'], { doux: true }),
        ligne(['Outillage', 'Retenir le produit employé — le déclarer si besoin'], { doux: true }),
      ]),
      p(''),
      p('Un point ambre sur l’onglet « Actifs d’IA » signale qu’une mesure technique applicable ne repose sur aucun actif. Vous le voyez sans ouvrir les trois onglets.'),
      p('Sur chaque onglet, le geste courant est en haut et son bouton reste visible en bas pendant que vous faites défiler. Les gestes rares sont repliés — sauf quand le registre est vide, où ils s’ouvrent d’eux-mêmes.'),
      retenir('Dans les deux formulaires de création, le champ Fournisseur porte « + Nouveau fournisseur… ». Deux champs, nom et pays, et le tiers naît avec l’actif ou avec l’outil — revue non commencée, ce que l’application vous dit aussitôt.', 'Le fournisseur se crée sur place'),

      h('Un contrôle qui n’apparaît pas dans les propositions', HeadingLevel.HEADING_3),
      p('Certains contrôles sont de portée ORGANISATION : la politique d’usage, le comité, l’audit interne. Ils se tiennent une fois pour toute l’organisation et ne s’affectent à aucun cas d’usage — ils ne figurent donc dans aucune proposition de cas d’usage. Vous les retenez depuis Registres → Contrôles et outillages → Proposer les contrôles d’organisation.'),

      h('Geste 6 — Produire une preuve', HeadingLevel.HEADING_2),
      p('Sur la ligne d’un contrôle applicable, une icône de pièce. Sa couleur dit l’état : rouge quand rien ne démontre le contrôle, verte quand une pièce validée et non échue le démontre. Deux filtres, « Avec preuve(s) » et « Sans preuve », réduisent la liste.'),
      retenir('Un contrôle n’est pas tenu parce qu’on l’a déclaré opérant. Il est tenu parce qu’une pièce validée et non échue le démontre. Une preuve expirée cesse de compter, sans que personne n’ait à intervenir.', 'La règle, partout dans l’outil'),

      h('Geste 7 — Conduire l’étude d’impact', HeadingLevel.HEADING_2),
      p('Cas d’usage → Conduire une étude d’impact IA.', { bold: true }),
      p('Les parties prenantes, les constats, leur gravité et leur vraisemblance, les mesures de réduction. Un constat sévère ouvre une action bloquante : elle apparaît dans le suivi et retient la mise en production.'),

      h('Geste 8 — Décider', HeadingLevel.HEADING_2),
      p('Onglet Décisions et changements.', { bold: true }),
      p('La décision de mise en production traverse les passerelles. L’écran liste ce qui est satisfait et ce qui ne l’est pas, contrôle par contrôle.'),
      retenir('Si des contrôles applicables ne sont pas démontrés, l’application ne bloque pas — mais elle avertit par courriel et par notification la personne appelée à se prononcer, qui doit assumer l’écart en son nom, avec une justification. C’est l’un des moments où la chaîne de responsabilité se voit le mieux.', 'L’écart de preuve'),

      h('6. Les registres'),
      table([
        ligne(['Registre', 'Ce qu’il contient', 'Le geste principal'], { header: true }),
        ligne(['Contrôles et outillages', 'Le dispositif de maîtrise réellement en place', 'Proposer les contrôles d’organisation']),
        ligne(['Actifs d’IA et fournisseurs', 'Ce que l’organisation emploie, et les tiers dont elle dépend', 'Déclarer un actif d’IA']),
        ligne(['Décisions', 'Ce qui a été décidé, par qui, sur quel motif', '—']),
        ligne(['Déclaration d’Applicabilité', 'Exigence par exigence, ce qui est retenu ou écarté', '—']),
        ligne(['Preuves', 'Les pièces, leur validité, leur échéance', 'Déposer une preuve']),
        ligne(['Suivi d’actions et d’incidents', 'Ce qui reste à faire, ce qui s’est passé', '—']),
        ligne(['Revues de gouvernance', 'Les revues tenues et à tenir', '—']),
      ]),
      p(''),

      h('Le registre des contrôles', HeadingLevel.HEADING_2),
      p('Chaque contrôle est replié. La ligne fermée porte le code, l’intitulé, la référence, le responsable, et ce qui manque en ambre : sans responsable, aucune exigence, rien à prouver, sans outillage. Un repli ne cache jamais un écart.'),
      p('Trois filtres se cumulent : état, domaine (GOV, DAT, SEC…) et outillage manquant.'),
      retenir('Un contrôle écrit à la main n’est rattaché à aucun contrôle-type : il ne porte ni preuves attendues ni questions d’évaluation, et n’apparaît dans aucune proposition. Préférez toujours « Proposer ».', 'Écrire un contrôle est l’exception'),

      h('Le registre des actifs et fournisseurs', HeadingLevel.HEADING_2),
      p('Le filtre porte les natures d’actif — système, modèle, agent, jeu de données — et une entrée Fournisseurs, qui donne la liste complète des tiers : statut de revue, criticité, pays, date, et les actifs que chacun fournit. L’entrée passe en ambre quand une revue n’est pas approuvée.'),

      h('La carte d’outillage', HeadingLevel.HEADING_2),
      p('Registres → Contrôles et outillages → Outillage.', { bold: true }),
      p('Le référentiel classe les familles sur deux rangs :'),
      puce('Gouvernance de l’IA — ce qui tient ou prouve un contrôle d’IA. C’est ce que la saisie propose en premier ;'),
      puce('Outillage informatique — infrastructure, exploitation, sécurité du SI. Utile quand un contrôle d’IA s’appuie dessus, mais ce n’est pas un inventaire à tenir. AIGMS ne construit pas de CMDB.'),
      p('Vous déclarez le produit employé chez vous, pas la famille : la différence entre « se tient avec un outil de prévention des fuites » et « se tient avec Netskope, chez nous ». La seconde formule dit à l’auditeur où prendre la preuve.'),

      h('7. Ce que l’application refuse, et pourquoi'),
      p('Ces règles sont tenues par la base de données. Elles s’appliquent quel que soit l’écran, et quel que soit le rôle.'),
      table([
        ligne(['Elle refuse', 'Parce que'], { header: true }),
        ligne(['Accepter un risque au nom d’un autre', 'Une acceptation est un acte nominatif']),
        ligne(['Accepter sans justification ni date de revue', 'Une acceptation sans terme n’en est pas une']),
        ligne(['Clore un risque sans motif', 'Une clôture sort le risque de la passerelle de production']),
        ligne(['Effacer un risque qui a produit quelque chose', 'Il se clôt ; l’effacement est réservé à l’erreur de saisie']),
        ligne(['Supprimer une organisation', 'Elle s’archive, pour que ses décisions restent lisibles']),
        ligne(['Saisir un niveau de risque', 'Il se calcule, pour qu’il ne diverge pas de sa cotation']),
      ]),
      p(''),

      h('Clore ou effacer un risque', HeadingLevel.HEADING_2),
      p('Deux gestes, et ils ne servent pas la même chose.'),
      p('CLORE — pour un risque qui a vécu et n’a plus lieu d’être : périmètre modifié, cas d’usage abandonné, risque absorbé par un autre. Rien ne disparaît. Motif obligatoire, clôture en votre nom. Ouvert aussi au responsable du risque.'),
      p('EFFACER — pour une ligne saisie par erreur : un doublon, un essai, un risque porté sur le mauvais cas d’usage. Uniquement si elle n’a rien laissé derrière elle : encore « identifié », jamais accepté, sans traitement, sans décision qui la désigne, sans constat d’impact qui y renvoie. Réservé à l’officer et à l’administrateur client.'),
      garde('Le journal conserve l’instantané complet du risque effacé, votre nom, la date et votre motif. Un effacement est tracé, jamais silencieux.'),

      h('Recoter un risque déjà accepté', HeadingLevel.HEADING_2),
      garde('Une acceptation vaut pour le niveau auquel elle a été donnée. Si votre correction fait MONTER le niveau, l’acceptation est retirée, le risque revient à « identifié », et la personne qui l’avait acceptée en est avertie. Une correction à la baisse ne change rien.'),

      h('8. Administration'),
      p('Réservée à l’administration de la plateforme. Elle ne gouverne rien : elle ouvre les accès et entretient les référentiels.'),

      h('Importer un référentiel de contrôles', HeadingLevel.HEADING_2),
      p('Administration → Référentiels. JSON canonique ou CSV au format du modèle. Le document est validé au dépôt — structure, clés naturelles, domaines, doublons — et rien n’entre en base avant confirmation. L’import est atomique ; le fichier, son empreinte SHA-256 et son auteur sont conservés.'),
      p('Une version publiée est immuable : pour la corriger, on en dépose une nouvelle. Les contrôles déjà instanciés chez les clients ne bougent pas.'),

      h('Importer la typologie d’outillage', HeadingLevel.HEADING_2),
      p('Même écran, même principe. Le modèle CSV n’est pas un squelette vide : c’est l’état réel de la typologie livrée. On part de ce qui existe, on ajoute ou on corrige une ligne, on redépose.'),
      p('L’import ajoute et met à jour ; il ne supprime jamais — une famille absente du fichier reste en place, parce qu’un produit peut y être déclaré chez un client et un contrôle-type s’y rattacher.'),

      h('9. Travaux pratiques'),
      p('Six exercices, sur l’organisation de démonstration. Comptez deux heures.'),
      ...tp('1', 'Déclarer et trier', '20 minutes',
        'Déclarez un cas d’usage de votre choix, rattachez-lui un actif d’IA, puis remplissez la grille de criticité.',
        'ce que la dernière réponse de la grille écrit sur la fiche, et ce qui change ensuite dans l’onglet Avancement.'),
      ...tp('2', 'Coter un risque', '20 minutes',
        'Identifiez un risque avec un scénario d’au moins trois lignes. Changez ensuite la catégorie.',
        'le niveau qui s’affiche avant enregistrement, et les contrôles que l’assistant propose sans que vous cliquiez. Les propositions changent avec la catégorie.'),
      ...tp('3', 'Retenir des contrôles', '25 minutes',
        'Ouvrez « Proposer des contrôles ». Utilisez la recherche, puis le filtre « les plus appropriés ». Retenez-en trois.',
        'le motif écrit à côté des propositions déclenchées — personne n’a coché de case pour les faire apparaître.'),
      ...tp('4', 'Équiper un contrôle', '25 minutes',
        'Sur un contrôle technique, ouvrez le crayon. Posez la mesure sur un actif, puis déclarez un outil en créant le fournisseur sur place. Vérifiez ensuite le fournisseur dans le registre.',
        'le point ambre sur l’onglet « Actifs d’IA », et ce que l’application répond après la création du tiers.'),
      ...tp('5', 'Produire une preuve', '15 minutes',
        'Cochez le filtre « Sans preuve ». Déposez une preuve sur un contrôle.',
        'l’icône qui change de couleur et le compte de l’en-tête qui descend.'),
      ...tp('6', 'Décider, et assumer un écart', '20 minutes',
        'Tentez une mise en production avec des contrôles non démontrés.',
        'l’avertissement, le courriel envoyé à la personne appelée à se prononcer, et ce qu’elle doit écrire pour assumer l’écart.'),

      h('10. Questions fréquentes'),
      table([
        ligne(['Question', 'Réponse'], { header: true }),
        ligne(['Je ne vois pas une section dans le menu.', 'Elle n’a pas disparu. Selon votre rôle, elle se trouve sous « Registres ». Aucune section n’est retirée, et un lien partagé fonctionne toujours.']),
        ligne(['Un chiffre de la barre me semble faux.', 'Survolez-le : il dit ce qu’il compte. Le chiffre du Pilotage porte tout le portefeuille, pas l’organisation ouverte.']),
        ligne(['Une liste est vide alors que j’ai saisi des données.', 'Vérifiez d’abord les filtres actifs. Si un bandeau rouge annonce qu’une lecture a échoué, signalez-le : l’écran ne reflète alors pas l’état réel du dossier.']),
        ligne(['Un contrôle du registre n’apparaît pas dans les propositions d’un cas d’usage.', 'Il est probablement de portée ORGANISATION : il se tient une fois pour toute l’organisation. C’est le modèle, pas une anomalie.']),
        ligne(['J’ai coté un risque trop haut. Puis-je corriger ?', 'Oui, au crayon sur sa ligne. S’il était accepté et que le niveau monte, l’acceptation est retirée et son auteur averti.']),
        ligne(['Puis-je supprimer un cas d’usage ?', 'Non. Comme une organisation, il s’archive : ses décisions et ses preuves doivent rester lisibles.']),
        ligne(['Qui peut voir ce que je saisis ?', 'Toutes les personnes de votre tenant, selon leur rôle. L’écriture est strictement bornée, et toute opération sensible est portée au journal, avec votre nom et la date.']),
      ]),
      p(''),
      p('Ce guide décrit AIGMS au 28 septembre 2026. Les écrans évoluent ; les règles qu’il énonce sont tenues par la base de données et changent rarement.', { italics: true, size: 18, color: '595959' }),
    ],
  }],
})

const buffer = await Packer.toBuffer(doc)
writeFileSync('docs/formation/GUIDE_UTILISATEUR_AIGMS.docx', buffer)
console.log('GUIDE_UTILISATEUR_AIGMS.docx écrit')
