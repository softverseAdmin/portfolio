// Declared, Not Derived: Backup Checks That Can't Grade Their Own Homework
export const declaredNotDerivedBlog = {
  id: 49,
  title: "Declared, Not Derived: Backup Checks That Can't Grade Their Own Homework",
  slug: "declared-not-derived-backup-checks",
  excerpt: "A backup check that derives its standard from the backup itself agrees with the system exactly when the system is wrong. The tested fix: a human-declared floor per database inside the script, the rolling median in monitoring where its death is a missing metric, and a restore fingerprint guarded by a checksum and an append-only history.",
  content: `
# Declared, Not Derived: Backup Checks That Can't Grade Their Own Homework

This series has an unusual origin story, and this post is where it pays off. [Backup Verification in 2026](https://www.devopsenginer.com/blog/backup-verification-in-2026-exit-code-0-is-not-a-backup) grew out of a comment thread under **dafili**'s dev.to article ["My Backup Exited 0 for Three Weeks and Nothing Paged Me"](https://dev.to/dafili/my-backup-exited-0-for-three-weeks-and-nothing-paged-me-5ce6) — and then dafili corrected one of its claims in public, and the correction went in. [Restore Drills in 2026](https://www.devopsenginer.com/blog/restore-drills-in-2026-you-cant-automate-the-declaration) took his fingerprint doctrine as far as it went, and ended with an honest open question: *where does the fingerprint live?* I did not have his answer yet.

Now I do. He answered that question, and the follow-ups behind it, across two threads — under the backup article and under his follow-up, ["Three checks that look like they passed but validated nothing"](https://dev.to/dafili/three-checks-that-look-like-they-passed-but-validated-nothing-ejd). This post is the answers, assembled into one approach. And because a reader of this series has already had to correct it once, every claim in this post that rests on a measurement was **run on a test rig before it was written down**. Where a number is dafili's, it is credited to dafili. Where it is ours, the test that produced it is described with it.

Underneath all three posts sits one distinction, and dafili kept arriving at it from different directions until it was impossible to unsee: **declared vs derived**. A standard a human *declared* — a floor, a fingerprint, a hash written down by hand — can disagree with the system forever. A standard *derived* from the system — a median of the backup's own output, expectations read from the backup itself, a fingerprint stored where the pipeline can rewrite it — agrees with the system at exactly the moment the system is wrong. Every check that validates nothing is a derived standard wearing a declared one's clothes.

> **TL;DR:** Place each backup check where its standard cannot be talked out of itself. Inside the backup script: nothing but a human-declared **absolute floor per database**, set at "catastrophically wrong", failing fast. In monitoring: the **rolling median**, whose job is the slow shrinkage the floor cannot see — and which, being in monitoring, fails as a *missing metric* when it breaks, instead of failing silently as success. For the restore drill: the **fingerprint** from the previous post, now with its storage rules answered — outside the tree it describes, where the backup job cannot write, human-written and script-read, guarded by a checksum, with an **append-only history** that ends the checksum recursion, and one value asserted from the outside world. And the drill itself stays on a gauge: \`days_since_last_successful_manual_restore\`, paging at about 120 days.

## The questions this post answers

Three questions were left open in the threads. They are the skeleton of everything below:

1. **Where does the fingerprint live?** (Asked at the end of the restore-drills post.)
2. **Does the size-vs-median guard belong in the backup script or in monitoring?** (Asked under "Three checks".)
3. **The follow-ups those answers provoked:** is the floor set per database or per box — and if the fingerprint gets a checksum, where does the *checksum's* protection live? Does the recursion ever end?

## First, the trap: a pipeline that reports success over almost nothing

Start with dafili's measured rig from "Three checks", because everything else in this post is a defence against its shape. He killed a \`pg_dump\` mid-run on purpose and measured every check he could think of. Three of them passed:

- **The pipeline exit code was 0.** A shell pipeline reports the status of its *last* command. \`gzip\` was never killed — only its input died — so it finished cleanly, and the script rolled on to its next line, which is usually "backup succeeded", followed by a rotation step that deletes yesterday's copy.
- **\`gzip -t\` passed.** The archive is genuinely valid gzip — correct trailer, proper EOF — wrapped around **81,068 bytes of data where the complete dump was 2,753,525 bytes. 2.9%.** The compression is perfect; the content just isn't there.
- **\`pg_restore -l\` passed.** For the custom format, the table of contents is written near the *start* of the file, before the data blocks — so a dump truncated at 6% of its size still lists all seven TOC entries, exit 0.

What caught it, in his measurements: making \`pg_dump\` compress its own output (\`pg_dump -Z6 -f\`) — killed the same way, it exits 137 and \`gzip -t\` now *fails*, because with no surviving second process, the gzip trailer is never written. And \`pg_restore -f /dev/null\` — actually reading the data instead of inspecting the header — errors out. Those PostgreSQL numbers are dafili's, from his rig, and they are worth reading in his article directly.

We could not install PostgreSQL on our test VM (the package install stalled and was abandoned), so we do **not** present his pg numbers as reproduced. What we reproduced is the generic mechanics underneath them, with a plain producer process standing in for the dump:

\`\`\`
### CASE 1 — producer | gzip, producer killed mid-stream
producer exit status : 137  (137 = 128 + SIGKILL: it was killed)
pipeline exit status : 0  <- what a cron job / CI step reports: the LAST command's status
gzip -t exit status  : 0  (the partial file is 'valid gzip')

rows in killed (piped) file : 481800
rows in complete file       : 2950561
killed file holds 16.3% of the rows — and passed gzip -t

### CASE 2 — producer writes its own gzip file, killed mid-stream
producer exit status : 137  (137 = killed; nobody else's status can mask it)
gzip: fallback-direct.gz: unexpected end of file
gzip -t exit status  : 1  (non-zero: the trailer was never written)
\`\`\`

Same shape, smaller stakes: kill the producer inside a pipeline and the pipeline reports 0 while \`gzip -t\` blesses a file holding 16.3% of the rows. Let the producer compress its own output and the same kill produces an honest non-zero exit and a \`gzip -t\` failure. The structural fix dafili measured on PostgreSQL — *stop using a pipeline; don't let a second process's success mask the first one's death* — is not a PostgreSQL tip. It is the first declared-vs-derived lesson: the pipeline's exit code is derived from whichever process happened to survive.

## The median is a derived standard

Dafili's cheapest real guard, from the same article, is comparing the dump's size against a rolling median of recent runs — it costs nothing and catches the 2.9% shape without opening the file. My question in his thread was where it belongs: in the backup script, failing the run fast, or in monitoring, where the alert carries the history?

His answer rearranged the whole design: **monitoring — and never in the script — but not for the reason I was torn about.** The median is *self-referential*. It is computed from the backup's own output, so it drifts toward whatever it is fed. His arithmetic: thirty healthy runs, and one truncated night fires at 2.9%. But feed it five consecutive truncated nights first, and the median itself becomes ~81 KB — now the *healthy* run alarms, at 3,399% of the median. In his words: **the thing being watched supplies the standard it is judged against.** It is the fingerprint-beside-the-config mistake in a second costume.

We rebuilt that arithmetic as a simulation before writing this paragraph — thirty healthy nights generated around his published full-dump size, the truncated size his rig measured, a two-sided deviation check of the kind his example implies:

\`\`\`
STEP 1 — healthy history, one truncated night
  window median : 2,753,525 bytes (n=30)
  tonight       : 81,068 bytes = 2.9% of median -> median check: ALARM

STEP 2 — 5 consecutive truncated nights, short window (last 5 runs)
  window median : 80,905 bytes (n=5)
  tonight (healthy) : 2,753,525 bytes = 3,403.4% of median -> median check: ALARM

STEP 3 — majority-poisoned 30-night window (14 healthy + 16 truncated)
  window median : 81,797 bytes (n=30)
  tonight (truncated) : 81,068 bytes = 99.1% of median -> median check: pass
\`\`\`

Our run lands where his arithmetic said it would (3,403.4% against his published ~3,399% — the small difference is our generated jitter, and it is ours, not his). And the simulation shows the step his example only implied: once truncated runs are the *majority* of the window, the poisoning completes — a truncated night scores 99.1% of the median and **passes**. A longer window delays the collapse; it does not change its nature. A median is a derived standard, and given a persistent failure it derives the failure.

None of this makes the median useless. It makes it *placed*. Its job is real — it is the failure the next section's floor cannot see — but it has to live where a drifting standard does the least harm and where the check's own death is visible. That place is monitoring — and the sections below show it working there.

## The floor is a declared standard

What goes inside the backup script, then? Dafili's split is by *kind of failure*, not by preference:

> **In the script: an absolute floor, declared by a human.** Not a median — a constant. "This dump is never smaller than 400 KB." It cannot be poisoned by the script's own history because the script did not write it, it fails fast with a non-zero exit on the catastrophic case, and it costs one comparison.

Two follow-ups sharpened it. The floor is set **per database** — a per-box constant has to be borrowed from one of the databases on the box, after which it is loose for the smallest of them or never fires for it at all. And it is set at **"this would be catastrophically wrong"**, not "a bit below today" — because the second, in his phrase, is *a health check wearing a catastrophe's name*. A floor is a tripwire for the 2.9% shape, nothing more. Asking it to detect ordinary unhealth is what makes teams tune it into silence.

Here is the rig version, exactly as tested — a table of constants, nothing computed, nothing read from history:

\`\`\`bash
#!/usr/bin/env bash
# floor_check.sh — runs INSIDE the backup script, immediately after the dump.
# The only expectations here are constants a HUMAN declared: one absolute
# floor per database, set at "this would be catastrophically wrong".
# Usage: floor_check.sh <db> <dump-size-bytes>
set -u

declare -A FLOOR=(
  [billing-db]=400000     # healthy dump ~2.75 MB; below 400 KB is not the dump
  [analytics-db]=60000    # healthy dump ~150 KB; per-database, because one
                          # per-box constant is loose for the smallest database
)

db=\${1:?usage: floor_check.sh <db> <size-bytes>}
size=\${2:?usage: floor_check.sh <db> <size-bytes>}
floor=\${FLOOR[$db]:-}

if [ -z "$floor" ]; then
  echo "FLOOR ERROR: no floor declared for '$db' — declare one by hand" >&2
  exit 2
fi

if [ "$size" -lt "$floor" ]; then
  echo "FLOOR FAIL: $db dump is $size bytes, below the declared floor of $floor bytes — failing the backup run" >&2
  exit 1
fi

echo "floor ok: $db $size bytes >= declared floor $floor bytes"
exit 0
\`\`\`

And its tested behaviour, across the median-poisoning story from the previous section:

\`\`\`
healthy night                       2,753,525 bytes -> floor check: pass
truncated night 1                      81,068 bytes -> floor check: ALARM (fail fast)
truncated night 30                     81,068 bytes -> floor check: ALARM (fail fast)
healthy night after poisoning       2,753,525 bytes -> floor check: pass
\`\`\`

Night 1 and night 30 get the same verdict, because the standard did not move. That is the entire virtue of a declared constant: it is boring, it is dumb, and no run of bad nights can talk it out of itself.

## Monitoring holds the median — and can notice its own death

The median's job is the failure the floor is deliberately blind to. In dafili's examples: someone drops a table, or a partition stops being included, and the dump steps down — 2.75 MB to 2.2 MB — never coming near a catastrophe floor, visible only as drift against history. His summary of the split deserves quoting whole: *"They are not two implementations of one check. They catch different things, and one of them needs history the other must not have."*

The rig's monitoring check, as tested:

\`\`\`python
#!/usr/bin/env python3
"""median_check.py — runs in MONITORING, never inside the backup script.
Compares tonight's dump size against the rolling median of recent
history and flags drift. Every run writes a heartbeat metric file;
if this check itself breaks, the heartbeat goes stale — and a stale
metric is itself alertable."""
import argparse, csv, statistics, sys, time

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--history", required=True)
    ap.add_argument("--db", required=True)
    ap.add_argument("--tonight", required=True, type=int)
    ap.add_argument("--window", type=int, default=30)
    ap.add_argument("--low", type=float, default=0.80)
    ap.add_argument("--heartbeat", default="monitor_heartbeat.txt")
    args = ap.parse_args()

    try:
        with open(args.history, newline="") as fh:
            rows = [r for r in csv.DictReader(fh) if r["db"] == args.db]
        sizes = [int(r["size"]) for r in rows][-args.window:]
        if not sizes:
            raise ValueError(f"no history rows for db '{args.db}'")
    except (OSError, ValueError, KeyError) as exc:
        # The check is broken. Exit WITHOUT writing a heartbeat: the
        # missing metric is how monitoring notices its own death —
        # exactly what a backup script cannot report about itself.
        print(f"MEDIAN CHECK ERROR: {exc} — no metric emitted", file=sys.stderr)
        return 2

    med = statistics.median(sizes)
    ratio = args.tonight / med
    status, code = ("DRIFT", 1) if ratio < args.low else ("ok", 0)

    with open(args.heartbeat, "w") as fh:   # emit the metric first
        fh.write(f"median_check_last_run {int(time.time())}\\n")
        fh.write(f"dump_size_ratio{{db=\\"{args.db}\\"}} {ratio:.4f}\\n")

    print(f"{args.db}: tonight {args.tonight:,} bytes vs median of last "
          f"{len(sizes)} nights {med:,.0f} bytes = {ratio * 100:.1f}% "
          f"(drift threshold {args.low * 100:.0f}%) -> {status}")
    return code
\`\`\`

The tested split, on the rig's second database — a step-change shrinkage of the dropped-partition kind, 150,000 bytes down to 118,500:

\`\`\`
$ ./floor_check.sh analytics-db 118500
floor ok: analytics-db 118500 bytes >= declared floor 60000 bytes        (exit 0 — by design)

$ python3 median_check.py --history sizes_history.csv --db analytics-db --tonight 118500
analytics-db: tonight 118,500 bytes vs median of last 30 nights 150,000 bytes = 79.0% (drift threshold 80%) -> DRIFT   (exit 1)
\`\`\`

The floor passes it, correctly — 118,500 bytes is not a catastrophe. The median flags it, correctly — a fifth of the database went missing overnight. Neither check is wrong; they are answering different questions, which is the point of placing them apart.

One honest limit, because this series has learned to print those: a rolling median compares tonight against *recent* history, so a decline spread evenly across the whole window is gradually absorbed as the window adapts. The median earns its place on step changes and drift *relative to the window* — and the floor and the fingerprint, which never adapt, are the layers behind it.

The placement has a second payoff, and it might be the deeper one. **A broken check inside the backup script fails silently, by returning success** — nothing observes the checker, so its death looks like health. **A broken check in monitoring fails as a missing metric** — and a missing metric is itself alertable, with \`absent()\` in Prometheus or, at the rig's shell scale, a freshness check on the heartbeat file:

\`\`\`
$ ./check_monitor_freshness.sh monitor_heartbeat.txt 90000    # heartbeat just written
monitor fresh: median check heartbeat is 0s old (limit 90000s)                      (exit 0)

$ touch -d "2 days ago" monitor_heartbeat.txt                 # the checker died two days ago
MISSING METRIC: median check heartbeat is 172800s old (limit 90000s) — the checker itself is down   (exit 1)

$ python3 median_check.py --history MISSING.csv --db billing-db --tonight 2753525
MEDIAN CHECK ERROR: [Errno 2] No such file or directory: 'MISSING.csv' — no metric emitted   (exit 2)
\`\`\`

You can build a monitoring check that notices its own death. You cannot build that for a check inside the script it watches. In dafili's closing line on the placement question: *the script asserts what a human wrote down and cannot be talked out of; monitoring asserts against history and is expected to notice when it stops reporting. Anything that needs to be right for years goes in the second bucket.*

## Where the fingerprint lives

Which brings back the restore-drills post's open question, now with its answer. My worry, asking it, was drift: keep the fingerprint next to the backup config and it might drift along with the thing it is meant to catch. Dafili's answer: not next to the config — he put it there first too — and the failure is worse than drift. It is **quiet version skew**. If the fingerprint lives in the same file, the same repo, the same commit as the backup definition, the two are edited together, by the same person, in the same frame of mind — so they drift *together and consistently*, and the nightly comparison keeps passing while both slowly stop describing what you actually care about. His sentence for it: **"A fingerprint that changes when the thing it guards changes is not a fingerprint, it is a mirror."**

His three rules, in the order they bite:

1. **Keep it out of the tree it describes.** Not the backup config, not the repo, not the directory beside the exporter. The comparison must be a diff between two things that fail *independently* — otherwise one bad \`rsync --delete\` or one careless checkout takes out both the data and the record of what the data should have been. His placement: on the same box as the alerting, in a directory the backup job has no write access to. *If the backup can write its own expectations, it can satisfy them.*
2. **The human writes it; the script only reads.** This has to be structural, not a convention: no code path may be able to regenerate the fingerprint. The moment a helper exists that recomputes it "to fix" a drift alarm, the alarm is gone — someone runs the helper, the night turns green, and nobody looks at why it drifted.
3. **Every entry carries a reason, and the reason is dated.** When the file list changes because a table was legitimately added, the diff should be small and the note should say why. When it changes because something shrank, the note is the thing that makes you stop. A bare blob of values gives "we added a feature" and "we lost half the rows" the same visual weight.

And two additions to the fingerprint from the restore-drills post. Include **one value that is not derived from the backup at all** — asserted from the outside world. His example: a table count taken from the *live* server, compared against what the dump reports. That catches the case where the dump is internally consistent, passes every checksum, and was taken from the wrong instance entirely — or from a replica that had quietly stopped applying changes. And keep **a checksum of the fingerprint file itself**, written when the fingerprint is written: it does not stop anyone editing the file, but it converts a silent edit into a loud one.

The checksum raises the obvious next question. It is the one I asked him, and it is the best answer in either thread.

## What ends the checksum recursion: history

If the fingerprint needs a checksum, where does the checksum live — and what protects *it*? Isn't it the same problem one level up, forever?

His answer, in full: yes, it is the same problem one level up, and **it doesn't terminate — it just stops being worth solving.** The checksum only buys you one thing: *an edit by anything other than the writer is loud.* What ends the recursion is not another checksum. It is **history: fingerprints append-only, alert on the diff.** Keep every declaration as an appended, dated record, and the script can rewrite its own file if it wants — *you still see it move.*

We built exactly that into the test kit, and then we tried to sneak past it. First the kit itself:

- \`vault/fingerprint.txt\` — the declared entries (file list, one sha256, one row-count minimum, one config value, one outside-world assertion), each with its date and reason, in a directory outside both the backup's tree and the restore's tree.
- \`vault/fingerprint.sha256\` — the checksum, refreshed only by the declaration tool.
- \`vault/history.log\` — append-only. Every declaration appends one line: timestamp, the fingerprint's new checksum, the reason.
- \`declare_fingerprint.sh\` — the human's tool, and the only writer. It does not edit the fingerprint's contents; it cannot regenerate a single declared value. It refreshes the checksum and appends the history line.

The compare script checks the fingerprint's integrity *before* it trusts any comparison: checksum must match, **and the current checksum must be the last entry in the history.** Then the demos, all run before this post was written:

| Scenario | Result |
|---|---|
| Clean state | PASS — every comparison green |
| A non-writer quietly edits the fingerprint (row-count minimum 400,000 → 400) | **ALERT** — checksum mismatch; comparison not trusted |
| The restore drifts (orders 412,308 → 312,308, below the declared minimum) | **ALERT** — row-count drift |
| The dump came from the wrong instance (24 tables vs the live server's 26) | **ALERT** — outside-world assertion |
| Fingerprint edited *and its checksum regenerated to cover it* | **ALERT** — checksum passes; history catches it: no declaration was appended |
| A legitimate re-declaration (schema really rolled; human updates the entry by hand and declares it, with a dated reason) | PASS — with the change visible as a dated history line |

The fifth row is dafili's recursion answer, demonstrated: the checksum alone does *not* end the recursion — an edit that covers its own checksum sails through the checksum check. The append-only history ends it, because the edit has no declaration. And the sixth row is the path that makes the system livable: legitimate change is not blocked, it is *declared* — appended, dated, reasoned, visible in the diff forever.

Honesty requires the footnote, and dafili's framing already contains it: an operator with write access to the vault can append a *fake* declaration too. Append-only history does not make edits impossible. It makes them **loud and attributable** — a silent edit becomes a visible, dated, reasoned act that a second person can review. That is the most you can ask of any of this, and it is enough, because the failures this series is about were never attackers. They were quiet edits at 2 a.m. that nobody ever saw.

One more thing the kit did during testing, unscripted: it caught *us*. Our first re-declaration demo updated the schema value in the fingerprint and declared it — and the compare refused to pass, because the fingerprint's sha256 entry still pointed at the old config file. We had updated the declaration's words and forgotten its hash, and the kit treated our half-finished declaration exactly like drift. It was right to. A declaration is a human act with several parts; the tooling cannot do any of them for you, and the comparison is what makes an incomplete one visible instead of green. We completed the declaration by hand, re-declared, and it passed — with both the mistake and the completion sitting in the history, dated, for anyone to read.

For reference, the compare script's integrity step (lightly cleaned from the tested rig version; the full rig, with every demo output, is reproducible and was run before publication):

\`\`\`python
#!/usr/bin/env python3
"""fingerprint_compare.py — the comparison half of the kit.
Automation runs this; it only READS the fingerprint. Step 0 checks the
fingerprint itself before any comparison is trusted: the checksum must
match, and the current checksum must be the LAST line of the append-only
history. Step 1 then compares the restore against each declared entry:
expected files, the declared sha256, the row-count minimum, the config
value, and the outside-world assertion (the dump's table count must
equal the live server's — a value not derived from the backup at all).
Exit 0 = pass; 1 = any alert."""

actual_sum = sha256_of(vault / "fingerprint.txt")
recorded   = (vault / "fingerprint.sha256").read_text().split()[0]
report(actual_sum == recorded, "fingerprint checksum")

history  = [ln for ln in (vault / "history.log").read_text().splitlines() if ln.strip()]
declared = f"sha256:{actual_sum}" in history[-1]
report(declared, "append-only history")   # an edit that regenerated its
                                          # own checksum fails HERE
\`\`\`

## The gauge watches the drill

One piece of the restore-drills post survives unchanged, and dafili's storage answer promoted it: asked where the fingerprint lives, he closed by saying the **gauge is the part he would do first**. \`days_since_last_successful_manual_restore\` — one exporter line, written only when a human-run restore *passes* — turns an invisible process into one that can go stale in public. His reasoning closes the loop with the very first article in this series: the fix is not making the human more reliable; it is making **the absence of the human's action visible** — the same move as monitoring for the absence of a fresh backup artifact instead of the presence of an error.

The rig's shell-scale version, with its three tested states:

\`\`\`bash
#!/usr/bin/env bash
# restore_gauge.sh — the state file is written ONLY by the final step of
# a human-run restore drill that passed its fingerprint comparison.
last=$(cat "$state"); now=$(date +%s); days=$(( (now - last) / 86400 ))
[ "$days" -gt 120 ] && { echo "GAUGE PAGE: days_since_last_successful_manual_restore = $days" >&2; exit 1; }
echo "gauge ok: days_since_last_successful_manual_restore = $days"
\`\`\`

\`\`\`
drill passed 2026-10-20  ->  gauge ok: days_since_last_successful_manual_restore = 14    (exit 0)
last drill 2026-06-01    ->  GAUGE PAGE: days_since_last_successful_manual_restore = 155  (exit 1)
no state file at all     ->  GAUGE ALERT: no manual restore has ever been recorded        (exit 2)
\`\`\`

## The whole approach on one page

| Layer | Lives in | Its standard | Catches | Fails as |
|---|---|---|---|---|
| Absolute floor, per database | The backup script | **Declared** — a human-set constant | Catastrophic truncation (the 2.9% shape), tonight, before rotation | Loudly, in the run — and it cannot be poisoned, because it reads no history |
| Rolling median | Monitoring | Derived — recent history | Step-change shrinkage the floor cannot see (dropped table, excluded partition) | A **missing metric** — alertable via \`absent()\` / heartbeat freshness |
| Restore fingerprint | A vault outside the tree it describes | **Declared** — hand-written, dated reasons, checksum, append-only history | Wrong-but-intact restores; wrong instance; quiet edits to the expectations themselves | A drift alert, or an integrity alert before any comparison is trusted |
| Restore-recency gauge | Monitoring | **Declared** — the 120-day threshold | The drill itself quietly stopping | A page on absence, not on error |

Read the "standard" column top to bottom and the whole doctrine is there: wherever a standard *must not move*, it is declared; the one derived standard in the stack is placed where its movement is watched and its silence is an alarm.

## Declared-vs-derived checklist

- No backup pipeline reports success from a surviving second process — the producer's own exit status (or its internal compression) is what the run reports
- Every backup script contains exactly one size expectation: a human-declared absolute floor, **per database**, set at "catastrophically wrong"
- No median, average, or history-derived threshold exists anywhere inside a backup script
- The rolling-median drift check lives in monitoring, emits a metric every run, and has an alert on the metric's *absence*
- The restore fingerprint lives outside the tree it describes, in a directory the backup job cannot write
- The fingerprint is written only by a human (via a declaration tool that cannot regenerate values); the comparison only reads it
- Every fingerprint entry carries a dated reason; one entry is asserted from the outside world, not derived from the backup
- The fingerprint has a checksum, and an append-only history whose last entry must match the current checksum before any comparison is trusted
- Re-declarations are appended, dated, and reasoned — never silent edits
- A \`days_since_last_successful_manual_restore\` gauge (or equivalent) pages at about 120 days

## FAQ

**Isn't a rolling median the standard way to sanity-check backup sizes?**
Yes — and nothing here retires it. The argument is about *placement*. In monitoring, the median does the job it is good at (drift against history) and its failure mode is a missing metric. Inside the backup script, the same median is a derived standard guarding its own source, and its failure mode is returning success. Same check, different blast radius.

**Why per database rather than one floor per box?**
Because a per-box constant has to be borrowed from one of the databases on the box — dafili's answer, and it is arithmetic, not taste. Set it for the largest database and it is loose for the smallest; set it for the smallest and it never fires for the largest. Catastrophe is per-database, so the floor is too.

**Who checks the checksum of the history? And the history of the history?**
Nobody — that is the honest answer, and it is dafili's. The recursion does not terminate; it stops being worth solving. The checksum makes non-writer edits loud; the append-only history makes *all* edits visible as movement. Past that point you are buying attribution, not impossibility, and attribution is what the real failures — quiet 2 a.m. edits, not attackers — actually require.

**Your median and poisoning numbers come from generated data. Why should I trust them?**
Trust them for exactly what they are: logic tests. The healthy and truncated sizes are the magnitudes from dafili's published rig (2,753,525 and 81,068 bytes), and the PostgreSQL measurements — the 2.9% file, the TOC listing on a truncated dump, the exit-137 with \`-Z6\` — are his, credited, and linked. What our rig establishes is data-independent: a median of a poisoned window collapses at majority-bad regardless of whose bytes they are; a constant does not move regardless of the night; a checksum-plus-history kit behaves as designed across six scenarios. Where a claim needed PostgreSQL and we could not run PostgreSQL, the post says so rather than borrowing his numbers silently.

**Does this replace the ladder and the drill from the earlier posts?**
No — it guards them. The ladder (exists, intact, readable, restored) still defines the checking; the fingerprint still defines what "correct" means for the drill. This post is about the layer underneath both: where the standards those checks compare against come from, and who — or what — is allowed to move them.

## Summary

Three posts ago, this series started with a backup that exited 0 for three weeks and wrote nothing. The ladder taught it to check. The fingerprint taught the checks what "correct" means. Dafili's answers in the threads since then taught the whole stack where its standards are allowed to live: **declared where they must not move** (the floor in the script, the fingerprint in its vault, the gauge's threshold), **derived only where derivation is watched** (the median in monitoring, failing as a missing metric when it dies). A check that grades its own homework will eventually pass a failing student and call it consistency. Declare the standard by hand, keep it where the system can't rewrite it, append the changes where everyone can see them — and let the system argue with the declaration, out loud, every night.

Credit where it is due, and it is considerable: the placement doctrine, the per-database floor, the mirror line, the version-skew analysis, and the append-only answer to the checksum recursion all come from **dafili**, across the comment threads under ["My Backup Exited 0 for Three Weeks and Nothing Paged Me"](https://dev.to/dafili/my-backup-exited-0-for-three-weeks-and-nothing-paged-me-5ce6) and ["Three checks that look like they passed but validated nothing"](https://dev.to/dafili/three-checks-that-look-like-they-passed-but-validated-nothing-ejd) — the second of which also holds his original PostgreSQL measurements. The restore-drills post ended by promising that its open question would get an update when he answered; this post is that update, and the answer was better than the question. The rig described here was built to his specifications and tested before a word was published — which is, he would presumably note, the least a series about verification can do. The threads remain open. They have improved this series three times now.
  `,
  featuredImage: "/images/blog/aws-cost-optimization-15-tactics-saved-50k-month/hero.jpg",
  category: "DevOps",
  tags: ["Backup", "Monitoring", "DevOps", "Tutorial"],
  author: "DevOps Enginer",
  publishDate: "2026-11-03",
  lastModified: "2026-11-03",
  readTime: "27 min read",
  seo: {
    title: "Declared, Not Derived: Backup Checks That Can't Grade Their Own Homework",
    description: "A backup check that derives its standard from the backup itself agrees with the system exactly when the system is wrong. The tested fix: a human-declared floor per database inside the script, the rolling median in monitoring where its death is a missing metric, and a restore fingerprint guarded by a checksum and an append-only history.",
    keywords: "backup monitoring, declared vs derived, backup size check, restore fingerprint, backup verification, median check, disaster recovery 2026"
  }
};
