---
description: Data Products Integration
---
# Data Products Integration

← Back to Index

Role:Data Scientist / Modeling ScientistGoal:Transitionfrom ad-hoc CSV/Parquet files to
 immutable, versioned Data Products for reproducible ML experiments.


Why Data Products Matter for ML
The current "Raw Ingredients" workflow (`ofm-data` buckets, manual CSV exports) creates
 reproducibility problems:

    ● Version Drift:The same cohort query run today vs.3 months ago returns different
           patients.
     ● No Lineage:When a model fails in production, tracingback to the exact training data is
            manual detective work.
      ● Access Chaos:Scientists share GCS paths via Slack;no audit trail of who accessed what.

Tempus Data Productssolve this by providing:

    ● Immutability:Once created, a Data Product file neverchanges.
     ● Versioning:Schema changes create new versions; oldversions remain accessible.
      ● Policy:Access is controlled via the Data ProductsService (DPS), not ad-hoc IAM.




Phase 1: Discovery ("What's in the Pantry?")
Context:A scientist wants to find all available clinical+ molecular cohorts for NSCLC.


🛑 The Old Way


    ● Scan internal wikis for dataset names.
     ● Ask on Slack: "Does anyone have the Q2 NSCLC cohort?"
      ● Hope the GCS path still exists and hasn't been overwritten.


👾 The GREMLIN Way


Command:Search the Data Products Library.Action:GREMLIN queries the DPL catalog via
 BigQuery and returns matching Types.

gremlin > Find Data Products for Non-Small Cell Lung Cancer with molecular data.

[LOG] Querying Data Products Library catalog...


[LOG] Filtering: indication='NSCLC', modalities=['clinical', 'molecular']... [DONE]




📦 AVAILABLE DATA PRODUCTS:




| Type Name
                               | Version | Records   | Last Updated | Classification |

| :---
                               | :---     | :---     | :---         | :---             |

| clinical_nsclc_outcomes
                               | v3.2.1   | 12,450   | 2024-10-15   | SECRET (PHI)     |

| molecular_wes_nsclc
                               | v2.1.0   | 8,230    | 2024-09-28   | SECRET (PHI)     |

| rna_expression_nsclc
                               | v1.4.2   | 6,890    | 2024-11-01   | SECRET (PHI)     |

| nsclc_treatment_outcomes
                               | v4.0.0   | 11,200   | 2024-10-22   | SECRET (PHI)     |



Tip: Use `gremlin > describe clinical_nsclc_outcomes` to view the Spec (schema).




gremlin > describe clinical_nsclc_outcomes




[LOG] Fetching Spec for clinical_nsclc_outcomes v3.2.1...




📋 SPECIFICATION: clinical_nsclc_outcomes




Status: PUBLISHED


Owner: data-products-team@tempus.com


Description: Clinical outcomes for NSCLC patients including OS, PFS, and treatment

response.




Schema (key fields):


| Field
                    | Type      | Required | Description                             |

| :---
                    | :---      | :---      | :---                                   |

| patient_id
                    | STRING    | Yes       | De-identified patient identifier       |

| diagnosis_date
                    | DATE      | Yes       | Initial NSCLC diagnosis date           |

| stage_at_dx
                    | STRING    | Yes       | TNM stage at diagnosis                 |

| os_months
                    | FLOAT     | No        | Overall survival in months             |
| os_event
                       | BOOLEAN    | No         | Death event indicator                      |

| pfs_months
                       | FLOAT      | No         | Progression-free survival                  |

| line_of_therapy
                       | INTEGER    | No         | Treatment line (1L, 2L, etc.)              |

| 1l_tot_days
                       | INTEGER    | No         | 1st Line Time-on-Treatment (days)          |



Access: You have QUERY permission via 'ml-scientists' group.





Phase 2: Access ("Check Out the Ingredients")
Context:The scientist has identified the Data Productsthey need. Now they want to join them for
 model training.


