'use client';

import { useState, useRef } from 'react';

// ─── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ pct }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color =
    pct >= 70 ? '#22c55e' :
    pct >= 45 ? '#f59e0b' :
               '#ef4444';

  return (
    <svg width="56" height="56" className="flex-shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="bold" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── Pill chip ────────────────────────────────────────────────────────────────
function Chip({ label, color = 'violet' }) {
  const palettes = {
    green:  'bg-green-500/20  text-green-300  border-green-500/30',
    red:    'bg-red-500/20    text-red-300    border-red-500/30',
    amber:  'bg-amber-500/20  text-amber-300  border-amber-500/30',
    violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    sky:    'bg-sky-500/20    text-sky-300    border-sky-500/30',
    gray:   'bg-gray-500/20   text-gray-300   border-gray-500/30',
  };
  return (
    <span className={`inline-block border text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${palettes[color] ?? palettes.gray}`}>
      {label}
    </span>
  );
}

// ─── Job card ─────────────────────────────────────────────────────────────────
function JobCard({ job, rank }) {
  const [open, setOpen] = useState(false);

  const scoreColor =
    job.matchPercent >= 70 ? 'text-green-400' :
    job.matchPercent >= 45 ? 'text-amber-400' :
                             'text-red-400';

  return (
    <div className="border border-gold/10 rounded-xl bg-charcoal/40 hover:border-gold/30 transition-all overflow-hidden">
      {/* Main row */}
      <button
        className="w-full text-left p-0"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="flex items-start gap-4 p-4 sm:p-5">
          {/* Rank */}
          <div className="flex-shrink-0 w-7 text-center text-warm-white/30 text-sm font-bold pt-1">
            #{rank}
          </div>

          {/* Score ring */}
          <ScoreRing pct={job.matchPercent} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className="font-bold text-warm-white text-base leading-tight block">{job.title}</span>
                <span className="text-warm-white/60 text-sm">{job.company}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {job.eligibleFromJapan
                  ? <Chip label="🇯🇵 Japan OK" color="green" />
                  : <Chip label="⚠ Geo restricted" color="red" />}
                {job.visaSupport === true  && <Chip label="Visa ✓" color="green" />}
                {job.visaSupport === false && <Chip label="No Visa" color="red" />}
                <Chip label={`${job.locationPolicy}`} color="sky" />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-white/50">
              <span>📍 {job.locationText}</span>
              {job.salaryText && <span>💰 {job.salaryText}</span>}
              {job.seniority   && <span>👤 {job.seniority}</span>}
              {job.timezoneConstraint && <span>🕐 {job.timezoneConstraint}</span>}
            </div>

            {/* Matched skills quick row */}
            {job.matchedSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {job.matchedSkills.map(s => (
                  <span key={s} className="text-[10px] bg-green-500/15 border border-green-500/25 text-green-300 px-1.5 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Source + chevron */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2 ml-2">
            <span className="text-[10px] text-warm-white/40 whitespace-nowrap">{job.source}</span>
            <svg
              className={`w-4 h-4 text-warm-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-gold/10 p-4 sm:p-5 space-y-4 bg-rich-black/40">
          {/* Score breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-gold mb-2 uppercase tracking-wide">Score Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(job.scoringBreakdown)
                .filter(([k]) => k !== 'seniority_fit')
                .map(([k, v]) => (
                  <div key={k} className="bg-charcoal/60 rounded-lg px-3 py-2 text-center">
                    <div className="text-warm-white font-bold text-sm">{typeof v === 'number' ? v : '—'}</div>
                    <div className="text-warm-white/40 text-[10px] mt-0.5">{k.replace(/_/g, ' ')}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Missing skills */}
          {job.missingMustHave.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-red-400 mb-1.5 uppercase tracking-wide">Missing Must-Have Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.missingMustHave.map(s => (
                  <span key={s} className="text-xs bg-red-500/15 border border-red-500/25 text-red-300 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Geo warning */}
          {job.geoFlagReason && (
            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              ⚠ {job.geoFlagReason}
            </p>
          )}

          {/* Resume tweaks */}
          <div>
            <h4 className="text-xs font-semibold text-violet-300 mb-1.5 uppercase tracking-wide">Resume Tweaks for This Role</h4>
            <ul className="space-y-1">
              {job.resumeTweaks.map((t, i) => (
                <li key={i} className="text-xs text-warm-white/70 flex gap-2">
                  <span className="text-violet-400 flex-shrink-0">▸</span>{t}
                </li>
              ))}
            </ul>
          </div>

          {/* Apply link */}
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-md hover:shadow-violet-500/30"
          >
            🔗 Apply on {job.source}
          </a>
        </div>
      )}
    </div>
  );
}


// ─── Candidate card ───────────────────────────────────────────────────────────
function CandidateCard({ candidate, resultCount, runId }) {
  return (
    <div className="bg-gradient-to-br from-violet-900/20 to-charcoal/40 border border-violet-500/30 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-violet-300 text-lg">{candidate.name ?? 'Parsed Candidate'}</h3>
          <p className="text-warm-white/50 text-xs">Run ID: {runId}</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <div className="text-gold font-bold text-xl">{candidate.yearsTotal}</div>
            <div className="text-warm-white/50 text-[10px]">Years</div>
          </div>
          <div className="text-center capitalize">
            <div className="text-gold font-bold text-xl">{candidate.seniority}</div>
            <div className="text-warm-white/50 text-[10px]">Level</div>
          </div>
          <div className="text-center">
            <div className="text-gold font-bold text-xl">{resultCount}</div>
            <div className="text-warm-white/50 text-[10px]">Jobs Scored</div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-warm-white/40 font-semibold">Role Families</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {candidate.roleFamilies.map(r => <Chip key={r} label={r} color="violet" />)}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-warm-white/40 font-semibold">Detected Skills ({candidate.skills.length})</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {candidate.skills.map(s => (
              <span key={s} className="text-[10px] bg-sky-500/15 border border-sky-500/25 text-sky-300 px-1.5 py-0.5 rounded-full">{s}</span>
            ))}
            {candidate.skills.length === 0 && <span className="text-warm-white/30 text-xs">None detected — make sure your resume lists tools explicitly</span>}
          </div>
        </div>
        {candidate.languages.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-warm-white/40 font-semibold">Languages</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {candidate.languages.map(l => <Chip key={l} label={l} color="amber" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Filter bar ───────────────────────────────────────────────────────────────
function FilterBar({ filter, setFilter, total, eligible }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <span className="text-warm-white/50 text-sm">{total} jobs ranked</span>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {[
          { label: 'All', val: 'all'     },
          { label: `🇯🇵 Japan Eligible (${eligible})`, val: 'eligible' },
          { label: '🌍 Remote',  val: 'remote'   },
          { label: '🔥 Top 50%+',    val: 'top'      },
        ].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              filter === val
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'border-gold/20 text-warm-white/60 hover:border-gold/40 hover:text-warm-white'
            }`}
          >
            {label}
          </button>
        ))}
        <select
          className="text-xs bg-charcoal/60 border border-gold/20 text-warm-white/70 rounded-lg px-2 py-1.5 focus:outline-none focus:border-gold/50"
          onChange={e => setFilter(e.target.value)}
          value={['all','eligible','remote','top'].includes(filter) ? filter : 'sort'}
        >
          <option value="sort" disabled>Sort by…</option>
          <option value="all">Best Match ↓</option>
          <option value="salary">Salary</option>
        </select>
      </div>
    </div>
  );
}


// ─── Main exported component ──────────────────────────────────────────────────
export default function JobSearchClient() {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  async function submitFile(file) {
    if (!file) return;
    setState('loading');
    setErrorMsg('');
    setData(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/job-match', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unknown error');
      setData(json);
      setState('done');
    } catch (e) {
      setErrorMsg(e.message);
      setState('error');
    }
  }

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    submitFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  // Filter + sort
  const eligible = data?.results?.filter(r => r.eligibleFromJapan).length ?? 0;
  const filtered = (data?.results ?? []).filter(r => {
    if (filter === 'eligible') return r.eligibleFromJapan;
    if (filter === 'remote')   return r.locationPolicy === 'remote';
    if (filter === 'top')      return r.matchPercent >= 50;
    return true;
  });

  return (
    <section className="py-16 bg-gradient-to-b from-rich-black via-charcoal/10 to-rich-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span>⚡</span>
            <span>Live Resume Matcher for free — No money required</span>
            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">FREE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">Smart Job Match</span>
            <span className="text-warm-white"> Engine</span>
          </h2>
          <p className="text-warm-white/60 text-lg max-w-2xl mx-auto">
            Upload your resume (TXT or MD). The AI engine parses your skills, scores every
            job, and shows your best matches — ranked and ready to apply.
          </p>
        </div>

        {/* ── Upload zone ── */}
        {(state === 'idle' || state === 'error') && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all mb-6
              ${dragOver
                ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
                : 'border-gold/30 bg-charcoal/30 hover:border-gold/60 hover:bg-charcoal/50'}`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="text-5xl mb-3">📄</div>
            <p className="text-warm-white font-semibold text-lg">
              Drop your resume here, or <span className="text-violet-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-warm-white/40 text-sm mt-1">
              Supports TXT, MD &nbsp;·&nbsp; PDF / DOCX with optional server packages
            </p>
            {state === 'error' && (
              <p className="mt-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-sm font-medium">
                ❌ {errorMsg}
              </p>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
            </div>
            <p className="text-violet-300 font-semibold text-lg animate-pulse">Parsing resume & scoring jobs…</p>
            <p className="text-warm-white/40 text-sm">Rule-based engine · no AI API cost · blazing fast</p>
          </div>
        )}

        {/* ── Results ── */}
        {state === 'done' && data && (
          <div className="space-y-6">
            {/* Candidate card */}
            <CandidateCard candidate={data.candidate} resultCount={data.results.length} runId={data.run_id} />

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Jobs Ranked',      value: data.results.length,                      icon: '📋' },
                { label: 'Japan Eligible',   value: eligible,                                  icon: '🇯🇵' },
                { label: 'Top Match',        value: `${data.results[0]?.matchPercent ?? 0}%`,  icon: '🎯' },
                { label: 'Visa Sponsors',    value: data.results.filter(r => r.visaSupport).length, icon: '✈️' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-charcoal/50 border border-gold/10 rounded-xl p-4 text-center">
                  <div className="text-2xl">{icon}</div>
                  <div className="text-gold font-bold text-2xl mt-1">{value}</div>
                  <div className="text-warm-white/40 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <FilterBar filter={filter} setFilter={setFilter} total={data.results.length} eligible={eligible} />

            {/* Job cards */}
            <div className="space-y-3">
              {filtered.map((job, i) => (
                <JobCard key={`${job.company}-${job.title}`} job={job} rank={i + 1} />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-warm-white/40 py-10">No jobs match this filter.</p>
              )}
            </div>

            {/* Run again */}
            <div className="text-center pt-4">
              <button
                onClick={() => { setState('idle'); setData(null); setFilter('all'); }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/30"
              >
                🔄 Upload Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
