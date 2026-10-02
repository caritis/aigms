# v0.5 — Phase 0, document C
## Règles d'applicabilité

*3 octobre 2026. Phase 0 : aucun code. Document à relire avant la Phase 1.*

---

## 1. Le principe, et ce qu'il interdit

Un contrôle est **générique** ; son **évaluation** est contextuelle. C'est la
règle de la spécification, et elle a une conséquence que la Phase 3 devra tenir :

> **On ne propose pas un contrôle différent selon le profil. On propose le même
> contrôle, avec des questions et des preuves différentes.**

`AIGMS-SEC-003 — Moindre privilège` est proposé à tout le monde. Mais sur un
assistant simple il demande *« qui peut interroger le système ? »*, et sur un
agent *« quels outils peut-il invoquer, et avec quels droits ? »*.

**Ce que cela interdit** : créer `SEC-003-AGENT`. C'est la pente que l'ADR-0033
a fermée, et les règles d'applicabilité en sont le moyen.

---

## 2. Les conditions à ajouter

Le moteur porte 21 conditions. La v0.5 en ajoute **onze**, qui viennent du
profil technique.

| Condition | Vraie quand | Ce qu'elle déclenche |
|---|---|---|
| `uses_llm` | Le cas d'usage appelle un modèle de langage | Injection, secrets d'API, coût |
| `uses_rag` | Un corpus est interrogé pour nourrir le contexte | Injection **indirecte**, provenance, cloisonnement de l'index |
| `uses_agents` | Un agent enchaîne des actions seul | Moindre privilège, supervision, journalisation |
| `uses_multi_agent` | Des agents s'appellent entre eux | Interfaces, dépendances, traçabilité |
| `uses_tools` | Le système invoque des outils externes | Portée des droits, validation des sorties |
| `uses_mcp` | Un serveur MCP est utilisé | Jetons, interfaces, sous-traitants |
| `uses_persistent_memory` | Une mémoire survit à la session | Conservation, classification, suppression |
| `uses_custom_code` | Du code est écrit pour ou par le système | Revue de sécurité, tests, dépendances |
| `uses_fine_tuning` | Un modèle est réglé sur des données propres | Données d'entraînement, provenance, versionnement |
| `can_execute_actions` | Le système agit sur un autre système | Validation humaine, reprise de la main, arrêt |
| `can_trigger_transactions` | Il engage financièrement ou contractuellement | Validation humaine **renforcée**, escalade |

> **Onze, pas vingt.** Les six attributs restants du profil technique
> *(`uses_external_model`, `uses_open_source_model`, `can_modify_data`,
> `can_send_external_messages`, `can_change_permissions`, `internet_access`)*
> n'ont pas de règle propre en v0.5 : ils **entrent dans le calcul du niveau
> d'assurance** et dans les branches de questions, sans déclencher de contrôle
> à eux seuls. **Une condition qui ne propose rien est une condition de trop.**

---

## 3. Les règles, contrôle par contrôle

Chaque ligne devient un enregistrement de `catalog_applicability_rule`, avec son
motif rédigé — c'est lui que l'utilisateur lira.

| Contrôle | Condition | Motif *(texte affiché)* |
|---|---|---|
| **SEC-003** | `uses_tools` | Le système invoque des outils : leurs droits se bornent comme ceux d'un compte. |
| **SEC-003** | `uses_agents` | Un agent agit seul : ce qu'il peut faire se décide à l'avance. |
| **SEC-003** | `uses_mcp` | Un serveur MCP ouvre des capacités : leur portée se limite. |
| **SEC-004** | `uses_llm` | Une clé d'API de modèle est un secret : elle se garde et se renouvelle. |
| **SEC-004** | `uses_mcp` | Un jeton MCP ouvre un accès durable : il se gère comme un secret. |
| **SEC-007** | `uses_llm` | Une instruction peut être détournée par ce qu'on soumet au modèle. |
| **SEC-007** | `uses_rag` | Un corpus interrogé peut porter une instruction : l'injection devient indirecte. |
| **SEC-008** | `uses_llm` | Ce qui entre dans le contexte peut en ressortir. |
| **SEC-008** | `uses_tools` | Un outil externe est une sortie : ce qu'il reçoit quitte le périmètre. |
| **SEC-009** | `uses_llm` | La consommation de jetons est une surface d'abus, et un coût. |
| **SEC-009** | `uses_agents` | Une boucle d'agent consomme sans limite tant qu'on ne lui en pose pas. |
| **SEC-012** | `uses_custom_code` | Du code écrit pour ce système se teste et se relit. |
| **SEC-012** | `uses_agents` | Un agent se met à l'épreuve autrement qu'un formulaire. |
| **DAT-007** | `uses_rag` | Ce que le corpus contient devient ce que le système répond : sa provenance se trace. |
| **DAT-010** | `uses_persistent_memory` | Une mémoire qui survit à la session est une donnée conservée. |
| **DAT-012** | `uses_fine_tuning` | Régler un modèle sur ses données engage leur licéité et leur qualité. |
| **HUM-002** | `can_execute_actions` | Le système agit : ce qui déclenche une validation humaine se décide. |
| **HUM-002** | `can_trigger_transactions` | Il engage l'organisation : la validation ne se discute pas. |
| **HUM-004** | `uses_agents` | Un agent qui agit seul doit pouvoir être repris en main. |
| **HUM-005** | `can_trigger_transactions` | Un engagement erroné s'arrête : l'autorité d'arrêt se nomme. |
| **INV-007** | `uses_mcp` | Un serveur MCP est une interface : il s'inventorie. |
| **INV-007** | `uses_multi_agent` | Un agent appelé par un autre est une dépendance. |
| **OPS-008** | `uses_open_source_model` | Un modèle téléchargé est une dépendance : sa source et sa version se tracent. |
| **SUP-008** | `uses_mcp` | Un serveur MCP tiers est un sous-traitant de fait. |
| **INC-001** | `uses_agents` | Un agent produit des incidents que la typologie générale ne nomme pas. |

