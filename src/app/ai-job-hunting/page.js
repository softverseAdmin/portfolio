import Link from 'next/link';
import JobSearchClient from './JobSearchClient';

export const metadata = {
  title: 'AI-Powered Job Hunting Guide for Tech & Software Engineers | DevOps Enginer',
  description: 'Master AI-powered job hunting strategies for software, DevOps, cloud, frontend, backend, and data engineers. Leverage ChatGPT, AI resume builders, interview prep, and smart job search automation to land your dream role faster.',
  keywords: 'AI job hunting, AI resume builder, ChatGPT job search, AI interview prep, LinkedIn AI optimization, tech jobs, software engineer jobs, DevOps jobs, cloud engineer jobs, AI cover letter, job search automation, career AI tools',
  openGraph: {
    title: 'AI-Powered Job Hunting Guide for Tech & Software Engineers',
    description: 'Master AI-powered job hunting strategies for software, DevOps, cloud, frontend, backend, and data engineers. Leverage ChatGPT, AI resume builders, interview prep, and smart automation.',
    type: 'website',
  }
};

const aiTools = [
  {
    category: "Resume & CV Optimization",
    icon: "📄",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10 border-violet-500/30",
    textColor: "text-violet-300",
    tools: [
      { name: "Teal", use: "AI resume builder with ATS optimization", url: "#", free: true },
      { name: "Kickresume", use: "AI-powered resume & cover letter creator", url: "#", free: true },
      { name: "Resume.io", use: "ATS-friendly templates with AI writing suggestions", url: "#", free: false },
      { name: "Enhancv", use: "AI resume enhancement & impact statement generator", url: "#", free: false },
      { name: "ChatGPT / GPT-4", use: "Custom prompts to tailor resume for each job", url: "#", free: true },
    ]
  },
  {
    category: "Cover Letter Generation",
    icon: "✉️",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    textColor: "text-blue-300",
    tools: [
      { name: "Grammarly", use: "AI grammar & tone correction for cover letters", url: "#", free: true },
      { name: "Copy.ai", use: "AI cover letter generation from job description", url: "#", free: true },
      { name: "Jasper AI", use: "Professional tone cover letters at scale", url: "#", free: false },
      { name: "ChatGPT", use: "Customized cover letters with company research", url: "#", free: true },
      { name: "Rezi", use: "AI-powered cover letter builder with ATS scanning", url: "#", free: false },
    ]
  },
  {
    category: "AI Interview Preparation",
    icon: "🎤",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500/10 border-green-500/30",
    textColor: "text-green-300",
    tools: [
      { name: "Interview Warmup (Google)", use: "AI-powered behavioral interview practice", url: "#", free: true },
      { name: "Pramp", use: "Peer-to-peer technical interview practice with AI analysis", url: "#", free: true },
      { name: "Interviewing.io", use: "Anonymous mock interviews with feedback", url: "#", free: false },
      { name: "ChatGPT", use: "Generate STAR-format answers & simulate interviews", url: "#", free: true },
      { name: "Final Round AI", use: "Real-time AI interview assistant & answer suggestions", url: "#", free: false },
    ]
  },
  {
    category: "LinkedIn & Profile Optimization",
    icon: "🔗",
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10 border-sky-500/30",
    textColor: "text-sky-300",
    tools: [
      { name: "LinkedIn AI Features", use: "Built-in AI for profile writing & job matching", url: "#", free: true },
      { name: "Taplio", use: "AI LinkedIn content creation & engagement growth", url: "#", free: false },
      { name: "AuthoredUp", use: "LinkedIn post analytics and AI writing", url: "#", free: false },
      { name: "Leet Resume", use: "Parse LinkedIn and generate optimized resume", url: "#", free: true },
      { name: "ChatGPT", use: "Craft compelling LinkedIn About sections & headlines", url: "#", free: true },
    ]
  },
  {
    category: "Job Search Automation",
    icon: "🤖",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10 border-orange-500/30",
    textColor: "text-orange-300",
    tools: [
      { name: "Simplify.jobs", use: "One-click job applications with AI form autofill", url: "#", free: true },
      { name: "Pyjobs / LazyApply", use: "Automated job applications across multiple platforms", url: "#", free: false },
      { name: "Huntr", use: "AI job tracker with application management", url: "#", free: true },
      { name: "JobScan", use: "ATS keyword matching score vs job descriptions", url: "#", free: true },
      { name: "Otta", use: "Smart job matching for tech professionals", url: "#", free: true },
    ]
  },
  {
    category: "Salary Negotiation & Research",
    icon: "💰",
    color: "from-gold-500 to-yellow-500",
    bgColor: "bg-yellow-500/10 border-yellow-500/30",
    textColor: "text-yellow-300",
    tools: [
      { name: "Levels.fyi", use: "Real salary data from tech professionals", url: "#", free: true },
      { name: "Glassdoor AI", use: "AI salary insights and negotiation benchmarks", url: "#", free: true },
      { name: "Blind", use: "Anonymous peer salary discussions", url: "#", free: true },
      { name: "ChatGPT", use: "Generate negotiation scripts and counter-offer responses", url: "#", free: true },
      { name: "Ladder", use: "Premium job board with verified high-salary roles", url: "#", free: false },
    ]
  }
];