🛑 The Old Way


    ● Request access via ServiceNow ticket (2-5 day turnaround).
     ● Once approved, manually copy files from GCS to local environment.
      ● Write custom join logic to combine clinical + molecular data.


👾 The GREMLIN Way


Command:Request access and preview the join.Action:GREMLIN checks current permissions,
 initiates access requests if needed, and generates the join query.

gremlin > I need to join clinical_nsclc_outcomes with rna_expression_nsclc for

patients with 1L data.




[LOG] Checking permissions...


✅ clinical_nsclc_outcomes: QUERY access granted


⚠️
  rna_expression_nsclc: No access. Initiating request...



[LOG] Access request submitted to data-products-team@tempus.com


Request ID: DPS-REQ-2024-1847


Expected turnaround: 24-48 hours

Meanwhile, here's the join query you'll use once approved:





SELECT c.patientid, c.osmonths, c.osevent, c.1ltotdays, r.geneexpressionvector FROM
 `tempus-prod.dpl.clinicalnsclcoutcomes` c JOIN `tempus-prod.dpl.rnaexpressionnsclc`r ON c.patientid
  = r.patientid WHERE c.lineoftherapy = 1 AND c.1ltot_daysIS NOT NULL



Bookmark this query. I'll notify you when access is granted.





Phase 3: Pin & Version ("Seal the Jar")
Context:The scientist has their cohort. Before training,they need to create an immutable
 snapshot so future runs use the exact same data.


🛑 The Old Way


     ● Export query results to a new GCS path.
      ● Hope nobody overwrites it.
       ● Manually document the query and date in a README.


👾 The GREMLIN Way


Command:Create a pinned dataset version.Action:GREMLIN materializes the query result as a
 new Data Product, registering it in Atlas with full lineage.

gremlin > Pin this cohort as 'nsclc_fusion_train_v1' for my experiment.




[LOG] Executing cohort query... [DONE]


[LOG] Result: 4,892 patients with complete 1L TOT + RNA data.




[LOG] Creating Data Product...


    Type: ml_training_cohort (internal)
    

    Version: v1.0.0
    
    Spec: Derived from clinical_nsclc_outcomes (v3.2.1) + rna_expression_nsclc (v1.4.2)
    



[LOG] Registering in Atlas...


    Dataset URI: atlas://datasets/nsclc_fusion_train_v1
    

    Lineage:
    

      └─ clinical_nsclc_outcomes@v3.2.1 (12,450 → 4,892 pts)
      

      └─ rna_expression_nsclc@v1.4.2 (6,890 → 4,892 pts)
      



✅ Dataset pinned: atlas://datasets/nsclc_fusion_train_v1


     SHA256: a7f3e9c2...
     

     Immutable: Yes
     

     Expires: Never (manual deletion only)
     



This dataset is now safe to reference in your experiment config.





Phase 4: Audit ("Where Did This Come From?")
Context:Six months later, a model trained on thisdata shows unexpected behavior in production.
 The scientist needs to trace back to the exact training data.


🛑 The Old Way


     ● Search Slack history for the original GCS path.
      ● Hope the scientist who created it is still at the company.
       ● Manually reconstruct the query from code comments.


👾 The GREMLIN Way


Command:Trace the lineage.Action:GREMLIN queriesAtlas for the full provenance graph.

gremlin > What data was model 'nsclc_fusion_prod_v2' trained on?




[LOG] Querying Atlas lineage graph...

📊 LINEAGE TRACE: nsclc_fusion_prod_v2




Model: atlas://models/nsclc_fusion_prod_v2


├─ Training Run: atlas://runs/exp-fusion-2024-08-15


│ ├─ Config: exp_fusion_nsclc_v2.yaml (SHA: b3c8d1...)



│    └─ Dataset: atlas://datasets/nsclc_fusion_train_v1


