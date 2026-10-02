# v0.5 — Phase 0, document A
## Gap Analysis v0.4 → v0.5

*3 octobre 2026. Phase 0 : aucun code. Document à relire avant la Phase 1.*

---

## 1. Méthode

Les 120 contrôles-types de la v0.4 ont été lus un par un. Pour chacun des douze
besoins de la spécification v0.5, la question posée est celle de l'ADR-0033 :
**enrichir un contrôle existant, ou en créer un ?**

La règle de tranchage :

> **On enrichit** dès qu'un contrôle existant porte déjà l'objectif, même
> partiellement. **On crée** seulement lorsque aucun contrôle ne porte
> l'objectif — et pas lorsque la formulation gagnerait à être plus précise.

C'est la leçon de l'alternative écartée : quinze contrôles `SEC-AI-*` à côté de
douze `SEC` auraient produit des doublons sous d'autres noms, et un référentiel
de 135 lignes que personne ne parcourt.

---

## 2. Le verdict, en une ligne

**Aucun contrôle à créer. Douze contrôles à enrichir.**

Le référentiel v0.4 couvre les douze besoins de la v0.5. Ce qui manque n'est pas
de la matière, c'est de la **conditionnalité** : les questions d'évaluation et
les preuves attendues sont écrites pour un système d'IA générique, et ne
distinguent pas un assistant simple d'un agent qui exécute des actions.

> **Conséquence pour le plan.** La Phase 4 — *le référentiel v0.5 publié* — est
> une **réécriture de données**, pas un ajout de contrôles. Le travail est
> rédactionnel : écrire les questions conditionnelles et les preuves attendues
> de chaque branche.

---

## 3. La matrice

### 3.1 Les cinq besoins confirmés par la spécification

| Besoin v0.5 | Couvert | Action | Contrôle | Ce qu'il faut ajouter |
|---|---|---|---|---|
| Moindre privilège agent | **oui** | Enrichir | **AIGMS-SEC-003** | Les *outils* et *actions* qu'un agent peut invoquer ; la portée d'un jeton MCP |
| Gestion des secrets LLM/MCP | **oui** | Enrichir | **AIGMS-SEC-004** | Clés d'API de modèles, jetons de serveurs MCP, rotation |
| Prompt injection | **oui** | Enrichir | **AIGMS-SEC-007** | Injection **indirecte** par le corpus RAG ; chaînage d'outils |
| Exfiltration IA | **oui** | Enrichir | **AIGMS-SEC-008** | Scénarios LLM, fuite par le contexte, sortie vers un outil externe |
| Abus API et modèles | **oui** | Enrichir | **AIGMS-SEC-009** | Consommation de jetons, boucle d'agent, déni par le coût |

**Vérifié dans le référentiel** : les cinq contrôles existent, avec objectif,
questions d'évaluation, preuves attendues et correspondances ISO/AI Act.

### 3.2 Les sept besoins « à vérifier » — tranchés

