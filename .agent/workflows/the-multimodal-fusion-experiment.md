---
description: The Multimodal Fusion Experiment
---
# The Multimodal Fusion Experiment

← Back to Index

Role:Modeling ScientistGoal:Train a Late Fusionmodel (RNA + Clinical) to predict Overall
 Survival.


Phase 1: Data Discovery ("The Pantry Check")
Context:Before training, the scientist must verifyif the cohort has sufficient overlap between
 modalities (RNA sequencing) and valid outcome labels (Time-on-Treatment).


🛑 The Old Way


    ● Manually write 400+ lines of Ibis code to join `oncopatient`,`oncoregimen`, and
           `onco_molecular`.
     ● Manually filter for `start_date` validity.
      ● Time cost:2-4 hours.


👾 The GREMLIN Way


Command:Ask a natural language question about thecohort.Action:GREMLIN executes
 `DataTools.checkcohortavailability` against BigQuery.Time cost:30 seconds.

gremlin > I want to train a fusion model on mm_curated_q225. Check availability for

RNA and 1L_TOT.




[LOG] Invoking DataTools.check_cohort_availability('mm_curated_q225', ['rna',

'1l_tot'])...


Scanning mm_curated_q225 (Total: 1,402 pts)...





| Criteria          | Count | % Total | Status                    |

| :---
                   | :---    | :---      | :---                  |

| Base Cohort
                   | 1,402 | 100%        | ✅                |


| Has RNA           | 1,374 | 98%         | ✅                |

| Has 1L TOT
                   | 1,150 | 82%         | ⚠️ High Attrition |

| Valid Train Set| 1,120 | 79%
                                         | ✅                |
> Note: 1L TOT drop-off is due to missing 'end_date' in 'onco_regimen'.




Action: Create pinned dataset split 'mm_fusion_v1' with these 1,120 patients?


gremlin > Yes.




[LOG] Materializing in Atlas... [DONE]


Dataset Created: atlas://datasets/mm_fusion_v1


Pinned to sha256:a8f9e2... (Immutable)





Phase 2: Configuration ("The Recipe")
Context:Finding the best upstream artifacts and configuringthe infrastructure.


🛑 The Old Way


     ● Browse Atlas UI to find the "Best RNA Model."
      ● Copy/paste the SHA hash into a YAML file.
       ● Manually guess batch sizes for A100 GPUs.


👾 The GREMLIN Way


Command:Describe the fusion architecture.Action:GREMLIN queries the Atlas Registry for the
 best artifact (`metric='max'`) and autogenerates a valid YAML config.

gremlin > Configure a Late Fusion experiment. Use the best frozen RNA encoder from

'v3-experiments'.




[LOG] Querying Atlas Registry (project='v3-experiments', modality='rna').... [DONE]


Found best upstream RNA encoder: rn_8f92x (C-Index 0.72).




[LOG] Generated config exp_fusion_mm_os.yaml:


model:


    architecture: late_fusion
    

    encoders:
    

      rna: { checkpoint: "atlas://artifacts/rn_8f92x", trainable: false }
      
      clinical: { checkpoint: "atlas://registry/cl_base_v2" }
      

    data:
    

      dataset: "atlas://datasets/mm_fusion_v1"
      

    batch_size: 64 # Tuned for H200-141GB
    



Validation Passed. Execute run? [Y/n]


gremlin > Y





Phase 3: Evaluation ("The Taste Test")
Context:The training job is complete. The scientistneeds to know if the model is valid.


🛑 The Old Way


     ● Run `ofm-bench` script.
      ● Manually inspect Kaplan-Meier curves for "crossing lines" (statistical violation).
       ● Miss hidden warnings about data leakage in the logs.


👾 The GREMLIN Way


Command:Ask for results.Action:GREMLIN runs `BenchTools.evaluate_survival`,parses the
 statistical objects, and runs anomaly detection logic.

gremlin > How did it do? Interpret the results.




[LOG] Invoking BenchTools.evaluate_survival()... [DONE]




Scorecard


| Metric
                  | Score | vs. Baseline              |

| :---
                  | :---   | :---                     |

| C-Index
                       🔻 -0.04 (vs Base)
                   | 0.68   |                           |

| Hazard Ratio | 1.45 | ✅ Significant
                                                       |



🧐 AI Analysis: Anomaly Detected


1. Crossing Curves: KM curves cross at t=18 months. Violates Proportional Hazards.

2. Embedding Warning: Metadata shows 'nearest_neighbor' embeddings.


Suggestion: Run an ablation study (Clinical-Only) to verify signal strength?




gremlin > Yes, run the ablation.




[LOG] Submitting ablation job... [DONE]


✔ Ablation job submitted: job-e45b-ablation




I will notify you when results are ready.





Phase 4: Deployment ("Shipping It")
Context:The ablation confirmed the simpler Clinical-Onlymodel was better. Now it needs to go to
 production on Inferno.


🛑 The Old Way


     ●      Manually locate the model artifact in GCS.
      ●      Write a KServe manifest (`inferenceservice.yaml`).
       ●      Run `kubectl apply`.
        ●      Hope the endpoint comes up healthy.


👾 The GREMLIN Way


Command:Deploy the winning model.Action:GREMLINpackages the model checkpoint and
 deploys it to the Inferno serving platform.


gremlin > Deploy the Clinical-Only model (job-e45b-ablation) to Inferno.



[LOG] Locating model artifact in Atlas... [FOUND]


    Checkpoint: atlas://runs/job-e45b-ablation/ckpt-final
    

    Size: 1.2GB
    



[LOG] Running pre-deployment checks...


✅ Model format: PyTorch (Compatible with vLLM)


✅ Input schema: Validated against Inferno contract
✅ No PII in weights (Scanned)




[LOG] Configuring KServe InferenceService...


    Namespace: inferno-batch
    

    Replicas: 2
    

    GPU: T4 (inference-optimized)
    



Deploy to production? [Y/n]


gremlin > Y




[LOG] Deploying to Inferno... [DONE]





✔ Deployment Successful.



Model: cl_unimodal_v2


Namespace: inferno-batch


Endpoint: https://inferno-internal.tempus.com/v1/models/mm-clinical-survival


Status: Healthy (2/2 Replicas)




curl -X POST

https://inferno-internal.tempus.com/v1/models/mm-clinical-survival/predict \


    -H "Authorization: Bearer $OKTA_TOKEN" \
    

    -d '{"patient_id": "PT-12345"}'
