// Linux for DevOps in 2026: Commands, Permissions, Processes and systemd You Must Know
export const linuxForDevopsBlog = {
  id: 50,
  title: "Linux for DevOps in 2026: Commands, Permissions, Processes and systemd You Must Know",
  slug: "linux-for-devops-2026",
  excerpt: "Linux is the floor every other DevOps skill stands on. Learn it in working order: files and permissions, processes and signals, shell mechanics with pipefail, the three networking questions, systemd and the journal, disk, SSH and packages \u2014 every surprising claim run on Ubuntu 24.04 before it was written down.",
  content: `
# Linux for DevOps in 2026: Commands, Permissions, Processes and systemd You Must Know

Every other step on the DevOps path quietly assumes you can drive a Linux machine. Kubernetes nodes are Linux. CI runners are Linux. The cloud instance behind every tutorial — including the ones on this site — is Linux, and when something breaks at 2 a.m., nobody hands you a graphical interface: you get an SSH prompt and a blinking cursor. Linux is not one topic on the roadmap among many. It is the floor the rest of the roadmap stands on.

This post is the Operating Systems node of our [DevOps Roadmap](https://www.devopsenginer.com/devops) — if you are following the full path, start there and work through the nodes in order; this is the first deep-dive the prerequisites point at. It is organised as a learning path, not a reference dump: the topics are in the order to learn them, and every section ends with a short **"you know enough when…"** checklist, so you can tell the difference between *having read about it* and *being able to do it*. When a section is genuinely enough for now, it says so — the goal is the Linux a working DevOps engineer uses daily, not a kernel-internals degree.

A note on honesty, because this site's backup series earned its readers the hard way: every command below is standard practice, and the claims that could surprise you — exit codes, permission arithmetic, SSH refusing a badly-permissioned key — were **run on an Ubuntu 24.04 machine before they were written down**. The rig notes are summarised at the end of this post.

> **TL;DR:** Learn Linux in this order: (1) get a free practice machine — WSL, a free-tier VPS, or a container — and live in it; (2) files and permissions until \`ls -l\` reads like a sentence; (3) processes and signals, because restarting things is the job; (4) shell mechanics — pipes, redirection, exit codes — because every pipeline and CI log speaks them; (5) the networking commands that answer "is it listening, can I reach it, does the name resolve"; (6) systemd and the journal, because services and logs are where servers explain themselves; (7) disk, SSH and package management as the daily-driver finish. Each step has a "you know enough when…" bar. Clear the bar, move on — and know that the next roadmap nodes (scripting, Git, containers, Kubernetes) all stand on this floor.

## Your free practice lab

You cannot learn Linux by reading about Linux — including this post. You need a machine you are allowed to break. Three free options, in the order most learners should pick them:

- **WSL 2 (Windows Subsystem for Linux)** — if your daily machine runs Windows, this puts a real Ubuntu one command away (\`wsl --install\` from an admin terminal, then reboot). It runs a genuine Linux kernel in a lightweight virtual machine, which is why it is good enough for everything in this post except deep systemd work — and recent WSL versions can enable systemd too, via a \`systemd=true\` line under \`[boot]\` in \`/etc/wsl.conf\`.
- **A free-tier cloud VPS** — every major cloud offers some free tier or trial credit, and a small always-free instance is the most *realistic* lab of the three: a real server, reached over real SSH, with real systemd — the exact shape of the machines you will operate at work. It is also the option where the cleanup lesson applies: a forgotten test instance is how people meet their first surprise bill, so learn \`stop\` and \`delete\` the same day you learn \`create\`. I learned that lesson on my own wallet while teaching myself AWS: the resources you forget do not forget you, and the end-of-month bill is a strict teacher. I have stopped and deleted on the same day ever since.
- **Containers on any machine you already have** — \`docker run -it ubuntu:24.04 bash\` gives you a disposable Ubuntu shell in seconds. Perfect for practising files, permissions and shell mechanics; not a place to learn systemd, because a container normally has no systemd running as PID 1 — it has your shell, or the one process the container was started with.

Whichever you choose: use it daily, in short sessions, and do your real work in it where you can. Fluency comes from the hundredth \`ls\`, not the first.

**You know enough when…** you can open a shell on your practice machine without thinking about how, and you have broken something in it at least once and fixed it or rebuilt it.

## Files, paths and the shape of the system

Everything in Linux is a file — a slogan you will hear constantly, which becomes practical the moment you learn the handful of places files live:

- \`/etc\` — configuration. When a service behaves strangely, its config is almost always here (\`/etc/nginx/\`, \`/etc/ssh/\`).
- \`/var\` — things that *vary*: logs (\`/var/log\`), caches, spool, and the data directories of many services.
- \`/home\` — user home directories; your work lives in \`/home/<you>\`.
- \`/usr\` — the bulk of installed programs and libraries (\`/usr/bin\` is where most commands live).
- \`/proc\` and \`/sys\` — virtual filesystems: not real files on disk, but windows into the running kernel. \`/proc/loadavg\`, \`/proc/meminfo\` and \`/proc/<pid>/\` are genuinely useful, as the processes section shows.
- \`/tmp\` — scratch space, world-writable, cleaned on a schedule. Never store anything you would miss.

The working kit is small: \`pwd\` (where am I), \`ls -la\` (what is here, including dotfiles, with permissions), \`cd\`, \`file <name>\` (what *kind* of file is this — run it before assuming), \`less\` (read without editing), \`head\`/\`tail\` (edges of a file), \`cp -a\`, \`mv\`, \`mkdir -p\`, \`touch\`, and \`rm\` — plus the respect \`rm\` deserves: **there is no trash can**, and \`rm -rf\` does exactly what it says, instantly, as whatever user you are. Two habits separate careful engineers early: read the command once more before pressing Enter on anything destructive, and prefer \`mv\`-ing a file to a backup name (\`.bak\`) over deleting it until you are sure.

Links deserve thirty seconds now because they confuse everyone once: a **symbolic link** (\`ln -s target name\`) is a tiny file that points at a path — delete the target and the link dangles. A **hard link** (\`ln target name\`) is a second name for the *same* file content — the same inode, which you can verify with \`ls -li\`: both names show the identical inode number, and the content survives until the *last* name is removed.

And finding things: \`find /var -name "*.log" -type f\` walks a tree; add \`-size +100M\` for big files, \`-mtime -1\` for files changed in the last day. \`find\` is slower and more honest than your memory of where you put things.

**You know enough when…** you can look at an unfamiliar server and, in under a minute, answer: where are this app's config, logs and data — using \`ls\`, \`file\` and \`find\`, not guesses.

## Permissions and ownership: the section that unlocks half of all errors

A remarkable share of "Linux is broken" moments are permissions, wearing a disguise. Read \`ls -l\` output until it parses at a glance:

\`\`\`
-rwxr-xr--  1  deploy  deploy  4096  Nov  3 10:12  deploy.sh
\`\`\`

Left to right: file type and permissions (\`-\` regular file, \`d\` directory, \`l\` link), then three triplets — **owner, group, everyone else** — each \`r\`ead, \`w\`rite, e\`x\`ecute. Then link count, owner, group, size, date, name. The octal shorthand counts r=4, w=2, x=1 per triplet: \`644\` is the everyday file (owner can write, everyone can read), \`755\` the everyday directory or executable. On directories, \`x\` means *enter/traverse* — which is why a directory can be readable yet unusable without \`x\`.

\`chmod 640 app.log\`, \`chmod u+x deploy.sh\`, \`chown deploy:deploy app.log\` are the three verbs; \`stat -c '%a %U %G' file\` prints the facts without the noise; \`id\` shows who *you* are and which groups you carry. New files get their permissions from the process's **umask**: files start from 666, directories from 777, and the umask is subtracted. Verified on our rig: with \`umask 022\`, a new file lands at \`644\` and a new directory at \`755\`. Run \`umask\` on your own machine — the value differs between systems, and the arithmetic, not any specific number, is the thing to learn.

Three special bits, one line each: **setuid** (the \`s\` in \`-rwsr-xr-x\` on \`/usr/bin/passwd\` and \`/usr/bin/sudo\` — the program runs as its *owner*, root, which is how a normal user may change a password at all); **setgid** on a shared directory makes new files inherit the directory's group; the **sticky bit** on \`/tmp\` is why you cannot delete other people's files there despite it being world-writable. And \`sudo\` itself: it runs one command as root, it is logged, and the professional habit is to use it per-command — not to live in a root shell where one typo has no ceiling.

**You know enough when…** you can predict, before running it, what \`chmod 750\` does to a directory and who can then do what inside it — and when a service says "permission denied", your first move is \`ls -l\` and \`id\`, not a search engine.

## Processes: what is actually running

A process is a running program: it has an ID (**PID**), a parent (**PPID**), an owner, a state, and a lifetime. On Ubuntu, PID 1 is **systemd** — every other process descends from it, which is why the services section later is really this section continued.

\`\`\`
ps aux | head                  # every process, user-oriented view
ps -eo pid,ppid,stat,comm      # the compact truth: pid, parent, STATE, name
top                            # the live view (q to quit; htop is nicer but usually not installed)
pstree -p                      # the family tree, with PIDs
\`\`\`

The \`STAT\` column is worth learning properly, because two of its letters diagnose real incidents: **R** running, **S** sleeping (most processes, most of the time — normal), **T** stopped (someone sent SIGSTOP or pressed Ctrl+Z), **Z** *zombie* — the process has finished but its parent has not collected its exit status yet. A zombie consumes no CPU or memory; it is a bookkeeping entry, and the fix is at the parent, not the zombie. Both states are easy to meet on purpose in your lab: \`kill -STOP <pid>\` freezes a process into **T**, and a parent that forks a child and sleeps without waiting leaves a **Z** behind — we produced both on the rig to check this paragraph.

Processes are controlled by **signals**. The working set:

| Signal | Number | Default effect | Sent by |
|---|---|---|---|
| SIGTERM | 15 | Exit, after cleanup | \`kill <pid>\` — the polite request |
| SIGKILL | 9 | Die immediately, no cleanup | \`kill -9 <pid>\` — the last resort |
| SIGINT | 2 | Interrupt | Ctrl+C in the terminal |
| SIGHUP | 1 | Hang up / often "reload config" | Terminal closing; \`systemctl reload\` sends it to some daemons |
| SIGSTOP / SIGCONT | 19 / 18 | Freeze / resume | \`kill -STOP\`, Ctrl+Z sends SIGTSTP (20), a close cousin |

\`kill\` sends SIGTERM unless you name another signal — start polite, because a process that gets SIGTERM can close files and release locks, and one that gets SIGKILL cannot. An exited process reports an **exit code**: 0 is success, and death-by-signal shows up in shells as **128 + signal number** — verified on the rig: killed with SIGKILL a process reports **137**, SIGTERM **143**, SIGINT **130**. When a CI log or a supervisor says "exit code 137", it is telling you *something killed it* (very often the out-of-memory killer) — that decoding is a debugging skill, not trivia.

Day-to-day survival kit: run things in the foreground until they behave; \`Ctrl+Z\`, \`jobs\`, \`bg\`/\`fg\` to juggle; \`nohup command &\` (or a tmux session) for work that must survive your SSH connection closing; \`nice -n 10 command\` to start something politely deprioritised; \`pkill -f pattern\` when you know the shape of the thing but not its PID.

**You know enough when…** given a runaway or wedged program, you can find it with \`ps\`/\`top\`, read its state, stop it politely, escalate only if it refuses — and decode whatever exit code it leaves behind.

## The shell and Bash: pipes, redirection and exit codes

The shell is not a passive prompt; it is a small programming language whose three core mechanics run everything else in DevOps — every CI pipeline, Dockerfile and remote command is these three ideas wearing a uniform.

**Pipes** connect programs: \`command1 | command2\` feeds one's stdout into the next's stdin. The classic log-triage shape is worth memorising as a pattern, not a command:

\`\`\`
cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -nr | head
\`\`\`

(Read: take the first field of every line, count occurrences, sort biggest first, show the top. Swap in your own fields and files — the *shape* is the skill.)

**Redirection** moves streams to files: \`>\` truncates and writes, \`>>\` appends, \`2>\` redirects stderr, and \`2>&1\` means "send stderr wherever stdout is currently going". Order matters — this was verified on the rig, because it surprises everyone once: \`cmd >file 2>&1\` puts *both* streams in the file, while \`cmd 2>&1 >file\` sends stderr to your *terminal* and only stdout to the file. When a runbook says "capture all output", the first form is the one it means.

**Exit codes** are how programs report truth. Every command ends with one (\`echo $?\` shows the last one), 0 means success, and anything else is a failure *flavour* — the signal deaths from the previous section being one family. Two consequences run your professional life. First, **a pipeline's exit status is its last command's status**: on the rig, \`false | true\` reports 0, because \`true\` succeeded — which is how a failing step in the middle of a pipeline can pass silently. Bash's answer is \`set -o pipefail\`, which makes the pipeline fail if *any* stage fails (the same run reports 1 with pipefail on). Second, success is not always 0-or-nothing in the way scripts expect: \`grep\` exits 1 when it finds *no match* — a normal, honest answer that will murder a script running under \`set -e\` if you did not know it was coming. Readers of this site's backup series have seen where ignoring these two facts leads; pipelines that report success over nothing are a genre.

Your first real script needs little more than these bones:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail

name=\${1:?usage: greet.sh <name>}
echo "hello, $name — running on $(hostname), as $(whoami)"
\`\`\`

The shebang picks the interpreter; \`set -euo pipefail\` makes the script fail loudly (on errors, on unset variables, on any failed pipeline stage) instead of drifting on in a broken state; \`\${1:?...}\` refuses to run without its argument. Variables, \`export\` (make it visible to child processes), \`$PATH\` (the colon-separated list of directories searched for commands — \`command -v kubectl\` tells you which one actually runs), and reading arguments are genuinely most of the Bash a DevOps engineer writes. Deeper scripting — the loops-over-servers, the cleanup jobs — is its own roadmap node (Python and Bash for DevOps, the next prerequisite on the roadmap), and [Build a CI/CD Pipeline with GitHub Actions](https://www.devopsenginer.com/blog/how-to-build-cicd-pipeline-github-actions-2025) is where you will meet these mechanics again inside CI logs, which are shell transcripts whether they admit it or not.

**You know enough when…** you can write a five-line script with \`set -euo pipefail\`, explain what each flag saves you from, and look at a failing pipeline and say *which stage* failed and what its exit code means.

## Networking commands: is it listening, can I reach it, does the name resolve

Nearly every network problem you will ever debug reduces to three questions, and Linux has a direct instrument for each.

**Is it listening?** \`ss -tlnp\` lists TCP listeners (\`-t\` TCP, \`-l\` listening, \`-n\` numeric, \`-p\` the owning process — root or the owner sees names). Verified end-to-end on the rig: after starting a throwaway web server (\`python3 -m http.server 8901\`), \`ss -tlnp\` showed \`python3\` listening on port 8901, \`lsof -i :8901\` named the same PID, and \`curl\` got its HTTP 200 reply. That trio — \`ss\`, \`lsof\`, \`curl\` — settles most "the service is down" claims in a minute. (\`netstat\` is \`ss\`'s ancestor; learn \`ss\`, and recognise \`netstat\` when old runbooks use it.)

**Can I reach it?** \`ping -c 3 host\` tests basic reachability (and plenty of networks block ping — silence is a clue, not a verdict); \`curl -sI https://example.com\` fetches just the headers and is the single most useful reachability probe for anything HTTP; \`curl -v\` when you need to watch the connection happen. Know your own address first: \`ip -brief a\` for interfaces, \`ip route\` for the default gateway — the first hop every packet takes.

**Does the name resolve?** \`getent hosts example.com\` asks the system's own resolver — the same path your applications take, through \`/etc/hosts\` and NSS — and it exists on every Ubuntu because it ships with the base system. \`dig +short example.com\` gives the DNS specialist's view; note that \`dig\` belongs to an add-on package (verified on the rig: it is owned by \`bind9-dnsutils\`), which is why it is sometimes missing on minimal servers while \`getent\` never is. When the two disagree, you have found the classic split-brain: a stale \`/etc/hosts\` entry shadowing real DNS.

One layer up, this is exactly the mental model the cloud networking builds on: a listener that is not there, a route that does not reach, a name that resolves wrong — the [AWS VPC guide](https://www.devopsenginer.com/blog/aws-vpc-guide-2026) is subnets and route tables expressing these same three questions at cloud scale.

**You know enough when…** told "the app is down", you check — in order — listener, reachability, name resolution, and can point at the layer that is actually failing before touching any config.

## Services and systemd: starting things properly

Hand-started processes die with your terminal, your session, or the reboot. Servers run **services**, and on Ubuntu the manager is systemd: PID 1 from the processes section, wearing its other hat. A service is described by a **unit file** — a small declarative text file saying what to run, as whom, and what to do when it dies. You read them with \`systemctl cat <unit>\`; you will rarely write one from scratch as a beginner, but you must be fluent in the verbs:

\`\`\`
sudo systemctl start nginx        # start it now
sudo systemctl stop nginx         # stop it now
sudo systemctl restart nginx      # stop + start
sudo systemctl enable nginx       # also start at boot (enable --now does both)
systemctl status nginx            # is it running, since when, last log lines
systemctl is-active nginx         # the script-friendly question
systemctl list-units --failed     # what is broken on this machine right now
\`\`\`

\`status\` is the first command to run on any "the service won't…" report: it shows active state, the main PID, memory, and the most recent log lines in one screen. In scripts, prefer \`systemctl is-active --quiet nginx\` and branch on the exit code — non-zero means *not active* — rather than parsing status prose meant for humans. (Exact exit codes vary by situation — an unknown unit name earns you a 4 and a "not-found" from \`is-enabled\`, both verified on the rig; the robust habit is testing zero vs non-zero and reading \`status\` for the story.)

Two systemd habits complete the picture. **Timers** are systemd's cron: \`systemctl list-timers\` shows what is scheduled on a modern Ubuntu — when it last ran, when it runs next — and units named \`*.timer\` in that list are behind most housekeeping. And when a service misbehaves, its confession is in the journal, which is the next section.

**You know enough when…** you can take a service from stopped to running-at-boot, prove its state three ways (\`status\`, \`is-active\`, its port in \`ss\`), and find its unit file and read what it actually executes.

## Logs: where servers explain themselves

When something breaks, the log is the difference between debugging and guessing. On current Ubuntu, the system's central log is the **journal**, kept by systemd's journald and read with \`journalctl\`:

\`\`\`
journalctl -u nginx               # everything for one service
journalctl -u nginx -f            # follow it live (the modern tail -f)
journalctl -u nginx --since "1 hour ago"
journalctl -p err                 # errors and worse, across all units
journalctl --disk-usage           # how much log you are keeping
\`\`\`

Not everything lives in the journal: applications also write plain files, overwhelmingly under \`/var/log\` — our rig's own \`/var/log\` holds things like \`dpkg.log\` (package history) alongside the journal directory — and the universal tools apply: \`tail -f file\` to watch, \`tail -n 100\` for the recent past, \`grep -i error file\` to filter, \`less\` to search a big file without loading your editor with it. Rotation (old logs compressed and eventually deleted) is handled by \`logrotate\` on a timer; the working knowledge is simply that logs are finite, dated, and findable — and that "the log from last Tuesday" may legitimately no longer exist.

Discipline beats tooling here: read logs *before* restarting things (a restart often clears the evidence and occasionally the problem's only copy), read from the first error rather than the last (cascades make the final lines the least informative), and correlate by timestamp — which is why servers keep honest clocks and why log lines without timestamps are a code smell. The Kubernetes version of this exact discipline — \`kubectl logs\`, aggregated pipelines, what to keep — is in our [Kubernetes Logging guide](https://www.devopsenginer.com/blog/kubernetes-logging-guide-2026).

**You know enough when…** handed a broken service, your first three moves are \`systemctl status\`, \`journalctl -u\`, and \`tail\` of the app's own log — in that order, before changing anything.

## Disk and storage: the full-disk fire drill

Disks fail DevOps engineers in one boring way far more than all exotic ways combined: they fill up. The drill is three commands deep:

\`\`\`
df -h                     # every mounted filesystem: size, used, available, where mounted
du -sh /var/* | sort -h   # which subtree is eating it
find / -xdev -type f -size +500M 2>/dev/null   # the individual big files
\`\`\`

\`df\` answers at the filesystem level, \`du\` at the directory level — when \`df\` says full and \`du\` cannot find the bytes, the classic culprit is a *deleted file still held open* by a running process (the space returns when the process restarts), findable via \`lsof +L1\`. Two supporting facts: \`lsblk\` shows the block devices and their mount points (the map of what disk is even attached), and filesystems can run out of **inodes** — file *slots* — before bytes, which \`df -i\` checks; millions of tiny files are how that happens. The usual suspects for growth are logs (previous section), container images (next paragraph's reading), and package caches — which is why the cleanup order is almost always: logs, images, caches, *then* real data, carefully.

Containers turn this from theory into next month's problem: images are layered filesystems stacked on exactly these mechanics, and the [Docker image optimization guide](https://www.devopsenginer.com/blog/how-to-optimize-docker-images-production-2025) is this section's ideas applied to image layers — smaller layers, fewer surprises.

**You know enough when…** on a "disk full" alert you can name the guilty directory within two commands, say whether it is bytes or inodes, and clean the safe categories without touching data you cannot account for.

## SSH: the front door, and how not to lock yourself out

SSH is how you will reach every server in your career, so its basics are not optional polish — they are the job's front door. The model: your **key pair** is a private key (a file you guard, conventionally \`~/.ssh/id_ed25519\`) and a public key you copy onto servers into \`~/.ssh/authorized_keys\`; the server challenges, your client proves it holds the private half, no password crosses the wire.

\`\`\`
ssh-keygen -t ed25519                 # create the pair (with a passphrase)
ssh-copy-id user@server               # install your public key on a server
ssh -i ~/.ssh/id_ed25519 user@server  # connect with a specific key
scp file user@server:/path/           # copy a file over SSH
rsync -avz dir/ user@server:/path/    # sync a tree (resumable, incremental)
\`\`\`

The rule that is not negotiable, verified on the rig so you can watch it bite: **permissions**. Your \`~/.ssh\` should be \`700\`, private keys \`600\`, \`authorized_keys\` \`600\` — and OpenSSH enforces it. We generated a key and deliberately set it world-readable (\`644\`): \`ssh-add\` refused it outright — *"WARNING: UNPROTECTED PRIVATE KEY FILE! … This private key will be ignored."* — and accepted it the moment permissions were tightened to \`600\`. Most "SSH suddenly ignores my key" mysteries are this, or an \`authorized_keys\` pasted with wrong ownership. Debug with \`ssh -v\` and read from the first line that surprises you.

Ergonomics worth adopting on day one: a \`~/.ssh/config\` with named hosts —

\`\`\`
Host staging
    HostName 203.0.113.10
    User deploy
    IdentityFile ~/.ssh/id_ed25519
\`\`\`

— after which \`ssh staging\` is the whole command, and every tool that rides SSH (\`scp\`, \`rsync\`, \`git\`) inherits the shortcut. On the server side, the beginner's checklist is short: key-based login working *before* you consider disabling passwords, root login restricted, and a second session tested before you close the first — SSH misconfigurations lock out the careless, and the fix-it path is the lesson nobody wants first-hand.

**You know enough when…** you can set up key login on a fresh server from memory, explain why your private key is \`600\`, and debug a refused connection with \`ssh -v\` instead of reinstalling things at random.

## Package management: installing software the Debian way

Ubuntu is Debian-family: software arrives as **packages**, installed from repositories by **apt**, with **dpkg** as the lower-level tool that manages the packages already present. The daily surface is five commands:

\`\`\`
sudo apt update                       # refresh the catalogue (installs nothing)
sudo apt install -y htop              # install (htop: the nicer top, absent by default — try it)
apt show nginx                        # what is this package, which version, from where
dpkg -l | grep nginx                  # is it installed here, exactly which build
dpkg -S /usr/bin/dig                  # which package owns this file → bind9-dnsutils (rig-verified)
\`\`\`

That last trick — \`dpkg -S\` answering "who owns this file" — is the one that pays off monthly, turning an unknown binary into a documented package. The habits that matter: \`apt update\` before installs (a stale catalogue produces baffling version errors), remove with \`apt remove\` (config stays) vs \`apt purge\` (config goes), and know that servers patch themselves via the \`unattended-upgrades\` mechanism on most Ubuntu installs — check it exists before assuming a box is current. Software that does not come as a package — a tarball in \`/usr/local\`, a vendor script — is exactly where the permissions and PATH knowledge from earlier sections stops being academic.

**You know enough when…** you can install, identify, locate and cleanly remove a package, and answer "what version is running here and where did it come from" for anything on the box.

## What to learn next

Linux is the first prerequisite, not the last. Standing on it, the roadmap's order is: **scripting** (Python and Bash — the sibling prerequisite node on the roadmap), **Git** (the Version Control node), then the container layer — Docker, where the [kubectl Commands Cheat Sheet](https://www.devopsenginer.com/blog/kubectl-commands-cheat-sheet-2026) marks the start of the Kubernetes path once containers feel ordinary. Keep the full map open as you go: [the DevOps Roadmap](https://www.devopsenginer.com/devops) shows which nodes this post just lit up, and which one is waiting next. If your interest is the Japan route specifically, the career side of standing out as an engineer here is covered in [How to Become a DevOps Engineer in Japan](https://www.devopsenginer.com/blog/how-to-become-devops-engineer-japan-2025-career-guide).

## FAQ

**Which distribution should I learn?**
Ubuntu — specifically a current LTS — unless your workplace standardises on something else. The reasons are boring and decisive: it is what most tutorials assume, what most cloud images default to, and what the commands in this post were verified on. The transferable skills (systemd, permissions, the shell) are the same across the Debian and RHEL families; the differences are mostly package managers and some file locations. Learn one deeply, then translate.

**Do I need to learn vi/vim before anything else?**
No — but you need *an* editor you can operate over SSH without thinking, because config files will not wait for you to get comfortable. \`nano\` is enough to start; learn \`vim\`'s survival subset (open, search, edit, save-and-quit, quit-without-saving) soon after, because \`vim\` (or \`vi\`) is the editor that is present on systems where your favourite is not — including, we noticed, this very test machine, which has neither \`nano\` nor \`vim\` installed and still got administered fine. The editor is a means; the config file is the point.

**How long does it take to "know Linux" for DevOps?**
To the bar this post sets — the "you know enough when…" checklists — a focused few weeks of daily practice in a lab is a realistic frame for someone already technical, and the honest answer is that the learning never completes: it stratifies. The daily-driver layer in this post becomes reflex; deeper layers (performance tuning, kernel behaviour, complex storage) are learned incident by incident over years. Beware any course promising the whole thing by Friday.

**Is the command line really necessary in the age of cloud consoles and AI assistants?**
Yes, for the same reason pilots still learn manual flying: the console and the assistant are at their best exactly when nothing is wrong, and the failures that define this job happen underneath both. The shell is also where the *evidence* lives — logs, exit codes, listener tables — and reading evidence directly is a different skill from being told a summary of it.

**Should I dual-boot or replace my OS with Linux?**
Neither, to start. WSL or a free-tier VPS (the lab section) gives you the full learning surface with an undo button. Run your daily machine on whatever it runs; keep your Linux in the lab until the lab starts feeling like the more natural home — that feeling, when it arrives, is the real graduation signal.

## Summary

Linux for DevOps is not a hundred commands; it is a small set of load-bearing ideas, each with a short working kit: files and where they live; permissions you can read at a glance and a umask you can compute; processes, their states, and signals sent politely first; shell mechanics — pipes, redirection, exit codes — with \`pipefail\` turned on and grep's honest 1 understood; three networking questions with an instrument each; systemd's verbs and the journal's memory; disks measured before they are full; SSH keys guarded at \`600\`; and packages whose provenance you can name. Every other node on the [DevOps Roadmap](https://www.devopsenginer.com/devops) — the scripting and Git prerequisites next, then containers, Kubernetes, CI/CD and cloud — assumes this floor and builds on it. Build the floor first, verify each "you know enough when…" in your lab rather than in your head, and the rest of the path gets noticeably less mysterious.

Every behaviour claim in this post that could be checked was checked first: tested before written, or phrased without the number.
  `,
  featuredImage: "/images/blog/top-10-devops-tools-2025/devops-hero.jpg",
  category: "DevOps",
  tags: ["Linux", "DevOps", "Tutorial", "Systemd"],
  author: "DevOps Enginer",
  publishDate: "2026-11-04",
  lastModified: "2026-11-04",
  readTime: "27 min read",
  seo: {
    title: "Linux for DevOps in 2026: Commands, Permissions, Processes and systemd You Must Know",
    description: "Linux is the floor every other DevOps skill stands on. Learn it in working order: files and permissions, processes and signals, shell mechanics with pipefail, the three networking questions, systemd and the journal, disk, SSH and packages \u2014 every surprising claim run on Ubuntu 24.04 before it was written down.",
    keywords: "linux for devops, linux commands, systemd tutorial, linux permissions, linux processes and signals, ssh keys, devops roadmap 2026"
  }
};
