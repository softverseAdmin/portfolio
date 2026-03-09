/**
 * Job Match API Route
 * -------------------
 * POST /api/job-match  — accepts a resume file (TXT / MD / PDF* / DOCX*)
 *   Returns: { run_id, created_at, candidate, results }
 *
 * PDF support  → install: npm install pdf-parse
 * DOCX support → install: npm install mammoth
 *
 * Environment variables (optional — for GitHub storage, added later):
 *   GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
 */

import { NextResponse } from 'next/server';

// =========================================================
// Pure-JS PDF text extractor
// No workers, no external deps, works on Vercel / any serverless.
// Covers text-based PDFs (the vast majority of resumes).
// =========================================================

function decodePDFString(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      try { return String.fromCharCode(parseInt(oct, 8)); } catch { return ''; }
    })
    .replace(/\\(.)/g, '$1');
}

function extractPDFText(buffer) {
  // Read raw binary. PDF text operators live inside BT … ET blocks.
  const src = buffer.toString('binary');
  const parts = [];

  const blockRe = /BT([\s\S]*?)ET/g;
  let block;
  while ((block = blockRe.exec(src)) !== null) {
    const inner = block[1];

    // (text) Tj  |  (text) '  |  (text) "
    const tjRe = /\(([^)\\]*(?:\\[\s\S][^)\\]*)*)\)\s*(?:Tj|'|")/g;
    let m;
    while ((m = tjRe.exec(inner)) !== null) {
      const t = decodePDFString(m[1]);
      if (t.trim()) parts.push(t);
    }

    // [(text) spacing …] TJ
    const tjArrRe = /\[([^\]]*)\]\s*TJ/g;
    while ((m = tjArrRe.exec(inner)) !== null) {
      const strRe = /\(([^)\\]*(?:\\[\s\S][^)\\]*)*)\)/g;
      let sm;
      while ((sm = strRe.exec(m[1])) !== null) {
        const t = decodePDFString(sm[1]);
        if (t.trim()) parts.push(t);
      }
    }

    parts.push('\n');
  }

  return parts.join(' ').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

// =========================================================
// Text extraction dispatcher
// =========================================================

async function extractText(filename, buffer) {
  const ext = filename.split('.').pop().toLowerCase();

  if (['txt', 'md'].includes(ext)) {
    return buffer.toString('utf-8');
  }

  if (ext === 'pdf') {
    try {
      const text = extractPDFText(buffer);
      if (!text?.trim()) {
        return { error: 'Could not extract text from this PDF. It may be scanned/image-based. Please use a text-based PDF or convert to TXT.' };
      }
      return text;
    } catch (e) {
      return { error: 'Failed to parse PDF: ' + e.message };
    }
  }

  if (['docx', 'doc'].includes(ext)) {
    let mammoth;
    try {
      mammoth = await import('mammoth');
    } catch {
      return { error: 'DOCX support requires "mammoth". Run: npm install mammoth' };
    }
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value?.trim()) return { error: 'Could not extract text from DOCX.' };
    return result.value;
  }

  // Fallback: treat as plain text
  return buffer.toString('utf-8');
}


// =========================================================
// Rule-based resume parser
// =========================================================

const SKILL_SYNONYMS = {
  python:       ['python'],
  java:         ['java'],
  javascript:   ['javascript', ' js '],
  typescript:   ['typescript', ' ts '],
  react:        ['react', 'reactjs', 'react.js'],
  nextjs:       ['next.js', 'nextjs'],
  node:         ['node.js', 'nodejs', 'node '],
  php:          ['php'],
  ruby:         ['ruby'],
  rails:        ['rails', 'ruby on rails'],
  django:       ['django'],
  fastapi:      ['fastapi'],
  express:      ['express.js', 'expressjs'],
  golang:       ['golang', ' go '],
  rust:         ['rust'],
  aws:          ['aws', 'amazon web services', 'amazon aws'],
  azure:        ['azure', 'microsoft azure'],
  gcp:          ['gcp', 'google cloud', 'google cloud platform'],
  docker:       ['docker'],
  kubernetes:   ['kubernetes', 'k8s'],
  terraform:    ['terraform'],
  ansible:      ['ansible'],
  jenkins:      ['jenkins'],
  gitlab:       ['gitlab', 'gitlab ci'],
  github_actions:['github actions'],
  prometheus:   ['prometheus'],
  grafana:      ['grafana'],
  linux:        ['linux', 'ubuntu', 'centos', 'debian'],
  sql:          ['sql'],
  postgresql:   ['postgresql', 'postgres'],
  mysql:        ['mysql'],
  mongodb:      ['mongodb'],
  redis:        ['redis'],
  elasticsearch:['elasticsearch', 'elk', 'elastic stack'],
  kafka:        ['kafka', 'apache kafka'],
  html:         ['html'],
  css:          ['css'],
  git:          ['git '],
  android:      ['android'],
  devops:       ['devops'],
};

