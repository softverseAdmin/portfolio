import Link from 'next/link';

export const metadata = {
  title: 'Cloud Roadmap: Learn AWS, Azure & GCP Step by Step',
  description: 'Free cloud computing roadmap for 2026: learn AWS step by step — IAM, VPC, EC2, EKS and cost optimization — with a hands-on tutorial for every step.',
  keywords: 'cloud roadmap, aws roadmap, learn aws, cloud computing, Azure, GCP, cloud architecture, cloud migration, serverless, kubernetes, cloud security, multi-cloud, hybrid cloud',
  openGraph: {
    title: 'Cloud Roadmap: Learn AWS, Azure & GCP Step by Step | DevOps Enginer',
    description: 'Free cloud computing roadmap for 2026: learn AWS step by step — IAM, VPC, EC2, EKS and cost optimization — with a hands-on tutorial for every step.',
    type: 'website',
  }
};

const cloudProviders = {
  aws: {
    name: "Amazon Web Services",
    marketShare: "32%",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10 border-orange-500/30",
    textColor: "text-orange-300",
    services: {
      compute: ["EC2", "Lambda", "ECS", "EKS", "Fargate", "Batch"],
      storage: ["S3", "EBS", "EFS", "FSx", "Storage Gateway"],
      database: ["RDS", "DynamoDB", "DocumentDB", "ElastiCache", "Redshift"],
      networking: ["VPC", "CloudFront", "Route 53", "API Gateway", "ELB"],
      security: ["IAM", "KMS", "Secrets Manager", "GuardDuty", "WAF"],
      monitoring: ["CloudWatch", "X-Ray", "CloudTrail", "Config"],
      devops: ["CodeCommit", "CodeBuild", "CodeDeploy", "CodePipeline"]
    }
  },
  azure: {
    name: "Microsoft Azure",
    marketShare: "23%",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    textColor: "text-blue-300",
    services: {
      compute: ["Virtual Machines", "Functions", "Container Instances", "AKS", "App Service"],
      storage: ["Blob Storage", "File Storage", "Disk Storage", "Archive Storage"],
      database: ["SQL Database", "Cosmos DB", "PostgreSQL", "MySQL", "Redis Cache"],
      networking: ["Virtual Network", "CDN", "DNS", "Application Gateway", "Load Balancer"],
      security: ["Active Directory", "Key Vault", "Security Center", "Sentinel"],
      monitoring: ["Monitor", "Application Insights", "Log Analytics"],
      devops: ["DevOps", "Pipelines", "Repos", "Artifacts", "Test Plans"]
    }
  },
  gcp: {
    name: "Google Cloud Platform",
    marketShare: "10%",
    color: "from-green-500 to-blue-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    textColor: "text-green-300",
    services: {
      compute: ["Compute Engine", "Cloud Functions", "Cloud Run", "GKE", "App Engine"],
      storage: ["Cloud Storage", "Persistent Disk", "Filestore", "Archive Storage"],
      database: ["Cloud SQL", "Firestore", "Bigtable", "Spanner", "Memorystore"],
      networking: ["VPC", "Cloud CDN", "Cloud DNS", "Load Balancing"],
      security: ["IAM", "Cloud KMS", "Security Command Center", "Cloud Armor"],
      monitoring: ["Cloud Monitoring", "Cloud Logging", "Cloud Trace", "Error Reporting"],
      devops: ["Cloud Build", "Source Repositories", "Container Registry", "Deployment Manager"]
    }
  }
};

const providerCategoryLinks = {
  aws: {
    compute: [
      { label: "Amazon EKS", href: "/blog/amazon-eks-guide-2026" },
      { label: "Serverless vs Containers", href: "/blog/serverless-vs-containers-2025" }
    ],
    networking: [
      { label: "AWS VPC", href: "/blog/aws-vpc-guide-2026" }
    ],
    security: [
      { label: "AWS IAM Least Privilege", href: "/blog/aws-iam-least-privilege-guide-2026" },
      { label: "GitHub Actions to AWS with OIDC", href: "/blog/github-actions-aws-oidc-guide-2026" }
    ],
    devops: [
      { label: "GitHub Actions to AWS with OIDC", href: "/blog/github-actions-aws-oidc-guide-2026" },
      { label: "Build a CI/CD Pipeline with GitHub Actions", href: "/blog/how-to-build-cicd-pipeline-github-actions-2025" }
    ]
  }
};

