// Terraform vs Pulumi vs CloudFormation in 2026: Which IaC Tool Should You Choose?
export const terraformPulumiCloudformationBlog = {
  id: 9,
  title: "Terraform vs Pulumi vs CloudFormation in 2026: Which IaC Tool Should You Choose?",
  slug: "terraform-vs-pulumi-cloudformation-2025-iac-comparison",
  excerpt: "Terraform, Pulumi, or CloudFormation in 2026? Compare languages, state, pricing, testing and the OpenTofu factor \u2014 with matching examples in all three tools.",
  content: `
# Terraform vs Pulumi vs CloudFormation in 2026: Which IaC Tool Should You Choose?

> **TL;DR — the short answer**
>
> - **Terraform (or OpenTofu)** is still the safest default for most teams in 2026: the largest provider ecosystem, the most modules and hiring pool, and one workflow that works across AWS, GCP, Azure and beyond. The tool is no longer open source, though — since 2023 it ships under the Business Source License, and the open-source continuation of the same codebase is **OpenTofu**.
> - **Pulumi** is the best fit when your team thinks like software developers: real programming languages (TypeScript, Python, Go, C#), real unit tests, and reusable abstractions built with loops and classes instead of a DSL. You pay for that power with a smaller ecosystem and a team that must actually be able to program.
> - **CloudFormation** is the right answer more often than the internet admits — if you are genuinely AWS-only. There is no state file to secure, no licence to think about, no per-resource SaaS bill, and new AWS services land here first. You pay with verbose templates and AWS lock-in.
> - There is no universal winner. There is only the tool that matches your clouds, your team's skills, and how much state and licensing risk you are willing to own.

---

Choosing an infrastructure-as-code (IaC) tool used to be a tooling decision. In 2026 it is also a **licensing decision**, a **state-management decision**, and a **team-skills decision** — and those three questions matter more than any feature checklist.

The original version of this comparison made the mistake most IaC comparisons make: star ratings, speed rankings with no measurements behind them, and AI features that sounded impressive but didn't survive scrutiny. This rebuilt 2026 edition takes a different approach. Every tool gets the same small, real example — an S3 bucket with versioning — so you can compare the *shape* of the work, not marketing copy. Pricing and licensing claims are stated carefully, with sources, because both changed significantly after HashiCorp relicensed Terraform in 2023.

One disclosure before we start: Terraform is the tool I have actually used in production work, across AWS and GCP. Pulumi and CloudFormation are covered here as evaluated options — researched and compared honestly, but I will flag where my hands-on depth is thinner. A comparison you can trust should tell you that.

## The comparison table

| Dimension | Terraform | Pulumi | CloudFormation |
| --- | --- | --- | --- |
| **Language model** | Declarative DSL (HCL); limited functions, \`for_each\` / \`count\` for repetition | General-purpose languages: TypeScript, Python, Go, .NET, Java, plus YAML | Declarative YAML/JSON templates (+ AWS CDK, which generates CloudFormation from TypeScript/Python/etc.) |
| **Cloud scope** | Multi-cloud and beyond: AWS, GCP, Azure, Kubernetes, SaaS APIs | Multi-cloud: native providers for AWS/Azure/GCP/Kubernetes, plus bridged Terraform providers | AWS only |
| **State management** | Explicit state file; you choose and secure the backend (S3, GCS, HCP Terraform…). Locking is your configuration's job | Managed by Pulumi Cloud, or self-managed backend (S3/GCS/Azure Blob). Checkpoints handled by the service/CLI | **No state file.** AWS stores stack state server-side |
| **Provider ecosystem** | Largest: thousands of providers and modules in the Terraform Registry, mirrored by the OpenTofu Registry | Smaller native set, but almost any Terraform provider can be bridged; strong Kubernetes support | Every AWS service, via resource types and the Cloud Control API; community modules via the public registry |
| **Testing** | Native test framework (\`terraform test\`, \`.tftest.hcl\`) since 1.6, plus Terratest (Go) for integration tests | Unit tests with mocks in your host language's normal test runner; integration tests via Automation API | \`cfn-lint\`, template validation, change sets as the built-in "plan/preview"; TaskCat for deployment testing |
| **Policy as code** | Sentinel (HCP Terraform), or OPA/Conftest against plan JSON | CrossGuard — policies written in TypeScript/Python or Rego (OPA) | CloudFormation Guard (\`cfn-guard\`), Hooks, plus IAM and AWS Organizations SCPs |
| **Pricing / licensing** | CLI is **source-available under BSL 1.1** (not open source); free for internal use. HCP Terraform (SaaS): free up to 500 managed resources, then per-resource pricing | CLI is **open source (Apache 2.0)**. Pulumi Cloud: free for individuals; paid editions (Essentials, Pro, Enterprise) billed per managed resource plus per-secret charges; self-managed state is free | **Free.** You pay only for the AWS resources you create. CDK is open source |
| **Learning curve** | Moderate: HCL in a day, state/module discipline in months | Low *if you already program*; steep if you don't | Deceptively steep: simple YAML, but intrinsic functions, limits and stack behaviour take time |
| **Best for** | Multi-cloud teams, platform teams, anyone hiring from the largest IaC talent pool | Developer-heavy teams, complex logic, platform teams building internal abstractions | AWS-only organisations, regulated AWS estates, teams allergic to state files and SaaS bills |

A few rows deserve a warning. "Speed" rankings — the original version of this post ranked the three tools by execution speed — are mostly meaningless: all three spend nearly all their time waiting on the same cloud APIs. What differs is *feedback speed*: how fast you find out you made a mistake. Keep that in mind through the sections below.

## The same bucket, three ways

The fastest way to feel the difference between these tools is to write the same thing in each: an S3 bucket with versioning enabled and a tag set.

### Terraform (HCL)

\`\`\`hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

resource "aws_s3_bucket" "example" {
  bucket = "myapp-assets-prod"

  tags = {
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

# Since AWS provider v4, versioning lives in its own resource —
# the old inline \`versioning {}\` block (and the inline \`acl\`) are deprecated.
resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.example.id

  versioning_configuration {
    status = "Enabled"
  }
}

output "bucket_name" {
  value = aws_s3_bucket.example.bucket
}
\`\`\`

Note what the original version of this post got wrong: it set \`acl = "private"\` inline on the bucket. That argument has been deprecated for years, and modern provider versions push you toward separate resources for versioning, encryption, public-access blocks and ownership controls. Verbose — but explicit, and the plan output shows you exactly which resource will change.

### Pulumi (TypeScript)

\`\`\`typescript
import * as aws from "@pulumi/aws";

const bucket = new aws.s3.BucketV2("my-bucket", {
  bucket: "myapp-assets-prod",
  tags: {
    Environment: "prod",
    ManagedBy: "pulumi",
  },
});

const versioning = new aws.s3.BucketVersioningV2("my-bucket-versioning", {
  bucket: bucket.id,
  versioningConfiguration: {
    status: "Enabled",
  },
});

export const bucketName = bucket.bucket;
\`\`\`

Same shape, different philosophy. This is ordinary TypeScript: the bucket is a class instance, its properties are typed, your editor autocompletes them, and if you need fifty buckets you write a \`for\` loop instead of learning a meta-argument. (The \`BucketV2\` resources are the current form in Pulumi's AWS provider; the older \`aws.s3.Bucket\` with an inline \`versioning\` block is deprecated, just like Terraform's old inline arguments.)

### CloudFormation (YAML)

\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: S3 bucket with versioning enabled

Resources:
  AssetsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: myapp-assets-prod
      VersioningConfiguration:
        Status: Enabled
      Tags:
        - Key: Environment
          Value: prod
        - Key: ManagedBy
          Value: cloudformation

Outputs:
  BucketName:
    Description: Name of the assets bucket
    Value: !Ref AssetsBucket
\`\`\`

Short — for one bucket. CloudFormation templates grow linearly and verbosely: no loops, no functions beyond a fixed set of intrinsic helpers (\`!Ref\`, \`!GetAtt\`, \`!Sub\`, \`!If\`), and reuse means nested stacks or registry modules. That is exactly why **AWS CDK** exists — it lets you write TypeScript or Python that *synthesises* CloudFormation templates. If your team loves Pulumi's programming model but is committed to AWS, CDK — not hand-written YAML — is the honest comparison, and it changes the "Pulumi vs CloudFormation" answer for many AWS-only teams.

## Terraform: the default, with an asterisk

Terraform's strengths are the ones the original post listed, and they are still true in 2026:

- **The ecosystem is the moat.** Thousands of providers — AWS, GCP, Azure, Kubernetes, Cloudflare, GitHub, databases, SaaS APIs — and a public registry full of modules means the resource you need probably already has a maintained implementation. When something breaks, someone has almost certainly hit it before you.
- **One workflow, every cloud.** \`init → plan → apply\` with human-readable plans is a genuinely good operational model, and it transfers between providers. For multi-cloud estates this is still unmatched.
- **The hiring pool.** More engineers know HCL than any other IaC language. For a PM staffing a team, that is not a footnote — it is often the deciding factor.

The weaknesses are also real:

- **HCL is a ceiling.** Loops, conditionals and abstraction exist (\`for_each\`, dynamic blocks, modules) but they are a DSL's approximation of programming. Complex, data-driven infrastructure fights the language.
- **State is your responsibility.** The state file contains sensitive data in plaintext. Backend choice, locking, encryption at rest, and who can read it are all on you — see the common mistakes section.
- **The asterisk: licensing.** Terraform is no longer open source. That deserves its own section, next, because it changes procurement conversations even when it doesn't change your daily workflow.

My own state rule is short enough to fit on a sticky note: never local, never unlocked, never shared between environments. State belongs in a remote backend with locking enabled and read access treated as sensitive — the state file effectively holds your infrastructure's secrets in plaintext — and each environment gets its own state, so an experiment can never reach production. I won't pretend the backend brand is the interesting decision here; it isn't. Almost every state horror story follows the same plot: the file lived somewhere casual, something wrote to it at the wrong moment, and afterwards nobody could say what the truth was. The rule exists so that story never gets started.

Modules taught me a related lesson about trust. The registry makes it wonderfully easy to import a building block with a confident README — and the first time you read one of those modules properly, all the way down to its resource list, you realise what you actually adopted: somebody else's defaults, running with your credentials. So my habit is split. For the patterns my own projects repeat — a network shape, a bucket with the right defaults — I write thin modules of my own, small enough to hold in my head. For the big, well-maintained pieces, I use the registry rather than reinventing them — but I read what a module creates before I trust it, not just what it promises. And either way, versions are pinned, for providers and modules alike, with upgrades reviewed in the plan instead of absorbed silently.

### The OpenTofu factor: what actually changed, and what it means for you

The timeline, accurately:

- **August 2023** — HashiCorp moved Terraform from the open-source MPL-2.0 licence to the **Business Source License 1.1 (BSL)** for version 1.6 onward. Terraform 1.5.7 is the last MPL release. The BSL is *source-available*, not open source: you may read the code and use Terraform internally, but you may not use it to build a competing hosted offering. Each BSL release converts to MPL-2.0 four years after publication. Sources: https://dev.to/admiral-editor/opentofu-vs-terraform-in-2026-and-how-to-migrate-3omb and https://www.qovery.com/blog/opentofu-vs-terraform-2026-no-infra-engineers
- **September 2023** — The community forked the last MPL codebase as **OpenTofu**, under the **Linux Foundation**, keeping the MPL-2.0 licence. OpenTofu 1.6 GA followed in January 2024, and the project became a **CNCF sandbox project in April 2025**. Source: http://scalr.com/learning-center/what-is-opentofu
- **February 2025** — **IBM completed its acquisition of HashiCorp** (US$6.4B). The BSL stayed in place. Sources: https://www.qovery.com/blog/opentofu-vs-terraform-2026-no-infra-engineers
- **2026, today** — Both tools are actively developed and *beginning to diverge*. OpenTofu (1.13, September 2026) has features Terraform lacks: **client-side state and plan encryption** (AES-GCM with KMS or passphrase key providers), provider-level \`for_each\`, and an \`-exclude\` flag. Terraform has added features of its own — such as the Actions framework — that OpenTofu doesn't have yet. They are no longer drop-in identical twins — they are close relatives. Sources: https://infraplaybook.com/opentofu-vs-terraform/ and http://scalr.com/learning-center/what-is-opentofu

So what should a team actually do?

- **If you use Terraform internally, the BSL most likely does not restrict you.** The licence targets competing hosted services. Most teams' real exposure is not legal — it's procurement policy ("we only run OSI-approved licences") and long-term pricing of the HCP Terraform control plane. HCP Terraform's free tier covers up to 500 managed resources; paid tiers have moved to **per-managed-resource pricing** (Essentials from roughly $0.10 per resource/month, Standard around $0.47, Premium around $0.99 — these figures have changed repeatedly, so check the current pricing page before budgeting). Sources: https://www.qovery.com/blog/opentofu-vs-terraform-2026-no-infra-engineers
- **If open-source licensing is a hard requirement, OpenTofu is the same skills and nearly the same code.** Same HCL, same providers, same state format. Migrating a typical setup is swapping the binary and running \`tofu init\` — but test it on a copy of your state first, and be aware that very new Terraform features may not exist in OpenTofu (and vice versa).
- **If you sell a hosted IaC product, this is a legal conversation, not a blog-post conversation.** Get advice; that's precisely the use the BSL restricts.

The honest summary: the fork did not kill Terraform, and Terraform did not kill the fork. In 2026, "Terraform vs Pulumi vs CloudFormation" is really a four-way decision, and HCL skills now buy you two engines.

## Pulumi: infrastructure as software — with software's problems

Pulumi's pitch is simple and genuinely appealing: stop learning DSLs, write infrastructure in a language you already know, with your existing IDE, test framework, package manager and code-review habits.

Where that pitch holds up:

- **Real abstraction.** Loops, conditionals, classes, functions, npm/PyPI packages. Building a tidy internal " VPC component" that a whole company reuses is natural in Pulumi in a way it never quite is in HCL.
- **Real unit testing.** Pulumi supports unit tests with mocked providers in Jest, pytest, and friends. Testing that your component sets the right tags *before* anything touches a cloud account is a capability Terraform's native test framework only partially matches.
- **Type safety catches real errors early.** A misspelled property is a compile error, not a failed apply twenty minutes in.
- **Kubernetes is a first-class citizen**, with strong typed APIs for manifests and charts — one reason developer-heavy platform teams like it.

Where it doesn't:

- **The team must be able to program.** "Low learning curve" is only true for developers. Hand a Pulumi codebase to an ops engineer who has never written TypeScript and the curve is steeper than HCL's, not shallower.
- **Abstraction cuts both ways.** General-purpose languages make it easy to hide infrastructure inside layers of clever code that nobody can plan-review. A \`pulumi preview\` diff is only useful if a human can trace what generated it.
- **Ecosystem depth.** Pulumi's native providers for AWS, Azure, GCP and Kubernetes are strong, and almost any Terraform provider can be bridged — but bridged providers and community examples lag the Terraform Registry's depth. Expect to write more yourself.
- **The state question doesn't disappear.** Pulumi Cloud manages state (and secrets) for you — free for individuals; the paid editions (Essentials from $40/month, Pro from $400, Enterprise from $2,000) then bill per managed resource (from about $0.18 per resource per month on Essentials) plus per-secret charges. The editions were restructured in 2026, so check the current pricing page before budgeting (https://www.pulumi.com/pricing). Self-managed backends (an S3 bucket, for example) make the CLI effectively free, at the cost of running state yourself — the same trade Terraform offers.

One correction to the original post: it leaned hard on Pulumi being "AI-native" with AI-assisted generation as a headline feature. AI code assistants can generate Pulumi, Terraform *and* CloudFormation today — that is a property of LLMs, not a durable Pulumi advantage, and it's no basis for choosing an IaC tool. What matters is whether the *generated* code is reviewable and testable in your workflow — which loops back to the points above.

## CloudFormation: the AWS-native option that quietly improved

CloudFormation's reputation — verbose, slow, painful — was earned over a decade. But the honest 2026 picture includes several years of AWS investment that the "outdated" label ignores:

- **No state file, ever.** AWS holds stack state server-side. There is no \`terraform.tfstate\` full of secrets to leak, encrypt, lock or corrupt. For regulated AWS estates, that single property settles arguments.
- **Stack refactoring (February 2025).** You can now move resources between stacks and rename logical IDs *without replacing the resources* — historically one of CloudFormation's most painful limitations, and a common reason teams fled to Terraform. Source: https://dev.to/aws-builders/infrastructure-as-code-complete-aws-guide-to-iac-tools-2026-aak
- **IaC generator.** CloudFormation can scan resources that already exist in your account and generate templates for them — the built-in answer to "we have three years of console-built infrastructure." Source: https://dev.to/aws-builders/infrastructure-as-code-complete-aws-guide-to-iac-tools-2026-aak
- **Drift detection and drift-aware change sets.** Change sets (the CloudFormation equivalent of a plan) now account for drift between template, last deployment and reality, and scheduled drift detection flags console edits. Source: https://dev.to/aws-builders/infrastructure-as-code-complete-aws-guide-to-iac-tools-2026-aak
- **Day-zero AWS coverage and guardrails.** New AWS services arrive as CloudFormation resource types first, StackSets deploy baselines across AWS Organizations accounts, and Hooks plus \`cfn-guard\` give you policy checks at deploy time.
- **It's free.** No per-resource SaaS line item, no licence review.

The weaknesses remain structural, not incidental:

- **AWS only.** This is not a limitation you can engineer around. The day a second cloud becomes real, CloudFormation knowledge and templates stay behind.
- **Template ergonomics.** Intrinsic functions, stack limits, long stack update times on large estates, and failure states that historically required support tickets to escape (rollback behaviour has improved, but a stuck stack is still a bad day). CDK fixes the ergonomics by generating templates — at which point you're maintaining a TypeScript/Python codebase *and* its generated output.
- **Thin reuse story in raw YAML.** Modules exist via the registry, but the ecosystem is a fraction of Terraform's.

For an AWS-only organisation — especially a regulated one that values audit trails, no external state, and no vendor licence review — CloudFormation (usually via CDK for anything complex) is not a consolation prize. It is a legitimate first choice. For everyone else, the multi-cloud row of the table decides it.

## Decision guidance: choose by situation, not by hype

**You are a small team (or solo) shipping on one cloud.**
If that cloud is AWS and you don't expect a second one: CloudFormation via CDK, or Terraform — pick based on whether you want AWS's free, stateless model or the larger community. If there's any real chance of multi-cloud, start with Terraform/OpenTofu and skip a future migration.

**You are a platform team serving many product teams.**
Terraform/OpenTofu for the shared foundation (networking, accounts, clusters) — the module ecosystem and hiring pool win. Consider Pulumi for the application-facing layer *if* your developers are strong programmers who will own what they write. This hybrid is common in practice — despite what the original version of this post claimed, it's not because one tool is "faster"; it's because the two layers have different authors.

**You work in a regulated environment (medical, finance, government).**
Your deciding factors are audit trail, state security and licence/procurement rules — not language ergonomics. Terraform with a locked-down remote backend (or HCP Terraform) plus policy-as-code is a defensible default; if your procurement requires OSI-approved licences, that same setup on OpenTofu keeps the MPL-2.0 licence and adds client-side state encryption. AWS-only regulated estates can make an equally defensible case for CloudFormation: no external state file, native integration with AWS audit tooling, nothing to license. (I write this as general practice, not about any specific employer's setup — in regulated work, your compliance team's ruling outranks any blog, including this one.)

**Your team is developer-heavy and infrastructure logic is genuinely complex.**
Dynamic, data-driven infrastructure — per-tenant environments generated from a database, intricate Kubernetes platforms — is where Pulumi's programming model earns its keep, and where HCL starts to hurt.

**You are already on one of these tools and it works.**
Stay. Migrations are justified by licensing mandates, a cloud strategy change, or a team-skills shift — never by a comparison table. See the next section before volunteering for one.

## Migration notes (the honest version)

- **Terraform ↔ OpenTofu:** the only cheap migration on this page. Same HCL, same providers, compatible state. Swap the binary, run \`tofu init\`, plan, and expect an empty diff on a healthy setup. Do it on a copy of state first, pin versions, and check for the small set of features that now exist on only one side.
- **Terraform → Pulumi:** Pulumi ships a converter (\`tf2pulumi\`, and \`pulumi convert\`) that translates HCL into Pulumi code — a starting point, not a finished migration. Realistically: convert or hand-port stack by stack, and either import existing resources into Pulumi state or let Pulumi adopt them carefully, resource group by resource group. Budget days-to-weeks per estate, not an afternoon.
- **Anything → CloudFormation:** the IaC generator can produce templates from existing resources, which helps — but generated templates are a beginning, not an architecture. Expect to restructure into sane stacks (and learn the refactoring tools) before it feels like home.
- **CloudFormation → Terraform/Pulumi:** use \`terraform import\` blocks (or Pulumi's import) incrementally, stack by stack; do **not** delete-and-recreate production resources to "start clean." Databases and stateful resources should be the last things moved, with a rollback plan that doesn't involve hope.
- **Every direction:** migrate state in a maintenance window, keep the old tool able to plan (read-only) until the new one has applied successfully at least once, and never let two tools manage the same resource at the same time.

## Common mistakes (all three tools)

1. **Committing state files to Git** (Terraform/Pulumi self-managed). State contains secrets in plaintext. Use a remote backend with locking and encryption, and treat read access to state as read access to your infrastructure's passwords.
2. **Running applies from laptops.** Whoever's machine, whatever local drift. Applies belong in CI with a reviewed plan/change set attached to the change — this is also your audit trail. (For this site's cluster view of that pipeline discipline, see our [DevSecOps checklist for securing your CI/CD pipeline](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025).)
3. **One giant state/stack for everything.** Blast radius grows with estate size. Split by environment and by lifecycle (network ≠ application ≠ data), whichever tool you use.
4. **Unpinned providers and modules.** "Latest" is not a version strategy. Pin, review upgrades in the plan, and upgrade deliberately — provider majors have broken production estates.
5. **Clicking in the console "just this once."** Drift is how IaC estates quietly stop describing reality. Every tool here can *detect* drift; none can stop you creating it. If you must click, import the change back into code the same day.
6. **Testing only in production.** Whatever your tool's testing story is — native tests, unit tests with mocks, linting, change-set previews — an untested template change to production networking is a career event.
7. **Choosing for the demo, not the decade.** IaC choices are sticky: state, modules, skills and CI all accumulate. Weight the boring rows of the comparison table — state, licensing, ecosystem, hiring — over the exciting ones.

For the multi-cloud angle on this decision, see our [multi-cloud strategy guide](https://www.devopsenginer.com/blog/multi-cloud-strategy-2025), and for how IaC fits a GitOps delivery model, [GitOps vs traditional CI/CD](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison).

Most engineers I know have a version of this story, and mine follows the standard plot. Early on, state feels like a by-product — a file the tool leaves lying around — so you treat it casually: it lives on your machine, applies run from wherever you happen to be working, and nobody thinks about what happens if that file is lost, corrupted, or written by two runs at once. Picture the moment it stops feeling like a by-product: a second environment appears, or a second pair of hands, and suddenly nobody can say with confidence which copy of the truth is the truth. Nothing dramatic has to break for the lesson to land — the near-miss is enough. The rule it left me with is the one this whole section keeps circling: remote, locked, backed up — and treated as sensitive, because it is.

## FAQ

### Is Terraform still open source in 2026?
No. Since version 1.6 (August 2023), Terraform is licensed under the Business Source License 1.1 — source-available, free for internal use, but not OSI-approved open source. If you need the same tool under an open-source licence, that is exactly what OpenTofu (MPL-2.0, Linux Foundation) is.

### Should I switch from Terraform to OpenTofu?
Only for a reason: a procurement rule requiring open-source licences, a wish for OpenTofu-only features like client-side state encryption, or discomfort with the HCP Terraform pricing direction. Technically, the switch is small (same HCL, providers and state). "Because the internet is angry" is not a reason — the BSL does not restrict ordinary internal use.

### Is Pulumi free?
The CLI is open source (Apache 2.0) and Pulumi Cloud is free for individuals with unlimited resources. Teams pay for Pulumi Cloud's paid editions (Essentials, Pro, Enterprise), billed per managed resource plus per-secret charges; self-managing your state backend avoids those fees. Check current pricing — the editions were restructured in 2026.

### Does CloudFormation cost anything?
No. CloudFormation itself is free; you pay only for the AWS resources it creates. The same applies to AWS CDK, which is open source and generates CloudFormation templates.

### Can CloudFormation manage non-AWS resources?
Only in a limited sense, via custom resources backed by Lambda — a workaround, not multi-cloud support. If you genuinely run two clouds, CloudFormation should not be your primary tool.

### Which tool is best for Kubernetes?
Terraform and Pulumi both have mature Kubernetes providers, and both are widely used to provision clusters and platform layers. Pulumi's typed Kubernetes APIs are nicer for application developers; Terraform's ecosystem is deeper for cluster/platform provisioning. CloudFormation covers EKS well but is rarely chosen *for* Kubernetes. Note that many teams deliberately manage in-cluster resources with GitOps tools instead and use IaC only up to the cluster boundary.

## Conclusion

In 2026 the honest answer to "Terraform vs Pulumi vs CloudFormation" is a decision tree, not a podium:

- **Default to Terraform or OpenTofu** when you want the biggest ecosystem, multi-cloud reach and the deepest hiring pool — and choose between the twins based on your licence requirements, not features alone.
- **Choose Pulumi** when your team genuinely programs, your infrastructure logic is complex, and you'll invest in testing and reviewing infrastructure like software.
- **Choose CloudFormation (usually via CDK)** when you are AWS-only and committed — and value having no state file, no licence review and no SaaS bill more than portability.

And whichever you choose: remote state with locking, pinned versions, plans reviewed in CI, and no console clicks. Those four habits will matter more to your future self than the logo on the tool.
  `,
  featuredImage: "/images/blog/terraform-vs-pulumi-cloudformation-2025-iac-comparison/iac-comparison-hero.jpg",
  category: "Infrastructure",
  tags: ["Terraform", "Pulumi", "CloudFormation", "IaC", "Infrastructure as Code", "AWS", "Multi-Cloud", "DevOps", "OpenTofu", "CDK", "2026"],
  author: "DevOps Enginer",
  publishDate: "2025-11-14",
  lastModified: "2026-10-30",
  readTime: "23 min read",
  seo: {
    title: "Terraform vs Pulumi vs CloudFormation in 2026: Which IaC Tool Should You Choose?",
    description: "Terraform, Pulumi, or CloudFormation in 2026? Compare languages, state, pricing, testing and the OpenTofu factor \u2014 with matching examples in all three tools.",
    keywords: "Terraform vs Pulumi, CloudFormation comparison, Infrastructure as Code 2026, IaC tools, Terraform vs CloudFormation, Pulumi vs Terraform, AWS CDK, OpenTofu, multi-cloud IaC, HCL, TypeScript infrastructure, DevOps tools, cloud automation"
  }
};