const aiPrompts = [
  {
    title: "Resume Tailoring Prompt",
    icon: "📝",
    color: "border-violet-500/40 bg-violet-500/5",
    headerColor: "text-violet-300",
    prompt: `Act as a senior technical recruiter. I'm applying for [JOB TITLE] at [COMPANY]. Here is the job description:
[PASTE JOB DESCRIPTION]

Here is my current resume summary:
[PASTE YOUR SUMMARY]

Rewrite my resume summary and bullet points to:
1. Match keywords from the job description
2. Quantify achievements with metrics
3. Pass ATS scanning for the role
4. Highlight the technical skills most relevant to this role`,
    tags: ["Resume", "ATS", "Keywords"]
  },
  {
    title: "STAR Answer Generator",
    icon: "⭐",
    color: "border-green-500/40 bg-green-500/5",
    headerColor: "text-green-300",
    prompt: `Generate a STAR-format interview answer for this behavioral question:
"[INTERVIEW QUESTION]"

My background: [BRIEFLY DESCRIBE YOUR ROLE/EXPERIENCE]
Situation to use: [DESCRIBE A RELEVANT SITUATION]

Format the answer with:
- Situation (2-3 sentences)
- Task (1-2 sentences)
- Action (3-4 bullet points of specific steps I took)
- Result (quantified outcome + business impact)

Keep it under 2 minutes when spoken aloud.`,
    tags: ["Interview", "Behavioral", "STAR"]
  },
  {
    title: "Cover Letter Generator",
    icon: "✉️",
    color: "border-blue-500/40 bg-blue-500/5",
    headerColor: "text-blue-300",
    prompt: `Write a compelling cover letter for a [JOB TITLE] role at [COMPANY NAME].

Company info: [PASTE COMPANY ABOUT PAGE OR MISSION]
Job description highlights: [PASTE KEY REQUIREMENTS]
My top 3 relevant achievements:
1. [ACHIEVEMENT 1]
2. [ACHIEVEMENT 2]
3. [ACHIEVEMENT 3]

Guidelines:
- 3 paragraphs, under 300 words
- Lead with a strong hook about why THIS company
- Connect my technical experience directly to their stack and needs
- Close with a confident call to action
- Professional but personable tone`,
    tags: ["Cover Letter", "Personalization"]
  },
  {
    title: "LinkedIn Headline Optimizer",
    icon: "🔗",
    color: "border-sky-500/40 bg-sky-500/5",
    headerColor: "text-sky-300",
    prompt: `Create 5 optimized LinkedIn headlines for a tech professional with this background:
- Current role: [YOUR CURRENT TITLE]
- Years of experience: [X years]
- Key skills: [e.g., React, Node.js, AWS, Kubernetes, Python, Terraform]
- Target role: [TARGET JOB TITLE]
- Open to: [Contract/Full-time/Remote]

Each headline should:
- Be under 220 characters
- Include at least 2 relevant keywords that recruiters search
- Convey value proposition, not just job title
- Be compelling enough to make a recruiter click`,
    tags: ["LinkedIn", "Personal Brand", "Visibility"]
  },
  {
    title: "Salary Negotiation Script",
    icon: "💰",
    color: "border-yellow-500/40 bg-yellow-500/5",
    headerColor: "text-yellow-300",
    prompt: `I just received a job offer as a [JOB TITLE] at [COMPANY] with a base salary of [OFFERED SALARY].

Market data shows the range is [MARKET RANGE] for my experience level.
My current salary is [CURRENT SALARY].
I have [X YEARS] of experience in [KEY SKILLS].

Write me a professional email and phone script to:
1. Express genuine enthusiasm for the offer
2. Negotiate salary up to [TARGET SALARY] using market data
3. Also negotiate [any other items: PTO, remote work, signing bonus]
4. Keep the relationship positive regardless of outcome`,
    tags: ["Negotiation", "Salary", "Email Script"]
  },
  {
    title: "Technical Interview Prep",
    icon: "💻",
    color: "border-red-500/40 bg-red-500/5",
    headerColor: "text-red-300",
    prompt: `Act as a senior technical interviewer at a top tech company.
I'm interviewing for: [JOB TITLE] at [COMPANY TYPE e.g. FAANG/Startup/Enterprise]

Conduct a mock technical interview covering the most relevant topics for my role, such as:
- System design and architecture
- Core language / framework questions (e.g. [MY STACK])
- Cloud / infrastructure / DevOps practices (if relevant)
- Algorithms and data structures (if relevant)
- Debugging and incident response scenarios

Ask one question at a time. After my answer, provide:
1. What was good about my answer
2. What was missing or could be improved
3. The ideal answer structure
4. Then ask the next question`,
    tags: ["Technical", "Mock Interview", "System Design"]
  }
];

