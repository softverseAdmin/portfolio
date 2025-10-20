import Link from 'next/link';

export const metadata = {
  title: 'Cloud Computing Guide & Resources | DevOps Enginer',
  description: 'Complete cloud computing guide covering AWS, Azure, GCP, and multi-cloud strategies. Learn cloud architecture, services, and best practices for modern infrastructure.',
  keywords: 'cloud computing, AWS, Azure, GCP, cloud architecture, cloud migration, serverless, kubernetes, cloud security, multi-cloud, hybrid cloud',
  openGraph: {
    title: 'Cloud Computing Guide & Resources | DevOps Enginer',
    description: 'Complete cloud computing guide covering AWS, Azure, GCP, and multi-cloud strategies. Learn cloud architecture, services, and best practices for modern infrastructure.',
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

const cloudArchitecturePatterns = [
  {
    name: "Microservices Architecture",
    description: "Break applications into small, independent services",
    benefits: ["Scalability", "Resilience", "Technology Diversity", "Team Independence"],
    tools: ["Kubernetes", "Service Mesh", "API Gateway", "Container Registry"],
    difficulty: "Advanced"
  },
  {
    name: "Serverless Architecture",
    description: "Event-driven, function-based computing model",
    benefits: ["Cost Efficiency", "Auto Scaling", "No Server Management", "Fast Deployment"],
    tools: ["AWS Lambda", "Azure Functions", "Google Cloud Functions", "API Gateway"],
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

function BestPracticesCard({ category, practices }) {
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
              Cloud Computing Guide
            </h1>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Master cloud technologies with comprehensive guides covering AWS, Azure, GCP, and modern cloud architecture patterns. 
              Build scalable, secure, and cost-effective cloud solutions.
            </p>
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
              <BestPracticesCard key={index} category={category.category} practices={category.practices} />
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
            </div>
            <div className="text-center">
              <div className="bg-blue-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Pilot Migration</h3>
              <p className="text-warm-white/70 text-sm">Start with non-critical applications to validate approach and tooling.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Full Migration</h3>
              <p className="text-warm-white/70 text-sm">Execute phased migration with proper testing and rollback procedures.</p>
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