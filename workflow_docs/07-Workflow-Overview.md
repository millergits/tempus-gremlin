# Workflow Overview: The ML Lifecycle

[← Back to Index](00-Index.md)

**The Vision:** GREMLIN doesn't just answer questions—it guides scientists through the entire ML lifecycle, from onboarding to production deployment.

---

## The Scientific Loop

Machine learning at Tempus isn't a single task—it's a continuous cycle of discovery, experimentation, and refinement. GREMLIN is designed to support this end-to-end loop, eliminating friction at every stage.

### The 8-Stage Lifecycle

| Stage | Core Activity | GREMLIN Tools | Key Outcome |
| :--- | :--- | :--- | :--- |
| **1. Onboard** | **Navigate** the 74+ repo landscape | Semantic Search, Guided Tutorials | Time-to-productivity: weeks → days |
| **2. Discover** | **Find** data & cohorts | Data Products Lookup, Schema Browser | Self-service data exploration |
| **3. Data** | **Ingest** versioned ingredients | `ofm-data`, Validation Checks | Reproducible, auditable datasets |
| **4. Pretrain** | **Train** unimodal encoders | `unimodal-rna`, Spot Recovery | TB-scale training with resilience |
| **5. Fusion** | **Combine** into multimodal models | Late Fusion Architectures | Cross-modal intelligence |
| **6. Debug** | **Fix** OOMs & crashes | Log Analysis, Config Tuner | Faster recovery, less downtime |
| **7. Evaluate** | **Grade** performance | `ofm-bench`, Leakage Checks | Validated, trustworthy metrics |
| **8. Release** | **Ship** to Production | Compliance Audit, Model Card | Safe, documented deployment |

---

## How the Stages Connect

The lifecycle isn't linear—it's iterative. GREMLIN understands these connections and helps scientists navigate between stages seamlessly.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│    │ ONBOARD  │───→│ DISCOVER │───→│   DATA   │───→│ PRETRAIN │            │
│    │          │    │          │    │          │    │          │            │
│    │ "Where   │    │ "What    │    │ "Lock    │    │ "Train   │            │
│    │  am I?"  │    │  data?"  │    │  it in"  │    │  single" │            │
│    └──────────┘    └──────────┘    └──────────┘    └────┬─────┘            │
│                                                         │                   │
│                                                         ▼                   │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│    │ RELEASE  │←───│ EVALUATE │←───│  DEBUG   │←───│  FUSION  │            │
│    │          │    │          │    │          │    │          │            │
│    │ "Ship    │    │ "Grade   │    │ "Fix     │    │ "Combine │            │
│    │  it"     │    │  it"     │    │  it"     │    │  all"    │            │
│    └──────────┘    └──────────┘    └────┬─────┘    └──────────┘            │
│         │                               │                                   │
│         │         ┌─────────────────────┘                                   │
│         │         │                                                         │
│         │         ▼                                                         │
│         │    ┌─────────────────────────────────────┐                        │
│         │    │          ITERATION LOOP             │                        │
│         │    │                                     │                        │
│         │    │   Debug → Adjust → Retrain → Eval  │                        │
│         │    │                                     │                        │
│         │    └─────────────────────────────────────┘                        │
│         │                                                                   │
│         └───────────────────→ PRODUCTION                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## GREMLIN's Role at Each Stage

### Stage 1: Onboard
**The Challenge:** 74 repositories, outdated wikis, tribal knowledge trapped in Slack threads.

**GREMLIN Helps By:**
*   Providing structured ecosystem maps tailored to the scientist's role
*   Answering "How do I?" questions with authoritative, up-to-date answers
*   Walking through first experiments step-by-step

**Deep Dive:** [The Onboarding Journey](08-Workflow-Onboarding.md)

---

### Stage 2: Discover
**The Challenge:** Finding the right data across siloed systems and undocumented buckets.

**GREMLIN Helps By:**
*   Searching the 74 repos for code, logic, and documentation
*   Acting as semantic search across the entire codebase
*   Pointing to exact files and line numbers