const jobHuntingSteps = [
  {
    step: "01",
    title: "AI-Optimize Your Resume",
    description: "Use AI to tailor your resume for every single job application. Modern ATS systems reject 75% of resumes before a human ever sees them.",
    actions: [
      "Upload job description to ChatGPT, ask it to extract top 15 ATS keywords",
      "Run your resume through Jobscan to see your match score",
      "Use AI to quantify achievements ('improved deployment time' → 'reduced deployment time by 60%, saving 8 hours/week')",
      "Generate multiple resume variations for different role types (SRE, Platform Engineer, Cloud Architect)"
    ],
    tip: "Aim for 80%+ keyword match score on Jobscan before applying",
    color: "from-violet-500 to-purple-600",
    icon: "📄"
  },
  {
    step: "02",
    title: "Build Your AI-Enhanced LinkedIn",
    description: "LinkedIn is where 87% of recruiters search for candidates. Your profile needs to be discoverable AND compelling.",
    actions: [
      "Use ChatGPT to rewrite your About section with your unique value proposition",
      "Add an AI-generated LinkedIn banner with your top skills using Canva AI",
      "Post weekly DevOps content using AI writing assistance to build authority",
      "Use LinkedIn's AI to find 2nd-degree connections at target companies",
      "Post weekly content in your area of expertise using AI writing assistance to build authority"
    ],
    tip: "Profiles with consistent weekly activity get 6x more recruiter views",
    color: "from-sky-500 to-blue-600",
    icon: "🔗"
  },
  {
    step: "03",
    title: "Automate Your Job Applications",
    description: "Stop manually filling out the same information 100 times. Use AI automation tools to apply smarter and faster.",
    actions: [
      "Set up Simplify.jobs to autofill application forms across all major job boards",
      "Create job alerts on LinkedIn, Indeed, and Otta with your exact keywords",
      "Use Huntr to track all applications, follow-ups, and interview stages",
      "Target 10-15 quality applications per week rather than 100 spray-and-pray"
    ],
    tip: "Quality beats quantity — a tailored application has 3x higher response rate",
    color: "from-orange-500 to-amber-500",
    icon: "🤖"
  },
  {
    step: "04",
    title: "AI-Powered Interview Mastery",
    description: "Use AI to prepare thoroughly for every interview type — behavioral, technical, and system design.",
    actions: [
      "Research the company using ChatGPT + their blog, press releases, and engineering blog",
      "Practice STAR-format answers for the top 20 behavioral questions using AI",
      "Do live mock interviews with Pramp or Interviewing.io weekly",
      "Ask ChatGPT to simulate a technical interview for your target role and company"
    ],
    tip: "Record yourself answering — AI tools like Yoodli analyze your filler words and pace",
    color: "from-green-500 to-emerald-600",
    icon: "🎤"
  },
  {
    step: "05",
    title: "Smart Networking with AI",
    description: "Referrals are the #1 way people land jobs. AI helps you identify and reach the right people at scale.",
    actions: [
      "Use ChatGPT to draft personalized connection request messages for each person",
      "Use LinkedIn Sales Navigator AI to find hiring managers at target companies",
      "Engage authentically with posts from target company engineers before reaching out",
      "Ask AI to write a short, non-pushy outreach message for informational interviews"
    ],
    tip: "Referred candidates are 4x more likely to get hired and onboard faster",
    color: "from-pink-500 to-rose-600",
    icon: "🤝"
  },
  {
    step: "06",
    title: "Negotiate Your Best Offer",
    description: "Most candidates leave 10-20% salary on the table. Use AI to research, strategize, and script your negotiation.",
    actions: [
      "Research salaries on Levels.fyi, Glassdoor, and Blind for your exact role",
      "Use ChatGPT to generate a negotiation script with multiple fallback positions",
      "Negotiate total comp: base, bonus, equity, remote work, PTO, learning budget",
      "Always negotiate in writing first — use AI to craft the perfect follow-up email"
    ],
    tip: "98% of offers have room to negotiate — companies expect it",
    color: "from-gold-500 to-yellow-500",
    icon: "💰"
  }
];

