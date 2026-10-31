// Amazon EKS in 2026: Managed Kubernetes on AWS, Explained for Working Engineers
export const amazonEksBlog = {
  id: 37,
  title: "Amazon EKS in 2026: Managed Kubernetes on AWS, Explained for Working Engineers",
  slug: "amazon-eks-guide-2026",
  excerpt: "A working engineer's guide to Amazon EKS: what AWS manages and what it doesn't, node choices (managed groups, Fargate, Karpenter), VPC networking with pod IPs, Pod Identity for per-workload IAM, the production add-on load-out, upgrades and the real cost shape.",
  content: `
# Amazon EKS in 2026: Managed Kubernetes on AWS, Explained for Working Engineers

> **TL;DR:** EKS gives you a managed Kubernetes control plane and leaves everything else — nodes, networking shape, IAM wiring, add-ons — as your design decisions. The choices that matter: nodes come as managed node groups (the sensible default), self-managed groups (when you need control), or Fargate (serverless pods, with real constraints); Karpenter increasingly replaces static groups for teams that want nodes to follow demand. Networking runs on your VPC — pods get real VPC IPs from your subnets, which makes the [VPC design](https://www.devopsenginer.com/blog/aws-vpc-guide-2026) a Kubernetes decision. IAM meets Kubernetes through Pod Identity (the current, simpler answer to "how does this pod get AWS permissions"), and the cluster is only production-shaped once the add-ons land: EBS CSI for storage, the Load Balancer Controller for ingress, external-dns and cert-manager for the public face. What EKS removes is the control plane burden. Everything in the rest of this series still applies — it just runs on AWS now.

Most teams choosing EKS are not really choosing Kubernetes — they already know it. They are choosing to stop operating a control plane. What surprises them is how much remains theirs: EKS is managed Kubernetes, not managed *everything*, and the gap between "cluster created" and "cluster production-ready" is a series of decisions this guide walks through.

## What AWS manages, and what it pointedly does not

AWS runs the control plane — API servers and etcd across multiple AZs, patched and highly available — and charges a flat per-cluster hourly fee for it. That is the entire managed surface. **Nodes are your EC2 instances** (or Fargate tasks), the VPC is yours, IAM is yours, and the add-ons that make a cluster useful are yours to install and maintain. Understanding this boundary prevents the most common EKS disappointment: expecting an app platform and receiving excellent infrastructure primitives.

Cluster creation itself (eksctl, Terraform, console) is the easy afternoon. The decisions below are the ones with consequences.

## Nodes: three ways to run pods, and a fourth that changes the question

**Managed node groups** — AWS handles the EC2 lifecycle (provisioning, AMI updates, draining on termination) behind a group definition: instance type, size range, subnets, labels. This is the default recommendation: boring, supported, and sufficient for most clusters.

**Self-managed node groups** — you own the Auto Scaling group and the bootstrap. Justified by custom AMIs, unusual instance configuration, or requirements the managed path doesn't expose. You also own every patch and every upgrade chore — the [upgrades guide](https://www.devopsenginer.com/blog/kubernetes-upgrades-guide-2026) applies with extra steps.

**Fargate** — no nodes at all: each pod runs in an isolated micro-VM with a per-pod price. The constraints are the fine print: no DaemonSets, no persistent volumes beyond EFS, pod sizes from a fixed menu, and startup latency that batch and CI workloads forgive and latency-sensitive services don't. Excellent for spiky, stateless, low-count workloads; a poor default for a whole cluster.

**Karpenter** — the open-source autoscaler from AWS that increasingly replaces static groups and the cluster-autoscaler pattern: it watches pending pods and launches *right-sized* instances (type, family, AZ chosen per workload) in under a minute, then consolidates under-used nodes away. For clusters whose demand moves — most clusters — Karpenter is where the [autoscaling story](https://www.devopsenginer.com/blog/kubernetes-autoscaling-guide-2026) lands on AWS, and its cost effect is the rare one that shows up on the bill uninvited, in the good direction.

## Networking: your VPC is the cluster network

EKS uses the AWS VPC CNI by default, which means **pods receive real IP addresses from your VPC subnets**. The consequences are pleasant (pods are first-class network citizens; security groups can even attach per-pod) and constraining (pod density per node is limited by ENI/IP capacity, and subnet IP space is a real planning input — small subnets plus big clusters is a known way to run out of addresses). Prefix delegation raises pod density substantially where needed. This is why the subnet sizing in the VPC guide leaned generous: Kubernetes spends IP addresses like it means it.

The public face of the cluster is the **AWS Load Balancer Controller**: annotate an Ingress or Service and it provisions an ALB/NLB with target groups wired to your pods — the AWS-native version of the [ingress patterns](https://www.devopsenginer.com/blog/kubernetes-ingress-networking-basics-2026) covered earlier. Add **external-dns** (Route 53 records follow your ingresses automatically) and **cert-manager** with ACM or Let's Encrypt, and "deploy an app, get a public HTTPS URL" becomes the paved road rather than a manual ritual.

## IAM inside the cluster: Pod Identity is the current answer

Pods need AWS permissions — read this bucket, publish to that queue — and the cardinal rule is unchanged from everywhere else in AWS: **per-workload roles, never node-wide credentials.** A node role big enough for every pod on the node is a privilege-escalation welcome mat, per the [IAM least-privilege guide](https://www.devopsenginer.com/blog/aws-iam-least-privilege-guide-2026).

EKS has had two mechanisms. **IRSA** (IAM Roles for Service Accounts) works via OIDC and annotations and remains everywhere in existing clusters. **EKS Pod Identity** is the newer, simpler successor: associate an IAM role with a service account through the EKS API, an agent on the node handles credentials, and the annotation archaeology of IRSA goes away. New clusters should start on Pod Identity; existing ones can run both while migrating. Either way, the *design* is identical: one role per workload, scoped to the resources that workload touches, with the cluster components (CSI driver, LB controller, Karpenter, external-dns) each holding their own deliberately-sized roles.

## The add-ons that make it production-shaped

A fresh EKS cluster is deliberately minimal. The standard load-out, whether installed as EKS add-ons or via Helm/Argo CD:

- **EBS CSI driver** — without it, PersistentVolumes on EBS don't exist; the [storage model](https://www.devopsenginer.com/blog/kubernetes-storage-guide-2026) (gp3 classes, Retain policies, snapshots) hangs off this driver on AWS.
- **AWS Load Balancer Controller** — ingress and services, as above.
- **CoreDNS and kube-proxy** — shipped as EKS add-ons; keep their versions in step with cluster upgrades rather than discovering skew during one.
- **Metrics and logs** — metrics-server or the Prometheus stack for the [observability baseline](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026), plus a log route (Fluent Bit to CloudWatch Logs or your aggregator). A cluster nobody can see into is a cluster on borrowed time.
- **Cluster access** — modern EKS uses *access entries* (API-based authentication mapping IAM principals to Kubernetes permissions), replacing the hand-edited \`aws-auth\` ConfigMap that caused a generation of "I locked everyone out of the cluster" incidents. Whoever provisions the cluster should set access policy deliberately on day one; the creator-admin trap (only the creating identity can administer, ever) is an old rite of passage best skipped.

Everything after installation is the standard Kubernetes operating model — [GitOps delivery](https://www.devopsenginer.com/blog/argo-cd-tutorial-gitops-2026), [progressive rollouts](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide), [security basics](https://www.devopsenginer.com/blog/kubernetes-security-basics-guide-2026). EKS changes the substrate, not the discipline.

## Upgrades and cost: the two recurring appointments

**Upgrades** follow the standard Kubernetes rhythm with AWS holding the control-plane end: you trigger the control-plane upgrade one minor version at a time, then roll node groups (or let Karpenter drift-replace nodes onto the new AMI), then bump add-ons. Support windows matter here: standard support for a Kubernetes version on EKS runs about 14 months from its EKS release, with paid extended support beyond — the calendar in the upgrades guide applies verbatim.

**Cost** has three components people chronically under-model: the per-cluster control-plane fee (multiplied by every forgotten dev cluster — see the [Kubernetes cost guide](https://www.devopsenginer.com/blog/kubernetes-cost-optimization-guide-2026) for why cluster sprawl is the quiet line item), the nodes themselves (where Karpenter's right-sizing and consolidation do real work, plus Spot for fault-tolerant capacity), and the AWS perimeter — NAT gateways, load balancers and data transfer that the VPC design decided before the cluster existed.

## Common mistakes

1. **Expecting a platform.** EKS is infrastructure with a managed control plane. Teams that budget zero platform work discover the add-on, IAM and networking decisions arriving anyway, unscheduled.
2. **The node role that does everything.** One broad role for the node group means every pod inherits it. Per-workload identity via Pod Identity is the entire fix, and it's cheap.
3. **Subnets sized for the demo.** Pods consume VPC IPs directly; small subnets cap cluster growth in a way that surfaces mid-incident. Size for the cluster you expect, with the VPC's spare range held back.
4. **aws-auth archaeology.** Hand-editing the access ConfigMap (on clusters still using it) locks teams out with one typo. Prefer access entries; if you must edit aws-auth, do it from a session that stays open until a second login is verified.
5. **Add-ons drifting behind the cluster version.** CSI and LB controller versions have compatibility windows; treat add-on upgrades as part of the cluster upgrade runbook, not a separate someday.
6. **A cluster per team per environment, forever.** The per-cluster fee plus duplicated add-ons and perimeter makes sprawl a budget line. Consolidate with namespaces and per-team IAM where isolation requirements genuinely allow it — and keep dedicated clusters where they don't (compliance, blast radius), knowingly.

## FAQ

**EKS vs self-managed Kubernetes on EC2?**
Self-managed gives total control and total responsibility: control-plane HA, etcd backups, and patching are yours. EKS removes exactly that layer for a flat fee. Teams choose self-managed for specific control or cost-at-scale reasons; everyone else is buying back their weekends with EKS, correctly.

**EKS vs ECS Fargate?**
If the team knows Kubernetes or needs its ecosystem (Helm charts, operators, the tooling in this series), EKS. If the need is "run these containers on AWS with minimal concepts," ECS is simpler and entirely respectable. The honest test is which ecosystem your hiring, tooling and existing workloads already speak.

**Can I run a cluster with no managed node groups at all?**
Yes — Fargate-only clusters exist and suit small, spiky, stateless estates. The DaemonSet and storage constraints decide for most teams; mixed setups (node groups for the baseline, Fargate for burst jobs) are common.

**How many clusters should we have?**
Fewer than instinct suggests, more than one for anything serious: separate production from non-production at minimum. Beyond that, let blast radius, compliance boundaries and team autonomy argue it out — with the per-cluster and perimeter costs on the table while they do.

## Conclusion

EKS is a trade stated plainly: AWS operates the control plane; you keep the architecture. Choose node strategy deliberately (managed groups by default, Karpenter when demand moves), design the VPC like the cluster depends on it — because it literally runs on it — wire IAM per workload with Pod Identity, and install the add-ons that turn a cluster into a platform. Do those things and EKS delivers what it promises: Kubernetes without the control-plane pager. The rest of running Kubernetes well is, as ever, on you — and it's what the other fifteen parts of this series are for.

*The free [Kubernetes Production Checklist](https://www.devopsenginer.com) (via the newsletter on the homepage) includes the production-readiness items this guide builds toward — access, backups, observability and upgrade readiness.*
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "AWS", "EKS", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "Amazon EKS in 2026: Managed Kubernetes on AWS, Explained for Working Engineers",
    description: "A working engineer's guide to Amazon EKS: what AWS manages and what it doesn't, node choices (managed groups, Fargate, Karpenter), VPC networking with pod IPs, Pod Identity for per-workload IAM, the production add-on load-out, upgrades and the real cost shape.",
    keywords: "Amazon EKS, managed Kubernetes, Karpenter, EKS Pod Identity, VPC CNI, EKS add-ons, EKS guide 2026"
  }
};