const DOMAIN_VOCAB = {
  edtech:     ['edtech', 'e-learning', 'elearning', 'school', 'education'],
  healthcare: ['healthcare', 'medical', 'clinic', 'hospital'],
  ecommerce:  ['ecommerce', 'ec ', 'shopping', 'reservation'],
  data:       ['data engineering', 'analytics', 'big data', 'bigquery', 'dataflow'],
  saas:       ['saas', 'platform engineer', 'dashboard'],
  cloud:      ['cloud infrastructure', 'multi-cloud', 'cloud native'],
  ai:         ['machine learning', 'deep learning', 'llm', 'ml '],
  fintech:    ['fintech', 'banking', 'payment', 'financial'],
  gaming:     ['gaming', 'game '],
};

const LANGUAGE_VOCAB = {
  english:   ['english'],
  japanese:  ['japanese', 'jlpt', '日本語'],
  nepali:    ['nepali', 'ネパール'],
  chinese:   ['chinese', 'mandarin', '中文'],
  korean:    ['korean', '한국어'],
};

function parseResume(text) {
  const lower = text.toLowerCase().replace(/\u3000/g, ' ');

  // Skills
  const skills = [];
  for (const [skill, aliases] of Object.entries(SKILL_SYNONYMS)) {
    if (aliases.some(a => lower.includes(a))) skills.push(skill);
  }

  // Domains
  const domains = [];
  for (const [domain, aliases] of Object.entries(DOMAIN_VOCAB)) {
    if (aliases.some(a => lower.includes(a))) domains.push(domain);
  }

  // Languages
  const languages = [];
  for (const [lang, aliases] of Object.entries(LANGUAGE_VOCAB)) {
    if (aliases.some(a => lower.includes(a))) languages.push(lang);
  }

  // Years of experience
  const yearMatches = [...lower.matchAll(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|年)/g)];
  const yearValues = yearMatches.map(m => parseFloat(m[1])).filter(v => v > 0 && v <= 40);
  const yearsTotal = yearValues.length ? Math.max(...yearValues) : 1.0;

  const seniority = yearsTotal < 2 ? 'junior' : yearsTotal < 5 ? 'mid' : 'senior';

  // Role families
  const s = new Set(skills);
  const roleFamilies = [];
  if (['react', 'javascript', 'typescript', 'html', 'css', 'nextjs'].some(x => s.has(x))) roleFamilies.push('frontend engineer');
  if (['node', 'php', 'django', 'fastapi', 'rails', 'sql', 'ruby', 'express', 'java', 'golang'].some(x => s.has(x))) roleFamilies.push('backend engineer');
  if (['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ansible', 'devops', 'linux', 'jenkins', 'gitlab', 'github_actions'].some(x => s.has(x))) roleFamilies.push('devops / sre');
  if (['python', 'sql', 'kafka', 'elasticsearch', 'mongodb'].some(x => s.has(x)) && domains.includes('data')) roleFamilies.push('data engineer');
  if (roleFamilies.length === 0) roleFamilies.push('software engineer');

  // Guess name from first non-empty lines
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let name = null;
  for (const line of lines.slice(0, 8)) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && line.length <= 80 && /^[A-Za-z\s\-'.]+$/.test(line)) {
      name = line;
      break;
    }
  }

  return { name, skills, domains, languages, yearsTotal, seniority, roleFamilies };
}


// =========================================================
// Demo job postings
// (Replace collectors with real crawlers / API feeds later)
// =========================================================
// Live job collectors — free public feeds, no API keys
// Sources: RemoteOK (JSON), WeWorkRemotely (RSS), Remotive (JSON)
// =========================================================

// Simple in-memory cache per serverless instance (~5 min TTL)
const feedCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
function fromCache(key) {
  const e = feedCache.get(key);
  return e && Date.now() - e.ts < CACHE_TTL ? e.data : null;
}
function toCache(key, data) { feedCache.set(key, { data, ts: Date.now() }); }

