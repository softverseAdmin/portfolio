import Link from 'next/link';

export const metadata = {
  title: 'DevOps Roadmap: Learn to Become a DevOps Engineer',
  description: 'Free DevOps roadmap for 2026: Linux, Git, Docker, Kubernetes, CI/CD, Terraform and monitoring in order — every step linked to a hands-on tutorial.',
  keywords: 'devops roadmap, learn devops, devops engineer, kubernetes, docker, aws, terraform, jenkins, gitlab, monitoring, security, career guide',
  openGraph: {
    title: 'DevOps Roadmap: Learn to Become a DevOps Engineer | DevOps Enginer',
    description: 'Free DevOps roadmap for 2026: Linux, Git, Docker, Kubernetes, CI/CD, Terraform and monitoring in order — every step linked to a hands-on tutorial.',
    type: 'website',
  }
};

const devopsRoadmap = {
  prerequisites: {
    title: "Prerequisites",
    items: [
      { name: "Programming Languages", tools: ["Python", "JavaScript", "Go", "Bash"], level: "essential" },
      { name: "Operating Systems", tools: ["Linux", "Windows", "macOS"], level: "essential",
        links: [
          { label: "Linux for DevOps in 2026", href: "/blog/linux-for-devops-2026" }
        ] },
      { name: "Networking", tools: ["TCP/IP", "DNS", "HTTP/HTTPS", "Load Balancing"], level: "essential",
        links: [
          { label: "Kubernetes Networking & Ingress Basics", href: "/blog/kubernetes-ingress-networking-basics-2026" },
          { label: "AWS VPC", href: "/blog/aws-vpc-guide-2026" },
          { label: "Kubernetes Network Policies", href: "/blog/kubernetes-network-policies-guide-2026" }
        ] },
      { name: "Version Control", tools: ["Git", "GitHub", "GitLab"], level: "essential" }
    ]
  },
  infrastructure: {
    title: "Infrastructure & Cloud",
    items: [
      { name: "Cloud Providers", tools: ["AWS", "Azure", "GCP", "DigitalOcean"], level: "critical",
        links: [
          { label: "Multi-Cloud Strategy", href: "/blog/multi-cloud-strategy-2025" },
          { label: "AWS Cost Optimization", href: "/blog/aws-cost-optimization-15-tactics-saved-50k-month" }
        ] },
      { name: "Infrastructure as Code", tools: ["Terraform", "CloudFormation", "Pulumi", "CDK"], level: "critical",
        links: [
          { label: "Terraform vs Pulumi vs CloudFormation", href: "/blog/terraform-vs-pulumi-cloudformation-2025-iac-comparison" },
          { label: "Terraform State Management", href: "/blog/terraform-state-management-guide-2026" },
          { label: "Terraform Modules", href: "/blog/terraform-modules-guide-2026" },
          { label: "Terraform Testing", href: "/blog/terraform-testing-guide-2026" }
        ] },
      { name: "Configuration Management", tools: ["Ansible", "Chef", "Puppet", "SaltStack"], level: "important" },
      { name: "Web Servers", tools: ["Nginx", "Apache", "HAProxy", "Traefik"], level: "important" }
    ]
  },
  containers: {
    title: "Containerization & Orchestration",
    items: [
      { name: "Container Technology", tools: ["Docker", "Podman", "containerd"], level: "critical",
        links: [
          { label: "Optimize Docker Images for Production", href: "/blog/how-to-optimize-docker-images-production-2025" },
          { label: "Serverless vs Containers", href: "/blog/serverless-vs-containers-2025" }
        ] },
      { name: "Container Orchestration", tools: ["Kubernetes", "Docker Swarm", "Nomad"], level: "critical",
        links: [
          { label: "kubectl Commands Cheat Sheet", href: "/blog/kubectl-commands-cheat-sheet-2026" },
          { label: "Kubernetes Resource Requests & Limits", href: "/blog/kubernetes-resource-requests-limits-guide-2026" },
          { label: "Kubernetes Networking & Ingress Basics", href: "/blog/kubernetes-ingress-networking-basics-2026" },
          { label: "Helm Charts Tutorial", href: "/blog/helm-charts-tutorial-2026" },
          { label: "Kubernetes Deployment Strategies", href: "/blog/kubernetes-deployment-strategies-2025-complete-guide" },
          { label: "Kubernetes Troubleshooting Guide", href: "/blog/kubernetes-troubleshooting-guide-2026" },
          { label: "Amazon EKS", href: "/blog/amazon-eks-guide-2026" }
        ] },
      { name: "Service Mesh", tools: ["Istio", "Linkerd", "Consul Connect"], level: "advanced" },
      { name: "Container Registries", tools: ["Docker Hub", "ECR", "ACR", "Harbor"], level: "important" }
    ]
  },
  cicd: {
    title: "CI/CD & Automation",
    items: [
      { name: "CI/CD Platforms", tools: ["GitHub Actions", "GitLab CI", "Jenkins", "Azure DevOps"], level: "critical",
        links: [
          { label: "Build a CI/CD Pipeline with GitHub Actions", href: "/blog/how-to-build-cicd-pipeline-github-actions-2025" },
          { label: "GitHub Actions vs GitLab CI vs Jenkins", href: "/blog/github-actions-vs-gitlab-ci-vs-jenkins-2025-comparison" },
          { label: "GitHub Actions Reusable Workflows", href: "/blog/github-actions-reusable-workflows-guide-2026" },
          { label: "CI/CD for Monorepos", href: "/blog/cicd-monorepos-guide-2026" },
          { label: "GitHub Actions to AWS with OIDC", href: "/blog/github-actions-aws-oidc-guide-2026" }
        ] },
      { name: "Build Tools", tools: ["Maven", "Gradle", "npm", "pip"], level: "important" },
      { name: "Code Quality", tools: ["SonarQube", "CodeClimate", "ESLint", "Black"], level: "important" },
      { name: "Testing", tools: ["Jest", "Pytest", "Selenium", "JUnit"], level: "important",
        links: [
          { label: "Terraform Testing", href: "/blog/terraform-testing-guide-2026" }
        ] }
    ]
  },
  monitoring: {
    title: "Monitoring & Observability",
    items: [
      { name: "Metrics & Monitoring", tools: ["Prometheus", "Grafana", "Datadog", "New Relic"], level: "critical",
        links: [
          { label: "Prometheus Monitoring", href: "/blog/prometheus-monitoring-guide-2026" },
          { label: "Kubernetes Observability", href: "/blog/kubernetes-observability-guide-2026" }
        ] },
      { name: "Logging", tools: ["ELK Stack", "Fluentd", "Loki", "Splunk"], level: "critical",
        links: [
          { label: "Kubernetes Logging", href: "/blog/kubernetes-logging-guide-2026" },
          { label: "Kubernetes Observability", href: "/blog/kubernetes-observability-guide-2026" }
        ] },
      { name: "Tracing", tools: ["Jaeger", "Zipkin", "OpenTelemetry"], level: "advanced",
        links: [
          { label: "Kubernetes Observability", href: "/blog/kubernetes-observability-guide-2026" }
        ] },
      { name: "APM", tools: ["Datadog APM", "New Relic", "AppDynamics"], level: "important" }
    ]
  },
  security: {
    title: "Security & Compliance",
    items: [
      { name: "Container Security", tools: ["Trivy", "Clair", "Anchore", "Snyk"], level: "critical",
        links: [
          { label: "Kubernetes Security Basics", href: "/blog/kubernetes-security-basics-guide-2026" },
          { label: "DevSecOps Checklist", href: "/blog/devsecops-checklist-securing-pipeline-2025" },
          { label: "Optimize Docker Images for Production", href: "/blog/how-to-optimize-docker-images-production-2025" }
        ] },
      { name: "Secrets Management", tools: ["HashiCorp Vault", "AWS Secrets Manager", "Azure Key Vault"], level: "critical",
        links: [
          { label: "Kubernetes ConfigMaps & Secrets", href: "/blog/kubernetes-configmaps-secrets-guide-2026" },
          { label: "GitHub Actions to AWS with OIDC", href: "/blog/github-actions-aws-oidc-guide-2026" }
        ] },
      { name: "Security Scanning", tools: ["OWASP ZAP", "SonarQube", "Checkmarx"], level: "important",
        links: [
          { label: "DevSecOps Checklist", href: "/blog/devsecops-checklist-securing-pipeline-2025" }
        ] },
      { name: "Compliance", tools: ["Open Policy Agent", "Falco", "Admission Controllers"], level: "advanced",
        links: [
          { label: "Kubernetes Security Basics", href: "/blog/kubernetes-security-basics-guide-2026" }
        ] }
    ]
  },
  databases: {
    title: "Databases & Storage",
    items: [
      { name: "Relational Databases", tools: ["PostgreSQL", "MySQL", "SQL Server"], level: "important" },
      { name: "NoSQL Databases", tools: ["MongoDB", "Redis", "Cassandra", "DynamoDB"], level: "important" },
      { name: "Database Tools", tools: ["pgAdmin", "MongoDB Compass", "Redis CLI"], level: "useful" },
      { name: "Backup & Recovery", tools: ["pg_dump", "mongodump", "AWS RDS Snapshots"], level: "important",
        links: [
          { label: "Backup Verification", href: "/blog/backup-verification-in-2026-exit-code-0-is-not-a-backup" },
          { label: "Restore Drills", href: "/blog/restore-drills-in-2026-you-cant-automate-the-declaration" },
          { label: "Declared, Not Derived", href: "/blog/declared-not-derived-backup-checks" },
          { label: "Kubernetes Backup & Disaster Recovery", href: "/blog/kubernetes-backup-disaster-recovery-guide-2026" }
        ] }
    ]
  },
  advanced: {
    title: "Advanced Topics",
    items: [
      { name: "GitOps", tools: ["ArgoCD", "Flux", "Jenkins X"], level: "advanced",
        links: [
          { label: "GitOps vs Traditional CI/CD", href: "/blog/gitops-vs-traditional-cicd-2025-comparison" },
          { label: "Argo CD Tutorial", href: "/blog/argo-cd-tutorial-gitops-2026" },
          { label: "Argo Rollouts Progressive Delivery", href: "/blog/argo-rollouts-progressive-delivery-2026" },
          { label: "Self-Healing Infrastructure", href: "/blog/self-healing-infrastructure-2025" }
        ] },
      { name: "Chaos Engineering", tools: ["Chaos Monkey", "Litmus", "Gremlin"], level: "advanced" },
      { name: "ML/AI Operations", tools: ["MLflow", "Kubeflow", "TensorFlow Serving"], level: "specialized",
        links: [
          { label: "AI for DevOps", href: "/blog/ai-for-devops-practical-guide-2026" }
        ] },
      { name: "Edge Computing", tools: ["K3s", "KubeEdge", "AWS IoT Greengrass"], level: "specialized" }
    ]
  }
};

