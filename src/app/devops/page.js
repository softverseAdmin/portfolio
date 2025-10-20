import Link from 'next/link';

export const metadata = {
  title: 'DevOps Roadmap & Tools Reference | DevOps Enginer',
  description: 'Complete DevOps roadmap, tools, and technologies reference guide. Learn the essential skills, tools, and career path for becoming a successful DevOps engineer.',
  keywords: 'devops roadmap, devops tools, devops engineer, kubernetes, docker, aws, terraform, jenkins, gitlab, monitoring, security, career guide',
  openGraph: {
    title: 'DevOps Roadmap & Tools Reference | DevOps Enginer',
    description: 'Complete DevOps roadmap, tools, and technologies reference guide. Learn the essential skills, tools, and career path for becoming a successful DevOps engineer.',
    type: 'website',
  }
};

const devopsRoadmap = {
  prerequisites: {
    title: "Prerequisites",
    items: [
      { name: "Programming Languages", tools: ["Python", "JavaScript", "Go", "Bash"], level: "essential" },
      { name: "Operating Systems", tools: ["Linux", "Windows", "macOS"], level: "essential" },
      { name: "Networking", tools: ["TCP/IP", "DNS", "HTTP/HTTPS", "Load Balancing"], level: "essential" },
      { name: "Version Control", tools: ["Git", "GitHub", "GitLab"], level: "essential" }
    ]
  },
  infrastructure: {
    title: "Infrastructure & Cloud",
    items: [
      { name: "Cloud Providers", tools: ["AWS", "Azure", "GCP", "DigitalOcean"], level: "critical" },
      { name: "Infrastructure as Code", tools: ["Terraform", "CloudFormation", "Pulumi", "CDK"], level: "critical" },
      { name: "Configuration Management", tools: ["Ansible", "Chef", "Puppet", "SaltStack"], level: "important" },
      { name: "Web Servers", tools: ["Nginx", "Apache", "HAProxy", "Traefik"], level: "important" }
    ]
  },
  containers: {
    title: "Containerization & Orchestration",
    items: [
      { name: "Container Technology", tools: ["Docker", "Podman", "containerd"], level: "critical" },
      { name: "Container Orchestration", tools: ["Kubernetes", "Docker Swarm", "Nomad"], level: "critical" },
      { name: "Service Mesh", tools: ["Istio", "Linkerd", "Consul Connect"], level: "advanced" },
      { name: "Container Registries", tools: ["Docker Hub", "ECR", "ACR", "Harbor"], level: "important" }
    ]
  },
  cicd: {
    title: "CI/CD & Automation",
    items: [
      { name: "CI/CD Platforms", tools: ["GitHub Actions", "GitLab CI", "Jenkins", "Azure DevOps"], level: "critical" },
      { name: "Build Tools", tools: ["Maven", "Gradle", "npm", "pip"], level: "important" },
      { name: "Code Quality", tools: ["SonarQube", "CodeClimate", "ESLint", "Black"], level: "important" },
      { name: "Testing", tools: ["Jest", "Pytest", "Selenium", "JUnit"], level: "important" }
    ]
  },
  monitoring: {
    title: "Monitoring & Observability",
    items: [
      { name: "Metrics & Monitoring", tools: ["Prometheus", "Grafana", "Datadog", "New Relic"], level: "critical" },
      { name: "Logging", tools: ["ELK Stack", "Fluentd", "Loki", "Splunk"], level: "critical" },
      { name: "Tracing", tools: ["Jaeger", "Zipkin", "OpenTelemetry"], level: "advanced" },
      { name: "APM", tools: ["Datadog APM", "New Relic", "AppDynamics"], level: "important" }
    ]
  },
  security: {
    title: "Security & Compliance",
    items: [
      { name: "Container Security", tools: ["Trivy", "Clair", "Anchore", "Snyk"], level: "critical" },
      { name: "Secrets Management", tools: ["HashiCorp Vault", "AWS Secrets Manager", "Azure Key Vault"], level: "critical" },
      { name: "Security Scanning", tools: ["OWASP ZAP", "SonarQube", "Checkmarx"], level: "important" },
      { name: "Compliance", tools: ["Open Policy Agent", "Falco", "Admission Controllers"], level: "advanced" }
    ]
  },
  databases: {
    title: "Databases & Storage",
    items: [
      { name: "Relational Databases", tools: ["PostgreSQL", "MySQL", "SQL Server"], level: "important" },
      { name: "NoSQL Databases", tools: ["MongoDB", "Redis", "Cassandra", "DynamoDB"], level: "important" },
      { name: "Database Tools", tools: ["pgAdmin", "MongoDB Compass", "Redis CLI"], level: "useful" },
      { name: "Backup & Recovery", tools: ["pg_dump", "mongodump", "AWS RDS Snapshots"], level: "important" }
    ]
  },
  advanced: {
    title: "Advanced Topics",
    items: [
      { name: "GitOps", tools: ["ArgoCD", "Flux", "Jenkins X"], level: "advanced" },
      { name: "Chaos Engineering", tools: ["Chaos Monkey", "Litmus", "Gremlin"], level: "advanced" },
      { name: "ML/AI Operations", tools: ["MLflow", "Kubeflow", "TensorFlow Serving"], level: "specialized" },
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
              DevOps Roadmap & Reference
            </h1>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Your complete guide to DevOps tools, technologies, and career progression. 
              Master the essential skills and technologies needed to excel as a DevOps engineer.
            </p>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="bg-gold/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold font-bold">1</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Start with Fundamentals</h3>
              <p className="text-warm-white/70 text-sm">Master Linux, networking, and at least one programming language before moving to DevOps tools.</p>
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