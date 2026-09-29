# Comment AIGMS trouve le contrôle qui traite un risque

*État au 29 septembre 2026. Décrit `app.search_controls` — migration 0059 — et
son emploi par l'assistant de la fenêtre « Identifier un risque ».*

---

## En une phrase

**Recherche plein texte française avec lemmatisation, corrigée par une
similarité trigramme sur le titre.** Aucun vecteur, aucun modèle de langage,
aucun appel réseau : tout se calcule dans PostgreSQL, et le résultat se rejoue.

---

## Ce qui n'est pas employé, et pourquoi le dire

| | |
|---|---|
| `pgvector` | **non installé** |
| Index `IVFFlat` ou `HNSW` | **aucun** |
| Colonnes vectorielles | **aucune** |
| Embeddings, appel à un LLM | **aucun** |

Extensions réellement présentes : `pg_trgm`, `unaccent`, `pgcrypto`,
`uuid-ossp`, `pg_stat_statements`, `supabase_vault`.

Le dire explicitement évite une conclusion tentante : la proposition n'est pas
« intelligente » au sens d'un modèle. Elle est **lexicale, déterministe et
reproductible** — ce qui est une qualité pour un outil de gouvernance, et une
limite pour la couverture sémantique (§ *Limites*).

---

## Ce qui part de l'écran

La fenêtre **Identifier un risque** — et sa jumelle **Corriger** — envoient la
concaténation de **trois champs** :

```
intitulé  +  scénario  +  libellé de la catégorie
```

Exemple :

> `Fuite de données commerciales vers un tiers · Devis, marges et prix
> fournisseurs versés dans un service public, hors contrat, potentiellement
> réutilisés pour l'entraînement du modèle. · Tiers`

**La catégorie compte.** C'est elle qui sépare une fuite de données d'une erreur
de calcul quand le scénario parle des deux.

Deux déclencheurs, **une seule requête** :

| Déclencheur | Condition |
|---|---|
| Automatique | 600 ms après la dernière frappe, dès **25 caractères** |
| « Proposer de nouveau » | à la demande, sans condition de longueur |

Garde-fous du côté serveur : **3 caractères minimum**, 2 000 maximum,
**8 résultats** par défaut, 20 au plus.

---

## Les deux corpus

`app.search_controls` construit deux ensembles et les fusionne.

| Source | Document construit à la volée |
|---|---|
| **Contrôles opérationnels** de l'organisation | `nom` + `objectif` + `questions d'évaluation` |
| **Contrôles-types publiés** du référentiel | `titre` + `objectif` + **`risques`** + `questions d'évaluation` |

Deux exclusions, et elles portent :

- un contrôle-type **déjà instancié** chez l'organisation ne paraît pas deux
  fois : il se lit par son contrôle opérationnel ;
- **une seule version par code** — la plus récente publiée du même référentiel.

Les contrôles `retired` sont écartés.

> **Le champ `risks` du contrôle-type est dans le document cherché.** C'est ce
> qui fait qu'un scénario de fuite remonte `AIGMS-SEC-008` : le contrôle-type
> nomme lui-même les risques qu'il couvre. **Enrichir ce champ améliore la
> recherche plus sûrement que n'importe quel changement d'algorithme.**

---

## Le calcul

### Normalisation

`unaccent()` sur la requête et sur les documents. « données » et « donnees » se
valent ; la casse est ignorée.

### La requête

```sql
websearch_to_tsquery('french', unaccent(requête))
```

Le dictionnaire français apporte la **lemmatisation** : « injection » trouve
« injections », « versé » trouve « verser ». `websearch_to_tsquery` accepte la
syntaxe qu'un utilisateur connaît — guillemets pour une expression exacte,
`or`, `-` pour exclure — et ne lève jamais sur une saisie libre.

### Le score

```sql
score = ts_rank_cd(document, requête) * 4
      + greatest(similarity(titre, requête_brute), 0)
```

| Terme | Ce qu'il apporte |
|---|---|
| `ts_rank_cd` × 4 | La pertinence plein texte, **poids dominant**. `cd` tient compte de la proximité des termes dans le document |
| `similarity` (trigramme) | Rattrape la faute de frappe et le mot partiel que la lemmatisation manque. Porte sur le **titre seul** |

### Le filtre d'entrée

Un contrôle n'entre dans le classement que si :

```sql
document @@ requête   OU   similarity(titre, requête_brute) > 0.15
```

### L'ordre final

```sql
order by applicable desc, score desc, code
```

**Un contrôle déjà applicable à ce cas d'usage passe devant**, quel que soit son
score : il est déjà dans le dossier, le retenir ne coûte rien.

### Le « pourquoi » affiché

```sql
ts_headline('french', objectif, requête,
            'MaxWords=24, MinWords=10, StartSel=«, StopSel=», MaxFragments=1')
```

Un extrait de l'objectif du contrôle, les mots trouvés entre guillemets. **Ce
n'est pas une explication produite** : c'est le passage du référentiel qui a
fait la correspondance.

---

## Ce qui se passe quand on retient

| Origine | Effet |
|---|---|
| **Contrôle opérationnel** | Sélectionné dans la liste déroulante. Rien d'autre |
| **Contrôle-type** | `instantiate_catalog_control` l'ajoute au registre à l'état *proposé*, porté par le responsable indiqué, puis le sélectionne |

L'assistant propose ; l'humain retient. Le contrôle-type n'est jamais modifié.

---

## Limites connues

**Aucune sémantique.** « Le modèle invente des prix » ne trouvera pas
« hallucination » si le mot n'est pas dans le référentiel. La correspondance est
lexicale.

**Aucun index.** `to_tsvector` est recalculé **à chaque requête**, sur tous les
contrôles. À 120 contrôles-types c'est imperceptible. Au-delà de quelques
milliers, un index GIN sur une colonne générée deviendra nécessaire.

**Français uniquement.** Un scénario rédigé en anglais sera mal lemmatisé ; seule
la similarité trigramme jouera.

**Le corpus vaut ce que vaut le référentiel.** Un contrôle-type dont les champs
`risks` et `objective` sont pauvres ne remontera pas, quelle que soit la
qualité du scénario.

---

## Si l'on voulait du vectoriel

La spécification v0.5 prévoit un assistant adossé à une base de connaissance
(§24). Le jour venu, la combinaison qui vaut est **hybride** : le lexical pour
la précision et la traçabilité, le vectoriel pour le sens, puis fusion des deux
classements.

Le choix `HNSW` contre `IVFFlat` se trancherait par le volume : en dessous de
quelques dizaines de milliers de vecteurs, **HNSW** l'emporte — pas
d'entraînement préalable, meilleur rappel, coût mémoire acceptable. Un
référentiel de 120 contrôles-types est très loin de ce seuil.

> **Ce n'est pas la priorité.** Enrichir les champs `risks` des contrôles-types
> améliorera la recherche actuelle plus vite et plus sûrement qu'un moteur
> vectoriel greffé sur un référentiel pauvre en mots.

---

## Où c'est écrit

| | |
|---|---|
| Fonction SQL | `app.search_controls` — `supabase/migrations/20260919150000_0059_…` |
| Action serveur | `searchControlsForRisk` — `src/lib/actions/controls.ts` |
| Composant | `ControlFinder` — `src/components/governance/control-finder.tsx` |
| Appel depuis le risque | `RiskPanel` — `src/components/governance/use-case-panels.tsx` |
