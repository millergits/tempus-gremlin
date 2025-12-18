---
description: TheUnimodal PretrainingRun
---
# TheUnimodal PretrainingRun

← Back to Index

Role:NLP Scientist / Research Platform EngineerGoal:Train a foundation model on Tempus
 clinical text data.Key Challenge:Scale. This isnot a fine-tuning job; it requires terabytes of data,
  weeks of compute, and the ability to survive hardware failures.


Real-World Scale Context
Based on actual Tempus pretraining runs:




    Metric                  Value

    Corpus Size             2.6 trillion tokens

    Examples                1.3 billion chunks

    Target Model            MedGemma-27B (27B params, 128K context)

    Embedding Models        BGE-small (384d), ModernBERT (768d), MedGemma (5376d)

    Training Scale          80-320 H200 GPUs

    Tokens Processed        5.1B - 11.2B per run




Phase 1: Data Sharding ("The Heavy Lift")
Context:The raw dataset is 10TB of text. It cannotfit in memory. It must be tokenized, chunked,
 and sharded across 100+ files for distributed loading.


🛑 The Old Way


      ● Write a custom Beam pipeline to shard data.
       ● Manually calculate shard sizes to avoid "stragglers" (uneven GPU utilization).
        ● Wait 3 days for the prep job to finish.
👾 The GREMLIN Way


Command:Prepare the corpus.Action:GREMLIN spins up a serverless Ray Data cluster,
 optimizes the shard size for the target batch size, and streams the result to a pinned GCS bucket.

gremlin > I need to pretrain a BERT model on the 'pathology-reports-2024' corpus.


gremlin > Prepare the data for 128 nodes (A100).




[LOG] Analyzing 'pathology-reports-2024' (Size: 10.2 TB)...


[LOG] Calculation:


    - Target Batch: 4096
    

    - Optimal Shards: 256
    

    - Streaming Buffer: 50GB
    



Action: Launch Ray Data job to tokenize and shard? [Y/n]


gremlin > Y




[LOG] Job 'data-prep-bert-v1' submitted.


[PROGRESS] [====================>] 100% (Time: 4h 12m)


✔ Data pinned: atlas://datasets/path_bert_pretrain_v1





Phase 2: Resilience ("The Spot Strategy")
Context:Training will take 2 weeks. Using "On-Demand"GPUs costs $50,000. Using "Spot
 Instances" (preemptible) costs $15,000, but nodes will randomly die.


🛑 The Old Way


     ● Use On-Demand nodes (Expensive).
      ● Or, use Spot nodes and wake up at 3 AM when the cluster crashes to manually restart from
           checkpoint.
👾 The GREMLIN Way


Command:Train with resilience.Action:GREMLIN configures`Ray Connect` to handle "Elastic
 Training." If a node dies, GREMLIN automatically detects the loss, pauses the master worker, waits
  for a replacement node, and resumes training—withouthuman intervention.

gremlin > Train 'path-bert-large' on this data. Use Spot instances to save cost.


gremlin > Enable auto-recovery.




[LOG] Generating config with specific fault-tolerance settings:


    - use_spot: true
    

    - max_retries: -1 (Infinite)
    

    - checkpoint_freq: 500 steps
    




[LOG] Submitting job... [DONE]

🚀 Training started on 128 Spot GPUs. Est. Cost: $14,200 (Savings: $35k)




... [Day 3 - 03:14 AM Event] ...


⚠️ ALERT: Node `gke-spot-42` was preempted by Google Cloud.


🤖 AUTO-HANDLER: Pausing training...
 🤖 AUTO-HANDLER: Requesting replacement node... [Acquired]
  🤖 AUTO-HANDLER: Resyncing weights...
   🚀 AUTO-HANDLER: Resumed at Step 145,000.

(No User Action Required)





Phase 3: The Full Pipeline (Real Example)
Context:End-to-end unstructured text processing forembedding generation and model
 pretraining.


The Pipeline Stages
JSL Data → Cleaning → Chunking → Embedding → Redaction

    Stage       Description                                                     Runtime

    Cleaning    Dedupe, trim, lowercase, minimize (`text-corpus-processing`) PySpark job

    Chunking    Segment into model-compatible windows (2K tokens, 50%           1-2 hours
                   overlap)

    Embeddin Generate vectors via Triton Inference Server                       See below
     g

    Redaction Drop attachments after anchor dates (LOT, diagnosis,              Event-based
                 metastasis)                                                       filter




Embedding Generation Scale



    Model             Embedding Dim      Chunk Size    GP    Throughput      Runtime
                                                              Us

    BGE-small         384                512           16    32K req/s       15 hours

    ModernBERT        768                8192          64    4K req/s        2 days

    MedGemma-27       5376               8192          108 500 req/s         12+ hours
     B




👾 The GREMLIN Way


Command:Run the full pipeline.Action:GREMLIN orchestratesall stages, tracking progress and
 handling failures.

gremlin > Generate MedGemma embeddings for the LOT-redacted clinical notes corpus.




[LOG] Pipeline: Unstructured Text → Embeddings