const cloudArchitecturePatterns = [
  {
    name: "Microservices Architecture",
    description: "Break applications into small, independent services",
    benefits: ["Scalability", "Resilience", "Technology Diversity", "Team Independence"],
    tools: ["Kubernetes", "Service Mesh", "API Gateway", "Container Registry"],
    links: [
      { label: "Kubernetes Networking & Ingress Basics", href: "/blog/kubernetes-ingress-networking-basics-2026" },
      { label: "Kubernetes Deployment Strategies", href: "/blog/kubernetes-deployment-strategies-2025-complete-guide" },
      { label: "Platform Engineering in Practice", href: "/blog/platform-engineering-in-practice-2026" }
    ],
    difficulty: "Advanced"
  },
  {
    name: "Serverless Architecture",
    description: "Event-driven, function-based computing model",
    benefits: ["Cost Efficiency", "Auto Scaling", "No Server Management", "Fast Deployment"],
    tools: ["AWS Lambda", "Azure Functions", "Google Cloud Functions", "API Gateway"],
    links: [
      { label: "Serverless vs Containers", href: "/blog/serverless-vs-containers-2025" }
    ],
    difficulty: "Intermediate"
  },
  {
    name: "Event-Driven Architecture",
    description: "Systems that communicate through events and messages",
    benefits: ["Loose Coupling", "Scalability", "Real-time Processing", "Resilience"],
    tools: ["EventBridge", "Service Bus", "Pub/Sub", "Apache Kafka"],
    difficulty: "Advanced"
  },
  {
    name: "Multi-Cloud Strategy",
    description: "Use multiple cloud providers for redundancy and optimization",
    benefits: ["Avoid Vendor Lock-in", "Best-of-Breed", "Risk Mitigation", "Global Reach"],
    tools: ["Terraform", "Kubernetes", "HashiCorp Consul", "Istio"],
    links: [
      { label: "Multi-Cloud Strategy", href: "/blog/multi-cloud-strategy-2025" },
      { label: "Terraform vs Pulumi vs CloudFormation", href: "/blog/terraform-vs-pulumi-cloudformation-2025-iac-comparison" }
    ],
    difficulty: "Expert"
  },
  {
    name: "Hybrid Cloud",
    description: "Combine on-premises and cloud infrastructure",
    benefits: ["Flexibility", "Security", "Cost Control", "Compliance"],
    tools: ["Azure Arc", "AWS Outposts", "Google Anthos", "VMware Cloud"],
    difficulty: "Advanced"
  },
  {
    name: "Edge Computing",
    description: "Process data closer to where it's generated",
    benefits: ["Low Latency", "Bandwidth Optimization", "Privacy", "Reliability"],
    tools: ["AWS Wavelength", "Azure Edge Zones", "Google Edge TPU", "CloudFlare Workers"],
    difficulty: "Specialized"
  }
];

const cloudCertifications = [
  {
    provider: "AWS",
    certs: [
      { name: "Cloud Practitioner", level: "Foundational", difficulty: "Easy" },
      { name: "Solutions Architect Associate", level: "Associate", difficulty: "Medium" },
      { name: "Solutions Architect Professional", level: "Professional", difficulty: "Hard" },
      { name: "DevOps Engineer Professional", level: "Professional", difficulty: "Hard" }
    ]
  },
  {
    provider: "Microsoft Azure",
    certs: [
      { name: "Azure Fundamentals (AZ-900)", level: "Foundational", difficulty: "Easy" },
      { name: "Azure Administrator (AZ-104)", level: "Associate", difficulty: "Medium" },
      { name: "Azure Solutions Architect Expert", level: "Expert", difficulty: "Hard" },
      { name: "Azure DevOps Engineer Expert", level: "Expert", difficulty: "Hard" }
    ]
  },
  {
    provider: "Google Cloud",
    certs: [
      { name: "Cloud Digital Leader", level: "Foundational", difficulty: "Easy" },
      { name: "Associate Cloud Engineer", level: "Associate", difficulty: "Medium" },
      { name: "Professional Cloud Architect", level: "Professional", difficulty: "Hard" },
      { name: "Professional DevOps Engineer", level: "Professional", difficulty: "Hard" }
    ]
  }
];

