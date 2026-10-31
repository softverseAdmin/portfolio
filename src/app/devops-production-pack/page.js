import Link from 'next/link';
import WaitlistForm from '../../components/sections/WaitlistForm';

export const metadata = {
  title: 'The DevOps Production Pack — Join the Waitlist | DevOps Enginer',
  description: 'A practical bundle in production: production checklists, rightsizing worksheets, incident runbook templates, GitOps starter patterns and CI/CD templates — distilled from the DevOps Enginer guides. Join the waitlist for launch pricing.',
  keywords: 'DevOps production pack, Kubernetes checklist, production readiness, SRE templates, GitOps starter, DevOps templates',
  openGraph: {
    title: 'The DevOps Production Pack — Join the Waitlist',
    description: 'Checklists, worksheets, runbook templates and CI/CD patterns for running DevOps in production. Join the waitlist for launch pricing.',
    type: 'website',
  }
};

const inside = [
  {
    title: 'Kubernetes Production Pack',
    items: 'The full production checklist expanded: every check with the why, the command, and the failure it prevents — resources, probes, networking, security, observability.',
  },
  {
    title: 'Rightsizing & Cost Worksheets',
    items: 'The allocation-vs-usage worksheets from the cost guides: find the requests you are overpaying for, and the weekly 30-minute cost routine as a repeatable sheet.',
  },
  {
    title: 'Incident Runbook Templates',
    items: 'Fill-in runbooks for the failures that page everyone: CrashLoopBackOff, OOMKilled, Pending pods, image pull failures, and the post-incident review format.',
  },
  {
    title: 'GitOps Starter Patterns',
    items: 'Argo CD application patterns, Helm chart structure, and the repo layout from the tutorials — ready to adapt instead of assembled from five blog posts at 2 a.m.',
  },
  {
    title: 'CI/CD Templates',
    items: 'GitHub Actions reusable workflows and composite actions, monorepo path-filter setups, and the DevSecOps pipeline checklist as working files, not screenshots.',
  },
  {
    title: 'The Weekly Ops Routine',
    items: 'The ten-minute weekly review that keeps all of it true: evictions, drift, cost, and one improvement shipped — as a one-page ritual you can tape to the wall.',
  },
];

const faqs = [
  {
    q: 'Is the pack available now?',
    a: 'Not yet — it is in production. The waitlist decides whether it gets built in full: if enough engineers join, it ships; waitlist members get the launch price and first access. If it does not go ahead, you will simply get the regular free newsletter — no spam, no hard feelings.',
  },
  {
    q: 'How much will it cost?',
    a: 'The target launch price is $39 for waitlist members (planned regular price $59). One payment, yours forever, updates included.',
  },
  {
    q: 'How is this different from the free blog?',
    a: 'The guides explain; the pack equips. Everything on the blog stays free. The pack is the worked, fill-in, copy-paste layer on top: worksheets, templates and runbooks you use during real incidents and real budget reviews.',
  },
  {
    q: 'Who is it for?',
    a: 'DevOps engineers, SREs and platform engineers running Kubernetes and CI/CD in production — especially small teams who are the platform team, the on-call and the cost department all at once.',
  },
];

export default function DevOpsProductionPackPage() {
  return (
    <main className="min-h-screen bg-deep-black">
      <section className="py-24 px-4 bg-gradient-to-br from-charcoal via-rich-black to-deep-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm font-medium mb-6">
            In Production — Waitlist Open
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            The DevOps Production Pack
          </h1>
          <p className="text-lg md:text-xl text-warm-white/70 mb-6 leading-relaxed max-w-3xl mx-auto">
            The checklists, worksheets, runbooks and templates behind the DevOps Enginer guides —
            distilled into one working bundle for engineers who run production and get paged for it.
          </p>
          <p className="text-warm-white/60 mb-10">
            Planned launch price for waitlist members: <span className="text-gold font-bold text-xl">$39</span>{' '}
            <span className="line-through text-warm-white/40">$59</span>
          </p>
          <WaitlistForm />
          <p className="text-xs text-warm-white/50 mt-6">
            One email when it opens. No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-warm-white">
            What&apos;s <span className="text-gold">inside</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {inside.map((block) => (
              <div key={block.title} className="border border-gold/20 rounded-xl p-6 bg-rich-black/50 hover:border-gold/50 transition-all">
                <h3 className="text-xl font-bold text-gold mb-3">{block.title}</h3>
                <p className="text-warm-white/70 leading-relaxed">{block.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-charcoal/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-warm-white">
            Honest <span className="text-gold">questions</span>
          </h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
                <h3 className="text-lg font-bold text-warm-white mb-2">{f.q}</h3>
                <p className="text-warm-white/70 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-warm-white">
            Start with the <span className="text-gold">free guides</span>
          </h2>
          <p className="text-warm-white/70 mb-8">
            The pack is built from these — read them today, free:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog/kubernetes-troubleshooting-guide-2026" className="px-6 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
              Kubernetes Troubleshooting
            </Link>
            <Link href="/blog/argo-cd-tutorial-gitops-2026" className="px-6 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
              Argo CD Tutorial
            </Link>
            <Link href="/blog/kubernetes-cost-optimization-guide-2026" className="px-6 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
              Kubernetes Cost Optimization
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
