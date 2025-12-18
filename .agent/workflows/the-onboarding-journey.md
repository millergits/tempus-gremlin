---
description: The Onboarding Journey
---
# The Onboarding Journey

← Back to Index

Role:New ML Scientist (Week 1-2)Goal:Get productiveon Tempus ML infrastructure without
 reading 74 repos worth of documentation.Key Challenge:Tribal knowledge. The "right way" to do
  things is scattered across wikis, Slack threads, and the minds of senior engineers.


The Onboarding Problem
A new hire at Tempus faces:

    ●      74+ repositorieswith varying documentation quality
     ●      No single source of truthfor "How do I train a model?"
      ●      Acronym soup:FTM, TDM, DPL, OFM, TOT, FSDP, ZeRO-3...
       ●      Implicit conventions:Which SHA hash to use, whichbucket to write to, which Slack
                 channel to ask

Average time to first productive experiment:3-4 weeks.

GREMLIN target:3-4 days.




Phase 1: Orientation ("Where Am I?")
Context:Day 1. The scientist has SSH access and alaptop. They've heard terms like "Hypernexus"
 and "Atlas" but don't know what they are or how they connect.


🛑 The Old Way


    ● Read the onboarding wiki (last updated 8 months ago).
     ● Ask on Slack: "How do I get started with ML training?"
      ● Get 5 different answers pointing to 5 different repos.


👾 The GREMLIN Way


Command:Ask for an overview.Action:GREMLIN providesa structured map of the ML
 ecosystem, tailored to the scientist's role.

gremlin > I just joined the ML team. Give me an overview of the ML infrastructure.


[LOG] Welcome to Tempus ML! Let me orient you.



🗺️ THE TEMPUS ML ECOSYSTEM




You'll work with three main systems:





┌───────────────────────────────────────────────────

──────────┐


│   1. ATLAS (The Registry)                                  │


│      "Where experiments live"                              │


│      - Tracks datasets, models, and runs                   │


│      - Everything has a URI: atlas://datasets/my_cohort    │


│      - Think: MLflow + metadata governance                 │

├───────────────────────────────────────────────────

──────────┤



│   2. HYPERNEXUS (The Compute)                              │


│      "Where training happens"                              │


│      - H200 GPU cluster (up to 512 GPUs)                   │


│      - Submit jobs via Ray                                 │


│      - Think: Your distributed training backend            │

├───────────────────────────────────────────────────

──────────┤



│   3. INFERNO (The Serving)                                 │


│      "Where models go to production"                       │


│      - vLLM-based inference platform                       │


│      - Think: Your deployment target                       │


└───────────────────────────────────────────────────

──────────┘



Your daily
