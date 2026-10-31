// Kubernetes Pod Disruption Budgets in 2026: Graceful Shutdown Without Dropped Requests
export const kubernetesPdbBlog = {
  id: 40,
  title: "Kubernetes Pod Disruption Budgets in 2026: Graceful Shutdown Without Dropped Requests",
  slug: "kubernetes-pod-disruption-budgets-guide-2026",
  excerpt: "A working guide to Kubernetes Pod Disruption Budgets and graceful shutdown: minAvailable vs maxUnavailable, the drain deadlock trap, SIGTERM handling and termination grace periods, singleton and StatefulSet cases, and how to test a drain before an upgrade does.",
  content: `
# Kubernetes Pod Disruption Budgets in 2026: Graceful Shutdown Without Dropped Requests

> **TL;DR:** Kubernetes constantly disrupts your pods on purpose — node drains, cluster upgrades, autoscaler scale-downs, rollouts. Pod Disruption Budgets (PDBs) are how you negotiate those disruptions: "you may take one of my three replicas at a time, never two." But a PDB only covers the eviction handshake. The other half of graceful shutdown is the pod itself: handling SIGTERM, finishing in-flight work, and leaving the load balancer before the SIGKILL lands. Get both halves right and maintenance stops being an outage source; get either wrong and every upgrade is a small incident.

## The problem: most pod deaths are voluntary

When people imagine pods dying, they imagine failures — a node dying, an OOM kill, a crash. Those are *involuntary* disruptions, and Kubernetes handles them the only way it can: after the fact, by starting replacements.

But watch a healthy cluster for a week and most pod terminations are *voluntary*: an admin drains a node for maintenance, the cluster autoscaler removes an underused node, an upgrade rolls the nodes, a deployment replaces pods, the cluster itself gets upgraded version by version (the upgrades guide in this series is essentially a long, careful series of voluntary disruptions). Nothing failed — the platform is doing its job.

The trouble is the intersection: a drain that evicts all three replicas of your API in the same minute because nobody told it not to. A pod killed mid-request because it never got the memo — or got it and ignored it. Voluntary disruptions are scheduled, polite, and negotiable. You just have to actually negotiate.

## Pod Disruption Budgets: the negotiation

A PDB is a small object that tells the eviction API how many pods of a workload may be voluntarily taken down at once:

\`\`\`yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
  namespace: shop
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: api
\`\`\`

This says: of the pods labelled \`app: api\` in \`shop\`, at least 2 must stay available; evictions that would break that are refused with an error, and the drain waits. Two ways to express the budget:

- **\`minAvailable\`** — an absolute number (\`2\`) or a percentage (\`67%\`) of desired replicas that must remain up.
- **\`maxUnavailable\`** — how many may be down at once (\`1\`, or \`34%\`). Usually the better choice, because it tracks replica count: if you scale from 3 to 6 replicas, "at most 1 down" still means what you meant, while a stale \`minAvailable: 2\` silently got weaker.

Rounding is asymmetric and worth knowing: percentages for \`minAvailable\` round **up** (67% of 3 = 3, not 2), and for \`maxUnavailable\` round **down** (34% of 3 = 1). If your PDB seems stricter than the percentage suggests, this is why.

How the handshake works in practice: \`kubectl drain\`, cluster upgrades, and well-behaved controllers evict pods through the **eviction API**, which checks the PDB first. If the budget allows it, the pod gets its termination grace period and shuts down; if not, the eviction is rejected and the tool retries later. Tools that delete pods directly (a raw \`kubectl delete pod\`) bypass PDBs entirely — a PDB is a contract with polite tooling, not a force field.

## The trap: a PDB that can never be satisfied

Set \`minAvailable\` equal to your replica count — a very common "extra safe" instinct — and you have built a deadlock, not a safeguard. The node can never drain, because draining requires evicting a pod, and the budget forbids it. Cluster upgrades stall, autoscaler scale-downs stall, and someone eventually force-deletes the pod at the worst possible time, defeating the entire exercise under pressure.

The subtler version: the budget is satisfiable on paper, but the workload is unhealthy. If only 1 of 3 replicas is ready, a \`minAvailable: 2\` PDB blocks *all* evictions — including evicting the broken pods — because the budget counts healthy pods, and there is no slack. Recent Kubernetes versions address this with \`spec.unhealthyPodEvictionPolicy\` (set it to \`AlwaysAllow\` so unhealthy pods can always be evicted; the default \`IfHealthyBudget\` is stricter). A blocked drain is information: it usually means the application was already below its own availability floor before maintenance started.

A working rule: **budget for one disruption at a time.** \`maxUnavailable: 1\` for replicated stateless services is the sensible default — drains proceed pod by pod, replacements come up before the next eviction is allowed, and upgrades stay boring.

## The other half: what the pod does when told to die

A PDB buys an orderly *sequence*. It does not make an individual shutdown graceful. That part happens inside the pod, on a clock:

1. The pod is marked \`Terminating\`. It is removed from Service endpoints — mostly. Endpoint removal and the kube-proxy / ingress updates that follow are fast but not instantaneous, so a terminating pod can receive a trickle of new connections for a short window. This race is normal and known.
2. Any \`preStop\` lifecycle hook runs.
3. The container receives **SIGTERM**. This is the application's cue: stop accepting new work, finish in-flight requests, flush and close.
4. After \`terminationGracePeriodSeconds\` (default 30), if the process is still alive, it receives **SIGKILL** — no negotiation, mid-whatever.

Graceful shutdown is an application feature, not a platform one. The checklist:

- **Handle SIGTERM in the process.** Many frameworks do this out of the box now (Spring Boot's graceful shutdown, Go's \`signal.NotifyContext\`, Node's server close on signal) — but verify yours does, and that the handler *drains*: stop taking requests, wait for in-flight ones, close database connections cleanly.
- **Size the grace period to the work.** A web API that finishes requests in 2 seconds is fine at 30s. A worker with 5-minute jobs at the default 30s grace period gets SIGKILLed mid-job every rollout — set \`terminationGracePeriodSeconds\` to match the longest unit of work you intend to finish, and make the work checkpoint or idempotent for the cases where it still gets cut.
- **The \`preStop\` sleep, honestly labelled.** A common pattern is a preStop hook that sleeps a few seconds, giving endpoint removal time to propagate before SIGTERM makes the app stop listening. It looks like a hack because it is one — but it addresses the real endpoint race in step 1, and it prevents the classic "502s during every deploy" bug. Use it knowingly, keep it short.
- **Workers and queues:** on SIGTERM, stop *consuming*, finish the current message, then exit — and make sure unprocessed messages return to the queue (visibility timeout / ack discipline) rather than dying with the pod.

## Stateful and single-replica workloads: where PDBs can't save you

PDBs assume redundancy. Apply the arithmetic to a single-replica workload and \`minAvailable: 1\` (or \`maxUnavailable: 0\`) means "never voluntarily evict this pod, ever" — the drain deadlocks on your one database pod, and the eventual forced eviction takes the downtime anyway, unscheduled. For singletons, the honest choices are:

- **Accept the disruption window**: no PDB (or \`maxUnavailable: 1\`), maintenance takes the pod down briefly, planned and announced. Better a scheduled 60-second blip than a blocked upgrade escalating into an unplanned one.
- **Make it not a singleton** if the availability requirement is real — which for databases means the database's own replication story, not a Kubernetes trick.

For StatefulSets, PDBs work normally (they select pods by label like anything else), but pair them with the storage and backup thinking from earlier in this series: an evicted stateful pod comes back to its own volume, so the shutdown risk is about in-flight writes — the application-level SIGTERM handling matters more, not less.

One more placement rule: **do not put PDBs on batch Jobs.** A Job's pods are supposed to terminate; a budget on them protects nothing and can wedge completions and node drains alike. PDBs are for long-running services whose absence a user would notice.

## Proving it: test the drain before the upgrade does

Like every control in this series, a PDB is a rumour until exercised. The test fits in a staging afternoon:

1. Run a light, continuous request loop against the service (a small script recording status codes is enough).
2. Cordon and drain a node running the workload: \`kubectl cordon <node>\` then \`kubectl drain <node> --ignore-daemonsets\`.
3. Watch: evictions should proceed one at a time, the replacement should be Ready before the next eviction is allowed, and the request loop should show zero — or near-zero — failed requests. Failed requests with graceful PDB behaviour usually point at the application half: SIGTERM ignored, grace period too short, or the endpoint race.
4. Then test the *blocked* path deliberately: scale the service down to its floor and try another eviction. Being refused, and seeing the clear PDB error, is the control working. An upgrade night is the wrong time to learn this behaviour for the first time.

The cluster autoscaler respects the same handshake when it scales nodes down (covered in the autoscaling guide in this series) — which is why a too-strict PDB shows up twice in a cluster's life: once blocking your upgrade, once blocking your cost savings.

## Common mistakes

- **\`minAvailable\` equal to the replica count.** The deadlock special. Budget one disruption at a time.
- **Percentages that don't mean what you think.** \`minAvailable: 50%\` of 3 replicas is 2 pods (it rounds up) — and of 1 replica it is a permanent eviction ban.
- **Expecting PDBs to cover failures.** They govern voluntary evictions only. Node death, crashes and OOM kills are answered by replicas, topology spread and anti-affinity — the deployment-strategies guide covers that side.
- **Default 30-second grace for slow work.** Long requests, report generation, queue jobs: if the work takes minutes, the grace period must too, or every rollout is a small data-loss event.
- **Ignoring SIGTERM "because Kubernetes restarts us anyway".** It does — elsewhere. The in-flight request that died with the old pod does not get restarted; the client just sees an error.
- **PDBs on everything, including Jobs and singletons.** Indiscriminate budgets create blocked operations across the cluster and train the team to force-delete — the worst possible outcome.
- **Never alerting on blocked evictions.** A drain stuck for hours is a signal the app is below its availability floor. It belongs in the observability stack (the observability guide), not in tomorrow's surprise.

## Where this fits in the series

PDBs are the politeness protocol that several earlier guides quietly assume: the upgrades guide's node-by-node dance only works when evictions are budgeted, the autoscaling guide's cluster autoscaler asks PDB permission before removing nodes, Argo Rollouts and the deployment-strategies guide manage the same risk from the release side, and the backup guide is the admission that even perfect politeness has limits. Voluntary disruption done well is invisible — which is precisely the point of it.

## FAQ

**Does a Pod Disruption Budget protect against node failure?**
No. PDBs only constrain voluntary evictions through the eviction API. Involuntary loss — node death, kernel panic, a cloud reclaiming the instance — ignores budgets entirely. Redundancy (replicas, topology spread constraints, anti-affinity) is the tool for that side.

**Should I use minAvailable or maxUnavailable?**
\`maxUnavailable\` in most cases, typically \`1\`. It states the disruption you tolerate rather than a floor that silently weakens or deadlocks as replica counts change. Reserve \`minAvailable\` for workloads whose floor is a hard contractual number.

**Can a PDB block an upgrade forever?**
Yes, if the budget can never be met — either by construction (floor equals replicas) or because the workload is too unhealthy to have slack. That is the PDB doing its stated job; the fix is to repair the workload's health or consciously relax the budget, not to force-delete pods under pressure.

**Do Deployments create PDBs automatically?**
No. A Deployment manages replicas; the budget is a separate object you write, select, and own. Some Helm charts ship one (check before assuming — the value may not match your replica count), and the Helm guide in this series shows where such templates live.

**What happens to in-flight requests when a pod is evicted?**
The pod leaves the Service endpoints, gets SIGTERM, and has its grace period to finish. Requests still in flight when the grace period expires die with the SIGKILL. Both halves of this guide exist to shrink that window to zero: PDBs sequence the evictions, and the application's shutdown handling empties the pod before the deadline.
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Reliability", "PDB", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "11 min read",
  seo: {
    title: "Kubernetes Pod Disruption Budgets in 2026: Graceful Shutdown Without Dropped Requests",
    description: "A working guide to Kubernetes Pod Disruption Budgets and graceful shutdown: minAvailable vs maxUnavailable, the drain deadlock trap, SIGTERM handling and termination grace periods, singleton and StatefulSet cases, and how to test a drain before an upgrade does.",
    keywords: "Pod Disruption Budget, Kubernetes PDB, minAvailable maxUnavailable, graceful shutdown SIGTERM, kubectl drain eviction, terminationGracePeriodSeconds 2026"
  }
};