const jobBoards = [
  { name: "LinkedIn Jobs", type: "General Tech", bestFor: "Networking + applications", aiFeature: "AI job matching & easy apply", color: "text-sky-300" },
  { name: "Otta", type: "Tech Startups", bestFor: "Startup & scale-up roles", aiFeature: "Smart role matching score", color: "text-green-300" },
  { name: "Levels.fyi Jobs", type: "FAANG & Big Tech", bestFor: "High compensation roles", aiFeature: "Verified salary transparency", color: "text-violet-300" },
  { name: "Wellfound (AngelList)", type: "Startups", bestFor: "Early-stage startup roles", aiFeature: "AI startup matching", color: "text-orange-300" },
  { name: "RemoteOK", type: "Remote Only", bestFor: "100% remote tech roles", aiFeature: "Smart remote filters", color: "text-blue-300" },
  { name: "Hired.com", type: "Tech Professionals", bestFor: "Companies apply to you", aiFeature: "Reverse job matching AI", color: "text-pink-300" },
  { name: "Toptal", type: "Freelance/Contract", bestFor: "Top 3% freelance market", aiFeature: "AI skill vetting", color: "text-amber-300" },
  { name: "Dev.to Jobs", type: "Developer Community", bestFor: "Developer-first companies", aiFeature: "Community-vetted listings", color: "text-red-300" },
];

const devopsJobTitles = [
  { title: "Frontend Engineer (React / Next.js)", salaryRange: "$100k – $170k", demand: "High", trend: "↑" },
  { title: "Backend Engineer (Node / Go / Python)", salaryRange: "$110k – $185k", demand: "Very High", trend: "↑" },
  { title: "Full-Stack Engineer", salaryRange: "$115k – $190k", demand: "Very High", trend: "↑" },
  { title: "DevOps / Platform Engineer", salaryRange: "$120k – $195k", demand: "Very High", trend: "↑↑" },
  { title: "Site Reliability Engineer (SRE)", salaryRange: "$140k – $210k", demand: "Very High", trend: "↑" },
  { title: "Cloud / Infrastructure Engineer", salaryRange: "$125k – $200k", demand: "High", trend: "↑" },
  { title: "Data Engineer", salaryRange: "$120k – $195k", demand: "High", trend: "↑↑" },
  { title: "Security Engineer (DevSecOps)", salaryRange: "$145k – $220k", demand: "Very High", trend: "↑↑" },
  { title: "ML / AI Engineer", salaryRange: "$160k – $250k", demand: "Exploding", trend: "↑↑↑" },
  { title: "Mobile Engineer (iOS / Android)", salaryRange: "$110k – $180k", demand: "Stable", trend: "→" },
];

