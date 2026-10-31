// Kubernetes Troubleshooting in 2026: CrashLoopBackOff, ImagePullBackOff, Pending Pods and 20+ Errors — Diagnosis Steps That Actually Work
export const kubernetesTroubleshootingBlog = {
  id: 18,
  title: "Kubernetes Troubleshooting in 2026: CrashLoopBackOff, ImagePullBackOff, Pending Pods and 20+ Errors \u2014 Diagnosis Steps That Actually Work",
  slug: "kubernetes-troubleshooting-guide-2026",
  excerpt: "CrashLoopBackOff, ImagePullBackOff, Pending pods, OOMKilled and 20+ more Kubernetes errors \u2014 diagnosed with one calm sequence: describe, events, previous logs, then get inside. Diagnosis steps that actually work.",
  content: `
# Kubernetes Troubleshooting in 2026: CrashLoopBackOff, ImagePullBackOff, Pending Pods and 20+ Errors — Diagnosis Steps That Actually Work

> ## TL;DR
>
> - Almost every pod failure is diagnosed with the same four moves, in order: **\`kubectl describe\` → events → \`kubectl logs\` (including \`--previous\`) → \`kubectl debug\` / \`exec\`**.
> - **CrashLoopBackOff** is a symptom, not a cause. The cause is in the previous container's logs or the exit code.
> - **ImagePullBackOff** is almost always: wrong tag, wrong registry, missing/wrong pull secret, or no network path to the registry.
> - **Pending** means the scheduler could not place the pod — the scheduling event literally tells you why (CPU, memory, taints, selectors, volume binding).
> - **OOMKilled = exit code 137 with reason OOMKilled** in \`describe\`.
> - Events disappear (roughly an hour by default). Look early, or recreate the failure live.


## Introduction: the error name is the symptom, not the diagnosis

\`CrashLoopBackOff\` has ended more evenings than almost any other string in DevOps, and it tells you almost nothing: a container started, exited, started again, exited again, and Kubernetes is now waiting longer between attempts. Everything you actually need — *why* it exited — lives somewhere else.

That gap between the scary status word and the real cause is the whole subject of this guide. Kubernetes is unusually honest: it records events, keeps the previous container's logs, and prints the scheduler's reasoning in plain English. Failures feel mysterious mostly because the evidence is scattered across four places, and under pressure people check them in the wrong order — or read the pod's *current* logs, find nothing, and start guessing.

My own debugging instincts were not formed on a giant production cluster. They were formed on my own projects — this website and my 3D portfolio — where a deploy would work locally and break on the way up, and I was the developer, the operations team, and the support desk in one chair. The lesson those evenings taught me transfers directly: **stop staring at the failing thing and go read what the system recorded when it failed.** A second lesson returns in the mistakes section: sometimes the fastest correct move is to redeploy the last version that worked and debug the broken one afterwards, in daylight.
## The diagnostic workflow: four moves, in order

### Move 1: \`kubectl describe\` — state and events

\`\`\`bash
kubectl describe pod <pod> -n <namespace>
\`\`\`

Three parts matter. **State / Last State**: waiting, running, or terminated — and if terminated, the **reason** and **exit code** (\`OOMKilled\`, \`Completed\`, \`Error\`, plus a number). **Events** at the bottom: what the kubelet, scheduler, and controllers have been saying. And the spec in the middle confirms the image, limits, and mounts the pod *actually got* — not always what you think you applied.

\`\`\`bash
kubectl get events -n <namespace> --sort-by=.lastTimestamp
kubectl get events -n <namespace> --field-selector involvedObject.name=<pod>
\`\`\`

A newer \`kubectl events\` command exists in kubectl 1.29+; on older kubectl, use \`kubectl get events\` as shown above. Either way, **look early**: events are short-lived (around an hour by default), so an incident investigated "later" often has none left. If they are gone, reproduce the failure and watch live.
### Move 2: \`kubectl logs\` — including the container that already died

\`\`\`bash
kubectl logs <pod> -n <namespace>                 # current container
kubectl logs <pod> -n <namespace> --previous      # the PREVIOUS, crashed instance
kubectl logs <pod> -n <namespace> -c <container>  # a specific (or init) container
\`\`\`

\`--previous\` is the most underused flag in Kubernetes debugging. In a crash loop the current container may have lived four seconds and printed nothing; the previous instance's logs hold the stack trace. If no previous container exists, the failure happens before logging starts — pointing at config, secrets, or the image (§3 and §1).
### Move 3: Check the objects around the pod

Pods rarely fail alone:

\`\`\`bash
kubectl get deployment,rs -n <namespace>        # new ReplicaSet stuck while the old one serves?
kubectl describe node <node>                    # pressure conditions, allocatable vs allocated
kubectl get pvc -n <namespace>                  # is the claim Bound?
kubectl get endpoints <service> -n <namespace>  # empty = no ready backends
kubectl top pod -n <namespace>                  # needs metrics-server; usage vs limits
\`\`\`

### Move 4: Get inside — \`exec\` if it runs, \`kubectl debug\` if it can't

\`\`\`bash
kubectl exec -it <pod> -n <namespace> -- sh
kubectl debug -it <pod> -n <namespace> --image=busybox --target=<container>
kubectl debug node/<node> -it --image=ubuntu    # node-level debugging
\`\`\`

Distroless and scratch images have no shell — exactly when \`kubectl debug\` earns its keep: it attaches an ephemeral container sharing the target's namespaces, so you can inspect its filesystem, processes, and network. It needs ephemeral containers enabled (GA since 1.25, though some managed clusters restrict them via RBAC or policy). Fallback: a one-off tools pod on the same node/network.

Now the reference. Find your status string; every entry follows the same shape.
---

## Image errors

### 1. ErrImagePull / ImagePullBackOff

**Symptom.** Pod stuck in \`ErrImagePull\`, later \`ImagePullBackOff\`. The container never starts.

**What it means.** The kubelet cannot pull the image. \`ErrImagePull\` is the immediate failure; \`ImagePullBackOff\` is the same failure with exponential back-off between retries. One error, two moods.

**Diagnose.**

\`\`\`bash
kubectl describe pod <pod> -n <namespace>   # events show the exact error: manifest unknown, unauthorized, timeout…
kubectl get pod <pod> -n <namespace> -o jsonpath='{.spec.containers[*].image}'
kubectl get secret -n <namespace>           # is the pull secret present in THIS namespace?
\`\`\`

**Likely causes.** Typo'd or non-existent tag; image pushed to a different registry/region than the manifest names; missing/wrong \`imagePullSecrets\` (they are per-namespace); expired registry credentials; no network/DNS path from node to registry; public-registry rate limiting.

**Fix.** Correct the reference (pin a real tag or digest); create/refresh the pull secret in the pod's namespace and reference it in the spec or service account. Test the pull from a node-like position, not your laptop — your laptop reaching the registry says nothing about the node's path.

**Related status — \`InvalidImageName\`:** no pull is attempted, because the image string itself is malformed — illegal characters, an empty tag, or an unrendered template variable such as \`myapp:{{ .Values.tag }}\`. Read the image field as applied and fix it at the source. If pulls fail on *some nodes only*, suspect node-local config (credential helpers, a per-node registry mirror, node DNS) and compare events node by node via \`kubectl get pods -o wide\`.

### 2. CrashLoopBackOff

**Symptom.** Container starts, exits, restarts; restart count climbs; back-off grows to minutes.

**What it means.** The process runs and then dies, repeatedly. Kubernetes is reporting, not causing.

**Diagnose.**

\`\`\`bash
kubectl logs <pod> -n <namespace> --previous
kubectl describe pod <pod> -n <namespace>   # Last State: Terminated — Reason + Exit Code
\`\`\`

Read the exit code as a first clue: **1** = the app exited with an error (read the log); **137** = killed (often OOM, §7); **139** = segfault; **143** = SIGTERM; **126/127** = command cannot run / not found (wrong \`command\`/\`args\`, missing binary).

**Likely causes.** Missing/malformed config or env; a dependency unreachable at startup; a port already taken or file permissions wrong; the wrong command in the manifest; a failing migration on start.

**Fix.** Fix the cause the logs name. If logs are empty because the process dies instantly, check \`command\`/\`args\` and env in \`describe\`, and run the same image locally with the same environment. Do not "fix" it by deleting the pod — the Deployment recreates the identical failure, faithfully, forever.

### 3. CreateContainerConfigError

**Symptom.** Pod sits in \`CreateContainerConfigError\`; container never created; no logs exist.

**What it means.** Kubernetes cannot assemble the container's configuration — almost always a referenced ConfigMap or Secret that does not exist (or an optional reference not marked optional).

**Diagnose.** \`kubectl describe pod\` — the event names the missing object (\`configmap "…" not found\`). Check the namespace: ConfigMaps and Secrets are namespaced, and "it exists" in \`default\` does not help a pod in \`prod\`.

**Fix.** Create the object in the pod's namespace, fix the name/key, or set \`optional: true\` where genuinely optional. Apply config before workloads, or let GitOps sync waves order it.

### 4. RunContainerError / CreateContainerError

**Symptom.** Container creation fails after config succeeded; events carry OCI runtime errors.

**Diagnose.** The events in \`describe\` give the runtime's own words (\`exec: "…": no such file or directory\` is common). Compare the manifest's \`command\`/\`args\` with what the image contains — \`command\` overrides the image ENTRYPOINT and \`args\` overrides CMD, which surprises people monthly.

**Likely causes.** Entrypoint script with Windows line endings (\`/bin/sh^M: bad interpreter\`); script not executable or absent from a distroless/scratch image; a shell the image does not ship; a binary built for the wrong architecture (an arm64 image on amd64 nodes is a common multi-arch surprise — compare image and node architectures, then rebuild or pin the right variant).

**Fix.** Correct command/args; fix the script in the image (line endings, \`chmod +x\`, rebuild); stop calling shells minimal images do not have.

### 5. Init container failures (\`Init:CrashLoopBackOff\`, stuck \`PodInitializing\`)

**Symptom.** Main containers never start; status shows \`Init:0/1\`, \`Init:CrashLoopBackOff\`, or \`Init:Error\`.

**What it means.** An init container is crashing, or waiting on a dependency that will never succeed.

**Diagnose.**

\`\`\`bash
kubectl logs <pod> -n <namespace> -c <init-container-name> --previous
kubectl describe pod <pod> -n <namespace>
\`\`\`

**Fix.** Whatever the init container waits for is the real bug report: a wrong service name, a database that is down, a migration that errors.
### 6. FailedMount

**Symptom.** \`FailedMount\` events; pod stuck in ContainerCreating.

**Diagnose.** \`kubectl describe pod\` names the volume and reason: \`configmap/secret "…" not found\`, a PVC that is not \`Bound\` (\`kubectl get pvc\`), or a cloud volume still attached elsewhere — a volume on a dead node can take minutes to free, depending on the platform.

**Fix.** Create the missing object, repair the PVC/storage-class issue, or resolve the stuck attachment. Do not delete PVCs casually while "fixing" mounts — a config typo can become data loss.

---

## Scheduling and resource errors

### 7. OOMKilled (exit code 137)

**Symptom.** \`Last State: Terminated, Reason: OOMKilled, Exit Code: 137\`; restarts climb, often alongside CrashLoopBackOff.

**What it means.** The container exceeded its memory limit and the kernel killed it. 137 = 128 + 9 (SIGKILL), and with reason OOMKilled there is no ambiguity.

**Diagnose.**

\`\`\`bash
kubectl describe pod <pod> -n <namespace>      # confirm Reason: OOMKilled
kubectl top pod <pod> -n <namespace>           # current usage (needs metrics-server)
kubectl get pod <pod> -n <namespace> -o yaml   # requests vs limits, as applied
\`\`\`

**Likely causes.** Limit set from hope rather than measurement; a memory leak; runtime heap settings that fight the container limit (modern runtimes mostly respect cgroup limits; explicit heap flags in older setups still override them); caches that grew with the data; node memory pressure killing before the limit (check node conditions).

**Fix.** Raise limit *and* request to a measured value; fix the leak or the runtime flags. Do not just keep raising: a leak in a bigger bucket is a slower leak, and it will restart during your biggest traffic instead.

### 8. Pending — FailedScheduling

**Symptom.** Pod sits in \`Pending\`; no node is ever assigned.

**What it means.** The scheduler tried every node, rejected all of them — and wrote down why.

**Diagnose.**

\`\`\`bash
kubectl describe pod <pod> -n <namespace>
# Events: "0/5 nodes are available: 2 Insufficient cpu, 3 node(s) had untolerated taint…"
kubectl describe node <node>   # Allocated vs Allocatable
\`\`\`

**Likely causes.** Requests larger than any node's allocatable (the scheduler counts *requests*, not usage); a \`nodeSelector\`/affinity no node satisfies; a taint without a toleration; a PVC bound to a zone with no suitable node; all nodes NotReady.

**Fix.** Set requests from measured usage, correct selectors/tolerations, or add capacity.

### 9. Evicted

**Symptom.** Pod status \`Evicted\`/\`Failed\`; a replacement is (or is not) created by its controller.

**What it means.** The kubelet evicted the pod under node pressure — memory, disk, or inodes — choosing victims by QoS class and usage-over-request.
**Diagnose.** \`kubectl describe pod\` gives the pressure reason; \`kubectl describe node\` shows the pressure condition; \`kubectl get pods --field-selector status.phase=Failed\` finds all casualties after an event.

**Fix.** Treat the node (disk cleanup, capacity) and the pods (honest requests; Guaranteed QoS for what must not be first in line). An eviction record is evidence of a node that is too full, not a pod bug.

### 10. Pod stuck in Terminating

**Symptom.** \`Terminating\` for many minutes; deletion hangs.

**What it means.** A finalizer, a container ignoring SIGTERM past its grace period, or a dead node that cannot confirm the container stopped.

**Diagnose.** Check \`.metadata.finalizers\` in the pod YAML; check whether the node is \`NotReady\`; ask whether the app handles SIGTERM at all.

**Fix.** Fix signal handling (the real fix); remove a genuinely stale finalizer deliberately; only as a last resort \`kubectl delete pod --force --grace-period=0\` — on a partitioned node that can leave the workload running in two places, which matters for anything that writes data.

---

## Runtime and node errors

### 11. NodeNotReady / pods Unknown

**Symptom.** Node shows \`NotReady\`; its pods flip to \`Unknown\` or reschedule after a timeout.

**What it means.** The control plane lost the kubelet's heartbeat: node down, network partition, or kubelet/runtime trouble on a living node.

**Diagnose.** \`kubectl describe node\` (conditions, last heartbeat); the cloud console for the VM's real state; \`kubectl debug node/<node>\` if the kubelet still functions.

**Fix.** Per cause. The design lesson: replicas across nodes plus sane PodDisruptionBudgets ride this out; singletons discover their architecture during it.
---

## Networking and service errors

### 12. Service has no endpoints

**Symptom.** The Service exists; connections time out or refuse; the app pods are Running.

**What it means.** No *ready* pod matches the Service selector — endpoints are built from ready pods only.

**Diagnose.**

\`\`\`bash
kubectl get endpoints <service> -n <namespace>     # empty?
kubectl get pods -n <namespace> --show-labels      # compare labels against…
kubectl get svc <service> -n <namespace> -o yaml   # …the selector, character by character
\`\`\`

**Likely causes.** Selector/label typo; pods present but not Ready (probe failures, §15); wrong \`targetPort\`; pods in a different namespace (selectors do not cross namespaces).

**Fix.** Align selector and labels, restore readiness, correct the port.

### 13. DNS failures inside the cluster

**Symptom.** Logs show \`Name or service not known\` / NXDOMAIN for services that definitely exist.

**Diagnose.** From a debug pod, resolve the short name, the \`service.namespace\` form, and the full \`service.namespace.svc.cluster.local\`; check CoreDNS health; confirm the pod's \`/etc/resolv.conf\` points at cluster DNS.

**Likely causes.** A short name resolves only within the caller's namespace; CoreDNS degraded; a NetworkPolicy blocking DNS egress (§14).

**Fix.** Use fully qualified names across namespaces, repair CoreDNS, allow UDP/TCP 53 to the DNS service in policy.

### 14. NetworkPolicy silently blocking traffic

**Symptom.** Everything Running and Ready; traffic between two workloads dies; nothing logs an error anywhere.

**What it means.** A policy selected one side and the flow is not allowed. Policies deny by omission once a pod is selected, and they drop packets silently — no error to grep for.

**Diagnose.** \`kubectl get networkpolicy -n <namespace>\`; read every policy selecting the source and destination pods. Egress *and* ingress apply, and DNS needs an explicit egress allow in tight setups.

**Fix.** Add the precise allow rule (selectors + port). Change one policy at a time and retest.

---

## Probe errors

### 15. Readiness probe failures — Running, but receiving nothing

**Symptom.** Pod \`Running\`, \`READY 0/1\`; events repeat \`Readiness probe failed\`.

**What it means.** The container lives but gets no traffic: the probe path/port/scheme does not match the app, the app answers too slowly under load, or the probe checks a dependency-backed endpoint that fails when the dependency hiccups.

**Diagnose.** \`kubectl describe pod\` for the probe's error output; curl the exact probe path from inside via \`exec\`/debug; compare the probe against the port the process actually bound (a classic miss after an app config change).

**Fix.** Point the probe at a cheap, honest readiness endpoint; keep readiness (can I serve?) separate from liveness; tune delays and thresholds for slow starters instead of deleting the probe.
### 16. Liveness probe failures — the restart loop that is not a crash

**Symptom.** Restarts climb; logs show the app starting cleanly and running fine until killed; events: \`Liveness probe failed\`, then \`Killing container\`.

**What it means.** The kubelet is killing a healthy-ish container: the probe is too aggressive for startup or load, or it depends on a downstream service — converting that service's outage into a self-inflicted restart storm.

**Diagnose.** Correlate restart timestamps in \`describe\` with probe events; check \`--previous\` logs for a clean SIGTERM pattern rather than a crash.

**Fix.** Make liveness shallow (alive and unwedged?) and dependency-free; add a \`startupProbe\` so liveness does not judge a still-booting container.

---

## Jobs and controllers

### 17. BackoffLimitExceeded (Jobs)

**Symptom.** Job pods fail repeatedly; the Job ends \`Failed\` with \`BackoffLimitExceeded\`.

**Diagnose.** \`kubectl describe job <job>\` for counts and events; then the failed pods' logs — the command exits non-zero, and the pod logs, not the Job object, say why.

**Fix.** Fix the command's failure, then delete and recreate the Job (the fields you would want to change are effectively immutable). Set \`ttlSecondsAfterFinished\` so old pods do not accumulate — but not so short that you delete your evidence before reading it.

### 18. CronJob never runs, or DeadlineExceeded

**Symptom.** No Jobs on schedule, or Jobs created and immediately marked missed.

**Diagnose.** \`kubectl describe cronjob <name>\` — \`Last Schedule Time\` and events tell the story. Check \`startingDeadlineSeconds\` and the timezone: schedules use the controller's timezone unless \`timeZone\` is set (supported in recent versions).

**Fix.** Set an explicit \`timeZone\` and a sane \`startingDeadlineSeconds\`; verify the expression against the timezone you actually mean.

### 19. Deployment rollout stuck

**Symptom.** \`kubectl rollout status\` never completes: new ReplicaSet pods Pending/crashing/probe-failing while the old version keeps serving.

**Diagnose.** \`kubectl describe deployment\`, \`kubectl get rs\`, then run the per-pod loop on the *new* pods — they carry the actual error.

**Fix.** Fix the new pods' root cause, or \`kubectl rollout undo\` back to the previous ReplicaSet while you work. This is the production version of the lesson from my own portfolio deploys: returning to the last known-good build is a legitimate, often fastest, first move — use it instead of debugging a half-rolled release under pressure.

---

## Common mistakes in Kubernetes troubleshooting

1. **Reading only the current container's logs.** In a crash loop the evidence is in \`--previous\`. Make it muscle memory.
2. **Deleting the pod as a "fix".** The controller recreates it identically. Deleting proves nothing except that recreation works.
3. **Checking events an hour later.** They expire. Capture them, ship them to your logging system, or reproduce while watching.
4. **Treating status words as diagnoses.** CrashLoopBackOff, BackOff, Pending — all symptoms, with the cause filed in describe, events, or previous logs.
5. **Guessing requests and limits, then debugging the consequences.** OOMKilled and FailedScheduling are usually born in the manifest weeks earlier.
6. **Making the liveness probe check dependencies.** A database outage becomes a cluster-wide restart festival, and the original incident gets a sequel.
7. **Editing the live pod to test a theory.** Change the Deployment and let the rollout be your experiment — with \`rollout undo\` as the exit.
8. **Assuming it's the app, or assuming it's the platform.** Split it with evidence: the same image failing identically on a debug pod anywhere = app/config; failing on one node only = the node.9. **Force-deleting stuck pods without asking why.** Finalizers and unconfirmed node deaths are information; \`--force\` discards it and can double-run stateful work.
10. **Debugging the new version live during a bad rollout.** Roll back first, restore service, then investigate with the pressure off. Pride is not an SRE tool.

## Frequently asked questions

**What is the difference between CrashLoopBackOff and ImagePullBackOff?**
Whether the container ever started. ImagePullBackOff: the image could not be pulled, so nothing ran. CrashLoopBackOff: the image pulled fine and the process keeps exiting. Pull errors live in describe/events; crash causes live in \`--previous\` logs and exit codes.

**Why are my pod's logs empty even though it is crashing?**
The process dies before it can write (check command/args, config, exit code), it logs to a file instead of stdout/stderr (Kubernetes only captures the streams), or you are reading the current instance instead of \`--previous\`.

**What does exit code 137 mean?**
128 + 9: the process received SIGKILL. With \`Reason: OOMKilled\` in describe, it exceeded its memory limit. Without that reason, something else killed it — investigate rather than assume.

**How long are Kubernetes events kept?**
Roughly an hour by default — a configurable API server setting that distributions can change. Check early; beyond that, your logging pipeline is the memory.

**My pod is Running but gets no traffic. Where do I look?**
Readiness, then endpoints: the \`READY\` column, probe events in describe, then the Service's endpoints and the selector-vs-labels match (§12 and §15 cover the usual culprits).

## Conclusion

Kubernetes troubleshooting is not a talent for memorising status strings. It is one habit — **describe, events, previous logs, then get inside** — applied calmly, plus a reference for what each symptom usually means. The platform records nearly everything you need; the skill is knowing where it filed it, and getting there before the events expire.
And when the release itself is the problem, the least glamorous move here is often the right first one: roll back to the version that worked, restore calm, and debug the failure like an investigation instead of a fire.

**Related reading on this site:**
- [Self-Healing Infrastructure in Kubernetes](https://www.devopsenginer.com/blog/self-healing-infrastructure-2025) — the probes, autoscaling and remediation patterns that prevent half the errors above
- [Kubernetes Deployment Strategies](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) — rolling back and rolling out, deliberately
- [GitOps vs Traditional CI/CD](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison) — making the manifest the source of truth so "what changed?" is always answerable
  `,
  featuredImage: "/images/blog/self-healing-infrastructure-2025/hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Troubleshooting", "kubectl", "DevOps", "SRE"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "19 min read",
  seo: {
    title: "Kubernetes Troubleshooting in 2026: CrashLoopBackOff, ImagePullBackOff, Pending Pods and 20+ Errors \u2014 Diagnosis Steps That Actually Work",
    description: "CrashLoopBackOff, ImagePullBackOff, Pending pods, OOMKilled and 20+ more Kubernetes errors \u2014 diagnosed with one calm sequence: describe, events, previous logs, then get inside. Diagnosis steps that actually work.",
    keywords: "Kubernetes troubleshooting, CrashLoopBackOff, ImagePullBackOff, Pending pod, OOMKilled, kubectl debug, Kubernetes errors 2026"
  }
};
