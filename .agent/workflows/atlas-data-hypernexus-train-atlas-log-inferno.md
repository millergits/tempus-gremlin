---
description: Atlas (data) → Hypernexus (train) → Atlas (log) → Inferno
---
# Atlas (data) → Hypernexus (train) → Atlas (log) → Inferno

(deploy)




Want me to walk you through your first experiment? [Y/n]

Phase 2: First Experiment ("Hello World")
Context:Day 2. The scientist wants to runsomethingto understand the workflow end-to-end.


🛑 The Old Way


     ●      Clone 3 different repos.
      ●      Figure out the virtual environment setup.
       ●      Find a "sample config" that's 2 years old.
        ●      Debug import errors for 4 hours.


👾 The GREMLIN Way


Command:Request a guided tutorial.Action:GREMLINgenerates a working end-to-end example
 using current best practices.

gremlin > Walk me through running my first training experiment.




[LOG] Let's do a simple classification task on a public cohort.



[LOG] I'll guide you step-by-step.



📚 TUTORIAL: Your First Experiment




STEP 1: Check your environment


Run this to verify your setup:


    $ atlas-sdk --version
                                   # Should be >= 2.4.0

    $ hypernexus-cli ping
                                   # Should return "OK"



gremlin > Done. Both work.




STEP 2: Find a dataset


Let's use a pre-curated cohort for learning:




[LOG] Querying Atlas for tutorial datasets...

Available tutorial cohorts:


| Name | Task | Size | Description |


| :--- | :--- | :--- | :--- |


| tutorial_nsclc_v1 | Classification | 500 pts | NSCLC subtype prediction |


| tutorial_mm_survival | Survival | 300 pts | Multiple Myeloma OS |




Which one? [1/2]


gremlin > 1




STEP 3: Generate a config


[LOG] Creating experiment config for tutorial_nsclc_v1...




Generated: tutorial_experiment.yaml


---


experiment:


  name: my-first-experiment
  

  task: classification
  


data:

  dataset: atlas://datasets/tutorial_nsclc_v1
  

  split_seed: 42
  

model:


  architecture: logistic_regression
                                       # Simple baseline

  features: ["age", "stage", "histology"]
  

compute:


  gpus: 1
           # Single GPU for tutorial

  node_type: n1-standard-8
  

---




STEP 4: Submit the job


Ready to run? This will use ~$2 of compute. [Y/n]


gremlin > Y




[LOG] Submitting to Hypernexus... [DONE]

🚀 Job 'my-first-experiment' submitted.




Track progress: https://atlas.tempus.com/runs/my-first-experiment


Expected completion: ~5 minutes




I'll notify you when it's done.




... [5 minutes later] ...




✅ Job completed successfully!




Results:


| Metric | Value |


| :--- | :--- |



| Accuracy | 0.78 |

| F1-Score | 0.72 |


| AUC | 0.81 |




Congratulations on your first experiment!
                                                🎉

Next steps:


1. View the full report: `gremlin > show results my-first-experiment`


2. Try a harder task: `gremlin > walk me through a survival model`


3. Learn about fusion models: `gremlin > explain late fusion`





Phase 3: Deep Dive ("How Does X Work?")
Context:Week 1. The scientist is working on a realproject and hits a question: "How do I add RNA
 data to my model?"
🛑 The Old Way


    ●      Search Confluence for "RNA."
     ●      Find 47 results, none relevant.
      ●      Ask on Slack, wait 4 hours for a response.
       ●      Get pointed to a README that says "see other repo."

gremlin > How do I add RNA data to a fusion model?




[LOG] Searching knowledge base (74 repos, 12 wiki spaces)...


[LOG] Found 8 relevant sources. Synthesizing answer...




📖 ADDING RNA DATA TO FUSION MODELS




Short answer: Use the `unimodal-rna-model` embeddings as a frozen encoder.




Step-by-step:




1. **Get the RNA embeddings**


    
    The best current RNA encoder is `rna_encoder_v3` (C-Index 0.72).



    In your config:
    

    ```yaml
    

    encoders:
    

         rna:
         

             checkpoint: atlas://artifacts/rna_encoder_v3
             

             trainable: false
                                 # Keep frozen

    ```
    



2. **Ensure your cohort has RNA coverage**


    Not all patients have RNA sequencing. Check coverage first:
    

    ```
    

    gremlin > check RNA coverage for my_cohort
    

    ```
    

3. **Join the data**

    The RNA features live in `rna-pan-transcriptomic-etl`.
    

    They're keyed by `biospecimen_id`, which maps to `patient_id` via TDM.
    



