// CI/CD for Monorepos 2026: Build Only What Changed
export const cicdMonoreposBlog = {
  id: 26,
  title: "CI/CD for Monorepos 2026: Build Only What Changed",
  slug: "cicd-monorepos-guide-2026",
  excerpt: "A monorepo with naive CI rebuilds the world on every commit. Affected-only delivery fixes it: detect the change, expand through the dependency graph, build and test only that slice, cache the rest hermetically, and let a merge queue keep main green. Path filters first, a build tool when the graph outgrows them.",
  content: `
# CI/CD for Monorepos 2026: Build Only What Changed

> **TL;DR:** A monorepo with naive CI rebuilds the world on every commit, so pipelines get slower exactly as the repo succeeds. The fix is affected-only delivery: detect what changed, expand through the dependency graph, build and test only that slice, lean on remote caching for the rest, and protect the main branch with required checks plus a merge queue. Start with path filters in GitHub Actions; graduate to a build tool (Nx, Turborepo, Bazel) when the graph outgrows what filters can express.

## One repo, everything inside

My own website lives in a single repository: the Next.js blog, the API routes, shared components — and, sitting in a folder of its own, the exported files of a 3D portfolio game I built. It's a small repo by industry standards, and it already shows the monorepo shape: unrelated things sharing one history, one issue tracker, one pipeline.

That shape is why teams choose monorepos in the first place. Shared code is actually shared — no version-pinning dance between repos. A refactor can move an API and all its callers in one atomic commit. One CI system to maintain instead of twelve. The costs arrive later, and they arrive in the pipeline: when every commit triggers every build, every test suite, and every deploy, the feedback loop that made the monorepo attractive quietly dies. A one-line change to a README queues behind a full rebuild of services it never touched.

This guide is the delivery design that keeps the benefits: CI that does work proportional to the change, not proportional to the repo.

## Why naive CI breaks as the repo grows

Three failure modes, always in this order:

1. **Time grows linearly with the repo, not the change.** Ten services means ten builds per pull request — including the nine you didn't touch. At fifty services the pipeline is an hour, and engineers start batching changes to "save runs," which makes every run bigger and riskier.
2. **Flakiness becomes everyone's blocker.** One unreliable test in a service you don't own turns your PR red. Multiply by every suite in the repo and a permanently-red main branch stops being an exception.
3. **Deploys couple things the repo was supposed to decouple.** If the pipeline ships everything on every merge, the monorepo has the blast radius of a monolith with the operational overhead of microservices — the worst trade on the table.

None of these are arguments against monorepos. They're arguments against running a monorepo like it's fifty polyrepos sharing a trench coat.

## The core idea: affected-only builds

Every working monorepo pipeline implements the same four steps:

1. **Detect** which files changed in this PR or push.
2. **Map** files to the projects (packages, services, apps) that own them.
3. **Expand** through the dependency graph: a change to a shared library affects every project that depends on it — transitively.
4. **Execute** builds, tests, and deploys for the affected set only. Everything else is skipped, with its previous green result standing.

Step 3 is the one teams skip, and it's the one that matters. Path filters alone answer "what changed"; correctness needs "what is affected." A change inside \`packages/ui\` that doesn't rebuild the three apps importing it hasn't saved you time — it has deferred a breakage to someone else's deploy.

## Level 1: path filters in GitHub Actions

For many teams, GitHub Actions' built-in path filtering plus a change-detection action covers step 1–2 honestly, and that's enough for a long time. Path filters on the trigger:

\`\`\`yaml
on:
  pull_request:
    paths:
      - 'services/api/**'
      - 'packages/**'
      - '.github/workflows/api.yml'
\`\`\`

And for finer control — one workflow that fans out per project — a changes job whose outputs gate the rest:

\`\`\`yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      api: \${{ steps.filter.outputs.api }}
      web: \${{ steps.filter.outputs.web }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            api:
              - 'services/api/**'
              - 'packages/shared/**'
            web:
              - 'apps/web/**'
              - 'packages/shared/**'

  build-api:
    needs: changes
    if: needs.changes.outputs.api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "build and test the API"
\`\`\`

Notice \`packages/shared/**\` appears in both filters — a hand-maintained shadow of the dependency graph. That's the honest limit of this level: fine for a handful of projects with shallow sharing, brittle once the graph gets deep. In my own setup, personal projects live on GitHub and deploy through Vercel on push to main, and Vercel's own monorepo handling (root directory settings, ignored build steps) plays this same role for the deploy side — skip the build when the project's slice didn't change. The principle is identical at every scale: pay only for what the change touches.

## Level 2: let a build tool own the graph

When hand-written filters start lying — shared packages nested inside shared packages, generated code, mixed languages — the graph needs a real owner. The well-known names, by ecosystem:

- **Nx** — JavaScript/TypeScript-first, with \`nx affected\` computing the affected set from its project graph, plus task caching locally and remotely.
- **Turborepo** — lighter-weight, pipeline-oriented, popular with Next.js-style app collections; remote cache is its headline feature.
- **Bazel** — the industrial option: language-agnostic, hermetic builds, precise dependency graphs; the power is real and so is the adoption cost.
- **Pants / Please / moon** — worth knowing exist if your repo is Python-heavy, polyglot, or JS with different tastes.

The evaluation question is never "which is best" — it's "who maintains our graph, and what does the cache hit rate look like." Whichever you choose, the affected computation and the cache are the product; the CLI is packaging. I learned the mirror of this lesson with Jenkins years ago: every capability arrives as a plugin you then own, so a tool's maintenance tail is part of its price. Monorepo tooling is no different — adopt the smallest tool whose graph you trust.

## Caching: the second half of "only build what changed"

Affected-only execution shrinks the work; caching shrinks what's left. Two layers:

- **Dependency caching** — the package manager's store (npm/pnpm, pip, Maven, Go modules) keyed by lockfile hash, via \`actions/cache\` or your tool's built-in handling. This is table stakes; a monorepo without it re-downloads the internet on every run.
- **Task/build caching** — the monorepo tool records inputs (source files, dependency outputs, environment, command) and replays stored outputs when inputs repeat. Locally it makes the second \`build\` instant; **remote caching** shares those results across the team and CI, so a branch whose code matches something a teammate already built skips the work entirely.

The discipline that makes caching safe is hermetic inputs: if a build secretly reads the current time, an unpinned network fetch, or a file outside its declared inputs, the cache will eventually serve you a confidently wrong artifact. Declare inputs honestly, pin versions in lockfiles, and treat a suspicious cache result as a build bug, not as weather.

## Testing strategy: fast where it's local, honest where it's shared

Running "the affected tests" has the same graph trap as building: a change to a shared library should run its dependents' tests too. Practical shape:

- **Unit tests** run for the affected set on every PR — these must be fast and hermetic, or nothing else here works.
- **Integration/contract tests** for the affected set plus its direct dependents. Shared libraries earn extra scrutiny: their blast radius is the argument for their existence.
- **End-to-end tests** are the budget item. Run a smoke subset on PRs, the full suite on merge to main (or nightly), and keep them owned — an E2E test with no owner becomes a flake generator with a fan club.
- **Quarantine flaky tests deliberately.** A flaky test in a monorepo taxes every PR in the repo. The honest pattern: automatic detection (rerun-to-pass patterns flagged), a quarantine list with an owner and an expiry date, and the test still running in a non-blocking job so the signal isn't lost. Pretending flakiness is a discipline problem instead of an engineering one is how main branches stay red.

Per-project pipeline definitions also don't have to mean copy-pasted YAML: [reusable workflows and composite actions](https://www.devopsenginer.com/blog/github-actions-reusable-workflows-guide-2026) let one maintained definition serve every project in the repo, with inputs for what differs.

## Releases and versioning inside one repo

A monorepo doesn't imply a single version or a single release train. Two common models:

- **Independent versioning** — each package/service versions and releases on its own (libraries published per-package, services deployed per affected set). Fits services; needs tooling discipline (changeset-style workflows for JS repos are the well-known pattern) so humans state the bump intent with the change.
- **Fixed/lockstep versioning** — everything versions together. Simpler mental model, fits tightly-coupled product suites and app monorepos where "the version" means the whole product.

Deploys follow the same affected logic as builds: a merge to main deploys the affected services, each through its own pipeline — and if you deliver with GitOps, each affected service's desired state updates in git independently, exactly the model in our [GitOps vs traditional CI/CD comparison](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison). The anti-pattern to refuse: a "deploy everything Friday" train created because per-service deploys were never made safe. That train is a monolith wearing a monorepo's clothes.

## Protecting main: required checks and merge queues

Affected-only CI creates one subtle hazard: PR checks and main-branch checks can test different sets. A PR that skips a job because its slice didn't change can merge into a main where that job would have failed — two individually-green PRs can compose into a red main.

The mechanisms that close the hole:

- **Required status checks** per project path, so a PR can't merge without its affected jobs passing.
- **A merge queue** (GitHub's is built in) that tests the *merged result* — your PR combined with everything ahead of it in the queue — before it lands. This is the piece that makes "main is always green" a property of the system instead of a hope.
- **A scheduled full-repo run** (nightly) as the safety net: everything builds, everything tests, and failures are triaged as platform work in the morning — not discovered by the next unrelated PR.

## When a monorepo is the wrong answer

Honesty section, because the migration runs both ways. Split (or don't adopt) when:

- **Access control genuinely differs** — regulated or client-confidential code that must not be visible to the whole engineering org doesn't belong in the shared repo. (This is a real constraint, not an aesthetic one; it decides the question on its own.)
- **Release cadences are hostile** — a library consumed by external teams on strict versioned contracts may live better as its own repo with real published versions.
- **The tooling tax exceeds the sharing benefit** — a two-person team with two services gains little from Bazel. Path filters and discipline scale further than conference talks admit.

Notice none of these are "the repo got big." Big is a CI design problem, and it's the one this guide solves.

## Mistakes that make monorepo CI miserable

1. **Rebuilding everything "to be safe."** You've rebuilt the polyrepo's costs inside one repo and kept none of its isolation. Safety lives in the graph's correctness, not in redundant compute.
2. **Path filters without the dependency expansion.** The shared-library change that skips its dependents' builds doesn't save time; it schedules a surprise.
3. **No owner for flaky tests.** In a monorepo, one team's flake is every team's blocked Friday. Quarantine with an owner and an expiry, or fix it the week it appears.
4. **Caches with undeclared inputs.** The first poisoned artifact costs more trust than a year of cache misses. Hermetic or don't cache.
5. **A mega-workflow file.** One 2,000-line workflow that every PR triggers is un-reviewable and un-skip-able. Fan out per project; share logic through reusable workflows, not through one file's job list.
6. **Skipping the merge queue because PR checks "already passed."** They passed against yesterday's main. The queue tests the combination you're actually shipping.

## FAQ

**Do I need Nx/Turborepo/Bazel, or are path filters enough?**
Path filters are enough while the dependency graph is shallow enough to hold in your head — a few projects, one shared layer. The moment filters start missing dependents (or including everything "just in case"), the graph has outgrown hand-maintenance and a tool should own it. Start at the cheapest level that tells the truth.

**How do I handle a change to the repo root — CI config, root lockfile?**
Treat root-level changes as affecting everything that consumes them: a root CI change should run the full suite (it's the pipeline changing itself), and a lockfile change affects every project resolving from it. Encode that as an explicit filter rule rather than discovering it during an incident.

**Monorepo with multiple languages — one tool or several?**
Either can work. Bazel and Pants are built for the polyglot case; language-native tools (Nx for JS, plus per-language CI for the rest) work when the language subtrees share little code. The deciding factor is how much cross-language dependency actually exists — measure it before choosing.

**Does a monorepo slow down git itself?**
Eventually, at very large scale, clone and status operations grow — which is why the largest monorepos pair with partial clone, sparse checkout, and virtual filesystems. Most teams hit CI pain years before git pain; solve them in that order.

**How does this fit platform engineering?**
The affected-only pipeline is a textbook platform product: a paved road every team in the repo consumes, maintained once. It's one of the highest-leverage builds in the [platform engineering](https://www.devopsenginer.com/blog/rise-of-platform-engineering-redefining-devops-2025) story — internal customers, a real interface, and a measurable benefit (pipeline minutes) that no team has to build for itself.

## Conclusion

A monorepo's promise is atomic change across everything you own; its tax is a pipeline that wants to rebuild everything you own. Affected-only delivery is how you keep the promise and refuse the tax: detect the change, expand through the graph, build and test that slice, cache aggressively but hermetically, and let a merge queue guarantee that green PRs compose into a green main. Start where you are — for most GitHub Actions users that's path filters this week and an honest look at your shared packages — and let the graph's real complexity, not fashion, tell you when it's time for a build tool. If you want the underlying Actions mechanics first, our [GitHub Actions pipeline guide](https://www.devopsenginer.com/blog/how-to-build-cicd-pipeline-github-actions-2025) is the place to start.
  `,
  featuredImage: "/images/blog/how-to-build-cicd-pipeline-github-actions-2025/cicd-hero.jpg",
  category: "DevOps",
  tags: ["CI/CD", "Monorepo", "GitHub Actions", "DevOps", "Platform Engineering"],
  author: "DevOps Enginer",
  publishDate: "2026-10-31",
  lastModified: "2026-10-31",
  readTime: "13 min read",
  seo: {
    title: "CI/CD for Monorepos 2026: Build Only What Changed",
    description: "A monorepo with naive CI rebuilds the world on every commit. Affected-only delivery fixes it: detect the change, expand through the dependency graph, build and test only that slice, cache the rest hermetically, and let a merge queue keep main green. Path filters first, a build tool when the graph outgrows them.",
    keywords: "CI/CD monorepo, monorepo pipeline, affected builds, GitHub Actions path filters, Turborepo, Nx affected, Bazel, merge queue, remote cache 2026"
  }
};