const certifications = [
  { name: "AWS Certified DevOps Engineer – Professional", provider: "AWS", level: "Advanced", difficulty: "Hard" },
  { name: "Azure DevOps Engineer Expert", provider: "Microsoft", level: "Advanced", difficulty: "Hard" },
  { name: "Google Cloud Professional DevOps Engineer", provider: "Google", level: "Advanced", difficulty: "Hard" },
  { name: "Certified Kubernetes Administrator (CKA)", provider: "CNCF", level: "Intermediate", difficulty: "Medium" },
  { name: "Certified Kubernetes Application Developer (CKAD)", provider: "CNCF", level: "Intermediate", difficulty: "Medium" },
  { name: "HashiCorp Certified: Terraform Associate", provider: "HashiCorp", level: "Beginner", difficulty: "Easy" },
  { name: "Docker Certified Associate", provider: "Docker", level: "Beginner", difficulty: "Easy" },
  { name: "Jenkins Engineer", provider: "CloudBees", level: "Intermediate", difficulty: "Medium" }
];

function DevOpsSection({ section, title }) {
  const getLevelColor = (level) => {
    switch (level) {
      case 'essential':
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'important':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'advanced':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'useful':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'specialized':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
      <h3 className="text-xl font-bold text-gold mb-4 flex items-center">
        <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
        {title}
      </h3>
      <div className="space-y-4">
        {section.items.map((item, index) => (
          <div key={index} className="border border-charcoal/40 rounded-lg p-4 hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-warm-white">{item.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(item.level)}`}>
                {item.level}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.tools.map((tool, toolIndex) => (
                <span
                  key={toolIndex}
                  className="bg-charcoal/60 text-warm-white/80 px-3 py-1 rounded-full text-sm hover:bg-gold/20 hover:text-gold transition-all cursor-default"
                >
                  {tool}
                </span>
              ))}
            </div>
            {item.links && item.links.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-charcoal/40">
                <span className="text-xs uppercase tracking-wide text-gold/80 font-semibold">Start here →</span>
                <ul className="mt-2 space-y-1">
                  {item.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className="text-sm text-warm-white/85 hover:text-gold underline decoration-gold/40 underline-offset-2 transition-all">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 pt-3 border-t border-charcoal/40 text-sm text-warm-white/40 italic">Coming soon</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationCard({ cert }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Hard':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Intermediate':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Advanced':
        return 'bg-gold/20 text-gold border-gold/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-gold/20 rounded-lg p-4 hover:border-gold/40 transition-all">
      <h4 className="font-semibold text-warm-white mb-2">{cert.name}</h4>
      <p className="text-warm-white/60 text-sm mb-3">by {cert.provider}</p>
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(cert.level)}`}>
          {cert.level}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(cert.difficulty)}`}>
          {cert.difficulty}
        </span>
      </div>
    </div>
  );
}

export default function DevOpsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rich-black via-charcoal to-rich-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-charcoal via-rich-black to-charcoal">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-amber/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold mb-8">
              DevOps Roadmap: Learn to Become a DevOps Engineer
            </h1>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-4">
              Step-by-step guide to learning DevOps in 2026. Every step links to a free, hands-on tutorial.
            </p>
            <p className="text-sm text-warm-white/50 mb-8">Updated November 2026</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/blog"
                className="bg-gradient-to-r from-gold to-amber text-charcoal px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
              >
                Read DevOps Guides
              </Link>
              <Link
                href="/contact"
                className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
              >
                Get Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Explainer Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">What is a DevOps Engineer?</h2>
            <p className="text-lg text-warm-white/75 leading-relaxed">
              A DevOps engineer builds and runs the systems that deliver software: the pipelines that test and
              deploy code, the infrastructure it runs on, and the monitoring that proves it is healthy. It is an
              operations role with a software mindset — instead of manual, one-off fixes, a DevOps engineer
              automates the path from commit to production so releases are fast, repeatable and safe.
            </p>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">What Does a DevOps Engineer Do Day to Day?</h2>
            <p className="text-lg text-warm-white/75 leading-relaxed">
              Typical days mix building and firefighting: improving CI/CD pipelines, writing infrastructure as
              code, keeping Kubernetes clusters healthy, responding to incidents — and removing the manual steps
              that caused them. The ratio shifts with seniority, towards more design and prevention and less
              reaction, but the constant is ownership of how software reaches its users.
            </p>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">How Do You Become a DevOps Engineer?</h2>
            <p className="text-lg text-warm-white/75 leading-relaxed">
              Follow the roadmap on this page in order: prerequisites first (Linux, networking, Git and
              scripting), then infrastructure and containers, then CI/CD and observability, then security and the
              advanced topics. Every section links to the free tutorials on this site that teach it, in the order
              to read them — start with the{' '}
              <Link href="/blog/top-10-devops-tools-2025" className="text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
                tools and skills overview
              </Link>
              , then work through the Prerequisites section just below.
            </p>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">DevOps Learning Path</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Follow this structured roadmap to build your DevOps expertise from beginner to advanced level.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Essential/Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Important</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Advanced</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Useful</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            <span className="text-warm-white/70 text-sm">Specialized</span>
          </div>
        </div>

        {/* DevOps Sections Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(devopsRoadmap).map(([key, section]) => (
            <DevOpsSection
              key={key}
              section={section}
              title={section.title}
            />
          ))}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Popular DevOps Certifications</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              Industry-recognized certifications to validate your DevOps expertise and advance your career.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {certifications.map((cert, index) => (
              <CertificationCard key={index} cert={cert} />
            ))}
          </div>
        </div>
      </div>

      {/* Career Advice Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-gold/10 to-amber/5 border border-gold/20 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6 text-center">DevOps Career Tips</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">1</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Start with Fundamentals</h3>
              <p className="text-warm-white/70 text-sm">Master Linux, networking, and at least one programming language before moving to DevOps tools.</p>
              <Link href="/blog/top-10-devops-tools-2025" className="inline-block mt-3 text-sm text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
                See the tools in learning order →
              </Link>
            </div>
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">2</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Hands-on Practice</h3>
              <p className="text-warm-white/70 text-sm">Build real projects, contribute to open source, and maintain your own infrastructure lab.</p>
            </div>
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">3</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Stay Updated</h3>
              <p className="text-warm-white/70 text-sm">DevOps evolves rapidly. Follow industry blogs, join communities, and experiment with new tools.</p>
            </div>
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">4</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Learn From a Real Career Path</h3>
              <p className="text-warm-white/70 text-sm">See how one engineer moved from development into DevOps — and on into project work — in Japan.</p>
              <Link href="/blog/how-to-become-devops-engineer-japan-2025-career-guide" className="inline-block mt-3 text-sm text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
                Read the Japan career guide →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Roadmaps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Related Roadmaps</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            The DevOps path does not stand alone — these are the routes that branch off it.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/cloud" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
            <h3 className="text-xl font-bold text-gold mb-2">Cloud Roadmap</h3>
            <p className="text-warm-white/70 text-sm leading-relaxed">AWS, Azure and GCP step by step — the infrastructure layer underneath every DevOps stack.</p>
          </Link>
          <Link href="/cybersecurity" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
            <h3 className="text-xl font-bold text-gold mb-2">Cybersecurity Roadmap</h3>
            <p className="text-warm-white/70 text-sm leading-relaxed">Fundamentals through cloud security and DevSecOps — the other half of shipping safely.</p>
          </Link>
          <Link href="/roadmaps#kubernetes-in-production" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
            <h3 className="text-xl font-bold text-gold mb-2">Kubernetes in Production</h3>
            <p className="text-warm-white/70 text-sm leading-relaxed">This roadmap's deepest section as one ordered run: 22 tutorials, starting with the kubectl Commands Cheat Sheet.</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">DevOps Roadmap FAQ</h2>
          </div>
          <div className="space-y-6">
            <div className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">What skills are required to become a DevOps Engineer?</h3>
              <p className="text-warm-white/70 leading-relaxed">Linux and networking fundamentals, one scripting language (Python or Bash) and Git — then the delivery stack: CI/CD, Docker, Kubernetes, infrastructure as code with Terraform, and monitoring. The roadmap above orders them the way working engineers actually meet them: start at Prerequisites and move down.</p>
            </div>
            <div className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">Does a DevOps Engineer need to know how to code?</h3>
              <p className="text-warm-white/70 leading-relaxed">Yes — but not like an application developer. You need to read code, write scripts and automation, and work in YAML and configuration files daily. Fluency in Python or Bash matters more than algorithms: the goal is automating operations, not shipping product features.</p>
            </div>
            <div className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">How long does it take to become a DevOps Engineer?</h3>
              <p className="text-warm-white/70 leading-relaxed">With an IT or development background, 6–12 months of steady hands-on practice is a realistic range to become ready for a junior DevOps role. Starting from zero takes longer — the fundamentals (Linux, networking, Git) are not optional shortcuts, and skipping them shows up in interviews.</p>
            </div>
            <div className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">Should I learn Docker or Kubernetes first?</h3>
              <p className="text-warm-white/70 leading-relaxed">Docker first. Kubernetes orchestrates containers, so its core ideas only make sense once images and containers are familiar. The Containerization &amp; Orchestration section follows exactly that order — Docker, then the kubectl cheat sheet and the production Kubernetes guides.</p>
            </div>
            <div className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">What is the first thing to learn in DevOps?</h3>
              <p className="text-warm-white/70 leading-relaxed">Linux. Almost every tool on this roadmap runs on it, and every interview assumes it. After Linux, learn Git and one scripting language — those three unlock everything below them.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-charcoal via-rich-black to-charcoal py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold mb-6">
            Ready to Start Your DevOps Journey?
          </h2>
          <p className="text-lg text-warm-white/80 mb-8 leading-relaxed">
            Get personalized guidance, practical tutorials, and expert insights to accelerate your DevOps career.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog/how-to-become-devops-engineer-japan-2025-career-guide"
              className="bg-gradient-to-r from-gold to-amber text-charcoal px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
            >
              DevOps Career Guide
            </Link>
            <Link
              href="/blog"
              className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}