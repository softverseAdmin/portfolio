// How to Optimize Docker Images for Production in 2026: Smaller Images, Fewer CVEs, Faster Deploys
export const dockerImageOptimizationBlog = {
  id: 11,
  title: "How to Optimize Docker Images for Production in 2026: Smaller Images, Fewer CVEs, Faster Deploys",
  slug: "how-to-optimize-docker-images-production-2025",
  excerpt: "Your production Docker image is probably carrying build tools, dev dependencies and caches it will never use. Here's how to strip it down \u2014 multi-stage builds, the right base image, BuildKit cache mounts, Next.js standalone output, non-root users and Trivy scanning \u2014 with before/after Dockerfiles you can copy.",
  content: `
# How to Optimize Docker Images for Production in 2026: Smaller Images, Fewer CVEs, Faster Deploys

> **TL;DR**
> - Most bloated production images are bloated for three boring reasons: build tools shipped to production, dev dependencies left in, and files copied in that were never needed. Fix those first — base-image choice is only step two.
> - Use a **multi-stage build** so compilers, package managers and source code stay in the build stage.
> - Pick the base image deliberately: **slim** for compatibility, **alpine** when your dependencies tolerate musl, **distroless** when you want no shell at all. Each has real trade-offs — there is no free lunch.
> - Order layers for cache, add a real **.dockerignore**, and use **BuildKit cache mounts** so CI stops re-downloading the internet on every build.
> - If you run Next.js, turn on **standalone output** and ship the traced server instead of your whole repository.
> - Run the image as a **non-root user**, scan it with **Trivy** in CI, and sign what you ship.
> - Measure before and after with \`docker history\` and \`dive\`. Do not trust anyone's percentage claims — including the ones in older versions of this very guide.

Most teams meet this problem the same way: a deploy that used to take seconds now takes minutes, a Kubernetes node takes forever to start a pod during a scale-up, or a vulnerability scan comes back with hundreds of findings in packages nobody on the team has ever heard of. The application code is rarely the problem. The image is — because a default Dockerfile quietly packages your entire development environment and ships it to production.

This guide walks through the techniques that actually move the needle, in the order I would apply them, with before/after Dockerfiles you can copy and adapt. The examples are Node.js-flavoured because that is what most readers of this site run, but every technique applies equally to Python, Go, or anything else you containerise.

The fattest images I have shipped were not exotic. They were my own projects, built the way almost everyone writes their first Dockerfile: one stage, copy everything, install everything, run it, move on. The first time I actually looked — \`docker history\`, layer by layer — the uncomfortable part was not that the image was big. It was what it was big *with*: the compiler, the test frameworks, the dev dependencies, the repository itself. My application was a guest in its own image; the workshop that built it had taken most of the room. Nobody sets out to ship a build environment to production. You ship it by never deciding not to — which is exactly what a single-stage Dockerfile decides for you. Everything in this guide is the set of decisions that replaces that default.

## Why image size (and scan surface) actually matters

"Smaller is better" gets repeated so often it has stopped meaning anything, so let's be specific about what a large image costs you:

1. **Slower deploys and rollbacks.** Every deploy, rollback, and node replacement starts with an image pull. A 1 GB+ image pulled onto a fresh node is dead time during exactly the moments you least want it — a scale-up during a traffic spike, or a rollback during an incident. This is the same reason image size shows up in deployment-strategy conversations: the strategies in my [Kubernetes deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) all assume pulls are cheap, and with a bloated image they are not.
2. **Registry and storage cost.** Registries charge for stored gigabytes and, on some platforms, egress. Keeping dozens of versions of a multi-gigabyte image adds up quietly.
3. **Cold starts.** Serverless container platforms and scale-to-zero setups pay the pull cost on the critical path. (If you are weighing that trade-off generally, see [Serverless vs Containers](https://www.devopsenginer.com/blog/serverless-vs-containers-2025).)
4. **Attack surface you have to patch.** Every extra package in the image is a package that can appear in a CVE report and demand a rebuild. A full Debian base with build tools gives your scanner — and an attacker who gets code execution — far more to work with than a runtime-only image. Image dieting is a security control, not just housekeeping; it belongs in the same conversation as the pipeline checks in my [DevSecOps checklist](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025).
5. **Signal-to-noise in vulnerability scans.** When a scan reports 300 findings, teams stop reading it. When it reports 12, they fix them. A small image is how you get to the second situation.

One honest caveat: the smallest possible image is not automatically the right goal — an image nobody can debug at 3 a.m. is its own kind of incident. Aim for an image that contains **your application, its runtime, and nothing else** — small because it is finished, not because it is fragile.

## Measure first: find out what is actually in the image

Optimising blind is how teams spend a week shaving 40 MB off a base image while a 600 MB \`node_modules\` folder sits untouched. Spend two minutes measuring first:

\`\`\`bash
# Total size of the image
docker images myapp

# Size of every layer, newest first — look for the layers that surprise you
docker history myapp:1.4.0

# Inspect a single layer's contents in detail (dive: https://github.com/wagoodman/dive)
dive myapp:1.4.0
\`\`\`

\`docker history\` tells you which instructions created the fat layers. \`dive\` goes further: it shows the file tree each layer added, and reports "wasted space" — bytes written in one layer and deleted or overwritten in a later one, which still count toward the image you ship. Files you *deleted* in a later \`RUN\` step are still in the image; deleting only helps if it happens **in the same layer that created the file**, or if it never reaches the final stage at all — which is what the first technique is for.

Write down the starting size. Judge every change below against it, on your image, with your dependencies.

## Technique 1: Multi-stage builds — keep the workshop out of the delivery van

This is the highest-impact change for most applications, and it is the one the original version of this guide was right to put near the top. A build needs compilers, headers, package managers, dev dependencies and source code. A production container needs the compiled output and the production dependencies. A single-stage Dockerfile ships both.

Here is the "before" — a pattern still found in a depressing number of repositories:

\`\`\`dockerfile
# BEFORE: single stage — everything used to build the app ships to production
FROM node:24
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
\`\`\`

Problems, in order: the full \`node:24\` base (over 1 GB), the entire repository copied in (including \`.git\`, tests, and whatever else is lying around — see the .dockerignore section), dev dependencies installed and kept, \`npm\` itself used as the production process manager, and the container running as root.

The "after" separates building from running:

\`\`\`dockerfile
# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
FROM node:24-bookworm-slim AS build
WORKDIR /app

# Copy dependency manifests first (see Technique 3 for why)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Strip dev dependencies back out of node_modules
RUN npm prune --omit=dev

# ---------- Stage 2: runtime ----------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# The official Node images ship a "node" user (UID 1000) — use it
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

What changed: the final stage starts again from a clean, slim base and receives only three things — the manifest, the pruned production \`node_modules\`, and the build output. The TypeScript compiler, test frameworks, linters and source files never leave stage 1. \`npm ci\` (not \`npm install\`) installs exactly what the lockfile says, which is the only defensible choice in CI. And the process that runs is Node directly, not npm — npm as PID 1 handles signals poorly, which shows up as pods that hang on termination.

The same shape works for other stacks: compile Go in a \`golang\` stage and copy the static binary out; build a Python virtualenv in one stage and copy the venv into a slim runtime. The stack changes; the principle doesn't: **the final image is assembled, not accumulated.**

## Technique 2: Choose the base image on purpose — slim, alpine, or distroless

Once build junk is out, the base image is the biggest remaining line item. The honest comparison for the Node.js ecosystem in 2026 looks like this (sizes are approximate and move with every release — measure your own):

| Base | Rough size | What you get | Watch out for |
| --- | --- | --- | --- |
| \`node:24\` (full Debian) | ~1.1 GB | Everything: build tools, full userland | Almost never justified in a runtime stage |
| \`node:24-bookworm-slim\` | ~200–250 MB | Debian glibc, minimal userland, no build tools by default | Still has a shell and package manager |
| \`node:24-alpine\` | ~130 MB | Alpine Linux, musl libc, very small | musl vs glibc issues with some native modules; different DNS/tooling behaviour |
| \`gcr.io/distroless/nodejs24-debian13\` | ~130–150 MB before your app | Just the Node runtime: no shell, no package manager | No shell means no shell debugging; healthchecks and probes must call the app directly |

A few honest trade-offs the original version of this guide glossed over:

**Alpine is not a free win.** Alpine uses musl libc instead of glibc. Pure-JavaScript dependencies don't care. Native modules compiled against glibc sometimes do — the classic failure is a prebuilt binary that silently doesn't exist for musl, so the build falls back to compiling from source (needing \`python3\`, \`make\`, \`g++\` — which then have to be installed, eating the savings) or fails outright. Sharp, bcrypt, and anything using prebuilds deserve a test build before you commit to Alpine. If it works, great. If your team burns a day on libc archaeology, \`bookworm-slim\` was the right answer all along.

**Debian slim is the sensible default.** It keeps glibc compatibility and familiar tooling, and with a multi-stage build it gets you most of the practical benefit. For most teams, most of the time, this is where the optimisation journey should end.

**Distroless is a security posture, not just a size.** Google's distroless images contain the runtime and essentially nothing else — no \`sh\`, no \`ls\`, no \`curl\`, no package manager. That removes entire categories of post-exploitation tooling and usually produces the cleanest scan results. The price is operational: you cannot \`kubectl exec\` in and poke around, because there is nothing to poke around with. Debugging shifts to logs, metrics, and ephemeral debug containers. For a finished, well-instrumented service that is a fair trade. For a service your team is still actively stabilising, it can hurt. Choose it deliberately, service by service — not as a blanket default because a blog post told you to. (This guide included.)

Two rules that apply to every row of the table: **pin your base image** (\`node:24-bookworm-slim\`, or a specific patch tag/digest — never \`latest\`), and **rebuild on a schedule**, because the base you pinned in January has known CVEs by March. Pinning controls surprise; scheduled rebuilds control staleness. You need both.

My own default is the boring one: \`bookworm-slim\` first. That is not a benchmark result — it is a maintenance decision. My projects are mine alone, which means that when something misbehaves there is no platform team to call; there is me, usually at an hour when I would rather be doing anything else. A glibc base with a familiar userland is the image I can still reason about in that moment. Alpine tempts me every time, and the megabytes it saves are real. But the classic Alpine story — a native module with no musl build, a fallback to compiling from source, build tools creeping back into the very image you were trying to shrink — costs a solo maintainer more than those megabytes pay. So my order is: slim by default, Alpine when a test build proves the dependency tree is happy, and distroless when a service has earned it by being boring for a while.

## Technique 3: Order your layers for the cache you actually have

Docker builds layer by layer, and a layer is only reused if it — and every layer before it — is unchanged. This is a build-*time* optimisation rather than a size one, but slow builds are why developers stop building images locally and start shipping untested ones, so it belongs here.

The rule is simple: **put the things that change least first, and the things that change most last.** In practice that means copying dependency manifests before you copy source code:

\`\`\`dockerfile
# Cache-friendly ordering: dependencies rebuild only when the lockfile changes
COPY package.json package-lock.json ./
RUN npm ci

# Source changes on almost every commit, so it goes last
COPY . .
RUN npm run build
\`\`\`

Get this backwards (\`COPY . .\` first) and every one-line source change invalidates the dependency layer, so CI re-installs every package on every build. Get it right and a typical application-code change reuses the cached \`npm ci\` layer entirely.

The same thinking applies inside \`RUN\` steps: combine operations that belong together into a single layer, and clean up **in the same instruction** that created the mess — remember from the measuring section that a delete in a later layer does not remove bytes from the image:

\`\`\`dockerfile
# One layer: update, install, and remove the package lists atomically
RUN apt-get update \\
 && apt-get install -y --no-install-recommends curl ca-certificates \\
 && rm -rf /var/lib/apt/lists/*
\`\`\`

Better still: ask whether that package belongs in the runtime image at all. \`curl\` in a production image is usually a debugging convenience that should live in your debug tooling, not in every shipped container.

For CI, local layer cache is not enough — each run starts cold. Export the cache somewhere shared. With Buildx, a registry-backed cache is the common pattern:

\`\`\`bash
docker buildx build \\
  --cache-from type=registry,ref=myregistry.example.com/myapp:buildcache \\
  --cache-to type=registry,ref=myregistry.example.com/myapp:buildcache,mode=max \\
  --tag myregistry.example.com/myapp:1.4.0 \\
  --push .
\`\`\`

\`mode=max\` exports intermediate-stage layers too, which is what makes multi-stage builds cache properly across CI runs. Hosted CI systems such as GitHub Actions wrap exactly this via \`docker/build-push-action\`.

## Technique 4: A .dockerignore that actually ignores things

Every \`COPY . .\` sends the entire build context to the daemon first. Without a \`.dockerignore\`, that context routinely includes \`.git\` (frequently the largest directory in the repo), local \`node_modules\`, build output, test coverage, log files — and, worst of all, \`.env\` files, which can end up baked into image layers and shipped to a registry. That last one is not a size problem; it is a secrets incident waiting for a date.

A production \`.dockerignore\` for a typical Node.js project:

\`\`\`dockerignore
.git
.github
node_modules
.next
dist
build
coverage
*.log
.env
.env.*
!.env.example
Dockerfile*
docker-compose*.yml
.dockerignore
.vscode
.idea
*.md
\`\`\`

Notes that matter: \`node_modules\` must be excluded because the image installs its own dependencies from the lockfile — copying your local ones defeats \`npm ci\` and can smuggle in binaries built for the wrong platform. \`.env\` and \`.env.*\` are excluded without exception; configuration belongs in the orchestrator's environment and secrets management, not in a layer. And \`.dockerignore\` is per-context — if you build from a monorepo root, check the file that actually applies, not the one in a subfolder nobody reads.

## Technique 5: BuildKit cache mounts — stop re-downloading dependencies

Layer caching has a blind spot: when the lockfile changes, the whole install layer re-runs from zero and re-downloads every package, even if only one dependency moved. BuildKit cache mounts fix this by giving a \`RUN\` step a persistent scratch directory that survives across builds but is **not** committed into any layer of the final image:

\`\`\`dockerfile
# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./

# npm's download cache persists between builds; the cache itself ships nowhere
RUN --mount=type=cache,target=/root/.npm \\
    npm ci

COPY . .
RUN npm run build
\`\`\`

The pattern generalises — pip uses \`--mount=type=cache,target=/root/.cache/pip\`, Go uses its module cache, and so on. Two caveats: the mount is build-time only, so it does not shrink the final image; and in CI the builder must preserve the cache between runs (Buildx registry cache from Technique 3, or a persistent builder), otherwise the mount starts empty every time anyway.

While we are on BuildKit mounts: secrets needed *during* a build (a private registry token, for instance) should use \`--mount=type=secret\` rather than build args or environment variables, which leak into image history. The full pattern is covered in the [DevSecOps checklist](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025); the short version is that anything passed as a plain build arg should be treated as published.

## Technique 6: Next.js standalone output — ship the traced server, not the repo

Framework-specific, but worth its own section because the win is so large and the setting is one line. Next.js can trace exactly which files the production server needs and emit them as a self-contained folder. Turn it on in your config:

\`\`\`js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;
\`\`\`

With that set, \`next build\` produces \`.next/standalone\` — a minimal server (\`server.js\`) plus only the \`node_modules\` files the tracer proved are used. The Dockerfile then ships that folder instead of your project. This example is adapted from the official Next.js Docker example, updated to the Node 24 LTS line; I am presenting it as the worked example because a Next.js frontend is exactly the shape of app many readers of this site (and this site itself) run:

\`\`\`dockerfile
# syntax=docker/dockerfile:1

FROM node:24-alpine AS base

# ---------- Stage 1: dependencies ----------
FROM base AS deps
# Needed by some native dependencies on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- Stage 2: build ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Stage 3: runtime ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \\
 && adduser --system --uid 1001 nextjs

# Static assets are NOT part of the standalone output — copy them explicitly
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

Three details people trip over: \`public/\` and \`.next/static/\` are **not** included in the standalone folder, so the explicit copies in the runtime stage are mandatory, not decoration; the server binds using the \`HOSTNAME\`/\`PORT\` environment variables, and \`0.0.0.0\` is what makes it reachable from outside the container; and the app runs as a dedicated non-root user that owns the files it needs. Compared with a single-stage \`node:24\` build of the same application, a standalone Alpine image typically lands somewhere around a fifth of the size — but treat that as a shape of outcome, not a promise, and measure your own build. Your mileage varies with your dependency tree, and heavy native modules may push you to the \`bookworm-slim\` base instead of Alpine. That is a legitimate outcome, not a failure of the technique.

## Technique 7: Run as non-root, and design for "no shell"

Two hardening steps cost almost nothing at Dockerfile time and are miserable to retrofit.

**Non-root.** If your process runs as root inside the container, a container escape or a misconfigured volume mount starts from root. Most official images already ship an unprivileged user — the Node images include \`node\` (UID 1000), and the Next.js example above creates a dedicated \`nextjs\` user. The pattern is:

\`\`\`dockerfile
# Files are copied as root by default; hand ownership to the runtime user,
# then switch to it for everything that follows.
COPY --chown=node:node --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
\`\`\`

Order matters: \`COPY\` and any permission fixes happen before the \`USER\` line; the runtime user needs read access to the app and write access to any scratch directories the app genuinely uses (prefer a mounted tmpfs or a dedicated directory over loosening permissions on the whole filesystem). Kubernetes can enforce this at the platform level with \`runAsNonRoot\` and \`allowPrivilegeEscalation: false\` in the security context — belt and braces is appropriate here, since the Dockerfile and the deployment manifest are edited by different people on different days.

**Healthchecks without curl.** The original version of this guide recommended a \`HEALTHCHECK\` built on \`curl\` — in the same guide that told you to remove \`curl\`. That contradiction is worth calling out because it appears in real Dockerfiles everywhere. If the runtime image has no HTTP client, write the check with what the runtime already has. For Node:

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
\`\`\`

And honestly: in Kubernetes, native liveness/readiness probes usually make the Dockerfile \`HEALTHCHECK\` redundant anyway. Pick one mechanism per platform and keep it consistent, rather than layering two that disagree.

## Technique 8: Scan every image with Trivy — and act on the result

A small image gives a scanner less to find, but "less" is not "nothing": the runtime itself and your production dependencies will have CVEs over time. Scanning needs to be a routine step of the pipeline, not an annual event. Trivy is the common open-source choice because it is a single binary, needs no daemon, and covers OS packages and language dependencies in one pass:

\`\`\`bash
# Report everything, for visibility
trivy image myapp:1.4.0

# In CI: fail the build on fixable CRITICAL findings, so the gate has teeth
# without blocking on vulnerabilities that have no fix yet
trivy image --severity CRITICAL --ignore-unfixed --exit-code 1 myapp:1.4.0
\`\`\`

Two judgement calls matter more than the tool choice. First, decide the gate in advance: failing on every HIGH finding regardless of fix availability produces a permanently red pipeline that everyone learns to ignore, while scanning with no gate at all produces a report nobody reads. \`--ignore-unfixed\` plus CRITICAL is a defensible starting point; tighten it as your base-image freshness improves. Second, scanning the image once at release is not enough — rescan the images you have *deployed*, on a schedule, because a CVE published next month applies to the image you shipped last month. Most registries and scanners support scheduled rescans; turn that on.

Scanning, for me, is the same habit as my AWS one. On my own cloud account I learned to read CloudTrail the way other people read a bank statement — what was created, when, and by which action — because the alternative was discovering my learning experiments from the bill. An image deserves the same suspicion: a tag tells you what you *meant* to build, not what is inside. So in my own projects the scan is part of the build, not an audit I get around to, and the gate is the one described above — fixable CRITICAL findings stop the line, and everything else goes on a list where I can watch it age. The point was never the clean report. It is that "what is actually in this thing?" is a question I answer with a tool, on the day I build it — not with a surprise, later, on someone else's schedule.

## Technique 9: Sign what you ship, and deploy by digest

Optimisation work is wasted if the deploy pipeline will happily run any image with the right tag — tags are mutable pointers, and "the right tag" is a weaker guarantee than most teams assume. Two habits close that gap:

- **Deploy by digest, not tag.** \`myapp@sha256:...\` names one exact image. Tags are for humans; digests are for machines. Most deployment tooling (including Argo CD with image automation, and plain Kubernetes manifests) can record the digest that was reviewed and promoted.
- **Sign images at build time.** With Sigstore's cosign, keyless signing ties an image signature to a CI identity via OIDC, so there are no long-lived signing keys to manage:

\`\`\`bash
# Sign the exact digest the pipeline just produced (keyless, via OIDC identity)
cosign sign myregistry.example.com/myapp@sha256:DIGEST

# Verify before admission/deploy
cosign verify myregistry.example.com/myapp@sha256:DIGEST
\`\`\`

Signing pairs naturally with the provenance and admission-control items in the [DevSecOps checklist](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025) — a signature nobody verifies is decoration, so wire verification into admission or the deploy step, not into a wiki page.

## A worked example — clearly labelled illustrative

Because readers always ask "yes, but how much does this actually save?", here is the shape of a typical journey for a small production Node.js service. **These figures are illustrative ranges drawn from the base-image sizes and patterns discussed above — they are not measurements from my own projects, and you should replace them with your own \`docker images\` output before quoting any of them.**

| Step | Change applied | Illustrative image size |
| --- | --- | --- |
| 0 | Single-stage \`node:24\`, \`COPY . .\`, all dependencies | ~1.0–1.2 GB |
| 1 | Slim base + multi-stage build + production deps only | ~220–280 MB |
| 2 | Alpine base instead of slim (deps permitting) | ~150–200 MB |
| 3 | Next.js standalone output (for a Next.js app, instead of step 1–2 shape) | ~150–210 MB |
| 4 | Distroless runtime for a plain Node service | ~120–180 MB |

Read the table the right way: step 1 — boring build hygiene — does most of the work; steps 2–4 trade compatibility and debuggability for progressively smaller gains. If you only do one thing after this guide, do step 1 and the .dockerignore.

## Common mistakes

1. **Optimising the base image while shipping the build stage.** Switching from \`node:24\` to \`node:24-alpine\` saves far less than simply not shipping the compiler, dev dependencies, and source. Multi-stage first, base second.
2. **Deleting files in a later layer and expecting the image to shrink.** It won't — the bytes live on in the earlier layer. Clean up in the same \`RUN\` that created the files, or keep them out of the final stage entirely. \`dive\`'s wasted-space view exists to catch exactly this.
3. **\`COPY . .\` with no (or a stale) .dockerignore.** At best you ship \`.git\` and local \`node_modules\`; at worst you bake \`.env\` secrets into a layer and push them to a registry.
4. **Choosing Alpine blindly, then installing build tools to fix musl issues.** If you end up adding \`python3 make g++\` to the runtime image, the Alpine experiment has failed — switch to slim and take the honest size.
5. **Running as root "temporarily".** Temporary root users are remarkably permanent. Set \`USER\` when you write the Dockerfile, and let Kubernetes enforce \`runAsNonRoot\` as backup.
6. **A healthcheck that depends on tools you removed.** \`curl\` in a distroless or slim image is the classic. Use the runtime's own facilities, or the orchestrator's probes.
7. **Pinning nothing, or pinning and never rebuilding.** \`latest\` gives you surprise changes; a fossilised pin gives you known CVEs. Pin versions/digests *and* rebuild on a schedule.
8. **Scanning once and framing the report.** A scan is a snapshot of a moving target. Rescan deployed images, and set a CI gate you have actually agreed to enforce.
9. **Treating tag == identity.** Deploying \`:latest\` or an overwritten tag means you cannot answer "what exactly is running?" Deploy by digest; sign the digest.

## FAQ

**What is a good size for a production Docker image?**
There is no universal number — a statically compiled Go service can legitimately be under 30 MB while a Node.js service with a heavy dependency tree may be doing well at 200 MB. The useful test is compositional, not numerical: does every megabyte correspond to your application, its runtime, or a production dependency? If a layer exists because of a build tool, a cache, or a file nobody can justify, the image is too big whatever the total says.

**Alpine or slim — which should I pick?**
Start with slim (glibc) if you have any native dependencies or any doubt; it is the compatibility-safe default and, after a multi-stage build, usually within ~50–80 MB of the Alpine result. Pick Alpine when you have verified — with an actual test build and a run of your test suite — that your dependency tree behaves under musl. Pick distroless when the service is stable, well-instrumented, and your team is comfortable debugging without a shell.

**Do multi-stage builds slow down CI?**
The build stage does the same work either way; the difference is what gets exported. In practice multi-stage builds pair with Buildx registry caching (\`mode=max\`), which caches intermediate stages across runs, so teams usually see similar or better build times — and dramatically faster pushes, pulls, and deploys, because the published image is a fraction of the size.

**Should I remove the shell from production images?**
If the service is mature and your debugging workflow runs on logs, metrics, traces and ephemeral debug containers, yes — distroless meaningfully reduces what an attacker (or a tired engineer) can do inside the container. If your team's incident process still starts with \`exec\` into the pod and looking around, removing the shell before changing that process trades a security improvement for slower incident response. Sequence it: observability first, shell removal second.

**How often should images be rebuilt if the code hasn't changed?**
On a schedule — weekly is a common cadence — because the base image and dependencies accumulate published CVEs independently of your releases. Rebuild, rescan, and let the digest-based deploy pipeline promote the refreshed image through the same path as a code change. An unchanging application is not an unchanging risk profile.

**Does a smaller image actually start faster in Kubernetes?**
On a node that already has the image cached, barely. On a fresh node — autoscaling event, node replacement — the pull is on the critical path and size is often the dominant term, which is precisely the situation where you can least afford the delay. (See the [Kubernetes deployment strategies guide](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide) for how this interacts with rollouts.)

## Conclusion

Production image optimisation is not a bag of fifteen tricks; it is a short sequence of decisions. Assemble the final image from parts instead of accumulating it (multi-stage builds). Choose a base image whose trade-offs you can defend (slim by default, Alpine when proven, distroless when ready). Keep junk out at the context boundary (.dockerignore), let BuildKit's cache work for you, and use framework features like Next.js standalone output when they exist. Then lock the result in: non-root user, a Trivy gate in CI, scheduled rebuilds and rescans, and signed images deployed by digest.

None of this needs new tooling budgets or a platform team — it is an afternoon of Dockerfile work and a pipeline change, paid back on every deploy, rollback, scale-up and scan from then on. Whether the image runs on Kubernetes or a serverless container runtime (compared in [Serverless vs Containers](https://www.devopsenginer.com/blog/serverless-vs-containers-2025)), "your application, its runtime, and nothing else" is the standard to hold it to.

**Related reading on this site:**
- [Kubernetes Deployment Strategies: Rolling, Blue-Green, Canary & More](https://www.devopsenginer.com/blog/kubernetes-deployment-strategies-2025-complete-guide)
- [DevSecOps Checklist: Securing the Pipeline End to End](https://www.devopsenginer.com/blog/devsecops-checklist-securing-pipeline-2025)
- [Serverless vs Containers: Which Should You Choose?](https://www.devopsenginer.com/blog/serverless-vs-containers-2025)
- [Kubernetes Security Basics in 2026](https://www.devopsenginer.com/blog/kubernetes-security-basics-guide-2026) — RBAC, network policies and pod security — the runtime half of the image hygiene above.
- [Kubernetes Cost Optimization 2026](https://www.devopsenginer.com/blog/kubernetes-cost-optimization-guide-2026) — smaller images are step one; right-sizing requests is where the real money is.
  `,
  featuredImage: "/images/blog/how-to-optimize-docker-images-production-2025/hero.jpg",
  category: "DevOps",
  tags: ["Docker", "Containers", "DevOps", "CI/CD", "Security", "Performance", "Optimization", "Kubernetes", "Alpine", "Multi-stage Build"],
  author: "DevOps Enginer",
  publishDate: "2025-01-20",
  lastModified: "2026-10-31",
  readTime: "27 min read",
  seo: {
    title: "How to Optimize Docker Images for Production in 2026: Smaller Images, Fewer CVEs, Faster Deploys",
    description: "Your production Docker image is probably carrying build tools, dev dependencies and caches it will never use. Here's how to strip it down \u2014 multi-stage builds, the right base image, BuildKit cache mounts, Next.js standalone output, non-root users and Trivy scanning \u2014 with before/after Dockerfiles you can copy.",
    keywords: "Docker optimization 2026, reduce Docker image size, Docker multi-stage builds, Alpine Docker images, distroless containers, Docker security, container optimization, CI/CD Docker, Docker best practices, Kubernetes containers, Docker performance"
  }
};
