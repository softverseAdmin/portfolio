// Kubernetes Network Policies in 2026: Lock Down Pod Traffic Without Breaking Your App
export const kubernetesNetworkPoliciesBlog = {
  id: 38,
  title: "Kubernetes Network Policies in 2026: Lock Down Pod Traffic Without Breaking Your App",
  slug: "kubernetes-network-policies-guide-2026",
  excerpt: "A working guide to Kubernetes Network Policies: the flat-network problem, default-deny baselines, the DNS egress everyone forgets, per-tier allow rules, CNI enforcement checks, and how to test that forbidden traffic actually fails.",
  content: `
# Kubernetes Network Policies in 2026: Lock Down Pod Traffic Without Breaking Your App

> **TL;DR:** By default, every pod in Kubernetes can talk to every other pod — a flat network with no internal walls. Network Policies are the built-in way to change that: declare which pods may talk to which, on which ports, and everything else is denied. Start with a default-deny policy per namespace, add back exactly the flows your app needs (including DNS — everyone forgets DNS), and test with real connection attempts, not hope. One catch: your CNI plugin must actually enforce policies, or you are writing rules nobody obeys.

## The problem: a flat network inside the cluster

Kubernetes networking guarantees that pods can reach each other. What it does not give you, out of the box, is any restriction on that reachability. A compromised frontend pod can scan the database. A batch job can reach the payment service. A pod in the dev namespace can talk to a pod in prod if they share a cluster.

Network Policies fix this at the platform layer. They are firewall rules expressed as Kubernetes objects: selectors pick the pods a policy applies to, and rules list the allowed sources (ingress), destinations (egress), and ports. Anything not explicitly allowed is denied — but only once at least one policy selects a pod. A pod with no policy selecting it remains wide open, which is the single most misunderstood part of the whole feature.

## First, the prerequisite nobody checks: your CNI

NetworkPolicy is an API, not an implementation. The enforcement is done by your CNI plugin or network stack. Calico and Cilium enforce policies fully. Flannel, historically, does not enforce them at all — you can apply perfect policies and traffic flows anyway. On managed services it varies: Amazon's VPC CNI supports Network Policy enforcement in current EKS versions, GKE offers Dataplane V2 or Calico-backed policy, and AKS has Azure CNI powered by Cilium or its own policy manager options.

Before writing a single rule, verify enforcement in a scratch namespace: apply a default-deny, try a connection that should fail, and watch it fail. A policy that has never been tested is a rumour, not a control. (The security-basics guide in this series covers where Network Policies sit among the other cluster controls.)

## The anatomy of a policy

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow
  namespace: shop
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: web
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
\`\`\`

Read it as a sentence: *Pods labelled \`app: api\` in namespace \`shop\` may accept TCP 8080 from pods labelled \`app: web\`, and may initiate TCP 5432 to pods labelled \`app: postgres\`. Everything else for these pods is denied.*

Details that matter:

- **Empty \`podSelector: {}\` selects every pod in the namespace** — that is how you write a namespace-wide default-deny.
- **\`policyTypes\` is a promise.** If you list \`Egress\` but write no egress rules, all egress is denied. If you omit \`Egress\` from \`policyTypes\` while writing an ingress-only policy, egress stays open.
- **\`from\`/\`to\` entries in one list item are OR'd; separate list items are also OR'd.** Within one item, a \`podSelector\` and \`namespaceSelector\` together are AND'd — the classic way to say "pods with this label, in namespaces with that label."
- **Rules are additive only.** There is no deny rule and no ordering. Policies from multiple objects union together, which is why the default-deny-plus-allows pattern works.
- **Policies are namespaced.** A policy in \`shop\` cannot select pods in another namespace directly; cross-namespace rules go through \`namespaceSelector\`.

## Step 1: default-deny per namespace

The baseline move in every namespace that runs real workloads:

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: shop
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
\`\`\`

Apply this and the namespace goes dark: nothing in, nothing out. You have not secured the app yet — you have made the allowed list explicit and empty. Now you earn each flow back deliberately. Do this in a staging namespace first, because the next thing that happens is always the same.

## Step 2: allow DNS, the flow everyone forgets

The first casualty of default-deny egress is DNS. Pods resolve names through the cluster DNS service (kube-dns/CoreDNS in \`kube-system\`), and if egress to it is not allowed, every lookup fails and the app errors look like five unrelated bugs.

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: shop
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
\`\`\`

Two subtleties: when a rule item contains both a \`namespaceSelector\` and a \`podSelector\`, they combine with AND — exactly what you want here. And allow TCP 53 as well as UDP 53; large responses and retries fall back to TCP, and "DNS mostly works" is a miserable state to debug.

## Step 3: allow the real flows, one hop at a time

Now walk your architecture diagram and convert each arrow into a rule. For a typical three-tier app in one namespace — web → api → postgres — the api-allow policy at the top of this guide is the middle hop. The web tier needs ingress from the ingress controller's namespace (via \`namespaceSelector\`) and egress to the api. The database needs ingress only from the api and should usually have no egress at all beyond DNS.

Work namespace by namespace, and keep the policies in Git next to the deployments they describe. If you run GitOps (the Argo CD guide in this series), a policy change then gets the same review trail as a code change — which is precisely the audit story you want for a security control.

## Testing policies: prove the negative

The failure mode of Network Policies is silent — both kinds. Too open, and nothing complains while the risk stays. Too strict, and the app breaks in ways that look like application bugs. Test both directions deliberately:

1. **Positive test:** the allowed flow works (web reaches api, api reaches postgres, names resolve).
2. **Negative test:** a forbidden flow fails. Exec into a pod — or spin up a throwaway debug pod in the namespace — and attempt the connection that should not work: the database port from the web tier, an external IP, another namespace's service. A timeout or refusal is the policy doing its job; a successful connect means the policy is not selecting what you think it is, or the CNI is not enforcing.

A debug pod recipe that covers most cases:

\`\`\`bash
kubectl run nettest --rm -it --image=nicolaka/netshoot -n shop -- bash
# inside: dig api.shop.svc.cluster.local, nc -vz postgres 5432, curl to the api
\`\`\`

(\`netshoot\` is a well-known troubleshooting image that bundles the usual network tools.) Label the debug pod like the tier you are testing — policies select by labels, so an unlabelled debug pod tests the default, not the app's reality.

## Common mistakes

- **Applying policies where the CNI ignores them.** Test enforcement first; a policy on Flannel-era setups is decoration.
- **Forgetting \`policyTypes\`.** If you write egress rules but do not list \`Egress\` in \`policyTypes\`, your egress rules are not applied the way you expect — the API defaults \`policyTypes\` based on what you wrote, and the surprises are all in the direction of "more open than intended" or "mysteriously closed." Be explicit.
- **Denying DNS and chasing ghosts for an afternoon.** Any default-deny egress rollout needs the DNS allow in the same change.
- **Selecting by namespace name strings.** \`kubernetes.io/metadata.name\` is the label to match for a namespace; hand-rolled name labels drift.
- **Trying to write deny rules.** There are none in the native API. Deny-by-exception designs belong to the CNI-specific policy types (Calico and Cilium both offer higher-level policy objects with ordering and explicit deny) — use them deliberately, not by accident.
- **One giant policy per namespace.** Small, per-tier policies named after the flow (\`api-allow\`, \`postgres-ingress-from-api\`) stay readable and reviewable. A 300-line policy is where mistakes hide.
- **Ignoring egress.** Ingress-only thinking leaves data exfiltration and command-and-control paths wide open. Locking egress to known destinations is the higher-value half of the work, and the half most teams skip.

## Where this fits in the series

Network Policies are one layer, not the whole story. They sit alongside the controls from the security-basics guide (RBAC, Pod Security Standards, secrets handling from the ConfigMaps and Secrets guide), the namespace and quota discipline from the resource requests and limits guide, and the upgrade hygiene that keeps the CNI itself current. No single layer carries the cluster; the layers are the point.

## FAQ

**Do Network Policies replace a service mesh?**
No. Policies operate at L3/L4 — pods, namespaces, ports. A mesh adds identity-based, L7-aware controls (which service may call which path). Many clusters run policies alone happily; regulated or multi-tenant environments often run both.

**Can a policy allow traffic from outside the cluster?**
Ingress rules accept \`ipBlock\` entries (CIDR ranges), which is how you allow a load balancer range or an office VPN. Prefer selecting the ingress controller's pods by label when the traffic enters through it — CIDRs of cloud load balancers change more often than labels do.

**What about traffic between nodes, or to the node itself?**
Native policies govern pod traffic. Host and node-level rules are CNI-specific territory again (Calico's GlobalNetworkPolicy and Cilium's host policies) — reach for those when you need them, knowingly.

**How do I roll this out on a live cluster without an outage?**
Namespace by namespace, staging first: apply default-deny where a copy of the workload runs, add the flows, run the positive/negative tests, then repeat in production during a quiet window with the Git revert one command away. The rollout is a series of small, reversible changes — treat it with the same respect as the upgrades in this series' cluster-upgrades guide and it stays boring, which is the goal.
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Security", "Network Policy", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "9 min read",
  seo: {
    title: "Kubernetes Network Policies in 2026: Lock Down Pod Traffic Without Breaking Your App",
    description: "A working guide to Kubernetes Network Policies: the flat-network problem, default-deny baselines, the DNS egress everyone forgets, per-tier allow rules, CNI enforcement checks, and how to test that forbidden traffic actually fails.",
    keywords: "Kubernetes Network Policy, network policy default deny, pod network security, Calico Cilium policy, Kubernetes firewall rules 2026"
  }
};