**Deep Dive:** [The Knowledge Engine](09-Workflow-Repo-Discovery.md)

---

### Stage 3: Data
**The Challenge:** Version drift, missing lineage, manual CSV exports breaking reproducibility.

**GREMLIN Helps By:**
*   Querying the Data Products Library for available cohorts
*   Generating validated join queries
*   Pinning immutable dataset versions with full lineage

**Deep Dive:** [Data Products Integration](10-Workflow-Data-Products.md)

---

### Stage 4: Pretrain
**The Challenge:** TB-scale data, Spot Instance interruptions, 512-GPU coordination.

**GREMLIN Helps By:**
*   Generating optimized training configs from templates
*   Monitoring job health and predicting failures
*   Automating checkpoint recovery after interruptions

**Deep Dive:** [Unimodal Pretraining](11-Workflow-Pretraining.md)

---

### Stage 5: Fusion
**The Challenge:** Combining RNA, pathology, clinical, and genomic modalities coherently.

**GREMLIN Helps By:**
*   Selecting and loading frozen encoders
*   Validating patient ID alignment across modalities
*   Configuring late fusion architectures

**Deep Dive:** [The Fusion Experiment](12-Workflow-Fusion.md)

---

### Stage 6: Debug
**The Challenge:** Cryptic NCCL errors, OOM crashes, silent data corruption.

**GREMLIN Helps By:**
*   Recognizing common failure patterns
*   Providing Tempus-specific solutions (not generic StackOverflow)
*   Auto-generating fixed configs

**Deep Dive:** [Debug & Rescue](13-Workflow-Debug.md)

---

### Stage 7: Evaluate
**The Challenge:** Metric validity, data leakage, unfair comparisons to baselines.

**GREMLIN Helps By:**
*   Running standardized benchmarks via `ofm-bench`
*   Detecting train/test leakage
*   Comparing results against official baselines

**Deep Dive:** *(Covered within other workflow documents)*

---

### Stage 8: Release
**The Challenge:** IP compliance, PII exposure, undocumented model behavior.

**GREMLIN Helps By:**
*   Running automated compliance audits
*   Generating Model Cards with required metadata
*   Orchestrating Inferno deployment

**Deep Dive:** [Compliance & Release](14-Workflow-Compliance.md)

---

## Universal Flexibility

The workflows detailed in this section represent the *core* Tempus ML lifecycle today, but they are only the starting point.

GREMLIN is **engine-agnostic**. It relies on the "Toolbelt" abstraction—a set of Python functions that wrap underlying APIs. This means GREMLIN can support **any** workflow that can be defined in code:

*   **New Modalities:** Adding Proteomics? Just index the `proteomics-etl` repo and register a new `DataTool`. The Agent immediately understands the new data type.
*   **New Frameworks:** Switching from Ray to Slurm? Update the `InfraTools` backend. Comparisons, syntax, and logic updates happen behind the scenes; the scientist's interface remains unchanged.
*   **Custom Pipelines:** Teams can define their own "Workflow Recipes" (standardized sub-routines), which GREMLIN ingests as new skills.

GREMLIN grows with the platform. As you build new engines, you simply give GREMLIN the keys.

---

## The Value Proposition

| Without GREMLIN | With GREMLIN |
| :--- | :--- |
| 8 disconnected workflows | 1 unified interface |
| Context-switching between tools | Single conversational thread |
| Tribal knowledge in Slack | Queryable institutional memory |
| Manual error diagnosis | Pattern-matched troubleshooting |
| Copy-paste config snippets | Generated, validated configs |
| Undocumented deployments | Automated Model Cards |

**The Result:** Scientists spend time on *science*, not on navigating infrastructure.

---

## What's Next

The following sections dive deep into each stage of the lifecycle, with concrete examples, GREMLIN command patterns, and before/after comparisons.

**Start Here:** [The Onboarding Journey](08-Workflow-Onboarding.md) — See how GREMLIN transforms a new hire's first weeks.
