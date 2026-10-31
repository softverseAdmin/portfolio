// Kubernetes Upgrades in 2026: Minor Versions Without the Downtime or the Drama
export const kubernetesUpgradesBlog = {
  id: 33,
  title: "Kubernetes Upgrades in 2026: Minor Versions Without the Downtime or the Drama",
  slug: "kubernetes-upgrades-guide-2026",
  excerpt: "A routine for Kubernetes upgrades that stays boring: scan for removed APIs with pluto and kubent, back up first, move the control plane one minor version at a time, rotate nodes with surge capacity and PodDisruptionBudgets respected, then verify like a sceptic.",
  content: `
# Kubernetes Upgrades in 2026: Minor Versions Without the Downtime or the Drama

> **TL;DR:** Kubernetes releases three minor versions a year, and each is supported for roughly a year — fall two versions behind and upgrading stops being routine maintenance and becomes a project. Safe upgrades follow a fixed order: check for removed APIs before you touch anything, upgrade the control plane first (one minor version at a time, never skip), then rotate nodes with surge capacity so workloads always have somewhere to land, respecting PodDisruptionBudgets the whole way. The two facts that shape everything: you cannot skip minor versions on the control plane, and there is no downgrade button — your rollback plan is an etcd backup and node images you can still boot. Do the preparation and an upgrade is a boring afternoon. Skip it, and the boring afternoon finds you anyway, at a worse time.

Every cluster is quietly ageing. The Kubernetes release train does not stop because a team is busy, and the gap between "we should upgrade soon" and "our version just went end-of-life" is where upgrade projects turn into incidents. This guide is the upgrade as a routine: the checks, the order, and the traps — written for the person who wants upgrades to be boring.

## The rules of the road

Four constraints govern every upgrade, and planning means accepting them rather than negotiating:

1. **One minor version at a time for the control plane.** Going 1.30 → 1.32 directly is not supported for kube-apiserver. Each step gets applied, verified, and only then does the next begin. (Managed control planes enforce this for you; the steps still happen.)
2. **Version skew is a policy, not a vibe.** The supported combinations are specific: kubelets may be up to three minor versions behind the API server (since 1.28), but never newer than it; \`kubectl\` works within one minor version either way. "It connected" is not the same as "it's supported."
3. **APIs get removed.** Every minor release can retire beta APIs. Workloads still referencing a removed API fail at apply time — or worse, at the moment you need to redeploy during an unrelated incident. This is what the preparation phase exists to catch.
4. **There is no downgrade.** The API server and etcd do not roll back. If an upgrade goes wrong mid-flight, recovery means restoring etcd from backup or rebuilding — which is why backups are step zero, not an afterthought.

## Phase 1: Preparation (where upgrades are actually won)

**Inventory the target.** Read the target version's changelog and the release's "urgent upgrade notes," and check your add-ons against it: ingress controller, CNI, CSI drivers, cert-manager, cluster-autoscaler/Karpenter, metrics-server. Add-on incompatibility breaks more upgrades than Kubernetes itself does — an ingress controller that doesn't support the new version will not announce this until traffic stops.

**Hunt for removed APIs.** Two tools make this mechanical:

\`\`\`bash
# Scans manifests / Helm releases for deprecated and removed APIs
pluto detect-helm -o wide
pluto detect-files -d ./manifests -o wide

# Scans the live cluster for APIs in use that are scheduled for removal
kubent
\`\`\`

Fix every finding by moving to the replacement API (the tools name it) *before* the upgrade window. While you are in there, check the same hygiene for admission webhooks: a dead webhook with \`failurePolicy: Fail\` can block the whole cluster's writes after a control-plane change, so inventory webhooks and know which ones are load-bearing.

**Back up etcd — and know how you'd restore it.** On self-managed clusters, snapshot etcd and copy the snapshot off the node. On managed clusters (EKS, GKE, AKS), the provider handles the control plane, but your *workload state* is your problem: if everything is in Git (see my [Argo CD tutorial](https://www.devopsenginer.com/blog/argo-cd-tutorial-gitops-2026)), the cluster is rebuildable; if it isn't, a volume-level backup tool is your safety net, per the [storage guide](https://www.devopsenginer.com/blog/kubernetes-storage-guide-2026).

**Check cluster health honestly.** Upgrading a cluster that already has failing nodes, Pending pods, or a flapping control plane converts one problem into two. \`kubectl get nodes\`, component statuses, and a look at recent events: fix first, upgrade second.

## Phase 2: Control plane first

With preparation done, the control plane goes first — always. On managed services this is one action per minor version (console, CLI or Terraform), followed by a pause: watch API server availability, controller-manager and scheduler health, and confirm nodes still report Ready before proceeding.

On self-managed clusters with kubeadm, the shape is:

\`\`\`bash
# On the first control-plane node, per minor version:
apt-mark unhold kubeadm && apt-get install -y kubeadm=1.31.x-*   # target version
kubeadm upgrade plan
kubeadm upgrade apply v1.31.x
# Then upgrade kubelet + kubectl on the node and restart kubelet
\`\`\`

\`kubeadm upgrade plan\` is the unsung hero here: it reports component versions, warns about what it can and cannot do, and refuses some genuinely bad ideas. Read its output like a pre-flight checklist, because that is what it is. Repeat for the remaining control-plane nodes with \`kubeadm upgrade node\`.

## Phase 3: Nodes — rotate, don't patch in place

Worker nodes upgrade by replacement wherever possible: bring up a node at the new version, drain an old one, let workloads reschedule, remove the old node. On managed node groups this is the built-in rolling update, with one setting that decides whether it is graceful:

- **Max surge:** allow the group to temporarily run *extra* nodes (e.g. +1 or +33%) during the update. Surge means a drained node's workloads already have a home; without surge, the update cordons a node and hopes capacity suffices — on a tightly packed cluster, it doesn't, and pods sit Pending mid-upgrade. This is the same capacity logic as [autoscaling](https://www.devopsenginer.com/blog/kubernetes-autoscaling-guide-2026): replacement needs somewhere to land.
- **PodDisruptionBudgets are the contract** that makes draining safe: drain respects voluntary-disruption budgets, so a workload with \`minAvailable\` set cannot be fully evicted by an upgrade. Workloads *without* PDBs can be taken to zero by a drain — if that outage would hurt, the PDB was the missing pre-work (Phase 1 again).

The manual shape, when you are rotating nodes yourself:

\`\`\`bash
kubectl cordon <old-node>
kubectl drain <old-node> --ignore-daemonsets --delete-emptydir-data
# wait: confirm every workload is Running elsewhere
kubectl delete node <old-node>   # after the node itself is terminated/replaced
\`\`\`

Watch for the two classic drain blockers: pods with local storage (\`--delete-emptydir-data\` acknowledges losing it — be sure you mean that) and pods whose PDB forbids the eviction, in which case the drain waits, correctly, and you investigate the workload rather than forcing it. \`--force\` exists; reaching for it during an upgrade is how upgrades become incidents.

On self-managed nodes where replacement isn't practical, kubelet upgrades in place: install the new kubelet (and container runtime, checking its own compatibility), restart, verify the node rejoins at the new version within skew policy.

## Phase 4: Verify like you don't trust it (because you shouldn't)

"Upgrade completed" from a console is the beginning of verification, not the end:

1. \`kubectl version\` and \`kubectl get nodes\` — every node at the intended version, all Ready.
2. Core add-ons healthy: DNS resolution from a test pod, ingress serving, metrics flowing (\`kubectl top nodes\`) — the [observability guide](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026) lists the signals worth watching in the hours after.
3. One real deployment: roll a canary workload, confirm scheduling, networking and storage attach all behave.
4. Add-on upgrades you deferred: now is when ingress, cert-manager and friends get their matching bumps, one at a time, while the window is still staffed.

Then leave the cluster alone for a soak period before starting the *next* minor version. One version, one verification, one soak — the rhythm that keeps a three-version catch-up from becoming a single three-version mystery.

## Managed vs self-managed: what actually differs

The order and the rules are identical; only the hands change. Managed services move the control plane for you and offer node-group rotation with surge built in — your job concentrates on Phase 1 (API removals, add-on compatibility) and Phase 4 (verification), which is honestly where the risk always lived. Self-managed adds the kubeadm mechanics and etcd backup duty. In both worlds, the teams that get hurt are hurt by preparation gaps, not by the upgrade command itself.

## Common mistakes

1. **Skipping the removed-API scan.** Everything works until the first redeploy against a removed API — during a different incident, naturally.
2. **Trying to jump two minor versions.** The control plane refuses or, worse, half-applies. One step at a time is not a suggestion.
3. **Zero surge on node rotation.** Drained workloads with nowhere to go; Pending pods; an upgrade window that ends in a rollback of the schedule rather than the version.
4. **No PDBs on important workloads.** Drain takes them to zero, voluntarily, as designed — the design just never got told they mattered.
5. **Upgrading an unhealthy cluster.** Pre-existing node or control-plane faults become upgrade casualties and misdirect the whole investigation.
6. **Forgetting the add-ons.** Kubernetes upgrades fine; the two-year-old ingress controller doesn't. Inventory includes everything with a version number, not just Kubernetes.

## FAQ

**How often should we upgrade?**
Often enough to never be more than one minor version behind the oldest supported release — in practice, most teams settle into upgrading every 2–4 months, which keeps each event small. The cost of upgrading grows with the distance jumped; frequency is the discount.

**Can we skip a version on managed Kubernetes?**
No — the provider performs the same one-minor-at-a-time steps; the console just makes them look like one action. Node groups likewise step through versions.

**What if something breaks mid-upgrade?**
For nodes: stop the rotation, keep workloads on healthy nodes, fix forward or replace the bad node. For the control plane: there is no downgrade, which is why the pre-upgrade etcd snapshot (self-managed) or your Git-backed workload state (everywhere) is the real rollback plan.

**Do workloads need downtime?**
Properly built ones don't: multiple replicas, PDBs, surge capacity and rolling drains mean pods move, not stop. Single-replica workloads without PDBs will have a gap during their node's drain — the upgrade is merely revealing a property the workload always had. The [deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) covers building workloads that survive exactly this.

## Conclusion

A Kubernetes upgrade is a checklist wearing a scary costume: scan for removed APIs, back up, control plane one minor at a time, nodes rotated with surge and PDBs respected, then verify like a sceptic. Run it a few times a year and it shrinks to what it should be — routine maintenance with a beginning, a middle, and an end. Let it slide for a year, and the same work returns wearing its real costume: a project, with a deadline set by an end-of-life date.

*The free [Kubernetes Production Checklist](https://www.devopsenginer.com) (via the newsletter on the homepage) includes the upgrade pre-flight items — health checks, backup verification and disruption budgets — alongside the rest of the production readiness checks.*
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Upgrades", "Operations", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "Kubernetes Upgrades in 2026: Minor Versions Without the Downtime or the Drama",
    description: "A routine for Kubernetes upgrades that stays boring: scan for removed APIs with pluto and kubent, back up first, move the control plane one minor version at a time, rotate nodes with surge capacity and PodDisruptionBudgets respected, then verify like a sceptic.",
    keywords: "Kubernetes upgrade, version skew, kubeadm upgrade, removed APIs, pluto, kubent, cluster upgrade guide 2026"
  }
};
