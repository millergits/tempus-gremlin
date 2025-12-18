# Workflow: The "Debug & Rescue" Mission

[← Back to Index](00-Index.md)

**Role:** ML Engineer / Scientist
**Goal:** Diagnose why a massive 128-GPU training run crashed overnight and resume it without losing progress.

## Phase 1: The Crash Report ("Forensic Analysis")

**Context:** The scientist wakes up to find their job marked as `FAILED`. They need to know why (Hardware failure? Code bug? OOM?) without reading 10,000 lines of logs.

### 🛑 The Old Way
*   `kubectl logs pod-name` -> scroll through endless stack traces.
*   Try to correlate timestamps with Ray Dashboard metrics.
*   Guess if it was a "Bad Node" (Hardware) or "Bad Code" (Software).

### 👾 The GREMLIN Way
**Command:** Analyze the failure.
**Action:** GREMLIN parses the stderr logs, correlates with node heartbeats (`Hypernexus`), and identifies the root cause (e.g., OOM during validation loop).

```text
gremlin > Why did job 'job-fusion-xl-v2' fail?

[LOG] Pulling logs from GCS archive... [DONE]
[LOG] Analyzing stack traces & node heartbeats... [DONE]

💥 FAILURE ANALYSIS:
Root Cause: CUDA Out of Memory (OOM)
Location: Node `gke-pool-1-node-43` (Rank 7)
Step: 4,502 (Validation Loop)

Context:
- During validation, you compute metrics on the full batch.
- The `contrastive_loss` calculation spiked VRAM usage to 82GB (Limit: 80GB).

Infrastructure Health:
✅ All nodes are healthy. This is a software resource issue, not a hardware failure.
```

## Phase 2: The Fix & Resume ("The Save")

**Context:** They need to restart the job, but with a fix. They don't want to restart from Epoch 0 (wasting $5k in compute). They need to resume from the last valid checkpoint.

### 🛑 The Old Way
*   Manually edit the config to reduce validation batch size.
*   Find the GCS path to the last checkpoint: `gs://buckets/checkpoints/step-4500`.
*   Update the YAML config `resume_from` field.
*   Resubmit the job.

### 👾 The GREMLIN Way
**Command:** Apply the fix and auto-resume.
**Action:** GREMLIN patches the config and finds the latest valid checkpoint in Atlas.

```text
gremlin > Fix the OOM and resume training.

[LOG] Suggestion: Reduce `val_batch_size` from 32 -> 16.
[LOG] Querying Atlas for checkpoints... [DONE]
Found Checkpoint: atlas://runs/job-fusion-xl-v2/ckpt-step-4500
(Saved 2 minutes before crash).

Action:
1. Clone config to `job-fusion-xl-v2-resume.yaml`
2. Set `val_batch_size: 16`
3. Set `resume_from: ckpt-step-4500`
4. Submit to Hypernexus.

Execute? [Y/n]
gremlin > Y

[LOG] Submitting Ray Job... [SUCCESS]
🚀 Resumed training. Job ID: job-fusion-xl-v2-resume
```

## Phase 3: Proactive Monitoring ("The Watch")

**Context:** The job is running again. The scientist doesn't want to wake up to another crash. GREMLIN can monitor the run and alert on anomalies.

### 🛑 The Old Way
*   Manually check TensorBoard or parse stdout logs.
*   Set crude email alerts on job status (PASS/FAIL only).
*   No early warning for "drifting" metrics.

### 👾 The GREMLIN Way
**Command:** Enable monitoring.
**Action:** GREMLIN watches the W&B metrics stream and performs anomaly detection on loss curves, GPU utilization, and memory pressure.

```text
gremlin > Monitor this run and alert me if anything looks wrong.

[LOG] Enabling proactive monitoring for job-fusion-xl-v2-resume...

Monitoring Configuration:
| Check | Threshold | Action |
| :--- | :--- | :--- |
| Loss Spike | >2x moving average | Slack alert |
| GPU Memory | >90% VRAM | Warning log |
| Training Stall | No progress for 10 min | Slack alert |
| MFU Drop | <30% efficiency | Investigation prompt |

Notification: Slack DM to @jsmith
Monitoring: ACTIVE

gremlin > [2 hours later...]

[ALERT] Anomaly Detected in job-fusion-xl-v2-resume

📊 HEALTH CHECK (Step 6,200):

| Metric | Current | Expected | Status |
| :--- | :--- | :--- | :--- |
| Loss | 1.82 | 1.85 | ✅ Normal |
| MFU | 47% | 45% | ✅ Good |
| VRAM | 78% | 75% | ✅ OK |
| Tokens/sec | 142k | 145k | ✅ Normal |

Overall: 🟢 HEALTHY

Projected completion: Tomorrow at 2:15 PM.
No action required.
```

---

## Common Failure Patterns

GREMLIN maintains a knowledge base of Tempus-specific failure modes:

| Error Pattern | Root Cause | GREMLIN Fix |
| :--- | :--- | :--- |
| `NCCL timeout exceeded` | GPU sync timeout (TCP/IP latency) | Increase `NCCL_TIMEOUT` or reduce sync frequency |
| `CUDA OOM` | Batch too large for VRAM | Reduce batch size or enable gradient checkpointing |
| `Ray actor died` | Node preemption (Spot) | Auto-resume from checkpoint |
| `Connection refused: Atlas` | Network partition | Retry with backoff |
| `FileNotFoundError: checkpoint` | Stale GCS cache | Clear gcsfuse cache, re-mount |
| `Diverged: loss=NaN` | Learning rate too high | Reduce LR, check for data corruption |