│       ├─ Created: 2024-08-10 by jsmith@tempus.com

│       ├─ Query Hash: 9f2a4b...

│       └─ Source Data Products:


│           ├─ clinical_nsclc_outcomes@v3.2.1 (DPL)

│           │   └─ Spec Status: PUBLISHED (still current)


│           └─ rna_expression_nsclc@v1.4.2 (DPL)


│               └─ Spec Status: DEPRECATED (v1.5.0 available)


│                  ⚠️ Note: v1.5.0 fixed gene normalization bug (JIRA: DATA-4521)
│


🔍 POTENTIAL ISSUE DETECTED:



The RNA data used was v1.4.2, which has since been deprecated.

Consider retraining on v1.5.0 if gene expression is driving predictions.




Action: Compare model performance on v1.4.2 vs v1.5.0 cohorts?





Phase 5: Self-Service Replication ("Debug in Lower
 Environments")
Context:A scientist needs production data in a lowerenvironment (BET/VAL) to debug an issue.


🛑 The Old Way


     ● Submit ServiceNow ticket with business justification.
      ● Wait for manual approval and data copy.
       ● Data expires; repeat the process.
👾 The GREMLIN Way


Command:Replicate to lower environment.Action:GREMLINwraps the `dps replication` CLI
 command with proper justification.

gremlin > I need the clinical_nsclc_outcomes data in VAL to debug the missing patient

issue.




[LOG] Checking replication eligibility...


✅ clinical_nsclc_outcomes: GCS-backed, managed Data Product


✅ Target environment: VAL (allowed)
 ✅ Classification: Internal (replication permitted)

[LOG] Generating replication request...


Business Justification: "Debug missing patient issue in clinical_nsclc_outcomes"




Equivalent CLI command:



dps --env PRD replication \

    --destination-env VAL \
    

    --business-justification "Debug missing patient issue in clinical_nsclc_outcomes" \
    

    --data-product-ids "clinical_nsclc_outcomes"
    



[WARN] Data in VAL will auto-expire in 30 days.




Submit replication request? [Y/n]


gremlin > Y




[LOG] Replication request submitted.


Request ID: DPS-REP-2024-3421


Status: PENDING_APPROVAL (auto-approval for Internal classification)


ETA: 2-4 hours for data copy

DPS CLI Reference (What GREMLIN Wraps)
GREMLIN provides natural language access to the Data Products CLI (`dps`). Here's what's
 happening under the hood:




 GREMLIN Command               DPS CLI Equivalent

 "Find Data Products for       `dps search --query "NSCLC"`
  NSCLC"

 "Download the clinical        `dps download --product-id <id>`
  outcomes file"

 "Describe the schema for X"   `dps search --product-id <id> --verbose`

 "Replicate X to VAL"          `dps --env PRD replication --destination-env VAL
                                  --data-product-ids <id>`




Available CLI Commands

# Search for Data Products

dps search --help




# Download a single file


dps download --help




# Upload a new Data Product


dps upload --help




# Replicate to lower environment


dps replication --help




# Enable verbose logging for debugging


dps --verbose <command>

Environment Support



 Environment     Access                            Replication Target

 PRD             Production data                   Source only

 VAL             Validation environment            Yes (from PRD)

 BET             Beta environment                  Yes (Internal/Public only)




GREMLIN + Data Products: The Bridge
GREMLIN doesn't replace the Data Products platform—it makes itaccessible.




 Without GREMLIN                               With GREMLIN

 Navigate Core Platform Console UI             Natural language search

 Write raw BigQuery SQL                        Auto-generated, validated queries

 Manual ServiceNow tickets                     Automated access requests

 Copy-paste GCS paths                          Pinned Atlas URIs with lineage

 README.md documentation                       Queryable provenance graph

 `dps` CLI commands                            Plain English requests




The Data Products platform provides theinfrastructure.GREMLIN provides theinterface.
