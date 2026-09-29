# ADR-0033 — Le référentiel v0.5 se fait en sept phases, et le moteur existe déjà

*29 septembre 2026. Avant toute migration.*

## Contexte

Une spécification fonctionnelle demande de faire passer l'AIGMS Control
Framework de la v0.4 à la v0.5 : couvrir les risques propres aux systèmes
agentiques et au développement assisté par IA, rendre l'application des
contrôles **contextuelle**, et collecter les preuves correspondantes.

Elle impose de lire l'existant avant de proposer quoi que ce soit. Fait — en
base, pas de mémoire. **Trois constats renversent une partie du plan qu'elle
esquissait.**

### Le moteur d'applicabilité existe

`public.catalog_applicability_rule` : une ligne par *(référentiel, code de
contrôle, condition, motif rédigé)*. À ce jour **83 règles, 46 contrôles-types,
19 conditions**.

La spécification décrit ce moteur comme à construire, et demande qu'il explique
ses recommandations. Les deux existent : chaque règle porte son motif, que la
fenêtre des propositions affiche déjà.

**Ce qui manque n'est pas le moteur, ce sont les faits qu'il sait lire.** Aucune
condition ne décrit aujourd'hui le RAG, les outils d'un agent, MCP, la mémoire
persistante, le code spécifique, ni la capacité d'agir.

### Le contrôle-type porte déjà les structures demandées

`assessment_questions` et `expected_evidence` sont des tableaux **JSON**. Les
rendre conditionnels ne demande **aucune migration de schéma** : il suffit de
passer d'un tableau de chaînes à un tableau d'objets
`{ text, condition, priority, reference }`, et de lire les deux formes.
`framework_mappings` accueille NIST AI RMF, NIST SSDF, OWASP GenAI et MITRE
ATLAS sans changer de modèle.

### Le versionnement immuable existe

Import validé, commit atomique, publication, version figée, contrôles déjà
instanciés intacts. **La v0.5 se publie comme la v0.4 l'a été.**

### Trois gaps probables, pas quinze

Les quinze thèmes de la checklist, confrontés aux contrôles réels : la plupart
s'enrichissent (`SEC-001`, `SEC-003`, `SEC-004`, `SEC-007`, `SEC-010`,
`SEC-011`, `SEC-012`, `OPS-008`, `HUM-002`), trois sont couverts (`MON-*`,
`OPS-003`/`OPS-004`, `INC-*`), et trois manquent probablement : **revue de
sécurité du code, sécurité RAG et vectorielle, mémoire d'agent**.

## Décisions

1. **Sept phases, chacune livrable seule, testée et réversible.** Aucune ne
   casse un cas d'usage existant ; un profil absent vaut niveau 0 et le
   parcours actuel ne bouge pas.

   | Phase | Objet | Migration |
   |---|---|---|
   | 0 | Audit et Gap Analysis — **sans code** | aucune |
   | 1 | Profil technique du cas d'usage | une |
   | 2 | Conditions du moteur d'applicabilité | une |
   | 3 | Questions et preuves conditionnelles | **aucune** — du JSON |
   | 4 | Le référentiel v0.5 publié | données |
   | 5 | Typologie des actifs | une, énumération |
   | 6 | Vue Attack Surface — dérivée | aucune |
   | 7 | Automatisation des preuves | hors périmètre |

2. **Le profil technique vit dans une table 1-1**, non en colonnes sur
   `ai_use_case`. Ces attributs sont optionnels, souvent tous nuls, et destinés
   à s'étoffer : une vingtaine de colonnes vides alourdirait chaque lecture
   d'une fiche dont la latence vient d'être travaillée.

3. **Le niveau d'assurance est dérivé, jamais saisi.** L0 simple, L1 connecté,
   L2 intégré, L3 agentique — comme la criticité, avec ce qu'il entraîne écrit
   à côté.

4. **Aucun second référentiel, registre de risques, registre de preuves ni
   Déclaration d'Applicabilité.** L'évolution enrichit ; elle ne double pas.

5. **AIGMS n'analyse pas de code.** Les rapports des scanners externes
   deviennent des **preuves**. Rien de plus.

6. **La Phase 0 produit trois documents avant tout code** — Gap Analysis,
   impact sur le modèle de données, règles d'applicabilité — et ils sont relus
   avant la Phase 1.

## Conséquences

Le travail le plus lourd est **rédactionnel, pas technique** : lire 120
contrôles-types un par un, décider enrichir ou créer, et écrire les motifs.
C'est aussi ce qui fait la valeur — un motif rédigé est ce que l'utilisateur
lit pour comprendre pourquoi un contrôle lui est proposé.

Les phases 2 et 3 ne changent presque rien à l'écran : la fenêtre des
propositions affiche déjà motif, groupe et marque. Un contrôle proposé parce
que « le cas d'usage utilise un RAG » se lira comme les autres.

Deux jeux de recette : **UC-02 ScootAssist** — assistant conversationnel
préparant des remboursements, attendu en L3 — éprouve la chaîne entière ; le
**développeur en sandbox** éprouve la branche `custom_code` et dira si le gap
« revue de sécurité du code » était réel.

## Alternatives écartées

**Créer une famille `SEC-AI-001…015`.** C'est l'hypothèse initiale de la
spécification, qu'elle abandonne elle-même. Quinze contrôles neufs à côté de
douze contrôles `SEC` existants auraient produit des doublons sous d'autres
noms, et un référentiel de 135 lignes que personne ne parcourt.

**Un second moteur, « AI Security Applicability ».** Le moteur existant sait
déjà lire des faits et rendre des motifs. Lui ajouter onze conditions coûte une
migration ; en écrire un second coûterait un an de divergence.

**Vingt colonnes sur `ai_use_case`.** Plus simple à écrire, plus lourd à vivre.

**Une table `TechnicalComponent`.** Le modèle `ai_asset` porte déjà nature,
fournisseur, hébergement, données personnelles et rattachement au cas d'usage.
Étendre son énumération suffit ; une table parallèle aurait créé un second
inventaire — et la question « où est mon serveur MCP ? » aurait eu deux
réponses.
