import Link from 'next/link';

export const metadata = {
  title: 'DevOps, Cloud & Cybersecurity Resources | DevOps Enginer',
  description: 'Comprehensive collection of DevOps tools, cloud platforms, cybersecurity frameworks, certifications, learning materials, and expert guides for modern IT professionals.',
  keywords: 'devops resources, cloud computing tools, cybersecurity frameworks, AWS resources, Azure tools, GCP guides, kubernetes, docker, terraform, ansible, jenkins, security tools',
  openGraph: {
    title: 'DevOps, Cloud & Cybersecurity Resources | DevOps Enginer',
    description: 'Comprehensive collection of DevOps tools, cloud platforms, cybersecurity frameworks, certifications, learning materials, and expert guides for modern IT professionals.',
    type: 'website',
  }
};

const resourceCategories = {
  guides: {
    title: "Expert Guides",
    description: "Comprehensive roadmaps and expert guides for mastering modern technologies",
    icon: "📚",
    color: "from-blue-500 to-cyan-500",
    items: [
      {
        title: "DevOps Roadmap",
        description: "Complete DevOps learning path with 100+ tools and technologies",
        link: "/devops",
        tags: ["DevOps", "CI/CD", "Infrastructure", "Monitoring"],
        difficulty: "All Levels"
      },
      {
        title: "Cloud Computing Guide",
        description: "AWS, Azure, GCP comparison with architecture patterns and certifications",
        link: "/cloud",
        tags: ["AWS", "Azure", "GCP", "Architecture"],
        difficulty: "Intermediate"
      },
      {
        title: "Cybersecurity Expert Guide",
        description: "Offensive security, defensive operations, and compliance frameworks",
        link: "/cybersecurity",
        tags: ["Security", "Ethical Hacking", "Compliance", "SIEM"],
        difficulty: "Advanced"
      }
    ]
  },
  tools: {
    title: "Essential Tools",
    description: "Curated collection of the most important tools for DevOps, Cloud, and Security",
    icon: "🛠️",
    color: "from-green-500 to-teal-500",
    items: [
      {
        category: "Infrastructure as Code",
        tools: [
          { name: "Terraform", description: "Multi-cloud infrastructure provisioning", link: "https://terraform.io", type: "IaC" },
          { name: "Ansible", description: "Configuration management and automation", link: "https://ansible.com", type: "Config" },
          { name: "Pulumi", description: "Modern infrastructure as code", link: "https://pulumi.com", type: "IaC" },
          { name: "CloudFormation", description: "AWS native infrastructure as code", link: "https://aws.amazon.com/cloudformation/", type: "AWS" }
        ]
      },
      {
        category: "CI/CD Platforms",
        tools: [
          { name: "GitHub Actions", description: "Native GitHub CI/CD workflows", link: "https://github.com/features/actions", type: "CI/CD" },
          { name: "GitLab CI", description: "Integrated DevOps platform", link: "https://gitlab.com", type: "CI/CD" },
          { name: "Jenkins", description: "Open-source automation server", link: "https://jenkins.io", type: "CI/CD" },
          { name: "Azure DevOps", description: "Microsoft's complete DevOps solution", link: "https://azure.microsoft.com/services/devops/", type: "Microsoft" }
        ]
      },
      {
        category: "Containerization",
        tools: [
          { name: "Docker", description: "Container platform and runtime", link: "https://docker.com", type: "Container" },
          { name: "Kubernetes", description: "Container orchestration platform", link: "https://kubernetes.io", type: "Orchestration" },
          { name: "Podman", description: "Daemonless container engine", link: "https://podman.io", type: "Container" },
          { name: "Helm", description: "Kubernetes package manager", link: "https://helm.sh", type: "K8s Tool" }
        ]
      },
      {
        category: "Monitoring & Observability",
        tools: [
          { name: "Prometheus", description: "Monitoring and alerting toolkit", link: "https://prometheus.io", type: "Monitoring" },
          { name: "Grafana", description: "Observability and data visualization", link: "https://grafana.com", type: "Visualization" },
          { name: "ELK Stack", description: "Elasticsearch, Logstash, and Kibana", link: "https://elastic.co", type: "Logging" },
          { name: "Datadog", description: "Cloud monitoring platform", link: "https://datadoghq.com", type: "SaaS" }
        ]
      },
      {
        category: "Security Tools",
        tools: [
          { name: "Snyk", description: "Developer security platform", link: "https://snyk.io", type: "Security" },
          { name: "OWASP ZAP", description: "Web application security scanner", link: "https://owasp.org/www-project-zap/", type: "Testing" },
          { name: "Vault", description: "Secrets management", link: "https://vaultproject.io", type: "Secrets" },
          { name: "Trivy", description: "Container vulnerability scanner", link: "https://trivy.dev", type: "Scanning" }
        ]
      }
    ]
  },
  certifications: {
    title: "Professional Certifications",
    description: "Industry-recognized certifications to advance your career",
    icon: "🎓",
    color: "from-purple-500 to-pink-500",
    items: [
      {
        provider: "Amazon Web Services (AWS)",
        logo: "☁️",
        certs: [
          { name: "AWS Cloud Practitioner", level: "Foundation", duration: "1-3 months", focus: "Cloud Basics" },
          { name: "AWS Solutions Architect Associate", level: "Associate", duration: "3-6 months", focus: "Architecture" },
          { name: "AWS DevOps Engineer Professional", level: "Professional", duration: "6-12 months", focus: "DevOps" },
          { name: "AWS Security Specialty", level: "Specialty", duration: "4-8 months", focus: "Security" }
        ]
      },
      {
        provider: "Microsoft Azure",
        logo: "🔷",
        certs: [
          { name: "Azure Fundamentals (AZ-900)", level: "Foundation", duration: "1-2 months", focus: "Cloud Basics" },
          { name: "Azure Administrator (AZ-104)", level: "Associate", duration: "3-5 months", focus: "Administration" },
          { name: "Azure DevOps Engineer (AZ-400)", level: "Expert", duration: "6-10 months", focus: "DevOps" },
          { name: "Azure Security Engineer (AZ-500)", level: "Associate", duration: "4-7 months", focus: "Security" }
        ]
      },
      {
        provider: "Google Cloud Platform (GCP)",
        logo: "🌐",
        certs: [
          { name: "Cloud Digital Leader", level: "Foundation", duration: "1-2 months", focus: "Cloud Strategy" },
          { name: "Associate Cloud Engineer", level: "Associate", duration: "3-5 months", focus: "Engineering" },
          { name: "Professional DevOps Engineer", level: "Professional", duration: "6-12 months", focus: "DevOps" },
          { name: "Professional Cloud Security Engineer", level: "Professional", duration: "8-14 months", focus: "Security" }
        ]
      },
      {
        provider: "Kubernetes & Cloud Native",
        logo: "⚙️",
        certs: [
          { name: "Certified Kubernetes Administrator (CKA)", level: "Professional", duration: "4-8 months", focus: "K8s Admin" },
          { name: "Certified Kubernetes Application Developer (CKAD)", level: "Professional", duration: "3-6 months", focus: "K8s Dev" },
          { name: "Certified Kubernetes Security Specialist (CKS)", level: "Expert", duration: "6-12 months", focus: "K8s Security" }
        ]
      },
      {
        provider: "Security Certifications",
        logo: "🔒",
        certs: [
          { name: "CompTIA Security+", level: "Foundation", duration: "3-6 months", focus: "Security Basics" },
          { name: "Certified Ethical Hacker (CEH)", level: "Professional", duration: "6-9 months", focus: "Ethical Hacking" },
          { name: "CISSP", level: "Expert", duration: "12-18 months", focus: "Security Management" },
          { name: "OSCP", level: "Expert", duration: "12-24 months", focus: "Penetration Testing" }
        ]
      }
    ]
  },
  learning: {
    title: "Learning Resources",
    description: "Best platforms and resources for continuous learning and skill development",
    icon: "📖",
    color: "from-orange-500 to-red-500",
    items: [
      {
        category: "Online Learning Platforms",
        resources: [
          { name: "A Cloud Guru", description: "Cloud-focused training platform", link: "https://acloudguru.com", type: "Platform", pricing: "Subscription" },
          { name: "Linux Academy", description: "Now part of A Cloud Guru", link: "https://linuxacademy.com", type: "Platform", pricing: "Subscription" },
          { name: "Pluralsight", description: "Technology skills platform", link: "https://pluralsight.com", type: "Platform", pricing: "Subscription" },
          { name: "Udemy", description: "Individual course marketplace", link: "https://udemy.com", type: "Marketplace", pricing: "Per Course" }
        ]
      },
      {
        category: "Hands-on Practice",
        resources: [
          { name: "Katacoda", description: "Interactive learning scenarios", link: "https://katacoda.com", type: "Interactive", pricing: "Free" },
          { name: "Play with Docker", description: "Docker playground", link: "https://labs.play-with-docker.com", type: "Lab", pricing: "Free" },
          { name: "Kubernetes Playground", description: "K8s hands-on environment", link: "https://labs.play-with-k8s.com", type: "Lab", pricing: "Free" },
          { name: "AWS Free Tier", description: "Free AWS services for learning", link: "https://aws.amazon.com/free/", type: "Cloud Lab", pricing: "Free Tier" }
        ]
      },
      {
        category: "Documentation & References",
        resources: [
          { name: "DevOps Roadmap", description: "Community-driven learning paths", link: "https://roadmap.sh", type: "Roadmap", pricing: "Free" },
          { name: "AWS Documentation", description: "Official AWS guides and references", link: "https://docs.aws.amazon.com", type: "Docs", pricing: "Free" },
          { name: "Kubernetes Documentation", description: "Official K8s documentation", link: "https://kubernetes.io/docs/", type: "Docs", pricing: "Free" },
          { name: "DevOps Toolkit", description: "Tools and best practices", link: "https://github.com/DevOps-Toolkit", type: "GitHub", pricing: "Free" }
        ]
      }
    ]
  },
  templates: {
    title: "Templates & Examples",
    description: "Ready-to-use templates, configurations, and code examples",
    icon: "📋",
    color: "from-indigo-500 to-purple-500",
    items: [
      {
        category: "Infrastructure Templates",
        templates: [
          { name: "Terraform AWS VPC", description: "Production-ready VPC setup", type: "Terraform", complexity: "Intermediate" },
          { name: "Kubernetes Cluster Setup", description: "Multi-node K8s cluster", type: "K8s", complexity: "Advanced" },
          { name: "Docker Compose Stack", description: "Multi-service application", type: "Docker", complexity: "Beginner" },
          { name: "Ansible Playbooks", description: "Server configuration automation", type: "Ansible", complexity: "Intermediate" }
        ]
      },
      {
        category: "CI/CD Pipelines",
        templates: [
          { name: "GitHub Actions Workflow", description: "Complete CI/CD pipeline", type: "GitHub", complexity: "Intermediate" },
          { name: "GitLab CI Pipeline", description: "Multi-stage deployment", type: "GitLab", complexity: "Intermediate" },
          { name: "Jenkins Pipeline", description: "Declarative pipeline script", type: "Jenkins", complexity: "Advanced" },
          { name: "Azure DevOps Pipeline", description: "YAML-based pipeline", type: "Azure", complexity: "Intermediate" }
        ]
      },
      {
        category: "Monitoring & Security",
        templates: [
          { name: "Prometheus Config", description: "Monitoring setup", type: "Prometheus", complexity: "Intermediate" },
          { name: "Grafana Dashboards", description: "Visualization templates", type: "Grafana", complexity: "Beginner" },
          { name: "Security Scanning", description: "Automated security checks", type: "Security", complexity: "Advanced" },
          { name: "Logging Stack", description: "ELK/EFK configuration", type: "Logging", complexity: "Advanced" }
        ]
      }
    ]
  }
};