| Besoin v0.5 | Couvert | Action | Contrôle porteur | Justification |
|---|---|---|---|---|
| **Code Security Review** | **partiellement** | Enrichir | **AIGMS-SEC-012** *(Tests de sécurité)*, appuyé par **SEC-001** | SEC-012 porte les tests ; la revue du code **écrit par ou pour l'IA** en est une branche conditionnelle, pas un objectif neuf |
| **Supply Chain IA** | **oui** | Enrichir | **AIGMS-OPS-008** *(Gestion des dépendances)* + **SUP-008** *(Sous-traitants)* + **INV-006** *(Modèle, fournisseur, version)* | Trois contrôles se partagent déjà l'objet. Les poids de modèles téléchargés et les paquets d'agents sont des **dépendances** |
| **RAG / Vector Security** | **oui** | Enrichir | **AIGMS-SEC-007** *(injection indirecte)* + **DAT-007** *(Provenance)* + **SEC-003** *(cloisonnement de l'index)* | Un index vectoriel est une **donnée** dont la provenance se trace et dont l'accès se cloisonne. Rien de neuf dans l'objectif |
| **Agent Memory Security** | **oui** | Enrichir | **AIGMS-DAT-010** *(Conservation et suppression)* + **DAT-003** *(Classification)* | Une mémoire persistante est une donnée conservée : durée, classification, suppression |
| **Human Approval** | **oui, pleinement** | Enrichir | **AIGMS-HUM-002** *(Validation humaine)* + **HUM-004** *(Reprise de la main)* + **HUM-005** *(Escalade et arrêt)* | Le besoin est **déjà le cœur** de la famille HUM. Ne manque que le déclenchement par les capacités d'action |
| **AI Security Testing** | **oui, pleinement** | Enrichir | **AIGMS-SEC-012** | Le contrôle existe et porte ce nom. Ajouter le red teaming et les tests contradictoires en branche conditionnelle |
| **AI Incident Response** | **oui, pleinement** | Enrichir | **AIGMS-INC-001 à 008** *(huit contrôles)* | La famille complète existe. Ajouter les **typologies d'incident propres à l'IA** dans INC-001 et INC-003 |

---

## 4. Ce que la Gap Analysis a trouvé en plus

Trois constats non demandés par la spécification, relevés en lisant les 120.

### 4.1 MCP et multi-agent n'appellent aucun contrôle neuf

`AIGMS-INV-007 — Interfaces et dépendances` porte déjà l'inventaire des
interfaces d'un système. Un serveur MCP **est** une interface ; un agent appelé
par un autre **est** une dépendance. L'enrichissement est une question
conditionnelle sur INV-007, pas un contrôle.

### 4.2 Deux contrôles vont porter beaucoup de conditions

**AIGMS-SEC-003** *(Moindre privilège)* et **AIGMS-SEC-012** *(Tests de
sécurité)* reçoivent chacun quatre à six branches conditionnelles. Ce sont les
deux à écrire en premier en Phase 3 : ils serviront de modèle aux autres, et
leur longueur dira si le format tient.

> **Le risque à surveiller.** Un contrôle qui porte six branches devient
> illisible sur une fiche. **Si SEC-003 ne tient pas à l'écran, c'est le signal
> qu'il faut scinder** — et c'est le seul motif légitime de création d'un
> contrôle neuf, à décider sur pièce et non par avance.

### 4.3 Un besoin de la v0.5 n'a pas de porteur clair : le coût

La spécification parle de **déni de service par consommation de jetons**.
`AIGMS-MON-006 — Suivi des coûts` existe, mais c'est un contrôle de **pilotage**,
pas de **sécurité** ; `SEC-009` porte l'abus mais parle d'API, pas de budget.

**Proposition** : enrichir **SEC-009** d'une branche « plafond de consommation
et alerte de dépassement », et **lier** MON-006 dans les correspondances. Pas de
création.

---

## 5. Récapitulatif par famille

| Famille | Contrôles à enrichir | Branches conditionnelles attendues |
|---|---:|---|
| **SEC** | 6 — *001, 003, 004, 007, 008, 009, 012* | LLM, RAG, agent, MCP, outils, code |
| **DAT** | 3 — *003, 007, 010* | RAG, mémoire persistante |
| **HUM** | 3 — *002, 004, 005* | capacités d'action, transaction |
| **OPS** | 1 — *008* | modèles tiers, paquets d'agents |
| **SUP** | 1 — *008* | sous-traitants de modèle |
| **INV** | 2 — *006, 007* | MCP, multi-agent |
| **INC** | 2 — *001, 003* | typologies d'incident IA |
| **MON** | 1 — *006* | lien avec SEC-009 |
| **Total** | **19 contrôles touchés**, 0 créé | |

> Dix-neuf contrôles sur cent vingt : **le référentiel ne change pas de forme,
> il gagne en profondeur là où c'est nécessaire.** C'est ce que l'ADR-0033
> annonçait, et la lecture le confirme.

---

## 6. Ce qu'il reste à trancher

| # | Question | Ma recommandation |
|---|---|---|
| 1 | Scinder SEC-003 si les branches le rendent illisible ? | **Décider sur pièce**, après l'avoir écrit — pas avant |
| 2 | Le coût : enrichir SEC-009 ou créer un contrôle ? | **Enrichir.** Un plafond de consommation est une mesure contre l'abus |
| 3 | Les enrichissements vont-ils dans la v0.5, ou dans une v0.4.1 ? | **v0.5.** Le versionnement est immuable : on ne réécrit pas une version publiée |

---

## 7. Ce que ce document ne dit pas

- **Le texte des questions conditionnelles** — c'est la Phase 3.
- **Les conditions du moteur** — c'est le document C.
- **La structure de données** — c'est le document B.
- **Aucune ligne de code n'a été écrite** pour produire ce document. Les 120
  contrôles ont été lus dans `knowledge/frameworks/aigms/v0.4/`, et les
  structures vérifiées en base.
