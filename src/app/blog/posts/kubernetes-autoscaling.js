// Kubernetes Autoscaling in 2026: HPA, VPA, Cluster Autoscaling and KEDA — What Each One Actually Does
export const kubernetesAutoscalingBlog = {
  id: 30,
  title: "Kubernetes Autoscaling in 2026: HPA, VPA, Cluster Autoscaling and KEDA \u2014 What Each One Actually Does",
  slug: "kubernetes-autoscaling-guide-2026",
  excerpt: "Kubernetes autoscaling in 2026, layer by layer: HPA for replicas, VPA for pod size, Cluster Autoscaler and Karpenter for nodes, and KEDA for event-driven scale-to-zero \u2014 with the configuration that matters and the mistakes that quietly break each layer.",
  content: `
# Kubernetes Autoscaling in 2026: HPA, VPA, Cluster Autoscaling and KEDA — What Each One Actually Does

> **TL;DR:** Kubernetes has four different autoscaling layers and most problems come from expecting one of them to do another one's job. The Horizontal Pod Autoscaler (HPA) changes how many pods you run. The Vertical Pod Autoscaler (VPA) changes how big each pod is. Cluster autoscaling (Cluster Autoscaler or Karpenter) changes how many nodes exist for pods to land on. KEDA scales on events — queue depth, Kafka lag, cron schedules — instead of CPU. In production you usually need at least two of these together: HPA for replicas plus node autoscaling underneath, or your new pods sit Pending forever. And none of them work without honest resource requests, because every percentage-based decision is calculated from the requests you set.

Getting autoscaling right is the difference between a cluster that absorbs a traffic spike quietly and one that pages you at 3 a.m. while pods pile up unscheduled. This guide walks each layer in the order traffic actually flows through your cluster, with the configuration that matters and the mistakes that quietly break each one.

## Why autoscaling fails quietly

Autoscaling rarely fails with an error. It fails silently, in three classic ways:

1. **Pods scale, nodes don't.** HPA adds replicas, but there is no room for them. They sit in \`Pending\` while the load that triggered them keeps growing.
2. **Nodes scale, pods can't use them.** The cluster adds capacity, but pod requests are set so high that each node fits only one or two pods — you pay for nodes that are mostly reserved air.
3. **The metric lies.** HPA targets 70% CPU, but the app is memory-bound, or requests were set years ago and no longer resemble reality. The scaler makes confident decisions from bad inputs.

Every layer below exists to close one of these gaps. If you haven't set requests and limits deliberately yet, start with my [guide to Kubernetes resource requests and limits](https://www.devopsenginer.com/blog/kubernetes-resource-requests-limits-guide-2026) — autoscaling built on guessed requests just automates the guessing.

## Layer 1: Horizontal Pod Autoscaler — more copies of the pod

HPA is the layer most teams already have. It watches a metric — by default CPU or memory utilisation relative to pod requests — and adjusts the replica count of a Deployment, StatefulSet or similar workload between a minimum and a maximum.

A production-shaped HPA looks like this:

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 65
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 60
\`\`\`

Three details in that manifest do most of the work:

- **\`minReplicas: 3\`, not 1.** A single replica is a single point of failure and a slow cold start on the first spike. Three gives the scaler something to work with and survives a node loss.
- **The \`behavior\` block.** Without it, scale-down is eager: load dips, replicas vanish, load returns, pods churn. A 300-second stabilisation window on scale-down and one pod per minute keeps the replica count calm instead of flapping. Scale-up stays aggressive — when you need capacity, you need it now.
- **The target is utilisation of requests.** 65% of a 500m CPU request is a real number; 65% of a request nobody has reviewed since 2023 is not. This is why the requests guide matters more than the HPA manifest itself.

Prerequisites people forget: HPA needs metrics. Resource metrics come from the **metrics-server** add-on, which many clusters install by default but minimal or self-managed clusters may not have. If \`kubectl top pods\` returns nothing, HPA is flying blind and will do nothing — check that first before debugging the HPA object itself. Custom and external metrics (requests per second, queue length) need an adapter such as the Prometheus Adapter, which is where KEDA, below, often becomes the simpler path.

## Layer 2: Vertical Pod Autoscaler — the right size for each pod

VPA attacks a different problem: the pod itself is the wrong size. It observes actual usage over time and recommends — or automatically applies — better requests.

VPA runs in three modes, and choosing the mode is the whole decision:

- **Off** — it only shows recommendations (\`kubectl describe vpa\` becomes a right-sizing report). Safe everywhere, and honestly the mode most teams should start with for a few weeks.
- **Initial** — requests are set when a pod is created and never changed afterwards. Low disruption, slow to adapt.
- **Auto** — VPA evicts and recreates pods to apply new requests. Correct sizes, but your pods restart when VPA decides — never point Auto mode at something that cannot tolerate restarts.

**The classic conflict:** never let VPA in Auto mode and HPA fight over the same resource. If HPA scales on CPU utilisation while VPA keeps resizing the requests that utilisation is calculated from, the two controllers chase each other. The standard peace treaty: HPA on CPU (or on custom metrics), VPA in Off mode as an advisor — or VPA adjusting memory only while HPA watches CPU. My [Kubernetes cost optimization guide](https://www.devopsenginer.com/blog/kubernetes-cost-optimization-guide-2026) covers why this right-sizing loop is where most of the money is: oversized requests are a silent tax on every node you run.

## Layer 3: Node autoscaling — room for the pods to land on

HPA can decide it wants 20 replicas, but if the cluster has capacity for 8, the other 12 do not exist yet — they are \`Pending\`. Node autoscaling is the layer that notices unschedulable pods and adds machines, and later removes empty ones.

You have two mainstream choices:

**Cluster Autoscaler** is the older, conservative option. It watches for pending pods, asks the cloud provider for another node from an existing node group or instance pool, and scales groups down when nodes sit under-utilised. It is predictable and battle-tested, and its weakness is rigidity: it scales within node groups *you* pre-defined, so the instance types and sizes are your homework.

**Karpenter** (open source, originally built at AWS and now a CNCF project) takes the opposite approach: instead of scaling fixed groups, it watches pending pods, reads their actual requirements — CPU, memory, zones, labels, taints — and provisions a node shaped to fit them, often in under a minute. When nodes empty out, it consolidates: shuffles pods onto fewer, cheaper nodes and terminates the rest. The practical difference shows up exactly where Cluster Autoscaler is rigid — mixed workloads with very different shapes — and in consolidation, which steadily squeezes wasted capacity out of the cluster instead of only reacting to spikes.

Whichever you run, three settings decide whether it behaves:

- **PodDisruptionBudgets on important workloads.** Node scale-down and consolidation drain nodes. A PDB is how a workload says "you may move me, but never take me below this many healthy replicas." Without PDBs, autoscaling will eventually evict something at a bad moment. (My [deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) covers PDBs alongside rolling updates.)
- **Do-not-evict annotations for the truly pinned pods** — the singleton, the job mid-run. Both controllers respect signals that a pod must not be moved; use them sparingly and deliberately.
- **A floor under the cluster.** Keep enough baseline capacity for your steady state. Autoscaling is for variance, not for running the cluster at zero slack and hoping provisioning is always fast.

## Layer 4: KEDA — scaling on events, not CPU

Some workloads have no meaningful CPU signal. A worker that drains a queue is idle at 2% CPU with 10,000 messages waiting; a report generator should exist twice a day and never at night. Scaling these on CPU is scaling on a lie.

**KEDA** (Kubernetes Event-Driven Autoscaling, a CNCF graduated project) extends HPA rather than replacing it: it feeds external signals — SQS or Kafka backlog, RabbitMQ queue depth, database query results, cron schedules, Prometheus queries — into the scaling decision as metrics. Its two signature abilities:

- **Scale to zero.** HPA's floor is 1 replica (well, \`minReplicas\` of 1 in practice). KEDA can take a workload to 0 when the queue is empty and bring it back when work arrives. For intermittent workers, this is the difference between paying for idle pods all month and paying for none.
- **Scale on the signal that predicts the work.** Queue depth rises *before* CPU does. Scaling on the cause instead of the symptom removes most of the lag that makes CPU-based scaling feel sluggish.

A typical pattern: a \`ScaledObject\` declares the target deployment, the trigger (say, messages visible in a queue), and a threshold (one pod per 50 messages, between 0 and 15 replicas). KEDA maintains the underlying HPA for you. If you already run [Argo CD](https://www.devopsenginer.com/blog/argo-cd-tutorial-gitops-2026), ScaledObjects are just more YAML in Git — the same review-and-rollback story as everything else.

## Putting the layers together

A sane default stack for a typical web service:

| Layer | Tool | Decision it makes |
| --- | --- | --- |
| Pods | HPA | How many replicas, from CPU/custom metrics |
| Pod size | VPA (Off mode) | Whether requests match reality — advisory |
| Nodes | Karpenter or Cluster Autoscaler | How many machines, from pending pods |
| Events | KEDA (where relevant) | Scaling workers/jobs on queues and schedules |

And the observability to prove it works: watch \`Pending\` pod count, HPA's current-vs-desired replicas, and node utilisation after consolidation. If you cannot see autoscaling deciding, you are trusting it blindly — the metrics to wire up are covered in my [Kubernetes observability guide](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026).

## Common mistakes

1. **Autoscaling on CPU for a memory-bound app.** The metric must be the resource the workload actually runs out of — or a custom metric closer to the real demand, like requests per second.
2. **No metrics-server, no scaling.** \`kubectl top\` returning nothing means HPA sees nothing. Verify the plumbing before tuning the policy.
3. **HPA + VPA Auto on the same resource.** Two controllers, one variable, endless churn. Pick who owns CPU.
4. **maxReplicas as an afterthought.** Too low and the spike wins; absurdly high and a runaway loop or a bad deploy can scale you into a very large cloud bill. The max is a budget decision, not a formality.
5. **Scaling pods without scaling nodes.** The \`Pending\` pile-up. Every HPA rollout should be paired with the question: where do the new pods land?
6. **No PodDisruptionBudgets.** Node consolidation and scale-down will eventually evict the wrong pod at the wrong time.
7. **Scale-down as eager as scale-up.** Flapping replicas churn connections, caches and readiness. Stabilisation windows are free stability.

## FAQ

**Do I need all four layers?**
No. Most services need HPA plus node autoscaling. Add VPA in advisory mode when you suspect requests are wrong (they usually are), and KEDA when a workload's real demand signal is a queue, a schedule or another external event rather than CPU.

**Karpenter or Cluster Autoscaler?**
If you are starting fresh on AWS, Karpenter's just-in-time, right-shaped provisioning and consolidation usually win. Cluster Autoscaler remains a solid, predictable choice — especially outside AWS or where node groups are deliberately fixed for compliance reasons.

**Can KEDA replace HPA?**
KEDA *uses* HPA under the hood for most triggers. What it replaces is your hand-rolled metrics plumbing, and it adds scale-to-zero, which plain HPA does not give you.

**Why are my pods Pending even though autoscaling is on?**
Work through the layers: HPA may have scaled (check desired replicas), but if nodes are full and the node autoscaler cannot add capacity — quota limits, no matching node group, Karpenter constraints — pods wait. \`kubectl describe pod\` on a pending pod names the failing condition; my [Kubernetes troubleshooting guide](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) walks that diagnosis step by step.

## Conclusion

Autoscaling is not one feature you turn on; it is four decisions stacked on top of each other — how many pods, how big each pod is, how many nodes exist, and which signal you trust. Get the requests honest first, pair every pod scaler with node capacity underneath it, protect workloads with disruption budgets, and scale event-driven work on the events themselves. Do that, and traffic spikes become a graph you glance at — not an incident you get paged for.

*Running autoscaling in production? The [Kubernetes Production Checklist](https://www.devopsenginer.com) (free PDF via the newsletter on the homepage) covers the pre-flight checks — requests, probes, disruption budgets and rollback paths — that make scaling safe to automate.*
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Autoscaling", "HPA", "Karpenter", "KEDA"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "11 min read",
  seo: {
    title: "Kubernetes Autoscaling in 2026: HPA, VPA, Cluster Autoscaling and KEDA \u2014 What Each One Actually Does",
    description: "Kubernetes autoscaling in 2026, layer by layer: HPA for replicas, VPA for pod size, Cluster Autoscaler and Karpenter for nodes, and KEDA for event-driven scale-to-zero \u2014 with the configuration that matters and the mistakes that quietly break each layer.",
    keywords: "Kubernetes autoscaling, HPA, VPA, Karpenter, Cluster Autoscaler, KEDA, scale to zero, Kubernetes 2026"
  }
};
