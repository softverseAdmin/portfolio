// Terraform Testing in 2026: Unit Tests With terraform test and Mock Providers
export const terraformTestingBlog = {
  id: 43,
  title: "Terraform Testing in 2026: Unit Tests With terraform test and Mock Providers",
  slug: "terraform-testing-guide-2026",
  excerpt: "A practical guide to testing Terraform: the native terraform test framework, run blocks and assertions, mock providers for credential-free CI tests, what to test in a module (and what to leave to the provider), and where tests fit alongside lint, scanning and plan review.",
  content: `
# Terraform Testing in 2026: Unit Tests With terraform test and Mock Providers

> **TL;DR:** Most Terraform changes are still reviewed by reading a plan and hoping. The native test framework (\`terraform test\`, stable since Terraform 1.6) changes that: test files declare inputs, run a plan or apply, and assert on the results — and with mock providers (since 1.7) the logic tests run in CI in seconds with no cloud account and no credentials. Test your modules' contracts — outputs, conditional resources, naming and tagging rules — not the cloud provider's behaviour. Keep a small number of real apply tests for critical modules in an ephemeral sandbox, and let linters and scanners do their separate jobs alongside.

## The problem: the plan is not a test

Application code gets unit tests as a matter of course. Infrastructure code — which can delete a database just as dead as any application bug — usually gets a human skimming \`terraform plan\` output in a pull request. That review catches typos. It does not catch the conditional that inverted last refactor, the variable default that quietly changed a bucket from private to public, or the count logic that creates zero replicas of the thing production needs three of.

The reason was tooling: for years, testing Terraform meant heavyweight frameworks or applying to a real account and inspecting by hand. The native framework removes the excuse. Tests live next to the module, run with one command, and — the decisive part — can run against **mocked providers**, so the suite executes like unit tests: fast, hermetic, credential-free.

## What is worth testing (and what is not)

Test **your module's decisions**, not the provider's implementation:

- **Outputs and contracts.** Callers depend on output values and shapes. If \`bucket_name\` changes format, downstream code breaks — a test should break first.
- **Conditional logic.** Every \`count\`, \`for_each\`, and ternary is a decision your module makes: versioning on/off, optional resources created or skipped, single vs multi-AZ shapes. Each branch deserves a run.
- **Naming, tagging, and policy invariants.** The rules platform teams actually care about: names compose from project/environment correctly, required tags are always present, encryption is enabled, nothing is public unless an explicit variable says so.
- **Variable edge cases.** Empty lists, zero counts, nulls — the inputs real callers will eventually pass.

Do **not** test that AWS creates an S3 bucket when asked, that an attribute AWS generates looks a certain way beyond your control, or other provider internals. Those tests are slow, brittle, and verify someone else's software.

## The framework in one module

A small module to test:

\`\`\`hcl
# main.tf
variable "project"     { type = string }
variable "environment" { type = string }

variable "enable_versioning" {
  type    = bool
  default = true
}

resource "aws_s3_bucket" "this" {
  bucket = "\${var.project}-\${var.environment}-assets"
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

output "bucket_name" {
  value = aws_s3_bucket.this.bucket
}
\`\`\`

And its test file (conventionally in a \`tests/\` directory inside the module):

\`\`\`hcl
# tests/bucket.tftest.hcl
mock_provider "aws" {}

variables {
  project     = "shop"
  environment = "prod"
}

run "versioning_on_by_default" {
  command = plan

  assert {
    condition     = aws_s3_bucket_versioning.this.versioning_configuration[0].status == "Enabled"
    error_message = "Versioning must be enabled by default"
  }

  assert {
    condition     = output.bucket_name == "shop-prod-assets"
    error_message = "Bucket name must compose project and environment"
  }
}

run "versioning_can_be_disabled" {
  command = plan

  variables {
    enable_versioning = false
  }

  assert {
    condition     = aws_s3_bucket_versioning.this.versioning_configuration[0].status == "Suspended"
    error_message = "Versioning should suspend when explicitly disabled"
  }
}
\`\`\`

Run it with \`terraform test\` from the module root. The anatomy:

- **\`mock_provider "aws" {}\`** replaces the real provider. Terraform generates fake computed values, so a \`plan\` (or even an \`apply\`) runs without credentials, network, or a cloud account — in milliseconds.
- **\`variables {}\`** at file level sets shared inputs; a \`run\` block can override them per case.
- **\`run\` blocks** are the test cases. \`command = plan\` is the default workhorse; \`command = apply\` executes against the (possibly mocked) provider for shape checks that only appear after apply.
- **\`assert\`** pairs a condition over any value in the configuration — resources, outputs, variables, locals — with the \`error_message\` a human reads when it fails. Write the messages as explanations, not echoes.

Where a mocked computed value needs to be specific — an ARN a policy references, an ID another resource consumes — \`override_resource\` and \`override_data\` blocks pin those values inside a run. Use them sparingly; a test that overrides everything asserts nothing.

## Mock providers: what they change, and their honest limits

Before mocks, a "unit test" of a module still configured the real provider, which meant credentials in CI, provider API calls in every plan, and suites measured in minutes. Mocks invert all three: the pipeline job needs **no cloud credentials at all** for the test stage (which, per the keyless-CI pattern in the GitHub Actions OIDC guide on this site, is exactly where you want the fewest credentials), tests run at unit-test speed, and nobody's sandbox account accumulates test debris.

The limits are equally clear, and stating them keeps the suite trustworthy:

- Mocks validate **your configuration logic against the provider's schema**, not against the real API. A value the real AWS API would reject (an invalid name pattern, an unsupported combination) can sail through a mocked plan.
- Data sources return generated values unless overridden — tests depending on a data source's real content need overrides or a real read.
- Provider-side quirks and eventual-consistency behaviour are, by definition, absent.

So the strategy is layered: mocked tests for logic, in bulk; a few real tests for reality, on purpose.

## The top of the pyramid: real apply tests, kept few

For a critical module — the network foundation, the shared database module — a mocked plan cannot prove the one thing that matters: it actually builds. Keep a small suite of \`command = apply\` runs against the real provider in a **sandbox account** with three disciplines:

- **Ephemeral by design.** Tests create, assert, and the framework destroys what it created at the end of the run (that is the framework's contract for test-created resources). Verify the destroy happened; orphaned test resources are a cost and security smell — the state-management guide's hygiene rules apply to test state too.
- **Separate credentials, narrow scope.** The sandbox role can create and destroy only the resource types under test, in the sandbox account only. The OIDC guide's per-environment role pattern fits exactly here.
- **Scheduled, not per-commit.** Real applies take minutes and cost real (if small) money. Run them nightly or on module release, while the mocked suite gates every pull request.

## Where tests sit among the other tools

Terraform already has a quality neighbourhood, and the test framework does not evict anyone:

- **Variable validation blocks** — the module rejecting bad input at plan time. First line of defence, and the test suite should cover that they fire.
- **\`terraform fmt\` / \`validate\`** — shape and syntax. Free; run always.
- **tflint and friends** — lint rules, naming conventions, deprecated syntax. Style and hygiene, not behaviour.
- **Checkov / tfsec-style scanners** — policy and security posture of the configuration. They check *what the config says*; tests check *what the module decides* given inputs. Complementary, not overlapping.
- **\`terraform test\`** — behaviour: outputs, conditionals, invariants across input variations.

A sane pipeline order: fmt check → validate → lint/scan → \`terraform test\` (mocked) → plan for human review. Each stage is cheap; together they mean the human reviews intent, not correctness arithmetic.

## Modules are where tests pay rent

For a root configuration used once, tests are nice. For **modules** — shared, versioned, consumed by teams who did not write them — they are the contract enforcement mechanism. The modules guide in this series covers structuring reusable modules; tests are what let a maintainer refactor a module's internals while proving its callers see the same outputs, the same resource decisions, the same invariants. That confidence is precisely what a module library runs on, and it is why test files should ship inside the module repository, versioned with the code they describe.

## Common mistakes

- **Testing the provider.** Asserting that a mocked (or real) AWS resource has AWS-chosen properties teaches the suite to fail for other people's changes. Assert your decisions.
- **Overriding everything.** Heavy \`override_resource\` use pins the fake world so completely that the test passes regardless of the configuration. Overrides are scalpels for specific computed values, not a substitute world.
- **One giant run block.** A failed assert should name the broken decision. Many small runs with descriptive names beat one mega-run with forty asserts.
- **Apply tests against shared accounts.** Test resources in an account other teams use will eventually collide, linger, or be "cleaned up" by someone mid-run. Sandbox account, always.
- **Mocked-only confidence for critical paths.** The suite is green, the module cannot actually apply. Keep the few real apply tests for the modules whose failure would hurt.
- **Ignoring test state.** \`terraform test\` manages its own state for runs, but interrupted real applies can leave residue; a periodic sandbox sweep belongs in the routine.
- **Writing tests once, at the end.** The suite earns its keep when a refactor lands six months later. Add the run block when you add the conditional — that is when the intent is clearest and cheapest to encode.

## FAQ

**terraform test or Terratest?**
They answer different questions. \`terraform test\` is native, HCL-based, and ideal for module logic and contracts — no Go toolchain, no extra framework. Terratest (Go) remains strong for end-to-end verification that spans tools and real cloud behaviour beyond one module. Many teams use both: native tests in every module repo, Terratest-style end-to-end checks for platform assemblies.

**Does \`terraform test\` cost money?**
Mocked and plan-only runs create nothing and cost nothing. \`command = apply\` runs against a real provider create real resources for the duration of the test — priced accordingly, then destroyed by the framework. Keep them few, small, and in a sandbox.

**Can tests run in CI without cloud credentials?**
Mocked-provider tests: yes, completely — that is their headline feature. Plan runs against a real provider still need whatever credentials that provider requires to configure itself, which is one more reason the mocked suite should carry the bulk of the assertions.

**Where do test files live?**
In the module root or a \`tests/\` subdirectory (the conventional choice), as \`*.tftest.hcl\`. \`terraform test\` discovers them in both places; keep one convention per repository.

**What about OpenTofu?**
OpenTofu implements the same test framework model — test files, run blocks, and mock providers are compatible concepts, so the approach in this guide carries across. Check your version's documentation for exact feature parity before assuming a specific block behaves identically.
  `,
  featuredImage: "/images/blog/terraform-vs-pulumi-cloudformation-2025-iac-comparison/iac-comparison-hero.jpg",
  category: "Terraform",
  tags: ["Terraform", "Testing", "IaC", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "Terraform Testing in 2026: Unit Tests With terraform test and Mock Providers",
    description: "A practical guide to testing Terraform: the native terraform test framework, run blocks and assertions, mock providers for credential-free CI tests, what to test in a module (and what to leave to the provider), and where tests fit alongside lint, scanning and plan review.",
    keywords: "terraform test, Terraform testing, mock provider terraform, tftest.hcl, run block assert, Terraform module testing, IaC unit tests 2026"
  }
};