// fetch() with hard timeout
async function fetchWithTimeout(url, ms = 9000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobMatcher/1.0; +https://devopsengineer.com)' },
    });
  } finally { clearTimeout(timer); }
}

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [skill, aliases] of Object.entries(SKILL_SYNONYMS)) {
    if (aliases.some(a => lower.includes(a))) found.push(skill);
  }
  return found;
}

function inferSeniority(title, desc = '') {
  const t = (title + ' ' + desc).toLowerCase();
  if (/\b(senior|lead|principal|staff|sr\.?|head of)\b/.test(t)) return 'senior';
  if (/\b(junior|jr\.?|entry[- ]?level|intern|graduate|associate)\b/.test(t)) return 'junior';
  return 'mid';
}

function parseSalary(raw, desc) {
  if (raw && raw.trim()) return raw.trim();
  const m = (desc || '').match(/\$[\d,]+k?\s*[-–]\s*\$[\d,]+k?|\$[\d,]+[\d,]*\+?/i);
  return m ? m[0] : null;
}

// ─── RemoteOK JSON ────────────────────────────────────────
// Docs: https://remoteok.com/api
async function fetchRemoteOK(tag) {
  const key = `rok:${tag}`;
  const cached = fromCache(key);
  if (cached) return cached;
  try {
    const res = await fetchWithTimeout(`https://remoteok.com/api?tags=${encodeURIComponent(tag)}`);
    if (!res.ok) return [];
    const json = await res.json();
    const jobs = Array.isArray(json) ? json.slice(1, 35) : [];
    const out = jobs.map(j => {
      const desc = stripHtml(j.description || '');
      const tagText = (Array.isArray(j.tags) ? j.tags.join(' ') : '') + ' ' + (j.position || '') + ' ' + desc;
      const skills = extractSkillsFromText(tagText);
      const salary = j.salary_min && j.salary_max
        ? `$${Math.round(j.salary_min / 1000)}k – $${Math.round(j.salary_max / 1000)}k`
        : parseSalary(null, desc);
      return {
        source: 'RemoteOK',
        sourceUrl: j.url || `https://remoteok.com/l/${j.id}`,
        title: (j.position || j.title || '').trim(),
        company: (j.company || 'Unknown').trim(),
        locationText: j.location || 'Remote, Worldwide',
        locationPolicy: 'remote',
        countryEligibility: ['Worldwide'],
        timezoneConstraint: null,
        salaryText: salary,
        seniority: inferSeniority(j.position || j.title || '', desc),
        mustHave: skills.slice(0, 5),
        niceToHave: skills.slice(5, 10),
        domains: [],
        visaSupport: null,
        description: desc.slice(0, 400),
      };
    }).filter(j => j.title);
    toCache(key, out);
    return out;
  } catch (e) { console.error('[remoteok]', e.message); return []; }
}

