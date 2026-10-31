// Kubernetes Networking & Ingress Basics (2026): Pods, Services, DNS and Getting Traffic In
export const kubernetesIngressNetworkingBlog = {
  id: 23,
  title: "Kubernetes Networking & Ingress Basics (2026): Pods, Services, DNS and Getting Traffic In",
  slug: "kubernetes-ingress-networking-basics-2026",
  excerpt: "Every pod gets a real IP; Services point at pods by label; CoreDNS names them; an Ingress controller \u2014 not the Ingress object \u2014 opens the front door. The Kubernetes networking model explained plainly, with the ninety-second diagnosis path for when traffic won't flow.",
  content: `
# Kubernetes Networking & Ingress Basics (2026): Pods, Services, DNS and Getting Traffic In

> ## TL;DR
>
> - **The model in one line:** every pod gets a real IP and can talk to every other pod; Services give those shifting pods a stable address; Ingress (or Gateway API) is the front door for HTTP from outside.
> - **A Service doesn't contain pods — it points at them,** via label selectors, and the live list of targets is the EndpointSlice. "Service exists but nothing answers" almost always means the selector and the pod labels disagree.
> - **Cluster DNS is the phone book:** \`service.namespace.svc.cluster.local\`, resolved by CoreDNS. Most "the app can't reach the database" bugs are DNS or selector bugs wearing a network costume.
> - **Ingress is just rules; an Ingress *controller* is the thing that enforces them.** An Ingress object with no controller installed does exactly nothing, silently.
> - **Default network policy is "allow everything."** NetworkPolicy is opt-in restriction, and only works if your CNI plugin enforces it.

Networking is where Kubernetes stops feeling like a deployment tool and starts feeling like its own little internet — because that's what it is. Every other Kubernetes concept routes through it eventually: services that won't answer, pods that can't resolve names, an Ingress that exists but admits no traffic. Newcomers often meet these as separate mysteries. They're one system with a few moving parts, and once the model clicks, most Kubernetes "network issues" turn out to be small disagreements between labels, names and rules — visible in about ninety seconds with the right commands.

This is the map I wish were standard issue: how pod networking actually works, what Services really do, how DNS names are built, what Ingress adds (and what it doesn't), and where NetworkPolicy fits. It pairs with the [troubleshooting guide](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026), which covers these same pieces from the "it's broken at 2 a.m." angle.

## The pod network: flat, NAT-less, per-pod IPs

Kubernetes imposes a deliberately simple model on whatever network sits underneath:

- **Every pod gets its own IP address**, unique in the cluster.
- **Pods can reach all other pods on any node without NAT** — a pod's IP is the real destination, not a port-forward fiction.
- **Nodes (and the control plane agents on them) can reach pods**, and pods can reach nodes.

That's it. Your CNI plugin (Calico, Cilium, your cloud's VPC CNI, and friends) is the machinery that makes those three promises true on real infrastructure — routes, overlays or cloud-native routing under the hood. The consequence for application authors is liberating: pods behave like little VMs on one flat network. A container binds port 8080 and it's reachable at \`pod-ip:8080\` from anywhere in the cluster. No port mapping, no per-host negotiation.

Two follow-on truths. First, **pod IPs are disposable** — pods are rescheduled, replaced and scaled, and yesterday's IP is gone. Anything that hardcodes a pod IP is broken in advance. Second, because the network is flat by default, **reachability is not security**: every pod can attempt every other pod unless you add policy. Both truths explain why the next two layers exist.

## Services: a stable address for unstable pods

A Service is a stable virtual address (and DNS name) in front of a set of pods chosen by a **label selector**. Kubernetes continuously computes the matching pods into **EndpointSlices** — the live list of pod IPs and ports the Service currently points at — and kube-proxy on each node programs the node's packet rules (iptables, IPVS or nftables mode, depending on setup) so traffic to the Service address is forwarded to one of those backends.

The types, by reach:

- **ClusterIP** (default): reachable only inside the cluster. The workhorse for service-to-service calls.
- **NodePort**: also opens a port on every node's IP. Mostly a building block (and a debugging convenience) rather than a production front door.
- **LoadBalancer**: asks your cloud for a real load balancer pointing at the Service. The standard way to expose something externally on managed Kubernetes.
- **ExternalName**: a DNS alias to an outside name — no proxying, just a CNAME the cluster resolves.

Two behaviours worth internalising. A normal Service **load-balances per connection**, with no smartness about load or latency promised — it's a fair, dumb distributor, which is what you want at this layer. And a Service with \`clusterIP: None\` — a **headless Service** — skips the virtual IP entirely and returns the pod IPs via DNS instead, which stateful systems (and the StatefulSets that run them) use to address individual members.

The failure mode that teaches the model fastest: create a Service whose selector matches nothing and you get a perfectly healthy-looking object that routes to zero pods. \`kubectl describe service\` shows empty endpoints, and the fix is always labels — see the troubleshooting guide's entry on exactly this.

## Cluster DNS: the names everything actually uses

CoreDNS runs in the cluster and answers for a predictable namespace:

- A Service is reachable as **\`<service>.<namespace>\`** from inside its own namespace, and as **\`<service>.<namespace>.svc.cluster.local\`** from anywhere.
- Pod DNS records and StatefulSet member names follow similar patterns, which is how \`db-0.db-headless.production\` style addressing works.

Pods are configured with search domains so the short form just works in-namespace — which is also why the same short name can silently resolve to a *different* service in a different namespace. When service A "can't reach the database", the checklist is short and almost never about the network fabric: is the name right *for this namespace*, does the Service exist, does it have endpoints. Name resolution failures (\`nslookup\` from a debug pod is the classic test) separate "DNS problem" from "routing problem" in one step.

## Ingress: HTTP routing rules — plus the controller that runs them

Pods and Services handle traffic *inside* the cluster. For HTTP(S) coming from *outside*, Kubernetes' classic answer is Ingress: one object declaring host- and path-based routing and TLS termination:

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
    - hosts: ["app.example.com"]
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
\`\`\`

The critical understanding: **an Ingress object is a request, not a worker.** Nothing in Kubernetes itself reads it. An **Ingress controller** — ingress-nginx, a cloud provider's controller, Traefik, HAProxy and others — watches for Ingress objects and configures an actual reverse proxy/load balancer to honour them. No controller installed means Ingress objects accumulate cheerfully while admitting zero traffic (another silent failure the troubleshooting guide covers). The \`ingressClassName\` field says *which* controller should claim the object when several are installed, and the annotations — like the rewrite above — are controller-specific dialect: powerful, and the least portable part of any Ingress you'll write.

On direction: Ingress itself is **feature-frozen** — stable, supported, and finished. Its designated successor is the **Gateway API**, whose core resources (Gateway, HTTPRoute) reached general availability, with richer routing, cleaner role separation (infrastructure vs application owners), and portability goals Ingress never had. Practical guidance for 2026: existing Ingress setups are fine and widely supported; new, complex HTTP routing is increasingly a Gateway API conversation; and either way, the Service-and-endpoints layer underneath is identical.

## NetworkPolicy: the firewall that isn't there by default

Out of the box, the flat network allows all pod-to-pod traffic. **NetworkPolicy** is how you carve it down: policies select pods and declare which ingress (inbound) and egress (outbound) traffic is allowed — by pod labels, namespaces, IP blocks and ports.

Three facts prevent the usual surprises:

- **Policies are additive allow-lists.** Once any policy selects a pod for a direction, that direction becomes default-deny except what policies allow. One small policy can isolate more than its author intended — test in a non-production namespace first.
- **Enforcement is the CNI's job.** A cluster whose plugin doesn't enforce NetworkPolicy will accept your objects and ignore them, the same silent pattern as Ingress without a controller. Verify enforcement with an actual blocked request, not with \`kubectl get networkpolicy\`.
- **DNS is egress too.** A policy that allows a pod to reach the database but forgets UDP/TCP 53 to the cluster DNS creates an app that can resolve nothing — the most common self-inflicted "network outage" in policy rollouts.

A sensible starting posture for most teams: default-deny ingress+egress per namespace, then allow the specific flows (app → database, everything → DNS, ingress controller → app). Small, explicit, and reviewable in the same PR style as everything else in GitOps.

## The ninety-second diagnosis path

When traffic doesn't flow, in order:

1. \`kubectl get endpointslice\` (or \`describe service\`) — does the Service actually have backends? Empty means labels.
2. DNS: resolve the Service name from inside a pod in the same namespace — separates naming from routing.
3. \`kubectl describe ingress\` / the controller's logs — is a controller claiming and configuring your rules?
4. NetworkPolicies in the namespace — did a recent policy select your pods?
5. Only then: nodes, CNI, cloud load balancer health — the layers where genuinely hard problems live, in that order of rarity.

## FAQ

**Is a Service's ClusterIP a real address?**
It's a virtual IP — no interface owns it; kube-proxy's rules intercept traffic to it and forward to a backend pod. That's why you can't ping it meaningfully (no ICMP handling) while TCP connections work fine.

**Why NodePort's weird high port range?**
NodePort allocates from a reserved range (default 30000–32767) on every node — it's designed as a plumbing layer for load balancers and bare-metal setups, not as a user-facing address scheme.

**Should I learn Ingress or skip straight to Gateway API?**
Learn the model once — Services, endpoints, DNS — because both sit on it. You'll meet Ingress in most existing estates for years; you'll meet Gateway API in new platform builds. Reading one after knowing the other takes an afternoon.

**My Ingress exists but the address column is empty. Why?**
Usually: no controller, or no controller with that IngressClass, or the cloud load balancer is still provisioning (watch events). \`kubectl describe ingress\` and the controller namespace's logs answer it directly.

**Do NetworkPolicies apply to traffic from outside the cluster?**
They govern pod traffic, including traffic arriving via Services/Ingress at the pod boundary — but the full path (cloud LB, NodePort) involves other layers too. Treat policy as the pod-level firewall, not the whole perimeter.

## Conclusion

Kubernetes networking looks sprawling until you name its few parts: a flat pod network with real IPs, Services as stable pointers maintained by selectors and EndpointSlices, CoreDNS turning those Services into names, Ingress/Gateway as the HTTP front door that only works when a controller runs it, and NetworkPolicy as the opt-in firewall on top. Nearly every "network problem" is one of those parts disagreeing with another — and every part can be inspected with a describe and a get.

Learn to read those five surfaces and the cluster's little internet stops being mysterious. It becomes what it was designed to be: boring, inspectable plumbing that your applications can simply stand on.

**Related reading on this site:**
- [Kubernetes Troubleshooting in 2026](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) — the failure-driven companion: empty endpoints, DNS timeouts, Ingress with no address
- [kubectl Commands Cheat Sheet](https://www.devopsenginer.com/blog/kubectl-commands-cheat-sheet-2026) — the \`describe\`, \`get endpointslice\` and port-forward commands used here
- [Kubernetes Resource Requests and Limits (2026)](https://www.devopsenginer.com/blog/kubernetes-resource-requests-limits-guide-2026) — the other invisible layer: the numbers the scheduler spends while the network routes
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Networking", "Ingress", "DevOps", "DNS"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "Kubernetes Networking & Ingress Basics (2026): Pods, Services, DNS and Getting Traffic In",
    description: "Every pod gets a real IP; Services point at pods by label; CoreDNS names them; an Ingress controller \u2014 not the Ingress object \u2014 opens the front door. The Kubernetes networking model explained plainly, with the ninety-second diagnosis path for when traffic won't flow.",
    keywords: "Kubernetes networking, Kubernetes Ingress, ClusterIP NodePort LoadBalancer, CoreDNS, EndpointSlice, NetworkPolicy, Gateway API 2026"
  }
};
