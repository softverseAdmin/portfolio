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
// Text extraction  (lazy-loads optional parsers at runtime)
// =========================================================

async function extractText(filename, buffer) {
  const ext = filename.split('.').pop().toLowerCase();

  if (['txt', 'md'].includes(ext)) {
    return buffer.toString('utf-8');
  }

  if (ext === 'pdf') {
    try {
      // pdfjs-dist (used internally by pdf-parse v2) calls DOMMatrix which
      // does not exist in Node.js. Polyfill it globally before the import.
      if (typeof globalThis.DOMMatrix === 'undefined') {
        globalThis.DOMMatrix = class DOMMatrix {
          constructor() {
            this.is2D = true; this.isIdentity = true;
            this.a=1; this.b=0; this.c=0; this.d=1; this.e=0; this.f=0;
            this.m11=1; this.m12=0; this.m13=0; this.m14=0;
            this.m21=0; this.m22=1; this.m23=0; this.m24=0;
            this.m31=0; this.m32=0; this.m33=1; this.m34=0;
            this.m41=0; this.m42=0; this.m43=0; this.m44=1;
          }
          multiply()            { return new globalThis.DOMMatrix(); }
          inverse()             { return new globalThis.DOMMatrix(); }
          translate(tx=0,ty=0)  { const m = new globalThis.DOMMatrix(); m.e=tx; m.f=ty; return m; }
          scale(sx=1,sy=sx)     { const m = new globalThis.DOMMatrix(); m.a=sx; m.d=sy; return m; }
          rotate()              { return new globalThis.DOMMatrix(); }
          transformPoint(p={})  { return { x: p.x||0, y: p.y||0, z: p.z||0, w: p.w||1 }; }
          static fromMatrix()         { return new globalThis.DOMMatrix(); }
          static fromFloat32Array()   { return new globalThis.DOMMatrix(); }
          static fromFloat64Array()   { return new globalThis.DOMMatrix(); }
        };
      }
      // Also polyfill Path2D if needed by pdfjs canvas operations
      if (typeof globalThis.Path2D === 'undefined') {
        globalThis.Path2D = class Path2D {
          constructor() {}
          moveTo() {} lineTo() {} closePath() {} arc() {} rect() {}
          addPath() {} bezierCurveTo() {} quadraticCurveTo() {}
        };
      }

      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      if (!result.text?.trim()) return { error: 'Could not extract text from PDF. Try a text-based PDF or plain TXT.' };
      return result.text;
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

const DEMO_JOBS = [
  {
    source: 'RemoteOK',
    sourceUrl: 'https://remoteok.com/remote-devops-jobs',
    title: 'Senior DevOps Engineer',
    company: 'Cloudify Labs',
    locationText: 'Remote, APAC',
    locationPolicy: 'remote',
    countryEligibility: ['Japan', 'Singapore', 'Australia', 'Philippines'],
    timezoneConstraint: 'APAC hours (JST ±3)',
    salaryText: '$80k – $120k',
    seniority: 'senior',
    mustHave: ['aws', 'kubernetes', 'terraform', 'linux'],
    niceToHave: ['ansible', 'prometheus', 'grafana'],
    domains: ['saas', 'cloud'],
    visaSupport: true,
    description: 'Own cloud infrastructure and CI/CD pipelines for a fast-growing SaaS platform.',
  },
  {
    source: 'WeWorkRemotely',
    sourceUrl: 'https://weworkremotely.com/remote-devops-jobs',
    title: 'Platform Engineer (Kubernetes)',
    company: 'NexaStack',
    locationText: 'Remote, Worldwide',
    locationPolicy: 'remote',
    countryEligibility: ['Worldwide'],
    timezoneConstraint: null,
    salaryText: '$90k – $140k',
    seniority: 'mid',
    mustHave: ['kubernetes', 'docker', 'linux'],
    niceToHave: ['terraform', 'golang', 'prometheus'],
    domains: ['cloud', 'saas'],
    visaSupport: null,
    description: 'Build and operate the Kubernetes-based developer platform serving 500+ engineers.',
  },
  {
    source: 'Wellfound',
    sourceUrl: 'https://wellfound.com/jobs',
    title: 'Full Stack Engineer',
    company: 'Learnify',
    locationText: 'Remote, Asia',
    locationPolicy: 'remote',
    countryEligibility: ['Japan', 'Singapore', 'India', 'Philippines'],
    timezoneConstraint: '3h overlap with SGT',
    salaryText: '$40k – $65k',
    seniority: 'junior',
    mustHave: ['react', 'node', 'sql'],
    niceToHave: ['aws', 'typescript', 'docker'],
    domains: ['edtech', 'saas'],
    visaSupport: false,
    description: 'Ship new features across frontend and backend for a global e-learning platform.',
  },
  {
    source: 'Otta',
    sourceUrl: 'https://otta.com',
    title: 'Cloud Infrastructure Engineer',
    company: 'Northwind Systems',
    locationText: 'Remote, Japan preferred',
    locationPolicy: 'remote',
    countryEligibility: ['Japan'],
    timezoneConstraint: 'JST or JST±2',
    salaryText: '¥7M – ¥10M',
    seniority: 'mid',
    mustHave: ['aws', 'docker', 'linux', 'terraform'],
    niceToHave: ['kubernetes', 'ansible', 'python'],
    domains: ['cloud', 'saas'],
    visaSupport: true,
    description: 'Design and maintain cloud infrastructure for a Japanese enterprise SaaS product.',
  },
  {
    source: 'LinkedIn Jobs',
    sourceUrl: 'https://linkedin.com/jobs',
    title: 'Site Reliability Engineer (SRE)',
    company: 'Quantum Finance',
    locationText: 'Remote, APAC or Europe',
    locationPolicy: 'remote',
    countryEligibility: ['Japan', 'Singapore', 'UK', 'Germany'],
    timezoneConstraint: null,
    salaryText: '$100k – $150k',
    seniority: 'senior',
    mustHave: ['kubernetes', 'prometheus', 'python', 'linux'],
    niceToHave: ['grafana', 'terraform', 'golang', 'aws'],
    domains: ['fintech', 'saas'],
    visaSupport: false,
    description: 'Ensure 99.99% SLA for a high-frequency trading platform serving global markets.',
  },
  {
    source: 'RemoteOK',
    sourceUrl: 'https://remoteok.com/remote-backend-jobs',
    title: 'Backend Engineer (Python/AWS)',
    company: 'Acme Cloud',
    locationText: 'Remote, APAC',
    locationPolicy: 'remote',
    countryEligibility: ['Japan', 'Singapore', 'Philippines'],
    timezoneConstraint: 'APAC',
    salaryText: '$50k – $80k',
    seniority: 'mid',
    mustHave: ['python', 'sql', 'aws'],
    niceToHave: ['fastapi', 'docker', 'postgresql'],
    domains: ['saas', 'data', 'cloud'],
    visaSupport: false,
    description: 'Build backend APIs and data workflows for a data-as-a-service platform.',
  },
  {
    source: 'Levels.fyi Jobs',
    sourceUrl: 'https://levels.fyi/jobs',
    title: 'DevSecOps Engineer',
    company: 'CyberGuard',
    locationText: 'Remote, Worldwide',
    locationPolicy: 'remote',
    countryEligibility: ['Worldwide'],
    timezoneConstraint: null,
    salaryText: '$110k – $160k',
    seniority: 'senior',
    mustHave: ['kubernetes', 'aws', 'linux', 'gitlab'],
    niceToHave: ['terraform', 'ansible', 'python', 'docker'],
    domains: ['cloud', 'saas'],
    visaSupport: null,
    description: 'Drive security automation, vulnerability scanning, and compliance for cloud-native infrastructure.',
  },
  {
    source: 'Hired.com',
    sourceUrl: 'https://hired.com',
    title: 'Frontend Engineer (React / Next.js)',
    company: 'Bright Studio',
    locationText: 'Remote, Worldwide',
    locationPolicy: 'remote',
    countryEligibility: ['Worldwide'],
    timezoneConstraint: null,
    salaryText: '$70k – $100k',
    seniority: 'mid',
    mustHave: ['react', 'typescript', 'css'],
    niceToHave: ['nextjs', 'node', 'javascript'],
    domains: ['saas'],
    visaSupport: null,
    description: 'Build pixel-perfect product UI for a global SaaS product with 1M+ users.',
  },
  {
    source: 'Wellfound',
    sourceUrl: 'https://wellfound.com',
    title: 'Data Engineer',
    company: 'DataPipeline Inc.',
    locationText: 'Remote, APAC',
    locationPolicy: 'remote',
    countryEligibility: ['Japan', 'Singapore', 'India'],
    timezoneConstraint: 'APAC hours',
    salaryText: '$70k – $110k',
    seniority: 'mid',
    mustHave: ['python', 'sql', 'kafka'],
    niceToHave: ['aws', 'docker', 'elasticsearch', 'postgresql'],
    domains: ['data', 'saas'],
    visaSupport: null,
    description: 'Design and maintain real-time data pipelines processing 10B+ events per day.',
  },
  {
    source: 'Otta',
    sourceUrl: 'https://otta.com',
    title: 'Junior DevOps Engineer',
    company: 'StartupBoost',
    locationText: 'Remote, Asia',
    locationPolicy: 'remote',
    countryEligibility: ['Japan', 'Philippines', 'India'],
    timezoneConstraint: null,
    salaryText: '$35k – $55k',
    seniority: 'junior',
    mustHave: ['docker', 'linux', 'git'],
    niceToHave: ['aws', 'kubernetes', 'python', 'jenkins'],
    domains: ['saas', 'cloud'],
    visaSupport: true,
    description: 'Assist infrastructure setup and automate deployment workflows for a fast-moving startup.',
  },
];


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

    // Score all demo jobs and sort
    const results = DEMO_JOBS
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
