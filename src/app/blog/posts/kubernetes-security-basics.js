// Kubernetes Security Basics in 2026: RBAC, Network Policies and Pod Security That Actually Get Used
export const kubernetesSecurityBasicsBlog = {
  id: 31,
  title: "Kubernetes Security Basics in 2026: RBAC, Network Policies and Pod Security That Actually Get Used",
  slug: "kubernetes-security-basics-guide-2026",
  excerpt: "Kubernetes security basics that actually get implemented: least-privilege RBAC, default-deny NetworkPolicies, Pod Security Standards enforced gradually, disciplined secrets handling and image hygiene \u2014 rolled out namespace by namespace without a big-bang migration.",
  content: `
# Kubernetes Security Basics in 2026: RBAC, Network Policies and Pod Security That Actually Get Used

> **TL;DR:** A default Kubernetes cluster is far more open than most teams realise: any pod can talk to any other pod, many workloads run with more API permission than they need, and "the app works" often quietly means "the app runs as root with a token mounted it never uses." You do not need a security platform to fix the worst of it. Three controls close most of the real-world holes: RBAC scoped to what each identity actually does, NetworkPolicies that end the flat any-to-any network, and Pod Security Standards that stop privileged, root-running workloads at admission time. Add disciplined secrets handling and image hygiene, and a default cluster becomes a defensible one — with changes your team can roll out namespace by namespace, without a big-bang migration.

Kubernetes security advice tends to arrive as a 200-item checklist, which is why so much of it never gets implemented. This guide takes the opposite approach: the small set of controls that remove the most risk per hour of effort, in the order I would apply them to a real cluster, with the manifests that matter.

## Start from the uncomfortable defaults

Before the controls, be honest about what a fresh cluster permits:

- **The network is flat.** With no NetworkPolicies, every pod can open a connection to every other pod and service in the cluster. One compromised frontend can reach your database directly.
- **Every pod gets a service account token** mounted by default (unless you turn it off), whether or not the application ever calls the Kubernetes API.
- **Containers frequently run as root**, with the default capabilities, on images pulled by a mutable tag like \`latest\`.
- **RBAC is often bypassed in practice** — not by attackers first, but by teams handing out \`cluster-admin\` because a narrower role "took too long to debug."

None of this is exotic. Attackers do not need zero-days when the defaults hand them lateral movement and credentials. The good news: each default above has a specific, boring fix.

## Control 1: RBAC — least privilege for humans and workloads

RBAC answers one question: *who is allowed to do what to which resources?* Two identities matter — the people (and CI systems) who operate the cluster, and the service accounts workloads run as.

**For workloads:** give each application its own ServiceAccount, and set \`automountServiceAccountToken: false\` unless the app genuinely calls the API. Most applications never do — the mounted token is pure attack surface: steal the pod, steal a credential.

\`\`\`yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: api
automountServiceAccountToken: false
\`\`\`

When an app *does* need API access, bind a Role that names the exact verbs and resources — \`get\` and \`list\` on \`configmaps\` in one namespace is a role; \`*\` on \`*\` is an incident waiting for a date:

\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: config-reader
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]
\`\`\`

**For humans and CI:** scope roles per namespace, treat \`cluster-admin\` like root on a production database — a named, audited exception, not a team default — and audit what you have. Two commands tell you most of the story:

\`\`\`bash
kubectl get clusterrolebindings -o wide
kubectl auth can-i --list --as=system:serviceaccount:production:api -n production
\`\`\`

The second is the one to run for every workload identity: it prints exactly what that token can do, in plain text. If the list surprises you, that is the finding. This is the same least-privilege discipline as IAM on the cloud side — my [AWS IAM least privilege guide](https://www.devopsenginer.com/blog/aws-iam-least-privilege-guide-2026) works through the identical thinking for AWS policies.

## Control 2: NetworkPolicies — end the flat network

A NetworkPolicy is a firewall rule for pods: it selects pods and declares which traffic may reach them (ingress) and where they may connect (egress). Policies are enforced by your CNI plugin — an important caveat: if your CNI does not enforce NetworkPolicy (the basic kubenet setup is the classic example), the objects exist and silently do nothing. Cilium, Calico and the major cloud CNIs enforce them; verify yours before trusting the YAML.

Roll out in this order, namespace by namespace:

**Step 1 — default deny.** One policy that selects all pods in the namespace and allows nothing changes the posture from "open unless closed" to "closed unless opened":

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
\`\`\`

**Step 2 — allow what the app actually needs.** Then add narrow allowances: the frontend may reach the API on its port; the API may reach the database on 5432 and DNS on 53 (forgetting DNS egress is the classic self-inflicted outage — allow it explicitly):

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-ingress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - port: 8080
\`\`\`

Do this in a staging namespace first, watch what breaks, and promote the same policies with the application — if you run GitOps, they belong in the same repository as the workloads, reviewed like any other change (my [Argo CD tutorial](https://www.devopsenginer.com/blog/argo-cd-tutorial-gitops-2026) covers that workflow). A compromised pod inside a default-deny namespace is a contained problem; in a flat network it is a cluster tour.

## Control 3: Pod Security Standards — stop bad workloads at the door

RBAC limits identities and NetworkPolicies limit traffic, but neither stops a deployment that asks to run privileged, mount the host filesystem, or run as root. That is admission-time work, and Kubernetes has it built in: **Pod Security Standards**, enforced through Pod Security Admission with three profiles:

- **Privileged** — effectively no restrictions. For system components that genuinely need host access, and nothing else.
- **Baseline** — blocks the known privilege escalations (privileged containers, host namespaces, dangerous capabilities) while staying compatible with most typical workloads.
- **Restricted** — the hardened target: no root, no privilege escalation, drop all capabilities, seccomp on. What user-facing workloads should aim for.

Enforcement is a namespace label — no webhook to install:

\`\`\`bash
kubectl label namespace production \\
  pod-security.kubernetes.io/enforce=baseline \\
  pod-security.kubernetes.io/audit=restricted \\
  pod-security.kubernetes.io/warn=restricted
\`\`\`

That combination is the pragmatic rollout: **enforce Baseline today** (violating pods are rejected), while **audit and warn on Restricted** shows you — in API warnings and audit logs — exactly which workloads would fail the stricter profile, so you can fix them deliberately instead of breaking production on day one. At the workload level, the settings Restricted asks for are small and belong in every Deployment template:

\`\`\`yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
  seccompProfile:
    type: RuntimeDefault
\`\`\`

The honest blocker is usually the image: an app whose image only runs as root needs a Dockerfile fix, not an exception. Treat exceptions as named, expiring decisions — a namespace labelled back to Privileged "temporarily" has a way of becoming permanent.

## Secrets: the rules that prevent the embarrassing incidents

Kubernetes Secrets are base64-encoded, not encrypted, and anyone with the right RBAC verb can read them — which loops straight back to Control 1. The working rules:

- **Encryption at rest on** for etcd (a cluster-level setting; managed clusters differ in defaults — verify yours, don't assume).
- **Never bake secrets into images or commit them to Git.** Use environment injection or mounted volumes from a secrets source, and scan repositories in CI so a committed credential fails the pipeline — that scanning habit is part of the wider pipeline discipline in my [DevSecOps checklist](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025).
- **Prefer an external secrets store** (cloud secret managers, or an external-secrets operator syncing from one) as the source of truth, so rotation and audit live in one place instead of being scattered across namespaces.
- **Rotate like you mean it.** A secret that has never been rotated should be assumed permanent — and anything permanent eventually leaks.

## Image hygiene: know what you are actually running

The last basic: the artefact you deploy. Four habits cover most of it:

1. **Pin by digest, or at least by specific version tag.** \`latest\` means "whatever exists at pull time," which is neither reproducible nor auditable.
2. **Scan in CI and watch the results.** A scanner that reports into a void changes nothing; gate on fixable critical vulnerabilities for internet-facing workloads.
3. **Use minimal bases.** A small base image is fewer packages to patch and fewer surprises — the same discipline as my [Docker image optimization guide](https://www.devopsenginer.com/blog/how-to-optimize-docker-images-production-2025), where smaller and more secure turned out to be the same work.
4. **Pull from registries you control or trust**, with image pull policies that do not silently fall back to stale local copies.

## Common mistakes

1. **NetworkPolicies on a CNI that doesn't enforce them.** The YAML applies cleanly, everyone feels safer, nothing is filtered. Verify enforcement with a test connection that *should* fail.
2. **\`cluster-admin\` as a convenience.** Every standing cluster-admin binding is a standing invitation. Scope it, name it, review it.
3. **Default-deny without DNS egress.** The policies "work" and every lookup fails. Always allow UDP/TCP 53 to your DNS service explicitly.
4. **Enforcing Restricted on day one.** Rejected pods across production, followed by a panicked rollback to no standards at all. Baseline-enforce + Restricted-audit gets you to the same place without the outage.
5. **Service account tokens mounted everywhere.** One flag — \`automountServiceAccountToken: false\` — removes a credential from every pod that never needed it.
6. **Secrets in Git "just for staging."** Staging secrets have a habit of being production secrets. Scan, block, rotate if it already happened.

## FAQ

**Where do I start if the cluster has none of this?**
In this order: inventory RBAC (\`clusterrolebindings\` and \`can-i --list\` for your workloads), turn off automatic token mounting where the API isn't used, then default-deny NetworkPolicies in one staging namespace, and Baseline Pod Security in audit mode cluster-wide. Each step is an afternoon, not a quarter.

**Do NetworkPolicies replace a service mesh or an external firewall?**
No — they cover pod-to-pod traffic inside the cluster at L3/L4. Egress to the internet, L7 rules and identity-based policy are other layers' jobs. NetworkPolicies are the floor, not the whole building.

**Managed Kubernetes (EKS/GKE/AKS) — is this handled for me?**
Partially. The provider secures the control plane and offers defaults, but RBAC bindings, NetworkPolicies, Pod Security labels and your images remain yours. The shared-responsibility line runs right through the middle of this article.

**How do I prove it's working?**
Test negatively: from a frontend pod, try to reach the database and watch it fail; deploy a privileged test pod in a Baseline namespace and watch it get rejected. A control you have never seen block anything is a hope, not a control. For the wider detection picture, see the [Kubernetes observability guide](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026).

## Conclusion

Kubernetes security basics are not a product you buy; they are five defaults you deliberately change: scoped RBAC, no free tokens, a network that denies by default, admission that refuses privileged workloads, and secrets and images handled like they matter. Roll them out namespace by namespace, enforce gradually, and test that each control actually blocks something. A cluster secured that way will not make headlines — which is precisely the point.

*The free [Kubernetes Production Checklist](https://www.devopsenginer.com) (via the newsletter on the homepage) includes the security pre-flight items — RBAC review, token mounting, disruption budgets and rollback paths — alongside the rest of the production readiness checks.*
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Security", "RBAC", "DevSecOps"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "Kubernetes Security Basics in 2026: RBAC, Network Policies and Pod Security That Actually Get Used",
    description: "Kubernetes security basics that actually get implemented: least-privilege RBAC, default-deny NetworkPolicies, Pod Security Standards enforced gradually, disciplined secrets handling and image hygiene \u2014 rolled out namespace by namespace without a big-bang migration.",
    keywords: "Kubernetes security, RBAC, NetworkPolicy, Pod Security Standards, Kubernetes secrets, cluster security 2026"
  }
};
