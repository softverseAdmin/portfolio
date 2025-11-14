import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPost, getRelatedPosts } from '../blogData';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
      type: 'article',
      publishedTime: post.publishDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-black via-rich-black to-charcoal">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-charcoal to-rich-black">
        <div className="absolute inset-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <span className="inline-block bg-gold/20 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-6">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-8">
              {post.title}
            </h1>
            <div className="flex items-center justify-center space-x-6 text-warm-white/70">
              <span>By <span className="text-gold">{post.author}</span></span>
              <span>•</span>
              <time dateTime={post.publishDate} className="text-warm-white/60" suppressHydrationWarning>
                {new Date(post.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span>•</span>
              <span className="text-amber">{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Dynamic content based on slug */}
        {post.slug === 'gitops-vs-traditional-cicd-2025-comparison' && <BlogContentRenderer content={post.content} />}
        {post.slug === 'kubernetes-deployment-strategies-2025-complete-guide' && <BlogContentRenderer content={post.content} />}
        {post.slug === 'top-10-devops-tools-2025' && <DevOpsToolsContent />}
        {post.slug === 'how-to-build-cicd-pipeline-github-actions-2025' && <BlogContentRenderer content={post.content} />}
        {post.slug === 'devsecops-checklist-securing-pipeline-2025' && <BlogContentRenderer content={post.content} />}
        {post.slug === 'rise-of-platform-engineering-redefining-devops-2025' && <BlogContentRenderer content={post.content} />}
        {post.slug === 'how-to-become-devops-engineer-japan-2025-career-guide' && <BlogContentRenderer content={post.content} />}
        
        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gold/30">
          <h3 className="text-lg font-semibold text-warm-white mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gold/20 text-gold text-sm px-3 py-1 rounded-full hover:bg-gold/30 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-8 border-t border-gold/30">
          <Link
            href="/blog"
            className="inline-flex items-center text-gold hover:text-amber font-medium group transition-all"
          >
            <svg className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-warm-white mb-12 text-center">
              Related <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold">Articles</span>
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl overflow-hidden hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-2"
                >
                  <img
                    src={relatedPost.featuredImage}
                    alt={relatedPost.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-6">
                    <span className="inline-block bg-gold/20 text-gold text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-semibold text-warm-white mb-2 group-hover:text-gold transition-colors">
                      <Link 
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-gold transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-warm-white/70 text-sm mb-4 leading-relaxed">
                      {relatedPost.excerpt.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-warm-white/50 bg-charcoal/40 px-2 py-1 rounded inline-block">
                      {relatedPost.readTime}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Content component for the DevOps Tools blog post
function DevOpsToolsContent() {
  const tools = [
    {
      rank: 1,
      name: "GitHub Actions",
      title: "Simplicity Meets Power",
      description: "If there's one platform that quietly became the default for modern CI/CD, it's GitHub Actions. Every time you push code, GitHub can build, test, and deploy automatically — no third-party setup, no complicated servers. In 2025, GitHub expanded its Actions Marketplace with official integrations for AWS Lambda, Google Cloud Run, and Azure Functions. What makes it stand out? You can keep your entire workflow — from version control to production deployment — in one place.",
      proTip: "Use self-hosted runners for faster builds and cost control, especially when handling large monorepos.",
      image: "/images/blog/top-10-devops-tools-2025/github-actions.jpg"
    },
    {
      rank: 2,
      name: "Terraform",
      title: "The Backbone of Infrastructure as Code",
      description: "HashiCorp's Terraform remains the gold standard for managing cloud infrastructure. The language is simple enough for beginners yet powerful enough to manage multi-region, multi-cloud environments. What's new in 2025? Terraform's Drift Detection Engine now predicts inconsistencies before they cause issues — almost like your infrastructure has an early-warning system. Teams that used to juggle hundreds of AWS resources manually can now manage them through a few lines of declarative code.",
      proTip: "Use Terraform Cloud's policy as code feature to enforce compliance automatically across all deployments.",
      image: "/images/blog/top-10-devops-tools-2025/terraform.jpg"
    },
    {
      rank: 3,
      name: "Kubernetes",
      title: "The Beating Heart of Cloud Operations",
      description: "Let's be honest — Kubernetes isn't \"new,\" but in 2025 it's practically unavoidable. It's no longer just for big enterprises; even small teams use managed clusters like EKS, GKE, and AKS. What changed this year? Kubernetes introduced AI-driven autoscaling and network policy intelligence, making cluster optimization less of a guessing game. The best engineers I know treat Kubernetes as a platform, not a product — something that ties together CI/CD, observability, and infrastructure into one coherent flow.",
      image: "/images/blog/top-10-devops-tools-2025/kubernetes.jpg"
    },
    {
      rank: 4,
      name: "Pulumi",
      title: "Modern Infrastructure as Code, But in Real Languages",
      description: "While Terraform uses its own DSL, Pulumi lets you define infrastructure using familiar programming languages — TypeScript, Python, Go, or C#. That simple difference is game-changing for developers who want to reuse code, create abstractions, or share logic between apps and infrastructure. In 2025, Pulumi added AI-assisted IaC generation, suggesting optimized configurations and tagging strategies automatically.",
      example: "You can spin up an entire Kubernetes cluster in AWS with 30 lines of TypeScript — and apply the same logic to GCP by switching one line.",
      image: "/images/blog/top-10-devops-tools-2025/pulumi.jpg"
    },
    {
      rank: 5,
      name: "Argo CD",
      title: "The True GitOps Hero",
      description: "Argo CD turns your Git repository into the single source of truth for deployments. Whenever you push a change, Argo syncs it with your Kubernetes cluster — automatically, securely, and with rollback safety. The best part? It's visual. You can see exactly what's running, what's out of sync, and when something drifts. In 2025, Argo's Progressive Rollout Module became smarter, learning from historical failures to suggest safe deployment speeds.",
      personalNote: "Once you try GitOps with Argo, you'll never go back to manual deployments again.",
      image: "/images/blog/top-10-devops-tools-2025/argo-cd.jpg"
    },
    {
      rank: 6,
      name: "Docker",
      title: "The Old Reliable Workhorse",
      description: "Sure, Docker's been around for over a decade — but in 2025, it's still the glue that holds DevOps together. The latest Docker Scout now uses AI to scan container images for vulnerabilities in real time. It also generates SBOMs (Software Bill of Materials) to meet compliance standards automatically. If you're building microservices, Docker is still the easiest way to ensure your app behaves identically in dev, staging, and production.",
      quickTip: "Pair Docker with BuildKit for faster multi-architecture builds (especially ARM + x86).",
      image: "/images/blog/top-10-devops-tools-2025/docker.jpg"
    },
    {
      rank: 7,
      name: "Prometheus + Grafana",
      title: "Observability, Simplified",
      description: "Ask any operations engineer what keeps them sane, and they'll probably mention Grafana dashboards. Paired with Prometheus, it remains the industry standard for metrics, alerting, and visualization. But the 2025 versions go beyond graphs — they actually predict problems. Thanks to integrations with OpenTelemetry and machine learning models, Grafana can now alert you to anomalies before they impact customers. It's like having a co-pilot watching your production environment 24/7 — minus the coffee breaks.",
      image: "/images/blog/top-10-devops-tools-2025/prometheus-grafana.jpg"
    },
    {
      rank: 8,
      name: "GitHub Copilot for DevOps",
      title: "AI That Codes Infrastructure",
      description: "Remember when Copilot was just for writing code? In 2025, GitHub Copilot for DevOps has expanded its powers. Now it can help you write CI/CD workflows, Kubernetes manifests, and Terraform modules. It even explains deployment failures in plain English — a lifesaver for new engineers learning automation. Instead of searching Stack Overflow at 2 AM, you can ask Copilot, \"Why did my pipeline fail?\" and it'll walk you through the cause.",
      bestUse: "Combine Copilot with Actions to speed up pipeline creation and reduce YAML headaches.",
      image: "/images/blog/top-10-devops-tools-2025/github-copilot.jpg"
    },
    {
      rank: 9,
      name: "GitLab DevSecOps Platform",
      title: "One Tool to Rule Them All",
      description: "GitLab has quietly evolved into a complete DevSecOps suite. You can manage code, pipelines, compliance, and security — all under one login. The 2025 version introduces AI SecureScan, which catches license violations and vulnerabilities before code merges. Many large teams are replacing separate tools (Jira, Jenkins, SonarQube) with GitLab to simplify management and costs.",
      proInsight: "Use GitLab's built-in container registry and merge-request approvals to enforce consistent delivery across microservices.",
      image: "/images/blog/top-10-devops-tools-2025/gitlab-devsecops.jpg"
    },
    {
      rank: 10,
      name: "Datadog AI Monitoring",
      title: "Seeing Everything Before It Breaks",
      description: "Rounding out the list is Datadog's AI-powered monitoring suite. It goes far beyond metrics — combining logs, traces, network performance, and synthetic tests into one platform. What's new in 2025? Datadog's Watchtower AI Engine can now auto-correlate incidents and predict the root cause before human intervention. It's not magic; it's machine learning trained on millions of past incidents across global systems.",
      personalReflection: "Tools like Datadog make you feel less like a firefighter and more like an air-traffic controller — aware, calm, and in control.",
      image: "/images/blog/top-10-devops-tools-2025/datadog.jpg"
    }
  ];

  return (
    <article className="mx-auto px-4 md:px-6 py-12 bg-gradient-to-br from-charcoal/20 to-rich-black/40 border border-gold/20 rounded-2xl text-warm-white leading-relaxed">
      
      {/* Introduction */}
      <section className="mb-12">
        <p className="text-lg text-warm-white/90 leading-relaxed mb-6">
          If you've been in DevOps for a while, you've probably realized one thing: this field never stands still. Every year, new tools promise faster pipelines, cleaner infrastructure, and fewer production fires — but 2025 feels different.
        </p>
        <p className="text-lg text-warm-white/90 leading-relaxed mb-6">
          We're not just automating tasks anymore; we're predicting, adapting, and self-healing. The rise of AI in DevOps means systems that can alert you before something breaks, and code that suggests its own improvements.
        </p>
        <p className="text-lg text-warm-white/90 leading-relaxed">
          In this post, I'll walk you through the 10 tools every serious DevOps engineer should know in 2025 — not because they're trendy, but because they genuinely make your life easier.
        </p>
      </section>

      <div className="space-y-12">
        {tools.map((tool) => (
          <section key={tool.rank} className="space-y-6">
            <h2 className="text-2xl font-semibold text-gold">
              {tool.rank}. {tool.name} — {tool.title}
            </h2>
            
            {/* Tool Image */}
            {tool.image && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg">
                <img
                  src={tool.image}
                  alt={`${tool.name} - ${tool.title}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
            )}
            
            <p className="text-warm-white/90 leading-relaxed">
              {tool.description}
            </p>

            {tool.proTip && (
              <div className="bg-gold/10 border-l-4 border-gold p-4 rounded-md">
                <p className="text-warm-white/90 italic">
                  💡 <strong className="text-gold">Pro tip:</strong> {tool.proTip}
                </p>
              </div>
            )}

            {tool.example && (
              <div className="bg-charcoal/40 border-l-4 border-amber p-4 rounded-md">
                <p className="text-warm-white/90">
                  🔧 <strong className="text-amber">Example:</strong> {tool.example}
                </p>
              </div>
            )}

            {tool.personalNote && (
              <div className="bg-gold/5 border border-gold/30 p-4 rounded-md">
                <p className="text-warm-white/90 italic">
                  💬 <strong className="text-gold">Personal note:</strong> {tool.personalNote}
                </p>
              </div>
            )}

            {tool.quickTip && (
              <div className="bg-gold/10 border-l-4 border-gold p-4 rounded-md">
                <p className="text-warm-white/90">
                  💡 <strong className="text-gold">Quick tip:</strong> {tool.quickTip}
                </p>
              </div>
            )}

            {tool.bestUse && (
              <div className="bg-charcoal/40 border-l-4 border-amber p-4 rounded-md">
                <p className="text-warm-white/90">
                  ⚙️ <strong className="text-amber">Best use:</strong> {tool.bestUse}
                </p>
              </div>
            )}

            {tool.proInsight && (
              <div className="bg-gold/5 border border-gold/30 p-4 rounded-md">
                <p className="text-warm-white/90">
                  🌐 <strong className="text-gold">Pro insight:</strong> {tool.proInsight}
                </p>
              </div>
            )}

            {tool.personalReflection && (
              <div className="bg-gold/5 border border-gold/30 p-4 rounded-md">
                <p className="text-warm-white/90 italic">
                  � <strong className="text-gold">Personal reflection:</strong> {tool.personalReflection}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Bonus Trend */}
      <section className="space-y-6 mt-12 pt-8 border-t border-gold/30">
        <h2 className="text-2xl font-semibold text-gold">Bonus Trend: AIOps Is Becoming the New Normal</h2>
        <p className="text-warm-white/90 leading-relaxed mb-4">
          All these tools are converging toward one reality — AIOps. That means predictive alerts, self-healing deployments, and smarter observability.
        </p>
        <p className="text-warm-white/90 leading-relaxed">
          Platforms like Dynatrace and Elastic Cloud are embedding intelligence into every step of the DevOps lifecycle. We're moving from reactive dashboards to proactive automation — and it's changing how teams work.
        </p>
      </section>

      {/* Conclusion */}
      <section className="space-y-6 mt-12 pt-8 border-t border-gold/30">
        <h2 className="text-2xl font-semibold text-gold">Conclusion: Build Smarter, Deploy Faster, Sleep Better</h2>
        <p className="text-warm-white/90 leading-relaxed mb-4">
          Choosing tools isn't about chasing trends — it's about picking what fits your team, culture, and workflow. The tools on this list don't replace engineers; they empower them.
        </p>
        <p className="text-warm-white/90 leading-relaxed mb-4">
          In 2025, success in DevOps means combining automation with intuition — machines handle the repetition, and humans bring the creativity.
        </p>
        <p className="text-warm-white/90 leading-relaxed">
          If you're looking to level up your DevOps skills, start by mastering two or three of these tools. Once you understand how they connect, you'll find that the rest falls naturally into place.
        </p>
      </section>

      {/* FAQs */}
      <section className="bg-gradient-to-br from-charcoal/40 to-rich-black rounded-xl p-6 mt-10 border border-gold/20">
        <h2 className="text-2xl font-semibold mb-6 text-gold">Frequently Asked Questions (FAQs)</h2>
        <div className="space-y-6">
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q1. Which DevOps tool should a beginner learn first?</h3>
            <p>Start with GitHub Actions or GitLab CI/CD — both are easy to set up and give instant feedback on your code.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q2. Is Kubernetes still relevant for small companies?</h3>
            <p>Absolutely. Managed services like EKS or GKE make Kubernetes accessible without the overhead of cluster maintenance.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q3. How does AI change DevOps in 2025?</h3>
            <p>AI handles analysis and prediction, reducing alert fatigue and helping engineers focus on strategic work.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q4. Which tools offer the best ROI for startups?</h3>
            <p>Pulumi, GitHub Actions, and Datadog — they combine flexibility, scalability, and visibility without large upfront cost.</p>
          </div>
          <div className="text-warm-white/90">
            <h3 className="font-semibold text-gold mb-2">Q5. What's next for DevOps engineers?</h3>
            <p>The rise of Platform Engineering — teams building internal developer portals powered by Kubernetes and GitOps.</p>
          </div>
        </div>
      </section>

      {/* About Author */}
      <section className="bg-gradient-to-br from-gold/5 to-amber/5 rounded-xl p-6 mt-10 border border-gold/30">
        <h2 className="text-xl font-semibold mb-4 text-gold">About the Author</h2>
        <p className="text-warm-white/90 leading-relaxed">
          <strong className="text-gold">Rabin Adhikari</strong> — DevOps engineer and founder of DevOps Enginer.
        </p>
        <p className="text-warm-white/80 leading-relaxed mt-2">
          Rabin writes about automation, AI tools, and cloud-native engineering — helping developers build faster, safer, and smarter.
        </p>
      </section>
    </article>
  );
}

// General content renderer for blog posts
function BlogContentRenderer({ content }) {
  // Process the content to render markdown-like syntax
  const processContent = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentSection = null;
    let currentParagraph = [];
    let skipNextLines = 0; // Track lines to skip instead of using splice

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ');
        const processedText = processTextFormatting(paragraphText);
        
        elements.push(
          <p key={elements.length} className="text-warm-white/80 leading-relaxed mb-6">
            <span dangerouslySetInnerHTML={{ __html: processedText }} />
          </p>
        );
        currentParagraph = [];
      }
    };

    // Enhanced text processing function for consistent formatting
    const processTextFormatting = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold font-semibold">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-charcoal/80 px-2 py-1 rounded text-gold text-sm font-mono">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-gold hover:text-amber underline" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    const addSectionImage = (sectionNumber) => {
      // Determine which blog post this is based on content
      const isDevSecOps = content.includes('DevSecOps') || content.includes('Static Application Security Testing');
      const isPlatformEngineering = content.includes('Platform Engineering') || content.includes('Internal Developer Platform');
      const isJapanCareer = content.includes('Japan') || content.includes('DevOps engineer in Japan');
      
      let imageMap = {};
      
      if (isDevSecOps) {
        imageMap = {
          1: '/images/blog/devsecops-checklist-securing-pipeline-2025/source-code-security.jpg',
          2: '/images/blog/devsecops-checklist-securing-pipeline-2025/static-code-analysis.jpg',
          3: '/images/blog/devsecops-checklist-securing-pipeline-2025/dependency-vulnerability-scan.jpg',
          4: '/images/blog/devsecops-checklist-securing-pipeline-2025/container-security-scanning.jpg',
          5: '/images/blog/devsecops-checklist-securing-pipeline-2025/dynamic-security-testing.jpg',
          6: '/images/blog/devsecops-checklist-securing-pipeline-2025/secrets-management-vault.jpg',
          7: '/images/blog/devsecops-checklist-securing-pipeline-2025/security-gates-approvals.jpg',
          8: '/images/blog/devsecops-checklist-securing-pipeline-2025/compliance-audit-dashboard.jpg',
          9: '/images/blog/devsecops-checklist-securing-pipeline-2025/realtime-security-monitoring.jpg',
          10: '/images/blog/devsecops-checklist-securing-pipeline-2025/devsecops-hero.jpg'
        };
      } else if (isPlatformEngineering) {
        imageMap = {
          1: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/devops-to-platform-evolution.jpg',
          2: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/chaos-vs-order-comparison.jpg',
          3: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/platform-architecture-layers.jpg',
          4: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/developer-self-service-portal.jpg',
          5: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/centralized-security-management.jpg',
          6: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/hybrid-platform-workflow.jpg',
          7: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/hybrid-platform-workflow.jpg',
          8: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/future-platform-engineering.jpg',
          9: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/ai-powered-platform-assistant.jpg',
          10: '/images/blog/rise-of-platform-engineering-redefining-devops-2025/platform-team-collaboration.jpg'
        };
      } else if (isJapanCareer) {
        imageMap = {
          1: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/devops-role-japanese-it.jpg',
          2: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/devops-skills-japan-requirements.jpg',
          3: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/japanese-language-devops-learning.jpg',
          4: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/devops-certifications-japan-value.jpg',
          5: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/japan-devops-salary-trends-2025.jpg',
          6: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/japan-job-search-platforms-devops.jpg',
          7: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/japanese-tech-office-culture-harmony.jpg',
          8: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/japan-work-visa-devops-engineer.jpg',
          9: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/japanese-devops-community-networking.jpg',
          10: '/images/blog/how-to-become-devops-engineer-japan-2025-career-guide/future-devops-careers-japan-dx.jpg'
        };
      } else {
        imageMap = {
          1: '/images/blog/how-to-build-cicd-pipeline-github-actions-2025/github-workflow-editor.jpg',
          2: '/images/blog/how-to-build-cicd-pipeline-github-actions-2025/aws-cloud-deployment.jpg',
          3: '/images/blog/how-to-build-cicd-pipeline-github-actions-2025/matrix-builds-parallel.jpg',
          4: '/images/blog/how-to-build-cicd-pipeline-github-actions-2025/code-quality-checks.jpg',
          5: '/images/blog/how-to-build-cicd-pipeline-github-actions-2025/self-hosted-runners-infrastructure.jpg',
          6: '/images/blog/how-to-build-cicd-pipeline-github-actions-2025/multi-stage-environments.jpg',
          7: '/images/blog/how-to-build-cicd-pipeline-github-actions-2025/monitoring-alerts-dashboard.jpg'
        };
      }

      if (imageMap[sectionNumber]) {
        elements.push(
          <div key={`img-${elements.length}`} className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
            <img
              src={imageMap[sectionNumber]}
              alt={`Section ${sectionNumber} illustration`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
        );
      }
    };

    lines.forEach((line, index) => {
      // Skip lines that were processed as part of multi-line elements
      if (skipNextLines > 0) {
        skipNextLines--;
        return;
      }
      
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushParagraph();
        return;
      }

      // Main heading
      if (trimmedLine.startsWith('# ')) {
        flushParagraph();
        elements.push(
          <h1 key={elements.length} className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold mb-8 leading-tight">
            {trimmedLine.substring(2)}
          </h1>
        );
      }
      // Section headings (## 1. Section Name)
      else if (trimmedLine.match(/^## \d+\./)) {
        flushParagraph();
        const sectionNumber = parseInt(trimmedLine.match(/^## (\d+)\./)[1]);
        addSectionImage(sectionNumber);
        const headingText = trimmedLine.substring(3);
        elements.push(
          <div key={elements.length} className="mt-12 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-gold to-amber text-charcoal font-bold px-3 py-1 rounded-full text-sm">
                {sectionNumber}
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gold/50 to-transparent"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gold">
              {headingText}
            </h2>
          </div>
        );
      }
      // Other headings
      else if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        const headingText = trimmedLine.substring(3);
        elements.push(
          <div key={elements.length} className="mt-12 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-gold/50 to-transparent"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gold">
              {headingText}
            </h2>
          </div>
        );
      }
      // Code blocks
      else if (trimmedLine.startsWith('```')) {
        flushParagraph();
        const language = trimmedLine.substring(3) || 'yaml';
        const codeLines = [];
        let i = index + 1;
        
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        // Set skip counter to avoid processing these lines again
        skipNextLines = i - index;
        
        elements.push(
          <div key={elements.length} className="bg-charcoal/80 rounded-lg p-6 mb-6 border border-gold/20 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gold text-xs font-mono uppercase tracking-wider">{language}</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <pre className="text-warm-white/90 overflow-x-auto text-sm font-mono leading-relaxed">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
      }
      // Bold quoted text
      else if (trimmedLine.match(/^\*\*".*"\*\*$/)) {
        flushParagraph();
        const text = trimmedLine.replace(/^\*\*"(.*)"\*\*$/, '$1');
        elements.push(
          <blockquote key={elements.length} className="bg-gold/10 border-l-4 border-gold p-6 rounded-r-lg mb-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="text-gold text-2xl">"</div>
              <p className="text-lg font-medium text-gold leading-relaxed italic">{text}</p>
              <div className="text-gold text-2xl">"</div>
            </div>
          </blockquote>
        );
      }
      // FAQ Questions
      else if (trimmedLine.match(/^\*\*Q\d+\./)) {
        flushParagraph();
        const questionText = trimmedLine.replace(/^\*\*(.+)\*\*$/, '$1');
        elements.push(
          <div key={elements.length} className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-4 mt-6">
            <h3 className="text-lg font-semibold text-gold flex items-center space-x-2">
              <span className="bg-gold text-charcoal px-2 py-1 rounded text-sm font-bold">Q</span>
              <span>{questionText.replace(/^Q\d+\.\s*/, '')}</span>
            </h3>
          </div>
        );
      }
      // Lists starting with - (unordered)
      else if (trimmedLine.startsWith('- ')) {
        flushParagraph();
        
        // Collect all consecutive list items
        const listItems = [];
        let i = index;
        
        while (i < lines.length && lines[i].trim().startsWith('- ')) {
          const listText = lines[i].trim().substring(2);
          listItems.push(listText);
          i++;
        }
        
        // Set skip counter instead of splicing
        skipNextLines = listItems.length - 1;
        
        elements.push(
          <ul key={elements.length} className="list-disc list-inside text-warm-white/80 mb-6 space-y-3 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <span dangerouslySetInnerHTML={{ 
                  __html: processTextFormatting(item)
                }} />
              </li>
            ))}
          </ul>
        );
      }
      // Lists starting with numbers (ordered)
      else if (trimmedLine.match(/^\d+\. /)) {
        flushParagraph();
        
        // Collect all consecutive numbered items
        const listItems = [];
        let i = index;
        
        while (i < lines.length && lines[i].trim().match(/^\d+\. /)) {
          const listText = lines[i].trim().replace(/^\d+\. /, '');
          listItems.push(listText);
          i++;
        }
        
        // Set skip counter instead of splicing
        skipNextLines = listItems.length - 1;
        
        elements.push(
          <ol key={elements.length} className="list-decimal list-inside text-warm-white/80 mb-6 space-y-3 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <span dangerouslySetInnerHTML={{ 
                  __html: processTextFormatting(item)
                }} />
              </li>
            ))}
          </ol>
        );
      }
      // Tables (markdown format)
      else if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
        flushParagraph();
        
        // Collect table rows
        const tableRows = [];
        let i = index;
        
        // Process table header
        if (lines[i] && lines[i].includes('|')) {
          tableRows.push(lines[i].trim());
          i++;
          
          // Skip separator line (|---|---|)
          if (lines[i] && lines[i].includes('---')) {
            i++;
          }
          
          // Collect table data rows
          while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim().split('|').length > 2) {
            tableRows.push(lines[i].trim());
            i++;
          }
        }
        
        // Set skip counter instead of splicing
        skipNextLines = i - index - 1;
        
        if (tableRows.length > 0) {
          const headerRow = tableRows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
          const dataRows = tableRows.slice(1).map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
          );
          
          elements.push(
            <div key={elements.length} className="overflow-x-auto mb-8 rounded-lg border border-gold/30">
              <table className="w-full">
                <thead className="bg-gold/20">
                  <tr>
                    {headerRow.map((header, idx) => (
                      <th key={idx} className="px-6 py-4 text-left font-bold text-gold border-b border-gold/30">
                        <span dangerouslySetInnerHTML={{ 
                          __html: processTextFormatting(header)
                        }} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-charcoal/10 hover:bg-charcoal/20' : 'bg-charcoal/30 hover:bg-charcoal/40'}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 text-warm-white/80 border-b border-gold/10 leading-relaxed">
                          <span dangerouslySetInnerHTML={{ 
                            __html: processTextFormatting(cell)
                          }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }
      // Benefits/Tips with emojis
      else if (trimmedLine.match(/^💡|^💬|^🔒|^⚙️|^🗣|^🗾|^🛂|^🔖|^📋|^💰|^🧭|^💼/)) {
        flushParagraph();
        let bgColor = 'bg-amber/10 border-amber/30';
        let textColor = 'text-amber';
        let iconBg = 'bg-amber/20';
        let iconColor = 'text-amber';
        
        if (trimmedLine.match(/^💬|^🗣/)) {
          bgColor = 'bg-blue-500/10 border-blue-500/30';
          textColor = 'text-blue-300';
          iconBg = 'bg-blue-500/20';
          iconColor = 'text-blue-400';
        } else if (trimmedLine.match(/^🔒|^🛂|^🔖|^📋/)) {
          bgColor = 'bg-gold/10 border-gold/30';
          textColor = 'text-gold';
          iconBg = 'bg-gold/20';
          iconColor = 'text-gold';
        } else if (trimmedLine.match(/^💰|^🧭|^💼/)) {
          bgColor = 'bg-green-500/10 border-green-500/30';
          textColor = 'text-green-300';
          iconBg = 'bg-green-500/20';
          iconColor = 'text-green-400';
        } else if (trimmedLine.match(/^⚙️|^🗾/)) {
          bgColor = 'bg-purple-500/10 border-purple-500/30';
          textColor = 'text-purple-300';
          iconBg = 'bg-purple-500/20';
          iconColor = 'text-purple-400';
        }
        
        // Extract emoji (first character or two) and remaining text
        // Most emojis are 2 characters in JS (surrogate pairs)
        let emoji = '';
        let text = '';
        
        // Check if starts with emoji by trying to match first 1-3 chars
        if (trimmedLine.charCodeAt(0) >= 0xD800 && trimmedLine.charCodeAt(0) <= 0xDFFF) {
          // Surrogate pair emoji (2 chars in JS)
          emoji = trimmedLine.substring(0, 2);
          text = trimmedLine.substring(2).trim();
        } else {
          // Single char emoji
          emoji = trimmedLine.substring(0, 1);
          text = trimmedLine.substring(1).trim();
        }
        
        elements.push(
          <div key={elements.length} className={`${bgColor} rounded-lg p-5 border mb-6 flex items-start space-x-4`}>
            <div className={`${iconBg} rounded-full p-2 flex-shrink-0 min-w-[2.5rem] h-10 flex items-center justify-center`} suppressHydrationWarning>
              <span className={`text-lg ${iconColor}`}>
                {emoji}
              </span>
            </div>
            <div className={`${textColor} leading-relaxed flex-1`}>
              <span dangerouslySetInnerHTML={{ __html: processTextFormatting(text) }} />
            </div>
          </div>
        );
      }
      // Regular paragraph lines
      else {
        currentParagraph.push(trimmedLine);
      }
    });

    flushParagraph();
    return elements;
  };

  return (
    <article className="mx-auto px-4 md:px-6 py-12 bg-gradient-to-br from-charcoal/20 to-rich-black/40 border border-gold/20 rounded-2xl text-warm-white leading-relaxed">
      {processContent(content)}
    </article>
  );
}

