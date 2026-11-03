import Link from 'next/link';
import Newsletter from '@/components/sections/Newsletter';

export const metadata = {
  title: 'Free DevOps, Cloud & Cybersecurity Roadmaps | DevOps Enginer',
  description: 'Free step-by-step roadmaps for DevOps, cloud and cybersecurity in 2026. Every step links to a hands-on tutorial in learning order — no signup, just start.',
  keywords: 'devops roadmap, cloud roadmap, cybersecurity roadmap, kubernetes roadmap, free learning path, learn devops, learn kubernetes, learn aws',
  openGraph: {
    title: 'Free DevOps, Cloud & Cybersecurity Roadmaps | DevOps Enginer',
    description: 'Free step-by-step roadmaps for DevOps, cloud and cybersecurity in 2026. Every step links to a hands-on tutorial in learning order — no signup, just start.',
    type: 'website',
  }
};

const roadmaps = [
  {
    title: "DevOps Roadmap",
    href: "/devops",
    blurb: "The flagship path: Linux and scripting prerequisites, infrastructure as code, containers and Kubernetes, CI/CD, observability, security and the advanced topics — in the order a working engineer actually meets them.",
    steps: 32,
    linked: 17,
    coverage: 53,
    firstStep: "Starts with the prerequisites: Linux, scripting, networking and Git",
    accent: "border-gold/20 hover:border-gold/40",
    bar: "bg-gradient-to-r from-gold to-amber",
    text: "text-gold"
  },
  {
    title: "Cloud Roadmap",
    href: "/cloud",
    blurb: "AWS first and deepest, with the Azure and GCP columns mapped beside it: compute, storage, databases, networking, security, monitoring and migration strategy for all three providers.",
    steps: 34,
    linked: 11,
    coverage: 32,
    firstStep: "Starts with the AWS core: IAM → VPC → EKS",
    accent: "border-blue-500/20 hover:border-blue-500/40",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-500",
    text: "text-blue-400"
  },
  {
    title: "Cybersecurity Roadmap",
    href: "/cybersecurity",
    blurb: "Fundamentals first, then the offensive, defensive, cloud-security and governance tracks. This site's depth today is cloud security and DevSecOps — and the roadmap says so honestly.",
    steps: 28,
    linked: 5,
    coverage: 18,
    firstStep: "Starts with cloud security: IAM and the DevSecOps checklist",
    accent: "border-red-500/20 hover:border-red-500/40",
    bar: "bg-gradient-to-r from-red-500 to-orange-500",
    text: "text-red-400"
  }
];

const kubernetesPath = [
  { title: "kubectl Commands Cheat Sheet", href: "/blog/kubectl-commands-cheat-sheet-2026" },
  { title: "Kubernetes Resource Requests & Limits", href: "/blog/kubernetes-resource-requests-limits-guide-2026" },
  { title: "Kubernetes Networking & Ingress Basics", href: "/blog/kubernetes-ingress-networking-basics-2026" },
  { title: "Kubernetes Deployment Strategies", href: "/blog/kubernetes-deployment-strategies-2025-complete-guide" },
  { title: "Kubernetes Troubleshooting Guide", href: "/blog/kubernetes-troubleshooting-guide-2026" },
  { title: "Argo CD Tutorial: GitOps Deployment", href: "/blog/argo-cd-tutorial-gitops-2026" },
  { title: "Helm Charts Tutorial", href: "/blog/helm-charts-tutorial-2026", part: 7 },
  { title: "Kubernetes Cost Optimization", href: "/blog/kubernetes-cost-optimization-guide-2026", part: 8 },
  { title: "Kubernetes Observability", href: "/blog/kubernetes-observability-guide-2026", part: 9 },
  { title: "Argo Rollouts: Progressive Delivery", href: "/blog/argo-rollouts-progressive-delivery-2026", part: 10 },
  { title: "Kubernetes Autoscaling", href: "/blog/kubernetes-autoscaling-guide-2026", part: 11 },
  { title: "Kubernetes Security Basics", href: "/blog/kubernetes-security-basics-guide-2026", part: 12 },
  { title: "Kubernetes Storage", href: "/blog/kubernetes-storage-guide-2026", part: 13 },
  { title: "Kubernetes Upgrades", href: "/blog/kubernetes-upgrades-guide-2026", part: 14 },
  { title: "Kubernetes ConfigMaps & Secrets", href: "/blog/kubernetes-configmaps-secrets-guide-2026", part: 15 },
  { title: "Amazon EKS", href: "/blog/amazon-eks-guide-2026", part: 16 },
  { title: "Kubernetes Network Policies", href: "/blog/kubernetes-network-policies-guide-2026", part: 17 },
  { title: "Kubernetes Backup & Disaster Recovery", href: "/blog/kubernetes-backup-disaster-recovery-guide-2026", part: 18 },
  { title: "Kubernetes Pod Disruption Budgets", href: "/blog/kubernetes-pod-disruption-budgets-guide-2026", part: 19 },
  { title: "Kubernetes Logging", href: "/blog/kubernetes-logging-guide-2026", part: 20 },
  { title: "Kubernetes RBAC", href: "/blog/kubernetes-rbac-guide-2026", part: 21 },
  { title: "Kubernetes Jobs & CronJobs", href: "/blog/kubernetes-jobs-cronjobs-guide-2026", part: 22 }
];