**Vingt-cinq règles**, sur **quatorze contrôles**. Les cinq autres contrôles de
la Gap Analysis *(SEC-001, DAT-003, INC-003, MON-006, INV-006)* reçoivent des
questions conditionnelles **sans** règle d'applicabilité : ils sont déjà
proposés par les conditions existantes.

---

## 4. Explicabilité — la règle qui tient tout

Chaque règle porte son `reason`, et l'écran l'affiche déjà. La fenêtre des
propositions montre **motif, groupe et marque** : un contrôle proposé parce que
*« un corpus interrogé peut porter une instruction »* se lira exactement comme
un contrôle proposé parce que *« des données personnelles sont mobilisées »*.

> **C'est pourquoi les phases 2 et 3 ne changent presque rien à l'écran.** Le
> travail est d'écrire les motifs — et un motif rédigé est ce que l'utilisateur
> lit pour comprendre pourquoi un contrôle lui est proposé. **C'est là qu'est
> la valeur, pas dans le mécanisme.**

### Ce qu'un motif doit être

| Règle d'écriture | Exemple |
|---|---|
| **Un fait, pas une catégorie** | ✅ *« Un agent agit seul »* · ❌ *« Profil agentique détecté »* |
| **La conséquence, pas le contrôle** | ✅ *« ce qu'il peut faire se décide à l'avance »* · ❌ *« applique SEC-003 »* |
| **Une phrase** | Deux lignes maximum à l'écran |
| **Pas de jargon non expliqué** | *« MCP »* passe s'il est défini ailleurs ; *« RAG »* se double de *« un corpus interrogé »* |

---

## 5. Garde-fous

Trois règles de conduite pour la Phase 2, à tenir sans exception.

### 5.1 Une condition qui ne propose rien ne se crée pas

Onze conditions, pas vingt. Chacune porte au moins une règle. Une énumération
qui grossit sans effet est une dette : les valeurs ne se retirent pas.

### 5.2 Un contrôle déjà proposé ne se propose pas deux fois

`AIGMS-SEC-007` est déjà proposé sur `personal_data`. Lui ajouter `uses_llm`
ne doit pas le faire apparaître en double : le moteur **déduplique par
contrôle** et rend les motifs **cumulés**. À vérifier en Phase 2 — c'est le
premier test à écrire.

### 5.3 Un profil absent ne propose rien de neuf

Un cas d'usage sans profil technique est en **L0**, et aucune des onze
conditions n'est vraie. **Les dossiers existants ne voient pas leur liste de
contrôles changer** le jour de la migration. C'est ce qui rend la Phase 2
déployable sans prévenir.

---

## 6. Recette

Deux jeux, posés par l'ADR-0033.

### 6.1 UC-02 ScootAssist — la chaîne complète

Assistant conversationnel préparant des remboursements, attendu en **L3**.

| Attendu | Vérification |
|---|---|
| Profil : `uses_llm`, `uses_rag`, `uses_agents`, `uses_tools`, `can_execute_actions`, `can_trigger_transactions` | Le niveau d'assurance calculé rend **L3** |
| Contrôles proposés | SEC-003, 004, 007, 008, 009, 012 · DAT-007 · HUM-002, 004, 005 · INV-007 |
| Motifs | Chacun lisible, cumulés quand plusieurs conditions portent le même contrôle |
| Questions | Les branches `agent` et `tools` apparaissent ; les branches `mcp` non |

### 6.2 Le développeur en sandbox — la branche `custom_code`

C'est le cas qui dira si le gap *« revue de sécurité du code »* était réel.

| Attendu | Vérification |
|---|---|
| Profil : `uses_custom_code`, `uses_llm` | Niveau **L1** ou **L2** selon les outils |
| SEC-012 proposé | Avec le motif *« du code écrit pour ce système se teste et se relit »* |
| Questions de SEC-012 | La branche `custom_code` apparaît, la branche `agent` non |

> **Si la branche `custom_code` de SEC-012 paraît pauvre à la recette**, c'est le
> signal que le gap était réel et qu'un contrôle de revue de code se justifie.
> **C'est le seul motif légitime de création** — et il se décide sur pièce, pas
> par avance.

---

## 7. Ce qu'il reste à trancher

| # | Question | Ma recommandation |
|---|---|---|
| 1 | Onze conditions, ou davantage ? | **Onze.** Une condition sans règle est une dette |
| 2 | Les motifs cumulés s'affichent-ils tous, ou le premier ? | **Tous**, séparés par un point-virgule. Trois motifs disent mieux qu'un pourquoi un contrôle pèse |
| 3 | Le profil dérivé écrase-t-il la saisie ? | **Non.** Il propose ; la saisie prime et reste modifiable. Même règle que pour la criticité pré-cochée |
| 4 | Les règles sont-elles livrées avec la v0.5, ou activables ? | **Avec la v0.5.** Le versionnement est immuable : une organisation qui reste en v0.4 ne les voit pas |
