// GitHub Actions to AWS Without Stored Keys: OIDC Federation in 2026
export const githubActionsOidcBlog = {
  id: 41,
  title: "GitHub Actions to AWS Without Stored Keys: OIDC Federation in 2026",
  slug: "github-actions-aws-oidc-guide-2026",
  excerpt: "Stop storing AWS access keys in GitHub secrets. A complete guide to OIDC federation for GitHub Actions: the IAM identity provider, trust-policy scoping by repo, branch and environment, the id-token permission everyone forgets, and a safe migration off long-lived keys.",
  content: `
# GitHub Actions to AWS Without Stored Keys: OIDC Federation in 2026

> **TL;DR:** If your GitHub Actions workflows authenticate to AWS with a stored access key, that key is a permanent credential sitting in a second system, waiting to leak and rarely rotated. OIDC federation removes it entirely: each workflow run gets a short-lived token from GitHub, presents it to AWS, and assumes an IAM role scoped to exactly that repository, branch, or environment. Credentials live for about an hour and are never stored anywhere. Setup is one IAM identity provider, one role with a careful trust policy, and two lines in the workflow. This guide walks the whole thing, including the scoping mistakes that quietly undo the benefit.

## The problem: a permanent key in someone else's house

The classic setup is familiar: create an IAM user for CI, generate an access key pair, paste them into GitHub repository secrets, and reference them in the workflow. It works on day one. Then the years happen:

- The key **never rotates**, because rotating it means touching every repo that copied it — and nobody remembers all of them.
- The key **outlives its purpose**: the project is archived, the repo is forked into a test, the contractor who set it up left. The credential remains valid through all of it.
- The key's **permissions drift upward**: it was scoped for one deployment, then someone needed one more action, then it quietly became near-admin because that was faster.
- The key **leaks like a secret, not like a session**: pasted into a log, a debug dump, a screenshot. When a session token leaks you have an hour of exposure; when this leaks you have until someone notices and rotates — if anyone notices.

The deeper issue is architectural: a long-lived credential is a standing invitation. OIDC federation deletes the standing part. There is nothing to steal from the repository because the repository holds nothing — the workflow *proves who it is* at runtime instead.

## How it works, in one paragraph

GitHub runs an OIDC identity provider. Every workflow run can request a signed JSON Web Token whose claims describe that run: the repository (\`sub\`ject claims like \`repo:my-org/my-repo:ref:refs/heads/main\`), the branch or tag, the environment, the workflow name. In AWS, you register GitHub as an IAM OIDC provider once per account, then create an IAM role whose **trust policy** says: "tokens from GitHub's provider may assume me — but only if the claims match these exact conditions." The workflow exchanges its token via \`AssumeRoleWithWebIdentity\` and receives ordinary short-lived AWS credentials (default lifetime one hour). AWS validates the token's signature against GitHub's published keys and checks the audience claim (\`sts.amazonaws.com\`) and your conditions. No shared secret exists on either side.

## Step 1: register GitHub as an OIDC provider in IAM

One time per AWS account (Console: IAM → Identity providers → Add provider → OpenID Connect):

- **Provider URL:** \`https://token.actions.githubusercontent.com\`
- **Audience:** \`sts.amazonaws.com\`

That is the entire provider setup. Everything else lives on the role.

## Step 2: the role and its trust policy — where the security actually is

Create an IAM role for web identity federation. The trust policy is the security boundary of this whole design, so write it deliberately:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:my-org/my-repo:ref:refs/heads/main"
        }
      }
    }
  ]
}
\`\`\`

What each part earns:

- The **\`aud\` condition** confirms the token was minted for AWS STS, not for some other service that also trusts GitHub tokens.
- The **\`sub\` condition** is the scoping decision. \`repo:my-org/my-repo:ref:refs/heads/main\` means: only runs of this repo, on the main branch. Alternatives you will actually use:
  - \`repo:my-org/my-repo:environment:production\` — only runs that deploy to the GitHub *environment* named production (which can itself require manual approval — a strong pattern for prod).
  - \`repo:my-org/my-repo:ref:refs/tags/v*\` with \`StringLike\` — only tag pushes, for release roles.
- **Never** a wildcard like \`repo:my-org/*\` on a powerful role, and never omit the \`sub\` condition. "Any workflow in any repo I own can assume the production deploy role" is the stored-key problem wearing a new coat.

Then attach the role's **permissions policy** — the least-privilege part. Scope it to what the pipeline does: update one ECS service, write to one S3 bucket, publish to one ECR repository. The AWS IAM least-privilege guide on this site covers how to build such policies without guessing; the OIDC work here assumes that discipline rather than replacing it.

One role per (repository, environment) pair is the pattern that scales: \`gha-myrepo-prod\`, \`gha-myrepo-staging\`, each boringly narrow.

## Step 3: the workflow side

Two requirements, both small:

\`\`\`yaml
name: deploy

on:
  push:
    branches: [main]

permissions:
  id-token: write      # without this, no token is issued
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/gha-myrepo-prod
          aws-region: ap-northeast-1

      - name: Deploy
        run: |
          aws s3 sync ./dist s3://my-prod-site-bucket --delete
\`\`\`

Notes that save debugging time:

- **\`permissions: id-token: write\` is the step everyone forgets.** Without it the token request fails before AWS is even involved. Setting any \`permissions\` block also means everything not listed drops to none — hence \`contents: read\` for checkout.
- There are **no secrets to configure**: \`AWS_ACCESS_KEY_ID\` and friends disappear from the repo settings entirely.
- The configure action exports the short-lived credentials to subsequent steps; tools that read the standard AWS credential chain (the AWS CLI, Terraform, SDKs) work unchanged.

## Scoping patterns that matter

**Environments are the strongest lever.** GitHub environments can require a human approval before a job runs, and the token's claims carry the environment name. Combine them: the production role trusts only \`environment:production\`, so even a maintainer pushing to main cannot reach prod credentials until the environment's approval gate passes. Branch protection plus environment approval plus a scoped role is about as strong as CI identity gets without extra tooling.

**Pull requests are a different animal.** A \`pull_request\` run's claims do not look like a branch push — and for forks, the workflow runs in a context you should treat as untrusted. Practical rule: give PR workflows a read-only role if they need AWS at all (fetching artifacts, running plan), and never let a PR-triggered run assume a role that can write to production. \`terraform plan\` on PRs with a read-only role, \`apply\` only from main with the production role, is the canonical split — it pairs naturally with the Terraform state setup from this site's state-management guide.

**Multiple accounts, one pattern.** Staging and production in separate AWS accounts is common; OIDC handles it cleanly because the provider registration and role live per account. The same workflow can assume the staging role in the staging account and the production role in the production account, each trust policy scoped to its own environment claim.

**Reusable workflows inherit the caller's identity carefully.** If you use reusable workflows (this site's guide covers them), the token claims describe the *caller* repository and context — which is what you want, but it means a shared deploy workflow used by ten repos needs trust-policy entries or separate roles per caller repo. Plan for that instead of discovering it as a wildcard temptation.

## Migrating off stored keys without breaking Friday's deploy

1. **Inventory.** Search your repos' secrets and workflows for \`AWS_ACCESS_KEY_ID\`. Note which IAM user each key belongs to and what it can do — this list is usually longer and scarier than expected, which is the argument for the project.
2. **Create the provider and roles**, one repo/environment at a time, permissions mirroring what the key was *supposed* to do (not what it accidentally can).
3. **Switch the workflow** to the OIDC pattern and deploy. Verify in CloudTrail that calls now arrive as the assumed role session, not the old user.
4. **Watch, then delete.** Leave the old key deactivated (not deleted) for a short window while you confirm nothing else uses it — scheduled jobs and forgotten repos surface quickly when a key stops working. Then delete the key, and if the CI IAM user has no remaining purpose, delete the user.
5. **Sweep the leftovers:** organisation-level secrets, third-party tools holding the same keys, and local copies in developer tooling.

Order matters less than completeness: a migration that moves nine repos and forgets the tenth has kept exactly the risk it meant to remove.

## Common mistakes

- **Wildcard \`sub\` conditions.** \`repo:my-org/*\` or a missing \`sub\` check turns one role into every repo's master key. The trust policy is the product; write it narrowly.
- **One role for everything.** A single powerful role assumed by every workflow recreates the shared-key blast radius with better marketing. Role per repo per environment.
- **Forgetting \`id-token: write\`.** The failure appears before AWS is contacted and confuses everyone who starts debugging in IAM.
- **Leaving the old keys active "just in case".** The fallback *is* the vulnerability. Deactivate, watch, delete.
- **Granting write roles to pull-request contexts.** Plan on PRs, apply from protected branches and environments — never both from the same trigger.
- **Skipping the audience check.** The \`aud\` condition costs one line and prevents tokens minted for other purposes from being replayed at STS.
- **Assuming OIDC fixes permissions.** Federation decides *who* may assume the role, not *what* the role may do. An admin role via OIDC is still an admin role; least privilege is a separate, continuing discipline.

## FAQ

**Does this cost anything?**
No. OIDC providers and roles are free IAM features, and STS calls for this pattern are not a line item you will ever notice.

**What if a workflow needs to run longer than the token lifetime?**
Role sessions default to one hour and can be configured up to the role's maximum session duration (up to 12 hours). Design for re-assumption or shorter jobs instead of reaching for the maximum by default — long-lived sessions quietly reintroduce the exposure you removed.

**Can self-hosted runners use this?**
Yes — runners you host still request the token from GitHub's OIDC endpoint at runtime, so the same trust policy works. (GitHub Enterprise Server deployments use their own provider URL; check your instance's docs for its exact value.)

**Does Terraform in GitHub Actions work with OIDC credentials?**
Yes. The configure-aws-credentials step exports standard environment credentials, and the Terraform AWS provider consumes them through its normal credential chain — no provider block changes needed. Remote state locking and the backend setup stay exactly as they were.

**What about other clouds?**
The same pattern exists across the major providers — Azure and Google Cloud both accept GitHub-issued OIDC tokens for workload identity federation with no stored secrets. Once a team learns the shape on one cloud, the others are variations, and the destination of all of them is the same: CI with no permanent keys anywhere.
  `,
  featuredImage: "/images/blog/aws-cost-optimization-15-tactics-saved-50k-month/hero.jpg",
  category: "AWS",
  tags: ["GitHub Actions", "AWS", "Security", "CI/CD"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "10 min read",
  seo: {
    title: "GitHub Actions to AWS Without Stored Keys: OIDC Federation in 2026",
    description: "Stop storing AWS access keys in GitHub secrets. A complete guide to OIDC federation for GitHub Actions: the IAM identity provider, trust-policy scoping by repo, branch and environment, the id-token permission everyone forgets, and a safe migration off long-lived keys.",
    keywords: "GitHub Actions OIDC AWS, AssumeRoleWithWebIdentity, IAM OIDC provider, keyless CI AWS, configure-aws-credentials, GitHub Actions AWS keys 2026"
  }
};
