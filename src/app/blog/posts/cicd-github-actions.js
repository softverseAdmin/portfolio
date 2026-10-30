// Build a CI/CD Pipeline with GitHub Actions (2026): Complete Step-by-Step Guide
export const cicdGithubActionsBlog = {
  id: 5,
  title: "Build a CI/CD Pipeline with GitHub Actions (2026): Complete Step-by-Step Guide",
  slug: "how-to-build-cicd-pipeline-github-actions-2025",
  excerpt: "Build a complete CI/CD pipeline with GitHub Actions in 2026: lint, typecheck, test, build, Docker image to GHCR, and an approval-gated deploy \u2014 full YAML included.",
  content: `
# Build a CI/CD Pipeline with GitHub Actions (2026): Complete Step-by-Step Guide

> ## TL;DR
>
> A production-shaped GitHub Actions pipeline has five parts: a **CI workflow** that installs dependencies reproducibly (\`npm ci\`, never \`npm install\`), runs lint, typecheck, tests, and a build on every pull request; **caching and small, split jobs** so that pipeline finishes in minutes, not tens of minutes; a **CD workflow** that builds a Docker image, tags it with the commit SHA, and pushes it to a registry (GHCR); a **deploy job gated by a GitHub Environment** so a human approves production; and **least-privilege permissions plus OIDC** so the pipeline holds short-lived credentials instead of stored cloud keys. This guide builds all five, step by step, around a Node.js/Next.js app, with complete YAML at every stage.

## Why this guide is structured the way it is

Most "build a pipeline" tutorials stop at the demo: checkout, install, test, done. That pipeline breaks down the first time a real team touches it — the build takes 25 minutes, a deploy overwrites another deploy, a leaked token has admin rights, and nobody can tell which image is actually running in production.

So this guide builds the pipeline in the order you will actually need it:

1. **CI first** — fast, reproducible checks on every pull request.
2. **Speed second** — caching, split jobs, and matrix builds, because a slow pipeline gets bypassed.
3. **Delivery third** — a Docker image tagged with the commit SHA, pushed to GitHub Container Registry (GHCR).
4. **Safety always** — environment approvals, concurrency control, least-privilege tokens, and OIDC instead of stored cloud keys.

The worked example is a Next.js application — the same stack this site runs on — but every step transfers directly to any Node.js project, and the patterns (split jobs, SHA-tagged images, gated deploys) transfer to any language.

If you are still deciding between Actions, GitLab CI, and Jenkins, read the comparison first: [GitHub Actions vs GitLab CI vs Jenkins](https://www.devopsenginer.com/blog/github-actions-vs-gitlab-ci-vs-jenkins-2025-comparison). This guide assumes you have chosen Actions and want to build it properly.

## What we are building

Two workflow files in \`.github/workflows/\`:

| File | Trigger | Jobs | Purpose |
|---|---|---|---|
| \`ci.yml\` | Push and pull request to \`main\` | \`quality\`, \`test\` | Lint, typecheck, test, build — the merge gate |
| \`cd.yml\` | Push to \`main\`, manual dispatch | \`image\`, \`deploy\` | Build and push the Docker image, then deploy with approval |

By the end, every merge to \`main\` produces one immutable, SHA-tagged image, and deploying it requires a human click.

## Prerequisites

- A GitHub repository containing a Node.js application (the examples use a Next.js app; any Node project works).
- A \`package-lock.json\` committed to the repository. This is non-negotiable: \`npm ci\` and dependency caching both depend on it.
- These scripts defined in \`package.json\` (adjust names to your project — the pipeline calls *your* scripts, so it stays framework-agnostic):

\`\`\`json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "next build"
  }
}
\`\`\`

- For the Docker and deploy sections: a \`Dockerfile\` (provided in Step 6) and a deployment target — a Kubernetes cluster for the concrete example, or a Git-integrated platform such as Vercel (covered as an alternative in Step 7).
- Permissions to change repository settings (to add branch protection, environments, and secrets later).

One version note before we start: the examples pin the current widely used major versions of each action (\`actions/checkout@v7\`, \`actions/setup-node@v7\`, the Docker actions at \`v4\`/\`v7\`, and so on). GitHub and Docker retire old action runtimes periodically, so treat version bumps as routine maintenance — Dependabot can open those update PRs for you automatically.

## Step 1: Your first job — install, lint, typecheck

Create \`.github/workflows/ci.yml\`:

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  quality:
    name: Lint and typecheck
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Check out the repository
        uses: actions/checkout@v7

      - name: Set up Node.js with dependency caching
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies exactly as locked
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck
\`\`\`

Four decisions in this small file are worth understanding, because they prevent the most common pipeline problems:

- **\`npm ci\`, not \`npm install\`.** \`npm ci\` deletes \`node_modules\` and installs exactly what \`package-lock.json\` specifies, and it *fails* if the lockfile and \`package.json\` disagree. \`npm install\` can silently resolve different versions on the runner than on your machine — the classic "works locally, fails in CI" (or worse, passes in CI and fails in production).
- **\`cache: npm\` in \`setup-node\`.** This caches the npm download cache directory, keyed on your lockfile. It is the single highest-value speed setting in a Node pipeline, and Step 4 builds on it.
- **\`permissions: contents: read\`.** By default the \`GITHUB_TOKEN\` can be more powerful than your workflow needs. Setting explicit permissions means every job in this workflow gets a read-only token unless you deliberately grant more. Make this a habit from the first workflow, not a later cleanup.
- **\`timeout-minutes: 10\`.** The default job timeout is 360 minutes. A hung test or an accidental infinite loop can burn six hours of runner time. Lint and typecheck should take two minutes; ten is generous.

Push this file and open a pull request — you should see the **Lint and typecheck** check appear on the PR. In the repository's branch protection settings for \`main\`, mark it as a *required status check*. From now on, code that fails lint or typechecking cannot be merged.

## Step 2: Add the test-and-build job

Fast checks first, expensive checks second. Add a second job to the same workflow:

\`\`\`yaml
  test:
    name: Test and build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: quality
    steps:
      - name: Check out the repository
        uses: actions/checkout@v7

      - name: Set up Node.js with dependency caching
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies exactly as locked
        run: npm ci

      - name: Run the test suite
        run: npm test

      - name: Verify the production build
        run: npm run build
\`\`\`

Two things to notice:

- **Every job starts on a fresh runner.** Jobs do not share a filesystem, so the test job checks out the code and installs dependencies again. That is not waste — it is what makes jobs independent and parallelisable — and caching (Step 4) is what makes the repeated install cheap.
- **\`needs: quality\` serialises deliberately.** There is no point spending fifteen minutes of test-and-build time on code that fails a thirty-second typecheck. For larger pipelines the pattern generalises: cheap, fast jobs gate expensive ones.

Mark this check as required in branch protection too. Your merge gate is now: lint ✓, typecheck ✓, tests ✓, production build ✓.

My own lesson in why this gate exists came from my 3D portfolio. Deploying it was a manual affair: build it, upload it, open the site, and find out what the deploy had done to it. More than once, the first error message I got was the page itself, staring back at me broken in the browser. The deploy had already reported success. The failure only became visible once it was live — and I was the one who had to look at it.

That is the whole argument for the two jobs above, learned the slow way. A check that runs before the merge moves the bad news to the cheapest possible moment: a red box on a pull request instead of a broken page in production. My own projects now deploy the boring way — the code lives on GitHub, checks stand in front of the merge, and Vercel only ever publishes what already passed. I stopped hoping my deploys would work and started arranging for them to prove it first.

## Step 3: Stop wasting runs — concurrency control

Push three commits in five minutes and, by default, GitHub runs the full pipeline three times — even though only the newest result matters. Add a concurrency group at the top level of \`ci.yml\`:

\`\`\`yaml
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
\`\`\`

Now, when a new run starts for the same workflow on the same branch or pull request, the older in-progress run is cancelled. On a busy pull request this routinely saves more runner time than any other single change.

The rules to remember:

- Use \`cancel-in-progress: true\` for CI, where only the latest result has value.
- Use \`cancel-in-progress: false\` for deploys (Step 7), where cancelling halfway is dangerous. Queued runs in a group without cancellation wait their turn — and if several queue up, intermediate ones can be superseded, so the group effectively runs the newest waiting deploy. For production, that is usually what you want.

## Step 4: Make it fast — caching in depth

\`cache: npm\` from Step 1 caches downloaded packages. For a Next.js app there is a second, bigger win: the framework's build cache in \`.next/cache\`, which lets incremental builds reuse compiled work between runs. \`setup-node\` does not handle that path, so add \`actions/cache\` to the **Test and build** job, before the build step:

\`\`\`yaml
      - name: Cache the Next.js build cache
        uses: actions/cache@v5
        with:
          path: .next/cache
          key: \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-\${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-
            \${{ runner.os }}-nextjs-
\`\`\`

How to read this:

- The **key** is exact. If any TypeScript file or the lockfile changes, the key changes and a fresh cache entry is written at the end of the run.
- **Restore keys** are prefixes. On an exact-key miss, GitHub restores the most recent cache matching the first prefix, then the next. A slightly stale build cache is far better than none — the build system figures out what changed.
- Caches are **scoped by branch**: a pull request can restore caches created on its base branch, which is why the first run after merging to \`main\` is usually fast. A cache is not shared with unrelated branches.
- GitHub enforces documented limits — a per-repository total cache size (10 GB, with least-recently-used eviction) and eviction of entries that go unused for over a week. If your caches keep disappearing, you are probably churning keys, not hitting a bug (see Step 9).

What *not* to cache: \`node_modules\` directly. It is large, platform-sensitive, and \`npm ci\` with a warm npm cache is already fast. Cache the download cache and framework build caches; let the installer do its job.

## Step 5: Test across versions — matrix builds

If your project is a library, or you support more than one Node.js LTS line, a matrix runs the same job across combinations. Apply it to the test job:

\`\`\`yaml
  test:
    name: Test and build (Node \${{ matrix.node }})
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: quality
    strategy:
      fail-fast: false
      matrix:
        node: [24, 26]
    steps:
      - name: Check out the repository
        uses: actions/checkout@v7

      - name: Set up Node.js \${{ matrix.node }}
        uses: actions/setup-node@v7
        with:
          node-version: \${{ matrix.node }}
          cache: npm

      - name: Install dependencies exactly as locked
        run: npm ci

      - name: Run the test suite
        run: npm test

      - name: Verify the production build
        run: npm run build
\`\`\`

Judgement calls that matter more than the syntax:

- **\`fail-fast: false\`** means one failing combination does not cancel the others. You usually want the full picture — "fails on Node 24 only" is exactly the signal a matrix exists to give you.
- **A matrix multiplies cost.** Two Node versions double the job's minutes; adding an OS axis doubles them again. For an application (as opposed to a library), you deploy on exactly one Node version — so run the full matrix nightly or on pushes to \`main\`, and keep pull requests on the single production version. Match the versions to your project's \`engines\` field or \`.nvmrc\`; the pair above (24 and 26) covers the current LTS lines — 26 became Active LTS in October 2026 and 24 is in maintenance LTS — so adjust to what you actually deploy.
- If one combination is experimental, isolate it with \`include\` and \`continue-on-error\` on that leg only — never on the whole job, or the matrix stops being a gate.

My own repositories taught me restraint here. When a project is yours alone, every extra job in the pipeline is a job you wait on and a job you maintain — so my rule is to cache the two things that pay for themselves, the npm download cache and, on Next.js projects like this site, the framework build cache, and to leave the clever extras out until a slow build actually annoys me into adding them. The matrix gets the same discipline. I deploy my own apps on one Node version, so that is the version my CI treats as sacred. A wide matrix on a solo project is mostly theatre: it tests combinations nobody will ever run, and charges you minutes for the performance. If a project grows an audience that runs it on other versions, the matrix earns its place then — and not before.

## Step 6: Build and push the Docker image

CI proves the code is good. CD packages it. For a Next.js app, first make sure \`next.config\` enables the standalone output, which produces a minimal self-contained server — it is what makes the final image small:

\`\`\`js
// next.config.mjs
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
\`\`\`

Then add a multi-stage \`Dockerfile\` at the repository root:

\`\`\`dockerfile
# syntax=docker/dockerfile:1
FROM node:24-alpine AS base

# Stage 1: install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: the production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \\
  && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
\`\`\`

Now create the second workflow, \`.github/workflows/cd.yml\`. It runs only on merges to \`main\` (plus a manual trigger), so pull requests never push images:

\`\`\`yaml
name: CD

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  image:
    name: Build and push image
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Check out the repository
        uses: actions/checkout@v7

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v7
        with:
          context: .
          push: true
          tags: |
            ghcr.io/\${{ github.repository }}:\${{ github.sha }}
            ghcr.io/\${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
\`\`\`

The details that make this production-shaped rather than demo-shaped:

- **The image is tagged with the full commit SHA.** \`latest\` is a convenience for humans; the SHA tag is the identity of the release. Deploys (next step) reference the SHA tag, rollbacks re-deploy an older SHA tag, and there is never an argument about which code an image contains. (For formal releases, \`docker/metadata-action@v6\` can generate semantic-version and branch tags for you — worth adopting once you tag releases.)
- **\`packages: write\` is granted explicitly, and only in this workflow.** Pushing to GHCR with the \`GITHUB_TOKEN\` fails without it — this is the single most common GHCR error (Step 9). The CI workflow keeps its read-only token.
- **No registry password exists.** The login uses the workflow's own \`GITHUB_TOKEN\`, which expires when the job ends. Nothing to leak, nothing to rotate.
- **Layer caching via \`type=gha\`** stores BuildKit layers in the GitHub Actions cache, so unchanged Dockerfile stages are skipped on the next build. \`mode=max\` caches intermediate stages too — bigger cache, faster builds.
- Add a \`.dockerignore\` file (at minimum: \`node_modules\`, \`.next\`, \`.git\`). Without it, the build context uploads your local \`node_modules\` on every run and the \`COPY . .\` in the builder stage can overwrite the clean install from the \`deps\` stage.

## Step 7: Deploy — environments, approvals, and the deploy job

A GitHub **Environment** is a deployment target with its own protection rules and secrets. Create one in the repository under **Settings → Environments → New environment**, name it \`production\`, and enable **Required reviewers** — add yourself. From that moment, any job that references the environment pauses until a reviewer approves it in the Actions UI.

### Option A: your platform deploys from Git (Vercel and similar)

If your host is connected to the repository — as Vercel is for this site — the platform already deploys every merge to \`main\`. In that model, do **not** add a deploy job that competes with it. Your pipeline's job is to be the *gate*: required status checks on \`main\` mean broken code cannot merge, and the platform only ever deploys what passed. The Docker image from Step 6 remains useful as a portable, reproducible artifact, but the merge is the deploy trigger. Many small projects should stop exactly here.

### Option B: the pipeline deploys a container

When you run the target yourself — a Kubernetes cluster, a VM, a container service — add a deploy job to \`cd.yml\`:

\`\`\`yaml
  deploy:
    name: Deploy to production
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: image
    environment: production
    concurrency:
      group: deploy-production
      cancel-in-progress: false
    steps:
      - name: Check out the repository
        uses: actions/checkout@v7

      # Authenticate to your cloud here — see Step 8 for the OIDC pattern.
      # The exact "point kubectl at the cluster" command depends on your
      # provider, e.g. for Amazon EKS:
      #   aws eks update-kubeconfig --name <cluster> --region <region>

      - name: Deploy the exact image built in this run
        run: |
          kubectl set image deployment/web \\
            web=ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          kubectl rollout status deployment/web --timeout=5m

      - name: Show what is now running
        if: always()
        run: kubectl rollout history deployment/web
\`\`\`

Read the safety properties of this job:

- **\`environment: production\`** is what triggers the approval pause and unlocks environment-scoped secrets. Nothing in this job — not even the first step — runs until a reviewer approves.
- **\`needs: image\`** guarantees the deploy uses the image built in *this* run, and the deploy step references it by the same \`\${{ github.sha }}\` expression the image job used as a tag. Build once, deploy that exact artifact — never rebuild at deploy time.
- **Job-level \`concurrency\` with \`cancel-in-progress: false\`** means two merges in quick succession deploy *in sequence*, never simultaneously — and a deploy is never killed mid-rollout by the next one.
- **\`kubectl rollout status\` makes the job honest.** The step fails if the rollout does not complete, so a green run actually means "the new version is serving", not "a command was issued". Rollback is the mirror image: re-run the deploy with an older SHA tag (or \`kubectl rollout undo\`) — because every release has an immutable tag, going back is a deploy, not a rescue operation.

Notice what this job is, architecturally: CI pushes a change and a controller reconciles the cluster to it. If you would rather have a controller *pull* the desired state from Git — the model Argo CD implements — the pipeline's deploy job shrinks to "commit the new image tag to the manifests repository". That trade-off is covered in depth in [GitOps vs Traditional CI/CD](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison).

My own projects deploy the Option A way — Vercel is connected to the repository, and a merge to \`main\` is the deploy. There is no approval button in that flow, so my gate is the merge itself. And my second gate is embarrassingly manual: after anything meaningful ships, I open the live site and look at it. The 3D portfolio is why. Its deploys could finish cleanly while the result waiting in the browser was wrong — the upload reported success, and the errors were sitting on the page. Automation had no opinion about what it had just published. My eyes did. So the rule I actually live by: small content changes can ride the merge straight out, but anything structural gets a human look at the real, deployed thing before I call it done. A green pipeline means the process worked. It has never, by itself, meant the site did.

## Step 8: Secrets and OIDC — stop storing cloud keys

Everything above was designed so the pipeline holds almost no long-lived secrets. Keep it that way:

**Rules for secrets that must exist** (a third-party API token, for example):

- Store them in **Settings → Secrets and variables → Actions**, or on the *environment* when they are production-only — environment secrets are only exposed to jobs that passed that environment's approval gate.
- Reference them as \`\${{ secrets.NAME }}\`. GitHub masks known secret values in logs, but masking is a safety net, not permission to echo them.
- Never put a secret in a workflow file, an image layer, or a build argument that ends up in the image history.
- Remember that workflows triggered by pull requests **from forks receive no secrets** and a read-only token. That is a security feature — design CI so it passes without secrets, and keep anything secret-dependent in the CD workflow.

**For cloud access, prefer OIDC over stored keys.** GitHub can act as an OIDC identity provider: the workflow requests a short-lived token, exchanges it for a cloud role, and the credentials expire with the job. There is no \`AWS_ACCESS_KEY_ID\` sitting in your settings for years. For AWS, the shape is:

\`\`\`yaml
permissions:
  id-token: write   # required to request the OIDC token
  contents: read

steps:
  - name: Configure AWS credentials via OIDC
    uses: aws-actions/configure-aws-credentials@v6
    with:
      role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy
      aws-region: ap-northeast-1
\`\`\`

(The account ID and role name are examples — substitute your own role, and scope that role to the minimum it needs, such as updating one service or one cluster.) Equivalent official actions exist for Google Cloud and Azure. The one-line summary: **the role's trust policy decides which repository, branch, or environment may assume it** — you can, and should, restrict the production role so only the \`production\` environment's jobs can use it.

Pipeline security is a topic of its own — SAST and dependency scanning in the workflow, pinning actions, protecting the token, and the rest of the checklist are covered in [DevSecOps Checklist: Securing Your Pipeline](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025). Add those controls once this basic pipeline runs; do not let their absence stop you from shipping the pipeline itself.

## Step 9: Debugging the failures everyone hits

**"Error: Resource not accessible by integration" or a 403 when pushing the image.**
The \`GITHUB_TOKEN\` does not have the permission the step needs. For GHCR pushes, the workflow needs \`permissions: packages: write\` (Step 6) — and if the package is linked to an organisation or pre-existing, check the package's own access settings too. Read permission errors literally: GitHub is telling you which scope is missing.

**The cache is never hit.**
Three usual causes, in order. First, the key changes every run — often because someone put \`\${{ github.sha }}\` or a timestamp in the key, guaranteeing a miss; keys should be built from *inputs* (lockfile, source files), not from run identity. Use restore-keys so a changed key still restores something close. Second, there is no committed \`package-lock.json\`, so \`setup-node\` caching silently does nothing useful. Third, branch scoping: a feature branch cannot restore a cache created on a *sibling* branch, only its own and its base branch's — the first run on a new branch is often a partial hit, and that is normal.

**A test passes locally and fails in CI "randomly".**
Treat flaky tests as bugs with good PR. Use **Re-run failed jobs** (not the whole workflow) to confirm flakiness versus a real failure, and make the failure diagnosable *before* it happens: upload test reports, screenshots, or logs as artifacts so a failed run leaves evidence behind:

\`\`\`yaml
      - name: Upload test results on failure
        if: failure()
        uses: actions/upload-artifact@v6
        with:
          name: test-results-\${{ github.run_id }}
          path: test-results/
          retention-days: 7
\`\`\`

Then fix the root cause — shared state between tests, dependence on timing or ordering, a real race the test exposed. What you must not do is silence it with \`continue-on-error: true\` or an automatic retry loop: a gate that sometimes lies is worse than no gate.

**The deploy job was skipped, or waits forever.**
Skipped usually means its \`needs\` job failed or a condition filtered it out — check the graph view of the run. Waiting forever usually means the \`production\` environment is doing its job: an approval is pending. If nobody was asked to approve, check that the environment name in the job matches the environment you created, character for character.

**The YAML itself will not parse, or \`on\` behaves strangely.**
GitHub's parser is forgiving about some things and strict about indentation — keep step indentation mechanical and consistent. One classic trap lives in external editors: YAML 1.1 treats an unquoted \`on\` as the boolean \`true\`, so some tools rewrite or mis-display the trigger key. If your editor does this, write the key quoted — \`"on":\` — which GitHub accepts.

**A step hangs until the job times out.**
That is what \`timeout-minutes\` is for (Steps 1–2 set it per job; the platform default is 360 minutes). Common culprits: a command waiting for interactive input (add \`--yes\`-style flags or \`CI=true\`), a dev server started in the foreground instead of the background, and downloads from a slow registry — which caching usually fixes.

## Common mistakes to avoid

- **One giant job that does everything.** Split jobs so fast checks gate slow ones, failures are localised, and independent work can run in parallel.
- **\`npm install\` in CI.** Non-reproducible installs are the root of a whole genre of "CI is broken" afternoons. \`npm ci\` plus a committed lockfile ends it.
- **No \`permissions\` block.** Workflows inherit whatever the repository default is — often more than they need. Least privilege per workflow, \`packages: write\` only where images are pushed.
- **Deploying the \`latest\` tag.** If you cannot name the exact commit that is running, you cannot roll back with confidence. Tag with the SHA; deploy the SHA.
- **\`cancel-in-progress: true\` on a deploy.** Cancelling a half-finished rollout leaves the target in an unknown state. CI cancels; deploys queue.
- **Long-lived cloud keys in secrets when OIDC exists.** A stored key is a permanent liability; an OIDC-exchanged credential lives for minutes.
- **Self-hosted runners for public or fork-heavy repositories.** Untrusted code on your own hardware is a serious security risk — the original version of this guide recommended self-hosted runners without that warning. Use GitHub-hosted runners unless you have a concrete reason and a hardened, ephemeral runner setup.
- **A green pipeline nobody trusts.** If the team routinely merges with failing or flaky checks "because it's probably nothing", the pipeline has already failed at its real job.

## FAQ

### Is GitHub Actions free?

For public repositories, standard GitHub-hosted runners are free. Private repositories include a monthly allowance of runner minutes that varies by plan, with usage beyond the allowance billed per minute; self-hosted runners cost you only your own infrastructure. Allowances and prices change, so check GitHub's current Actions billing documentation before budgeting a large private project.

### Should CI run on pull requests, pushes, or both?

Both, with different jobs. Pull requests run the CI workflow — they are the merge gate, and reviewers should never have to wonder whether the code passes. Pushes to \`main\` run the CD workflow, because \`main\` should only ever contain code that already passed CI in its pull request.

### How do I stop two deployments from running at the same time?

Use a \`concurrency\` group on the deploy job with \`cancel-in-progress: false\`, as in Step 7. Runs in the same group then execute one at a time, in order, and a deploy is never interrupted mid-rollout. Use the opposite setting — \`cancel-in-progress: true\` — for CI, where only the newest run matters.

### Secrets or OIDC for connecting to AWS, GCP, or Azure?

OIDC, wherever the platform supports it (all three major clouds do). The workflow exchanges a short-lived token for a tightly scoped role, so there is no permanent cloud key stored in GitHub to leak or rotate. Keep repository and environment secrets for the things that genuinely are static tokens, and scope them to environments where you can.

### How do I roll back a bad deployment?

Deploy the previous image tag. Because every image is tagged with its commit SHA (Step 6), rollback is just the deploy job pointed at the last known-good SHA — or \`kubectl rollout undo\` for a quick in-cluster revert. Practise it once before you need it; a rollback you have never run is a hypothesis, not a plan.

### How does GitHub Actions compare with GitLab CI and Jenkins?

Actions wins on GitHub integration and time-to-first-pipeline; GitLab CI is comparably strong if your code already lives on GitLab; Jenkins offers the most control at the highest maintenance cost, which is why it persists in large, self-hosted estates. The full breakdown — pricing model, plugin ecosystems, self-hosting, and which suits which team — is in [GitHub Actions vs GitLab CI vs Jenkins](https://www.devopsenginer.com/blog/github-actions-vs-gitlab-ci-vs-jenkins-2025-comparison).

## Conclusion

A good pipeline is not the longest YAML file — it is the one whose result the whole team believes. Build it in this order: reproducible CI on every pull request, caching and split jobs so it stays fast, an image tagged with the commit SHA, an approval gate in front of production, and credentials that expire before anyone could steal them. Each step in this guide stands on its own, so adopt them incrementally: the required status checks you set up in Step 1 will already change how your project feels to work on.

From here, the natural next layers are security scanning in the pipeline (see the [DevSecOps checklist](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025)) and, if your deployments grow more complex, letting a GitOps controller reconcile state instead of pushing changes (see [GitOps vs Traditional CI/CD](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison)).
  `,
  featuredImage: "/images/blog/how-to-build-cicd-pipeline-github-actions-2025/cicd-hero.jpg",
  category: "DevOps",
  tags: ["CI/CD", "GitHub Actions", "DevOps", "Automation", "Pipeline", "AWS", "Docker", "Kubernetes", "Deployment", "2026"],
  author: "DevOps Enginer",
  publishDate: "2025-10-20",
  lastModified: "2026-10-30",
  readTime: "26 min read",
  seo: {
    title: "Build a CI/CD Pipeline with GitHub Actions (2026): Complete Step-by-Step Guide",
    description: "Build a complete CI/CD pipeline with GitHub Actions in 2026: lint, typecheck, test, build, Docker image to GHCR, and an approval-gated deploy \u2014 full YAML included.",
    keywords: "CI/CD pipeline, GitHub Actions, DevOps automation, continuous integration, continuous deployment, AWS deployment, Docker, Kubernetes, secrets management, workflow automation, 2026"
  }
};
