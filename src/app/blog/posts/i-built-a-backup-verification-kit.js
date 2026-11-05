// The Backup Verification Kit Is Live: Three Posts, a Public Argument and 21 Tests Later
export const iBuiltABackupVerificationKitBlog = {
  id: 52,
  title: "The Backup Verification Kit Is Live: Three Posts, a Public Argument and 21 Tests Later",
  slug: "i-built-a-backup-verification-kit",
  excerpt: "It started with a reader's backup exiting 0 for three weeks while restoring nothing. It ended as a rig-tested toolkit: five declared-not-derived checks, a 21/21 release test suite, a restore-drill runbook and a Mac app - now live on Gumroad. The story, the test evidence, and the honest limits.",
  content: `
# The Backup Verification Kit Is Live: Three Posts, a Public Argument and 21 Tests Later

This site's backup series did not start as a product. It started with somebody else's bad month. On dev.to, Renhua Wei — who writes as dafili — published what remains the most honest backup post I have read this year: ["My Backup Exited 0 for Three Weeks and Nothing Paged Me"](https://dev.to/dafili/my-backup-exited-0-for-three-weeks-and-nothing-paged-me-5ce6). His backup job reported success, night after night, while producing output he could not have restored from. Nothing alerted, because every check he had was asking the backup whether the backup was fine — and the backup, broken in a way that still exited 0, kept saying yes.

I wrote [the first response on this site](https://www.devopsenginer.com/blog/backup-verification-in-2026-exit-code-0-is-not-a-backup) — the four levels of backup confidence, and why "the job succeeded" is not one of them. Then dafili did the thing that makes public writing worth doing: he corrected me, in public, where I was wrong. My restic guidance had recommended a \`--read-data-subset=5%\` sample; he pointed out that the subset is chosen *randomly* each run, so some packs might never be read at all — the deterministic form is the \`n/t\` rotation. He was right: I verified it against the restic man page, fixed the post the same day on every copy, and credited him.

That exchange became two more posts. In [Restore Drills](https://www.devopsenginer.com/blog/restore-drills-in-2026-you-cant-automate-the-declaration), his doctrine got its name: **you cannot automate the declaration, only the comparison** — a human writes down, by hand, what a correct restore must contain; automation compares against it nightly. In [Declared, Not Derived](https://www.devopsenginer.com/blog/declared-not-derived-backup-checks), the full placement was rig-tested before publication: a declared floor inside the backup run, a rolling median in monitoring, the fingerprint outside the backup tree, a restore-recency gauge. And the thread kept going after the posts shipped — his corrections shaped the design three times: the restic \`n/t\` rotation, a checksum-recursion flaw, and the bootstrap rule that an undeclared state must SKIP instead of crashing or, worse, passing.

A doctrine that survives an argument like that deserves to be more than three posts a reader has to reassemble by hand. So I packaged it. **The Backup Verification Kit is live on Gumroad today** — the checks from the series as a dependency-free toolkit, plus a restore-drill runbook, plus a Mac app that shows the same checks as a dashboard.

> **TL;DR:** The Backup Verification Kit — built from this site's backup series (#47–#49) and dafili's declared-not-derived doctrine — is live on Gumroad: five nightly checks (declared size floor, rolling-median drift, heartbeat freshness, hand-written fingerprint comparison, restore-drill gauge) in bash + Python 3, no agents, no SaaS. The release-gate suite passes 21/21, including an empty-state phase and five failure modes; it caught one real defect before shipping, since fixed and re-verified. Complete adds the restore-drill runbook and a Mac app (14/14 checks on our test Mac). Scripts $39, Complete $79, 30-day refund.

## What the kit does, one night at a time

The kit installs beside the backups you already make. It creates nothing and restores nothing — it verifies, in exit codes your existing monitoring already understands.

1. **Declared size floor** (\`floor_check.sh\`). You declare, by hand, the size below which a dump is not the dump — "catastrophically wrong", not "a bit small". It runs inside the backup run and fails it on the spot. Five bad nights cannot move it: it is not computed from your backups; you wrote it down.
2. **Rolling-median drift** (\`median_check.py\`). Tonight's size against the median of the last 30 nights. Slow shrinkage — the partition that quietly stops being included — alerts as DRIFT below 80% of the median.
3. **Heartbeat freshness** (\`check_monitor_freshness.sh\`). The median check leaves a heartbeat, and the heartbeat itself is watched: a dead checker must never look like a healthy backup, so a stale or missing heartbeat alerts too.
4. **Fingerprint comparison** (\`fingerprint_compare.py\` + \`declare_fingerprint.sh\`). The core of the doctrine. Your restore-to-scratch is compared against a fingerprint a human wrote by hand — expected files, one sha256, a row count, a config value, one assertion from the live system — stored outside the backup tree, protected by a checksum and an append-only declaration history. No fingerprint yet? The comparison prints **SKIP and exits 3**. Day one does not get to be green for a reason unrelated to your data being intact.
5. **Restore-drill gauge** (\`restore_gauge.sh\`). A daily count of days since the last *successful manual* restore drill. Past roughly 120 days without a human proving a restore, it pages: backup systems rarely die loudly, but restore *practices* die quietly.

A worked night, from the test rig: a dump came out at 118,500 bytes against a 150,000-byte rolling median — 79.0% — because a partition had stopped being included. The median check called DRIFT and exited 1 that night. The declared floor (60,000 bytes in that setup) passed the same dump, *by design*: the floor is the catastrophe line, the median is the shrink detector, and neither grades its own homework. A restic helper (\`restic_rotation.sh\`) implements dafili's \`n/t\` correction: a deterministic \`--read-data-subset=n/7\` weekday rotation, so every pack is read within a week.

## What was tested — and what the testing caught

This site's rule is test-first: nothing untested gets published as fact, and a product gets a harder gate than a post. Before listing, the kit went through a senior review (every script read line by line, the shipped zip extracted fresh, the README quickstart followed literally), then an evidence-grade release suite: 21 cases, fabricated sample data only, each asserting the documented behaviour — output wording *and* exit code.

**The suite passes 21/21.** The shape of it matters more than the number:

- **Phase 0 — the empty state (5 cases).** Point every check at a folder containing *nothing*: no backup file, no history, no heartbeat, no fingerprint, no drill record. Absence must be reported honestly, in words — \`FLOOR ERROR\`, \`MEDIAN CHECK ERROR\`, \`SKIP\` (exit 3), \`MISSING METRIC\`, \`GAUGE ALERT\` — never as a pass, never as a traceback. It guards the bootstrap rule dafili's comment produced: an undeclared state SKIPs — it never crashes, never passes.
- **Phase 1 — healthy data (6 cases).** A 150,300-byte sample dump against a 60,000-byte floor and a 150,000-byte median (100.2% — ok), heartbeat fresh, fingerprint declared and matched entry by entry, drill gauge at 41 days against the 120-day threshold. All exit 0.
- **Phase 2 — failure modes (5 cases, all caught).** A 0-byte dump: \`FLOOR FAIL\`, exit 1. The 79.0% shrink: DRIFT, exit 1. A restore whose row count was cut from 412,308 to 350,000 after declaration: fingerprint \`ALERT\`, exit 1. A heartbeat 259,200 seconds old against an 86,400 limit: \`MISSING METRIC — the checker itself is down\`. A last drill 200 days ago: \`GAUGE PAGE\`, exit 1.
- **Phase 3 — the demo regression (5 cases).** The bundled demo reproduces its documented numbers exactly: the declaration checksum \`228fd3b095f2234bfb2679c1582bf2196faf51f8e822f277ddd44f461cc92cfb\` — content-fixed, so your machine prints the same one, which is how you check that what you downloaded is what we tested — and the median-poisoning demonstration, where five truncated nights collapse the last-5 median to 80,905 bytes, a healthy backup then alarms at **3,403.4%** of the median, and a truncated backup *passes* a fully poisoned 30-night median at **99.1%** — while the declared floor's verdict never moves. That demo is the doctrine in one screen: derived checks poison; declared ones don't.

And the suite earned its keep: **it caught a defect the review had missed.** Fed an empty size argument — exactly what happens when the backup file is missing and \`stat\` returns nothing — \`floor_check.sh\` died on bash's raw \`\${2:?}\` usage error with exit 1, making its own documented branch (\`FLOOR ERROR … the size pipeline is broken\`, exit 2) unreachable. Still fail-closed, but the wrong error class and words for the 3 a.m. reader. The fix was small (an explicit argument guard), changed nothing else, and the suite was re-run from scratch: 21/21, the fixed script verified byte-identical inside the rebuilt buyer zip. The earlier review had already found and fixed eight major defects of the same family — fail-open edges in a product whose reason to exist is failing loud, like a non-numeric dump size falling through to "floor ok", and a typo'd fingerprint entry kind silently ignored while the kit reported PASS. Both are ALERTs now. Two honesty footnotes: the scripts are syntax-checked (\`bash -n\`, \`py_compile\`) and rig-run, but shellcheck is not installed on our machine, so they are not shellchecked — the docs say so; and the doctrine's pipeline-masking demonstration was reproduced on our rig with a stand-in producer: a file holding 16.3% of the rows (481,800 of 2,950,561), \`gzip -t\` still passing it.

The **Complete tier's Mac app** — the same five checks as a visual dashboard for backups on a Mac or its mounted volumes — passed its own 14-check run on our test machine: the Healthy dashboard (PROTECTED, drill ring at 41 days, next due 79), the Drift dataset flipping the header to ATTENTION NEEDED ("shrank to 79% of its normal size — 3rd night in a row"), the first-run empty state (no data folder: it builds its demo state and opens clean instead of crashing), and the trial-and-license gate — day one shows "Trial — 3 days left" with full features; with the trial start backdated past 72 hours it opens on the license screen, checks paused, data untouched. Fed an unseen dataset — a sample SQLite shop database grown nightly for 12 nights, plus website-files and documents backups — its detail screen showed the real numbers: tonight's dump at 79,567 actual bytes, orders ≥ 410, customers ≥ 101. The installer is DMG v4 (2,799,616 bytes, sha256 \`b771e25e…\`, in the build notes), verified from the mounted volume.

## The honest limits, printed on the listing too

- **It is not a backup tool.** It makes nothing and restores nothing; it verifies the backups and restore-to-scratch runs you already have.
- **The restic rotation helper is documented, not rig-tested.** A thin wrapper around documented restic commands; it was not part of the logged rig runs, and the listing says so too.
- **The PostgreSQL figures in posts #47–#49 are dafili's published measurements**, credited to him there and here. PostgreSQL was never installed on our rig; we reproduced the masking *mechanics* with a stand-in producer.
- **The Mac app is unsigned v1.** No Apple Developer certificate behind it yet, so macOS blocks the first open: drag to Applications, open once, click Done, then System Settings → Privacy & Security → "Open Anyway". One time, documented on the listing and in the download — but it is friction, and you should know before you pay, not after.
- **It was tested on our rig, not your systems** (Ubuntu 24.04, bash, Python 3.12; logged runs dated 3 Nov 2026; the app on macOS with sample data). The demo ships in the kit so you can watch it work before trusting it.
- **It is not a guarantee.** Verification shrinks the chance of discovering a bad backup mid-incident. The kit's point is the opposite of a guarantee: it makes you restore, on a schedule, with evidence.

## The two versions

- **Scripts — $39.** The full toolkit: the five checks, the restic rotation helper, \`kit.conf\`, the demo rig, worked examples, cron lines and systemd units.
- **Complete — $79.** Everything above, plus the restore-drill runbook (the quarterly manual drill step by step: before/during/after, the re-declaration checklist, a triage guide for every alert the kit can raise) and the Mac app. The app runs full-featured for 3 days from first launch, no card needed; the license key from a Complete purchase activates it permanently — one online check at activation, then it works offline.

Both are on Gumroad, which handles payment and taxes: **[Backup Verification Kit on Gumroad](https://devopsenginer.gumroad.com/l/backup-verification-kit)**. Refunds are 30 days, no questions asked — if the kit doesn't fit your setup, I would rather learn that from a refund than from your silence.

## FAQ

**What do I need to run the scripts?**
Linux, bash, Python 3.8+, coreutils. No pip installs, no agents, no accounts, nothing phones home. The optional Mac app needs macOS 14 or later.

**Which backup tools does it work with?**
Any tool that leaves you a dump or snapshot file and a way to restore-to-scratch. The size checks judge the artifact; the fingerprint judges the restored tree. Only the restic helper is tool-specific — and that one is documented rather than rig-tested.

**What does exit code 3 mean?**
SKIP: no fingerprint has been declared yet. An undeclared state must not come back green, so the check refuses to call day one a pass. Declaring takes about ten minutes by hand; from the first night you get real PASS/ALERT results.

**Why is the fingerprint written by hand? Isn't that the opposite of automation?**
Deliberately, yes. Expectations generated from the system under test grade that system's own homework — they agree with it exactly when it is wrong, which is how a backup exits 0 for three weeks. A human writes down what a correct restore must contain, quarterly, with dated reasons; automation compares nightly. The hand-written part is the product.

**How does the Mac app's trial and license work?**
Full features for 3 days from first launch, no card. After that, checks pause — your data untouched — until you paste the license key from your Complete-tier purchase. Activation checks the key once against Gumroad; then the app works offline. And yes, the app is unsigned in v1: first open needs the "Open Anyway" step above.

**What if it doesn't fit my setup?**
Thirty-day refund, no questions asked. Email within 30 days of purchase for a full refund.

## A closing question

This kit exists because one engineer wrote honestly about his backup failing, and another got corrected in public and fixed it. The thread is still the best specification the kit has. So, in that spirit: **when did you last actually restore — not back up, restore — and what did you compare the result against?** If the honest answer is "the job said success", you are exactly who the last three posts, and this kit, were written for. Tell me in the comments — especially if your answer is a check I haven't thought of. Those have a habit of becoming the next post.
  `,
  featuredImage: "/images/blog/top-10-devops-tools-2025/devops-hero.jpg",
  category: "DevOps",
  tags: ["Backups", "DevOps", "SRE", "Testing"],
  author: "DevOps Enginer",
  publishDate: "2026-11-05",
  lastModified: "2026-11-05",
  readTime: "12 min read",
  seo: {
    title: "The Backup Verification Kit Is Live: Three Posts, a Public Argument and 21 Tests Later",
    description: "It started with a reader's backup exiting 0 for three weeks while restoring nothing. It ended as a rig-tested toolkit: five declared-not-derived checks, a 21/21 release test suite, a restore-drill runbook and a Mac app - now live on Gumroad. The story, the test evidence, and the honest limits.",
    keywords: "backup verification, backup testing, restore drills, declared not derived, restic read-data-subset, backup monitoring, devops tools"
  }
};