// ─── WeWorkRemotely RSS ───────────────────────────────────
// Docs: https://weworkremotely.com/job-feeds
async function fetchWeWorkRemotely(slug) {
  const key = `wwr:${slug}`;
  const cached = fromCache(key);
  if (cached) return cached;
  try {
    const res = await fetchWithTimeout(`https://weworkremotely.com/categories/${slug}.rss`);
    if (!res.ok) return [];
    const xml = await res.text();
    const out = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRe.exec(xml)) !== null && out.length < 20) {
      const chunk = m[1];
      const get = tag => {
        const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>` +
          `|<${tag}[^>]*>([^<]*)<\\/${tag}>`);
        const mm = r.exec(chunk);
        return mm ? (mm[1] || mm[2] || '').trim() : '';
      };
      const title   = get('title');
      const link    = get('link');
      const company = get('company_name') || '';
      const region  = get('region') || 'Worldwide';
      const desc    = stripHtml(get('description'));
      if (!title || !link || title.toLowerCase().includes('we work remotely')) continue;
      const skills = extractSkillsFromText(title + ' ' + desc);
      out.push({
        source: 'WeWorkRemotely',
        sourceUrl: link,
        title: title.trim(),
        company: company.trim() || 'Unknown',
        locationText: region === 'Anywhere' ? 'Remote, Worldwide' : `Remote, ${region}`,
        locationPolicy: 'remote',
        countryEligibility: ['Worldwide'],
        timezoneConstraint: null,
        salaryText: parseSalary(null, desc),
        seniority: inferSeniority(title, desc),
        mustHave: skills.slice(0, 5),
        niceToHave: skills.slice(5, 10),
        domains: [],
        visaSupport: null,
        description: desc.slice(0, 400),
      });
    }
    toCache(key, out);
    return out;
  } catch (e) { console.error('[wwr]', e.message); return []; }
}

// ─── Remotive JSON ────────────────────────────────────────
// Docs: https://remotive.com/api/remote-jobs
async function fetchRemotive(category) {
  const key = `remotive:${category}`;
  const cached = fromCache(key);
  if (cached) return cached;
  try {
    const res = await fetchWithTimeout(`https://remotive.com/api/remote-jobs?category=${encodeURIComponent(category)}&limit=30`);
    if (!res.ok) return [];
    const json = await res.json();
    const out = (json.jobs || []).slice(0, 25).map(j => {
      const desc = stripHtml(j.description || '');
      const tagText = j.title + ' ' + (Array.isArray(j.tags) ? j.tags.join(' ') : '') + ' ' + desc;
      const skills = extractSkillsFromText(tagText);
      return {
        source: 'Remotive',
        sourceUrl: j.url,
        title: (j.title || '').trim(),
        company: (j.company_name || 'Unknown').trim(),
        locationText: j.candidate_required_location || 'Worldwide',
        locationPolicy: 'remote',
        countryEligibility: ['Worldwide'],
        timezoneConstraint: null,
        salaryText: j.salary || parseSalary(null, desc),
        seniority: inferSeniority(j.title, desc),
        mustHave: skills.slice(0, 5),
        niceToHave: skills.slice(5, 10),
        domains: [],
        visaSupport: null,
        description: desc.slice(0, 400),
      };
    }).filter(j => j.title && j.sourceUrl);
    toCache(key, out);
    return out;
  } catch (e) { console.error('[remotive]', e.message); return []; }
}

// ─── Pick feeds based on detected role families ───────────
async function fetchLiveJobs(roleFamilies) {
  const has = kw => roleFamilies.some(r => r.toLowerCase().includes(kw));
  const promises = [];

  if (has('devops') || has('sre')) {
    promises.push(fetchRemoteOK('devops'));
    promises.push(fetchWeWorkRemotely('remote-devops-sysadmin-jobs'));
    promises.push(fetchRemotive('devops-sysadmin'));
  }
  if (has('backend')) {
    promises.push(fetchRemoteOK('backend'));
    promises.push(fetchRemotive('software-dev'));
  }
  if (has('frontend')) {
    promises.push(fetchRemoteOK('frontend'));
    promises.push(fetchWeWorkRemotely('remote-programming-jobs'));
  }
  if (has('data')) {
    promises.push(fetchRemoteOK('data'));
    promises.push(fetchRemotive('data'));
  }
  // Always include general software feed as a fallback
  if (promises.length === 0) {
    promises.push(fetchRemoteOK('engineer'));
    promises.push(fetchRemotive('software-dev'));
    promises.push(fetchWeWorkRemotely('remote-programming-jobs'));
  }

  const settled = await Promise.allSettled(promises);
  const all = settled.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  // Deduplicate by URL
  const seen = new Set();
  return all.filter(j => {
    if (!j.sourceUrl || seen.has(j.sourceUrl)) return false;
    seen.add(j.sourceUrl);
    return true;
  }).slice(0, 60);
}


// =========================================================
// Geo scoring
// =========================================================

function scoreGeo(job) {
  const allowed = job.countryEligibility.map(x => x.toLowerCase());
  if (allowed.length === 0 || allowed.includes('worldwide') || allowed.includes('japan')) {
    return { geo: 10, eligible: true, reason: null };
  }
  if (allowed.includes('apac') || allowed.includes('asia')) {
    return { geo: 7, eligible: true, reason: 'Regional preference applies' };
  }
  return { geo: 0, eligible: false, reason: 'Country/region restrictions may block applications from Japan' };
}


// =========================================================
// Match engine
// =========================================================