const featuredBlogs = [
  {
    title: "Top 10 DevOps Tools for 2025",
    description: "Essential tools every DevOps engineer should master",
    link: "/blog/top-10-devops-tools-2025",
    category: "DevOps",
    readTime: "8 min"
  },
  {
    title: "How to Build CI/CD Pipeline with GitHub Actions",
    description: "Step-by-step guide to modern CI/CD implementation",
    link: "/blog/how-to-build-cicd-pipeline-github-actions-2025",
    category: "CI/CD",
    readTime: "12 min"
  },
  {
    title: "DevSecOps Checklist: Securing Your Pipeline",
    description: "Complete security checklist for DevOps pipelines",
    link: "/blog/devsecops-checklist-securing-pipeline-2025",
    category: "Security",
    readTime: "10 min"
  },
  {
    title: "Become DevOps Engineer in Japan 2025",
    description: "Career guide for DevOps opportunities in Japan",
    link: "/blog/how-to-become-devops-engineer-japan-2025-career-guide",
    category: "Career",
    readTime: "15 min"
  }
];

function ResourceCard({ resource, type = "default" }) {
  const getTypeColor = (itemType) => {
    const colors = {
      'IaC': 'bg-blue-500/20 text-blue-300',
      'CI/CD': 'bg-green-500/20 text-green-300',
      'Container': 'bg-purple-500/20 text-purple-300',
      'Security': 'bg-red-500/20 text-red-300',
      'Monitoring': 'bg-yellow-500/20 text-yellow-300',
      'AWS': 'bg-orange-500/20 text-orange-300',
      'Free': 'bg-green-500/20 text-green-300',
      'Subscription': 'bg-blue-500/20 text-blue-300'
    };
    return colors[itemType] || 'bg-gray-500/20 text-gray-300';
  };

  const getLevelColor = (level) => {
    const colors = {
      'Foundation': 'bg-green-500/20 text-green-300',
      'Associate': 'bg-blue-500/20 text-blue-300',
      'Professional': 'bg-orange-500/20 text-orange-300',
      'Expert': 'bg-red-500/20 text-red-300',
      'Specialty': 'bg-purple-500/20 text-purple-300'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-300';
  };

  if (type === "guide") {
    return (
      <Link href={resource.link} className="block">
        <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all group">
          <h3 className="text-xl font-bold text-warm-white mb-3 group-hover:text-gold transition-colors">
            {resource.title}
          </h3>
          <p className="text-warm-white/70 mb-4">{resource.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {resource.tags.map((tag, index) => (
              <span key={index} className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-warm-white/60 text-sm">Difficulty: {resource.difficulty}</span>
            <span className="text-gold text-sm group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    );
  }

  if (type === "certification") {
    return (
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-purple-500/20 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-warm-white text-sm">{resource.name}</h4>
          <span className="text-purple-300 text-xs">{resource.duration}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-xs ${getLevelColor(resource.level)}`}>
            {resource.level}
          </span>
          <span className="text-warm-white/60 text-xs">{resource.focus}</span>
        </div>
      </div>
    );
  }

  if (type === "tool") {
    return (
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-green-500/20 rounded-lg p-4 hover:border-green-500/40 transition-all">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-warm-white">{resource.name}</h4>
          <span className={`px-2 py-1 rounded text-xs ${getTypeColor(resource.type)}`}>
            {resource.type}
          </span>
        </div>
        <p className="text-warm-white/70 text-sm mb-3">{resource.description}</p>
        {resource.link && (
          <a 
            href={resource.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-400 text-sm hover:text-green-300 transition-colors"
          >
            Visit →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-gold/20 rounded-lg p-4">
      <h4 className="font-semibold text-warm-white mb-2">{resource.name}</h4>
      <p className="text-warm-white/70 text-sm">{resource.description}</p>
    </div>
  );
}

function ResourceSection({ title, description, icon, color, items, type = "default" }) {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl mr-3">{icon}</span>
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {title}
          </h2>
        </div>
        <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">{description}</p>
      </div>

      {type === "guides" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <ResourceCard key={index} resource={item} type="guide" />
          ))}
        </div>
      )}

      {type === "tools" && (
        <div className="space-y-8">
          {items.map((category, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold text-green-400 mb-4">{category.category}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.tools.map((tool, toolIndex) => (
                  <ResourceCard key={toolIndex} resource={tool} type="tool" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {type === "certifications" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((provider, index) => (
            <div key={index} className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-purple-500/20 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{provider.logo}</span>
                <h3 className="text-lg font-bold text-purple-400">{provider.provider}</h3>
              </div>
              <div className="space-y-3">
                {provider.certs.map((cert, certIndex) => (
                  <ResourceCard key={certIndex} resource={cert} type="certification" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {type === "learning" && (
        <div className="space-y-8">
          {items.map((category, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold text-orange-400 mb-4">{category.category}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.resources.map((resource, resourceIndex) => (
                  <div key={resourceIndex} className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-orange-500/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-warm-white">{resource.name}</h4>
                      <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                        {resource.pricing}
                      </span>
                    </div>
                    <p className="text-warm-white/70 text-sm mb-3">{resource.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="bg-orange-400/20 text-orange-400 px-2 py-1 rounded text-xs">
                        {resource.type}
                      </span>
                      {resource.link && (
                        <a 
                          href={resource.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
                        >
                          Visit →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {type === "templates" && (
        <div className="space-y-8">
          {items.map((category, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold text-indigo-400 mb-4">{category.category}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.templates.map((template, templateIndex) => (
                  <div key={templateIndex} className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-indigo-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-warm-white mb-2">{template.name}</h4>
                    <p className="text-warm-white/70 text-sm mb-3">{template.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs">
                        {template.type}
                      </span>
                      <span className="text-warm-white/60 text-xs">{template.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rich-black via-charcoal to-rich-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-charcoal via-rich-black to-charcoal">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-blue-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-blue-400 to-purple-500 mb-8">
              DevOps Resources Hub
            </h1>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Your comprehensive collection of DevOps tools, cloud platforms, cybersecurity frameworks, 
              certifications, and learning materials. Everything you need to advance your technical career.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/blog"
                className="bg-gradient-to-r from-gold to-yellow-500 text-rich-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
              >
                Latest Articles
              </Link>
              <Link
                href="/contact"
                className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
              >
                Get Expert Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ResourceSection 
          {...resourceCategories.guides} 
          type="guides"
        />
        
        <ResourceSection 
          {...resourceCategories.tools} 
          type="tools"
        />
        
        <ResourceSection 
          {...resourceCategories.certifications} 
          type="certifications"
        />
        
        <ResourceSection 
          {...resourceCategories.learning} 
          type="learning"
        />
        
        <ResourceSection 
          {...resourceCategories.templates} 
          type="templates"
        />
      </div>

      {/* Featured Blog Posts */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Featured Articles</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              In-depth guides and tutorials from our blog
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredBlogs.map((blog, index) => (
              <Link key={index} href={blog.link} className="block">
                <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                      {blog.category}
                    </span>
                    <span className="text-warm-white/60 text-xs">{blog.readTime}</span>
                  </div>
                  <h3 className="font-bold text-warm-white mb-2 group-hover:text-gold transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-warm-white/70 text-sm line-clamp-3 mb-3">{blog.description}</p>
                  <span className="text-gold text-sm group-hover:translate-x-1 transition-transform inline-block">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-charcoal via-rich-black to-charcoal py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-blue-400 to-purple-500 mb-6">
            Need Personalized Guidance?
          </h2>
          <p className="text-lg text-warm-white/80 mb-8 leading-relaxed">
            Get expert consultation on DevOps implementation, cloud architecture, or cybersecurity strategy 
            tailored to your specific needs and goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-gradient-to-r from-gold to-yellow-500 text-rich-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
            >
              Schedule Consultation
            </Link>
            <Link
              href="/about"
              className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
            >
              About DevOps Enginer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}