function RoadmapCard({ roadmap }) {
  return (
    <Link href={roadmap.href} className="block">
      <div className={`bg-gradient-to-br from-charcoal/60 to-rich-black border ${roadmap.accent} rounded-xl p-6 transition-all group h-full`}>
        <h3 className="text-xl font-bold text-warm-white mb-3 group-hover:text-gold transition-colors">
          {roadmap.title}
        </h3>
        <p className="text-warm-white/70 text-sm mb-5 leading-relaxed">{roadmap.blurb}</p>
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-warm-white/80">{roadmap.steps} steps · {roadmap.linked} with tutorials</span>
          <span className={`${roadmap.text} font-semibold`}>{roadmap.coverage}%</span>
        </div>
        <div className="h-2 rounded-full bg-charcoal overflow-hidden mb-5">
          <div className={`h-full rounded-full ${roadmap.bar}`} style={{ width: `${roadmap.coverage}%` }}></div>
        </div>
        <p className="text-warm-white/60 text-sm mb-4">{roadmap.firstStep}</p>
        <span className={`${roadmap.text} text-sm font-medium group-hover:translate-x-1 transition-transform inline-block`}>
          Start the roadmap →
        </span>
      </div>
    </Link>
  );
}

function KubernetesStep({ step, index }) {
  return (
    <Link href={step.href} className="block">
      <div className="flex items-center gap-4 bg-gradient-to-br from-charcoal/40 to-rich-black border border-gold/20 rounded-lg p-4 hover:border-gold/40 transition-all group">
        <div className="bg-gold/20 w-10 h-10 shrink-0 rounded-full flex items-center justify-center">
          <span className="text-gold font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-warm-white group-hover:text-gold transition-colors">
            {step.title}
          </h3>
          {step.part && (
            <span className="text-warm-white/50 text-xs">Kubernetes in Production series · Part {step.part}</span>
          )}
        </div>
        <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  );
}

export default function RoadmapsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rich-black via-charcoal to-rich-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-charcoal via-rich-black to-charcoal">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-amber/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold mb-6">
              Free DevOps, Cloud &amp; Cybersecurity Roadmaps
            </h1>
            <p className="text-2xl text-gold/90 font-medium mb-6">
              Step by step free learning paths for 2026
            </p>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Every step on every path links to a free, hands-on tutorial on this site, in the order
              to learn it. Steps without a tutorial yet are marked <em>Coming soon</em> — they are this
              site&apos;s public writing queue, filled in the open as new guides ship.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/devops"
                className="bg-gradient-to-r from-gold to-amber text-charcoal px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
              >
                Start the DevOps Roadmap
              </Link>
              <Link
                href="#kubernetes-in-production"
                className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
              >
                Jump to the Kubernetes Path
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Choose Your Roadmap</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Three paths, one rule: no dead ends. Every covered step is a tutorial you can start now,
            and the coverage counter only moves when a real guide ships.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.href} roadmap={roadmap} />
          ))}
        </div>
      </div>

      {/* Featured Path: Kubernetes in Production */}
      <div id="kubernetes-in-production" className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Featured Path: Kubernetes in Production</h2>
            <p className="text-lg text-warm-white/70 max-w-3xl mx-auto">
              The deepest path on the site: 22 guides that already form one start-to-finish sequence,
              from your first kubectl commands to running Kubernetes in production. New here? Start at
              step 1. Already running clusters? Jump to the step that matches your problem.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {kubernetesPath.map((step, index) => (
              <KubernetesStep key={step.href} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* How These Roadmaps Work */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-gold/10 to-amber/5 border border-gold/20 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6 text-center">How These Roadmaps Work</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">1</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Free, No Signup</h3>
              <p className="text-warm-white/70 text-sm">Every tutorial on every path is free to read, in full. Pick a roadmap and start at step one — nothing is locked behind an account.</p>
            </div>
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">2</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Follow the Steps in Order</h3>
              <p className="text-warm-white/70 text-sm">Each step builds on the ones before it, and each covered step links straight to its hands-on tutorial in reading order.</p>
            </div>
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">3</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Coming Soon = The Queue</h3>
              <p className="text-warm-white/70 text-sm">Steps marked Coming soon are the public writing queue. New guides are added to the paths as they ship — the coverage counters above are the scoreboard.</p>
            </div>
          </div>
          <p className="text-center text-warm-white/60 text-sm mt-8">
            Prefer everything in one pack? The{' '}
            <Link href="/devops-production-pack" className="text-gold hover:text-amber transition-colors">
              DevOps Production Pack
            </Link>{' '}
            waitlist is open.
          </p>
        </div>
      </div>

      {/* Newsletter CTA — free Kubernetes Production Checklist */}
      <Newsletter />

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-charcoal via-rich-black to-charcoal py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold mb-6">
            Not Sure Where to Start?
          </h2>
          <p className="text-lg text-warm-white/80 mb-8 leading-relaxed">
            Most readers start with the DevOps roadmap&apos;s prerequisites and take the Kubernetes
            path when they reach the container section. Both are free, and both start at step one.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/devops"
              className="bg-gradient-to-r from-gold to-amber text-charcoal px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
            >
              DevOps Roadmap
            </Link>
            <Link
              href="/blog"
              className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
            >
              Browse All Tutorials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
