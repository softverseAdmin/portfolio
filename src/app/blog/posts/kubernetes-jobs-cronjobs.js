// Kubernetes Jobs and CronJobs in 2026: Batch Work That Finishes (or Fails) Cleanly
export const kubernetesJobsCronjobsBlog = {
  id: 45,
  title: "Kubernetes Jobs and CronJobs in 2026: Batch Work That Finishes (or Fails) Cleanly",
  slug: "kubernetes-jobs-cronjobs-guide-2026",
  excerpt: "A practical guide to Kubernetes Jobs and CronJobs: backoffLimit, deadlines and TTL cleanup, indexed and parallel jobs, idempotent retries, CronJob timeZone, concurrencyPolicy and starting deadlines, and alerting on batch failure.",
  content: `
# Kubernetes Jobs and CronJobs in 2026: Batch Work That Finishes (or Fails) Cleanly

> **TL;DR:** Deployments run forever; Jobs run to completion — and that one difference changes how you configure everything. A production Job needs an explicit contract: \`restartPolicy: Never\` (or OnFailure, knowingly), a \`backoffLimit\` you chose, an \`activeDeadlineSeconds\` so nothing runs forever, and \`ttlSecondsAfterFinished\` so finished work cleans itself up. CronJobs add three decisions on top: a \`timeZone\`, a \`concurrencyPolicy\` that matches whether runs may overlap, and a \`startingDeadlineSeconds\` so a controller outage doesn't fire a pile of missed runs at once. Batch failures are normal — design for retries that are idempotent, and alert on failure rather than discovering it in the data.

## The workload Deployments can't express

Everything earlier in this series assumes services: replicas that should always exist, replaced when they die. Batch work inverts the assumption — a migration, a report, a backup, an import has a *done*, and success means the pods stop existing. Running batch work in a Deployment produces the classic pathologies: a completed container restarted forever, a failing task CrashLooping with no concept of "give up," no record of whether the run succeeded.

The Job controller exists to own that lifecycle: create pods, watch them finish, count successes against \`completions\`, count failures against \`backoffLimit\`, and stop. CronJob is a Job factory on a schedule — nothing more mystical than that, which is the right way to reason about both.

## The Job contract, field by field

\`\`\`yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: nightly-export
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 3
  activeDeadlineSeconds: 3600
  ttlSecondsAfterFinished: 86400
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: export
          image: registry.example.com/export:1.4.2
          args: ["--date", "yesterday"]
\`\`\`

The fields that decide behaviour:

- **\`restartPolicy: Never\` (or \`OnFailure\`)** — Jobs require one of these two; \`Always\` is rejected. The choice matters: with **Never**, a failed container means the pod fails and the controller creates a *replacement pod* (visible, countable, each with its own logs). With **OnFailure**, the kubelet restarts the container *inside the same pod* — fewer pod objects, murkier failure history. Default to Never unless you have a reason; it makes failures legible.
- **\`backoffLimit\` (default 6)** — how many pod failures before the Job itself is marked Failed. Each retry waits with exponential backoff (10s, 20s, 40s… capped at 6 minutes). Six silent retries of a broken image is how a bad deploy burns an hour unnoticed; for most batch work 2–4 is a saner, louder choice. Finer control exists via **pod failure policies** — rules that fail the Job immediately on specific exit codes (a config error will never fix itself) while ignoring disruptions like node drains.
- **\`activeDeadlineSeconds\`** — the Job's total time budget; exceed it and the Job fails and its pods are terminated. This is the field that prevents the "export job from March is still running" class of surprise.
- **\`ttlSecondsAfterFinished\`** — after the Job completes or fails, wait this long, then delete the Job and its pods. Without it, finished Jobs and their pod corpses accumulate forever (and with them, cluttered \`kubectl get pods\` output and etcd weight). A day is a reasonable default window for debugging; the logging pipeline from the logging guide is what preserves evidence beyond it.
- **\`completions\` / \`parallelism\`** — for work queues: \`completions\` is the total successes required, \`parallelism\` the pod ceiling. Leave both unset for the simple one-shot case (one success, one pod). **Indexed Jobs** (\`completionMode: Indexed\`) give each pod a stable index (\`JOB_COMPLETION_INDEX\`) for sharded work — partition the input by index instead of running a separate queue service.

## Idempotency: the requirement retries impose

A retried Job runs your code again against a world the first attempt may have half-changed. Batch code must therefore be **idempotent or transactional**: write to a staging key and publish atomically, upsert rather than insert, name outputs deterministically (by date/partition), and check-before-create where the sink allows. The failure this prevents is specific and common: attempt one writes 90% of the export and dies; attempt two appends a second 100%; downstream reads 190% and nobody knows which records are real. Retries are the controller doing its job — making them safe is yours.

## CronJobs: a schedule plus three decisions

\`\`\`yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-export
spec:
  schedule: "15 2 * * *"
  timeZone: "Asia/Tokyo"
  concurrencyPolicy: Forbid
  startingDeadlineSeconds: 900
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      backoffLimit: 3
      activeDeadlineSeconds: 3600
      ttlSecondsAfterFinished: 86400
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: export
              image: registry.example.com/export:1.4.2
              args: ["--date", "yesterday"]
\`\`\`

- **\`timeZone\`** — set it, always. Without it the schedule runs in the controller-manager's timezone (effectively UTC on most clusters), and "2:15 a.m." silently means something else after a cluster migration. The field takes an IANA name and handles daylight-saving transitions the way the name implies.
- **\`concurrencyPolicy\`** — the overlap decision, made explicitly:
  - \`Allow\` (the default): runs may stack up. Right for independent, cheap, idempotent work; dangerous when a slow run plus a punctual schedule compounds load.
  - \`Forbid\`: skip a scheduled run while the previous is still going. The right default for most sequential batch work — exports, backups, syncs.
  - \`Replace\`: kill the running Job and start fresh. For "latest state wins" work where a stale run is worse than none.
- **\`startingDeadlineSeconds\`** — if the controller misses a start (downtime, upgrades), how late a run may still fire. Without it, a controller recovering after an outage can launch a burst of stale runs; with it, missed runs beyond the window are skipped. Roughly 100 missed starts is the controller's own safety cap, but your deadline should be far tighter and deliberate.
- **History limits** — \`successfulJobsHistoryLimit\` (default 3) and \`failedJobsHistoryLimit\` (default 1) bound how many finished Job objects linger for inspection. Failed history is debugging gold and set lowest by default — raise it if you investigate on Mondays what failed on Fridays.
- **\`suspend: true\`** — the pause button. CronJobs honour it immediately; it is the clean way to stop a schedule during an incident without deleting the object.

## Failure is a normal state — observe it like one

A service failing pages someone; a Job failing at 2 a.m. writes a status field nobody reads. Close that gap deliberately:

- **Alert on Job failure and on CronJob staleness.** The signals exist in the metrics stack from the observability guide: job-failed conditions, and time since a CronJob's last successful run versus its schedule. "The nightly export hasn't succeeded in 26 hours" is an alert; discovering it from a stale dashboard is an incident review.
- **Logs outlive pods only if you shipped them.** Failed pods are deleted by TTL and history limits by design — the pipeline from the logging guide is the memory. At minimum, make the failure visible where the team already looks (the alert carries the job name; the runbook says where its logs live).
- **Distinguish "failed" from "never ran."** Scheduler outages, suspended CronJobs, image-pull failures before any pod starts — the Job object tells different stories in each case (conditions, events, pod statuses), and the fixes differ. The troubleshooting guide's habit applies: read the object's status before touching anything.

## Resource and disruption behaviour for batch

- **Requests still matter, limits protect neighbours.** Batch jobs are the classic noisy neighbour — bursty CPU during everyone else's peak. Set requests honestly (requests-and-limits guide) and consider scheduling heavy batch into off-peak windows or lower-priority classes so services win contention; a report can wait 20 minutes, a checkout cannot.
- **Disruption budgets apply differently.** A Job's pods are not protected by PDBs the way replicas are (the PDB guide covers voluntary disruptions) — node drains during a long Job mean pod termination and a controller retry. Long jobs should checkpoint progress or be restartable from partial state; the idempotency work above is what makes that survivable rather than catastrophic.
- **One-off manual runs:** \`kubectl create job --from=cronjob/nightly-export export-manual-1\` clones the template for an immediate run — the clean pattern for backfills and tests, far better than hand-writing a twin Job manifest that drifts from the scheduled one.

## When a Job is the wrong tool

- **Long-running or never-finishing work** is a service — use a Deployment.
- **Per-node work** (agents, collectors) is a DaemonSet's shape, not a Job's.
- **Complex DAG workflows** — fan-out/fan-in pipelines, artefact passing, per-step retries with dependencies — outgrow the Job controller quickly. That is the territory of workflow engines (Argo Workflows and kin); the Job primitives remain the right answer for the large simple majority: one task, a schedule or a trigger, a definition of done.

## Common mistakes

- **\`restartPolicy: Always\` copied from a Deployment.** The API rejects it for Jobs — usually discovered at apply time in a hurry. The template is not interchangeable.
- **No deadline.** A hung Job holds resources and blocks \`Forbid\`-policy successors indefinitely; the schedule looks fine and nothing runs. \`activeDeadlineSeconds\` is the difference between a failure and a mystery.
- **Retries without idempotency.** The double-write pattern above; the controller retries by design, so the hazard is guaranteed to fire eventually.
- **Default \`backoffLimit\` and no alerting.** Six quiet retries, a Failed status, and silence. Batch observability is an alerting decision, not a dashboard.
- **CronJobs in the wrong timezone.** The 2 a.m. job running at 11 a.m. after a migration is a rite of passage; the \`timeZone\` field is how you skip it.
- **\`Allow\` concurrency on heavy work.** One slow run plus an hourly schedule equals a self-inflicted load test by morning.
- **Secrets via environment for one-shot jobs.** Jobs end; their specs (and any env values in them) linger in history objects and etcd. The ConfigMaps and Secrets guide's file-based patterns apply with extra force to objects designed to be kept around as records.

## Where this fits in the series

Batch is the third workload shape in this series, beside services (Deployments) and per-node agents (DaemonSets): it leans on the requests-and-limits guide for fair scheduling, the storage guide when jobs move real data, the backup guide — whose restores and snapshots are themselves usually Jobs — and the autoscaling guide's cluster-autoscaler behaviour, which treats pending batch pods as the elastic demand they are. Model the done-state honestly and the controller does the rest.

## FAQ

**Job or CronJob for a task I trigger from CI?**
A Job, created by the pipeline when the event happens (a migration after deploy, an export on demand). CronJob is for wall-clock schedules; forcing event-driven work into a polling CronJob adds latency and pointless runs.

**Why did my CronJob not run at the expected time?**
In order of likelihood: timezone (no \`timeZone\` set, cluster in UTC), the previous run still going under \`Forbid\`, \`suspend: true\` left on, or a missed start beyond \`startingDeadlineSeconds\` after controller downtime. The CronJob's status and events record which.

**How many times will a failing Job retry?**
\`backoffLimit\` pod failures (default 6), with exponential backoff between attempts — then the Job is marked Failed and stops. With pod failure policies, specific exit codes can fail it sooner, on the first occurrence.

**Can a Job run on a schedule *and* be triggered manually?**
Yes — define the CronJob, and create one-off Jobs from its template with \`kubectl create job --from=cronjob/<name>\`. The manual run uses the same spec; it just isn't part of the schedule's history.

**Should batch jobs share the cluster with services?**
Usually, yes — with honest requests, sane priorities, and schedules that respect peak hours. Dedicated node pools earn their cost when batch is heavy, spiky, or needs special hardware; reach for isolation when contention is measured, not imagined.
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Batch", "CronJobs", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "Kubernetes Jobs and CronJobs in 2026: Batch Work That Finishes (or Fails) Cleanly",
    description: "A practical guide to Kubernetes Jobs and CronJobs: backoffLimit, deadlines and TTL cleanup, indexed and parallel jobs, idempotent retries, CronJob timeZone, concurrencyPolicy and starting deadlines, and alerting on batch failure.",
    keywords: "Kubernetes Job, CronJob, backoffLimit, concurrencyPolicy, ttlSecondsAfterFinished, indexed job, batch processing Kubernetes 2026"
  }
};
