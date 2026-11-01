// Backup Verification in 2026: Exit Code 0 Is Not a Backup
export const backupVerificationBlog = {
  id: 47,
  title: "Backup Verification in 2026: Exit Code 0 Is Not a Backup",
  slug: "backup-verification-in-2026-exit-code-0-is-not-a-backup",
  excerpt: "Exit code 0 does not mean you have a backup. A practical guide to backup verification: the four levels of confidence, checksums, restic check and read-back tests, pg_restore checks, scheduled restore drills, and monitoring that pages on verification failure.",
  content: `
# Backup Verification in 2026: Exit Code 0 Is Not a Backup

A story made the rounds in a DevOps community recently, and it should make anyone who owns a cron job uncomfortable. An engineer checked on a backup script that had been running perfectly by every visible measure — green in the scheduler, exit code 0, night after night — and found it had been "succeeding" at backing up nothing at all for three weeks, ever since something upstream had quietly changed. No error. No page. Just three weeks of confidence with nothing underneath it.

> **TL;DR:** A backup job's exit code tells you the script ran, not that you have a backup. A backup is only trustworthy at four levels: (1) the artifact exists, (2) it is structurally intact, (3) it can be opened and read, and (4) it has actually been restored and the data verified. Most teams verify level 1 and stop. This guide walks a practical verification ladder — checksums, \`restic check\`, \`pg_restore --list\`, scheduled restore drills — plus the monitoring change that matters most: page on **verification** failure, not job failure.

This is deliberately not a Kubernetes backup guide — cluster tooling like Velero and etcd snapshots is covered in the Kubernetes Backup and Disaster Recovery post. This is about the layer underneath every stack: database dumps, file archives, and object-storage backups, and how to prove they work before the day you need them.

## Why exit code 0 lies

Exit code 0 means one narrow thing: the last command in your script did not report an error. It says nothing about what the script actually captured. Backup scripts fail silently in a handful of classic ways:

- **Wrong or empty source paths.** A directory gets moved, a mount fails to come up, or a path is renamed upstream. The archiver dutifully compresses an empty directory and exits 0. Your backup is a perfectly valid archive of nothing.
- **Expired or rotated credentials.** The dump tool fails to authenticate and writes a 0-byte file — or the wrapper script swallows the error, logs a warning nobody reads, and still exits successfully because the *upload* of that empty file worked fine.
- **Silent partial captures.** A database dump taken without the right flags can complete while missing schemas, extensions, or large objects. The file is large, recent, and wrong.

The pattern underneath all of these: the job was monitored, but the *backup* was never verified. Those are different jobs, and they need different checks.

## The four levels of backup confidence

A useful way to think about backup verification is as a ladder. Each level proves something the level below cannot:

**Level 1 — The artifact exists.** A file or snapshot with the expected name appeared in the expected place, recently, with a plausible size. This is what most monitoring checks. It proves a process ran.

**Level 2 — The artifact is structurally intact.** The archive is not truncated or bit-rotted. Checksums match; the backup tool's own integrity check confirms its internal structures — indexes, metadata, pack files — are consistent. This proves the bits survived storage.

**Level 3 — The artifact can be opened and read.** The restore tool can actually parse the backup: list the table of contents of a dump, enumerate the files in an archive, read back a sample of the stored data. This proves the format is valid and the content is what you think it is — not an empty tree, not the wrong source.

**Level 4 — The artifact has been restored and the data verified.** You restored it into a real (throwaway) environment and checked the result: the database answers queries, row counts and key tables look right, application files open. This is the only level that proves you can recover. Everything below it is inference.

Notice what the ladder implies: levels 1–3 are cheap and automatable on every backup. Level 4 is more expensive, so you schedule it — sampled nightly or weekly, full restores on a rotation. What you cannot do is pretend level 1 is level 4. That gap is exactly where the three-weeks-of-nothing story lives.

## The verification ladder in practice

Here is how to test yours, level by level. The examples use common tools — \`restic\`, PostgreSQL dumps, plain tarballs in object storage — but the pattern transfers to whatever you run.

### Level 1: existence, freshness, and size sanity

Check that the newest artifact exists, is younger than your backup interval (plus slack), and is within a sane size band of its predecessors. A backup that suddenly shrinks by 90% is a failed backup wearing a success costume.

\`\`\`bash
# Fail loudly if no backup newer than 26 hours exists in the bucket
aws s3 ls s3://my-backups/postgres/ --recursive \\
  | sort | tail -n 1

# Size sanity: compare today's artifact against the 7-day median
# and alert if it deviates by more than ~50%
\`\`\`

Tools like restic make this easier because the repository keeps snapshot metadata:

\`\`\`bash
restic snapshots --last 1 --json   # newest snapshot time, paths, tags
restic stats                       # repository size trend
\`\`\`

Encode the rule: **a missing, stale, or suddenly-tiny backup is a verification failure**, even if the job that produced it exited 0.

### Level 2: structural integrity with checksums and tool-native checks

If you produce plain archives, generate a checksum at backup time and verify it at check time:

\`\`\`bash
sha256sum -c postgres-2026-11-01.dump.sha256
gzip -t nightly-files.tar.gz   # quick structural test for gzip streams
\`\`\`

restic has integrity checking built in:

\`\`\`bash
restic check
\`\`\`

\`restic check\` verifies the repository structure — all packs, indexes, and metadata present and consistent. It is fast and belongs in the nightly job. What it does *not* do by default is re-read your backup data — that is level 3.

### Level 3: prove it can be read back

For archives, listing the contents is the minimum viable read test — it forces the tool to walk the whole structure:

\`\`\`bash
tar -tzf nightly-files.tar.gz > /dev/null   # fails on truncation/corruption
\`\`\`

For PostgreSQL custom-format dumps, \`pg_restore --list\` parses the dump's table of contents without restoring anything:

\`\`\`bash
pg_restore --list postgres-2026-11-01.dump | head -n 50
\`\`\`

Scan that listing for what *should* be there: your critical tables, extensions, and the expected object count. An empty dump has a valid header and almost nothing under it — this is the check that catches the "backed up nothing" failure mode.

For restic, the read-back check is:

\`\`\`bash
restic check --read-data-subset=5%
\`\`\`

Understand the caveat before you rely on it: \`--read-data-subset=5%\` reads and verifies **5% of the data packs**, not 5% of each file. It is sampling. A corrupt pack outside the sample will not be found tonight. Two practices make sampling honest:

- **Rotate the subset.** restic picks the subset deterministically from the percentage, so vary the percentage across runs (5%, 10%, 15%…) or accept that a fixed sample has fixed blind spots.
- **Run a full read periodically.** \`restic check --read-data\` (100%) on a monthly cadence closes the gaps the sampling leaves.

Also add a content spot-check at this level: restore a handful of known files to a temp directory and diff them, or query the snapshot for a file you know changed yesterday. Existence of *expected content* is a much stronger signal than existence of *an artifact*.

### Level 4: restore drills — the only level that counts

Restore into a throwaway environment and verify the result like a user would. For PostgreSQL:

\`\`\`bash
# Restore last night's dump into a scratch database
createdb -T template0 restore_test
pg_restore --no-owner --dbname=restore_test postgres-2026-11-01.dump

# Then verify like the application would
psql restore_test -c "SELECT count(*) FROM users;"
psql restore_test -c "SELECT max(created_at) FROM orders;"
\`\`\`

Row counts in a plausible range and a recent \`max(created_at)\` on your busiest table prove the restore contains live, current data — not a skeleton schema and not last month's state.

For file backups, restore the latest snapshot to a scratch path and verify file counts and a sample of checksums against expectations:

\`\`\`bash
restic restore latest --target /tmp/restore-test
find /tmp/restore-test -type f | wc -l
\`\`\`

The drill is not done when the restore command exits 0. The drill is done when a check *of the restored data* passes. And time the drill: the duration you measure is your real recovery time, not the one in the runbook.

## Make verification a separate job that can fail

The single most important structural change: **verification must be its own job, with its own failure state, that runs after the backup job.** Folded into the backup script, a verification failure disappears into the same green checkmark. Give it its own exit code and its own alert path.

\`\`\`bash
#!/usr/bin/env bash
# verify-backups.sh — runs after the backup job, fails independently
set -euo pipefail

LATEST=$(restic snapshots --last 1 --json | jq -r '.[0].id')

restic check                                   # level 2
restic check --read-data-subset=5%             # level 3 (sampled)
restic restore "$LATEST" --target /tmp/restore-test --include /srv/app/config
test -s /tmp/restore-test/srv/app/config/app.env   # expected content present

echo "backup_verification_success $(date +%s)" \\
  > /var/lib/node_exporter/textfile/backup_verification.prom
\`\`\`

The script writes a **success timestamp** only if every level passed — and that timestamp is what you monitor.

## Monitor the verification, not the job

Alerting on "backup job failed" catches crashes. It does not catch the failure mode this article is about, because in that failure mode the job *succeeds*. Change what you page on:

- **Page on verification failure.** Any level failing — stale artifact, size anomaly, checksum mismatch, unreadable dump, failed drill — is a page-worthy event, because it means you currently do not have a proven backup.
- **Page on missing success.** Track "time since last successful *verification*" and alert when it exceeds your threshold (for a nightly cycle, ~30 hours). This dead-man's-switch pattern catches the silent cases: the verification job itself dying, the scheduler stopping, credentials expiring before the check even runs. Absence of failure is not presence of success — so monitor the presence of success.
- **Track your verified restore point.** The metric that matters in an incident is "how old is the newest backup that has passed level 4?" If that number quietly grows to three weeks, you want to know before the incident, not during it.

If you use Prometheus, the textfile pattern above plus one alert — \`time() - backup_verification_success > 30 * 3600\` — covers most of this. The tooling is not the hard part; deciding that verification failure pages like a production outage is.

## A restore-drill cadence you can actually keep

Verification fails as a practice when it depends on someone remembering. Put it on a calendar:

| Cadence | Scope | Levels |
|---|---|---|
| Nightly (automated) | Every backup, right after it lands | 1–3, with rotating read-data subsets |
| Weekly (automated) | Partial level-4: restore one database or one snapshot subset to a scratch environment; run content checks | 4 (partial) |
| Monthly (automated + reviewed) | Full restore of **one** production system on rotation, timed end to end | 4 (full) |
| Quarterly | Full restore drill treated like a game day: restore, verify, record duration and surprises, update the runbook | 4 (full, measured) |

The rotation matters: every system should get a full restore at least once a quarter, rather than an annual hero-drill on the one system everybody already understands. Record each drill's duration — that number is your measured RTO, and it is almost always worse than the assumed one. Finding that out in a drill is the entire point.

Cloud snapshots deserve a specific warning here: a snapshot of a disk or database is level 1 by default. Snapshots faithfully preserve corruption, they can be silently incomplete if taken mid-write without coordination, and "we have snapshots" has ended more than one incident review badly. Snapshots need the same ladder — restore one into an isolated instance, open it, query it — before they count as backups.

## Backup verification checklist

- Every backup has a **separate verification job** with its own pass/fail, running after the backup completes
- Level 1: freshness and size-band checks on every artifact, every cycle
- Level 2: checksums verified for plain archives; \`restic check\` (or your tool's equivalent) nightly
- Level 3: read-back tests — \`pg_restore --list\`, \`tar -t\`, \`restic check --read-data-subset\` with **rotating** percentages, plus expected-content spot checks
- Level 4: automated partial restores weekly; full restores monthly on rotation; quarterly timed drill
- Monitoring pages on **verification failure** and on **missing verification success** (~30h for nightly cycles)
- "Age of newest level-4-verified backup" is a visible metric, not a surprise
- Restore durations are recorded, so your RTO is measured rather than assumed
- Snapshots are restore-tested like any other backup before being trusted

## FAQ

**Is \`restic check\` on its own enough?**
It covers level 2 well and, with \`--read-data-subset\`, samples level 3. It never restores anything, so it cannot prove level 4. Treat it as the nightly baseline, not the whole strategy.

**Doesn't all this verification double my costs?**
Levels 1–3 are metadata, checksums, listings, and sampled reads — cheap. Level 4 restores cost scratch compute for a few hours a month. Compare that with the cost of discovering, mid-incident, that the backups were empty.

**My backups are managed by my cloud provider. Am I covered?**
Managed backup services still produce artifacts that can be empty, misconfigured, or pointed at the wrong source. The provider runs the job; verification that the artifact restores *your* data is still yours.

**What is the one change to make first?**
Add the dead-man's-switch alert on "time since last successful verification." It is a small change, and it converts the worst failure mode — silent, indefinite, total — into a page within a day.

## Summary

An exit code tells you a script ran. A trustworthy backup has been checked at four levels: it exists, it is intact, it can be read, and it has been restored with the data verified. Automate the first three nightly; schedule the fourth — weekly partials, monthly full restores on rotation, quarterly timed drills. And page when *verification* fails or goes missing, not merely when a job crashes. The engineer in the opening story had monitoring. What they did not have was a single check that asked the only question that matters: *if I needed this backup tonight, could I restore it?* Build the checks that answer that question while the answer is still cheap.
  `,
  featuredImage: "/images/blog/aws-cost-optimization-15-tactics-saved-50k-month/hero.jpg",
  category: "DevOps",
  tags: ["Backup", "Disaster Recovery", "DevOps", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-11-01",
  lastModified: "2026-11-01",
  readTime: "13 min read",
  seo: {
    title: "Backup Verification in 2026: Exit Code 0 Is Not a Backup",
    description: "Exit code 0 does not mean you have a backup. A practical guide to backup verification: the four levels of confidence, checksums, restic check and read-back tests, pg_restore checks, scheduled restore drills, and monitoring that pages on verification failure.",
    keywords: "backup verification, restic check, pg_restore, restore drill, backup monitoring, disaster recovery 2026"
  }
};
