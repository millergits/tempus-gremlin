# Workflow: The Knowledge Engine (Repository Discovery)

[← Back to Index](00-Index.md)

**Role:** All Engineers & Scientists
**Goal:** Rapidly navigate the sprawling 74+ repository landscape without "Slack and pray."

## The Context: "Where does this code live?"

Onboarding at Tempus is notoriously difficult. With **74 separate repositories** governing everything from RNA pre-processing to cluster deployment, finding the "Source of Truth" is a forensic exercise.

### 🛑 The Old Way
*   **Keyword Hunting:** Grepping through GitHub Org for "transformer." (Returns 100+ matches).
*   **Documentation Archaeology:** Reading 3-year-old READMEs in `molecular-models` that reference deprecated buckets.
*   **Tribal Knowledge:** Asking in `#platform-support`: *"Does anyone know where the VEP runner config logic lives?"* and waiting 4 hours for a reply.

### 👾 The GREMLIN Way
GREMLIN has indexed the **entire codebase** (Code + Docs) into its vector store. It acts as a semantic search engine across the engineering organization.

**Command:** Ask natural language questions about the code.
**Action:** GREMLIN retrieves the relevant files, summarizes the architecture, and points to the exact lines of code.

---

## Example 1: Finding Logic in the Haystack

**Context:** A scientist wants to understand how RNA transcripts are tokenized for the BERT model, but doesn't know which of the 5 RNA repos holds the logic.

```text
gremlin > Where is the tokenizer logic for the RNA BERT model?

[LOG] Searching Knowledge Base (Scopes: molecular-models, unimodal-rna-model)...

ANSWER:
The RNA tokenizer logic is located in `unimodal-rna-model`.

Key File: `unimodal_rna_model/data/tokenizer.py`
Class: `GeneTokenizer`

How it works:
1. It uses a fixed vocabulary of 20,061 HGNC gene symbols.
2. It maps genes to integers `[1, 20061]`.
3. Special tokens: `[PAD]=0`, `[CLS]=20062`, `[MASK]=20063`.

Reference:
> It does NOT use BPE (Byte Pair Encoding). It is a "Gene-level" vocabulary.
> See: `unimodal_rna_model/README.md` generic section.

Would you like to see the `GeneTokenizer.encode()` method? [Y/n]
```

## Example 2: "How do I?" for Infrastructure

**Context:** A new engineer needs to deploy a Neo4j database but has never used the internal helm charts.

```text
gremlin > How do I deploy a Neo4j instance to the dev cluster?

[LOG] Searching Knowledge Base (Scopes: neo4j-deploy, sre, cookbooks)...

ANSWER:
You should use the `neo4j-deploy` repository.

Steps:
1. Clone `neo4j-deploy`.
2. Copy `values-template.yaml` to `values-dev.yaml`.
3. Run the deployment script found in `sre/scripts/deploy_neo4j.sh`.

Required Configs:
- `storage_class`: Must be set to `pd-ssd` for performance.
- `namespace`: Use `neo4j-dev`.

Command to run:
```bash
./sre/scripts/deploy_neo4j.sh --env dev --config values-dev.yaml
```

⚠️ Warning: Do not deploy to `prod` without approval from the Platform Team (repo `tempathy-ofmarshal` governs access).
```

## Example 3: Debugging Legacy Artifacts

**Context:** A pipeline fails because an old model checkpoint is missing.

```text
gremlin > specific error: "Artifact rn_v2_base not found in registry." Where was this defined?

[LOG] Searching Knowledge Base for 'rn_v2_base'...

ANSWER:
I found references to `rn_v2_base` in `ofm-baselines/legacy_manifest.json`.

History:
- It was trained in Q3 2023.
- It was Deprecated in Q1 2024 in favor of `rn_v3_flash`.
- The artifacts were moved to Coldlines storage.

Action:
You should update your config to use `rn_v3_flash` (C-Index +0.05).
Link: `atlas://registry/rn_v3_flash`
```

---

## Why this is "Feature Set Zero"

Before a scientist can **Train** (Factory) or **Evaluate** (Scorecard), they must **Understand**.

*   **Onboarding:** Reduces "Time to First PR" from weeks to days.
*   **Deflection:** Answers L1 support questions ("Where is X?") without pinging senior engineers.
*   **Consistency:** Ensures everyone uses the *current* patterns (`hypernexus-cli`) rather than copied legacy scripts.