function scoreJob(candidate, job) {
  const cSkills = new Set(candidate.skills);
  const must = new Set(job.mustHave);
  const nice = new Set(job.niceToHave);

  const matchedMust = [...must].filter(s => cSkills.has(s));
  const missingMust = [...must].filter(s => !cSkills.has(s));
  const matchedNice = [...nice].filter(s => cSkills.has(s));

  // Scoring (mirrors the Python engine weights)
  const mustScore  = must.size  ? 45 * (matchedMust.length / must.size)  : 0;
  const niceScore  = nice.size  ? 10 * (matchedNice.length / nice.size)  : 0;
  const domainOverlap = candidate.domains.filter(d => job.domains.includes(d)).length;
  const domainScore   = Math.min(10, domainOverlap * 5);

  // Seniority
  const order = { junior: 1, mid: 2, senior: 3 };
  let seniorityScore = 6;
  let seniorityFit   = 'unknown';
  if (candidate.seniority && job.seniority) {
    const delta = Math.abs((order[candidate.seniority] || 2) - (order[job.seniority] || 2));
    seniorityScore = delta === 0 ? 12 : delta === 1 ? 7 : 2;
    seniorityFit   = delta === 0 ? 'strong' : delta === 1 ? 'acceptable' : 'weak';
  }

  const { geo: geoScore, eligible, reason: geoReason } = scoreGeo(job);
  const remoteScore = job.locationPolicy === 'remote' ? 10 : job.locationPolicy === 'hybrid' ? 4 : 0;

  // Role family vs job title
  const titleLower = job.title.toLowerCase();
  const roleMap = {
    'frontend engineer':   ['frontend', 'front-end', 'ui'],
    'backend engineer':    ['backend', 'back-end', 'server'],
    'devops / sre':        ['devops', 'platform', 'sre', 'infrastructure', 'reliability'],
    'data engineer':       ['data'],
    'software engineer':   ['software', 'full stack', 'fullstack', 'engineer'],
  };
  let roleScore = 3;
  for (const role of candidate.roleFamilies) {
    if ((roleMap[role] || []).some(t => titleLower.includes(t))) { roleScore = 8; break; }
  }

  const total = Math.min(100, mustScore + niceScore + domainScore + seniorityScore + geoScore + remoteScore + roleScore);

  // Resume tweaks
  const tweaks = [`Tailor your resume headline to match "${job.title}".`];
  if (missingMust.length) {
    tweaks.push(`Highlight any adjacent experience with: ${missingMust.slice(0, 4).join(', ')}.`);
  }
  if (job.domains.length) tweaks.push('Move your most relevant domain project to the top section.');

  return {
    company:           job.company,
    title:             job.title,
    source:            job.source,
    sourceUrl:         job.sourceUrl,
    locationText:      job.locationText,
    locationPolicy:    job.locationPolicy,
    eligibleFromJapan: eligible,
    geoFlagReason:     geoReason,
    timezoneConstraint:job.timezoneConstraint,
    salaryText:        job.salaryText,
    seniority:         job.seniority,
    matchPercent:      Math.round(total * 10) / 10,
    matchedSkills:     [...new Set([...matchedMust, ...matchedNice])].sort(),
    missingMustHave:   missingMust.sort(),
    deadline:          job.deadline || null,
    visaSupport:       job.visaSupport,
    resumeTweaks:      tweaks,
    scoringBreakdown:  {
      must_score:     Math.round(mustScore * 10) / 10,
      nice_score:     Math.round(niceScore * 10) / 10,
      domain_score:   domainScore,
      seniority_score: seniorityScore,
      seniority_fit:  seniorityFit,
      geo_score:      geoScore,
      remote_score:   remoteScore,
      role_score:     roleScore,
    },
  };
}


// =========================================================
// POST /api/job-match
// =========================================================

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max ${MAX_MB} MB.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const textOrError = await extractText(file.name, buffer);

    if (textOrError?.error) {
      return NextResponse.json({ error: textOrError.error }, { status: 400 });
    }

    const resumeText = textOrError;
    if (!resumeText?.trim()) {
      return NextResponse.json({ error: 'Could not extract any text from the file.' }, { status: 400 });
    }

    const candidate = parseResume(resumeText);

    // Fetch real live jobs from RSS/JSON feeds based on candidate's role
    const liveJobs = await fetchLiveJobs(candidate.roleFamilies);

    const results = liveJobs
      .map(job => scoreJob(candidate, job))
      .sort((a, b) => {
        if (a.eligibleFromJapan !== b.eligibleFromJapan) return b.eligibleFromJapan ? 1 : -1;
        return b.matchPercent - a.matchPercent;
      });

    const runId = `${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      run_id:     runId,
      created_at: new Date().toISOString(),
      candidate,
      results,
    });

  } catch (err) {
    console.error('[job-match] error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
