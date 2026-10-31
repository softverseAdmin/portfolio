// Helm Charts Tutorial 2026: Package, Template and Ship Kubernetes Apps Without YAML Sprawl
export const helmChartsTutorialBlog = {
  id: 24,
  title: "Helm Charts Tutorial 2026: Package, Template and Ship Kubernetes Apps Without YAML Sprawl",
  slug: "helm-charts-tutorial-2026",
  excerpt: "Helm is the package manager for Kubernetes: one chart, many environments, no copy-pasted YAML. Chart anatomy, the templating that matters, per-environment values, OCI registries, and safe upgrade/rollback \u2014 updated for Helm 4, with the Helm 3 end-of-life dates you need.",
  content: `
# Helm Charts Tutorial 2026: Package, Template and Ship Kubernetes Apps Without YAML Sprawl

> **TL;DR:** Helm is the package manager for Kubernetes. A *chart* bundles your manifests as templates plus a \`values.yaml\` of knobs, so one codebase deploys to dev, staging and production without copy-pasted YAML. Learn the chart layout, the five templating ideas that cover 90% of real charts, per-environment values, OCI registries for sharing, and the day-2 commands (\`upgrade --install\`, \`rollback\`, \`--atomic\`) — plus the mistakes that turn charts into a maintenance burden.

## Why Helm exists: the three-copy problem

Every Kubernetes app starts the same way: a Deployment, a Service, maybe an Ingress, written as plain YAML. It works — until the second environment arrives.

Now the image tag differs. The replica count differs. The hostname differs. So the YAML gets copied into \`app-dev/\`, \`app-staging/\`, \`app-prod/\`, and from that day forward every change is made three times — or, more honestly, made twice and forgotten once, which is how "works in staging" becomes a production incident.

I learned this shape of pain on my own projects long before I met Helm formally: small deploys, hand-edited files, and that specific dread of changing a manifest you know exists in three places. Helm's answer is simple and, seven years into working around infrastructure, I think it's the right one: **keep one templated copy of the manifests, and let each environment supply only the values that differ.**

## The four concepts you actually need

- **Chart** — the package: templates + default values + metadata. Think of it as the installer source code.
- **Values** — the knobs. A chart ships \`values.yaml\` defaults; each install overrides some of them.
- **Release** — one installed instance of a chart in a cluster. The same chart can be installed many times (per environment, per tenant) under different release names.
- **Repository / registry** — where charts are shared. In 2026 the modern default is an **OCI registry** (the same registries that hold your container images); classic HTTP chart repositories with an \`index.yaml\` still exist and still work.

Everything else in Helm is refinement of those four ideas.

## Install Helm and look around

\`\`\`bash
# macOS
brew install helm

# Anywhere with a shell (inspect the script before piping it, as always)
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4 | bash

helm version
helm --help
\`\`\`

Helm is a single client-side binary. There is no server component in your cluster (the old Helm 2 "Tiller" is long gone) — Helm renders templates, talks to the Kubernetes API like \`kubectl\` does, and stores release state in Secrets in the release's namespace.

**Helm 4 or Helm 3 in 2026?** Helm 4 (released November 2025) is the current major version — install it for anything new. Helm 3 is in its end-of-life runway: its last feature release shipped in September 2026 and it receives security fixes only until February 10, 2027. The good news: the migration is deliberately boring. Charts written for Helm 3 deploy with Helm 4, and releases managed by Helm 3 can be upgraded by Helm 4 — you swap the binary, not your charts. Everything in this tutorial works the same on both.

## Anatomy of a chart

Scaffold one and read it — the generated chart teaches the layout better than any diagram:

\`\`\`bash
helm create myapp
\`\`\`

\`\`\`
myapp/
├── Chart.yaml          # name, version, appVersion, dependencies
├── values.yaml         # every knob, with defaults
├── charts/             # vendored subcharts (dependencies)
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── serviceaccount.yaml
    ├── hpa.yaml
    ├── _helpers.tpl    # named templates (labels, full names)
    └── NOTES.txt       # printed to the user after install
\`\`\`

Two version fields confuse everyone once:

- \`version\` in Chart.yaml — the **chart's** version. Bump it on every chart change; it's what your registry stores and what installs pin.
- \`appVersion\` — the **application's** version (e.g. your image tag default). Metadata for humans and tooling.

## Templating: the 20% that does 80% of the work

Helm templates are Go templates. You do not need the whole language — five ideas cover almost every real chart:

**1. Substituting a value**

\`\`\`yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
\`\`\`

\`.Values\` is the merged result of the chart's defaults plus your overrides. \`.Chart\` and \`.Release\` expose chart metadata and install-time facts (\`.Release.Name\`, \`.Release.Namespace\`).

**2. The standard labels — use the helpers, don't hand-roll them**

The scaffold's \`_helpers.tpl\` defines named templates like \`myapp.labels\`. Every resource should include them:

\`\`\`yaml
metadata:
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
\`\`\`

Consistent labels are not cosmetics — selectors, monitoring and cost tooling all key off them. (And in our [requests and limits guide](https://www.devopsenginer.com/blog/kubernetes-resource-requests-limits-guide-2026) you'll see why labels matter when you start auditing usage per app.)

**3. Conditionals — optional resources**

\`\`\`yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
...
{{- end }}
\`\`\`

This is how one chart serves the environment that needs an Ingress and the one that doesn't. The \`{{-\` trims whitespace so the rendered YAML stays clean.

**4. Ranges — repeated blocks**

\`\`\`yaml
env:
{{- range .Values.env }}
  - name: {{ .name }}
    value: {{ .value | quote }}
{{- end }}
\`\`\`

**5. Rendering without installing — your most-used command**

\`\`\`bash
helm template myapp ./myapp -f values-prod.yaml | less
\`\`\`

\`helm template\` shows exactly what would be applied. In code review and in CI, this output is the artifact you review — never merge a chart change you haven't rendered.

## Values: one chart, many environments

The pattern that scales:

\`\`\`
myapp/
├── values.yaml         # safe defaults — the chart must install with these alone
├── values-dev.yaml     # 1 replica, debug logging, dev hostname
├── values-staging.yaml
└── values-prod.yaml    # real replicas, resources, TLS hostname
\`\`\`

\`\`\`bash
helm upgrade --install myapp ./myapp -n production -f values-prod.yaml
\`\`\`

Rules I hold myself to, learned the same way as my Jenkins lesson — *every knob you add is a knob you maintain forever*:

- **Defaults must be safe.** \`helm install\` with zero overrides should produce a sane, minimal deployment.
- **One knob, one purpose.** A \`global.everything\` value tree becomes unreviewable within a year.
- **\`--set\` is for experiments, not pipelines.** Overrides buried in CI commands are invisible to review. If a value matters, it belongs in a values file in git. (\`--set\` also has sharp string-typing edges — one more reason.)
- **Secrets do not live in values files.** A values file is committed to git; a password in it is a published password. Pass secrets from your CI secret store at deploy time, or better, reference them from an external secrets system and keep only the *reference* in values. This is the same discipline as in our [AWS IAM least-privilege guide](https://www.devopsenginer.com/blog/aws-iam-least-privilege-guide-2026): the chart should hold pointers, not credentials.

## Dependencies and umbrella charts

\`Chart.yaml\` can declare dependencies — a database chart under your app chart, for instance — and \`helm dependency update\` vendors them into \`charts/\`:

\`\`\`yaml
dependencies:
  - name: web-common        # a shared library chart from your own registry
    version: "1.4.2"        # pin exactly — never a floating range
    repository: "oci://ghcr.io/your-org/charts"
\`\`\`

An "umbrella chart" is just a chart whose main content *is* its dependencies plus shared values — a legitimate way to install a whole stack as one release.

The honest warning, from the same place as my Jenkins plugin lesson: **every subchart is a dependency you now own.** It has its own values schema, its own upgrade cadence, its own breaking changes. Vendor the two you truly need; write the trivial third one yourself as plain templates.

## Sharing charts: OCI registries

Since Helm 3.8, charts are first-class OCI artifacts — they live next to your images in GHCR, ECR, GAR, Docker Hub and friends:

\`\`\`bash
helm package ./myapp                       # -> myapp-0.1.0.tgz
helm push myapp-0.1.0.tgz oci://ghcr.io/your-org/charts
helm install myapp oci://ghcr.io/your-org/charts/myapp --version 0.1.0
\`\`\`

One registry for images and charts simplifies permissions, scanning and retention enormously versus running a separate chart repository server. If you already have a registry, you already have chart hosting.

## Day 2: upgrade, rollback, and the flags that save you

\`\`\`bash
# Install or upgrade in one idempotent command — the CI/CD-friendly form
helm upgrade --install myapp ./myapp -n production -f values-prod.yaml \\
  --wait --atomic --timeout 5m

helm history myapp -n production     # every revision, kept by Helm
helm rollback myapp 3 -n production  # back to revision 3
helm uninstall myapp -n production
\`\`\`

Know these flags cold:

- \`--wait\` — don't call it success until the workloads are actually ready.
- \`--atomic\` — if the upgrade fails, roll back automatically. Combined with \`--wait\`, this is the difference between a failed deploy and an outage. (The strategies these protect are in our [Kubernetes deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide).)
- Release **history is kept in the cluster**, so \`helm rollback\` works even if git is unavailable mid-incident — one of the few rollback stories that holds up at 3 a.m. When GitOps enters the picture, Argo CD can deploy Helm charts too and adds its own sync/rollback layer on top — see our [Argo CD tutorial](https://www.devopsenginer.com/blog/argo-cd-tutorial-gitops-2026).

And when a release does break: debug the *rendered manifests* and pod state, not the templates. Our [Kubernetes troubleshooting guide](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) covers the failure modes you'll meet.

## Quality gates: lint, render, test in CI

Charts are code; treat them like it. A minimal GitHub Actions gate for a chart repo — my own projects live on GitHub, and Actions is where I'd start any small team today:

\`\`\`bash
helm lint ./myapp
helm template myapp ./myapp -f values-prod.yaml > /dev/null   # renders without errors?
\`\`\`

Add schema validation of the rendered output against real Kubernetes schemas, and render with *every* values file you ship — a chart that only renders with defaults is a chart that breaks in production. Chart-testing tools (\`ct lint-and-install\` in a throwaway cluster) are the heavier option when the chart is public or widely shared.

## Helm vs Kustomize vs plain YAML

| | Helm | Kustomize | Plain manifests |
|---|---|---|---|
| Model | Templates + values | Overlays patching base YAML | Files as-is |
| Best at | Packaging, sharing, versioned releases | Per-environment patches without templating | One app, one environment, tiny surface |
| Watch out for | Template cleverness; values sprawl | Patch drift as overlays multiply | The three-copy problem |
| Rollback story | Built-in release history | Whatever your pipeline provides | Whatever your pipeline provides |

This is not a religious choice. Plenty of healthy setups use Helm for third-party software (where packaging shines) and Kustomize or plain YAML for first-party apps. Pick per workload, and notice which one your team can still read at 3 a.m.

## Mistakes that make charts age badly

1. **Templating everything.** If a value has never differed between environments, it doesn't need to be a knob. Hard-code it; delete the knob.
2. **Copying a giant chart and trimming.** Start from \`helm create\`, add what you use. Inherited complexity is still complexity.
3. **Unpinned dependency versions.** \`version: "*"\` in a dependency is a surprise scheduled for later.
4. **Secrets in values files.** Covered above — worth repeating because it's the mistake with real consequences.
5. **Never rendering in review.** The diff that matters is the rendered manifest diff. Template diffs hide the actual change.
6. **Treating chart version and app version as one number.** They version different things; conflating them breaks pinning within a month.

## FAQ

**Is Helm still relevant in 2026, or did GitOps replace it?**
They solve different layers. Helm packages and templates; GitOps tools reconcile desired state from git. Argo CD and Flux both deploy Helm charts natively — most GitOps setups use Helm *inside* them.

**Should I write my own chart or use a community one?**
For standard infrastructure software (ingress controllers, cert-manager, databases for non-critical tiers), a maintained community chart plus your values file is the pragmatic default. For your own application, a small chart you own beats a fork of a giant one.

**How do I handle different resource sizes per environment?**
Put \`resources\` in values with sane defaults and override per environment file — that's exactly the dev/prod split values files exist for. Set requests and limits deliberately; don't template them away into someone else's defaults.

**Can one chart deploy to multiple namespaces or tenants?**
Yes — a release is per-namespace, so install the same chart under different release names with different values files. That's a feature; just keep the values files in git so each tenant's configuration is reviewable.

**What's the difference between \`helm install\` and \`helm upgrade --install\`?**
\`upgrade --install\` is idempotent: it installs if the release is absent and upgrades if it exists. That one property makes it the only form you should use in scripts and pipelines.

**I'm still on Helm 3. How urgent is the move to Helm 4?**
Plan it, don't panic. Helm 3's last feature release shipped in September 2026 and security fixes end on February 10, 2027, so the binary should be swapped before then. Because Helm 4 deploys Helm 3 charts and can take over Helm 3 releases, the upgrade is: install the Helm 4 binary, run your normal upgrade commands, verify. Do it in staging first, like any tool upgrade -- but there is no chart rewrite waiting for you.

## Conclusion

Helm earns its place the first time you change an image tag in exactly one values file instead of three directories of YAML. Keep charts small, defaults safe, dependencies pinned and few, secrets out of values, and rendered output in every review -- and Helm stays what it should be: boring packaging machinery between your git repo and your cluster. If you are standardising how your team ships to Kubernetes, pair this with the [deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) for *how* releases should roll, and the [troubleshooting guide](https://www.devopsenginer.com/blog/kubernetes-troubleshooting-guide-2026) for when a release misbehaves anyway.
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Kubernetes",
  tags: ["Kubernetes", "Helm", "DevOps", "GitOps", "CI/CD"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "12 min read",
  seo: {
    title: "Helm Charts Tutorial 2026: Package, Template and Ship Kubernetes Apps Without YAML Sprawl",
    description: "Helm is the package manager for Kubernetes: one chart, many environments, no copy-pasted YAML. Chart anatomy, the templating that matters, per-environment values, OCI registries, and safe upgrade/rollback \u2014 updated for Helm 4, with the Helm 3 end-of-life dates you need.",
    keywords: "Helm charts tutorial, Helm 4, Helm 3 end of life, helm create, values.yaml, Helm OCI registry, helm upgrade install, Helm vs Kustomize"
  }
};
