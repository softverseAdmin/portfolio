// kubectl Commands Cheat Sheet (2026): The Commands DevOps Engineers Actually Use
export const kubectlCheatSheetBlog = {
  id: 16,
  title: "kubectl Commands Cheat Sheet (2026): The Commands DevOps Engineers Actually Use",
  slug: "kubectl-commands-cheat-sheet-2026",
  excerpt: "A working kubectl cheat sheet organised by the job you're doing \u2014 getting information, deploying and rolling out, debugging a broken pod, reading logs and events, handling ConfigMaps and Secrets safely, scaling, switching contexts, and cleaning up \u2014 plus the commands that bite, with the warnings nobody puts in the tutorials.",
  content: `
# kubectl Commands Cheat Sheet (2026): The Commands DevOps Engineers Actually Use

> **TL;DR**
> - Nobody uses all of kubectl. Working engineers cycle through maybe thirty commands, organised by the job in front of them: look, deploy, debug, clean up. This cheat sheet is organised the same way — by job, not alphabetically.
> - The three habits that prevent most kubectl accidents: check your **context** before you type, use **\`--dry-run\` and \`diff\`** before you apply, and treat **\`delete\`, \`drain\` and \`--force\`** as loaded tools (there is a whole section on the commands that bite).
> - Secrets get their own safety rules: base64 is **encoding, not encryption**, and \`--from-literal\` leaves values in your shell history. The safe patterns are in the ConfigMaps and Secrets section.
> - Every command here is current, modern kubectl — no removed flags, no deprecated generators, no \`kubectl run\` tricks from 2018 tutorials.

Kubernetes is part of my working stack, and kubectl is the tool I reach for when I need to know what a cluster is actually doing — as opposed to what the YAML says it should be doing. My own side projects deploy through GitHub and Vercel, so I will not pretend my personal infrastructure runs on Kubernetes; it doesn't. But the command set below is not a tutorial sampler. It is the working set: the commands that answer questions, ship changes, and get you out of trouble, in roughly the order a real day demands them.

One principle before the commands: **kubectl is a loaded tool pointed at whatever your current context says.** Half of safe kubectl use is knowing where you are aiming. The other half is preferring commands that show you what will happen — \`diff\`, \`--dry-run\`, \`describe\` — before commands that make it happen.

## First, three habits that prevent most accidents

\`\`\`bash
# Which cluster and user am I acting as RIGHT NOW?
kubectl config current-context

# Which namespace does this context target by default?
kubectl config view --minify --output 'jsonpath={..namespace}'; echo

# Am I even connected to a healthy API server?
kubectl cluster-info
\`\`\`

Run the first one every time you open a new terminal. Engineers rarely break production with an exotic command; they break it with an ordinary command in the wrong context. The sections below assume you have checked.

## 1. Get information: see what the cluster is doing

This is the section you will live in. Reading is free and safe, so get fluent here first.

\`\`\`bash
# Everything in the current namespace (pods, services, deployments...)
# Note: "all" is not literally all — ConfigMaps, Secrets, Ingresses and
# PVCs are not included. List those types explicitly when you need them.
kubectl get all

# Pods with node and IP columns — your first stop for "where is it running?"
kubectl get pods -o wide

# Pods in every namespace
kubectl get pods -A

# Pods in one namespace, filtered by label
kubectl get pods -n production -l app=api

# Watch pods change state live (deployments, crashes, terminations)
kubectl get pods -w

# Oldest or newest first
kubectl get pods --sort-by=.metadata.creationTimestamp

# Full detail on one object: spec, status, and the Events section at the
# bottom — the single most useful debugging command in this whole list
kubectl describe pod <pod-name> -n production

# The same for a workload controller
kubectl describe deployment <name> -n production

# What fields exist on a resource, explained by the API itself
kubectl explain deployment.spec.strategy

# Resource usage per pod / per node (requires the metrics-server add-on,
# which most managed clusters install by default)
kubectl top pods -n production
kubectl top pods --containers -n production
kubectl top nodes

# Every resource type the cluster knows about
kubectl api-resources

# Check the cluster will let you do something BEFORE you try it
kubectl auth can-i create deployments -n production
kubectl auth can-i --list -n production
\`\`\`

Two notes worth internalising. First, \`kubectl describe\` is where the cluster explains itself: the Events section at the bottom records scheduling failures, image pull errors, probe failures and evictions in plain language. Second, \`kubectl auth can-i\` ends permission guessing — in shared clusters with real RBAC, it is faster than trying and failing.

## 2. Deploy and roll out: change things deliberately

The professional pattern is declarative: keep manifests in Git, preview the change, apply it, then watch the rollout like it owes you money. (That Git-first workflow is the whole argument of my [GitOps vs Traditional CI/CD guide](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison) — this section is its command-level companion.)

\`\`\`bash
# Generate a starter manifest instead of writing one from memory
kubectl create deployment api --image=nginx:1.27 --replicas=3 \\
  --dry-run=client -o yaml > deployment.yaml

# See exactly what would change, before it changes (server-side diff)
kubectl diff -f deployment.yaml

# Validate against the real API server without applying anything
kubectl apply -f deployment.yaml --dry-run=server

# Apply a file or a whole directory
kubectl apply -f deployment.yaml
kubectl apply -f ./manifests/

# Apply a kustomize overlay (built into kubectl, no separate install)
kubectl apply -k ./overlays/production

# Watch a rollout until it finishes or fails
kubectl rollout status deployment/api -n production

# How did we get here? Rollout history and a specific revision
kubectl rollout history deployment/api -n production
kubectl rollout history deployment/api -n production --revision=2

# It went wrong: go back one revision, or to a specific one
kubectl rollout undo deployment/api -n production
kubectl rollout undo deployment/api -n production --to-revision=2

# Pause a rollout mid-flight (canary by hand), then resume it
kubectl rollout pause deployment/api -n production
kubectl rollout resume deployment/api -n production

# Change just the image — and record why in the change-cause annotation
kubectl set image deployment/api api=registry.example.com/api:1.4.2 -n production
kubectl annotate deployment/api kubernetes.io/change-cause="api 1.4.2: fix checkout timeout" -n production

# Restart every pod of a deployment (rolling, not all at once)
kubectl rollout restart deployment/api -n production

# Wait for a condition instead of polling by eye
kubectl wait --for=condition=Available deployment/api -n production --timeout=180s
\`\`\`

The strategy behind the rollout — rolling, blue-green, canary, and when each is worth its complexity — is a bigger topic than a cheat sheet, and it is covered properly in my [Kubernetes deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide). The commands above are how you execute and, just as importantly, *un*-execute those strategies.

## 3. Debug a broken pod: the standard sequence

When a pod is \`CrashLoopBackOff\`, \`ImagePullBackOff\` or just not ready, work this order instead of guessing:

\`\`\`bash
# 1. What state is it in, and how often has it restarted?
kubectl get pods -n production -o wide

# 2. What does the cluster say happened? (Events section at the bottom:
#    failed pulls, failed probes, OOMKilled, scheduling failures)
kubectl describe pod <pod-name> -n production

# 3. What did the container itself say — including the PREVIOUS crash,
#    which is usually the one that matters in a crash loop
kubectl logs <pod-name> -n production --previous

# 4. Resource pressure? (needs metrics-server)
kubectl top pod <pod-name> -n production --containers

# 5. Get inside a running container
kubectl exec -it <pod-name> -n production -- /bin/sh
kubectl exec <pod-name> -n production -c <container-name> -- env

# 6. No shell in the image (distroless, scratch)? Attach an ephemeral
#    debug container with real tools instead
kubectl debug <pod-name> -n production -it \\
  --image=busybox:1.36 --target=<container-name>

# 7. Throwaway interactive pod for testing DNS, network and services
#    from inside the cluster — deleted automatically when you exit
kubectl run dns-test --image=busybox:1.36 -it --rm --restart=Never \\
  -- nslookup kubernetes.default

# 8. Talk to the app directly, bypassing ingress and load balancers
kubectl port-forward pod/<pod-name> -n production 8080:80
kubectl port-forward svc/api -n production 8080:80

# 9. Copy a file out of a container for inspection
#    (needs tar inside the container; fails on minimal images)
kubectl cp production/<pod-name>:/var/log/app.log ./app.log
\`\`\`

Read the status names properly: \`CrashLoopBackOff\` means the container ran and died repeatedly (\`--previous\` logs are the gold); \`ImagePullBackOff\` means it never started (describe will show the exact pull error — wrong tag, missing pull secret, or private registry auth); \`Pending\` means it never got scheduled (describe shows why: resources, taints, affinity); \`OOMKilled\` in the last-state reason means the memory limit, not the application, made the decision.

## 4. Logs and events: what happened, in order

\`\`\`bash
# Last 100 lines from a pod
kubectl logs <pod-name> -n production --tail=100

# Follow logs live
kubectl logs -f <pod-name> -n production

# Logs from one container in a multi-container pod
kubectl logs <pod-name> -n production -c <container-name>

# Every container, including init containers
kubectl logs <pod-name> -n production --all-containers=true

# Logs from every pod behind a label — the service-level view
kubectl logs -l app=api -n production --tail=50

# Only the last hour
kubectl logs <pod-name> -n production --since=1h

# Logs straight from a Deployment (picks one of its pods)
kubectl logs deployment/api -n production

# Events, newest last — read this during any incident
kubectl get events -n production --sort-by=.lastTimestamp

# Events for one object only
kubectl get events -n production \\
  --field-selector involvedObject.name=<pod-name>
\`\`\`

One fact about events surprises everyone exactly once: **the API server only keeps events for about an hour by default.** If the incident started this morning, the events are gone — which is why mature setups ship events and logs to a real logging system instead of treating \`kubectl get events\` as history. Use it as a live instrument, not an archive.

## 5. ConfigMaps and Secrets: handle configuration safely

ConfigMaps are plain configuration. Secrets are sensitive configuration — and kubectl is honest about the difference only if you are.

\`\`\`bash
# ConfigMap from a file, or from literal values (fine for non-secrets)
kubectl create configmap app-config -n production \\
  --from-file=./config.properties
kubectl create configmap app-config -n production \\
  --from-literal=LOG_LEVEL=info --from-literal=FEATURE_X=true

# Read configuration back
kubectl get configmap app-config -n production -o yaml

# Secret from files — the contents never pass through your shell history
kubectl create secret generic db-creds -n production \\
  --from-file=username=./db-user.txt \\
  --from-file=password=./db-password.txt

# Generate the YAML, review it, apply it — without writing the secret
# value into a shell command or a file on disk
kubectl create secret generic db-creds -n production \\
  --from-file=password=./db-password.txt \\
  --dry-run=client -o yaml | kubectl apply -f -

# A registry pull secret
kubectl create secret docker-registry registry-creds -n production \\
  --docker-server=registry.example.com \\
  --docker-username=<user> --docker-password=<password>

# Check which Secrets exist (names and types, not values)
kubectl get secrets -n production
\`\`\`

Now the safety rules, because this is where cheat sheets usually fail you:

1. **Base64 is encoding, not encryption.** Anyone who can run \`kubectl get secret db-creds -o yaml\` can read the values — decoding is one \`| base64 -d\` away. A Kubernetes Secret sitting in etcd and readable via the API is protected by *access control*, not by cryptography. Control who has \`get secrets\` permission (that is what \`kubectl auth can-i get secrets\` is for), and turn on encryption at rest in etcd if your platform does not do it for you.
2. **\`--from-literal\` leaks.** \`kubectl create secret generic x --from-literal=password=hunter2\` writes the password into your shell history and the process list. Use \`--from-file\` or the generate-and-apply pipe above for real credentials.
3. **Viewing a secret is an event.** If you must decode a value during an incident, know that you have displayed a credential on a screen — and that in managed clusters, API reads may be audit-logged. Treat it accordingly.
4. **Git is not a secret store.** Plain Secret YAML committed to a repository is a published credential, full stop. Teams that keep manifests in Git (see the GitOps guide linked earlier) use a dedicated mechanism — sealed or external secrets tooling, or their cloud's secret manager — so the repository holds references, not values.

## 6. Scaling and node operations

\`\`\`bash
# Scale a deployment right now
kubectl scale deployment/api -n production --replicas=5

# Autoscale it instead (creates a HorizontalPodAutoscaler)
kubectl autoscale deployment/api -n production \\
  --min=2 --max=10 --cpu-percent=70
kubectl get hpa -n production

# What is each node carrying?
kubectl top nodes
kubectl describe node <node-name>

# Stop new pods landing on a node (maintenance, investigation)
kubectl cordon <node-name>

# Evict a node's workloads gracefully so it can be drained for real
# maintenance — respects PodDisruptionBudgets, see the warnings section
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Bring the node back into service
kubectl uncordon <node-name>

# Keep workloads off a node by rule, and remove that rule (trailing "-")
kubectl taint nodes <node-name> maintenance=true:NoSchedule
kubectl taint nodes <node-name> maintenance=true:NoSchedule-
\`\`\`

A caution on \`kubectl scale\`: if the Deployment's replica count is also declared in your manifests or managed by an HPA or a GitOps controller, your manual scale is a temporary opinion — the next apply or sync will overwrite it. Scale in the file for permanence; scale by command for incidents.

## 7. Contexts and namespaces: aim before you fire

\`\`\`bash
# List every context in your kubeconfig
kubectl config get-contexts

# Switch cluster/user entirely
kubectl config use-context staging-cluster

# Point the current context at a default namespace, so you can
# stop typing -n on every command
kubectl config set-context --current --namespace=staging

# Namespaces that exist
kubectl get namespaces

# Everything in one namespace, across the main resource types
kubectl get pods,svc,deployments,ingress -n staging

# One-off: run a single command against all namespaces instead
kubectl get pods -A
\`\`\`

Namespaces are an organisational boundary, not a security wall by themselves — network policy, RBAC and quotas are what give them teeth. The practical reason to master this section is duller and more important: most kubectl horror stories start with a command executed against the wrong context or the production namespace. The three habits at the top of this article exist because of this section.

## 8. Cleanup: remove things without removing the wrong things

\`\`\`bash
# Delete exactly what a manifest created
kubectl delete -f deployment.yaml

# Delete one object by name
kubectl delete pod <pod-name> -n staging

# Delete by label — powerful, so list first with the same selector
kubectl get pods -n staging -l app=old-worker
kubectl delete pods -n staging -l app=old-worker

# Clear out dead pods (failed/succeeded phases) across the cluster
kubectl delete pods -A --field-selector=status.phase=Failed
kubectl delete pods -A --field-selector=status.phase=Succeeded

# Delete a ConfigMap or Secret you created
kubectl delete configmap app-config -n staging
kubectl delete secret db-creds -n staging
\`\`\`

Deleting a pod that a Deployment owns accomplishes almost nothing — the controller replaces it immediately, which is sometimes exactly what you want (a fast restart) and sometimes a surprise (you meant to stop the workload; delete or scale the Deployment instead). Deleting a whole namespace is powerful enough to deserve its own warning below.

## 9. Output and filtering: get answers, not walls of text

Cheat sheets bury this at the end, but it is what separates "running commands" from "asking questions":

\`\`\`bash
# YAML of the live object — the truth, including fields you never set
kubectl get deployment api -n production -o yaml

# Extract one field with JSONPath
kubectl get pods -n production \\
  -o jsonpath='{.items[*].metadata.name}'; echo

# Build your own columns
kubectl get pods -n production \\
  -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName

# Filter server-side by field
kubectl get pods -n production --field-selector=status.phase=Running

# Read and change one object in your editor
kubectl edit deployment api -n production

# Add or overwrite labels and annotations
kubectl label deployment api tier=backend -n production --overwrite
kubectl annotate service api owner=platform-team -n production --overwrite
\`\`\`

\`kubectl edit\` deserves a footnote: it is excellent for exploration and emergencies, and corrosive as a habit — every edit made by hand is drift your manifests no longer describe. Edit to learn or to unblock, then put the change back into the file.

## 10. Commands that bite: read this section twice

Everything above is recoverable. This section is the exception list — commands whose effects are instant, broad, or irreversible. None of them are forbidden; all of them deserve a breath and a context check first.

**\`kubectl delete namespace <name>\` — the biggest delete key you own.**
Deleting a namespace deletes *everything inside it*: deployments, pods, services, ConfigMaps, Secrets — and PersistentVolumeClaims, which depending on the storage class can mean the underlying data goes with them. There is no undo and no recycle bin. Before running it, list the namespace's contents (\`kubectl get all,pvc,secrets -n <name>\`) and say the context check out loud.

**\`kubectl drain\` — graceful, until the flags make it not.**
Drain is designed to be safe: it respects PodDisruptionBudgets and refuses pods it cannot move safely. The flags are where the safety lives. \`--ignore-daemonsets\` is normally required (DaemonSet pods are not evicted — the flag just acknowledges them). \`--delete-emptydir-data\` permanently deletes anything pods stored in emptyDir volumes. And \`--force\` overrides drain's refusal to touch pods not managed by a controller — sometimes necessary, always worth understanding first, because an unmanaged pod evicted by drain does not come back.

**\`kubectl delete pod --force --grace-period=0\` — lying to the cluster.**
A normal delete lets the kubelet stop the container and confirm it. \`--force --grace-period=0\` removes the pod from the API immediately *without* that confirmation. If the node is alive, the container can keep running — invisible to Kubernetes, still holding ports and resources, while its replacement starts elsewhere. This flag exists for one situation: the node is dead or gone and the record needs clearing. Used anywhere else, it manufactures ghosts.

**\`apply\` vs \`create\` — pick one model per resource.**
\`kubectl create\` is imperative: it builds the object once and fails with \`AlreadyExists\` if it exists. \`kubectl apply\` is declarative: it creates or updates, using a three-way merge against the last-applied configuration it stores in an annotation. Trouble starts when both models touch the same object — create it by hand, edit it with \`kubectl edit\`, then apply over the top, and ownership of individual fields becomes an argument nobody wins. Keep manifests in Git and apply them (or let your GitOps controller apply them); use imperative commands for exploration and incidents. And be careful with \`kubectl apply --prune\`: prune deletes cluster resources that have fallen out of your applied set, which is exactly right when your file set is complete — and quietly destructive when it isn't.

**Broad deletes by label.**
\`kubectl delete pods -l app=api\` in the wrong namespace, or with a sloppy selector, deletes a fleet at production speed. The defence is boring and total: run the identical selector through \`kubectl get\` first, read the list, then delete. Two commands, ten seconds, one career saved — this exact pattern is shown in the cleanup section for a reason.

**Editing Secrets as if they were text.**
\`kubectl edit secret\` shows you base64 values. If you paste plain text in as a value, that plain text *is* what gets stored as the (invalid) encoded value — you have corrupted the credential, not updated it. Update secrets by recreating them from files or via the generate-and-apply pipe in section 5.

## FAQ

**What is the difference between \`kubectl apply\` and \`kubectl create\`?**
\`create\` makes a new object and fails if it already exists; \`apply\` creates or updates declaratively from a manifest, and is the right default for anything you manage more than once. Section 10 covers why mixing the two on the same object causes pain.

**How do I read the logs of a container that already crashed?**
\`kubectl logs <pod> --previous\` (add \`-c <container>\` for multi-container pods). In a crash loop, the previous instance's logs are usually where the actual error lives — the current instance may not have run long enough to print anything.

**Why does \`kubectl top\` say the Metrics API is not available?**
\`top\` does not read the API server directly; it needs the metrics-server add-on. Most managed clusters install it by default. On a self-built cluster (kind, kubeadm) you install it yourself, and until you do, \`top\` commands fail while everything else works.

**How do I work with several clusters without mixing them up?**
One context per cluster in your kubeconfig, \`kubectl config current-context\` as a reflex before anything mutating, and a different default namespace per context for staging and production so the prompt of your own terminal tells you where you are. Section 7 has the commands.

**Is there a faster interface than typing kubectl?**
Shell completion (\`kubectl completion bash\` / \`zsh\`), a short alias, and terminal UIs like k9s all speed up the same underlying commands. Learn the commands first — they are what works over SSH, in CI logs, and in an incident bridge at 3 a.m. — then let tools accelerate them.

## Conclusion

kubectl rewards a small vocabulary used fluently: \`get\` and \`describe\` to see, \`diff\` and \`apply\` to change, \`rollout\` to move safely and undo quickly, \`logs --previous\` and \`events\` to understand, and a healthy respect for the handful of commands that cannot be taken back. Organise the commands by the job in front of you — not by the man page — and check your context before every command that changes anything. That is most of professional Kubernetes operation, and it fits on one page.

**Next reads in this cluster:**

- [Kubernetes Deployment Strategies in 2026: Rolling, Blue-Green, Canary, Recreate, A/B and Shadow](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) — the strategies behind the rollout commands in section 2.
- [GitOps vs Traditional CI/CD in 2026: Differences, Examples, and Which One to Choose](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison) — why the manifests kubectl applies should live in Git, and who should be applying them.
- [Kubernetes Troubleshooting in 2026](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) — the calm diagnosis sequence these commands feed into when a pod breaks.
- [Kubernetes Logging in 2026](https://www.devopsenginer.com/blog/kubernetes-logging-guide-2026) — from kubectl logs to a pipeline that survives node rotation.
- [Kubernetes RBAC in 2026](https://www.devopsenginer.com/blog/kubernetes-rbac-guide-2026) — when the cheat sheet's commands start answering Forbidden, this is why.
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "kubectl", "Cheat Sheet", "DevOps", "GitOps"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "18 min read",
  seo: {
    title: "kubectl Commands Cheat Sheet (2026): The Commands DevOps Engineers Actually Use",
    description: "A working kubectl cheat sheet organised by the job you're doing \u2014 getting information, deploying and rolling out, debugging a broken pod, reading logs and events, handling ConfigMaps and Secrets safely, scaling, switching contexts, and cleaning up \u2014 plus the commands that bite, with the warnings nobody puts in the tutorials.",
    keywords: "kubectl cheat sheet, kubectl commands, Kubernetes commands, kubectl tutorial, Kubernetes debugging, CrashLoopBackOff, DevOps 2026"
  }
};
