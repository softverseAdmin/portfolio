// AWS VPC in 2026: The DevOps Guide to Subnets, Routing and Not Locking Yourself Out
export const awsVpcBlog = {
  id: 36,
  title: "AWS VPC in 2026: The DevOps Guide to Subnets, Routing and Not Locking Yourself Out",
  slug: "aws-vpc-guide-2026",
  excerpt: "An AWS VPC guide for DevOps engineers: choosing a CIDR that never boxes you in, public/private/data subnet tiers across AZs, route tables, NAT gateway economics, VPC endpoints, security groups vs NACLs, and flow logs from day one.",
  content: `
# AWS VPC in 2026: The DevOps Guide to Subnets, Routing and Not Locking Yourself Out

> **TL;DR:** A VPC is your own slice of AWS networking, and almost everything about it is decided by five choices: the CIDR block (bigger than you think you need, because it can never grow), the subnet layout (public for load balancers, private for workloads, isolated for data — spread across at least two, ideally three AZs), the route tables (a subnet is only "public" because its route table points at the internet gateway), NAT gateways (how private subnets reach the internet — one per AZ, because a shared NAT is both a bottleneck and a bill), and the two security layers (security groups, stateful and attached to instances; network ACLs, stateless and attached to subnets). Add VPC endpoints for AWS services before the NAT bill teaches you why, enable flow logs from day one, and never use the default VPC for anything you care about.

Networking is the part of AWS everyone clicks through on the way to launching something — and the part that is nearly impossible to change later. A CIDR block cannot be resized. A subnet layout chosen in an afternoon shapes every architecture decision after it. This guide is the VPC as DevOps engineers actually need to understand it: the design decisions, in the order they become permanent.

## The CIDR block: the one-way door

Your VPC gets an IPv4 range like \`10.20.0.0/16\` — 65,536 addresses. Choose it like it matters, because:

- **It cannot be enlarged later.** You can attach secondary CIDRs, but the clean answer is to start generous: a \`/16\` per VPC is the common, sane default. Address space is free; running out is not.
- **It must not collide with anything it will ever talk to** — your other VPCs (peering and Transit Gateway demand non-overlapping ranges), your office network, your VPN ranges. Collisions discovered at integration time are miserable.
- **Pick from private ranges everyone recognises** (\`10.x\` is conventional) and keep a simple allocation register: which block belongs to which account/environment/region. A spreadsheet beats a memory, and it will be consulted at the worst possible moment if it doesn't exist.

Subnets carve the block per AZ and tier: a workable pattern is \`/20\`s per subnet (4,096 addresses each) — public, private and data tiers across three AZs consumes nine subnets and still leaves most of a \`/16\` unallocated for the future. Remember AWS reserves five addresses in every subnet (network, router, DNS, future use, broadcast), so a subnet's usable count is its size minus five.

## Subnets: three tiers, and what "public" actually means

The tier names describe *routing*, not intention:

- **Public subnets** — route table has a route to an **Internet Gateway (IGW)**. For: load balancers, NAT gateways, bastions — the small set of things that face the internet. Nothing else earns a public IP.
- **Private subnets** — no IGW route; outbound internet goes via a NAT gateway in a public subnet. For: application servers, containers (your EKS/EC2 workloads), everything that should be reachable only through a load balancer.
- **Isolated (data) subnets** — no internet route at all, in or out. For: databases, caches, queues — resources that should only ever talk to the application tier inside the VPC.

The sentence worth internalising: **a subnet is public or private solely because of its route table.** There is no checkbox. Misunderstanding this is the root of most "why can/can't my instance reach the internet" mysteries — the answer is always in the route table, never in the subnet's name.

\`\`\`text
VPC 10.20.0.0/16
├── AZ a: public 10.20.0.0/20 · private 10.20.16.0/20 · data 10.20.32.0/20
├── AZ b: public 10.20.48.0/20 · private 10.20.64.0/20 · data 10.20.80.0/20
└── AZ c: public 10.20.96.0/20 · private 10.20.112.0/20 · data 10.20.128.0/20
    (remainder of the /16 left unallocated, on purpose)
\`\`\`

## Routing and NAT: where the money and the outages live

Route tables attach per subnet (with one main table as the default). The public table points \`0.0.0.0/0\` at the IGW; private tables point \`0.0.0.0/0\` at a NAT gateway; data tables have only the local route. Two operational truths follow:

**NAT gateways are per-AZ infrastructure, not a shared utility.** One NAT gateway costs a fixed hourly fee plus per-GB processing — and routing three AZs through one NAT in AZ-a means (a) an AZ-a failure takes outbound internet from the whole VPC, and (b) you pay cross-AZ data transfer for the privilege. **One NAT per AZ** is the production pattern; the [cost guide](https://www.devopsenginer.com/blog/aws-cost-optimization-15-tactics-saved-50k-month) explains the bill either way. Dev environments can share one NAT and accept the risk knowingly.

**VPC endpoints are the other half of the traffic bill.** Without them, your private subnets reach S3, DynamoDB and every other AWS API *through the NAT gateway*, paying per-GB for traffic that never needed to leave AWS's network. Gateway endpoints for S3 and DynamoDB are **free** — there is no excuse for their absence. Interface endpoints (PrivateLink) for the likes of ECR, CloudWatch Logs and Secrets Manager cost an hourly fee per AZ but keep agent and image-pull traffic fully private — on a busy EKS cluster, pulling images through NAT is a cost and failure-domain decision, not a default.

## The two security layers (they are not interchangeable)

**Security groups** attach to instances/ENIs, are **stateful** (reply traffic is automatically allowed), support allow-rules only, and can reference *other security groups* — "the database accepts 5432 from the app tier's group" is the single most useful pattern in AWS networking, because it tracks membership automatically as instances come and go.

**Network ACLs** attach to subnets, are **stateless** (return traffic needs its own rule — the ephemeral-port gotcha), support allow *and* deny rules evaluated in numbered order, and apply to everything in the subnet whether you remembered it or not.

The working model: security groups are the primary control, designed per-tier with group-to-group references; NACLs stay near-default (allow all) unless you need a subnet-level guardrail — a deny rule that stands even if someone edits a security group badly. Teams that build elaborate NACL logic usually discover the statelessness tax during their first debugging session at 2 a.m. And least privilege applies to who can edit these as much as to the rules themselves — network changes belong behind the same [IAM discipline](https://www.devopsenginer.com/blog/aws-iam-least-privilege-guide-2026) as everything else.

## Flow logs: turn them on before you need them

VPC Flow Logs record accepted/rejected traffic metadata to CloudWatch Logs or S3. They answer the questions every network incident asks — "is traffic even reaching this subnet?" "what is talking to the database?" — and they cannot be back-filled. Enabling them at VPC creation costs almost nothing and is the difference between evidence and vibes during debugging; the [observability habits](https://www.devopsenginer.com/blog/kubernetes-observability-guide-2026) from the Kubernetes side apply here unchanged. While you're in the console: DNS resolution and DNS hostnames **on** (private DNS names make internal life bearable), and no workloads in the **default VPC** — it exists for experiments, its layout is nobody's design, and its flat structure has surprised many auditors.

## Connecting beyond one VPC

Sooner or later the VPC needs neighbours, and each option has its shape:

- **VPC peering** — a direct link between two VPCs: cheap, fast, and *non-transitive* (A↔B and B↔C does not give A↔C), with CIDRs that must not overlap. Fine for a pair; a mesh of many VPCs becomes unmanageable surprisingly fast.
- **Transit Gateway** — the hub: VPCs and VPNs attach to one router, routes propagate sensibly, and the architecture stays legible at ten VPCs and beyond. It costs more than peering and earns it the moment "many" enters the sentence.
- **VPN / Direct Connect** — to your office or data centre. Start with site-to-site VPN (fast to stand up, internet-bound); Direct Connect is the committed, consistent-bandwidth option with lead times measured in weeks, ordered when the VPN's variability becomes a real complaint rather than a theoretical one.
- **For Kubernetes specifically:** EKS nodes live in your private subnets and inherit all of this — the cluster's outbound internet, endpoint choices and NAT layout are VPC decisions made before the first node joins, per the networking thinking in the [Kubernetes networking guide](https://www.devopsenginer.com/blog/kubernetes-ingress-networking-basics-2026).

And define it all as code. A VPC clicked together in the console is a snowflake nobody can rebuild; the same network as a [Terraform module](https://www.devopsenginer.com/blog/terraform-modules-guide-2026) — CIDR, tiers and AZ count as variables — is an asset every new environment inherits.

## Common mistakes

1. **The too-small CIDR.** A \`/24\` VPC feels tidy until the second AZ or the EKS cluster arrives (Kubernetes networking is address-hungry). You cannot grow it; you can only rebuild. Start at \`/16\`.
2. **Overlapping ranges across VPCs or with the office.** Peering, Transit Gateway and VPN all refuse to cooperate with collisions. Allocate from a register, not from memory.
3. **Workloads in public subnets "temporarily".** Temporary is forever. If it doesn't face the internet for a living, it's private.
4. **One NAT gateway for three AZs** — a single point of failure plus cross-AZ transfer charges. One per AZ in production; shared only where the risk is understood and accepted.
5. **No S3/DynamoDB gateway endpoints.** Free to add, and their absence sends AWS's own traffic through the metered NAT. The most expensive checkbox in AWS is the one that costs nothing.
6. **Elaborate NACL rule sets.** Stateless rules with ephemeral ports turn routine debugging into archaeology. Security groups do the real work; NACLs are guardrails.
7. **Flow logs "later".** Later is during the incident, when the missing history would have answered the question. On at creation, always.

## FAQ

**How many subnets do I actually need?**
Per AZ: one public, one private, one data — so 6 for a solid 2-AZ setup, 9 for 3 AZs. More tiers (a separate management tier, say) are legitimate; more *AZs than your region offers in your account* is the usual surprise, so check AZ availability before finalising the layout.

**Can I change the CIDR after creating the VPC?**
You can add secondary CIDR blocks, but you cannot remove or shrink the primary one. Treat the primary block as permanent — that's why the sizing advice leans generous.

**Public IP on an instance in a private subnet — possible?**
No, and that's the point: no IGW route means no public reachability, whatever the instance settings say. Reach the internet via NAT (outbound) or not at all (data tier); reach the instance via load balancer, bastion or SSM Session Manager — which, not incidentally, is the modern answer to "how do I SSH in": usually, you don't; Session Manager gives audited shell access without any inbound ports.

**VPC peering or Transit Gateway?**
Two VPCs that need each other: peering. Anything beyond a pair, or anything involving a shared services VPC or on-prem: Transit Gateway. The cost difference is real but small next to the operational difference at scale.

## Conclusion

A VPC rewards the teams who treat its first afternoon as design, not setup: a generous non-overlapping CIDR, three tiers across multiple AZs, route tables understood rather than assumed, NAT per AZ, free gateway endpoints in place, security groups referencing each other, and flow logs recording from the first packet. None of it is glamorous, and almost none of it can be fixed cheaply later — which is precisely why it's worth a guide, and worth doing once, properly.

*More AWS and Kubernetes guides are published weekly on [DevOps Enginer](https://www.devopsenginer.com) — the free Kubernetes Production Checklist is available via the newsletter on the homepage.*
  `,
  featuredImage: "/images/blog/aws-cost-optimization-15-tactics-saved-50k-month/hero.jpg",
  category: "AWS",
  tags: ["AWS", "VPC", "Networking", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "AWS VPC in 2026: The DevOps Guide to Subnets, Routing and Not Locking Yourself Out",
    description: "An AWS VPC guide for DevOps engineers: choosing a CIDR that never boxes you in, public/private/data subnet tiers across AZs, route tables, NAT gateway economics, VPC endpoints, security groups vs NACLs, and flow logs from day one.",
    keywords: "AWS VPC, subnets, route tables, NAT gateway, VPC endpoints, security groups, network ACL, flow logs 2026"
  }
};