Sources:


- ofm-late-fusion/README.md (lines 45-78)


- unimodal-rna-model/docs/integration.md


- Confluence: "Multimodal Fusion Best Practices"




Want me to generate a config with RNA for your current experiment? [Y/n]





Phase 4: Troubleshooting ("Why Isn't This Working?")
Context:Week 2. The scientist's job failed with acryptic error message.


🛑 The Old Way


    ●      Google the error message.
     ●      Find a StackOverflow answer for a different library version.
      ●      Ask on Slack: "Has anyone seen this error?"
       ●      Senior engineer eventually replies: "Oh, you need to set NCCL_TIMEOUT."


👾 The GREMLIN Way


Command:Ask about the error.Action:GREMLIN recognizescommon failure patterns and
 provides Tempus-specific solutions.

gremlin > My job failed with "NCCL timeout exceeded." What does this mean?




[LOG] Analyzing error pattern...




🔍 ERROR ANALYSIS: NCCL Timeout




This is a **common issue** on Hypernexus due to TCP/IP networking (no RDMA).

Root Cause:


NCCL (GPU communication library) timed out waiting for a response from another GPU.


This usually happens during large gradient synchronization in distributed training.




Likely causes (in order of probability):


1. **Batch size too large** → Gradient sync takes longer than timeout


2. **Straggler node** → One GPU is slower, others wait


3. **Network congestion** → Too many jobs competing for bandwidth




Solutions:




Option 1: Increase timeout (quick fix)


Add to your config:





env: NCCL_TIMEOUT: 3600 # 1 hour instead of default 30 min



Option 2: Reduce sync frequency (better fix)


Enable gradient accumulation:





training: gradientaccumulationsteps: 4 # Sync every4 steps instead of every step



Option 3: Use FSDP more aggressively (best fix)


Switch to full sharding to reduce per-sync payload:





distributed: strategy: fsdp shardingstrategy:FULLSHARD



This error is documented in:


- sre/runbooks/nccl-troubleshooting.md


- hypernexus-template/docs/distributed-training.md

Want me to apply one of these fixes to your config? [1/2/3]





Phase 5: Best Practices ("Am I Doing This Right?")
Context:Ongoing. The scientist wants to make surethey're following team conventions.


🛑 The Old Way


    ● Absorb conventions through code review feedback.
     ● Make mistakes, get corrected.
      ● Slowly learn the "unwritten rules" over 6 months.


👾 The GREMLIN Way


Command:Ask for a review.Action:GREMLIN auditsthe experiment config against team best
 practices.

gremlin > Review my experiment config for best practices.




[LOG] Analyzing config: exp_fusion_nsclc_v3.yaml



[LOG] Checking against Tempus ML best practices...



📋 CONFIG REVIEW




✅ GOOD PRACTICES:


- Using pinned dataset with SHA (reproducibility)


- Checkpoint frequency is appropriate (every 500 steps)


- Using mixed precision (BF16)




⚠️ SUGGESTIONS:


1. **Missing seed:** Add `seed: 42` for reproducibility


2. **Batch size:** 128 may OOM on H200. Recommend 64 with gradient_accumulation: 2


3. **No validation frequency:** Add `val_every_n_steps: 100` to catch issues early

❌ ISSUES:


1. **Hardcoded GCS path:** Use `atlas://` URIs instead of `gs://` for lineage tracking


    Before: `gs://tempus-ml-data/checkpoints/`
    

    After:
            `atlas://runs/${RUN_ID}/checkpoints/`



2. **Missing experiment tags:** Add metadata for searchability


    ```yaml
    

    tags:
    

     modality: fusion
     

     indication: NSCLC
     

     
     owner: jsmith@tempus.com

    ```
    



Apply these fixes automatically? [Y/n]


gremlin > Y




[LOG] Updated config saved to: exp_fusion_nsclc_v3_reviewed.yaml


Diff: +12 lines, -3 lines




Ready to submit the improved config? [Y/n]





GREMLIN as the "Institutional Memory"
The real value of GREMLIN for onboarding:




 Traditional Onboarding                     GREMLIN-Assisted Onboarding

 Read stale documentation                   Ask questions, get current answers

 Wait for Slack responses                   Instant answers from knowledge base
 Learn by making mistakes               Proactive best-practice guidance

 Absorb tribal knowledge over months    Access institutional memory immediately

 Rely on senior engineer availability   Self-service 24/7




Time to productivity:

   ● Without GREMLIN: 3-4 weeks
    ● With GREMLIN: 3-4 days
