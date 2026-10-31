// Kubernetes Resource Requests and Limits (2026): Set Them Right and Prevent OOMKilled & FailedScheduling
export const kubernetesRequestsLimitsBlog = {
  id: 19,
  title: "Kubernetes Resource Requests and Limits (2026): Set Them Right and Prevent OOMKilled & FailedScheduling",
  slug: "kubernetes-resource-requests-limits-guide-2026",
  excerpt: "Requests are what the scheduler spends; limits are what the kernel enforces. Set them from measurement \u2014 not templates \u2014 and two of Kubernetes' most common errors, OOMKilled and FailedScheduling, mostly leave your life. QoS classes, LimitRange, ResourceQuota and a five-step right-sizing method included.",
  content: `
# Kubernetes Resource Requests and Limits (2026): Set Them Right and Prevent OOMKilled & FailedScheduling

> ## TL;DR
>
> - **Requests are what the scheduler spends; limits are what the kernel enforces.** A pod is placed based on its requests, and killed or throttled based on its limits.
> - **CPU and memory fail differently:** exceed your CPU limit and you get throttled (slow); exceed your memory limit and you get killed (OOMKilled, exit code 137).
> - **Two of the most common Kubernetes errors are born here:** \`FailedScheduling\` (requests too big to place) and \`OOMKilled\` (memory limit set from hope). Both are manifest bugs, not cluster bugs.
> - **Set values from measurement, not vibes:** observe real usage over at least one full traffic cycle, set requests near typical peak, give memory a limit with honest headroom.
> - **Every container needs both numbers,** including sidecars and init containers — the one you skip is the one that gets evicted first.

Two of the errors in my [Kubernetes troubleshooting guide](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) — pods stuck Pending with \`FailedScheduling\`, and containers dying with \`OOMKilled\` — look like cluster problems and are almost never cluster problems. They are arithmetic problems. Somebody, weeks earlier, typed resource numbers into a manifest from a template, a guess, or a hope, and the cluster simply enforced them later, at the worst available moment.

I learned the cost of guessed numbers on my own cloud account, in a different currency: resources I spun up to learn with, never measured and never cleaned up, quietly billing me until the invoice taught the lesson. Kubernetes requests and limits are the same lesson inside a cluster. Guess them and the platform will eventually present the bill — in throttled requests, evicted pods, or a scheduler that suddenly cannot place anything. Measure them, and most of the drama never happens.

This guide is the setting-them-right companion to the troubleshooting guide: what requests and limits actually do, how the scheduler and the kernel each use them, how QoS classes decide who gets evicted first, and a measurement method for choosing values you can defend.

## Requests vs limits: two different machines read them

Every container in a pod can declare, for CPU and memory:

- **\`requests\`** — the amount the container is *guaranteed*. This is the number the **scheduler** uses: it sums the requests of all pods on a node and only places a new pod where its requests still fit into the node's allocatable capacity.
- **\`limits\`** — the ceiling the **kernel** enforces via cgroups. A container can use more than its request when the node has spare capacity, but never more than its limit.

The asymmetry matters more than the definitions:

| | CPU | Memory |
| --- | --- | --- |
| Unit | Cores: \`1\`, \`0.5\`, \`500m\` (= 0.5 core) | Bytes: \`512Mi\`, \`1Gi\`, \`2G\` |
| Over the request | Fine, if the node has spare capacity | Fine, if the node has spare capacity |
| Over the limit | **Throttled** — the kernel pauses the container for the rest of each scheduling period | **Killed** — OOMKilled, exit code 137, container restarts |
| Scheduler cares about | Requests only | Requests only |

CPU is *compressible*: the kernel can slow a container down. Memory is *incompressible*: the kernel cannot slow down RAM, so it kills. That single difference drives most of the practical advice in this guide — memory limits are safety-critical in a way CPU limits are not.

A worked example of placement arithmetic: a node with 4 allocatable CPUs already runs pods requesting 3.2 CPU in total. A new pod requesting 1 CPU does **not** fit (3.2 + 1.0 > 4.0) and goes Pending — even if every running pod is actually *using* only 0.1 CPU. The scheduler spends requests, not usage. This is why a cluster can be simultaneously "empty" (low real usage) and "full" (no room for new requests), and why \`FailedScheduling\` events quote requests, not load.

## Setting CPU: requests matter, limits are a debate

**CPU requests** do two jobs: they reserve placement room, and they set the container's relative CPU *weight* when the node is contended — a container requesting 1 core gets roughly twice the CPU shares of one requesting 500m during contention. Set them from measured usage and the scheduler's arithmetic stays honest.

**CPU limits** are genuinely debated, and you deserve the honest version of the argument:

- **For limits:** they cap noisy neighbours, make per-container consumption predictable, and satisfy the "every container must have limits" policy many platforms enforce.
- **Against limits:** a throttled container is a *latency* bug that doesn't look like one — the app is up, the pod is Ready, and p99 quietly degrades. Throttling shows up in metrics like \`container_cpu_cfs_throttled_seconds_total\`, and many experienced teams deliberately run with CPU requests only, letting containers burst into idle node capacity.

There is no universal right answer; there is a wrong one — setting CPU limits to random template values and never looking at throttling. If you set them, set them generously relative to requests (bursts are real) and graph throttling next to latency, so the trade-off is visible instead of theological.

## Setting memory: the numbers that kill

Memory deserves the stricter discipline:

- **Memory request** ≈ what the workload genuinely needs resident. Set it too low and your pod is first in line for eviction when the *node* comes under memory pressure, because eviction looks at usage relative to request.
- **Memory limit** = the kill line. Set it from measured peak usage plus headroom for the spikes you cannot predict — caches warming, a traffic surge, a leak's early days. A limit equal to average usage is an OOMKill scheduled for your busiest hour.
- **Runtime heaps fight limits if you let them.** A JVM (or any runtime with its own heap sizing) configured with an explicit heap larger than the container limit will be killed while believing it is fine. Modern runtimes mostly respect cgroup limits; explicit legacy flags override that respect. When a container OOMKills with heap to spare in its own metrics, this mismatch is the usual suspect.

A common conservative pattern for important services: **memory request = memory limit**. The pod becomes Guaranteed class (below), its memory is fully reserved, and the kernel will not kill it for exceeding a limit it cannot exceed without also being the thing the node promised to protect. The cost is flexibility — the node cannot overcommit that memory — which is exactly the trade mission-critical workloads should make on purpose.

## QoS classes: how Kubernetes ranks your pods for eviction

Kubernetes silently sorts every pod into one of three Quality of Service classes from its requests and limits:

- **Guaranteed** — every container (including init containers) has CPU and memory requests *equal to* their limits. Last to be evicted, and the kubelet works hardest to keep these alive.
- **Burstable** — at least one container has a request or limit set, but the pod is not Guaranteed. Middle of the eviction order.
- **BestEffort** — no requests or limits set anywhere. First to be evicted under node pressure, and the first to be refused when resources get tight.

Nobody chooses these classes directly; they fall out of the numbers you type. The practical consequence: that sidecar you added with no resources "because it's tiny" just made its pod Burstable-at-best, and an unnamed utility container with nothing set is a BestEffort passenger in a pod you thought was Guaranteed. Under memory pressure the kubelet evicts BestEffort pods first, then Burstable pods that are using more than they requested, and touches Guaranteed pods only when there is nothing else left. When a "random" pod dies during a node squeeze, its QoS class is usually the explanation.

## LimitRange and ResourceQuota: guardrails for teams

Individual discipline doesn't scale; namespaces have platform tools for that:

- **LimitRange** sets per-container policy inside a namespace: default requests and limits for containers that don't specify them (\`defaultRequest\`, \`default\`), minimums and maximums per container, and a maximum limit-to-request ratio. Defaults are the quiet hero here — they mean a forgotten \`resources:\` block gets sane values instead of BestEffort.
- **ResourceQuota** caps the *total* a namespace can claim: summed CPU/memory requests or limits, plus object counts (pods, services, PVCs). One team's runaway requests stop being every team's \`FailedScheduling\`. Know the consequence: when a quota constrains a compute resource, pods in that namespace **must** specify requests/limits for that resource or they are rejected at admission — which is the point, but it will surprise the first team that hits it.

Guardrails don't replace measurement; they bound the blast radius of not measuring.

## The right-sizing method: five steps, no guessing

1. **Start with something set.** A workload with no requests/limits is unmeasurable in scheduler terms. Seed with a modest, clearly provisional value so the pod is Burstable at minimum — and mark it provisional in the PR description, so nobody mistakes it for a decision.
2. **Observe one full cycle.** Real usage via \`kubectl top\` for spot checks and your metrics system (Prometheus/Grafana or your platform's equivalent) for the shape over time — at least one full traffic cycle: a week for most business workloads, including the peak you actually fear, not just Tuesday at noon.
3. **Set requests near honest usage.** A common working rule: request around your observed high-typical usage (roughly p90–p95 of steady state), not the average (too low — eviction bait) and not the once-a-year spike (wasted reservation all year).
4. **Set memory limit above observed peak, with headroom.** Peaks plus a deliberate margin; set CPU limit generously or not at all, per your team's position in the debate above — but decide, don't inherit.
5. **Revisit like a bill.** Re-check after traffic changes, major releases, and quarterly otherwise. The Vertical Pod Autoscaler can help here even if you never let it *change* anything: run in recommendation-only mode, it watches usage and prints the requests it would set — a second opinion you can compare against your own numbers before applying them by hand.

Tools suggest; the method is the point: **measure → set → watch → adjust**, on a cadence, forever. Every horror story in this space is a team that did step one of a template in 2023 and never did step two.

## A sane starting manifest

\`\`\`yaml
resources:
  requests:
    cpu: "250m"      # from measured typical-peak usage, not a template
    memory: "256Mi"  # observed working set
  limits:
    cpu: "1"         # generous: burst room without throttling normal peaks
    memory: "512Mi"  # observed peak + headroom — crossing this kills the container
\`\`\`

Treat these numbers as placeholders shaped like a decision: the proportions (limit roughly 2× request for memory, wide CPU headroom) are the transferable part, not the values. Your workload's measured values are the decision.

## Common mistakes

1. **Copying resources from a tutorial or a neighbouring service.** Their numbers describe their workload. Yours will enforce them on yours, at 3 a.m.
2. **Setting limits but no requests.** The scheduler places you as if you need nothing; contention and eviction then behave in ways that look random and aren't.
3. **Setting requests but forgetting sidecars and init containers.** Every container counts — for scheduling sums, for QoS, for quota. The forgotten log-shipper is part of the pod's arithmetic.
4. **Memory limit = average usage.** Averages guarantee the peak kills you. Limits belong above peaks.
5. **Tiny CPU limits "for safety".** Safety that manifests as permanent throttling and mysterious latency. Check throttling metrics before blaming the code.
6. **Requests so large the scheduler can't place pods.** One pod requesting 8 CPUs on 4-CPU nodes is Pending forever, and the event log says so plainly — read it before adding nodes.
7. **Setting numbers once, in the project's first week, forever.** Workloads change; reservations are a subscription you keep paying in cluster capacity. Review them like one.

## FAQ

**What happens if I set no requests or limits at all?**
The pod is BestEffort: the scheduler places it anywhere, it can be evicted first under any node pressure, and it can consume until the node suffers. Fine for a throwaway experiment; a liability for anything you care about. If your namespace has a LimitRange with defaults, you may silently be getting those instead — check what your pods actually run with.

**Should requests equal limits?**
For memory, on important workloads: often yes — it buys Guaranteed status and removes the kill-line ambiguity. For CPU: usually not, unless you specifically want to cap bursts; equal CPU request/limit removes the container's ability to use idle capacity.

**Why is my pod Pending when the nodes look idle?**
Because "idle" is usage and the scheduler spends requests. Sum the requests already placed on each node; the new pod's request doesn't fit anywhere. The \`FailedScheduling\` event lists the reasons node by node.

**How do I know if CPU throttling is hurting us?**
Watch \`container_cpu_cfs_throttled_seconds_total\` (or your platform's throttling panel) next to request latency. Rising throttled time alongside rising p99, with CPU usage pinned at the limit, is the signature.

**Can I change requests/limits without downtime?**
Editing the Deployment rolls out new pods with the new values — the standard, safe path. (In-place pod resource resizing exists in recent Kubernetes for some fields, but treat rollout-based change as the default unless you've verified your version and tooling.)

## Conclusion

Requests and limits are where your guesses become the kernel's orders. Set them from measurement and three famous error messages mostly leave your life: the scheduler can place things because the arithmetic is honest, the OOM killer stops visiting because peaks fit inside limits, and evictions pick the pods you would have picked.

Start this week, cheaply: pick your most important workload, look at seven days of its real usage, and compare with what its manifest claims. Every team I've seen do this finds at least one number that's fiction. Fix the fictions first — then put the review on the same recurring list as your cloud bill, because that's what it is.

**Related reading on this site:**
- [Kubernetes Troubleshooting in 2026](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) — diagnosing OOMKilled, FailedScheduling and the other errors these settings prevent
- [Self-Healing Infrastructure in Kubernetes](https://www.devopsenginer.com/blog/self-healing-infrastructure-2025) — probes and autoscaling, the other half of running pods honestly
- [kubectl Commands Cheat Sheet](https://www.devopsenginer.com/blog/kubectl-commands-cheat-sheet-2026) — the \`kubectl top\`, \`describe\` and resource commands used throughout this guide
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Resources", "SRE", "DevOps", "Performance"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "13 min read",
  seo: {
    title: "Kubernetes Resource Requests and Limits (2026): Set Them Right and Prevent OOMKilled & FailedScheduling",
    description: "Requests are what the scheduler spends; limits are what the kernel enforces. Set them from measurement \u2014 not templates \u2014 and two of Kubernetes' most common errors, OOMKilled and FailedScheduling, mostly leave your life. QoS classes, LimitRange, ResourceQuota and a five-step right-sizing method included.",
    keywords: "Kubernetes requests and limits, Kubernetes resource management, OOMKilled, FailedScheduling, QoS classes, LimitRange, ResourceQuota, right-sizing Kubernetes 2026"
  }
};