[LOG] Stages:


    1. Clean (text-corpus-processing)
                                          ... COMPLETE

    2. Chunk (pdf-attachments-chunker)
                                          ... COMPLETE

    3. Stream (Lightning StreamingDataset) ... RUNNING
    

    4. Embed (MedGemma-27B via Triton)
                                            ... PENDING



[PROGRESS] Stage 3: Converting to streaming format...


    Workers: 150
    

    ETA: 7 hours
    



Action: Continue monitoring? [Y] or Notify on completion? [N]


gremlin > N





[LOG] You'll receive a Slack notification when embedding is complete.




Phase 4: Continued Pretraining (MedGemma Example)
Context:Fine-tuning MedGemma-27B on Tempus clinicalnotes using FSDP/DeepSpeed.


👾 The GREMLIN Way

gremlin > Continue pretraining MedGemma-27B on the LOT-redacted corpus.


gremlin > Use 320 GPUs with DeepSpeed ZeRO-3.




[LOG] Model: MedGemma-27B-Text-IT (Google)



[LOG] Architecture: Decoder-only Transformer, 128K context

[LOG] Strategy: FSDP + DeepSpeed ZeRO-3




[LOG] Generating config:


    - GPUs: 320 (40 nodes × 8 H200s)
    

    - Strategy: deepspeed_zero_3
    

    - Sharding: Parameters + Gradients + Optimizer states
    

    - Checkpoint: Every 1000 steps to GCS
    
[LOG] Data Pipeline:


    - Source: Lightning StreamingDataset (litdata format)
    

    - Multi-GPU: Auto-handled by StreamingDataset
    

    - Multi-node: Auto-sharded across workers
    



[WARN] Estimated cost: $42,000 (2 weeks @ $125/hr for 320 H200s)


[WARN] Spot savings available: $28,000 (with auto-recovery enabled)




Proceed with Spot + Auto-Recovery? [Y/n]


gremlin > Y




[LOG] Submitting to Hypernexus via KubeRay...



[LOG] MLFlow run: https://mlflow.tempus.com/runs/medgemma-pretrain-v2

🚀 Training started. Tokens/step: ~16M





Phase 5: Monitoring & Convergence ("The Flight Check")
Context:The pretraining job runs for days or weeks.The scientist needs to know if the loss curve
 is healthy or if it's diverging without staring at dashboards all weekend.


🛑 The Old Way


     ● Manually check TensorBoard or parse stdout logs.
      ● If a spike happens, manually SSH into the head node to kill the job.
       ● Guess whether the spike is recoverable or needs a learning rate adjustment.


👾 The GREMLIN Way


Command:Check training status.Action:GREMLIN queriesthe W&B API for run metrics and
 performs anomaly detection on the loss curve.

gremlin > How is the MedGemma pretraining run going?




[LOG] Fetching metrics from Weights & Biases... [DONE]

[LOG] Analyzing loss curve for anomalies... [DONE]




📊 RUN STATUS: medgemma-pretrain-v2




| Metric | Current | Trend |


| :--- | :--- | :--- |


| Step | 125,000 / 500,000 | 25% complete |


| Loss | 2.14 |
                 📉 Decreasing normally |
| MFU | 48% |
               ✅ Excellent |
| Tokens Seen | 2.0B | On track |


| GPU Utilization | 94% avg |
                                ✅ Healthy |

Status:
         🟢 HEALTHY

🧠 AI Insight:


Loss curve matches Chinchilla optimal scaling laws for this step.


No loss spikes detected in the last 24 hours.


Current trajectory projects final loss of ~1.85 (within expected range).




Projected completion: Friday at 3:00 PM


Estimated remaining cost: $28,000




Action: Continue monitoring? Set alert threshold? [C/A]


gremlin > A




[LOG] Alert configured:


    - Loss spike > 20% from moving average → Slack notification
    

    - GPU utilization < 80% for > 10 min → Slack notification
    

    - Job failure → Slack + Email
    



You'll be notified if anything needs attention.

Handling Loss Spikes
... [Day 5 - 11:42 AM Event] ...




⚠️ ALERT: Loss spike detected in medgemma-pretrain-v2




[LOG] Analyzing spike...




📈 ANOMALY DETECTED:




| Metric | Before | After | Change |


| :--- | :--- | :--- | :--- |


| Loss | 1.92 | 2.45 | +28% |


| Step | 312,450 | 312,451 | - |


| LR | 1e-4 | 1e-4 | No change |




Root Cause Analysis:


- Spike occurred at step 312,451


- Correlates with batch containing unusually long documents (avg 12K tokens vs 4K)


- No hardware failures detected


- Checkpoint at step 312,000 is valid




Recommendation:


This appears to be a transient spike from an outlier batch.


Loss has already started recovering (now at 2.31).




Options:


1. [W] Wait - Monitor for 1 hour, auto-recover expected


2. [R] Rollback - Restore checkpoint 312,000, skip problematic batch


3. [K] Kill - Stop training for manual investigation




Action? [W/R/K]


gremlin > W

[LOG] Monitoring mode enabled. Will alert if loss doesn't recover within 1 hour.




... [1 hour later] ...




✅ Loss recovered to 1.94. Training proceeding normally.


No further action required.
