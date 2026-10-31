// Kubernetes ConfigMaps and Secrets in 2026: Configuration Without Rebuilding Images
export const kubernetesConfigmapsSecretsBlog = {
  id: 34,
  title: "Kubernetes ConfigMaps and Secrets in 2026: Configuration Without Rebuilding Images",
  slug: "kubernetes-configmaps-secrets-guide-2026",
  excerpt: "How Kubernetes configuration actually works in production: ConfigMaps vs Secrets, why base64 is not encryption, env vars vs volume mounts, the External Secrets pattern for keeping values out of Git, and rotation designed before it becomes an emergency.",
  content: `
# Kubernetes ConfigMaps and Secrets in 2026: Configuration Without Rebuilding Images

> **TL;DR:** ConfigMaps hold non-sensitive configuration (feature flags, endpoints, tuning values); Secrets hold sensitive values (passwords, tokens, keys) — with one warning that must be said out loud: a Kubernetes Secret is only base64-encoded, not encrypted, so anyone with API read access to it has the value. Configuration reaches pods two ways — environment variables (simple, but frozen at pod start) and volume mounts (files the kubelet keeps updated, but only for apps that re-read them). The production pattern most teams converge on: keep config in ConfigMaps, keep real secrets in an external vault (AWS Secrets Manager, Vault, and friends) and sync them in with the External Secrets Operator, encrypt etcd at rest, scope access with RBAC, and treat rotation as a designed event, not an emergency. Configuration is where "works in staging" goes to die — this guide makes it boring instead.

Rebuild an image to change a log level once, and you understand why configuration exists as its own discipline. Rebuild one to change a database password during an incident, and you never design config badly again. Kubernetes gives you two objects for this job — ConfigMaps and Secrets — and a decade of teams have learned the same few lessons about them. Here they are, in one place.

## ConfigMaps: the plain-text workhorse

A ConfigMap is key-value data, nothing more exotic:

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  FEATURE_CHECKOUT_V2: "true"
  app.properties: |
    pool.size=20
    pool.timeout=5s
\`\`\`

It can carry simple values and whole files (the \`app.properties\` block above lands as a file when mounted). Creation from files or literals via \`kubectl create configmap\` or your GitOps pipeline — as with everything else on this site, the manifest in Git is the version worth having; ad-hoc \`kubectl\` creates are config drift with extra steps. ConfigMaps are namespace-scoped, capped around 1 MiB, and — importantly — they are *not* a database: hundreds of tiny ConfigMaps are a smell pointing at a config service or a file baked sensibly into the repo, not more objects.

## Secrets: base64 is not encryption (the paragraph to actually read)

A Secret looks like a ConfigMap with \`type: Opaque\` and values that appear encoded:

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:          # write plaintext here; the API server encodes it
  username: app
  password: "s3cr3t-value"
\`\`\`

That encoding is **base64 — a transport format, not protection**. The defences that actually protect a Secret, in the order they matter:

1. **RBAC:** who can \`get\`/\`list\` Secrets in the namespace. Read access to a Secret *is* the secret. This is the control that does the most work, and it is covered properly in the [security basics guide](https://www.devopsenginer.com/blog/kubernetes-security-basics-guide-2026).
2. **Encryption at rest:** etcd stores Secrets; enable envelope encryption (KMS-backed on managed clusters, often a toggle) so a stolen etcd backup doesn't hand over every credential in the cluster.
3. **Not committing plaintext Secrets to Git.** The most violated rule in this entire article. If manifests live in Git — they should — Secrets in plaintext manifests means the Git repo *is* your vault, with Git's access list, clone history and all. The fixes are the next section.

Secret types beyond \`Opaque\` exist for specific consumers (TLS secrets for ingress, docker-registry secrets for image pulls), and those integrate with their consumers directly — an ingress TLS secret, for instance, is the standard way to terminate HTTPS per the [networking guide](https://www.devopsenginer.com/blog/kubernetes-ingress-networking-basics-2026).

## Getting configuration into the pod: env vars vs files

Two delivery mechanisms, with opposite trade-offs:

\`\`\`yaml
    env:
      - name: LOG_LEVEL
        valueFrom:
          configMapKeyRef: { name: app-config, key: LOG_LEVEL }
      - name: DB_PASSWORD
        valueFrom:
          secretKeyRef: { name: db-credentials, key: password }
    volumeMounts:
      - name: config
        mountPath: /etc/app
  volumes:
    - name: config
      configMap: { name: app-config }
\`\`\`

- **Environment variables** are set at container start and *never change for the life of the pod*. Update the ConfigMap and nothing happens until pods restart. Simple, predictable, and the right default for values that shouldn't mutate under a running process anyway.
- **Volume mounts** present the data as files, and the kubelet updates the files when the source changes (within a minute or so, via an atomic symlink swap). But an updated file only matters if the application re-reads it — most don't. So volume-mounted config gives you *eventual files*, not *live reload*, unless the app watches the files (some frameworks do, via the \`..data\` symlink change).

The operational consequence people trip on: **changing a ConfigMap does not roll your Deployment.** If the change must take effect, trigger the rollout (\`kubectl rollout restart\`) — or use the Helm trick of checksumming the config into a pod-template annotation so a config change *is* a template change and rolls automatically, per the [Helm guide](https://www.devopsenginer.com/blog/helm-charts-tutorial-2026). Decide deliberately which behaviour each config deserves; "sometimes it reloads, sometimes not" is the worst of both.

## Secrets in Git, solved properly: external stores and sync

Since plaintext Secrets must not live in Git, but workloads need Secrets in the cluster, the industry converged on one architecture: **the vault is the source of truth; a controller syncs values into the cluster as Secrets.**

The common implementation is the **External Secrets Operator (ESO)**: you commit an \`ExternalSecret\` manifest that contains *references* — no values — and ESO fetches the real values from AWS Secrets Manager, GCP Secret Manager, Azure Key Vault or HashiCorp Vault using the cluster's own cloud identity:

\`\`\`yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef: { name: aws-secrets, kind: ClusterSecretStore }
  target: { name: db-credentials }
  data:
    - secretKey: password
      remoteRef: { key: prod/app/db, property: password }
\`\`\`

What Git shows anyone: that a password exists and where it lives. What it never shows: the password. Rotation happens in the vault; ESO refreshes the Secret; pods pick it up on their next restart (or sooner, for the file-watchers). Alternatives in the same family: the cloud providers' own CSI drivers (mounting secrets as in-memory files, never persisted as API objects at all — arguably the cleanest model) and **Sealed Secrets**, which encrypts values with a cluster key so the ciphertext is safe to commit — simpler than a vault, with key management becoming your job instead. For a small team with no vault yet, Sealed Secrets is a legitimate step; for anything multi-cluster or compliance-flavoured, the external-store pattern wins.

Two hygiene rules whichever route you choose:

- **Different secrets per environment.** The staging credential and the production credential being identical is how a staging compromise becomes a production incident.
- **Audit access.** Secret reads should be logged (CloudTrail on the vault side, API audit logs in-cluster) — per the [observability guide](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026), the time to learn who read a secret is not during the postmortem.

## Rotation: the event you design before it designs you

Credentials rotate — on a schedule if you're organised, during an incident if you're not. A rotation that requires editing manifests in three repos and restarting everything by hand is not a rotation procedure; it's a hope. The designed version:

1. Vault holds the new value alongside the old (most stores support versions; databases can hold two valid users during a transition window).
2. ESO syncs; a controlled rollout restarts pods against the new value (\`kubectl rollout restart\`, staged by [deployment strategy](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) so a bad credential fails a canary, not the fleet).
3. Old value revoked *after* the new one is verified serving traffic.

Notice what this procedure never involves: a human seeing the value, a value in a chat message, or a rebuild. If any of those appear in your rotation story, the design has a hole in it.

## Common mistakes

1. **Plaintext Secrets in Git.** The classic. History keeps them forever, every clone keeps them everywhere. Vault + sync, or sealed ciphertext — those are the options.
2. **Believing base64 is encryption.** It is encoding, readable by anyone in milliseconds. RBAC and etcd encryption are the actual protections.
3. **One giant shared Secret for everything.** Every pod that mounts it can read all of it. Split by consumer: a pod should hold the credentials for its own job and nothing else.
4. **Expecting ConfigMap edits to reload apps.** Env vars never update; mounted files update but apps rarely re-read. Roll the pods, or wire the checksum annotation, deliberately.
5. **The same credentials in every environment** — and in the load-test cluster, and in that old namespace nobody deleted. Scope per environment, per workload.
6. **Config in the image, secrets in the wiki.** Config baked into images forces rebuilds for tuning; secrets documented in shared notes are secrets in name only. Both are the same mistake: the value lives where it isn't managed.

## FAQ

**ConfigMap or Secret for a database URL?**
The URL itself (host, port, database name) is configuration — ConfigMap. The username and password are Secrets. Splitting them is normal and makes rotation cleaner: credentials change without touching the endpoint config.

**How big can a ConfigMap be?**
Around 1 MiB per object (etcd object limits). If your config approaches that, it isn't config anymore — it's data, and it belongs in object storage or a database, mounted or fetched by the app.

**Should pods read config from the API directly instead?**
Almost never. It couples the app to Kubernetes APIs and permissions it shouldn't hold. Env vars and files are the interface; keep the app portable and the cluster's API unexposed to workloads.

**What's the difference between Sealed Secrets and External Secrets?**
Sealed Secrets stores the encrypted value in Git and decrypts it in-cluster — the repo remains the distribution mechanism. External Secrets stores only a reference in Git and fetches the value from a vault at sync time. The vault model scales to rotation, audit and multi-cluster; the sealed model is simpler to adopt. Both beat plaintext.

## Conclusion

Configuration is a design surface, not a chore: ConfigMaps for the values you'd print on a whiteboard, Secrets for the ones you wouldn't, RBAC and etcd encryption as the real protections, a vault with sync as the source of truth, and rotation as a rehearsed procedure. Get those five decisions right and config changes become the least interesting part of your week — which, for anything involving production credentials, is exactly the ambition.

*The free [Kubernetes Production Checklist](https://www.devopsenginer.com) (via the newsletter on the homepage) includes the configuration and secrets pre-flight items — RBAC scoping, backup tests and rotation readiness — alongside the rest of the production readiness checks.*
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Secrets", "Configuration", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "9 min read",
  seo: {
    title: "Kubernetes ConfigMaps and Secrets in 2026: Configuration Without Rebuilding Images",
    description: "How Kubernetes configuration actually works in production: ConfigMaps vs Secrets, why base64 is not encryption, env vars vs volume mounts, the External Secrets pattern for keeping values out of Git, and rotation designed before it becomes an emergency.",
    keywords: "Kubernetes ConfigMap, Kubernetes Secrets, External Secrets Operator, config management, secret rotation 2026"
  }
};