export default function AIJobHuntingPage() {
  return (
    <div className="min-h-screen bg-rich-black text-warm-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-rich-black to-rich-black"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/3 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/40 text-violet-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="text-lg">🤖</span>
              <span>AI-Powered Career Acceleration</span>
              <span className="bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">2026 GUIDE</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-white bg-clip-text text-transparent">Land Your Dream</span>
              <br />
              <span className="bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">Tech Job with AI</span>
            </h1>

            <p className="text-xl md:text-2xl text-warm-white/70 mb-8 leading-relaxed">
              Stop blindly sending resumes. Use <span className="text-violet-300 font-semibold">AI tools, smart prompts, and proven strategies</span> to
              get more interviews, crush technical rounds, and negotiate the salary you deserve —
              whether you&apos;re a frontend, backend, DevOps, data, or cloud engineer.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 bg-charcoal/60 border border-gold/20 rounded-lg px-4 py-3">
                <span className="text-2xl">⚡</span>
                <div className="text-left">
                  <div className="text-gold font-bold text-lg">3x</div>
                  <div className="text-warm-white/60 text-xs">More Interviews</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-charcoal/60 border border-gold/20 rounded-lg px-4 py-3">
                <span className="text-2xl">🎯</span>
                <div className="text-left">
                  <div className="text-gold font-bold text-lg">80%</div>
                  <div className="text-warm-white/60 text-xs">ATS Pass Rate</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-charcoal/60 border border-gold/20 rounded-lg px-4 py-3">
                <span className="text-2xl">💰</span>
                <div className="text-left">
                  <div className="text-gold font-bold text-lg">20%</div>
                  <div className="text-warm-white/60 text-xs">Higher Salary</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-charcoal/60 border border-gold/20 rounded-lg px-4 py-3">
                <span className="text-2xl">⏱️</span>
                <div className="text-left">
                  <div className="text-gold font-bold text-lg">50%</div>
                  <div className="text-warm-white/60 text-xs">Faster Search</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#ai-tools"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
              >
                🚀 Explore AI Tools
              </a>
              <a
                href="#ai-prompts"
                className="bg-gradient-gold hover:shadow-lg hover:shadow-gold/40 text-deep-black px-8 py-3.5 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5"
              >
                ✨ Get AI Prompts
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Resume Job Matcher ── */}
      <JobSearchClient />

      {/* DevOps Job Market Section */}
      <section className="py-16 bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">2026 Tech Job Market</span>
            </h2>
            <p className="text-warm-white/60 text-lg max-w-2xl mx-auto">
              Know your target roles, salary ranges, and market demand before you start applying
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left py-3 px-4 text-gold text-sm font-semibold">Job Title</th>
                  <th className="text-left py-3 px-4 text-gold text-sm font-semibold">Salary Range (US)</th>
                  <th className="text-left py-3 px-4 text-gold text-sm font-semibold">Demand</th>
                  <th className="text-left py-3 px-4 text-gold text-sm font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {devopsJobTitles.map((job, idx) => (
                  <tr key={idx} className="border-b border-charcoal/60 hover:bg-charcoal/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-warm-white">{job.title}</td>
                    <td className="py-3.5 px-4 text-green-300 font-mono">{job.salaryRange}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        job.demand === 'Exploding' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        job.demand === 'Very High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        job.demand === 'High' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {job.demand}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xl font-bold text-green-400">{job.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Step-by-Step AI Job Hunt Strategy */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">6-Step AI Job Hunt</span> System
            </h2>
            <p className="text-warm-white/60 text-lg max-w-2xl mx-auto">
              A battle-tested, AI-powered playbook used by top tech engineers to land offers fast
            </p>
          </div>

          <div className="space-y-8">
            {jobHuntingSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/10 rounded-2xl p-6 hover:border-gold/30 transition-all group">
                <div className="flex-shrink-0 flex md:flex-col items-center md:items-start gap-4 md:gap-2">
                  <div className={`text-4xl md:text-5xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent leading-none`}>
                    {step.step}
                  </div>
                  <div className="text-3xl">{step.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-warm-white mb-2 group-hover:text-gold transition-colors">{step.title}</h3>
                  <p className="text-warm-white/60 mb-4 leading-relaxed">{step.description}</p>
                  <ul className="space-y-2 mb-4">
                    {step.actions.map((action, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2 text-warm-white/80 text-sm">
                        <span className="text-gold mt-0.5 flex-shrink-0">▸</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${step.color} bg-opacity-10 border border-current rounded-lg px-3 py-1.5 text-xs font-medium`}>
                    <span>💡</span>
                    <span className="text-warm-white/80"><strong className="text-gold">Pro Tip:</strong> {step.tip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section id="ai-tools" className="py-20 bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Ultimate AI Toolkit</span>
              <span className="text-warm-white"> for Job Hunters</span>
            </h2>
            <p className="text-warm-white/60 text-lg max-w-2xl mx-auto">
              Every AI tool you need, organized by job hunting phase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {aiTools.map((category, idx) => (
              <div key={idx} className={`border ${category.bgColor} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className={`text-lg font-bold ${category.textColor}`}>{category.category}</h3>
                </div>
                <div className="space-y-3">
                  {category.tools.map((tool, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${tool.free ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {tool.free ? 'FREE' : 'PAID'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-warm-white text-sm">{tool.name}</span>
                        <p className="text-warm-white/50 text-xs mt-0.5">{tool.use}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Prompts Section */}
      <section id="ai-prompts" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">Copy-Paste AI Prompts</span>
            </h2>
            <p className="text-warm-white/60 text-lg max-w-2xl mx-auto">
              Battle-tested ChatGPT prompts for every stage of your job search. Just fill in the brackets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiPrompts.map((item, idx) => (
              <div key={idx} className={`border ${item.color} rounded-2xl p-6 hover:border-opacity-60 transition-all`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className={`text-lg font-bold ${item.headerColor}`}>{item.title}</h3>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="bg-charcoal/60 border border-gold/20 text-warm-white/60 text-xs px-2.5 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="bg-rich-black/80 rounded-xl p-4 border border-white/5">
                  <pre className="text-warm-white/70 text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
                    {item.prompt}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 border border-violet-500/30 rounded-2xl p-8">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-xl font-bold text-violet-300 mb-2">How to Use These Prompts</h3>
            <p className="text-warm-white/70 max-w-2xl mx-auto text-sm leading-relaxed">
              Copy any prompt above, paste it into <strong className="text-white">ChatGPT (GPT-4), Claude, or Gemini</strong>, and replace
              all <span className="text-gold font-mono">[BRACKETED ITEMS]</span> with your actual information.
              The more specific you are, the better and more personalized the output will be.
              Always review and humanize AI-generated content before sending.
            </p>
          </div>
        </div>
      </section>

      {/* Best Job Boards */}
      <section className="py-20 bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Best Job Boards</span>
              <span className="text-warm-white"> for Tech Engineers</span>
            </h2>
            <p className="text-warm-white/60 text-lg max-w-2xl mx-auto">
              Know where to find the best roles — not all job boards are equal for tech professionals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {jobBoards.map((board, idx) => (
              <div key={idx} className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/10 rounded-xl p-5 hover:border-gold/30 transition-all hover:-translate-y-1">
                <h3 className={`font-bold text-base mb-1 ${board.color}`}>{board.name}</h3>
                <div className="text-xs text-warm-white/50 mb-2">{board.type}</div>
                <div className="space-y-1">
                  <div className="text-xs text-warm-white/70"><span className="text-gold">Best for:</span> {board.bestFor}</div>
                  <div className="text-xs text-warm-white/70"><span className="text-gold">AI feature:</span> {board.aiFeature}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-violet-900/30 via-charcoal/60 to-rich-black border border-violet-500/30 rounded-3xl p-12">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">Supercharge</span> Your Job Search?
            </h2>
            <p className="text-warm-white/70 text-lg mb-8 max-w-2xl mx-auto">
              The job market is competitive, but AI gives you an unfair advantage.
              Start with your resume, build your LinkedIn presence, and land more interviews in the next 30 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
              >
                📚 Read the Tech Career Blog
              </Link>
              <Link
                href="/contact"
                className="bg-gradient-gold hover:shadow-lg hover:shadow-gold/40 text-deep-black px-8 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                💬 Get Career Advice
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
