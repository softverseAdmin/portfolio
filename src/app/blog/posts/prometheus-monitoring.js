// Prometheus in 2026: Metrics, PromQL and Alerting That Pages Only When It Matters
export const prometheusMonitoringBlog = {
  id: 46,
  title: "Prometheus in 2026: Metrics, PromQL and Alerting That Pages Only When It Matters",
  slug: "prometheus-monitoring-guide-2026",
  excerpt: "A practical guide to Prometheus monitoring: the pull model and metric types, RED and USE methods, cardinality discipline, essential PromQL patterns, recording rules, symptom-based alerting with Alertmanager, and honest retention with remote-write storage.",
  content: `
# Prometheus in 2026: Metrics, PromQL and Alerting That Pages Only When It Matters

> **TL;DR:** Prometheus fails teams in two predictable ways: cardinality explosions from unbounded labels, and alert noise that trains everyone to ignore pages. The fixes are disciplines, not features. Model metrics as counters, gauges, and histograms with small, bounded label sets; measure services with RED (rate, errors, duration) and resources with USE (utilisation, saturation, errors); compute ratios and quantiles with recording rules so dashboards and alerts stay fast; and alert on user-visible symptoms with an action attached — via Alertmanager grouping and inhibition — never on every cause you can measure. Keep Prometheus itself for what it is (superb short-to-medium-term metrics), and remote-write to long-term storage when history matters.

## The model in one picture

Prometheus **pulls**: on an interval, it scrapes an HTTP endpoint (conventionally \`/metrics\`) on each target, parses the exposition format, and stores samples in a time-series database. A **time series** is a metric name plus a set of labels — \`http_requests_total{job="api", status="200"}\` — and each unique combination is a separate series with its own storage and query cost. That one sentence explains almost every Prometheus behaviour and failure mode in this guide.

Three metric types do the work:

- **Counters** only increase (requests served, errors seen). You almost never graph a counter raw; you graph its \`rate()\` — which also handles counter resets when a process restarts.
- **Gauges** go up and down (queue depth, memory in use, in-flight requests). Current value, min/max/avg over a window — no rate needed.
- **Histograms** count observations into buckets (\`le\` labels), which is what makes server-side quantiles possible: \`histogram_quantile()\` aggregates across instances, which summary-type metrics cannot do correctly. Choose bucket boundaries around the latencies you actually care about — your SLO threshold must live inside your buckets to be measurable.

## What to measure: RED and USE

Instrumentation fails by excess more often than by absence. Two checklists keep it purposeful:

- **RED for every service and endpoint that matters:** request **Rate**, **Errors** (ratio, not just count), **Duration** (histogram). This is the user-visible truth of a service, and the raw material of every good alert below.
- **USE for every resource:** **Utilisation** (busy fraction), **Saturation** (queued work — the earliest warning), **Errors**. CPU steal aside, saturation metrics are the ones that predict incidents instead of narrating them.

Everything else — business metrics, per-feature counters, debug detail — is optional gravy. High-cardinality detail belongs in **logs** (the logging guide's correlation IDs are exactly for this), not in labels.

## Cardinality: the budget everyone blows

Series count is the product of label-value combinations. A metric with 10 endpoints × 5 status codes × 4 instances is 200 series — fine. Add a \`user_id\` label and it becomes millions — the database slows, memory climbs, queries time out, and the postmortem writes itself. The rules:

- **Labels identify dimensions with few, bounded values**: endpoint (normalised — \`/users/123\` becomes \`/users/:id\` before it is a label), status class or code, method, instance, zone, version.
- **Never label with unbounded values**: user IDs, request IDs, session tokens, full URLs, error message text. Each is a series factory.
- **Scrape-time relabeling is the safety net**: Prometheus can drop or rewrite label values during scraping — the place to strip an offending label from a third-party exporter you cannot change.
- **Watch the budget**: the targets and metrics with the highest series counts should be known numbers in your stack, reviewed like cloud spend (the Kubernetes cost guide makes the same argument for compute).

## PromQL that earns its keep

Four patterns cover most production questions:

**Error ratio** (the alert-worthy form of errors):

\`\`\`promql
sum(rate(http_requests_total{job="api", status=~"5.."}[5m]))
/
sum(rate(http_requests_total{job="api"}[5m]))
\`\`\`

**Latency quantile from a histogram:**

\`\`\`promql
histogram_quantile(0.95,
  sum by (le) (rate(http_request_duration_seconds_bucket{job="api"}[10m])))
\`\`\`

**Saturation** — in-flight work versus capacity is usually a gauge ratio; the shape matters more than the exact metric names.

**Absence detection** — \`absent()\` catches the series that *stopped*, which is how dead exporters and vanished jobs announce themselves; pair it with a dead man's switch on the alerting pipeline itself, so "no alerts" can be distinguished from "alerting is broken."

Two habits separate useful PromQL from fragile PromQL: always \`rate()\` counters (never subtract samples by hand), and aggregate with \`sum by (...)\` naming exactly the labels you intend to keep — a query that silently sums across a label you cared about produces confident, wrong dashboards.

## Recording rules: pay for queries once

Dashboards and alerts re-run the same expressions relentlessly. **Recording rules** precompute them into new series on an interval:

\`\`\`yaml
groups:
  - name: api-slo
    interval: 30s
    rules:
      - record: job:http_error_ratio:5m
        expr: |
          sum(rate(http_requests_total{job="api", status=~"5.."}[5m]))
          /
          sum(rate(http_requests_total{job="api"}[5m]))
\`\`\`

Now the alert is trivial, fast, and testable against the recorded series:

\`\`\`yaml
      - alert: ApiHighErrorRate
        expr: job:http_error_ratio:5m > 0.05
        for: 10m
        labels:
          severity: page
        annotations:
          summary: "API 5xx ratio above 5% for 10 minutes"
          runbook_url: "https://wiki.example.com/runbooks/api-errors"
\`\`\`

Note the anatomy of a good alert: a symptom (error *ratio*, sustained), a \`for\` duration that ignores blips, a severity, and a **runbook link**. An alert without a next action is a notification, not an alert.

## Alerting philosophy: symptoms page, causes ticket

Alert fatigue is an availability risk in its own right — a team paged twenty times a night stops reading page one. The discipline that fixes it:

- **Page on symptoms users feel**: error ratio, latency burn, saturation of the user path. These have a natural threshold — the SLO — and a natural owner.
- **Ticket (or dashboard) the causes**: disk filling, a replica down, a certificate ageing. Important, rarely 3 a.m.-shaped; a Deployment with one of three replicas down is healthy by design and should page nobody.
- **Burn-rate thinking**: rather than a single static threshold, alert on how fast the error budget is being consumed (fast burn pages, slow burn tickets). Recording rules make multi-window burn alerts practical; the concept matters more than any specific window pair.
- **Alertmanager does the traffic control**: **grouping** collapses a hundred instance alerts from one outage into one notification; **inhibition** suppresses downstream symptom alerts while a known root alert fires; **silences** mute deliberately during maintenance; **routing** sends each alert to the team that owns the action. Configure these on purpose — default Alertmanager behaviour is a starting point, not a design.

## Architecture and storage honesty

- **Local retention is short by design.** A Prometheus server's local TSDB commonly retains around 15 days by default; that is a feature of its role — fast, recent, operational metrics — not a limitation to apologise for.
- **Long-term history goes elsewhere**: remote-write to Thanos, Grafana Mimir, or VictoriaMetrics (the common open options) when you need months of data for capacity and trend work. Keep the operational Prometheus queryable even if the long-term tier is down.
- **Federation is rarely the answer** it first appears to be; hierarchical scraping duplicates data and queries painfully. Prefer remote-write and per-team/per-cluster servers with a global query layer.
- **In Kubernetes**, the Prometheus Operator's \`ServiceMonitor\`/\`PodMonitor\` resources turn scrape config into the same GitOps-reviewed YAML as everything else in this series (the observability guide covers the wider stack); \`kube-state-metrics\` supplies object state (pending pods, failed jobs, replica mismatches) and node exporter supplies host USE metrics. Watch the operator's own cardinality — Kubernetes state is prolific.
- **Short-lived jobs** can't be scraped on an interval; the Pushgateway exists for them, with real caveats: it doesn't expire series for you, and pushed metrics lose the scrape's health signal. Prefer recording outcomes from the platform side (the Jobs guide's failure conditions) or pushing sparingly and deliberately.

## Common mistakes

- **Unbounded labels**, the cardinal sin above — most often a well-meant \`user_id\`, \`path\`, or \`error\` label that turns a metric into a million series over a weekend.
- **Alerting on causes.** CPU at 80% pages; the error budget untouched. Pages spent on non-symptoms are how real symptoms get muted.
- **Counters graphed raw** — ever-climbing lines that say nothing; or worse, alerts on them. \`rate()\` exists; use it.
- **Averaging quantiles.** Averaging per-instance p95s produces a number that is no instance's p95 and nobody's truth. Histograms plus \`histogram_quantile\` over the aggregate is the correct shape.
- **No recording rules on heavy dashboards** — the same 30-day, high-cardinality query from every open browser tab, grinding the server that is supposed to diagnose the incident.
- **Treating Prometheus as the archive.** Local retention quietly rotates; the quarter's capacity review finds 15 days of data. Decide the retention tiers like log retention (logging guide): hot and short in Prometheus, long in the remote tier.
- **Silent alerting pipeline.** Alertmanager down, webhook expired, routing typo — discovered during the incident it existed to announce. A dead man's switch (an always-firing alert whose *absence* pages) is the standard guard.

## Where this fits

Prometheus is the metrics pillar of the observability guide's triad: metrics say *what and how much*, logs say *what exactly*, traces say *where in the path*. The discipline rhymes across all three — bounded cardinality here, volume control in logging, sampling in tracing — because all three are the same budget wearing different clothes: keep the signal, shed the noise, and make sure the alerting end of the pipeline deserves the trust the team puts in it.

## FAQ

**Prometheus or Grafana — do I need both?**
They are different layers: Prometheus collects and stores metrics and evaluates alerts; Grafana visualises (Prometheus has a basic built-in UI for queries, not dashboards). Most stacks run Prometheus (+ Alertmanager) for data and alerting, Grafana for dashboards — Grafana also fronts logs and traces, which is where the triad becomes one investigation.

**Pull or push — which is right?**
Pull, by default: it gives Prometheus target health for free (\`up\` series), centralises interval control, and survives target restarts gracefully. Push (Pushgateway) is the exception for genuinely short-lived batch work, used with its caveats in mind.

**How long should Prometheus retain data?**
Operationally, two to four weeks local is common and usually plenty for incident work. Anything longer belongs in a remote-write long-term tier, where storage is cheaper and the queries are trend-shaped rather than incident-shaped.

**Prometheus or OpenTelemetry?**
Complementary, not rivals. OpenTelemetry is instrumentation and pipelines (APIs, SDKs, the Collector); Prometheus is a metrics backend with its own exposition format, which OTel can produce and feed (directly or via remote-write-compatible paths). Many stacks instrument with OTel and still query with PromQL.

**When have I outgrown a single Prometheus?**
When scrape volume, cardinality, or query load makes the single server the bottleneck — symptoms are scrape duration creeping toward the interval, slow range queries, and memory pressure dominated by series churn. The step is sharding by team/cluster plus a remote-write tier, not a bigger instance forever.
  `,
  featuredImage: "/images/blog/kubernetes-deployment-strategies-2025-complete-guide/k8s-deployment-hero.jpg",
  category: "Observability",
  tags: ["Prometheus", "Monitoring", "Observability", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "9 min read",
  seo: {
    title: "Prometheus in 2026: Metrics, PromQL and Alerting That Pages Only When It Matters",
    description: "A practical guide to Prometheus monitoring: the pull model and metric types, RED and USE methods, cardinality discipline, essential PromQL patterns, recording rules, symptom-based alerting with Alertmanager, and honest retention with remote-write storage.",
    keywords: "Prometheus monitoring, PromQL, Alertmanager, recording rules, metric cardinality, histogram_quantile, RED method, observability 2026"
  }
};