// Content component for the CI/CD Pipeline blog post
function CICDPipelineContent() {
  return (
    <article className="mx-auto px-4 md:px-6 py-12 bg-gradient-to-br from-charcoal/20 to-rich-black/40 border border-gold/20 rounded-2xl text-warm-white leading-relaxed">
      
      {/* Introduction */}
      <section className="mb-12">
        <p className="text-lg text-warm-white/90 leading-relaxed mb-6">
          Continuous Integration and Continuous Deployment (CI/CD) aren't just buzzwords anymore — they're a core part of modern software engineering. Whether you're deploying to AWS, Azure, or Kubernetes, the ability to build, test, and deploy automatically is what separates fast-moving teams from the rest.
        </p>
        <p className="text-warm-white/80 leading-relaxed mb-6">
          In 2025, GitHub Actions remains one of the easiest yet most powerful CI/CD tools. It's integrated directly into GitHub, supports every major cloud, and can automate nearly anything — from linting code to rolling out production updates.
        </p>
        <p className="text-warm-white/80 leading-relaxed">
          In this guide, we'll go from zero to a working pipeline — and then fine-tune it like a pro.
        </p>
      </section>

      {/* Section 1 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">1. Understanding CI/CD the GitHub Way</h2>
        
        {/* Section Image */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
          <img
            src="/images/blog/how-to-build-cicd-pipeline-github-actions-2025/github-workflow-editor.jpg"
            alt="Developer editing a YAML workflow file inside GitHub"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <p className="text-warm-white/80 leading-relaxed mb-6">
          GitHub Actions follows a simple but powerful model:
        </p>
        <blockquote className="bg-gold/10 border-l-4 border-gold p-6 rounded-r-lg mb-6">
          <p className="text-lg font-semibold text-gold">"Every event in your repository can trigger an automated workflow."</p>
        </blockquote>
        <p className="text-warm-white/80 leading-relaxed mb-6">
          Think of a workflow as a pipeline defined in YAML. It's stored inside your repository (usually in <code className="bg-charcoal px-2 py-1 rounded text-gold">.github/workflows/ci.yml</code>), and it runs automatically when you push code, open a PR, or create a release.
        </p>
        
        <div className="bg-charcoal/60 rounded-lg p-6 mb-6 border border-gold/20">
          <h3 className="text-lg font-semibold text-gold mb-4">Basic Workflow Example</h3>
          <pre className="text-warm-white/80 overflow-x-auto text-sm">
{`name: CI Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test`}
          </pre>
        </div>
        
        <p className="text-warm-white/80 leading-relaxed">
          This simple file tells GitHub to automatically test your code every time someone pushes changes. And the best part? You don't need any external servers — GitHub handles all runners for you.
        </p>
      </section>

      {/* Section 2 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">2. Adding Continuous Deployment (CD)</h2>
        
        {/* Section Image */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
          <img
            src="/images/blog/how-to-build-cicd-pipeline-github-actions-2025/aws-cloud-deployment.jpg"
            alt="GitHub Actions deploying to AWS cloud infrastructure"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <p className="text-warm-white/80 leading-relaxed mb-6">
          Once your CI pipeline runs smoothly, it's time to deploy automatically. GitHub Actions integrates seamlessly with cloud platforms like AWS, Azure, GCP, and Docker Hub.
        </p>
        
        <div className="bg-charcoal/60 rounded-lg p-6 mb-6 border border-gold/20">
          <h3 className="text-lg font-semibold text-gold mb-4">AWS S3 Deployment Example</h3>
          <pre className="text-warm-white/80 overflow-x-auto text-sm">
{`deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to S3
      uses: aws-actions/s3-sync@v2
      with:
        bucket: ${'${{ secrets.AWS_S3_BUCKET }}'}
        region: ap-northeast-1
        source: ./dist
        dest: /
      env:
        AWS_ACCESS_KEY_ID: ${'${{ secrets.AWS_ACCESS_KEY_ID }}'}
        AWS_SECRET_ACCESS_KEY: ${'${{ secrets.AWS_SECRET_ACCESS_KEY }}'}`}
          </pre>
        </div>

        <div className="bg-gold/10 rounded-lg p-6 mb-6 border border-gold/30">
          <h3 className="text-lg font-semibold text-gold mb-3">🔒 Why Secrets Matter</h3>
          <p className="text-warm-white/80 leading-relaxed">
            You'll notice the use of <code className="bg-charcoal px-2 py-1 rounded text-gold">{'${{ secrets.AWS_ACCESS_KEY_ID }}'}</code> — that's GitHub's built-in Secrets Manager. Always store API keys, tokens, and passwords in Settings → Secrets and Variables. This keeps credentials encrypted, preventing leaks or accidental exposure in logs.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">3. Using Matrix Builds for Speed</h2>
        
        {/* Section Image */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
          <img
            src="/images/blog/how-to-build-cicd-pipeline-github-actions-2025/matrix-builds-parallel.jpg"
            alt="Matrix CI builds running in parallel across multiple operating systems"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <p className="text-warm-white/80 leading-relaxed mb-6">
          In larger projects, testing one environment isn't enough. You might need to verify code across multiple Node.js versions, OSes, or frameworks. That's where matrix builds come in:
        </p>
        
        <div className="bg-charcoal/60 rounded-lg p-6 mb-6 border border-gold/20">
          <pre className="text-warm-white/80 overflow-x-auto text-sm">
{`strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]

runs-on: ${'${{ matrix.os }}'}

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: ${'${{ matrix.node }}'}
  - run: npm ci && npm test`}
          </pre>
        </div>
        
        <p className="text-warm-white/80 leading-relaxed mb-4">
          Now your tests run in parallel, cutting total build time dramatically.
        </p>
        
        <div className="bg-amber/10 rounded-lg p-4 border border-amber/30">
          <p className="text-amber"><strong>💡 Pro tip:</strong> Use artifact caching (<code className="bg-charcoal px-2 py-1 rounded">actions/cache@v4</code>) to store dependencies between runs — saves both time and bandwidth.</p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">4. Automating Code Reviews and Quality Checks</h2>
        
        {/* Section Image */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
          <img
            src="/images/blog/how-to-build-cicd-pipeline-github-actions-2025/code-quality-checks.jpg"
            alt="GitHub PR checks dashboard showing linting, security scans, and tests"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <p className="text-warm-white/80 leading-relaxed mb-6">
          CI/CD doesn't stop at testing and deployment. In 2025, many teams automate:
        </p>
        <ul className="list-disc list-inside text-warm-white/80 mb-6 space-y-2">
          <li><strong className="text-gold">Linting</strong> (ESLint, Flake8, etc.)</li>
          <li><strong className="text-gold">Security scanning</strong> (Dependabot, Trivy)</li>
          <li><strong className="text-gold">Unit test coverage reports</strong></li>
        </ul>
        
        <div className="bg-charcoal/60 rounded-lg p-6 mb-6 border border-gold/20">
          <pre className="text-warm-white/80 overflow-x-auto text-sm">
{`- name: Run lint checks
  run: npm run lint

- name: Security scan
  uses: aquasecurity/trivy-action@v1`}
          </pre>
        </div>
        
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <p className="text-blue-300"><strong>💬 Real-world tip:</strong> Combine these checks with GitHub's branch protection rules — reject PRs unless all workflows pass.</p>
        </div>
      </section>

      {/* Section 5 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">5. Scaling Your Workflows with Self-Hosted Runners</h2>
        
        {/* Section Image */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
          <img
            src="/images/blog/how-to-build-cicd-pipeline-github-actions-2025/self-hosted-runners-infrastructure.jpg"
            alt="Server room with self-hosted GitHub runners executing builds in containers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <p className="text-warm-white/80 leading-relaxed mb-6">
          When your pipelines grow (especially for enterprise DevOps), GitHub's hosted runners may not cut it. That's where self-hosted runners come in — your own servers executing workflows for faster performance and lower cost.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <h4 className="text-green-300 font-semibold mb-2">More Control</h4>
            <p className="text-warm-white/80 text-sm">Over CPU/memory resources</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
            <h4 className="text-blue-300 font-semibold mb-2">Custom Software</h4>
            <p className="text-warm-white/80 text-sm">Install specialized tools</p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-purple-300 font-semibold mb-2">No Limits</h4>
            <p className="text-warm-white/80 text-sm">GitHub concurrency restrictions</p>
          </div>
        </div>
        
        <div className="bg-amber/10 rounded-lg p-4 border border-amber/30">
          <p className="text-amber"><strong>💡 Pro tip:</strong> Use Dockerized runners so you can reset the environment automatically after each run — cleaner, safer, faster.</p>
        </div>
      </section>

      {/* Section 6 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">6. Building for Multi-Stage Environments</h2>
        
        {/* Section Image */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
          <img
            src="/images/blog/how-to-build-cicd-pipeline-github-actions-2025/multi-stage-environments.jpg"
            alt="Multi-stage CI/CD pipeline flow from development to staging to production"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <p className="text-warm-white/80 leading-relaxed mb-6">
          For production-grade CI/CD, you'll want multiple environments: <strong className="text-gold">Dev → Staging → Production</strong>.
        </p>
        <p className="text-warm-white/80 leading-relaxed mb-6">
          You can model that easily using GitHub Actions Environments:
        </p>
        
        <div className="bg-charcoal/60 rounded-lg p-6 mb-6 border border-gold/20">
          <pre className="text-warm-white/80 overflow-x-auto text-sm">
{`deploy:
  environment: production
  runs-on: ubuntu-latest
  steps:
    - name: Deploy via Docker Compose
      run: docker compose up -d`}
          </pre>
        </div>
        
        <p className="text-warm-white/80 leading-relaxed">
          Each environment can have its own secrets, reviewers, and approval gates. This ensures that a staging deployment requires human confirmation before promoting to production — keeping releases controlled yet automated.
        </p>
      </section>

      {/* Section 7 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">7. Monitoring and Alerts (Ops Integration)</h2>
        
        {/* Section Image */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gold/20 shadow-lg mb-8">
          <img
            src="/images/blog/how-to-build-cicd-pipeline-github-actions-2025/monitoring-alerts-dashboard.jpg"
            alt="Real-time monitoring dashboard showing CI/CD success metrics and alerts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <p className="text-warm-white/80 leading-relaxed mb-6">
          A great pipeline doesn't stop at deployment — it monitors what happens after release. In 2025, integrating monitoring directly into CI/CD is common practice.
        </p>
        
        <ul className="list-disc list-inside text-warm-white/80 mb-6 space-y-2">
          <li><strong className="text-gold">Build failures</strong> (Slack, Teams)</li>
          <li><strong className="text-gold">Deployment status</strong></li>
          <li><strong className="text-gold">Rollback triggers</strong></li>
        </ul>
        
        <div className="bg-charcoal/60 rounded-lg p-6 mb-6 border border-gold/20">
          <pre className="text-warm-white/80 overflow-x-auto text-sm">
{`- name: Notify Slack
  uses: slackapi/slack-github-action@v2
  with:
    payload: '{"text": "✅ Deployment completed successfully!"}'`}
          </pre>
        </div>
        
        <p className="text-warm-white/80 leading-relaxed">
          Combine this with Datadog or Grafana webhooks for a complete DevOps feedback loop.
        </p>
      </section>

      {/* Section 8 */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">8. Common Mistakes to Avoid</h2>
        <p className="text-warm-white/80 leading-relaxed mb-6">
          Even in 2025, these mistakes still trip up teams:
        </p>
        
        <div className="grid gap-4 mb-6">
          {[
            "Hardcoding secrets in YAML",
            "Not caching dependencies", 
            "Running everything on a single runner",
            "Skipping environment approvals",
            "Forgetting rollback logic"
          ].map((mistake, index) => (
            <div key={index} className="bg-red-500/10 rounded-lg p-4 border border-red-500/30 flex items-center">
              <span className="text-red-400 mr-3">❌</span>
              <span className="text-warm-white/80">{mistake}</span>
            </div>
          ))}
        </div>
        
        <p className="text-warm-white/80 leading-relaxed">
          The best engineers plan for failure, rollback, and observability — not just deployment speed.
        </p>
      </section>

      {/* Conclusion */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">Conclusion: Ship Confidently with Automation</h2>
        <p className="text-warm-white/80 leading-relaxed mb-6">
          CI/CD with GitHub Actions doesn't just save time — it builds trust. You can focus on writing features while your pipelines handle everything else: tests, deployments, and rollbacks.
        </p>
        <p className="text-warm-white/80 leading-relaxed mb-6">
          If you start small, even a two-step workflow can make your projects feel smoother and more professional. And as your needs grow, Actions can scale with you — all the way to enterprise automation.
        </p>
      </section>

      {/* FAQs */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gold mb-6">FAQs</h2>
        <div className="space-y-6">
          {[
            {
              q: "Is GitHub Actions free?",
              a: "It's free for public repos and comes with generous limits for private ones. Enterprises can use self-hosted runners for cost control."
            },
            {
              q: "Can GitHub Actions deploy to multiple clouds?",
              a: "Yes — AWS, GCP, Azure, and even Kubernetes clusters using official actions."
            },
            {
              q: "How can I speed up build times?",
              a: "Use actions/cache@v4, run matrix builds, or switch to self-hosted runners."
            },
            {
              q: "Is GitHub Actions secure?",
              a: "Yes, as long as you use encrypted secrets and follow least-privilege IAM rules."
            },
            {
              q: "What's the future of CI/CD?",
              a: "Expect AI-assisted pipelines that auto-heal, auto-tune, and predict failures before they happen."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-charcoal/40 rounded-lg p-6 border border-gold/20">
              <h3 className="text-lg font-semibold text-gold mb-3">Q{index + 1}. {faq.q}</h3>
              <p className="text-warm-white/80 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Author */}
      <section className="bg-gradient-to-br from-gold/5 to-amber/5 rounded-xl p-6 mt-10 border border-gold/30">
        <h2 className="text-xl font-semibold mb-4 text-gold">About the Author</h2>
        <p className="text-warm-white/90 leading-relaxed">
          <strong className="text-gold">Rabin Adhikari</strong> — DevOps engineer and founder of <strong className="text-gold">DevOps Enginer</strong>, passionate about automation, AI tools, and cloud-native engineering.
        </p>
        <p className="text-warm-white/80 leading-relaxed mt-2">
          Rabin writes practical tutorials that make DevOps concepts easy to understand and apply.
        </p>
      </section>
    </article>
  );
}