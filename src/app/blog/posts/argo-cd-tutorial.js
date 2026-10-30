// Argo CD Tutorial 2026: GitOps Deployment Step by Step — Install, Sync, Rollback, and the Mistakes to Avoid
export const argoCdTutorialBlog = {
  id: 17,
  title: "Argo CD Tutorial 2026: GitOps Deployment Step by Step \u2014 Install, Sync, Rollback, and the Mistakes to Avoid",
  slug: "argo-cd-tutorial-gitops-2026",
  excerpt: "Install Argo CD on a learning cluster, deploy a sample app from Git, watch sync and drift happen, break something on purpose, and roll it back the GitOps way \u2014 step by step, with the secrets, prune and self-heal mistakes to avoid.",
  content: `
# Argo CD Tutorial 2026: GitOps Deployment Step by Step — Install, Sync, Rollback, and the Mistakes to Avoid

> ## TL;DR
>
> - **GitOps with Argo CD means one thing:** the desired state of your cluster lives in Git, and Argo CD continuously works to make the cluster match it. If it is not in Git, it is not deployed for long.
> - **Install takes minutes:** create a namespace, apply the official install manifest, and expose the UI via port-forward for learning — do not skip proper ingress and SSO when you move beyond a test cluster.
> - **An Application is just a pointer:** source repo + path + destination cluster/namespace. Get that one YAML right and most of Argo CD clicks into place.
> - **Turn on automated sync carefully:** \`prune\` and \`selfHeal\` are powerful, and they will faithfully delete or revert things you did not mean them to. Start manual, automate once the repo is trustworthy.
> - **Rollback in GitOps is a Git revert,** not an emergency \`kubectl\` edit. Revert the commit, let Argo CD sync the previous state, and your history tells the whole story.
> - **The mistakes that hurt are boring ones:** secrets committed in plain text, one giant repo for every team, ignoring OutOfSync drift until it becomes an incident, and treating the Argo CD admin password like a permanent credential.

My own route into GitOps did not start with a platform team or a grand strategy. My personal projects live on GitHub and deploy via Vercel on push to \`main\` — push, wait, live. That simplicity spoiled me. The first time one of my own projects broke during deployment — my 3D portfolio, failing on upload and deploy in ways that worked fine locally — my "rollback" was the unglamorous one: redeploy the last build I knew was good, then debug offline. It worked, but it exposed the gap: Vercel remembers the previous deployment for me. A Kubernetes cluster does not — unless you give it a system whose whole job is remembering, comparing, and restoring. That system, in my work, has been Argo CD.

This tutorial walks through Argo CD the way I wish someone had walked me through it: install it on a disposable cluster, deploy a sample app from Git, watch sync and drift happen, break something on purpose, and roll it back properly.

## What GitOps actually means (in one page)

GitOps gets described in marketing language so often that the operational core gets lost. Stripped down, it is four habits:

1. **Declarative description:** your workloads are defined as YAML (plain manifests, Helm, or Kustomize) in a Git repository.
2. **Git as the single source of truth:** to change the cluster, you change the repo — usually through a pull request.
3. **Continuous reconciliation:** an agent in the cluster (Argo CD) compares live state to Git state, constantly.
4. **Drift is visible and correctable:** if someone edits the cluster by hand, the difference shows up as OutOfSync — and, with self-heal on, gets reverted.

Notice what is *not* on that list: a CI system pushing \`kubectl apply\` from a pipeline. That pattern works, but it has a blind spot — the pipeline only knows what it applied, not what the cluster looks like *now*. Argo CD's controller lives in the cluster and watches reality continuously. That difference sounds subtle and turns out to be the whole point the first time someone hotfixes a Deployment at 2 a.m. and forgets to tell anyone.

## What you need before you start

- A Kubernetes cluster you are allowed to break. A local kind, minikube, or k3d cluster is ideal for learning; a small managed cluster works too.
- \`kubectl\` configured against that cluster, with permission to create namespaces and cluster-scoped resources (Argo CD's install needs cluster-admin on a learning cluster).
- A Git repository Argo CD can read. For this tutorial, a public sample repo is easiest; private repos come later, with credentials.
- About 30–45 minutes, most of it waiting for pods and thinking.

Argo CD itself is open source and free to run. The cost of GitOps is not licensing — it is the discipline of keeping everything in Git, which is a cost worth being honest about up front.

## Step 1: Install Argo CD

Install into its own namespace using the official manifest. Pinning to a specific release is better practice for real clusters; for a learning cluster, the current stable manifest from the project repo is the common starting point — check the project's releases page and use the latest stable line rather than a random tutorial's pinned version, which may be years old.

\`\`\`bash
# Create the namespace Argo CD will live in
kubectl create namespace argocd

# Install Argo CD from the official manifest
# (--server-side is required: some Argo CD CRDs are too large for the
# client-side apply annotation limit; --force-conflicts is safe on a fresh install)
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Watch the components come up (this takes a few minutes)
kubectl get pods -n argocd -w
\`\`\`

The two extra flags on the install command are not decoration. A few of Argo CD's custom resources are large enough to break the size limit on client-side apply's tracking annotation, so the official install uses server-side apply — and \`--force-conflicts\` simply lets it take ownership of fields on a fresh install, where nothing else owns them yet. If you copy an older tutorial's plain \`kubectl apply\` and hit an annotation-size error, this is why.

Wait until the core components are Running — the API server, repo server, application controller, and Redis are the ones that matter for this tutorial. If a pod is stuck, \`kubectl describe pod\` in the \`argocd\` namespace will almost always tell you whether it is an image pull, a resource limit, or a scheduling problem.

### Get into the UI

For learning, port-forwarding is the honest tool: no ingress, no TLS decisions, no exposure.

\`\`\`bash
# Forward the Argo CD API server (which serves the UI) to your machine
kubectl port-forward svc/argocd-server -n argocd 8080:443
\`\`\`

Open \`https://localhost:8080\` and accept the self-signed certificate warning — expected here, and exactly why this setup is for learning only. The initial admin password is stored in a Secret created during install:

\`\`\`bash
# Read the initial admin password (username is: admin)
kubectl -n argocd get secret argocd-initial-admin-secret \\
  -o jsonpath="{.data.password}" | base64 -d; echo
\`\`\`

Log in, then change that password from the UI (User Info) or the CLI. Treat the initial secret as a one-time bootstrap credential: for anything beyond a learning cluster, delete the \`argocd-initial-admin-secret\` Secret after setting up proper access, and plan on SSO (OIDC) and RBAC rather than shared local accounts. My standing lesson from my Jenkins years applies here too: every capability a tool hands you arrives as something you then own — every plugin, every default, every credential is maintenance with your name on it. The admin password you leave lying around is still yours.

You can also install and use the \`argocd\` CLI, which mirrors most of what the UI does and is what CI systems and scripts tend to use:

\`\`\`bash
# Point the CLI at your port-forwarded server and log in
argocd login localhost:8080 --username admin --insecure

# Sanity check: list applications (empty, for now)
argocd app list
\`\`\`

The \`--insecure\` flag belongs to this local, self-signed setup only. Do not normalise it for real endpoints.

## Step 2: Understand the one resource that matters — the Application

Almost everything you do in Argo CD revolves around a single custom resource: the **Application**. An Application answers three questions:

- **What?** Which repo, which revision, which path (or Helm chart) inside it?
- **Where?** Which cluster, which namespace?
- **How?** Manual or automated sync? Prune resources removed from Git? Revert manual changes automatically?

Here is a minimal, honest Application for a sample app. Save it as \`guestbook-app.yaml\`:

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
\`\`\`

Read it top to bottom and notice how little magic there is. \`source\` points at a folder of plain YAML in a public example repo. \`destination\` says "this cluster, namespace \`guestbook\`." \`CreateNamespace=true\` saves you pre-creating the target namespace by hand. I have deliberately left \`syncPolicy.automated\` **out** for the first run — you will sync manually once, watch it happen, and only then automate. Tutorials that start with full automation teach you to trust a system you have not seen think yet.

## Step 3: Create the app and sync it

\`\`\`bash
# Create the Application in the argocd namespace
kubectl apply -f guestbook-app.yaml

# Watch Argo CD notice it
argocd app get guestbook
kubectl get applications -n argocd
\`\`\`

In the UI, the new application appears as **OutOfSync** — correct, and your first GitOps vocabulary word. OutOfSync does not mean broken; it means "Git and the cluster disagree," which right now they do, because the cluster has nothing and Git has a guestbook.

Sync it:

\`\`\`bash
# Sync: make the cluster match Git
argocd app sync guestbook

# Wait until the app reports Healthy and Synced
argocd app wait guestbook --health --sync
kubectl get pods -n guestbook
\`\`\`

Within a minute or so the guestbook pods should be running and the app should flip to **Healthy / Synced**. That small state change is the entire GitOps loop in miniature: declare, compare, converge. Everything else in Argo CD — projects, RBAC, notifications — is scaffolding around this loop. While you are here, open the application in the UI and click through the resource tree; seeing Deployments, Services, and Pods rendered as a graph owned by one Application is when GitOps stops looking like "CI, but more YAML."

## Step 4: Make a change the GitOps way

Now change something — through Git, not \`kubectl\`. In a real setup this is your own app repo, but the motion is identical for the sample: edit the desired state, commit, push.

The realistic version of this step, on your own repository, looks like:

\`\`\`bash
# In your GitOps/app repo: change the replica count in the manifest
# (e.g. replicas: 1 -> 3 in the Deployment)

git add .
git commit -m "Scale guestbook to 3 replicas"
git push
\`\`\`

Within a few minutes (Argo CD polls Git periodically by default; webhooks make it near-instant on real setups), the application shows OutOfSync again — because you moved the truth. Sync, manually or automatically, and the cluster converges to three replicas.

Contrast this with the habit GitOps replaces: \`kubectl scale\` now, update the YAML later, forget, and discover the truth during an incident three weeks later. It is the cluster-shaped version of my 3D portfolio lesson — redeploying the last known-good build saved me because *something* remembered what "good" was. Git is that memory for a cluster, but only if every change goes through it. Hand-edit around it, and the gaps are where incidents live.

## Step 5: Turn on automation — prune and self-heal, with eyes open

Once manual sync feels boring, automate it. Update the Application:

\`\`\`yaml
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
\`\`\`

Apply the updated Application:

\`\`\`bash
kubectl apply -f guestbook-app.yaml
argocd app get guestbook
\`\`\`

Understand exactly what you just authorised:

- **Automated sync:** Argo CD applies Git changes without asking.
- **\`prune: true\`:** resources removed from Git get deleted from the cluster. Powerful and correct — and unforgiving if you delete the wrong file or point the Application at the wrong path.
- **\`selfHeal: true\`:** manual changes to live resources get reverted to match Git. This is drift correction — and it will also cheerfully undo an emergency hotfix you forgot to commit.

In principle: enable automated sync early, \`selfHeal\` once your team trusts the repo, and \`prune\` only after you have practised a deletion on purpose and watched what happens. Automate the boring convergence first; keep the destructive verbs on a leash until the repo has earned them.

Test self-heal deliberately, once:

\`\`\`bash
# Make a manual change Argo CD did not ask for
kubectl scale deployment guestbook-ui -n guestbook --replicas=1

# Watch Argo CD notice the drift and (with selfHeal on) correct it
argocd app get guestbook
kubectl get deployment guestbook-ui -n guestbook
\`\`\`

Seeing the replica count climb back on its own is the moment drift stops being an abstract word.

## Step 6: Roll back the GitOps way

Sooner or later a change that looked fine in review misbehaves in the cluster. In GitOps, rollback is not a special feature — it is the loop running in reverse, and it starts in Git:

\`\`\`bash
# Find the change you regret
git log --oneline -5

# Revert it as a new commit (history stays honest)
git revert HEAD
git push
\`\`\`

Argo CD sees the new truth — the old configuration — marks the app OutOfSync, and syncs back. Done. No archaeology through pipeline logs, no "which version is actually running," because Git answers both questions.

Argo CD also keeps a deployment history per Application and offers a rollback action in the UI/CLI to a previous synced revision:

\`\`\`bash
# Inspect what Argo CD has synced before
argocd app history guestbook

# Roll back to a specific previous revision ID from that history
argocd app rollback guestbook <REVISION_ID>
\`\`\`

Use history rollback as the emergency lever, and a Git revert as the follow-up — because a UI rollback without a matching Git state leaves the repo and the cluster disagreeing about what truth is, and Argo CD will eventually re-sync *something*. The durable fix is always: make Git say what you want the cluster to be.

There is a habit hiding in this workflow that I only appreciated after moving from engineering into a project manager role. As an engineer, my rollback question was "can we get back?" As a PM, the question is "can we *prove* what changed, who approved it, and when we returned?" A Git history with pull requests answers that in one screen. GitOps, done properly, is an audit trail that happens to also deploy software.

## Argo CD, Flux, or just a pipeline? An honest decision table

I have used Argo CD. I have **not** used Flux in my own work, so I will not pretend to a hands-on comparison — the table below is a decision aid based on each project's documented design, which you should verify before betting a platform on it.

| Question | Argo CD | Flux | CI pipeline + \`kubectl apply\` |
| --- | --- | --- | --- |
| Core model | Central controller + rich web UI | Lightweight controllers, Git-native, no built-in UI dashboard of its own | Pipeline applies manifests on push |
| Drift detection | Continuous, shown in UI as OutOfSync | Continuous, via its controllers/status | None between pipeline runs |
| Who it suits | Teams that want visibility, app-level RBAC, many apps/clusters in one view | Teams that prefer composable, CLI/Git-centric tooling | Small setups where the cluster rarely changes by hand |
| Rollback story | Git revert + sync; app history rollback | Git revert + reconciliation | Re-run pipeline on an older commit |
| Operational weight | One more platform to run (UI, API, repo server, controller) | Lighter footprint, more assembly required | Nothing new to run |
| Learning curve | Gentle start, deep later (projects, RBAC, SSO) | Steeper if your team thinks in UIs | Lowest — until the first drift incident |

The pipeline column deserves respect: it is effectively what my own Vercel-based projects are, and at that scale it is the right answer. GitOps tooling earns its keep when the cluster is shared, long-lived, changed by many hands, or audited — when "what is running and why" needs a provable answer at any moment, not just at deploy time.

## Structuring real repositories without pain

Tutorial repos are one folder. Real estates need a few decisions early:

- **Separate app code from deployment config, usually.** The app repo builds and publishes an image; a GitOps repo holds the manifests referencing image tags/digests. Environment promotion then becomes commits to config, not rebuilds.
- **One Application per deployable unit,** grouped with Argo CD Projects (and ApplicationSets for generated fleets). Avoid one mega-Application pointing at a folder of everything — its syncs, failures, and rollbacks all become mega too.
- **Environments as overlays, not copies.** Kustomize overlays or per-environment Helm values files beat copy-pasted directories that drift apart — drift in your *source* is as corrosive as drift in the cluster.
- **Pin revisions deliberately.** \`targetRevision: HEAD\` is fine for learning, risky for production. Tags or digests give you a promotion story a human can narrate.

## Secrets: the section you may not skip

Plain-text secrets in Git are the fastest way to turn a tidy GitOps repo into an incident report. Argo CD does not solve secrets for you; it gives you integration points, and you must choose one: an **external secret store** (a cloud secrets manager or Vault) synced into the cluster by an operator, so Git holds references, not values; a **sealed/encrypted-in-Git** approach, where the committed blob is safe and only the cluster can decrypt it; or **SOPS-style encryption** in the repo workflow.

Whichever you choose, choose it *before* the first real application, because retrofitting secrets handling across forty Applications is nobody's favourite quarter. And never paste a decrypted secret into a values file "just for this deploy" — temporary exceptions in Git become permanent history, literally, in the commit log.

## Common mistakes

1. **Committing plain-text secrets.** See above. Once pushed, assume the secret is compromised; rotation, not deletion of the commit, is the fix.
2. **Starting with \`prune\` and \`selfHeal\` on everything.** Automation amplifies whatever state your repo discipline is in. Earn the destructive settings.
3. **Hand-editing the cluster "just this once."** With self-heal it gets reverted mid-incident; without it, it becomes invisible drift. Edit Git, even in a hurry — a fast direct commit beats an untracked hotfix.
4. **One repository and one Application for the whole company.** Blast radius is an architecture decision. Projects, namespaces, and per-team Applications exist so one team's bad commit is one team's bad day.
5. **Ignoring OutOfSync as background noise.** A permanently yellow app trains everyone to ignore the dashboard, and the day it matters, nobody looks. Healthy estates treat persistent drift as a bug with an owner.
6. **Leaving the bootstrap admin as the only login.** Set up SSO/OIDC and RBAC early; delete the initial-admin secret; give humans named accounts and teams read-only by default.
7. **Syncing production straight from \`HEAD\` with no promotion step.** Your repo layout is your release process. If \`main\` equals production, every merge is a release — say so out loud and decide if that is really the policy.
8. **No resource limits and no health checks on your apps.** Argo CD reports health from Kubernetes state; an app with no readiness probe can look "Healthy" while serving nothing. GitOps cannot fix observability you never built.

## FAQ

**Is Argo CD free?**
Yes — Argo CD is an open-source, CNCF-graduated project you run in your own cluster. Your costs are the cluster resources it consumes and your team's time. Managed/enterprise offerings built around it exist from various vendors; check current offerings and pricing directly if you need one, as they change.

**Argo CD or Flux — which should I pick?**
Pick based on how your team works, not feature bingo. If you want a strong UI, application-centric visibility, and built-in RBAC, Argo CD is the natural first trial. If you prefer a lighter, more composable set of controllers driven entirely through Git and CLI, evaluate Flux seriously. I use Argo CD; I have not run Flux myself — so trial both on a throwaway cluster before committing, and re-check each project's current documentation, because both projects evolve.

**Does Argo CD replace CI?**
No. CI still builds, tests, and publishes your image. Argo CD takes over from "an image/config exists" to "the cluster matches Git." A common shape: CI updates an image tag in the GitOps repo, Argo CD does the rest.

**What is the difference between sync and apply?**
\`kubectl apply\` is a one-time push: it sends manifests and forgets. An Argo CD sync is convergence by an agent that keeps watching afterwards — comparing, reporting health, and (if configured) correcting drift. The ongoing watching is the product.

**How do I roll back if Git itself is the problem — a bad revert or a broken repo?**
Argo CD's application history rollback can return the cluster to a previously synced state while you repair the repo. Then fix Git to match that state, so the next reconciliation does not undo your rescue.

**Can Argo CD manage multiple clusters?**
Yes — external clusters can be registered and targeted as Application destinations, which is one reason teams centralise on it. Treat each added cluster as a trust and credentials decision, not just a config line, and scope Projects/RBAC per team and destination.

## Conclusion

The loop you built in this tutorial — declare in Git, let the controller converge the cluster, watch drift instead of discovering it, roll back by reverting — is the whole GitOps philosophy, and it scales from one guestbook to a fleet without changing its shape.

Start the way this tutorial did: a disposable cluster, manual sync, one small app, a deliberate breakage, a clean revert. Turn on automation in the order your trust grows — sync, then self-heal, then prune. Keep secrets out of plain text, keep the admin bootstrap temporary, and keep every change flowing through the same door: a commit.

My portfolio taught me the value of a known-good previous state the expensive way — by needing one I had to reconstruct by hand. GitOps is simply refusing to ever reconstruct it again: the previous state is a commit, the current state is a commit, and the cluster is just Git, rendered.

**Related reading on this site:**
- [GitOps vs Traditional CI/CD](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison) — the delivery-model decision behind this tutorial.
- [Kubernetes Deployment Strategies](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) — rolling, canary, and blue-green, and where Argo Rollouts fits.
- [Self-Healing Infrastructure in Kubernetes](https://www.devopsenginer.com/blog/self-healing-infrastructure-2025) — probes, autoscaling, and automated remediation beyond sync.
  `,
  featuredImage: "/images/blog/gitops-vs-traditional-cicd-2025-comparison/gitops-cicd-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Argo CD", "GitOps", "CI/CD", "DevOps"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "19 min read",
  seo: {
    title: "Argo CD Tutorial 2026: GitOps Deployment Step by Step \u2014 Install, Sync, Rollback, and the Mistakes to Avoid",
    description: "Install Argo CD on a learning cluster, deploy a sample app from Git, watch sync and drift happen, break something on purpose, and roll it back the GitOps way \u2014 step by step, with the secrets, prune and self-heal mistakes to avoid.",
    keywords: "Argo CD tutorial, GitOps tutorial, Argo CD install, Kubernetes GitOps, Argo CD sync, GitOps rollback, DevOps 2026"
  }
};
