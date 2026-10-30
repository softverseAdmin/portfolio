// AWS Cost Optimization in 2026: 15 Tactics That Cut Real Bills (With Checks, Commands, and Honest Impact Ranges)
export const awsCostOptimizationBlog = {
  id: 10,
  title: "AWS Cost Optimization in 2026: 15 Tactics That Cut Real Bills (With Checks, Commands, and Honest Impact Ranges)",
  slug: "aws-cost-optimization-15-tactics-saved-50k-month",
  excerpt: "15 practical AWS cost optimization tactics for 2026 \u2014 right-sizing, Graviton, Savings Plans, Spot, S3 lifecycle rules, NAT gateway fixes, log costs and governance \u2014 each with a check to run and an honest impact range.",
  content: `
# AWS Cost Optimization in 2026: 15 Tactics That Cut Real Bills (With Checks, Commands, and Honest Impact Ranges)

> **An honest note (new — replaces the old "$50K/month" claim):** The previous version of this article claimed these tactics "saved us $50K/month," with a before-and-after bill table. Those numbers were illustrative, not measured from a real account, and presenting them as a personal result was misleading — so this rewrite removes them. Every impact figure below is either an official AWS figure (sourced) or a clearly labelled illustrative range. What you save depends on how much waste your account starts with.

---

## TL;DR

> - Most AWS waste falls into five buckets: oversized compute, storage nobody touches, data transfer you didn't know you were paying for, logs you ingest and never read, and missing governance.
> - **Start here, in order:** (1) delete orphaned EBS volumes/snapshots, (2) schedule non-production off outside working hours, (3) right-size with Compute Optimizer, (4) convert gp2 to gp3, (5) add free S3/DynamoDB gateway endpoints so traffic stops paying NAT gateway tolls. All five are low-risk and need no purchase commitment.
> - Buy Savings Plans only **after** right-sizing — committing first locks waste in for 1–3 years. AWS advertises up to 66% off On-Demand for Compute Savings Plans and up to 72% for EC2 Instance Savings Plans; treat those as ceilings, not expectations (https://aws.amazon.com/savingsplans/).
> - Cost optimization is a monthly routine, not a one-off cleanup. The last section gives a 60–90 minute monthly review agenda.

---

## Why AWS bills surprise people

AWS bills rarely break because of one huge mistake. They leak. An instance sized for a launch-day spike in 2024 still runs in 2026. A dev environment spun up for a two-week test is still on, 24/7. Snapshots accumulate "just in case." Every request a private subnet makes to S3 quietly passes through a NAT gateway that charges per gigabyte. Individually small, together these leaks commonly account for a double-digit percentage of a bill.

Industry surveys put self-estimated wasted cloud spend at roughly a quarter to a third (Flexera's State of the Cloud reports) — but treat any headline percentage with suspicion, including in this article. The useful question is "**where is my account wasting money, and how do I prove it?**" Each tactic below therefore starts with a check — a console page, a Cost Explorer view, or a command — that shows the waste before you touch anything. The 15 tactics are grouped the way bills are grouped: **compute, storage, data transfer, observability/logging, governance**. Each states what to do, how to check, expected impact (qualitative, or an illustrative range labelled as such), and effort/risk.

## Start here: the first five moves, in order

Ordered by risk-adjusted return — free or nearly free, reversible, no long-term commitment:

1. **Delete orphaned storage** (Tactic 6). Volumes and snapshots attached to nothing bill you monthly for nothing.
2. **Schedule non-production off** (Tactic 5). Dev/test used ~55 hours a week but running 168 pays roughly triple.
3. **Right-size with Compute Optimizer** (Tactic 1). AWS's tool reads your real CloudWatch history and finds the oversized instances.
4. **Convert gp2 to gp3** (Tactic 7). One command, no downtime, 20% lower price per GB.
5. **Add S3/DynamoDB gateway endpoints** (Tactic 10). Free — every gigabyte they carry stops paying NAT processing fees.

Everything after these five needs a commitment (Savings Plans), a migration (Graviton, Spot), or a habit (governance) — built on a cleaned-up baseline.

Most of my own AWS projects are learning projects: I spin things up to try them, and the bill is often what teaches me what I forgot to clean up. So the first tactic I reach for is the waste hunt — unattached volumes, old snapshots, and resources I created for a test and forgot. It costs nothing, needs no architecture changes, and it is where the first savings usually hide.

---

## Compute

### Tactic 1 — Right-size EC2 and Auto Scaling groups with Compute Optimizer

**What to do.** Most instances are sized from a guess made under deadline pressure, then never revisited. AWS Compute Optimizer analyses your CloudWatch history (14 days minimum; longer lookback options exist) and recommends instance types matching actual utilisation, including Graviton options. Apply recommendations to EC2 instances and Auto Scaling groups — non-production first, then production behind a canary or load test.

**How to check.** Open **Compute Optimizer** (opt-in per account/Region; the service itself is free) and sort EC2 recommendations by estimated monthly savings, or use the CLI:

\`\`\`bash
aws compute-optimizer get-ec2-instance-recommendations \\
  --query 'instanceRecommendations[].{Instance:instanceArn,Current:instanceType,Recommended:recommendationOptions[0].instanceType,Savings:recommendationOptions[0].estimatedMonthlySavings.value}' \\
  --output table
\`\`\`

One blind spot: EC2 memory utilisation only appears if the **CloudWatch agent** is installed and publishing it. Without memory data, verify RAM yourself before downsizing memory-heavy services.

**Expected impact.** Usually the largest compute lever on an account that has never right-sized, and near zero on one that has. Illustratively, instance pricing roughly doubles per size step, so dropping one size on an instance averaging under 20% CPU typically halves that instance's cost — but measure your own fleet.

**Effort / risk.** Low effort; medium risk if applied blindly to production. Downsize in staging, watch p95 latency and memory for a week, and keep the old type in your launch template so rollback is one change.

### Tactic 2 — Migrate suitable workloads to Graviton (ARM)

**What to do.** AWS positions Graviton processors as delivering up to 40% better price performance than comparable x86 instances for many workloads (https://aws.amazon.com/ec2/graviton/). Graviton families span EC2 (the "g" families, e.g. m7g/r7g/c7g), RDS, ElastiCache, EKS/ECS nodes, and Lambda (arm64). For interpreted or JIT-compiled stacks (Java, Python, Node.js, Go with an arm64 build), migration is often a new AMI or a multi-arch container image.

**How to check.**

\`\`\`bash
aws ec2 describe-instances \\
  --query 'Reservations[].Instances[].{Type:InstanceType,Arch:Architecture,State:State.Name}' --output table
uname -m   # x86_64 today, aarch64 after migration
\`\`\`

Confirm CI can publish multi-arch images (\`docker buildx build --platform linux/amd64,linux/arm64\`). For Lambda, arm64 duration is priced lower per GB-second than x86 (AWS lists 20% lower) — switching the function's architecture is a near-zero-effort win where the runtime supports it.

**Expected impact.** Graviton families typically cost less per instance *and* perform better per core, so combined savings of 20–40% on migrated instances are plausible — illustrative, not a promise; benchmark anything with native dependencies.

**Effort / risk.** Medium. The work is compatibility: native libraries, older AMIs, some agents, anything compiled needs an arm64 build. RDS Graviton classes are a config change plus a failover window — test in staging. Skip instances with weeks of life left.

### Tactic 3 — Buy Savings Plans only after right-sizing

**What to do.** Savings Plans trade a 1- or 3-year hourly spend commitment ($/hour) for lower compute prices. **Compute Savings Plans** (AWS advertises up to 66% off On-Demand) apply automatically across EC2 families, sizes and Regions, and to Fargate and Lambda. **EC2 Instance Savings Plans** (up to 72%) pay more but lock you to one family in one Region. A SageMaker Savings Plan covers ML instances (up to 64%). Databases are **not** covered by compute Savings Plans — for steady RDS/Aurora, Reserved Instances remain the standard tool. Verify current types/rates before buying: https://aws.amazon.com/savingsplans/

**How to check.** **Cost Explorer → Savings Plans → Recommendations** shows a recommended commitment from recent usage, with estimated savings at several levels. Buy conservatively — commit only to the usage floor you're confident will exist in a year, then top up. Afterwards watch **utilisation** and **coverage** monthly; an under-utilised commitment is waste with a contract.

**Expected impact.** A pure price lever: for usage that would have run anyway, the discount is immediate — often the largest single line-item reduction on a stable fleet. Which is why order matters: **right-size first (Tactics 1–2), commit second.** A 40% discount on an instance that should have been deleted is 60% wasted money, now locked in.

**Effort / risk.** Minutes to buy; **high commitment risk** — Savings Plans can't be cancelled or resold. If you expect to migrate or shrink, start with a 1-year term and partial coverage.

### Tactic 4 — Use Spot Instances for interruptible work

**What to do.** Spot sells spare EC2 capacity at up to 90% off On-Demand (AWS's advertised ceiling) in exchange for reclaim with a two-minute interruption warning. Right targets: CI/CD runners, batch and data processing, rendering, stateless web tiers with mixed capacity, and Kubernetes worker nodes. On EKS, the modern pattern is **Karpenter** (or Cluster Autoscaler) provisioning a diverse mix of Spot types and families, so a reclaim in one pool shifts pods to another — diversity is what makes Spot safe.

**How to check.** Group last month's EC2 cost by instance type in Cost Explorer and tag candidates. Each candidate must pass one test: *if this dies with two minutes' warning, does anything break that a retry wouldn't fix?* If yes, it stays On-Demand.

**Expected impact.** For genuinely interruptible fleets, routinely the deepest discount in this list — often well over half off On-Demand for the same capacity, though the exact discount floats with demand. Treat 90% as a ceiling and measure your realised discount after a month.

**Effort / risk.** Medium effort: workloads need checkpointing, queue-based retries, graceful deregistration. The risk is availability, not data — never a lone database, a singleton, or stateful primaries.

### Tactic 5 — Schedule non-production environments off

**What to do.** Dev/test/staging usually mirror production's shape but serve people who work business hours. Stopping EC2 and RDS overnight and on weekends removes roughly 60–70% of runtime hours. Tooling: the **AWS Instance Scheduler** solution (AWS's maintained, tag-driven reference implementation), **EventBridge Scheduler + Lambda** for a lightweight DIY version, or schedule tags from your IaC (this author's stack uses Terraform). For containers, scale EKS node groups to zero and ECS desired counts down.

**How to check.** Filter Cost Explorer by \`Environment=dev|test|staging\` tags (Tactic 14 makes this reliable) and view spend by hour — flat spend at 3 a.m. is the smoking gun. Two gotchas: a **stopped EC2 instance still bills for its EBS volumes** and Elastic IPs; and **RDS can be stopped for at most 7 days** (single-AZ), then auto-restarts — your scheduler must handle that cycle. Note what *cannot* be scheduled: NAT gateways and load balancers are always-on — the original version of this article wrongly listed them here; Tactic 10 handles NAT properly.

**Expected impact.** Arithmetic: an environment used 55 of 168 weekly hours, stopped otherwise, cuts its compute runtime cost by about two-thirds. On accounts with heavy non-prod, routinely a top-three saving.

**Effort / risk.** Low/low. Publish the schedule, add an override tag for release weeks, and keep start-up fast so nobody works around it.

---

## Storage

### Tactic 6 — Delete orphaned EBS volumes and stale snapshots

**What to do.** When an instance terminates without "delete on termination," its volumes detach and keep billing; snapshots taken "temporarily" in 2023 bill too. Find them, confirm ownership, take a final safety snapshot of anything ambiguous, then delete. Protect against the opposite accident with **EC2 Recycle Bin** retention rules, which let you recover accidentally deleted snapshots and AMIs for a defined window. For snapshots kept long-term, **EBS Snapshots Archive** is a cheaper tier. Automate a weekly report (not auto-delete) of new orphans to your team channel.

**How to check.**

\`\`\`bash
# Unattached volumes — storage billed while connected to nothing
aws ec2 describe-volumes --filters Name=status,Values=available \\
  --query 'Volumes[].{Id:VolumeId,Size:Size,Created:CreateTime,Type:VolumeType}' --output table

# Your snapshots, oldest first
aws ec2 describe-snapshots --owner-ids self \\
  --query 'sort_by(Snapshots,&StartTime)[].{Id:SnapshotId,GB:VolumeSize,Started:StartTime,Desc:Description}' --output table
\`\`\`

Check tags and descriptions first — snapshots made by backup tooling reference their source, and one may be a restore point someone still needs.

**Expected impact.** 100% of the cost of anything truly orphaned — the only tactic with a guaranteed full stop on its line items. Usually modest in absolute terms, which is why it ranks by risk-adjusted return, not size.

**Effort / risk.** Low. Mitigate the one risk (deleting someone's only backup) with the owner check, a "tag as candidate, delete after 14 days unclaimed" rule, and Recycle Bin.

### Tactic 7 — Convert gp2 volumes to gp3

**What to do.** gp3 is the current general-purpose EBS SSD. AWS's documentation states it is priced **20% lower per GiB than gp2**, with a baseline of **3,000 IOPS and 125 MiB/s included at any size** and IOPS/throughput provisionable independently (https://docs.amazonaws.cn/en_us/ebs/latest/userguide/general-purpose.html). gp2 instead ties IOPS to size, which pushed people to over-provision capacity to buy performance. Conversion is an Elastic Volumes operation: online, no downtime, no snapshot.

**How to check.**

\`\`\`bash
aws ec2 describe-volumes --filters Name=volume-type,Values=gp2 \\
  --query 'Volumes[].{Id:VolumeId,Size:Size,Instance:Attachments[0].InstanceId}' --output table

aws ec2 modify-volume --volume-id vol-0123456789abcdef0 --volume-type gp3
\`\`\`

Caveat: a large gp2 volume may currently deliver more than 3,000 IOPS (gp2 gives 3 IOPS/GiB). If CloudWatch shows the workload using them, provision matching IOPS on gp3 in the same call — usually still cheaper, but check.

**Expected impact.** Exactly 20% off the per-GB price of every converted volume, plus whatever you stop over-provisioning once size and IOPS decouple. Certain and permanent.

**Effort / risk.** Very low — one of the safest changes in this guide. Script it in bulk after spot-checking your busiest volumes.

Yes — in my own account there has been plenty of waste: unattached volumes, old snapshots, and buckets with no lifecycle rule, all left over from learning experiments. None of it is one big line; storage and idle waste accumulates in small charges that are easy to miss until you go looking.

### Tactic 8 — Put S3 on lifecycle rules and Intelligent-Tiering

**What to do.** S3 Standard is priced for hot data, but buckets accumulate cold data forever: old logs, build artefacts, backups, previous versions. Two complementary fixes:

- **S3 Intelligent-Tiering** for unpredictable patterns: objects move automatically between frequent, infrequent and optional archive tiers, with **no retrieval fees**; you pay a small monthly monitoring fee per 1,000 objects, and objects under 128 KB aren't auto-tiered (https://aws.amazon.com/s3/storage-classes/intelligent-tiering/).
- **Lifecycle rules** for predictable ageing: transition to Standard-IA (roughly half Standard's per-GB price), then Glacier Instant Retrieval, Glacier Flexible Retrieval, or Glacier Deep Archive as access gets rarer (https://aws.amazon.com/s3/storage-classes/). Every bucket should also **abort incomplete multipart uploads** after a few days (abandoned parts bill as storage but are invisible in listings) and **expire old versions/delete markers**.

**How to check.** Use **S3 Storage Lens** (default dashboard is free) or Cost Explorer by bucket to find the biggest Standard buckets, then:

\`\`\`bash
aws s3api get-bucket-lifecycle-configuration --bucket my-bucket   # error/empty = no rules
\`\`\`

A sane starting policy for application data:

\`\`\`json
{
  "Rules": [
    {
      "ID": "AgeToCheaperStorage",
      "Status": "Enabled",
      "Filter": {},
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER_IR" }
      ]
    },
    {
      "ID": "CleanupUploadsAndVersions",
      "Status": "Enabled",
      "Filter": {},
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 },
      "NoncurrentVersionExpiration": { "NoncurrentDays": 90 }
    }
  ]
}
\`\`\`

**Expected impact.** Per-GB prices fall steeply down the tiers — Standard-IA about half of Standard, the Glacier family a fraction of that (compare current rates for your Region: https://www.amazonaws.cn/en/s3/pricing/). A bucket that is 80% cold typically sees its storage line cut by half or more once tiered — illustrative until Storage Lens shows your access pattern.

**Effort / risk.** Low-to-medium. Respect **minimum storage durations** — IA classes bill at least 30 days, Glacier Instant/Flexible 90, Deep Archive 180 — so tiering short-lived objects can *raise* cost through early-deletion charges, and IA/Glacier classes charge retrieval fees. When in doubt, Intelligent-Tiering first.

### Tactic 9 — Right-size databases; match the database shape to the workload

**What to do.** Databases dominate many bills because nobody wants to touch them. In order: (1) **right-size the instance class** using CloudWatch (CPU, memory, connections) and Performance Insights; (2) **right-size storage** — RDS on gp3 provisions IOPS independently of size, and many databases pay for Provisioned IOPS they never use, so check actual IOPS before paying for io-class storage; (3) for **variable/spiky workloads**, evaluate **Aurora Serverless v2**, which scales capacity automatically in fine-grained increments — you pay for capacity used, not a fixed size; (4) for **steady production databases**, price a **Reserved Instance**; (5) stop dev/test databases on the Tactic 5 schedule.

**How to check.** Isolate RDS/Aurora spend in Cost Explorer, then review rightsizing suggestions in the RDS console and Compute Optimizer (which also covers Aurora/RDS). Check stored versus provisioned GiB — paying for 2 TB while storing 300 GB is common — and note RDS storage can be increased but **not decreased** without a migration: start smaller.

**Expected impact.** Right-sizing is usually worth a solid double-digit percentage of the database line when never done before. The Serverless v2 fit is binary — excellent for genuinely spiky workloads, potentially *more* expensive for flat 24/7 ones. Model your own peaks and troughs first.

**Effort / risk.** Medium-to-high — be most careful here. Snapshot before changes, test failover, use a maintenance window for production.

---

## Data transfer

### Tactic 10 — Stop paying NAT gateway tolls on AWS-to-AWS traffic

**What to do.** A NAT gateway charges twice: an **hourly charge per gateway** plus a **per-GB processing charge on every gigabyte through it, either direction** — including private-subnet traffic to S3, DynamoDB and ECR that never needed the internet path (rates vary by Region; check current VPC pricing: https://aws.amazon.com/vpc/pricing/). Fixes, in order:

1. **Gateway VPC endpoints for S3 and DynamoDB** — **no hourly, no per-GB charge**, minutes to create. Every private-subnet VPC should have them.
2. **Interface (PrivateLink) endpoints, selectively**, for heavy services (ECR, STS, CloudWatch Logs, Secrets Manager). Not free (hourly per AZ + per GB), so do the arithmetic: an endpoint pays when the NAT processing it diverts costs more than the endpoint. High-volume services clear that bar; quiet ones don't.
3. **Consolidate NAT gateways in non-production.** One per AZ is the resilient production pattern; a dev VPC rarely needs three. Accept the AZ trade-off consciously in dev, never silently in prod.
4. **A NAT instance only for tiny, low-risk environments** — you become its patching and failover story.

**How to check.** In Cost Explorer, filter Service = "EC2 – Other", group by Usage Type, and look for \`NatGateway-Hours\` and especially \`NatGateway-Bytes\`. If bytes dominate, use VPC Flow Logs on the NAT gateway's network interface, summed by destination, to find the talkers — S3 and ECR ranges are the usual suspects (background: https://dev.to/medampudi/aws-nat-gateway-pricing-the-hidden-tax-and-how-to-kill-it-527d).

\`\`\`bash
aws ec2 create-vpc-endpoint --vpc-id vpc-0abc123 \\
  --service-name com.amazonaws.ap-northeast-1.s3 \\
  --route-table-ids rtb-0priv1 rtb-0priv2
\`\`\`

**Expected impact.** Frequently a top-three saving where private subnets push serious S3/ECR traffic — that portion of NAT processing can drop to zero. If your NAT traffic is genuinely internet-bound, impact is small. The check takes ten minutes; run it before assuming either way.

**Effort / risk.** Low for gateway endpoints (one caution: an S3 endpoint changes the source IPs AWS services see — review bucket policies allow-listing the NAT gateway's public IP). Medium for consolidation.

### Tactic 11 — Trim egress, cross-AZ chatter, and idle load balancers

**What to do.** Three quieter costs. (1) **Internet egress** is tiered per GB, with a monthly free allowance across services (verify the current amount on the EC2 data-transfer pricing page); serving heavy static/media traffic via **CloudFront** usually costs less per GB than direct egress and unloads your origin. (2) **Cross-AZ traffic** is charged per GB *in each direction*, so tiers that chat constantly across AZs — a service in AZ-a hammering a database in AZ-b — pay a permanent tax; co-locate chatty tiers, use AZ-aware routing where supported. (3) **Idle load balancers**: every ALB/NLB bills hourly plus capacity units, and orphaned balancers are common in old accounts.

**How to check.**

\`\`\`bash
aws elbv2 describe-load-balancers \\
  --query 'LoadBalancers[].{Name:LoadBalancerName,Type:Type,Created:CreatedTime}' --output table
\`\`\`

Check each suspicious balancer's target groups for registered healthy targets — none means a deletion candidate (after the owner check). In Cost Explorer, group "Data Transfer" usage types to see whether egress or inter-AZ dominates before optimising the wrong flow.

**Expected impact.** Situational: negligible for small internal tools, significant for media-heavy or chatty multi-AZ systems. Dead balancers, like Tactic 6, are a guaranteed 100% saving on their line.

**Effort / risk.** Low for dead balancers; medium for traffic re-architecture — measure first.

---

## Observability & logging

### Tactic 12 — Put CloudWatch Logs on a diet

**What to do.** CloudWatch Logs charges to **ingest** per GB, to **store** per GB-month, and per GB **scanned** by Logs Insights. The classic surprise is a verbose app — or one retry-looping an error — ingesting terabytes of DEBUG logs nobody reads. Fixes: (1) set **retention on every log group** (the default is "never expire"): 30–90 days for most, longer only where compliance requires — in regulated environments retention may be a requirement, not a choice; (2) **stop ingesting noise**: raise log levels outside production, sample or drop health-check spam; (3) move cold, rarely queried logs to the **CloudWatch Logs Infrequent Access class**, priced at roughly half the standard ingestion cost for reduced indexing features (check current pricing); (4) archive multi-year logs to S3 with lifecycle rules (Tactic 8).

**How to check.**

\`\`\`bash
aws logs describe-log-groups \\
  --query 'logGroups[].{Group:logGroupName,GB:storedBytes,Retention:retentionInDays}' --output table

aws logs put-retention-policy --log-group-name /aws/eks/my-cluster/cluster --retention-in-days 90
\`\`\`

In Cost Explorer, group CloudWatch by Usage Type and compare ingestion against storage — ingestion is usually the bigger problem, and it scales with how chatty your apps are, not how long you keep anything.

**Expected impact.** Retention caps storage immediately and shrinks it as data ages out; ingestion fixes stop the meter at the source. On log-heavy accounts (verbose container frameworks are the usual case) this is commonly a double-digit share of the CloudWatch bill.

**Effort / risk.** Low. The only real risk is deleting logs needed for an audit or incident review — agree retention with whoever owns compliance first.

### Tactic 13 — Audit CloudWatch metrics, alarms, and dashboards

**What to do.** Smaller than log waste but easy to find: **detailed (1-minute) monitoring** left on instances nobody watches at that resolution (basic 5-minute monitoring is included), **custom metrics** from retired apps or high-cardinality experiments (billed per metric per month), **alarms on resources that no longer exist**, and **dashboards** beyond the free allowance that nobody opens. Sweep quarterly: count metrics per custom namespace, delete alarms pointing at the dead, and drop detailed monitoring where 5 minutes is honestly enough.

**How to check.**

\`\`\`bash
aws cloudwatch list-metrics --namespace "MyApp/Custom" --query 'length(Metrics)'
aws cloudwatch describe-alarms --query 'MetricAlarms[?StateValue==\`INSUFFICIENT_DATA\`].AlarmName'
\`\`\`

Alarms stuck in \`INSUFFICIENT_DATA\` are a good proxy for monitoring pointed at nothing.

**Expected impact.** Small — single-digit percentages of the CloudWatch line for most accounts — but it compounds with Tactic 12, and an alarm list containing only live, meaningful alarms gets taken seriously again.

**Effort / risk.** Very low; the only judgement call is detailed monitoring where your incident process genuinely uses 1-minute data.

---

## Governance

### Tactic 14 — Make tagging and cost allocation non-negotiable

**What to do.** Every other tactic gets harder without tags: you can't schedule "dev" off if you can't find dev. Require a small, boring tag set on everything — e.g. \`Environment\`, \`Owner\`, \`Project\`, \`CostCenter\` — enforced where possible (Terraform \`default_tags\` in this author's stack; Tag Policies and SCPs at organisation level) and reported on where not. Critically, **activate the tags as cost allocation tags** in the Billing console: only activated tags appear in Cost Explorer and Cost and Usage Reports, and activation is **not retroactive** — every month delayed is a month of history you never get.

**How to check.** Billing → **Cost allocation tags**: are yours active? Then Cost Explorer grouped by tag — the "no tag" bucket *is* your governance gap, in currency. The full Trusted Advisor check catalogue requires a Business or Enterprise support plan.

**Expected impact.** No direct saving — it multiplies all the others. Once 95%+ of spend has an owner's name on it, waste starts getting fixed by the owners themselves.

**Effort / risk.** Medium, mostly cultural. Five tags enforced beat twenty tags ignored.

### Tactic 15 — Budgets, anomaly detection, and a named owner

**What to do.** Waste returns when nobody watches, so build the watching into the tooling: **AWS Budgets** per account/environment, alerting at 80% and 100% of forecast; **AWS Cost Anomaly Detection** enabled — it machine-learns your usage patterns, is free, and flags deviations within about a day, catching the "left a GPU instance running" accident class before month-end; and a **named cost owner** per account who receives both. Governance turns Tactics 1–14 from a spring clean into a permanently lower run-rate.

**How to check.** Billing → Budgets: does every account have one, and did last month's alerts reach a human? Anomaly Detection: is at least one monitor and subscription active per account? If both were "set up in 2023, alerts go to a dead mailing list," you've found the real problem.

**Expected impact.** Indirect but decisive — anomaly detection typically pays for the whole governance effort the first time it catches a runaway resource early. Alert fatigue is the failure mode: keep thresholds meaningful.

**Effort / risk.** Low, no technical risk. The discipline risk is alerts with no owner — every alert should name a person, not a team alias nobody reads.

---

## The monthly cost-review routine (60–90 minutes)

Optimisation decays; routine stops it. Monthly, with the cost owners from Tactic 15:

1. **Compare** (10 min): Cost Explorer, this month vs last, by service. Explain every service that moved more than ±10%.
2. **Anomalies** (10 min): close each Cost Anomaly Detection alert as "expected" (launch, migration) or "fixed" (say how).
3. **Top movers** (15 min): the ten resources with the largest cost increase — each gets an owner and a note.
4. **Commitments** (10 min): Savings Plans coverage and utilisation. Utilisation below ~95% means paying for unused commitment; coverage far below your stable baseline means headroom — after right-sizing.
5. **Fresh recommendations** (15 min): new Compute Optimizer/Trusted Advisor findings — accept, schedule, or explicitly reject each.
6. **Orphan sweep** (10 min): re-run the Tactic 6 and Tactic 11 checks. Anything tagged "candidate" last month and unclaimed gets deleted.
7. **Tagging** (5 min): untagged spend percentage — it should trend to zero.
8. **Log actions** (5 min): owner + date for each. Next month's review starts by checking this list.

My cost habit is really a security habit: I use CloudTrail to learn and to audit my own account — reviewing what was created, when, and by which action. It doubles as cost hygiene, because the trail shows me exactly which forgotten resources are still running and still charging me.

## A clearly-labelled illustrative example

Because the old version's bill table was invented, here is how to think about totals honestly instead. Imagine — **hypothetically** — an account spending 100 units a month: 45 compute, 20 databases, 15 storage, 10 data transfer, 10 everything else. A realistic first-quarter pass (non-prod scheduling, right-sizing, gp3, S3 lifecycle rules, NAT endpoints, log retention) removes much of the pure waste; a Savings Plans purchase then discounts much of the remaining steady compute. Whether that totals 15% or 40% depends entirely on the starting waste — which is why this guide keeps sending you back to your own Cost Explorer. Measure your baseline, work in the "Start here" order, and report your own before-and-after.

## Common mistakes

- **Buying Savings Plans first.** Commitments discount whatever exists — including waste. Right-size and delete first, commit last (Tactics 1–3, in that order).
- **Deleting "orphans" without an owner check.** That unattached volume might be a paused project's only data. Tag-as-candidate, wait, then delete — with Recycle Bin on (Tactic 6).
- **Tiering short-lived S3 objects.** Minimum durations (30/90/180 days by class) mean early-deletion charges can exceed the saving (Tactic 8).
- **Treating a NAT instance as a production fix.** You become the patching and failover story for a critical-path component (Tactic 10).
- **Setting log retention by vibes in a regulated environment.** Shortening retention can breach audit requirements — agree it with compliance first (Tactic 12).
- **One-off cleanup, no routine.** Savings decay as new resources appear. Without Tactic 15 and the monthly review, you'll re-read this article next year.
- **Quoting vendor ceilings as forecasts.** "Up to 72%" is the best case on the best commitment, not a prediction for your account.

## FAQ

**Where should a small team start?**
With the "Start here" five: orphaned storage, non-prod scheduling, Compute Optimizer right-sizing, gp2→gp3, and S3/DynamoDB gateway endpoints — free or cheap, reversible, no commitment. Savings Plans come only after the baseline is clean.

**Savings Plans or Reserved Instances in 2026 — which should I choose?**
For compute, Savings Plans are the default: Compute Savings Plans follow usage across families, sizes, Regions, and into Fargate and Lambda; EC2 Instance Savings Plans pay more for staying in one family/Region. Reserved Instances still matter where Savings Plans don't reach — notably databases — and for EC2 capacity reservations. Verify current rates before buying.

**How much can I realistically save?**
It depends on your starting waste; anyone quoting a single figure without seeing your bill is guessing. Accounts that have never done this work commonly find a meaningful double-digit percentage addressable in the first quarter; well-governed accounts find low single digits. Run the checks in Tactics 1, 5, 6 and 10 — they'll give you your number within an hour.

**Is Spot safe for production?**
For *workloads designed for interruption*: stateless tiers spread across many instance types, queue-based workers, batch jobs with checkpointing. Not for a lone database, a singleton, or anything that can't tolerate a two-minute warning. The question is never "is Spot safe?" but "does this workload survive being stopped?"

**Why is my NAT gateway line so big when "the internet is barely used"?**
Because NAT charges per GB processed on *all* traffic through it — including private-subnet traffic to S3, DynamoDB and ECR, which has a free alternative (gateway endpoints). Check \`NatGateway-Bytes\` in Cost Explorer (Tactic 10); in many accounts most NAT bytes were never internet traffic.

**How often should we review costs?**
Monthly, using the routine above, plus automated watching in between (Budgets alerts, Cost Anomaly Detection). Quarterly at minimum for deeper sweeps (metrics/alarms audit, commitments review). Annual-only reviews are how two-year-old test environments happen.

## Conclusion

AWS cost optimization isn't a trick or a one-time project. It's ordinary operational discipline: measure first (Cost Explorer, Compute Optimizer), fix certain waste before speculative waste (orphans and schedules before commitments and migrations), automate the watching (budgets, anomaly detection, a monthly routine), and be honest about numbers — yours included. Start with the five moves at the top this week; by next month's review you'll have your own measured results, which is the only savings figure that was ever real.

**Next reads in this series:**
- Right-sizing often ends in an architecture question — containers or functions? [Serverless vs Containers](https://www.devopsenginer.com/blog/serverless-vs-containers-2025)
- Committed to Kubernetes? Keep its delivery pipeline from re-creating waste: [GitOps vs Traditional CI/CD](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison)
- The reliability counterpart to this guide: [Self-Healing Infrastructure](https://www.devopsenginer.com/blog/self-healing-infrastructure-2025)
  `,
  featuredImage: "/images/blog/aws-cost-optimization-15-tactics-saved-50k-month/hero.jpg",
  category: "Cloud",
  tags: ["AWS", "Cloud Cost", "FinOps", "DevOps", "Cost Optimization", "EC2", "S3", "Kubernetes", "RDS", "EKS"],
  author: "DevOps Enginer",
  publishDate: "2025-01-15",
  lastModified: "2026-10-30",
  readTime: "26 min read",
  seo: {
    title: "AWS Cost Optimization in 2026: 15 Tactics That Cut Real Bills (With Checks, Commands, and Honest Impact Ranges)",
    description: "15 practical AWS cost optimization tactics for 2026 \u2014 right-sizing, Graviton, Savings Plans, Spot, S3 lifecycle rules, NAT gateway fixes, log costs and governance \u2014 each with a check to run and an honest impact range.",
    keywords: "AWS cost optimization 2026, AWS cost reduction, FinOps, cloud cost management, EC2 savings, RDS cost optimization, S3 lifecycle policies, AWS Graviton, Kubernetes cost optimization, AWS Savings Plans, Spot instances, cloud financial management"
  }
};
