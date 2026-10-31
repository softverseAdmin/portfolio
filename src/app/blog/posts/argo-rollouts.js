// Argo Rollouts 2026: Progressive Delivery for Kubernetes — Canary, Blue-Green and Rollbacks That Happen by Themselves
export const argoRolloutsBlog = {
  id: 29,
  title: "Argo Rollouts 2026: Progressive Delivery for Kubernetes \u2014 Canary, Blue-Green and Rollbacks That Happen by Themselves",
  slug: "argo-rollouts-progressive-delivery-2026",
  excerpt: "Progressive delivery for Kubernetes with Argo Rollouts: weighted canary steps, blue-green switching, Prometheus-driven analysis that promotes or rolls back automatically, and clean teamwork with Argo CD \u2014 plus the mistakes that bite and the services that should stay on plain Deployments.",
  content: `
# Argo Rollouts 2026: Progressive Delivery for Kubernetes — Canary, Blue-Green and Rollbacks That Happen by Themselves

> **TL;DR:** A plain Kubernetes Deployment can roll an update out, but it cannot send 5% of traffic to the new version, watch the error rate, and roll itself back when the numbers turn bad. Argo Rollouts can. It replaces your Deployment with a Rollout resource that adds weighted canary steps, blue-green switching, metric-driven analysis, and automatic rollback — and it slots neatly next to Argo CD if you already run GitOps. This guide installs it, ships a first canary, wires metrics into the promotion decision, and covers the mistakes that bite.

My [Kubernetes deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) explains the patterns: rolling, blue-green, canary, recreate. Patterns are the easy half. The hard half is execution — who watches the new version while it serves its first real traffic, and who has the nerve (and the speed) to pull it back at 2 a.m. when the error graph twitches?

A stock Deployment answers "nobody, really." It replaces pods on a schedule of percentages of *replicas*, not traffic. It has no idea whether the new version is healthy in any sense that matters to users. Rollback is a human noticing, deciding, and typing.

Argo Rollouts is the controller that closes that gap. And if you already run Argo CD — I do, and my [Argo CD tutorial](https://www.devopsenginer.com/blog/argo-cd-tutorial-gitops-2026) walks through it — Rollouts is from the same Argo family and feels like the missing half: Argo CD gets the right version *to* the cluster; Rollouts decides how that version *earns* the rest of the traffic.

## Why a plain Deployment is not enough

Three limits show up the first time a release goes wrong:

1. **Replica math is not traffic math.** "25% of pods are new" does not mean 25% of users see the new version — behind a Service, it is roughly proportional, but you cannot set 1%, or 5%, or hold a step deliberately.
2. **There is no verify step.** A Deployment promotes on pod readiness. A pod can be Ready and still return 500s, leak memory, or take 4 seconds per request. Readiness is not health.
3. **Rollback is manual and slow.** \`kubectl rollout undo\` works — after a human has noticed, paged, decided, and typed. The blast radius grows the whole time.

Progressive delivery is the discipline of fixing exactly these three: small traffic steps, automated verification between steps, and rollback that does not wait for a human. That is what Rollouts implements.

## What Argo Rollouts actually is

Three pieces:

- **The Rollouts controller** — a deployment in your cluster that watches Rollout resources and drives ReplicaSets, Services, and (optionally) your ingress or mesh.
- **The Rollout resource** — a near drop-in replacement for a Deployment. Same pod template, same selectors; the difference is the \`strategy\` block, which describes *how* versions rotate.
- **The kubectl plugin** — \`kubectl argo rollouts …\` for watching, promoting, pausing, and aborting rollouts from the terminal (and a web dashboard if you want one).

One honest nuance up front: **precise traffic percentages need a traffic router.** With a plain Service, canary steps scale ReplicaSets proportionally, so weights are approximate (with 10 replicas, your steps are effectively 10% chunks). Integrate Rollouts with NGINX Ingress, ALB, Traefik, Istio, or another supported router and the weights become real traffic weights, independent of replica count. Replica-based canary is fine to learn on; traffic-based is what you want for user-facing services.

## Install Rollouts and the kubectl plugin

The controller:

\`\`\`bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# watch it come up
kubectl -n argo-rollouts get pods
\`\`\`

The plugin (Linux example — grab the matching binary for your OS from the same releases page):

\`\`\`bash
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
chmod +x ./kubectl-argo-rollouts-linux-amd64
sudo mv ./kubectl-argo-rollouts-linux-amd64 /usr/local/bin/kubectl-argo-rollouts

kubectl argo rollouts version
\`\`\`

Using \`latest\` in a learning cluster is fine. In production, pin the release version in the URL and manage the install through your GitOps repo like everything else — a controller that controls your releases should itself be released carefully.

## Your first canary: a Rollout with steps

Take an ordinary Deployment, change \`kind: Deployment\` to \`kind: Rollout\` (and the apiVersion to \`argoproj.io/v1alpha1\`), and add a strategy. This example rolls a new version through 20% → pause for a human look → 50% → indefinite pause → 80% → full:

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: shop-api
  namespace: production
spec:
  replicas: 10
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: shop-api
  template:
    metadata:
      labels:
        app: shop-api
    spec:
      containers:
        - name: shop-api
          image: ghcr.io/example/shop-api:2.4.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: {}          # waits for a human promote
        - setWeight: 80
        - pause: { duration: 10m }
\`\`\`

Apply it, trigger an update by changing the image tag, and watch:

\`\`\`bash
kubectl argo rollouts get rollout shop-api -n production --watch
\`\`\`

You will see the step list with the current step highlighted — this little tree view is, honestly, half the reason people adopt Rollouts. The state of a release stops being something you reconstruct from three commands and becomes something you can *see*.

Promote past a manual pause, or bail out:

\`\`\`bash
kubectl argo rollouts promote rollout shop-api -n production
kubectl argo rollouts abort rollout shop-api -n production   # back to stable, now
kubectl argo rollouts undo rollout shop-api -n production     # roll back a finished one
\`\`\`

## Let metrics decide: analysis runs

Manual pauses are a fine start, but they still depend on a human watching a dashboard. The feature that turns Rollouts from "nicer rolling update" into progressive delivery is the **AnalysisRun**: during a canary step, Rollouts queries your metrics provider on an interval; if the numbers breach your conditions, it aborts and rolls back automatically.

A minimal success-rate check against Prometheus:

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
  namespace: production
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 30s
      count: 10
      successCondition: result[0] >= 0.95
      failureLimit: 2
      provider:
        prometheus:
          address: http://prometheus.monitoring.svc:9090
          query: |
            sum(rate(http_requests_total{service="{{ args.service-name }}",status!~"5.."}[5m]))
            /
            sum(rate(http_requests_total{service="{{ args.service-name }}"}[5m]))
\`\`\`

Reference it from the Rollout's canary strategy, and the analysis starts automatically at the step you choose:

\`\`\`yaml
  strategy:
    canary:
      analysis:
        templates:
          - templateName: success-rate
        args:
          - name: service-name
            value: shop-api
        startingStep: 2
      steps:
        - setWeight: 20
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: { duration: 10m }
\`\`\`

Now the 2 a.m. scenario changes shape: the new version starts failing, the success rate dips under 95% twice, and Rollouts aborts and restores the stable ReplicaSet **before anyone's phone buzzes**. The human reviews a finished, contained event in the morning instead of performing an emergency.

Two disciplines make or break this:

- **Analyse what users feel, not what machines feel.** Success rate and latency percentiles of real requests beat CPU graphs. (This is the same symptom-over-cause rule from my [Kubernetes observability guide](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026) — analysis is only as good as the signals you feed it.)
- **Your metrics must already exist and be trustworthy.** If the service emits no usable request metrics, step one is observability, not Rollouts. An automated rollback wired to a meaningless query is worse than a manual one — it fails with confidence.

## Blue-green with Rollouts

Prefer an all-or-nothing switch with an instant way back? Blue-green is a strategy block away:

\`\`\`yaml
  strategy:
    blueGreen:
      activeService: shop-api-active
      previewService: shop-api-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 300
\`\`\`

The new version comes up behind the *preview* Service, where you can smoke-test it against real infrastructure with zero user traffic. Promote it, and the *active* Service flips to the new ReplicaSet; the old one stays warm for \`scaleDownDelaySeconds\` — your undo window. With \`autoPromotionEnabled: false\`, the flip waits for \`kubectl argo rollouts promote\`. Set an analysis as a \`prePromotionAnalysis\` and even blue-green gets a metric gate before the switch.

My rule of thumb, same as in the strategies guide: **canary for stateless user-facing services where gradual is possible; blue-green where a version must switch atomically** (or where testing the exact production-bound version beforehand matters more than gradual exposure).

## Rollouts + Argo CD: who owns what

If you run GitOps, the division of labour is clean:

- **Argo CD** syncs the desired state from Git — including the Rollout resource and its new image tag. A release is a commit, with the audit trail Git gives you for free.
- **Rollouts** owns the *progression* of that version inside the cluster: steps, pauses, analysis, promotion, abort.

Argo CD understands Rollouts natively — it reports the Rollout's health (Progressing / Healthy / Degraded) instead of the binary in-sync view you'd get with a Deployment mid-rollout, so a canary sitting at 20% doesn't show up as a permanently "progressing" mystery.

One trap: do not let two systems fight. Your CI pipeline should update the image tag in Git (or the Rollout manifest) and then *stop* — no \`kubectl promote\` step in CI for releases you want gated, and no second controller trying to manage the same ReplicaSets. One owner per decision: Git for *what version*, Rollouts for *how fast it earns traffic*, humans for *the pauses you deliberately kept*.

## Mistakes that bite

- **Canary by replicas, expectations by traffic.** With few replicas and no traffic router, a "20%" step can be one pod behind a Service — noisy and not really 20% of anything. If precise percentages matter to the release decision, wire up a traffic router first.
- **Analysis wired to vanity metrics.** An AnalysisRun checking cluster CPU will happily promote a version that is erroring on every tenth request. Gate on per-service success rate and latency, measured on the canary itself.
- **No baseline.** Analysis compares the canary against an absolute condition (like the 95% above). If normal for this service is 96% on a good day, a 95% gate aborts healthy releases and trains everyone to ignore aborts. Tune the gate to the service's real baseline — my [requests and limits guide](https://www.devopsenginer.com/blog/kubernetes-resource-requests-limits-guide-2026) makes the same point about numbers copied from other people's clusters.
- **Promoting during an incident.** If the platform is already on fire, a promote command is not a fix. Rollouts will even keep an in-flight canary paused politely while everything degrades around it. Abort first; release later.
- **Forgetting the HPA.** Rollouts scales the stable and canary ReplicaSets to honour weights; an HPA targeting the Rollout works (point it at the Rollout, not the ReplicaSets), but an HPA someone left aimed at the old Deployment setup will confuse everyone. One more reason the migration should be a deliberate manifest change, not a weekend experiment.
- **revisionHistoryLimit left huge.** Old ReplicaSets are your rollback targets — keep a few (2–3). Keep thirty and every \`get rollout\` becomes an archaeology dig.

## When NOT to use Rollouts

Honestly: plenty of services should stay on plain Deployments.

- Internal tools and low-traffic services where a bad release inconveniences three colleagues, not three thousand customers.
- Batch and cron workloads — there is no traffic to graduate.
- Anything whose metrics are too thin to analyse; a canary you cannot verify is just a slower rolling update.
- Teams still fighting basic stability. Progressive delivery amplifies a release process; it does not repair one. Get deployments boring first (the [troubleshooting guide](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) is the place to start), then add graduation.

The measure I use, from the project-manager side of my desk: does a bad release of this service cost more than the machinery to catch it early? For the public, revenue-adjacent, or reputation-carrying services, Rollouts pays for itself the first time it aborts at step one. For everything else, it's ceremony.

## FAQ

**Is Argo Rollouts a replacement for Argo CD?**
No — they are siblings, not competitors. Argo CD delivers desired state from Git to the cluster. Rollouts controls how a new version progresses once it's there. Many teams run both; Rollouts also works without Argo CD if your delivery is plain kubectl or another CD tool.

**Can I use Rollouts without an ingress controller or service mesh?**
Yes. You get replica-proportional canary steps through Services, which is approximate but functional — fine for learning and for low-stakes services. Precise, replica-independent traffic weights need a supported traffic router (NGINX, ALB, Traefik, Istio, and others).

**What happens to my Deployment manifests?**
You convert them: \`kind: Rollout\` replaces \`kind: Deployment\`, the pod template carries over unchanged, and you add the \`strategy\` block. Rollouts manages its own ReplicaSets from there. The conversion is small; the thinking about steps and gates is the real work.

**Does an aborted canary count as downtime?**
No — aborting shifts traffic back to the stable ReplicaSet, which never went away. Users saw the canary's behaviour only for the share of traffic it held, which is precisely the blast-radius reduction you adopted this for.

**Can analysis roll back a blue-green release too?**
Yes — pre-promotion analysis gates the switch, and post-promotion analysis can trigger a rollback to the previous ReplicaSet while it's still within its scale-down window.

## Conclusion

A Deployment rolls software out. Argo Rollouts rolls software out *on probation*: a small share of traffic, real metrics watching, automatic retreat when the numbers say so. Install the controller, convert one service, start with replica-based canary steps and a manual pause — then wire in analysis and graduate to "the release promotes itself, and pages nobody."

Ship the versions. Let the evidence promote them.

---

**Keep going:** [Deployment Strategies](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) · [Argo CD Tutorial](https://www.devopsenginer.com/blog/argo-cd-tutorial-gitops-2026) · [Kubernetes Observability](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026) · [Kubernetes Production Checklist (free PDF)](https://www.devopsenginer.com/#newsletter)
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Argo Rollouts", "Progressive Delivery", "GitOps", "Argo CD"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "12 min read",
  seo: {
    title: "Argo Rollouts 2026: Progressive Delivery for Kubernetes \u2014 Canary, Blue-Green and Rollbacks That Happen by Themselves",
    description: "Progressive delivery for Kubernetes with Argo Rollouts: weighted canary steps, blue-green switching, Prometheus-driven analysis that promotes or rolls back automatically, and clean teamwork with Argo CD \u2014 plus the mistakes that bite and the services that should stay on plain Deployments.",
    keywords: "Argo Rollouts, progressive delivery Kubernetes, canary deployment, blue-green deployment, automatic rollback, AnalysisRun, Argo CD, GitOps 2026"
  }
};
