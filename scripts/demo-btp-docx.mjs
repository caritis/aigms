#!/usr/bin/env node
/**
 * Le script de demonstration BTP, en Word.
 * Le Markdown fait foi ; ceci en est la remise, pour la presentation.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire('/tmp/claude-1000/tools/')
const {
  AlignmentType, Document, HeadingLevel, ImageRun, Packer, Paragraph,
  Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, ShadingType,
} = require('docx')

const IMG = 'docs/commercial/images'
const FONT = 'Calibri'
const GRID = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
const BORDERS = { top: GRID, bottom: GRID, left: GRID, right: GRID }

const t = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size ?? 20, bold: o.bold, italics: o.italics, color: o.color })
const p = (text, o = {}) => new Paragraph({ children: [t(text, o)], spacing: { after: o.after ?? 120 }, alignment: o.align })
const h = (text, level = HeadingLevel.HEADING_1) => new Paragraph({
  heading: level, spacing: { before: 300, after: 140 },
  children: [t(text, { bold: true, size: level === HeadingLevel.HEADING_1 ? 28 : 24, color: '0C2036' })],
})
const puce = (text, o = {}) => new Paragraph({ children: [t(text, o)], bullet: { level: 0 }, spacing: { after: 80 } })

/** Ce qu'il faut dire, encadre : c'est ce qu'on relit avant d'entrer. */
const insister = (text) => new Paragraph({
  children: [t('À dire : ', { bold: true, color: '09AEAE' }), t(text, { italics: true })],
  spacing: { before: 120, after: 160 },
  shading: { type: ShadingType.CLEAR, fill: 'E8F8F8' },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: '09AEAE', space: 8 } },
})

const cell = (value, o = {}) => new TableCell({
  borders: BORDERS,
  shading: o.header ? { type: ShadingType.CLEAR, fill: '0C2036' }
    : o.saisie ? { type: ShadingType.CLEAR, fill: 'F2F6FA' } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: (Array.isArray(value) ? value : [value]).map((l) =>
    new Paragraph({ children: [t(l, { size: 18, bold: o.header, color: o.header ? 'FFFFFF' : undefined })] })),
})
const table = (rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
const ligne = (cells, o = {}) => new TableRow({ children: cells.map((c) => cell(c, o)) })

function figure(nom, legende) {
  const data = readFileSync(`${IMG}/${nom}.png`)
  const width = data.readUInt32BE(16)
  const height = data.readUInt32BE(20)
  const w = 620
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 60 },
      children: [new ImageRun({ data, type: 'png', transformation: { width: w, height: Math.round((height / width) * w) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 220 },
      children: [t(legende, { size: 16, italics: true, color: '595959' })] }),
  ]
}

/** Une etape : titre, ou l'on est, ce qu'on saisit, ce qu'on dit. */
const etape = (num, nom, duree, ou, saisies, aDire) => [
  h(`Étape ${num} — ${nom}`, HeadingLevel.HEADING_2),
  new Paragraph({ spacing: { after: 100 }, children: [
    t(`${duree}  ·  `, { bold: true, color: '09AEAE', size: 18 }), t(ou, { size: 18, color: '535C66' }),
  ]}),
  ...(saisies.length ? [table([ligne(['Champ', 'À saisir'], { header: true }),
    ...saisies.map((s) => ligne(s, { saisie: true }))]), p('')] : []),
  insister(aDire),
]

