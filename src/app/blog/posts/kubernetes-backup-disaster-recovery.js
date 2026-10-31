// Kubernetes Backup and Disaster Recovery in 2026: Backups You Have Actually Restored
export const kubernetesBackupDrBlog = {
  id: 39,
  title: "Kubernetes Backup and Disaster Recovery in 2026: Backups You Have Actually Restored",
  slug: "kubernetes-backup-disaster-recovery-guide-2026",
  excerpt: "A working guide to Kubernetes backup and disaster recovery: why HA is not backup, the three layers to protect, RPO and RTO, Velero schedules with CSI snapshots and file-system backup, database consistency, and restore drills that prove recovery works.",
  content: `
# Kubernetes Backup and Disaster Recovery in 2026: Backups You Have Actually Restored

> **TL;DR:** High availability is not backup. A three-replica Deployment survives a node failure, but \`kubectl delete namespace\` deletes all three replicas just as happily, and no amount of HA brings back a dropped database. Real protection has three layers — cluster resources, persistent volume data, and the things that live outside the cluster — plus a restore you have actually performed and timed. Velero is the standard open-source tool for the first two layers. The work is not installing it; the work is proving, on a schedule, that a restore produces a working application.

## The problem: Kubernetes feels safer than it is

Kubernetes heals. Kill a pod and it comes back. Lose a node and workloads reschedule. This self-healing is real — and it quietly convinces teams they are protected against data loss, which is a different thing entirely.

Self-healing protects against *failures of the machinery*. Backups protect against *everything else*: an engineer deleting the wrong namespace, a bad migration dropping a table, a compromised account wiping resources, a storage failure corrupting a volume, a cloud account problem taking the whole region's control plane with it. In every one of those cases, the cluster faithfully heals itself into the new, broken state. The disaster is not that Kubernetes stops working — it is that it keeps working, on empty data.

The second misconception: "etcd is backed up, so we are covered." On a self-managed cluster, an etcd snapshot captures cluster state — the resource definitions. It does not contain the bytes inside your PersistentVolumes, and restoring it is a cluster surgery procedure, not an application recovery. On managed services (EKS, GKE, AKS) you cannot snapshot etcd at all — the provider runs it — which settles the question: your backup strategy lives at the resource and volume level whether you chose it or not.

## What actually needs protecting: three layers

1. **Cluster resources.** Deployments, Services, ConfigMaps, Secrets, RBAC, NetworkPolicies — the declarative state. Cheap to back up (it is text in etcd), and the layer GitOps already half-covers: if everything is applied from Git, Git is a backup of intent, though not of generated state like Secrets created by operators or resources created by controllers.
2. **Persistent data.** The contents of PersistentVolumes: databases, uploaded files, queues on disk. This is the layer that hurts to lose and the layer most "we ran a backup tool once" setups quietly miss, because resource backup and volume backup are separate switches.
3. **Outside the cluster.** Container images (a registry that garbage-collects the tag you need is a DR failure), external databases and queues, DNS, certificates, and the cloud resources the cluster depends on — IAM roles, load balancer config, the object storage bucket your backups land in. A restore plan that discovers a missing layer at 3 a.m. is not a plan.

Backups also need their own threat model: they must survive the loss of the cluster *and* the loss of the account or credentials that administer it. Backup data stored only in the same account, deletable by the same compromised credential, is a copy, not a backup. Cross-account or cross-region copies with separate retention are the grown-up version.

## Two numbers that decide the design: RPO and RTO

Before tooling, two definitions do all the real work:

- **RPO (recovery point objective):** how much data you can afford to lose, measured in time. Hourly backups mean up to an hour of data loss. If the business answer is "five minutes", nightly volume snapshots are the wrong tool no matter how reliable they are — you need replication or database-native continuous backup.
- **RTO (recovery time objective):** how long the business tolerates being down while you restore. This is the number restore tests measure, and it includes everything: provisioning a cluster, restoring resources, restoring data, DNS, verification. Teams routinely discover their restore takes six hours against a one-hour RTO — better discovered in a drill than in an incident.

Write both numbers down per application tier. They turn backup arguments ("should we also snapshot the volumes?") into arithmetic.

## Layer 1 + 2 with Velero: the working setup

Velero is the standard open-source tool for Kubernetes backup: it copies cluster resources to object storage and, when asked, snapshots or copies the data inside PersistentVolumes. Two facts shape every Velero setup: backups land in **object storage outside the cluster** (S3, GCS, Azure Blob, or S3-compatible), and volume data needs an explicit choice — it is not automatic.

Install against your provider's plugin (AWS shown; bucket and credentials are placeholders):

\`\`\`bash
velero install \\
  --provider aws \\
  --plugins velero/velero-plugin-for-aws \\
  --bucket my-cluster-backups \\
  --secret-file ./credentials-velero \\
  --backup-location-config region=ap-northeast-1 \\
  --use-node-agent
\`\`\`

\`--use-node-agent\` deploys the agent that performs file-system-level volume backups — needed for the second volume option below.

There are two ways Velero captures volume data:

- **CSI snapshots** — the storage driver snapshots the volume (on EKS, an EBS snapshot). Fast, storage-native, and the right default where the CSI driver supports snapshots. Since Velero 1.15 the CSI integration is built in rather than a separate plugin.
- **File-system backup** — Velero copies the files out of the volume through the node agent (Kopia under the hood in current releases). Slower, but works on storage with no snapshot support and produces data that lives in the same object storage as the resource backup, which simplifies cross-cluster restores.

A scheduled backup of one namespace, with volume snapshots, is one object:

\`\`\`yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: shop-daily
  namespace: velero
spec:
  schedule: "0 2 * * *"
  template:
    includedNamespaces:
      - shop
    snapshotVolumes: true
    ttl: 720h
\`\`\`

And the manual equivalents you will use in drills:

\`\`\`bash
velero backup create shop-drill --include-namespaces shop --snapshot-volumes --wait
velero restore create --from-backup shop-drill --namespace-mappings shop:shop-restore
velero backup describe shop-drill      # check phase: Completed, and read the warnings
\`\`\`

Restoring into a *different* namespace (the \`--namespace-mappings\` above) is the drill pattern: the original workload keeps running while you prove the copy works.

## The consistency problem: volumes are crash copies

A volume snapshot taken under a running database is a crash-consistent copy — equivalent to pulling the plug. Most databases recover from that on startup, which is why the pattern usually works, but "usually" is doing heavy lifting. For the workloads where consistency matters, you have three honest options:

- **Backup hooks.** Velero can run a command in a pod before or after the snapshot (annotations on the pod template) — the classic pattern is freezing or flushing the database (for example \`fsfreeze\` or a database-specific lock) for the seconds the snapshot takes.
- **Database-native backup.** For a critical PostgreSQL or MySQL, the serious answer is often the database's own tooling — WAL archiving / point-in-time recovery — with Velero protecting the manifests and configuration around it. Point-in-time recovery also beats any snapshot schedule on RPO.
- **Quiesce the workload.** Scale to zero, snapshot, scale back. Only acceptable where a maintenance window exists — but for small internal systems it is the simplest correct answer.

Pick per workload, and write the choice down next to the RPO it achieves. The failure mode is assuming the default (crash-consistent) covers the database it does not.

## The GitOps shortcut, and its limits

If your manifests live in Git and Argo CD (or equivalent) applies them, layer 1 mostly restores itself: point a new cluster at the repo and the workloads reappear. This is a genuine DR advantage of GitOps — the Argo CD guide in this series covers the setup. But know exactly what Git does *not* contain: Secrets (usually stored encrypted or externally — your restore needs the key material, e.g. the Sealed Secrets private key, or the external secret store), data created inside the cluster, and resources generated by operators. The standard production answer is both: GitOps for the declarative layer, Velero for the generated state and the volume data.

## Prove it: restore drills are the actual product

Every guide in this series lands on the same principle — an untested control is a rumour — and backups are where it matters most, because backup failures are silent. Velero will happily report schedules running while the bucket policy expired months ago. The only verification that counts is a restore.

A workable drill rhythm:

1. **Monthly:** restore last night's backup of one real namespace into a scratch namespace on the same cluster. Verify the application answers, data row counts match expectations, and record how long it took — that number is your honest RTO for that tier.
2. **Quarterly:** restore into a *different* cluster (the migration path). This catches the things intra-cluster restores never touch: missing CRDs, storage class names that differ, image pull secrets, ingress differences.
3. **Always:** alert on backup failure, not just on schedule age. Wire backup status into the same observability stack as everything else — the observability guide in this series is where the backup metrics and alerts belong.

Notice what the drill produces beyond safety: a measured restore time, a list of missing pieces fixed while nothing was on fire, and a team that has performed the procedure before the night it counts.

## Common mistakes

- **Backing up resources and calling volumes done.** \`snapshotVolumes\` off (or no file-system backup configured) means your backup is the recipe, not the meal. Check a backup's contents, not just its green status.
- **Backups in the blast radius.** Same account, same credentials, no versioning or retention lock on the bucket: one compromise deletes production and its backups in the same session.
- **No TTL / no cost control.** Snapshots accumulate forever; the storage guide in this series covers the orphaned-snapshot problem from the cost side. Every schedule needs a \`ttl\`.
- **Secrets that cannot be restored.** The backup contains the Sealed Secrets resources but the cluster that sealed them is the one that died. Keep the unsealing keys in the DR plan, stored outside the cluster.
- **Restoring everything at once.** A full-cluster restore recreates namespaces in dependency order whether you plan it or not — and load balancers, ingress and DNS fight you on the way. Restore per-application, most critical first; that ordering *is* the RTO plan.
- **One backup tool for the database it cannot help.** Crash-consistent volume copies of a busy database, with no hooks and no native backup, presented as a DR strategy.
- **Testing backups by reading their status.** Green "Completed" is Velero's opinion. The restore is the test.

## Where this fits in the series

Backup is the layer underneath several earlier guides: the storage guide explains the volumes being protected, the upgrades guide's blue/green cluster pattern is a restore-shaped procedure (and the quarterly cross-cluster drill doubles as upgrade rehearsal), the observability guide is where backup success and failure get monitored, and the network policies and security-basics guides cover the access control that keeps backup credentials and buckets out of an attacker's reach. Recovery is not a feature you add at the end; it is the property the rest of the stack is for.

## FAQ

**Does Velero back up etcd?**
No — deliberately. Velero works at the API level, copying resources and volume data; etcd snapshots are a separate, control-plane procedure for self-managed clusters. Velero's model also restores into a cluster running a different Kubernetes version, which an etcd restore cannot do.

**We run GitOps. Do we still need Velero?**
Yes, for the parts Git cannot see: volume data, generated resources, and in-cluster state. GitOps shrinks the restore problem; it does not remove it.

**How often should backups run?**
As often as your RPO demands, minus honesty about restore cost: a common shape is daily schedules with a 30-day TTL for general namespaces, more frequent (or database-native continuous backup) for the tier whose RPO is measured in minutes. More schedules than that mostly buy storage cost.

**Is a second cluster in another region enough — active-active instead of backup?**
Replication solves some RPO problems and no deletion problems: a replicated \`kubectl delete\` is a deletion in two regions. Multi-cluster setups still need backups, and most teams should get backups plus practiced restores working before paying for a second always-on cluster.

**Can Velero migrate between clusters?**
Yes — backup on one cluster, restore on another is a first-class workflow, and the standard way to move workloads during a cluster rebuild or the blue/green upgrade pattern. That dual use is another reason the quarterly drill pays off: it rehearses two procedures at once.
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Backup", "Disaster Recovery", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "11 min read",
  seo: {
    title: "Kubernetes Backup and Disaster Recovery in 2026: Backups You Have Actually Restored",
    description: "A working guide to Kubernetes backup and disaster recovery: why HA is not backup, the three layers to protect, RPO and RTO, Velero schedules with CSI snapshots and file-system backup, database consistency, and restore drills that prove recovery works.",
    keywords: "Kubernetes backup, Velero backup, disaster recovery Kubernetes, etcd snapshot, CSI snapshot, RPO RTO, restore drill 2026"
  }
};