const cloudBestPractices = [
  {
    category: "Security",
    practices: [
      "Implement least privilege access",
      "Enable multi-factor authentication",
      "Encrypt data at rest and in transit",
      "Regular security audits and monitoring",
      "Use managed identity services"
    ],
    links: [
      { label: "AWS IAM Least Privilege", href: "/blog/aws-iam-least-privilege-guide-2026" },
      { label: "DevSecOps Checklist", href: "/blog/devsecops-checklist-securing-pipeline-2025" }
    ]
  },
  {
    category: "Cost Optimization",
    practices: [
      "Right-size your resources",
      "Use reserved instances for predictable workloads",
      "Implement auto-scaling",
      "Monitor and analyze costs regularly",
      "Use spot instances for fault-tolerant workloads"
    ],
    links: [
      { label: "AWS Cost Optimization", href: "/blog/aws-cost-optimization-15-tactics-saved-50k-month" },
      { label: "Kubernetes Cost Optimization", href: "/blog/kubernetes-cost-optimization-guide-2026" }
    ]
  },
  {
    category: "Performance",
    practices: [
      "Choose appropriate instance types",
      "Use CDN for global content delivery",
      "Implement caching strategies",
      "Optimize database queries",
      "Monitor application performance"
    ],
    links: [
      { label: "Kubernetes Resource Requests & Limits", href: "/blog/kubernetes-resource-requests-limits-guide-2026" },
      { label: "Kubernetes Autoscaling", href: "/blog/kubernetes-autoscaling-guide-2026" }
    ]
  },
  {
    category: "Reliability",
    practices: [
      "Design for failure",
      "Implement health checks",
      "Use multiple availability zones",
      "Regular backup and disaster recovery testing",
      "Implement circuit breaker patterns"
    ],
    links: [
      { label: "Kubernetes Backup & Disaster Recovery", href: "/blog/kubernetes-backup-disaster-recovery-guide-2026" },
      { label: "Kubernetes Pod Disruption Budgets", href: "/blog/kubernetes-pod-disruption-budgets-guide-2026" },
      { label: "Backup Verification", href: "/blog/backup-verification-in-2026-exit-code-0-is-not-a-backup" }
    ]
  }
];

