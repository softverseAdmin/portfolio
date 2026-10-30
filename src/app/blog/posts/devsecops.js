// DevSecOps Checklist 2026: Secure Your CI/CD Pipeline Without Slowing Delivery
export const devsecOpsBlog = {
  id: 4,
  title: "DevSecOps Checklist 2026: Secure Your CI/CD Pipeline Without Slowing Delivery",
  slug: "devsecops-checklist-securing-pipeline-2025",
  excerpt: "A practical DevSecOps checklist for securing source code, secrets, builds, containers, approvals, and production evidence\u2014especially in regulated, data-sensitive environments.",
  content: `
# DevSecOps Checklist 2026: Secure Your CI/CD Pipeline Without Slowing Delivery

> ## TL;DR
> >
> A secure pipeline does more than run a vulnerability scanner. Protect the repository and identities first; keep secrets out of code and give workloads short-lived credentials; scan code, dependencies, infrastructure definitions, and container images; pin and verify what you build; require risk-based gates and accountable approvals for production; and preserve evidence that shows who changed what, which checks ran, what was deployed, and how exceptions were handled.
> >
> Start with the controls that prevent the most common failures: multifactor authentication, branch protection, secret scanning, least-privilege CI credentials, dependency and image scanning, protected production environments, tested backups, and centralized logs. Then add signing, software bills of materials, policy as code, and runtime detection as your delivery process matures.
> >
> **Important:** A checklist can support a compliance programme, but completing it does not by itself make a system compliant with HIPAA, GDPR, Japan's Act on the Protection of Personal Information (APPI), ISO 27001, SOC 2, or any other framework. Applicability and sufficiency depend on the organisation, the data, the system boundary, and the organisation's legal and audit obligations.

## Why pipeline security needs a regulated-systems lens

A CI/CD pipeline is not just developer tooling. It can read source code, pull dependencies, access cloud credentials, build production artifacts, change infrastructure, and deploy to environments that process sensitive information. If an attacker—or a well-meaning engineer using an unsafe shortcut—controls the pipeline, application-level controls may not matter.

1. **Was the change reasonably protected against foreseeable threats?**
2. **Can the team reconstruct and evidence what happened later?**

The second question is where many DevSecOps programmes are weak. They install scanners but cannot show which artifact reached production, who approved an exception, whether a critical finding was accepted, or which credentials a failed job used. A mature pipeline therefore combines prevention, detection, and traceability.

This guide updates the original DevSecOps checklist for 2026. It keeps the practical checklist format, but organises controls by delivery stage and adds a short verification note to each group. It is written for small and mid-sized engineering teams as well as larger organisations. You do not need to implement everything in one month. Use the priority labels:

- **Must:** basic controls that should be in place before a pipeline handles production or sensitive data.
- **Should:** controls that materially reduce risk and are realistic for most teams.

I learned the value of an audit trail on my own website: when a fix and a release raced each other, it was the commit history that told me exactly which version was live and what had changed. No detective work, no guessing — the record was the answer.

## Before the checklist: define the pipeline's trust boundaries

Do not start by buying tools. First draw the delivery path, even on one page:

**Developer identity → source repository → pull request and review → CI runner → dependency and artifact sources → build artifact → registry → deployment mechanism → cloud/Kubernetes environment → logs and monitoring.**

For each arrow, ask:

- Which human or workload identity is acting?
- What can that identity read, change, or deploy?
- Is the credential long-lived, shared, or scoped to one job?
- What happens if this step is compromised?

---

## 1. Protect identities, repositories, and source code

### Must

- [x] Require phishing-resistant multifactor authentication where the platform and organisation support it, and require MFA at minimum for administrators, maintainers, and anyone who can approve or deploy to production.
- [x] Disable shared accounts for source control, CI, registries, and cloud access. Use named human identities and separate workload identities.
- [x] Apply least privilege in the repository. Limit who can administer settings, dismiss reviews, manage webhooks, alter Actions secrets, or change protected branches.
- [x] Protect the default and release branches. Require pull requests, passing status checks, and review before merging.
- [x] Use CODEOWNERS or an equivalent mechanism for sensitive paths such as deployment workflows, infrastructure code, authentication code, migrations, and policy files.
- [x] Prevent force pushes and branch deletion on protected branches, except through a documented break-glass process.
- [x] Turn on secret scanning and push protection where available, and treat alerts as incidents until triaged.

### Should

**How to verify:** Pick a recent production change and trace it from issue or ticket to commit, reviewer, status checks, build, and deployment. Then attempt—in a test repository or with an authorised test account—to merge without review and to alter a protected workflow file without the required owner. Both attempts should fail, and the audit log should show who attempted them.

---

## 2. Keep secrets out of code and make credentials short-lived

### Must

- [x] Never commit passwords, API keys, private keys, session tokens, connection strings, or production \`.env\` files.
- [x] Add local and CI secret scanning. Local hooks can catch mistakes early; server-side or CI scanning is still needed because local hooks can be skipped.
- [x] Store runtime and deployment secrets in a managed service appropriate to your platform, such as a cloud secrets manager, Kubernetes external-secrets integration, or a dedicated vault. Do not treat CI variables alone as a complete secrets architecture.
- [x] Give each environment and workload its own secret. Development credentials must not unlock staging or production.
- [x] Mask secrets in logs and fail a job if a known secret pattern appears in build output or artifacts.
- [x] Rotate a secret immediately when exposure is suspected. Deleting the commit is not rotation; the value must be considered compromised.

### Should

- [x] Prefer OpenID Connect (OIDC) federation or an equivalent mechanism so CI can obtain short-lived cloud credentials instead of storing a permanent access key.
- [x] Scope each CI identity to the resources and actions required by that job. A unit-test job should not be able to deploy; a build job should not automatically receive production database credentials.
- [x] Encrypt secrets in transit and at rest through the platform's supported mechanisms, restrict decryption permissions, and log secret access.

**How to verify:** Search the repository, generated artifacts, and recent CI logs for test patterns and known internal prefixes. Review one CI job's effective cloud permissions and confirm it cannot perform an unrelated high-risk action. Finally, run a tabletop exercise: if this token appeared in a public paste site tonight, who revokes it, what breaks, and how would you know where it was used?

---

## 3. Scan code, dependencies, and licences before build

No single scanner sees the whole application. Static application security testing (SAST) examines your code; software composition analysis (SCA) examines libraries and transitive dependencies; licence scanning identifies licence obligations and policy conflicts. Each produces false positives and false negatives, so the goal is a managed process—not a dashboard full of ignored red warnings.

### Must

- [ ] Run SAST on pull requests for languages and frameworks the selected tool actually supports.
- [ ] Generate or maintain dependency lockfiles and scan the resolved dependency graph, not only the top-level packages typed into a manifest.
- [ ] Turn on dependency alerts and controlled update pull requests through your platform or a tool such as Dependabot or Renovate, according to your organisation's preferences.
- [ ] Define severity and exploitability triage rules. For example, a reachable critical vulnerability in an internet-facing component should not follow the same timeline as an unused development-only dependency.
- [ ] Record accepted risks with an owner, reason, compensating control, and expiry date. Do not let "won't fix" become permanent by default.

### Should

**How to verify:** Introduce a harmless test finding in a branch—such as a deliberately outdated test dependency in a disposable project—and confirm that the scan runs, the result is understandable, the correct team is notified, and the merge policy matches your documented severity rules. Then open the SBOM or dependency graph for a release and identify the version and source of a transitive dependency without asking the developer who wrote the code.

---

## 4. Secure the build itself

### Must

- [ ] Set workflow permissions to read-only by default and grant write permissions only to the jobs that need them.
- [ ] Pin third-party Actions and reusable workflows. A full commit SHA offers the strongest immutability; if you use version tags, monitor and update them deliberately. Avoid \`@master\` or \`@main\` for security-sensitive actions.
- [ ] Isolate builds for untrusted pull requests. Do not expose production secrets, signing keys, or deployment credentials to code from forks.
- [ ] Use hosted or ephemeral runners where practical, or harden and regularly rebuild self-hosted runners. Treat a persistent self-hosted runner as production infrastructure.
- [ ] Build once and promote the same artifact through environments. Rebuilding separately for staging and production makes it harder to prove what was tested.

### Should

- [ ] Generate build provenance or attestations where your platform supports them, and verify provenance before deployment.
- [ ] Sign container images and other release artifacts, then enforce signature verification at admission or deployment time.

**How to verify:** Select the artifact currently in production and retrieve its immutable digest. Trace that digest to one build run, one commit, its checks, its SBOM or provenance if available, and the deployment record. If the trail depends on a mutable tag such as \`latest\`, the verification is incomplete.

For teams using GitOps, this trace becomes easier when the desired state and image digest are recorded in Git and reconciled by a controller. The comparison in [GitOps vs Traditional CI/CD](https://www.devopsenginer.com/blog/gitops-vs-traditional-cicd-2025-comparison) explains why that model can improve visibility and rollback discipline.

---

## 5. Scan containers, Kubernetes manifests, and infrastructure as code

Infrastructure code is production code. A public storage bucket, an overly broad IAM policy, a privileged container, or a Kubernetes service account with cluster-wide rights can create more risk than a medium-severity application bug.

### Must

- [ ] Scan container images for operating-system and application vulnerabilities before they are pushed or deployed.
- [ ] Use maintained base images, remove unnecessary packages and shells where practical, and rebuild images so base-image fixes actually reach production.
- [ ] Run containers as a non-root user where the application supports it; avoid privileged mode, host networking, host PID/IPC namespaces, and writable root filesystems unless there is a documented need.
- [ ] Scan Dockerfiles, Kubernetes manifests, Helm charts, and Terraform or other IaC for misconfigurations and policy violations.
- [ ] Review cloud identity changes as security changes. New roles, wildcard permissions, public endpoints, cross-account access, and disabled logging deserve explicit scrutiny.
- [ ] Keep Terraform state protected, encrypted according to your platform design, access-controlled, and backed up. State can contain sensitive values and a map of your environment.

### Should

- [ ] Apply Kubernetes Pod Security Standards or equivalent admission controls at an appropriate level for each namespace.
- [ ] Use network policies to restrict pod-to-pod and egress traffic for workloads that do not need broad network access.
- [ ] For serverless workloads, apply the same discipline to function permissions, dependency layers, environment variables, event sources, and deployment artifacts. The decision guide [Serverless vs Containers](https://www.devopsenginer.com/blog/serverless-vs-containers-2025) is useful background when deciding where a workload belongs; the security boundary changes with the platform.

**How to verify:** Deploy a deliberately misconfigured test workload in a non-production namespace—for example, a container requesting privileged mode—and confirm that admission control or the pipeline blocks or reports it according to policy. Also compare one production resource with its IaC definition and investigate any unexplained drift.

---

## 6. Test the running application and its interfaces

Static checks cannot prove that the deployed application behaves securely. Dynamic application security testing (DAST), API testing, dependency checks at runtime, and focused manual testing all have a place, particularly after authentication, authorisation, payment, file handling, or data-export changes.

### Must

- [ ] Run automated web and API security checks against an authorised staging or test environment that resembles production in relevant controls.
- [ ] Test authentication and authorisation explicitly, including horizontal access between users and vertical access to administrative functions.
- [ ] Protect test data. Use synthetic or properly anonymised data whenever possible; do not copy production personal data into a lower environment merely for convenience.
- [ ] Give the test environment its own credentials and secrets, with no route to production data unless formally approved and controlled.

### Should

- [ ] Schedule deeper scans outside the pull-request path when a full scan would be too slow for developer feedback.

**How to verify:** Choose a fixed authorisation bug and confirm that an automated or scripted regression test fails if the vulnerable behaviour is reintroduced. Review the DAST target configuration and confirm the scanner is authenticated where needed; an unauthenticated scan of a login page provides limited assurance.

---

## A small worked example: a safer GitHub Actions pipeline

The workflow below is a teaching example, not a drop-in production pipeline. It separates secret scanning, code and dependency analysis, and image scanning; grants narrow permissions; and places deployment behind a GitHub \`production\` environment. Replace the deployment placeholder with your organisation's approved deployment method, and test the workflow in a non-production repository first.

\`\`\`yaml
name: Secure pipeline

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: secure-pipeline-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  secrets:
    name: Secret scan
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@v3
        with:
          path: ./
          base: \${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --only-verified

  code-and-dependencies:
    name: Code and dependency checks
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Python for Semgrep
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Semgrep
        run: python -m pip install --upgrade semgrep

      - name: Run Semgrep
        run: semgrep scan --config p/ci --error

      - name: Scan files and dependencies with Trivy
        uses: aquasecurity/trivy-action@0.24.0
        with:
          scan-type: fs
          scan-ref: .
          format: sarif
          output: trivy-results.sarif
          severity: HIGH,CRITICAL
          exit-code: "1"

      - name: Upload Trivy results to code scanning
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif

  container:
    name: Build and scan container image
    if: github.event_name == 'push'
    needs: [secrets, code-and-dependencies]
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Build image
        run: docker build --tag myapp:\${{ github.sha }} .

      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@0.24.0
        with:
          scan-type: image
          image-ref: myapp:\${{ github.sha }}
          severity: HIGH,CRITICAL
          exit-code: "1"

  deploy:
    name: Deploy to production
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [secrets, code-and-dependencies, container]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Deployment placeholder
        run: echo "Use the approved deployment process here"
\`\`\`

Notice what the example deliberately does **not** do:

- It does not give every job \`contents: write\` or \`security-events: write\`.
- It does not deploy a mutable \`latest\` image. The image is tagged with the commit SHA in the example; a production process should also record and promote the immutable digest.
- It does not treat a scanner's default severity setting as a universal policy. Your organisation must decide which findings block a merge or release.

**How to verify the example:** Run it first in a test repository. Confirm that a pull request runs the secret and code checks, that a test high-severity finding fails the correct job, that SARIF results appear where your team expects them, that the production environment requests the intended reviewer, and that no deployment credential is available to pull-request jobs.

---

## 7. Use gates and approvals that match risk—not theatre

### Must

- [ ] Define which checks are required before merge and which are required before production deployment. Keep the list visible in the repository or delivery standard.
- [ ] Protect production with an environment or release approval mechanism where the platform supports it.
- [ ] Prevent the deployment job from running when required security checks fail, except through a documented exception process.
- [ ] Give exceptions a named business or technical reason, risk owner, approver, mitigation, ticket link, and expiry date.

### Should

- [ ] Automate evidence collection at the gate: commit, pull request, reviewers, test results, scan summaries, artifact digest, environment, approver, timestamp, and deployment outcome.
- [ ] Periodically sample completed releases and reconstruct their evidence without asking the release engineer for screenshots.
- [ ] Measure gate pain: false-positive rate, queue time, override count, and escaped defects. A control that is routinely overridden is not functioning as designed.

**How to verify:** Select three recent releases—one routine, one exception, and one emergency if available. For each, answer who proposed it, who reviewed it, which checks passed or were waived, who accepted residual risk, what artifact was deployed, and how rollback was performed. Any answer that exists only in a chat message should be copied into the durable release or incident record.

The habit I keep on my own projects is simple: every change lands as a small commit with a message that says what and why, and I verify the live result after each push. If I cannot reconstruct what shipped, the release is not finished.

---

## 8. Protect deployment, runtime, and recovery

Pipeline security does not end when CI turns green. Deployment credentials, drift, runtime behaviour, logging, backups, and incident response determine whether a secure build remains secure in operation.

### Must

- [ ] Restrict who and what can deploy to production. Deployment identities should be separate from ordinary developer and CI test identities.
- [ ] Verify the artifact identity at deployment—preferably by digest and signature where supported—rather than trusting a mutable name alone.
- [ ] Send application, infrastructure, CI/CD, identity, and cloud audit logs to a central location with controlled retention and restricted modification rights.
- [ ] Alert on high-value events: privileged role assumption, policy changes, disabled logging, unusual secret access, repeated authentication failures, unexpected egress, and deployment outside the normal path.
- [ ] Back up critical data and configuration, protect backups from ordinary production credentials, and test restoration. A backup that has never been restored is an assumption, not a recovery plan.
- [ ] Maintain an incident process that covers credential revocation, artifact rollback, key rotation, evidence preservation, customer or regulator notification assessment, and post-incident review.

### Should

- [ ] Detect and reconcile drift between deployed resources and the approved source. GitOps reconciliation can reduce manual drift, but the controller itself needs least-privilege permissions and monitoring.
- [ ] Connect deployment events to health and recovery controls. A release process that can detect a bad version and restore the previous known-good artifact is part of security as well as reliability. The patterns in [Self-Healing Infrastructure](https://www.devopsenginer.com/blog/self-healing-infrastructure-2025) complement this checklist when a deployment or workload fails.
- [ ] Run incident and recovery exercises that include a compromised CI credential, not only an application outage.

**How to verify:** During a game day or tabletop exercise, choose the scenario "a CI token was leaked." The team should be able to identify where the token was used, revoke it, rotate dependent secrets, determine which artifacts were built during the exposure window, roll back or redeploy from a trusted source, and preserve evidence. Time the exercise and record gaps as actions with owners.

---

## 9. Treat data protection and compliance evidence as design inputs

### Must

- [ ] Classify the data processed by the application and by the pipeline itself. Remember that logs, crash reports, support exports, analytics, backups, and test fixtures can contain sensitive data even when the main database is well controlled.
- [ ] Limit production data access to authorised people and workloads with a business need. Log and review privileged access.
- [ ] Avoid production personal data in development, CI, screenshots, tickets, and AI tools unless there is a specific lawful, approved, and controlled reason.
- [ ] Ensure contracts and data-handling rules for SaaS CI, scanners, artifact registries, monitoring, and AI services match the sensitivity of the code and data they may receive.
- [ ] Protect backups and exports with encryption, access control, integrity checks, and tested restoration.

### Should

- [ ] Review privileged access, dormant accounts, third-party integrations, and exception records on a defined schedule.

Regulations and frameworks differ. HIPAA, where it applies, concerns specified health information and covered entities or business associates in the United States. GDPR concerns personal data within its territorial and material scope. Japan's APPI concerns personal information handled under Japanese law. ISO 27001 and SOC 2 are not interchangeable with those laws. This article uses them only as context for why traceability, access control, retention, and evidence may matter. Your organisation must confirm its own obligations with qualified specialists.

**How to verify:** Ask for a data-flow diagram and choose one category of sensitive log or export. Trace where it is created, who can access it, how long it is retained, how it is deleted, and which vendor processes it. If the answer is unknown, the control objective is not yet met.

---

## Common DevSecOps mistakes

### 1. Installing scanners but assigning no owner

A scan result without a triage owner, service-level expectation, and exception process becomes background noise. Assign findings to the team that can change the code or infrastructure.

### 2. Failing every build on every finding

Scanner severities are inputs, not universal truth. Blocking all releases for low-risk or unreachable issues trains teams to bypass the gate. Start with a small set of high-confidence, high-impact blocking rules and expand after tuning.

### 3. Giving CI a permanent cloud administrator key

This is one of the fastest ways to turn a repository compromise into a cloud compromise. Use short-lived, job-scoped credentials and separate deployment identities.

### 4. Pinning nothing

Using \`@latest\`, \`@main\`, or \`@master\` for actions, images, and tools means your build inputs can change without a pull request. Pin versions, review updates, and test changes.

### 5. Scanning source but promoting a different artifact

If staging receives one build and production receives a rebuild, your test evidence may not describe the production artifact. Build once, identify by digest, and promote the same artifact.

### 6. Treating compliance as a reporting layer

Dashboards do not compensate for excessive privileges, missing reviews, or untested backups. Evidence should be a by-product of controls that actually operate.

### 7. Putting production data into every tool

Source code, logs, tickets, analytics, and AI assistants can all leak information. Minimise what each tool receives and review vendor settings before enabling a convenient integration.

---

## A sensible implementation order

**First 30 days**

1. Inventory repositories, pipelines, runners, registries, deployment identities, and production approvers.
2. Enforce MFA, branch protection, code-owner review for sensitive paths, and secret scanning.

**Days 31–60**

1. Tune blocking rules for high-confidence critical and high-severity findings.
2. Pin third-party actions and base images; establish update ownership.

**Days 61–90**

1. Add image signing and verification or build provenance where the platform supports it.
2. Introduce policy as code for repeated Kubernetes, cloud, and IaC violations.

---

## FAQ

### What is the difference between DevOps and DevSecOps?

DevSecOps means security responsibilities and controls are integrated into planning, coding, review, build, deployment, and operations rather than handled only by a separate team at the end. It does not mean every developer becomes a security specialist; it means routine security checks and decisions happen inside the delivery process, with specialists supporting higher-risk work.

### Which DevSecOps controls should a small team implement first?

Start with MFA, protected branches and reviews, secret scanning, least-privilege and short-lived CI credentials, dependency and container scanning, a protected production environment, central logs, and tested backups. These controls address common compromise paths and are usually more valuable than buying a large platform before the basics are reliable.

### Should every vulnerability block deployment?

No. Blocking policy should consider severity, exploitability, reachability, exposure, asset sensitivity, compensating controls, and the reliability of the finding. Critical, reachable issues in sensitive or internet-facing systems may justify a hard gate. Lower-risk findings can follow a tracked remediation timeline. The decision and any exception should be recorded.

### Does using this checklist make a system HIPAA, GDPR, or APPI compliant?

No. A checklist can support parts of a security and evidence programme, but compliance depends on the organisation's actual obligations, scope, data, contracts, processes, and implementation. Qualified legal, privacy, security, and audit specialists must assess the specific system.

### What is the benefit of signing artifacts or generating an SBOM?

An SBOM identifies components in a release so the team can respond when a new vulnerability is disclosed. Signing and provenance help a deployment system verify that an artifact came from an authorised build and was not replaced afterward. They improve traceability and response; they do not prove the software has no vulnerabilities.

---

## Conclusion: make the secure path repeatable—and provable

A strong DevSecOps programme is not the longest scanner list. It is a delivery system in which identities are accountable, secrets are hard to leak and easy to revoke, build inputs are controlled, artifacts can be traced, risky changes receive proportionate review, and evidence is created while the work happens.

For regulated and data-sensitive work, that last point matters as much as prevention. You should be able to explain not only "we ran the scans," but also "this reviewed commit produced this artifact, these checks ran, this person or process approved the release, this exception expired, and this is how we would recover if the credential or artifact were compromised."

Start with the basics, make them reliable, and then mature the controls that match your risks. Security that helps a team ship safely—and can prove it afterward—is security that will survive contact with real delivery pressure.

One habit I am still improving in my own projects: my pipelines still lean on my manual review more than on automated gates. Adding scanning steps — the ones in this checklist — to my own repositories is the next step I am taking.

**Rabin Adhikari** is a software and DevOps engineer in Japan and a Project Manager working in medical systems. He writes practical guides on automation, cloud, security, and reliable delivery at DevOps Enginer.
  `,
  featuredImage: "/images/blog/devsecops-checklist-securing-pipeline-2025/devsecops-hero.jpg",
  category: "Security",
  tags: ["DevSecOps", "Security", "CI/CD", "SAST", "DAST", "Trivy", "GitHub Actions", "Container Security", "Compliance", "2026"],
  author: "DevOps Enginer",
  publishDate: "2025-10-20",
  lastModified: "2026-10-30",
  readTime: "22 min read",
  seo: {
    title: "DevSecOps Checklist 2026: Secure Your CI/CD Pipeline Without Slowing Delivery",
    description: "A practical DevSecOps checklist for securing source code, secrets, builds, containers, approvals, and production evidence\u2014especially in regulated, data-sensitive environments.",
    keywords: "DevSecOps checklist, CI/CD security, SAST, DAST, Trivy, GitHub Actions security, container scanning, secrets management, compliance automation, vulnerability testing, 2026"
  }
};