const doc = new Document({
  creator: 'AIGMS — CARITIS',
  title: 'Script de démonstration — Shadow AI dans le BTP',
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 900, right: 900 } } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [t('Script de démonstration', { bold: true, size: 36, color: '0C2036' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [t('Shadow AI dans le BTP — la génération de devis', { size: 26, color: '09AEAE' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 280 },
        children: [t('BATIVAL Construction · 18 minutes, 20 avec l’option · Version 1, 25 septembre 2026', { size: 18, italics: true, color: '595959' })] }),

      p('Des commerciaux génèrent leurs devis sur des comptes ChatGPT personnels, en y versant d’anciens devis, des grilles de prix fournisseurs et des marges.'),
      p('Cette démonstration ne montre pas des écrans. Elle montre une chaîne de responsabilité qui se termine par un courriel qu’une personne nommée reçoit, lit et assume — en direct, devant le prospect.', { bold: true }),

      ...figure('btp-1-avant-apres', 'Ce que le prospect vit aujourd’hui, et ce qu’AIGMS en fait'),

      h('1. Ce qui est déjà en place'),
      p('Rien de cette section ne se déroule devant le prospect. C’est le décor, monté à l’avance — il est déjà dans la base de démonstration.', { bold: true }),

      h('La société', HeadingLevel.HEADING_2),
      table([
        ligne(['Raison sociale', 'BATIVAL Construction SAS (fictive)'], {}),
        ligne(['Secteur', 'Bâtiment et travaux publics']),
        ligne(['Effectif', '340 salariés, Bordeaux']),
        ligne(['Rôle vis-à-vis de l’IA', 'Exploitant de solution tierce']),
      ]),
      p(''),
      p('Ce dernier point commande tout le reste : BATIVAL n’entraîne aucun modèle. AIGMS ne lui demandera donc aucune preuve de code, d’apprentissage ou de jeu de données — seulement des preuves d’usage, de contrat et de surveillance. C’est exactement ce que dit la fiche de conformité du prospect.'),
      insister('Votre outil ne va pas vous demander ce que vous ne pouvez pas produire.'),

      h('Les huit comptes', HeadingLevel.HEADING_2),
      p('Mot de passe commun : Demo!Passw0rd'),
      table([
        ligne(['Adresse', 'Nom', 'Rôle', 'Dans la démonstration'], { header: true }),
        ligne(['admin@aigms.eu', 'Inès Duhamel', 'Administrateur de la plateforme', 'Ouvre les accès. Ne gouverne rien']),
        ligne(['officer@aigms.eu', 'Camille Rousset', 'AI Governance Officer', 'Conduit les étapes 1 à 8']),
        ligne(['dsi-admin@aigms.eu', 'Marc Lecomte', 'Administrateur client', 'Reçoit le courriel et approuve']),
        ligne(['devsecops@aigms.eu', 'Dominique Etchart', 'Porteur de l’IA', 'Accepte les risques résiduels']),
        ligne(['risk-comity@aigms.eu', 'Sacha Belarbi', 'Comité des risques', 'Répond du risque coté']),
        ligne(['rssi@aigms.eu', 'Yann Cazaux', 'Expert métier (DPO / RSSI)', 'Cité, non sollicité']),
        ligne(['direction@aigms.eu', 'Élodie Marchetti', 'Comité de direction', 'Citée, non sollicitée']),
        ligne(['audit@aigms.eu', 'Noa Lasserre', 'Auditeur', 'Cité, non sollicité']),
      ]),
      p(''),
      p('Ce sont les mêmes personnes que sur l’autre organisation de démonstration. Ce n’est pas un raccourci : une adresse de courriel ne porte qu’une identité, et c’est la réalité d’un cabinet — un officer, plusieurs clients. Si le prospect le remarque, c’est une occasion : ouvrez le Pilotage, il verra le portefeuille entier sur un écran.'),

      h('Ce que BATIVAL emploie déjà', HeadingLevel.HEADING_2),
      p('Deux actifs d’IA sont inscrits au registre avant la démonstration. Ils n’y sont pas par commodité : un actif se décrit une fois et se lit ensuite depuis tous ses cas d’usage — on ne le crée pas au milieu d’une présentation.'),
      table([
        ligne(['Actif', 'Nature', 'Ce qu’il porte'], { header: true }),
        ligne(['Assistant conversationnel grand public — comptes personnels', 'Système d’IA',
               'Souscrit à titre individuel par les commerciaux. Aucune console d’entreprise, aucun réglage de rétention. Données personnelles.']),
        ligne(['Devis émis et grilles de prix fournisseurs', 'Jeu de données',
               'Historique des devis, marges et coordonnées clients — ce qui est versé dans l’assistant. Données personnelles.']),
      ]),
      p(''),
      p('Le fournisseur qui les porte est inscrit lui aussi : revue non close, sans DPA, hors Union européenne. C’est ce qui rendra la mention « Tiers non revu » visible dès l’étape 1.'),
      insister('Ne confondez pas les deux mots, le prospect le fera. Un ACTIF D’IA est ce que le cas d’usage emploie. Un OUTILLAGE est ce avec quoi on tient un contrôle — passerelle, DLP, journalisation. Le premier est l’objet gouverné ; le second est l’instrument, et c’est de lui que la preuve se prend. Un même produit peut être les deux : une passerelle d’appels IA est un instrument de contrôle et une ressource du système.'),

      h('À vérifier dix minutes avant', HeadingLevel.HEADING_2),
      puce('Les deux organisations apparaissent dans le menu utilisateur.'),
      puce('La boîte dsi-admin@aigms.eu est ouverte dans un onglet, déjà connectée.'),
      puce('Un second navigateur est prêt : basculer d’identité est le geste le plus lent de la démonstration.'),

      h('2. Le fil — huit gestes'),
      ...figure('btp-2-parcours', 'Chaque étape a un acteur nommé. C’est ce qui distingue un registre d’un tableur'),

      ...etape('1', 'Déclarer l’usage', '1 min 30',
        'officer@aigms.eu · se placer sur BATIVAL Construction · Cas d’usage → Déclarer un cas d’usage',
        [
          ['Nom', 'Génération de devis par IA générative'],
          ['Finalité', 'Rédiger les devis clients à partir d’anciens devis et des grilles de prix fournisseurs, pour réduire le délai de réponse aux appels d’offres.'],
          ['Processus métier', 'Commercial — réponse aux appels d’offres'],
          ['Bénéfice attendu', 'Délai de réponse divisé par deux'],
          ['Porteur de l’IA', 'Dominique Etchart'],
          ['Responsable redevable', 'Marc Lecomte'],
          ['Utilisateurs', 'Les quatorze commerciaux et chargés d’affaires'],
          ['Personnes concernées', 'Les clients, dont les devis portent les coordonnées'],
          ['Données traitées', 'Anciens devis, grilles de prix fournisseurs, marges, coordonnées clients'],
          ['Niveau d’autonomie', 'L1 — il propose, un humain valide'],
          ['Puis, onglet Avancement', 'Rattacher un actif : l’assistant conversationnel, puis le jeu de devis'],
        ],
        'Je déclare un usage que personne n’a autorisé, qui tourne déjà, et dont la direction ignore l’existence. Le registre ne l’interdit pas : il le rend visible. On n’encadre que ce qu’on a nommé.'),
      p('Le rattachement fait venir le fournisseur avec l’actif, et avec lui sa revue non close : la fiche affiche « Tiers non revu » sans qu’on ait rien saisi de plus. Une revue tiers ouverte retiendra la mise en production — le prospect le verra à l’étape 8.'),

      ...etape('2', 'Trier : la criticité', '1 min 30',
        'Onglet Avancement → carte Criticité → la grille',
        [
          ['Qui subit une erreur du système ?', 'Des clients ou partenaires identifiés'],
          ['Une erreur se rattrape…', 'Avec un coût ou un délai'],
          ['Que fait le système de sa sortie ?', 'Il propose : un humain valide chaque cas'],
          ['Quelles données traite-t-il ?', 'Des données personnelles'],
          ['Criticité retenue', 'Élevée'],
          ['Justification', 'Un devis erroné engage l’entreprise sur un prix. Les données versées sortent du périmètre contractuel.'],
        ],
        'Regardez ce que la dernière réponse vient de faire. Elle n’a pas seulement calculé un niveau : elle a écrit un fait sur la fiche. À partir de maintenant, l’étude d’impact est exigée, l’AIPD se pré-coche, et les contrôles de protection des données se proposent d’eux-mêmes. La grille ne décore pas, elle déclenche.'),

      ...etape('3', 'Qualifier au regard du règlement', '1 min',
        'Onglet Avancement → Qualification réglementaire',
        [
          ['Rôle de l’organisation', 'Déployeur'],
          ['Cases à cocher', 'Impact sur la vie privée · Fournisseur hors Union européenne'],
          ['Justification', 'BATIVAL exploite une solution tierce. Il ne répond pas de l’entraînement du modèle, mais de l’usage qu’il en fait et des données qu’il y verse.'],
        ],
        'AIGMS ne décide pas de votre qualification. Il l’enregistre, avec son motif, sa date et son auteur. Le jour où une autorité pose la question, vous n’avez pas à vous souvenir : vous ouvrez la fiche.'),

      ...etape('4', 'Coter le risque', '1 min 30',
        'Onglet Risques → Identifier un risque',
        [
          ['Intitulé', 'Fuite de données commerciales vers un tiers'],
          ['Scénario', 'Devis, marges et prix fournisseurs versés dans un service public, hors contrat, potentiellement réutilisés pour l’entraînement du modèle.'],
          ['Catégorie', 'Tiers'],
          ['Qui répond de ce risque', 'Sacha Belarbi'],
          ['Vraisemblance', '4 — Probable'],
          ['Gravité', '4 — Majeure'],
          ['Niveau inhérent obtenu', 'Critique — 4 × 4 = 16, affiché sous le bandeau gris'],
        ],
        'Les deux listes portent le chiffre ET le mot, et la définition du cran choisi s’écrit dessous. Un outil qui vous demande de noter de 1 à 5 sans dire ce que 4 veut dire vous donnera cinq cotations différentes pour cinq personnes. Ici, « Probable » signifie « s’est déjà produit chez vous, ou les conditions sont réunies » : deux personnes cotent pareil.'),
      p('L’infobulle à côté de la catégorie donne les treize définitions. Cette catégorie-là nourrit la recherche de contrôle à l’étape suivante — elle n’est pas un classement décoratif.'),

      h('Ce qui se produit pendant que vous écrivez', HeadingLevel.HEADING_3),
      p('Dès que le scénario est rédigé, sans que vous cliquiez sur quoi que ce soit, un encadré s’ouvre en bas de la fenêtre : « L’assistant lit ce que vous écrivez — intitulé, scénario, catégorie — et propose les contrôles du registre et des référentiels qui s’en approchent. » La liste apparaît seule, chaque ligne avec l’extrait du contrôle qui correspond.'),
      insister('Laissez le silence s’installer une seconde avant de commenter. Je n’ai rien demandé : j’ai décrit un risque en français, et l’outil est allé chercher dans cent vingt contrôles-types ce qui le traite. Vous pouvez en retenir un tout de suite — il rejoindra le registre et deviendra applicable — ou passer, et décider au traitement.'),
      p('Pour la démonstration, ne retenez rien ici : les contrôles se choisissent à l’étape 5, et l’on veut montrer les deux chemins.'),

      h('Étape 5 — Retenir les contrôles, et dire avec quoi ils se tiennent', HeadingLevel.HEADING_2),
      new Paragraph({ spacing: { after: 100 }, children: [
        t('2 min  ·  ', { bold: true, color: '09AEAE', size: 18 }),
        t('Onglet Contrôles affectés → « Laisser l’assistant proposer »', { size: 18, color: '535C66' }),
      ]}),
      p('L’assistant rend 44 propositions, en deux groupes : déclenchées par les faits que vous venez de déclarer, et socle attendues de tout cas d’usage. Vous n’en retenez que quatre — celles qui répondent à la fiche du prospect.'),
      insister('Quarante-quatre propositions, et je n’en garde que quatre. Un outil qui vous en impose quarante-quatre vous fait abandonner au bout de trois. Ici, c’est l’officer qui retient, et le référentiel n’est jamais modifié.'),

      h('Comment s’y retrouver dans les quarante-quatre', HeadingLevel.HEADING_3),
      p('La fenêtre porte en haut une barre qui reste visible pendant qu’on fait défiler :'),
      puce('une recherche libre — un code, un mot du titre, un motif, un nom d’outil ;'),
      puce('des pastilles de domaine avec leur compte — GOV, SEC, SUP, DAT… ;'),
      puce('un bouton « ★ Les plus appropriés » : les propositions déclenchées par un fait de la fiche, et celles que le référentiel rend obligatoires.'),
      p('Chaque ligne concernée porte sa marque, « ★ déclenché » ou « ★ obligatoire ». Cliquez « ★ Les plus appropriés » : la liste tombe de quarante-quatre à une poignée, et les quatre du tableau ci-dessous sont dedans.'),
      insister('Le filtre ne devine rien. « Déclenché » veut dire qu’un fait que j’ai saisi l’a fait apparaître ; « obligatoire » veut dire que le référentiel l’attend de tout cas d’usage. Dans les deux cas, la raison est écrite à côté.'),

      h('Les quatre à cocher dans la liste', HeadingLevel.HEADING_3),
      table([
        ligne(['Code', 'Intitulé', 'Groupe', 'Pourquoi il est proposé'], { header: true }),
        ligne(['AIGMS-SUP-005', 'Utilisation des données par le fournisseur', 'déclenchée',
               'Des données personnelles transitent chez un fournisseur : leur usage se borne.'], { saisie: true }),
        ligne(['AIGMS-SEC-008', 'Prévention de l’exfiltration de données', 'déclenchée',
               'Des données personnelles sont mobilisées : le système ne doit pas les laisser sortir.'], { saisie: true }),
        ligne(['AIGMS-SEC-006', 'Journalisation de sécurité des systèmes d’IA', 'socle, obligatoire',
               'Attendu de tout cas d’usage.'], { saisie: true }),
        ligne(['AIGMS-HUM-001', 'Niveau de supervision humaine', 'socle, obligatoire',
               'Attendu de tout cas d’usage.'], { saisie: true }),
      ]),
      p(''),
      insister('Les deux premières lignes sont marquées « déclenchée », avec leur motif écrit en clair. Personne n’a coché une case pour les faire apparaître : elles sont là parce que j’ai répondu « données personnelles » dans la grille de criticité, il y a quatre minutes.'),

      h('Le cinquième ne se trouve pas dans les propositions', HeadingLevel.HEADING_3),
      p('AIGMS-GOV-008 — Politique d’usage acceptable de l’IA porte la charte signée qu’exige la fiche du prospect. Il n’est pas proposé : le moteur le range au socle de l’organisation, pas du cas d’usage.'),
      table([
        ligne(['Où aller', 'Registres → Contrôles et outillages → Ajouter un contrôle → onglet « Depuis le référentiel »'], { saisie: true }),
        ligne(['Comment le trouver', 'Filtrer le domaine GOV — Gouvernance, ou taper GOV-008 dans la recherche'], { saisie: true }),
        ligne(['Ce que contient le catalogue', '120 contrôles-types du référentiel AIGMS-CF v0.4, dont 12 en GOV'], { saisie: true }),
      ]),
      p(''),
      insister('L’assistant propose ; il ne décide pas. Ce qui relève de la politique d’entreprise ne se déduit pas d’un cas d’usage — c’est l’officer qui l’inscrit.'),

      h('Statuer, poser, outiller — au même endroit', HeadingLevel.HEADING_3),
      p('De retour sur la fiche, onglet Contrôles affectés : chaque ligne porte un crayon à gauche du code. Il n’ouvre pas un champ, il ouvre la fiche du contrôle sur ce cas d’usage, en trois onglets.'),
      table([
        ligne(['Onglet', 'Ce qu’on y fait', 'Sur quels contrôles'], { header: true }),
        ligne(['Applicabilité', 'Statuer Applicable — la justification n’est obligatoire que pour une exclusion', 'les quatre'], { saisie: true }),
        ligne(['Actifs d’IA', 'Poser la mesure sur l’assistant conversationnel, état Prévue', 'AIGMS-SEC-008, AIGMS-SEC-006 (mesures techniques)'], { saisie: true }),
        ligne(['Outillage', 'Déclarer le produit sur la famille que le référentiel attend', 'voir le tableau ci-dessous'], { saisie: true }),
      ]),
      p(''),

      h('Les quatre natures d’actif — à connaître avant de saisir', HeadingLevel.HEADING_3),
      p('Quand vous inscrivez un actif, l’écran demande sa NATURE. Les quatre ne se recouvrent pas, et le prospect posera la question.'),
      table([
        ligne(['Nature', 'Ce que c’est', 'Exemple chez BATIVAL'], { header: true }),
        ligne(['Système d’IA', 'Ce qui est déployé et utilisé tel quel : une application, un service, un assistant. La nature la plus fréquente', 'ChatGPT Enterprise']),
        ligne(['Modèle', 'Le modèle lui-même, entraîné ou acquis, servant un ou plusieurs systèmes, avec sa version', '—']),
        ligne(['Agent', 'Un système qui enchaîne des actions avec une autonomie propre : il ne répond pas, il agit', '—']),
        ligne(['Jeu de données', 'Ce que le système apprend ou mobilise : entraînement, réglage, évaluation, base documentaire', 'Devis émis et grilles de prix']),
      ]),
      p(''),
      insister('Un SYSTÈME est employé. Un MODÈLE est ce qui produit la sortie. Un AGENT décide de ses actions. Un JEU DE DONNÉES est ce dont il se nourrit. BATIVAL n’entraîne aucun modèle et n’exploite aucun agent : deux des quatre cases resteront vides, et c’est une information.'),

      h('Pourquoi « Poser sur l’actif » ne propose qu’un seul actif', HeadingLevel.HEADING_3),
      p('La liste ne contient que ce que CE cas d’usage emploie — pas tout le registre. Poser une mesure sur un actif que le cas d’usage n’emploie pas ne voudrait rien dire.'),
      p('Pour en ajouter, les deux volets sous le formulaire : « Rattacher un actif déjà inscrit » (il existe au registre, il n’est pas encore employé ici) ou « Inscrire un actif » (il n’existe pas encore).'),
      insister('La liste est courte parce que le dossier est honnête : ce cas d’usage emploie un assistant et un jeu de données, pas l’informatique entière de l’entreprise.'),
      p(''),
      insister('Avant de cliquer, montrez le point ambre. Sur AIGMS-SEC-006 et AIGMS-SEC-008, l’onglet « Actifs d’IA » porte une pastille orange : la mesure est technique, applicable, et ne repose sur aucun actif. L’outil ne me demande pas d’ouvrir trois onglets pour savoir où est le travail : il me le montre.'),
      p('Sur chaque onglet, le geste courant est en haut et son bouton reste visible en bas pendant qu’on fait défiler. Les gestes rares — rattacher un actif déjà inscrit, inscrire un actif, déclarer un produit — sont repliés, sauf quand le registre est vide : ils s’ouvrent alors d’eux-mêmes, parce qu’ils sont les seuls gestes possibles.'),
      p(''),
      table([
        ligne(['Famille suggérée', 'Produit à déclarer', 'Sur quel contrôle', 'Aussi un actif ?'], { header: true }),
        ligne(['Prévention des fuites (DLP)', 'Netskope', 'AIGMS-SEC-008', 'non'], { saisie: true }),
        ligne(['Journalisation (Logs)', 'Splunk', 'AIGMS-SEC-006', 'non'], { saisie: true }),
        ligne(['Passerelle d’appels IA (AI Gateway)', 'Azure API Management', 'AIGMS-SEC-008', 'oui — « + L’inscrire au registre des actifs d’IA… »'], { saisie: true }),
      ]),
      p(''),
      p('Trois champs seulement se saisissent : la famille, le produit, et une question fermée — « Est-ce aussi un actif d’IA que vous employez ? ».'),
      insister('Le rôle ne se choisit pas : il se déduit. L’écran ne demande jamais « instrument ou ressource ? » — un produit n’est ni l’un ni l’autre en soi. Il pose une question de fait, et en tire la conséquence, écrite sous le champ : non donne « instrument d’un contrôle — vous gouvernez avec, sans le gouverner lui-même » ; oui donne « instrument et ressource — vous le gouvernez, et vous gouvernez avec ».'),
      p('La famille, elle, est déjà proposée dans la liste déroulante : c’est celle que le contrôle appelle. Vous ne tapez que le nom du produit.'),
      p('La passerelle n’est nulle part encore — et c’est le point. La question « est-ce aussi un actif d’IA ? » n’aurait aucune réponse possible s’il fallait d’abord sortir, ouvrir le registre des actifs, l’y inscrire, revenir. La liste déroulante offre donc, en dernière ligne, « + L’inscrire au registre des actifs d’IA… » : un seul champ de plus apparaît — de quelle nature ? (système d’IA, par défaut) — et l’actif naît avec le nom du produit et le fournisseur déjà saisis. Sa fiche se complète plus tard, au registre.'),
      insister('Même geste que pour le fournisseur qu’on crée sans quitter l’écran : on n’oblige jamais à sortir pour créer ce qui manque au moment où il manque.'),
      p('Une fois plusieurs produits posés, la liste des outils déclarés affiche trois informations par ligne, et aucune ne se saisit : la famille du référentiel, le titre auquel l’outil est déclaré — instrument, ressource du système, ou les deux — et le fait que le référentiel l’attendait ou non pour ce contrôle-ci.'),
      table([
        ligne(['Produit', 'Ce que la ligne affiche'], { header: true }),
        ligne(['Azure API Management', 'API Management · instrument et ressource'], { saisie: true }),
        ligne(['Netskope', 'Data Loss Prevention · instrument · suggéré par le référentiel'], { saisie: true }),
        ligne(['Splunk', 'Journaux d’événements · instrument'], { saisie: true }),
      ]),
      p(''),

      h('Le cas qui fait comprendre la différence', HeadingLevel.HEADING_3),
      p('Sur la passerelle, l’écran demande : « Est-ce aussi un actif d’IA que vous employez ? » Inscrivez-la d’ici, en système d’IA.'),
      insister('Une passerelle d’appels IA APPLIQUE mes règles — c’est un instrument de contrôle. Et elle TRAITE mes données — c’est donc aussi quelque chose que je dois gouverner. Un produit, deux rôles. L’outil ne me demande pas de choisir : il me demande un fait, et il en déduit le reste.'),
      p('Ouvrez ensuite Registres → Actifs d’IA et fournisseurs → Tout ce que vous employez : la passerelle y figure UNE SEULE FOIS, avec ses deux pastilles « Gouverné » et « Instrument ». Netskope et Splunk ne portent que « Instrument ». ChatGPT Enterprise ne porte que « Gouverné ».'),
      insister('La phrase à retenir : si l’auditeur dit « montrez-moi ce que fait votre IA », il parle des actifs. S’il dit « prouvez-moi que vous la maîtrisez », il parle de l’outillage.'),

      h('Et AIGMS-SUP-005 ? Aucun outil', HeadingLevel.HEADING_3),
      p('Ouvrez son onglet Outillage. L’écran dit : « Le référentiel AIGMS ne suggère aucune famille pour ce contrôle. »'),
      p('Ce n’est pas un manque. AIGMS-SUP-005 est un contrôle CONTRACTUEL : il établit si le fournisseur peut utiliser les données soumises pour entraîner ses modèles, les conserver, les relire. Ce qui le tient n’est pas un outil, c’est un contrat — et la preuve est la clause signée, plus la capture de la console Enterprise montrant la rétention désactivée.'),
      insister('Tout ne se tient pas avec un outil. Celui-ci se tient avec une signature. AIGMS ne me force pas à inventer un produit pour remplir une case : il me dit qu’il n’en attend pas, et il attend une preuve d’une autre nature.'),

      h('Où ChatGPT Enterprise se déclare, et pourquoi là', HeadingLevel.HEADING_3),
      p('C’est un ACTIF D’IA, pas un outillage. Il se déclare comme système d’IA, en remplacement des comptes personnels. C’est ce que les commerciaux emploieront : il traite vos devis, vos marges, vos coordonnées clients. Il est l’objet gouverné.'),
      p('Ce qui TIENT les contrôles, ce sont Netskope, Splunk et la passerelle. La console Enterprise, elle, ne tient rien : elle PROUVE — sa configuration est une pièce déposée sur AIGMS-SUP-005.'),
      insister('Ouvrez AIGMS-SEC-008 en premier. Avant que vous n’ayez rien déclaré, la fenêtre dit deux choses : « Contrôle de nature technique, sans outillage retenu — il énonce un moyen sans le nommer : en l’état, il ne se prouve pas », et elle suggère AI Gateway et DLP. Votre référentiel dit « ce contrôle se tient avec un outil de prévention des fuites » : c’est une typologie, elle dit où chercher, pas ce que vous employez. Ici, le contrôle dira « se tient avec Netskope, chez nous » — et l’auditeur saura où aller prendre la preuve.'),
      p('Confirmation visuelle à faire remarquer : sous la ligne d’une mesure technique que rien ne porte, l’écran affiche en orange « Aucun actif ne la porte ». Après le geste, la pastille verte de l’actif prend sa place.'),

      h('Le fournisseur se crée sans quitter l’écran', HeadingLevel.HEADING_3),
      p('Au moment de déclarer ChatGPT Enterprise comme actif, le champ « Qui vous le fournit ? » porte une entrée « + Nouveau fournisseur… ». Choisissez-la : deux champs apparaissent, nom et pays.'),
      table([
        ligne(['Nom du fournisseur', 'Open.AI'], { saisie: true }),
        ligne(['Pays', 'US'], { saisie: true }),
      ]),
      p(''),
      insister('Je viens de créer un tiers au milieu de ma saisie, sans perdre le fil. Et regardez ce que l’outil me répond : « le tiers Open.AI est créé, sa revue reste à ouvrir — elle conditionne la mise en production ». Je n’ai rien demandé de plus, et il vient de m’ouvrir une obligation.'),
      p('C’est le moment d’ouvrir Registres → Actifs d’IA et fournisseurs → Fournisseurs : le tiers y est, en ambre, « revue non commencée », avec l’actif qu’il fournit. La chaîne s’est nouée toute seule.'),

      ...etape('6', 'Produire une preuve', '2 min',
        'Retour sur le cas d’usage → onglet Contrôles affectés',
        [
          ['1. Montrer', 'L’en-tête du groupe : « 5 applicables · 5 sans preuve »'],
          ['2. Filtrer', 'Cocher Sans preuve — la liste se réduit'],
          ['3. Ouvrir', 'L’icône de pièce, rouge, SUR LA LIGNE D’AIGMS-GOV-008 — Politique d’usage acceptable de l’IA, celui que vous êtes allé chercher au référentiel à l’étape 5'],
        ],
        'Pourquoi celui-là : le référentiel énonce, pour AIGMS-GOV-008, les pièces qu’il attend — politique d’usage acceptable, attestations de prise de connaissance, canal de signalement documenté. La charte est la première des trois. C’est le contrôle que la fiche du prospect appelle quand elle exige « une charte d’usage signée ».'),

      p('Les champs, dans l’ordre de l’écran :', { bold: true }),
      table([
        ligne(['Champ', 'À saisir', 'Pourquoi'], { header: true }),
        ligne(['Typologie de preuve (facultatif)', '— Aucune typologie technique', 'Une charte n’est pas une preuve technique d’IA'], { saisie: true }),
        ligne(['Ce que la preuve démontre', 'Charte d’utilisation de l’IA générative — version 1', 'Le titre dit ce qui est démontré, pas le nom du fichier'], { saisie: true }),
        ligne(['Nature', 'Document', 'La forme matérielle de la pièce'], { saisie: true }),
        ligne(['Fichier', 'La charte en PDF', 'Son empreinte SHA-256 est calculée au dépôt'], { saisie: true }),
        ligne(['Valable jusqu’au', 'Dans douze mois', 'Le référentiel révise ce contrôle chaque année'], { saisie: true }),
        ligne(['Contrôle démontré', 'AIGMS-GOV-008 — déjà prérempli', 'Vous êtes parti de sa ligne : rien à rechercher'], { saisie: true }),
        ligne(['Version (facultatif)', '1.0', ''], { saisie: true }),
      ]),
      p(''),

      h('Les deux listes ne disent pas la même chose — ne pas les confondre', HeadingLevel.HEADING_3),
      p('C’est la question que le prospect posera, parce que les deux s’appellent presque pareil.'),
      p('« Typologie de preuve » ne propose PAS des catégories documentaires. Elle porte les huit typologies techniques de la matrice des preuves AIGMS, adossées à ISO/IEC 42001 : isolation et souveraineté, intégrité des données, éthique et équité, explicabilité (XAI), alignement et garde-fous, cybersécurité spécifique à l’IA, surveillance et dérive, empreinte environnementale. Chacune dit ce qu’il faut consigner et quels livrables font preuve — l’écran l’affiche dès que vous en choisissez une.'),
      p('Le préfixe de criticité n’est pas décoratif. BATIVAL est déclarée utilisateur métier : l’écran classe donc Surveillance continue et dérive en critique, explicabilité et cybersécurité IA en modéré, et le reste en faible. Un développeur de modèles verrait un tout autre classement — équité, alignement, XAI passeraient en critique.'),
      insister('Regardez l’ordre de cette liste. Il n’est pas alphabétique : il est trié par ce que votre rôle vis-à-vis de l’IA rend exigeant. Vous exploitez des systèmes achetés — on ne vous demandera pas de prouver l’équité d’un modèle que vous n’entraînez pas ; on vous demandera de prouver que vous surveillez sa dérive.'),
      p('« Nature », juste en dessous, est la forme matérielle de la pièce : document, capture d’écran, extrait de journal, attestation, résultat de test, configuration, ou déclarative — aucune pièce jointe.'),
      p('Pour une charte : aucune typologie technique, nature Document. Les deux champs se remplissent alors sans hésitation — et vous venez de montrer que l’outil sait distinguer une preuve d’organisation d’une preuve d’ingénierie.'),
      insister('Faites remarquer l’icône qui passe au vert et le compte qui descend à 4 sans preuve. Le contrôle n’est pas tenu parce qu’on l’a déclaré opérant : il est tenu parce qu’une pièce validée et non échue le démontre. C’est la même règle partout dans l’outil.'),
      p('Un dépôt n’est pas une validation. Le bandeau de la fenêtre le dit, et la pièce arrive « à valider » : celui qui fournit la pièce n’atteste pas lui-même de sa recevabilité.'),
      p(''),

      ...etape('7', 'Conduire l’étude d’impact', '4 min',
        'Cas d’usage → Conduire une étude d’impact IA, puis bascule sur devsecops@aigms.eu',
        [],
        'L’écran suit le modèle ISO/IEC 42005 en quatre temps. Trois se saisissent ; le quatrième s’écrit tout seul — et c’est celui-là qu’il faut faire remarquer.'),

      table([
        ligne(['Rubrique', 'Ce qu’on y fait', 'Qui l’écrit'], { header: true }),
        ligne(['1. Cadrage et contexte', 'Le périmètre, la méthode, la phase, l’AIPD', 'Vous — le reste vient de la fiche']),
        ligne(['1.1 Parties prenantes', 'Les groupes affectés, vulnérables ou non, consultés ou non', 'Vous']),
        ligne(['2. Analyse croisée des impacts', 'Bénéfices et préjudices, par domaine de la norme', 'Vous']),
        ligne(['3. Plan de gouvernance et remédiation', 'Les mesures devenues actions, confiées et datées', 'L’OUTIL — rien ne s’y saisit']),
      ]),
      p(''),
      p('Les quatre rubriques se replient, et une rubrique fermée n’est pas muette : elle porte sa ligne de résumé — « 3 groupe(s) · aucun vulnérable · 1 consulté », « 3 préjudice(s) · 1 bénéfice · 1 grave sans mesure de réduction », « 2 mesure(s) · 1 action bloquante pour la production ». Le cadrage se replie de lui-même dès qu’un constat existe : on n’a plus à faire défiler un écran de contexte pour atteindre l’analyse.'),
      insister('Je peux lire l’état de l’étude entière sans en ouvrir une seule rubrique. C’est fait pour la relecture — la vôtre, et celle de l’auditeur.'),
      p(''),

      h('1. Cadrage et contexte', HeadingLevel.HEADING_3),
      p('Le bouton « Modifier le cadrage » ouvre quatre champs seulement.'),
      table([
        ligne(['Champ', 'À saisir', 'Remarque à faire'], { header: true }),
        ligne(['Périmètre', 'Rédiger les devis clients à partir d’anciens devis et des grilles de prix fournisseurs, pour réduire le délai de réponse aux appels d’offres.', 'Repris de la fiche : vous ne redécrivez pas le système'], { saisie: true }),
        ligne(['Méthodologie', 'ISO/IEC 42005', 'Modifiable — certains cabinets ont leur propre méthode'], { saisie: true }),
        ligne(['Phase du cycle de vie (facultatif)', 'Développement', 'Conception, Développement, Pilote, Déploiement, Exploitation, Retrait'], { saisie: true }),
        ligne(['AIPD requise', 'déjà cochée', 'Voir ci-dessous'], { saisie: true }),
        ligne(['Référence de l’AIPD (facultatif)', 'AIPD-2026-014', 'Le numéro du dossier chez le DPO'], { saisie: true }),
        ligne(['Prochaine revue (facultatif)', 'Dans douze mois', 'Une étude se revoit'], { saisie: true }),
      ]),
      p(''),
      insister('Je n’ai pas coché la case AIPD : l’outil l’a fait, et il dit pourquoi — pré-cochée, des données personnelles sont en jeu, fiche ou actif rattaché. C’est ma réponse de l’étape 3 qui remonte. Et lisez la phrase suivante : l’étude d’impact IA ne s’y substitue pas, elle la référence. Votre DPO garde son dossier ; AIGMS le cite, il ne le remplace pas.'),
      p('Sous le formulaire, une fiche d’identité que personne ne saisit : statut du triage (criticité élevée · étude exigée par les faits), autonomie, qualification au sens de l’AI Act, Porteur et Redevable, données en jeu avec leurs pastilles, AIPD, et les actifs employés. Sept informations, zéro saisie — un auditeur sait en dix secondes de quoi on parle.'),
      p(''),

      h('1.1 Parties prenantes', HeadingLevel.HEADING_3),
      p('« Un groupe affecté par le système — directement ou non. » Trois à saisir, une à la fois.'),
      table([
        ligne(['Groupe', 'Population estimée', 'Vulnérable', 'Consulté'], { header: true }),
        ligne(['Clients — maîtres d’ouvrage destinataires des devis', '~900 devis par an', 'non', 'non'], { saisie: true }),
        ligne(['Commerciaux chargés d’affaires', '14 personnes', 'non', 'oui — atelier de deux heures, 3 septembre'], { saisie: true }),
        ligne(['Fournisseurs et sous-traitants cités dans les grilles de prix', '~40 entreprises', 'non', 'non'], { saisie: true }),
      ]),
      p(''),
      insister('Insistez sur le troisième : personne ne pense à celui-là. Les commerciaux versent des grilles de prix fournisseurs dans l’outil — ce sont les conditions commerciales de tiers qui n’ont rien demandé et qui ne sont même pas au contrat. Une étude d’impact sert exactement à cela : trouver l’affecté qu’on n’avait pas vu.'),
      p('Aucun des trois groupes n’est vulnérable, et l’outil ne pousse pas à en inventer un. « Chez vous, non. Si demain vous faites de la sélection de candidats ou de l’aide sociale, vous cocherez cette case et le niveau d’examen se renforcera de lui-même. »'),
      p(''),

      h('2. Analyse croisée des impacts', HeadingLevel.HEADING_3),
      p('Le bouton « Ajouter un constat ». La fenêtre s’appelle « 2. Constat : bénéfice ou préjudice » — les deux, et c’est délibéré. Le champ Domaine ne propose pas une liste plate : douze domaines groupés en quatre familles — Droits fondamentaux et éthique, Vie privée et données (AIPD), Environnement et énergie, Impacts socio-économiques.'),
      p('Quatre constats à saisir, choisis pour montrer les trois régimes :', { bold: true }),
      table([
        ligne(['Champ', '① Le bénéfice'], { header: true }),
        ligne(['Nature', 'Bénéfice attendu'], { saisie: true }),
        ligne(['Domaine', 'Emploi et conditions de travail'], { saisie: true }),
        ligne(['Description', 'Le délai de réponse à un appel d’offres est divisé par deux. Les chargés d’affaires reprennent du temps sur la visite de chantier et la relation client.'], { saisie: true }),
        ligne(['Ampleur', 'Significative'], { saisie: true }),
        ligne(['Vraisemblance', 'Probable'], { saisie: true }),
        ligne(['Partie prenante', 'Commerciaux'], { saisie: true }),
      ]),
      p('Le champ Gravité s’appelle Ampleur dès qu’on choisit Bénéfice, et le cadre « Mesure de réduction » disparaît : on ne réduit pas un bénéfice.'),
      p(''),
      table([
        ligne(['Champ', '② Le préjudice grave — celui qui bloquera la production'], { header: true }),
        ligne(['Nature', 'Préjudice potentiel'], { saisie: true }),
        ligne(['Domaine', 'Protection des consommateurs'], { saisie: true }),
        ligne(['Description', 'Un devis part au client avec un prix ou une norme obsolètes, repris d’un ancien dossier. L’entreprise est engagée sur un chiffre qu’elle ne peut pas tenir, ou sur une norme qui ne s’applique plus.'], { saisie: true }),
        ligne(['Gravité', 'GRAVE'], { saisie: true }),
        ligne(['Vraisemblance', 'Probable'], { saisie: true }),
        ligne(['Partie prenante', 'Clients'], { saisie: true }),
        ligne(['Mesure', 'Relecture humaine obligatoire avant envoi, et double validation au-delà de 50 000 €.'], { saisie: true }),
        ligne(['Responsable · échéance', 'Sacha Belarbi · à trente jours'], { saisie: true }),
        ligne(['Gravité résiduelle', 'Limitée — ce que Dominique Etchart aura à assumer'], { saisie: true }),
        ligne(['Risque du registre', 'Le risque coté à l’étape 4 — Fuite de données commerciales vers un tiers'], { saisie: true }),
      ]),
      p(''),
      table([
        ligne(['Champ', '③ Le préjudice significatif — une action, mais qui ne bloque pas'], { header: true }),
        ligne(['Nature · domaine', 'Préjudice potentiel · Vie privée et protection des données'], { saisie: true }),
        ligne(['Description', 'Coordonnées de clients et conditions tarifaires de fournisseurs sont versées dans un service tiers, sans base contractuelle et potentiellement réutilisées pour l’entraînement.'], { saisie: true }),
        ligne(['Gravité · vraisemblance', 'Significative · Possible'], { saisie: true }),
        ligne(['Partie prenante', 'Fournisseurs et sous-traitants'], { saisie: true }),
        ligne(['Mesure', 'Rétention désactivée sur la console Enterprise, et filtrage DLP sur les flux sortants.'], { saisie: true }),
        ligne(['Responsable · échéance · résiduelle', 'Marc Lecomte · 30/11 · Limitée'], { saisie: true }),
      ]),
      p(''),
      table([
        ligne(['Champ', '④ Le préjudice limité — celui qui ne déclenche rien'], { header: true }),
        ligne(['Nature · domaine', 'Préjudice potentiel · Environnement et énergie'], { saisie: true }),
        ligne(['Description', 'Chaque devis généré consomme des appels à un modèle hébergé. À neuf cents devis par an, l’empreinte reste marginale au regard du poste chantier.'], { saisie: true }),
        ligne(['Gravité · vraisemblance', 'Limitée · Possible'], { saisie: true }),
        ligne(['Mesure', '(aucune)'], { saisie: true }),
      ]),
      p(''),
      p('Le tableau qui fait comprendre l’outil — dites-le en montrant les quatre lignes à l’écran :', { bold: true }),
      table([
        ligne(['Gravité du préjudice', 'Ce que l’outil en fait'], { header: true }),
        ligne(['Grave', 'Une action BLOQUANTE : le jalon Production ne passera pas']),
        ligne(['Significative', 'Une action suivie, non bloquante']),
        ligne(['Limitée ou négligeable', 'Rien — la ligne affiche « Aucune action — gravité limitée »']),
      ]),
      p(''),
      insister('Trois régimes, une seule règle : c’est la gravité que VOUS avez cotée qui décide, pas un réglage d’administrateur. Et tant qu’un préjudice grave n’a pas de mesure, l’écran l’écrit en orange sous la ligne : sans mesure de réduction — un préjudice grave en porte une.'),
      p(''),

      h('Deux champs marqués « facultatif » qui ne le sont qu’en apparence', HeadingLevel.HEADING_3),
      p('Dans le cadre Mesure de réduction, à droite du responsable, deux champs portent la mention (facultatif). Ils le sont au sens où l’on peut enregistrer sans eux — pas au sens où ils ne feraient rien.'),
      p('L’échéance devient la date de l’action.', { bold: true }),
      table([
        ligne(['Ce que vous faites', 'Ce qui se passe'], { header: true }),
        ligne(['Vous saisissez une date', 'L’action ouverte porte CETTE date']),
        ligne(['Vous laissez vide', 'L’action est datée à soixante jours, sans que rien ne vous le dise']),
        ligne(['Vous corrigez la date plus tard', 'L’action suit — tant qu’elle n’est ni close ni annulée']),
        ligne(['Vous effacez la date après coup', 'L’action garde celle qu’elle avait : on ne dédate pas un engagement pris']),
      ]),
      p(''),
      p('Cette date n’est pas décorative non plus : c’est elle qui rend l’action en retard. Une action dépassée est comptée dans la pastille d’attention de l’organisation, remonte dans la revue de gouvernance, et part dans le courriel récapitulatif de son responsable, qui la lit en tête de liste.'),
      insister('Saisissez l’échéance du constat ② à trente jours, puis allez au Suivi d’actions. La date que je viens de taper dans une étude d’impact est maintenant la date d’une action qui a un nom en face. Dans trente et un jours, Sacha Belarbi recevra un courriel qui la lui rappellera — sans que personne n’ait rien programmé.'),
      p('La gravité résiduelle est ce que le Porteur devra assumer.', { bold: true }),
      p('C’est le seul endroit de l’outil où l’on dit ce qui reste une fois la mesure en place. Et c’est exactement la liste que Dominique Etchart verra à l’étape suivante, dans le pavé ambre : « ce qui demeure de significatif ou grave après mesures ».'),
      table([
        ligne(['Vous renseignez', 'Ce que le Porteur doit assumer', 'Effet'], { header: true }),
        ligne(['Limitée (cas ② et ③)', 'rien pour ce constat', 'Le constat DISPARAÎT de la liste à assumer : la mesure a fait son travail']),
        ligne(['Rien', 'la gravité INITIALE', 'Il lui est présenté un préjudice grave, comme si la relecture humaine n’existait pas']),
        ligne(['Significative ou Grave', 'ce niveau-là', 'Le constat reste dans la liste, et il signe en sachant quoi']),
      ]),
      p(''),
      insister('Renseigner « résiduel : limité » ne débloque rien. L’action reste bloquante parce que le préjudice, lui, était grave — ce qui compte pour la production, c’est ce qui aurait lieu SANS la mesure, tant qu’elle n’est pas faite. La gravité résiduelle ne lève pas l’obstacle : elle dit à celui qui signe ce qu’il signe.'),
      p('Les deux valeurs suivent la pièce : la ligne du constat affiche « résiduel limitée », et l’export .docx comme l’impression les portent dans la phrase du constat. L’auditeur lit « gravité grave, probable ; résiduel limitée » — il voit d’un trait la cotation avant et après.'),
      p(''),

      h('3. Plan de gouvernance et remédiation — rien ne s’y saisit', HeadingLevel.HEADING_3),
      p('C’est la question que le prospect pose toujours : « et là, on tape quoi ? » Rien. Cette rubrique n’a pas de bouton.'),
      p('Elle reprend les mesures saisies en rubrique 2 et affiche, pour chacune, le domaine, l’extrait du constat, le responsable, l’échéance — et à droite le numéro de l’action ouverte, cliquable, qui ramène à l’onglet « Actions et incidents » du cas d’usage, sur la ligne exacte de cette action.'),
      insister('Cliquez sur le numéro d’action du constat ②. Je quitte l’étude d’impact et je retombe dans le dossier du cas d’usage, sur la ligne de cette action-là — marquée Bloquante. C’est la même action. Je n’ai pas recopié une mesure d’un rapport Word vers un plan d’action Excel : la mesure EST l’action. Et si je corrige l’échéance dans l’étude, l’action suit — tant qu’elle est ouverte.'),
      p('Si on vous demande pourquoi ce n’est pas modifiable ici : parce qu’une mesure ne s’invente pas dans un plan d’action, elle répond à un constat. Si vous voulez une mesure de plus, ajoutez le constat qui la justifie. C’est la différence entre un plan d’action et un plan d’action tracé.'),
      p(''),

      h('Conclusion et signatures — la colonne de droite', HeadingLevel.HEADING_3),
      p('Avant de viser, montrez le pavé « Conclusion et signatures ». Tant que l’étude est ouverte, il liste ce qui manque, en clair : aucune partie prenante identifiée ; aucun constat — ni bénéfice ni préjudice ; n préjudice(s) grave(s) sans mesure de réduction ; AIPD requise sans référence. Quand tout est là : « Rien ne manque : l’étude peut s’achever. »'),
      table([
        ligne(['Champ', 'À saisir — officer@aigms.eu → « Viser l’étude »'], { header: true }),
        ligne(['Conclusion', 'Les effets sont acceptables sous les deux mesures retenues : relecture humaine avant envoi, et rétention désactivée avec filtrage sortant. L’empreinte environnementale reste marginale. À surveiller : la tentation de sauter la relecture sous pression d’appel d’offres.'], { saisie: true }),
        ligne(['Prochaine revue', 'Dans douze mois'], { saisie: true }),
      ]),
      p(''),
      p('La fenêtre rappelle la règle avant que vous ne signiez : votre visa dit que la méthode tient ; l’acceptation du Porteur dit que l’organisation assume ce qui demeure. Une même personne ne pose pas les deux.'),
      p('Basculez sur devsecops@aigms.eu — Dominique Etchart ouvre l’étude. Il voit en haut « En attente de l’acceptation des risques résiduels », et la fenêtre lui rappelle ce qui demeure de significatif ou grave après mesures, constat par constat. Deux boutons seulement : Accepter les risques résiduels, ou Renvoyer à l’étude — auquel cas le visa tombe et l’officer reprend la main.'),
      p('« J’assume l’écart sous relecture systématique, avec audit trimestriel. »', { italics: true }),
      insister('Deux actes, deux signataires. L’officer atteste que l’étude est bien conduite ; le porteur dit que l’organisation assume ce qui reste. La base refuse que la même personne pose les deux — ce n’est pas un réglage d’écran.'),
      p(''),
      h('Ce qui se produit à la seconde où l’étude est achevée', HeadingLevel.HEADING_3),
      p('Sans que vous demandiez quoi que ce soit, une action s’ouvre : « Déposer la preuve de l’évaluation d’impact IA-… », confiée à qui l’a conduite, échéance à trente jours. Le libellé cite l’AIPD si elle est requise.'),
      p('Et dans la colonne de droite, le pavé Preuve porte un bouton : « Déposer l’export comme preuve ». Un clic — l’export .docx au format du modèle part au registre des preuves, à valider, et l’action se solde.'),
      insister('Le rapport d’étude d’impact n’est pas un fichier sur un partage réseau qu’on retrouvera peut-être. Il est une pièce du registre, horodatée, avec son empreinte, rattachée à son cas d’usage — et l’outil vient de m’ouvrir l’obligation de la déposer.'),
      p(''),

      h('Étape 8 — Franchir les jalons, puis décider', HeadingLevel.HEADING_2),
      new Paragraph({ spacing: { after: 100 }, children: [
        t('4 min  ·  ', { bold: true, color: '09AEAE', size: 18 }),
        t('officer@aigms.eu → fiche du cas d’usage → bouton « Faire évoluer », en tête de fiche', { size: 18, color: '535C66' }),
      ]}),
      h('Où cela se passe — et pourquoi pas dans l’onglet Décisions', HeadingLevel.HEADING_3),
      p('Tout part du bouton « Faire évoluer », en tête de fiche. L’onglet « Décisions et changements » ne se saisit pas : il se lit. Il l’écrit lui-même en toutes lettres — « Ce fil se lit ; il ne se saisit pas. Soumettre une décision ou prévoir un changement se fait par Faire évoluer, en tête de fiche. »'),
      p('Le bouton ouvre trois intentions, et le point d’exclamation à côté du titre explique ce que chacune engage :'),
      table([
        ligne(['Intention', 'Ce qu’elle fait', 'Le statut'], { header: true }),
        ligne(['Franchir un jalon', 'Les étapes non engageantes — triage, évaluation, revue', 'change tout de suite, avec un motif']),
        ligne(['Décider', 'Les jalons engageants — approuvé, pilote, production, suspension, retrait', 'change quand la décision est approuvée, à sa date d’effet']),
        ligne(['Prévoir un changement du système', 'Modèle, données, finalité, fournisseur, autonomie…', 'ne bouge pas']),
      ]),
      p(''),
      insister('Les trois ne se valent pas. L’une avance le dossier, l’autre engage l’organisation, la troisième décrit un fait sur le système. Les confondre, c’est franchir un jalon sans l’avoir décidé.'),

      h('Pourquoi la mise en production n’est pas proposée tout de suite', HeadingLevel.HEADING_3),
      p('Le cas d’usage est encore Brouillon. Depuis ce statut, « Décider » ne propose que Retrait et Exception de politique : la mise en production n’existe pas, et ce n’est pas un défaut — c’est la chaîne de gouvernance qui refuse le raccourci.'),
      p('Chaque jalon a sa précondition, et vous les avez toutes remplies sans le savoir aux étapes précédentes. Montrez ce tableau, c’est un argument à lui seul :'),
      table([
        ligne(['Jalon', 'Ce que la base exige', 'Rempli à l’étape'], { header: true }),
        ligne(['Triage', 'Finalité renseignée, Porteur et Redevable désignés', '1']),
        ligne(['Évaluation', 'Criticité déterminée', '2']),
        ligne(['Revue', 'Pré-classification réglementaire ET au moins un risque identifié', '3 et 4']),
        ligne(['Approuvé', 'Une décision « Autorisation d’usage » approuvée', 'ci-dessous']),
        ligne(['Production', 'Le gate complet — huit vérifications', 'ci-dessous']),
      ]),
      p(''),
      insister('Je n’ai pas cliqué huit fois sur « Suivant ». J’ai fait le travail, et les jalons se sont ouverts parce que le travail était fait. Essayez de sauter une étape : la base vous dira laquelle manque, nommément.'),

      h('8a — Franchir les trois jalons non engageants', HeadingLevel.HEADING_3),
      p('officer@aigms.eu → Faire évoluer → Franchir un jalon, trois fois, avec un motif à chaque fois. La fenêtre montre les préconditions cochées avant de laisser passer.'),
      table([
        ligne(['Vers', 'Motif à saisir'], { header: true }),
        ligne(['Triage', 'Fiche complète : finalité, porteur et redevable désignés.'], { saisie: true }),
        ligne(['Évaluation', 'Criticité élevée déterminée : données personnelles et décision commerciale engageante.'], { saisie: true }),
        ligne(['Revue', 'Classification posée, risque coté, contrôles retenus, étude d’impact achevée et acceptée.'], { saisie: true }),
      ]),
      p(''),

      h('8b — La première décision : autoriser l’usage', HeadingLevel.HEADING_3),
      p('officer@aigms.eu → Faire évoluer → Décider → Autorisation d’usage'),
      p('Les neuf champs d’une décision, et lesquels sont exigés. C’est le même formulaire pour les huit types de décision : le remplir une fois suffit à le connaître.', { bold: true }),
      table([
        ligne(['Champ', 'Exigé ?', 'À saisir pour l’autorisation d’usage'], { header: true }),
        ligne(['Type de décision', 'oui', 'Autorisation d’usage'], { saisie: true }),
        ligne(['Personne appelée à se prononcer', 'non', 'Marc Lecomte'], { saisie: true }),
        ligne(['Objet', 'oui — 5 car. min.', 'Autorisation d’usage — génération de devis par IA'], { saisie: true }),
        ligne(['Ce qui est décidé', 'oui — 20 car. min.', 'Autoriser l’usage de la génération de devis assistée, sous les contrôles retenus et les mesures de l’étude d’impact.'], { saisie: true }),
        ligne(['Justification', 'oui — 20 car. min.', 'Criticité élevée, étude d’impact achevée et risques résiduels acceptés par le Porteur. Les quatre contrôles applicables sont statués et outillés.'], { saisie: true }),
        ligne(['Contexte', 'OUI — 20 car. min.', 'Les commerciaux emploient déjà des comptes personnels. L’usage existe : il s’agit de l’encadrer, pas de l’autoriser à partir de rien.'], { saisie: true }),
        ligne(['Options écartées', 'non', 'Interdiction pure et simple — écartée : l’usage se poursuivrait hors de toute vue.'], { saisie: true }),
        ligne(['Conditions', 'non', 'Sous réserve de la bascule DLP au 30/11.'], { saisie: true }),
        ligne(['Date d’effet · date de revue', 'non (la revue devient exigée sur une mise en production)', 'À un mois · à un an'], { saisie: true }),
      ]),
      p(''),
      p('Trois champs que le prospect croit décoratifs, et qui ne le sont pas. « Ce qui est décidé » n’est pas la « Justification » : l’un est l’énoncé — c’est cette phrase qui sera lue dans deux ans —, l’autre le pourquoi ; l’écran le dit sous chaque champ. Le contexte est exigé : une décision sans contexte ne se relit pas, vingt caractères minimum refusés par la base et non par l’écran. Les options écartées se replient sous « Options écartées et conditions » — facultatives, mais l’écran ajoute : mais c’est ce qui fait tenir une décision.'),
      p(''),
      p('L’écran annonce ce que la décision fera : « Approuvée, elle fait passer le cas d’usage “Approuvé” — ou “sous conditions”, ou “Refusé”. » Approuvez-la, et le statut passe à Approuvé. C’est seulement là que « Mise en production » apparaît dans la liste des décisions possibles.'),
      p(''),

      h('8c — La décision qui emporte tout : la mise en production', HeadingLevel.HEADING_3),
      ...figure('btp-3-ecart-de-preuve', 'Une mise en production à laquelle il manque des preuves : AIGMS ne l’interdit pas, il la fait assumer'),
      p('Les mêmes neuf champs, plus trois choses que ce type-là seul appelle :'),
      table([
        ligne(['Champ', 'Ce qui change sur une mise en production'], { header: true }),
        ligne(['Date de revue', 'devient exigée — « rien ne doit dormir »']),
        ligne(['Preuves sur lesquelles la décision se fonde', 'au moins une preuve validée : cochez la charte déposée à l’étape 6']),
        ligne(['Ce que vous en dites', 'apparaît si des contrôles applicables n’ont aucune preuve — et devient exigé']),
      ]),
      p(''),
      p('Le formulaire affiche l’écart : les contrôles applicables sans preuve, nommés par leur code, les obligatoires en ambre. Il exige que vous disiez ce qu’il en est.'),
      table([
        ligne(['Champ', 'À saisir'], { header: true }),
        ligne(['Ce que vous en dites', 'Charte signée le 12/11. Console Enterprise livrée, option de rétention désactivée. Passerelle DLP en recette, bascule prévue le 30/11.'], { saisie: true }),
        ligne(['Personne appelée à se prononcer', 'Marc Lecomte — proposé par défaut : c’est la DSI côté client qui met en service'], { saisie: true }),
      ]),
      p(''),
      p('Et vous ne pouvez pas vous prononcer vous-même : sur une mise en production, une acceptation de risque ou une exception de politique, la base refuse que l’auteur approuve son propre acte.'),
      h('Maintenant, ouvrez la boîte de réception', HeadingLevel.HEADING_2),
      p('dsi-admin@aigms.eu a reçu le courriel sur-le-champ — pas à la prochaine tâche planifiée. Il porte les codes des contrôles manquants et votre phrase de remédiation.'),
      insister('Laissez le silence s’installer. Ce n’est pas une maquette. Ce message est parti il y a quinze secondes.'),
      h('Puis connectez-vous en dsi-admin@aigms.eu', HeadingLevel.HEADING_2),
      puce('Mes alertes → la décision l’attend'),
      puce('Il lit l’écart et la parole de l’officer'),
      puce('Il coche « J’ai pris connaissance de cet écart de preuve et l’assume en approuvant »'),
      puce('Il approuve'),
      insister('Sans cette case, la base refuse l’approbation — pas l’écran, la base. Et l’écart reste au dossier, figé tel qu’il était au moment de la soumission : une preuve déposée demain ne réécrit pas ce que Marc a lu aujourd’hui. Voilà ce que vous pourrez montrer à un auditeur.'),

      h('Quels courriels partent, et quand — à savoir avant qu’on vous le demande', HeadingLevel.HEADING_3),
      p('Toutes les alertes ne partent pas au même moment, et c’est délibéré.'),
      table([
        ligne(['Événement', 'Alerte dans l’application', 'Courriel'], { header: true }),
        ligne(['Décision de mise en production soumise', 'oui', 'SUR-LE-CHAMP, pendant la démonstration']),
        ligne(['Étude visée → le Porteur doit accepter', 'oui', 'au passage suivant de la tâche planifiée']),
        ligne(['Risques résiduels acceptés (étape 7)', 'oui — l’officer la voit dans sa cloche', 'au passage suivant']),
        ligne(['Étude renvoyée à l’étude', 'oui', 'au passage suivant']),
        ligne(['Action en retard, preuve qui expire, revue due', 'oui', 'dans la synthèse, à la cadence de chacun']),
      ]),
      p(''),
      insister('Ne promettez donc pas un courriel à l’étape 7. Après l’acceptation de Dominique Etchart, l’officer reçoit bien « Risques résiduels acceptés » — dans sa cloche, tout de suite ; par courriel, au prochain envoi. Le seul message qui part pendant la démonstration est celui de la décision de mise en production : c’est celui qui retient un jalon, et il n’attend pas.'),
      p(''),

      h('3. Option — si le temps le permet'),
      p('1 min 30 · admin@aigms.eu → Organisations → BATIVAL Construction → Administration → carte « Preuves exigées à la mise en production ».'),
      p('Posez une date à moins de trente jours, puis enregistrez. Trois choses partent immédiatement : l’officer et l’Administrateur client sont avertis, chaque cas d’usage qui porte un écart reçoit sa relance nominative, et deux rappels sont posés à J-30 et J-7. La date étant proche, le rappel J-30 est déjà dû : il se lit tout de suite dans Mes alertes.'),
      insister('Jusqu’ici l’écart s’assumait. À partir de cette date, il retient la mise en production. Vous fixez la date, pas nous — c’est un engagement, il se négocie.'),

      h('4. Les quatre preuves de votre fiche, et où elles atterrissent'),
      ...figure('btp-4-quatre-preuves', 'La fiche de conformité du prospect devient une liste de contrôles, chacun avec sa pièce'),
      table([
        ligne(['Preuve exigée', 'Criticité', 'Référence', 'Dans AIGMS'], { header: true }),
        ligne(['Charte d’usage signée', 'Critique', 'ISO 42001 A.5', 'AIGMS-GOV-008 — Politique d’usage acceptable']),
        ligne(['Console Enterprise, rétention désactivée', 'Critique', 'A.7.2 · ISO 27001 A.18', 'AIGMS-SUP-005 — Utilisation des données par le fournisseur']),
        ligne(['Journaux de la passerelle DLP', 'Élevé', 'A.10.6 · AI Act art. 12', 'AIGMS-SEC-008 + AIGMS-SEC-006']),
        ligne(['Rapport d’AIIA signé', 'Critique', 'ISO 42001 6.1.2', 'Étude d’impact + AIGMS-HUM-001']),
      ]),

      h('5. Ce qu’il ne faut pas faire'),
      puce('Dérouler l’administration devant le prospect : créer une organisation et déclarer huit comptes ne démontre rien et coûte cinq minutes.'),
      puce('Promettre un connecteur qui n’existe pas. Ce qui se voit à l’écran est ce qui fonctionne ; le reste se dit au conditionnel.'),
      puce('Parler de certification. AIGMS aide au cadrage, à la pré-classification, à la documentation et à la preuve. Il ne remplace ni un avis juridique, ni la décision d’un responsable, ni un audit.'),
      puce('Improviser une bascule de compte : c’est le geste le plus lent. Deux navigateurs, préparés à l’avance.'),

      h('6. Après la démonstration'),
      p('Le cas d’usage créé reste dans BATIVAL Construction. Pour repartir d’une organisation vierge, supprimez-le depuis sa fiche.'),
      p('Ne touchez jamais à IzarLink Demo : elle porte le jeu de données complet dont dépendent les autres démonstrations et les tests automatisés.', { bold: true }),

      // ---------------------------------------------------------------------
      // Annexe : la suite de l'histoire
      // ---------------------------------------------------------------------
      new Paragraph({ children: [], pageBreakBefore: true }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [t('Annexe', { bold: true, size: 32, color: '0C2036' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [t('La suite de l’histoire', { size: 26, color: '09AEAE' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 280 },
        children: [t('Huit minutes · après l’étape 8, et seulement si le prospect en redemande', { size: 18, italics: true, color: '595959' })] }),

      h('Pourquoi cette annexe existe'),
      p('La démonstration principale suit UN usage, de bout en bout. Elle convainc sur la chaîne de responsabilité, et laisse une question ouverte :'),
      p('« D’accord pour un usage. Mais nous, on en a combien qu’on ne connaît pas ? »', { italics: true, bold: true }),
      p('C’est exactement la question à laquelle la cartographie répond. Et la réponse n’est pas un chiffre : c’est une case vide.'),

      h('Le décor : trois semaines plus tard'),
      insister('Trois semaines ont passé. Le devis par IA est encadré, sa charte est déposée, Marc Lecomte a assumé l’écart de preuve. Et le directeur général pose la question qui fâche : est-ce que c’était le seul ?'),

      ...etape('A1', 'Cartographier ce que fait l’entreprise', '2 min',
        'officer@aigms.eu · Processus et risques → Ajouter un processus',
        [
          ['Processus 1 — nom', 'Répondre aux appels d’offres'],
          ['Processus 1 — code, nature', 'AO · Réalisation'],
          ['Processus 2 — nom', 'Gérer les ressources humaines'],
          ['Processus 2 — code, nature', 'RH · Support'],
        ],
        'Je ne décris pas mon informatique. Je décris ce que l’entreprise FAIT. Trois natures de processus : pilotage, réalisation, support — c’est la structure d’un système de management, pas un organigramme technique. L’IA viendra se ranger là-dedans, et nulle part ailleurs.'),

      p('Puis « Ajouter une activité », trois fois :'),
      table([
        ligne(['Activité', 'Processus', 'Description'], { header: true }),
        ligne(['Chiffrage et rédaction des devis', 'Répondre aux appels d’offres', 'Établir le prix et rédiger la proposition remise au client.'], { saisie: true }),
        ligne(['Analyse des pièces marché', 'Répondre aux appels d’offres', 'Dépouiller les CCTP et les pièces administratives d’un dossier de consultation.'], { saisie: true }),
        ligne(['Recrutement des compagnons', 'Gérer les ressources humaines', 'Recevoir les candidatures, présélectionner, conduire les entretiens.'], { saisie: true }),
      ]),
      p(''),

      h('Étape A2 — Rattacher l’usage à son activité', HeadingLevel.HEADING_2),
      new Paragraph({ spacing: { after: 100 }, children: [
        t('30 s  ·  ', { bold: true, color: '09AEAE', size: 18 }),
        t('Vue Processus → déplier « Répondre aux appels d’offres » → activité « Chiffrage et rédaction des devis » → le bouton +', { size: 18, color: '535C66' }),
      ]}),
      p('Rattachez le cas d’usage « Génération de devis par IA générative ».'),
      insister('Confirmation visuelle : le panneau de droite se remplit — l’usage, sa criticité, ses risques, ses contrôles. L’usage que nous venons de gouverner pendant dix minutes vient de trouver sa place dans l’entreprise. Ce n’est plus une fiche isolée : c’est une activité du processus commercial.'),

      ...etape('A3', 'Le second usage, celui qu’on n’avait pas déclaré', '1 min 30',
        'Cas d’usage → Déclarer un cas d’usage, puis rattacher à l’activité « Analyse des pièces marché »',
        [
          ['Nom', 'Dépouillement assisté des CCTP'],
          ['Finalité', 'Extraire d’un dossier de consultation les exigences techniques, les pénalités et les délais, pour décider s’il faut répondre.'],
          ['Porteur de l’IA', 'Dominique Etchart'],
          ['Responsable redevable', 'Marc Lecomte'],
          ['Données traitées', 'Pièces marché publiques, notes internes de décision'],
          ['Niveau d’autonomie', 'L1 — il propose, un humain valide'],
          ['Criticité', 'Modérée — pas de données personnelles, erreur rattrapable'],
        ],
        'Celui-ci ne traite aucune donnée personnelle. Et regardez ce qu’AIGMS n’exige PAS : pas d’étude d’impact, pas d’AIPD, presque aucun contrôle déclenché. L’effort de gouvernance suit le risque. Un outil qui vous demande la même chose pour les deux vous fera abandonner.'),

      ...etape('A4', 'Vue Couverture — ce que les contrôles couvrent vraiment', '1 min 30',
        'Onglet Couverture, par activité',
        [],
        'Un contrôle n’est compté comme couvrant que s’il est OPÉRANT et PROUVÉ par une pièce validée et non échue. Nous avons retenu cinq contrôles il y a dix minutes, et déposé UNE preuve. Cette barre dit la vérité : quatre contrôles sur cinq ne protègent encore personne.'),
      insister('C’est exactement ce qu’un auditeur vient vérifier. La différence entre un tableur de conformité et AIGMS est là : le tableur aurait affiché cinq contrôles verts.'),

      ...etape('A5', 'Vue Risques — une décision n’est pas une alerte', '1 min 30',
        'Onglet Risques, par processus · puis bascule sur risk-comity@aigms.eu',
        [
          ['1. Observer', 'Le risque « Fuite de données commerciales » en rouge sur le processus commercial'],
          ['2. Basculer', 'risk-comity@aigms.eu — Sacha Belarbi'],
          ['3. Accepter le risque', 'Justification et date de revue'],
          ['4. Revenir', 'Vue Risques — la barre rouge a disparu'],
        ],
        'Le risque n’a pas été résolu. Il a été ASSUMÉ, par une personne nommée, avec une justification et une date de revue. Les couleurs comptent les risques OUVERTS, pas le total — laisser celui-ci en rouge reviendrait à confondre une décision avec une alerte.'),
      insister('Et la limite, à dire soi-même : ce que vous ne devez jamais avoir, c’est un risque SANS décision. Ni traité, ni accepté. Celui-là, AIGMS le garde en rouge et retient la mise en production.'),

      ...etape('A6', 'Vue Graphe — où la chaîne rompt', '1 min 30',
        'Onglet Graphe → suivre le risque « Fuite de données commerciales »',
        [],
        'Laissez le prospect lire le chemin avant de parler. AIGMS ne dit pas « il manque des preuves ». Il dit OÙ : sur quel contrôle, pour quel risque, dans quelle activité de quel processus. C’est la différence entre un constat et une action.'),
      p('Montrez aussi un contrôle partagé entre les deux cas d’usage, s’il y en a un : la preuve se collecte une fois et sert deux fois.'),

      ...etape('A7', 'La case vide', '1 min',
        'Retour à la vue Processus — l’activité « Recrutement des compagnons » n’affiche aucun usage d’IA',
        [],
        'Voilà la case la plus intéressante de l’écran. Elle ne dit pas « il n’y a pas d’IA au recrutement ». Elle dit « personne n’a déclaré d’IA au recrutement ». Nous avons commencé cette démonstration parce que des commerciaux utilisaient ChatGPT sans le dire. Combien de vos cases sont vides pour la même raison ?'),
      insister('Et la sortie : c’est le travail de l’AI Governance Officer — passer de la case vide à la case déclarée. AIGMS ne le fait pas à votre place ; il rend le travail visible, et il garde la trace de qui a décidé quoi.'),

      h('Ce que cette annexe a démontré, en une ligne chacun'),
      table([
        ligne(['Vue', 'Ce qu’elle prouve'], { header: true }),
        ligne(['Processus', 'L’IA se range dans ce que fait l’entreprise, pas dans un inventaire technique']),
        ligne(['Couverture', 'Un contrôle déclaré n’est pas un contrôle prouvé — et l’outil ne triche pas']),
        ligne(['Risques', 'Une décision assumée sort du rouge ; un risque sans décision n’en sort pas']),
        ligne(['Graphe', 'L’outil nomme l’endroit exact où la chaîne rompt']),
        ligne(['La case vide', 'Ce qu’on ne sait pas encore est une information, pas un trou']),
      ]),
      p(''),
      h('Après cette annexe — remettre BATIVAL à blanc'),
      p('Tout ce que la démonstration et son annexe ont créé reste dans BATIVAL Construction. Ne le retirez pas écran par écran : un script le fait, et il compte avant d’écrire.'),
      table([
        ligne(['Compter, sans rien écrire', 'npm run demo:purger -- --org BATIVAL'], { saisie: true }),
        ligne(['Effacer', 'npm run demo:purger -- --org BATIVAL --oui'], { saisie: true }),
        ligne(['Effacer aussi le décor', 'npm run demo:purger -- --org BATIVAL --complet --oui'], { saisie: true }),
        ligne(['Sur une Preview ou la préproduction', 'ajouter --ref <projectRef>'], { saisie: true }),
      ]),
      p(''),
      p('Il conserve l’organisation, ses huit comptes et leurs rôles, ainsi que les deux actifs d’IA et le fournisseur du décor : le scénario se rejoue dès l’étape 1 sans rien recréer.'),
      insister('Le script refuse IzarLink Demo, en dur, quoi qu’on lui demande : cette organisation porte le jeu de données complet dont dépendent les autres démonstrations et les tests automatisés.'),
      p('Une organisation ne se supprime jamais — la base le refuse, et c’est voulu : ses décisions et ses preuves doivent rester lisibles, et le journal d’audit ne porte aucune clé étrangère vers elle. On vide, on ne supprime pas.', { bold: true }),
    ],
  }],
})

writeFileSync('docs/commercial/SCRIPT_DEMO_BTP_SHADOW_AI.docx', await Packer.toBuffer(doc))
console.log('SCRIPT_DEMO_BTP_SHADOW_AI.docx écrit')