function CloudProviderCard({ provider, data }) {
  return (
    <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold bg-gradient-to-r ${data.color} bg-clip-text text-transparent`}>
          {data.name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.bgColor} ${data.textColor}`}>
          {data.marketShare} Market Share
        </span>
      </div>
      
      <div className="space-y-4">
        {Object.entries(data.services).map(([category, services]) => (
          <div key={category}>
            <h4 className="font-semibold text-warm-white mb-2 capitalize">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {services.map((service, index) => (
                <span
                  key={index}
                  className="bg-charcoal/60 text-warm-white/80 px-2 py-1 rounded text-sm hover:bg-gold/20 hover:text-gold transition-all cursor-default"
                >
                  {service}
                </span>
              ))}
            </div>
            {providerCategoryLinks[provider] && providerCategoryLinks[provider][category] ? (
              <div className="mt-3">
                <span className="text-xs uppercase tracking-wide text-gold/80 font-semibold">Start here →</span>
                <ul className="mt-1 space-y-1">
                  {providerCategoryLinks[provider][category].map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className="text-sm text-warm-white/85 hover:text-gold underline decoration-gold/40 underline-offset-2 transition-all">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-warm-white/40 italic">Coming soon</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitecturePatternCard({ pattern }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Intermediate':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Advanced':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Expert':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Specialized':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-gold/20 rounded-lg p-6 hover:border-gold/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gold">{pattern.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(pattern.difficulty)}`}>
          {pattern.difficulty}
        </span>
      </div>
      <p className="text-warm-white/70 text-sm mb-4">{pattern.description}</p>
      
      <div className="mb-4">
        <h5 className="font-semibold text-warm-white mb-2">Benefits:</h5>
        <div className="flex flex-wrap gap-2">
          {pattern.benefits.map((benefit, index) => (
            <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
              {benefit}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h5 className="font-semibold text-warm-white mb-2">Key Tools:</h5>
        <div className="flex flex-wrap gap-2">
          {pattern.tools.map((tool, index) => (
            <span key={index} className="bg-charcoal/60 text-warm-white/80 px-2 py-1 rounded text-xs">
              {tool}
            </span>
          ))}
        </div>
      </div>

      {pattern.links && pattern.links.length > 0 ? (
        <div className="mt-4">
          <span className="text-xs uppercase tracking-wide text-gold/80 font-semibold">Start here →</span>
          <ul className="mt-2 space-y-1">
            {pattern.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link href={link.href} className="text-sm text-warm-white/85 hover:text-gold underline decoration-gold/40 underline-offset-2 transition-all">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-warm-white/40 italic">Coming soon</p>
      )}
    </div>
  );
}

function CertificationSection({ provider }) {
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

  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-gold/20 rounded-lg p-6">
      <h4 className="font-bold text-gold mb-4">{provider.provider} Certifications</h4>
      <div className="space-y-3">
        {provider.certs.map((cert, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-charcoal/30 rounded">
            <div>
              <h5 className="font-semibold text-warm-white text-sm">{cert.name}</h5>
              <p className="text-warm-white/60 text-xs">{cert.level}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(cert.difficulty)}`}>
              {cert.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BestPracticesCard({ category, practices, links }) {
  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-gold/20 rounded-lg p-6">
      <h4 className="font-bold text-gold mb-4">{category}</h4>
      <ul className="space-y-2">
        {practices.map((practice, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-gold text-sm mt-1">•</span>
            <span className="text-warm-white/80 text-sm">{practice}</span>
          </li>
        ))}
      </ul>
      {links && links.length > 0 ? (
        <div className="mt-4">
          <span className="text-xs uppercase tracking-wide text-gold/80 font-semibold">Start here →</span>
          <ul className="mt-2 space-y-1">
            {links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link href={link.href} className="text-sm text-warm-white/85 hover:text-gold underline decoration-gold/40 underline-offset-2 transition-all">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-warm-white/40 italic">Coming soon</p>
      )}
    </div>
  );
}

export default function CloudPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rich-black via-charcoal to-rich-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-charcoal via-rich-black to-charcoal">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mb-8">
              Cloud Computing Roadmap: Learn AWS Step by Step in 2026
            </h1>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-4">
              A free, ordered path from cloud fundamentals to production AWS — every step is a hands-on tutorial.
            </p>
            <p className="text-sm text-warm-white/50 mb-8">Updated November 2026</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/blog"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Read Cloud Guides
              </Link>
              <Link
                href="/devops"
                className="border border-blue-400 text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-blue-400/10 transition-all"
              >
                DevOps Roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How to Learn Cloud Computing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-400 mb-6">How to Learn Cloud Computing</h2>
        <p className="text-lg text-warm-white/75 leading-relaxed mb-6">
          Cloud is too wide to learn as a catalogue, so learn it as a path. Start with the fundamentals that every
          provider shares — accounts, identity, networking, storage — then go deep on one provider. AWS is the
          deepest route on this site: it has the largest job market, and its core services teach concepts that
          transfer to Azure and GCP afterwards.
        </p>
        <p className="text-lg text-warm-white/75 leading-relaxed mb-8">
          Work through the AWS steps in this order — each one is a free, hands-on tutorial:
        </p>
        <ol className="space-y-4">
          <li className="flex items-start gap-4">
            <span className="bg-blue-400/20 w-10 h-10 shrink-0 rounded-full flex items-center justify-center"><span className="text-blue-400 font-bold">1</span></span>
            <div>
              <Link href="/blog/aws-iam-least-privilege-guide-2026" className="font-semibold text-warm-white hover:text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition-all">AWS IAM Least Privilege</Link>
              <p className="text-warm-white/70 text-sm leading-relaxed">Identity first: users, roles and policies done properly, before you build anything.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="bg-blue-400/20 w-10 h-10 shrink-0 rounded-full flex items-center justify-center"><span className="text-blue-400 font-bold">2</span></span>
            <div>
              <Link href="/blog/aws-vpc-guide-2026" className="font-semibold text-warm-white hover:text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition-all">AWS VPC</Link>
              <p className="text-warm-white/70 text-sm leading-relaxed">The network your services live in: subnets, routing and security groups.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="bg-blue-400/20 w-10 h-10 shrink-0 rounded-full flex items-center justify-center"><span className="text-blue-400 font-bold">3</span></span>
            <div>
              <Link href="/blog/amazon-eks-guide-2026" className="font-semibold text-warm-white hover:text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition-all">Amazon EKS</Link>
              <p className="text-warm-white/70 text-sm leading-relaxed">Containers in production: managed Kubernetes on AWS, end to end.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="bg-blue-400/20 w-10 h-10 shrink-0 rounded-full flex items-center justify-center"><span className="text-blue-400 font-bold">4</span></span>
            <div>
              <Link href="/blog/aws-cost-optimization-15-tactics-saved-50k-month" className="font-semibold text-warm-white hover:text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition-all">AWS Cost Optimization</Link>
              <p className="text-warm-white/70 text-sm leading-relaxed">The skill that gets cloud engineers noticed: 15 tactics that cut real bills.</p>
            </div>
          </li>
        </ol>
        <p className="text-lg text-warm-white/75 leading-relaxed mt-8">
          Two wider questions come after the AWS core. If you are choosing between running functions and running
          containers, read{' '}
          <Link href="/blog/serverless-vs-containers-2025" className="text-blue-400 underline decoration-blue-400/40 underline-offset-2 hover:text-cyan-400 transition-all">Serverless vs Containers</Link>
          ; if your organisation runs — or is considering — more than one provider, read the{' '}
          <Link href="/blog/multi-cloud-strategy-2025" className="text-blue-400 underline decoration-blue-400/40 underline-offset-2 hover:text-cyan-400 transition-all">Multi-Cloud Strategy</Link>{' '}
          guide. The full provider catalogue below is your reference for everything beyond the path.
        </p>
      </div>

      {/* Cloud Providers Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Major Cloud Providers</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Compare services and capabilities across the leading cloud platforms.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-1">
          {Object.entries(cloudProviders).map(([key, provider]) => (
            <CloudProviderCard key={key} provider={key} data={provider} />
          ))}
        </div>
      </div>

      {/* Architecture Patterns */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Cloud Architecture Patterns</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              Learn essential cloud architecture patterns for building modern, scalable applications.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cloudArchitecturePatterns.map((pattern, index) => (
              <ArchitecturePatternCard key={index} pattern={pattern} />
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Cloud Certifications</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Industry-recognized certifications to validate your cloud expertise.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cloudCertifications.map((provider, index) => (
            <CertificationSection key={index} provider={provider} />
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Cloud Best Practices</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              Essential practices for security, cost optimization, performance, and reliability.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cloudBestPractices.map((category, index) => (
              <BestPracticesCard key={index} category={category.category} practices={category.practices} links={category.links} />
            ))}
          </div>
        </div>
      </div>

      {/* Cloud Migration Strategy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-6 text-center">Cloud Migration Strategy</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="bg-blue-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Assessment & Planning</h3>
              <p className="text-warm-white/70 text-sm">Evaluate current infrastructure, dependencies, and migration readiness.</p>
              <p className="text-warm-white/40 text-xs italic mt-2">Coming soon</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Pilot Migration</h3>
              <p className="text-warm-white/70 text-sm">Start with non-critical applications to validate approach and tooling.</p>
              <p className="text-warm-white/40 text-xs italic mt-2">Coming soon</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Full Migration</h3>
              <p className="text-warm-white/70 text-sm">Execute phased migration with proper testing and rollback procedures.</p>
              <p className="text-warm-white/40 text-xs italic mt-2">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Roadmaps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Related Roadmaps</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Where the cloud path leads next.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/devops" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
            <h3 className="text-xl font-bold text-blue-400 mb-2">DevOps Roadmap</h3>
            <p className="text-warm-white/70 text-sm leading-relaxed">Where EKS and Kubernetes continue: CI/CD, GitOps, observability and the full production stack.</p>
          </Link>
          <Link href="/cybersecurity" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
            <h3 className="text-xl font-bold text-blue-400 mb-2">Cybersecurity Roadmap</h3>
            <p className="text-warm-white/70 text-sm leading-relaxed">The cloud security section in full — IAM, container security and DevSecOps.</p>
          </Link>
          <Link href="/resources" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
            <h3 className="text-xl font-bold text-blue-400 mb-2">Resources</h3>
            <p className="text-warm-white/70 text-sm leading-relaxed">The tools, templates and free practice platforms behind the roadmaps.</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-400 mb-4">Cloud Roadmap FAQ</h2>
          </div>
          <div className="space-y-6">
            <div className="border border-blue-500/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">Which cloud platform should a beginner learn first — AWS, Azure or GCP?</h3>
              <p className="text-warm-white/70 leading-relaxed">AWS, unless your target employer runs on another provider. It has the largest share of cloud jobs, and its core concepts — identity, VPC networking, object storage, managed containers — transfer directly to Azure and GCP. Learn one provider deeply before sampling the others.</p>
            </div>
            <div className="border border-blue-500/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">How long does it take to learn AWS?</h3>
              <p className="text-warm-white/70 leading-relaxed">With steady hands-on practice, the fundamentals — IAM, VPC, EC2, S3 and a managed Kubernetes service like EKS — take most people 3–6 months to use confidently. The path on this page is ordered so each step builds on the last; budgets and billing discipline are part of the skill from the start, not an afterthought.</p>
            </div>
            <div className="border border-blue-500/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">Do I need a certification to get a cloud job?</h3>
              <p className="text-warm-white/70 leading-relaxed">No — but an associate-level certification helps your resume pass screening, especially early in your career. Treat it as proof of fundamentals, then back it with hands-on work: the tutorials on this page are designed to give you both the knowledge the exams test and something real to talk about in interviews.</p>
            </div>
            <div className="border border-blue-500/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">Is cloud computing hard to learn without an IT background?</h3>
              <p className="text-warm-white/70 leading-relaxed">It is learnable, but not by skipping the foundations. Basic Linux, networking and one scripting language make cloud concepts click much faster; without them, every service feels like memorisation. The DevOps roadmap's Prerequisites section covers exactly that groundwork.</p>
            </div>
            <div className="border border-blue-500/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">What should I learn after AWS basics?</h3>
              <p className="text-warm-white/70 leading-relaxed">Containers and Kubernetes on EKS, then cost optimization and reliability — the skills that separate people who can launch services from people who can run them. From there, the DevOps roadmap continues the same story: CI/CD, GitOps and observability in production.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-charcoal via-rich-black to-charcoal py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mb-6">
            Ready to Master Cloud Computing?
          </h2>
          <p className="text-lg text-warm-white/80 mb-8 leading-relaxed">
            Get expert guidance on cloud architecture, migration strategies, and best practices for your projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Get Cloud Consultation
            </Link>
            <Link
              href="/blog"
              className="border border-blue-400 text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-blue-400/10 transition-all"
            >
              Browse Cloud Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}